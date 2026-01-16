import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, LogIn, ExternalLink } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(credentials.email, credentials.password);
    if (result.success) {
      const role = result.data.user.role;
      navigate(role === 'Admin' ? '/admin' : '/user');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-green-50 to-teal-50 py-8 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl transform transition-all hover:shadow-2xl p-8 relative">
        {/* Logo/Image Section */}
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
          <div className="w-40 h-40 rounded-full bg-white shadow-lg flex items-center justify-center p-2">
            <img
              src="/LOGO.png"
              alt="Logo"
              className="w-32 h-32 object-contain"
            />
          </div>
        </div>

        {/* Header Section with extra margin-top for the logo */}
        <div className="text-center mb-8 mt-16">
          <h2 className="text-3xl font-bold text-green-700 mb-2">Silahkan Login</h2>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center transform transition-all hover:scale-102">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0
                00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0
                001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-gray-700 text-sm font-medium mb-2 transition-colors
              group-hover:text-green-600">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-green-500 group-hover:text-green-600 transition-colors" />
              </div>
              <input
                type="email"
                className="w-full pl-10 p-3 border-2 border-gray-200 rounded-lg focus:ring-2
                  focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-400"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                placeholder="Masukkan email anda"
                required
              />
            </div>
          </div>
          <div className="group">
            <label className="block text-gray-700 text-sm font-medium mb-2 transition-colors
              group-hover:text-green-600">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-green-500 group-hover:text-green-600
                  transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 p-3 border-2 border-gray-200 rounded-lg focus:ring-2
                  focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-400 pr-10"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500
                  hover:text-green-700 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-500 text-white
              rounded-lg hover:from-green-600 hover:to-green-600 focus:ring-4 focus:ring-green-200
              transition-all font-medium transform hover:scale-102 hover:shadow-lg disabled:opacity-50
              disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Login
              </>
            )}
          </button>
        </form>

        {/* Registration Link */}
        <div className="mt-8 text-center">
          <span className="text-gray-600">
            Belum punya Akun?{' '}
            <a
              href="/register"
              className="text-green-600 hover:text-green-700 font-medium transition-colors
                hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="h-4 w-4" />
              Registrasi akun baru
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;