import { useEffect, useState } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Row, Col, Spinner } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'wishlists', user.uid), async (snap) => {
      const ids = snap.data()?.ids || [];
      const prods = [];
      for (const id of ids) {
        const pSnap = await getDoc(doc(db, 'products', id));
        if (pSnap.exists()) prods.push({ id: pSnap.id, ...pSnap.data() });
      }
      setProducts(prods);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addToCart = async (product) => {
    const ref = doc(db, 'carts', user.uid);
    const snap = await getDoc(ref);
    const items = snap.data()?.items || [];
    if (!items.find(i => i.id === product.id)) {
      const { arrayUnion } = await import('firebase/firestore');
      await setDoc(ref, { items: arrayUnion({ ...product, qty: 1, size: 'M' }) }, { merge: true });
      toast.success('Added to cart!');
    } else {
      toast('Already in cart');
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner /></div>;

  return (
    <>
      <h2 className="mb-4">❤️ My Wishlist</h2>
      {products.length === 0 ? <p className="text-center py-5">Your wishlist is empty</p> : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {products.map(p => <Col key={p.id}><ProductCard product={p} onAddToCart={addToCart} /></Col>)}
        </Row>
      )}
    </>
  );
}