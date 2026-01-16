// src/pages/Auth/RegistrasiUser.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const RegistrasiUser = () => {
  const [userData, setUserData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (userData.password !== userData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setLoading(true);
    const result = await register({
      nama: userData.nama,
      email: userData.email,
      password: userData.password,
    });

    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-10 transform transition-all duration-300 hover:shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-emerald-700 mb-2">Registrasi Akun</h2>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center transform transition-all hover:scale-102">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-hover:text-emerald-600">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-400"
                  value={userData.nama}
                  onChange={(e) => setUserData({ ...userData, nama: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-hover:text-emerald-600">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-400"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  placeholder="Masukkan alamat email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-hover:text-emerald-600">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-400"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  placeholder="Buat password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-500 hover:text-emerald-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-hover:text-emerald-600">
                Konfirmasi Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-400"
                  value={userData.confirmPassword}
                  onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                  placeholder="Konfirmasi password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-500 hover:text-emerald-700 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 focus:ring-4 focus:ring-emerald-200 transition-all font-medium transform hover:scale-102 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Memproses...
                </span>
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Sudah punya akun?{' '}
              <a 
                href="/login" 
                className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors hover:underline"
              >
                Masuk disini
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrasiUser;