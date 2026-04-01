from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Cashier
from .serializers import CashierSerializer, LoginSerializer

class CashierViewSet(viewsets.ModelViewSet):
    queryset = Cashier.objects.filter(is_active=True)
    serializer_class = CashierSerializer

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            cashier_id = serializer.validated_data['id']
            pin = serializer.validated_data['pin']
            try:
                cashier = Cashier.objects.get(id=cashier_id, is_active=True)
                if cashier.pin == pin or (not cashier.pin and pin == "0000"):
                    return Response({
                        'message': 'Login successful',
                        'user': CashierSerializer(cashier).data
                    })
                return Response({'error': 'Invalid PIN'}, status=status.HTTP_401_UNAUTHORIZED)
            except Cashier.DoesNotExist:
                return Response({'error': 'Cashier not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
