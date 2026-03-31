from django.contrib import admin
from .models import AppSettings


@admin.register(AppSettings)
class AppSettingsAdmin(admin.ModelAdmin):
    list_display = ('store_name', 'store_phone', 'currency', 'tax_rate', 'updated_at')

