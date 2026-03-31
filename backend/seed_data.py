import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from products.models import Category, Product
from customers.models import Customer
from suppliers.models import Supplier
from sales.models import Sale, SaleItem, DailyMetric, MonthlyMetric, TopProductMetric, DailyMetric, MonthlyMetric, TopProductMetric
from django.utils import timezone

def seed():
    # 1. Categories
    cats_data = ['Grains', 'Cooking', 'Pantry', 'Dairy', 'Beverages', 'Bakery', 'Meat', 'Instant']
    for cname in cats_data:
        Category.objects.get_or_create(name=cname)

    # 2. Products
    products_data = [
        { 'name': 'Basmati Rice 5kg', 'sku': 'RIC001', 'category': 'Grains', 'price': 1850, 'stock': 142, 'min_stock': 20, 'unit': 'bag', 'barcode': '4901234567890', 'supplier_name': 'Lanka Agro Pvt Ltd' },
        { 'name': 'Coconut Oil 1L', 'sku': 'OIL002', 'category': 'Cooking', 'price': 580, 'stock': 8, 'min_stock': 15, 'unit': 'bottle', 'barcode': '4901234567891', 'supplier_name': 'Pure Ceylon Foods' },
        { 'name': 'Dhal (Red Lentils) 1kg', 'sku': 'DAL003', 'category': 'Grains', 'price': 320, 'stock': 95, 'min_stock': 25, 'unit': 'pack', 'barcode': '4901234567892', 'supplier_name': 'Lanka Agro Pvt Ltd' },
        { 'name': 'Sugar 1kg', 'sku': 'SUG004', 'category': 'Pantry', 'price': 180, 'stock': 3, 'min_stock': 30, 'unit': 'pack', 'barcode': '4901234567893', 'supplier_name': 'Pelwatte Sugar' },
        { 'name': 'Milk Powder 400g', 'sku': 'MLK005', 'category': 'Dairy', 'price': 650, 'stock': 67, 'min_stock': 10, 'unit': 'tin', 'barcode': '4901234567894', 'supplier_name': 'Anchor Lanka' },
        { 'name': 'Milo 500g', 'sku': 'MIL006', 'category': 'Beverages', 'price': 870, 'stock': 43, 'min_stock': 15, 'unit': 'tin', 'barcode': '4901234567895', 'supplier_name': 'Nestle Lanka' },
        { 'name': 'Bread (White)', 'sku': 'BRD007', 'category': 'Bakery', 'price': 95, 'stock': 30, 'min_stock': 10, 'unit': 'loaf', 'barcode': '4901234567896', 'supplier_name': 'Maliban Biscuits' },
        { 'name': 'Eggs (10 pack)', 'sku': 'EGG008', 'category': 'Dairy', 'price': 420, 'stock': 22, 'min_stock': 8, 'unit': 'pack', 'barcode': '4901234567897', 'supplier_name': 'Sathosa Lanka' },
        { 'name': 'Keells Sausages', 'sku': 'SAU009', 'category': 'Meat', 'price': 560, 'stock': 18, 'min_stock': 5, 'unit': 'pack', 'barcode': '4901234567898', 'supplier_name': 'Keells Food Products' },
        { 'name': 'Astra Margarine 250g', 'sku': 'MAR010', 'category': 'Dairy', 'price': 240, 'stock': 51, 'min_stock': 10, 'unit': 'tub', 'barcode': '4901234567899', 'supplier_name': 'Unilever Lanka' },
        { 'name': 'Noodles Kottu 100g', 'sku': 'NOO011', 'category': 'Instant', 'price': 65, 'stock': 200, 'min_stock': 40, 'unit': 'pack', 'barcode': '4901234567900', 'supplier_name': 'Prima Ceylon' },
        { 'name': 'Ceylon Tea 200g', 'sku': 'TEA012', 'category': 'Beverages', 'price': 380, 'stock': 88, 'min_stock': 20, 'unit': 'pack', 'barcode': '4901234567901', 'supplier_name': 'Dilmah Tea' },
    ]
    for p in products_data:
        cat = Category.objects.get(name=p['category'])
        Product.objects.update_or_create(
            sku=p['sku'],
            defaults={
                'name': p['name'],
                'category': cat,
                'price': p['price'],
                'stock': p['stock'],
                'min_stock': p['min_stock'],
                'unit': p['unit'],
                'barcode': p['barcode'],
                'supplier_name': p['supplier_name']
            }
        )

    # 3. Customers
    custs_data = [
        { 'name': 'Kasun Perera', 'phone': '0771234567', 'email': 'kasun@gmail.com', 'loyalty_points': 450, 'total_spent': 45200 },
        { 'name': 'Nimali Silva', 'phone': '0712345678', 'email': 'nimali@gmail.com', 'loyalty_points': 1200, 'total_spent': 120000 },
        { 'name': 'Ruwan Fernando', 'phone': '0753456789', 'email': 'ruwan@gmail.com', 'loyalty_points': 220, 'total_spent': 22000 },
        { 'name': 'Dilini Jayawardena', 'phone': '0764567890', 'email': 'dilini@gmail.com', 'loyalty_points': 780, 'total_spent': 78000 },
        { 'name': 'Thilina Bandara', 'phone': '0775678901', 'email': 'thilina@gmail.com', 'loyalty_points': 340, 'total_spent': 34000 },
    ]
    for c in custs_data:
        Customer.objects.update_or_create(phone=c['phone'], defaults=c)

    # 4. Suppliers
    sups_data = [
        { 'name': 'Lanka Agro Pvt Ltd', 'contact_person': 'Sunil Rathnayake', 'phone': '0112345678', 'email': 'info@lankaagro.lk', 'category': 'Grains & Pulses', 'balance': 125000 },
        { 'name': 'Pure Ceylon Foods', 'contact_person': 'Manel Perera', 'phone': '0113456789', 'email': 'orders@pureceylon.lk', 'category': 'Cooking Oil', 'balance': 48000 },
        { 'name': 'Anchor Lanka', 'contact_person': 'David Costa', 'phone': '0114567890', 'email': 'trade@anchor.lk', 'category': 'Dairy Products', 'balance': 0 },
        { 'name': 'Nestle Lanka', 'contact_person': 'Priya Seneviratne', 'phone': '0115678901', 'email': 'nestle@lk.nestle.com', 'category': 'FMCG', 'balance': 87500 },
        { 'name': 'Keells Food Products', 'contact_person': 'Rajan Mendis', 'phone': '0116789012', 'email': 'trade@keells.lk', 'category': 'Meat & Poultry', 'balance': 32000 },
    ]
    for s in sups_data:
        Supplier.objects.update_or_create(name=s['name'], defaults=s)

    # 5. Sales
    sales_data = [
        { 'id': 'INV-2025-0891', 'customer_name': 'Kasun Perera', 'items': [{'sku':'RIC001','qty':1}, {'sku':'DAL003','qty':3}], 'total': 2810, 'payment': 'Cash' },
        { 'id': 'INV-2025-0892', 'customer_name': None, 'items': [{'sku':'SUG004','qty':2}], 'total': 360, 'payment': 'Card' },
        { 'id': 'INV-2025-0893', 'customer_name': 'Nimali Silva', 'items': [{'sku':'MLK005','qty':4}, {'sku':'MIL006','qty':2}], 'total': 4340, 'payment': 'Cash' },
        { 'id': 'INV-2025-0894', 'customer_name': None, 'items': [{'sku':'TEA012','qty':1}], 'total': 380, 'payment': 'Digital' },
        { 'id': 'INV-2025-0895', 'customer_name': 'Ruwan Fernando', 'items': [{'sku':'MAR010','qty':2}, {'sku':'NOO011','qty':10}], 'total': 1130, 'payment': 'Cash' },
    ]
    for s in sales_data:
        cust = Customer.objects.filter(name=s['customer_name']).first() if s['customer_name'] else None
        sale, created = Sale.objects.get_or_create(
            invoice_number=s['id'],
            defaults={
                'customer': cust,
                'total_amount': s['total'],
                'payment_method': s['payment'],
                'status': 'Completed'
            }
        )
        if created:
            for item in s['items']:
                p = Product.objects.get(sku=item['sku'])
                SaleItem.objects.create(
                    sale=sale,
                    product=p,
                    quantity=item['qty'],
                    price_at_sale=p.price
                )

    # 6. Daily Metrics
    sales_data_mock = [
        { 'day': 'Mon', 'revenue': 42500, 'profit': 12800 },
        { 'day': 'Tue', 'revenue': 38200, 'profit': 10900 },
        { 'day': 'Wed', 'revenue': 55600, 'profit': 16800 },
        { 'day': 'Thu', 'revenue': 47300, 'profit': 13400 },
        { 'day': 'Fri', 'revenue': 61200, 'profit': 18600 },
        { 'day': 'Sat', 'revenue': 78900, 'profit': 24200 },
        { 'day': 'Sun', 'revenue': 52400, 'profit': 15700 },
    ]
    for d in sales_data_mock:
        DailyMetric.objects.update_or_create(day=d['day'], defaults=d)

    # 7. Monthly Metrics
    monthly_data = [
        { 'month': 'Jul', 'revenue': 890000 },
        { 'month': 'Aug', 'revenue': 940000 },
        { 'month': 'Sep', 'revenue': 870000 },
        { 'month': 'Oct', 'revenue': 1020000 },
        { 'month': 'Nov', 'revenue': 1150000 },
        { 'month': 'Dec', 'revenue': 1380000 },
        { 'month': 'Jan', 'revenue': 1240000 },
    ]
    for m in monthly_data:
        MonthlyMetric.objects.update_or_create(month=m['month'], defaults=m)

    # 8. Top Products
    top_products = [
        { 'name': 'Basmati Rice 5kg', 'sold': 342, 'revenue': 633300 },
        { 'name': 'Ceylon Tea 200g', 'sold': 289, 'revenue': 109820 },
        { 'name': 'Milo 500g', 'sold': 241, 'revenue': 209670 },
        { 'name': 'Milk Powder 400g', 'sold': 198, 'revenue': 128700 },
        { 'name': 'Noodles Kottu 100g', 'sold': 456, 'revenue': 29640 },
    ]
    for tp in top_products:
        TopProductMetric.objects.update_or_create(name=tp['name'], defaults=tp)

    print("Seeding complete.")

if __name__ == '__main__':
    seed()
