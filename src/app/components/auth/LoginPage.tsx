import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap, ShieldCheck, ChefHat, UtensilsCrossed, CreditCard, Lock,
  Eye, EyeOff, ArrowRight, User, Delete, LogIn,
} from 'lucide-react';
import {
  mockUsers, loginUser, getCurrentUser, getRoleLabel, getRoleHome,
  type UserAccount, type UserRole,
} from '../../data';

const ROLE_CONFIG: Record<UserRole, { gradient: string; icon: typeof ChefHat; device: string; desc: string }> = {
  admin:   { gradient: 'from-blue-600 to-indigo-600', icon: ShieldCheck, device: 'Desktop, Tab & Mobile', desc: 'Full access to all operations, reports & settings' },
  kitchen: { gradient: 'from-amber-500 to-orange-600', icon: ChefHat, device: 'Primarily Tablet', desc: 'Kitchen orders & parcel queue management' },
  waiter:  { gradient: 'from-cyan-500 to-blue-500', icon: UtensilsCrossed, device: 'Primarily Mobile', desc: 'Table management, ordering & service' },
  cashier: { gradient: 'from-orange-500 to-red-500', icon: CreditCard, device: 'Primarily Tablet', desc: 'POS billing, payments & table canvas' },
};

export function LoginPage() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [step, setStep] = useState<'select' | 'pin'>('select');
  const [shake, setShake] = useState(false);
  const pinRef = useRef<HTMLInputElement>(null);

  // Auto-login if session exists
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate(getRoleHome(user.role), { replace: true });
    }
  }, [navigate]);

  const handlePinDigit = useCallback((digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError('');

    if (newPin.length === 4) {
      const user = loginUser(newPin);
      if (user) {
        navigate(getRoleHome(user.role));
      } else {
        setError('Invalid PIN. Try again.');
        setShake(true);
        setTimeout(() => { setShake(false); setPin(''); }, 600);
      }
    }
  }, [pin, navigate]);

  const handleBackspace = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  }, []);

  const handleUserSelect = (user: UserAccount) => {
    setSelectedUser(user);
    setPin('');
    setError('');
    setStep('pin');
    setTimeout(() => pinRef.current?.focus(), 100);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') handlePinDigit(e.key);
    else if (e.key === 'Backspace') handleBackspace();
  }, [handlePinDigit, handleBackspace]);

  // Group users by role
  const roleGroups: Record<UserRole, UserAccount[]> = { admin: [], kitchen: [], waiter: [], cashier: [] };
  mockUsers.forEach(u => roleGroups[u.role].push(u));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col items-center justify-center p-4 sm:p-6 font-['Inter',sans-serif]">
      <AnimatePresence mode="wait">
        {/* ===== STEP 1: Select User ===== */}
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <motion.div
                  className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              <h1 className="text-[1.8rem] text-foreground mb-1">Namma Naina Kadai</h1>
              <p className="text-muted-foreground text-[0.85rem]">Select your profile to sign in</p>
            </div>

            {/* Role-grouped user cards */}
            <div className="space-y-5">
              {(Object.entries(roleGroups) as [UserRole, UserAccount[]][]).filter(([, users]) => users.length > 0).map(([role, users]) => {
                const cfg = ROLE_CONFIG[role];
                const RoleIcon = cfg.icon;
                return (
                  <div key={role}>
                    {/* Role header */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}>
                        <RoleIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <span className="text-[0.82rem] text-foreground">{getRoleLabel(role)}</span>
                        <span className="text-[0.62rem] text-muted-foreground ml-2">{cfg.device}</span>
                      </div>
                    </div>
                    {/* User cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {users.map((user, idx) => (
                        <motion.button
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ y: -2, boxShadow: '0 8px 30px -10px rgba(255,107,53,0.15)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleUserSelect(user)}
                          className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3.5 text-left cursor-pointer hover:border-primary/30 transition-all group"
                        >
                          <div className="relative">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-12 h-12 rounded-xl object-cover border-2 border-border group-hover:border-primary/30 transition-colors"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-gradient-to-br ${cfg.gradient} flex items-center justify-center ring-2 ring-white`}>
                              <RoleIcon className="w-2.5 h-2.5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.85rem] text-foreground truncate">{user.name}</p>
                            <p className="text-[0.68rem] text-muted-foreground">{getRoleLabel(role)}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-6">
              <p className="text-muted-foreground text-[0.68rem]">
                <Lock className="w-3 h-3 inline mr-1" />
                Use your 4-digit PIN to sign in. Contact admin if you forgot it.
              </p>
            </div>
          </motion.div>
        )}

        {/* ===== STEP 2: Enter PIN ===== */}
        {step === 'pin' && selectedUser && (
          <motion.div
            key="pin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Back button */}
            <button
              onClick={() => { setStep('select'); setSelectedUser(null); setPin(''); setError(''); }}
              className="text-[0.78rem] text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to profiles
            </button>

            {/* User info */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="relative inline-block mb-4"
              >
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-20 h-20 rounded-2xl object-cover border-3 border-white shadow-xl"
                />
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-gradient-to-br ${ROLE_CONFIG[selectedUser.role].gradient} flex items-center justify-center ring-3 ring-white shadow-md`}>
                  {(() => { const I = ROLE_CONFIG[selectedUser.role].icon; return <I className="w-4 h-4 text-white" />; })()}
                </div>
              </motion.div>
              <h2 className="text-[1.2rem] text-foreground mb-0.5">{selectedUser.name}</h2>
              <p className={`text-[0.78rem] bg-gradient-to-r ${ROLE_CONFIG[selectedUser.role].gradient} bg-clip-text text-transparent`}>
                {getRoleLabel(selectedUser.role)}
              </p>
              <p className="text-[0.65rem] text-muted-foreground mt-1">{ROLE_CONFIG[selectedUser.role].desc}</p>
            </div>

            {/* PIN dots */}
            <div className="flex items-center justify-center mb-2">
              <motion.div
                animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="flex gap-3"
              >
                {[0, 1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    animate={pin.length > i ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.15 }}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      pin.length > i
                        ? 'bg-primary border-primary scale-110'
                        : error
                        ? 'border-red-300 bg-red-50'
                        : 'border-border bg-muted'
                    }`}
                  />
                ))}
              </motion.div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-red-500 text-[0.72rem] mb-3"
                >{error}</motion.p>
              )}
            </AnimatePresence>

            <p className="text-center text-muted-foreground text-[0.72rem] mb-5">Enter your 4-digit PIN</p>

            {/* Show/Hide PIN toggle */}
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setShowPin(!showPin)}
                className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPin ? 'Hide PIN' : 'Show PIN'}
              </button>
            </div>

            {showPin && pin.length > 0 && (
              <p className="text-center text-foreground text-[1.5rem] tracking-[0.5em] mb-4">{pin}</p>
            )}

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map(key => {
                if (key === '') return <div key="empty" />;
                if (key === 'del') {
                  return (
                    <motion.button
                      key="del"
                      whileTap={{ scale: 0.9 }}
                      onClick={handleBackspace}
                      className="h-14 rounded-2xl bg-muted hover:bg-border flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Delete className="w-5 h-5 text-muted-foreground" />
                    </motion.button>
                  );
                }
                return (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePinDigit(key)}
                    className="h-14 rounded-2xl bg-white border border-border hover:bg-muted hover:border-primary/20 text-foreground text-[1.1rem] flex items-center justify-center cursor-pointer transition-all active:bg-primary/5"
                  >
                    {key}
                  </motion.button>
                );
              })}
            </div>

            {/* Quick hint */}
            <div className="mt-6 bg-muted/50 rounded-xl p-3 border border-border">
              <p className="text-[0.62rem] text-muted-foreground text-center">
                <Lock className="w-3 h-3 inline mr-1" />
                Demo PINs: Admin <span className="text-foreground">1234</span> · Kitchen <span className="text-foreground">5678</span> · Waiter <span className="text-foreground">1111</span> / <span className="text-foreground">2222</span> · Cashier <span className="text-foreground">3456</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
