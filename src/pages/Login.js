import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('guard');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!username.trim()) {
      setError('Please enter a username');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      if (login(username, password, role)) {
        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/verify');
        }
      } else {
        setError('Invalid credentials. Check username, password, and selected role.');
      }
      setLoading(false);
    }, 500);
  };

  const handleDemoLogin = (demoRole) => {
    setError('');
    setLoading(true);

    setTimeout(() => {
      const demoUsername = demoRole === 'admin' ? 'admin' : 'guard';
      const demoPassword = 'demo123';

      if (login(demoUsername, demoPassword, demoRole)) {
        // Redirect based on role
        if (demoRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/verify');
        }
      } else {
        setError('Demo login failed');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">🛡️</div>
            <h1>Guardian Verification System</h1>
            <p>Secure Access Portal</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">User Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="guard">Guard (Limited Access)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="login-divider">
            <span>or try demo accounts</span>
          </div>

          <div className="demo-buttons">
            <button
              type="button"
              className="btn btn-secondary demo-btn"
              onClick={() => handleDemoLogin('guard')}
              disabled={loading}
            >
              👮 Demo: Guard
            </button>
            <button
              type="button"
              className="btn btn-secondary demo-btn"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
            >
              👔 Demo: Admin
            </button>
          </div>

          <div className="login-footer">
            <div className="demo-credentials">
              <h4>Demo Credentials</h4>
              <div className="credential-item">
                <strong>Guard Account:</strong>
                <p>Username: guard | Password: demo123</p>
              </div>
              <div className="credential-item">
                <strong>Admin Account:</strong>
                <p>Username: admin | Password: demo123</p>
              </div>
            </div>

            <div className="role-info">
              <h4>Access Levels</h4>
              <div className="role-item">
                <strong>👮 Guard (Limited)</strong>
                <ul>
                  <li>✓ View Dashboard</li>
                  <li>✓ Verify Guardians</li>
                  <li>✗ Register Students</li>
                  <li>✗ Register Guardians</li>
                  <li>✗ View Logs</li>
                </ul>
              </div>
              <div className="role-item">
                <strong>👔 Admin (Full)</strong>
                <ul>
                  <li>✓ View Dashboard</li>
                  <li>✓ Verify Guardians</li>
                  <li>✓ Register Students</li>
                  <li>✓ Register Guardians</li>
                  <li>✓ View Logs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
