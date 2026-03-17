import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ShieldX, ArrowLeft, LogOut } from 'lucide-react';
import { getCurrentUser, getRoleHome, getRoleLabel, logoutUser } from '../../data';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-amber-50 flex items-center justify-center p-6 font-['Inter',sans-serif]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm"
      >
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldX className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-[1.3rem] text-foreground mb-2">Access Restricted</h1>
        <p className="text-muted-foreground text-[0.85rem] mb-1">
          You don't have permission to view this page.
        </p>
        {user && (
          <p className="text-[0.75rem] text-muted-foreground mb-6">
            Signed in as <span className="text-foreground">{user.name}</span> ({getRoleLabel(user.role)})
          </p>
        )}
        <div className="flex gap-3 justify-center">
          {user && (
            <button
              onClick={() => navigate(getRoleHome(user.role))}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-[0.82rem] cursor-pointer hover:brightness-110 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Go to My Dashboard
            </button>
          )}
          <button
            onClick={() => { logoutUser(); navigate('/login', { replace: true }); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-muted text-foreground rounded-xl text-[0.82rem] cursor-pointer hover:bg-border transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
