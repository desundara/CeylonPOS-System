from decimal import Decimal
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Customer, LoyaltyTransaction
from .serializers import CustomerSerializer, LoyaltyTransactionSerializer
from sales.models import Sale
from sales.serializers import SaleSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    MIN_REDEEM_POINTS = 100

    def _parse_points(self, request):
        raw_points = request.data.get('points', 0)
        try:
            points = int(raw_points)
        except (TypeError, ValueError):
            return None
        return points

    @action(detail=True, methods=['get'])
    def purchase_history(self, request, pk=None):
        customer = self.get_object()
        sales = Sale.objects.filter(customer=customer).order_by('-date_time')
        serializer = SaleSerializer(sales, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_points(self, request, pk=None):
        customer = self.get_object()
        points = self._parse_points(request)
        if points is None:
            return Response({'error': 'Points must be a whole number'}, status=status.HTTP_400_BAD_REQUEST)
        if points <= 0:
            return Response({'error': 'Points must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)

        customer.loyalty_points += points
        customer.save(update_fields=['loyalty_points'])

        tx = LoyaltyTransaction.objects.create(
            customer=customer,
            points=points,
            transaction_type='EARN',
            invoice_number=request.data.get('note') or None,
        )
        return Response({
            'customer': CustomerSerializer(customer).data,
            'transaction': LoyaltyTransactionSerializer(tx).data,
        })

    @action(detail=True, methods=['post'])
    def redeem_points(self, request, pk=None):
        customer = self.get_object()
        points = self._parse_points(request)
        if points is None:
            return Response({'error': 'Points must be a whole number'}, status=status.HTTP_400_BAD_REQUEST)
        if points <= 0:
            return Response({'error': 'Points must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)
        if points < self.MIN_REDEEM_POINTS:
            return Response({'error': f'Minimum redeem is {self.MIN_REDEEM_POINTS} points'}, status=status.HTTP_400_BAD_REQUEST)
        if customer.loyalty_points < points:
            return Response({'error': 'Insufficient loyalty points'}, status=status.HTTP_400_BAD_REQUEST)

        customer.loyalty_points -= points
        customer.save(update_fields=['loyalty_points'])

        tx = LoyaltyTransaction.objects.create(
            customer=customer,
            points=points,
            transaction_type='REDEEM',
            invoice_number=request.data.get('note') or None,
        )
        return Response({
            'customer': CustomerSerializer(customer).data,
            'transaction': LoyaltyTransactionSerializer(tx).data,
            'discount_value': str(Decimal(points) * Decimal('0.5')),
        })

class LoyaltyTransactionViewSet(viewsets.ModelViewSet):
    queryset = LoyaltyTransaction.objects.all()
    serializer_class = LoyaltyTransactionSerializer
