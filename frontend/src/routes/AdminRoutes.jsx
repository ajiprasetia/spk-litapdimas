// src/routes/AdminRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/Layout/AdminLayout';
import PrivateRoute from './PrivateRoute';

// Import Admin pages
import Beranda from '../pages/Admin/Beranda';
import ManajemenUsers from '../pages/Admin/ManajemenUsers';
import Klaster from '../pages/Admin/Klaster';
import Kriteria from '../pages/Admin/Kriteria';
import Proposal from '../pages/Admin/Proposal';
import HasilRekomendasi from '../pages/Admin/HasilRekomendasi';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute role="Admin">
            <AdminLayout />
          </PrivateRoute>
        }
      >
        {/* Redirect from /admin to /admin/beranda */}
        <Route index element={<Navigate to="/admin/beranda" replace />} />
        <Route path="beranda" element={<Beranda />} />
        <Route path="manajemen-users" element={<ManajemenUsers />} />
        <Route path="klaster" element={<Klaster />} />
        <Route path="kriteria" element={<Kriteria />} />
        <Route path="proposal" element={<Proposal />} />
        <Route path="hasil-rekomendasi" element={<HasilRekomendasi />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;