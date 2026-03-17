import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ArrowLeft, ArrowRight, Check, Search, Plus, Minus, Trash2,
  Users, User, UtensilsCrossed, ChefHat, Armchair, ShoppingBag,
  ClipboardList, Sparkles,
  Grid3X3, Sun, Wheat, Cookie, Coffee, IceCreamCone,
} from 'lucide-react';
import {
  menuItems, categories,
  type MenuItem, type WaiterTable, type KitchenOrder, type KitchenStatus,
} from '../../data';
import { ImageWithFallback } from '../figma/ImageWithFallback';

/* ========== Types ========== */
interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  seatNumbers: number[];
  notes: string;
}

interface WaiterOrderFlowProps {
  tables: WaiterTable[];
  waiterNames: string[];
  onPlaceOrder: (order: {
    table: WaiterTable;
    waiter: string;
    guests: number;
    selectedSeats: number[];
    items: CartItem[];
    kitchenOrder: Omit<KitchenOrder, 'id'>;
  }) => void;
  onClose: () => void;
}

type Step = 'table' | 'seats' | 'waiter' | 'menu' | 'review';
const STEPS: { id: Step; label: string }[] = [
  { id: 'table', label: 'Table' },
  { id: 'seats', label: 'Seats' },
  { id: 'waiter', label: 'Waiter' },
  { id: 'menu', label: 'Menu' },
  { id: 'review', label: 'Review' },
];

const iconMap: Record<string, typeof Coffee> = {
  Grid3X3, Sun, Wheat, Cookie, Coffee, IceCreamCone, UtensilsCrossed,
};

/* ========== Seat Layout ========== */
function getSeatPositions(count: number): { x: number; y: number }[] {
  if (count === 2) return [{ x: 50, y: 8 }, { x: 50, y: 92 }];
  if (count === 4) return [{ x: 50, y: 5 }, { x: 95, y: 50 }, { x: 50, y: 95 }, { x: 5, y: 50 }];
  if (count === 6) return [
    { x: 33, y: 5 }, { x: 67, y: 5 },
    { x: 95, y: 50 },
    { x: 67, y: 95 }, { x: 33, y: 95 },
    { x: 5, y: 50 },
  ];
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    return { x: 50 + 42 * Math.cos(rad), y: 50 + 42 * Math.sin(rad) };
  });
}

