from rest_framework import serializers
from .models import Cashier

class CashierSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Cashier
        fields = ['id', 'name', 'role', 'phone', 'pin', 'avatar', 'is_active']
        extra_kwargs = {
            'pin': {'write_only': True}
        }

    def get_avatar(self, obj):
        return obj.name[0].upper() if obj.name else 'C'

class LoginSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    pin = serializers.CharField(max_length=4)
