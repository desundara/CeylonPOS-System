from django.db import models
from django.core.validators import RegexValidator

class Cashier(models.Model):
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('CASHIER', 'Cashier'),
        ('MANAGER', 'Store Manager')
    ]
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='CASHIER')
    phone = models.CharField(max_length=15, blank=True, null=True)
    pin = models.CharField(
        max_length=4, 
        validators=[RegexValidator(r'^\d{4}$', 'PIN must be 4 digits.')]
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.role})"
