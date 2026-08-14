import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Card, Row, Col, Table, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaRupeeSign, FaShoppingBag, FaClipboardList } from 'react-icons/fa';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, userData } = useAuth();
  const displayName = userData?.name || user?.email?.split('@')[0] || 'User';
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalWishlist: 0,
    totalCart: 0,
    totalSpent: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!user?.uid) return;
      try {
        const [ordersSnap, wishlistSnap, cartSnap] = await Promise.all([
          getDocs(query(collection(db, 'orders'), where('userId', '==', user.uid))),
          getDoc(doc(db, 'wishlists', user.uid)),
          getDoc(doc(db, 'carts', user.uid))
        ]);
        
        if (!isMounted) return;
        
        const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const wishlistIds = wishlistSnap.data()?.ids || [];
        const cartItems = cartSnap.data()?.items || [];
        const totalSpent = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (o.total || 0), 0);

        setStats({
          totalOrders: orders.length,
          totalWishlist: wishlistIds.length,
          totalCart: cartItems.reduce((s, i) => s + (i.qty || 0), 0),
          totalSpent
        });

        const recent = orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 5);
        setRecentOrders(recent);
      } catch (error) {
        if (isMounted) {
          console.error('Dashboard error:', error);
          toast.error('Failed to load dashboard');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [user]);

  const statusColor = {
    'Pending': 'warning',
    'Processing': 'info',
    'Shipped': 'primary',
    'Delivered': 'success',
    'Cancelled': 'danger'
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Welcome Banner */}
      <Card className="border-0 shadow-sm mb-4 text-white" style={{ background: 'linear-gradient(135deg, #880e4f, #c2185b)' }}>
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h4 className="fw-bold mb-1">Welcome back, {displayName}! 👋</h4>
              <p className="mb-0 opacity-75">Here's what's happening with your account today.</p>
            </div>
            <Link to="/products">
              <Button variant="light" size="sm" className="fw-semibold">Continue Shopping →</Button>
            </Link>
          </div>
        </Card.Body>
      </Card>

      {/* Stats Cards */}
      <Row className="g-3 g-md-4 mb-4">
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100 stat-card">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                  <FaBoxOpen size={24} />
                </div>
                <div>
                  <h3 className="fw-bold mb-0">{stats.totalOrders}</h3>
                  <p className="text-muted mb-0 small">Total Orders</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100 stat-card">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                  <FaRupeeSign size={24} />
                </div>
                <div>
                  <h3 className="fw-bold mb-0">₹{stats.totalSpent.toLocaleString('en-IN')}</h3>
                  <p className="text-muted mb-0 small">Total Spent</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100 stat-card">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                  <FiHeart size={24} />
                </div>
                <div>
                  <h3 className="fw-bold mb-0">{stats.totalWishlist}</h3>
                  <p className="text-muted mb-0 small">Wishlist Items</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100 stat-card">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                  <FiShoppingCart size={24} />
                </div>
                <div>
                  <h3 className="fw-bold mb-0">{stats.totalCart}</h3>
                  <p className="text-muted mb-0 small">Cart Items</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="g-3 g-md-4 mb-4">
        <Col xs={6} md={3}>
          <Link to="/products" className="text-decoration-none">
            <Card className="border-0 shadow-sm h-100 quick-action-card">
              <Card.Body className="text-center p-4">
                <div className="mb-2"><FaShoppingBag className="text-primary" size={28} /></div>
                <h6 className="fw-bold mb-0">Browse Products</h6>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col xs={6} md={3}>
          <Link to="/wishlist" className="text-decoration-none">
            <Card className="border-0 shadow-sm h-100 quick-action-card">
              <Card.Body className="text-center p-4">
                <div className="mb-2"><FiHeart className="text-danger" size={28} /></div>
                <h6 className="fw-bold mb-0">My Wishlist</h6>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col xs={6} md={3}>
          <Link to="/cart" className="text-decoration-none">
            <Card className="border-0 shadow-sm h-100 quick-action-card">
              <Card.Body className="text-center p-4">
                <div className="mb-2"><FiShoppingCart className="text-success" size={28} /></div>
                <h6 className="fw-bold mb-0">Shopping Cart</h6>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col xs={6} md={3}>
          <Link to="/orders" className="text-decoration-none">
            <Card className="border-0 shadow-sm h-100 quick-action-card">
              <Card.Body className="text-center p-4">
                <div className="mb-2"><FaClipboardList className="text-warning" size={28} /></div>
                <h6 className="fw-bold mb-0">Track Orders</h6>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Recent Orders</h5>
          <Link to="/orders">
            <Button variant="outline-primary" size="sm">View All</Button>
          </Link>
        </Card.Header>
        <Card.Body className="p-0">
          {recentOrders.length === 0 ? (
            <div className="text-center py-5">
              <FaClipboardList size={48} className="text-muted mb-3" />
              <h5 className="fw-bold mb-2">No orders yet</h5>
              <p className="text-muted mb-3">Looks like you haven't placed any orders yet.</p>
              <Link to="/products">
                <Button variant="primary">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
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
                      <td><strong>{order.orderId || order.id.slice(-6)}</strong></td>
                      <td>
                        <small className="text-muted">{formatDate(order.createdAt)}</small>
                      </td>
                      <td>
                        <small>{order.items?.length || 0} item(s)</small>
                      </td>
                      <td><strong>₹{order.total?.toLocaleString('en-IN') || 0}</strong></td>
                      <td>
                        <Badge bg={statusColor[order.status] || 'secondary'} className="px-3 py-2">
                          {order.status || 'Processing'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <style>{`
        .stat-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }
        .quick-action-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .quick-action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
          border-color: #880e4f !important;
        }
        .quick-action-card:hover h6 {
          color: #880e4f;
        }
      `}</style>
    </div>
  );
}
