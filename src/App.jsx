import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import OrderTracking from './pages/OrderTracking';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminLayout from './components/admin/AdminLayout';
import UserLayout from './components/UserLayout';
import { useAuth } from './context/AuthContext';
import { Spinner } from 'react-bootstrap';
import Footer from './components/Footer';

function AdminRoute({ children }) {
  const { userData, loading } = useAuth();
  if (loading) return <div className="text-center mt-5"><Spinner /></div>;
  if (!userData?.isAdmin) return <Navigate to="/" />;
  return children;
}

function UserRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-5"><Spinner /></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isUserRoute = ['/dashboard', '/orders', '/order', '/track-order', '/wishlist', '/cart', '/checkout', '/profile'].some(path => location.pathname.startsWith(path));

  return (
    <div className="d-flex flex-column min-vh-100">
      {!isUserRoute && !isAdminRoute && <Navbar />}
      <div className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<UserRoute><UserLayout /></UserRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="order/:orderId" element={<OrderDetails />} />
            <Route path="track-order" element={<OrderTracking />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="coupons" element={<AdminCoupons />} />
          </Route>
        </Routes>
      </div>
      {!isAdminRoute && !isUserRoute && <Footer />}
    </div>
  );
}