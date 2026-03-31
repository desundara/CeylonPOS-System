from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Count, Sum, F, DecimalField, ExpressionWrapper
from django.utils import timezone
from django.utils.dateparse import parse_date
from decimal import Decimal
from datetime import timedelta
from .models import Sale, SaleItem, DailyMetric, MonthlyMetric, TopProductMetric
from .serializers import SaleSerializer, DailyMetricSerializer, MonthlyMetricSerializer, TopProductMetricSerializer, PaymentSummarySerializer, DailyMetricDataSerializer, MonthlyMetricDataSerializer, TopProductDataSerializer
from products.models import Product
from customers.models import Customer, LoyaltyTransaction
from cashiers.models import Cashier
from app_settings.models import AppSettings

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().order_by('-date_time')
    serializer_class = SaleSerializer
    MIN_REDEEM_POINTS = 100

    def _parse_non_negative_int(self, value, field_name):
        try:
            parsed = int(value or 0)
        except (TypeError, ValueError):
            raise ValueError(f"{field_name} must be a whole number")
        if parsed < 0:
            raise ValueError(f"{field_name} cannot be negative")
        return parsed

    @action(detail=False, methods=['post'])
    def create_sale(self, request):
        data = request.data
        items_data = data.get('items', [])
        customer_id = data.get('customer_id')
        redeem_points = self._parse_non_negative_int(data.get('redeem_points', 0), 'Redeem points')
        cashier_id = data.get('cashier_id')

        if not items_data:
            return Response({"error": "No items provided"}, status=status.HTTP_400_BAD_REQUEST)
        if not cashier_id:
            return Response({"error": "Cashier login is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # 1. Calculate Totals
                subtotal = Decimal('0.00')
                app_settings, _ = AppSettings.objects.get_or_create(pk=1)
                tax_rate = Decimal(app_settings.tax_rate) / Decimal('100')
                cashier_profile = Cashier.objects.get(id=cashier_id, is_active=True)
                
                # 2. Handle Customer & Loyalty
                customer = None
                if customer_id:
                    customer = Customer.objects.get(id=customer_id)
                    if redeem_points > 0:
                        if redeem_points < self.MIN_REDEEM_POINTS:
                            return Response({"error": f"Minimum redeem is {self.MIN_REDEEM_POINTS} points"}, status=status.HTTP_400_BAD_REQUEST)
                        if customer.loyalty_points < redeem_points:
                            return Response({"error": "Insufficient loyalty points"}, status=status.HTTP_400_BAD_REQUEST)
                        customer.loyalty_points -= redeem_points
                        LoyaltyTransaction.objects.create(
                            customer=customer,
                            points=redeem_points,
                            transaction_type='REDEEM'
                        )
                elif redeem_points > 0:
                    return Response({"error": "A customer is required to redeem loyalty points"}, status=status.HTTP_400_BAD_REQUEST)

                discount_amount = Decimal(str(data.get('discount_amount', 0)))

                # 3. Create Sale Instance
                sale = Sale.objects.create(
                    invoice_number=f"INV-{timezone.now().strftime('%Y%m%d%H%M%S')}",
                    customer=customer,
                    total_amount=Decimal('0.00'), # Will update
                    tax_amount=Decimal('0.00'),
                    discount_amount=discount_amount,
                    payment_method=data.get('payment_method', 'Cash'),
                    cashier=request.user if request.user.is_authenticated else None,
                    cashier_profile=cashier_profile,
                    cashier_name=cashier_profile.name,
                )

                # 4. Process Items & Deduct Stock
                for item in items_data:
                    product = Product.objects.get(id=item['id'])
                    qty = int(item['qty'])
                    
                    if product.stock < qty:
                        raise ValueError(f"Insufficient stock for {product.name}")
                    
                    product.stock -= qty
                    product.save()
                    
                    subtotal += product.price * qty
                    
                    SaleItem.objects.create(
                        sale=sale,
                        product=product,
                        quantity=qty,
                        price_at_sale=product.price
                    )

                # 5. Finalize totals
                tax = subtotal * tax_rate
                total = subtotal + tax - sale.discount_amount
                
                # Deduct point discount if applicable (logic simple for demo)
                if customer and redeem_points > 0:
                    total -= (Decimal(str(redeem_points)) * Decimal('0.5'))

                total = max(total, Decimal('0.00'))

                sale.total_amount = total
                sale.tax_amount = tax
                sale.save()

                # 6. Earn points: Rs 100 = 1pt (from frontend context)
                if customer:
                    earned = int(total / Decimal('100'))
                    customer.loyalty_points += earned
                    customer.total_spent += total
                    customer.save(update_fields=['loyalty_points', 'total_spent'])
                    
                    if earned > 0:
                        LoyaltyTransaction.objects.create(
                            customer=customer,
                            points=earned,
                            transaction_type='EARN',
                            invoice_number=sale.invoice_number
                        )

                serializer = self.get_serializer(sale)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        except Customer.DoesNotExist:
            return Response({"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)
        except Cashier.DoesNotExist:
            return Response({"error": "Valid cashier login is required"}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DailyMetricViewSet(viewsets.ModelViewSet):
    queryset = DailyMetric.objects.none()
    serializer_class = DailyMetricSerializer

    def list(self, request, *args, **kwargs):
        app_settings, _ = AppSettings.objects.get_or_create(pk=1)
        profit_ratio = Decimal('0.25')
        end_date = timezone.localdate()
        start_date = end_date - timedelta(days=6)
        sales = Sale.objects.filter(date_time__date__gte=start_date, date_time__date__lte=end_date)
        sales_by_day = {
            row['date_time__date']: row['revenue']
            for row in sales.values('date_time__date').annotate(revenue=Sum('total_amount'))
        }

        payload = []
        for offset in range(7):
            current_date = start_date + timedelta(days=offset)
            revenue = sales_by_day.get(current_date, Decimal('0.00')) or Decimal('0.00')
            payload.append({
                'day': current_date.strftime('%a'),
                'revenue': revenue,
                'profit': revenue * profit_ratio,
            })

        serializer = DailyMetricDataSerializer(payload, many=True)
        return Response(serializer.data)

class MonthlyMetricViewSet(viewsets.ModelViewSet):
    queryset = MonthlyMetric.objects.none()
    serializer_class = MonthlyMetricSerializer

    def list(self, request, *args, **kwargs):
        today = timezone.localdate()
        months = []
        month_cursor = today.replace(day=1)
        for _ in range(7):
            months.append(month_cursor)
            if month_cursor.month == 1:
                month_cursor = month_cursor.replace(year=month_cursor.year - 1, month=12)
            else:
                month_cursor = month_cursor.replace(month=month_cursor.month - 1)
        months.reverse()

        payload = []
        for month_start in months:
            if month_start.month == 12:
                next_month = month_start.replace(year=month_start.year + 1, month=1)
            else:
                next_month = month_start.replace(month=month_start.month + 1)
            revenue = Sale.objects.filter(
                date_time__date__gte=month_start,
                date_time__date__lt=next_month,
            ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            payload.append({
                'month': month_start.strftime('%b'),
                'revenue': revenue,
            })

        serializer = MonthlyMetricDataSerializer(payload, many=True)
        return Response(serializer.data)

class TopProductMetricViewSet(viewsets.ModelViewSet):
    queryset = TopProductMetric.objects.none()
    serializer_class = TopProductMetricSerializer

    def list(self, request, *args, **kwargs):
        revenue_expr = ExpressionWrapper(
            F('quantity') * F('price_at_sale'),
            output_field=DecimalField(max_digits=12, decimal_places=2)
        )
        top_items = (
            SaleItem.objects
            .values(name=F('product__name'))
            .annotate(
                sold=Sum('quantity'),
                revenue=Sum(revenue_expr),
            )
            .order_by('-sold', '-revenue')[:5]
        )

        payload = [
            {
                'name': item['name'] or 'Unknown Product',
                'sold': item['sold'] or 0,
                'revenue': item['revenue'] or Decimal('0.00'),
            }
            for item in top_items
        ]

        serializer = TopProductDataSerializer(payload, many=True)
        return Response(serializer.data)

class PaymentSummaryViewSet(viewsets.ViewSet):
    def list(self, request):
        payment_counts = Sale.objects.values('payment_method').annotate(count=Count('id'))
        total = sum(item['count'] for item in payment_counts)

        if total == 0:
            payload = [
                {'name': 'Cash', 'value': 0},
                {'name': 'Card', 'value': 0},
                {'name': 'Digital', 'value': 0},
            ]
        else:
            count_map = {item['payment_method']: item['count'] for item in payment_counts}
            payload = []
            for label in ['Cash', 'Card', 'Digital']:
                percentage = round((count_map.get(label, 0) / total) * 100)
                payload.append({'name': label, 'value': percentage})

        serializer = PaymentSummarySerializer(payload, many=True)
        return Response(serializer.data)
