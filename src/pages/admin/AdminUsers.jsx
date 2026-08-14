import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth } from '../../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db } from '../../firebase';
import { Table, Button, Modal, Form, Badge, Card, Spinner, Alert } from 'react-bootstrap';
import { FiTrash2, FiShield, FiUser, FiMail, FiCalendar, FiPhone, FiEdit } from 'react-icons/fi';
import { FaUserFriends } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetting, setResetting] = useState(false);

  const loadUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleAdmin = async (user) => {
    try {
      await updateDoc(doc(db, 'users', user.id), { 
        isAdmin: !user.isAdmin,
        updatedAt: new Date()
      });
      toast.success(`${user.name} is now ${!user.isAdmin ? 'an Admin' : 'a User'}`);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditEmail(user.email || '');
  };

  const saveEmail = async (e) => {
    e.preventDefault();
    if (!editUser || !editEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', editUser.id), { 
        email: editEmail.trim().toLowerCase(),
        updatedAt: new Date()
      });
      toast.success('Email updated successfully! ✅');
      setEditUser(null);
      loadUsers();
    } catch (error) {
      console.error('Email update error:', error);
      toast.error('Failed to update email');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetTarget) return;

    setResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetTarget.email);
      toast.success(`Password reset email sent to ${resetTarget.email} 📧`);
      setResetTarget(null);
    } catch (error) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('No Firebase Auth account found for this email');
      } else {
        toast.error('Failed to send password reset email');
      }
    } finally {
      setResetting(false);
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) {
    return <div className="text-center py-5"><Spinner /></div>;
  }

  return (
    <div>
      <h2 className="fw-bold mb-4">
        <FaUserFriends className="me-2 text-primary" />
        Manage Users
      </h2>

      {users.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm">
          <Card.Body>
            <FiUser size={60} className="text-muted mb-3" />
            <h4>No Users Yet</h4>
            <p className="text-muted">Users will appear here once they register</p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div 
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                          style={{ width: '40px', height: '40px', fontSize: '16px' }}
                        >
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold">{user.name || 'Unknown'}</div>
                          <small className="text-muted">
                            {user.phone && <><FiPhone className="me-1" />{user.phone}</>}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <FiMail className="me-1 text-muted" />
                      {user.email}
                    </td>
                    <td>
                      {user.isAdmin ? (
                        <Badge bg="warning" text="dark">
                          <FiShield className="me-1" /> Admin
                        </Badge>
                      ) : (
                        <Badge bg="secondary">
                          <FiUser className="me-1" /> User
                        </Badge>
                      )}
                    </td>
                    <td>
                      <small>
                        <FiCalendar className="me-1" />
                        {user.createdAt?.seconds 
                          ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('en-IN')
                          : 'N/A'}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => openEdit(user)}
                          title="Edit email"
                        >
                          <FiEdit className="me-1" /> Email
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-warning"
                          onClick={() => setResetTarget(user)}
                          title="Send password reset email"
                        >
                          🔑 Reset
                        </Button>
                        <Button 
                          size="sm" 
                          variant={user.isAdmin ? 'outline-warning' : 'outline-info'}
                          onClick={() => toggleAdmin(user)}
                          title="Toggle admin role"
                        >
                          <FiShield className="me-1" />
                          {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => deleteUser(user.id, user.name)}
                          title="Delete user"
                        >
                          <FiTrash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Edit Email Modal */}
      <Modal show={!!editUser} onHide={() => setEditUser(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiEdit className="me-2" /> Edit User Email
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={saveEmail}>
          <Modal.Body>
            <Alert variant="info" className="small">
              This updates the email in the user profile. If the user has a Firebase Auth account, they may need to use the same email for login unless the Auth email is also updated.
            </Alert>
            <Form.Group>
              <Form.Label className="fw-bold">User Name</Form.Label>
              <Form.Control
                type="text"
                value={editUser?.name || ''}
                disabled
                className="bg-light"
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label className="fw-bold">Email Address *</Form.Label>
              <Form.Control
                type="email"
                required
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditUser(null)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FiMail className="me-2" />
                  Update Email
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal show={!!resetTarget} onHide={() => setResetTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-warning">
            🔑 Reset User Password
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {resetTarget && (
            <Alert variant="warning">
              <strong>⚠️ Password Reset</strong>
              <br /><br />
              This will send a password reset email to:
              <br />
              <strong>{resetTarget.email}</strong>
              <br /><br />
              The user will receive a link to set a new password.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setResetTarget(null)} disabled={resetting}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handlePasswordReset} disabled={resetting}>
            {resetting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Sending...
              </>
            ) : (
              <>
                <FiMail className="me-2" />
                Send Reset Email
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
