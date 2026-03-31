from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('cashiers', '0001_initial'),
        ('sales', '0004_sale_cashier_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='sale',
            name='cashier_profile',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sales', to='cashiers.cashier'),
        ),
    ]
