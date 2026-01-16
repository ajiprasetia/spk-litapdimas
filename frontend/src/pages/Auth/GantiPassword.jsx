// src/pages/Auth/GantiPassword.jsx
import React, { useState, memo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, AlertCircle, Delete, Save } from 'lucide-react';

const GantiPassword = memo(({ isOpen, onClose }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState(false);

  const { changePassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCurrentPasswordError(false);

    // Validasi password baru
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setError('Password baru tidak cocok dengan konfirmasi password');
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError('Password baru minimal 6 karakter');
      return;
    }

    // Validasi apakah password sama dengan yang sebelumnya
    if (passwords.currentPassword === passwords.newPassword) {
      setError('Password baru tidak boleh sama dengan password saat ini');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(
        passwords.currentPassword,
        passwords.newPassword
      );

      if (result.success) {
        setSuccess('Password berhasil diubah');
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        // Check apakah error karena password saat ini salah
        if (result.error.toLowerCase().includes('incorrect') || 
            result.error.toLowerCase().includes('salah') ||
            result.error.toLowerCase().includes('tidak cocok')) {
          setCurrentPasswordError(true);
          setError('Password saat ini tidak valid');
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      setError('Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setShowPasswords({
      currentPassword: false,
      newPassword: false,
      confirmNewPassword: false,
    });
    setError('');
    setSuccess('');
    setCurrentPasswordError(false);
    onClose();
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 mb-4"
                >
                  Ganti Password
                </Dialog.Title>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Current Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Saat Ini
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.currentPassword ? "text" : "password"}
                        value={passwords.currentPassword}
                        onChange={(e) => {
                          setPasswords({
                            ...passwords,
                            currentPassword: e.target.value,
                          });
                          setCurrentPasswordError(false); // Reset error saat input berubah
                        }}
                        className={`w-full p-2 pr-10 border rounded-md ${
                          currentPasswordError 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'focus:ring-green-500 focus:border-green-500'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('currentPassword')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.currentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.newPassword ? "text" : "password"}
                        value={passwords.newPassword}
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full p-2 pr-10 border rounded-md"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('newPassword')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirmNewPassword ? "text" : "password"}
                        value={passwords.confirmNewPassword}
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            confirmNewPassword: e.target.value,
                          })
                        }
                        className="w-full p-2 pr-10 border rounded-md"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirmNewPassword')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.confirmNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center gap-2 transition-colors"
                    >
                      <Delete className="w-5 h-5" />
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md
                          hover:bg-green-700 focus:outline-none focus-visible:ring-2 
                          focus-visible:ring-green-500 focus-visible:ring-offset-2
                          flex items-center gap-2 transition-colors
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                       <Save className="w-5 h-5" />
                      {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

GantiPassword.displayName = 'GantiPassword';

export default GantiPassword;