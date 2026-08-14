import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Card, Row, Col, Table, Badge, Spinner, Button, ListGroup } from 'react-bootstrap';
import { FiPackage, FiShoppingCart, FiHeart, FiDollarSign, FiUser, FiMapPin, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, userData } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalWishlist: 0,
    totalCart: 0,
    totalSpent: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    processingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      const [ordersSnap, wishlistSnap, cartSnap] = await Promise.all([
        getDocs(query(collection(db, 'orders'), where('userId', '==', user.uid))),
        getDoc(doc(db, 'wishlists', user.uid)),
        getDoc(doc(db, 'carts', user.uid))
      ]);

      const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const wishlistIds = wishlistSnap.data()?.ids || [];
      const cartItems = cartSnap.data()?.items || [];

      const totalSpent = orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((s, o) => s + (o.total || 0), 0);

      const pendingOrders = orders.filter(o => o.status === 'Pending').length;
      const processingOrders = orders.filter(o => o.status === 'Processing').length;
      const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

      setStats({
        totalOrders: orders.length,
        totalWishlist: wishlistIds.length,
        totalCart: cartItems.reduce((s, i) => s + (i.qty || 0), 0),
        totalSpent,
        pendingOrders,
        deliveredOrders,
        processingOrders
      });

      const recent = orders
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        .slice(0, 5);
      setRecentOrders(recent);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const variants = {
      'Pending': 'warning',
      'Processing': 'info',
      'Shipped': 'primary',
      'Delivered': 'success',
      'Cancelled': 'danger'
    };
    return variants[status] || 'secondary';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-3 mb-md-4">
        <h2 className="fw-bold mb-1" style={{ fontSize: '1.25rem' }}>
          Welcome back, {userData?.name || 'User'}! 👋
        </h2>
        <p className="text-muted mb-0 small">Here's what's happening with your account today.</p>
      </div>

      {/* Stats Cards - Mobile: 2x2 grid, Tablet: 4 cols */}
      <Row className="g-2 g-md-3 mb-3 mb-md-4">
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100 stat-card">
            <Card.Body className="p-2 p-md-3 text-center">
              <div 
                className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-2"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'rgba(13, 110, 253, 0.1)',
                  color: '#0d6efd'
                }}
              >
                <FiPackage size={20} />
              </div>
              <h3 className="fw-bold mb-0" style={{ fontSize: '1.25rem' }}>{stats.totalOrders}</h3>
              <small className="text-muted d-block">Orders</small>
              {stats.pendingOrders > 0 && (
                <Badge bg="warning" className="mt-1" style={{ fontSize: '0.7rem' }}>{stats.pendingOrders} Pending</Badge>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100 stat-card">
            <Card.Body className="p-2 p-md-3 text-center">
              <div 
                className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-2"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'rgba(25, 135, 84, 0.1)',
                  color: '#198754'
                }}
              >
                <FiDollarSign size={20} />
              </div>
              <h3 className="fw-bold mb-0" style={{ fontSize: '1.1rem' }}>₹{stats.totalSpent.toLocaleString('en-IN')}</h3>
              <small className="text-muted d-block">Spent</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100 stat-card">
            <Card.Body className="p-2 p-md-3 text-center">
              <div 
                className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-2"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'rgba(220, 53, 69, 0.1)',
                  color: '#dc3545'
                }}
              >
                <FiHeart size={20} />
              </div>
              <h3 className="fw-bold mb-0" style={{ fontSize: '1.25rem' }}>{stats.totalWishlist}</h3>
              <small className="text-muted d-block">Wishlist</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100 stat-card">
            <Card.Body className="p-2 p-md-3 text-center">
              <div 
                className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-2"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'rgba(13, 202, 240, 0.1)',
                  color: '#0dcaf0'
                }}
              >
                <FiShoppingCart size={20} />
              </div>
              <h3 className="fw-bold mb-0" style={{ fontSize: '1.25rem' }}>{stats.totalCart}</h3>
              <small className="text-muted d-block">Cart</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content: Recent Orders + Profile Sidebar */}
      <Row className="g-2 g-md-3">
        {/* Recent Orders */}
        <Col lg={8} className="mb-3 mb-lg-0">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-2 py-md-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold" style={{ fontSize: '1rem' }}>Recent Orders</h5>
                <Link to="/orders">
                  <Button variant="outline-primary" size="sm" style={{ fontSize: '0.8rem' }}>View All</Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {recentOrders.length === 0 ? (
                <div className="text-center py-4">
                  <FiPackage size={40} className="text-muted mb-2" />
                  <p className="text-muted mb-2 small">No orders yet</p>
                  <Link to="/">
                    <Button variant="primary" size="sm">Start Shopping</Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Mobile: Card list */}
                  <div className="d-block d-lg-none">
                    {recentOrders.map(order => (
                      <div key={order.id} className="p-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <strong className="d-block">#{order.orderId || order.id.slice(-6)}</strong>
                            <small className="text-muted">
                              <FiCalendar className="me-1" />
                              {formatDate(order.createdAt)}
                            </small>
                          </div>
                          <Badge bg={getStatusBadge(order.status)} style={{ fontSize: '0.7rem' }}>
                            {order.status || 'Processing'}
                          </Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <Badge bg="light" text="dark" style={{ fontSize: '0.75rem' }}>
                              {order.items?.length || 0} item(s)
                            </Badge>
                          </div>
                          <strong className="text-danger" style={{ fontSize: '0.9rem' }}>
                            ₹{order.total?.toLocaleString('en-IN') || 0}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop: Table */}
                  <div className="d-none d-lg-block">
                    <Table hover className="mb-0 align-middle" style={{ fontSize: '0.9rem' }}>
                      <thead className="table-light">
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map(order => (
                          <tr key={order.id}>
                            <td><strong>#{order.orderId || order.id.slice(-6)}</strong></td>
                            <td>
                              <small>{formatDate(order.createdAt)}</small>
                            </td>
                            <td>
                              <Badge bg="light" text="dark">{order.items?.length || 0} item(s)</Badge>
                            </td>
                            <td><strong>₹{order.total?.toLocaleString('en-IN') || 0}</strong></td>
                            <td>
                              <Badge bg={getStatusBadge(order.status)}>
                                {order.status || 'Processing'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Sidebar - Profile & Quick Actions */}
        <Col lg={4}>
          {/* Profile Card */}
          <Card className="border-0 shadow-sm mb-3">
            <Card.Body className="text-center p-3 p-md-4">
              <div 
                className="profile-avatar rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ 
                  width: '70px', 
                  height: '70px', 
                  fontSize: '1.75rem',
                  background: 'linear-gradient(135deg, #880e4f, #c2185b)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {userData?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h5 className="fw-bold mb-1" style={{ fontSize: '1.1rem' }}>{userData?.name || 'User'}</h5>
              <p className="text-muted small mb-2">{user?.email}</p>
              {userData?.phone && (
                <p className="text-muted small mb-2">
                  <FiMapPin className="me-1" /> {userData.phone}
                </p>
              )}
              <Link to="/profile">
                <Button variant="outline-primary" size="sm" className="mt-2">
                  <FiUser className="me-1" /> Edit Profile
                </Button>
              </Link>
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-2 py-md-3">
              <h6 className="mb-0 fw-bold" style={{ fontSize: '0.95rem' }}>Quick Actions</h6>
            </Card.Header>
            <Card.Body className="p-2 p-md-3">
              <div className="d-grid gap-2">
                <Link to="/orders">
                  <Button variant="outline-dark" className="w-100 d-flex align-items-center justify-content-center gap-2 py-2" style={{ fontSize: '0.85rem' }}>
                    <FiPackage size={16} /> My Orders
                  </Button>
                </Link>
                <Link to="/track-order">
                  <Button variant="outline-primary" className="w-100 d-flex align-items-center justify-content-center gap-2 py-2" style={{ fontSize: '0.85rem' }}>
                    <FiTrendingUp size={16} /> Track Order
                  </Button>
                </Link>
                <Link to="/wishlist">
                  <Button variant="outline-danger" className="w-100 d-flex align-items-center justify-content-center gap-2 py-2" style={{ fontSize: '0.85rem' }}>
                    <FiHeart size={16} /> Wishlist
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button variant="outline-success" className="w-100 d-flex align-items-center justify-content-center gap-2 py-2" style={{ fontSize: '0.85rem' }}>
                    <FiShoppingCart size={16} /> Cart
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
