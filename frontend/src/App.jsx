// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthRoutes from './routes/AuthRoutes';
import AdminRoutes from './routes/AdminRoutes';
import UserRoutes from './routes/UserRoutes';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth/*" element={<AuthRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/user/*" element={<UserRoutes />} />
          <Route path="/*" element={<AuthRoutes />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;