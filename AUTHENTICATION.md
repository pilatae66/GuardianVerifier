# Authentication System Guide

## Overview

The Guardian Verification System now includes a complete authentication and authorization system that restricts access based on user roles (Guard or Admin).

## Features

### 1. **Role-Based Access Control (RBAC)**
- **Admin Role**: Full access to all features
  - Dashboard
  - Guardian Registration
  - Student Registration
  - Guardian Verification
  - Verification Logs

- **Guard Role**: Limited access to core verification features only
  - Dashboard (Read-only)
  - Guardian Verification

### 2. **Login System**
- Username and password authentication
- Role selection (Guard/Admin)
- Demo accounts for testing
- Form validation with error messages
- Automatic redirection based on role

### 3. **Session Management**
- localStorage-based session persistence
- Automatic login on app restart
- Logout functionality with session clearing
- User info display in navigation bar

### 4. **Route Protection**
- Unauthenticated users redirected to login page
- Unauthorized users redirected to access denied page
- Role-based route guards
- Automatic redirect after login based on role

## Login Credentials

For testing purposes, use these demo accounts:

### Admin Account
```
Username: admin
Password: demo123
Role: Admin
```
**Access**: All pages and features

### Guard Account
```
Username: guard
Password: demo123
Role: Guard
```
**Access**: Dashboard and Verify Guardian only

## Architecture

### Components

#### 1. **AuthContext.js** (`src/context/AuthContext.js`)
Central authentication state management using React Context API.

**Key Functions:**
- `login(username, password, role)` - Authenticate user
- `logout()` - Clear session and user data
- `isAuthenticated()` - Check if user is logged in
- `hasRole(role)` - Check if user has specific role
- `hasAnyRole(roles)` - Check if user has any of multiple roles

**State:**
- `user` - Current logged-in user object
- `loading` - Loading state during initialization

#### 2. **ProtectedRoute.js** (`src/components/ProtectedRoute.js`)
Route wrapper component that enforces authentication and authorization.

**Features:**
- Checks authentication status
- Validates user role against allowed roles
- Redirects to /login if not authenticated
- Redirects to /unauthorized if role not allowed

#### 3. **Login.js** (`src/pages/Login.js`)
Complete login interface with form, validation, and demo accounts.

**Features:**
- Username and password input
- Role selection dropdown
- Demo login buttons for quick testing
- Error message display
- Credential reference guide
- Role access level information

#### 4. **Unauthorized.js** (`src/pages/Unauthorized.js`)
Access denied page for unauthorized access attempts.

**Features:**
- Clear error message
- Current role display
- Navigation to accessible pages
- Logout button

#### 5. **Navigation.js** (Updated)
Updated to show:
- Current user information
- User role badge (Admin/Guard)
- Logout button
- Role-based menu hiding
- User dropdown menu

### Data Flow

```
1. User accesses /login
   ↓
2. User enters credentials and selects role
   ↓
3. AuthContext.login() called
   ↓
4. User data stored in localStorage
   ↓
5. User redirected to role-appropriate page
   ↓
6. ProtectedRoute checks role for each page
   ↓
7. Access granted or denied based on role
```

## Protected Routes Configuration

**Admin-Only Routes:**
- `/admin` - Dashboard
- `/register-guardian` - Guardian Registration
- `/register-student` - Student Registration
- `/logs` - Verification Logs

**Guard & Admin Routes:**
- `/verify` - Guardian Verification

**Public Routes:**
- `/login` - Login page
- `/unauthorized` - Access denied page

## Styling

### Login Page (`src/pages/Login.css`)
- Centered card layout with gradient background
- Professional form styling
- Demo button section
- Credential reference guide
- Role access information display
- Responsive design for mobile

### Unauthorized Page (`src/pages/Unauthorized.css`)
- Clear error visual (⛔ icon)
- User role display
- Action buttons (Dashboard, Logout)
- Responsive layout

### Navigation User Menu (`src/components/Navigation.css`)
- User avatar and name
- Role badge with color coding
- Dropdown menu
- Logout button
- Responsive design (hides on mobile)

## Usage Examples

