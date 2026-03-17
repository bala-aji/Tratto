import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router';
import { getCurrentUser, getRoleAllowedPaths, getRoleHome, type UserAccount } from '../../data';

export function ProtectedRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    // If at root, redirect to role home
    if (location.pathname === '/') {
      navigate(getRoleHome(currentUser.role), { replace: true });
      return;
    }

    const allowed = getRoleAllowedPaths(currentUser.role);
    const isAllowed = allowed.some(p => location.pathname.startsWith(p));
    if (!isAllowed) {
      navigate('/unauthorized', { replace: true });
      return;
    }

    setUser(currentUser);
    setChecked(true);
  }, [navigate, location.pathname]);

  if (!checked || !user) return null;
  return <Outlet />;
}
