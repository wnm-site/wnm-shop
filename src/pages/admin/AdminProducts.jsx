import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Table, Button, Modal, Form, Spinner, Card, Row, Col, Badge, Alert } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiImage, FiStar, FiX } from 'react-icons/fi';
import { FaBox } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { compressMultipleImages, isBase64TooLarge, getProductImageSrc } from '../../utils/imageHelper';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const AVAILABLE_COLORS = [
  { name: 'Black', code: '#000000' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Red', code: '#FF0000' },
  { name: 'Blue', code: '#0000FF' },
  { name: 'Green', code: '#00FF00' },
  { name: 'Yellow', code: '#FFFF00' },
  { name: 'Pink', code: '#FFC0CB' },
  { name: 'Purple', code: '#800080' },
  { name: 'Orange', code: '#FFA500' },
  { name: 'Brown', code: '#8B4513' },
  { name: 'Grey', code: '#808080' },
  { name: 'Gold', code: '#FFD700' }
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    oldPrice: 0,
    rating: 4.5,
    reviews: 0,
    images: [],  // Array of base64 images
    sizes: [],   // Array of selected sizes
    colors: [],  // Array of selected colors
    category: 'Casual'
  });
  const [previews, setPreviews] = useState([]);
  const [customColor, setCustomColor] = useState({ name: '', code: '#000000' });

  const loadProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Handle Multiple Image Upload
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (files.length + form.images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select only image files');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB`);
        return;
      }
    }

    setProcessing(true);
    try {
      // Show previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);

      toast.loading(`Compressing ${files.length} image(s)...`, { id: 'img' });
      
      // Compress all images
      const compressedImages = await compressMultipleImages(files, 600, 0.6);
      
      setForm({ ...form, images: [...form.images, ...compressedImages] });
      toast.success(`✅ ${compressedImages.length} image(s) ready!`, { id: 'img' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to process images');
    } finally {
      setProcessing(false);
    }
  };

  const removeImage = (index) => {
    const newImages = form.images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setForm({ ...form, images: newImages });
    setPreviews(newPreviews);
  };

  // Handle Size Selection
  const toggleSize = (size) => {
    const sizes = form.sizes.includes(size)
      ? form.sizes.filter(s => s !== size)
      : [...form.sizes, size];
    setForm({ ...form, sizes });
  };

  // Handle Color Selection
  const toggleColor = (color) => {
    const colors = form.colors.find(c => c.name === color.name)
      ? form.colors.filter(c => c.name !== color.name)
      : [...form.colors, color];
    setForm({ ...form, colors });
  };

  const addCustomColor = () => {
    if (!customColor.name.trim()) {
      toast.error('Please enter color name');
      return;
    }
    if (form.colors.find(c => c.name.toLowerCase() === customColor.name.toLowerCase())) {
      toast.error('Color already added');
      return;
    }
    setForm({ ...form, colors: [...form.colors, customColor] });
    setCustomColor({ name: '', code: '#000000' });
  };

  const removeColor = (colorName) => {
    setForm({ ...form, colors: form.colors.filter(c => c.name !== colorName) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.description || !form.price) {
      toast.error('Please fill all required fields');
      return;
    }

    if (form.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    if (form.sizes.length === 0) {
      toast.error('Please select at least one size');
      return;
    }

    if (form.colors.length === 0) {
      toast.error('Please select at least one color');
      return;
    }

    setProcessing(true);
    try {
      const productData = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        oldPrice: Number(form.oldPrice) || 0,
        rating: Number(form.rating) || 4.5,
        reviews: Number(form.reviews) || 0,
        images: form.images,
        sizes: form.sizes,
        colors: form.colors,
        category: form.category,
        updatedAt: new Date()
      };

      if (editId) {
        await updateDoc(doc(db, 'products', editId), productData);
        toast.success('Product updated! ✅');
      } else {
        productData.createdAt = new Date();
        await addDoc(collection(db, 'products'), productData);
        toast.success('Product added! ✅');
      }

      setShow(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Save error:', error);
      if (error.message.includes('too big')) {
        toast.error('Document too large. Use fewer or smaller images.');
      } else {
        toast.error('Failed to save product');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Deleted!');
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (product) => {
    setForm({
      ...product,
      images: product.images || [],
      sizes: product.sizes || [],
      colors: product.colors || []
    });
    setEditId(product.id);
    setPreviews(product.images || []);
    setShow(true);
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: 0,
      oldPrice: 0,
      rating: 4.5,
      reviews: 0,
      images: [],
      sizes: [],
      colors: [],
      category: 'Casual'
    });
    setPreviews([]);
    setEditId(null);
  };

  if (loading) {
    return <div className="text-center py-5"><Spinner /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold mb-0">
          <FaBox className="me-2 text-primary" />
          Manage Products
        </h2>
        <Button variant="primary" onClick={() => { resetForm(); setShow(true); }}>
          <FiPlus className="me-2" /> Add Product
        </Button>
      </div>

      <Alert variant="info">
        💡 <strong>Features:</strong> Multiple images, size selection, color selection with custom colors
      </Alert>

      {products.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FiImage size={60} className="text-muted mb-3" />
            <h4>No Products</h4>
            <p className="text-muted">Click "Add Product" to start</p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {products.map(product => (
            <Col key={product.id} md={4} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <div className="position-relative">
                  <Card.Img
                    variant="top"
                    src={getProductImageSrc(product)}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <Badge bg="warning" className="position-absolute top-0 start-0 m-2">
                    {product.category}
                  </Badge>
                  {product.images?.length > 1 && (
                    <Badge bg="dark" className="position-absolute top-0 end-0 m-2">
                      {product.images.length} images
                    </Badge>
                  )}
                </div>
                <Card.Body>
                  <Card.Title className="fw-bold">{product.name}</Card.Title>
                  <p className="text-muted small" style={{ height: '40px', overflow: 'hidden' }}>
                    {product.description?.substring(0, 80)}...
                  </p>
                  
                  <div className="mb-2">
                    <small className="text-muted">Sizes: </small>
                    {product.sizes?.slice(0, 3).map(s => (
                      <Badge key={s} bg="light" text="dark" className="me-1">{s}</Badge>
                    ))}
                    {product.sizes?.length > 3 && (
                      <Badge bg="light" text="dark">+{product.sizes.length - 3}</Badge>
                    )}
                  </div>

                  <div className="mb-2">
                    <small className="text-muted">Colors: </small>
                    {product.colors?.slice(0, 4).map(c => (
                      <span
                        key={c.name}
                        title={c.name}
                        style={{
                          display: 'inline-block',
                          width: '20px',
                          height: '20px',
                          backgroundColor: c.code,
                          borderRadius: '50%',
                          border: '2px solid #ddd',
                          marginRight: '4px'
                        }}
                      />
                    ))}
                  </div>

                  <div className="mb-3">
                    <strong className="text-danger fs-5">₹{product.price?.toLocaleString('en-IN')}</strong>
                    {product.oldPrice > 0 && (
                      <small className="text-muted text-decoration-line-through ms-2">
                        ₹{product.oldPrice?.toLocaleString('en-IN')}
                      </small>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="flex-grow-1"
                      onClick={() => openEdit(product)}
                    >
                      <FiEdit2 className="me-1" /> Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal */}
      <Modal show={show} onHide={() => setShow(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            {editId ? 'Edit' : 'Add'} Product
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              {/* Images Section */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <FiUpload className="me-1" /> Product Images (Max 5)
                  </Form.Label>
                  <div className="border rounded p-3 bg-light">
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {previews.map((preview, idx) => (
                        <div key={idx} className="position-relative">
                          <img
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            className="rounded"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 p-1"
                            style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                            onClick={() => removeImage(idx)}
                            disabled={processing}
                          >
                            <FiX size={12} />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      disabled={processing || previews.length >= 5}
                    />
                    <Form.Text className="text-muted d-block mt-2">
                      {processing ? 'Processing...' : `Select multiple images (${previews.length}/5)`}
                    </Form.Text>
                    {processing && <Spinner animation="border" size="sm" className="mt-2" />}
                  </div>
                </Form.Group>

                {/* Sizes Section */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Available Sizes *</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {AVAILABLE_SIZES.map(size => (
                      <Form.Check
                        key={size}
                        type="checkbox"
                        id={`size-${size}`}
                        label={size}
                        checked={form.sizes.includes(size)}
                        onChange={() => toggleSize(size)}
                        disabled={processing}
                        className="me-3"
                      />
                    ))}
                  </div>
                  <Form.Text className="text-muted">
                    Selected: {form.sizes.length > 0 ? form.sizes.join(', ') : 'None'}
                  </Form.Text>
                </Form.Group>
              </Col>

              {/* Details Section */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Product Name *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    disabled={processing}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Category</Form.Label>
                  <Form.Select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    disabled={processing}
                  >
                    <option value="Casual">Casual</option>
                    <option value="Party Wear">Party Wear</option>
                    <option value="Evening Wear">Evening Wear</option>
                    <option value="Bridal">Bridal</option>
                    <option value="Formal">Formal</option>
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Price (₹) *</Form.Label>
                      <Form.Control
                        type="number"
                        required
                        min="0"
                        value={form.price}
                        onChange={e => setForm({ ...form, price: e.target.value })}
                        disabled={processing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Old Price (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={form.oldPrice}
                        onChange={e => setForm({ ...form, oldPrice: e.target.value })}
                        disabled={processing}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Rating</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={form.rating}
                        onChange={e => setForm({ ...form, rating: e.target.value })}
                        disabled={processing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Reviews</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={form.reviews}
                        onChange={e => setForm({ ...form, reviews: e.target.value })}
                        disabled={processing}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* Colors Section */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Available Colors *</Form.Label>
              
              {/* Selected Colors Display */}
              {form.colors.length > 0 && (
                <div className="mb-3 p-2 bg-light rounded">
                  <small className="text-muted d-block mb-2">Selected Colors:</small>
                  <div className="d-flex flex-wrap gap-2">
                    {form.colors.map(color => (
                      <Badge
                        key={color.name}
                        bg="light"
                        text="dark"
                        className="d-flex align-items-center gap-2 px-3 py-2"
                        style={{ border: '2px solid #ddd' }}
                      >
                        <span
                          style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: color.code,
                            borderRadius: '50%',
                            border: '1px solid #ccc'
                          }}
                        />
                        {color.name}
                        <FiX
                          className="ms-2"
                          style={{ cursor: 'pointer' }}
                          onClick={() => removeColor(color.name)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Predefined Colors */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                {AVAILABLE_COLORS.map(color => (
                  <Button
                    key={color.name}
                    variant={form.colors.find(c => c.name === color.name) ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => toggleColor(color)}
                    disabled={processing}
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

              {/* Custom Color */}
              <div className="d-flex gap-2 align-items-end">
                <div className="flex-grow-1">
                  <Form.Label className="small">Custom Color Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Navy Blue"
                    value={customColor.name}
                    onChange={e => setCustomColor({ ...customColor, name: e.target.value })}
                    disabled={processing}
                  />
                </div>
                <div>
                  <Form.Label className="small">Color</Form.Label>
                  <Form.Control
                    type="color"
                    value={customColor.code}
                    onChange={e => setCustomColor({ ...customColor, code: e.target.value })}
                    disabled={processing}
                    style={{ width: '60px', height: '38px' }}
                  />
                </div>
                <Button
                  variant="success"
                  onClick={addCustomColor}
                  disabled={processing}
                >
                  <FiPlus /> Add
                </Button>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows="3"
                required
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                disabled={processing}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)} disabled={processing}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={processing}>
              {processing ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FiUpload className="me-2" />
                  {editId ? 'Update' : 'Add'} Product
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}