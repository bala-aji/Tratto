import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Bell, Users, UtensilsCrossed, Package, Clock, Check,
  AlertTriangle, ChefHat, Plus, Minus, X, Search, Coffee,
  Flame, CheckCheck, ShoppingBag, CircleDot, Merge, Unlink,
  Armchair, LogOut, ChevronDown, ChevronUp, StickyNote,
} from 'lucide-react';
import {
  categories, getCurrentUser, getMenuItems,
  type KitchenOrder, type WaiterTable, type MenuItem,
  getSharedKitchenOrders, saveSharedKitchenOrders,
  getSharedTables, saveSharedTables,
  getLanguage,
} from '../../data';
import { T, menuName as MN, catName as CN, type Lang } from '../../translations';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { UserBadge } from '../auth/UserBadge';
import { toast, Toaster } from 'sonner';

const TABLE_STATUS_COLORS: Record<string, { bg: string; border: string; dot: string; text: string }> = {
  available:       { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500', text: 'text-green-700' },
  occupied:        { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', text: 'text-blue-700' },
  reserved:        { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', text: 'text-amber-700' },
  needs_attention: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', text: 'text-red-700' },
};

type Tab = 'tables' | 'orders' | 'menu';
type OrderMode = 'table' | 'seat';

interface SeatOrder {
  seatNumber: number;
  items: { item: MenuItem; qty: number; notes: string }[];
}

interface MergedGroup {
  id: string;
  tableIds: number[];
  label: string;
}

const iconMap: Record<string, any> = {
  Grid3X3: UtensilsCrossed, Sun: UtensilsCrossed, Wheat: UtensilsCrossed,
  Cookie: UtensilsCrossed, Coffee: Coffee, IceCreamCone: UtensilsCrossed, UtensilsCrossed,
};

export function WaiterView() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const WAITER_NAME = user?.name || 'Arun Selvam';
  const [lang] = useState<Lang>(() => getLanguage() as Lang);
  const L = (key: string) => T(key, lang);
  const menuItems = useMemo(() => getMenuItems(), []);

  const [activeTab, setActiveTab] = useState<Tab>('tables');
  const [tables, setTables] = useState<WaiterTable[]>(() =>
    getSharedTables().filter(t => t.waiter === WAITER_NAME).map(t => ({ ...t }))
  );
  const [orders, setOrders] = useState<KitchenOrder[]>(() =>
    getSharedKitchenOrders().filter(o => o.waiter === WAITER_NAME).map(o => ({ ...o, items: o.items.map(i => ({ ...i })) }))
  );

  // New order state
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategory, setMenuCategory] = useState('all');
  const [, setTick] = useState(0);

  // Seat-wise ordering
  const [orderMode, setOrderMode] = useState<OrderMode>('table');
  const [seatOrders, setSeatOrders] = useState<SeatOrder[]>([]);
  const [activeSeat, setActiveSeat] = useState<number | null>(null);

  // Merge tables
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeSelections, setMergeSelections] = useState<number[]>([]);
  const [mergedGroups, setMergedGroups] = useState<MergedGroup[]>([]);

  // Table detail
  const [detailTable, setDetailTable] = useState<number | null>(null);

  // Persist changes to shared state
  useEffect(() => {
    // Merge waiter's tables back into the full shared tables
    const allTables = getSharedTables();
    const updated = allTables.map(t => {
      const local = tables.find(lt => lt.id === t.id);
      return local || t;
    });
    saveSharedTables(updated);
  }, [tables]);

  useEffect(() => {
    // Merge waiter's orders back into the full shared kitchen orders
    const allOrders = getSharedKitchenOrders();
    const localIds = new Set(orders.map(o => o.id));
    const nonLocal = allOrders.filter(o => !localIds.has(o.id));
    saveSharedKitchenOrders([...orders, ...nonLocal]);
  }, [orders]);

  // Poll for external changes every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(p => p + 1);
      // Sync new kitchen orders for this waiter
      const freshOrders = getSharedKitchenOrders().filter(o => o.waiter === WAITER_NAME);
      setOrders(prev => {
        const prevIds = prev.map(o => `${o.id}-${o.status}`).join(',');
        const freshIds = freshOrders.map(o => `${o.id}-${o.status}`).join(',');
        return prevIds !== freshIds ? freshOrders : prev;
      });
      // Sync tables for this waiter
      const freshTables = getSharedTables().filter(t => t.waiter === WAITER_NAME);
      setTables(prev => {
        const prevKey = prev.map(t => `${t.id}-${t.status}`).join(',');
        const freshKey = freshTables.map(t => `${t.id}-${t.status}`).join(',');
        return prevKey !== freshKey ? freshTables : prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [WAITER_NAME]);

  const getElapsed = (d: Date | string) => Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  const myTables = tables;
  const activeOrders = orders.filter(o => o.status !== 'Served');
  const readyOrders = orders.filter(o => o.status === 'Ready');
  const cartTotal = orderMode === 'table'
    ? cart.reduce((s, c) => s + c.item.price * c.qty, 0)
    : seatOrders.reduce((s, so) => s + so.items.reduce((a, i) => a + i.item.price * i.qty, 0), 0);
  const cartQty = orderMode === 'table'
    ? cart.reduce((s, c) => s + c.qty, 0)
    : seatOrders.reduce((s, so) => s + so.items.reduce((a, i) => a + i.qty, 0), 0);

  // Table merge logic
  const getMergeGroup = (tableId: number): MergedGroup | undefined =>
    mergedGroups.find(g => g.tableIds.includes(tableId));

  const handleMerge = () => {
    if (mergeSelections.length < 2) {
      toast.error('Select at least 2 tables to merge');
      return;
    }
    // Check no table is already in a merge group
    for (const id of mergeSelections) {
      if (getMergeGroup(id)) {
        toast.error(`Table ${id} is already in a merged group`);
        return;
      }
    }
    const newGroup: MergedGroup = {
      id: `MG-${Date.now()}`,
      tableIds: [...mergeSelections].sort((a, b) => a - b),
      label: `T${mergeSelections.sort((a, b) => a - b).join('+')}`,
    };
    setMergedGroups(prev => [...prev, newGroup]);
    setMergeSelections([]);
    setMergeMode(false);
    toast.success(`${L('w.tables.merged')}: ${newGroup.label}`);
  };

  const unmergeGroup = (groupId: string) => {
    setMergedGroups(prev => prev.filter(g => g.id !== groupId));
    toast.success(L('w.tables.unmerged'));
  };

  const toggleMergeSelect = (tableId: number) => {
    setMergeSelections(prev =>
      prev.includes(tableId) ? prev.filter(id => id !== tableId) : [...prev, tableId]
    );
  };

  // Order actions
  const markServed = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Served' as const } : o));
    toast.success(L('w.order.served'));
  }, []);

  const callAttention = useCallback((tableId: number) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'needs_attention' as const } : t));
    toast.success(`${L('w.alert.sent')} — Table ${tableId}`);
  }, []);

  const clearAttention = useCallback((tableId: number) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: t.guests > 0 ? 'occupied' as const : 'available' as const } : t));
  }, []);

  // Cart actions (table mode)
  const addToCart = (item: MenuItem) => {
    if (orderMode === 'seat' && activeSeat !== null) {
      setSeatOrders(prev => {
        const existing = prev.find(so => so.seatNumber === activeSeat);
        if (existing) {
          const existingItem = existing.items.find(i => i.item.id === item.id);
          if (existingItem) {
            return prev.map(so => so.seatNumber === activeSeat
              ? { ...so, items: so.items.map(i => i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i) }
              : so
            );
          }
          return prev.map(so => so.seatNumber === activeSeat
            ? { ...so, items: [...so.items, { item, qty: 1, notes: '' }] }
            : so
          );
        }
        return [...prev, { seatNumber: activeSeat, items: [{ item, qty: 1, notes: '' }] }];
      });
    } else {
      setCart(prev => {
        const existing = prev.find(c => c.item.id === item.id);
        if (existing) return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
        return [...prev, { item, qty: 1 }];
      });
    }
  };

  const removeFromCart = (itemId: string) => {
    if (orderMode === 'seat' && activeSeat !== null) {
      setSeatOrders(prev => prev.map(so => {
        if (so.seatNumber !== activeSeat) return so;
        const existing = so.items.find(i => i.item.id === itemId);
        if (!existing) return so;
        if (existing.qty <= 1) return { ...so, items: so.items.filter(i => i.item.id !== itemId) };
        return { ...so, items: so.items.map(i => i.item.id === itemId ? { ...i, qty: i.qty - 1 } : i) };
      }).filter(so => so.items.length > 0));
    } else {
      setCart(prev => {
        const existing = prev.find(c => c.item.id === itemId);
        if (!existing) return prev;
        if (existing.qty <= 1) return prev.filter(c => c.item.id !== itemId);
        return prev.map(c => c.item.id === itemId ? { ...c, qty: c.qty - 1 } : c);
      });
    }
  };

  const submitOrder = () => {
    if (!selectedTable) return;

    let items: { name: string; quantity: number; done: false }[] = [];
    if (orderMode === 'seat') {
      items = seatOrders.flatMap(so =>
        so.items.map(i => ({ name: `[S${so.seatNumber}] ${i.item.name}`, quantity: i.qty, done: false as const }))
      );
    } else {
      items = cart.map(c => ({ name: c.item.name, quantity: c.qty, done: false as const }));
    }

    if (items.length === 0) return;

    const mergeGroup = getMergeGroup(selectedTable);
    const tableLabel = mergeGroup ? mergeGroup.label : `Table ${selectedTable}`;

    const newOrder: KitchenOrder = {
      id: `KO-${Date.now()}`,
      order_id: `ORD-${Date.now().toString().slice(-4)}`,
      table_number: selectedTable,
      customer_name: tableLabel,
      items,
      order_type: 'Dine In',
      status: 'New',
      created_at: new Date(),
      waiter: WAITER_NAME,
      priority: 'normal',
    };
    setOrders(prev => [newOrder, ...prev]);
    setTables(prev => prev.map(t => {
      const isInGroup = mergeGroup ? mergeGroup.tableIds.includes(t.id) : t.id === selectedTable;
      return isInGroup ? { ...t, status: 'occupied', order_id: newOrder.order_id, guests: Math.max(t.guests, 1) } : t;
    }));
    setCart([]);
    setSeatOrders([]);
    setShowNewOrder(false);
    setSelectedTable(null);
    setActiveSeat(null);
    toast.success(`${L('w.order.sent')} — ${tableLabel}`);
  };

  const filteredMenu = menuItems.filter(m => {
    const matchCat = menuCategory === 'all' || m.category === menuCategory;
    const matchSearch = m.name.toLowerCase().includes(menuSearch.toLowerCase());
    return matchCat && matchSearch && m.availability;
  });

  // Get current seat cart for display
  const currentSeatCart = activeSeat !== null ? (seatOrders.find(so => so.seatNumber === activeSeat)?.items || []) : [];

  // Get total seats for a table
  const getTableSeats = (tableId: number): number => {
    const group = getMergeGroup(tableId);
    if (group) return group.tableIds.reduce((s, id) => s + (myTables.find(t => t.id === id)?.seats || 0), 0);
    return myTables.find(t => t.id === tableId)?.seats || 4;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] pb-20 font-['Inter',sans-serif]">
      <Toaster position="top-center" richColors />

      {/* Header — mobile optimized */}
      <div className="bg-white border-b border-border px-4 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button onClick={() => navigate('/login')} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-[0.88rem] text-foreground">{L('w.title')}</h1>
              <p className="text-[0.6rem] text-muted-foreground">{WAITER_NAME} · {myTables.length} {L('w.tables').toLowerCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {readyOrders.length > 0 && (
              <div className="relative">
                <Bell className="w-5 h-5 text-green-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-[0.55rem] rounded-full flex items-center justify-center">
                  {readyOrders.length}
                </span>
              </div>
            )}
            <UserBadge compact />
          </div>
        </div>

        {/* Ready notification banner */}
        <AnimatePresence>
          {readyOrders.length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <p className="text-[0.72rem] text-green-700 flex-1">
                  {readyOrders.map(o => `${o.order_id} (T${o.table_number})`).join(', ')} {L('w.ready.serve')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Merged tables banner */}
        {mergedGroups.length > 0 && (
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {mergedGroups.map(g => (
              <span key={g.id} className="flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-[0.62rem] whitespace-nowrap shrink-0">
                <Merge className="w-3 h-3" /> {g.label}
                <button onClick={() => unmergeGroup(g.id)} className="ml-0.5 hover:text-red-500 cursor-pointer"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* ===== MY TABLES ===== */}
        {activeTab === 'tables' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[0.85rem] text-foreground">{L('w.my.tables')}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setMergeMode(!mergeMode); setMergeSelections([]); }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[0.68rem] cursor-pointer transition-all ${
                    mergeMode ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-muted text-muted-foreground hover:bg-border'
                  }`}
                >
                  <Merge className="w-3 h-3" /> {mergeMode ? L('w.cancel') : L('w.merge')}
                </button>
                <button
                  onClick={() => { setShowNewOrder(true); setActiveTab('menu'); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-xl text-[0.72rem] cursor-pointer hover:brightness-110"
                >
                  <Plus className="w-3.5 h-3.5" /> {L('w.new.order')}
                </button>
              </div>
            </div>

            {/* Merge action bar */}
            <AnimatePresence>
              {mergeMode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl">
                    <Merge className="w-4 h-4 text-purple-600 shrink-0" />
                    <p className="text-[0.72rem] text-purple-700 flex-1">
                      {mergeSelections.length === 0
                        ? L('w.tap.merge')
                        : `${mergeSelections.length} ${L('w.tables.selected')}: T${mergeSelections.sort((a, b) => a - b).join(', T')}`
                      }
                    </p>
                    {mergeSelections.length >= 2 && (
                      <button
                        onClick={handleMerge}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-[0.68rem] cursor-pointer hover:brightness-110"
                      >
                        {L('w.merge.now')}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Table cards grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {myTables.map(table => {
                const cfg = TABLE_STATUS_COLORS[table.status];
                const order = orders.find(o => o.order_id === table.order_id);
                const mergeGroup = getMergeGroup(table.id);
                const isSelected = mergeSelections.includes(table.id);
                const elapsed = order ? getElapsed(order.created_at) : 0;
                const doneCount = order ? order.items.filter(i => i.done).length : 0;
                const totalItems = order ? order.items.length : 0;
                const progress = totalItems > 0 ? (doneCount / totalItems) * 100 : 0;

                return (
                  <motion.div
                    key={table.id}
                    whileTap={mergeMode ? {} : { scale: 0.97 }}
                    onClick={() => {
                      if (mergeMode) {
                        toggleMergeSelect(table.id);
                      } else {
                        setDetailTable(detailTable === table.id ? null : table.id);
                      }
                    }}
                    className={`rounded-2xl border overflow-hidden transition-all cursor-pointer ${cfg.bg} ${cfg.border} ${
                      table.status === 'needs_attention' ? 'ring-2 ring-red-300 animate-pulse' : ''
                    } ${isSelected ? 'ring-2 ring-purple-500 border-purple-400' : ''} ${
                      mergeGroup ? 'border-l-4 border-l-purple-500' : ''
                    }`}
                  >
                    {/* Card header */}
                    <div className="px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                        <span className="text-[0.82rem] text-foreground">T{table.id}</span>
                        {mergeGroup && (
                          <span className="px-1 py-0.5 bg-purple-100 text-purple-600 rounded text-[0.5rem]">
                            {mergeGroup.label}
                          </span>
                        )}
                      </div>
                      <span className={`text-[0.55rem] px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border} capitalize`}>
                        {table.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Guests + time */}
                    <div className="px-3 pb-1 flex items-center gap-3 text-[0.62rem] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {table.guests}/{table.seats}</span>
                      {order && (
                        <span className={`flex items-center gap-0.5 ${elapsed >= 15 ? 'text-red-500' : ''}`}>
                          <Clock className="w-3 h-3" /> {elapsed}m
                        </span>
                      )}
                    </div>

                    {/* Progress bar for occupied */}
                    {order && (
                      <div className="px-3 pb-1">
                        <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-[0.5rem] text-[#94a3b8] mt-0.5">{doneCount}/{totalItems} ready</p>
                      </div>
                    )}

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {detailTable === table.id && !mergeMode && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          {/* Order items */}
                          {order && (
                            <div className="px-3 pb-2 space-y-0.5">
                              {order.items.map((it, i) => (
                                <div key={i} className={`flex items-center gap-1.5 text-[0.62rem] ${it.done ? 'text-green-600 line-through' : 'text-foreground'}`}>
                                  {it.done ? <Check className="w-2.5 h-2.5" /> : <CircleDot className="w-2.5 h-2.5 text-muted-foreground" />}
                                  <span className="flex-1">{it.name}</span>
                                  <span className="text-[#ff6b35]">x{it.quantity}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Seat visualization */}
                          <div className="px-3 pb-2">
                            <p className="text-[0.55rem] text-muted-foreground mb-1">{L('w.seats')}</p>
                            <div className="flex flex-wrap gap-1">
                              {Array.from({ length: table.seats }, (_, i) => (
                                <div key={i} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[0.5rem] ${
                                  i < table.guests ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white text-gray-400'
                                }`}>
                                  {i + 1}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="px-3 pb-2.5 flex gap-1.5">
                            {table.status === 'needs_attention' && (
                              <button onClick={(e) => { e.stopPropagation(); clearAttention(table.id); }} className="flex-1 py-1.5 bg-green-500 text-white rounded-lg text-[0.62rem] cursor-pointer hover:brightness-110 flex items-center justify-center gap-1">
                                <Check className="w-3 h-3" />{L('w.resolved')}
                              </button>
                            )}
                            {order?.status === 'Ready' && (
                              <button onClick={(e) => { e.stopPropagation(); markServed(order.id); }} className="flex-1 py-1.5 bg-green-500 text-white rounded-lg text-[0.62rem] cursor-pointer hover:brightness-110 flex items-center justify-center gap-1">
                                <CheckCheck className="w-3 h-3" />{L('w.serve')}
                              </button>
                            )}
                            {table.status === 'occupied' && order?.status !== 'Ready' && (
                              <button onClick={(e) => { e.stopPropagation(); callAttention(table.id); }} className="flex-1 py-1.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[0.62rem] cursor-pointer hover:bg-amber-200 flex items-center justify-center gap-1">
                                <Bell className="w-3 h-3" />{L('w.alert.kitchen')}
                              </button>
                            )}
                            {table.status === 'available' && (
                              <button onClick={(e) => { e.stopPropagation(); setSelectedTable(table.id); setShowNewOrder(true); setActiveTab('menu'); }} className="flex-1 py-1.5 bg-primary text-white rounded-lg text-[0.62rem] cursor-pointer hover:brightness-110 flex items-center justify-center gap-1">
                                <Plus className="w-3 h-3" />{L('w.new.order')}
                              </button>
                            )}
                            {mergeGroup && (
                              <button onClick={(e) => { e.stopPropagation(); unmergeGroup(mergeGroup.id); }} className="flex-1 py-1.5 bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[0.62rem] cursor-pointer hover:bg-purple-200 flex items-center justify-center gap-1">
                                <Unlink className="w-3 h-3" />{L('w.unmerge')}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ===== ACTIVE ORDERS ===== */}
        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-[0.85rem] text-foreground mb-3">{L('w.active.orders')} ({activeOrders.length})</h2>

            {activeOrders.length === 0 && (
              <div className="text-center py-16">
                <Coffee className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground text-[0.82rem]">{L('w.no.active')}</p>
              </div>
            )}

            <div className="space-y-2.5">
              {activeOrders.map(order => {
                const elapsed = getElapsed(order.created_at);
                const doneCount = order.items.filter(i => i.done).length;
                const progress = order.items.length > 0 ? (doneCount / order.items.length) * 100 : 0;
                const statusBg = order.status === 'New' ? 'bg-blue-500' : order.status === 'Preparing' ? 'bg-amber-500' : 'bg-green-500';
                return (
                  <motion.div key={order.id} layout className="bg-white rounded-2xl border border-border overflow-hidden">
                    {/* Header */}
                    <div className="px-3.5 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[0.62rem] text-white ${statusBg}`}>{order.status}</span>
                        <span className="text-[0.78rem] text-foreground">{order.order_id}</span>
                        {order.priority === 'rush' && <Flame className="w-3 h-3 text-red-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        {order.table_number && <span className="text-[0.62rem] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">T{order.table_number}</span>}
                        <span className={`text-[0.62rem] ${elapsed >= 15 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          <Clock className="w-3 h-3 inline mr-0.5" />{elapsed}m
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="px-3.5 pb-1">
                      <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-[0.5rem] text-[#94a3b8] mt-0.5">{doneCount}/{order.items.length} {L('w.items')} {L('w.ready')}</p>
                    </div>

                    {/* Items */}
                    <div className="px-3.5 pb-2 space-y-0.5">
                      {order.items.map((it, i) => (
                        <div key={i} className={`flex items-center justify-between text-[0.72rem] ${it.done ? 'text-green-600' : 'text-foreground'}`}>
                          <span className="flex items-center gap-1.5">
                            {it.done ? <Check className="w-3 h-3" /> : <CircleDot className="w-3 h-3 text-muted-foreground" />}
                            <span className={it.done ? 'line-through' : ''}>{it.name}</span>
                          </span>
                          <span className="text-[0.65rem] text-[#ff6b35]">x{it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action */}
                    {order.status === 'Ready' && (
                      <div className="px-3.5 pb-3">
                        <button onClick={() => markServed(order.id)}
                          className="w-full py-2 bg-green-500 text-white rounded-xl text-[0.72rem] cursor-pointer hover:brightness-110 flex items-center justify-center gap-1.5"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> {L('w.mark.served')}
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ===== MENU (New Order) ===== */}
        {activeTab === 'menu' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[0.85rem] text-foreground">
                  {showNewOrder ? `${L('w.new.order')}${selectedTable ? ` — Table ${selectedTable}` : ''}` : L('w.menu')}
                </h2>
                {showNewOrder && !selectedTable && (
                  <p className="text-[0.62rem] text-muted-foreground mt-0.5">{L('w.select.table')}</p>
                )}
              </div>
              {showNewOrder && (
                <button onClick={() => { setShowNewOrder(false); setCart([]); setSeatOrders([]); setActiveSeat(null); setActiveTab('tables'); }} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Table selector */}
            {showNewOrder && !selectedTable && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {myTables.filter(t => t.status !== 'reserved').map(t => {
                  const mergeGroup = getMergeGroup(t.id);
                  return (
                    <button key={t.id} onClick={() => setSelectedTable(t.id)}
                      className={`py-2.5 rounded-xl border text-[0.75rem] cursor-pointer transition-all ${
                        t.status === 'available' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                      } ${mergeGroup ? 'border-l-3 border-l-purple-500' : ''}`}
                    >
                      T{t.id}
                      {mergeGroup && <span className="block text-[0.5rem] text-purple-500">{mergeGroup.label}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedTable && (
              <>
                {/* Order mode toggle — Table vs Seat */}
                <div className="flex gap-1 bg-muted rounded-lg p-1 mb-3">
                  <button
                    onClick={() => { setOrderMode('table'); setActiveSeat(null); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[0.72rem] transition-all cursor-pointer ${
                      orderMode === 'table' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5" /> {L('w.whole.table')}
                  </button>
                  <button
                    onClick={() => {
                      setOrderMode('seat');
                      if (!activeSeat) setActiveSeat(1);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[0.72rem] transition-all cursor-pointer ${
                      orderMode === 'seat' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    <Armchair className="w-3.5 h-3.5" /> {L('w.per.seat')}
                  </button>
                </div>

                {/* Seat selector — when in seat mode */}
                {orderMode === 'seat' && (
                  <div className="mb-3">
                    <p className="text-[0.62rem] text-muted-foreground mb-1.5">{L('w.select.seat')}</p>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {Array.from({ length: getTableSeats(selectedTable) }, (_, i) => i + 1).map(seatNum => {
                        const seatOrder = seatOrders.find(so => so.seatNumber === seatNum);
                        const seatItemCount = seatOrder?.items.reduce((s, i) => s + i.qty, 0) || 0;
                        return (
                          <button
                            key={seatNum}
                            onClick={() => setActiveSeat(seatNum)}
                            className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center text-[0.72rem] cursor-pointer transition-all shrink-0 ${
                              activeSeat === seatNum
                                ? 'border-primary bg-primary/10 text-primary'
                                : seatItemCount > 0
                                ? 'border-green-400 bg-green-50 text-green-700'
                                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            {seatNum}
                            {seatItemCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[0.5rem] rounded-full flex items-center justify-center">
                                {seatItemCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {activeSeat && currentSeatCart.length > 0 && (
                      <div className="mt-2 bg-white rounded-lg border border-border p-2 space-y-0.5">
                        <p className="text-[0.55rem] text-muted-foreground">Seat {activeSeat} {L('w.seat.items')}</p>
                        {currentSeatCart.map((ci, i) => (
                          <div key={i} className="flex items-center justify-between text-[0.65rem]">
                            <span className="text-foreground">{ci.item.name}</span>
                            <span className="text-[#ff6b35]">x{ci.qty}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={menuSearch}
                    onChange={e => setMenuSearch(e.target.value)}
                    placeholder={L('w.search.menu')}
                    className="w-full pl-9 pr-3 py-2.5 bg-muted rounded-xl text-[0.82rem] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Categories */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setMenuCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-[0.68rem] whitespace-nowrap cursor-pointer transition-all ${
                        menuCategory === cat.id ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >{CN(cat.name)}</button>
                  ))}
                </div>

                {/* Menu items grid */}
                <div className="grid grid-cols-1 gap-2">
                  {filteredMenu.map(item => {
                    const inCart = orderMode === 'table'
                      ? cart.find(c => c.item.id === item.id)
                      : (activeSeat !== null ? currentSeatCart.find(c => c.item.id === item.id) : undefined);
                    return (
                      <div key={item.id} className={`bg-white rounded-xl border p-2.5 flex items-center gap-3 ${inCart ? 'border-primary/40 bg-orange-50/30' : 'border-border'}`}>
                        <ImageWithFallback src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.75rem] text-foreground truncate">{MN(item.name)}</p>
                          <p className="text-[0.68rem] text-[#ff6b35]">Rs.{item.price}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {inCart ? (
                            <>
                              <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center cursor-pointer hover:bg-border">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-[0.75rem] text-foreground">{inCart.qty}</span>
                              <button onClick={() => addToCart(item)} className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center cursor-pointer hover:bg-primary/20">
                                <Plus className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => addToCart(item)} className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center cursor-pointer hover:bg-primary/20">
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Cart bar */}
      <AnimatePresence>
        {showNewOrder && cartQty > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-16 left-0 right-0 px-3 pb-2 z-20"
          >
            <div className="bg-primary text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <div>
                  <span className="text-[0.78rem]">{cartQty} items · Rs.{cartTotal}</span>
                  {orderMode === 'seat' && (
                    <p className="text-[0.55rem] text-white/70">{seatOrders.length} {L('w.seats.with.items')}</p>
                  )}
                </div>
              </div>
              <button onClick={submitOrder} disabled={!selectedTable}
                className="px-5 py-2 bg-white text-primary rounded-xl text-[0.78rem] cursor-pointer hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >{L('w.send.kitchen')}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav — mobile-first */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-2 py-1.5 flex items-center justify-around z-20 safe-area-bottom">
        {([
          { id: 'tables' as Tab, icon: Users, label: L('w.tables'), count: myTables.filter(t => t.status === 'needs_attention').length },
          { id: 'orders' as Tab, icon: UtensilsCrossed, label: L('w.orders'), count: activeOrders.length },
          { id: 'menu' as Tab, icon: ChefHat, label: L('w.menu'), count: 0 },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if (tab.id !== 'menu') { setShowNewOrder(false); setCart([]); setSeatOrders([]); } }}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all cursor-pointer relative ${
              activeTab === tab.id ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[0.58rem]">{tab.label}</span>
            {tab.count > 0 && (
              <span className="absolute -top-0.5 right-1 w-4 h-4 bg-red-500 text-white text-[0.5rem] rounded-full flex items-center justify-center">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}