// South Indian Restaurant Data

// ========== Perspective Mode ==========
export type PerspectiveMode = 1 | 2 | 4;
const PERSPECTIVE_KEY = 'nnk_perspective_mode';

export function getPerspectiveMode(): PerspectiveMode | null {
  try {
    const stored = localStorage.getItem(PERSPECTIVE_KEY);
    if (stored) {
      const val = Number(stored);
      if (val === 1 || val === 2 || val === 4) return val;
    }
  } catch {}
  return null;
}

export function savePerspectiveMode(mode: PerspectiveMode): void {
  localStorage.setItem(PERSPECTIVE_KEY, String(mode));
}

export function clearPerspectiveMode(): void {
  localStorage.removeItem(PERSPECTIVE_KEY);
}

// ========== Restaurant Settings (shared between Admin & Cashier) ==========
export interface RestaurantSettings {
  upiId: string;
  upiDisplayName: string;
  restaurantName: string;
  gstNumber: string;
  phone: string;
  address: string;
}

const SETTINGS_KEY = 'nnk_restaurant_settings';

const defaultSettings: RestaurantSettings = {
  upiId: 'nammanainakadai@upi',
  upiDisplayName: 'Namma Naina Kadai',
  restaurantName: 'Namma Naina Kadai',
  gstNumber: '33AABCU9603R1ZM',
  phone: '+91 44 2345 6789',
  address: '12, Anna Salai, T. Nagar, Chennai - 600017',
};

export function getSettings(): RestaurantSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {}
  return { ...defaultSettings };
}

export function saveSettings(settings: RestaurantSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  availability: boolean;
  description?: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  isTakeAway?: boolean;
}

export interface Order {
  order_id: string;
  table_number: number | null;
  customer_name: string;
  items: OrderItem[];
  total_price: number;
  subtotal: number;
  tax: number;
  discount: number;
  status: 'Preparing' | 'Ready' | 'Served' | 'Completed';
  payment_method: string;
  order_type: 'Dine In' | 'Take Away' | 'Dine + Take Away';
  timestamp: Date;
}

export interface HeldOrder {
  id: string;
  name: string;
  table_number: number | null;
  order_type: 'Dine In' | 'Take Away' | 'Dine + Take Away';
  items: OrderItem[];
  discount: number;
  customer_name: string;
  timestamp: Date;
}

// ========== Kitchen / Waiter / Parcel Shared Types ==========
export type KitchenStatus = 'New' | 'Preparing' | 'Ready' | 'Served';
export type ParcelStatus = 'Received' | 'Packing' | 'Ready' | 'Picked Up';

export interface KitchenOrder {
  id: string;
  order_id: string;
  table_number: number | null;
  customer_name: string;
  items: { name: string; quantity: number; notes?: string; done: boolean }[];
  order_type: 'Dine In' | 'Take Away' | 'Dine + Take Away';
  status: KitchenStatus;
  created_at: Date;
  waiter: string;
  priority: 'normal' | 'rush';
}

export interface ParcelOrder {
  id: string;
  token: number;
  customer_name: string;
  phone: string;
  items: { name: string; quantity: number; notes?: string }[];
  status: ParcelStatus;
  total: number;
  payment: string;
  created_at: Date;
  estimated_ready: Date;
}

export interface WaiterTable {
  id: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'needs_attention';
  guests: number;
  order_id?: string;
  waiter: string;
}

export interface InventoryItem {
  id: string;
  ingredient: string;
  stock_quantity: number;
  unit: string;
  supplier_id: string;
  threshold: number;
  last_purchase: string;
  cost_per_unit: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  products: string[];
  delivery_schedule: string;
  payment_terms: string;
  rating: number;
  status: 'Active' | 'Inactive';
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  supplier_name: string;
  items: { ingredient: string; quantity: number; unit: string; price: number }[];
  status: 'Requested' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Rejected';
  expected_delivery: string;
  total_amount: number;
  created_at: string;
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'Chef' | 'Cashier' | 'Waiter' | 'Kitchen Helper' | 'Manager' | 'Delivery';
  phone: string;
  email: string;
  avatar: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  shift: 'Morning' | 'Afternoon' | 'Night' | 'Flexible';
  joined: string;
  salary: number;
  salaryType: 'Monthly' | 'Daily';
  attendance: number;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  orderId: string;
  fileName?: string;
}

export interface Expense {
  id: string;
  category: 'Rent' | 'Utilities' | 'Salaries' | 'Supplies' | 'Maintenance' | 'Marketing' | 'Miscellaneous' | 'Groceries' | 'Gas' | 'Equipment';
  description: string;
  amount: number;
  date: string;
  paidVia: 'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque';
  receipt?: string;
}

