import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Unauthorized.css';

export default function Unauthorized() {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">⛔</div>
        <h1>Access Denied</h1>
        <p className="unauthorized-subtitle">
          You don't have permission to access this page.
        </p>
        
        <div className="unauthorized-info">
          <p>
            <strong>Current Role:</strong> <span className="role-badge">{user?.role.toUpperCase()}</span>
          </p>
          <p className="unauthorized-message">
            {user?.role === 'guard' 
              ? 'Guards can only access the Dashboard and Verify Guardian pages.' 
              : 'Please contact an administrator if you need access to additional features.'}
          </p>
        </div>

        <div className="unauthorized-actions">
          <Link to={user?.role === 'guard' ? '/verify' : '/admin'} className="btn btn-primary">
            Go to Dashboard
          </Link>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
