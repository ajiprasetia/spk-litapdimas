// src/components/Shared/Header/UserMenu.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import GantiPassword from '../../../pages/Auth/GantiPassword';

const UserMenu = ({ isOpen, userData, menuItems, onClose }) => {
  const { logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleMenuClick = (item) => {
    if (item.text === 'Logout') {
      logout();
    } else if (item.text === 'Ganti Password') {
      setIsPasswordModalOpen(true);
      // Tidak menutup menu user saat membuka modal password
      return;
    } else if (item.action) {
      item.action();
    }
    onClose();
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    // Tutup menu user setelah modal password ditutup
    onClose();
  };

  return (
    <>
      <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border-2 border-green-200 z-40 flip-animation">
        <div className="px-3 py-2 border-b-2 border-green-200 bg-gray-50">
          <p className="text-sm font-semibold text-gray-900 truncate">{userData.nama}</p>
          <p className="text-xs text-gray-500 truncate">{userData.role}</p>
        </div>
        <div className="py-1">
          {menuItems.map((item, index) => (
            <button
              key={item.text}
              onClick={() => handleMenuClick(item)}
              className={`
                w-full px-4 py-2 flex items-center space-x-3 hover:bg-gray-50 
                ${index === menuItems.length - 1 ? 'text-red-600' : 'text-gray-700'}
              `}
            >
              <item.icon size={16} className={item.iconColor} />
              <span className="text-sm font-medium">{item.text}</span>
            </button>
          ))}
        </div>
      </div>

      {isPasswordModalOpen && (
        <GantiPassword 
          isOpen={isPasswordModalOpen}
          onClose={handleClosePasswordModal}
        />
      )}
    </>
  );
};

export default UserMenu;