// Pre-populated completed orders for dashboard display
export const mockCompletedOrders: Order[] = [
  { order_id: 'ORD-1001', table_number: 3, customer_name: 'Ravi Kumar', items: [{ menuItem: { id: '1', name: 'Masala Dosa', price: 89, category: 'breakfast', image: '', availability: true }, quantity: 2 }, { menuItem: { id: '4', name: 'Filter Coffee', price: 39, category: 'drinks', image: '', availability: true }, quantity: 2 }], total_price: 269, subtotal: 256, tax: 13, discount: 0, status: 'Completed', payment_method: 'Cash', order_type: 'Dine In', timestamp: new Date('2026-03-13T08:30:00') },
  { order_id: 'ORD-1002', table_number: null, customer_name: 'Meena S.', items: [{ menuItem: { id: '3', name: 'Chicken Biryani', price: 199, category: 'rice', image: '', availability: true }, quantity: 2 }, { menuItem: { id: '9', name: 'Mango Lassi', price: 59, category: 'drinks', image: '', availability: true }, quantity: 2 }], total_price: 541, subtotal: 516, tax: 25, discount: 0, status: 'Completed', payment_method: 'UPI', order_type: 'Take Away', timestamp: new Date('2026-03-13T09:15:00') },
  { order_id: 'ORD-1003', table_number: 7, customer_name: 'Arun P.', items: [{ menuItem: { id: '2', name: 'Idli Sambar', price: 59, category: 'breakfast', image: '', availability: true }, quantity: 3 }, { menuItem: { id: '5', name: 'Medu Vada', price: 49, category: 'breakfast', image: '', availability: true }, quantity: 2 }, { menuItem: { id: '4', name: 'Filter Coffee', price: 39, category: 'drinks', image: '', availability: true }, quantity: 3 }], total_price: 409, subtotal: 392, tax: 17, discount: 20, status: 'Completed', payment_method: 'Card', order_type: 'Dine In', timestamp: new Date('2026-03-13T09:45:00') },
  { order_id: 'ORD-1004', table_number: 1, customer_name: 'Walk-in', items: [{ menuItem: { id: '15', name: 'Mutton Biryani', price: 249, category: 'rice', image: '', availability: true }, quantity: 1 }, { menuItem: { id: '6', name: 'Rasam', price: 45, category: 'meals', image: '', availability: true }, quantity: 1 }, { menuItem: { id: '18', name: 'Buttermilk', price: 29, category: 'drinks', image: '', availability: true }, quantity: 1 }], total_price: 339, subtotal: 323, tax: 16, discount: 0, status: 'Completed', payment_method: 'Cash', order_type: 'Dine In', timestamp: new Date('2026-03-13T10:20:00') },
  { order_id: 'ORD-1005', table_number: null, customer_name: 'Kavitha R.', items: [{ menuItem: { id: '10', name: 'Samosa', price: 29, category: 'snacks', image: '', availability: true }, quantity: 6 }, { menuItem: { id: '17', name: 'Bajji', price: 39, category: 'snacks', image: '', availability: true }, quantity: 4 }, { menuItem: { id: '4', name: 'Filter Coffee', price: 39, category: 'drinks', image: '', availability: true }, quantity: 4 }], total_price: 533, subtotal: 506, tax: 27, discount: 0, status: 'Completed', payment_method: 'QR Code', order_type: 'Take Away', timestamp: new Date('2026-03-13T10:50:00') },
  { order_id: 'ORD-1006', table_number: 5, customer_name: 'Suresh M.', items: [{ menuItem: { id: '8', name: 'Uttapam', price: 79, category: 'breakfast', image: '', availability: true }, quantity: 2 }, { menuItem: { id: '12', name: 'Ven Pongal', price: 69, category: 'breakfast', image: '', availability: true }, quantity: 1 }, { menuItem: { id: '4', name: 'Filter Coffee', price: 39, category: 'drinks', image: '', availability: true }, quantity: 3 }], total_price: 355, subtotal: 344, tax: 11, discount: 30, status: 'Completed', payment_method: 'UPI', order_type: 'Dine In', timestamp: new Date('2026-03-13T11:30:00') },
  { order_id: 'ORD-1007', table_number: null, customer_name: 'Online Customer', items: [{ menuItem: { id: '3', name: 'Chicken Biryani', price: 199, category: 'rice', image: '', availability: true }, quantity: 3 }, { menuItem: { id: '11', name: 'Gulab Jamun', price: 49, category: 'desserts', image: '', availability: true }, quantity: 3 }], total_price: 780, subtotal: 744, tax: 36, discount: 0, status: 'Completed', payment_method: 'Card', order_type: 'Take Away', timestamp: new Date('2026-03-13T12:00:00') },
  { order_id: 'ORD-1008', table_number: 9, customer_name: 'Pradeep Family', items: [{ menuItem: { id: '3', name: 'Chicken Biryani', price: 199, category: 'rice', image: '', availability: true }, quantity: 2 }, { menuItem: { id: '15', name: 'Mutton Biryani', price: 249, category: 'rice', image: '', availability: true }, quantity: 1 }, { menuItem: { id: '7', name: 'Payasam', price: 69, category: 'desserts', image: '', availability: true }, quantity: 3 }, { menuItem: { id: '18', name: 'Buttermilk', price: 29, category: 'drinks', image: '', availability: true }, quantity: 3 }], total_price: 1007, subtotal: 961, tax: 46, discount: 0, status: 'Completed', payment_method: 'Cash', order_type: 'Dine In', timestamp: new Date('2026-03-13T12:45:00') },
  { order_id: 'ORD-1009', table_number: null, customer_name: 'Deepa J.', items: [{ menuItem: { id: '1', name: 'Masala Dosa', price: 89, category: 'breakfast', image: '', availability: true }, quantity: 1 }, { menuItem: { id: '13', name: 'Upma', price: 49, category: 'breakfast', image: '', availability: true }, quantity: 1 }, { menuItem: { id: '4', name: 'Filter Coffee', price: 39, category: 'drinks', image: '', availability: true }, quantity: 2 }], total_price: 227, subtotal: 216, tax: 11, discount: 0, status: 'Completed', payment_method: 'UPI', order_type: 'Take Away', timestamp: new Date('2026-03-13T13:10:00') },
  { order_id: 'ORD-1010', table_number: 2, customer_name: 'Karthik & Friends', items: [{ menuItem: { id: '3', name: 'Chicken Biryani', price: 199, category: 'rice', image: '', availability: true }, quantity: 4 }, { menuItem: { id: '16', name: 'Curd Rice', price: 69, category: 'rice', image: '', availability: true }, quantity: 1 }, { menuItem: { id: '9', name: 'Mango Lassi', price: 59, category: 'drinks', image: '', availability: true }, quantity: 5 }], total_price: 1155, subtotal: 1100, tax: 55, discount: 0, status: 'Completed', payment_method: 'Card', order_type: 'Dine In', timestamp: new Date('2026-03-13T13:30:00') },
  { order_id: 'ORD-1011', table_number: 4, customer_name: 'Lakshmi N.', items: [{ menuItem: { id: '14', name: 'Plain Dosa', price: 59, category: 'breakfast', image: '', availability: true }, quantity: 2 }, { menuItem: { id: '6', name: 'Rasam', price: 45, category: 'meals', image: '', availability: true }, quantity: 2 }, { menuItem: { id: '7', name: 'Payasam', price: 69, category: 'desserts', image: '', availability: true }, quantity: 2 }], total_price: 363, subtotal: 346, tax: 17, discount: 0, status: 'Completed', payment_method: 'Cash', order_type: 'Dine In', timestamp: new Date('2026-03-13T14:00:00') },
  { order_id: 'ORD-1012', table_number: null, customer_name: 'Office Order', items: [{ menuItem: { id: '2', name: 'Idli Sambar', price: 59, category: 'breakfast', image: '', availability: true }, quantity: 10 }, { menuItem: { id: '4', name: 'Filter Coffee', price: 39, category: 'drinks', image: '', availability: true }, quantity: 10 }], total_price: 1029, subtotal: 980, tax: 49, discount: 0, status: 'Completed', payment_method: 'QR Code', order_type: 'Take Away', timestamp: new Date('2026-03-13T14:30:00') },
  { order_id: 'ORD-1013', table_number: 10, customer_name: 'Birthday Party', items: [{ menuItem: { id: '3', name: 'Chicken Biryani', price: 199, category: 'rice', image: '', availability: true }, quantity: 6 }, { menuItem: { id: '15', name: 'Mutton Biryani', price: 249, category: 'rice', image: '', availability: true }, quantity: 4 }, { menuItem: { id: '11', name: 'Gulab Jamun', price: 49, category: 'desserts', image: '', availability: true }, quantity: 10 }, { menuItem: { id: '9', name: 'Mango Lassi', price: 59, category: 'drinks', image: '', availability: true }, quantity: 10 }], total_price: 3623, subtotal: 3450, tax: 173, discount: 0, status: 'Completed', payment_method: 'UPI', order_type: 'Dine In', timestamp: new Date('2026-03-13T15:00:00') },
  { order_id: 'ORD-1014', table_number: null, customer_name: 'Walk-in', items: [{ menuItem: { id: '10', name: 'Samosa', price: 29, category: 'snacks', image: '', availability: true }, quantity: 4 }, { menuItem: { id: '4', name: 'Filter Coffee', price: 39, category: 'drinks', image: '', availability: true }, quantity: 2 }], total_price: 205, subtotal: 194, tax: 11, discount: 0, status: 'Completed', payment_method: 'Cash', order_type: 'Take Away', timestamp: new Date('2026-03-13T15:30:00') },
  { order_id: 'ORD-1015', table_number: 6, customer_name: 'Senthil V.', items: [{ menuItem: { id: '1', name: 'Masala Dosa', price: 89, category: 'breakfast', image: '', availability: true }, quantity: 1 }, { menuItem: { id: '5', name: 'Medu Vada', price: 49, category: 'breakfast', image: '', availability: true }, quantity: 2 }, { menuItem: { id: '4', name: 'Filter Coffee', price: 39, category: 'drinks', image: '', availability: true }, quantity: 2 }], total_price: 282, subtotal: 265, tax: 17, discount: 30, status: 'Completed', payment_method: 'Cash', order_type: 'Dine In', timestamp: new Date('2026-03-13T16:00:00') },
  { order_id: 'ORD-1016', table_number: null, customer_name: 'Swiggy Order', items: [{ menuItem: { id: '3', name: 'Chicken Biryani', price: 199, category: 'rice', image: '', availability: true }, quantity: 2 }, { menuItem: { id: '16', name: 'Curd Rice', price: 69, category: 'rice', image: '', availability: true }, quantity: 1 }], total_price: 490, subtotal: 467, tax: 23, discount: 0, status: 'Completed', payment_method: 'UPI', order_type: 'Take Away', timestamp: new Date('2026-03-13T16:30:00') },
  { order_id: 'ORD-1017', table_number: 8, customer_name: 'Corporate Lunch', items: [{ menuItem: { id: '3', name: 'Chicken Biryani', price: 199, category: 'rice', image: '', availability: true }, quantity: 5 }, { menuItem: { id: '6', name: 'Rasam', price: 45, category: 'meals', image: '', availability: true }, quantity: 5 }, { menuItem: { id: '18', name: 'Buttermilk', price: 29, category: 'drinks', image: '', availability: true }, quantity: 5 }, { menuItem: { id: '7', name: 'Payasam', price: 69, category: 'desserts', image: '', availability: true }, quantity: 5 }], total_price: 1796, subtotal: 1710, tax: 86, discount: 0, status: 'Completed', payment_method: 'Card', order_type: 'Dine In', timestamp: new Date('2026-03-13T17:00:00') },
  { order_id: 'ORD-1018', table_number: null, customer_name: 'Anitha G.', items: [{ menuItem: { id: '8', name: 'Uttapam', price: 79, category: 'breakfast', image: '', availability: true }, quantity: 2 }, { menuItem: { id: '4', name: 'Filter Coffee', price: 39, category: 'drinks', image: '', availability: true }, quantity: 2 }], total_price: 248, subtotal: 236, tax: 12, discount: 0, status: 'Completed', payment_method: 'Cash', order_type: 'Take Away', timestamp: new Date('2026-03-13T17:30:00') },
];

