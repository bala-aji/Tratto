export type Lang = 'en' | 'ta';

export const t: Record<string, Record<Lang, string>> = {
  // Header
  'app.title': { en: 'Namma Naina Kadai', ta: 'நம்ம நைனா கடை' },
  'search.placeholder': { en: 'Search menu...', ta: 'உணவு தேடு...' },
  'tables': { en: 'Tables', ta: 'மேசைகள்' },
  'history': { en: 'History', ta: 'வரலாறு' },
  'held': { en: 'Held', ta: 'நிறுத்தி' },

  // Categories
  'cat.all': { en: 'All Menu', ta: 'அனைத்தும்' },
  'cat.breakfast': { en: 'Breakfast', ta: 'காலை உணவு' },
  'cat.rice': { en: 'Rice & Biryani', ta: 'சாதம் & பிரியாணி' },
  'cat.snacks': { en: 'Snacks', ta: 'சிற்றுண்டி' },
  'cat.drinks': { en: 'Drinks', ta: 'பானங்கள்' },
  'cat.desserts': { en: 'Desserts', ta: 'இனிப்புகள்' },
  'cat.meals': { en: 'Meals', ta: 'உணவுகள்' },

  // Order Panel
  'customer': { en: 'Customer', ta: 'வாடிக்கையாளர்' },
  'discount': { en: 'Discount', ta: 'தள்ளுபடி' },
  'hold': { en: 'Hold', ta: 'நிறுத்து' },
  'order.details': { en: 'Order Details', ta: 'ஆர்டர் விவரங்கள்' },
  'no.items': { en: 'No items in order', ta: 'ஆர்டரி��் எதுவும் இல்லை' },
  'tap.items': { en: 'Tap items to add them', ta: 'சேர்க்க உணவை தொடவும்' },
  'clear.all': { en: 'Clear All Order', ta: 'அனைத்தையும் நீக்கு' },
  'subtotal': { en: 'Subtotal', ta: 'உப மொத்தம்' },
  'items': { en: 'items', ta: 'பொருட்கள்' },
  'tax': { en: 'Tax', ta: 'வரி' },
  'total': { en: 'Total', ta: 'மொத்தம்' },
  'process.txn': { en: 'Process Transaction', ta: 'பணம் செலுத்து' },
  'dine.in': { en: 'Dine In', ta: 'இங்கே சாப்பிடு' },
  'take.away': { en: 'Take Away', ta: 'பார்சல்' },
  'dine.take.away': { en: 'Dine + Parcel', ta: 'சாப்பிடு + பார்சல்' },
  'mark.takeaway': { en: 'Parcel', ta: 'பார்சல்' },
  'dine.here': { en: 'Dine', ta: 'இங்கே' },
  'parcel.items': { en: 'parcel items', ta: 'பார்சல் பொருட்கள்' },
  'view.order': { en: 'View Order', ta: 'ஆர்டர் பார்' },
  'review.order': { en: 'Review Order', ta: 'ஆர்டர் பரிசோதி' },
  'total.items': { en: 'Total Items', ta: 'மொத்த பொருட்கள்' },

  // Hybrid Dine + Parcel Flow
  'hybrid.step1': { en: 'Step 1: Dine-In Items', ta: 'படி 1: இங்கே சாப்பிடு' },
  'hybrid.step2': { en: 'Step 2: Parcel Items', ta: 'படி 2: பார்சல் பொருட்கள்' },
  'hybrid.review': { en: 'Review Order', ta: 'ஆர்டர் பரிசோதனை' },
  'hybrid.next.parcel': { en: 'Next: Add Parcel Items', ta: 'அடுத்து: பார்சல் சேர்' },
  'hybrid.review.btn': { en: 'Review Combined Order', ta: 'ஒருங்கிணைந்த ஆர்டர் பார்' },
  'hybrid.back.dine': { en: 'Back to Dine-In', ta: 'சாப்பாட்டுக்கு திரும்பு' },
  'hybrid.back.parcel': { en: 'Back to Parcel', ta: 'பார்சலுக்கு திரும்பு' },
  'hybrid.dine.section': { en: 'Dine-In Items', ta: 'இங்கே சாப்பிடும் பொருட்கள்' },
  'hybrid.parcel.section': { en: 'Parcel Items', ta: 'பார்சல் பொருட்கள்' },
  'hybrid.skip.parcel': { en: 'Skip Parcel', ta: 'பார்சல் தவிர்' },
  'hybrid.adding.dine': { en: 'Adding dine-in items...', ta: 'சாப்பாடு சேர்க்கிறது...' },
  'hybrid.adding.parcel': { en: 'Adding parcel items...', ta: 'பார்சல் சேர்க்கிறது...' },
  'hybrid.no.parcel': { en: 'No parcel items added', ta: 'பார்சல் பொருட்கள் இல்லை' },
  'hybrid.no.dine': { en: 'No dine-in items added', ta: 'சாப்பிடும் பொருட்கள் இல்லை' },
  'print.parcel.slip': { en: 'Print Parcel Slip', ta: 'பார்சல் சீட்டு அச்சிடு' },
  'parcel.slip': { en: 'PARCEL SLIP', ta: 'பார்சல் சீட்டு' },
  'parcel.slip.for': { en: 'Parcel items for', ta: 'பார்சல் பொருட்கள்' },
  'parcel.pack.instruction': { en: 'Please pack the following items separately', ta: 'பின்வரும் பொருட்களை தனியாக பேக் செய்யவும்' },
  'toast.parcel.slip': { en: 'Parcel slip sent to printer', ta: 'பார்சல் சீட்டு அச்சுப்பொறிக்கு அனுப்பப்பட்டது' },

  // Payment Modal
  'payment': { en: 'Payment', ta: 'பணம் செலுத்துதல்' },
  'cash': { en: 'Cash', ta: 'பணம்' },
  'card': { en: 'Card', ta: 'கார்டு' },

  // Payment Confirmation Flow
  'confirm.payment': { en: 'Confirm Payment', ta: 'பணம் செலுத்துதலை உறுதிசெய்' },
  'pay.via': { en: 'Pay via', ta: 'மூலம் செலுத்து' },
  'cash.received': { en: 'Cash Received', ta: 'பெற்ற பணம்' },
  'enter.amount': { en: 'Enter amount received', ta: 'பெற்ற தொகையை உள்ளிடவும்' },
  'change.due': { en: 'Change Due', ta: 'திருப்பி கொடுக்க வேண்டிய தொகை' },
  'exact.amount': { en: 'Exact Amount', ta: 'சரியான தொகை' },
  'collected': { en: 'Collected', ta: 'வசூலிக்கப்பட்டது' },
  'confirm.and.print': { en: 'Confirm & Print', ta: 'உறுதிசெய் & அச்சிடு' },
  'back': { en: 'Back', ta: 'பின்செல்' },
  'amount.to.pay': { en: 'Amount to Pay', ta: 'செலுத்த வேண்டிய தொகை' },
  'processing': { en: 'Processing...', ta: 'செயலாக்கம்...' },
  'payment.success': { en: 'Payment Successful!', ta: 'பணம் செலுத்தப்பட்டது!' },
  'insufficient.amount': { en: 'Amount is less than total', ta: 'தொகை மொத்தத்தை விட குறைவு' },
  'waiting.for.payment': { en: 'Waiting for payment...', ta: 'பணம் செலுத்த காத்திருக்கிறது...' },
  'tap.to.confirm': { en: 'Tap to confirm once payment is received', ta: 'பணம் பெற்றவுடன் உறுதிசெய்ய தட்டவும்' },

  // QR Payment
  'qr.scan.to.pay': { en: 'Scan to Pay', ta: 'பணம் செலுத்த ஸ்கேன் செய்யவும்' },
  'qr.generating': { en: 'Generating QR Code...', ta: 'QR கோடு உருவாக்குகிறது...' },
  'qr.scan.instruction': { en: 'Scan with Google Pay, PhonePe, or Paytm', ta: 'Google Pay, PhonePe அல்லது Paytm மூலம் ஸ்கேன் செய்யவும்' },
  'qr.amount.prefilled': { en: 'Amount is pre-filled in the QR code', ta: 'தொகை QR கோடில் முன்னரே நிரப்பப்பட்டுள்ளது' },
  'qr.payment.to': { en: 'Payment to', ta: 'பணம் செலுத்துவது' },
  'qr.order.ref': { en: 'Order Ref', ta: 'ஆர்டர் குறிப்பு' },
  'qr.payment.received': { en: 'Payment Received', ta: 'பணம் பெறப்பட்டது' },

  // Tables Modal
  'select.table': { en: 'Select Table', ta: 'மேசை தேர்வு' },
  'seats': { en: 'seats', ta: 'இருக்கைகள்' },
  'available': { en: 'Available', ta: 'காலி' },
  'occupied': { en: 'Occupied (tap to free)', ta: 'பயன்பாட்டில் (நீக்க தட்டு)' },
  'reserved': { en: 'Reserved', ta: 'முன்பதிவு' },

  // Customer Modal
  'customer.details': { en: 'Customer Details', ta: 'வாடிக்கையாளர் விவரம்' },
  'customer.name': { en: 'Customer Name', ta: 'வாடிக்கையாளர் பெயர்' },
  'enter.customer': { en: 'Enter customer name', ta: 'பெயர் உள்ளிடவும்' },
  'save': { en: 'Save', ta: 'சேமி' },
  'clear': { en: 'Clear', ta: 'நீக்கு' },

  // Discount Modal
  'apply.discount': { en: 'Apply Discount', ta: 'தள்ளுபடி செய்' },
  'percentage': { en: 'Percentage %', ta: 'சதவீதம் %' },
  'flat.amount': { en: 'Flat Amount', ta: 'நிலையான தொகை' },
  'discount.pct': { en: 'Discount Percentage', ta: 'தள்ளுபடி சதவீதம்' },
  'discount.amt': { en: 'Discount Amount (Rs.)', ta: 'தள்ளுபடி தொகை (ரூ.)' },
  'apply': { en: 'Apply', ta: 'பொருத்து' },
  'remove': { en: 'Remove', ta: 'நீக்கு' },

  // Receipt
  'restaurant.name': { en: 'Namma Naina Kadai', ta: 'நம்ம நைனா கடை' },
  'order': { en: 'Order #', ta: 'ஆர்டர் #' },
  'date': { en: 'Date', ta: 'தேதி' },
  'time': { en: 'Time', ta: 'நேரம்' },
  'type': { en: 'Type', ta: 'வகை' },
  'table': { en: 'Table', ta: 'மேசை' },
  'payment.method': { en: 'Payment', ta: 'பணம் செலுத்தும் முறை' },
  'item': { en: 'Item', ta: 'உணவு' },
  'qty.price': { en: 'Qty x Price = Total', ta: 'எண் x விலை = மொத்தம்' },
  'cgst': { en: 'CGST (2.5%)', ta: 'CGST (2.5%)' },
  'sgst': { en: 'SGST (2.5%)', ta: 'SGST (2.5%)' },
  'grand.total': { en: 'Grand Total', ta: 'மொத்த தொகை' },
  'thank.you': { en: 'Thank you for dining with us!', ta: 'எங்களுடன் சாப்பிட்டதற்கு நன்றி!' },
  'print': { en: 'Print', ta: 'அச்சிடு' },
  'close': { en: 'Close', ta: 'மூடு' },
  'view.receipt': { en: 'View Receipt', ta: 'ரசீது பார்' },

  // Held Orders
  'held.orders': { en: 'Held Orders', ta: 'நிறுத்தப்பட்ட ஆர்டர்கள்' },
  'no.held': { en: 'No held orders', ta: 'நிறுத்தப்பட்ட ஆர்டர்கள் இல்லை' },
  'recall': { en: 'Recall', ta: 'மீட்டெடு' },

  // Order History
  'order.history': { en: 'Order History', ta: 'ஆர்டர் வரலாறு' },
  'no.orders': { en: 'No orders yet today', ta: 'இன்று இன்னும் ஆர்டர் இல்லை' },
  'total.orders': { en: 'Total Orders', ta: 'மொத்த ஆர்டர்கள்' },
  'total.revenue': { en: 'Total Revenue', ta: 'மொத்த வருவாய்' },
  'filter.today': { en: 'Today', ta: 'இன்று' },
  'filter.3days': { en: '3 Days', ta: '3 நாட்கள்' },
  'filter.7days': { en: '7 Days', ta: '7 நாட்கள்' },

  // Toasts
  'toast.added': { en: 'Added', ta: 'சேர்க்கப்பட்டது' },
  'toast.cleared': { en: 'Order cleared', ta: 'ஆர்டர் நீக்கப்பட்டது' },
  'toast.held': { en: 'Order held successfully', ta: 'ஆர்டர் நிறுத்தப்பட்டது' },
  'toast.recalled': { en: 'Order recalled', ta: 'ஆர்டர் மீட்டெடுக்கப்பட்டது' },
  'toast.held.removed': { en: 'Held order removed', ta: 'நிறுத்தப்பட்ட ஆர்டர் நீக்கப்பட்டது' },
  'toast.payment': { en: 'Payment of Rs.{amount} processed via {method}!', ta: 'ரூ.{amount} {method} மூலம் செலுத்தப்பட்டது!' },
  'toast.table.selected': { en: 'Table {id} selected', ta: 'மேசை {id} தேர்வு செய்யப்பட்டது' },
  'toast.table.free': { en: 'Table {id} is now free', ta: 'மேசை {id} இப்போது காலி' },
  'toast.print': { en: 'Receipt sent to printer', ta: 'ரசீது அச்சுப்பொறிக்கு அனுப்பப்பட்டது' },

  // Language toggle
  'lang.switch': { en: 'தமிழ்', ta: 'EN' },
};

