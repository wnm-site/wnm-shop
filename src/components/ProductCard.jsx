import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { getProductImageSrc } from '../utils/imageHelper';

export default function ProductCard({ product, onAddToCart }) {
  const { user } = useAuth();

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Login first');
    const ref = doc(db, 'wishlists', user.uid);
    const snap = await getDoc(ref);
    const ids = snap.data()?.ids || [];
    if (ids.includes(product.id)) {
      await setDoc(ref, { ids: arrayRemove(product.id) }, { merge: true });
      toast.success('Removed from wishlist');
    } else {
      await setDoc(ref, { ids: arrayUnion(product.id) }, { merge: true });
      toast.success('Added to wishlist ❤️');
    }
  };

  const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);

  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="position-relative">
        <img src={getProductImageSrc(product)} className="card-img-top" alt={product.name} style={{ aspectRatio: '1/1', objectFit: 'contain', backgroundColor: '#f8f9fa' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/600x600?text=No+Image'; }} />
        <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-2">{discount}% OFF</span>
        <button onClick={toggleWishlist} className="btn btn-light btn-sm position-absolute top-0 end-0 m-2 rounded-circle">
          <FiHeart />
        </button>
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text text-muted small flex-grow-1">{product.description?.substring(0, 70)}...</p>
        <div className="mb-2">
          <span className="text-warning">{'★'.repeat(Math.round(product.rating || 4))}</span>
          <small className="text-muted"> ({product.reviews || 0})</small>
        </div>
        <div className="mb-3">
          <strong className="text-danger fs-5">₹{product.price?.toLocaleString('en-IN')}</strong>
          <small className="text-muted text-decoration-line-through ms-2">₹{product.oldPrice?.toLocaleString('en-IN')}</small>
        </div>
        <div className="d-grid gap-2">
          <Link to={`/product/${product.id}`} className="btn btn-outline-dark btn-sm"><FiEye /> View</Link>
          <button onClick={() => onAddToCart(product)} className="btn btn-dark btn-sm"><FiShoppingCart /> Add to Cart</button>
        </div>
      </div>
    </div>
  );
}