export const mockExpenses: Expense[] = [
  { id: 'EXP-001', category: 'Rent', description: 'Monthly restaurant rent', amount: 85000, date: '2026-03-01', paidVia: 'Bank Transfer' },
  { id: 'EXP-002', category: 'Utilities', description: 'Electricity bill - March', amount: 12500, date: '2026-03-05', paidVia: 'Bank Transfer' },
  { id: 'EXP-003', category: 'Utilities', description: 'Water bill - March', amount: 3200, date: '2026-03-05', paidVia: 'UPI' },
  { id: 'EXP-004', category: 'Supplies', description: 'Vegetables from Koyambedu', amount: 4500, date: '2026-03-10', paidVia: 'Cash' },
  { id: 'EXP-005', category: 'Supplies', description: 'Rice & dal weekly stock', amount: 8500, date: '2026-03-08', paidVia: 'Cash' },
  { id: 'EXP-006', category: 'Gas', description: 'LPG cylinders (5 units)', amount: 5200, date: '2026-03-07', paidVia: 'Cash' },
  { id: 'EXP-007', category: 'Maintenance', description: 'AC servicing', amount: 3500, date: '2026-03-09', paidVia: 'UPI' },
  { id: 'EXP-008', category: 'Miscellaneous', description: 'Cleaning supplies', amount: 1800, date: '2026-03-11', paidVia: 'Cash' },
  { id: 'EXP-009', category: 'Marketing', description: 'Zomato promotion', amount: 5000, date: '2026-03-06', paidVia: 'Bank Transfer' },
  { id: 'EXP-010', category: 'Equipment', description: 'New coffee filter replacement', amount: 2800, date: '2026-03-12', paidVia: 'UPI' },
  { id: 'EXP-011', category: 'Supplies', description: 'Meat and chicken from Madurai', amount: 11500, date: '2026-03-12', paidVia: 'Cash' },
  { id: 'EXP-012', category: 'Groceries', description: 'Spices and condiments', amount: 3200, date: '2026-03-13', paidVia: 'Cash' },
];

export const categories: MenuCategory[] = [
  { id: 'all', name: 'All Menu', icon: 'Grid3X3', color: '#6B7280' },
  { id: 'breakfast', name: 'Breakfast', icon: 'Sun', color: '#F59E0B', description: 'Morning favourites - dosa, idli, vada & more' },
  { id: 'rice', name: 'Rice & Biryani', icon: 'Wheat', color: '#EF4444', description: 'Biryani, curd rice & rice dishes' },
  { id: 'snacks', name: 'Snacks', icon: 'Cookie', color: '#F97316', description: 'Samosa, bajji & light bites' },
  { id: 'drinks', name: 'Drinks', icon: 'Coffee', color: '#8B5CF6', description: 'Coffee, lassi & beverages' },
  { id: 'desserts', name: 'Desserts', icon: 'IceCreamCone', color: '#EC4899', description: 'Payasam, gulab jamun & sweets' },
  { id: 'meals', name: 'Meals', icon: 'UtensilsCrossed', color: '#22C55E', description: 'Full meals & combos' },
];

