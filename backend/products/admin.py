from django.contrib import admin
from products.models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'category', 'price', 'stock', 'supplier_name')
    list_filter = ('category', 'supplier_name')
    search_fields = ('name', 'sku', 'barcode')
