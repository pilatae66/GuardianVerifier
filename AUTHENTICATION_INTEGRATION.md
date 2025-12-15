# Integration Guide: Adding Authentication to Your App

## How Authentication Was Integrated

This guide explains how the authentication system was integrated into the Guardian Verification System and can be adapted for other React/Electron applications.

## Step 1: Create AuthContext

The AuthContext provides centralized authentication state management.

**Location:** `src/context/AuthContext.js`

**Core Responsibilities:**
- Store current user information
- Manage login/logout operations
- Verify user roles
- Persist sessions to localStorage
- Provide useAuth hook for components

**Key Methods:**
```javascript
// Access authentication in any component
const { user, login, logout, isAuthenticated, hasRole } = useAuth();
```

## Step 2: Create ProtectedRoute Component

ProtectedRoute wraps sensitive routes and enforces access control.

**Location:** `src/components/ProtectedRoute.js`

**Usage:**
```javascript
<Route 
  path="/admin" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <Navigation />
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

**Behavior:**
- If user not authenticated → redirect to /login
- If user lacks required role → redirect to /unauthorized
- Otherwise → render children with Navigation

## Step 3: Create Login Page

The Login page provides user interface for authentication.

**Location:** `src/pages/Login.js`

**Features:**
- Username and password input
- Role selection
- Demo account buttons
- Form validation
- Error message display
- Credential reference guide

**Integration:**
```javascript
// In your login handler
const { login } = useAuth();
const navigate = useNavigate();

const handleLogin = (username, password, role) => {
  if (login(username, password, role)) {
    // Redirect based on role
    navigate(role === 'admin' ? '/admin' : '/verify');
  }
};
```

## Step 4: Wrap App with AuthProvider

The AuthProvider makes authentication available to all components.

**Location:** `src/App.js`

**Required Change:**
```javascript
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* All routes here have access to useAuth */}
      </AuthProvider>
    </Router>
  );
}
```

## Step 5: Configure Protected Routes

Set up routes with appropriate access controls.

**In App.js:**
```javascript
// Admin only
<Route 
  path="/admin" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <Navigation />
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>

// Guard and Admin
<Route 
  path="/verify" 
  element={
    <ProtectedRoute allowedRoles={['guard', 'admin']}>
      <Navigation />
      <GuardVerification />
    </ProtectedRoute>
  } 
/>

// Public routes (no protection)
<Route path="/login" element={<Login />} />
<Route path="/unauthorized" element={<Unauthorized />} />
```

## Step 6: Update Navigation

The Navigation component now shows user info and logout button.

**Key Changes:**
```javascript
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const { user, logout, hasRole } = useAuth();
  
  // Show/hide menu items based on role
  const isAdmin = hasRole('admin');
  
  return (
    <nav>
      {/* Menu items */}
      {isAdmin && <Link to="/register-guardian">Register Guardian</Link>}
      
      {/* User menu with logout */}
      <UserDropdown user={user} onLogout={logout} />
    </nav>
  );
}
```

## Using Authentication in Components

### Check if User is Logged In
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated()) {
    return <p>Please log in</p>;
  }
  
  return <p>Welcome, you are logged in</p>;
}
```

### Display User Information
```javascript
function UserProfile() {
  const { user } = useAuth();
  
  return (
    <div>
      <p>Username: {user?.username}</p>
      <p>Role: {user?.role}</p>
      <p>Logged in: {user?.loginTime}</p>
    </div>
  );
}
```

### Check User Role
```javascript
function AdminPanel() {
  const { hasRole, hasAnyRole } = useAuth();
  
  // Single role
  if (!hasRole('admin')) {
    return <p>Admin access required</p>;
  }
  
  // Multiple roles
  if (!hasAnyRole(['admin', 'moderator'])) {
    return <p>Insufficient permissions</p>;
  }
  
  return <p>Admin panel content</p>;
}
```

### Handle Logout
```javascript
function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout(); // Clear user and localStorage
    navigate('/login');
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ App.js                                               │
│ ├─ AuthProvider                                     │
│ │  └─ AuthContext                                  │
│ │     ├─ user (state)                             │
│ │     ├─ login()                                  │
│ │     ├─ logout()                                 │
│ │     └─ hasRole()                                │
│ │                                                 │
│ └─ Routes                                          │
│    ├─ /login → Login (public)                     │
│    ├─ /admin → ProtectedRoute                     │
│    │           └─ AdminDashboard (admin only)    │
│    └─ /verify → ProtectedRoute                    │
│                 └─ GuardVerification (all roles)  │
└─────────────────────────────────────────────────────┘

User opens app
    ↓
AuthContext loads localStorage
    ↓
If user found in storage → auto-login
    ↓
Route protection checks:
- Is user authenticated?
- Does user have required role?
    ↓
If all checks pass → render protected component
    ↓
If checks fail → redirect appropriately
```

