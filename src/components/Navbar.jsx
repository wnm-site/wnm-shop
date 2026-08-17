import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiLogOut, FiPackage, FiShield, FiMenu, FiX, FiSearch, FiHome } from 'react-icons/fi';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { Badge, Dropdown } from 'react-bootstrap'; // ← Import Dropdown

export default function Navbar() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
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
    } catch {
      toast.error('Logout failed');
    }
    setMobileMenuOpen(false);
  };

  const userName = user?.email?.split('@')[0] || 'User';
  const displayName = userData?.name || userName;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
      <div className="container">
        <Link 
          className="navbar-brand" 
          to="/" 
          style={{ lineHeight: 0, padding: 0 }}
        >
          <img
            src="https://i.ibb.co/4Z2GCxV9/logo-full-removebg-preview.png"
            alt="Wear NXT"
            style={{ height: '42px', maxHeight: '42px', width: 'auto', maxWidth: '100%', display: 'block' }}
          />
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link px-3" to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3" to="/products" onClick={() => setMobileMenuOpen(false)}>Collection</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3" to="/#about" onClick={() => setMobileMenuOpen(false)}>About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3" to="/#contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
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
                  <li><Link className="dropdown-item" to="/admin" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link></li>
                  <li><Link className="dropdown-item" to="/admin/products" onClick={() => setMobileMenuOpen(false)}>Products</Link></li>
                  <li><Link className="dropdown-item" to="/admin/orders" onClick={() => setMobileMenuOpen(false)}>Orders</Link></li>
                  <li><Link className="dropdown-item" to="/admin/users" onClick={() => setMobileMenuOpen(false)}>Users</Link></li>
                  <li><Link className="dropdown-item" to="/admin/reviews" onClick={() => setMobileMenuOpen(false)}>Reviews</Link></li>
                  <li><Link className="dropdown-item" to="/admin/coupons" onClick={() => setMobileMenuOpen(false)}>Coupons</Link></li>
                </ul>
              </li>
            )}
          </ul>

          <ul className="navbar-nav align-items-center">
            {user ? (
              <>
                <li className="nav-item me-3 d-none d-lg-block">
                  <Link className="nav-link position-relative" to="/wishlist" onClick={() => setMobileMenuOpen(false)}>
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

                <li className="nav-item me-3 d-none d-lg-block">
                  <Link className="nav-link position-relative" to="/cart" onClick={() => setMobileMenuOpen(false)}>
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

                {/* Desktop User Dropdown */}
                <li className="nav-item d-none d-lg-block">
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
                      <span>{displayName}</span>
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
                      
                      <Dropdown.Item as={Link} to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <FiHome className="me-2" /> Dashboard
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <FiUser className="me-2" /> My Profile
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/orders" onClick={() => setMobileMenuOpen(false)}>
                        <FiPackage className="me-2" /> My Orders
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/track-order" onClick={() => setMobileMenuOpen(false)}>
                        <FiSearch className="me-2" /> Track Order
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/wishlist" onClick={() => setMobileMenuOpen(false)}>
                        <FiHeart className="me-2" /> Wishlist
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/cart" onClick={() => setMobileMenuOpen(false)}>
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

                {/* Mobile User Menu */}
                <li className="nav-item d-lg-none mt-2 border-top pt-2">
                  <div className="px-3 mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '36px', height: '36px', fontSize: '15px' }}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold small">{displayName}</div>
                        <small className="text-muted">{user.email}</small>
                      </div>
                    </div>
                  </div>
                  <Link className="nav-link d-flex align-items-center gap-2 px-3 py-2" to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <FiHome /> Dashboard
                  </Link>
                  <Link className="nav-link d-flex align-items-center gap-2 px-3 py-2" to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <FiUser /> My Profile
                  </Link>
                  <Link className="nav-link d-flex align-items-center gap-2 px-3 py-2" to="/orders" onClick={() => setMobileMenuOpen(false)}>
                    <FiPackage /> My Orders
                  </Link>
                  <Link className="nav-link d-flex align-items-center gap-2 px-3 py-2" to="/track-order" onClick={() => setMobileMenuOpen(false)}>
                    <FiSearch /> Track Order
                  </Link>
                  <Link className="nav-link d-flex align-items-center gap-2 px-3 py-2" to="/wishlist" onClick={() => setMobileMenuOpen(false)}>
                    <FiHeart /> Wishlist {wishlistCount > 0 && <Badge bg="danger" className="ms-1">{wishlistCount}</Badge>}
                  </Link>
                  <Link className="nav-link d-flex align-items-center gap-2 px-3 py-2" to="/cart" onClick={() => setMobileMenuOpen(false)}>
                    <FiShoppingCart /> Cart {cartCount > 0 && <Badge bg="danger" className="ms-1">{cartCount}</Badge>}
                  </Link>
                  {userData?.isAdmin && (
                    <Link className="nav-link d-flex align-items-center gap-2 px-3 py-2 text-warning" to="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <FiShield /> Admin Panel
                    </Link>
                  )}
                  <button className="nav-link text-danger d-flex align-items-center gap-2 px-3 py-2 border-0 bg-transparent" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item d-none d-lg-block me-2">
                  <Link className="btn btn-outline-dark btn-sm px-3" to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <FiUser className="me-1" /> Login
                  </Link>
                </li>
                <li className="nav-item d-none d-lg-block">
                  <Link
                    className="btn btn-sm px-3 text-white"
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ backgroundColor: '#c2185b', borderColor: '#c2185b' }}
                  >
                    Register
                  </Link>
                </li>

                {/* Mobile Login/Register */}
                <li className="nav-item d-lg-none mt-2 border-top pt-2">
                  <Link className="nav-link d-flex align-items-center gap-2 px-3 py-2" to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <FiUser /> Login
                  </Link>
                  <Link className="nav-link d-flex align-items-center gap-2 px-3 py-2" to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <FiUser /> Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}