import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, setDoc, arrayUnion, arrayRemove, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Row, Col, Spinner, Button, Card, Form, Collapse } from 'react-bootstrap';
import { FiShoppingCart, FiHeart, FiZap, FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProductImageSrc } from '../utils/imageHelper';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = ['All', 'Women', 'Men', 'Kids', 'Accessories'];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [user]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategory, sortBy]);

  const loadProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    if (!user) return;
    try {
      const snap = await getDoc(doc(db, 'wishlists', user.uid));
      setWishlistIds(snap.data()?.ids || []);
    } catch (error) {
      console.error(error);
    }
  };

  const filterAndSortProducts = () => {
    let result = [...products];

    if (searchQuery.trim()) {
      result = result.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
      default:
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
    }

    setFilteredProducts(result);
  };

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

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('name');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '2.5rem', height: '2.5rem' }} />
          <p className="mt-3 text-muted small">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 py-md-4">
      {/* Header */}
      <div className="mb-3 mb-md-4">
        <h2 className="fw-bold mb-1" style={{ fontSize: '1.25rem', color: '#880e4f' }}>
          Our Collection
        </h2>
        <p className="text-muted mb-0 small">Discover our handpicked styles</p>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="d-md-none mb-3">
        <Button 
          variant="light" 
          className="w-100 d-flex align-items-center justify-content-between"
          onClick={() => setShowFilters(!showFilters)}
          style={{ 
            borderRadius: '10px', 
            border: '1px solid #e8d5ce',
            padding: '0.75rem 1rem'
          }}
        >
          <span className="d-flex align-items-center gap-2">
            <FiFilter /> Filters & Sort
          </span>
          {showFilters ? <FiChevronUp /> : <FiChevronDown />}
        </Button>
      </div>

      {/* Filters - Desktop: always visible, Mobile: collapsible */}
      <Card className="border-0 shadow-sm mb-3 mb-md-4 d-none d-md-block">
        <Card.Body className="p-3">
          <Row className="g-2 align-items-center">
            <Col md={4}>
              <div className="position-relative">
                <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" style={{ fontSize: '0.9rem' }} />
                <Form.Control
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="ps-5"
                  style={{ borderRadius: '8px', border: '1px solid #e8d5ce', fontSize: '0.9rem' }}
                  size="sm"
                />
                {searchQuery && (
                  <Button
                    variant="link"
                    className="position-absolute top-50 end-0 translate-middle-y me-2 p-0"
                    onClick={() => setSearchQuery('')}
                    style={{ fontSize: '0.8rem' }}
                  >
                    <FiX size={16} />
                  </Button>
                )}
              </div>
            </Col>
            <Col md={3}>
              <Form.Select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                style={{ borderRadius: '8px', border: '1px solid #e8d5ce', fontSize: '0.9rem' }}
                size="sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ borderRadius: '8px', border: '1px solid #e8d5ce', fontSize: '0.9rem' }}
                size="sm"
              >
                <option value="name">Sort by: Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={clearFilters}
                style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                size="sm"
              >
                <FiFilter className="me-1" size={14} /> Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Mobile Filters */}
      <Collapse in={showFilters} className="d-md-none mb-3">
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-3">
            <Row className="g-2">
              <Col xs={12}>
                <div className="position-relative mb-2">
                  <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" style={{ fontSize: '0.9rem' }} />
                  <Form.Control
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="ps-5"
                    style={{ borderRadius: '8px', border: '1px solid #e8d5ce', fontSize: '0.9rem' }}
                  />
                  {searchQuery && (
                    <Button
                      variant="link"
                      className="position-absolute top-50 end-0 translate-middle-y me-2 p-0"
                      onClick={() => setSearchQuery('')}
                    >
                      <FiX size={16} />
                    </Button>
                  )}
                </div>
              </Col>
              <Col xs={12} className="mb-2">
                <Form.Select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  style={{ borderRadius: '8px', border: '1px solid #e8d5ce', fontSize: '0.9rem' }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} className="mb-2">
                <Form.Select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  style={{ borderRadius: '8px', border: '1px solid #e8d5ce', fontSize: '0.9rem' }}
                >
                  <option value="name">Sort by: Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </Form.Select>
              </Col>
              <Col xs={12}>
                <Button 
                  variant="outline-secondary" 
                  className="w-100"
                  onClick={clearFilters}
                  style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                >
                  <FiFilter className="me-1" size={14} /> Clear Filters
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Collapse>

      {/* Results Count */}
      <div className="mb-2 mb-md-3">
        <p className="text-muted mb-0 small">
          Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
        </p>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <div style={{ fontSize: '3rem' }}>👗</div>
            <h4 className="fw-bold mt-3 mb-2" style={{ fontSize: '1.25rem' }}>No products found</h4>
            <p className="text-muted mb-3 small">
              {searchQuery || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filter criteria'
                : 'No products available yet.'}
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <Button variant="outline-primary" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row xs={2} sm={2} md={3} lg={4} className="g-2 g-md-3">
          {filteredProducts.map(product => {
            const discount = product.oldPrice 
              ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
              : 0;
            const isInWishlist = wishlistIds.includes(product.id);
            
            return (
              <Col key={product.id}>
                <Card 
                  className="h-100 border-0 shadow-sm product-card" 
                  style={{ 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    border: '1px solid #f0e8e4',
                    cursor: 'pointer',
                    background: '#ffffff'
                  }}
                  onClick={() => navigate(`/product/${product.id}`)}
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
                        padding: '0.75rem',
                        backgroundColor: '#faf6f3',
                        transition: 'transform 0.3s ease'
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
                      variant={isInWishlist ? 'danger' : 'light'}
                      size="sm"
                      className="position-absolute top-0 end-0 m-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0 border-0"
                      style={{ 
                        width: '36px', 
                        height: '36px', 
                        background: isInWishlist ? '#dc3545' : 'white',
                        color: isInWishlist ? 'white' : '#880e4f',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.2s ease',
                        zIndex: 2
                      }}
                      onClick={(e) => toggleWishlist(e, product.id)}
                    >
                      <FiHeart size={16} fill={isInWishlist ? 'white' : 'none'} />
                    </Button>
                  </div>

                  {/* Card Body */}
                  <Card.Body className="d-flex flex-column p-2 p-md-3">
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
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                          }}
                        >
                          <FiZap className="me-1" size={12} /> Buy
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Custom Styles */}
      <style>{`
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.08) !important;
        }
        .product-card:hover .product-image {
          transform: scale(1.03);
        }
        .product-card {
          transition: all 0.2s ease;
        }
        .product-image {
          transition: transform 0.3s ease;
        }
        @media (max-width: 576px) {
          .product-card:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
