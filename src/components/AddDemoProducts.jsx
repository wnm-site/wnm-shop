import { useState } from 'react';
import { addDemoProductsToFirestore } from '../utils/addDemoProducts';
import { Button, Alert } from 'react-bootstrap';

export default function AddDemoProducts() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAdd = async () => {
    setLoading(true);
    setMessage('');
    const success = await addDemoProductsToFirestore();
    setMessage(success ? '✅ Demo products added successfully!' : '❌ Failed to add products');
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h4>Add Demo Products</h4>
      <p className="text-muted">Click to add 8 sample products to your store</p>
      <Button variant="primary" onClick={handleAdd} disabled={loading}>
        {loading ? 'Adding...' : 'Add Demo Products'}
      </Button>
      {message && <Alert variant={message.includes('✅') ? 'success' : 'danger'} className="mt-3">{message}</Alert>}
    </div>
  );
}