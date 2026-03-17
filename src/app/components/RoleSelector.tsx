import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap, Tablet, Monitor, ChefHat, Package, ConciergeBell,
  ArrowRight, ArrowLeft, User, Users, UsersRound, Check,
  LayoutDashboard, Settings2,
} from 'lucide-react';
import {
  getPerspectiveMode, savePerspectiveMode, clearPerspectiveMode,
  type PerspectiveMode,
} from '../data';

/* ============ Perspective definitions ============ */
interface PerspectiveOption {
  mode: PerspectiveMode;
  title: string;
  subtitle: string;
  desc: string;
  icon: typeof User;
  color: string;
  gradient: string;
  roles: string[];
}

const perspectives: PerspectiveOption[] = [
  {
    mode: 1,
    title: '1 Perspective',
    subtitle: 'Solo Operator',
    desc: 'Single person handles billing, orders & admin. Ideal for small food stalls & single-counter setups.',
    icon: User,
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-red-500',
    roles: ['Cashier POS', 'Admin Dashboard'],
  },
  {
    mode: 2,
    title: '2 Perspectives',
    subtitle: 'Cashier + Kitchen Manager',
    desc: 'Cashier handles billing while Kitchen Manager oversees kitchen, waiters & parcel. For mid-size restaurants.',
    icon: Users,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-indigo-600',
    roles: ['Cashier POS', 'Kitchen Manager', 'Admin Dashboard'],
  },
  {
    mode: 4,
    title: '4 Perspectives',
    subtitle: 'Full Team',
    desc: 'Dedicated screens for each role — cashier, kitchen, parcel counter & waiter. For busy restaurants.',
    icon: UsersRound,
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-indigo-600',
    roles: ['Cashier POS', 'Kitchen Display', 'Parcel Counter', 'Waiter View', 'Admin Dashboard'],
  },
];

/* ============ Role card definitions per mode ============ */
interface RoleCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Tablet;
  device: string;
  color: string;
  path: string;
}

const rolesByMode: Record<PerspectiveMode, RoleCard[]> = {
  1: [
    { id: 'cashier', title: 'Cashier', subtitle: 'POS System', description: 'Take orders, manage billing, process payments & handle everything', icon: Tablet, device: 'Tablet / Touch Screen', color: 'from-orange-500 to-red-500', path: '/cashier' },
    { id: 'admin', title: 'Admin', subtitle: 'Control Panel', description: 'Dashboard, menu, inventory, suppliers, reports & live operations', icon: Monitor, device: 'Desktop', color: 'from-blue-600 to-indigo-600', path: '/admin' },
  ],
  2: [
    { id: 'cashier', title: 'Cashier', subtitle: 'POS System', description: 'Take orders, manage billing & process payments', icon: Tablet, device: 'Tablet / Touch Screen', color: 'from-orange-500 to-red-500', path: '/cashier' },
    { id: 'kitchen-manager', title: 'Kitchen Manager', subtitle: 'Operations Hub', description: 'Manage kitchen orders, waiter assignments & parcel counter in one view', icon: ChefHat, device: 'Desktop / Tablet', color: 'from-amber-500 to-orange-600', path: '/kitchen-manager' },
    { id: 'admin', title: 'Admin', subtitle: 'Control Panel', description: 'Dashboard, menu, inventory, suppliers, reports & live operations', icon: Monitor, device: 'Desktop', color: 'from-blue-600 to-indigo-600', path: '/admin' },
  ],
  4: [
    { id: 'cashier', title: 'Cashier', subtitle: 'POS System', description: 'Take orders, manage billing & process payments', icon: Tablet, device: 'Tablet / Touch Screen', color: 'from-orange-500 to-red-500', path: '/cashier' },
    { id: 'kitchen', title: 'Kitchen', subtitle: 'Display System', description: 'View incoming orders, track prep time & mark items ready', icon: ChefHat, device: 'Kitchen Screen', color: 'from-amber-500 to-orange-600', path: '/kitchen' },
    { id: 'parcel', title: 'Parcel', subtitle: 'Take Away Counter', description: 'Manage parcel queue, packing status & pickup tokens', icon: Package, device: 'Counter Screen', color: 'from-purple-500 to-indigo-600', path: '/parcel' },
    { id: 'waiter', title: 'Waiter', subtitle: 'Service View', description: 'Manage tables, take orders from floor & serve customers', icon: ConciergeBell, device: 'Mobile / Tablet', color: 'from-cyan-500 to-blue-500', path: '/waiter' },
    { id: 'admin', title: 'Admin', subtitle: 'Control Panel', description: 'Dashboard, menu, inventory, suppliers, reports & live operations', icon: Monitor, device: 'Desktop', color: 'from-blue-600 to-indigo-600', path: '/admin' },
  ],
};

