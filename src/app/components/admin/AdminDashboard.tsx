import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Zap, LayoutDashboard, BookOpen, Package, Truck, FileText, ShoppingCart,
  TrendingUp, AlertTriangle, Star, DollarSign, ChevronDown,
  Edit, ToggleLeft, ToggleRight, Plus, Download, Search, Users, Phone, Mail, Clock, Calendar, X, Check, Save, Trash2,
  Banknote, CreditCard, Smartphone, QrCode, Flame, Award, Target, Activity, Store, BadgePercent,
  Receipt, Wallet, ArrowUpRight, ArrowDownRight, Eye, ChevronRight, Utensils, TrendingDown, BarChart3, Crown, Medal, Trophy,
  Grid3X3, Sun, Wheat, Cookie, Coffee, IceCreamCone, UtensilsCrossed, Beef, Salad, Soup, Grape, Sandwich, Pizza, Egg, Leaf, GlassWater, Cherry, Citrus, Palette, Tag, FolderOpen, ChevronUp, GripVertical, Layers,
  Upload, Image as ImageIcon, Link, Settings, AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart as RechartsPie, Pie, Area, AreaChart, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { toast, Toaster } from 'sonner';
import {
  menuItems, inventoryItems, suppliers as initialSuppliers, purchaseOrders as initialPOs, salesData, topDishes, employees, logoutUser,
  mockCompletedOrders, mockExpenses, categories as initialCategories,
  mockKitchenOrders, mockParcelOrders, waiterTables,
  type MenuItem, type MenuCategory, type InventoryItem, type Supplier, type PurchaseOrder, type Employee, type Order, type Expense,
  type RestaurantSettings, getSettings, saveSettings, getMenuItems, saveMenuItems,
  type KitchenOrder, type KitchenStatus, type ParcelOrder, type WaiterTable, getPerspectiveMode, type PerspectiveMode,
  getLanguage,
} from '../../data';
import { T, type Lang } from '../../translations';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { UserBadge } from '../auth/UserBadge';

