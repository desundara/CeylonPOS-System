from django.db import models
from products.models import Product
from customers.models import Customer
from cashiers.models import Cashier
from django.contrib.auth import get_user_model

User = get_user_model()

class Sale(models.Model):
    PAYMENT_CHOICES = [
        ('Cash', 'Cash'),
        ('Card', 'Card'),
        ('Digital', 'Digital'),
    ]
    invoice_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='Cash')
    date_time = models.DateTimeField(auto_now_add=True)
    cashier = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    cashier_profile = models.ForeignKey(Cashier, on_delete=models.SET_NULL, null=True, blank=True, related_name='sales')
    cashier_name = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, default='Completed')

    def __str__(self):
        return self.invoice_number

    def save(self, *args, **kwargs):
        if self.cashier_profile and not self.cashier_name:
            self.cashier_name = self.cashier_profile.name
        elif self.cashier and not self.cashier_name:
            self.cashier_name = self.cashier.username
        super().save(*args, **kwargs)

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField()
    price_at_sale = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

class DailyMetric(models.Model):
    day = models.CharField(max_length=10)
    revenue = models.DecimalField(max_digits=12, decimal_places=2)
    profit = models.DecimalField(max_digits=12, decimal_places=2)

class MonthlyMetric(models.Model):
    month = models.CharField(max_length=10)
    revenue = models.DecimalField(max_digits=12, decimal_places=2)

class TopProductMetric(models.Model):
    name = models.CharField(max_length=255)
    sold = models.IntegerField()
    revenue = models.DecimalField(max_digits=12, decimal_places=2)
