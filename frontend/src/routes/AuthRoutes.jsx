// src/routes/AuthRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import RegistrasiUser from '../pages/Auth/RegistrasiUser';

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegistrasiUser />} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AuthRoutes;