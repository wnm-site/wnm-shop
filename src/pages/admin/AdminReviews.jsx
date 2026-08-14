import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Table, Button, Modal, Form, Badge, Card, Spinner } from 'react-bootstrap';
import { FiPlus, FiTrash2, FiStar } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    productId: '', 
    userName: '', 
    text: '', 
    rating: 5 
  });

  const loadData = async () => {
    try {
      const [rSnap, pSnap] = await Promise.all([
        getDocs(collection(db, 'reviews')),
        getDocs(collection(db, 'products'))
      ]);
      setReviews(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addFakeReview = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'reviews'), { 
        ...form,
        rating: Number(form.rating),
        createdAt: new Date()
      });
      toast.success('Fake review added successfully! ⭐');
      setShow(false);
      setForm({ productId: '', userName: '', text: '', rating: 5 });
      loadData();
    } catch (error) {
      toast.error('Failed to add review');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      toast.success('Review deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  if (loading) {
    return <div className="text-center py-5"><Spinner /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold mb-0">
          <FaStar className="me-2 text-warning" />
          Manage Reviews
        </h2>
        <Button variant="primary" onClick={() => setShow(true)}>
          <FiPlus className="me-2" /> Add Fake Review
        </Button>
      </div>

      {reviews.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm">
          <Card.Body>
            <FiStar size={60} className="text-muted mb-3" />
            <h4>No Reviews Yet</h4>
            <p className="text-muted">Add fake reviews to boost product credibility</p>
          </Card.Body>
        </Card>
      ) : (
        <Table responsive hover className="bg-white shadow-sm rounded">
          <thead className="table-light">
            <tr>
              <th>Product</th>
              <th>User</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id}>
                <td>
                  <strong>
                    {products.find(p => p.id === review.productId)?.name || 'Unknown Product'}
                  </strong>
                </td>
                <td>{review.userName}</td>
                <td>
                  <span className="text-warning">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </span>
                </td>
                <td style={{ maxWidth: '300px' }}>{review.text}</td>
                <td>
                  <small>
                    {review.createdAt?.seconds 
                      ? new Date(review.createdAt.seconds * 1000).toLocaleDateString('en-IN')
                      : 'N/A'}
                  </small>
                </td>
                <td>
                  <Button 
                    size="sm" 
                    variant="outline-danger"
                    onClick={() => deleteReview(review.id)}
                  >
                    <FiTrash2 />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add Fake Review Modal */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            <FiStar className="me-2 text-warning" />
            Add Fake Review
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={addFakeReview}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Select Product *</Form.Label>
              <Form.Select 
                required
                value={form.productId} 
                onChange={e => setForm({ ...form, productId: e.target.value })}
              >
                <option value="">Choose a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">User Name *</Form.Label>
              <Form.Control 
                required
                value={form.userName} 
                onChange={e => setForm({ ...form, userName: e.target.value })}
                placeholder="e.g., Priya Sharma"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Rating *</Form.Label>
              <Form.Select 
                value={form.rating} 
                onChange={e => setForm({ ...form, rating: e.target.value })}
              >
                {[5, 4, 3, 2, 1].map(r => (
                  <option key={r} value={r}>
                    {'★'.repeat(r)}{'☆'.repeat(5 - r)} ({r} Stars)
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Review Text *</Form.Label>
              <Form.Control 
                as="textarea" 
                rows="4"
                required
                value={form.text} 
                onChange={e => setForm({ ...form, text: e.target.value })}
                placeholder="Write a positive review..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FiPlus className="me-2" /> Add Review
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}