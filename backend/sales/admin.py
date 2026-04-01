from django.contrib import admin
from sales.models import Sale, SaleItem

class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 1

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'customer', 'total_amount', 'payment_method', 'cashier_name', 'date_time', 'status')
    list_filter = ('payment_method', 'status', 'date_time', 'cashier_name')
    search_fields = ('invoice_number', 'customer__name', 'cashier_name')
    inlines = [SaleItemInline]

@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = ('sale', 'product', 'quantity', 'price_at_sale')
    list_filter = ('product',)