## LocalStorage Structure

The authentication system stores minimal user data in localStorage:

```javascript
// Stored as JSON under key 'currentUser'
{
  "username": "admin",
  "role": "admin",
  "loginTime": "2024-01-15T10:30:00.000Z"
}
```

## Session Lifecycle

### Login
1. User submits form on Login page
2. `login()` called with username, password, role
3. User object created and stored in state
4. User object serialized and stored in localStorage
5. User redirected to appropriate page

### Auto-Login (On Page Refresh)
1. AuthProvider mounts
2. Checks localStorage for 'currentUser'
3. If found, parses and sets as current user
4. Components automatically have access via useAuth

### Logout
1. Logout button clicked
2. `logout()` called
3. User state cleared
4. localStorage 'currentUser' deleted
5. User redirected to /login

## File Organization

```
Guardian Verification System/
├── src/
│   ├── context/
│   │   └── AuthContext.js              ← Central auth state
│   │
│   ├── components/
│   │   ├── ProtectedRoute.js           ← Route guard
│   │   ├── Navigation.js               ← Updated with user menu
│   │   └── Navigation.css              ← User menu styling
│   │
│   ├── pages/
│   │   ├── Login.js                    ← Login interface
│   │   ├── Login.css                   ← Login styling
│   │   ├── Unauthorized.js             ← Access denied page
│   │   ├── Unauthorized.css            ← Unauthorized styling
│   │   └── [other pages]/
│   │
│   ├── App.js                          ← Updated with AuthProvider
│   └── index.js
│
└── [other files]/
```

## Adding New Protected Pages

To add a new protected page:

### 1. Create the page component
```javascript
// src/pages/NewFeature.js
export default function NewFeature() {
  const { user } = useAuth();
  return <div>New Feature Page</div>;
}
```

### 2. Add route with protection
```javascript
// In App.js
<Route 
  path="/new-feature" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <Navigation />
      <NewFeature />
    </ProtectedRoute>
  } 
/>
```

### 3. Add to navigation menu
```javascript
// In Navigation.js
{isAdmin && (
  <li className="nav-item">
    <Link to="/new-feature">New Feature</Link>
  </li>
)}
```

## Environment Variables

The current implementation uses hardcoded demo credentials. For production, add to `.env.example`:

```
REACT_APP_AUTH_BACKEND=https://your-api.com
REACT_APP_SESSION_TIMEOUT=3600
REACT_APP_TOKEN_REFRESH_INTERVAL=300
```

## Debugging Authentication Issues

### User not staying logged in after refresh
1. Check if AuthProvider is in App.js
2. Verify localStorage is enabled in browser
3. Check browser console for errors

### Redirect loop on protected routes
1. Verify ProtectedRoute is correctly imported
2. Check allowedRoles matches user role
3. Verify useAuth is called inside AuthProvider context

### User menu not showing
1. Check Navigation is inside ProtectedRoute
2. Verify useAuth hook is called
3. Check CSS is properly imported

### Demo buttons not working
1. Verify Login.js is on /login route
2. Check login() function is called correctly
3. Verify navigate() is redirecting to correct path

## Testing Checklist

- [ ] User can login with demo account
- [ ] User session persists after page refresh
- [ ] User session persists after app restart
- [ ] Admin can access all pages
- [ ] Guard can only access Dashboard and Verify
- [ ] Unauthorized access shows error page
- [ ] Logout clears session
- [ ] User info displays in navigation
- [ ] Navigation links change based on role
- [ ] All protected routes redirect unauthenticated users to /login

## Performance Considerations

- AuthContext loading state prevents flash of login page
- localStorage is synchronous - appropriate for small data
- ProtectedRoute renders efficiently with React.createElement
- No unnecessary re-renders with proper context usage

## Security Reminders

⚠️ **Current Implementation:**
- Client-side only authentication
- For development/demo purposes
- Credentials visible in demo buttons
- Not suitable for production with real data

✅ **For Production:**
- Implement backend authentication
- Use JWT tokens
- Hash passwords with bcrypt
- Implement HTTPS
- Add rate limiting
- Implement session timeout
- Add audit logging

## Troubleshooting Reference

| Issue | Solution |
|-------|----------|
| Always redirected to login | Verify AuthProvider wraps routes |
| User info shows undefined | Check useAuth is called inside AuthProvider |
| Route protection not working | Verify ProtectedRoute component is used |
| Session lost on refresh | Check localStorage is enabled |
| Can't login | Verify credentials: admin/demo123 or guard/demo123 |
| Role-based menu not working | Check hasRole() is used correctly |

## Next: Connecting to Real Database

See [AUTHENTICATION.md](AUTHENTICATION.md) for details on:
- Replacing demo login with backend authentication
- Implementing proper user storage
- Adding password security
- Session management best practices
