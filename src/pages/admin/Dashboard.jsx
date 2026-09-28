import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, Row, Col, Button, Table, Badge, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiBox, FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiPlus } from 'react-icons/fi';
import { FaBoxOpen, FaUserFriends, FaClipboardList, FaRupeeSign } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [productsSnap, usersSnap, ordersSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'orders'))
      ]);

      const revenue = ordersSnap.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
      
      const orders = ordersSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        .slice(0, 5);

      setStats({
        products: productsSnap.docs.filter(d => !d.id.includes('siteSettings')).length,
        users: usersSnap.size,
        orders: ordersSnap.size,
        revenue
      });
      setRecentOrders(orders);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    'Pending': 'warning',
    'Processing': 'info',
    'Shipped': 'primary',
    'Delivered': 'success',
    'Cancelled': 'danger'
  };

  const [popupSettings, setPopupSettings] = useState({ enabled: false, imageUrl: '', linkUrl: '' });
  const [savingPopup, setSavingPopup] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'products', 'siteSettings_homePopup'));
        if (snap.exists()) setPopupSettings(snap.data());
      } catch (error) {
        console.error('Popup settings load error:', error);
      }
    })();
  }, []);

  const handleSavePopup = async (e) => {
    e.preventDefault();
    setSavingPopup(true);
    try {
      await setDoc(doc(db, 'products', 'siteSettings_homePopup'), {
        enabled: Boolean(popupSettings.enabled),
        imageUrl: String(popupSettings.imageUrl || ''),
        linkUrl: String(popupSettings.linkUrl || '')
      });
      toast.success('Popup settings updated');
    } catch (error) {
      console.error('Popup save error:', error);
      toast.error('Failed to update popup');
    } finally {
      setSavingPopup(false);
    }
  };


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
              <h2 className="fw-bold mb-1">{stats.products}</h2>
              <p className="text-muted mb-0">Total Products</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <FaUserFriends size={40} className="text-success" />
              </div>
              <h2 className="fw-bold mb-1">{stats.users}</h2>
              <p className="text-muted mb-0">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <FiShoppingBag size={40} className="text-warning" />
              </div>
              <h2 className="fw-bold mb-1">{stats.orders}</h2>
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
              <h2 className="fw-bold mb-1">₹{stats.revenue.toLocaleString('en-IN')}</h2>
              <p className="text-muted mb-0">Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Home Popup Settings */}
      <Card className="border-0 shadow-sm mb-5">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0 fw-bold">Home Popup Settings</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSavePopup}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Check
                  type="switch"
                  id="popupEnabled"
                  label="Enable popup for visitors"
                  checked={popupSettings.enabled}
                  onChange={(e) => setPopupSettings({ ...popupSettings, enabled: e.target.checked })}
                />
              </Col>
              <Col md={12}>
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  type="text"
                  value={popupSettings.imageUrl}
                  onChange={(e) => setPopupSettings({ ...popupSettings, imageUrl: e.target.value })}
                  placeholder="https://i.ibb.co/..."
                />
              </Col>
              <Col md={12}>
                <Form.Label>Link URL</Form.Label>
                <Form.Control
                  type="text"
                  value={popupSettings.linkUrl}
                  onChange={(e) => setPopupSettings({ ...popupSettings, linkUrl: e.target.value })}
                  placeholder="https://..."
                />
              </Col>
              <Col md={12}>
                <Button type="submit" disabled={savingPopup}>
                  {savingPopup ? 'Saving...' : 'Save Popup Settings'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Recent Orders */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Recent Orders</h5>
          <Link to="/admin/orders">
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
                  <th>Customer</th>
                  <th>Destination</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td><strong>{order.orderId}</strong></td>
                    <td>
                      <div>{order.customer?.name}</div>
                      <small className="text-muted">{order.customer?.phone}</small>
                    </td>
                    <td>
                      <small>
                        {order.customer?.city}, {order.customer?.state}
                      </small>
                    </td>
                    <td><strong>₹{order.total?.toLocaleString('en-IN')}</strong></td>
                    <td>
                      <Badge bg={statusColor[order.status] || 'secondary'}>
                        {order.status}
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