/* ========== COMPONENT ========== */
export function WaiterOrderFlow({ tables, waiterNames, onPlaceOrder, onClose }: WaiterOrderFlowProps) {
  const [step, setStep] = useState<Step>('table');
  const [selectedTable, setSelectedTable] = useState<WaiterTable | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCat, setMenuCat] = useState('all');
  const [orderType, setOrderType] = useState<'Dine In' | 'Take Away'>('Dine In');

  const stepIdx = STEPS.findIndex(s => s.id === step);

  const availableTables = tables.filter(t => t.status === 'available' || t.status === 'reserved');
  const occupiedTablesList = tables.filter(t => t.status === 'occupied' || t.status === 'needs_attention');

  const filteredMenu = useMemo(() => {
    let items = menuItems.filter(m => m.availability);
    if (menuCat !== 'all') items = items.filter(m => m.category === menuCat);
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase();
      items = items.filter(m => m.name.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q));
    }
    return items;
  }, [menuCat, menuSearch]);

  const cartTotal = cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItem: item, quantity: 1, seatNumbers: [...selectedSeats], notes: '' }];
    });
  }, [selectedSeats]);

  const updateQty = useCallback((itemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(c => {
        if (c.menuItem.id !== itemId) return c;
        const newQty = c.quantity + delta;
        return newQty <= 0 ? c : { ...c, quantity: newQty };
      }).filter(c => c.quantity > 0);
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
  }, []);

  const updateItemSeats = useCallback((itemId: string, seatNum: number) => {
    setCart(prev => prev.map(c => {
      if (c.menuItem.id !== itemId) return c;
      const seats = c.seatNumbers.includes(seatNum)
        ? c.seatNumbers.filter(s => s !== seatNum)
        : [...c.seatNumbers, seatNum];
      return { ...c, seatNumbers: seats };
    }));
  }, []);

  const updateItemNotes = useCallback((itemId: string, notes: string) => {
    setCart(prev => prev.map(c => c.menuItem.id === itemId ? { ...c, notes } : c));
  }, []);

  const canNext = () => {
    if (step === 'table') return !!selectedTable;
    if (step === 'seats') return selectedSeats.length > 0;
    if (step === 'waiter') return !!selectedWaiter;
    if (step === 'menu') return cart.length > 0;
    return true;
  };

  const goNext = () => { const i = STEPS.findIndex(s => s.id === step); if (i < STEPS.length - 1) setStep(STEPS[i + 1].id); };
  const goBack = () => { const i = STEPS.findIndex(s => s.id === step); if (i > 0) setStep(STEPS[i - 1].id); };

  const toggleSeat = (n: number) => {
    setSelectedSeats(prev => prev.includes(n) ? prev.filter(s => s !== n) : [...prev, n]);
  };

  const handlePlaceOrder = () => {
    if (!selectedTable || !selectedWaiter || cart.length === 0) return;
    const orderId = `ORD-${Date.now().toString().slice(-4)}`;
    const kitchenOrder: Omit<KitchenOrder, 'id'> = {
      order_id: orderId,
      table_number: selectedTable.id,
      customer_name: `Table ${selectedTable.id}`,
      items: cart.map(c => ({ name: c.menuItem.name, quantity: c.quantity, notes: c.notes || undefined, done: false })),
      order_type: orderType,
      status: 'New' as KitchenStatus,
      created_at: new Date(),
      waiter: selectedWaiter,
      priority: 'normal',
    };
    onPlaceOrder({ table: selectedTable, waiter: selectedWaiter, guests: selectedSeats.length, selectedSeats, items: cart, kitchenOrder });
  };

  /* ---------- Render ---------- */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ===== Header — matches CashierPOS modal header ===== */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-foreground">New Order</h3>
              <p className="text-[0.65rem] text-muted-foreground">
                {selectedTable ? `Table ${selectedTable.id} · ${selectedTable.seats} seats` : 'Select a table to begin'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===== Step Progress — matches hybrid stepper style ===== */}
        <div className="px-6 py-3 border-b border-border bg-white shrink-0">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const isActive = step === s.id;
              const isDone = i < stepIdx;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <button
                    onClick={() => { if (i <= stepIdx) setStep(s.id); }}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[0.72rem] transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-primary text-white border-primary'
                        : isDone
                          ? 'bg-green-50 text-green-600 border-green-200'
                          : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3" /> : <span className="text-[0.6rem]">{i + 1}</span>}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`w-4 h-px mx-0.5 shrink-0 ${isDone ? 'bg-green-300' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== Content ===== */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* ---------- STEP 1: TABLE ---------- */}
            {step === 'table' && (
              <motion.div key="table" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
                {/* Order type toggle — matches CashierPOS segmented control */}
                <div className="flex gap-1 bg-muted rounded-lg p-1 mb-5 max-w-xs">
                  {(['Dine In', 'Take Away'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setOrderType(t)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[0.78rem] transition-all cursor-pointer ${
                        orderType === t ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {t === 'Dine In' ? <UtensilsCrossed className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                      {t}
                    </button>
                  ))}
                </div>

                <p className="text-[0.78rem] text-foreground mb-3">Select a table to seat guests</p>

                {/* Available */}
                {availableTables.length > 0 && (
                  <>
                    <p className="text-[0.68rem] text-green-600 mb-2 flex items-center gap-1"><Check className="w-3 h-3" /> Available ({availableTables.length})</p>
                    {/* Grid matches CashierPOS: grid-cols-4 gap-3 */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-5">
                      {availableTables.map(table => (
                        <motion.button
                          key={table.id}
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          onClick={() => { setSelectedTable(table); setSelectedSeats([]); }}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            selectedTable?.id === table.id
                              ? 'bg-primary text-white border-primary'
                              : table.status === 'reserved'
                                ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                                : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          <p className="text-[0.85rem]">T{table.id}</p>
                          <p className="text-[0.65rem] mt-0.5">{table.seats} seats</p>
                          <div className="flex items-center justify-center gap-0.5 mt-1">
                            {Array.from({ length: table.seats }).map((_, i) => (
                              <Armchair key={i} className={`w-2.5 h-2.5 ${selectedTable?.id === table.id ? 'text-white/70' : 'text-green-500'}`} />
                            ))}
                          </div>
                          <p className={`text-[0.55rem] mt-0.5 capitalize ${selectedTable?.id === table.id ? 'text-white/70' : ''}`}>
                            {table.status === 'reserved' ? 'Reserved' : table.waiter}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}

                {/* Occupied (info only) */}
                {occupiedTablesList.length > 0 && (
                  <>
                    <p className="text-[0.68rem] text-blue-600 mb-2 flex items-center gap-1"><Users className="w-3 h-3" /> Occupied ({occupiedTablesList.length})</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
                      {occupiedTablesList.map(table => (
                        <div key={table.id} className={`p-3 rounded-xl border text-center opacity-60 ${
                          table.status === 'needs_attention'
                            ? 'bg-red-50 border-red-200 text-red-600'
                            : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}>
                          <p className="text-[0.85rem]">T{table.id}</p>
                          <p className="text-[0.65rem] mt-0.5">{table.guests}/{table.seats}</p>
                          <p className="text-[0.55rem] mt-0.5 capitalize">{table.status === 'needs_attention' ? 'needs help' : 'occupied'}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Legend — matches CashierPOS table legend */}
                <div className="flex gap-4 mt-2 text-[0.7rem] text-muted-foreground justify-center flex-wrap">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200" /> Available</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-200" /> Occupied</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200" /> Reserved</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200" /> Needs Help</span>
                </div>

                {availableTables.length === 0 && (
                  <div className="text-center py-12">
                    <UtensilsCrossed className="w-12 h-12 text-muted-foreground/15 mx-auto mb-3" />
                    <p className="text-muted-foreground text-[0.82rem]">No tables available right now</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ---------- STEP 2: SEATS ---------- */}
            {step === 'seats' && selectedTable && (
              <motion.div key="seats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
                <p className="text-foreground mb-1">Table {selectedTable.id} — {selectedTable.seats} Seats</p>
                <p className="text-[0.72rem] text-muted-foreground mb-5">Tap the chairs where guests are seated</p>

                {/* Visual table with chairs */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                    {/* Table surface */}
                    <div className={`absolute inset-[22%] rounded-2xl border-2 border-[#e2e8f0] bg-[#f1f5f9] flex items-center justify-center`}>
                      <div className="text-center">
                        <p className="text-[1.2rem] text-foreground">T{selectedTable.id}</p>
                        <p className="text-[0.65rem] text-muted-foreground">{selectedSeats.length}/{selectedTable.seats} seated</p>
                      </div>
                    </div>

                    {/* Chair buttons */}
                    {getSeatPositions(selectedTable.seats).map((pos, i) => {
                      const seatNum = i + 1;
                      const isSelected = selectedSeats.includes(seatNum);
                      return (
                        <motion.button
                          key={seatNum}
                          whileTap={{ scale: 0.9 }}
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          onClick={() => toggleSeat(seatNum)}
                          className="absolute cursor-pointer"
                          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          <div className={`w-11 h-11 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-primary border-primary text-white'
                              : 'bg-white border-[#e2e8f0] text-muted-foreground hover:border-primary/40'
                          }`}>
                            <Armchair className="w-4 h-4" />
                            <span className="text-[0.5rem]">S{seatNum}</span>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center"
                            >
                              <Check className="w-2.5 h-2.5 text-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick select — styled like CashierPOS quick discount buttons */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <button
                    onClick={() => setSelectedSeats(Array.from({ length: selectedTable.seats }, (_, i) => i + 1))}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-[0.78rem] hover:brightness-110 transition-all cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedSeats([])}
                    className="px-4 py-2 bg-white border border-border rounded-lg text-[0.78rem] hover:bg-muted transition-all cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                {/* Selected summary */}
                {selectedSeats.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-green-50 border border-green-200 rounded-xl text-center"
                  >
                    <p className="text-[0.75rem] text-green-700">
                      <Users className="w-3.5 h-3.5 inline mr-1" />
                      {selectedSeats.length} guest{selectedSeats.length > 1 ? 's' : ''} at seats{' '}
                      {[...selectedSeats].sort((a, b) => a - b).map(s => `S${s}`).join(', ')}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ---------- STEP 3: WAITER ---------- */}
            {step === 'waiter' && (
              <motion.div key="waiter" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
                <p className="text-foreground mb-1">Assign a Waiter</p>
                <p className="text-[0.72rem] text-muted-foreground mb-5">
                  Choose who will serve Table {selectedTable?.id}
                  {selectedTable?.waiter && (
                    <span className="text-primary"> · Currently assigned: {selectedTable.waiter}</span>
                  )}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {waiterNames.map(name => {
                    const waiterTbls = tables.filter(t => t.waiter === name);
                    const busyTbls = waiterTbls.filter(t => t.status === 'occupied' || t.status === 'needs_attention').length;
                    const isDefault = selectedTable?.waiter === name;
                    const isSelected = selectedWaiter === name;

                    return (
                      <motion.button
                        key={name}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        onClick={() => setSelectedWaiter(name)}
                        className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white border-border hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-white/20' : 'bg-primary/10'
                          }`}>
                            <User className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-primary'}`} />
                          </div>
                          <div className="flex-1">
                            <p className={`text-[0.85rem] flex items-center gap-1.5 ${isSelected ? 'text-white' : 'text-foreground'}`}>
                              {name}
                              {isDefault && !isSelected && (
                                <span className="text-[0.55rem] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Default</span>
                              )}
                            </p>
                            <p className={`text-[0.65rem] ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>
                              {waiterTbls.length} tables · {busyTbls} busy
                            </p>
                            <div className="flex gap-1 mt-1">
                              {waiterTbls.map(t => (
                                <span
                                  key={t.id}
                                  className={`w-5 h-5 rounded text-[0.5rem] flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : t.status === 'occupied' ? 'bg-blue-100 text-blue-600'
                                        : t.status === 'needs_attention' ? 'bg-red-100 text-red-600'
                                          : t.status === 'reserved' ? 'bg-amber-100 text-amber-600'
                                            : 'bg-green-100 text-green-600'
                                  }`}
                                >T{t.id}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ---------- STEP 4: MENU & CART ---------- */}
            {step === 'menu' && (
              <motion.div key="menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col md:flex-row h-[60vh]">
                {/* Left: Menu browsing */}
                <div className="flex-1 flex flex-col overflow-hidden md:border-r border-border">
                  {/* Search — matches CashierPOS search input */}
                  <div className="px-4 pt-4 pb-2 shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                      <input
                        value={menuSearch}
                        onChange={e => setMenuSearch(e.target.value)}
                        placeholder="Search menu items..."
                        className="w-full pl-10 pr-4 py-2 bg-[#f1f5f9] rounded-[14px] border-none outline-none text-[0.85rem] text-[#2e3a59] placeholder:text-[rgba(46,58,89,0.5)]"
                      />
                    </div>
                  </div>

                  {/* Category pills — match KitchenManager filter style */}
                  <div className="px-4 pb-2 shrink-0">
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {categories.map(cat => {
                        const Icon = iconMap[cat.icon] || UtensilsCrossed;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setMenuCat(cat.id)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[0.72rem] whitespace-nowrap cursor-pointer transition-all ${
                              menuCat === cat.id ? 'bg-foreground text-white' : 'bg-white border border-border text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Menu items — matches CashierPOS card layout */}
                  <div className="flex-1 overflow-y-auto px-4 pb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filteredMenu.map(item => {
                        const inCart = cart.find(c => c.menuItem.id === item.id);
                        return (
                          <motion.div
                            key={item.id}
                            onClick={() => addToCart(item)}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            role="button"
                            tabIndex={0}
                            className="bg-white relative rounded-[14px] cursor-pointer text-left select-none"
                          >
                            <div className="flex flex-col items-start overflow-clip pt-[6px] px-px pb-px rounded-[inherit]">
                              <div className="flex flex-col items-center justify-center overflow-clip w-full relative" style={{ height: 100 }}>
                                <div className="h-[100px] pointer-events-none relative rounded-[8px] shrink-0 w-[calc(100%-2px)]">
                                  <ImageWithFallback
                                    src={item.image}
                                    alt={item.name}
                                    className="absolute inset-0 max-w-none object-cover rounded-[8px] size-full"
                                  />
                                  <div aria-hidden="true" className="absolute border border-[#ededed] border-solid inset-0 rounded-[8px]" />
                                </div>
                                <AnimatePresence>
                                  {inCart && (
                                    <motion.div
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                      className="absolute top-1 right-2 w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-[0.75rem] z-10 shadow-sm"
                                    >
                                      {inCart.quantity}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <div className="flex flex-col gap-[2px] items-start pt-[8px] px-[10px] pb-[8px] w-full">
                                <p className="font-['Inter',sans-serif] text-[#2e3a59] text-[14px] truncate w-full">{item.name}</p>
                                <div className="flex items-center justify-between w-full">
                                  <p className="font-['Inter',sans-serif] text-[#ff6b35] text-[12px]">Rs.{item.price}</p>
                                  {inCart && (
                                    <span className="text-[#888] text-[11px]">x {inCart.quantity}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {filteredMenu.length === 0 && (
                      <div className="text-center py-10">
                        <Search className="w-8 h-8 text-muted-foreground/15 mx-auto mb-2" />
                        <p className="text-muted-foreground text-[0.78rem]">No items found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Cart sidebar */}
                <div className="w-full md:w-72 lg:w-80 bg-white flex flex-col shrink-0 border-t md:border-t-0">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
                    <p className="text-[0.82rem] text-foreground flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-primary" />
                      Cart ({cartCount})
                    </p>
                    <p className="text-[0.82rem] text-[#ff6b35]">Rs.{cartTotal}</p>
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-muted-foreground/15 mb-2" />
                      <p className="text-[0.75rem] text-muted-foreground">Tap menu items to add</p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto divide-y divide-border">
                      {cart.map(item => (
                        <div key={item.menuItem.id} className="px-4 py-3">
                          <div className="flex items-start gap-2.5">
                            <ImageWithFallback src={item.menuItem.image} alt={item.menuItem.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[0.78rem] text-[#2e3a59] truncate">{item.menuItem.name}</p>
                              <p className="text-[0.65rem] text-[#ff6b35]">Rs.{item.menuItem.price} × {item.quantity} = Rs.{item.menuItem.price * item.quantity}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.menuItem.id)} className="text-destructive/50 hover:text-destructive transition-colors cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quantity — matches CashierPOS: rounded-full bg-muted */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1">
                              <button onClick={() => updateQty(item.menuItem.id, -1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors cursor-pointer">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-[0.8rem] w-5 text-center text-foreground">{item.quantity}</span>
                              <button onClick={() => updateQty(item.menuItem.id, 1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors cursor-pointer">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Seat tags */}
                            <div className="flex gap-0.5 flex-wrap flex-1">
                              {[...selectedSeats].sort((a, b) => a - b).map(s => (
                                <button
                                  key={s}
                                  onClick={() => updateItemSeats(item.menuItem.id, s)}
                                  className={`w-5 h-5 rounded text-[0.5rem] flex items-center justify-center cursor-pointer transition-colors ${
                                    item.seatNumbers.includes(s) ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-border'
                                  }`}
                                >S{s}</button>
                              ))}
                            </div>
                          </div>

                          {/* Notes input — matches CashierPOS input styling */}
                          <input
                            value={item.notes}
                            onChange={e => updateItemNotes(item.menuItem.id, e.target.value)}
                            placeholder="Add notes..."
                            className="mt-1.5 w-full px-3 py-1.5 text-[0.68rem] bg-[#f1f5f9] rounded-lg border-none outline-none text-[#2e3a59] placeholder:text-[rgba(46,58,89,0.4)]"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ---------- STEP 5: REVIEW ---------- */}
            {step === 'review' && selectedTable && (
              <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
                <div className="max-w-lg mx-auto">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <p className="text-foreground">Order Summary</p>
                  </div>

                  {/* Order details — card style */}
                  <div className="bg-white rounded-xl border border-border p-4 mb-4">
                    <div className="grid grid-cols-2 gap-3 text-[0.78rem]">
                      <div>
                        <p className="text-[0.65rem] text-muted-foreground mb-0.5">Table</p>
                        <p className="text-foreground flex items-center gap-1"><UtensilsCrossed className="w-3.5 h-3.5 text-primary" /> T{selectedTable.id} ({selectedTable.seats} seats)</p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] text-muted-foreground mb-0.5">Guests</p>
                        <p className="text-foreground flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-600" /> {selectedSeats.length} ({[...selectedSeats].sort((a, b) => a - b).map(s => `S${s}`).join(', ')})</p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] text-muted-foreground mb-0.5">Waiter</p>
                        <p className="text-foreground flex items-center gap-1"><User className="w-3.5 h-3.5 text-accent" /> {selectedWaiter}</p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] text-muted-foreground mb-0.5">Type</p>
                        <p className="text-foreground">{orderType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="bg-white rounded-xl border border-border overflow-hidden mb-4">
                    <div className="px-4 py-2 bg-muted border-b border-border">
                      <p className="text-[0.72rem] text-muted-foreground">{cart.length} item{cart.length > 1 ? 's' : ''}</p>
                    </div>
                    <div className="divide-y divide-border">
                      {cart.map(item => (
                        <div key={item.menuItem.id} className="px-4 py-2.5 flex items-center gap-3">
                          <ImageWithFallback src={item.menuItem.image} alt={item.menuItem.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.78rem] text-foreground truncate">{item.menuItem.name}</p>
                            <div className="flex items-center gap-2 text-[0.62rem] text-muted-foreground">
                              <span>× {item.quantity}</span>
                              {item.seatNumbers.length > 0 && (
                                <span className="flex items-center gap-0.5">
                                  <Armchair className="w-2.5 h-2.5" />
                                  {[...item.seatNumbers].sort((a, b) => a - b).map(s => `S${s}`).join(', ')}
                                </span>
                              )}
                              {item.notes && <span className="italic truncate">"{item.notes}"</span>}
                            </div>
                          </div>
                          <span className="text-[0.78rem] text-[#ff6b35] shrink-0">Rs.{item.menuItem.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    {/* Total row */}
                    <div className="px-4 py-3 bg-muted border-t border-border flex items-center justify-between">
                      <span className="text-[0.85rem] text-foreground">Total</span>
                      <span className="text-[0.95rem] text-[#ff6b35]">Rs.{cartTotal}</span>
                    </div>
                  </div>

                  {/* Place order — matches CashierPOS primary action */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    onClick={handlePlaceOrder}
                    className="w-full py-3 bg-primary text-white rounded-xl text-[0.85rem] cursor-pointer hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <ChefHat className="w-5 h-5" />
                    Place Order · Rs.{cartTotal}
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ===== Footer — matches CashierPOS button patterns ===== */}
        <div className="px-6 py-3 border-t border-border bg-white flex items-center justify-between shrink-0">
          <button
            onClick={step === 'table' ? onClose : goBack}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-border rounded-lg text-[0.82rem] hover:bg-muted transition-all cursor-pointer text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 'table' ? 'Cancel' : 'Back'}
          </button>

          <div className="flex items-center gap-3">
            {cart.length > 0 && step !== 'review' && (
              <span className="text-[0.68rem] text-muted-foreground bg-muted px-2.5 py-1 rounded-lg hidden sm:flex items-center gap-1">
                <ShoppingBag className="w-3 h-3" /> {cartCount} items · Rs.{cartTotal}
              </span>
            )}

            {step !== 'review' && (
              <button
                onClick={goNext}
                disabled={!canNext()}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[0.82rem] transition-all cursor-pointer ${
                  canNext()
                    ? 'bg-primary text-white hover:brightness-110'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
