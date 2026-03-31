from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='AppSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('store_name', models.CharField(default='CeylonPOS Demo Shop', max_length=255)),
                ('store_address', models.TextField(blank=True, default='No 12, Galle Road, Colombo 03')),
                ('store_phone', models.CharField(blank=True, default='0112345678', max_length=50)),
                ('store_email', models.EmailField(blank=True, default='info@ceylonpos.lk', max_length=254)),
                ('tax_rate', models.DecimalField(decimal_places=2, default=8.0, max_digits=5)),
                ('currency', models.CharField(default='LKR', max_length=10)),
                ('notify_low_stock', models.BooleanField(default=True)),
                ('notify_daily_report', models.BooleanField(default=True)),
                ('notify_sms', models.BooleanField(default=False)),
                ('notify_email', models.BooleanField(default=True)),
                ('two_factor_enabled', models.BooleanField(default=False)),
                ('receipt_header', models.CharField(default='CeylonPOS Demo Shop', max_length=255)),
                ('receipt_footer', models.CharField(default='Thank you for shopping with us!', max_length=255)),
                ('printer_name', models.CharField(blank=True, default='Default Printer', max_length=255)),
                ('print_logo_on_receipt', models.BooleanField(default=True)),
                ('auto_print_after_sale', models.BooleanField(default=True)),
                ('print_barcode_on_receipt', models.BooleanField(default=True)),
                ('date_format', models.CharField(default='DD/MM/YYYY', max_length=20)),
                ('time_format', models.CharField(default='12-hour (AM/PM)', max_length=20)),
                ('language', models.CharField(default='English', max_length=50)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
