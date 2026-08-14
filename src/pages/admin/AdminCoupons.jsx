import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Table, Button, Modal, Form, Badge, Card, Row, Col, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiX, FiCheck, FiPercent } from 'react-icons/fi';
import { FaTicketAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const { userData } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    expiryDate: '',
    isActive: true,
    applicableTo: 'all',
    usedCount: 0
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'coupons'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCoupons(data);
      setLoading(false);
    }, (error) => {
      console.error('Coupons error:', error);
      toast.error('Failed to load coupons');
      setLoading(false);
    });
    return unsub;
  }, []);

  const resetForm = () => {
    setForm({
      code: '',
      discountType: 'percentage',
      value: '',
      minOrderAmount: '',
      maxDiscount: '',
      usageLimit: '',
      expiryDate: '',
      isActive: true,
      applicableTo: 'all',
      usedCount: 0
    });
    setEditId(null);
  };

  const openAdd = () => {
    resetForm();
    setShow(true);
  };

  const openEdit = (coupon) => {
    setForm({
      code: coupon.code || '',
      discountType: coupon.discountType || 'percentage',
      value: coupon.value || '',
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscount: coupon.maxDiscount || '',
      usageLimit: coupon.usageLimit || '',
      expiryDate: coupon.expiryDate?.toDate ? coupon.expiryDate.toDate().toISOString().split('T')[0] : (coupon.expiryDate ? new Date(coupon.expiryDate.seconds * 1000).toISOString().split('T')[0] : ''),
      isActive: coupon.isActive ?? true,
      applicableTo: coupon.applicableTo || 'all',
      usedCount: coupon.usedCount || 0
    });
    setEditId(coupon.id);
    setShow(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (!form.value || Number(form.value) <= 0) {
      toast.error('Please enter a valid discount value');
      return;
    }
    if (!form.expiryDate) {
      toast.error('Please select an expiry date');
      return;
    }

    const upperCode = form.code.trim().toUpperCase();

    const data = {
      code: upperCode,
      discountType: form.discountType,
      value: Number(form.value),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : 0,
      expiryDate: new Date(form.expiryDate),
      isActive: form.isActive,
      applicableTo: form.applicableTo,
      usedCount: form.usedCount || 0
    };

    setSaving(true);
    try {
      if (editId) {
        await updateDoc(doc(db, 'coupons', editId), data);
        toast.success('Coupon updated! ✅');
      } else {
        await addDoc(collection(db, 'coupons'), data);
        toast.success('Coupon created! ✅');
      }
      setShow(false);
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      const errorMsg = error.message || 'Failed to save coupon';
      if (errorMsg.includes('permission-denied') || errorMsg.includes('Missing or insufficient permissions')) {
        toast.error('Permission denied. Check Firestore rules and make sure you are logged in as admin.');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      toast.success('Coupon deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete coupon');
    }
  };

  const toggleStatus = async (coupon) => {
    try {
      await updateDoc(doc(db, 'coupons', coupon.id), { isActive: !coupon.isActive });
      toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const filteredCoupons = coupons.filter(c =>
    c.code?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const expiry = coupon.expiryDate?.toDate ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate);
    if (!coupon.isActive) return <Badge bg="secondary">Inactive</Badge>;
    if (expiry < now) return <Badge bg="danger">Expired</Badge>;
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return <Badge bg="warning">Limit Reached</Badge>;
    return <Badge bg="success">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading coupons...</p>
      </div>
    );
  }

  if (!userData?.isAdmin) {
    return (
      <Alert variant="danger">
        <h5>Access Denied</h5>
        <p>You don't have permission to manage coupons. Admin access required.</p>
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold mb-0">
          <FaTicketAlt className="me-2 text-warning" />
          Manage Coupons
        </h2>
        <Button variant="primary" onClick={openAdd}>
          <FiPlus className="me-2" /> Create Coupon
        </Button>
      </div>

      <Alert variant="info">
        💡 <strong>Tip:</strong> Create discount coupons for your customers. Supports percentage and fixed-amount discounts with expiry dates and usage limits.
      </Alert>

      {/* Search */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <InputGroup>
            <Form.Control
              placeholder="Search coupons by code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={() => setSearch('')}>
              <FiX /> Clear
            </Button>
          </InputGroup>
        </Card.Body>
      </Card>

      {filteredCoupons.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm">
          <Card.Body>
            <FiTag size={60} className="text-muted mb-3" />
            <h4>No Coupons Found</h4>
            <p className="text-muted">
              {search ? 'Try a different search term' : 'Create your first coupon to get started'}
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Min Order</th>
                  <th>Usage</th>
                  <th>Expiry</th>
                  <th>Applicable To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map(coupon => {
                  const expiry = coupon.expiryDate?.toDate ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate);
                  const isExpired = expiry < new Date();
                  
                  return (
                    <tr key={coupon.id}>
                      <td><strong>{coupon.code}</strong></td>
                      <td>
                        <Badge bg={coupon.discountType === 'percentage' ? 'info' : 'secondary'}>
                          {coupon.discountType === 'percentage' ? <><FiPercent className="me-1" /> %</> : 'Fixed'}
                        </Badge>
                      </td>
                      <td>
                        {coupon.discountType === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                        {coupon.maxDiscount > 0 && coupon.discountType === 'percentage' && (
                          <small className="text-muted d-block">Max ₹{coupon.maxDiscount}</small>
                        )}
                      </td>
                      <td>₹{coupon.minOrderAmount || 0}</td>
                      <td>
                        {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}
                      </td>
                      <td>
                        <small>{expiry.toLocaleDateString('en-IN')}</small>
                        {isExpired && <small className="text-danger d-block">Expired</small>}
                      </td>
                      <td>
                        <Badge bg={coupon.applicableTo === 'new_users' ? 'warning' : 'success'}>
                          {coupon.applicableTo === 'new_users' ? 'New Users Only' : 'All Users'}
                        </Badge>
                      </td>
                      <td>{getStatusBadge(coupon)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant={coupon.isActive ? "outline-warning" : "outline-success"}
                            onClick={() => toggleStatus(coupon)}
                            title={coupon.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {coupon.isActive ? <FiX /> : <FiCheck />}
                          </Button>
                          <Button size="sm" variant="outline-primary" onClick={() => openEdit(coupon)}>
                            <FiEdit2 />
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(coupon.id, coupon.code)}>
                            <FiTrash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal show={show} onHide={() => { setShow(false); resetForm(); }} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            {editId ? 'Edit Coupon' : 'Create New Coupon'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Coupon Code *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., SAVE20"
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    disabled={!!editId}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <Form.Text className="text-muted">Auto-converted to uppercase</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Discount Type *</Form.Label>
                  <Form.Select
                    value={form.discountType}
                    onChange={e => setForm({ ...form, discountType: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    {form.discountType === 'percentage' ? 'Discount Percentage *' : 'Discount Amount (₹) *'}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    step="any"
                    placeholder={form.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 500'}
                    value={form.value}
                    onChange={e => setForm({ ...form, value: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Expiry Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.expiryDate}
                    onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Min Order Amount (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={form.minOrderAmount}
                    onChange={e => setForm({ ...form, minOrderAmount: e.target.value })}
                  />
                  <Form.Text className="text-muted">0 = no minimum</Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Max Discount (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0 = no limit"
                    value={form.maxDiscount}
                    onChange={e => setForm({ ...form, maxDiscount: e.target.value })}
                    disabled={form.discountType !== 'percentage'}
                  />
                  <Form.Text className="text-muted">Only for % coupons</Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Usage Limit</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="0 = unlimited"
                    value={form.usageLimit}
                    onChange={e => setForm({ ...form, usageLimit: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Applicable To *</Form.Label>
                  <Form.Select
                    value={form.applicableTo}
                    onChange={e => setForm({ ...form, applicableTo: e.target.value })}
                  >
                    <option value="all">All Users</option>
                    <option value="new_users">New Users Only (First Order)</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {form.applicableTo === 'new_users' 
                      ? 'Only users placing their first order can use this coupon' 
                      : 'Any user can use this coupon'}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="isActive"
                    label="Active"
                    checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShow(false); resetForm(); }} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FiCheck className="me-2" />
                  {editId ? 'Update' : 'Create'} Coupon
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
