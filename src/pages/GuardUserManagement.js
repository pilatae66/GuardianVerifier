import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGuardUsers, addGuardUser, deleteGuardUser, updateGuardUser } from '../services/userService';
import './UserManagement.css';

export default function GuardUserManagement() {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newContactNumber, setNewContactNumber] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const guardUsers = getGuardUsers();
      setUsers(guardUsers);
    } catch (error) {
      showMessage('Error loading users: ' + error.message, 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    
    if (!newUsername.trim()) {
      showMessage('Username is required', 'error');
      return;
    }
    
    if (!newPassword.trim()) {
      showMessage('Password is required', 'error');
      return;
    }

    if (!newFirstName.trim()) {
      showMessage('First name is required', 'error');
      return;
    }

    if (!newLastName.trim()) {
      showMessage('Last name is required', 'error');
      return;
    }

    if (!newContactNumber.trim()) {
      showMessage('Contact number is required', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      addGuardUser(newUsername, newPassword, newFirstName, newLastName, newContactNumber);
      loadUsers();
      setNewUsername('');
      setNewPassword('');
      setNewFirstName('');
      setNewLastName('');
      setNewContactNumber('');
      showMessage('Guard user added successfully', 'success');
    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
    }
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        deleteGuardUser(id);
        loadUsers();
        showMessage('User deleted successfully', 'success');
      } catch (error) {
        showMessage('Error deleting user: ' + error.message, 'error');
      }
    }
  };

  const handleEditStart = (user) => {
    setEditingId(user.id);
    setEditUsername(user.username);
    setEditPassword(user.password);
    setEditFirstName(user.firstName);
    setEditLastName(user.lastName);
    setEditContactNumber(user.contactNumber);
  };

  const handleEditSave = () => {
    if (!editUsername.trim()) {
      showMessage('Username is required', 'error');
      return;
    }
    
    if (!editPassword.trim()) {
      showMessage('Password is required', 'error');
      return;
    }

    if (!editFirstName.trim()) {
      showMessage('First name is required', 'error');
      return;
    }

    if (!editLastName.trim()) {
      showMessage('Last name is required', 'error');
      return;
    }

    if (!editContactNumber.trim()) {
      showMessage('Contact number is required', 'error');
      return;
    }

    try {
      updateGuardUser(editingId, editUsername, editPassword, editFirstName, editLastName, editContactNumber);
      loadUsers();
      setEditingId(null);
      showMessage('User updated successfully', 'success');
    } catch (error) {
      showMessage('Error updating user: ' + error.message, 'error');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  if (!hasRole('admin')) {
    return (
      <div className="management-container">
        <div className="error-message">
          <p>❌ Access Denied. Only admins can manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-container">
      <div className="management-card">
        <h1>👥 Guard User Management</h1>
        <p className="subtitle">Create and manage guard users</p>

        {message && (
          <div className={`message message-${messageType}`}>
            {messageType === 'success' ? '✓' : '✕'} {message}
          </div>
        )}

        <form onSubmit={handleAddUser} className="management-form">
          <h2>Add New Guard User</h2>
          
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={newFirstName}
              onChange={(e) => setNewFirstName(e.target.value)}
              placeholder="Enter first name"
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={newLastName}
              onChange={(e) => setNewLastName(e.target.value)}
              placeholder="Enter last name"
            />
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="tel"
              value={newContactNumber}
              onChange={(e) => setNewContactNumber(e.target.value)}
              placeholder="Enter contact number"
            />
          </div>

          <div className="form-group">
            <label>Username (will also be used for login)</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter password (min 6 characters)"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            ➕ Add Guard User
          </button>
        </form>

        <div className="users-section">
          <h2>Existing Guard Users ({users.length})</h2>
          
          {users.length === 0 ? (
            <p className="no-users">No guard users found</p>
          ) : (
            <div className="users-table">
              {users.map((user) => (
                <div key={user.id} className="user-row">
                  {editingId === user.id ? (
                    <div className="user-edit-form">
                      <input
                        type="text"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        placeholder="First Name"
                      />
                      <input
                        type="text"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        placeholder="Last Name"
                      />
                      <input
                        type="tel"
                        value={editContactNumber}
                        onChange={(e) => setEditContactNumber(e.target.value)}
                        placeholder="Contact Number"
                      />
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="Username"
                      />
                      <input
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Password"
                      />
                      <button className="btn btn-small btn-success" onClick={handleEditSave}>
                        Save
                      </button>
                      <button className="btn btn-small btn-secondary" onClick={handleEditCancel}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="user-info">
                      <div className="user-details">
                        <strong>👥 {user.firstName} {user.lastName}</strong>
                        <span className="role-badge guard-badge">Guard</span>
                        <p className="user-contact">📞 {user.contactNumber}</p>
                        <span className="created-date">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="user-actions">
                        <button 
                          className="btn btn-small btn-warning"
                          onClick={() => handleEditStart(user)}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn btn-small btn-danger"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="info-box">
          <h3>ℹ️ How It Works</h3>
          <ul>
            <li>Each guard user needs a unique username</li>
            <li>Users login with their username (username must match selected role)</li>
            <li>All fields (first name, last name, contact number, username, password) are required</li>
            <li>Passwords must be at least 6 characters</li>
            <li>You can edit or delete existing users anytime</li>
            <li>Changes take effect immediately on the next login</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
