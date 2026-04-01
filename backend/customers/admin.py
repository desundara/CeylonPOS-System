from django.contrib import admin
from customers.models import Customer, LoyaltyTransaction

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'loyalty_points', 'total_spent', 'join_date')
    search_fields = ('name', 'phone', 'email')

@admin.register(LoyaltyTransaction)
class LoyaltyTransactionAdmin(admin.ModelAdmin):
    list_display = ('customer', 'points', 'transaction_type', 'date', 'invoice_number')
    list_filter = ('transaction_type', 'date')
    search_fields = ('customer__name', 'invoice_number')
