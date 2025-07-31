import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import ProtectedRoute, { AuthRequired, GuestOnly } from './components/ProtectedRoute';
import Layout from './components/Layout';
import FeedbackWidget from './components/FeedbackWidget';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import GenerateRedirect from './pages/GenerateRedirect';
import ScriptDoctor from './pages/ScriptDoctor';
import ScriptStudioNew from './pages/ScriptStudioNew';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            {/* Guest only routes (redirect to dashboard if authenticated) */}
            <Route 
              path="/login" 
              element={
                <GuestOnly>
                  <Login />
                </GuestOnly>
              } 
            />
            <Route 
              path="/register" 
              element={
                <GuestOnly>
                  <Register />
                </GuestOnly>
              } 
            />

            {/* Semi-protected routes (accessible to guests with limited features) */}
            <Route path="/studio" element={<ScriptStudioNew />} />
            <Route path="/script-doctor" element={<ScriptDoctor />} />

            {/* Protected routes (require authentication) */}
            <Route 
              path="/dashboard" 
              element={
                <AuthRequired>
                  <Dashboard />
                </AuthRequired>
              } 
            />

            {/* Legacy redirect */}
            <Route 
              path="/generate" 
              element={
                <AuthRequired>
                  <GenerateRedirect />
                </AuthRequired>
              } 
            />
          </Routes>
          <FeedbackWidget />
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;