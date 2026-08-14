import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Table, Badge, Spinner, Button, Card, Modal, Alert } from 'react-bootstrap';
import { FiPackage, FiEye, FiXCircle, FiMapPin, FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const ordersList = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(ordersList);
      setLoading(false);
    }, (error) => {
      console.error('Orders error:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const statusColor = {
    'Pending': 'warning',
    'Processing': 'info',
    'Shipped': 'primary',
    'Delivered': 'success',
    'Cancelled': 'danger'
  };

  const statusIcon = {
    'Pending': '⏳',
    'Processing': '🔄',
    'Shipped': '🚚',
    'Delivered': '✅',
    'Cancelled': '❌'
  };

  // Cancel order (only if Pending)
  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    if (orderToCancel.status !== 'Pending') {
      toast.error('Only pending orders can be cancelled');
      return;
    }

    setCancelling(true);
    try {
      await updateDoc(doc(db, 'orders', orderToCancel.id), {
        status: 'Cancelled',
        cancelledAt: new Date(),
        cancelledBy: 'user'
      });
      toast.success('Order cancelled successfully!');
      setShowCancelModal(false);
      setOrderToCancel(null);
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const openCancelModal = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4 fw-bold">
        <FiPackage className="me-2" /> My Orders
      </h2>

      {orders.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm">
          <Card.Body>
            <FiPackage size={60} className="text-muted mb-3" />
            <h4>No Orders Yet</h4>
            <p className="text-muted">Start shopping to see your orders here</p>
            <Link to="/" className="btn btn-primary">
              Start Shopping
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Orders Table */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Destination</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.orderId}</strong>
                      </td>
                      <td>
                        <small>
                          <FiCalendar className="me-1" />
                          {order.createdAt?.seconds 
                            ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })
                            : 'N/A'}
                        </small>
                      </td>
                      <td>
                        <Badge bg="light" text="dark">
                          {order.items?.length || 0} item(s)
                        </Badge>
                      </td>
                      <td>
                        <strong className="text-danger">
                          ₹{order.total?.toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td>
                        <Badge bg={statusColor[order.status] || 'secondary'} className="px-3 py-2">
                          {statusIcon[order.status]} {order.status}
                        </Badge>
                      </td>
                      <td>
                        <small>
                          <FiMapPin className="me-1 text-danger" />
                          {order.customer?.city || 'N/A'}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link to={`/order/${order.id}`}>
                            <Button size="sm" variant="outline-primary">
                              <FiEye className="me-1" /> View
                            </Button>
                          </Link>
                          {order.status === 'Pending' && (
                            <Button 
                              size="sm" 
                              variant="outline-danger"
                              onClick={() => openCancelModal(order)}
                            >
                              <FiXCircle className="me-1" /> Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Order Summary Cards */}
          <div className="row mt-4 g-3">
            <div className="col-md-3 col-6">
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <h3 className="text-primary mb-0">{orders.length}</h3>
                  <small className="text-muted">Total Orders</small>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-3 col-6">
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <h3 className="text-warning mb-0">
                    {orders.filter(o => o.status === 'Pending').length}
                  </h3>
                  <small className="text-muted">Pending</small>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-3 col-6">
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <h3 className="text-success mb-0">
                    {orders.filter(o => o.status === 'Delivered').length}
                  </h3>
                  <small className="text-muted">Delivered</small>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-3 col-6">
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <h3 className="text-danger mb-0">
                    {orders.filter(o => o.status === 'Cancelled').length}
                  </h3>
                  <small className="text-muted">Cancelled</small>
                </Card.Body>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Cancel Order Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <FiXCircle className="me-2" /> Cancel Order
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {orderToCancel && (
            <>
              <Alert variant="warning">
                <strong>Order #{orderToCancel.orderId}</strong>
                <br />
                Total: ₹{orderToCancel.total?.toLocaleString('en-IN')}
              </Alert>
              <p>Are you sure you want to cancel this order?</p>
              <p className="text-muted small">
                This action cannot be undone. The order will be marked as cancelled.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)} disabled={cancelling}>
            Keep Order
          </Button>
          <Button variant="danger" onClick={handleCancelOrder} disabled={cancelling}>
            {cancelling ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Cancelling...
              </>
            ) : (
              <>
                <FiXCircle className="me-2" />
                Yes, Cancel Order
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}