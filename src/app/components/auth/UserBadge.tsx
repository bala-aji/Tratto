import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, User, ChevronDown, Globe, Map, ChevronRight, Check } from 'lucide-react';
import {
  getCurrentUser, logoutUser, getRoleLabel,
  getLanguage, setLanguage, SUPPORTED_LANGUAGES, tables,
  type AppLanguage,
} from '../../data';
import { TableCanvas } from '../cashier/TableCanvas';

export function UserBadge({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const [lang, setLang] = useState<AppLanguage>(getLanguage);
  const user = getCurrentUser();
  if (!user) return null;

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  const handleLangChange = (code: AppLanguage) => {
    setLanguage(code);
    setLang(code);
    setShowLangPicker(false);
    setOpen(false);
    // Reload to apply language across the app
    window.location.reload();
  };

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === lang);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => { setOpen(!open); setShowLangPicker(false); }}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors cursor-pointer ${compact ? 'w-full justify-center py-3' : ''}`}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-7 h-7 rounded-lg object-cover border border-border"
          />
          {!compact && (
            <>
              <div className="text-left hidden sm:block">
                <p className="text-[0.72rem] text-foreground truncate max-w-[100px]">{user.name}</p>
                <p className="text-[0.58rem] text-muted-foreground">{getRoleLabel(user.role)}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
            </>
          )}
        </button>

        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setShowLangPicker(false); }} />
              <motion.div
                initial={{ opacity: 0, y: compact ? 5 : -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: compact ? 5 : -5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`absolute ${compact ? 'left-0 bottom-full mb-1' : 'right-0 top-full mt-1'} bg-white rounded-xl border border-border shadow-xl z-50 w-56 overflow-hidden`}
              >
                {/* User info header */}
                <div className="p-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-lg object-cover border border-border" />
                    <div>
                      <p className="text-[0.78rem] text-foreground">{user.name}</p>
                      <p className="text-[0.62rem] text-primary">{getRoleLabel(user.role)}</p>
                    </div>
                  </div>
                </div>

                {/* Language option */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowLangPicker(!showLangPicker); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[0.78rem] text-foreground hover:bg-muted cursor-pointer transition-colors"
                  >
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-left">Language</span>
                    <span className="text-[0.65rem] text-muted-foreground mr-0.5">
                      {currentLang?.flag} {currentLang?.nativeLabel}
                    </span>
                    <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${showLangPicker ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Language sub-picker */}
                  <AnimatePresence>
                    {showLangPicker && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden border-t border-border/50 bg-muted/30"
                      >
                        {SUPPORTED_LANGUAGES.map(l => (
                          <button
                            key={l.code}
                            onClick={(e) => { e.stopPropagation(); handleLangChange(l.code); }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2 text-[0.72rem] cursor-pointer transition-colors ${
                              lang === l.code ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-muted'
                            }`}
                          >
                            <span className="text-[0.85rem]">{l.flag}</span>
                            <span className="flex-1 text-left">{l.label}</span>
                            <span className="text-[0.62rem] text-muted-foreground">{l.nativeLabel}</span>
                            {lang === l.code && <Check className="w-3.5 h-3.5 text-primary" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Floor Plan option */}
                <button
                  onClick={() => { setOpen(false); setShowLangPicker(false); setShowFloorPlan(true); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[0.78rem] text-foreground hover:bg-muted cursor-pointer transition-colors"
                >
                  <Map className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 text-left">Floor Plan</span>
                  <span className="text-[0.58rem] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">View</span>
                </button>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Sign out */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[0.78rem] text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Floor Plan Modal */}
      <AnimatePresence>
        {showFloorPlan && (
          <TableCanvas
            tables={tables.map(t => ({ id: t.id, seats: t.seats, status: t.status }))}
            selectedTable={null}
            onSelectTable={() => {}}
            onClose={() => setShowFloorPlan(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