export function RoleSelector() {
  const navigate = useNavigate();
  const [savedMode, setSavedMode] = useState<PerspectiveMode | null>(null);
  const [step, setStep] = useState<'choose' | 'roles'>('choose');
  const [selectedMode, setSelectedMode] = useState<PerspectiveMode | null>(null);
  const [hoveredMode, setHoveredMode] = useState<PerspectiveMode | null>(null);

  useEffect(() => {
    const mode = getPerspectiveMode();
    if (mode) {
      setSavedMode(mode);
      setSelectedMode(mode);
      setStep('roles');
    }
  }, []);

  const confirmMode = (mode: PerspectiveMode) => {
    savePerspectiveMode(mode);
    setSavedMode(mode);
    setSelectedMode(mode);
    setStep('roles');
  };

  const changeMode = () => {
    clearPerspectiveMode();
    setSavedMode(null);
    setSelectedMode(null);
    setStep('choose');
  };

  const activeRoles = selectedMode ? rolesByMode[selectedMode] : [];
  const activePerspective = perspectives.find(p => p.mode === selectedMode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <AnimatePresence mode="wait">
        {/* ============ STEP 1: Choose Perspective ============ */}
        {step === 'choose' && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-[2rem] text-foreground">Namma Naina Kadai</h1>
              </div>
              <p className="text-muted-foreground">Choose how many people will operate your restaurant</p>
            </div>

            {/* Perspective cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {perspectives.map(p => {
                const isHovered = hoveredMode === p.mode;
                return (
                  <motion.button
                    key={p.mode}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => confirmMode(p.mode)}
                    onMouseEnter={() => setHoveredMode(p.mode)}
                    onMouseLeave={() => setHoveredMode(null)}
                    className="bg-white rounded-2xl p-6 border border-border hover:shadow-xl hover:border-primary/30 transition-all text-left cursor-pointer group relative overflow-hidden"
                  >
                    {/* Background glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />

                    <div className="relative">
                      {/* Mode badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <p.icon className="w-7 h-7 text-white" />
                        </div>
                        <span className={`text-[2.5rem] ${p.color} opacity-10 group-hover:opacity-20 transition-opacity`}>
                          {p.mode}
                        </span>
                      </div>

                      <h2 className="text-foreground mb-0.5">{p.title}</h2>
                      <p className="text-primary text-[0.82rem] mb-2">{p.subtitle}</p>
                      <p className="text-muted-foreground text-[0.78rem] mb-4 min-h-[3rem]">{p.desc}</p>

                      {/* Role pills */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {p.roles.map(r => (
                          <span key={r} className="px-2 py-0.5 bg-muted text-muted-foreground text-[0.62rem] rounded-full">{r}</span>
                        ))}
                      </div>

                      <div className={`flex items-center gap-2 text-[0.82rem] ${p.color} group-hover:gap-3 transition-all`}>
                        <span>Select this mode</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <p className="text-center text-muted-foreground text-[0.72rem]">
              <Settings2 className="w-3.5 h-3.5 inline mr-1" />
              You can change this anytime. All perspectives include Admin Dashboard access.
            </p>
          </motion.div>
        )}

        {/* ============ STEP 2: Role Selection ============ */}
        {step === 'roles' && selectedMode && (
          <motion.div
            key="roles"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-5xl"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-[2rem] text-foreground">Namma Naina Kadai</h1>
              </div>

              {/* Active mode indicator */}
              {activePerspective && (
                <div className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-white rounded-full border border-border shadow-sm">
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${activePerspective.gradient} flex items-center justify-center`}>
                    <activePerspective.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[0.82rem] text-foreground">{activePerspective.title}</span>
                  <span className="text-[0.72rem] text-muted-foreground">· {activePerspective.subtitle}</span>
                  <button
                    onClick={changeMode}
                    className="ml-2 text-[0.72rem] text-primary hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Role cards */}
            <div className={`grid gap-4 ${
              activeRoles.length <= 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' :
              activeRoles.length === 3 ? 'grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {activeRoles.map((role, idx) => (
                <motion.button
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(role.path)}
                  className="group bg-white rounded-2xl p-7 shadow-sm border border-border hover:shadow-xl hover:border-primary/30 transition-all text-left cursor-pointer relative overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />
                  <div className="relative">
                    <div className={`w-13 h-13 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <role.icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-foreground mb-0.5">{role.title}</h2>
                    <p className="text-primary text-[0.82rem] mb-2">{role.subtitle}</p>
                    <p className="text-muted-foreground text-[0.78rem] mb-4">{role.description}</p>
                    <div className="flex items-center gap-2 text-muted-foreground text-[0.72rem]">
                      <role.icon className="w-3.5 h-3.5" />
                      <span>{role.device}</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Mode description footer */}
            <div className="text-center mt-6">
              <p className="text-muted-foreground text-[0.72rem]">
                <LayoutDashboard className="w-3.5 h-3.5 inline mr-1" />
                All perspectives include full Admin Dashboard with live operations monitoring
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
