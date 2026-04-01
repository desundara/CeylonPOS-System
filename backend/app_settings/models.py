from django.db import models


class AppSettings(models.Model):
    store_name = models.CharField(max_length=255, default='CeylonPOS Demo Shop')
    store_address = models.TextField(blank=True, default='No 12, Galle Road, Colombo 03')
    store_phone = models.CharField(max_length=50, blank=True, default='0112345678')
    store_email = models.EmailField(blank=True, default='info@ceylonpos.lk')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=8.00)
    currency = models.CharField(max_length=10, default='LKR')

    notify_low_stock = models.BooleanField(default=True)
    notify_daily_report = models.BooleanField(default=True)
    notify_sms = models.BooleanField(default=False)
    notify_email = models.BooleanField(default=True)
    notify_sound = models.BooleanField(default=True)

    two_factor_enabled = models.BooleanField(default=False)

    receipt_header = models.CharField(max_length=255, default='CeylonPOS Demo Shop')
    receipt_footer = models.CharField(max_length=255, default='Thank you for shopping with us!')
    printer_name = models.CharField(max_length=255, blank=True, default='Default Printer')
    print_logo_on_receipt = models.BooleanField(default=True)
    auto_print_after_sale = models.BooleanField(default=True)
    print_barcode_on_receipt = models.BooleanField(default=True)

    date_format = models.CharField(max_length=20, default='DD/MM/YYYY')
    time_format = models.CharField(max_length=20, default='12-hour (AM/PM)')
    language = models.CharField(max_length=50, default='English')

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return 'Application Settings'
