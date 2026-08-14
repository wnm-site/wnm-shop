import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiPackage, FiSearch, FiHeart, FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';
import { Nav, Button } from 'react-bootstrap';

const navItems = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard', exact: true },
  { to: '/orders', icon: FiPackage, label: 'My Orders' },
  { to: '/track-order', icon: FiSearch, label: 'Track Order' },
  { to: '/wishlist', icon: FiHeart, label: 'Wishlist' },
  { to: '/cart', icon: FiShoppingCart, label: 'Cart' },
  { to: '/profile', icon: FiUser, label: 'Profile' }
];

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/orders') return 'My Orders';
    if (path === '/track-order') return 'Track Order';
    if (path === '/wishlist') return 'Wishlist';
    if (path === '/cart') return 'Shopping Cart';
    if (path === '/profile') return 'My Profile';
    return 'My Account';
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const displayName = userData?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="d-flex vh-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1038 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`position-fixed top-0 start-0 h-100 bg-white border-end d-flex flex-column d-lg-flex ${sidebarOpen ? 'd-block' : 'd-none'}`}
        style={{ width: '260px', zIndex: 1039 }}
      >
        {/* Header */}
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center text-white fw-bold rounded"
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #880e4f, #c2185b)',
                fontSize: '18px'
              }}
            >
              W
            </div>
            <div>
              <h6 className="mb-0 fw-bold" style={{ color: '#880e4f' }}>Wear NXT</h6>
              <small className="text-muted">My Account</small>
            </div>
          </div>
          <button
            className="btn btn-link p-0 d-lg-none text-dark"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Navigation */}
        <Nav className="flex-column flex-grow-1 py-2 overflow-auto">
          <NavLink
            to="/"
            className="nav-link d-flex align-items-center gap-2 px-3 py-2 rounded mx-2 text-secondary"
            onClick={() => setSidebarOpen(false)}
          >
            <FiHome size={18} />
            <span>Back to Store</span>
          </NavLink>

          <div className="px-3 mt-3 mb-2">
            <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
              Account
            </small>
          </div>

          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded mx-2 ${isActive ? 'active fw-semibold' : 'text-secondary'}`}
              style={({ isActive }) => isActive ? { color: '#880e4f', background: 'rgba(136, 14, 79, 0.08)' } : {}}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </Nav>

        {/* Footer */}
        <div className="p-3 border-top">
          <div className="d-flex align-items-center gap-2 mb-3 px-2">
            <div
              className="d-flex align-items-center justify-content-center text-white rounded-circle flex-shrink-0"
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #d4af37, #f0d78c)',
                color: '#880e4f',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>{displayName}</div>
              <small className="text-muted text-truncate d-block" style={{ fontSize: '0.75rem' }}>{user?.email}</small>
            </div>
          </div>
          <button
            className="nav-link text-danger d-flex align-items-center gap-2 px-3 py-2 rounded mx-2 w-100 border-0 bg-transparent"
            onClick={handleLogout}
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className="flex-grow-1 d-flex flex-column min-vh-100"
        style={{ marginLeft: '260px' }}
      >
        {/* Top Header */}
        <header className="bg-white border-bottom px-3 px-md-4 py-3 d-flex justify-content-between align-items-center sticky-top" style={{ zIndex: 100 }}>
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-link p-0 d-lg-none text-dark"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu size={24} />
            </button>
            <div>
              <h5 className="mb-0 fw-bold" style={{ color: '#1a1a2e', fontSize: '1.25rem' }}>{getPageTitle()}</h5>
              <small className="text-muted">Welcome back, {displayName}</small>
            </div>
          </div>
          <div className="d-none d-sm-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center text-white rounded-circle flex-shrink-0"
              style={{
                width: '38px',
                height: '38px',
                background: 'linear-gradient(135deg, #d4af37, #f0d78c)',
                color: '#880e4f',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow-1 p-3 p-md-4">
          <Outlet />
        </main>
      </div>

      {/* Responsive margin fix */}
      <style>{`
        @media (max-width: 991.98px) {
          .admin-main, [style*="marginLeft: 260px"] {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
