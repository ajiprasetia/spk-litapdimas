// src/routes/UserRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from '../components/Layout/UserLayout';
import PrivateRoute from './PrivateRoute';

import Beranda from '../pages/User/Beranda';
import Informasi from '../pages/User/Informasi';
import Profil from '../pages/User/Profil';
import Peneliti from '../pages/User/Peneliti';
import Reviewer from '../pages/User/Reviewer';

const UserRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute role="User">
            <UserLayout />
          </PrivateRoute>
        }
      >
        {/* Redirect from /user to /user/beranda */}
        <Route index element={<Navigate to="/user/beranda" replace />} />
        <Route path="beranda" element={<Beranda />} />
        <Route path="informasi" element={<Informasi />} />
        <Route path="profil" element={<Profil />} />
        <Route path="peneliti" element={<Peneliti />} />
        <Route path="reviewer" element={<Reviewer />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;