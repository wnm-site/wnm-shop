import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Card, Row, Col, Badge, Spinner, Button, ListGroup, Form, Modal, Alert } from 'react-bootstrap';
import { FiArrowLeft, FiPackage, FiMapPin, FiPhone, FiUser, FiEdit, FiCheck, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getProductImageSrc } from '../utils/imageHelper';

export default function OrderDetails() {
  const { orderId } = useParams();
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'orders', orderId));
        if (!isMounted) return;
        if (snap.exists()) {
          const data = snap.data();
          if (data.userId === user.uid || userData?.isAdmin) {
            setOrder({ id: snap.id, ...data });
            setNewStatus(data.status);
          } else {
            toast.error('Unauthorized access');
            navigate('/orders');
          }
        } else {
          toast.error('Order not found');
          navigate('/orders');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Load error:', error);
          toast.error('Failed to load order');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [orderId, user, userData?.isAdmin, navigate]);

  const updateOrderStatus = async () => {
    if (!order || newStatus === order.status) {
      toast.error('Please select a different status');
      return;
    }

    if (!userData?.isAdmin) {
      toast.error('Only administrators can update order status');
      return;
    }

    setUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: newStatus,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: 'admin'
      });
      
      toast.success(`Order status updated to "${newStatus}" ✅`);
      setOrder({ ...order, status: newStatus });
      setShowStatusModal(false);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading order details...</p>
      </div>
    );
  }

  if (!order) return null;

  const statusColor = {
    'Pending': 'warning',
    'Processing': 'info',
    'Shipped': 'primary',
    'Delivered': 'success',
    'Cancelled': 'danger'
  };

  const statusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = statusSteps.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <div className="container py-4">
      <Button 
        variant="link" 
        onClick={() => navigate(-1)} 
        className="mb-3 p-0 text-decoration-none"
      >
        <FiArrowLeft className="me-2" /> Back
      </Button>

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0">
          <FiPackage className="me-2" /> Order #{order.orderId}
        </h2>
        {userData?.isAdmin && (
          <Button 
            variant="primary" 
            onClick={() => setShowStatusModal(true)}
          >
            <FiEdit className="me-2" /> Change Status
          </Button>
        )}
      </div>

      {/* Order Status Tracker */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-4">Order Status</h5>
          
          {isCancelled ? (
            <Alert variant="danger" className="mb-0">
              <h6 className="alert-heading">
                <FiXCircle className="me-2" /> Order Cancelled
              </h6>
              <p className="mb-0">This order has been cancelled.</p>
              {order.cancelledAt?.seconds && (
                <small>
                  Cancelled on: {new Date(order.cancelledAt.seconds * 1000).toLocaleString('en-IN')}
                </small>
              )}
            </Alert>
          ) : (
            <>
              {/* Progress Steps */}
              <div className="d-flex justify-content-between align-items-center mb-4 position-relative">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={step} className="text-center flex-fill position-relative">
                      <div
                        className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 ${
                          isCompleted ? 'bg-success text-white' : 'bg-light text-muted border'
                        } ${isCurrent ? 'shadow' : ''}`}
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          fontSize: '20px',
                          transition: 'all 0.3s'
                        }}
                      >
                        {isCompleted && index < currentStepIndex ? '✓' : index + 1}
                      </div>
                      <div className={`small ${isCompleted ? 'fw-bold text-success' : 'text-muted'}`}>
                        {step}
                      </div>
                    </div>
                  );
                })}
                
                {/* Progress Line */}
                <div 
                  className="position-absolute top-0 start-0 h-100 d-flex align-items-center"
                  style={{ width: '100%', zIndex: -1, paddingLeft: '25px', paddingRight: '25px' }}
                >
                  <div 
                    className="bg-light w-100" 
                    style={{ height: '3px' }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <Badge bg={statusColor[order.status]} className="px-4 py-2 fs-6">
                  {order.status}
                </Badge>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      <Row>
        {/* Order Items */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FiPackage className="me-2" /> Order Items
              </h5>
            </Card.Header>
            <ListGroup variant="flush">
              {order.items?.map((item, idx) => (
                <ListGroup.Item key={idx} className="d-flex align-items-center py-3">
                  <img
                    src={getProductImageSrc(item)}
                    alt={item.name}
                    className="rounded me-3"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                    }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.name}</h6>
                    <p className="text-muted small mb-1">Size: {item.size}</p>
                    <p className="text-muted small mb-0">Quantity: {item.qty}</p>
                  </div>
                  <div className="text-end">
                    <h6 className="mb-0 text-danger">
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </h6>
                    <small className="text-muted">
                      ₹{item.price.toLocaleString('en-IN')} each
                    </small>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Card.Footer className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Total Amount:</h5>
                <h4 className="mb-0 text-danger">
                  ₹{order.total?.toLocaleString('en-IN')}
                </h4>
              </div>
            </Card.Footer>
          </Card>

          {/* Payment Info */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Payment Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p className="mb-2"><strong>Payment Method:</strong></p>
                  <p className="text-muted mb-0">{order.paymentMethod}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-2"><strong>Payment Status:</strong></p>
                  <Badge bg={order.status === 'Delivered' ? 'success' : 'warning'}>
                    {order.status === 'Delivered' ? 'Paid' : 'Cash on Delivery'}
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Shipping Info */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FiMapPin className="me-2" /> Shipping Address
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-2">
                <FiUser className="me-2 text-primary" /> 
                <strong>{order.customer?.name}</strong>
              </p>
              <p className="mb-2">
                <FiPhone className="me-2 text-primary" /> 
                {order.customer?.phone}
              </p>
              <hr />
              <p className="mb-0">
                {order.customer?.address}
                <br />
                {order.customer?.city}, {order.customer?.state}
                <br />
                <strong>Pincode:</strong> {order.customer?.pincode}
              </p>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Order ID:</span>
                <strong>#{order.orderId}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Order Date:</span>
                <strong>
                  {order.createdAt?.seconds 
                    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN')
                    : 'N/A'}
                </strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Items:</span>
                <strong>{order.items?.length || 0}</strong>
              </div>
              {order.statusUpdatedAt?.seconds && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Last Updated:</span>
                  <strong>
                    {new Date(order.statusUpdatedAt.seconds * 1000).toLocaleDateString('en-IN')}
                  </strong>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between">
                <h5 className="mb-0">Total:</h5>
                <h5 className="mb-0 text-danger">
                  ₹{order.total?.toLocaleString('en-IN')}
                </h5>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Status Change Modal (Admin Only) */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiEdit className="me-2" /> Change Order Status
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <strong>Order #{order.orderId}</strong>
            <br />
            Customer: {order.customer?.name}
            <br />
            Total: ₹{order.total?.toLocaleString('en-IN')}
          </Alert>

          <Form.Group>
            <Form.Label className="fw-bold">Select New Status</Form.Label>
            <Form.Select 
              value={newStatus} 
              onChange={e => setNewStatus(e.target.value)}
              size="lg"
            >
              <option value="Pending">⏳ Pending</option>
              <option value="Processing">🔄 Processing</option>
              <option value="Shipped">🚚 Shipped</option>
              <option value="Delivered">✅ Delivered</option>
              <option value="Cancelled">❌ Cancelled</option>
            </Form.Select>
          </Form.Group>

          <div className="mt-3">
            <small className="text-muted">
              Current Status: <Badge bg={statusColor[order.status]}>{order.status}</Badge>
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)} disabled={updating}>
            Cancel
          </Button>
          <Button variant="primary" onClick={updateOrderStatus} disabled={updating}>
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              <>
                <FiCheck className="me-2" />
                Update Status
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}