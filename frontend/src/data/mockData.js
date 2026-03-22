export const products = [
  { id: 1, name: 'Basmati Rice 5kg', sku: 'RIC001', category: 'Grains', price: 1850, stock: 142, minStock: 20, unit: 'bag', barcode: '4901234567890', supplier: 'Lanka Agro Pvt Ltd' },
  { id: 2, name: 'Coconut Oil 1L', sku: 'OIL002', category: 'Cooking', price: 580, stock: 8, minStock: 15, unit: 'bottle', barcode: '4901234567891', supplier: 'Pure Ceylon Foods' },
  { id: 3, name: 'Dhal (Red Lentils) 1kg', sku: 'DAL003', category: 'Grains', price: 320, stock: 95, minStock: 25, unit: 'pack', barcode: '4901234567892', supplier: 'Lanka Agro Pvt Ltd' },
  { id: 4, name: 'Sugar 1kg', sku: 'SUG004', category: 'Pantry', price: 180, stock: 3, minStock: 30, unit: 'pack', barcode: '4901234567893', supplier: 'Pelwatte Sugar' },
  { id: 5, name: 'Milk Powder 400g', sku: 'MLK005', category: 'Dairy', price: 650, stock: 67, minStock: 10, unit: 'tin', barcode: '4901234567894', supplier: 'Anchor Lanka' },
  { id: 6, name: 'Milo 500g', sku: 'MIL006', category: 'Beverages', price: 870, stock: 43, minStock: 15, unit: 'tin', barcode: '4901234567895', supplier: 'Nestle Lanka' },
  { id: 7, name: 'Bread (White)', sku: 'BRD007', category: 'Bakery', price: 95, stock: 30, minStock: 10, unit: 'loaf', barcode: '4901234567896', supplier: 'Maliban Biscuits' },
  { id: 8, name: 'Eggs (10 pack)', sku: 'EGG008', category: 'Dairy', price: 420, stock: 22, minStock: 8, unit: 'pack', barcode: '4901234567897', supplier: 'Sathosa Lanka' },
  { id: 9, name: 'Keells Sausages', sku: 'SAU009', category: 'Meat', price: 560, stock: 18, minStock: 5, unit: 'pack', barcode: '4901234567898', supplier: 'Keells Food Products' },
  { id: 10, name: 'Astra Margarine 250g', sku: 'MAR010', category: 'Dairy', price: 240, stock: 51, minStock: 10, unit: 'tub', barcode: '4901234567899', supplier: 'Unilever Lanka' },
  { id: 11, name: 'Noodles Kottu 100g', sku: 'NOO011', category: 'Instant', price: 65, stock: 200, minStock: 40, unit: 'pack', barcode: '4901234567900', supplier: 'Prima Ceylon' },
  { id: 12, name: 'Ceylon Tea 200g', sku: 'TEA012', category: 'Beverages', price: 380, stock: 88, minStock: 20, unit: 'pack', barcode: '4901234567901', supplier: 'Dilmah Tea' },
];

export const categories = ['All', 'Grains', 'Cooking', 'Pantry', 'Dairy', 'Beverages', 'Bakery', 'Meat', 'Instant'];

export const customers = [
  { id: 1, name: 'Kasun Perera', phone: '0771234567', email: 'kasun@gmail.com', loyaltyPoints: 450, totalSpent: 45200, joinDate: '2023-01-15' },
  { id: 2, name: 'Nimali Silva', phone: '0712345678', email: 'nimali@gmail.com', loyaltyPoints: 1200, totalSpent: 120000, joinDate: '2022-08-20' },
  { id: 3, name: 'Ruwan Fernando', phone: '0753456789', email: 'ruwan@gmail.com', loyaltyPoints: 220, totalSpent: 22000, joinDate: '2023-06-10' },
  { id: 4, name: 'Dilini Jayawardena', phone: '0764567890', email: 'dilini@gmail.com', loyaltyPoints: 780, totalSpent: 78000, joinDate: '2022-11-05' },
  { id: 5, name: 'Thilina Bandara', phone: '0775678901', email: 'thilina@gmail.com', loyaltyPoints: 340, totalSpent: 34000, joinDate: '2023-03-22' },
];

export const suppliers = [
  { id: 1, name: 'Lanka Agro Pvt Ltd', contact: 'Sunil Rathnayake', phone: '0112345678', email: 'info@lankaagro.lk', category: 'Grains & Pulses', balance: 125000, status: 'Active' },
  { id: 2, name: 'Pure Ceylon Foods', contact: 'Manel Perera', phone: '0113456789', email: 'orders@pureceylon.lk', category: 'Cooking Oil', balance: 48000, status: 'Active' },
  { id: 3, name: 'Anchor Lanka', contact: 'David Costa', phone: '0114567890', email: 'trade@anchor.lk', category: 'Dairy Products', balance: 0, status: 'Active' },
  { id: 4, name: 'Nestle Lanka', contact: 'Priya Seneviratne', phone: '0115678901', email: 'nestle@lk.nestle.com', category: 'FMCG', balance: 87500, status: 'Active' },
  { id: 5, name: 'Keells Food Products', contact: 'Rajan Mendis', phone: '0116789012', email: 'trade@keells.lk', category: 'Meat & Poultry', balance: 32000, status: 'Inactive' },
];

export const recentSales = [
  { id: 'INV-2025-0891', customer: 'Kasun Perera', items: 5, total: 2840, payment: 'Cash', time: '10:24 AM', status: 'Completed' },
  { id: 'INV-2025-0892', customer: 'Walk-in Customer', items: 2, total: 760, payment: 'Card', time: '10:41 AM', status: 'Completed' },
  { id: 'INV-2025-0893', customer: 'Nimali Silva', items: 8, total: 4320, payment: 'Cash', time: '11:05 AM', status: 'Completed' },
  { id: 'INV-2025-0894', customer: 'Walk-in Customer', items: 1, total: 380, payment: 'Digital', time: '11:18 AM', status: 'Completed' },
  { id: 'INV-2025-0895', customer: 'Ruwan Fernando', items: 3, total: 1560, payment: 'Cash', time: '11:50 AM', status: 'Completed' },
];

export const salesData = [
  { day: 'Mon', revenue: 42500, profit: 12800 },
  { day: 'Tue', revenue: 38200, profit: 10900 },
  { day: 'Wed', revenue: 55600, profit: 16800 },
  { day: 'Thu', revenue: 47300, profit: 13400 },
  { day: 'Fri', revenue: 61200, profit: 18600 },
  { day: 'Sat', revenue: 78900, profit: 24200 },
  { day: 'Sun', revenue: 52400, profit: 15700 },
];

export const monthlyData = [
  { month: 'Jul', revenue: 890000 },
  { month: 'Aug', revenue: 940000 },
  { month: 'Sep', revenue: 870000 },
  { month: 'Oct', revenue: 1020000 },
  { month: 'Nov', revenue: 1150000 },
  { month: 'Dec', revenue: 1380000 },
  { month: 'Jan', revenue: 1240000 },
];

export const topProducts = [
  { name: 'Basmati Rice 5kg', sold: 342, revenue: 633300 },
  { name: 'Ceylon Tea 200g', sold: 289, revenue: 109820 },
  { name: 'Milo 500g', sold: 241, revenue: 209670 },
  { name: 'Milk Powder 400g', sold: 198, revenue: 128700 },
  { name: 'Noodles Kottu 100g', sold: 456, revenue: 29640 },
];