export const menuItems: MenuItem[] = [
  { id: '1', name: 'Masala Dosa', price: 89, category: 'breakfast', image: 'https://images.unsplash.com/photo-1743517894265-c86ab035adef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3V0aCUyMGluZGlhbiUyMGRvc2ElMjBtYXNhbGF8ZW58MXx8fHwxNzczMzMyMTQ0fDA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Crispy dosa with spiced potato filling' },
  { id: '2', name: 'Idli Sambar', price: 59, category: 'breakfast', image: 'https://images.unsplash.com/photo-1668236499396-a62d2d1cb0cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3V0aCUyMGluZGlhbiUyMGlkbGklMjBzYW1iYXJ8ZW58MXx8fHwxNzczMzgwNTM0fDA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Soft steamed idlis with sambar & chutney' },
  { id: '3', name: 'Chicken Biryani', price: 199, category: 'rice', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ5YW5pJTIwcmljZSUyMGluZGlhbiUyMGZvb2R8ZW58MXx8fHwxNzczMzA2MjIwfDA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Fragrant basmati rice with tender chicken' },
  { id: '4', name: 'Filter Coffee', price: 39, category: 'drinks', image: 'https://images.unsplash.com/photo-1668236482744-b48b28650f12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmaWx0ZXIlMjBjb2ZmZWV8ZW58MXx8fHwxNzczNDE4NjU3fDA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Traditional South Indian filter coffee' },
  { id: '5', name: 'Medu Vada', price: 49, category: 'breakfast', image: 'https://images.unsplash.com/photo-1739249432260-0bcfdc382e5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB2YWRhJTIwbWVkdXxlbnwxfHx8fDE3NzM0MTg2NTh8MA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Crispy urad dal vada with chutney' },
  { id: '6', name: 'Rasam', price: 45, category: 'meals', image: 'https://images.unsplash.com/photo-1708146646005-30597857a7c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjByYXNhbSUyMHNvdXB8ZW58MXx8fHwxNzczNDE4NjU5fDA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Tangy pepper rasam' },
  { id: '7', name: 'Payasam', price: 69, category: 'desserts', image: 'https://images.unsplash.com/photo-1722982971717-9c8e050facb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwYXlhc2FtJTIwZGVzc2VydHxlbnwxfHx8fDE3NzM0MTg2NjB8MA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Traditional vermicelli payasam' },
  { id: '8', name: 'Uttapam', price: 79, category: 'breakfast', image: 'https://images.unsplash.com/photo-1754394483922-4d3a10cc6187?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB1dHRhcGFtJTIwcGFuY2FrZXxlbnwxfHx8fDE3NzM0MTg2NjB8MA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Thick dosa with onion & tomato topping' },
  { id: '9', name: 'Mango Lassi', price: 59, category: 'drinks', image: 'https://images.unsplash.com/photo-1655074084308-901ea6b88fd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5nbyUyMGxhc3NpJTIwZHJpbmt8ZW58MXx8fHwxNzczMzUxMDQ3fDA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Creamy mango yogurt drink' },
  { id: '10', name: 'Samosa', price: 29, category: 'snacks', image: 'https://images.unsplash.com/photo-1697155836252-d7f969108b5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzYW1vc2ElMjBzbmFja3xlbnwxfHx8fDE3NzMzNTEwNDN8MA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Crispy pastry with spiced potato filling' },
  { id: '11', name: 'Gulab Jamun', price: 49, category: 'desserts', image: 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBndWxhYiUyMGphbXVuJTIwZGVzc2VydHxlbnwxfHx8fDE3NzM0MTg2NjF8MA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Sweet milk dumplings in sugar syrup' },
  { id: '12', name: 'Ven Pongal', price: 69, category: 'breakfast', image: 'https://images.unsplash.com/photo-1653849942524-ef2c6882d70d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwb25nYWwlMjByaWNlJTIwZGlzaHxlbnwxfHx8fDE3NzM0MTg2NjJ8MA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Rice & moong dal with pepper & ghee' },
  { id: '13', name: 'Upma', price: 49, category: 'breakfast', image: 'https://images.unsplash.com/photo-1644289450169-bc58aa16bacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB1cG1hJTIwc2Vtb2xpbmElMjBicmVha2Zhc3R8ZW58MXx8fHwxNzczNDE4NjYyfDA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Seasoned semolina with vegetables' },
  { id: '14', name: 'Plain Dosa', price: 59, category: 'breakfast', image: 'https://images.unsplash.com/photo-1743517894265-c86ab035adef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3V0aCUyMGluZGlhbiUyMGRvc2ElMjBtYXNhbGF8ZW58MXx8fHwxNzczMzMyMTQ0fDA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Thin crispy rice & lentil crepe' },
  { id: '15', name: 'Mutton Biryani', price: 249, category: 'rice', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ5YW5pJTIwcmljZSUyMGluZGlhbiUyMGZvb2R8ZW58MXx8fHwxNzczMzA2MjIwfDA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Aromatic rice with tender mutton pieces' },
  { id: '16', name: 'Curd Rice', price: 69, category: 'rice', image: 'https://images.unsplash.com/photo-1653849942524-ef2c6882d70d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwb25nYWwlMjByaWNlJTIwZGlzaHxlbnwxfHx8fDE3NzM0MTg2NjJ8MA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Cool yogurt rice with tempering' },
  { id: '17', name: 'Bajji', price: 39, category: 'snacks', image: 'https://images.unsplash.com/photo-1697155836252-d7f969108b5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzYW1vc2ElMjBzbmFja3xlbnwxfHx8fDE3NzMzNTEwNDN8MA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Deep fried banana or chilli fritters' },
  { id: '18', name: 'Buttermilk', price: 29, category: 'drinks', image: 'https://images.unsplash.com/photo-1655074084308-901ea6b88fd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5nbyUyMGxhc3NpJTIwZHJpbmt8ZW58MXx8fHwxNzczMzUxMDQ3fDA&ixlib=rb-4.1.0&q=80&w=400', availability: true, description: 'Spiced yogurt drink' },
];

const MENU_ITEMS_KEY = 'nnk_menu_items';

export function getMenuItems(): MenuItem[] {
  try {
    const stored = localStorage.getItem(MENU_ITEMS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [...menuItems];
}

export function saveMenuItems(items: MenuItem[]): void {
  localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(items));
}

export const inventoryItems: InventoryItem[] = [
  { id: '1', ingredient: 'Basmati Rice', stock_quantity: 50, unit: 'kg', supplier_id: '1', threshold: 20, last_purchase: '2026-03-10', cost_per_unit: 85 },
  { id: '2', ingredient: 'Urad Dal', stock_quantity: 15, unit: 'kg', supplier_id: '1', threshold: 10, last_purchase: '2026-03-08', cost_per_unit: 120 },
  { id: '3', ingredient: 'Coconut Oil', stock_quantity: 8, unit: 'L', supplier_id: '2', threshold: 5, last_purchase: '2026-03-09', cost_per_unit: 180 },
  { id: '4', ingredient: 'Chicken', stock_quantity: 12, unit: 'kg', supplier_id: '3', threshold: 15, last_purchase: '2026-03-12', cost_per_unit: 220 },
  { id: '5', ingredient: 'Ghee', stock_quantity: 5, unit: 'kg', supplier_id: '2', threshold: 3, last_purchase: '2026-03-11', cost_per_unit: 550 },
  { id: '6', ingredient: 'Mustard Seeds', stock_quantity: 3, unit: 'kg', supplier_id: '1', threshold: 2, last_purchase: '2026-03-07', cost_per_unit: 200 },
  { id: '7', ingredient: 'Curry Leaves', stock_quantity: 1, unit: 'kg', supplier_id: '4', threshold: 2, last_purchase: '2026-03-06', cost_per_unit: 150 },
  { id: '8', ingredient: 'Tomatoes', stock_quantity: 8, unit: 'kg', supplier_id: '4', threshold: 10, last_purchase: '2026-03-12', cost_per_unit: 40 },
  { id: '9', ingredient: 'Onions', stock_quantity: 25, unit: 'kg', supplier_id: '4', threshold: 15, last_purchase: '2026-03-11', cost_per_unit: 35 },
  { id: '10', ingredient: 'Coffee Powder', stock_quantity: 4, unit: 'kg', supplier_id: '5', threshold: 3, last_purchase: '2026-03-10', cost_per_unit: 800 },
  { id: '11', ingredient: 'Semolina', stock_quantity: 10, unit: 'kg', supplier_id: '1', threshold: 5, last_purchase: '2026-03-09', cost_per_unit: 50 },
  { id: '12', ingredient: 'Mutton', stock_quantity: 5, unit: 'kg', supplier_id: '3', threshold: 8, last_purchase: '2026-03-12', cost_per_unit: 650 },
];

export const suppliers: Supplier[] = [
  { id: '1', name: 'Chennai Grains Co.', contact: '+91 98765 43210', email: 'orders@chennaigrains.com', products: ['Basmati Rice', 'Urad Dal', 'Mustard Seeds', 'Semolina'], delivery_schedule: 'Mon, Wed, Fri', payment_terms: 'Net 15', rating: 4.5, status: 'Active' },
  { id: '2', name: 'Chettinad Oils Ltd.', contact: '+91 87654 32109', email: 'supply@chettinadoils.com', products: ['Coconut Oil', 'Ghee', 'Sesame Oil'], delivery_schedule: 'Tue, Thu', payment_terms: 'Net 30', rating: 4.2, status: 'Active' },
  { id: '3', name: 'Fresh Meats Madurai', contact: '+91 76543 21098', email: 'fresh@meatsmadurai.com', products: ['Chicken', 'Mutton', 'Fish'], delivery_schedule: 'Daily', payment_terms: 'COD', rating: 4.7, status: 'Active' },
  { id: '4', name: 'Koyambedu Veggies', contact: '+91 65432 10987', email: 'veggies@koyambedu.com', products: ['Tomatoes', 'Onions', 'Curry Leaves', 'Green Chilli'], delivery_schedule: 'Daily', payment_terms: 'Weekly', rating: 4.0, status: 'Active' },
  { id: '5', name: 'Kumbakonam Coffee', contact: '+91 54321 09876', email: 'beans@kumbakonamcoffee.com', products: ['Coffee Powder', 'Chicory', 'Tea Leaves'], delivery_schedule: 'Mon, Fri', payment_terms: 'Net 15', rating: 4.8, status: 'Active' },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: 'PO-001', supplier_id: '3', supplier_name: 'Fresh Meats Madurai', items: [{ ingredient: 'Chicken', quantity: 20, unit: 'kg', price: 220 }, { ingredient: 'Mutton', quantity: 10, unit: 'kg', price: 650 }], status: 'Confirmed', expected_delivery: '2026-03-14', total_amount: 10900, created_at: '2026-03-12' },
  { id: 'PO-002', supplier_id: '4', supplier_name: 'Koyambedu Veggies', items: [{ ingredient: 'Tomatoes', quantity: 15, unit: 'kg', price: 40 }, { ingredient: 'Curry Leaves', quantity: 3, unit: 'kg', price: 150 }], status: 'Shipped', expected_delivery: '2026-03-13', total_amount: 1050, created_at: '2026-03-11' },
  { id: 'PO-003', supplier_id: '1', supplier_name: 'Chennai Grains Co.', items: [{ ingredient: 'Basmati Rice', quantity: 50, unit: 'kg', price: 85 }, { ingredient: 'Urad Dal', quantity: 20, unit: 'kg', price: 120 }], status: 'Requested', expected_delivery: '2026-03-15', total_amount: 6650, created_at: '2026-03-13' },
  { id: 'PO-004', supplier_id: '5', supplier_name: 'Kumbakonam Coffee', items: [{ ingredient: 'Coffee Powder', quantity: 5, unit: 'kg', price: 800 }], status: 'Delivered', expected_delivery: '2026-03-12', total_amount: 4000, created_at: '2026-03-10' },
];

export const salesData = [
  { day: 'Mon', sales: 12500, orders: 85 },
  { day: 'Tue', sales: 15200, orders: 102 },
  { day: 'Wed', sales: 11800, orders: 78 },
  { day: 'Thu', sales: 18400, orders: 125 },
  { day: 'Fri', sales: 22100, orders: 148 },
  { day: 'Sat', sales: 28500, orders: 192 },
  { day: 'Sun', sales: 25800, orders: 175 },
];

export const topDishes = [
  { name: 'Masala Dosa', orders: 245, revenue: 21805 },
  { name: 'Chicken Biryani', orders: 198, revenue: 39402 },
  { name: 'Idli Sambar', orders: 187, revenue: 11033 },
  { name: 'Filter Coffee', orders: 312, revenue: 12168 },
  { name: 'Medu Vada', orders: 156, revenue: 7644 },
];

export const tables = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  seats: i < 4 ? 2 : i < 8 ? 4 : 6,
  status: i === 0 || i === 3 || i === 7 ? 'occupied' : i === 5 ? 'reserved' : 'available' as string,
}));

