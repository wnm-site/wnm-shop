import { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Form, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getErrorMessage = (error) => {
    if (error.code === 'auth/operation-not-allowed') {
      return 'Email/password sign-in is disabled. Please contact support.';
    }
    if (error.code === 'auth/user-not-found') {
      return 'No account found with this email.';
    }
    if (error.code === 'auth/wrong-password') {
      return 'Incorrect password.';
    }
    return error.message || 'Login failed';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <Card className="p-4 shadow">
          <h2 className="text-center mb-4">Login</h2>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" required value={email} onChange={e => setEmail(e.target.value)} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" required value={password} onChange={e => setPassword(e.target.value)} /></Form.Group>
            <Button type="submit" variant="dark" className="w-100" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
          </Form>
          <p className="text-center mt-3">Don't have an account? <Link to="/register">Register</Link></p>
        </Card>
      </div>
    </div>
  );
}