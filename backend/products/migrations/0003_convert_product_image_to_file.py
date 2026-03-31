from django.db import migrations, models


def clear_legacy_image_strings(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    for product in Product.objects.exclude(image__isnull=True).exclude(image=''):
        if isinstance(product.image, str) and product.image.startswith('data:'):
            product.image = None
            product.save(update_fields=['image'])


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_product_image'),
    ]

    operations = [
        migrations.RunPython(clear_legacy_image_strings, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='product',
            name='image',
            field=models.FileField(blank=True, max_length=500, null=True, upload_to='products/'),
        ),
    ]