export const employees: Employee[] = [
  { id: 'E001', name: 'Ramesh Kumar', role: 'Chef', phone: '+91 98765 43210', email: 'ramesh.k@nnkadai.com', avatar: 'https://images.unsplash.com/photo-1771694583810-db9568dc9b8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjByZXN0YXVyYW50JTIwY2hlZiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MzQyMDEwMnww&ixlib=rb-4.1.0&q=80&w=400', status: 'Active', shift: 'Morning', joined: '2024-06-15', salary: 35000, salaryType: 'Monthly', attendance: 96 },
  { id: 'E002', name: 'Priya Lakshmi', role: 'Cashier', phone: '+91 87654 32109', email: 'priya.l@nnkadai.com', avatar: 'https://images.unsplash.com/photo-1559307183-517680cd78d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHByb2Zlc3Npb25hbCUyMHdvcmtlcnxlbnwxfHx8fDE3NzMzMTA2MDl8MA&ixlib=rb-4.1.0&q=80&w=400', status: 'Active', shift: 'Morning', joined: '2024-08-20', salary: 22000, salaryType: 'Monthly', attendance: 94 },
  { id: 'E003', name: 'Arun Selvam', role: 'Waiter', phone: '+91 76543 21098', email: 'arun.s@nnkadai.com', avatar: 'https://images.unsplash.com/photo-1651977560788-98792cd34da0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHJlc3RhdXJhbnQlMjBzdGFmZnxlbnwxfHx8fDE3NzM0MjAxMDV8MA&ixlib=rb-4.1.0&q=80&w=400', status: 'Active', shift: 'Afternoon', joined: '2025-01-10', salary: 600, salaryType: 'Daily', attendance: 88 },
  { id: 'E004', name: 'Murugan S.', role: 'Kitchen Helper', phone: '+91 65432 10987', email: 'murugan.s@nnkadai.com', avatar: 'https://images.unsplash.com/photo-1573729065599-a8d4bd3bad96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraXRjaGVuJTIwY29vayUyMGluZGlhbiUyMGZvb2R8ZW58MXx8fHwxNzczNDIwMTAzfDA&ixlib=rb-4.1.0&q=80&w=400', status: 'Active', shift: 'Morning', joined: '2024-11-05', salary: 500, salaryType: 'Daily', attendance: 91 },
  { id: 'E005', name: 'Vijay Anand', role: 'Manager', phone: '+91 54321 09876', email: 'vijay.a@nnkadai.com', avatar: 'https://images.unsplash.com/photo-1728631191055-aa24c9eff7f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwbWFuYWdlciUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzMzMzg1MTN8MA&ixlib=rb-4.1.0&q=80&w=400', status: 'Active', shift: 'Flexible', joined: '2024-03-01', salary: 45000, salaryType: 'Monthly', attendance: 98 },
  { id: 'E006', name: 'Karthik R.', role: 'Delivery', phone: '+91 43210 98765', email: 'karthik.r@nnkadai.com', avatar: 'https://images.unsplash.com/photo-1574641264510-d656942d6380?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpdmVyeSUyMGRyaXZlciUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzczNDIwMTA1fDA&ixlib=rb-4.1.0&q=80&w=400', status: 'Active', shift: 'Afternoon', joined: '2025-02-14', salary: 550, salaryType: 'Daily', attendance: 87 },
  { id: 'E007', name: 'Lakshmi Devi', role: 'Chef', phone: '+91 32109 87654', email: 'lakshmi.d@nnkadai.com', avatar: 'https://images.unsplash.com/photo-1663575126956-2ed5163c94c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3YWl0ZXIlMjByZXN0YXVyYW50JTIwd29ya2VyfGVufDF8fHx8MTc3MzQyMDEwMnww&ixlib=rb-4.1.0&q=80&w=400', status: 'On Leave', shift: 'Night', joined: '2024-09-18', salary: 32000, salaryType: 'Monthly', attendance: 82 },
  { id: 'E008', name: 'Suresh Babu', role: 'Waiter', phone: '+91 21098 76543', email: 'suresh.b@nnkadai.com', avatar: 'https://images.unsplash.com/photo-1745559734544-7a1f023812fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwY2FzaGllciUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzM0MjAxMDN8MA&ixlib=rb-4.1.0&q=80&w=400', status: 'Inactive', shift: 'Night', joined: '2024-07-22', salary: 500, salaryType: 'Daily', attendance: 72 },
];

