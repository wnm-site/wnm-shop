import { useEffect, useState } from 'react';
import { doc, onSnapshot, addDoc, collection, setDoc, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', pincode: '' });
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'carts', user.uid), (snap) => {
      setItems(snap.data()?.items || []);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal - discount + shipping;

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponCode.trim().toUpperCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        toast.error('Invalid coupon code');
        setAppliedCoupon(null);
        setDiscount(0);
        return;
      }

      const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() };

      if (!coupon.isActive) {
        toast.error('This coupon is no longer active');
        setAppliedCoupon(null);
        setDiscount(0);
        return;
      }

      const now = new Date();
      const expiry = coupon.expiryDate?.toDate ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate);
      if (expiry < now) {
        toast.error('This coupon has expired');
        setAppliedCoupon(null);
        setDiscount(0);
        return;
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        toast.error('This coupon has reached its usage limit');
        setAppliedCoupon(null);
        setDiscount(0);
        return;
      }

      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
        toast.error(`Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`);
        setAppliedCoupon(null);
        setDiscount(0);
        return;
      }

      if (coupon.applicableTo === 'new_users') {
        try {
          const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
          const ordersSnap = await getDocs(ordersQuery);
          
          if (ordersSnap.docs.length > 0) {
            toast.error('This coupon is only valid for new users (first order)');
            setAppliedCoupon(null);
            setDiscount(0);
            return;
          }
        } catch (error) {
          console.error('Error checking user orders:', error);
          toast.error('Failed to validate coupon eligibility');
          setAppliedCoupon(null);
          setDiscount(0);
          return;
        }
      }

      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        }
      } else {
        discountAmount = Math.min(coupon.value, subtotal);
      }

      discountAmount = Math.round(discountAmount);

      setAppliedCoupon(coupon);
      setDiscount(discountAmount);
      toast.success(`Coupon applied! You saved ₹${discountAmount}`);
    } catch (error) {
      console.error('Coupon error:', error);
      toast.error('Failed to validate coupon: ' + error.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!user?.uid) {
      toast.error('Please login to place order');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacingOrder(true);
    try {
      const orderId = 'ORD' + Date.now();

      const orderData = {
        orderId,
        userId: user.uid,
        userEmail: user.email,
        customer: {
          ...form,
          email: form.email || user.email
        },
        items,
        subtotal,
        shipping,
        discount,
        total,
        paymentMethod: 'Cash on Delivery',
        status: 'Pending',
        createdAt: new Date()
      };

      if (appliedCoupon) {
        orderData.coupon = {
          code: appliedCoupon.code,
          discountType: appliedCoupon.discountType,
          value: appliedCoupon.value,
          discountAmount: discount
        };
      }

      await addDoc(collection(db, 'orders'), orderData);

      if (appliedCoupon) {
        try {
          await updateDoc(doc(db, 'coupons', appliedCoupon.id), {
            usedCount: (appliedCoupon.usedCount || 0) + 1
          });
        } catch (couponError) {
          console.error('Failed to update coupon count:', couponError);
        }
      }

      await setDoc(doc(db, 'carts', user.uid), { items: [] });
      toast.success(`Order placed! Tracking ID: ${orderId}`);
      navigate('/orders');
    } catch (error) {
      console.error('Order error:', error);
      const errorMsg = error.message || 'Failed to place order';
      if (errorMsg.includes('permission-denied') || errorMsg.includes('Missing or insufficient permissions')) {
        toast.error('Permission denied. Please check Firestore rules.');
      } else {
        toast.error('Failed to place order: ' + errorMsg);
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner /></div>;
  if (items.length === 0) return <p className="text-center py-5">Cart is empty</p>;

  return (
    <div className="row">
      <div className="col-md-7">
        <Card className="p-4">
          <h3>Shipping Details</h3>
          <Form onSubmit={placeOrder}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name *</Form.Label>
              <Form.Control required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder={user?.email || ''} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone *</Form.Label>
              <Form.Control required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address *</Form.Label>
              <Form.Control as="textarea" required rows="2" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </Form.Group>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>City *</Form.Label>
                <Form.Control required value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Pincode *</Form.Label>
                <Form.Control required value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} />
              </div>
            </div>

            {/* Coupon Section */}
            <Card className="border-0 bg-light mb-3">
              <Card.Body>
                <h6 className="fw-bold mb-3">🎟️ Have a Coupon?</h6>
                {appliedCoupon ? (
                  <Alert variant="success" className="d-flex justify-content-between align-items-center mb-0">
                    <div>
                      <strong>{appliedCoupon.code}</strong>
                      <span className="ms-2">-₹{discount}</span>
                    </div>
                    <Button variant="outline-danger" size="sm" onClick={removeCoupon}>Remove</Button>
                  </Alert>
                ) : (
                  <div className="d-flex gap-2">
                    <Form.Control
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      disabled={couponLoading}
                    />
                    <Button variant="outline-dark" onClick={validateCoupon} disabled={couponLoading}>
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            <div className="alert alert-info">💰 Payment: <strong>Cash on Delivery (COD)</strong></div>
            <Button type="submit" variant="dark" size="lg" className="w-100" disabled={placingOrder}>
              {placingOrder ? 'Placing Order...' : 'Place Order (COD)'}
            </Button>
          </Form>
        </Card>
      </div>
      <div className="col-md-5">
        <Card className="p-4">
          <h4>Order Summary</h4>
          {items.map((i, idx) => (
            <div key={idx} className="d-flex justify-content-between py-2 border-bottom">
              <div><strong>{i.name}</strong> <small className="text-muted">x{i.qty}</small></div>
              <span>₹{(i.price * i.qty).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="d-flex justify-content-between py-2 border-bottom">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="d-flex justify-content-between py-2 border-bottom">
            <span>Shipping</span>
            <span className={shipping === 0 ? 'text-success' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
          </div>
          {discount > 0 && (
            <div className="d-flex justify-content-between py-2 border-bottom text-success">
              <span>Discount ({appliedCoupon?.code})</span>
              <span>-₹{discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <h4 className="mt-3">Total: <span className="text-danger">₹{total.toLocaleString('en-IN')}</span></h4>
          {subtotal < 999 && (
            <small className="text-muted">Add ₹{(999 - subtotal).toLocaleString('en-IN')} more for free shipping!</small>
          )}
        </Card>
      </div>
    </div>
  );
}
