import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiZap } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { getProductImageSrc } from '../utils/imageHelper';
import { Button, Card } from 'react-bootstrap';

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

  const discount = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product);
  };

  return (
    <Card 
      className="h-100 border-0 shadow-sm product-card" 
      style={{ 
        borderRadius: '16px', 
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '1px solid #f0e8e4',
        cursor: 'pointer',
        background: '#ffffff'
      }}
      as={Link}
      to={`/product/${product.id}`}
    >
      {/* Image Container */}
      <div className="position-relative" style={{ overflow: 'hidden', background: '#faf6f3' }}>
        <Card.Img 
          variant="top" 
          src={getProductImageSrc(product)} 
          alt={product.name}
          className="product-image w-100"
          style={{ 
            aspectRatio: '1/1',
            objectFit: 'contain', 
            padding: '1rem',
            backgroundColor: '#faf6f3',
            transition: 'transform 0.5s ease'
          }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
          }}
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <span 
            className="position-absolute top-0 start-0 m-2 px-2 py-1 rounded-pill fw-bold"
            style={{ 
              background: 'linear-gradient(135deg, #dc3545, #c0392b)',
              color: 'white',
              fontSize: '0.65rem',
              letterSpacing: '0.3px',
              boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
              zIndex: 2
            }}
          >
            {discount}% OFF
          </span>
        )}
        
        {/* Wishlist Button */}
        <Button
          variant="light"
          size="sm"
          className="position-absolute top-0 end-0 m-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0 border-0"
          style={{ 
            width: '36px', 
            height: '36px', 
            background: 'white',
            color: '#880e4f',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease',
            zIndex: 2
          }}
          onClick={toggleWishlist}
        >
          <FiHeart size={16} />
        </Button>
      </div>

      {/* Card Body */}
      <Card.Body className="d-flex flex-column p-3">
        <Card.Title 
          className="fw-bold mb-1" 
          style={{ 
            fontSize: '0.9rem', 
            color: '#2d1b17',
            fontFamily: 'Playfair Display, serif',
            lineHeight: '1.3'
          }}
        >
          {product.name}
        </Card.Title>
        
        {/* Rating */}
        <div className="mb-1" style={{ fontSize: '0.8rem' }}>
          <span style={{ color: '#f5b342', letterSpacing: '0.5px' }}>
            {'★'.repeat(Math.floor(product.rating || 4))}
            {'☆'.repeat(5 - Math.floor(product.rating || 4))}
          </span>
          <span className="text-muted small ms-1" style={{ color: '#a0908a', fontSize: '0.75rem' }}>
            ({product.reviews || 0})
          </span>
        </div>

        {/* Price */}
        <div className="mb-2">
          <span className="fw-bold" style={{ fontSize: '1rem', color: '#880e4f' }}>
            ₹{product.price?.toLocaleString('en-IN')}
          </span>
          {product.oldPrice && (
            <small className="text-muted text-decoration-line-through ms-1" style={{ color: '#b5a69e', fontSize: '0.8rem' }}>
              ₹{product.oldPrice?.toLocaleString('en-IN')}
            </small>
          )}
        </div>

        {/* Action Buttons */}
        <div className="d-grid gap-2 mt-auto">
          <div className="d-flex gap-2">
            <Button 
              variant="outline-danger" 
              size="sm" 
              className="flex-grow-1 rounded-pill fw-semibold"
              style={{ 
                borderColor: '#e8d5ce',
                color: '#880e4f',
                fontSize: '0.75rem',
                padding: '0.4rem 0',
                transition: 'all 0.2s ease'
              }}
              onClick={handleAddToCart}
            >
              <FiShoppingCart className="me-1" size={12} /> Add
            </Button>
            <Button 
              size="sm" 
              className="flex-grow-1 rounded-pill fw-semibold text-white border-0"
              style={{ 
                background: 'linear-gradient(135deg, #c2185b, #880e4f)',
                fontSize: '0.75rem',
                padding: '0.4rem 0',
                transition: 'all 0.2s ease'
              }}
              onClick={handleBuyNow}
            >
              <FiZap className="me-1" size={12} /> Buy
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