// ========== Mock Active Orders (Kitchen / Waiter / Parcel) ==========
const _now = new Date();
const _mins = (m: number) => new Date(_now.getTime() - m * 60000);
const _minsAhead = (m: number) => new Date(_now.getTime() + m * 60000);

export const mockKitchenOrders: KitchenOrder[] = [
  { id: 'KO-001', order_id: 'ORD-2001', table_number: 3, customer_name: 'Ravi Kumar', items: [{ name: 'Masala Dosa', quantity: 2, done: false }, { name: 'Filter Coffee', quantity: 2, done: true }], order_type: 'Dine In', status: 'Preparing', created_at: _mins(18), waiter: 'Arun Selvam', priority: 'rush' },
  { id: 'KO-002', order_id: 'ORD-2002', table_number: null, customer_name: 'Meena S.', items: [{ name: 'Chicken Biryani', quantity: 2, done: false }, { name: 'Mango Lassi', quantity: 2, done: false }], order_type: 'Take Away', status: 'New', created_at: _mins(5), waiter: 'Counter', priority: 'normal' },
  { id: 'KO-003', order_id: 'ORD-2003', table_number: 7, customer_name: 'Arun P.', items: [{ name: 'Idli Sambar', quantity: 3, done: true }, { name: 'Medu Vada', quantity: 2, done: true }, { name: 'Filter Coffee', quantity: 3, done: true }], order_type: 'Dine In', status: 'Ready', created_at: _mins(25), waiter: 'Suresh Babu', priority: 'normal' },
  { id: 'KO-004', order_id: 'ORD-2004', table_number: 1, customer_name: 'Walk-in', items: [{ name: 'Uttapam', quantity: 2, done: false }, { name: 'Rasam', quantity: 1, done: true }], order_type: 'Dine In', status: 'Preparing', created_at: _mins(12), waiter: 'Arun Selvam', priority: 'normal' },
  { id: 'KO-005', order_id: 'ORD-2005', table_number: null, customer_name: 'Kavitha R.', items: [{ name: 'Samosa', quantity: 6, done: false }, { name: 'Bajji', quantity: 4, done: false }, { name: 'Filter Coffee', quantity: 4, done: true }], order_type: 'Take Away', status: 'Preparing', created_at: _mins(8), waiter: 'Counter', priority: 'normal' },
  { id: 'KO-006', order_id: 'ORD-2006', table_number: 5, customer_name: 'Suresh M.', items: [{ name: 'Ven Pongal', quantity: 1, done: false }, { name: 'Filter Coffee', quantity: 3, done: false }], order_type: 'Dine In', status: 'New', created_at: _mins(2), waiter: 'Arun Selvam', priority: 'normal' },
  { id: 'KO-007', order_id: 'ORD-2007', table_number: null, customer_name: 'Online Order', items: [{ name: 'Chicken Biryani', quantity: 3, done: true }, { name: 'Gulab Jamun', quantity: 3, done: true }], order_type: 'Take Away', status: 'Ready', created_at: _mins(30), waiter: 'Counter', priority: 'normal' },
  { id: 'KO-008', order_id: 'ORD-2008', table_number: 9, customer_name: 'Pradeep Family', items: [{ name: 'Chicken Biryani', quantity: 2, done: false }, { name: 'Mutton Biryani', quantity: 1, done: false }, { name: 'Payasam', quantity: 3, done: false }, { name: 'Buttermilk', quantity: 3, done: true }], order_type: 'Dine In', status: 'New', created_at: _mins(1), waiter: 'Suresh Babu', priority: 'rush' },
];

