from rest_framework import serializers
from .models import Sale, SaleItem, DailyMetric, MonthlyMetric, TopProductMetric

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price_at_sale']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    customer_name = serializers.ReadOnlyField(source='customer.name')
    cashier_name = serializers.SerializerMethodField()
    cashier_id = serializers.ReadOnlyField(source='cashier_profile.id')


    class Meta:
        model = Sale
        fields = '__all__'

    def get_cashier_name(self, obj):
        if obj.cashier_name:
            return obj.cashier_name
        if obj.cashier:
            return obj.cashier.username
        return 'Admin'

class DailyMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyMetric
        fields = '__all__'

class MonthlyMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyMetric
        fields = '__all__'

class TopProductMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopProductMetric
        fields = '__all__'

class PaymentSummarySerializer(serializers.Serializer):
    name = serializers.CharField()
    value = serializers.IntegerField()


class DailyMetricDataSerializer(serializers.Serializer):
    day = serializers.CharField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    profit = serializers.DecimalField(max_digits=12, decimal_places=2)


class MonthlyMetricDataSerializer(serializers.Serializer):
    month = serializers.CharField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)


class TopProductDataSerializer(serializers.Serializer):
    name = serializers.CharField()
    sold = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
