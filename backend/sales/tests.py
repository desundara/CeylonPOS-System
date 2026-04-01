from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from app_settings.models import AppSettings
from cashiers.models import Cashier
from customers.models import Customer
from products.models import Category, Product
from sales.models import Sale


class SaleLoyaltyFlowTests(APITestCase):
    def setUp(self):
        AppSettings.objects.create(pk=1, tax_rate=Decimal('8.00'))
        self.cashier = Cashier.objects.create(name='Main Cashier', pin='1234', is_active=True)
        self.customer = Customer.objects.create(
            name='Loyal Customer',
            phone='0771111111',
            loyalty_points=500,
            total_spent=Decimal('0.00'),
        )
        self.category = Category.objects.create(name='Beverages')
        self.product = Product.objects.create(
            name='Tea Pack',
            sku='TEA-001',
            category=self.category,
            price=Decimal('1000.00'),
            stock=10,
        )

    def test_create_sale_requires_customer_for_loyalty_redemption(self):
        response = self.client.post(
            '/api/sales/create_sale/',
            {
                'items': [{'id': self.product.id, 'qty': 1}],
                'cashier_id': self.cashier.id,
                'redeem_points': 100,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'A customer is required to redeem loyalty points')

    def test_create_sale_updates_loyalty_points_and_total_spent(self):
        response = self.client.post(
            '/api/sales/create_sale/',
            {
                'items': [{'id': self.product.id, 'qty': 1}],
                'customer_id': self.customer.id,
                'cashier_id': self.cashier.id,
                'redeem_points': 100,
                'discount_amount': '0',
                'payment_method': 'Cash',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Sale.objects.count(), 1)

        self.customer.refresh_from_db()
        self.product.refresh_from_db()
        sale = Sale.objects.get()

        self.assertEqual(self.product.stock, 9)
        self.assertEqual(sale.total_amount, Decimal('1030.00'))
        self.assertEqual(self.customer.loyalty_points, 410)
        self.assertEqual(self.customer.total_spent, Decimal('1030.00'))