export const mockParcelOrders: ParcelOrder[] = [
  { id: 'PO-101', token: 101, customer_name: 'Meena S.', phone: '+91 98765 12345', items: [{ name: 'Chicken Biryani', quantity: 2 }, { name: 'Mango Lassi', quantity: 2 }], status: 'Packing', total: 516, payment: 'UPI', created_at: _mins(15), estimated_ready: _minsAhead(5) },
  { id: 'PO-102', token: 102, customer_name: 'Kavitha R.', phone: '+91 87654 23456', items: [{ name: 'Samosa', quantity: 6 }, { name: 'Bajji', quantity: 4 }, { name: 'Filter Coffee', quantity: 4 }], status: 'Received', total: 506, payment: 'QR Code', created_at: _mins(8), estimated_ready: _minsAhead(12) },
  { id: 'PO-103', token: 103, customer_name: 'Online Order', phone: '+91 76543 34567', items: [{ name: 'Chicken Biryani', quantity: 3 }, { name: 'Gulab Jamun', quantity: 3 }], status: 'Ready', total: 744, payment: 'Card', created_at: _mins(30), estimated_ready: _mins(5) },
  { id: 'PO-104', token: 104, customer_name: 'Deepa J.', phone: '+91 65432 45678', items: [{ name: 'Masala Dosa', quantity: 1 }, { name: 'Upma', quantity: 1 }, { name: 'Filter Coffee', quantity: 2 }], status: 'Received', total: 216, payment: 'UPI', created_at: _mins(3), estimated_ready: _minsAhead(15) },
  { id: 'PO-105', token: 105, customer_name: 'Swiggy Order', phone: 'N/A', items: [{ name: 'Chicken Biryani', quantity: 2 }, { name: 'Curd Rice', quantity: 1 }], status: 'Packing', total: 467, payment: 'UPI', created_at: _mins(10), estimated_ready: _minsAhead(3) },
  { id: 'PO-106', token: 106, customer_name: 'Office Order', phone: '+91 54321 56789', items: [{ name: 'Idli Sambar', quantity: 10 }, { name: 'Filter Coffee', quantity: 10 }], status: 'Received', total: 980, payment: 'QR Code', created_at: _mins(1), estimated_ready: _minsAhead(20) },
  { id: 'PO-107', token: 100, customer_name: 'Walk-in', phone: 'N/A', items: [{ name: 'Samosa', quantity: 4 }, { name: 'Filter Coffee', quantity: 2 }], status: 'Picked Up', total: 194, payment: 'Cash', created_at: _mins(45), estimated_ready: _mins(30) },
];

export const waiterTables: WaiterTable[] = [
  { id: 1, seats: 2, status: 'occupied', guests: 2, order_id: 'ORD-2004', waiter: 'Arun Selvam' },
  { id: 2, seats: 2, status: 'available', guests: 0, waiter: 'Arun Selvam' },
  { id: 3, seats: 2, status: 'occupied', guests: 2, order_id: 'ORD-2001', waiter: 'Arun Selvam' },
  { id: 4, seats: 2, status: 'available', guests: 0, waiter: 'Arun Selvam' },
  { id: 5, seats: 4, status: 'occupied', guests: 3, order_id: 'ORD-2006', waiter: 'Arun Selvam' },
  { id: 6, seats: 4, status: 'reserved', guests: 0, waiter: 'Suresh Babu' },
  { id: 7, seats: 4, status: 'occupied', guests: 4, order_id: 'ORD-2003', waiter: 'Suresh Babu' },
  { id: 8, seats: 4, status: 'available', guests: 0, waiter: 'Suresh Babu' },
  { id: 9, seats: 6, status: 'occupied', guests: 6, order_id: 'ORD-2008', waiter: 'Suresh Babu' },
  { id: 10, seats: 6, status: 'available', guests: 0, waiter: 'Suresh Babu' },
  { id: 11, seats: 6, status: 'available', guests: 0, waiter: 'Arun Selvam' },
  { id: 12, seats: 6, status: 'needs_attention', guests: 4, order_id: 'ORD-2009', waiter: 'Arun Selvam' },
];

// ========== Authentication System ==========
export type UserRole = 'admin' | 'kitchen' | 'waiter' | 'cashier';

export interface UserAccount {
  id: string;
  name: string;
  pin: string;
  role: UserRole;
  avatar: string;
  phone: string;
}

