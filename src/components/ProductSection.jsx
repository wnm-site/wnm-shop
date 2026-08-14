import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Row, Col, Spinner, Button, Card } from 'react-bootstrap';
import { FiShoppingCart, FiHeart, FiZap } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProductImageSrc } from '../utils/imageHelper';

export default function ProductSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (isMounted) {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setProducts(data);
        }
      } catch (error) {
        if (isMounted) {
          toast.error('Failed to load products');
          console.error(error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'wishlists', user.uid));
        if (isMounted) setWishlistIds(snap.data()?.ids || []);
      } catch (error) {
        if (isMounted) console.error(error);
      }
    })();
    return () => { isMounted = false; };
  }, [user]);

  const addToCart = async (product) => {
    if (!user) {
      toast.error('Please login first');
      return;
    }
    try {
      const ref = doc(db, 'carts', user.uid);
      const snap = await getDoc(ref);
      const items = snap.data()?.items || [];
      const existing = items.find(i => i.id === product.id);
      
      if (existing) {
        existing.qty += 1;
        await setDoc(ref, { items }, { merge: true });
      } else {
        await setDoc(ref, { items: arrayUnion({ ...product, qty: 1, size: 'M' }) }, { merge: true });
      }
      toast.success(`${product.name} added to cart! 🛒`);
    } catch (error) {
      toast.error('Failed to add to cart');
      console.error(error);
    }
  };

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login first');
      return;
    }
    
    try {
      const ref = doc(db, 'wishlists', user.uid);
      const isAlreadyInWishlist = wishlistIds.includes(productId);
      
      if (isAlreadyInWishlist) {
        await setDoc(ref, { ids: arrayRemove(productId) }, { merge: true });
        setWishlistIds(wishlistIds.filter(id => id !== productId));
        toast.success('Removed from wishlist');
      } else {
        await setDoc(ref, { ids: arrayUnion(productId) }, { merge: true });
        setWishlistIds([...wishlistIds, productId]);
        toast.success('Added to wishlist ❤️');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
      console.error(error);
    }
  };

  const handleCardClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (isMounted) {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setProducts(data);
        }
      } catch (error) {
        if (isMounted) {
          toast.error('Failed to load products');
          console.error(error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'wishlists', user.uid));
        if (isMounted) setWishlistIds(snap.data()?.ids || []);
      } catch (error) {
        if (isMounted) console.error(error);
      }
    })();
    return () => { isMounted = false; };
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="danger" />
        <p className="mt-3 text-muted">Loading amazing products...</p>
      </div>
    );
  }

  return (
    <section id="collection" className="py-5" style={{ backgroundColor: '#faf6f3' }}>
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5">
          <span className="badge bg-light text-dark mb-2 px-4 py-2 rounded-pill" style={{ fontSize: '0.75rem', letterSpacing: '1px', background: '#f5edea', color: '#880e4f', border: '1px solid #e8d5ce' }}>
            ✦ OUR COLLECTION ✦
          </span>
          <h2 className="fw-bold mb-2" style={{ color: '#880e4f', fontFamily: 'Playfair Display, serif', fontSize: '2.5rem' }}>
            Our Dress Collection
          </h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', color: '#7a6b66' }}>Handpicked styles for every occasion</p>
          <div className="mx-auto mt-3" style={{ width: '60px', height: '3px', background: 'linear-gradient(90deg, #d4af37, #f5d98f)', borderRadius: '4px' }}></div>
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '4rem' }}>👗</div>
            <p className="text-muted fs-5 mt-3">No products available yet.</p>
            <p className="text-muted small">Admin needs to add products from the dashboard.</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
              {products.map(product => {
                const discount = product.oldPrice 
                  ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                  : 0;
                const isInWishlist = wishlistIds.includes(product.id);
                
                return (
                  <Col key={product.id}>
                    <Card 
                      className="h-100 border-0 shadow-sm product-card" 
                      style={{ 
                        borderRadius: '20px', 
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        border: '1px solid #f0e8e4',
                        cursor: 'pointer',
                        background: '#ffffff'
                      }}
                      onClick={() => handleCardClick(product.id)}
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
                            padding: '1.2rem',
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
                            className="position-absolute top-0 start-0 m-3 px-3 py-1 rounded-pill fw-bold"
                            style={{ 
                              background: 'linear-gradient(135deg, #dc3545, #c0392b)',
                              color: 'white',
                              fontSize: '0.7rem',
                              letterSpacing: '0.5px',
                              boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                              zIndex: 2
                            }}
                          >
                            {discount}% OFF
                          </span>
                        )}
                        
                        {/* Wishlist Button */}
                        <Button
                          variant={isInWishlist ? 'danger' : 'light'}
                          size="sm"
                          className="position-absolute top-0 end-0 m-3 rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0 border-0"
                          style={{ 
                            width: '42px', 
                            height: '42px', 
                            background: isInWishlist ? '#dc3545' : 'white',
                            color: isInWishlist ? 'white' : '#880e4f',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s ease',
                            zIndex: 2
                          }}
                          onClick={(e) => toggleWishlist(e, product.id)}
                        >
                          <FiHeart size={18} fill={isInWishlist ? 'white' : 'none'} />
                        </Button>
                      </div>

                      {/* Card Body */}
                      <Card.Body className="d-flex flex-column p-4">
                        <Card.Title 
                          className="fw-bold mb-2" 
                          style={{ 
                            fontSize: '1.05rem', 
                            color: '#2d1b17',
                            fontFamily: 'Playfair Display, serif'
                          }}
                        >
                          {product.name}
                        </Card.Title>
                        
                        {/* Rating */}
                        <div className="mb-2">
                          <span style={{ color: '#f5b342', letterSpacing: '1px' }}>
                            {'★'.repeat(Math.floor(product.rating || 4))}
                            {'☆'.repeat(5 - Math.floor(product.rating || 4))}
                          </span>
                          <span className="text-muted small ms-2" style={{ color: '#a0908a' }}>
                            ({product.reviews || 0})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="mb-3">
                          <span className="fw-bold" style={{ fontSize: '1.25rem', color: '#880e4f' }}>
                            ₹{product.price?.toLocaleString('en-IN')}
                          </span>
                          {product.oldPrice && (
                            <small className="text-muted text-decoration-line-through ms-2" style={{ color: '#b5a69e' }}>
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
                                fontSize: '0.8rem',
                                padding: '0.6rem 0',
                                transition: 'all 0.3s ease'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                            >
                              <FiShoppingCart className="me-1" size={14} /> Add to Cart
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-grow-1 rounded-pill fw-semibold text-white border-0"
                              style={{ 
                                background: 'linear-gradient(135deg, #c2185b, #880e4f)',
                                fontSize: '0.8rem',
                                padding: '0.6rem 0',
                                transition: 'all 0.3s ease'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/product/${product.id}`);
                              }}
                            >
                              <FiZap className="me-1" size={14} /> Buy Now
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {/* View All Button */}
            <div className="text-center mt-5">
              <Button 
                variant="outline-dark" 
                size="lg" 
                className="px-5 rounded-pill fw-semibold"
                style={{ 
                  borderColor: '#d4af37',
                  color: '#880e4f',
                  padding: '0.75rem 2.5rem',
                  transition: 'all 0.3s ease'
                }}
              >
                View All Products →
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Custom Styles */}
      <style>{`
        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important;
        }
        .product-card:hover .product-image {
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
}
