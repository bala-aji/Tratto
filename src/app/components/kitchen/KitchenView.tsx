import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ChefHat, Flame, Clock, Check, CheckCheck,
  AlertTriangle, UtensilsCrossed, Package, Bell, Volume2, VolumeX,
} from 'lucide-react';
import { mockKitchenOrders, type KitchenOrder, type KitchenStatus } from '../../data';
import { toast, Toaster } from 'sonner';
import { UserBadge } from '../auth/UserBadge';

const STATUS_FLOW: KitchenStatus[] = ['New', 'Preparing', 'Ready', 'Served'];

function getElapsed(created: Date) {
  const diff = Math.floor((Date.now() - created.getTime()) / 60000);
  return diff;
}

function getTimerColor(mins: number) {
  if (mins >= 20) return 'text-red-500';
  if (mins >= 10) return 'text-amber-500';
  return 'text-green-600';
}

function getTimerBg(mins: number) {
  if (mins >= 20) return 'bg-red-50 border-red-200';
  if (mins >= 10) return 'bg-amber-50 border-amber-200';
  return 'bg-green-50 border-green-200';
}

const statusConfig: Record<KitchenStatus, { bg: string; border: string; badge: string; icon: typeof Clock }> = {
  New:       { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-500', icon: Bell },
  Preparing: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-500', icon: Flame },
  Ready:     { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-500', icon: Check },
  Served:    { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-400', icon: CheckCheck },
};

export function KitchenView() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<KitchenOrder[]>(() =>
    mockKitchenOrders.map(o => ({ ...o, items: o.items.map(i => ({ ...i })) }))
  );
  const [filter, setFilter] = useState<KitchenStatus | 'All'>('All');
  const [soundOn, setSoundOn] = useState(true);
  const [, setTick] = useState(0);

  // Tick timer every 30s
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const advanceStatus = useCallback((id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const idx = STATUS_FLOW.indexOf(o.status);
      if (idx >= STATUS_FLOW.length - 1) return o;
      const next = STATUS_FLOW[idx + 1];
      return { ...o, status: next };
    }));
    if (soundOn) {
      toast.success('Order status updated');
    }
  }, [soundOn]);

  const toggleItemDone = useCallback((orderId: string, itemIdx: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const items = o.items.map((it, i) => i === itemIdx ? { ...it, done: !it.done } : it);
      return { ...o, items };
    }));
  }, []);

  const filtered = filter === 'All' ? orders.filter(o => o.status !== 'Served') : orders.filter(o => o.status === filter);
  const counts = {
    New: orders.filter(o => o.status === 'New').length,
    Preparing: orders.filter(o => o.status === 'Preparing').length,
    Ready: orders.filter(o => o.status === 'Ready').length,
    Served: orders.filter(o => o.status === 'Served').length,
  };

  return (
    <div className="min-h-screen bg-[#1a1d23] text-white">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div className="bg-[#22252d] border-b border-white/10 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[0.95rem] text-white">Kitchen Display</h1>
              <p className="text-[0.65rem] text-white/50">Namma Naina Kadai</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setSoundOn(!soundOn)} className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-white/60">
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <div className="text-[0.7rem] text-white/50 bg-white/5 px-3 py-1.5 rounded-lg">
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <UserBadge compact />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 md:px-6 py-3 flex gap-2 overflow-x-auto border-b border-white/5">
        {(['All', 'New', 'Preparing', 'Ready', 'Served'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-[0.78rem] whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              filter === s ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {s}
            {s !== 'All' && counts[s] > 0 && (
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] ${
                filter === s ? 'bg-white/20' : statusConfig[s].badge + ' text-white'
              }`}>{counts[s]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(order => {
              const elapsed = getElapsed(order.created_at);
              const cfg = statusConfig[order.status];
              const StatusIcon = cfg.icon;
              const doneCount = order.items.filter(i => i.done).length;
              const totalItems = order.items.length;
              const progress = totalItems > 0 ? (doneCount / totalItems) * 100 : 0;

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className={`rounded-2xl border overflow-hidden ${
                    order.priority === 'rush' ? 'ring-2 ring-red-500/50' : ''
                  } ${cfg.bg} ${cfg.border}`}
                >
                  {/* Card header */}
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-lg ${cfg.badge} flex items-center justify-center`}>
                        <StatusIcon className="w-3.5 h-3.5 text-white" />
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[0.82rem] text-[#2e3a59]">{order.order_id}</span>
                          {order.priority === 'rush' && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[0.55rem] flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" /> RUSH
                            </span>
                          )}
                        </div>
                        <p className="text-[0.65rem] text-[#64748b]">{order.customer_name}</p>
                      </div>
                    </div>
                    <div className={`text-right ${getTimerColor(elapsed)}`}>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[0.7rem] ${getTimerBg(elapsed)}`}>
                        <Clock className="w-3 h-3" />
                        {elapsed}m
                      </div>
                    </div>
                  </div>

                  {/* Type & Table */}
                  <div className="px-4 pb-2 flex items-center gap-2">
                    <span className={`text-[0.62rem] px-2 py-0.5 rounded-full ${
                      order.order_type === 'Take Away' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {order.order_type === 'Take Away' ? <Package className="w-2.5 h-2.5 inline mr-0.5" /> : <UtensilsCrossed className="w-2.5 h-2.5 inline mr-0.5" />}
                      {order.order_type}
                    </span>
                    {order.table_number && (
                      <span className="text-[0.62rem] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Table {order.table_number}</span>
                    )}
                    <span className="text-[0.6rem] text-[#94a3b8]">by {order.waiter}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="px-4 pb-2">
                    <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-green-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-[0.58rem] text-[#94a3b8] mt-1">{doneCount}/{totalItems} items done</p>
                  </div>

                  {/* Items */}
                  <div className="px-4 pb-3 space-y-1.5">
                    {order.items.map((item, idx) => (
                      <button
                        key={`${order.id}-${idx}`}
                        onClick={() => toggleItemDone(order.id, idx)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                          item.done
                            ? 'bg-green-100/60 border border-green-200'
                            : 'bg-white/80 border border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                          item.done ? 'bg-green-500' : 'bg-white border-2 border-gray-300'
                        }`}>
                          {item.done && <Check className="w-3 h-3 text-white" />}
                        </span>
                        <span className={`flex-1 text-[0.78rem] ${item.done ? 'line-through text-[#94a3b8]' : 'text-[#2e3a59]'}`}>
                          {item.name}
                        </span>
                        <span className={`text-[0.72rem] ${item.done ? 'text-[#94a3b8]' : 'text-[#ff6b35]'}`}>
                          x{item.quantity}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Action */}
                  {order.status !== 'Served' && (
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => advanceStatus(order.id)}
                        className={`w-full py-2.5 rounded-xl text-[0.8rem] text-white transition-all cursor-pointer hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2 ${
                          order.status === 'New' ? 'bg-amber-500' : order.status === 'Preparing' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                      >
                        {order.status === 'New' && <><Flame className="w-4 h-4" /> Start Preparing</>}
                        {order.status === 'Preparing' && <><Check className="w-4 h-4" /> Mark Ready</>}
                        {order.status === 'Ready' && <><CheckCheck className="w-4 h-4" /> Mark Served</>}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <ChefHat className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-[0.9rem]">No orders in this category</p>
            <p className="text-white/15 text-[0.75rem] mt-1">Waiting for new orders...</p>
          </div>
        )}
      </div>

      {/* Bottom summary bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#22252d] border-t border-white/10 px-4 md:px-6 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          {counts.New > 0 && (
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
              </span>
              <span className="text-[0.72rem]">{counts.New} new</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-amber-400">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-[0.72rem]">{counts.Preparing} cooking</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-400">
            <Check className="w-3.5 h-3.5" />
            <span className="text-[0.72rem]">{counts.Ready} ready</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {orders.some(o => o.priority === 'rush' && o.status !== 'Served') && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-red-500/20 text-red-400 rounded-lg text-[0.7rem]">
              <AlertTriangle className="w-3 h-3" /> Rush orders active
            </span>
          )}
          <span className="text-[0.68rem] text-white/40">{orders.filter(o => o.status === 'Served').length} served today</span>
        </div>
      </div>
    </div>
  );
}