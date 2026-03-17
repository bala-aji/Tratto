/**
 * Shared translations for all views.
 * Re-exports Cashier translations and adds Kitchen, Waiter, Admin keys.
 */
export type Lang = 'en' | 'ta';

// Re-export all cashier translations (they remain the canonical source for POS keys)
export { t, menuNamesTamil, catNamesTamil, tr, menuName, catName } from './components/cashier/translations';

// Import base dict so we can extend it
import { t } from './components/cashier/translations';

// ========== Kitchen Manager translations ==========
const kitchenKeys: Record<string, Record<Lang, string>> = {
  'km.title': { en: 'Kitchen Manager', ta: 'சமையலறை மேலாளர்' },
  'km.subtitle': { en: 'Operations Hub', ta: 'செயல்பாட்டு மையம்' },
  'km.kitchen.orders': { en: 'Kitchen Orders', ta: 'சமையலறை ஆர்டர்கள்' },
  'km.tables.waiters': { en: 'Tables & Waiters', ta: 'மேசைகள் & பரிமாறுநர்கள்' },
  'km.parcel.queue': { en: 'Parcel Queue', ta: 'பார்சல் வரிசை' },
  'km.new.orders': { en: 'new orders', ta: 'புதிய ஆர்டர்கள்' },
  'km.parcels.ready': { en: 'parcels ready', ta: 'பார்சல்கள் தயார்' },
  'km.tables.need.help': { en: 'tables need help', ta: 'மேசைகளுக்கு உதவி தேவை' },
  'km.start.preparing': { en: 'Start Preparing', ta: 'தயாரிக்க தொடங்கு' },
  'km.mark.ready': { en: 'Mark Ready', ta: 'தயார் என்று குறி' },
  'km.mark.served': { en: 'Mark Served', ta: 'பரிமாறியது என்று குறி' },
  'km.no.orders': { en: 'No orders in this category', ta: 'இந்த வகையில் ஆர்டர்கள் இல்லை' },
  'km.rush': { en: 'RUSH', ta: 'அவசரம்' },
  'km.done': { en: 'done', ta: 'முடிந்தது' },
  'km.cooking': { en: 'cooking', ta: 'சமைக்கிறது' },
  'km.ready': { en: 'ready', ta: 'தயார்' },
  'km.packing': { en: 'packing', ta: 'பேக்கிங்' },
  'km.tables.occupied': { en: 'tables', ta: 'மேசைகள்' },
  'km.rush.orders': { en: 'Rush orders', ta: 'அவசர ஆர்டர்கள்' },
  'km.by.table': { en: 'By Table', ta: 'மேசை வாரியாக' },
  'km.by.waiter': { en: 'By Waiter', ta: 'பரிமாறுநர் வாரியாக' },
  'km.new.order': { en: 'New Order', ta: 'புதிய ஆர்டர்' },
  'km.resolve': { en: 'Resolve Issue', ta: 'பிரச்சனை தீர்' },
  'km.ready.guests': { en: 'Ready for guests', ta: 'விருந்தினர்களுக்கு தயார்' },
  'km.awaiting.guests': { en: 'Reserved — awaiting guests', ta: 'முன்பதிவு — விருந்தினர்கள் காத்திருப்பு' },
  'km.items.done': { en: 'items done', ta: 'பொருட்கள் முடிந்தது' },
  'km.active.orders': { en: 'active orders', ta: 'செயலில் உள்ள ஆர்டர்கள்' },
  'km.load': { en: 'load', ta: 'பளு' },
  'km.busy': { en: 'busy', ta: 'பிஸி' },
  'km.free': { en: 'free', ta: 'காலி' },
  'km.no.tables': { en: 'No tables match this filter', ta: 'இந்த வடிகட்டியில் மேசைகள் இல்லை' },
  'km.no.waiters': { en: 'No waiters assigned', ta: 'பரிமாறுநர்கள் நியமிக்கப்படவில்லை' },
  'km.no.parcels': { en: 'No active parcels', ta: 'செயலில் உள்ள பார்சல்கள் இல்லை' },
  'km.start.packing': { en: 'Start Packing', ta: 'பேக்கிங் தொடங்கு' },
  'km.picked.up': { en: 'Picked Up', ta: 'எடுத்துக்கொண்டார்' },
  'km.overdue': { en: 'Overdue!', ta: 'தாமதம்!' },
  'km.to.ready': { en: 'to ready', ta: 'தயாராக' },
  'km.received': { en: 'Received', ta: 'பெறப்பட்டது' },
  'km.kitchen.updated': { en: 'Kitchen order updated', ta: 'சமையலறை ஆர்டர் புதுப்பிக்கப்பட்டது' },
  'km.parcel.updated': { en: 'Parcel status updated', ta: 'பார்சல் நிலை புதுப்பிக்கப்பட்டது' },
  'km.table.cleared': { en: 'cleared', ta: 'நீக்கப்பட்டது' },
};

