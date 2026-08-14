import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Card, Form, Button, Spinner, Badge, Table, Alert, Row, Col } from 'react-bootstrap';
import { FiSearch, FiPackage, FiMapPin, FiPhone, FiUser, FiCalendar, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const statusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export default function OrderTracking() {
  const { user } = useAuth();
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (user?.uid) {
      loadRecentOrders();
    }
  }, [user]);

  const loadRecentOrders = async () => {
    if (!user?.uid) return;
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const orders = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        .slice(0, 5);
      setRecentOrders(orders);
    } catch (error) {
      console.error('Recent orders error:', error);
    }
  };

  const trackOrder = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    const orderId = trackingId.trim().startsWith('ORD') ? trackingId.trim() : 'ORD' + trackingId.trim();

    setLoading(true);
    try {
      let orderDoc = null;

      if (user?.uid) {
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        orderDoc = snap.docs.find(d => d.data().orderId === orderId);
      }

      if (!orderDoc) {
        toast.error('Order not found. Please check your order ID or login with the correct account.');
        setOrder(null);
        return;
      }

      const orderData = { id: orderDoc.id, ...orderDoc.data() };
      setOrder(orderData);
      toast.success('Order found!');
    } catch (error) {
      console.error('Tracking error:', error);
      toast.error('Failed to track order: ' + (error.message || 'Unknown error'));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => {
    return statusSteps.indexOf(status);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="py-4">
      <h2 className="fw-bold mb-4">
        <FiSearch className="me-2 text-primary" />
        Track Your Order
      </h2>

      {/* Tracking Form */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <Form onSubmit={trackOrder}>
            <Row className="g-3">
              <Col md={8}>
                <Form.Control
                  type="text"
                  placeholder="Enter Order ID (e.g., ORD1234567890)"
                  value={trackingId}
                  onChange={e => setTrackingId(e.target.value)}
                  disabled={loading}
                  style={{ fontSize: '1rem' }}
                />
                <Form.Text className="text-muted">
                  Enter your order ID to track your order status
                </Form.Text>
              </Col>
              <Col md={4}>
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2"
                  disabled={loading || !trackingId.trim()}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Tracking...
                    </>
                  ) : (
                    <>
                      <FiSearch className="me-2" />
                      Track Order
                    </>
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Tracking Result */}
      {order && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h4 className="fw-bold mb-1">Order #{order.orderId}</h4>
                <small className="text-muted">
                  <FiCalendar className="me-1" />
                  Placed on {formatDate(order.createdAt)}
                </small>
              </div>
              <Badge bg={order.status === 'Delivered' ? 'success' : order.status === 'Cancelled' ? 'danger' : 'primary'} className="px-3 py-2">
                {order.status}
              </Badge>
            </div>

            {/* Progress Tracker */}
            {order.status !== 'Cancelled' && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  {statusSteps.map((step, index) => (
                    <div key={step} className="text-center" style={{ flex: 1 }}>
                      <div 
                        className="d-flex align-items-center justify-content-center mx-auto mb-2"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: index <= getStatusIndex(order.status) 
                            ? 'linear-gradient(135deg, #880e4f, #c2185b)' 
                            : '#e9ecef',
                          color: index <= getStatusIndex(order.status) ? 'white' : '#6c757d',
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        }}
                      >
                        {index + 1}
                      </div>
                      <small className={index <= getStatusIndex(order.status) ? 'fw-bold text-dark' : 'text-muted'}>
                        {step}
                      </small>
                    </div>
                  ))}
                </div>
                <div className="position-relative" style={{ height: '4px', background: '#e9ecef', borderRadius: '2px', marginTop: '-20px', marginBottom: '20px' }}>
                  <div 
                    className="position-absolute top-0 start-0 h-100 rounded"
                    style={{
                      width: `${((getStatusIndex(order.status) + 1) / statusSteps.length) * 100}%`,
                      background: 'linear-gradient(135deg, #880e4f, #c2185b)',
                      transition: 'width 0.5s ease'
                    }}
                  />
                </div>
              </div>
            )}

            <Row>
              <Col md={6}>
                <Card className="border-0 bg-light mb-3">
                  <Card.Body>
                    <h6 className="fw-bold mb-2">📍 Shipping Address</h6>
                    <p className="mb-1">{order.customer?.name}</p>
                    <p className="mb-1">{order.customer?.address}</p>
                    <p className="mb-1">{order.customer?.city}, {order.customer?.state} - {order.customer?.pincode}</p>
                    <p className="mb-0">
                      <FiPhone className="me-1" />
                      {order.customer?.phone}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 bg-light mb-3">
                  <Card.Body>
                    <h6 className="fw-bold mb-2">📦 Order Summary</h6>
                    <p className="mb-1"><strong>Items:</strong> {order.items?.length || 0}</p>
                    <p className="mb-1"><strong>Subtotal:</strong> ₹{order.subtotal?.toLocaleString('en-IN')}</p>
                    <p className="mb-1"><strong>Shipping:</strong> {order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</p>
                    {order.discount > 0 && (
                      <p className="mb-1 text-success"><strong>Discount:</strong> -₹{order.discount?.toLocaleString('en-IN')}</p>
                    )}
                    <p className="mb-0 fw-bold text-danger">Total: ₹{order.total?.toLocaleString('en-IN')}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Items */}
            <h6 className="fw-bold mt-3 mb-2">Order Items</h6>
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img 
                          src={item.image || item.images?.[0] || 'https://via.placeholder.com/40x40?text=No+Image'} 
                          alt={item.name}
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          className="rounded"
                        />
                        <div>
                          <div className="fw-semibold">{item.name}</div>
                          {item.size && <small className="text-muted">Size: {item.size}</small>}
                          {item.color && <small className="text-muted"> | Color: {item.color.name}</small>}
                        </div>
                      </div>
                    </td>
                    <td>{item.qty}</td>
                    <td>₹{item.price?.toLocaleString('en-IN')}</td>
                    <td className="fw-semibold">₹{(item.price * item.qty)?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {order.coupon && (
              <Alert variant="success" className="mt-3 mb-0">
                <strong>Coupon Applied:</strong> {order.coupon.code} | 
                <strong> Discount:</strong> -₹{order.coupon.discountAmount?.toLocaleString('en-IN')}
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Recent Orders */}
      {user && recentOrders.length > 0 && (
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-bottom">
            <h5 className="mb-0 fw-bold">Your Recent Orders</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.orderId}</strong></td>
                    <td>
                      <small>{formatDate(order.createdAt)}</small>
                    </td>
                    <td>
                      <Badge bg="light" text="dark">{order.items?.length || 0} item(s)</Badge>
                    </td>
                    <td><strong>₹{order.total?.toLocaleString('en-IN')}</strong></td>
                    <td>
                      <Badge bg={order.status === 'Delivered' ? 'success' : order.status === 'Cancelled' ? 'danger' : 'primary'}>
                        {order.status}
                      </Badge>
                    </td>
                    <td>
                      <Link to={`/order/${order.id}`}>
                        <Button size="sm" variant="outline-primary">
                          <FiEye className="me-1" /> View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
