// src/routes/PrivateRoutes.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (role && role !== user.role) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;