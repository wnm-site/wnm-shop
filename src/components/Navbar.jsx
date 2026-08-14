import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiLogOut, FiPackage, FiShield, FiMenu, FiX, FiSettings, FiSearch, FiHome } from 'react-icons/fi';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { Badge, Dropdown } from 'react-bootstrap'; // ← Import Dropdown

export default function Navbar() {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    const cartUnsub = onSnapshot(doc(db, 'carts', user.uid), (snap) => {
      const items = snap.data()?.items || [];
      setCartCount(items.reduce((s, i) => s + i.qty, 0));
    }, () => setCartCount(0));

    const wishlistUnsub = onSnapshot(doc(db, 'wishlists', user.uid), (snap) => {
      const ids = snap.data()?.ids || [];
      setWishlistCount(ids.length);
    }, () => setWishlistCount(0));

    return () => {
      cartUnsub();
      wishlistUnsub();
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
    setMobileMenuOpen(false);
  };

  const userName = user?.email?.split('@')[0] || 'User';
  const displayName = userData?.name || userName;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/" style={{ color: '#880e4f', fontSize: '1.5rem' }}>
          Wear NXT
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link px-3" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3" to="/products">Collection</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3" to="/#about">About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3" to="/#contact">Contact</Link>
            </li>

            {userData?.isAdmin && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle px-3"
                  href="#"
                  id="adminDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ color: '#d4af37', fontWeight: '600' }}
                >
                  <FiShield className="me-1" /> Admin
                </a>
                <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                  <li><Link className="dropdown-item" to="/admin">Dashboard</Link></li>
                  <li><Link className="dropdown-item" to="/admin/products">Products</Link></li>
                  <li><Link className="dropdown-item" to="/admin/orders">Orders</Link></li>
                   <li><Link className="dropdown-item" to="/admin/users">Users</Link></li>
                   <li><Link className="dropdown-item" to="/admin/reviews">Reviews</Link></li>
                   <li><Link className="dropdown-item" to="/admin/coupons">Coupons</Link></li>
                </ul>
              </li>
            )}
          </ul>

          <ul className="navbar-nav align-items-center">
            {user ? (
              <>
                <li className="nav-item me-3">
                  <Link className="nav-link position-relative" to="/wishlist">
                    <FiHeart size={22} />
                    {wishlistCount > 0 && (
                      <Badge
                        bg="danger"
                        className="position-absolute top-0 start-100 translate-middle rounded-pill"
                        style={{ fontSize: '0.65rem', minWidth: '18px', height: '18px' }}
                      >
                        {wishlistCount}
                      </Badge>
                    )}
                  </Link>
                </li>

                <li className="nav-item me-3">
                  <Link className="nav-link position-relative" to="/cart">
                    <FiShoppingCart size={22} />
                    {cartCount > 0 && (
                      <Badge
                        bg="danger"
                        className="position-absolute top-0 start-100 translate-middle rounded-pill"
                        style={{ fontSize: '0.65rem', minWidth: '18px', height: '18px' }}
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </Link>
                </li>

                {/* User Dropdown using React-Bootstrap */}
                <li className="nav-item">
                  <Dropdown align="end">
                    <Dropdown.Toggle 
                      variant="link" 
                      id="user-dropdown"
                      className="nav-link d-flex align-items-center text-dark"
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{ width: '36px', height: '36px', fontSize: '15px' }}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="d-none d-lg-inline">{displayName}</span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="shadow-lg" style={{ minWidth: '250px' }}>
                      <div className="px-3 py-2 border-bottom">
                        <div className="d-flex align-items-center">
                          <div
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{ width: '40px', height: '40px', fontSize: '18px' }}
                          >
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold">{displayName}</div>
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </div>
                      </div>
                      
                       <Dropdown.Item as={Link} to="/dashboard">
                         <FiHome className="me-2" /> Dashboard
                       </Dropdown.Item>
                       <Dropdown.Item as={Link} to="/profile">
                         <FiUser className="me-2" /> My Profile
                       </Dropdown.Item>
                       <Dropdown.Item as={Link} to="/orders">
                         <FiPackage className="me-2" /> My Orders
                       </Dropdown.Item>
                       <Dropdown.Item as={Link} to="/track-order">
                         <FiSearch className="me-2" /> Track Order
                       </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/wishlist">
                        <FiHeart className="me-2" /> Wishlist
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/cart">
                        <FiShoppingCart className="me-2" /> Shopping Cart
                      </Dropdown.Item>
                      
                      {userData?.isAdmin && (
                        <>
                          <Dropdown.Divider />
                          <Dropdown.Item as={Link} to="/admin" className="text-warning">
                            <FiShield className="me-2" /> Admin Panel
                          </Dropdown.Item>
                        </>
                      )}
                      
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleLogout} className="text-danger">
                        <FiLogOut className="me-2" /> Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item me-2">
                  <Link className="btn btn-outline-dark btn-sm px-3" to="/login">
                    <FiUser className="me-1" /> Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="btn btn-sm px-3 text-white"
                    to="/register"
                    style={{ backgroundColor: '#c2185b', borderColor: '#c2185b' }}
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="d-lg-none border-top mt-2 pt-2">
          <div className="container">
            <ul className="navbar-nav flex-column">
              <li className="nav-item"><Link className="nav-link" to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/products" onClick={() => setMobileMenuOpen(false)}>Collection</Link></li>
              {user && (
                <>
                  <li className="nav-item"><Link className="nav-link" to="/dashboard" onClick={() => setMobileMenuOpen(false)}>🏠 Dashboard</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/profile" onClick={() => setMobileMenuOpen(false)}>👤 My Profile</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/orders" onClick={() => setMobileMenuOpen(false)}>📦 My Orders</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/track-order" onClick={() => setMobileMenuOpen(false)}>🔍 Track Order</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/wishlist" onClick={() => setMobileMenuOpen(false)}>❤️ Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/cart" onClick={() => setMobileMenuOpen(false)}>🛒 Cart {cartCount > 0 && `(${cartCount})`}</Link></li>
                  {userData?.isAdmin && (
                    <li className="nav-item"><Link className="nav-link text-warning" to="/admin" onClick={() => setMobileMenuOpen(false)}>🛡️ Admin Panel</Link></li>
                  )}
                  <li className="nav-item"><button className="btn btn-link nav-link text-danger" onClick={handleLogout}>🚪 Logout</button></li>
                </>
              )}
              {!user && (
                <>
                  <li className="nav-item"><Link className="nav-link" to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/register" onClick={() => setMobileMenuOpen(false)}>Register</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}