### Check Current User Role in Components

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, hasRole, isAuthenticated } = useAuth();
  
  // Check authentication
  if (!isAuthenticated()) {
    return <p>Please log in</p>;
  }
  
  // Check specific role
  if (hasRole('admin')) {
    return <p>Admin content</p>;
  }
  
  // Check multiple roles
  const { hasAnyRole } = useAuth();
  if (hasAnyRole(['admin', 'guard'])) {
    return <p>Both admins and guards can see this</p>;
  }
}
```

### Create Admin-Only Component

```javascript
import ProtectedRoute from '../components/ProtectedRoute';
import MyAdminComponent from '../pages/MyAdminComponent';

function App() {
  return (
    <Route 
      path="/admin-only" 
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MyAdminComponent />
        </ProtectedRoute>
      } 
    />
  );
}
```

### Logout from Component

```javascript
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

## Security Considerations

### Current Implementation
- Client-side authentication using React Context
- localStorage for session persistence
- Simple username/password validation
- Demo accounts for development/testing

### Production Recommendations
1. **Replace with Backend Authentication**
   - Implement proper API authentication
   - Use JWT tokens instead of localStorage
   - Add password hashing (bcrypt)
   - Implement refresh token rotation

2. **Add HTTPS**
   - Encrypt data in transit
   - Secure cookies with httpOnly flag

3. **Enhanced Validation**
   - Input sanitization
   - Password strength requirements
   - Rate limiting on login attempts
   - Account lockout after failed attempts

4. **Session Security**
   - Session timeout
   - Secure token generation
   - CSRF protection
   - XSS prevention

## Testing the Authentication System

### Test Scenario 1: Admin Login
1. Open http://localhost:3000
2. You'll be redirected to /login
3. Click "Demo Login: Admin" button (or enter admin/demo123)
4. You should be on the admin dashboard
5. All navigation links should be visible
6. Navigate between all pages without restriction

### Test Scenario 2: Guard Login
1. Open http://localhost:3000 and logout first
2. Click "Demo Login: Guard" button (or enter guard/demo123)
3. You should be on the verify guardian page
4. Only Dashboard and Verify Guardian links should be visible
5. Attempting to access /register-guardian should redirect to /unauthorized
6. Click logout in user menu

### Test Scenario 3: Unauthorized Access
1. Login as Guard
2. Try to access http://localhost:3000/register-guardian directly
3. You should be redirected to /unauthorized page
4. Click "Go to Dashboard" to return to verify page

### Test Scenario 4: Session Persistence
1. Login as Admin
2. Refresh the page (Ctrl+R)
3. User should still be logged in
4. Close and reopen the app
5. User should still be logged in
6. Click Logout in user menu
7. Session should be cleared
8. Refresh page should redirect to /login

## Files Modified/Created

### New Files
- `src/context/AuthContext.js` - Authentication context
- `src/components/ProtectedRoute.js` - Route protection
- `src/pages/Login.js` - Login page
- `src/pages/Login.css` - Login styling
- `src/pages/Unauthorized.js` - Access denied page
- `src/pages/Unauthorized.css` - Unauthorized styling

### Modified Files
- `src/App.js` - Integrated AuthProvider and ProtectedRoute
- `src/components/Navigation.js` - Added user menu and logout
- `src/components/Navigation.css` - Styled user menu

### Unchanged Files
- All feature pages work as before
- Database schema unchanged
- Electron configuration unchanged
- Build process unchanged

## Troubleshooting

### Issue: Always redirected to login
**Solution**: Check if AuthProvider is wrapping the app in App.js

### Issue: User info not showing in navigation
**Solution**: Verify Navigation component is inside ProtectedRoute

### Issue: Demo buttons not working
**Solution**: Make sure useAuth hook is imported and used correctly

### Issue: Session not persisting after refresh
**Solution**: Check browser localStorage is enabled

## Next Steps

1. **Connect to Real Database**
   - Store user credentials in database
   - Hash passwords with bcrypt
   - Implement user registration

2. **Add Backend API**
   - Create login endpoint
   - Implement token-based authentication
   - Add user management endpoints

3. **Enhanced Security**
   - Implement HTTPS
   - Add rate limiting
   - Implement session timeout
   - Add audit logging

4. **Role Management**
   - Add role editing for admins
   - Create custom roles
   - Implement permission system

5. **User Management**
   - User registration page
   - Password reset functionality
   - User profile management
   - Activity logging
