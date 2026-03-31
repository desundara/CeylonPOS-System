from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True, null=True)
    loyalty_points = models.IntegerField(default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    join_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name

class LoyaltyTransaction(models.Model):
    TX_TYPES = [
        ('EARN', 'Earned'),
        ('REDEEM', 'Redeemed'),
    ]
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='loyalty_tx')
    points = models.IntegerField()
    transaction_type = models.CharField(max_length=10, choices=TX_TYPES)
    date = models.DateTimeField(auto_now_add=True)
    invoice_number = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.customer.name} - {self.transaction_type} {self.points} pts"