// ========== Waiter translations ==========
const waiterKeys: Record<string, Record<Lang, string>> = {
  'w.title': { en: 'Waiter View', ta: 'பரிமாறுநர் பார்வை' },
  'w.my.tables': { en: 'My Tables', ta: 'என் மேசைகள்' },
  'w.merge': { en: 'Merge', ta: 'இணை' },
  'w.cancel': { en: 'Cancel', ta: 'ரத்து' },
  'w.new.order': { en: 'New Order', ta: 'புதிய ஆர்டர்' },
  'w.tables': { en: 'Tables', ta: 'மேசைகள்' },
  'w.orders': { en: 'Orders', ta: 'ஆர்டர்கள்' },
  'w.menu': { en: 'Menu', ta: 'உணவு பட்டியல்' },
  'w.active.orders': { en: 'Active Orders', ta: 'செயலில் உள்ள ஆர்டர்கள்' },
  'w.no.active': { en: 'No active orders', ta: 'செயலில் உள்ள ஆர்டர்கள் இல்லை' },
  'w.mark.served': { en: 'Mark Served', ta: 'பரிமாறியது என்று குறி' },
  'w.resolved': { en: 'Resolved', ta: 'தீர்க்கப்பட்டது' },
  'w.serve': { en: 'Serve', ta: 'பரிமாறு' },
  'w.alert.kitchen': { en: 'Alert Kitchen', ta: 'சமையலறைக்கு எச்சரிக்கை' },
  'w.send.kitchen': { en: 'Send to Kitchen', ta: 'சமையலறைக்கு அனுப்பு' },
  'w.select.table': { en: 'Select a table first', ta: 'முதலில் மேசை தேர்வு செய்யவும்' },
  'w.whole.table': { en: 'Whole Table', ta: 'முழு மேசை' },
  'w.per.seat': { en: 'Per Seat', ta: 'இருக்கை வாரியாக' },
  'w.select.seat': { en: 'Select seat to add items:', ta: 'பொருட்களை சேர்க்க இருக்கை தேர்வு செய்யவும்:' },
  'w.seat.items': { en: 'items:', ta: 'பொருட்கள்:' },
  'w.search.menu': { en: 'Search menu...', ta: 'உணவு தேடு...' },
  'w.items': { en: 'items', ta: 'பொருட்கள்' },
  'w.seats.with.items': { en: 'seats with items', ta: 'பொருட்கள் உள்ள இருக்கைகள்' },
  'w.ready.serve': { en: 'ready to serve!', ta: 'பரிமாற தயார்!' },
  'w.tap.merge': { en: 'Tap tables to select for merging', ta: 'இணைக்க மேசைகளை தட்டவும்' },
  'w.tables.selected': { en: 'tables selected', ta: 'மேசைகள் தேர்வு செய்யப்பட்டன' },
  'w.merge.now': { en: 'Merge Now', ta: 'இப்போது இணை' },
  'w.unmerge': { en: 'Unmerge', ta: 'பிரி' },
  'w.seats': { en: 'Seats:', ta: 'இருக்கைகள்:' },
  'w.order.sent': { en: 'Order sent to kitchen', ta: 'ஆர்டர் சமையலறைக்கு அனுப்பப்பட்டது' },
  'w.tables.merged': { en: 'Tables merged', ta: 'மேசைகள் இணைக்கப்பட்டன' },
  'w.tables.unmerged': { en: 'Tables unmerged', ta: 'மேசைகள் பிரிக்கப்பட்டன' },
  'w.alert.sent': { en: 'Alert sent', ta: 'எச்சரிக்கை அனுப்பப்பட்டது' },
  'w.order.served': { en: 'Order marked as served', ta: 'ஆர்டர் பரிமாறப்பட்டதாக குறிக்கப்பட்டது' },
  'w.ready': { en: 'ready', ta: 'தயார்' },
};

