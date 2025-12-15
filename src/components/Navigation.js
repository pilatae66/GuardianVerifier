import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showManagementMenu, setShowManagementMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = hasRole('admin');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🛡️</span>
          Guardian Verification System
        </Link>
        <ul className="nav-menu">
          {isAdmin && (
            <li className="nav-item">
              <Link
                to="/admin"
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
            </li>
          )}
          {isAdmin && (
            <li className="nav-item dropdown-item">
              <button 
                className={`nav-link dropdown-toggle ${showManagementMenu ? 'open' : ''}`}
                onClick={() => {
                  setShowManagementMenu(!showManagementMenu);
                  setShowUserMenu(false);
                }}
              >
                ⚙️ Manage Users
                <span className={`dropdown-arrow-small ${showManagementMenu ? 'open' : ''}`}>▼</span>
              </button>
              
              {showManagementMenu && (
                <div className="management-dropdown">
                  <Link 
                    to="/manage-admins"
                    className="dropdown-link"
                    onClick={() => setShowManagementMenu(false)}
                  >
                    👤 Admin Users
                  </Link>
                  <Link 
                    to="/manage-guards"
                    className="dropdown-link"
                    onClick={() => setShowManagementMenu(false)}
                  >
                    👥 Guard Users
                  </Link>
                  <Link 
                    to="/register-guardian"
                    className="dropdown-link"
                    onClick={() => setShowManagementMenu(false)}
                  >
                    ➕ Register Guardian
                  </Link>
                  <Link 
                    to="/register-student"
                    className="dropdown-link"
                    onClick={() => setShowManagementMenu(false)}
                  >
                    ➕ Register Student
                  </Link>
                </div>
              )}
            </li>
          )}
          {!isAdmin && (
            <li className="nav-item">
              <Link
                to="/verify"
                className={`nav-link ${isActive('/verify') ? 'active' : ''}`}
              >
                Verify Guardian
              </Link>
            </li>
          )}
          <li className="nav-item">
            <Link
              to="/logs"
              className={`nav-link ${isActive('/logs') ? 'active' : ''}`}
            >
              Logs
            </Link>
          </li>
        </ul>
        
        <div className="nav-user-section">
          <div className="user-info-dropdown">
            <button 
              className="user-button"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowManagementMenu(false);
              }}
            >
              <span className="user-avatar">👤</span>
              <span className="user-name">{user?.username}</span>
              <span className="user-role-badge" data-role={user?.role}>
                {user?.role.toUpperCase()}
              </span>
              <span className={`dropdown-arrow ${showUserMenu ? 'open' : ''}`}>▼</span>
            </button>
            
            {showUserMenu && (
              <div className="user-menu">
                <div className="menu-header">
                  <div className="menu-user-info">
                    <strong>{user?.username}</strong>
                    <span className="menu-role">{user?.role === 'admin' ? 'Administrator' : 'Guard'}</span>
                  </div>
                </div>
                <div className="menu-body">
                  <p className="menu-item-text">
                    <strong>Access Level:</strong><br/>
                    {user?.role === 'admin' 
                      ? '✓ All Features' 
                      : '✓ Dashboard & Verification Only'}
                  </p>
                </div>
                <button 
                  className="btn-logout"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
