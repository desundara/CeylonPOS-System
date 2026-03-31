from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0003_dailymetric_monthlymetric_topproductmetric'),
    ]

    operations = [
        migrations.AddField(
            model_name='sale',
            name='cashier_name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
