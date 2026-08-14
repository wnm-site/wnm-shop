import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, addDoc, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Row, Col, Button, Form, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { FiMinus, FiPlus, FiShoppingCart, FiZap, FiArrowLeft, FiStar, FiZoomIn } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaTwitter, FaTelegram, FaLink } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getProductImages, getProductImageSrc } from '../utils/imageHelper';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [showFullImage, setShowFullImage] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'products', id));
      if (snap.exists()) {
        const data = snap.data();
        setProduct({ id: snap.id, ...data });
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
        if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
      }
      const q = query(collection(db, 'reviews'), where('productId', '==', id));
      const rSnap = await getDocs(q);
      setReviews(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, [id]);

  const addToCart = async () => {
    if (!user) return toast.error('Login first');
    if (!selectedSize) return toast.error('Please select a size');
    if (!selectedColor) return toast.error('Please select a color');

    try {
      const ref = doc(db, 'carts', user.uid);
      const snap = await getDoc(ref);
      const items = snap.data()?.items || [];
      
      const existing = items.find(i => 
        i.id === product.id && 
        i.size === selectedSize && 
        i.color?.name === selectedColor.name
      );

      if (existing) {
        existing.qty += qty;
        await setDoc(ref, { items }, { merge: true });
      } else {
        await setDoc(ref, { 
          items: arrayUnion({ 
            ...product, 
            qty, 
            size: selectedSize,
            color: selectedColor,
            image: product.images?.[0] || product.image
          }) 
        }, { merge: true });
      }
      toast.success('Added to cart! 🛒');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add to cart');
    }
  };

  const buyNow = async () => {
    await addToCart();
    navigate('/checkout');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Login first');
    if (!reviewText.trim() || reviewText.trim().length < 5) {
      toast.error('Review must be at least 5 characters');
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error('Please select a valid rating');
      return;
    }
    await addDoc(collection(db, 'reviews'), {
      productId: id,
      userId: user.uid,
      userName: user.email.split('@')[0],
      text: reviewText.trim(),
      rating,
      createdAt: new Date()
    });
    setReviewText('');
    toast.success('Review posted!');
    const q = query(collection(db, 'reviews'), where('productId', '==', id));
    const rSnap = await getDocs(q);
    setReviews(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const shareUrl = window.location.href;
  const shareText = `Check out ${product?.name} for ₹${product?.price}!`;

  if (!product) return <div className="text-center mt-5"><Spinner /></div>;

  const images = getProductImages(product);
  const mainImage = getProductImageSrc(product);

  return (
    <>
      <Button
  variant="link"
  onClick={() => navigate(-1)}
  className="mb-3 p-2 text-decoration-none d-inline-flex align-items-center gap-2 text-secondary fw-medium rounded-pill"
>
  <span className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center">
    <FiArrowLeft size={17} />
  </span>
  <span>Back</span>
</Button>

      <Row className="bg-white p-4 rounded shadow-sm">
        {/* Image Gallery */}
        <Col md={6}>
          {/* Main Image Container - Shows Full Image */}
          <div 
            className="position-relative mb-3 bg-light rounded overflow-hidden d-flex align-items-center justify-content-center"
            style={{ 
              minHeight: '400px',
              maxHeight: '600px',
              cursor: 'zoom-in'
            }}
            onClick={() => setShowFullImage(true)}
          >
            {!imageLoaded && (
              <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner animation="border" variant="primary" />
              </div>
            )}
            <img
              src={mainImage}
              alt={product.name}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
                setImageLoaded(true);
              }}
              style={{ 
                maxWidth: '100%',
                maxHeight: '600px',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block'
              }}
            />
            
            {/* Zoom Icon */}
            <div 
              className="position-absolute top-0 end-0 m-2 bg-white rounded-circle p-2 shadow"
              style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <FiZoomIn size={18} />
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="light"
                  className="position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle shadow"
                  style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageLoaded(false);
                    setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
                  }}
                  disabled={currentImageIndex === 0}
                >
                  ‹
                </Button>
                <Button
                  variant="light"
                  className="position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle shadow"
                  style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageLoaded(false);
                    setCurrentImageIndex(Math.min(images.length - 1, currentImageIndex + 1));
                  }}
                  disabled={currentImageIndex === images.length - 1}
                >
                  ›
                </Button>
              </>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <Badge 
                bg="dark" 
                className="position-absolute bottom-0 start-50 translate-middle-x mb-2 px-3 py-2"
              >
                {currentImageIndex + 1} / {images.length}
              </Badge>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="d-flex gap-2 overflow-auto pb-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="position-relative flex-shrink-0"
                  style={{
                    width: '80px',
                    height: '80px',
                    cursor: 'pointer',
                    border: idx === currentImageIndex ? '3px solid #0d6efd' : '2px solid #ddd',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#f8f9fa'
                  }}
                  onClick={() => {
                    setImageLoaded(false);
                    setCurrentImageIndex(idx);
                  }}
                >
                   <img
                     src={img}
                     alt={`Thumbnail ${idx + 1}`}
                     onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=No+Image'; }}
                     style={{
                       width: '100%',
                       height: '100%',
                       objectFit: 'contain',
                       display: 'block'
                     }}
                   />
                </div>
              ))}
            </div>
          )}
        </Col>

        {/* Product Details */}
        <Col md={6}>
          <h1 className="mb-2">{product.name}</h1>
          
          {/* Category Badge */}
          {product.category && (
            <Badge bg="light" text="dark" className="mb-2 px-3 py-2">
              {product.category}
            </Badge>
          )}

          <div className="text-warning mb-2">
            {'★'.repeat(Math.round(product.rating || 4))}
            {'☆'.repeat(5 - Math.round(product.rating || 4))}
            <small className="text-muted ms-2"> ({reviews.length} reviews)</small>
          </div>
          
          <p className="text-muted mb-3">{product.description}</p>
          
          <h3 className="text-danger mb-4">
            ₹{product.price?.toLocaleString('en-IN')}
            {product.oldPrice > 0 && (
              <>
                <small className="text-muted text-decoration-line-through ms-2">
                  ₹{product.oldPrice?.toLocaleString('en-IN')}
                </small>
                <Badge bg="success" className="ms-2">
                  {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                </Badge>
              </>
            )}
          </h3>

          {/* Size Selection */}
          {product.sizes?.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Select Size: {selectedSize && <Badge bg="primary" className="ms-2">{selectedSize}</Badge>}
              </Form.Label>
              <div className="d-flex gap-2 flex-wrap">
                {product.sizes.map(size => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? 'dark' : 'outline-dark'}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                    style={{ minWidth: '50px' }}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </Form.Group>
          )}

          {/* Color Selection */}
          {product.colors?.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Select Color: {selectedColor && (
                  <span className="ms-2">
                    <span
                      style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        backgroundColor: selectedColor.code,
                        borderRadius: '50%',
                        border: '2px solid #ccc',
                        verticalAlign: 'middle'
                      }}
                    />
                    <strong className="ms-1">{selectedColor.name}</strong>
                  </span>
                )}
              </Form.Label>
              <div className="d-flex gap-2 flex-wrap">
                {product.colors.map(color => (
                  <Button
                    key={color.name}
                    variant={selectedColor?.name === color.name ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setSelectedColor(color)}
                    className="d-flex align-items-center gap-2"
                  >
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: color.code,
                        borderRadius: '50%',
                        border: '1px solid #ccc'
                      }}
                    />
                    {color.name}
                  </Button>
                ))}
              </div>
            </Form.Group>
          )}

          {/* Quantity */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Quantity:</Form.Label>
            <div className="d-inline-flex align-items-center border rounded">
              <Button variant="light" onClick={() => setQty(Math.max(1, qty - 1))}>
                <FiMinus />
              </Button>
              <span className="px-4 fw-bold">{qty}</span>
              <Button variant="light" onClick={() => setQty(qty + 1)}>
                <FiPlus />
              </Button>
            </div>
          </Form.Group>

          {/* Action Buttons */}
          <div className="d-grid gap-2 d-md-flex mb-3">
            <Button variant="dark" size="lg" onClick={addToCart} className="flex-grow-1">
              <FiShoppingCart className="me-2" /> Add to Cart
            </Button>
            <Button variant="danger" size="lg" onClick={buyNow} className="flex-grow-1">
              <FiZap className="me-2" /> Buy Now
            </Button>
          </div>

          <hr className="my-4" />
          
          {/* Share Buttons */}
          <h6>Share this product:</h6>
          <div className="d-flex gap-2 flex-wrap">
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" rel="noreferrer" className="btn btn-success btn-sm">
              <FaWhatsapp className="me-1" /> WhatsApp
            </a>
            <a href={`https://facebook.com/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
              <FaFacebook className="me-1" /> Facebook
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}`} target="_blank" rel="noreferrer" className="btn btn-info btn-sm">
              <FaTwitter className="me-1" /> Twitter
            </a>
            <a href={`https://t.me/share/url?url=${shareUrl}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
              <FaTelegram className="me-1" /> Telegram
            </a>
            <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Link copied!'); }}>
              <FaLink className="me-1" /> Copy
            </Button>
          </div>
        </Col>
      </Row>

      {/* Full Screen Image Modal */}
      {showFullImage && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.95)', 
            zIndex: 9999, 
            cursor: 'zoom-out' 
          }}
          onClick={() => setShowFullImage(false)}
        >
          <Button
            variant="light"
            className="position-absolute top-0 end-0 m-3 rounded-circle"
            style={{ width: '50px', height: '50px', zIndex: 10000 }}
            onClick={() => setShowFullImage(false)}
          >
            ✕
          </Button>

          {images.length > 1 && (
            <>
              <Button
                variant="light"
                className="position-absolute start-0 ms-3 rounded-circle"
                style={{ width: '50px', height: '50px', zIndex: 10000 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setImageLoaded(false);
                  setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
                }}
                disabled={currentImageIndex === 0}
              >
                ‹
              </Button>
              <Button
                variant="light"
                className="position-absolute end-0 me-3 rounded-circle"
                style={{ width: '50px', height: '50px', zIndex: 10000 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setImageLoaded(false);
                  setCurrentImageIndex(Math.min(images.length - 1, currentImageIndex + 1));
                }}
                disabled={currentImageIndex === images.length - 1}
              >
                ›
              </Button>
            </>
          )}

          <img
            src={mainImage}
            alt={product.name}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/600x600?text=No+Image'; }}
            style={{ 
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain'
            }}
          />

          {images.length > 1 && (
            <Badge 
              bg="light" 
              text="dark"
              className="position-absolute bottom-0 start-50 translate-middle-x mb-3 px-3 py-2"
              style={{ fontSize: '1rem' }}
            >
              {currentImageIndex + 1} / {images.length}
            </Badge>
          )}
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-5">
        <h3 className="mb-4">Reviews ({reviews.length})</h3>
        {user && (
          <Form onSubmit={submitReview} className="mb-4 p-3 bg-light rounded">
            <Form.Group className="mb-2">
              <Form.Label>Rating</Form.Label>
              <Form.Select value={rating} onChange={e => setRating(e.target.value)}>
                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control as="textarea" rows="2" placeholder="Write your review..." value={reviewText} onChange={e => setReviewText(e.target.value)} required />
            </Form.Group>
            <Button type="submit" variant="dark" size="sm">Post Review</Button>
          </Form>
        )}
        <ListGroup>
          {reviews.length === 0 ? (
            <p className="text-muted text-center py-3">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map(r => (
              <ListGroup.Item key={r.id}>
                <div className="text-warning mb-1">
                  <FiStar fill="gold" /> {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </div>
                <strong>{r.userName}</strong>
                <p className="mb-0 mt-1">{r.text}</p>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      </div>
    </>
  );
}