export const mockUsers: UserAccount[] = [
  { id: 'U001', name: 'Vijay Anand', pin: '1234', role: 'admin', avatar: 'https://images.unsplash.com/photo-1728631191055-aa24c9eff7f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwbWFuYWdlciUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzMzMzg1MTN8MA&ixlib=rb-4.1.0&q=80&w=400', phone: '+91 54321 09876' },
  { id: 'U002', name: 'Ramesh Kumar', pin: '5678', role: 'kitchen', avatar: 'https://images.unsplash.com/photo-1771694583810-db9568dc9b8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjByZXN0YXVyYW50JTIwY2hlZiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MzQyMDEwMnww&ixlib=rb-4.1.0&q=80&w=400', phone: '+91 98765 43210' },
  { id: 'U003', name: 'Arun Selvam', pin: '1111', role: 'waiter', avatar: 'https://images.unsplash.com/photo-1651977560788-98792cd34da0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHJlc3RhdXJhbnQlMjBzdGFmZnxlbnwxfHx8fDE3NzM0MjAxMDV8MA&ixlib=rb-4.1.0&q=80&w=400', phone: '+91 76543 21098' },
  { id: 'U004', name: 'Suresh Babu', pin: '2222', role: 'waiter', avatar: 'https://images.unsplash.com/photo-1745559734544-7a1f023812fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwY2FzaGllciUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzM0MjAxMDN8MA&ixlib=rb-4.1.0&q=80&w=400', phone: '+91 21098 76543' },
  { id: 'U005', name: 'Priya Lakshmi', pin: '3456', role: 'cashier', avatar: 'https://images.unsplash.com/photo-1559307183-517680cd78d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHByb2Zlc3Npb25hbCUyMHdvcmtlcnxlbnwxfHx8fDE3NzMzMTA2MDl8MA&ixlib=rb-4.1.0&q=80&w=400', phone: '+91 87654 32109' },
  { id: 'U006', name: 'Lakshmi Devi', pin: '7890', role: 'kitchen', avatar: 'https://images.unsplash.com/photo-1663575126956-2ed5163c94c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3YWl0ZXIlMjByZXN0YXVyYW50JTIwd29ya2VyfGVufDF8fHx8MTc3MzQyMDEwMnww&ixlib=rb-4.1.0&q=80&w=400', phone: '+91 32109 87654' },
];

const AUTH_KEY = 'nnk_auth_user';

export function loginUser(pin: string): UserAccount | null {
  const user = mockUsers.find(u => u.pin === pin);
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  }
  return null;
}

export function getCurrentUser(): UserAccount | null {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

export function logoutUser(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: 'Admin',
    kitchen: 'Kitchen Keeper',
    waiter: 'Waiter',
    cashier: 'Cashier',
  };
  return labels[role];
}

export function getRoleHome(role: UserRole): string {
  const homes: Record<UserRole, string> = {
    admin: '/admin',
    kitchen: '/kitchen-manager',
    waiter: '/waiter',
    cashier: '/cashier',
  };
  return homes[role];
}

export function getRoleAllowedPaths(role: UserRole): string[] {
  const paths: Record<UserRole, string[]> = {
    admin: ['/admin', '/cashier', '/kitchen', '/kitchen-manager', '/waiter', '/parcel', '/supplier'],
    kitchen: ['/kitchen-manager'],
    waiter: ['/waiter'],
    cashier: ['/cashier'],
  };
  return paths[role];
}

// ========== Language Preference ==========
export type AppLanguage = 'en' | 'ta';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', flag: '🇮🇳' },
];

const LANG_KEY = 'nnk_language';

export function getLanguage(): AppLanguage {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'en' || stored === 'ta') return stored;
  } catch {}
  return 'en';
}

export function setLanguage(lang: AppLanguage): void {
  localStorage.setItem(LANG_KEY, lang);
}

// ========== Shared Order State (localStorage-backed) ==========
const SHARED_KITCHEN_KEY = 'nnk_shared_kitchen_orders';
const SHARED_PARCEL_KEY = 'nnk_shared_parcel_orders';
const SHARED_TABLES_KEY = 'nnk_shared_tables';
const SHARED_COMPLETED_KEY = 'nnk_shared_completed_orders';

function serializeWithDates(data: any): string {
  return JSON.stringify(data, (_, v) => v instanceof Date ? { __date: v.toISOString() } : v);
}

function deserializeWithDates(json: string): any {
  return JSON.parse(json, (_, v) => v && typeof v === 'object' && v.__date ? new Date(v.__date) : v);
}

function initSharedOrders(): void {
  if (!localStorage.getItem(SHARED_KITCHEN_KEY)) {
    saveSharedKitchenOrders(mockKitchenOrders);
  }
  if (!localStorage.getItem(SHARED_PARCEL_KEY)) {
    saveSharedParcelOrders(mockParcelOrders);
  }
  if (!localStorage.getItem(SHARED_TABLES_KEY)) {
    saveSharedTables(waiterTables);
  }
}

export function getSharedKitchenOrders(): KitchenOrder[] {
  try {
    const stored = localStorage.getItem(SHARED_KITCHEN_KEY);
    if (stored) return deserializeWithDates(stored);
  } catch {}
  return mockKitchenOrders.map(o => ({ ...o, items: o.items.map(i => ({ ...i })) }));
}

export function saveSharedKitchenOrders(orders: KitchenOrder[]): void {
  localStorage.setItem(SHARED_KITCHEN_KEY, serializeWithDates(orders));
}

export function getSharedParcelOrders(): ParcelOrder[] {
  try {
    const stored = localStorage.getItem(SHARED_PARCEL_KEY);
    if (stored) return deserializeWithDates(stored);
  } catch {}
  return mockParcelOrders.map(o => ({ ...o, items: o.items.map(i => ({ ...i })) }));
}

export function saveSharedParcelOrders(orders: ParcelOrder[]): void {
  localStorage.setItem(SHARED_PARCEL_KEY, serializeWithDates(orders));
}

export function getSharedTables(): WaiterTable[] {
  try {
    const stored = localStorage.getItem(SHARED_TABLES_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return waiterTables.map(t => ({ ...t }));
}

export function saveSharedTables(tables: WaiterTable[]): void {
  localStorage.setItem(SHARED_TABLES_KEY, JSON.stringify(tables));
}

export function getSharedCompletedOrders(): Order[] {
  try {
    const stored = localStorage.getItem(SHARED_COMPLETED_KEY);
    if (stored) return deserializeWithDates(stored);
  } catch {}
  return [];
}

export function saveSharedCompletedOrders(orders: Order[]): void {
  localStorage.setItem(SHARED_COMPLETED_KEY, serializeWithDates(orders));
}

export function pushKitchenOrder(order: KitchenOrder): void {
  const existing = getSharedKitchenOrders();
  saveSharedKitchenOrders([order, ...existing]);
}

initSharedOrders();