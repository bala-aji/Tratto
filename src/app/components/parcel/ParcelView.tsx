import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Package, Clock, Check, CheckCheck, Phone,
  ShoppingBag, Truck, AlertCircle, Search, Hash, User,
  CreditCard, Timer, PackageCheck, X, Bell,
} from 'lucide-react';
import { mockParcelOrders, type ParcelOrder, type ParcelStatus } from '../../data';
import { toast, Toaster } from 'sonner';
import { UserBadge } from '../auth/UserBadge';

const STATUS_FLOW: ParcelStatus[] = ['Received', 'Packing', 'Ready', 'Picked Up'];

const statusConfig: Record<ParcelStatus, { bg: string; border: string; badge: string; badgeText: string; icon: typeof Clock; label: string }> = {
  'Received':  { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100', badgeText: 'text-blue-700', icon: Bell, label: 'Received' },
  'Packing':   { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100', badgeText: 'text-amber-700', icon: Package, label: 'Packing' },
  'Ready':     { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100', badgeText: 'text-green-700', icon: PackageCheck, label: 'Ready' },
  'Picked Up': { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100', badgeText: 'text-gray-600', icon: CheckCheck, label: 'Picked Up' },
};

function getElapsed(d: Date) { return Math.floor((Date.now() - d.getTime()) / 60000); }

function getTimeRemaining(d: Date) {
  const diff = Math.ceil((d.getTime() - Date.now()) / 60000);
  return diff;
}

export function ParcelView() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ParcelOrder[]>(() =>
    mockParcelOrders.map(o => ({ ...o, items: o.items.map(i => ({ ...i })) }))
  );
  const [filter, setFilter] = useState<ParcelStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 15000);
    return () => clearInterval(t);
  }, []);

  const advanceStatus = useCallback((id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const idx = STATUS_FLOW.indexOf(o.status);
      if (idx >= STATUS_FLOW.length - 1) return o;
      return { ...o, status: STATUS_FLOW[idx + 1] };
    }));
    toast.success('Status updated');
  }, []);

  const counts: Record<ParcelStatus | 'All', number> = {
    All: orders.filter(o => o.status !== 'Picked Up').length,
    Received: orders.filter(o => o.status === 'Received').length,
    Packing: orders.filter(o => o.status === 'Packing').length,
    Ready: orders.filter(o => o.status === 'Ready').length,
    'Picked Up': orders.filter(o => o.status === 'Picked Up').length,
  };

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'All' ? o.status !== 'Picked Up' : o.status === filter;
    const matchSearch = searchQuery === '' ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.token.toString().includes(searchQuery) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const selected = selectedOrder ? orders.find(o => o.id === selectedOrder) : null;

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div className="bg-white border-b border-border px-4 md:px-6 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-[0.95rem] text-foreground">Parcel Counter</h1>
                <p className="text-[0.65rem] text-muted-foreground">Namma Naina Kadai · Take Away Orders</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {counts.Ready > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 rounded-xl text-[0.7rem]">
                <PackageCheck className="w-3.5 h-3.5" /> {counts.Ready} ready for pickup
              </span>
            )}
            <div className="text-[0.68rem] text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
              {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <UserBadge compact />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Order list */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Search + Filters */}
          <div className="px-4 md:px-6 py-3 space-y-3 border-b border-border bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, token, or ID..."
                className="w-full pl-9 pr-3 py-2.5 bg-muted rounded-xl text-[0.82rem] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              {(['All', 'Received', 'Packing', 'Ready', 'Picked Up'] as const).map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-[0.72rem] whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                    filter === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-border'
                  }`}
                >
                  {s}
                  {counts[s] > 0 && (
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.58rem] ${
                      filter === s ? 'bg-white/20' : 'bg-foreground/10'
                    }`}>{counts[s]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Order cards */}
          <div className="flex-1 overflow-y-auto p-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {filtered.map(order => {
                  const cfg = statusConfig[order.status];
                  const elapsed = getElapsed(order.created_at);
                  const remaining = getTimeRemaining(order.estimated_ready);
                  const StatusIcon = cfg.icon;
                  const isActive = selectedOrder === order.id;

                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedOrder(isActive ? null : order.id)}
                      className={`rounded-2xl border p-4 cursor-pointer transition-all ${cfg.bg} ${cfg.border} ${
                        isActive ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                      }`}
                    >
                      {/* Token + Status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm">
                            <span className="text-[1rem] text-foreground">#{order.token}</span>
                          </span>
                          <div>
                            <p className="text-[0.78rem] text-foreground">{order.customer_name}</p>
                            <p className="text-[0.6rem] text-muted-foreground">{order.id}</p>
                          </div>
                        </div>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[0.62rem] ${cfg.badge} ${cfg.badgeText}`}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Items preview */}
                      <div className="mb-3 space-y-0.5">
                        {order.items.map((it, i) => (
                          <p key={i} className="text-[0.72rem] text-foreground">
                            {it.name} <span className="text-[#ff6b35]">x{it.quantity}</span>
                          </p>
                        ))}
                      </div>

                      {/* Footer row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[0.62rem] text-muted-foreground">
                          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {elapsed}m ago</span>
                          <span className="flex items-center gap-0.5"><CreditCard className="w-3 h-3" /> {order.payment}</span>
                        </div>
                        <span className="text-[0.75rem] text-[#ff6b35]">Rs.{order.total}</span>
                      </div>

                      {/* ETA */}
                      {order.status !== 'Picked Up' && order.status !== 'Ready' && (
                        <div className={`mt-2 flex items-center gap-1 text-[0.6rem] ${
                          remaining <= 0 ? 'text-red-500' : remaining <= 5 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          <Timer className="w-3 h-3" />
                          {remaining <= 0 ? 'Overdue!' : `~${remaining}m to ready`}
                        </div>
                      )}

                      {/* Action button */}
                      {order.status !== 'Picked Up' && (
                        <button
                          onClick={e => { e.stopPropagation(); advanceStatus(order.id); }}
                          className={`w-full mt-3 py-2 rounded-xl text-[0.75rem] text-white cursor-pointer hover:brightness-110 transition-all flex items-center justify-center gap-1.5 ${
                            order.status === 'Received' ? 'bg-amber-500' : order.status === 'Packing' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                        >
                          {order.status === 'Received' && <><Package className="w-3.5 h-3.5" /> Start Packing</>}
                          {order.status === 'Packing' && <><Check className="w-3.5 h-3.5" /> Mark Ready</>}
                          {order.status === 'Ready' && <><CheckCheck className="w-3.5 h-3.5" /> Picked Up</>}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <Package className="w-14 h-14 text-muted-foreground/15 mx-auto mb-3" />
                <p className="text-muted-foreground text-[0.85rem]">No orders in this category</p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Order detail (desktop) */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="hidden md:block border-l border-border bg-white overflow-hidden shrink-0"
            >
              <div className="w-[360px] h-full flex flex-col">
                {/* Detail header */}
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground text-[0.92rem]">Token #{selected.token}</h3>
                    <p className="text-[0.68rem] text-muted-foreground">{selected.id}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  {/* Customer */}
                  <div>
                    <p className="text-[0.68rem] text-muted-foreground mb-2 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Customer</p>
                    <div className="bg-muted/50 rounded-xl p-3 space-y-1.5">
                      <p className="text-[0.82rem] text-foreground">{selected.customer_name}</p>
                      <p className="text-[0.72rem] text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {selected.phone}</p>
                    </div>
                  </div>

                  {/* Status timeline */}
                  <div>
                    <p className="text-[0.68rem] text-muted-foreground mb-3">Status</p>
                    <div className="space-y-0">
                      {STATUS_FLOW.map((s, i) => {
                        const isCompleted = STATUS_FLOW.indexOf(selected.status) >= i;
                        const isCurrent = selected.status === s;
                        return (
                          <div key={s} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                              } ${isCurrent ? 'ring-2 ring-green-300' : ''}`}>
                                {isCompleted ? <Check className="w-3 h-3" /> : <span className="text-[0.6rem]">{i + 1}</span>}
                              </span>
                              {i < STATUS_FLOW.length - 1 && (
                                <div className={`w-0.5 h-6 ${isCompleted ? 'bg-green-300' : 'bg-border'}`} />
                              )}
                            </div>
                            <div className={`pb-4 ${isCurrent ? 'text-foreground' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                              <p className={`text-[0.78rem] ${isCurrent ? '' : ''}`}>{s}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-[0.68rem] text-muted-foreground mb-2 flex items-center gap-1"><ShoppingBag className="w-3.5 h-3.5" /> Items</p>
                    <div className="space-y-2">
                      {selected.items.map((it, i) => (
                        <div key={i} className="flex items-center justify-between bg-muted/50 rounded-xl px-3 py-2.5">
                          <span className="text-[0.78rem] text-foreground">{it.name}</span>
                          <span className="text-[0.75rem] text-[#ff6b35]">x{it.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[0.72rem] text-muted-foreground">Total</span>
                      <span className="text-[0.88rem] text-foreground">Rs.{selected.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[0.72rem] text-muted-foreground">Payment</span>
                      <span className="text-[0.72rem] text-foreground flex items-center gap-1"><CreditCard className="w-3 h-3" /> {selected.payment}</span>
                    </div>
                  </div>

                  {/* Timing */}
                  <div className="bg-muted/50 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.72rem] text-muted-foreground">Ordered</span>
                      <span className="text-[0.72rem] text-foreground">{selected.created_at.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[0.72rem] text-muted-foreground">Elapsed</span>
                      <span className="text-[0.72rem] text-foreground">{getElapsed(selected.created_at)}m</span>
                    </div>
                    {selected.status !== 'Picked Up' && selected.status !== 'Ready' && (
                      <div className="flex items-center justify-between">
                        <span className="text-[0.72rem] text-muted-foreground">ETA</span>
                        <span className={`text-[0.72rem] ${getTimeRemaining(selected.estimated_ready) <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {getTimeRemaining(selected.estimated_ready) <= 0 ? 'Overdue' : `${getTimeRemaining(selected.estimated_ready)}m`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action */}
                {selected.status !== 'Picked Up' && (
                  <div className="px-5 py-4 border-t border-border">
                    <button
                      onClick={() => advanceStatus(selected.id)}
                      className={`w-full py-3 rounded-xl text-[0.82rem] text-white cursor-pointer hover:brightness-110 transition-all flex items-center justify-center gap-2 ${
                        selected.status === 'Received' ? 'bg-amber-500' : selected.status === 'Packing' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                    >
                      {selected.status === 'Received' && <><Package className="w-4 h-4" /> Start Packing</>}
                      {selected.status === 'Packing' && <><Check className="w-4 h-4" /> Mark Ready</>}
                      {selected.status === 'Ready' && <><CheckCheck className="w-4 h-4" /> Mark as Picked Up</>}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom stats bar */}
      <div className="bg-white border-t border-border px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 text-[0.68rem]">
          <span className="flex items-center gap-1 text-blue-600"><Bell className="w-3.5 h-3.5" /> {counts.Received} received</span>
          <span className="flex items-center gap-1 text-amber-600"><Package className="w-3.5 h-3.5" /> {counts.Packing} packing</span>
          <span className="flex items-center gap-1 text-green-600"><PackageCheck className="w-3.5 h-3.5" /> {counts.Ready} ready</span>
        </div>
        <span className="text-[0.65rem] text-muted-foreground">{counts['Picked Up']} picked up today</span>
      </div>
    </div>
  );
}