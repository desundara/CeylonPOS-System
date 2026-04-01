from django.contrib import admin
from .models import Cashier

@admin.register(Cashier)
class CashierAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'phone', 'is_active', 'pin')
    search_fields = ('name', 'phone')
    list_filter = ('role', 'is_active')
