import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';
import { Row, Col } from 'react-bootstrap';

export default function Footer() {
  return (
    <footer className="mt-auto">
      {/* Features Section */}
      <section className="py-4" style={{ backgroundColor: '#fdf6f0' }}>
        <div className="container">
          <Row className="text-center g-3">
            <Col md={3} sm={6}>
              <div className="p-3">
                <div className="mb-2" style={{ fontSize: '1.75rem' }}>🚚</div>
                <h6 className="fw-bold mb-1">Free Shipping</h6>
                <p className="text-muted small mb-0">On orders over ₹999</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="p-3">
                <div className="mb-2" style={{ fontSize: '1.75rem' }}>🔒</div>
                <h6 className="fw-bold mb-1">Secure Payment</h6>
                <p className="text-muted small mb-0">100% secure checkout</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="p-3">
                <div className="mb-2" style={{ fontSize: '1.75rem' }}>↩️</div>
                <h6 className="fw-bold mb-1">Easy Returns</h6>
                <p className="text-muted small mb-0">7 days return policy</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="p-3">
                <div className="mb-2" style={{ fontSize: '1.75rem' }}>🎁</div>
                <h6 className="fw-bold mb-1">Special Offers</h6>
                <p className="text-muted small mb-0">Exclusive deals daily</p>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="text-white pt-4 pb-3" style={{ backgroundColor: '#880e4f' }}>
        <div className="container">
          <div className="row g-4 mb-4">
            {/* Brand Column */}
            <Col lg={3} md={6}>
              <h3 className="fw-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Wear NXT Mode
              </h3>
              <p className="opacity-75 mb-3" style={{ fontSize: '0.9rem' }}>
                Premium Women's Fashion crafted with love. Discover elegance 
                in every stitch, designed for the modern woman.
              </p>
              <div className="d-flex gap-2 flex-wrap">
                <a href="#" className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <FiInstagram />
                </a>
                <a href="#" className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <FiFacebook />
                </a>
                <a href="#" className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <FiTwitter />
                </a>
                <a href="#" className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <FiYoutube />
                </a>
                <a href="#" className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <FaWhatsapp />
                </a>
                <a href="#" className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <FaTelegram />
                </a>
              </div>
            </Col>

            {/* Quick Links */}
            <Col lg={2} md={6}>
              <h6 className="fw-bold mb-3" style={{ color: '#d4af37' }}>Quick Links</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/" className="text-white text-decoration-none opacity-75" style={{ fontSize: '0.9rem' }}>Home</Link></li>
                <li className="mb-2"><Link to="/#collection" className="text-white text-decoration-none opacity-75" style={{ fontSize: '0.9rem' }}>Collection</Link></li>
                <li className="mb-2"><Link to="/#about" className="text-white text-decoration-none opacity-75" style={{ fontSize: '0.9rem' }}>About Us</Link></li>
                <li className="mb-2"><Link to="/#contact" className="text-white text-decoration-none opacity-75" style={{ fontSize: '0.9rem' }}>Contact</Link></li>
              </ul>
            </Col>

            {/* Customer Service */}
            <Col lg={3} md={6}>
              <h6 className="fw-bold mb-3" style={{ color: '#d4af37' }}>Customer Service</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/track-order" className="text-white text-decoration-none opacity-75" style={{ fontSize: '0.9rem' }}>Order Tracking</Link></li>
                <li className="mb-2"><a href="#" className="text-white text-decoration-none opacity-75" style={{ fontSize: '0.9rem' }}>Shipping Info</a></li>
                <li className="mb-2"><a href="#" className="text-white text-decoration-none opacity-75" style={{ fontSize: '0.9rem' }}>Returns & Refunds</a></li>
                <li className="mb-2"><a href="#" className="text-white text-decoration-none opacity-75" style={{ fontSize: '0.9rem' }}>FAQs</a></li>
              </ul>
            </Col>

            {/* My Account */}
            <Col lg={2} md={6}>
              <h6 className="fw-bold mb-3" style={{ color: '#d4af37' }}>My Account</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/dashboard" className="text-white text-decoration-none opacity-75" style={{ fontSize: '0.9rem' }}>Dashboard</Link></li>
                <li className="mb-2"><Link to="/orders" className="text-white text-decoration-none opacity-75" style={{ fontSize: '0.9rem' }}>My Orders</Link></li>
                <li className="mb-2"><Link to="/wishlist" className="text-white text-decoration-none opacity-75" style={{ fontSize: '0.9rem' }}>Wishlist</Link></li>
                <li className="mb-2"><Link to="/cart" className="text-white text-decoration-none opacity-75" style={{ fontSize: '0.9rem' }}>Shopping Cart</Link></li>
                <li className="mb-2"><Link to="/profile" className="text-white text-decoration-none opacity-75" style={{ fontSize: '0.9rem' }}>Profile</Link></li>
              </ul>
            </Col>

            {/* Contact Info */}
            <Col lg={2} md={6}>
              <h6 className="fw-bold mb-3" style={{ color: '#d4af37' }}>Get In Touch</h6>
              <ul className="list-unstyled">
                <li className="mb-2 d-flex align-items-start">
                  <FiMapPin className="me-2 mt-1 flex-shrink-0" style={{ color: '#d4af37', fontSize: '0.9rem' }} />
                  <span className="opacity-75" style={{ fontSize: '0.85rem' }}>Kolkata, West Bengal, India</span>
                </li>
                <li className="mb-2 d-flex align-items-center">
                  <FiPhone className="me-2 flex-shrink-0" style={{ color: '#d4af37', fontSize: '0.9rem' }} />
                  <a href="tel:+919876543210" className="text-white text-decoration-none opacity-75" style={{ fontSize: '0.85rem' }}>+91 6291305725</a>
                </li>
                <li className="mb-2 d-flex align-items-center">
                  <FiMail className="me-2 flex-shrink-0" style={{ color: '#d4af37', fontSize: '0.9rem' }} />
                  <a href="mailto:wearnxtmode@gmail.com" className="text-white text-decoration-none opacity-75" style={{ fontSize: '0.85rem' }}>wearnxtmode@gmail.com</a>
                </li>
              </ul>

              {/* Newsletter */}
              <div className="mt-3">
                <h6 className="fw-bold mb-2">Newsletter</h6>
                <div className="input-group input-group-sm">
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="Your email"
                    style={{ borderRadius: '20px 0 0 20px', border: 'none', fontSize: '0.85rem' }}
                  />
                  <button 
                    className="btn px-3"
                    style={{ 
                      backgroundColor: '#d4af37', 
                      color: 'white',
                      borderRadius: '0 20px 20px 0',
                      border: 'none'
                    }}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </Col>
          </div>

          {/* Payment Methods */}
          <div className="text-center py-3 border-top border-secondary">
            <p className="mb-2 small opacity-75">We Accept:</p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <span className="badge bg-white text-dark px-2 py-2" style={{ fontSize: '0.8rem' }}>💳 Visa</span>
              <span className="badge bg-white text-dark px-2 py-2" style={{ fontSize: '0.8rem' }}>💳 Mastercard</span>
              <span className="badge bg-white text-dark px-2 py-2" style={{ fontSize: '0.8rem' }}>💰 COD</span>
              <span className="badge bg-white text-dark px-2 py-2" style={{ fontSize: '0.8rem' }}>📱 UPI</span>
              <span className="badge bg-white text-dark px-2 py-2" style={{ fontSize: '0.8rem' }}>🏦 Net Banking</span>
            </div>
          </div>

          {/* Copyright */}
          <hr className="border-secondary my-3" />
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <p className="small mb-0 opacity-75">
                © 2026 Wear NXT Mode. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end mt-2 mt-md-0">
              <a href="#" className="text-white text-decoration-none small opacity-75 me-3">Privacy Policy</a>
              <a href="#" className="text-white text-decoration-none small opacity-75 me-3">Terms of Service</a>
              <a href="#" className="text-white text-decoration-none small opacity-75">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </footer>
  );
}
