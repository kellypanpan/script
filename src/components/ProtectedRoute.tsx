import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { UserPlan } from '../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredPlan?: UserPlan;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredPlan,
  redirectTo = '/login',
  fallback
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute check:', { 
    path: location.pathname, 
    isLoading, 
    isAuthenticated, 
    user: user?.email || 'No user',
    requireAuth 
  });

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('ProtectedRoute: Showing loading state');
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('ProtectedRoute: Redirecting to login - not authenticated');
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location,
          message: 'Please sign in to access this page'
        }} 
        replace 
      />
    );
  }

  // Check plan requirements
  if (requiredPlan && user && user.plan !== requiredPlan) {
    // Define plan hierarchy for comparison
    const planHierarchy: Record<UserPlan, number> = {
      free: 0,
      pro: 1,
      studio: 2
    };

    const userPlanLevel = planHierarchy[user.plan];
    const requiredPlanLevel = planHierarchy[requiredPlan];

    // If user's plan level is lower than required, redirect to pricing
    if (userPlanLevel < requiredPlanLevel) {
      return (
        <Navigate 
          to="/pricing" 
          state={{ 
            from: location,
            message: `This feature requires a ${requiredPlan} plan. Please upgrade to continue.`,
            requiredPlan
          }} 
          replace 
        />
      );
    }
  }

  // If all checks pass, render the protected content
  console.log('ProtectedRoute: Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;

// Specialized components for different protection levels
export const AuthRequired: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAuth={true}>
    {children}
  </ProtectedRoute>
);

export const ProRequired: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAuth={true} requiredPlan="pro">
    {children}
  </ProtectedRoute>
);

export const StudioRequired: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAuth={true} requiredPlan="studio">
    {children}
  </ProtectedRoute>
);

// Guest route - redirects authenticated users to dashboard
export const GuestOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};