// ========== Admin translations ==========
const adminKeys: Record<string, Record<Lang, string>> = {
  'a.title': { en: 'Namma Naina Kadai', ta: 'நம்ம நைனா கடை' },
  'a.subtitle': { en: 'Admin Dashboard', ta: 'நிர்வாக டாஷ்போர்டு' },
  'a.dashboard': { en: 'Dashboard', ta: 'டாஷ்போர்டு' },
  'a.operations': { en: 'Live Operations', ta: 'நேரடி செயல்பாடுகள்' },
  'a.menu': { en: 'Menu', ta: 'உணவு பட்டியல்' },
  'a.inventory': { en: 'Inventory', ta: 'சரக்கு' },
  'a.employees': { en: 'Employees', ta: 'ஊழியர்கள்' },
  'a.suppliers': { en: 'Suppliers', ta: 'விநியோகஸ்தர்கள்' },
  'a.purchase.orders': { en: 'Purchase Orders', ta: 'கொள்முதல் ஆர்டர்கள்' },
  'a.expenses': { en: 'Expenses', ta: 'செலவுகள்' },
  'a.reports': { en: 'Reports', ta: 'அறிக்கைகள்' },
  'a.settings': { en: 'Settings', ta: 'அமைப்புகள்' },
  'a.today.revenue': { en: "Today's Revenue", ta: 'இன்றைய வருவாய்' },
  'a.total.orders': { en: 'Total Orders', ta: 'மொத்த ஆர்டர்கள்' },
  'a.active.tables': { en: 'Active Tables', ta: 'செயலில் உள்ள மேசைகள்' },
  'a.low.stock': { en: 'Low Stock Items', ta: 'குறைந்த சரக்கு பொருட்கள்' },
  'a.weekly.sales': { en: 'Weekly Sales', ta: 'வாராந்திர விற்பனை' },
  'a.top.dishes': { en: 'Top Selling Dishes', ta: 'அதிகம் விற்பனையாகும் உணவுகள்' },
  'a.recent.orders': { en: 'Recent Orders', ta: 'சமீபத்திய ஆர்டர்கள்' },
  'a.search': { en: 'Search...', ta: 'தேடு...' },
  'a.save': { en: 'Save', ta: 'சேமி' },
  'a.edit': { en: 'Edit', ta: 'திருத்து' },
  'a.delete': { en: 'Delete', ta: 'நீக்கு' },
  'a.add': { en: 'Add', ta: 'சேர்' },
  'a.cancel': { en: 'Cancel', ta: 'ரத்து' },
  'a.back': { en: 'Back', ta: 'பின்செல்' },
};

// Merge all keys into the main translation dict
Object.assign(t, kitchenKeys, waiterKeys, adminKeys);

// Helper to get any translation (same signature as cashier's tr)
export function T(key: string, lang: Lang): string {
  return t[key]?.[lang] || t[key]?.en || key;
}
