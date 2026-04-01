from django.db import migrations


def backfill_cashier_names(apps, schema_editor):
    Sale = apps.get_model('sales', 'Sale')

    for sale in Sale.objects.all():
        updated = False
        if not sale.cashier_name and sale.cashier_profile_id:
            sale.cashier_name = sale.cashier_profile.name
            updated = True
        elif not sale.cashier_name and sale.cashier_id:
            sale.cashier_name = sale.cashier.username
            updated = True

        if updated:
            sale.save(update_fields=['cashier_name'])


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0005_sale_cashier_profile'),
    ]

    operations = [
        migrations.RunPython(backfill_cashier_names, migrations.RunPython.noop),
    ]