const tabDefs = [
  { id: 'dashboard', tKey: 'a.dashboard', icon: LayoutDashboard },
  { id: 'operations', tKey: 'a.operations', icon: Activity },
  { id: 'menu', tKey: 'a.menu', icon: BookOpen },
  { id: 'inventory', tKey: 'a.inventory', icon: Package },
  { id: 'employees', tKey: 'a.employees', icon: Users },
  { id: 'suppliers', tKey: 'a.suppliers', icon: Truck },
  { id: 'orders', tKey: 'a.purchase.orders', icon: ShoppingCart },
  { id: 'expenses', tKey: 'a.expenses', icon: Wallet },
  { id: 'reports', tKey: 'a.reports', icon: FileText },
  { id: 'settings', tKey: 'a.settings', icon: Settings },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [lang] = useState<Lang>(() => getLanguage() as Lang);
  const L = (key: string) => T(key, lang);
  const tabs = useMemo(() => tabDefs.map(t => ({ ...t, label: T(t.tKey, lang) })), [lang]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuData, setMenuData] = useState<MenuItem[]>(() => getMenuItems());
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>(inventoryItems);
  const [supplierData, setSupplierData] = useState<Supplier[]>(initialSuppliers);
  const [poData, setPoData] = useState<PurchaseOrder[]>(initialPOs);
  const [ordersData, setOrdersData] = useState<Order[]>(mockCompletedOrders);
  const [expensesData, setExpensesData] = useState<Expense[]>(mockExpenses);
  const [categoriesData, setCategoriesData] = useState<MenuCategory[]>(initialCategories);

  // Persist menu changes to localStorage so other views (Cashier, etc.) pick them up
  useEffect(() => { saveMenuItems(menuData); }, [menuData]);

  const lowStockItems = inventoryData.filter((i) => i.stock_quantity <= i.threshold);

  const toggleAvailability = (id: string) => {
    setMenuData((prev) => prev.map((item) => item.id === id ? { ...item, availability: !item.availability } : item));
    toast.success('Item updated');
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-border flex flex-col shrink-0 hidden lg:flex">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { logoutUser(); navigate('/login', { replace: true }); }} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[0.85rem]">{L('a.back')}</span>
            </button>
            <UserBadge compact />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-foreground text-[0.9rem]">{L('a.title')}</p>
              <p className="text-muted-foreground text-[0.7rem]">{L('a.subtitle')}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.85rem] transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-40 flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 flex flex-col items-center gap-0.5 py-2 px-3 text-[0.55rem] cursor-pointer ${
              activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
        <div className="lg:hidden flex items-center gap-2 mb-4">
          <button onClick={() => navigate('/login')} className="text-muted-foreground cursor-pointer"><ArrowLeft className="w-5 h-5" /></button>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div>
          <span className="text-foreground flex-1">{L('a.subtitle')}</span>
          <UserBadge compact />
        </div>

        {activeTab === 'dashboard' && <DashboardView ordersData={ordersData} expensesData={expensesData} lowStockItems={lowStockItems} setActiveTab={setActiveTab} />}
        {activeTab === 'operations' && <LiveOperationsView />}
        {activeTab === 'menu' && <MenuView menuData={menuData} setMenuData={setMenuData} toggleAvailability={toggleAvailability} categoriesData={categoriesData} setCategoriesData={setCategoriesData} />}
        {activeTab === 'inventory' && <InventoryView inventoryData={inventoryData} setInventoryData={setInventoryData} supplierData={supplierData} />}
        {activeTab === 'employees' && <EmployeesView />}
        {activeTab === 'suppliers' && <SuppliersView supplierData={supplierData} setSupplierData={setSupplierData} />}
        {activeTab === 'orders' && <PurchaseOrdersView poData={poData} setPoData={setPoData} supplierData={supplierData} inventoryData={inventoryData} />}
        {activeTab === 'expenses' && <ExpensesView expensesData={expensesData} setExpensesData={setExpensesData} />}
        {activeTab === 'reports' && <ReportsView ordersData={ordersData} expensesData={expensesData} />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

/* ============== DASHBOARD ============== */
function DashboardView({ ordersData, expensesData, lowStockItems, setActiveTab }: { ordersData: Order[]; expensesData: Expense[]; lowStockItems: any[]; setActiveTab: (tab: string) => void }) {
  const totalRevenue = ordersData.reduce((s, o) => s + o.total_price, 0);
  const totalTax = ordersData.reduce((s, o) => s + o.tax, 0);
  const totalDiscount = ordersData.reduce((s, o) => s + o.discount, 0);
  const totalItemsSold = ordersData.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);
  const avgOrderValue = ordersData.length > 0 ? Math.round(totalRevenue / ordersData.length) : 0;

  // Dine In vs Take Away
  const dineInOrders = ordersData.filter(o => o.order_type === 'Dine In');
  const takeAwayOrders = ordersData.filter(o => o.order_type === 'Take Away');
  const dineInRevenue = dineInOrders.reduce((s, o) => s + o.total_price, 0);
  const takeAwayRevenue = takeAwayOrders.reduce((s, o) => s + o.total_price, 0);

  // Payment method breakdown
  const paymentMethods = ['Cash', 'Card', 'UPI', 'QR Code'];
  const paymentBreakdown = paymentMethods.map(method => ({
    method,
    count: ordersData.filter(o => o.payment_method === method).length,
    amount: ordersData.filter(o => o.payment_method === method).reduce((s, o) => s + o.total_price, 0),
  }));

  // Cash on hand
  const cashReceived = paymentBreakdown.find(p => p.method === 'Cash')?.amount || 0;
  const cashExpenses = expensesData.filter(e => e.paidVia === 'Cash').reduce((s, e) => s + e.amount, 0);
  const cashOnHand = cashReceived - cashExpenses;
  const totalExpenses = expensesData.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Order type pie data
  const orderTypePieData = [
    { name: 'Dine In', value: dineInOrders.length, color: '#FF6B35' },
    { name: 'Take Away', value: takeAwayOrders.length, color: '#22C55E' },
  ];

  // Payment pie data
  const paymentPieData = paymentBreakdown.filter(p => p.count > 0).map((p, i) => ({
    name: p.method, value: p.amount, color: ['#22C55E', '#3B82F6', '#8B5CF6', '#F97316'][i],
  }));

  // Hourly order volume
  const hourlyData = useMemo(() => {
    const hours: Record<number, { hour: string; orders: number; revenue: number }> = {};
    for (let h = 7; h <= 20; h++) {
      const label = h < 12 ? `${h}AM` : h === 12 ? '12PM' : `${h - 12}PM`;
      hours[h] = { hour: label, orders: 0, revenue: 0 };
    }
    ordersData.forEach(o => {
      const h = o.timestamp.getHours();
      if (hours[h]) { hours[h].orders++; hours[h].revenue += o.total_price; }
    });
    return Object.values(hours);
  }, [ordersData]);

  // Expense by category
  const expenseByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    expensesData.forEach(e => { cats[e.category] = (cats[e.category] || 0) + e.amount; });
    return Object.entries(cats).map(([cat, amt]) => ({ category: cat, amount: amt })).sort((a, b) => b.amount - a.amount);
  }, [expensesData]);

  const paymentIcons: Record<string, any> = { Cash: Banknote, Card: CreditCard, UPI: Smartphone, 'QR Code': QrCode };
  const paymentColors: Record<string, string> = { Cash: 'bg-green-50 text-green-600', Card: 'bg-blue-50 text-blue-600', UPI: 'bg-purple-50 text-purple-600', 'QR Code': 'bg-orange-50 text-orange-600' };

  return (
    <div>
      <h2 className="text-foreground mb-5">Dashboard Overview</h2>

      {/* Row 1 — Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Today's Revenue", value: `Rs.${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600', sub: `${ordersData.length} orders` },
          { label: 'Total Orders', value: ordersData.length, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600', sub: `${totalItemsSold} items sold` },
          { label: 'Avg Order Value', value: `Rs.${avgOrderValue}`, icon: TrendingUp, color: 'bg-orange-50 text-orange-600', sub: `Tax: Rs.${totalTax.toLocaleString()}` },
          { label: 'Low Stock Items', value: lowStockItems.length, icon: AlertTriangle, color: 'bg-red-50 text-red-600', sub: 'Needs attention' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.color}`}><kpi.icon className="w-4.5 h-4.5" /></div>
            </div>
            <p className="text-foreground text-[1.3rem] font-bold">{kpi.value}</p>
            <p className="text-muted-foreground text-[0.75rem]">{kpi.label}</p>
            <p className="text-muted-foreground text-[0.65rem] mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Row 2 — Cash & Profit Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2 text-green-100 text-[0.8rem]"><Banknote className="w-4 h-4" /> Cash On Hand</div>
          <p className="text-[1.5rem] font-bold">Rs.{cashOnHand.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-2 text-[0.75rem] text-green-100">
            <span className="flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> In: Rs.{cashReceived.toLocaleString()}</span>
            <span className="flex items-center gap-1"><ArrowDownRight className="w-3 h-3" /> Out: Rs.{cashExpenses.toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2 text-blue-100 text-[0.8rem]"><Receipt className="w-4 h-4" /> Total Expenses</div>
          <p className="text-[1.5rem] font-bold">Rs.{totalExpenses.toLocaleString()}</p>
          <button onClick={() => setActiveTab('expenses')} className="mt-2 text-[0.75rem] text-blue-100 hover:text-white flex items-center gap-1 cursor-pointer">View breakdown <ChevronRight className="w-3 h-3" /></button>
        </div>
        <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-red-600'} rounded-xl p-4 text-white`}>
          <div className="flex items-center gap-2 mb-2 text-white/80 text-[0.8rem]"><Wallet className="w-4 h-4" /> Net {netProfit >= 0 ? 'Profit' : 'Loss'}</div>
          <p className="text-[1.5rem] font-bold">Rs.{Math.abs(netProfit).toLocaleString()}</p>
          <p className="mt-2 text-[0.75rem] text-white/80">{totalDiscount > 0 ? `Discounts given: Rs.${totalDiscount.toLocaleString()}` : 'Revenue minus expenses'}</p>
        </div>
      </div>

      {/* Row 3 — Dine In vs Take Away + Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Dine In vs Take Away */}
        <div className="bg-white rounded-xl p-4 border border-border">
          <h3 className="text-foreground mb-4 text-[0.95rem]">Dine In vs Take Away</h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 shrink-0">
              <RechartsPie width={128} height={128} id="pie-order-type">
                  <Pie data={orderTypePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3}>
                    {orderTypePieData.map((entry, i) => <Cell key={`dine-${i}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`${v} orders`, n]} />
                </RechartsPie>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /><span className="text-[0.85rem] text-foreground">Dine In</span></div>
                <div className="text-right"><p className="text-foreground text-[0.9rem]">{dineInOrders.length} orders</p><p className="text-muted-foreground text-[0.7rem]">Rs.{dineInRevenue.toLocaleString()}</p></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-accent" /><span className="text-[0.85rem] text-foreground">Take Away</span></div>
                <div className="text-right"><p className="text-foreground text-[0.9rem]">{takeAwayOrders.length} orders</p><p className="text-muted-foreground text-[0.7rem]">Rs.{takeAwayRevenue.toLocaleString()}</p></div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border text-[0.85rem]">
                <span className="text-muted-foreground">Dine-in share</span>
                <span className="text-foreground">{ordersData.length > 0 ? Math.round(dineInOrders.length / ordersData.length * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-white rounded-xl p-4 border border-border">
          <h3 className="text-foreground mb-4 text-[0.95rem]">Payment Methods</h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 shrink-0">
              <RechartsPie width={128} height={128} id="pie-payment-method">
                  <Pie data={paymentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3}>
                    {paymentPieData.map((entry, i) => <Cell key={`pay-${i}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`Rs.${v.toLocaleString()}`, n]} />
                </RechartsPie>
            </div>
            <div className="flex-1 space-y-2">
              {paymentBreakdown.map(p => {
                const Icon = paymentIcons[p.method] || Banknote;
                return (
                  <div key={p.method} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${paymentColors[p.method]}`}><Icon className="w-3.5 h-3.5" /></div>
                      <div><p className="text-[0.8rem] text-foreground">{p.method}</p><p className="text-[0.65rem] text-muted-foreground">{p.count} orders</p></div>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.85rem] text-foreground">Rs.{p.amount.toLocaleString()}</p>
                      <p className="text-[0.65rem] text-muted-foreground">{totalRevenue > 0 ? Math.round(p.amount / totalRevenue * 100) : 0}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4 — Hourly Orders + Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-xl p-4 border border-border">
          <h3 className="text-foreground mb-4 text-[0.95rem]">Hourly Order Volume</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyData} id="bar-hourly-orders">
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis key="xaxis" dataKey="hour" stroke="#94A3B8" fontSize={10} />
              <YAxis key="yaxis" stroke="#94A3B8" fontSize={11} />
              <Tooltip key="tooltip" formatter={(v: number, n: string) => [n === 'orders' ? `${v} orders` : `Rs.${v.toLocaleString()}`, n === 'orders' ? 'Orders' : 'Revenue']} />
              <Bar key="bar-orders" dataKey="orders" fill="#FF6B35" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground text-[0.95rem]">Expense Breakdown</h3>
            <button onClick={() => setActiveTab('expenses')} className="text-primary text-[0.8rem] cursor-pointer hover:underline">View all</button>
          </div>
          <div className="space-y-2.5">
            {expenseByCategory.slice(0, 6).map(item => {
              const pct = totalExpenses > 0 ? Math.round(item.amount / totalExpenses * 100) : 0;
              return (
                <div key={item.category}>
                  <div className="flex items-center justify-between text-[0.8rem] mb-1">
                    <span className="text-foreground">{item.category}</span>
                    <span className="text-muted-foreground">Rs.{item.amount.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 5 — Recent Orders Table */}
      <div className="bg-white rounded-xl p-4 border border-border">
        <h3 className="text-foreground mb-3 text-[0.95rem]">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.82rem]">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-2 px-2">Order ID</th>
                <th className="text-left py-2 px-2">Customer</th>
                <th className="text-left py-2 px-2">Type</th>
                <th className="text-left py-2 px-2">Items</th>
                <th className="text-left py-2 px-2">Payment</th>
                <th className="text-right py-2 px-2">Amount</th>
                <th className="text-left py-2 px-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {ordersData.slice(-10).reverse().map(order => (
                <tr key={order.order_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-2 text-foreground">{order.order_id}</td>
                  <td className="py-2.5 px-2 text-foreground">{order.customer_name}</td>
                  <td className="py-2.5 px-2"><span className={`text-[0.7rem] px-2 py-0.5 rounded-full ${order.order_type === 'Dine In' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>{order.order_type}{order.table_number ? ` #${order.table_number}` : ''}</span></td>
                  <td className="py-2.5 px-2 text-muted-foreground max-w-[200px] truncate">{order.items.map(i => `${i.menuItem.name} x${i.quantity}`).join(', ')}</td>
                  <td className="py-2.5 px-2"><span className={`text-[0.7rem] px-2 py-0.5 rounded-full ${paymentColors[order.payment_method] || 'bg-muted text-muted-foreground'}`}>{order.payment_method}</span></td>
                  <td className="py-2.5 px-2 text-right text-foreground">Rs.{order.total_price.toLocaleString()}{order.discount > 0 ? <span className="text-[0.65rem] text-accent ml-1">(-{order.discount})</span> : ''}</td>
                  <td className="py-2.5 px-2 text-muted-foreground text-[0.75rem]">{order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============== LIVE OPERATIONS ============== */
function LiveOperationsView() {
  const mode = getPerspectiveMode() || 4;
  const [kitchenOrders] = useState<KitchenOrder[]>(() => mockKitchenOrders.map(o => ({ ...o, items: o.items.map(i => ({ ...i })) })));
  const [parcelOrders] = useState<ParcelOrder[]>(() => mockParcelOrders.map(o => ({ ...o, items: o.items.map(i => ({ ...i })) })));
  const [wTables] = useState<WaiterTable[]>(() => waiterTables.map(t => ({ ...t })));

  const getElapsed = (d: Date) => Math.floor((Date.now() - d.getTime()) / 60000);

  // Kitchen stats
  const kNew = kitchenOrders.filter(o => o.status === 'New').length;
  const kPrep = kitchenOrders.filter(o => o.status === 'Preparing').length;
  const kReady = kitchenOrders.filter(o => o.status === 'Ready').length;
  const kRush = kitchenOrders.filter(o => o.priority === 'rush' && o.status !== 'Served').length;
  const avgPrepTime = kitchenOrders.length > 0 ? Math.round(kitchenOrders.reduce((s, o) => s + getElapsed(o.created_at), 0) / kitchenOrders.length) : 0;

  // Parcel stats
  const pReceived = parcelOrders.filter(o => o.status === 'Received').length;
  const pPacking = parcelOrders.filter(o => o.status === 'Packing').length;
  const pReady = parcelOrders.filter(o => o.status === 'Ready').length;

  // Table stats
  const tOccupied = wTables.filter(t => t.status === 'occupied').length;
  const tAvailable = wTables.filter(t => t.status === 'available').length;
  const tReserved = wTables.filter(t => t.status === 'reserved').length;
  const tAttention = wTables.filter(t => t.status === 'needs_attention').length;
  const totalGuests = wTables.reduce((s, t) => s + t.guests, 0);
  const totalSeats = wTables.reduce((s, t) => s + t.seats, 0);
  const occupancy = totalSeats > 0 ? Math.round((totalGuests / totalSeats) * 100) : 0;

  // Waiter performance
  const waiterStats = ['Arun Selvam', 'Suresh Babu'].map(name => {
    const tables = wTables.filter(t => t.waiter === name);
    const orders = kitchenOrders.filter(o => o.waiter === name);
    const activeOrders = orders.filter(o => o.status !== 'Served');
    return { name, tables: tables.length, occupied: tables.filter(t => t.status === 'occupied').length, orders: activeOrders.length, attention: tables.filter(t => t.status === 'needs_attention').length };
  });

  const modeLabel = mode === 1 ? 'Solo Operator' : mode === 2 ? 'Cashier + Kitchen Manager' : 'Full Team (4 Perspectives)';

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-foreground">Live Operations</h2>
          <p className="text-muted-foreground text-[0.78rem] mt-0.5">Real-time view of all restaurant operations</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-xl">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-[0.75rem] text-foreground">{modeLabel}</span>
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" /></span>
        </div>
      </div>

      {/* ===== Top KPIs ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Flame className="w-4 h-4" /></div><span className="text-[0.78rem] text-muted-foreground">Kitchen Queue</span></div>
          <p className="text-[1.4rem] text-foreground">{kNew + kPrep}</p>
          <div className="flex items-center gap-2 mt-1 text-[0.65rem] text-muted-foreground"><span className="text-blue-600">{kNew} new</span><span>·</span><span className="text-amber-600">{kPrep} cooking</span><span>·</span><span className="text-green-600">{kReady} ready</span></div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><Package className="w-4 h-4" /></div><span className="text-[0.78rem] text-muted-foreground">Parcel Queue</span></div>
          <p className="text-[1.4rem] text-foreground">{pReceived + pPacking}</p>
          <div className="flex items-center gap-2 mt-1 text-[0.65rem] text-muted-foreground"><span className="text-blue-600">{pReceived} received</span><span>·</span><span className="text-amber-600">{pPacking} packing</span><span>·</span><span className="text-green-600">{pReady} pickup</span></div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Users className="w-4 h-4" /></div><span className="text-[0.78rem] text-muted-foreground">Table Occupancy</span></div>
          <p className="text-[1.4rem] text-foreground">{occupancy}%</p>
          <div className="flex items-center gap-2 mt-1 text-[0.65rem] text-muted-foreground"><span>{totalGuests}/{totalSeats} seats</span><span>·</span><span>{tOccupied}/{wTables.length} tables</span></div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><Clock className="w-4 h-4" /></div><span className="text-[0.78rem] text-muted-foreground">Avg Prep Time</span></div>
          <p className="text-[1.4rem] text-foreground">{avgPrepTime}m</p>
          <div className="flex items-center gap-2 mt-1 text-[0.65rem]">{kRush > 0 ? <span className="text-red-500 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" />{kRush} rush orders</span> : <span className="text-green-600">All on schedule</span>}</div>
        </div>
      </div>

      {/* ===== Alert banner ===== */}
      {(tAttention > 0 || kRush > 0) && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-[0.82rem] text-red-700">Attention Required</p>
            <p className="text-[0.72rem] text-red-600">
              {tAttention > 0 && `${tAttention} table(s) need attention. `}
              {kRush > 0 && `${kRush} rush order(s) in kitchen.`}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* ===== Kitchen Orders Pipeline ===== */}
        <div className="bg-white rounded-xl p-4 border border-border">
          <h3 className="text-foreground text-[0.95rem] mb-4 flex items-center gap-2"><Flame className="w-4 h-4 text-amber-500" /> Kitchen Pipeline</h3>
          <div className="space-y-2">
            {kitchenOrders.filter(o => o.status !== 'Served').map(o => {
              const elapsed = getElapsed(o.created_at);
              const doneCount = o.items.filter(i => i.done).length;
              return (
                <div key={o.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                  o.status === 'New' ? 'bg-blue-50/50 border-blue-200' : o.status === 'Preparing' ? 'bg-amber-50/50 border-amber-200' : 'bg-green-50/50 border-green-200'
                } ${o.priority === 'rush' ? 'ring-1 ring-red-300' : ''}`}>
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[0.6rem] shrink-0 ${
                    o.status === 'New' ? 'bg-blue-500' : o.status === 'Preparing' ? 'bg-amber-500' : 'bg-green-500'
                  }`}>{o.status === 'New' ? 'NEW' : o.status === 'Preparing' ? 'COOK' : 'RDY'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.78rem] text-foreground truncate">{o.order_id}</span>
                      {o.table_number && <span className="text-[0.6rem] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">T{o.table_number}</span>}
                      {o.priority === 'rush' && <Flame className="w-3 h-3 text-red-500 shrink-0" />}
                    </div>
                    <p className="text-[0.62rem] text-muted-foreground truncate">{o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-[0.72rem] ${elapsed >= 15 ? 'text-red-500' : elapsed >= 10 ? 'text-amber-600' : 'text-green-600'}`}>{elapsed}m</p>
                    <p className="text-[0.58rem] text-muted-foreground">{doneCount}/{o.items.length} done</p>
                  </div>
                </div>
              );
            })}
            {kitchenOrders.filter(o => o.status !== 'Served').length === 0 && (
              <p className="text-center text-muted-foreground text-[0.78rem] py-6">No active kitchen orders</p>
            )}
          </div>
        </div>

        {/* ===== Parcel Queue ===== */}
        <div className="bg-white rounded-xl p-4 border border-border">
          <h3 className="text-foreground text-[0.95rem] mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-purple-500" /> Parcel Queue</h3>
          <div className="space-y-2">
            {parcelOrders.filter(o => o.status !== 'Picked Up').map(o => {
              const elapsed = getElapsed(o.created_at);
              return (
                <div key={o.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                  o.status === 'Received' ? 'bg-blue-50/50 border-blue-200' : o.status === 'Packing' ? 'bg-amber-50/50 border-amber-200' : 'bg-green-50/50 border-green-200'
                }`}>
                  <span className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-[0.85rem] text-foreground shrink-0">#{o.token}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.78rem] text-foreground truncate">{o.customer_name}</span>
                      <span className={`text-[0.55rem] px-1.5 py-0.5 rounded-full ${
                        o.status === 'Received' ? 'bg-blue-100 text-blue-700' : o.status === 'Packing' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>{o.status}</span>
                    </div>
                    <p className="text-[0.62rem] text-muted-foreground truncate">{o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[0.75rem] text-[#ff6b35]">Rs.{o.total}</p>
                    <p className="text-[0.58rem] text-muted-foreground">{elapsed}m ago</p>
                  </div>
                </div>
              );
            })}
            {parcelOrders.filter(o => o.status !== 'Picked Up').length === 0 && (
              <p className="text-center text-muted-foreground text-[0.78rem] py-6">No active parcels</p>
            )}
          </div>
        </div>
      </div>

      {/* ===== Floor Map & Waiter Performance ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Table overview */}
        <div className="bg-white rounded-xl p-4 border border-border">
          <h3 className="text-foreground text-[0.95rem] mb-4 flex items-center gap-2"><UtensilsCrossed className="w-4 h-4 text-blue-500" /> Table Overview</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
            {wTables.map(t => {
              const colors: Record<string, string> = {
                available: 'bg-green-100 border-green-300 text-green-700',
                occupied: 'bg-blue-100 border-blue-300 text-blue-700',
                reserved: 'bg-amber-100 border-amber-300 text-amber-700',
                needs_attention: 'bg-red-100 border-red-300 text-red-700 animate-pulse',
              };
              return (
                <div key={t.id} className={`rounded-xl border p-2.5 text-center ${colors[t.status]}`}>
                  <p className="text-[0.82rem]">T{t.id}</p>
                  <p className="text-[0.58rem] opacity-70">{t.guests}/{t.seats}</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-[0.68rem]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-400" /> Available ({tAvailable})</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-400" /> Occupied ({tOccupied})</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400" /> Reserved ({tReserved})</span>
            {tAttention > 0 && <span className="flex items-center gap-1 text-red-600"><span className="w-2.5 h-2.5 rounded bg-red-400" /> Alert ({tAttention})</span>}
          </div>
        </div>

        {/* Waiter performance */}
        <div className="bg-white rounded-xl p-4 border border-border">
          <h3 className="text-foreground text-[0.95rem] mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-cyan-500" /> Waiter Performance</h3>
          <div className="space-y-3">
            {waiterStats.map(w => (
              <div key={w.name} className="p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
                    <div>
                      <p className="text-[0.82rem] text-foreground">{w.name}</p>
                      <p className="text-[0.62rem] text-muted-foreground">{w.tables} tables assigned</p>
                    </div>
                  </div>
                  {w.attention > 0 && <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[0.6rem]"><AlertTriangle className="w-2.5 h-2.5" />{w.attention}</span>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-white rounded-lg border border-border">
                    <p className="text-[1rem] text-foreground">{w.occupied}</p>
                    <p className="text-[0.58rem] text-muted-foreground">Serving</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg border border-border">
                    <p className="text-[1rem] text-foreground">{w.orders}</p>
                    <p className="text-[0.58rem] text-muted-foreground">Active Orders</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg border border-border">
                    <p className="text-[1rem] text-foreground">{w.tables - w.occupied}</p>
                    <p className="text-[0.58rem] text-muted-foreground">Free Tables</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Mode Info ===== */}
      <div className="bg-gradient-to-r from-primary/5 to-amber-50 rounded-xl p-5 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0"><Settings className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-[0.88rem] text-foreground mb-1">Operating Mode: {modeLabel}</p>
            <p className="text-[0.75rem] text-muted-foreground mb-2">
              {mode === 1 && 'You are running in solo mode. All operations are managed from the Cashier POS. This dashboard gives you a bird\'s-eye view of everything.'}
              {mode === 2 && 'Cashier handles billing while Kitchen Manager oversees kitchen, waiter assignments & parcel counter. This dashboard monitors both perspectives.'}
              {mode === 4 && 'Full team deployment with dedicated Cashier, Kitchen, Parcel & Waiter screens. This dashboard provides centralized monitoring of all 4 perspectives.'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {mode === 1 && ['Cashier POS', 'Admin Dashboard'].map(r => <span key={r} className="px-2 py-0.5 bg-white border border-border text-[0.65rem] text-foreground rounded-full">{r}</span>)}
              {mode === 2 && ['Cashier POS', 'Kitchen Manager', 'Admin Dashboard'].map(r => <span key={r} className="px-2 py-0.5 bg-white border border-border text-[0.65rem] text-foreground rounded-full">{r}</span>)}
              {mode === 4 && ['Cashier POS', 'Kitchen Display', 'Parcel Counter', 'Waiter View', 'Admin Dashboard'].map(r => <span key={r} className="px-2 py-0.5 bg-white border border-border text-[0.65rem] text-foreground rounded-full">{r}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============== ICON MAP ============== */
const adminIconMap: Record<string, any> = {
  Grid3X3, Sun, Wheat, Cookie, Coffee, IceCreamCone, UtensilsCrossed, Beef, Salad, Soup, Grape,
  Sandwich, Pizza, Egg, Leaf, GlassWater, Cherry, Citrus, Utensils, Star, Flame, ShoppingCart, BookOpen,
};
const ICON_OPTIONS = Object.keys(adminIconMap);
const COLOR_OPTIONS = ['#F59E0B', '#EF4444', '#F97316', '#8B5CF6', '#EC4899', '#22C55E', '#3B82F6', '#14B8A6', '#6366F1', '#D946EF', '#0EA5E9', '#A855F7'];

/* ============== MENU MANAGEMENT ============== */
function MenuView({ menuData, setMenuData, toggleAvailability, categoriesData, setCategoriesData }: {
  menuData: MenuItem[]; setMenuData: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  toggleAvailability: (id: string) => void;
  categoriesData: MenuCategory[]; setCategoriesData: React.Dispatch<React.SetStateAction<MenuCategory[]>>;
}) {
  const [filterCat, setFilterCat] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const [editCat, setEditCat] = useState<MenuCategory | null>(null);
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  const dynamicCats = categoriesData.filter(c => c.id !== 'all');
  const filtered = filterCat === 'all' ? menuData : menuData.filter((m) => m.category === filterCat);
  const getItemCount = (catId: string) => catId === 'all' ? menuData.length : menuData.filter(m => m.category === catId).length;

  const handleAdd = (item: MenuItem) => { setMenuData(prev => [...prev, item]); setShowAddModal(false); toast.success(`${item.name} added to menu`); };
  const handleEdit = (item: MenuItem) => { setMenuData(prev => prev.map(m => m.id === item.id ? item : m)); setEditItem(null); toast.success(`${item.name} updated`); };
  const handleDelete = (id: string) => { setMenuData(prev => prev.filter(m => m.id !== id)); toast.success('Item removed from menu'); };

  const handleSaveCategory = (cat: MenuCategory) => {
    setCategoriesData(prev => {
      const exists = prev.find(c => c.id === cat.id);
      if (exists) return prev.map(c => c.id === cat.id ? cat : c);
      return [...prev, cat];
    });
    setEditCat(null);
    setShowAddCatModal(false);
    toast.success(`Category "${cat.name}" saved`);
  };

  const handleDeleteCategory = (catId: string) => {
    const itemCount = menuData.filter(m => m.category === catId).length;
    if (itemCount > 0) {
      toast.error(`Cannot delete: ${itemCount} items still in this category. Reassign them first.`);
      return;
    }
    setCategoriesData(prev => prev.filter(c => c.id !== catId));
    if (filterCat === catId) setFilterCat('all');
    toast.success('Category deleted');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-foreground">Menu Management</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowCategoryPanel(!showCategoryPanel)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.85rem] transition-all cursor-pointer ${showCategoryPanel ? 'bg-foreground text-white' : 'bg-white border border-border text-muted-foreground hover:bg-muted'}`}>
            <Layers className="w-4 h-4" /> Categories
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-[0.85rem] hover:brightness-110 transition-all cursor-pointer">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* ===== CATEGORY MANAGEMENT PANEL ===== */}
      {showCategoryPanel && (
        <div className="bg-white rounded-xl border border-border p-4 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground text-[0.95rem]">Manage Categories</h3>
              <p className="text-muted-foreground text-[0.75rem]">{dynamicCats.length} categories · {menuData.length} total items</p>
            </div>
            <button onClick={() => setShowAddCatModal(true)} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-[0.8rem] hover:brightness-110 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> New Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dynamicCats.map(cat => {
              const Icon = adminIconMap[cat.icon] || Tag;
              const count = getItemCount(cat.id);
              return (
                <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + '18' }}>
                    <Icon className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-foreground text-[0.88rem] truncate">{cat.name}</p>
                      <span className="text-[0.65rem] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">{count} items</span>
                    </div>
                    {cat.description && <p className="text-muted-foreground text-[0.7rem] truncate">{cat.description}</p>}
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => setEditCat(cat)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category filter pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {categoriesData.map((cat) => {
          const Icon = adminIconMap[cat.icon] || Tag;
          const count = getItemCount(cat.id);
          return (
            <button key={cat.id} onClick={() => setFilterCat(cat.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.8rem] whitespace-nowrap transition-all cursor-pointer ${filterCat === cat.id ? 'text-white' : 'bg-white border border-border text-muted-foreground hover:bg-muted'}`} style={filterCat === cat.id ? { backgroundColor: cat.color } : {}}>
              <Icon className="w-3.5 h-3.5" />
              {cat.name}
              <span className={`text-[0.65rem] px-1 rounded ${filterCat === cat.id ? 'bg-white/20' : 'bg-muted'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Menu items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => {
          const cat = categoriesData.find(c => c.id === item.category);
          return (
            <div key={item.id} className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                {cat && <span className="absolute top-2 left-2 text-[0.65rem] px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: cat.color }}>{cat.name}</span>}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-foreground text-[0.9rem]">{item.name}</p>
                  <span className="text-primary text-[0.9rem]">Rs.{item.price}</span>
                </div>
                <p className="text-muted-foreground text-[0.75rem] mb-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-[0.7rem] px-2 py-0.5 rounded-full ${item.availability ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {item.availability ? 'Available' : 'Unavailable'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditItem(item)} className="text-muted-foreground hover:text-foreground cursor-pointer"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    <button onClick={() => toggleAvailability(item.id)} className="text-muted-foreground hover:text-accent cursor-pointer">
                      {item.availability ? <ToggleRight className="w-5 h-5 text-accent" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && <MenuItemModal onClose={() => setShowAddModal(false)} onSave={handleAdd} cats={dynamicCats} />}
      {editItem && <MenuItemModal item={editItem} onClose={() => setEditItem(null)} onSave={handleEdit} cats={dynamicCats} />}
      {(showAddCatModal || editCat) && <CategoryModal cat={editCat} onClose={() => { setEditCat(null); setShowAddCatModal(false); }} onSave={handleSaveCategory} existingIds={categoriesData.map(c => c.id)} />}
    </div>
  );
}

/* ============== CATEGORY MODAL ============== */
function CategoryModal({ cat, onClose, onSave, existingIds }: { cat?: MenuCategory | null; onClose: () => void; onSave: (cat: MenuCategory) => void; existingIds: string[] }) {
  const [form, setForm] = useState({
    name: cat?.name || '', icon: cat?.icon || 'Utensils', color: cat?.color || '#F59E0B', description: cat?.description || '',
  });

  const generateId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    const id = cat?.id || generateId(form.name);
    if (!cat && existingIds.includes(id)) { toast.error('A category with this name already exists'); return; }
    onSave({ id, name: form.name.trim(), icon: form.icon, color: form.color, description: form.description.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-foreground">{cat ? 'Edit Category' : 'New Category'}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-5 h-5" /></button>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: form.color + '18' }}>
              {(() => { const I = adminIconMap[form.icon] || Tag; return <I className="w-6 h-6" style={{ color: form.color }} />; })()}
            </div>
            <div><p className="text-foreground text-[0.92rem]">{form.name || 'Category Name'}</p><p className="text-muted-foreground text-[0.72rem]">{form.description || 'Description'}</p></div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[0.75rem] text-muted-foreground mb-1 block">Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Appetizers" />
            </div>
            <div>
              <label className="text-[0.75rem] text-muted-foreground mb-1 block">Description</label>
              <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Brief description of category" />
            </div>

            {/* Color Picker */}
            <div>
              <label className="text-[0.75rem] text-muted-foreground mb-2 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })} className={`w-8 h-8 rounded-lg cursor-pointer transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="text-[0.75rem] text-muted-foreground mb-2 block">Icon</label>
              <div className="grid grid-cols-8 gap-1.5 max-h-[120px] overflow-y-auto p-1">
                {ICON_OPTIONS.map(iconName => {
                  const I = adminIconMap[iconName];
                  return (
                    <button key={iconName} onClick={() => setForm({ ...form, icon: iconName })} className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all ${form.icon === iconName ? 'bg-foreground text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                      <I className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-[0.85rem] hover:brightness-110 transition-all cursor-pointer">{cat ? 'Save Changes' : 'Create Category'}</button>
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-border rounded-lg text-[0.85rem] hover:bg-muted transition-all cursor-pointer">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============== MENU ITEM MODAL ============== */
function MenuItemModal({ item, onClose, onSave, cats }: { item?: MenuItem; onClose: () => void; onSave: (item: MenuItem) => void; cats: MenuCategory[] }) {
  const [form, setForm] = useState({
    name: item?.name || '', price: item?.price?.toString() || '', category: item?.category || (cats[0]?.id || 'breakfast'),
    description: item?.description || '', image: item?.image || '', availability: item?.availability ?? true,
  });
  const [imageTab, setImageTab] = useState<'upload' | 'url'>(item?.image?.startsWith('data:') ? 'upload' : 'url');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file (JPG, PNG, WebP)'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setForm(prev => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const clearImage = () => {
    setForm(prev => ({ ...prev, image: '' }));
    setUploadFileName('');
  };

  const handleSubmit = () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    onSave({
      id: item?.id || `M${Date.now()}`,
      name: form.name,
      price: Number(form.price),
      category: form.category,
      description: form.description,
      image: form.image || 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      availability: form.availability,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-foreground">{item ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[0.75rem] text-muted-foreground mb-1 block">Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Dish name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[0.75rem] text-muted-foreground mb-1 block">Price (Rs.) *</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="99" />
              </div>
              <div>
                <label className="text-[0.75rem] text-muted-foreground mb-1 block">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[0.75rem] text-muted-foreground mb-1 block">Description</label>
              <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Brief description" />
            </div>

            {/* Image Section with Upload + URL tabs */}
            <div>
              <label className="text-[0.75rem] text-muted-foreground mb-1.5 block">Dish Image</label>
              <div className="flex gap-1 mb-2 bg-muted rounded-lg p-0.5">
                <button
                  onClick={() => setImageTab('upload')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[0.78rem] transition-all cursor-pointer ${imageTab === 'upload' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload
                </button>
                <button
                  onClick={() => setImageTab('url')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[0.78rem] transition-all cursor-pointer ${imageTab === 'url' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Link className="w-3.5 h-3.5" /> URL
                </button>
              </div>

              {imageTab === 'upload' ? (
                <div>
                  {form.image && (form.image.startsWith('data:') || form.image.startsWith('http')) ? (
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <img src={form.image} alt="Preview" className="w-full h-36 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-center justify-between">
                        <span className="text-white text-[0.72rem] truncate max-w-[200px]">
                          {uploadFileName || 'Current image'}
                        </span>
                        <div className="flex gap-1.5">
                          <label className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/30 cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
                          </label>
                          <button
                            onClick={clearImage}
                            className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-red-500/60 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                        isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/50'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${isDragging ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <p className="text-foreground text-[0.82rem] mb-0.5">
                        {isDragging ? 'Drop image here' : 'Click to upload or drag & drop'}
                      </p>
                      <p className="text-muted-foreground text-[0.68rem]">JPG, PNG or WebP · Max 5MB</p>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
                    </label>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={form.image.startsWith('data:') ? '' : form.image}
                    onChange={e => setForm({ ...form, image: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="https://images.unsplash.com/..."
                  />
                  {form.image && !form.image.startsWith('data:') && form.image.startsWith('http') && (
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <img src={form.image} alt="URL Preview" className="w-full h-28 object-cover" />
                      <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500/70 cursor-pointer transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[0.75rem] text-muted-foreground">Available</label>
              <button onClick={() => setForm({ ...form, availability: !form.availability })} className="cursor-pointer">
                {form.availability ? <ToggleRight className="w-6 h-6 text-accent" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
              </button>
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-[0.85rem] hover:brightness-110 transition-all cursor-pointer">{item ? 'Save Changes' : 'Add Item'}</button>
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-border rounded-lg text-[0.85rem] hover:bg-muted transition-all cursor-pointer">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============== INVENTORY ============== */
function InventoryView({ inventoryData, setInventoryData, supplierData }: { inventoryData: InventoryItem[]; setInventoryData: React.Dispatch<React.SetStateAction<InventoryItem[]>>; supplierData: Supplier[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editStock, setEditStock] = useState<{ id: string; qty: string } | null>(null);

  const handleAdd = (item: InventoryItem) => { setInventoryData(prev => [...prev, item]); setShowAddModal(false); toast.success(`${item.ingredient} added to inventory`); };
  const handleEdit = (item: InventoryItem) => { setInventoryData(prev => prev.map(i => i.id === item.id ? item : i)); setEditItem(null); toast.success(`${item.ingredient} updated`); };
  const handleUpdateStock = (id: string, newQty: number) => {
    setInventoryData(prev => prev.map(i => i.id === id ? { ...i, stock_quantity: newQty, last_purchase: new Date().toISOString().split('T')[0] } : i));
    setEditStock(null);
    toast.success('Stock updated');
  };
  const handleDelete = (id: string) => { setInventoryData(prev => prev.filter(i => i.id !== id)); toast.success('Item removed'); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-foreground">Inventory Management</h2>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-[0.85rem] hover:brightness-110 transition-all cursor-pointer">
          <Plus className="w-4 h-4" /> Add Ingredient
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[0.85rem]">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="text-left py-3 px-4">Ingredient</th>
                <th className="text-right py-3 px-4">Stock</th>
                <th className="text-right py-3 px-4">Threshold</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Supplier</th>
                <th className="text-left py-3 px-4">Last Purchase</th>
                <th className="text-right py-3 px-4">Cost/Unit</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((item) => {
                const isLow = item.stock_quantity <= item.threshold;
                const supplier = supplierData.find((s) => s.id === item.supplier_id);
                return (
                  <tr key={item.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-foreground">{item.ingredient}</td>
                    <td className={`py-3 px-4 text-right ${isLow ? 'text-destructive' : 'text-foreground'}`}>
                      {editStock?.id === item.id ? (
                        <div className="flex items-center gap-1 justify-end">
                          <input type="number" value={editStock.qty} onChange={e => setEditStock({ ...editStock, qty: e.target.value })} className="w-16 px-1 py-0.5 border border-border rounded text-right text-[0.8rem]" autoFocus />
                          <button onClick={() => handleUpdateStock(item.id, Number(editStock.qty))} className="text-accent cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditStock(null)} className="text-destructive cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setEditStock({ id: item.id, qty: item.stock_quantity.toString() })} className="hover:underline cursor-pointer">{item.stock_quantity} {item.unit}</button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{item.threshold} {item.unit}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[0.7rem] px-2 py-0.5 rounded-full ${isLow ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{supplier?.name || '-'}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.last_purchase}</td>
                    <td className="py-3 px-4 text-right text-foreground">Rs.{item.cost_per_unit}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setEditItem(item)} className="text-muted-foreground hover:text-primary cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && <InventoryModal suppliers={supplierData} onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
      {editItem && <InventoryModal item={editItem} suppliers={supplierData} onClose={() => setEditItem(null)} onSave={handleEdit} />}
    </div>
  );
}

function InventoryModal({ item, suppliers, onClose, onSave }: { item?: InventoryItem; suppliers: Supplier[]; onClose: () => void; onSave: (item: InventoryItem) => void }) {
  const [form, setForm] = useState({
    ingredient: item?.ingredient || '', stock_quantity: item?.stock_quantity?.toString() || '', unit: item?.unit || 'kg',
    supplier_id: item?.supplier_id || suppliers[0]?.id || '1', threshold: item?.threshold?.toString() || '', cost_per_unit: item?.cost_per_unit?.toString() || '',
  });

  const handleSubmit = () => {
    if (!form.ingredient || !form.stock_quantity) { toast.error('Fill required fields'); return; }
    onSave({
      id: item?.id || `INV${Date.now()}`,
      ingredient: form.ingredient, stock_quantity: Number(form.stock_quantity), unit: form.unit,
      supplier_id: form.supplier_id, threshold: Number(form.threshold) || 5,
      last_purchase: new Date().toISOString().split('T')[0], cost_per_unit: Number(form.cost_per_unit) || 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-foreground">{item ? 'Edit Ingredient' : 'Add Ingredient'}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-3">
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Ingredient Name *</label><input type="text" value={form.ingredient} onChange={e => setForm({ ...form, ingredient: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Quantity *</label><input type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
              <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Unit</label><select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] bg-white">{['kg', 'L', 'pcs', 'dozen'].map(u => <option key={u} value={u}>{u}</option>)}</select></div>
              <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Threshold</label><input type="number" value={form.threshold} onChange={e => setForm({ ...form, threshold: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            </div>
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Supplier</label><select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] bg-white">{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Cost per Unit (Rs.)</label><input type="number" value={form.cost_per_unit} onChange={e => setForm({ ...form, cost_per_unit: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-[0.85rem] hover:brightness-110 cursor-pointer">{item ? 'Save' : 'Add'}</button>
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-border rounded-lg text-[0.85rem] hover:bg-muted cursor-pointer">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============== EMPLOYEES ============== */
function EmployeesView() {
  const [employeeData, setEmployeeData] = useState<Employee[]>(employees);
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const roles = ['all', 'Chef', 'Cashier', 'Waiter', 'Kitchen Helper', 'Manager', 'Delivery'];
  const filtered = employeeData.filter((e) => {
    const matchesRole = filterRole === 'all' || e.role === filterRole;
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const statusColors: Record<string, string> = { Active: 'bg-green-50 text-green-600', 'On Leave': 'bg-amber-50 text-amber-600', Inactive: 'bg-red-50 text-red-600' };
  const shiftColors: Record<string, string> = { Morning: 'bg-orange-50 text-orange-600', Afternoon: 'bg-blue-50 text-blue-600', Night: 'bg-purple-50 text-purple-600', Flexible: 'bg-teal-50 text-teal-600' };

  const activeCount = employeeData.filter(e => e.status === 'Active').length;
  const onLeaveCount = employeeData.filter(e => e.status === 'On Leave').length;
  const totalPayroll = employeeData.filter(e => e.status !== 'Inactive').reduce((s, e) => s + (e.salaryType === 'Daily' ? e.salary * 26 : e.salary), 0);

  const toggleStatus = (id: string) => {
    setEmployeeData(prev => prev.map(e => e.id === id ? { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' as Employee['status'] } : e));
    toast.success('Status updated');
  };

  const deleteEmployee = (id: string) => {
    setEmployeeData(prev => prev.filter(e => e.id !== id));
    setSelectedEmployee(null);
    toast.success('Employee removed');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-foreground">Employee Management</h2>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-[0.85rem] hover:brightness-110 transition-all cursor-pointer">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Staff', value: employeeData.length, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active', value: activeCount, icon: Check, color: 'bg-green-50 text-green-600' },
          { label: 'On Leave', value: onLeaveCount, icon: Calendar, color: 'bg-amber-50 text-amber-600' },
          { label: 'Monthly Payroll', value: `Rs.${(totalPayroll / 1000).toFixed(0)}K`, icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2"><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.color}`}><k.icon className="w-4 h-4" /></div></div>
            <p className="text-foreground text-[1.2rem] font-bold">{k.value}</p>
            <p className="text-muted-foreground text-[0.75rem]">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-[0.85rem] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {roles.map(role => (
            <button key={role} onClick={() => setFilterRole(role)} className={`px-3 py-1.5 rounded-full text-[0.8rem] whitespace-nowrap transition-all cursor-pointer ${filterRole === role ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:bg-muted'}`}>
              {role === 'all' ? 'All Roles' : role}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(emp => (
          <div key={emp.id} className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEmployee(emp)}>
            <div className="flex items-start gap-3 mb-3">
              <ImageWithFallback src={emp.avatar} alt={emp.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-foreground text-[0.9rem] truncate font-bold">{emp.name}</p>
                  <span className={`text-[0.65rem] px-2 py-0.5 rounded-full whitespace-nowrap ${statusColors[emp.status]}`}>{emp.status}</span>
                </div>
                <p className="text-muted-foreground text-[0.75rem]">{emp.role}</p>
                <p className="text-muted-foreground text-[0.7rem]">{emp.id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[0.78rem] mb-3">
              <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="w-3.5 h-3.5" /><span className={`px-1.5 py-0.5 rounded text-[0.7rem] ${shiftColors[emp.shift]}`}>{emp.shift}</span></div>
              <div className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="w-3.5 h-3.5" /><span>{emp.joined}</span></div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div>
                <p className="text-[0.7rem] text-muted-foreground">Salary</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-foreground text-[0.85rem]">Rs.{emp.salary.toLocaleString()}</p>
                  <span className={`text-[0.6rem] px-1.5 py-0.5 rounded ${emp.salaryType === 'Daily' ? 'bg-cyan-50 text-cyan-600' : 'bg-indigo-50 text-indigo-600'}`}>/{emp.salaryType === 'Daily' ? 'day' : 'mo'}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[0.7rem] text-muted-foreground">Attendance</p>
                <p className={`text-[0.85rem] ${emp.attendance >= 90 ? 'text-green-600' : emp.attendance >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{emp.attendance}%</p>
              </div>
              <button onClick={e => { e.stopPropagation(); toggleStatus(emp.id); }} className="text-muted-foreground hover:text-accent cursor-pointer" title={emp.status === 'Active' ? 'Deactivate' : 'Activate'}>
                {emp.status === 'Active' ? <ToggleRight className="w-5 h-5 text-accent" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              <button onClick={e => { e.stopPropagation(); setEditingEmployee(emp); }} className="text-muted-foreground hover:text-primary cursor-pointer" title="Edit"><Edit className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground"><Users className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No employees found</p></div>}
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEmployee(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-foreground">Employee Details</h3>
                <button onClick={() => setSelectedEmployee(null)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-4 mb-5">
                <ImageWithFallback src={selectedEmployee.avatar} alt={selectedEmployee.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <p className="text-foreground text-[1rem]">{selectedEmployee.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground text-[0.85rem]">{selectedEmployee.role}</p>
                    <span className={`text-[0.7rem] px-2 py-0.5 rounded-full ${statusColors[selectedEmployee.status]}`}>{selectedEmployee.status}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-[0.85rem]">
                {[
                  { icon: Phone, label: 'Phone', value: selectedEmployee.phone },
                  { icon: Mail, label: 'Email', value: selectedEmployee.email },
                  { icon: Clock, label: 'Shift', value: selectedEmployee.shift },
                  { icon: Calendar, label: 'Joined', value: selectedEmployee.joined },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <row.icon className="w-4 h-4 text-muted-foreground" />
                    <div><p className="text-[0.7rem] text-muted-foreground">{row.label}</p><p className="text-foreground">{row.value}</p></div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-[0.7rem] text-muted-foreground">{selectedEmployee.salaryType === 'Daily' ? 'Daily Wage' : 'Monthly Salary'}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-foreground text-[1rem]">Rs.{selectedEmployee.salary.toLocaleString()}</p>
                      <span className={`text-[0.6rem] px-1.5 py-0.5 rounded ${selectedEmployee.salaryType === 'Daily' ? 'bg-cyan-50 text-cyan-600' : 'bg-indigo-50 text-indigo-600'}`}>/{selectedEmployee.salaryType === 'Daily' ? 'day' : 'mo'}</span>
                    </div>
                    {selectedEmployee.salaryType === 'Daily' && <p className="text-[0.65rem] text-muted-foreground mt-1">~Rs.{(selectedEmployee.salary * 26).toLocaleString()}/mo (26 days)</p>}
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-[0.7rem] text-muted-foreground">Attendance</p>
                    <p className={`text-[1rem] ${selectedEmployee.attendance >= 90 ? 'text-green-600' : selectedEmployee.attendance >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{selectedEmployee.attendance}%</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => { setEditingEmployee(selectedEmployee); setSelectedEmployee(null); }} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-[0.85rem] hover:brightness-110 transition-all cursor-pointer"><Edit className="w-4 h-4" /> Edit</button>
                <button onClick={() => { toggleStatus(selectedEmployee.id); setSelectedEmployee(null); }} className="flex-1 px-4 py-2.5 bg-white border border-border rounded-lg text-[0.85rem] hover:bg-muted transition-all cursor-pointer">{selectedEmployee.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => deleteEmployee(selectedEmployee.id)} className="px-4 py-2.5 bg-white border border-destructive/30 text-destructive rounded-lg text-[0.85rem] hover:bg-red-50 transition-all cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && <EmployeeFormModal onClose={() => setShowAddModal(false)} onSave={(emp) => { setEmployeeData(prev => [...prev, emp]); setShowAddModal(false); toast.success(`${emp.name} added`); }} />}
      {editingEmployee && <EmployeeFormModal employee={editingEmployee} onClose={() => setEditingEmployee(null)} onSave={(emp) => { setEmployeeData(prev => prev.map(e => e.id === emp.id ? emp : e)); setEditingEmployee(null); toast.success(`${emp.name} updated`); }} />}
    </div>
  );
}

function EmployeeFormModal({ employee, onClose, onSave }: { employee?: Employee; onClose: () => void; onSave: (emp: Employee) => void }) {
  const [form, setForm] = useState({
    name: employee?.name || '', role: employee?.role || 'Waiter' as Employee['role'],
    phone: employee?.phone || '', email: employee?.email || '',
    shift: employee?.shift || 'Morning' as Employee['shift'],
    salary: employee?.salary?.toString() || '', salaryType: employee?.salaryType || 'Monthly' as Employee['salaryType'],
    status: employee?.status || 'Active' as Employee['status'],
  });

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.email) { toast.error('Fill required fields'); return; }
    onSave({
      id: employee?.id || `E${String(Date.now()).slice(-4)}`,
      name: form.name, role: form.role, phone: form.phone, email: form.email,
      avatar: employee?.avatar || 'https://images.unsplash.com/photo-1728631191055-aa24c9eff7f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      status: form.status, shift: form.shift, joined: employee?.joined || new Date().toISOString().split('T')[0],
      salary: Number(form.salary) || (form.salaryType === 'Daily' ? 500 : 15000),
      salaryType: form.salaryType, attendance: employee?.attendance || 100,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-foreground">{employee ? 'Edit Employee' : 'Add New Employee'}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-3">
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Full Name *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Enter full name" /></div>
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Role</label><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Employee['role'] })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] bg-white">{['Chef', 'Cashier', 'Waiter', 'Kitchen Helper', 'Manager', 'Delivery'].map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Phone *</label><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="+91 XXXXX XXXXX" /></div>
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Email *</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="name@nnkadai.com" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Shift</label><select value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value as Employee['shift'] })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] bg-white">{['Morning', 'Afternoon', 'Night', 'Flexible'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              {employee && <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Employee['status'] })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] bg-white">{['Active', 'On Leave', 'Inactive'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>}
            </div>
            <div>
              <label className="text-[0.75rem] text-muted-foreground mb-1 block">Pay Type</label>
              <div className="flex gap-2">
                {(['Monthly', 'Daily'] as const).map(type => (
                  <button key={type} type="button" onClick={() => setForm({ ...form, salaryType: type })} className={`flex-1 py-2 rounded-lg text-[0.85rem] transition-all cursor-pointer ${form.salaryType === type ? (type === 'Monthly' ? 'bg-indigo-50 text-indigo-600 border-2 border-indigo-200' : 'bg-cyan-50 text-cyan-600 border-2 border-cyan-200') : 'bg-white border border-border text-muted-foreground hover:bg-muted'}`}>
                    {type === 'Daily' ? 'Daily Wage' : 'Monthly'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[0.75rem] text-muted-foreground mb-1 block">{form.salaryType === 'Daily' ? 'Daily Wage (Rs.)' : 'Monthly Salary (Rs.)'}</label>
              <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder={form.salaryType === 'Daily' ? '500' : '15000'} />
              {form.salaryType === 'Daily' && form.salary && <p className="text-[0.7rem] text-muted-foreground mt-1">~Rs.{(Number(form.salary) * 26).toLocaleString()}/month (26 working days)</p>}
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-[0.85rem] hover:brightness-110 cursor-pointer">{employee ? 'Save Changes' : 'Add Employee'}</button>
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-border rounded-lg text-[0.85rem] hover:bg-muted cursor-pointer">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============== SUPPLIERS ============== */
function SuppliersView({ supplierData, setSupplierData }: { supplierData: Supplier[]; setSupplierData: React.Dispatch<React.SetStateAction<Supplier[]>> }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);

  const handleAdd = (s: Supplier) => { setSupplierData(prev => [...prev, s]); setShowAddModal(false); toast.success(`${s.name} added`); };
  const handleEdit = (s: Supplier) => { setSupplierData(prev => prev.map(x => x.id === s.id ? s : x)); setEditSupplier(null); toast.success(`${s.name} updated`); };
  const handleDelete = (id: string) => { setSupplierData(prev => prev.filter(s => s.id !== id)); toast.success('Supplier removed'); };
  const toggleActive = (id: string) => { setSupplierData(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s)); toast.success('Status updated'); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-foreground">Supplier Management</h2>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-[0.85rem] hover:brightness-110 transition-all cursor-pointer"><Plus className="w-4 h-4" /> Add Supplier</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {supplierData.map(supplier => (
          <div key={supplier.id} className={`bg-white rounded-xl border p-4 ${supplier.status === 'Inactive' ? 'border-red-200 opacity-60' : 'border-border'}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-foreground">{supplier.name}</h4>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[0.75rem] text-amber-500"><Star className="w-3.5 h-3.5 fill-amber-400" />{supplier.rating}</div>
                <span className={`text-[0.6rem] px-1.5 py-0.5 rounded-full ${supplier.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{supplier.status}</span>
              </div>
            </div>
            <div className="space-y-2 text-[0.8rem]">
              <p className="text-muted-foreground"><span className="text-foreground">Contact: </span>{supplier.contact}</p>
              <p className="text-muted-foreground"><span className="text-foreground">Email: </span>{supplier.email}</p>
              <p className="text-muted-foreground"><span className="text-foreground">Schedule: </span>{supplier.delivery_schedule}</p>
              <p className="text-muted-foreground"><span className="text-foreground">Payment: </span>{supplier.payment_terms}</p>
              <div><span className="text-foreground">Products: </span><div className="flex flex-wrap gap-1 mt-1">{supplier.products.map(p => <span key={p} className="text-[0.7rem] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">{p}</span>)}</div></div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
              <button onClick={() => setEditSupplier(supplier)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-muted rounded-lg text-[0.8rem] hover:bg-border cursor-pointer"><Edit className="w-3.5 h-3.5" /> Edit</button>
              <button onClick={() => toggleActive(supplier.id)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-muted rounded-lg text-[0.8rem] hover:bg-border cursor-pointer">
                {supplier.status === 'Active' ? <ToggleRight className="w-4 h-4 text-accent" /> : <ToggleLeft className="w-4 h-4" />}
                {supplier.status === 'Active' ? 'Active' : 'Inactive'}
              </button>
              <button onClick={() => handleDelete(supplier.id)} className="px-2 py-1.5 bg-muted rounded-lg text-[0.8rem] hover:bg-red-50 text-destructive cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && <SupplierFormModal onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
      {editSupplier && <SupplierFormModal supplier={editSupplier} onClose={() => setEditSupplier(null)} onSave={handleEdit} />}
    </div>
  );
}

function SupplierFormModal({ supplier, onClose, onSave }: { supplier?: Supplier; onClose: () => void; onSave: (s: Supplier) => void }) {
  const [form, setForm] = useState({
    name: supplier?.name || '', contact: supplier?.contact || '', email: supplier?.email || '',
    products: supplier?.products.join(', ') || '', delivery_schedule: supplier?.delivery_schedule || '',
    payment_terms: supplier?.payment_terms || 'Net 15', rating: supplier?.rating?.toString() || '4.0',
  });

  const handleSubmit = () => {
    if (!form.name || !form.contact) { toast.error('Fill required fields'); return; }
    onSave({
      id: supplier?.id || `S${Date.now()}`,
      name: form.name, contact: form.contact, email: form.email,
      products: form.products.split(',').map(p => p.trim()).filter(Boolean),
      delivery_schedule: form.delivery_schedule, payment_terms: form.payment_terms,
      rating: Number(form.rating) || 4.0, status: supplier?.status || 'Active',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-foreground">{supplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-3">
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Company Name *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Contact *</label><input type="text" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="+91 XXXXX XXXXX" /></div>
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Products (comma separated)</label><input type="text" value={form.products} onChange={e => setForm({ ...form, products: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Rice, Dal, Spices" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Delivery Schedule</label><input type="text" value={form.delivery_schedule} onChange={e => setForm({ ...form, delivery_schedule: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Mon, Wed, Fri" /></div>
              <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Payment Terms</label><select value={form.payment_terms} onChange={e => setForm({ ...form, payment_terms: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] bg-white">{['COD', 'Net 15', 'Net 30', 'Weekly'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-[0.85rem] hover:brightness-110 cursor-pointer">{supplier ? 'Save' : 'Add'}</button>
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-border rounded-lg text-[0.85rem] hover:bg-muted cursor-pointer">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============== PURCHASE ORDERS ============== */
function PurchaseOrdersView({ poData, setPoData, supplierData, inventoryData }: { poData: PurchaseOrder[]; setPoData: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>; supplierData: Supplier[]; inventoryData: InventoryItem[] }) {
  const [showAddModal, setShowAddModal] = useState(false);

  const statusColors: Record<string, string> = {
    Requested: 'bg-yellow-50 text-yellow-700', Confirmed: 'bg-blue-50 text-blue-700',
    Shipped: 'bg-purple-50 text-purple-700', Delivered: 'bg-green-50 text-green-700',
    Rejected: 'bg-red-50 text-red-700',
  };

  const updateStatus = (id: string, status: PurchaseOrder['status']) => {
    setPoData(prev => prev.map(po => po.id === id ? { ...po, status } : po));
    toast.success(`Order ${id} marked as ${status}`);
  };

  const nextStatus = (current: string): PurchaseOrder['status'] | null => {
    const flow: Record<string, PurchaseOrder['status']> = { Requested: 'Confirmed', Confirmed: 'Shipped', Shipped: 'Delivered' };
    return flow[current] || null;
  };

  const handleAdd = (po: PurchaseOrder) => { setPoData(prev => [po, ...prev]); setShowAddModal(false); toast.success(`Purchase order ${po.id} created`); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-foreground">Purchase Orders</h2>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-[0.85rem] hover:brightness-110 transition-all cursor-pointer"><Plus className="w-4 h-4" /> New Order</button>
      </div>

      <div className="space-y-3">
        {poData.map(po => (
          <div key={po.id} className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <span className="text-foreground text-[0.9rem]">{po.id}</span>
                <span className="text-muted-foreground text-[0.8rem] ml-2">- {po.supplier_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[0.75rem] px-2.5 py-1 rounded-full ${statusColors[po.status]}`}>{po.status}</span>
                <span className="text-foreground text-[0.9rem]">Rs.{po.total_amount.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[0.8rem]">
              {po.items.map((item, i) => <span key={i} className="bg-muted px-2 py-1 rounded text-muted-foreground">{item.quantity}{item.unit} {item.ingredient}</span>)}
            </div>
            <div className="flex justify-between items-center mt-3 text-[0.75rem] text-muted-foreground">
              <span>Created: {po.created_at}</span>
              <span>Expected: {po.expected_delivery}</span>
            </div>
            {po.status !== 'Delivered' && po.status !== 'Rejected' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                {nextStatus(po.status) && (
                  <button onClick={() => updateStatus(po.id, nextStatus(po.status)!)} className="flex-1 bg-accent text-white py-2 rounded-lg text-[0.8rem] hover:brightness-110 cursor-pointer flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Mark {nextStatus(po.status)}
                  </button>
                )}
                {po.status === 'Requested' && (
                  <button onClick={() => updateStatus(po.id, 'Rejected')} className="px-4 py-2 bg-white text-destructive border border-destructive/30 rounded-lg text-[0.8rem] hover:bg-red-50 cursor-pointer flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddModal && <POFormModal suppliers={supplierData} inventory={inventoryData} onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
    </div>
  );
}

function POFormModal({ suppliers, inventory, onClose, onSave }: { suppliers: Supplier[]; inventory: InventoryItem[]; onClose: () => void; onSave: (po: PurchaseOrder) => void }) {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [items, setItems] = useState<{ ingredient: string; quantity: string; unit: string; price: string }[]>([{ ingredient: '', quantity: '', unit: 'kg', price: '' }]);
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [notes, setNotes] = useState('');

  const addRow = () => setItems(prev => [...prev, { ingredient: '', quantity: '', unit: 'kg', price: '' }]);
  const removeRow = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: string) => setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const supplierName = suppliers.find(s => s.id === supplierId)?.name || '';
  const totalAmount = items.reduce((s, item) => s + (Number(item.quantity) * Number(item.price)), 0);

  const handleSubmit = () => {
    const validItems = items.filter(i => i.ingredient && i.quantity);
    if (!supplierId || validItems.length === 0) { toast.error('Select supplier and add items'); return; }
    onSave({
      id: `PO-${String(Date.now()).slice(-3)}`,
      supplier_id: supplierId, supplier_name: supplierName,
      items: validItems.map(i => ({ ingredient: i.ingredient, quantity: Number(i.quantity), unit: i.unit, price: Number(i.price) })),
      status: 'Requested', expected_delivery: expectedDelivery || '2026-03-20',
      total_amount: totalAmount, created_at: new Date().toISOString().split('T')[0],
      notes,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-foreground">New Purchase Order</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-3">
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Supplier *</label><select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] bg-white">{suppliers.filter(s => s.status === 'Active').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>

            <div>
              <label className="text-[0.75rem] text-muted-foreground mb-1 block">Items</label>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1"><input type="text" value={item.ingredient} onChange={e => updateRow(i, 'ingredient', e.target.value)} className="w-full px-2 py-1.5 border border-border rounded text-[0.8rem] focus:outline-none focus:ring-1 focus:ring-primary/20" placeholder="Ingredient" list="ingredients-list" /></div>
                    <div className="w-16"><input type="number" value={item.quantity} onChange={e => updateRow(i, 'quantity', e.target.value)} className="w-full px-2 py-1.5 border border-border rounded text-[0.8rem] focus:outline-none focus:ring-1 focus:ring-primary/20" placeholder="Qty" /></div>
                    <div className="w-16"><select value={item.unit} onChange={e => updateRow(i, 'unit', e.target.value)} className="w-full px-1 py-1.5 border border-border rounded text-[0.8rem] bg-white">{['kg', 'L', 'pcs'].map(u => <option key={u} value={u}>{u}</option>)}</select></div>
                    <div className="w-20"><input type="number" value={item.price} onChange={e => updateRow(i, 'price', e.target.value)} className="w-full px-2 py-1.5 border border-border rounded text-[0.8rem] focus:outline-none focus:ring-1 focus:ring-primary/20" placeholder="Rate" /></div>
                    {items.length > 1 && <button onClick={() => removeRow(i)} className="text-destructive cursor-pointer"><X className="w-4 h-4" /></button>}
                  </div>
                ))}
              </div>
              <datalist id="ingredients-list">{inventory.map(inv => <option key={inv.id} value={inv.ingredient} />)}</datalist>
              <button onClick={addRow} className="mt-2 text-[0.8rem] text-primary hover:underline cursor-pointer flex items-center gap-1"><Plus className="w-3 h-3" /> Add item</button>
            </div>

            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Expected Delivery</label><input type="date" value={expectedDelivery} onChange={e => setExpectedDelivery(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Notes</label><input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Optional notes" /></div>

            {totalAmount > 0 && <div className="bg-muted rounded-lg p-3 text-[0.85rem] flex justify-between"><span className="text-muted-foreground">Estimated Total</span><span className="text-foreground">Rs.{totalAmount.toLocaleString()}</span></div>}
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-[0.85rem] hover:brightness-110 cursor-pointer">Create Order</button>
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-border rounded-lg text-[0.85rem] hover:bg-muted cursor-pointer">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============== EXPENSES ============== */
function ExpensesView({ expensesData, setExpensesData }: { expensesData: Expense[]; setExpensesData: React.Dispatch<React.SetStateAction<Expense[]>> }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const cats: Expense['category'][] = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Maintenance', 'Marketing', 'Miscellaneous', 'Groceries', 'Gas', 'Equipment'];

  const filtered = filterCat === 'all' ? expensesData : expensesData.filter(e => e.category === filterCat);
  const totalAll = expensesData.reduce((s, e) => s + e.amount, 0);
  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);
  const cashExpenses = expensesData.filter(e => e.paidVia === 'Cash').reduce((s, e) => s + e.amount, 0);
  const digitalExpenses = totalAll - cashExpenses;

  const handleAdd = (exp: Expense) => { setExpensesData(prev => [exp, ...prev]); setShowAddModal(false); toast.success('Expense added'); };
  const handleDelete = (id: string) => { setExpensesData(prev => prev.filter(e => e.id !== id)); toast.success('Expense removed'); };

  const catColors: Record<string, string> = { Rent: 'bg-red-50 text-red-600', Utilities: 'bg-yellow-50 text-yellow-600', Salaries: 'bg-indigo-50 text-indigo-600', Supplies: 'bg-green-50 text-green-600', Maintenance: 'bg-cyan-50 text-cyan-600', Marketing: 'bg-pink-50 text-pink-600', Miscellaneous: 'bg-gray-50 text-gray-600', Groceries: 'bg-lime-50 text-lime-600', Gas: 'bg-orange-50 text-orange-600', Equipment: 'bg-blue-50 text-blue-600' };
  const paidViaColors: Record<string, string> = { Cash: 'bg-green-50 text-green-600', 'Bank Transfer': 'bg-blue-50 text-blue-600', UPI: 'bg-purple-50 text-purple-600', Cheque: 'bg-amber-50 text-amber-600' };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-foreground">Expense Tracker</h2>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-[0.85rem] hover:brightness-110 transition-all cursor-pointer"><Plus className="w-4 h-4" /> Add Expense</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl p-4 border border-border"><p className="text-muted-foreground text-[0.75rem]">Total Expenses</p><p className="text-foreground text-[1.2rem]">Rs.{totalAll.toLocaleString()}</p><p className="text-muted-foreground text-[0.65rem]">{expensesData.length} entries</p></div>
        <div className="bg-white rounded-xl p-4 border border-border"><p className="text-muted-foreground text-[0.75rem]">Cash Spent</p><p className="text-foreground text-[1.2rem]">Rs.{cashExpenses.toLocaleString()}</p><p className="text-muted-foreground text-[0.65rem]">{expensesData.filter(e => e.paidVia === 'Cash').length} cash payments</p></div>
        <div className="bg-white rounded-xl p-4 border border-border"><p className="text-muted-foreground text-[0.75rem]">Digital Payments</p><p className="text-foreground text-[1.2rem]">Rs.{digitalExpenses.toLocaleString()}</p><p className="text-muted-foreground text-[0.65rem]">UPI, Bank, Cheque</p></div>
        <div className="bg-white rounded-xl p-4 border border-border"><p className="text-muted-foreground text-[0.75rem]">Filtered Total</p><p className="text-foreground text-[1.2rem]">Rs.{totalFiltered.toLocaleString()}</p><p className="text-muted-foreground text-[0.65rem]">{filtered.length} entries shown</p></div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button onClick={() => setFilterCat('all')} className={`px-3 py-1.5 rounded-full text-[0.8rem] whitespace-nowrap cursor-pointer ${filterCat === 'all' ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:bg-muted'}`}>All</button>
        {cats.filter(c => expensesData.some(e => e.category === c)).map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} className={`px-3 py-1.5 rounded-full text-[0.8rem] whitespace-nowrap cursor-pointer ${filterCat === cat ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:bg-muted'}`}>{cat}</button>
        ))}
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[0.82rem]">
            <thead><tr className="bg-muted text-muted-foreground"><th className="text-left py-3 px-4">Date</th><th className="text-left py-3 px-4">Category</th><th className="text-left py-3 px-4">Description</th><th className="text-left py-3 px-4">Paid Via</th><th className="text-right py-3 px-4">Amount</th><th className="text-center py-3 px-4">Actions</th></tr></thead>
            <tbody>
              {filtered.map(exp => (
                <tr key={exp.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground">{exp.date}</td>
                  <td className="py-3 px-4"><span className={`text-[0.7rem] px-2 py-0.5 rounded-full ${catColors[exp.category] || 'bg-muted text-muted-foreground'}`}>{exp.category}</span></td>
                  <td className="py-3 px-4 text-foreground">{exp.description}</td>
                  <td className="py-3 px-4"><span className={`text-[0.7rem] px-2 py-0.5 rounded-full ${paidViaColors[exp.paidVia] || 'bg-muted text-muted-foreground'}`}>{exp.paidVia}</span></td>
                  <td className="py-3 px-4 text-right text-foreground">Rs.{exp.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center"><button onClick={() => handleDelete(exp.id)} className="text-muted-foreground hover:text-destructive cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && <ExpenseFormModal cats={cats} onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
    </div>
  );
}

function ExpenseFormModal({ cats, onClose, onSave }: { cats: Expense['category'][]; onClose: () => void; onSave: (exp: Expense) => void }) {
  const [form, setForm] = useState({ category: 'Supplies' as Expense['category'], description: '', amount: '', date: new Date().toISOString().split('T')[0], paidVia: 'Cash' as Expense['paidVia'] });

  const handleSubmit = () => {
    if (!form.description || !form.amount) { toast.error('Fill all fields'); return; }
    onSave({ id: `EXP-${String(Date.now()).slice(-3)}`, category: form.category, description: form.description, amount: Number(form.amount), date: form.date, paidVia: form.paidVia });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-5"><h3 className="text-foreground">Add Expense</h3><button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-5 h-5" /></button></div>
          <div className="space-y-3">
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as Expense['category'] })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] bg-white">{cats.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Description *</label><input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="What was this for?" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Amount (Rs.) *</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
              <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            </div>
            <div><label className="text-[0.75rem] text-muted-foreground mb-1 block">Paid Via</label><select value={form.paidVia} onChange={e => setForm({ ...form, paidVia: e.target.value as Expense['paidVia'] })} className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] bg-white">{['Cash', 'Bank Transfer', 'UPI', 'Cheque'].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-[0.85rem] hover:brightness-110 cursor-pointer">Add Expense</button>
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-border rounded-lg text-[0.85rem] hover:bg-muted cursor-pointer">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============== REPORTS ============== */
type TimePeriod = 'day' | 'week' | 'month' | 'year';

// Generate rich mock data for various time periods
const generatePeriodData = (period: TimePeriod) => {
  const seed = (n: number) => Math.floor(Math.abs(Math.sin(n) * 10000));

  if (period === 'day') {
    return {
      revenue: 13651, orders: 18, avgOrderValue: 759, tax: 678, discount: 80, expenses: 36900,
      prevRevenue: 11200, prevOrders: 14, prevExpenses: 32500,
      trendData: Array.from({ length: 14 }, (_, i) => {
        const h = i + 7;
        return { label: `${h < 12 ? h + 'AM' : h === 12 ? '12PM' : (h - 12) + 'PM'}`, revenue: [0, 0, 269, 950, 872, 355, 780, 2162, 1256, 1155, 568, 2058, 1796, 248][i], orders: [0, 0, 1, 2, 2, 1, 1, 2, 2, 1, 1, 2, 1, 1][i], expenses: [0, 0, 0, 4500, 0, 0, 8500, 0, 0, 0, 5200, 0, 3500, 0][i] };
      }),
      dineIn: { count: 11, revenue: 8798 }, takeAway: { count: 7, revenue: 4853 },
      payment: { Cash: { count: 6, amount: 3503 }, Card: { count: 3, amount: 2344 }, UPI: { count: 6, amount: 5836 }, 'QR Code': { count: 2, amount: 1562 } },
      topDishes: [
        { name: 'Chicken Biryani', orders: 31, revenue: 6169, margin: 58, trend: 12 },
        { name: 'Filter Coffee', orders: 28, revenue: 1092, margin: 75, trend: 5 },
        { name: 'Masala Dosa', orders: 4, revenue: 356, margin: 65, trend: -2 },
        { name: 'Idli Sambar', orders: 13, revenue: 767, margin: 72, trend: 8 },
        { name: 'Mutton Biryani', orders: 6, revenue: 1494, margin: 52, trend: 15 },
        { name: 'Medu Vada', orders: 4, revenue: 196, margin: 70, trend: -1 },
        { name: 'Mango Lassi', orders: 17, revenue: 1003, margin: 68, trend: 10 },
        { name: 'Gulab Jamun', orders: 13, revenue: 637, margin: 78, trend: 3 },
        { name: 'Payasam', orders: 10, revenue: 690, margin: 74, trend: 6 },
        { name: 'Samosa', orders: 10, revenue: 290, margin: 80, trend: 1 },
      ],
      categoryBreakdown: [
        { category: 'Rice & Biryani', orders: 37, revenue: 7663, pct: 56 },
        { category: 'Breakfast', orders: 21, revenue: 1319, pct: 10 },
        { category: 'Drinks', orders: 45, revenue: 2095, pct: 15 },
        { category: 'Desserts', orders: 23, revenue: 1327, pct: 10 },
        { category: 'Snacks', orders: 14, revenue: 446, pct: 3 },
        { category: 'Meals', orders: 7, revenue: 315, pct: 2 },
      ],
      expenseBreakdown: [
        { category: 'Supplies', amount: 24500 }, { category: 'Gas', amount: 5200 },
        { category: 'Maintenance', amount: 3500 }, { category: 'Groceries', amount: 3200 },
        { category: 'Miscellaneous', amount: 1800 },
      ],
      profitGrowth: [
        { label: '8AM', profit: 269, margin: 100 }, { label: '9AM', profit: 1150, margin: 82 },
        { label: '10AM', profit: 1562, margin: 65 }, { label: '11AM', profit: 1247, margin: 58 },
        { label: '12PM', profit: 1892, margin: 62 }, { label: '1PM', profit: 3623, margin: 55 },
        { label: '2PM', profit: 1824, margin: 59 }, { label: '3PM', profit: 2485, margin: 61 },
        { label: '4PM', profit: 1508, margin: 57 }, { label: '5PM', profit: 2544, margin: 60 },
      ],
      storeMetrics: { peakHour: '12-1 PM', avgTurnover: 2.8, tableUtilization: 72, customerSatisfaction: 4.5, returnRate: 35, avgWaitTime: 12 },
    };
  }

  if (period === 'week') {
    return {
      revenue: 134300, orders: 905, avgOrderValue: 148, tax: 6715, discount: 2800, expenses: 146700,
      prevRevenue: 118500, prevOrders: 812, prevExpenses: 138200,
      trendData: [
        { label: 'Mon', revenue: 12500, orders: 85, expenses: 18500 },
        { label: 'Tue', revenue: 15200, orders: 102, expenses: 14200 },
        { label: 'Wed', revenue: 11800, orders: 78, expenses: 22800 },
        { label: 'Thu', revenue: 18400, orders: 125, expenses: 16400 },
        { label: 'Fri', revenue: 22100, orders: 148, expenses: 25100 },
        { label: 'Sat', revenue: 28500, orders: 192, expenses: 28500 },
        { label: 'Sun', revenue: 25800, orders: 175, expenses: 21200 },
      ],
      dineIn: { count: 562, revenue: 86500 }, takeAway: { count: 343, revenue: 47800 },
      payment: { Cash: { count: 298, amount: 42150 }, Card: { count: 215, amount: 34800 }, UPI: { count: 278, amount: 41250 }, 'QR Code': { count: 114, amount: 16100 } },
      topDishes: [
        { name: 'Filter Coffee', orders: 312, revenue: 12168, margin: 75, trend: 8 },
        { name: 'Masala Dosa', orders: 245, revenue: 21805, margin: 65, trend: 12 },
        { name: 'Chicken Biryani', orders: 198, revenue: 39402, margin: 58, trend: 15 },
        { name: 'Idli Sambar', orders: 187, revenue: 11033, margin: 72, trend: 5 },
        { name: 'Medu Vada', orders: 156, revenue: 7644, margin: 70, trend: -3 },
        { name: 'Mutton Biryani', orders: 92, revenue: 22908, margin: 52, trend: 18 },
        { name: 'Mango Lassi', orders: 134, revenue: 7906, margin: 68, trend: 10 },
        { name: 'Samosa', orders: 128, revenue: 3712, margin: 80, trend: 2 },
        { name: 'Gulab Jamun', orders: 95, revenue: 4655, margin: 78, trend: 6 },
        { name: 'Uttapam', orders: 88, revenue: 6952, margin: 64, trend: -1 },
      ],
      categoryBreakdown: [
        { category: 'Breakfast', orders: 676, revenue: 47434, pct: 35 },
        { category: 'Rice & Biryani', orders: 290, revenue: 62310, pct: 46 },
        { category: 'Drinks', orders: 446, revenue: 20074, pct: 15 },
        { category: 'Snacks', orders: 128, revenue: 3712, pct: 3 },
        { category: 'Desserts', orders: 95, revenue: 4655, pct: 3 },
        { category: 'Meals', orders: 45, revenue: 2025, pct: 2 },
      ],
      expenseBreakdown: [
        { category: 'Rent', amount: 85000 }, { category: 'Supplies', amount: 24500 },
        { category: 'Utilities', amount: 15700 }, { category: 'Gas', amount: 5200 },
        { category: 'Marketing', amount: 5000 }, { category: 'Maintenance', amount: 3500 },
        { category: 'Groceries', amount: 3200 }, { category: 'Equipment', amount: 2800 },
        { category: 'Miscellaneous', amount: 1800 },
      ],
      profitGrowth: [
        { label: 'Mon', profit: -6000, margin: -48 }, { label: 'Tue', profit: 1000, margin: 7 },
        { label: 'Wed', profit: -11000, margin: -93 }, { label: 'Thu', profit: 2000, margin: 11 },
        { label: 'Fri', profit: -3000, margin: -14 }, { label: 'Sat', profit: 0, margin: 0 },
        { label: 'Sun', profit: 4600, margin: 18 },
      ],
      storeMetrics: { peakHour: '12-1 PM', avgTurnover: 3.2, tableUtilization: 68, customerSatisfaction: 4.4, returnRate: 32, avgWaitTime: 14 },
    };
  }

  if (period === 'month') {
    return {
      revenue: 578000, orders: 3820, avgOrderValue: 151, tax: 28900, discount: 12500, expenses: 425000,
      prevRevenue: 498000, prevOrders: 3250, prevExpenses: 395000,
      trendData: [
        { label: 'Wk 1', revenue: 118000, orders: 780, expenses: 112000 },
        { label: 'Wk 2', revenue: 142000, orders: 945, expenses: 98000 },
        { label: 'Wk 3', revenue: 156000, orders: 1050, expenses: 108000 },
        { label: 'Wk 4', revenue: 162000, orders: 1045, expenses: 107000 },
      ],
      dineIn: { count: 2350, revenue: 368000 }, takeAway: { count: 1470, revenue: 210000 },
      payment: { Cash: { count: 1250, amount: 182000 }, Card: { count: 890, amount: 148000 }, UPI: { count: 1180, amount: 175000 }, 'QR Code': { count: 500, amount: 73000 } },
      topDishes: [
        { name: 'Chicken Biryani', orders: 845, revenue: 168155, margin: 58, trend: 18 },
        { name: 'Filter Coffee', orders: 1340, revenue: 52260, margin: 75, trend: 6 },
        { name: 'Masala Dosa', orders: 1050, revenue: 93450, margin: 65, trend: 10 },
        { name: 'Idli Sambar', orders: 802, revenue: 47318, margin: 72, trend: 4 },
        { name: 'Mutton Biryani', orders: 398, revenue: 99102, margin: 52, trend: 22 },
        { name: 'Medu Vada', orders: 668, revenue: 32732, margin: 70, trend: -2 },
        { name: 'Mango Lassi', orders: 575, revenue: 33925, margin: 68, trend: 12 },
        { name: 'Uttapam', orders: 378, revenue: 29862, margin: 64, trend: 1 },
        { name: 'Samosa', orders: 548, revenue: 15892, margin: 80, trend: 5 },
        { name: 'Gulab Jamun', orders: 408, revenue: 19992, margin: 78, trend: 8 },
      ],
      categoryBreakdown: [
        { category: 'Rice & Biryani', orders: 1243, revenue: 267257, pct: 46 },
        { category: 'Breakfast', orders: 2898, revenue: 203362, pct: 35 },
        { category: 'Drinks', orders: 1915, revenue: 86185, pct: 15 },
        { category: 'Snacks', orders: 548, revenue: 15892, pct: 3 },
        { category: 'Desserts', orders: 408, revenue: 19992, pct: 3 },
        { category: 'Meals', orders: 193, revenue: 8685, pct: 2 },
      ],
      expenseBreakdown: [
        { category: 'Rent', amount: 85000 }, { category: 'Salaries', amount: 185000 },
        { category: 'Supplies', amount: 62000 }, { category: 'Utilities', amount: 28000 },
        { category: 'Gas', amount: 22000 }, { category: 'Marketing', amount: 15000 },
        { category: 'Maintenance', amount: 12000 }, { category: 'Equipment', amount: 8000 },
        { category: 'Miscellaneous', amount: 8000 },
      ],
      profitGrowth: [
        { label: 'Wk 1', profit: 6000, margin: 5 }, { label: 'Wk 2', profit: 44000, margin: 31 },
        { label: 'Wk 3', profit: 48000, margin: 31 }, { label: 'Wk 4', profit: 55000, margin: 34 },
      ],
      storeMetrics: { peakHour: '12-2 PM', avgTurnover: 3.5, tableUtilization: 71, customerSatisfaction: 4.5, returnRate: 38, avgWaitTime: 13 },
    };
  }

  // Year
  return {
    revenue: 6250000, orders: 42500, avgOrderValue: 147, tax: 312500, discount: 135000, expenses: 4850000,
    prevRevenue: 5180000, prevOrders: 35200, prevExpenses: 4250000,
    trendData: [
      { label: 'Apr', revenue: 385000, orders: 2600, expenses: 355000 },
      { label: 'May', revenue: 420000, orders: 2850, expenses: 365000 },
      { label: 'Jun', revenue: 465000, orders: 3150, expenses: 380000 },
      { label: 'Jul', revenue: 498000, orders: 3380, expenses: 395000 },
      { label: 'Aug', revenue: 535000, orders: 3620, expenses: 405000 },
      { label: 'Sep', revenue: 510000, orders: 3450, expenses: 398000 },
      { label: 'Oct', revenue: 548000, orders: 3720, expenses: 410000 },
      { label: 'Nov', revenue: 582000, orders: 3950, expenses: 420000 },
      { label: 'Dec', revenue: 645000, orders: 4380, expenses: 445000 },
      { label: 'Jan', revenue: 565000, orders: 3830, expenses: 415000 },
      { label: 'Feb', revenue: 520000, orders: 3520, expenses: 408000 },
      { label: 'Mar', revenue: 578000, orders: 3920, expenses: 425000 },
    ],
    dineIn: { count: 26200, revenue: 3980000 }, takeAway: { count: 16300, revenue: 2270000 },
    payment: { Cash: { count: 13900, amount: 1975000 }, Card: { count: 10100, amount: 1580000 }, UPI: { count: 13000, amount: 1900000 }, 'QR Code': { count: 5500, amount: 795000 } },
    topDishes: [
      { name: 'Chicken Biryani', orders: 9250, revenue: 1840750, margin: 58, trend: 22 },
      { name: 'Filter Coffee', orders: 14800, revenue: 577200, margin: 75, trend: 8 },
      { name: 'Masala Dosa', orders: 11500, revenue: 1023500, margin: 65, trend: 15 },
      { name: 'Idli Sambar', orders: 8800, revenue: 519200, margin: 72, trend: 5 },
      { name: 'Mutton Biryani', orders: 4350, revenue: 1083150, margin: 52, trend: 28 },
      { name: 'Medu Vada', orders: 7300, revenue: 357700, margin: 70, trend: -1 },
      { name: 'Mango Lassi', orders: 6300, revenue: 371700, margin: 68, trend: 14 },
      { name: 'Uttapam', orders: 4150, revenue: 327850, margin: 64, trend: 3 },
      { name: 'Samosa', orders: 6000, revenue: 174000, margin: 80, trend: 7 },
      { name: 'Gulab Jamun', orders: 4500, revenue: 220500, margin: 78, trend: 10 },
    ],
    categoryBreakdown: [
      { category: 'Rice & Biryani', orders: 13600, revenue: 2923900, pct: 47 },
      { category: 'Breakfast', orders: 31750, revenue: 2228250, pct: 36 },
      { category: 'Drinks', orders: 21100, revenue: 948900, pct: 15 },
      { category: 'Snacks', orders: 6000, revenue: 174000, pct: 3 },
      { category: 'Desserts', orders: 4500, revenue: 220500, pct: 3 },
      { category: 'Meals', orders: 2100, revenue: 94500, pct: 2 },
    ],
    expenseBreakdown: [
      { category: 'Salaries', amount: 2100000 }, { category: 'Rent', amount: 1020000 },
      { category: 'Supplies', amount: 720000 }, { category: 'Utilities', amount: 318000 },
      { category: 'Gas', amount: 252000 }, { category: 'Marketing', amount: 168000 },
      { category: 'Maintenance', amount: 132000 }, { category: 'Equipment', amount: 84000 },
      { category: 'Miscellaneous', amount: 56000 },
    ],
    profitGrowth: [
      { label: 'Apr', profit: 30000, margin: 8 }, { label: 'May', profit: 55000, margin: 13 },
      { label: 'Jun', profit: 85000, margin: 18 }, { label: 'Jul', profit: 103000, margin: 21 },
      { label: 'Aug', profit: 130000, margin: 24 }, { label: 'Sep', profit: 112000, margin: 22 },
      { label: 'Oct', profit: 138000, margin: 25 }, { label: 'Nov', profit: 162000, margin: 28 },
      { label: 'Dec', profit: 200000, margin: 31 }, { label: 'Jan', profit: 150000, margin: 27 },
      { label: 'Feb', profit: 112000, margin: 22 }, { label: 'Mar', profit: 153000, margin: 26 },
    ],
    storeMetrics: { peakHour: '12-2 PM', avgTurnover: 3.4, tableUtilization: 69, customerSatisfaction: 4.4, returnRate: 36, avgWaitTime: 14 },
  };
};

// Employee performance mock data
const getEmployeePerformance = (period: TimePeriod) => {
  const multiplier = period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 365;
  return employees.filter(e => e.status !== 'Inactive').map(emp => {
    const base = emp.role === 'Chef' ? 42 : emp.role === 'Waiter' ? 35 : emp.role === 'Cashier' ? 48 : emp.role === 'Manager' ? 15 : emp.role === 'Delivery' ? 28 : 20;
    const ordersHandled = Math.round(base * multiplier * (emp.attendance / 100) * (0.8 + Math.random() * 0.4));
    const rating = Math.min(5, Math.max(3, (emp.attendance / 20) - 0.5 + Math.random()));
    const efficiency = Math.round(Math.min(100, emp.attendance * (0.9 + Math.random() * 0.2)));
    const tips = emp.role === 'Waiter' ? Math.round(ordersHandled * 8) : emp.role === 'Delivery' ? Math.round(ordersHandled * 5) : 0;
    const monthlyCost = emp.salaryType === 'Monthly' ? emp.salary : emp.salary * 26;
    return { ...emp, ordersHandled, rating: Math.round(rating * 10) / 10, efficiency, tips, monthlyCost };
  });
};

function ReportsView({ ordersData, expensesData }: { ordersData: Order[]; expensesData: Expense[] }) {
  const [period, setPeriod] = useState<TimePeriod>('day');
  const [reportTab, setReportTab] = useState<'overview' | 'food' | 'spending' | 'profit' | 'store' | 'employees'>('overview');

  const data = useMemo(() => generatePeriodData(period), [period]);
  const empPerf = useMemo(() => getEmployeePerformance(period), [period]);

  const revenueChange = data.prevRevenue > 0 ? Math.round((data.revenue - data.prevRevenue) / data.prevRevenue * 100) : 0;
  const orderChange = data.prevOrders > 0 ? Math.round((data.orders - data.prevOrders) / data.prevOrders * 100) : 0;
  const profitAmount = data.revenue - data.expenses;
  const profitMargin = data.revenue > 0 ? Math.round(profitAmount / data.revenue * 100) : 0;
  const periodLabel = period === 'day' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year';
  const prevLabel = period === 'day' ? 'yesterday' : period === 'week' ? 'last week' : period === 'month' ? 'last month' : 'last year';

  const downloadCSV = (rows: any[], filename: string) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]).join(',');
    const body = rows.map(d => Object.values(d).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${body}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`${filename}.csv exported`);
  };

  const PIE_COLORS = ['#FF6B35', '#22C55E', '#3B82F6', '#8B5CF6', '#F97316', '#EC4899'];
  const paymentColors: Record<string, string> = { Cash: 'bg-green-50 text-green-600', Card: 'bg-blue-50 text-blue-600', UPI: 'bg-purple-50 text-purple-600', 'QR Code': 'bg-orange-50 text-orange-600' };
  const paymentIcons: Record<string, any> = { Cash: Banknote, Card: CreditCard, UPI: Smartphone, 'QR Code': QrCode };

  const reportTabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'food' as const, label: 'Food Performance', icon: Utensils },
    { id: 'spending' as const, label: 'Spending', icon: Receipt },
    { id: 'profit' as const, label: 'Profit & Growth', icon: TrendingUp },
    { id: 'store' as const, label: 'Store', icon: Store },
    { id: 'employees' as const, label: 'Employees', icon: Users },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="text-foreground">Reports & Analytics</h2>
          <p className="text-muted-foreground text-[0.8rem]">{periodLabel} performance insights</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => downloadCSV(data.topDishes, `food_report_${period}`)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-border rounded-lg text-[0.8rem] hover:bg-muted cursor-pointer"><Download className="w-3.5 h-3.5" /> Export</button>
          <button onClick={() => downloadCSV(data.trendData, `trend_${period}`)} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-[0.8rem] hover:brightness-110 cursor-pointer"><Download className="w-3.5 h-3.5" /> Full Report</button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-1 mb-4 bg-muted p-1 rounded-xl w-fit">
        {([['day', 'Day'], ['week', 'Week'], ['month', 'Month'], ['year', 'Year']] as [TimePeriod, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setPeriod(key)} className={`px-4 py-2 rounded-lg text-[0.82rem] transition-all cursor-pointer ${period === key ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{label}</button>
        ))}
      </div>

      {/* Sub tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {reportTabs.map(t => (
          <button key={t.id} onClick={() => setReportTab(t.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.8rem] whitespace-nowrap transition-all cursor-pointer ${reportTab === t.id ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:bg-muted'}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {reportTab === 'overview' && (
        <div className="space-y-5">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'Revenue', value: `Rs.${data.revenue.toLocaleString()}`, change: revenueChange, icon: DollarSign, color: 'bg-green-50 text-green-600' },
              { label: 'Orders', value: data.orders, change: orderChange, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
              { label: 'Avg Order', value: `Rs.${data.avgOrderValue}`, change: null, icon: Target, color: 'bg-orange-50 text-orange-600' },
              { label: 'Profit', value: `Rs.${profitAmount.toLocaleString()}`, change: profitMargin, icon: profitAmount >= 0 ? TrendingUp : TrendingDown, color: profitAmount >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600' },
              { label: 'Expenses', value: `Rs.${data.expenses.toLocaleString()}`, change: data.prevExpenses > 0 ? Math.round((data.expenses - data.prevExpenses) / data.prevExpenses * 100) : 0, icon: Receipt, color: 'bg-red-50 text-red-600' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.color}`}><kpi.icon className="w-4 h-4" /></div>
                  {kpi.change !== null && <span className={`text-[0.7rem] flex items-center gap-0.5 ${kpi.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>{kpi.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(kpi.change)}%</span>}
                </div>
                <p className="text-foreground text-[1.15rem]">{kpi.value}</p>
                <p className="text-muted-foreground text-[0.7rem]">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue vs Expenses Trend */}
          <div className="bg-white rounded-xl p-4 border border-border">
            <h3 className="text-foreground mb-4 text-[0.95rem]">Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.trendData} id="area-rev-vs-exp">
                <defs key="defs">
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF6B35" stopOpacity={0.15} /><stop offset="95%" stopColor="#FF6B35" stopOpacity={0} /></linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis key="xaxis" dataKey="label" stroke="#94A3B8" fontSize={11} />
                <YAxis key="yaxis" stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip key="tooltip" formatter={(v: number, n: string) => [`Rs.${v.toLocaleString()}`, n === 'revenue' ? 'Revenue' : n === 'expenses' ? 'Expenses' : 'Orders']} />
                <Legend key="legend" />
                <Area key="area-revenue" type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2} fill="url(#revGrad)" />
                <Area key="area-expenses" type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Dine In / Take Away + Payment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-border">
              <h3 className="text-foreground mb-3 text-[0.95rem]">Order Types</h3>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 shrink-0">
                  <RechartsPie width={112} height={112} id="pie-reports-order-type"><Pie data={[{ name: 'Dine In', value: data.dineIn.count }, { name: 'Take Away', value: data.takeAway.count }]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={25} outerRadius={50} paddingAngle={3}><Cell key="ot-dine" fill="#FF6B35" /><Cell key="ot-take" fill="#22C55E" /></Pie><Tooltip /></RechartsPie>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-orange-50/60 rounded-lg"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-primary" /><span className="text-[0.82rem] text-foreground">Dine In</span></div><div className="text-right"><p className="text-[0.85rem] text-foreground">{data.dineIn.count}</p><p className="text-[0.68rem] text-muted-foreground">Rs.{data.dineIn.revenue.toLocaleString()}</p></div></div>
                  <div className="flex items-center justify-between p-2.5 bg-green-50/60 rounded-lg"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-[0.82rem] text-foreground">Take Away</span></div><div className="text-right"><p className="text-[0.85rem] text-foreground">{data.takeAway.count}</p><p className="text-[0.68rem] text-muted-foreground">Rs.{data.takeAway.revenue.toLocaleString()}</p></div></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-border">
              <h3 className="text-foreground mb-3 text-[0.95rem]">Payment Split</h3>
              <div className="space-y-2">
                {Object.entries(data.payment).map(([method, info]) => {
                  const pct = data.revenue > 0 ? Math.round(info.amount / data.revenue * 100) : 0;
                  const Icon = paymentIcons[method] || Banknote;
                  return (
                    <div key={method} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${paymentColors[method]}`}><Icon className="w-3.5 h-3.5" /></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[0.8rem] mb-0.5"><span className="text-foreground">{method} <span className="text-muted-foreground">({info.count})</span></span><span className="text-foreground">Rs.{info.amount.toLocaleString()} <span className="text-muted-foreground text-[0.7rem]">{pct}%</span></span></div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${pct}%` }} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOD PERFORMANCE TAB ===== */}
      {reportTab === 'food' && (
        <div className="space-y-5">
          {/* Top 3 Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.topDishes.length > 0 && (() => {
              const mostOrdered = [...data.topDishes].sort((a, b) => b.orders - a.orders)[0];
              const topRevenue = [...data.topDishes].sort((a, b) => b.revenue - a.revenue)[0];
              const bestMargin = [...data.topDishes].sort((a, b) => b.margin - a.margin)[0];
              return [
                { title: 'Most Ordered', dish: mostOrdered.name, value: `${mostOrdered.orders} orders`, sub: `Rs.${mostOrdered.revenue.toLocaleString()} revenue`, icon: Crown, grad: 'from-orange-500 to-amber-500' },
                { title: 'Top Revenue', dish: topRevenue.name, value: `Rs.${topRevenue.revenue.toLocaleString()}`, sub: `${topRevenue.orders} orders`, icon: Trophy, grad: 'from-green-500 to-emerald-500' },
                { title: 'Best Margin', dish: bestMargin.name, value: `${bestMargin.margin}% profit margin`, sub: `Rs.${bestMargin.revenue.toLocaleString()} revenue`, icon: Medal, grad: 'from-blue-500 to-indigo-500' },
              ].map(card => (
                <div key={card.title} className={`bg-gradient-to-br ${card.grad} rounded-xl p-4 text-white`}>
                  <div className="flex items-center gap-2 mb-2 text-white/80 text-[0.78rem]"><card.icon className="w-4 h-4" />{card.title}</div>
                  <p className="text-[1.1rem] mb-0.5">{card.dish}</p>
                  <p className="text-[0.9rem]">{card.value}</p>
                  <p className="text-white/70 text-[0.72rem] mt-1">{card.sub}</p>
                </div>
              ));
            })()}
          </div>

          {/* Category Breakdown Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-border">
              <h3 className="text-foreground mb-4 text-[0.95rem]">Revenue by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie id="pie-revenue-category">
                  <Pie data={data.categoryBreakdown.map(c => ({ name: c.category, value: c.revenue }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {data.categoryBreakdown.map((_, i) => <Cell key={`cat-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `Rs.${v.toLocaleString()}`} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl p-4 border border-border">
              <h3 className="text-foreground mb-4 text-[0.95rem]">Category Details</h3>
              <div className="space-y-2.5">
                {data.categoryBreakdown.map((cat, i) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-[0.8rem] mb-1">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} /><span className="text-foreground">{cat.category}</span></div>
                      <span className="text-muted-foreground">Rs.{cat.revenue.toLocaleString()} | {cat.orders} orders</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${cat.pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dish Performance Table */}
          <div className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-foreground text-[0.95rem]">Dish Ranking — {periodLabel}</h3>
              <button onClick={() => downloadCSV(data.topDishes, `dish_ranking_${period}`)} className="text-primary text-[0.8rem] cursor-pointer hover:underline flex items-center gap-1"><Download className="w-3.5 h-3.5" /> CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[0.82rem]">
                <thead><tr className="text-muted-foreground border-b border-border"><th className="text-left py-2 px-3">#</th><th className="text-left py-2 px-3">Dish</th><th className="text-right py-2 px-3">Orders</th><th className="text-right py-2 px-3">Revenue</th><th className="text-right py-2 px-3">Margin</th><th className="text-right py-2 px-3">Trend</th><th className="text-right py-2 px-3">Avg/Order</th></tr></thead>
                <tbody>
                  {data.topDishes.map((dish, i) => (
                    <tr key={dish.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3">{i < 3 ? <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[0.7rem] text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-700'}`}>{i + 1}</span> : <span className="text-muted-foreground ml-1.5">{i + 1}</span>}</td>
                      <td className="py-2.5 px-3 text-foreground">{dish.name}</td>
                      <td className="py-2.5 px-3 text-right text-foreground">{dish.orders.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-foreground">Rs.{dish.revenue.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right"><span className={`px-1.5 py-0.5 rounded text-[0.7rem] ${dish.margin >= 70 ? 'bg-green-50 text-green-600' : dish.margin >= 55 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>{dish.margin}%</span></td>
                      <td className="py-2.5 px-3 text-right"><span className={`flex items-center justify-end gap-0.5 ${dish.trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>{dish.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(dish.trend)}%</span></td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">Rs.{dish.orders > 0 ? Math.round(dish.revenue / dish.orders) : 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== SPENDING TAB ===== */}
      {reportTab === 'spending' && (
        <div className="space-y-5">
          {/* Spending KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Expenses', value: `Rs.${data.expenses.toLocaleString()}`, sub: `vs Rs.${data.prevExpenses.toLocaleString()} ${prevLabel}`, color: 'bg-red-50 text-red-600', icon: Receipt },
              { label: 'Expense Ratio', value: `${data.revenue > 0 ? Math.round(data.expenses / data.revenue * 100) : 0}%`, sub: 'of revenue', color: 'bg-orange-50 text-orange-600', icon: BadgePercent },
              { label: 'Biggest Expense', value: data.expenseBreakdown[0]?.category || '-', sub: `Rs.${data.expenseBreakdown[0]?.amount.toLocaleString() || 0}`, color: 'bg-purple-50 text-purple-600', icon: AlertTriangle },
              { label: 'Cost per Order', value: `Rs.${data.orders > 0 ? Math.round(data.expenses / data.orders) : 0}`, sub: `${data.orders} orders`, color: 'bg-blue-50 text-blue-600', icon: Target },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl p-4 border border-border">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${kpi.color}`}><kpi.icon className="w-4 h-4" /></div>
                <p className="text-foreground text-[1.1rem]">{kpi.value}</p>
                <p className="text-muted-foreground text-[0.72rem]">{kpi.label}</p>
                <p className="text-muted-foreground text-[0.65rem] mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Expense category breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-border">
              <h3 className="text-foreground mb-4 text-[0.95rem]">Expense Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.expenseBreakdown} layout="vertical" margin={{ left: 10 }} id="bar-expense-dist">
                  <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis key="xaxis" type="number" stroke="#94A3B8" fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis key="yaxis" type="category" dataKey="category" stroke="#94A3B8" fontSize={10} width={90} />
                  <Tooltip key="tooltip" formatter={(v: number) => `Rs.${v.toLocaleString()}`} />
                  <Bar key="bar-amount" dataKey="amount" radius={[0, 4, 4, 0]} barSize={18}>
                    {data.expenseBreakdown.map((_, i) => <Cell key={`exp-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl p-4 border border-border">
              <h3 className="text-foreground mb-4 text-[0.95rem]">Expense Breakdown</h3>
              <div className="space-y-3">
                {data.expenseBreakdown.map((item, i) => {
                  const pct = data.expenses > 0 ? Math.round(item.amount / data.expenses * 100) : 0;
                  return (
                    <div key={item.category} className="flex items-center gap-3">
                      <div className="w-8 text-right text-[0.75rem] text-muted-foreground shrink-0">{pct}%</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[0.8rem] mb-0.5"><span className="text-foreground">{item.category}</span><span className="text-foreground">Rs.{item.amount.toLocaleString()}</span></div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-border flex justify-between text-[0.85rem]"><span className="text-muted-foreground">Total</span><span className="text-foreground">Rs.{data.expenses.toLocaleString()}</span></div>
            </div>
          </div>

          {/* Expense vs Revenue trend */}
          <div className="bg-white rounded-xl p-4 border border-border">
            <h3 className="text-foreground mb-4 text-[0.95rem]">Expense vs Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.trendData} id="line-rev-trend">
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis key="xaxis" dataKey="label" stroke="#94A3B8" fontSize={11} />
                <YAxis key="yaxis" stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip key="tooltip" formatter={(v: number, n: string) => [`Rs.${v.toLocaleString()}`, n === 'revenue' ? 'Revenue' : 'Expenses']} />
                <Legend key="legend" />
                <Line key="line-revenue" type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E', r: 3 }} />
                <Line key="line-expenses" type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 3 }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ===== PROFIT & GROWTH TAB ===== */}
      {reportTab === 'profit' && (
        <div className="space-y-5">
          {/* Profit highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Net Profit', value: `Rs.${profitAmount.toLocaleString()}`, sub: profitAmount >= 0 ? 'Profitable' : 'At loss', color: profitAmount >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600', icon: profitAmount >= 0 ? TrendingUp : TrendingDown },
              { label: 'Profit Margin', value: `${profitMargin}%`, sub: `Revenue: Rs.${data.revenue.toLocaleString()}`, color: 'bg-blue-50 text-blue-600', icon: BadgePercent },
              { label: 'Revenue Growth', value: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`, sub: `vs ${prevLabel}`, color: revenueChange >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600', icon: Activity },
              { label: 'Tax Collected', value: `Rs.${data.tax.toLocaleString()}`, sub: `Discounts: Rs.${data.discount.toLocaleString()}`, color: 'bg-amber-50 text-amber-600', icon: Receipt },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl p-4 border border-border">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${kpi.color}`}><kpi.icon className="w-4 h-4" /></div>
                <p className="text-foreground text-[1.1rem]">{kpi.value}</p>
                <p className="text-muted-foreground text-[0.72rem]">{kpi.label}</p>
                <p className="text-muted-foreground text-[0.65rem] mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Profit trend chart */}
          <div className="bg-white rounded-xl p-4 border border-border">
            <h3 className="text-foreground mb-4 text-[0.95rem]">Profit Growth — {periodLabel}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.profitGrowth} id="area-profit-growth">
                <defs key="defs"><linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} /><stop offset="95%" stopColor="#22C55E" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis key="xaxis" dataKey="label" stroke="#94A3B8" fontSize={11} />
                <YAxis key="yaxis" stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip key="tooltip" formatter={(v: number, n: string) => [n === 'profit' ? `Rs.${v.toLocaleString()}` : `${v}%`, n === 'profit' ? 'Profit' : 'Margin']} />
                <Legend key="legend" />
                <Area key="area-profit" type="monotone" dataKey="profit" stroke="#22C55E" strokeWidth={2} fill="url(#profGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Profit margin trend */}
          <div className="bg-white rounded-xl p-4 border border-border">
            <h3 className="text-foreground mb-4 text-[0.95rem]">Margin % Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.profitGrowth} id="line-profit-margin">
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis key="xaxis" dataKey="label" stroke="#94A3B8" fontSize={11} />
                <YAxis key="yaxis" stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip key="tooltip" formatter={(v: number) => `${v}%`} />
                <Line key="line-margin" type="monotone" dataKey="margin" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-xl p-4 border border-border">
            <h3 className="text-foreground mb-3 text-[0.95rem]">Financial Summary — {periodLabel}</h3>
            <div className="space-y-2">
              {[
                { label: 'Gross Revenue', amount: data.revenue, type: 'income' },
                { label: 'Tax Collected (GST)', amount: data.tax, type: 'neutral' },
                { label: 'Discounts Given', amount: -data.discount, type: 'expense' },
                { label: 'Total Expenses', amount: -data.expenses, type: 'expense' },
                null,
                { label: 'Net Profit / (Loss)', amount: profitAmount, type: profitAmount >= 0 ? 'profit' : 'loss' },
              ].map((row, i) => row === null ? <div key={`sep-${i}`} className="border-t-2 border-border my-1" /> : (
                <div key={row.label} className={`flex items-center justify-between py-1.5 text-[0.85rem] ${row.type === 'profit' || row.type === 'loss' ? 'pt-2' : ''}`}>
                  <span className={`${row.type === 'profit' || row.type === 'loss' ? 'text-foreground' : 'text-muted-foreground'}`}>{row.label}</span>
                  <span className={`${row.type === 'income' || row.type === 'profit' ? 'text-green-600' : row.type === 'expense' || row.type === 'loss' ? 'text-red-500' : 'text-foreground'} ${row.type === 'profit' || row.type === 'loss' ? 'text-[1rem]' : ''}`}>
                    {row.amount < 0 ? '-' : ''}Rs.{Math.abs(row.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== STORE PERFORMANCE TAB ===== */}
      {reportTab === 'store' && (
        <div className="space-y-5">
          {/* Store KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'Peak Hours', value: data.storeMetrics.peakHour, sub: 'Busiest time slot', icon: Clock, color: 'bg-orange-50 text-orange-600' },
              { label: 'Table Utilization', value: `${data.storeMetrics.tableUtilization}%`, sub: `Avg turnover: ${data.storeMetrics.avgTurnover}x`, icon: Target, color: 'bg-blue-50 text-blue-600' },
              { label: 'Customer Rating', value: `${data.storeMetrics.customerSatisfaction}/5`, sub: `${data.storeMetrics.returnRate}% return rate`, icon: Star, color: 'bg-amber-50 text-amber-600' },
              { label: 'Avg Wait Time', value: `${data.storeMetrics.avgWaitTime} min`, sub: 'Order to serve', icon: Clock, color: 'bg-cyan-50 text-cyan-600' },
              { label: 'Revenue/Order', value: `Rs.${data.avgOrderValue}`, sub: `${data.orders} total orders`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
              { label: 'Dine-in Share', value: `${data.orders > 0 ? Math.round(data.dineIn.count / data.orders * 100) : 0}%`, sub: `${data.dineIn.count} of ${data.orders}`, icon: Store, color: 'bg-purple-50 text-purple-600' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl p-4 border border-border">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${kpi.color}`}><kpi.icon className="w-4 h-4" /></div>
                <p className="text-foreground text-[1.1rem]">{kpi.value}</p>
                <p className="text-muted-foreground text-[0.72rem]">{kpi.label}</p>
                <p className="text-muted-foreground text-[0.65rem] mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Order Volume Chart */}
          <div className="bg-white rounded-xl p-4 border border-border">
            <h3 className="text-foreground mb-4 text-[0.95rem]">Order Volume — {periodLabel}</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.trendData} id="bar-order-volume">
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis key="xaxis" dataKey="label" stroke="#94A3B8" fontSize={11} />
                <YAxis key="yaxis" stroke="#94A3B8" fontSize={11} />
                <Tooltip key="tooltip" />
                <Bar key="bar-orders" dataKey="orders" fill="#FF6B35" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Store Performance Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-border">
              <h3 className="text-foreground mb-4 text-[0.95rem]">Store Health Score</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart id="radar-store-perf" data={[
                  { metric: 'Revenue', score: Math.min(100, Math.round(data.revenue / (data.prevRevenue || 1) * 70)) },
                  { metric: 'Orders', score: Math.min(100, Math.round(data.orders / (data.prevOrders || 1) * 70)) },
                  { metric: 'Utilization', score: data.storeMetrics.tableUtilization },
                  { metric: 'Satisfaction', score: data.storeMetrics.customerSatisfaction * 20 },
                  { metric: 'Efficiency', score: 100 - data.storeMetrics.avgWaitTime * 3 },
                  { metric: 'Retention', score: data.storeMetrics.returnRate * 2.5 },
                ]}>
                  <PolarGrid key="pgrid" stroke="#E2E8F0" />
                  <PolarAngleAxis key="pangle" dataKey="metric" stroke="#94A3B8" fontSize={11} />
                  <PolarRadiusAxis key="pradius" angle={30} domain={[0, 100]} stroke="#E2E8F0" fontSize={9} />
                  <Radar key="radar-score" name="Score" dataKey="score" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl p-4 border border-border">
              <h3 className="text-foreground mb-4 text-[0.95rem]">Revenue per Order Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.trendData.map(d => ({ ...d, avgValue: d.orders > 0 ? Math.round(d.revenue / d.orders) : 0 }))} id="line-avg-order">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip formatter={(v: number) => `Rs.${v}`} />
                  <Line type="monotone" dataKey="avgValue" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', r: 3 }} name="Avg Value" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ===== EMPLOYEES TAB ===== */}
      {reportTab === 'employees' && (
        <div className="space-y-5">
          {/* Employee Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {(() => {
              const activeEmps = empPerf.filter(e => e.status === 'Active');
              const totalPayroll = empPerf.reduce((s, e) => s + e.monthlyCost, 0);
              const avgAttendance = activeEmps.length > 0 ? Math.round(activeEmps.reduce((s, e) => s + e.attendance, 0) / activeEmps.length) : 0;
              const avgEfficiency = activeEmps.length > 0 ? Math.round(activeEmps.reduce((s, e) => s + e.efficiency, 0) / activeEmps.length) : 0;
              return [
                { label: 'Active Staff', value: activeEmps.length, sub: `${empPerf.filter(e => e.status === 'On Leave').length} on leave`, icon: Users, color: 'bg-blue-50 text-blue-600' },
                { label: 'Monthly Payroll', value: `Rs.${totalPayroll.toLocaleString()}`, sub: `${empPerf.length} employees`, icon: Wallet, color: 'bg-green-50 text-green-600' },
                { label: 'Avg Attendance', value: `${avgAttendance}%`, sub: 'Active staff only', icon: Calendar, color: 'bg-orange-50 text-orange-600' },
                { label: 'Avg Efficiency', value: `${avgEfficiency}%`, sub: 'Based on output', icon: Activity, color: 'bg-purple-50 text-purple-600' },
              ];
            })().map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl p-4 border border-border">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${kpi.color}`}><kpi.icon className="w-4 h-4" /></div>
                <p className="text-foreground text-[1.1rem]">{kpi.value}</p>
                <p className="text-muted-foreground text-[0.72rem]">{kpi.label}</p>
                <p className="text-muted-foreground text-[0.65rem] mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Employee Performance Table */}
          <div className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-foreground text-[0.95rem]">Employee Performance — {periodLabel}</h3>
              <button onClick={() => downloadCSV(empPerf.map(e => ({ name: e.name, role: e.role, shift: e.shift, attendance: e.attendance + '%', efficiency: e.efficiency + '%', ordersHandled: e.ordersHandled, rating: e.rating, tips: e.tips, monthlyCost: e.monthlyCost })), `employee_perf_${period}`)} className="text-primary text-[0.8rem] cursor-pointer hover:underline flex items-center gap-1"><Download className="w-3.5 h-3.5" /> CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[0.8rem]">
                <thead><tr className="text-muted-foreground border-b border-border"><th className="text-left py-2 px-2">Employee</th><th className="text-left py-2 px-2">Role</th><th className="text-left py-2 px-2">Shift</th><th className="text-center py-2 px-2">Attendance</th><th className="text-center py-2 px-2">Efficiency</th><th className="text-right py-2 px-2">Tasks</th><th className="text-center py-2 px-2">Rating</th><th className="text-right py-2 px-2">Tips</th><th className="text-right py-2 px-2">Cost/mo</th></tr></thead>
                <tbody>
                  {empPerf.sort((a, b) => b.efficiency - a.efficiency).map(emp => (
                    <tr key={emp.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-muted shrink-0"><ImageWithFallback src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" /></div>
                          <div><p className="text-foreground text-[0.8rem]">{emp.name}</p><p className="text-[0.65rem] text-muted-foreground">{emp.id}</p></div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-foreground">{emp.role}</td>
                      <td className="py-2.5 px-2"><span className="text-[0.7rem] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{emp.shift}</span></td>
                      <td className="py-2.5 px-2 text-center">
                        <div className="inline-flex items-center gap-1"><div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${emp.attendance >= 90 ? 'bg-green-500' : emp.attendance >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${emp.attendance}%` }} /></div><span className="text-[0.72rem] text-muted-foreground">{emp.attendance}%</span></div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`text-[0.72rem] px-1.5 py-0.5 rounded ${emp.efficiency >= 90 ? 'bg-green-50 text-green-600' : emp.efficiency >= 75 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>{emp.efficiency}%</span>
                      </td>
                      <td className="py-2.5 px-2 text-right text-foreground">{emp.ordersHandled.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex items-center justify-center gap-0.5"><Star className="w-3 h-3 text-amber-500 fill-amber-500" /><span className="text-[0.78rem] text-foreground">{emp.rating}</span></div>
                      </td>
                      <td className="py-2.5 px-2 text-right">{emp.tips > 0 ? <span className="text-green-600">Rs.{emp.tips.toLocaleString()}</span> : <span className="text-muted-foreground">-</span>}</td>
                      <td className="py-2.5 px-2 text-right text-foreground">
                        Rs.{emp.monthlyCost.toLocaleString()}
                        <span className={`ml-1 text-[0.6rem] px-1 py-0.5 rounded ${emp.salaryType === 'Daily' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{emp.salaryType === 'Daily' ? '/day' : '/mo'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Employee Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-border">
              <h3 className="text-foreground mb-4 text-[0.95rem]">Efficiency by Role</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart id="bar-salary-by-role" data={(() => {
                  const roles: Record<string, { total: number; count: number }> = {};
                  empPerf.filter(e => e.status === 'Active').forEach(e => {
                    if (!roles[e.role]) roles[e.role] = { total: 0, count: 0 };
                    roles[e.role].total += e.efficiency; roles[e.role].count++;
                  });
                  return Object.entries(roles).map(([role, d]) => ({ role, efficiency: Math.round(d.total / d.count) }));
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="role" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} domain={[0, 100]} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="efficiency" radius={[4, 4, 0, 0]} barSize={30}>
                    {[0, 1, 2, 3, 4, 5].map(i => <Cell key={`role-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl p-4 border border-border">
              <h3 className="text-foreground mb-4 text-[0.95rem]">Payroll Distribution</h3>
              <ResponsiveContainer width="100%" height={240}>
                <RechartsPie id="pie-payroll-dist">
                  <Pie data={(() => {
                    const roles: Record<string, number> = {};
                    empPerf.forEach(e => { roles[e.role] = (roles[e.role] || 0) + e.monthlyCost; });
                    return Object.entries(roles).map(([role, cost]) => ({ name: role, value: cost }));
                  })()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {[0, 1, 2, 3, 4, 5].map(i => <Cell key={`payroll-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `Rs.${v.toLocaleString()}`} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-xl p-4 border border-border">
            <h3 className="text-foreground mb-3 text-[0.95rem]">Top Performers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {empPerf.filter(e => e.status === 'Active').sort((a, b) => b.efficiency - a.efficiency).slice(0, 3).map((emp, i) => (
                <div key={emp.id} className={`rounded-xl p-4 border ${i === 0 ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' : 'bg-muted/30 border-border'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted"><ImageWithFallback src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" /></div>
                      <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[0.6rem] ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-700'}`}>{i + 1}</div>
                    </div>
                    <div>
                      <p className="text-foreground text-[0.88rem]">{emp.name}</p>
                      <p className="text-muted-foreground text-[0.72rem]">{emp.role} · {emp.shift}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div><p className="text-foreground text-[0.9rem]">{emp.efficiency}%</p><p className="text-muted-foreground text-[0.62rem]">Efficiency</p></div>
                    <div><p className="text-foreground text-[0.9rem]">{emp.attendance}%</p><p className="text-muted-foreground text-[0.62rem]">Attendance</p></div>
                    <div><p className="text-foreground text-[0.9rem]">{emp.rating}</p><p className="text-muted-foreground text-[0.62rem]">Rating</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============== SETTINGS ============== */
function SettingsView() {
  const [settings, setSettings] = useState<RestaurantSettings>(getSettings());
  const [editingUpi, setEditingUpi] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(false);
  const [tempUpiId, setTempUpiId] = useState(settings.upiId);
  const [tempUpiName, setTempUpiName] = useState(settings.upiDisplayName);
  const [tempName, setTempName] = useState(settings.restaurantName);
  const [tempGst, setTempGst] = useState(settings.gstNumber);
  const [tempPhone, setTempPhone] = useState(settings.phone);
  const [tempAddress, setTempAddress] = useState(settings.address);
  const [upiTestAmount, setUpiTestAmount] = useState('100');

  const isValidUpi = (upi: string) => /^[\w.\-]+@[\w]+$/.test(upi);

  const handleSaveUpi = () => {
    if (!isValidUpi(tempUpiId)) {
      toast.error('Invalid UPI ID format. Use format: name@bankname');
      return;
    }
    if (!tempUpiName.trim()) {
      toast.error('Display name is required');
      return;
    }
    const updated = { ...settings, upiId: tempUpiId.trim(), upiDisplayName: tempUpiName.trim() };
    setSettings(updated);
    saveSettings(updated);
    setEditingUpi(false);
    toast.success('UPI settings saved successfully!');
  };

  const handleSaveRestaurant = () => {
    const updated = { ...settings, restaurantName: tempName.trim(), gstNumber: tempGst.trim(), phone: tempPhone.trim(), address: tempAddress.trim() };
    setSettings(updated);
    saveSettings(updated);
    setEditingRestaurant(false);
    toast.success('Restaurant details saved!');
  };

  const upiPreviewUrl = `upi://pay?pa=${encodeURIComponent(tempUpiId)}&pn=${encodeURIComponent(tempUpiName)}&am=${upiTestAmount}&cu=INR&tn=TestPayment`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-primary" />
        <h2 className="text-foreground">Settings</h2>
      </div>

      {/* UPI Payment Settings */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <QrCode className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-foreground text-[0.95rem]">UPI Payment Settings</h3>
                <p className="text-muted-foreground text-[0.75rem]">Configure the UPI ID used for QR code payments at the Cashier POS</p>
              </div>
            </div>
            {!editingUpi && (
              <button
                onClick={() => { setEditingUpi(true); setTempUpiId(settings.upiId); setTempUpiName(settings.upiDisplayName); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-orange-200 text-orange-600 rounded-lg text-[0.8rem] hover:bg-orange-50 transition-all cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="p-5">
          {!editingUpi ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-muted rounded-xl p-4">
                  <p className="text-muted-foreground text-[0.7rem] mb-1">UPI ID</p>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-orange-500" />
                    <span className="text-foreground text-[0.95rem] font-mono">{settings.upiId}</span>
                  </div>
                </div>
                <div className="flex-1 bg-muted rounded-xl p-4">
                  <p className="text-muted-foreground text-[0.7rem] mb-1">Display Name (on QR)</p>
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-orange-500" />
                    <span className="text-foreground text-[0.95rem]">{settings.upiDisplayName}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div className="text-[0.75rem] text-blue-700 space-y-1">
                  <p>This UPI ID is used when the cashier selects <strong>&quot;QR Code&quot;</strong> as the payment method. The generated QR encodes a UPI deep link with the order amount pre-filled.</p>
                  <p>Customers can scan with Google Pay, PhonePe, Paytm, or any UPI app to pay instantly.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-[0.8rem] text-foreground mb-1.5 block">UPI ID <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={tempUpiId}
                    onChange={(e) => setTempUpiId(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 font-mono ${
                      tempUpiId && !isValidUpi(tempUpiId) ? 'border-red-300 focus:ring-red-200' : 'border-border focus:ring-orange-200 focus:border-orange-300'
                    }`}
                    placeholder="yourstore@bankname"
                  />
                </div>
                {tempUpiId && !isValidUpi(tempUpiId) && (
                  <p className="text-red-500 text-[0.7rem] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Invalid format. Use: name@bankname (e.g. shop@ybl, store@paytm)
                  </p>
                )}
                <p className="text-muted-foreground text-[0.7rem] mt-1">Examples: restaurant@ybl, shop@paytm, store@oksbi, name@upi</p>
              </div>

              <div>
                <label className="text-[0.8rem] text-foreground mb-1.5 block">Display Name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={tempUpiName}
                    onChange={(e) => setTempUpiName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                    placeholder="Your Restaurant Name"
                  />
                </div>
                <p className="text-muted-foreground text-[0.7rem] mt-1">Shown to customers when they scan the QR code</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-[0.75rem] text-orange-600 mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Live UPI Link Preview
                </p>
                <div className="bg-white rounded-lg p-3 border border-orange-100">
                  <code className="text-[0.65rem] text-foreground break-all font-mono leading-relaxed">{upiPreviewUrl}</code>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <label className="text-[0.7rem] text-orange-600">Test amount:</label>
                  <input
                    type="number"
                    value={upiTestAmount}
                    onChange={(e) => setUpiTestAmount(e.target.value)}
                    className="w-24 px-2 py-1 border border-orange-200 rounded text-[0.75rem] text-center focus:outline-none focus:ring-1 focus:ring-orange-300"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingUpi(false)}
                  className="flex-1 px-4 py-2.5 bg-white border border-border rounded-lg text-[0.85rem] text-muted-foreground hover:bg-muted transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUpi}
                  disabled={!isValidUpi(tempUpiId) || !tempUpiName.trim()}
                  className="flex-[2] flex items-center justify-center gap-1.5 px-4 py-2.5 bg-orange-500 text-white rounded-lg text-[0.85rem] hover:bg-orange-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Save UPI Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-foreground text-[0.95rem]">Restaurant Details</h3>
                <p className="text-muted-foreground text-[0.75rem]">Business info used on receipts and invoices</p>
              </div>
            </div>
            {!editingRestaurant && (
              <button
                onClick={() => { setEditingRestaurant(true); setTempName(settings.restaurantName); setTempGst(settings.gstNumber); setTempPhone(settings.phone); setTempAddress(settings.address); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-purple-200 text-purple-600 rounded-lg text-[0.8rem] hover:bg-purple-50 transition-all cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="p-5">
          {!editingRestaurant ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted rounded-xl p-4">
                <p className="text-muted-foreground text-[0.7rem] mb-1">Restaurant Name</p>
                <p className="text-foreground text-[0.9rem]">{settings.restaurantName}</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-muted-foreground text-[0.7rem] mb-1">GST Number</p>
                <p className="text-foreground text-[0.9rem] font-mono">{settings.gstNumber}</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-muted-foreground text-[0.7rem] mb-1">Phone</p>
                <p className="text-foreground text-[0.9rem]">{settings.phone}</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-muted-foreground text-[0.7rem] mb-1">Address</p>
                <p className="text-foreground text-[0.9rem]">{settings.address}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[0.8rem] text-foreground mb-1.5 block">Restaurant Name</label>
                  <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300" />
                </div>
                <div>
                  <label className="text-[0.8rem] text-foreground mb-1.5 block">GST Number</label>
                  <input type="text" value={tempGst} onChange={(e) => setTempGst(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-[0.85rem] font-mono focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300" />
                </div>
                <div>
                  <label className="text-[0.8rem] text-foreground mb-1.5 block">Phone</label>
                  <input type="text" value={tempPhone} onChange={(e) => setTempPhone(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300" />
                </div>
                <div>
                  <label className="text-[0.8rem] text-foreground mb-1.5 block">Address</label>
                  <input type="text" value={tempAddress} onChange={(e) => setTempAddress(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditingRestaurant(false)} className="flex-1 px-4 py-2.5 bg-white border border-border rounded-lg text-[0.85rem] text-muted-foreground hover:bg-muted transition-all cursor-pointer">Cancel</button>
                <button onClick={handleSaveRestaurant} className="flex-[2] flex items-center justify-center gap-1.5 px-4 py-2.5 bg-purple-500 text-white rounded-lg text-[0.85rem] hover:bg-purple-600 transition-all cursor-pointer">
                  <Save className="w-4 h-4" />
                  Save Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* UPI Format Reference */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-foreground text-[0.95rem]">UPI QR Code Reference</h3>
              <p className="text-muted-foreground text-[0.75rem]">How the dynamic QR code works at the POS</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="w-10 h-10 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-[0.9rem]">1</span>
              </div>
              <p className="text-foreground text-[0.8rem]">Cashier selects QR Code</p>
              <p className="text-muted-foreground text-[0.65rem] mt-1">Payment method in POS</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-[0.9rem]">2</span>
              </div>
              <p className="text-foreground text-[0.8rem]">Dynamic QR Generated</p>
              <p className="text-muted-foreground text-[0.65rem] mt-1">Amount + UPI ID encoded</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="w-10 h-10 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-[0.9rem]">3</span>
              </div>
              <p className="text-foreground text-[0.8rem]">Customer Scans & Pays</p>
              <p className="text-muted-foreground text-[0.65rem] mt-1">GPay / PhonePe / Paytm</p>
            </div>
          </div>
          <div className="bg-muted rounded-xl p-4">
            <p className="text-[0.75rem] text-muted-foreground mb-2">Generated UPI URL format:</p>
            <code className="text-[0.7rem] text-foreground font-mono break-all">
              {'upi://pay?pa='}<span className="text-orange-600">{settings.upiId}</span>{'&pn='}<span className="text-purple-600">{settings.upiDisplayName}</span>{'&am='}<span className="text-green-600">[amount]</span>{'&cu=INR&tn='}<span className="text-blue-600">[order_ref]</span>
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
