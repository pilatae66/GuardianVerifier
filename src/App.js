import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import AdminDashboard from './pages/AdminDashboard';
import GuardVerification from './pages/GuardVerification';
import StudentRegistration from './pages/StudentRegistration';
import GuardianRegistration from './pages/GuardianRegistration';
import VerificationLogs from './pages/VerificationLogs';
import AdminUserManagement from './pages/AdminUserManagement';
import GuardUserManagement from './pages/GuardUserManagement';
import './App.css';

function HomeRedirect() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/verify" replace />;
  }
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'guard']}>
                  <HomeRedirect />
                </ProtectedRoute>
              } 
            />
            
            {/* Dashboard - Admin Only */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Navigation />
                  <main className="main-content">
                    <AdminDashboard />
                  </main>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/register-student" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Navigation />
                  <main className="main-content">
                    <StudentRegistration />
                  </main>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/register-guardian" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Navigation />
                  <main className="main-content">
                    <GuardianRegistration />
                  </main>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/logs" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'guard']}>
                  <Navigation />
                  <main className="main-content">
                    <VerificationLogs />
                  </main>
                </ProtectedRoute>
              } 
            />
            
            {/* Guard & Admin Pages - Both can access */}
            <Route 
              path="/verify" 
              element={
                <ProtectedRoute allowedRoles={['guard', 'admin']}>
                  <Navigation />
                  <main className="main-content">
                    <GuardVerification />
                  </main>
                </ProtectedRoute>
              } 
            />

            {/* User Management - Admin Only */}
            <Route 
              path="/manage-admins" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Navigation />
                  <main className="main-content">
                    <AdminUserManagement />
                  </main>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/manage-guards" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Navigation />
                  <main className="main-content">
                    <GuardUserManagement />
                  </main>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
