import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Zap, Home, ShoppingCart, Truck, FileText, Settings,
  Check, X, Package, Clock, DollarSign, AlertCircle, ChevronRight, Upload,
  Phone, Mail, Building, MapPin, Bell, BellOff, Save, Edit, Eye
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { purchaseOrders, type PurchaseOrder, type Invoice } from '../../data';

const bottomTabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function SupplierPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [orders, setOrders] = useState<PurchaseOrder[]>(purchaseOrders);
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-001', date: '2026-03-10', amount: 4000, status: 'Paid', orderId: 'PO-004' },
    { id: 'INV-002', date: '2026-03-05', amount: 3200, status: 'Paid', orderId: 'PO-003' },
    { id: 'INV-003', date: '2026-02-28', amount: 5600, status: 'Paid', orderId: 'PO-001' },
  ]);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Settings state
  const [profile, setProfile] = useState({
    name: 'Kumbakonam Coffee', contact: '+91 54321 09876', email: 'beans@kumbakonamcoffee.com',
    address: '45, Raja Street, Kumbakonam, Tamil Nadu 612001', gst: '33AAKFK1234A1ZB',
  });
  const [bankDetails, setBankDetails] = useState({
    accountName: 'Kumbakonam Coffee Pvt Ltd', accountNumber: '1234567890123', ifsc: 'SBIN0001234', bank: 'State Bank of India',
  });
  const [notifications, setNotifications] = useState({ email: true, sms: true, orderUpdates: true, paymentAlerts: true });
  const [settingsSection, setSettingsSection] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingBank, setEditingBank] = useState(false);

  const pendingOrders = orders.filter((o) => o.status === 'Requested' || o.status === 'Confirmed');
  const shippedOrders = orders.filter((o) => o.status === 'Shipped');
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered');
  const rejectedOrders = orders.filter((o) => o.status === 'Rejected');

  const totalPending = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Rejected').reduce((s, o) => s + o.total_amount, 0);
  const totalReceived = deliveredOrders.reduce((s, o) => s + o.total_amount, 0);

  const updateOrderStatus = (id: string, status: PurchaseOrder['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    toast.success(`Order ${id} marked as ${status}`);
  };

  const rejectOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Rejected' as PurchaseOrder['status'], notes: rejectReason } : o));
    toast.error(`Order ${id} rejected`);
    setShowRejectModal(null);
    setRejectReason('');
  };

  const uploadInvoice = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const newInv: Invoice = {
      id: `INV-${String(Date.now()).slice(-3)}`,
      date: new Date().toISOString().split('T')[0],
      amount: order.total_amount,
      status: 'Pending',
      orderId,
      fileName: `invoice_${orderId}.pdf`,
    };
    setInvoices(prev => [newInv, ...prev]);
    toast.success(`Invoice uploaded for ${orderId}`);
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="bg-primary text-white p-4 rounded-b-2xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/login')} className="text-white/80 hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span className="text-[0.9rem]">Supplier Portal</span>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-[0.8rem]">K</div>
        </div>
        <div>
          <p className="text-white/80 text-[0.8rem]">Welcome back,</p>
          <p className="text-[1.1rem]">{profile.name}</p>
        </div>
      </header>

      <div className="p-4 pb-24">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'New Orders', value: pendingOrders.length, icon: ShoppingCart, color: 'text-orange-500 bg-orange-50' },
                { label: 'In Transit', value: shippedOrders.length, icon: Truck, color: 'text-blue-500 bg-blue-50' },
                { label: 'Delivered', value: deliveredOrders.length, icon: Check, color: 'text-green-500 bg-green-50' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-3 border border-border text-center">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 ${stat.color}`}><stat.icon className="w-4.5 h-4.5" /></div>
                  <p className="text-foreground text-[1.2rem]">{stat.value}</p>
                  <p className="text-muted-foreground text-[0.65rem]">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-xl p-4 border border-border mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-foreground text-[0.9rem]">Payment Summary</h4>
                <button onClick={() => setActiveTab('invoices')} className="text-accent text-[0.75rem] cursor-pointer">View All</button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[0.85rem]">
                  <span className="text-muted-foreground">Total Pending</span>
                  <span className="text-foreground">Rs.{totalPending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[0.85rem]">
                  <span className="text-muted-foreground">Received This Month</span>
                  <span className="text-accent">Rs.{totalReceived.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[0.85rem]">
                  <span className="text-muted-foreground">Rejected</span>
                  <span className="text-destructive">Rs.{rejectedOrders.reduce((s, o) => s + o.total_amount, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <h4 className="text-foreground mb-3 text-[0.9rem]">Recent Orders</h4>
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} onReject={(id) => setShowRejectModal(id)} onView={(o) => setSelectedOrder(o)} />
              ))}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            <h3 className="text-foreground mb-4">All Orders</h3>
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-12"><ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No orders yet</p></div>
              ) : orders.map((order) => (
                <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} onReject={(id) => setShowRejectModal(id)} onView={(o) => setSelectedOrder(o)} showActions />
              ))}
            </div>
          </div>
        )}

        {/* DELIVERY TAB */}
        {activeTab === 'delivery' && (
          <div>
            <h3 className="text-foreground mb-4">Delivery Management</h3>
            {shippedOrders.length === 0 && pendingOrders.filter(o => o.status === 'Confirmed').length === 0 ? (
              <div className="text-center py-12"><Truck className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No active deliveries</p></div>
            ) : (
              <div className="space-y-3">
                {[...orders.filter(o => o.status === 'Confirmed'), ...shippedOrders].map((order) => (
                  <div key={order.id} className="bg-white rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-foreground text-[0.9rem]">{order.id}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-muted-foreground text-[0.8rem] mb-2">Expected: {order.expected_delivery}</p>
                    <div className="text-[0.8rem] text-muted-foreground mb-3">
                      {order.items.map((item, i) => <span key={i} className="mr-2">{item.quantity}{item.unit} {item.ingredient}</span>)}
                    </div>
                    <p className="text-foreground text-[0.85rem] mb-3">Rs.{order.total_amount.toLocaleString()}</p>
                    <div className="flex gap-2">
                      {order.status === 'Confirmed' && (
                        <button onClick={() => updateOrderStatus(order.id, 'Shipped')} className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg text-[0.8rem] hover:brightness-110 cursor-pointer flex items-center justify-center gap-1">
                          <Truck className="w-3.5 h-3.5" /> Mark Shipped
                        </button>
                      )}
                      {order.status === 'Shipped' && (
                        <>
                          <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="flex-1 bg-accent text-white py-2.5 rounded-lg text-[0.8rem] hover:brightness-110 cursor-pointer flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Mark Delivered
                          </button>
                          <button onClick={() => uploadInvoice(order.id)} className="px-4 py-2.5 bg-white border border-border text-foreground rounded-lg text-[0.8rem] hover:bg-muted cursor-pointer flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" /> Invoice
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <div>
            <h3 className="text-foreground mb-4">Invoice Management</h3>

            {/* Upload Area */}
            <label className="w-full bg-white rounded-xl border-2 border-dashed border-border p-8 text-center hover:border-primary/50 transition-colors cursor-pointer mb-4 block">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground text-[0.85rem]">Tap to upload invoice</p>
              <p className="text-muted-foreground text-[0.7rem] mt-1">PDF, JPG or PNG</p>
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const newInv: Invoice = {
                    id: `INV-${String(Date.now()).slice(-3)}`,
                    date: new Date().toISOString().split('T')[0],
                    amount: 0,
                    status: 'Pending',
                    orderId: '-',
                    fileName: file.name,
                  };
                  setInvoices(prev => [newInv, ...prev]);
                  toast.success(`${file.name} uploaded successfully`);
                }
              }} />
            </label>

            {/* Quick Upload for Delivered Orders */}
            {deliveredOrders.filter(o => !invoices.some(inv => inv.orderId === o.id)).length > 0 && (
              <div className="mb-4">
                <p className="text-[0.8rem] text-muted-foreground mb-2">Quick invoice for delivered orders:</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {deliveredOrders.filter(o => !invoices.some(inv => inv.orderId === o.id)).map(o => (
                    <button key={o.id} onClick={() => uploadInvoice(o.id)} className="px-3 py-1.5 bg-accent/10 text-accent rounded-full text-[0.75rem] whitespace-nowrap cursor-pointer hover:bg-accent/20">
                      {o.id} - Rs.{o.total_amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <h4 className="text-foreground mb-3 text-[0.9rem]">All Invoices ({invoices.length})</h4>
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="bg-white rounded-xl border border-border p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${inv.status === 'Paid' ? 'bg-green-50' : inv.status === 'Pending' ? 'bg-amber-50' : 'bg-red-50'}`}>
                      <FileText className={`w-4 h-4 ${inv.status === 'Paid' ? 'text-green-600' : inv.status === 'Pending' ? 'text-amber-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <p className="text-foreground text-[0.85rem]">{inv.id}</p>
                      <p className="text-muted-foreground text-[0.7rem]">{inv.date} | {inv.orderId}</p>
                      {inv.fileName && <p className="text-muted-foreground text-[0.65rem]">{inv.fileName}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground text-[0.85rem]">Rs.{inv.amount.toLocaleString()}</p>
                    <span className={`text-[0.7rem] ${inv.status === 'Paid' ? 'text-accent' : inv.status === 'Pending' ? 'text-amber-600' : 'text-destructive'}`}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-border p-4 mt-4">
              <h4 className="text-foreground text-[0.9rem] mb-3">Invoice Summary</h4>
              <div className="space-y-2 text-[0.85rem]">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Invoices</span><span>{invoices.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-accent">Rs.{invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pending</span><span className="text-amber-600">Rs.{invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + i.amount, 0).toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div>
            <h3 className="text-foreground mb-4">Settings</h3>

            {!settingsSection && (
              <div className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile Information', desc: 'Update your business details', icon: Building },
                  { id: 'bank', label: 'Bank Details', desc: 'Manage payment information', icon: DollarSign },
                  { id: 'notifications', label: 'Notification Preferences', desc: 'Email & SMS alerts', icon: Bell },
                  { id: 'products', label: 'Product Catalog', desc: 'Manage your products', icon: Package },
                  { id: 'help', label: 'Help & Support', desc: 'Contact restaurant admin', icon: Phone },
                ].map((item) => (
                  <button key={item.id} onClick={() => setSettingsSection(item.id)} className="w-full bg-white rounded-xl border border-border p-4 flex items-center justify-between text-left cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center"><item.icon className="w-4 h-4 text-muted-foreground" /></div>
                      <div><p className="text-foreground text-[0.85rem]">{item.label}</p><p className="text-muted-foreground text-[0.7rem]">{item.desc}</p></div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}

            {/* Profile Section */}
            {settingsSection === 'profile' && (
              <div>
                <button onClick={() => { setSettingsSection(null); setEditingProfile(false); }} className="flex items-center gap-1 text-muted-foreground text-[0.85rem] mb-4 cursor-pointer"><ArrowLeft className="w-4 h-4" /> Back</button>
                <div className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-foreground">Profile Information</h4>
                    <button onClick={() => setEditingProfile(!editingProfile)} className="text-primary text-[0.8rem] cursor-pointer flex items-center gap-1">{editingProfile ? <><Check className="w-3.5 h-3.5" /> Done</> : <><Edit className="w-3.5 h-3.5" /> Edit</>}</button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: 'name', label: 'Company Name', icon: Building },
                      { key: 'contact', label: 'Phone', icon: Phone },
                      { key: 'email', label: 'Email', icon: Mail },
                      { key: 'address', label: 'Address', icon: MapPin },
                      { key: 'gst', label: 'GSTIN', icon: FileText },
                    ].map(field => (
                      <div key={field.key} className="flex items-start gap-3">
                        <field.icon className="w-4 h-4 text-muted-foreground mt-2.5" />
                        <div className="flex-1">
                          <p className="text-[0.7rem] text-muted-foreground">{field.label}</p>
                          {editingProfile ? (
                            <input type="text" value={(profile as any)[field.key]} onChange={e => setProfile({ ...profile, [field.key]: e.target.value })} className="w-full px-2 py-1.5 border border-border rounded text-[0.85rem] focus:outline-none focus:ring-1 focus:ring-primary/20 mt-0.5" />
                          ) : (
                            <p className="text-foreground text-[0.85rem]">{(profile as any)[field.key]}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {editingProfile && (
                    <button onClick={() => { setEditingProfile(false); toast.success('Profile saved'); }} className="w-full mt-4 bg-primary text-white py-2.5 rounded-lg text-[0.85rem] hover:brightness-110 cursor-pointer flex items-center justify-center gap-1"><Save className="w-4 h-4" /> Save Changes</button>
                  )}
                </div>
              </div>
            )}

            {/* Bank Details */}
            {settingsSection === 'bank' && (
              <div>
                <button onClick={() => { setSettingsSection(null); setEditingBank(false); }} className="flex items-center gap-1 text-muted-foreground text-[0.85rem] mb-4 cursor-pointer"><ArrowLeft className="w-4 h-4" /> Back</button>
                <div className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-foreground">Bank Details</h4>
                    <button onClick={() => setEditingBank(!editingBank)} className="text-primary text-[0.8rem] cursor-pointer flex items-center gap-1">{editingBank ? <><Check className="w-3.5 h-3.5" /> Done</> : <><Edit className="w-3.5 h-3.5" /> Edit</>}</button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: 'accountName', label: 'Account Name' },
                      { key: 'accountNumber', label: 'Account Number' },
                      { key: 'ifsc', label: 'IFSC Code' },
                      { key: 'bank', label: 'Bank Name' },
                    ].map(field => (
                      <div key={field.key}>
                        <p className="text-[0.7rem] text-muted-foreground">{field.label}</p>
                        {editingBank ? (
                          <input type="text" value={(bankDetails as any)[field.key]} onChange={e => setBankDetails({ ...bankDetails, [field.key]: e.target.value })} className="w-full px-2 py-1.5 border border-border rounded text-[0.85rem] focus:outline-none focus:ring-1 focus:ring-primary/20 mt-0.5" />
                        ) : (
                          <p className="text-foreground text-[0.85rem]">{field.key === 'accountNumber' ? '****' + (bankDetails as any)[field.key].slice(-4) : (bankDetails as any)[field.key]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {editingBank && (
                    <button onClick={() => { setEditingBank(false); toast.success('Bank details saved'); }} className="w-full mt-4 bg-primary text-white py-2.5 rounded-lg text-[0.85rem] hover:brightness-110 cursor-pointer flex items-center justify-center gap-1"><Save className="w-4 h-4" /> Save Changes</button>
                  )}
                </div>
              </div>
            )}

            {/* Notifications */}
            {settingsSection === 'notifications' && (
              <div>
                <button onClick={() => setSettingsSection(null)} className="flex items-center gap-1 text-muted-foreground text-[0.85rem] mb-4 cursor-pointer"><ArrowLeft className="w-4 h-4" /> Back</button>
                <div className="bg-white rounded-xl border border-border p-4">
                  <h4 className="text-foreground mb-4">Notification Preferences</h4>
                  <div className="space-y-4">
                    {[
                      { key: 'email', label: 'Email Notifications', desc: 'Receive order updates via email' },
                      { key: 'sms', label: 'SMS Notifications', desc: 'Get text alerts for urgent orders' },
                      { key: 'orderUpdates', label: 'Order Updates', desc: 'Status changes and new orders' },
                      { key: 'paymentAlerts', label: 'Payment Alerts', desc: 'Payment received notifications' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-foreground text-[0.85rem]">{item.label}</p>
                          <p className="text-muted-foreground text-[0.7rem]">{item.desc}</p>
                        </div>
                        <button onClick={() => { setNotifications(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] })); toast.success('Preference updated'); }} className="cursor-pointer">
                          {(notifications as any)[item.key] ? <Bell className="w-5 h-5 text-accent" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Products */}
            {settingsSection === 'products' && (
              <div>
                <button onClick={() => setSettingsSection(null)} className="flex items-center gap-1 text-muted-foreground text-[0.85rem] mb-4 cursor-pointer"><ArrowLeft className="w-4 h-4" /> Back</button>
                <div className="bg-white rounded-xl border border-border p-4">
                  <h4 className="text-foreground mb-4">Product Catalog</h4>
                  <div className="space-y-2">
                    {['Coffee Powder', 'Chicory', 'Tea Leaves', 'Filter Powder'].map(product => (
                      <div key={product} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground text-[0.85rem]">{product}</span>
                        </div>
                        <span className="text-[0.7rem] px-2 py-0.5 bg-green-50 text-green-600 rounded-full">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Help */}
            {settingsSection === 'help' && (
              <div>
                <button onClick={() => setSettingsSection(null)} className="flex items-center gap-1 text-muted-foreground text-[0.85rem] mb-4 cursor-pointer"><ArrowLeft className="w-4 h-4" /> Back</button>
                <div className="bg-white rounded-xl border border-border p-4">
                  <h4 className="text-foreground mb-4">Help & Support</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-[0.7rem] text-muted-foreground">Restaurant Admin</p>
                      <p className="text-foreground text-[0.85rem]">Vijay Anand (Manager)</p>
                      <p className="text-primary text-[0.8rem]">+91 54321 09876</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-[0.7rem] text-muted-foreground">Email Support</p>
                      <p className="text-primary text-[0.8rem]">admin@nnkadai.com</p>
                    </div>
                    <button onClick={() => toast.success('Support request sent!')} className="w-full bg-primary text-white py-2.5 rounded-lg text-[0.85rem] hover:brightness-110 cursor-pointer">Contact Support</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-t-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground">Order Details</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 text-[0.85rem]">
                <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="text-foreground">{selectedOrder.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={selectedOrder.status} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{selectedOrder.created_at}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Expected Delivery</span><span>{selectedOrder.expected_delivery}</span></div>
                <div className="border-t border-border pt-3">
                  <p className="text-muted-foreground mb-2">Items:</p>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-1">
                      <span>{item.ingredient}</span>
                      <span>{item.quantity} {item.unit} x Rs.{item.price} = Rs.{item.quantity * item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-3 border-t border-border text-foreground"><span>Total</span><span>Rs.{selectedOrder.total_amount.toLocaleString()}</span></div>
                {selectedOrder.notes && <div className="p-3 bg-red-50 rounded-lg text-[0.8rem] text-red-600">Note: {selectedOrder.notes}</div>}
              </div>
              {selectedOrder.status === 'Requested' && (
                <div className="flex gap-2 mt-5">
                  <button onClick={() => { updateOrderStatus(selectedOrder.id, 'Confirmed'); setSelectedOrder(null); }} className="flex-1 bg-accent text-white py-2.5 rounded-lg text-[0.85rem] hover:brightness-110 cursor-pointer flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Accept</button>
                  <button onClick={() => { setShowRejectModal(selectedOrder.id); setSelectedOrder(null); }} className="flex-1 bg-white text-destructive border border-destructive/30 py-2.5 rounded-lg text-[0.85rem] hover:bg-red-50 cursor-pointer flex items-center justify-center gap-1"><X className="w-4 h-4" /> Reject</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowRejectModal(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-foreground mb-3">Reject Order {showRejectModal}?</h3>
            <p className="text-muted-foreground text-[0.85rem] mb-3">Please provide a reason for rejection:</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={3}
              placeholder="e.g., Out of stock, Cannot meet delivery date..."
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => rejectOrder(showRejectModal)} className="flex-1 bg-destructive text-white py-2.5 rounded-lg text-[0.85rem] hover:brightness-110 cursor-pointer">Reject Order</button>
              <button onClick={() => { setShowRejectModal(null); setRejectReason(''); }} className="flex-1 bg-white border border-border py-2.5 rounded-lg text-[0.85rem] hover:bg-muted cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-border flex z-40">
        {bottomTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSettingsSection(null); }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-[0.6rem] cursor-pointer transition-colors ${
              activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {tab.id === 'orders' && orders.filter(o => o.status === 'Requested').length > 0 && (
              <span className="absolute top-1 right-1/2 translate-x-3 w-2 h-2 bg-destructive rounded-full" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Requested: 'bg-yellow-50 text-yellow-700', Confirmed: 'bg-blue-50 text-blue-700',
    Shipped: 'bg-purple-50 text-purple-700', Delivered: 'bg-green-50 text-green-700',
    Rejected: 'bg-red-50 text-red-700',
  };
  return <span className={`text-[0.7rem] px-2 py-0.5 rounded-full ${colors[status] || 'bg-muted text-muted-foreground'}`}>{status}</span>;
}

function OrderCard({ order, onUpdateStatus, onReject, onView, showActions = false }: {
  order: PurchaseOrder;
  onUpdateStatus: (id: string, status: PurchaseOrder['status']) => void;
  onReject: (id: string) => void;
  onView: (order: PurchaseOrder) => void;
  showActions?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-foreground text-[0.9rem]">{order.id}</span>
          <p className="text-muted-foreground text-[0.75rem]">Namma Naina Kadai</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <button onClick={() => onView(order)} className="text-muted-foreground hover:text-primary cursor-pointer"><Eye className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="space-y-1 mb-3">
        {order.items.map((item, i) => (
          <p key={i} className="text-muted-foreground text-[0.8rem]">{item.quantity}{item.unit} {item.ingredient}</p>
        ))}
      </div>

      <div className="flex items-center justify-between text-[0.75rem] text-muted-foreground mb-3">
        <span>Delivery: {order.expected_delivery}</span>
        <span className="text-foreground">Rs.{order.total_amount.toLocaleString()}</span>
      </div>

      {order.notes && order.status === 'Rejected' && (
        <p className="text-[0.75rem] text-destructive bg-red-50 rounded-lg px-3 py-1.5 mb-3">{order.notes}</p>
      )}

      {(showActions || order.status === 'Requested') && order.status === 'Requested' && (
        <div className="flex gap-2">
          <button onClick={() => onUpdateStatus(order.id, 'Confirmed')} className="flex-1 bg-accent text-white py-2 rounded-lg text-[0.8rem] hover:brightness-110 cursor-pointer flex items-center justify-center gap-1">
            <Check className="w-3.5 h-3.5" /> Accept
          </button>
          <button onClick={() => onReject(order.id)} className="flex-1 bg-white text-destructive border border-destructive/30 py-2 rounded-lg text-[0.8rem] hover:bg-red-50 cursor-pointer flex items-center justify-center gap-1">
            <X className="w-3.5 h-3.5" /> Reject
          </button>
        </div>
      )}
    </div>
  );
}