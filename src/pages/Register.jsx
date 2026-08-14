import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ADMIN_SECRET_KEY = 'WEARNXTMODE@ADMIN';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getErrorMessage = (error) => {
    if (error.code === 'auth/operation-not-allowed') {
      return 'Email/password sign-up is disabled. Please contact support.';
    }
    if (error.code === 'auth/email-already-in-use') {
      return 'This email is already registered. Try logging in.';
    }
    if (error.code === 'auth/weak-password') {
      return 'Password should be at least 6 characters.';
    }
    if (error.code === 'auth/invalid-email') {
      return 'Invalid email address.';
    }
    return error.message || 'Registration failed';
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (isAdmin && adminKey !== ADMIN_SECRET_KEY) {
      toast.error('Invalid admin secret key! ❌');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        name,
        email: email.toLowerCase().trim(),
        isAdmin: isAdmin && adminKey === ADMIN_SECRET_KEY,
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if (isAdmin && adminKey === ADMIN_SECRET_KEY) {
        toast.success('🎉 Admin account created successfully!');
      } else {
        toast.success('✅ Account created successfully!');
      }

      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <Card className="shadow border-0">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ 
                    width: '70px', 
                    height: '70px', 
                    backgroundColor: '#fce4ec',
                    color: '#c2185b',
                    fontSize: '2rem'
                  }}
                >
                  <FiUser />
                </div>
                <h2 className="fw-bold mb-1">Create Account</h2>
                <p className="text-muted small">Join Wear NXT Mode today</p>
              </div>

              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-500">
                    <FiUser className="me-2" />Full Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-500">
                    <FiMail className="me-2" />Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-500">
                    <FiLock className="me-2" />Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    required
                    minLength="6"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="isAdmin"
                    label={
                      <span>
                        <FiShield className="me-1" /> Register as Admin
                      </span>
                    }
                    checked={isAdmin}
                    onChange={e => setIsAdmin(e.target.checked)}
                  />
                </Form.Group>

                {isAdmin && (
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-500 text-warning">
                      <FiShield className="me-2" />Admin Secret Key
                    </Form.Label>
                    <Form.Control
                      type="password"
                      required={isAdmin}
                      placeholder="Enter admin secret key"
                      value={adminKey}
                      onChange={e => setAdminKey(e.target.value)}
                      className="py-2 border-warning"
                    />
                    <Form.Text className="text-muted">
                      🔒 Required for admin registration
                    </Form.Text>
                  </Form.Group>
                )}

                <Button
                  type="submit"
                  className="w-100 py-2 mt-2"
                  disabled={loading}
                  style={{
                    backgroundColor: isAdmin ? '#d4af37' : '#c2185b',
                    borderColor: isAdmin ? '#d4af37' : '#c2185b'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Creating Account...
                    </>
                  ) : isAdmin ? (
                    <>
                      <FiShield className="me-2" />
                      Create Admin Account
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <p className="mb-0 text-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#c2185b' }}>
                    Login here
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>

          <div className="text-center mt-3">
            <small className="text-muted">
              🔒 Your data is secure and encrypted
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
