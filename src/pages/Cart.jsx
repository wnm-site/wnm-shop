import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Table, Button, Spinner, Card, Badge } from 'react-bootstrap';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getProductImageSrc } from '../utils/imageHelper';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'carts', user.uid), (snap) => {
      setItems(snap.data()?.items || []);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  const updateQty = async (idx, delta) => {
    const newItems = [...items];
    newItems[idx].qty += delta;
    if (newItems[idx].qty <= 0) newItems.splice(idx, 1);
    await setDoc(doc(db, 'carts', user.uid), { items: newItems });
  };

  const removeItem = async (idx) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    await setDoc(doc(db, 'carts', user.uid), { items: newItems });
    toast.success('Removed from cart');
  };

  const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container py-3 py-md-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1">🛒 Your Cart</h2>
          <p className="text-muted mb-0">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>
        <Link to="/products" className="btn btn-outline-dark btn-sm d-none d-sm-inline-flex align-items-center gap-2">
          <FiShoppingBag /> Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <div style={{ fontSize: '3rem' }}>🛒</div>
            <h4 className="fw-bold mt-3 mb-2">Your cart is empty</h4>
            <p className="text-muted mb-4">Looks like you haven't added anything to your cart yet.</p>
            <Button variant="dark" size="sm" onClick={() => navigate('/products')}>Continue Shopping</Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="row g-3 g-md-4">
          {/* Cart Items */}
          <div className="col-12 col-lg-8">
            {/* Desktop Table */}
            <Card className="border-0 shadow-sm d-none d-md-block">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle" style={{ minWidth: '720px' }}>
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Product</th>
                        <th>Size</th>
                        <th>Color</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th className="pe-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={`${item.id || item.name}-${idx}`}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center gap-3">
                              <img src={getProductImageSrc(item)} alt={item.name} style={{ width: '52px', height: '52px', objectFit: 'cover' }} className="rounded" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/52x52?text=No+Image'; }} />
                              <div className="fw-semibold">{item.name}</div>
                            </div>
                          </td>
                          <td>
                            <Badge bg="light" text="dark">{item.size || 'N/A'}</Badge>
                          </td>
                          <td>
                            {item.color ? (
                              <div className="d-flex align-items-center gap-2">
                                <span style={{ width: '16px', height: '16px', backgroundColor: item.color.code || '#ddd', borderRadius: '50%', border: '2px solid #ddd', display: 'inline-block' }} />
                                <small>{item.color.name}</small>
                              </div>
                            ) : <small className="text-muted">N/A</small>}
                          </td>
                          <td>₹{Number(item.price || 0).toLocaleString('en-IN')}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Button size="sm" variant="outline-dark" onClick={() => updateQty(idx, -1)}><FiMinus /></Button>
                              <span className="px-3 fw-semibold" style={{ minWidth: '36px', textAlign: 'center', fontSize: '0.95rem', display: 'inline-block' }}>{item.qty}</span>
                              <Button size="sm" variant="outline-dark" onClick={() => updateQty(idx, 1)}><FiPlus /></Button>
                            </div>
                          </td>
                          <td className="fw-semibold">₹{(Number(item.price || 0) * Number(item.qty || 0)).toLocaleString('en-IN')}</td>
                          <td className="pe-4">
                            <Button variant="outline-danger" size="sm" onClick={() => removeItem(idx)}><FiTrash2 /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            {/* Mobile Cards */}
            <div className="d-md-none">
              {items.map((item, idx) => (
                <Card key={`${item.id || item.name}-${idx}`} className="border-0 shadow-sm mb-3">
                  <Card.Body className="p-3">
                    <div className="d-flex gap-3">
                      <img src={getProductImageSrc(item)} alt={item.name} style={{ width: '72px', height: '72px', objectFit: 'cover', flexShrink: 0 }} className="rounded" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/72x72?text=No+Image'; }} />
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <h6 className="fw-bold mb-1 text-truncate">{item.name}</h6>
                          <Button variant="link" className="text-danger p-0 flex-shrink-0" onClick={() => removeItem(idx)}><FiTrash2 size={18} /></Button>
                        </div>
                        <div className="text-muted mb-2">₹{Number(item.price || 0).toLocaleString('en-IN')}</div>
                        <div className="d-flex flex-wrap gap-2">
                          <Badge bg="light" text="dark">Size: {item.size || 'N/A'}</Badge>
                          {item.color && (
                            <Badge bg="light" text="dark" className="d-flex align-items-center gap-1">
                              <span style={{ width: '12px', height: '12px', backgroundColor: item.color.code || '#ddd', borderRadius: '50%', border: '1px solid #aaa', display: 'inline-block' }} />
                              {item.color.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                      <div className="d-flex align-items-center gap-2">
                        <Button size="sm" variant="outline-dark" onClick={() => updateQty(idx, -1)}><FiMinus /></Button>
                        <span className="px-3 fw-semibold" style={{ minWidth: '40px', textAlign: 'center', fontSize: '1rem', display: 'inline-block' }}>{item.qty}</span>
                        <Button size="sm" variant="outline-dark" onClick={() => updateQty(idx, 1)}><FiPlus /></Button>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block">Total</small>
                        <strong className="text-danger">₹{(Number(item.price || 0) * Number(item.qty || 0)).toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-12 col-lg-4">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Order Summary</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Shipping</span>
                  <span className="text-success fw-semibold">Free</span>
                </div>
                <hr className="my-3" />
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <strong className="fs-5">Total</strong>
                  <strong className="text-danger fs-4">₹{total.toLocaleString('en-IN')}</strong>
                </div>
                <Button variant="dark" className="w-100 py-2 mb-2" onClick={() => navigate('/checkout')}>Proceed to Checkout →</Button>
                <Button variant="outline-dark" className="w-100 d-sm-none" onClick={() => navigate('/products')}>Continue Shopping</Button>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
