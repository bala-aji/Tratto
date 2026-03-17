import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Search, Grid3X3, Sun, Wheat, Cookie, Coffee, IceCreamCone, UtensilsCrossed,
  Plus, Minus, Trash2, ArrowLeft, Zap, Users, LayoutGrid, Percent, QrCode,
  CreditCard, Banknote, Smartphone, X, Clock, Printer, ChevronDown, Pause, Play,
  Receipt, History, User, ArrowRight, CheckCircle2, CircleDollarSign,
  ShoppingBag, Package, ChevronRight
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { menuItems as defaultMenuItems, categories, tables as initialTables, getSettings, getLanguage, getMenuItems, type MenuItem, type OrderItem, type Order, type HeldOrder, pushKitchenOrder, type KitchenOrder, saveSharedParcelOrders, getSharedParcelOrders, type ParcelOrder, saveSharedTables, getSharedTables } from '../../data';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { tr, menuName, catName, type Lang } from './translations';
import { UserBadge } from '../auth/UserBadge';
import QRCode from 'qrcode';

const iconMap: Record<string, any> = {
  Grid3X3, Sun, Wheat, Cookie, Coffee, IceCreamCone, UtensilsCrossed,
};

export function CashierPOS() {
  const navigate = useNavigate();
  const [menuItems] = useState<MenuItem[]>(() => getMenuItems());
  const [lang, setLang] = useState<Lang>(() => getLanguage() as Lang);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'Dine In' | 'Take Away' | 'Dine + Take Away'>('Dine In');
  const [hybridPhase, setHybridPhase] = useState<'dine' | 'parcel'>('dine');
  const [showParcelSlip, setShowParcelSlip] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');

  // Modals
  const [showPayment, setShowPayment] = useState(false);
  const [showTables, setShowTables] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showMobileOrder, setShowMobileOrder] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'today' | '3days' | '7days'>('today');
  const [longPressItem, setLongPressItem] = useState<MenuItem | null>(null);
  const [longPressQty, setLongPressQty] = useState(0);
  const [pressingItemId, setPressingItemId] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  // Payment flow state
  const [paymentStep, setPaymentStep] = useState<'select' | 'confirm' | 'cash' | 'qr'>('select');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrOrderRef, setQrOrderRef] = useState<string>('');

  // State
  const [tablesData, setTablesData] = useState(initialTables.map(t => ({ ...t })));
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [lastReceipt, setLastReceipt] = useState<Order | null>(null);
  const orderCounter = useRef(1001);

  // Shorthand
  const L = (key: string) => tr(key, lang);
  const MN = (name: string) => menuName(name, lang);
  const CN = (name: string) => catName(name, lang);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        menuName(item.name, 'ta').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && item.availability;
    });
  }, [selectedCategory, searchQuery, menuItems]);

  const addToOrder = (item: MenuItem) => {
    const isParcelItem = orderType === 'Dine + Take Away' && hybridPhase === 'parcel';
    setOrderItems((prev) => {
      // In hybrid mode, same item can exist as both dine and parcel separately
      const existing = prev.find((o) => o.menuItem.id === item.id && (orderType !== 'Dine + Take Away' || !!o.isTakeAway === isParcelItem));
      if (existing) {
        return prev.map((o) =>
          o === existing ? { ...o, quantity: o.quantity + 1 } : o
        );
      }
      return [...prev, { menuItem: item, quantity: 1, isTakeAway: isParcelItem || undefined }];
    });
    const tag = isParcelItem ? ` (${L('mark.takeaway')})` : '';
    toast.success(`${L('toast.added')} ${MN(item.name)}${tag}`);
  };

  const updateQuantity = (itemId: string, delta: number, isTakeAway?: boolean) => {
    setOrderItems((prev) =>
      prev
        .map((o) =>
          o.menuItem.id === itemId && (isTakeAway === undefined || !!o.isTakeAway === isTakeAway)
            ? { ...o, quantity: o.quantity + delta }
            : o
        )
        .filter((o) => o.quantity > 0)
    );
  };

  const getItemQuantity = (itemId: string) => {
    return orderItems
      .filter((o) => {
        if (o.menuItem.id !== itemId) return false;
        if (orderType === 'Dine + Take Away') {
          if (hybridPhase === 'dine') return !o.isTakeAway;
          if (hybridPhase === 'parcel') return !!o.isTakeAway;
        }
        return true;
      })
      .reduce((s, o) => s + o.quantity, 0);
  };

  const setItemQuantity = (item: MenuItem, qty: number) => {
    const isParcelItem = orderType === 'Dine + Take Away' && hybridPhase === 'parcel';
    setOrderItems((prev) => {
      if (qty <= 0) return prev.filter((o) => !(o.menuItem.id === item.id && (orderType !== 'Dine + Take Away' || !!o.isTakeAway === isParcelItem)));
      const existing = prev.find((o) => o.menuItem.id === item.id && (orderType !== 'Dine + Take Away' || !!o.isTakeAway === isParcelItem));
      if (existing) {
        return prev.map((o) => o === existing ? { ...o, quantity: qty } : o);
      }
      return [...prev, { menuItem: item, quantity: qty, isTakeAway: isParcelItem || undefined }];
    });
  };

  const toggleItemTakeAway = (itemId: string) => {
    setOrderItems((prev) =>
      prev.map((o) =>
        o.menuItem.id === itemId ? { ...o, isTakeAway: !o.isTakeAway } : o
      )
    );
  };

  const takeAwayCount = orderItems.filter(o => o.isTakeAway).length;
  const dineItems = orderItems.filter(o => !o.isTakeAway);
  const parcelItems = orderItems.filter(o => o.isTakeAway);
  const isHybrid = orderType === 'Dine + Take Away';

  const openLongPressModal = (item: MenuItem) => {
    const isParcelPhase = isHybrid && hybridPhase === 'parcel';
    const currentQty = isHybrid
      ? (orderItems.find(o => o.menuItem.id === item.id && !!o.isTakeAway === isParcelPhase)?.quantity || 0)
      : getItemQuantity(item.id);
    setLongPressQty(currentQty);
    setLongPressItem(item);
  };

  const confirmLongPressQty = () => {
    if (longPressItem) {
      setItemQuantity(longPressItem, longPressQty);
      if (longPressQty > 0) {
        toast.success(`${MN(longPressItem.name)} × ${longPressQty}`);
      }
    }
    setLongPressItem(null);
  };

  const startLongPress = (item: MenuItem) => {
    longPressTriggered.current = false;
    setPressingItemId(item.id);
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setPressingItemId(null);
      openLongPressModal(item);
    }, 500);
  };

  const cancelLongPress = () => {
    setPressingItemId(null);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleCardClick = (item: MenuItem) => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    addToOrder(item);
  };

  const subtotal = orderItems.reduce((sum, o) => sum + o.menuItem.price * o.quantity, 0);
  const discountAmount = discountType === 'percent' ? Math.round(subtotal * discount / 100) : discount;
  const taxableAmount = subtotal - discountAmount;
  const tax = Math.round(taxableAmount * 0.05);
  const total = taxableAmount + tax;

  const clearOrder = () => {
    setOrderItems([]);
    setSelectedTable(null);
    setCustomerName('');
    setDiscount(0);
    setHybridPhase('dine');
    toast.info(L('toast.cleared'));
  };

  const holdOrder = () => {
    if (orderItems.length === 0) return;
    const held: HeldOrder = {
      id: `HOLD-${Date.now()}`,
      name: customerName || `${L('table')} ${selectedTable || '?'}`,
      table_number: selectedTable,
      order_type: orderType,
      items: [...orderItems],
      discount,
      customer_name: customerName,
      timestamp: new Date(),
    };
    setHeldOrders((prev) => [...prev, held]);
    if (selectedTable) {
      setTablesData(prev => prev.map(t => t.id === selectedTable ? { ...t, status: 'held' } : t));
    }
    setOrderItems([]);
    setSelectedTable(null);
    setCustomerName('');
    setDiscount(0);
    toast.success(L('toast.held'));
  };

  const recallHeldOrder = (held: HeldOrder) => {
    setOrderItems(held.items);
    setSelectedTable(held.table_number);
    setCustomerName(held.customer_name);
    setDiscount(held.discount);
    setOrderType(held.order_type);
    setHybridPhase('dine');
    setHeldOrders((prev) => prev.filter((h) => h.id !== held.id));
    setShowHeldOrders(false);
    toast.success(L('toast.recalled'));
  };

  const deleteHeldOrder = (id: string) => {
    const held = heldOrders.find(h => h.id === id);
    if (held?.table_number) {
      setTablesData(prev => prev.map(t => t.id === held.table_number ? { ...t, status: 'available' } : t));
    }
    setHeldOrders((prev) => prev.filter((h) => h.id !== id));
    toast.info(L('toast.held.removed'));
  };

  const processPayment = (method: string) => {
    const orderId = `ORD-${orderCounter.current++}`;
    const order: Order = {
      order_id: orderId,
      table_number: selectedTable,
      customer_name: customerName || 'Walk-in',
      items: [...orderItems],
      subtotal,
      tax,
      discount: discountAmount,
      total_price: total,
      status: 'Preparing',
      payment_method: method,
      order_type: orderType,
      timestamp: new Date(),
    };
    setCompletedOrders((prev) => [order, ...prev]);
    setLastReceipt(order);

    // --- Shared state: push to kitchen / parcel queues ---
    const dineItems = orderType === 'Dine In'
      ? orderItems
      : orderType === 'Dine + Take Away'
      ? orderItems.filter(oi => !oi.isTakeAway)
      : [];
    const parcelItems = orderType === 'Take Away'
      ? orderItems
      : orderType === 'Dine + Take Away'
      ? orderItems.filter(oi => oi.isTakeAway)
      : [];

    // Push dine-in items as a kitchen order
    if (dineItems.length > 0 && (orderType === 'Dine In' || orderType === 'Dine + Take Away')) {
      const ko: KitchenOrder = {
        id: `KO-${Date.now()}`,
        order_id: orderId,
        table_number: selectedTable,
        customer_name: customerName || 'Walk-in',
        items: dineItems.map(oi => ({ name: oi.menuItem.name, quantity: oi.quantity, notes: oi.specialInstructions, done: false })),
        order_type: orderType,
        status: 'New',
        created_at: new Date(),
        waiter: 'Counter',
        priority: 'normal',
      };
      pushKitchenOrder(ko);
    }

    // Push parcel items as a parcel order
    if (parcelItems.length > 0 && (orderType === 'Take Away' || orderType === 'Dine + Take Away')) {
      const existingParcels = getSharedParcelOrders();
      const nextToken = existingParcels.length > 0 ? Math.max(...existingParcels.map(p => p.token)) + 1 : 201;
      const po: ParcelOrder = {
        id: `PO-${Date.now()}`,
        token: nextToken,
        customer_name: customerName || 'Walk-in',
        phone: 'N/A',
        items: parcelItems.map(oi => ({ name: oi.menuItem.name, quantity: oi.quantity, notes: oi.specialInstructions })),
        status: 'Received',
        total: parcelItems.reduce((s, oi) => s + oi.menuItem.price * oi.quantity, 0),
        payment: method,
        created_at: new Date(),
        estimated_ready: new Date(Date.now() + 15 * 60000),
      };
      saveSharedParcelOrders([po, ...existingParcels]);
    }

    // Update shared table status
    if (selectedTable) {
      setTablesData(prev => prev.map(t =>
        t.id === selectedTable ? { ...t, status: 'occupied' } : t
      ));
      const allSharedTables = getSharedTables();
      saveSharedTables(allSharedTables.map(t =>
        t.id === selectedTable ? { ...t, status: 'occupied' as const, order_id: orderId } : t
      ));
    }

    setOrderItems([]);
    setSelectedTable(null);
    setCustomerName('');
    setDiscount(0);
    setHybridPhase('dine');
    setShowPayment(false);
    setShowReceipt(true);
    toast.success(L('toast.payment').replace('{amount}', total.toString()).replace('{method}', method));
  };

  const selectTable = (tableId: number) => {
    const table = tablesData.find(t => t.id === tableId);
    if (table && (table.status === 'available' || table.status === 'held')) {
      setSelectedTable(tableId);
      setTablesData(prev => prev.map(t =>
        t.id === tableId ? { ...t, status: 'occupied' } : t
      ));
      setShowTables(false);
      toast.success(L('toast.table.selected').replace('{id}', tableId.toString()));
    }
  };

  const freeTable = (tableId: number) => {
    setTablesData(prev => prev.map(t =>
      t.id === tableId ? { ...t, status: 'available' } : t
    ));
    if (selectedTable === tableId) setSelectedTable(null);
    toast.success(L('toast.table.free').replace('{id}', tableId.toString()));
  };



  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString(lang === 'ta' ? 'ta-IN' : 'en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    });

  const formatDate = (date: Date) =>
    date.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });

  // Status translations for tables
  const statusText = (status: string) => {
    if (lang === 'ta') {
      const map: Record<string, string> = { available: 'காலி', occupied: 'பயன்பாட்டில்', held: 'நிறுத்தி', reserved: 'முன்பதிவு' };
      return map[status] || status;
    }
    return status;
  };

  // Order panel content (shared between desktop sidebar and mobile modal)
  const orderPanelContent = () => (
    <>
      {/* Panel Header */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-foreground">{L('order.details')}</h3>
          <div className="flex gap-1.5">
            {heldOrders.length > 0 && (
              <button onClick={() => setShowHeldOrders(true)} className="flex items-center gap-1 text-[0.7rem] text-primary bg-primary/10 px-2 py-1 rounded-full cursor-pointer">
                <Play className="w-3 h-3" /> {heldOrders.length} {L('held')}
              </button>
            )}
            <button onClick={() => setShowOrderHistory(true)} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>

        {selectedTable && (
          <p className="text-[0.8rem] text-accent mb-2">{L('table')} #{selectedTable}</p>
        )}
        {customerName && (
          <p className="text-[0.8rem] text-muted-foreground mb-2">{customerName}</p>
        )}

        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['Dine In', 'Take Away', 'Dine + Take Away'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setOrderType(type);
                if (type === 'Dine + Take Away') {
                  setHybridPhase('dine');
                  setOrderItems(prev => prev.map(o => ({ ...o, isTakeAway: undefined })));
                } else {
                  setHybridPhase('dine');
                  setOrderItems(prev => prev.map(o => ({ ...o, isTakeAway: undefined })));
                }
              }}
              className={`flex-1 py-1.5 rounded-md text-[0.7rem] transition-all cursor-pointer ${
                orderType === type ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              {type === 'Dine In' ? L('dine.in') : type === 'Take Away' ? L('take.away') : L('dine.take.away')}
            </button>
          ))}
        </div>

        {/* Hybrid Phase Context Bar */}
        {isHybrid && (
          <div className="mt-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={hybridPhase}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                className={`text-center py-1.5 rounded-lg text-[0.7rem] ${
                  hybridPhase === 'dine' ? 'bg-blue-50 text-blue-600'
                    : 'bg-green-50 text-green-600'
                }`}
              >
                {hybridPhase === 'dine' ? L('hybrid.adding.dine') : L('hybrid.adding.parcel')}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {orderItems.length === 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={() => setShowCustomer(true)} className="flex flex-col items-center gap-1 py-2 px-3 bg-muted rounded-lg hover:bg-border transition-colors cursor-pointer">
              <User className="w-4 h-4" />
              <span className="text-[0.7rem]">{customerName || L('customer')}</span>
            </button>
            <button onClick={() => setShowTables(true)} className="flex flex-col items-center gap-1 py-2 px-3 bg-muted rounded-lg hover:bg-border transition-colors cursor-pointer">
              <LayoutGrid className="w-4 h-4" />
              <span className="text-[0.7rem]">{selectedTable ? `${L('table')} #${selectedTable}` : L('tables')}</span>
            </button>
            <button onClick={() => setShowDiscount(true)} className="flex flex-col items-center gap-1 py-2 px-3 bg-muted rounded-lg hover:bg-border transition-colors cursor-pointer relative">
              <Percent className="w-4 h-4" />
              <span className="text-[0.7rem]">{L('discount')}</span>
              {discount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[0.55rem] rounded-full flex items-center justify-center">{discountType === 'percent' ? `${discount}%` : ''}</span>}
            </button>
            <button onClick={holdOrder} disabled={orderItems.length === 0} className="flex flex-col items-center gap-1 py-2 px-3 bg-muted rounded-lg hover:bg-border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              <Pause className="w-4 h-4" />
              <span className="text-[0.7rem]">{L('hold')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {(() => {
          // Determine which items to show based on hybrid phase
          const displayItems = isHybrid && hybridPhase === 'parcel'
            ? parcelItems
            : isHybrid && hybridPhase === 'dine'
            ? dineItems
            : orderItems;

          const currentPhaseItems = isHybrid
            ? (hybridPhase === 'parcel' ? parcelItems : dineItems)
            : orderItems;

          if (isHybrid && currentPhaseItems.length === 0) {
            return (
              <div className="text-center text-muted-foreground py-12">
                {hybridPhase === 'dine' ? (
                  <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-30" />
                ) : (
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                )}
                <p className="text-[0.85rem]">{hybridPhase === 'dine' ? L('hybrid.no.dine') : L('hybrid.no.parcel')}</p>
                <p className="text-[0.75rem] mt-1">{L('tap.items')}</p>
              </div>
            );
          }

          if (orderItems.length === 0) {
            return (
              <div className="text-center text-muted-foreground py-12">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-[0.85rem]">{L('no.items')}</p>
                <p className="text-[0.75rem] mt-1">{L('tap.items')}</p>
              </div>
            );
          }

          // Render helper for a single order item row
          const renderItemRow = (item: OrderItem, key: string) => (
            <div key={key} className={`py-3 first:pt-0 last:pb-0 ${item.isTakeAway ? 'bg-green-50/50 -mx-1 px-1 rounded-lg' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                  <ImageWithFallback
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-full h-full object-cover"
                  />
                  {item.isTakeAway && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.85rem] text-foreground truncate text-[14px]">{MN(item.menuItem.name)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, -1, !!item.isTakeAway)}
                      className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[0.8rem] w-4 text-center text-[14px]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, 1, !!item.isTakeAway)}
                      className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="text-muted-foreground text-[0.75rem]">{lang === 'ta' ? 'ரூ' : 'Rs'}.{item.menuItem.price}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-foreground text-[0.85rem] text-[15px] font-bold">{lang === 'ta' ? 'ரூ' : 'Rs'}.{item.menuItem.price * item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.menuItem.id, -item.quantity, !!item.isTakeAway)}
                    className="text-destructive/50 hover:text-destructive transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 m-[0px]" />
                  </button>
                </div>
              </div>
            </div>
          );

          // Normal or phase-filtered view
          return (
            <div className="divide-y divide-border">
              {displayItems.map((item, idx) => renderItemRow(item, `${item.isTakeAway ? 'p' : 'd'}-${item.menuItem.id}-${idx}`))}
            </div>
          );
        })()}
      </div>

      {/* Quick Actions - scrollable row when items exist */}
      {orderItems.length > 0 && (
        <div className="px-4 py-2 border-t border-border shrink-0 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button onClick={() => setShowCustomer(true)} className="flex items-center gap-1.5 py-1.5 px-3 bg-muted rounded-lg hover:bg-border transition-colors cursor-pointer whitespace-nowrap">
              <User className="w-3.5 h-3.5" />
              <span className="text-[0.7rem]">{customerName || L('customer')}</span>
            </button>
            <button onClick={() => setShowTables(true)} className="flex items-center gap-1.5 py-1.5 px-3 bg-muted rounded-lg hover:bg-border transition-colors cursor-pointer whitespace-nowrap">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[0.7rem]">{selectedTable ? `${L('table')} #${selectedTable}` : L('tables')}</span>
            </button>
            <button onClick={() => setShowDiscount(true)} className="flex items-center gap-1.5 py-1.5 px-3 bg-muted rounded-lg hover:bg-border transition-colors cursor-pointer whitespace-nowrap relative">
              <Percent className="w-3.5 h-3.5" />
              <span className="text-[0.7rem]">{L('discount')}</span>
              {discount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[0.55rem] rounded-full flex items-center justify-center">{discountType === 'percent' ? `${discount}%` : ''}</span>}
            </button>
          </div>
        </div>
      )}

      {/* Order Footer */}
      {orderItems.length > 0 && (
        <div className="p-4 border-t border-border shrink-0">
          <div className="flex gap-2 mb-3">
            <button
              onClick={clearOrder}
              className="flex-1 text-center text-muted-foreground text-[0.8rem] py-2 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              {L('clear.all')}
            </button>
            <button
              onClick={holdOrder}
              className="flex items-center justify-center gap-1.5 px-4 py-2 border border-amber-300 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer text-[0.8rem]"
            >
              <Pause className="w-3.5 h-3.5" />
              {L('hold')}
            </button>
          </div>

          {/* Hybrid Phase Navigation — Dine ↔ Parcel toggle */}
          {isHybrid && (
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setHybridPhase('dine')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all cursor-pointer text-[0.78rem] ${
                  hybridPhase === 'dine'
                    ? 'bg-blue-500 text-white'
                    : 'border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                {L('dine.in')} ({dineItems.reduce((s, i) => s + i.quantity, 0)})
              </button>
              <button
                onClick={() => setHybridPhase('parcel')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all cursor-pointer text-[0.78rem] ${
                  hybridPhase === 'parcel'
                    ? 'bg-green-500 text-white'
                    : 'border border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {L('mark.takeaway')} ({parcelItems.reduce((s, i) => s + i.quantity, 0)})
              </button>
            </div>
          )}

          <div className="space-y-1.5 text-[0.85rem]">
            <div className="flex justify-between text-muted-foreground">
              <span>{L('subtotal')} ({orderItems.reduce((s, i) => s + i.quantity, 0)} {L('items')})</span>
              <span>{lang === 'ta' ? 'ரூ' : 'Rs'}.{subtotal}</span>
            </div>
            {isHybrid && (
              <div className="flex justify-between text-[0.8rem]">
                <span className="flex items-center gap-1 text-blue-500"><UtensilsCrossed className="w-3 h-3" /> {dineItems.reduce((s, i) => s + i.quantity, 0)} {L('dine.in')}</span>
                <span className="flex items-center gap-1 text-green-500"><ShoppingBag className="w-3 h-3" /> {parcelItems.reduce((s, i) => s + i.quantity, 0)} {L('mark.takeaway')}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-accent">
                <span>{L('discount')} {discountType === 'percent' ? `(${discount}%)` : ''}</span>
                <span>-{lang === 'ta' ? 'ரூ' : 'Rs'}.{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>{L('tax')} (5%)</span>
              <span>{lang === 'ta' ? 'ரூ' : 'Rs'}.{tax}</span>
            </div>
            <div className="flex justify-between text-foreground pt-2 border-t border-border">
              <span>{L('total')}</span>
              <span className="text-[1.3rem] font-bold">{lang === 'ta' ? 'ரூ' : 'Rs'}. {total}</span>
            </div>
          </div>
          <button
            onClick={openPaymentModal}
            className="w-full py-3 rounded-xl mt-4 transition-all cursor-pointer bg-primary text-primary-foreground hover:brightness-110"
          >
            {L('process.txn')}
          </button>
        </div>
      )}
    </>
  );

  const currencyPrefix = lang === 'ta' ? 'ரூ' : 'Rs';

  const openPaymentModal = () => {
    setPaymentStep('select');
    setSelectedPaymentMethod('');
    setCashReceived(0);
    setShowPayment(true);
  };

  const closePaymentModal = () => {
    setShowPayment(false);
    setPaymentStep('select');
    setSelectedPaymentMethod('');
    setCashReceived(0);
    setQrDataUrl('');
    setQrOrderRef('');
  };

  const generateUpiQr = useCallback(async (amount: number, orderRef: string) => {
    const storeSettings = getSettings();
    const upiId = storeSettings.upiId;
    const payeeName = storeSettings.upiDisplayName;
    const tableInfo = selectedTable ? `Table${selectedTable}` : 'TakeAway';
    const txnNote = `${orderRef}_${tableInfo}`;
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
    
    try {
      const dataUrl = await QRCode.toDataURL(upiUrl, {
        width: 220,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('QR generation failed:', err);
      toast.error('Failed to generate QR code');
    }
  }, [selectedTable]);

  const selectPaymentMethod = (method: string) => {
    setSelectedPaymentMethod(method);
    if (method === 'Cash') {
      setCashReceived(0);
      setPaymentStep('cash');
    } else if (method === 'QR Code') {
      const ref = `ORD-${orderCounter.current}`;
      setQrOrderRef(ref);
      setQrDataUrl('');
      setPaymentStep('qr');
      generateUpiQr(total, ref);
    } else {
      setPaymentStep('confirm');
    }
  };

  const cashChange = cashReceived > 0 ? cashReceived - total : 0;

  const paymentMethods = [
    { label: 'Cash', tamilLabel: 'பணம்', icon: Banknote, color: 'bg-green-50 text-green-600 border-green-200', activeBg: 'bg-green-100' },
    { label: 'Card', tamilLabel: 'கார்டு', icon: CreditCard, color: 'bg-blue-50 text-blue-600 border-blue-200', activeBg: 'bg-blue-100' },
    { label: 'UPI', tamilLabel: 'UPI', icon: Smartphone, color: 'bg-purple-50 text-purple-600 border-purple-200', activeBg: 'bg-purple-100' },
    { label: 'QR Code', tamilLabel: 'QR கோடு', icon: QrCode, color: 'bg-orange-50 text-orange-600 border-orange-200', activeBg: 'bg-orange-100' },
  ];

  const getMethodInfo = (label: string) => paymentMethods.find(m => m.label === label);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="bg-white border-b border-[#e2e8f0] px-4 py-3 flex items-center shrink-0 relative">
        <button onClick={() => navigate('/login')} className="text-[#64748b] hover:text-[#2e3a59] transition-colors cursor-pointer mr-3">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col min-w-0">
          <span className="text-[#2e3a59] hidden sm:inline font-bold text-[20px] leading-[30px]">{L('app.title')}</span>
          <span className="text-[#64748b] hidden sm:inline text-[14px] leading-[17.5px]">
            {formatDate(currentTime)} · {formatTime(currentTime)}
          </span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 w-[320px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
            <input
              type="text"
              placeholder={L('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f1f5f9] rounded-[14px] border-none outline-none text-[16px] text-[#2e3a59] placeholder:text-[rgba(46,58,89,0.5)]"
            />
          </div>
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={() => setShowTables(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#f1f5f9] text-[#2e3a59] rounded-[10px] hover:bg-[#e2e8f0] transition-colors text-[12.8px] cursor-pointer">
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">{L('tables')}</span>
          </button>
          <button onClick={() => setShowOrderHistory(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#f1f5f9] text-[#2e3a59] rounded-[10px] hover:bg-[#e2e8f0] transition-colors text-[12.8px] cursor-pointer relative">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">{L('history')}</span>
            {completedOrders.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[0.55rem] rounded-full flex items-center justify-center">{completedOrders.length}</span>}
          </button>
          {heldOrders.length > 0 && (
            <button onClick={() => setShowHeldOrders(true)} className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-[10px] hover:bg-primary/20 transition-colors text-[12.8px] cursor-pointer">
              <Pause className="w-4 h-4" />
              <span className="hidden sm:inline">{heldOrders.length} {L('held')}</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Category Sidebar */}
        <aside className="w-[72px] lg:w-[80px] bg-white border-r border-border flex flex-col py-2 shrink-0">
          <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon] || Grid3X3;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all text-[0.7rem] cursor-pointer ${
                    isActive ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-center leading-tight">{CN(cat.name)}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-auto pt-2 border-t border-border px-2">
            <UserBadge compact />
          </div>
        </aside>

        {/* Menu Grid */}
        <main className="flex-1 p-4 overflow-y-auto lg:pb-4 pb-20">
          {/* Hybrid mode banner */}
          {isHybrid && (
            <motion.div
              key={hybridPhase}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-3 py-2 px-4 rounded-xl text-center text-[0.8rem] flex items-center justify-center gap-2 ${
                hybridPhase === 'dine'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-green-50 text-green-600 border border-green-200'
              }`}
            >
              {hybridPhase === 'dine' ? <UtensilsCrossed className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
              {hybridPhase === 'dine' ? L('hybrid.step1') : L('hybrid.step2')}
            </motion.div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);
              return (
                <motion.div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  onMouseDown={() => startLongPress(item)}
                  onMouseUp={cancelLongPress}
                  onMouseLeave={cancelLongPress}
                  onTouchStart={() => startLongPress(item)}
                  onTouchEnd={cancelLongPress}
                  onContextMenu={(e) => e.preventDefault()}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  role="button"
                  tabIndex={0}
                  className={`bg-white relative rounded-[14px] cursor-pointer text-left select-none ${
                    qty > 0 ? '' : ''
                  }`}
                >
                  <div className="flex flex-col items-start overflow-clip pt-[6px] px-px pb-px rounded-[inherit]">
                    <div className="flex flex-col items-center justify-center overflow-clip w-full relative" style={{ height: 188 }}>
                      <div className="h-[188px] pointer-events-none relative rounded-[8px] shrink-0 w-[calc(100%-2px)]">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0 max-w-none object-cover rounded-[8px] size-full"
                        />
                        <div aria-hidden="true" className="absolute border border-[#ededed] border-solid inset-0 rounded-[8px]" />
                      </div>
                      <AnimatePresence>
                        {qty > 0 && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            className={`absolute top-1 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-[0.75rem] z-10 shadow-sm ${
                              orderType === 'Dine + Take Away'
                                ? hybridPhase === 'dine' ? 'bg-[#3b82f6]'
                                  : 'bg-[#22c55e]'
                                : orderType === 'Take Away' ? 'bg-[#22c55e]'
                                : 'bg-[#3b82f6]'
                            }`}
                          >
                            {qty}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="flex flex-col gap-[4px] items-start pt-[10px] px-[10px] pb-[10px] w-full">
                      <p className="font-['Inter',sans-serif] font-bold leading-[27px] text-[#2e3a59] text-[18px] truncate w-full">{MN(item.name)}</p>
                      {lang === 'ta' && (
                        <p className="text-muted-foreground text-[0.65rem] truncate w-full">{item.name}</p>
                      )}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-[4px]">
                          <p className="font-['Inter',sans-serif] font-medium leading-[20.4px] text-[#ff6b35] text-[13.6px]">Rs.{item.price}</p>
                          {qty > 0 && (
                            <span className="text-[#888] text-[12px] font-medium leading-[18px]">x {qty}</span>
                          )}
                        </div>
                        {qty > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const isParcelPhase = orderType === 'Dine + Take Away' && hybridPhase === 'parcel';
                              const isDinePhase = orderType === 'Dine + Take Away' && hybridPhase === 'dine';
                              setOrderItems((prev) => {
                                if (orderType === 'Dine + Take Away') {
                                  return prev.filter((o) => !(o.menuItem.id === item.id && (isDinePhase ? !o.isTakeAway : !!o.isTakeAway)));
                                }
                                return prev.filter((o) => o.menuItem.id !== item.id);
                              });
                              const phaseLabel = isDinePhase ? ' (Dine)' : isParcelPhase ? ' (Parcel)' : '';
                              toast.success(`${item.name}${phaseLabel} removed`);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            className="bg-[#f1f5f9] rounded-full p-[7px] flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer z-10"
                          >
                            <Trash2 className="w-[14px] h-[14px] text-[#EF4444]/80" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[14px] transition-all ${
                    qty > 0
                      ? orderType === 'Dine + Take Away'
                        ? hybridPhase === 'dine' ? 'border-[#3b82f6] shadow-[0px_0px_0px_2px_rgba(59,130,246,0.3)]'
                          : 'border-[#22c55e] shadow-[0px_0px_0px_2px_rgba(34,197,94,0.3)]'
                        : orderType === 'Take Away' ? 'border-[#22c55e] shadow-[0px_0px_0px_2px_rgba(34,197,94,0.3)]'
                        : 'border-[#3b82f6] shadow-[0px_0px_0px_2px_rgba(59,130,246,0.3)]'
                      : 'border-[#e2e8f0]'
                  }`} />
                  {/* Long press progress overlay */}
                  <AnimatePresence>
                    {pressingItemId === item.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 rounded-[14px] pointer-events-none z-10 overflow-hidden"
                      >
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.5, ease: 'linear' }}
                          className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#ff6b35] origin-left rounded-b-[14px]"
                        />
                        <div className="absolute inset-0 bg-[#ff6b35]/5 rounded-[14px]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </main>

        {/* Order Panel - Desktop only (>=1024px) */}
        <aside className="w-80 lg:w-96 bg-white border-l border-border flex-col shrink-0 hidden lg:flex overflow-hidden">
          {orderPanelContent()}
        </aside>
      </div>

      {/* Tablet/Mobile Bottom Bar (visible <1024px when items exist) */}
      {orderItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30">
          {/* Tablet layout (768-1024): Figma-style bottom bar */}
          <div className="hidden md:flex items-center gap-3 bg-white border-t border-border px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            {/* Total Items pill */}
            <div className="flex items-center gap-2 bg-[#f1f5f9] rounded-full px-4 py-2 shrink-0">
              <span className="text-[#2e3a59] text-[14px]">{L('total.items')}: <span className="font-bold">{orderItems.reduce((s, i) => s + i.quantity, 0)}</span></span>
            </div>

            {/* Center: Order Type tabs OR Hybrid Phase switcher */}
            <div className="flex-1 flex justify-center">
              <AnimatePresence mode="wait">
                {isHybrid ? (
                  <motion.div
                    key="hybrid-phase-tabs"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <button
                      onClick={() => {
                        setOrderType('Dine In');
                        setHybridPhase('dine');
                        setOrderItems(prev => prev.map(o => ({ ...o, isTakeAway: undefined })));
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] transition-colors cursor-pointer shrink-0"
                      title={lang === 'ta' ? 'பின் செல்' : 'Back to order types'}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex bg-[#f1f5f9] rounded-full p-1 gap-0.5">
                      <button
                        onClick={() => setHybridPhase('dine')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] transition-all cursor-pointer whitespace-nowrap ${
                          hybridPhase === 'dine'
                            ? 'bg-blue-500 text-white shadow-sm font-medium'
                            : 'text-[#64748b] hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        {L('dine.in')}
                        {dineItems.length > 0 && (
                          <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold ${
                            hybridPhase === 'dine' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {dineItems.reduce((s, i) => s + i.quantity, 0)}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setHybridPhase('parcel')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] transition-all cursor-pointer whitespace-nowrap ${
                          hybridPhase === 'parcel'
                            ? 'bg-green-500 text-white shadow-sm font-medium'
                            : 'text-[#64748b] hover:text-green-600 hover:bg-green-50'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {L('mark.takeaway')}
                        {parcelItems.length > 0 && (
                          <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold ${
                            hybridPhase === 'parcel' ? 'bg-white/25 text-white' : 'bg-green-100 text-green-600'
                          }`}>
                            {parcelItems.reduce((s, i) => s + i.quantity, 0)}
                          </span>
                        )}
                      </button>
                      
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="order-type-tabs"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex bg-[#f1f5f9] rounded-full p-1 gap-0.5"
                  >
                    {(['Dine In', 'Take Away', 'Dine + Take Away'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setOrderType(type);
                          if (type === 'Dine + Take Away') {
                            setHybridPhase('dine');
                            setOrderItems(prev => prev.map(o => ({ ...o, isTakeAway: undefined })));
                          } else {
                            setHybridPhase('dine');
                            setOrderItems(prev => prev.map(o => ({ ...o, isTakeAway: undefined })));
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-[13px] transition-all cursor-pointer whitespace-nowrap ${
                          orderType === type
                            ? 'bg-white shadow-sm text-[#2e3a59] font-medium'
                            : 'text-[#64748b] hover:text-[#2e3a59]'
                        }`}
                      >
                        {type === 'Dine In' ? L('dine.in') : type === 'Take Away' ? L('take.away') : L('dine.take.away')}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View Order button */}
            <button
              onClick={() => setShowMobileOrder(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full transition-all cursor-pointer shrink-0 shadow-md bg-accent text-white hover:brightness-110"
            >
              <span className="text-[14px] font-medium">{L('view.order')}</span>
            </button>
          </div>
          {/* Mobile layout (<768px): compact bar */}
          <div className="md:hidden bg-white border-t border-border p-4">
            <button
              onClick={() => setShowMobileOrder(true)}
              className="w-full bg-accent text-white py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{orderItems.reduce((s, i) => s + i.quantity, 0)} {L('items')}</span>
              <span>|</span>
              <span>{currencyPrefix}. {total}</span>
              <span>- {L('view.order')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile/Tablet Order Modal (visible <1024px) */}
      {showMobileOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col lg:hidden">
          <button onClick={() => setShowMobileOrder(false)} className="p-4 text-white self-end cursor-pointer">
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1 bg-white rounded-t-2xl flex flex-col overflow-hidden">
            {orderPanelContent()}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => closePaymentModal()}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-foreground text-center">{L('payment')}</h3>
              <button onClick={() => closePaymentModal()} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {customerName && <p className="text-center text-muted-foreground text-[0.8rem] mb-1">{customerName}</p>}
            {selectedTable && <p className="text-center text-muted-foreground text-[0.8rem] mb-1">{L('table')} #{selectedTable} | {orderType === 'Dine In' ? L('dine.in') : orderType === 'Take Away' ? L('take.away') : L('dine.take.away')}</p>}
            <p className="text-center text-[1.5rem] text-foreground mb-2 font-bold text-[36px]">{currencyPrefix}. {total}</p>
            {discountAmount > 0 && <p className="text-center text-accent text-[0.8rem] mb-4">{L('discount')}: {currencyPrefix}.{discountAmount}</p>}

            {paymentStep === 'select' && (
              <div className="grid grid-cols-2 gap-3 p-[0px] mx-[0px] mt-[24px] mb-[0px]">
                {paymentMethods.map((method) => (
                  <button
                    key={method.label}
                    onClick={() => selectPaymentMethod(method.label)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${method.color} hover:shadow-md transition-all cursor-pointer`}
                  >
                    <method.icon className="w-6 h-6" />
                    <span className="text-[0.85rem]">{lang === 'ta' ? method.tamilLabel : method.label}</span>
                  </button>
                ))}
              </div>
            )}

            {paymentStep === 'confirm' && (() => {
              const methodInfo = getMethodInfo(selectedPaymentMethod);
              const MethodIcon = methodInfo?.icon || CreditCard;
              return (
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2 mb-5">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${methodInfo?.color || ''}`}>
                      <MethodIcon className="w-5 h-5" />
                      <span className="text-[0.9rem]">{lang === 'ta' ? methodInfo?.tamilLabel : selectedPaymentMethod}</span>
                    </div>
                  </div>

                  <div className="text-center mb-5">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                      <MethodIcon className="w-8 h-8 text-muted-foreground animate-pulse" />
                    </div>
                    <p className="text-[0.85rem] text-foreground">{L('waiting.for.payment')}</p>
                    <p className="text-[0.75rem] text-muted-foreground mt-1">{L('tap.to.confirm')}</p>
                  </div>

                  <div className="bg-muted rounded-xl p-3 mb-5 text-[0.8rem] space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">{L('subtotal')}</span><span>{currencyPrefix}.{subtotal}</span></div>
                    {discountAmount > 0 && <div className="flex justify-between text-accent"><span>{L('discount')}</span><span>-{currencyPrefix}.{discountAmount}</span></div>}
                    <div className="flex justify-between"><span className="text-muted-foreground">{L('tax')} (5%)</span><span>{currencyPrefix}.{tax}</span></div>
                    <div className="flex justify-between pt-1.5 border-t border-border"><span className="text-foreground">{L('total')}</span><span className="text-foreground font-bold">{currencyPrefix}.{total}</span></div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentStep('select')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-white border border-border rounded-xl text-[0.85rem] hover:bg-muted transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {L('back')}
                    </button>
                    <button
                      onClick={() => processPayment(selectedPaymentMethod)}
                      className="flex-[2] flex items-center justify-center gap-1.5 bg-accent text-white py-3 rounded-xl hover:brightness-110 transition-all cursor-pointer text-[0.85rem]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {L('confirm.and.print')}
                    </button>
                  </div>
                </div>
              );
            })()}

            {paymentStep === 'cash' && (() => {
              return (
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-green-50 text-green-600 border-green-200">
                      <Banknote className="w-5 h-5" />
                      <span className="text-[0.9rem]">{lang === 'ta' ? 'பணம்' : 'Cash'}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-[0.75rem] text-muted-foreground mb-1.5 block">{L('cash.received')}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[0.9rem]">{currencyPrefix}.</span>
                      <input
                        type="number"
                        value={cashReceived || ''}
                        onChange={(e) => setCashReceived(Math.max(0, Number(e.target.value)))}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-[1.1rem] text-center focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300"
                        placeholder={L('enter.amount')}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[100, 200, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setCashReceived(amt)}
                        className={`py-2 rounded-lg text-[0.8rem] border transition-all cursor-pointer ${
                          cashReceived === amt
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-muted border-border hover:bg-border'
                        }`}
                      >
                        {currencyPrefix}.{amt}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCashReceived(total)}
                    className={`w-full py-2 rounded-lg text-[0.8rem] border transition-all cursor-pointer mb-4 ${
                      cashReceived === total
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-muted border-border hover:bg-border'
                    }`}
                  >
                    {L('exact.amount')} — {currencyPrefix}.{total}
                  </button>

                  {cashReceived > 0 && (
                    <div className={`rounded-xl p-3 mb-4 text-center ${
                      cashReceived >= total
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      {cashReceived >= total ? (
                        <>
                          <p className="text-[0.75rem] text-green-600 mb-0.5">{L('change.due')}</p>
                          <p className="text-[1.4rem] text-green-700 font-bold">{currencyPrefix}. {cashReceived - total}</p>
                        </>
                      ) : (
                        <p className="text-[0.85rem] text-red-600">{L('insufficient.amount')}</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentStep('select')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-white border border-border rounded-xl text-[0.85rem] hover:bg-muted transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {L('back')}
                    </button>
                    <button
                      onClick={() => processPayment('Cash')}
                      disabled={cashReceived > 0 && cashReceived < total}
                      className="flex-[2] flex items-center justify-center gap-1.5 bg-green-600 text-white py-3 rounded-xl hover:brightness-110 transition-all cursor-pointer text-[0.85rem] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {cashReceived > 0 ? L('confirm.and.print') : L('collected')}
                    </button>
                  </div>
                </div>
              );
            })()}

            {paymentStep === 'qr' && (() => {
              return (
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-orange-50 text-orange-600 border-orange-200">
                      <QrCode className="w-5 h-5" />
                      <span className="text-[0.9rem]">{lang === 'ta' ? 'QR கோடு' : 'QR Code'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center mb-4">
                    {qrDataUrl ? (
                      <div className="bg-white border-2 border-orange-200 rounded-2xl p-4 shadow-sm">
                        <img src={qrDataUrl} alt="UPI QR Code" className="w-[220px] h-[220px]" />
                      </div>
                    ) : (
                      <div className="w-[220px] h-[220px] bg-muted rounded-2xl flex items-center justify-center border-2 border-dashed border-orange-200">
                        <div className="text-center">
                          <QrCode className="w-10 h-10 text-orange-300 mx-auto animate-pulse" />
                          <p className="text-[0.75rem] text-muted-foreground mt-2">{L('qr.generating')}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-[0.9rem] text-foreground mb-1">{L('qr.scan.to.pay')}</p>
                    <p className="text-[0.75rem] text-muted-foreground">{L('qr.scan.instruction')}</p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 space-y-1.5 text-[0.8rem]">
                    <div className="flex justify-between">
                      <span className="text-orange-600">{L('qr.payment.to')}</span>
                      <span className="text-foreground">{getSettings().upiDisplayName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-600">UPI ID</span>
                      <span className="text-foreground font-mono text-[0.75rem]">{getSettings().upiId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-600">{L('qr.order.ref')}</span>
                      <span className="text-foreground font-mono text-[0.75rem]">{qrOrderRef}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-orange-200">
                      <span className="text-orange-700">{L('total')}</span>
                      <span className="text-orange-700 font-bold">{currencyPrefix}.{total}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-center mb-4">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                    <p className="text-[0.75rem] text-orange-600">{L('qr.amount.prefilled')}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentStep('select')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-white border border-border rounded-xl text-[0.85rem] hover:bg-muted transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {L('back')}
                    </button>
                    <button
                      onClick={() => processPayment('QR Code')}
                      className="flex-[2] flex items-center justify-center gap-1.5 bg-orange-500 text-white py-3 rounded-xl hover:brightness-110 transition-all cursor-pointer text-[0.85rem]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {L('qr.payment.received')}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Tables Modal */}
      {showTables && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTables(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground">{L('select.table')}</h3>
              <button onClick={() => setShowTables(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {tablesData.map((table) => (
                <button
                  key={table.id}
                  onClick={() => {
                    if (table.status === 'available' || table.status === 'held') {
                      selectTable(table.id);
                    } else if (table.status === 'occupied') {
                      freeTable(table.id);
                    }
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedTable === table.id
                      ? 'bg-primary text-white border-primary'
                      : table.status === 'available'
                      ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                      : table.status === 'occupied'
                      ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                      : table.status === 'held'
                      ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-600'
                  }`}
                >
                  <p className="text-[0.85rem]">T{table.id}</p>
                  <p className="text-[0.65rem] mt-0.5">{table.seats} {L('seats')}</p>
                  <p className="text-[0.6rem] mt-0.5 capitalize">{statusText(table.status)}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-[0.7rem] text-muted-foreground justify-center flex-wrap">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200" /> {L('available')}</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200" /> {L('occupied')}</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200" /> {L('held')}</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-200" /> {L('reserved')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCustomer(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground">{L('customer.details')}</h3>
              <button onClick={() => setShowCustomer(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[0.75rem] text-muted-foreground mb-1 block">{L('customer.name')}</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder={L('enter.customer')}
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowCustomer(false)}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-[0.85rem] hover:brightness-110 transition-all cursor-pointer"
              >
                {L('save')}
              </button>
              <button
                onClick={() => { setCustomerName(''); setShowCustomer(false); }}
                className="flex-1 px-4 py-2.5 bg-white border border-border rounded-lg text-[0.85rem] hover:bg-muted transition-all cursor-pointer"
              >
                {L('clear')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscount && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDiscount(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground">{L('apply.discount')}</h3>
              <button onClick={() => setShowDiscount(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-1 bg-muted rounded-lg p-1 mb-4">
              {(['percent', 'flat'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => { setDiscountType(type); setDiscount(0); }}
                  className={`flex-1 py-2 rounded-md text-[0.85rem] transition-all cursor-pointer ${
                    discountType === type ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {type === 'percent' ? L('percentage') : L('flat.amount')}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-[0.75rem] text-muted-foreground mb-1 block">
                {discountType === 'percent' ? L('discount.pct') : L('discount.amt')}
              </label>
              <input
                type="number"
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={discountType === 'percent' ? '10' : '50'}
                max={discountType === 'percent' ? 100 : subtotal}
                autoFocus
              />
            </div>

            {/* Quick discount buttons */}
            {discountType === 'percent' && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDiscount(pct)}
                    className={`py-2 rounded-lg text-[0.85rem] border transition-all cursor-pointer ${
                      discount === pct ? 'bg-primary text-white border-primary' : 'bg-muted border-border hover:bg-border'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            )}

            {subtotal > 0 && discount > 0 && (
              <div className="bg-muted rounded-lg p-3 mb-4 text-[0.85rem]">
                <div className="flex justify-between"><span className="text-muted-foreground">{L('subtotal')}</span><span>{currencyPrefix}.{subtotal}</span></div>
                <div className="flex justify-between text-accent"><span>{L('discount')}</span><span>-{currencyPrefix}.{discountType === 'percent' ? Math.round(subtotal * discount / 100) : discount}</span></div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowDiscount(false)}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-[0.85rem] hover:brightness-110 transition-all cursor-pointer"
              >
                {L('apply')}
              </button>
              <button
                onClick={() => { setDiscount(0); setShowDiscount(false); }}
                className="flex-1 px-4 py-2.5 bg-white border border-border rounded-lg text-[0.85rem] hover:bg-muted transition-all cursor-pointer"
              >
                {L('remove')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastReceipt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReceipt(false)}>
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="bg-white rounded-2xl w-full max-w-[340px] max-h-[88vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-4">
              {/* Header */}
              <div className="text-center pb-2.5 mb-2 border-b border-dashed border-[#ccc]">
                <p className="text-[#2e3a59] tracking-tight text-[20px] font-bold">{L('restaurant.name')}</p>
                <p className="text-[#888] text-[0.6rem] leading-tight mt-0.5">123, MG Road, Chennai · GSTIN: 33AABCU9603R1ZM</p>
              </div>

              {/* Meta — 2-column compact */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[0.7rem] mb-2">
                <span className="text-[#888]">{lastReceipt.order_id}</span>
                <span className="text-right text-[#888]">{lastReceipt.timestamp.toLocaleDateString()} {lastReceipt.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-[#2e3a59]">{lastReceipt.customer_name}{lastReceipt.table_number ? ` · T#${lastReceipt.table_number}` : ''}</span>
                <span className="text-right text-[#2e3a59]">{lastReceipt.order_type === 'Dine In' ? L('dine.in') : lastReceipt.order_type === 'Take Away' ? L('take.away') : L('dine.take.away')} · {lastReceipt.payment_method}</span>
              </div>

              {/* Items */}
              <div className="border-t border-dashed border-[#ccc] pt-2 mb-2">
                {lastReceipt.order_type === 'Dine + Take Away' ? (
                  <>
                    {lastReceipt.items.filter(i => !i.isTakeAway).length > 0 && (
                      <>
                        <div className="flex items-center gap-1 mb-1">
                          <UtensilsCrossed className="w-2.5 h-2.5 text-blue-400" />
                          <span className="text-[0.6rem] text-blue-500 uppercase tracking-wider">{L('hybrid.dine.section')}</span>
                        </div>
                        {lastReceipt.items.filter(i => !i.isTakeAway).map((item) => (
                          <div key={`d-${item.menuItem.id}`} className="flex items-baseline justify-between text-[0.75rem] leading-snug mb-0.5">
                            <span className="text-[#2e3a59] flex-1 truncate mr-2">{MN(item.menuItem.name)}</span>
                            <span className="text-[#888] tabular-nums whitespace-nowrap">{item.quantity}×{item.menuItem.price}</span>
                            <span className="text-[#2e3a59] tabular-nums w-[52px] text-right">{currencyPrefix}.{item.quantity * item.menuItem.price}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {lastReceipt.items.filter(i => i.isTakeAway).length > 0 && (
                      <div className={lastReceipt.items.filter(i => !i.isTakeAway).length > 0 ? 'mt-1.5' : ''}>
                        <div className="flex items-center gap-1 mb-1">
                          <ShoppingBag className="w-2.5 h-2.5 text-orange-400" />
                          <span className="text-[0.6rem] text-orange-500 uppercase tracking-wider">{L('hybrid.parcel.section')}</span>
                        </div>
                        {lastReceipt.items.filter(i => i.isTakeAway).map((item) => (
                          <div key={`p-${item.menuItem.id}`} className="flex items-baseline justify-between text-[0.75rem] leading-snug mb-0.5">
                            <span className="text-[#2e3a59] flex-1 truncate mr-2">{MN(item.menuItem.name)} <span className="text-[0.5rem] text-orange-400">📦</span></span>
                            <span className="text-[#888] tabular-nums whitespace-nowrap">{item.quantity}×{item.menuItem.price}</span>
                            <span className="text-[#2e3a59] tabular-nums w-[52px] text-right">{currencyPrefix}.{item.quantity * item.menuItem.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  lastReceipt.items.map((item) => (
                    <div key={item.menuItem.id} className="flex items-baseline justify-between text-[0.75rem] leading-snug mb-0.5">
                      <span className="text-[#2e3a59] flex-1 truncate mr-2">{MN(item.menuItem.name)}</span>
                      <span className="text-[#888] tabular-nums whitespace-nowrap">{item.quantity}×{item.menuItem.price}</span>
                      <span className="text-[#2e3a59] tabular-nums w-[52px] text-right">{currencyPrefix}.{item.quantity * item.menuItem.price}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-[#ccc] pt-2 text-[0.72rem] space-y-0.5">
                <div className="flex justify-between text-[#888]"><span>{L('subtotal')}</span><span className="tabular-nums">{currencyPrefix}.{lastReceipt.subtotal}</span></div>
                {lastReceipt.discount > 0 && (
                  <div className="flex justify-between text-accent"><span>{L('discount')}</span><span className="tabular-nums">-{currencyPrefix}.{lastReceipt.discount}</span></div>
                )}
                <div className="flex justify-between text-[#888]"><span>CGST 2.5% + SGST 2.5%</span><span className="tabular-nums">{currencyPrefix}.{lastReceipt.tax}</span></div>
                <div className="flex justify-between items-baseline text-[#2e3a59] pt-1.5 mt-1 border-t border-[#2e3a59]">
                  <span className="text-[0.8rem]">{L('grand.total')}</span>
                  <span className="text-[1.15rem] font-bold tabular-nums">{currencyPrefix}.{lastReceipt.total_price}</span>
                </div>
              </div>

              <p className="text-center text-[#aaa] text-[0.6rem] mt-2.5">{L('thank.you')}</p>
            </div>

            {/* Buttons */}
            <div className="px-5 pb-4 pt-1 flex flex-col gap-1.5">
              <div className="flex gap-1.5">
                <button
                  onClick={() => { toast.success(L('toast.print')); setShowReceipt(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#2e3a59] text-white rounded-xl text-[0.8rem] hover:bg-[#1e2a45] transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> {L('print')}
                </button>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 py-2.5 bg-white border border-[#ddd] rounded-xl text-[0.8rem] text-[#888] hover:bg-[#f7f7f7] transition-all cursor-pointer"
                >
                  {L('close')}
                </button>
              </div>
              {lastReceipt.order_type === 'Dine + Take Away' && lastReceipt.items.some(i => i.isTakeAway) && (
                <button
                  onClick={() => { setShowReceipt(false); setShowParcelSlip(true); }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-orange-500 text-white rounded-xl text-[0.8rem] hover:bg-orange-600 transition-all cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5" /> {L('print.parcel.slip')}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Parcel Slip Modal */}
      {showParcelSlip && lastReceipt && (() => {
        const pItems = lastReceipt.items.filter(i => i.isTakeAway);
        const pTotal = pItems.reduce((s, i) => s + i.menuItem.price * i.quantity, 0);
        const pQty = pItems.reduce((s, i) => s + i.quantity, 0);
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowParcelSlip(false)}>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="bg-white rounded-2xl w-full max-w-[320px] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Orange accent top bar */}
              <div className="h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400" />

              <div className="px-5 pt-4 pb-3">
                {/* Compact header row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-600 text-[0.8rem] uppercase tracking-wider">{L('parcel.slip')}</span>
                  </div>
                  <span className="text-[#888] text-[0.65rem]">{lastReceipt.order_id}</span>
                </div>

                {/* Meta inline */}
                <div className="flex items-center justify-between text-[0.68rem] text-[#888] mb-2 pb-2 border-b border-dashed border-orange-200">
                  <span>{lastReceipt.customer_name}{lastReceipt.table_number ? ` · T#${lastReceipt.table_number}` : ''}</span>
                  <span>{lastReceipt.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Item list — ultra compact */}
                <div className="mb-2">
                  {pItems.map((item, idx) => (
                    <div key={item.menuItem.id} className="flex items-center gap-2 py-1.5 border-b border-orange-50 last:border-0">
                      <span className="w-[18px] h-[18px] rounded-[4px] bg-orange-100 text-orange-600 text-[0.6rem] flex items-center justify-center shrink-0">{idx + 1}</span>
                      <span className="text-[#2e3a59] text-[0.78rem] flex-1 truncate">{MN(item.menuItem.name)}</span>
                      <span className="text-[#2e3a59] text-[0.78rem] tabular-nums shrink-0">×{item.quantity}</span>
                      <span className="text-[#888] text-[0.7rem] tabular-nums w-[48px] text-right">{currencyPrefix}.{item.menuItem.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Totals bar */}
                <div className="flex items-baseline justify-between bg-orange-50 -mx-5 px-5 py-2">
                  <span className="text-orange-600 text-[0.72rem]">{pQty} {L('items')}</span>
                  <span className="text-orange-700 text-[1rem] font-bold tabular-nums">{currencyPrefix}.{pTotal}</span>
                </div>

                {/* Bill reference line */}
                <p className="text-center text-[#aaa] text-[0.58rem] mt-2 mb-1">
                  {lang === 'ta' ? 'பில்' : 'Bill'} {lastReceipt.order_id} · {L('grand.total')} {currencyPrefix}.{lastReceipt.total_price}
                </p>
              </div>

              {/* Buttons */}
              <div className="px-5 pb-4 flex gap-1.5">
                <button
                  onClick={() => { toast.success(L('toast.parcel.slip')); setShowParcelSlip(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-orange-500 text-white rounded-xl text-[0.8rem] hover:bg-orange-600 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> {L('print')}
                </button>
                <button
                  onClick={() => setShowParcelSlip(false)}
                  className="flex-1 py-2.5 bg-white border border-[#ddd] rounded-xl text-[0.8rem] text-[#888] hover:bg-[#f7f7f7] transition-all cursor-pointer"
                >
                  {L('close')}
                </button>
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* Held Orders Modal */}
      {showHeldOrders && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowHeldOrders(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground">{L('held.orders')} ({heldOrders.length})</h3>
              <button onClick={() => setShowHeldOrders(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {heldOrders.length === 0 ? (
              <div className="text-center py-8">
                <Pause className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground text-[0.85rem]">{L('no.held')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {heldOrders.map((held) => (
                  <div key={held.id} className="border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-foreground text-[0.9rem]">{held.name}</p>
                        <p className="text-muted-foreground text-[0.7rem]">{held.order_type === 'Dine In' ? L('dine.in') : held.order_type === 'Take Away' ? L('take.away') : L('dine.take.away')} | {held.timestamp.toLocaleTimeString()}</p>
                      </div>
                      <span className="text-[0.7rem] px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full">{L('held')}</span>
                    </div>
                    <div className="text-[0.8rem] text-muted-foreground mb-3">
                      {held.items.map(i => `${MN(i.menuItem.name)} x${i.quantity}`).join(', ')}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground text-[0.9rem]">
                        {currencyPrefix}.{held.items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => recallHeldOrder(held)}
                          className="px-3 py-1.5 bg-accent text-white rounded-lg text-[0.8rem] hover:brightness-110 cursor-pointer flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> {L('recall')}
                        </button>
                        <button
                          onClick={() => deleteHeldOrder(held.id)}
                          className="px-3 py-1.5 bg-white border border-destructive/30 text-destructive rounded-lg text-[0.8rem] hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order History Modal */}
      {showOrderHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowOrderHistory(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground">{L('order.history')} ({completedOrders.length})</h3>
              <button onClick={() => setShowOrderHistory(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Day Filter Tabs */}
            <div className="flex gap-1 bg-muted rounded-lg p-1 mb-4">
              {([
                { key: 'today' as const, label: 'filter.today' },
                { key: '3days' as const, label: 'filter.3days' },
                { key: '7days' as const, label: 'filter.7days' },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setHistoryFilter(tab.key)}
                  className={`flex-1 py-1.5 rounded-md text-[0.8rem] transition-all cursor-pointer ${
                    historyFilter === tab.key ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {L(tab.label)}
                </button>
              ))}
            </div>

            {(() => {
              const now = new Date();
              const daysMap = { today: 0, '3days': 3, '7days': 7 };
              const days = daysMap[historyFilter];
              const filteredOrders = completedOrders.filter((order) => {
                const orderDate = new Date(order.timestamp);
                if (days === 0) {
                  return orderDate.toDateString() === now.toDateString();
                }
                const cutoff = new Date(now);
                cutoff.setDate(cutoff.getDate() - days);
                cutoff.setHours(0, 0, 0, 0);
                return orderDate >= cutoff;
              });
              const filteredRevenue = filteredOrders.reduce((s, o) => s + o.total_price, 0);

              return filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground text-[0.85rem]">{L('no.orders')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div key={order.order_id} className="border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-foreground text-[0.9rem]">{order.order_id}</p>
                          <p className="text-muted-foreground text-[0.7rem]">
                            {order.customer_name} | {order.order_type === 'Dine In' ? L('dine.in') : L('take.away')}
                            {order.table_number ? ` | T#${order.table_number}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-foreground text-[0.9rem]">{currencyPrefix}.{order.total_price}</p>
                          <p className="text-muted-foreground text-[0.65rem]">{order.payment_method}</p>
                        </div>
                      </div>
                      <div className="text-[0.75rem] text-muted-foreground">
                        {order.items.map(i => `${MN(i.menuItem.name)} x${i.quantity}`).join(', ')}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[0.7rem] text-muted-foreground">
                          {historyFilter !== 'today' && <>{order.timestamp.toLocaleDateString()} · </>}
                          {order.timestamp.toLocaleTimeString()}
                        </span>
                        <button
                          onClick={() => { setLastReceipt(order); setShowOrderHistory(false); setShowReceipt(true); }}
                          className="text-[0.75rem] text-primary hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" /> {L('view.receipt')}
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between text-[0.85rem]">
                      <span className="text-muted-foreground">{L('total.orders')}</span>
                      <span className="text-foreground">{filteredOrders.length}</span>
                    </div>
                    <div className="flex justify-between text-[0.85rem] mt-1">
                      <span className="text-muted-foreground">{L('total.revenue')}</span>
                      <span className="text-foreground">{currencyPrefix}.{filteredRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Long Press Quantity Modal */}
      <AnimatePresence>
      {longPressItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setLongPressItem(null)}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="bg-white rounded-[20px] w-full max-w-[340px] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enlarged Card Image */}
            <div className="relative w-full h-[220px] overflow-hidden rounded-t-[20px]">
              <ImageWithFallback
                src={longPressItem.image}
                alt={longPressItem.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setLongPressItem(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-[20px] font-bold leading-tight">{MN(longPressItem.name)}</p>
                {lang === 'ta' && (
                  <p className="text-white/70 text-[0.75rem]">{longPressItem.name}</p>
                )}
                <p className="text-[#ff6b35] text-[16px] font-medium mt-1">Rs.{longPressItem.price}</p>
              </div>
            </div>

            {/* Manual Quantity Input */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-center gap-4">
                <motion.button
                  onClick={() => setLongPressQty(Math.max(0, longPressQty - 1))}
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-100 cursor-pointer"
                >
                  <Minus className="w-5 h-5" />
                </motion.button>
                <input
                  type="number"
                  value={longPressQty}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    setLongPressQty(isNaN(v) ? 0 : Math.max(0, v));
                  }}
                  className="w-20 h-12 text-center text-[24px] font-bold text-[#2e3a59] border border-[#e2e8f0] rounded-xl outline-none focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <motion.button
                  onClick={() => setLongPressQty(longPressQty + 1)}
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 hover:bg-green-100 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Quick Quantity Buttons */}
            <div className="px-5 pt-2 pb-3">
              <p className="text-muted-foreground text-[0.7rem] mb-2 text-center">{lang === 'ta' ? 'விரைவு அளவு' : 'Quick Quantity'}</p>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20, 25, 30, 35, 40].map((q, i) => (
                  <motion.button
                    key={q}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, type: 'spring', stiffness: 400, damping: 25 }}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setLongPressQty(q)}
                    className={`h-10 rounded-lg text-[14px] font-medium cursor-pointer ${
                      longPressQty === q
                        ? 'bg-[#ff6b35] text-white shadow-md'
                        : 'bg-[#f8f9fa] text-[#2e3a59] border border-[#e2e8f0] hover:bg-[#fff3ed] hover:border-[#ff6b35]/40'
                    }`}
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Total Preview & Confirm */}
            <div className="px-5 pb-5 pt-2">
              <AnimatePresence>
                {longPressQty > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between mb-3 px-2"
                  >
                    <span className="text-muted-foreground text-[0.8rem]">{lang === 'ta' ? 'மொத்தம்' : 'Subtotal'}</span>
                    <motion.span
                      key={longPressQty}
                      initial={{ scale: 1.3, color: '#ff6b35' }}
                      animate={{ scale: 1, color: '#2e3a59' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="text-[16px] font-bold"
                    >
                      Rs.{longPressItem.price * longPressQty}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button
                onClick={confirmLongPressQty}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="w-full h-12 rounded-xl bg-[#ff6b35] text-white text-[15px] font-medium hover:bg-[#e55a2b] cursor-pointer shadow-lg shadow-[#ff6b35]/25"
              >
                {longPressQty === 0
                  ? (lang === 'ta' ? 'நீக்கு' : 'Remove from Order')
                  : (lang === 'ta' ? `${longPressQty} சேர்` : `Set Quantity to ${longPressQty}`)}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>


    </div>
  );
}