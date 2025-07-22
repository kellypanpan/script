import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const GenerateRedirect: React.FC = () => {
  // Redirect to the new AI Studio page
  return <Navigate to="/studio" replace />;
};

export default GenerateRedirect;