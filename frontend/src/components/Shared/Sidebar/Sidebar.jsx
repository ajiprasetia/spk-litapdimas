// src/components/Shared/Sidebar/Sidebar.jsx
import React from 'react';
import { Menu } from 'lucide-react';
import SidebarItem from './SidebarItem';

const Sidebar = ({ 
  isOpen, 
  toggleSidebar, 
  menuItems, 
  activeMenu, 
  onMenuClick 
}) => {
  return (
    <aside 
      className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out z-40 flex flex-col
        ${isOpen ? 'w-64' : 'w-16'} 
      `}
    >
      <div className={`h-16 flex items-center ${isOpen ? 'px-4' : 'justify-center'} border-b border-gray-200`}>
        {isOpen ? (
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img 
                src="/LOGO.png"
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">SPK</span>
              <span className="text-xs text-gray-500">LITAPDIMAS</span>
            </div>
          </div>
        ) : (
          <button 
            className="p-1.5 hover:bg-green-600 hover:text-white rounded-lg text-gray-600 transition-colors duration-200"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      <nav className={`space-y-2 mt-4 ${isOpen ? 'px-4' : 'px-2'} flex-1`}>
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.text}
            icon={item.icon}
            text={item.text}
            color={item.color}
            isActive={activeMenu === item.text}
            showText={isOpen}
            onClick={() => onMenuClick(item.text)}
          />
        ))}
      </nav>

      {isOpen && (
        <div className="p-4 text-center border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Sistem Pendukung keputusan © 2025
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;