// Tamil translations for menu item names
export const menuNamesTamil: Record<string, string> = {
  'Masala Dosa': 'மசாலா தோசை',
  'Idli Sambar': 'இட்லி சாம்பார்',
  'Medu Vada': 'மெது வடை',
  'Pongal': 'பொங்கல்',
  'Rava Upma': 'ரவா உப்புமா',
  'Uttapam': 'ஊத்தப்பம்',
  'Chicken Biryani': 'சிக்கன் பிரியாணி',
  'Curd Rice': 'தயிர் சாதம்',
  'Veg Meals': 'சைவ சாப்பாடு',
  'Samosa': 'சமோசா',
  'Onion Bajji': 'வெங்காய பஜ்ஜி',
  'Murukku': 'முறுக்கு',
  'Filter Coffee': 'பில்டர் காப்பி',
  'Mango Lassi': 'மாம்பழ லஸ்சி',
  'Masala Chai': 'மசாலா டீ',
  'Gulab Jamun': 'குலாப் ஜாமூன்',
  'Payasam': 'பாயசம்',
  'Jigarthanda': 'ஜிகர்தண்டா',
  // Fallback — If a dish name isn't mapped, it stays in English
};

// Tamil translations for category names  
export const catNamesTamil: Record<string, string> = {
  'All Menu': 'அனைத்தும்',
  'Breakfast': 'காலை உணவு',
  'Rice & Biryani': 'சாதம் & பிரியாணி',
  'Snacks': 'சிற்றுண்டி',
  'Drinks': 'பானங்கள்',
  'Desserts': 'இனிப்புகள்',
  'Meals': 'உணவுகள்',
};

// Helper to get translated text
export function tr(key: string, lang: Lang): string {
  return t[key]?.[lang] || t[key]?.en || key;
}

// Helper to get menu item name in current language
export function menuName(name: string, lang: Lang): string {
  if (lang === 'ta') return menuNamesTamil[name] || name;
  return name;
}

// Helper to get category name in current language
export function catName(name: string, lang: Lang): string {
  if (lang === 'ta') return catNamesTamil[name] || name;
  return name;
}