import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PackagesProvider } from './contexts/PackagesContext';
import { AuthProvider } from './contexts/AuthContext';
import useAuth from './hooks/useAuth';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PackageDetail from './pages/PackageDetail';
import Checkout from './pages/Checkout';
import Confitmation from './pages/Confirmation';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import Dashboard from './pages/Dashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import BrowseMenu from './pages/BrowseMenu';

function DashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'customer') return <Navigate to="/user" replace />;
  if (user.role === 'restaurant') return <Navigate to="/restaurant" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PackagesProvider>
          <div className="min-h-screen bg-bukain-sand">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/package/:id" element={<PackageDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/browse" element={<BrowseMenu />} />

              <Route
                path="/user/*"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/restaurant/*"
                element={
                  <ProtectedRoute allowedRoles={['restaurant']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Footer />
          </div>
        </PackagesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
