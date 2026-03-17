import { createBrowserRouter } from 'react-router';
import { LoginPage } from './components/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UnauthorizedPage } from './components/auth/UnauthorizedPage';

export const router = createBrowserRouter([
  { path: '/login', Component: LoginPage },
  { path: '/unauthorized', Component: UnauthorizedPage },
  {
    path: '/',
    Component: ProtectedRoute,
    HydrateFallback: () => null,
    children: [
      {
        path: 'cashier',
        lazy: () => import('./components/cashier/CashierPOS').then(m => ({ Component: m.CashierPOS })),
      },
      {
        path: 'admin',
        lazy: () => import('./components/admin/AdminDashboard').then(m => ({ Component: m.AdminDashboard })),
      },
      {
        path: 'supplier',
        lazy: () => import('./components/supplier/SupplierPortal').then(m => ({ Component: m.SupplierPortal })),
      },
      {
        path: 'kitchen',
        lazy: () => import('./components/kitchen/KitchenView').then(m => ({ Component: m.KitchenView })),
      },
      {
        path: 'waiter',
        lazy: () => import('./components/waiter/WaiterView').then(m => ({ Component: m.WaiterView })),
      },
      {
        path: 'parcel',
        lazy: () => import('./components/parcel/ParcelView').then(m => ({ Component: m.ParcelView })),
      },
      {
        path: 'kitchen-manager',
        lazy: () => import('./components/kitchen-manager/KitchenManagerView').then(m => ({ Component: m.KitchenManagerView })),
      },
    ],
  },
  { path: '*', Component: LoginPage },
]);