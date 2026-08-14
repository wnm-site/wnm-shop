import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Card, Form, Button, Spinner, Badge, Table, Alert, Row, Col } from 'react-bootstrap';
import { FiSearch, FiPhone, FiCalendar, FiEye, FiMapPin, FiPackage } from 'react-icons/fi';
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
    let isMounted = true;
    (async () => {
      if (user?.uid) {
        try {
          const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
          const snap = await getDocs(q);
          if (isMounted) {
            const orders = snap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
              .slice(0, 5);
            setRecentOrders(orders);
          }
        } catch (error) {
          if (isMounted) console.error('Recent orders error:', error);
        }
      }
    })();
    return () => { isMounted = false; };
  }, [user]);

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
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid), where('orderId', '==', orderId));
        const snap = await getDocs(q);
        orderDoc = snap.docs[0] || null;
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

  const getStatusBadge = (status) => {
    if (status === 'Delivered') return 'success';
    if (status === 'Cancelled') return 'danger';
    if (status === 'Shipped') return 'primary';
    if (status === 'Processing') return 'info';
    return 'warning';
  };

  return (
    <div className="py-3 py-md-4">
      {/* Header */}
      <div className="mb-3 mb-md-4">
        <h2 className="fw-bold mb-1" style={{ fontSize: '1.25rem', color: '#880e4f' }}>
          Track Your Order
        </h2>
        <p className="text-muted mb-0 small">Enter your order ID to see real-time updates</p>
      </div>

      {/* Tracking Form */}
      <Card className="border-0 shadow-sm mb-3 mb-md-4">
        <Card.Body className="p-3 p-md-4">
          <Form onSubmit={trackOrder}>
            <Row className="g-2 g-md-3">
              <Col md={8}>
                <div className="position-relative">
                  <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" style={{ fontSize: '0.9rem', zIndex: 2 }} />
                  <Form.Control
                    type="text"
                    placeholder="Enter Order ID (e.g., ORD1234567890)"
                    value={trackingId}
                    onChange={e => setTrackingId(e.target.value)}
                    disabled={loading}
                    className="ps-5"
                    style={{ borderRadius: '8px', border: '1px solid #e8d5ce', fontSize: '0.9rem' }}
                  />
                </div>
                <Form.Text className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
                  Enter your order ID to track your order status
                </Form.Text>
              </Col>
              <Col md={4}>
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2"
                  disabled={loading || !trackingId.trim()}
                  style={{ 
                    background: 'linear-gradient(135deg, #c2185b, #880e4f)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
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
        <Card className="border-0 shadow-sm mb-3 mb-md-4">
          <Card.Body className="p-3 p-md-4">
            {/* Order Header */}
            <div className="d-flex justify-content-between align-items-start mb-3 mb-md-4 flex-wrap gap-2">
              <div>
                <h4 className="fw-bold mb-1" style={{ fontSize: '1.1rem', color: '#880e4f' }}>
                  #{order.orderId}
                </h4>
                <small className="text-muted">
                  <FiCalendar className="me-1" />
                  Placed on {formatDate(order.createdAt)}
                </small>
              </div>
              <Badge bg={getStatusBadge(order.status)} className="px-3 py-2" style={{ fontSize: '0.8rem' }}>
                {order.status}
              </Badge>
            </div>

            {/* Progress Tracker */}
            {order.status !== 'Cancelled' && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2 position-relative">
                  {statusSteps.map((step, index) => {
                    const currentIndex = getStatusIndex(order.status);
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    
                    return (
                      <div key={step} className="text-center" style={{ flex: 1, zIndex: 1 }}>
                        <div
                          className="d-flex align-items-center justify-content-center mx-auto mb-2 rounded-circle"
                          style={{
                            width: isCurrent ? '48px' : '40px',
                            height: isCurrent ? '48px' : '40px',
                            background: isCompleted 
                              ? 'linear-gradient(135deg, #880e4f, #c2185b)' 
                              : '#e9ecef',
                            color: isCompleted ? 'white' : '#6c757d',
                            fontWeight: 'bold',
                            fontSize: isCurrent ? '1.1rem' : '1rem',
                            transition: 'all 0.3s ease',
                            boxShadow: isCurrent ? '0 4px 12px rgba(136, 14, 79, 0.3)' : 'none'
                          }}
                        >
                          {isCompleted && index < currentIndex ? '✓' : index + 1}
                        </div>
                        <small 
                          className="d-block fw-semibold"
                          style={{ 
                            fontSize: '0.75rem',
                            color: isCompleted ? '#880e4f' : '#6c757d'
                          }}
                        >
                          {step}
                        </small>
                      </div>
                    );
                  })}
                  
                  {/* Progress Line */}
                  <div 
                    className="position-absolute top-0 start-0 h-100 d-none d-sm-flex align-items-center"
                    style={{ width: '100%', zIndex: 0, paddingLeft: '20px', paddingRight: '20px', marginTop: '18px' }}
                  >
                    <div 
                      className="w-100" 
                      style={{ height: '3px', background: '#e9ecef', borderRadius: '2px' }}
                    >
                      <div 
                        className="h-100 rounded"
                        style={{
                          width: `${((getStatusIndex(order.status) + 1) / statusSteps.length) * 100}%`,
                          background: 'linear-gradient(90deg, #880e4f, #c2185b)',
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {order.status === 'Cancelled' && (
              <Alert variant="danger" className="mb-3">
                <h6 className="alert-heading fw-bold">Order Cancelled</h6>
                <p className="mb-0 small">This order has been cancelled and will not be processed.</p>
              </Alert>
            )}

            {/* Order Details Grid */}
            <Row className="g-2 g-md-3">
              <Col md={6}>
                <Card className="border-0 bg-light h-100" style={{ background: '#faf6f3' }}>
                  <Card.Body className="p-3">
                    <h6 className="fw-bold mb-2" style={{ color: '#880e4f' }}>
                      <FiMapPin className="me-2" />
                      Shipping Address
                    </h6>
                    <p className="mb-1 fw-semibold small">{order.customer?.name}</p>
                    <p className="mb-1 text-muted small">{order.customer?.address}</p>
                    <p className="mb-1 text-muted small">
                      {order.customer?.city}, {order.customer?.state} - {order.customer?.pincode}
                    </p>
                    <p className="mb-0 text-muted small">
                      <FiPhone className="me-1" /> {order.customer?.phone}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 bg-light h-100" style={{ background: '#faf6f3' }}>
                  <Card.Body className="p-3">
                    <h6 className="fw-bold mb-2" style={{ color: '#880e4f' }}>
                      <FiPackage className="me-2" />
                      Order Summary
                    </h6>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted small">Items:</span>
                      <span className="fw-semibold small">{order.items?.length || 0}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted small">Subtotal:</span>
                      <span className="fw-semibold small">₹{order.subtotal?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted small">Shipping:</span>
                      <span className="fw-semibold small">{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted small">Discount:</span>
                        <span className="fw-semibold small text-success">-₹{order.discount?.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <hr style={{ borderColor: '#e8d5ce' }} />
                    <div className="d-flex justify-content-between">
                      <span className="fw-bold small">Total:</span>
                      <span className="fw-bold" style={{ color: '#dc3545' }}>
                        ₹{order.total?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Items */}
            <div className="mt-3 mt-md-4">
              <h6 className="fw-bold mb-2" style={{ fontSize: '0.95rem' }}>Order Items</h6>
              <div className="d-block d-lg-none">
                {order.items?.map((item, idx) => (
                  <Card key={idx} className="border-0 shadow-sm mb-2" style={{ background: '#faf6f3' }}>
                    <Card.Body className="p-3">
                      <div className="d-flex gap-3">
                        <img 
                          src={item.image || item.images?.[0] || 'https://via.placeholder.com/60x60?text=No+Image'} 
                          alt={item.name}
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          className="rounded flex-shrink-0"
                        />
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="fw-semibold small mb-1 text-truncate">{item.name}</div>
                          {item.size && <small className="text-muted d-block">Size: {item.size}</small>}
                          {item.color && <small className="text-muted d-block">Color: {item.color.name}</small>}
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <span className="text-muted small">Qty: {item.qty}</span>
                            <div className="text-end">
                              <div className="fw-bold small" style={{ color: '#880e4f' }}>
                                ₹{(item.price * item.qty)?.toLocaleString('en-IN')}
                              </div>
                              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                ₹{item.price?.toLocaleString('en-IN')} each
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
              <div className="d-none d-lg-block">
                <Table responsive hover className="mb-0 align-middle" style={{ fontSize: '0.9rem' }}>
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
                              <div className="fw-semibold small">{item.name}</div>
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
              </div>
            </div>

            {order.coupon && (
              <Alert variant="success" className="mt-3 mb-0" style={{ fontSize: '0.9rem' }}>
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
          <Card.Header className="bg-white border-bottom py-2 py-md-3">
            <h5 className="mb-0 fw-bold" style={{ fontSize: '1rem' }}>Your Recent Orders</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="d-block d-lg-none">
              {recentOrders.map(order => (
                <div key={order.id} className="p-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong className="d-block small">#{order.orderId}</strong>
                      <small className="text-muted">
                        <FiCalendar className="me-1" />
                        {formatDate(order.createdAt)}
                      </small>
                    </div>
                    <Badge bg={getStatusBadge(order.status)} style={{ fontSize: '0.7rem' }}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <Badge bg="light" text="dark" style={{ fontSize: '0.75rem' }}>
                      {order.items?.length || 0} item(s)
                    </Badge>
                    <div className="text-end">
                      <strong className="small" style={{ color: '#880e4f' }}>
                        ₹{order.total?.toLocaleString('en-IN')}
                      </strong>
                      <div>
                        <Link to={`/order/${order.id}`}>
                          <Button size="sm" variant="outline-primary" className="mt-1" style={{ fontSize: '0.75rem' }}>
                            <FiEye className="me-1" /> View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="d-none d-lg-block">
              <Table responsive hover className="mb-0 align-middle" style={{ fontSize: '0.9rem' }}>
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
                        <Badge bg={getStatusBadge(order.status)}>
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
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
