import os
import sys
import getpass
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from cashiers.models import Cashier

def create_cashier_interactive():
    print("--- Create New Cashier ---")
    name = input("Full Name: ").strip()
    if not name:
        print("Error: Name cannot be empty.")
        return

    print("\nAvailable Roles:\n1: Cashier\n2: Store Manager\n3: Admin")
    role_choice = input("Select Role (1/2/3) [default: 1]: ").strip()
    
    role_map = {'1': 'CASHIER', '2': 'MANAGER', '3': 'ADMIN'}
    role = role_map.get(role_choice, 'CASHIER')

    phone = input("Phone Number (optional): ").strip()
    
    while True:
        pin = getpass.getpass("Enter 4-digit PIN: ").strip()
        if len(pin) == 4 and pin.isdigit():
            break
        print("Error: PIN must be exactly 4 digits. Please try again.")

    cashier, created = Cashier.objects.get_or_create(
        name=name,
        defaults={
            'role': role,
            'phone': phone,
            'pin': pin
        }
    )

    if not created:
        print(f"\nUpdating existing cashier: {name}")
        cashier.role = role
        cashier.phone = phone
        cashier.pin = pin
        cashier.save()
    
    print(f"\n✅ Successfully created/updated Cashier: {cashier.name} ({cashier.get_role_display()})")

if __name__ == '__main__':
    try:
        create_cashier_interactive()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled.")
        sys.exit(1)
