from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_settings', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='appsettings',
            name='notify_sound',
            field=models.BooleanField(default=True),
        ),
    ]
