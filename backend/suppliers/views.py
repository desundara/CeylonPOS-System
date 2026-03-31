from decimal import Decimal
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Supplier
from .serializers import SupplierSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

    @action(detail=True, methods=['post'])
    def create_purchase_order(self, request, pk=None):
        supplier = self.get_object()
        amount = Decimal(str(request.data.get('amount', 0)))
        if amount <= 0:
            return Response({'error': 'Amount must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)

        supplier.balance += amount
        supplier.save(update_fields=['balance'])
        return Response({
            'message': f'Purchase order created for {supplier.name}',
            'supplier': SupplierSerializer(supplier).data,
        })

    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        supplier = self.get_object()
        amount = Decimal(str(request.data.get('amount', 0)))
        if amount <= 0:
            return Response({'error': 'Amount must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)

        supplier.balance = max(Decimal('0.00'), supplier.balance - amount)
        supplier.save(update_fields=['balance'])
        return Response({
            'message': f'Payment recorded for {supplier.name}',
            'supplier': SupplierSerializer(supplier).data,
        })
