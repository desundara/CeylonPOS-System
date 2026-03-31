from django.contrib import admin
from suppliers.models import Supplier

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_person', 'phone', 'category', 'balance', 'status')
    list_filter = ('category', 'status')
    search_fields = ('name', 'contact_person', 'phone')
