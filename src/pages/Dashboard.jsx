import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Card, Row, Col, Table, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaRupeeSign } from 'react-icons/fa';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
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
    <div>
      {/* Stats Cards */}
      <Row className="g-4 mb-5">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <FaBoxOpen size={40} className="text-primary" />
              </div>
              <h2 className="fw-bold mb-1">{stats.totalOrders}</h2>
              <p className="text-muted mb-0">Total Orders</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <FaRupeeSign size={40} className="text-danger" />
              </div>
              <h2 className="fw-bold mb-1">₹{stats.totalSpent.toLocaleString('en-IN')}</h2>
              <p className="text-muted mb-0">Total Spent</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <FiHeart size={40} className="text-danger" />
              </div>
              <h2 className="fw-bold mb-1">{stats.totalWishlist}</h2>
              <p className="text-muted mb-0">Wishlist Items</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <FiShoppingCart size={40} className="text-success" />
              </div>
              <h2 className="fw-bold mb-1">{stats.totalCart}</h2>
              <p className="text-muted mb-0">Cart Items</p>
            </Card.Body>
          </Card>
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
        <Card.Body>
          {recentOrders.length === 0 ? (
            <p className="text-center text-muted py-4">No orders yet</p>
          ) : (
            <Table responsive hover className="mb-0">
              <thead>
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
                      <Badge bg={statusColor[order.status] || 'secondary'}>
                        {order.status || 'Processing'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
