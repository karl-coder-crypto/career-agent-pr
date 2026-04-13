import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // NOTE: Bypassed temporarily for testing component direct access.
  // if (!currentUser) {
  //   return <Navigate to="/auth" state={{ error: "Session Failed. Ensure Cloud Matrix mapping is active." }} />;
  // }
  
  return children;
}
