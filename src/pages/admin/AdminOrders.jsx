import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Table, Button, Modal, Form, Badge, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FiEye, FiMapPin, FiPhone, FiUser, FiPackage, FiEdit, FiCheck, FiTrash2 } from 'react-icons/fi';
import { FaClipboardList } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'orders'), (snap) => {
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
  }, []);

  const updateStatus = async () => {
    if (!selected || status === selected.status) {
      toast.error('Please select a different status');
      return;
    }

    setUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', selected.id), { 
        status,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: 'admin'
      });
      toast.success(`Order status updated to "${status}" ✅`);
      setSelected(null);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelete = (order) => {
    setDeleteTarget(order);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'orders', deleteTarget.id));
      toast.success(`Order #${deleteTarget.orderId} deleted permanently`);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };

  const statusColor = {
    'Pending': 'warning',
    'Processing': 'info',
    'Shipped': 'primary',
    'Out for Delivery': 'primary',
    'Delivered': 'success',
    'Completed': 'success',
    'Refund Done': 'info',
    'Return Order': 'warning',
    'Cancelled': 'danger'
  };

  // Filter orders
  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    processing: orders.filter(o => o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    outForDelivery: orders.filter(o => o.status === 'Out for Delivery').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    completed: orders.filter(o => o.status === 'Completed').length,
    refundDone: orders.filter(o => o.status === 'Refund Done').length,
    returnOrder: orders.filter(o => o.status === 'Return Order').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
    revenue: orders
      .filter(o => o.status !== 'Cancelled' && o.status !== 'Return Order' && o.status !== 'Refund Done')
      .reduce((sum, o) => sum + (o.total || 0), 0)
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
    <div>
      <h2 className="fw-bold mb-4">
        <FaClipboardList className="me-2 text-primary" />
        All Orders
      </h2>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-3">
              <h4 className="mb-0 text-primary">{stats.total}</h4>
              <small className="text-muted">Total</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-3">
              <h4 className="mb-0 text-warning">{stats.pending}</h4>
              <small className="text-muted">Pending</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-3">
              <h4 className="mb-0 text-info">{stats.processing}</h4>
              <small className="text-muted">Processing</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-3">
              <h4 className="mb-0 text-primary">{stats.shipped}</h4>
              <small className="text-muted">Shipped</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-3">
              <h4 className="mb-0 text-success">{stats.delivered}</h4>
              <small className="text-muted">Delivered</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-3">
              <h4 className="mb-0 text-success">{stats.completed}</h4>
              <small className="text-muted">Completed</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-3">
              <h4 className="mb-0 text-primary">{stats.outForDelivery}</h4>
              <small className="text-muted">Out for Delivery</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-3">
              <h4 className="mb-0 text-info">{stats.refundDone}</h4>
              <small className="text-muted">Refund Done</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-3">
              <h4 className="mb-0 text-warning">{stats.returnOrder}</h4>
              <small className="text-muted">Return Order</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="py-3">
              <h4 className="mb-0 text-danger">₹{(stats.revenue/1000).toFixed(1)}K</h4>
              <small className="text-muted">Revenue</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex gap-2 flex-wrap">
            <Button 
              variant={filterStatus === 'All' ? 'primary' : 'outline-primary'}
              onClick={() => setFilterStatus('All')}
              size="sm"
            >
              All ({orders.length})
            </Button>
             {['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Completed', 'Refund Done', 'Return Order', 'Cancelled'].map(s => (
              <Button
                key={s}
                variant={filterStatus === s ? statusColor[s] : `outline-${statusColor[s]}`}
                onClick={() => setFilterStatus(s)}
                size="sm"
              >
                {s} ({orders.filter(o => o.status === s).length})
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm">
          <Card.Body>
            <FiPackage size={60} className="text-muted mb-3" />
            <h4>No Orders Found</h4>
            <p className="text-muted">
              {filterStatus === 'All' 
                ? 'Orders will appear here once customers place them'
                : `No orders with status "${filterStatus}"`}
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Destination</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.orderId}</strong></td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FiUser className="me-2 text-muted" />
                        <div>
                          <div>{order.customer?.name}</div>
                          <small className="text-muted">
                            <FiPhone className="me-1" />
                            {order.customer?.phone}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <small>
                        <FiMapPin className="me-1 text-danger" />
                        {order.customer?.city}, {order.customer?.state}
                        <br />
                        <span className="text-muted">PIN: {order.customer?.pincode}</span>
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
                        {order.status}
                      </Badge>
                    </td>
                    <td>
                      <small>
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
                      <div className="d-flex gap-2">
                        <Link to={`/order/${order.id}`}>
                          <Button size="sm" variant="outline-primary">
                            <FiEye className="me-1" /> View
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="outline-success"
                          onClick={() => { 
                            setSelected(order); 
                            setStatus(order.status); 
                          }}
                        >
                          <FiEdit className="me-1" /> Status
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => confirmDelete(order)}
                          title="Delete order permanently"
                        >
                          <FiTrash2 className="me-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Status Update Modal */}
      <Modal show={!!selected} onHide={() => setSelected(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiEdit className="me-2" /> Update Order Status
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <>
              <Alert variant="info">
                <strong>Order #{selected.orderId}</strong>
                <br />
                Customer: {selected.customer?.name}
                <br />
                Phone: {selected.customer?.phone}
                <br />
                Total: ₹{selected.total?.toLocaleString('en-IN')}
              </Alert>

              <Row className="mb-3">
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body className="py-2">
                      <small className="text-muted d-block">Shipping To:</small>
                      <strong>
                        <FiMapPin className="me-1" />
                        {selected.customer?.city}, {selected.customer?.state} - {selected.customer?.pincode}
                      </strong>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body className="py-2">
                      <small className="text-muted d-block">Items:</small>
                      <strong>{selected.items?.length || 0} product(s)</strong>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Form.Group>
                <Form.Label className="fw-bold">Change Status To:</Form.Label>
                <Form.Select 
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                  size="lg"
                >
                   <option value="Pending">⏳ Pending</option>
                   <option value="Processing">🔄 Processing</option>
                   <option value="Shipped">🚚 Shipped</option>
                   <option value="Out for Delivery">📍 Out for Delivery</option>
                   <option value="Delivered">✅ Delivered</option>
                   <option value="Completed">🎉 Completed</option>
                   <option value="Refund Done">💸 Refund Done</option>
                   <option value="Return Order">↩️ Return Order</option>
                   <option value="Cancelled">❌ Cancelled</option>
                </Form.Select>
              </Form.Group>

              <div className="mt-3">
                <small className="text-muted">
                  Current: <Badge bg={statusColor[selected.status]}>{selected.status}</Badge>
                </small>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelected(null)} disabled={updating}>
            Cancel
          </Button>
          <Button variant="primary" onClick={updateStatus} disabled={updating}>
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

      {/* Delete Order Modal */}
      <Modal show={!!deleteTarget} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <FiTrash2 className="me-2" /> Delete Order
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteTarget && (
            <Alert variant="danger">
              <strong>⚠️ Warning: This action cannot be undone!</strong>
              <br /><br />
              <strong>Order #{deleteTarget.orderId}</strong>
              <br />
              Customer: {deleteTarget.customer?.name}
              <br />
              Total: ₹{deleteTarget.total?.toLocaleString('en-IN')}
              <br />
              Status: {deleteTarget.status}
              <br /><br />
              This will permanently delete this order from the system.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FiTrash2 className="me-2" />
                Delete Permanently
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
