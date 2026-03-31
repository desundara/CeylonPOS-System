from rest_framework import status
from rest_framework.test import APITestCase

from customers.models import Customer


class CustomerLoyaltyApiTests(APITestCase):
    def setUp(self):
        self.customer = Customer.objects.create(
            name='Test Customer',
            phone='0770000000',
            loyalty_points=250,
        )

    def test_add_points_rejects_non_numeric_values(self):
        response = self.client.post(
            f'/api/customers/{self.customer.id}/add_points/',
            {'points': 'abc'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Points must be a whole number')

    def test_redeem_points_rejects_below_minimum(self):
        response = self.client.post(
            f'/api/customers/{self.customer.id}/redeem_points/',
            {'points': 50},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Minimum redeem is 100 points')
