// src/components/Shared/Sidebar/SidebarItem.jsx
import React from 'react';

const SidebarItem = ({ icon: Icon, text, color, isActive = false, showText = true, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center w-full rounded-lg
      transition-all duration-300 ease-in-out
      hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600
      hover:shadow-lg hover:scale-[1.02]
      hover:text-white
      ${isActive ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-md' : ''}
      group
      ${showText ? 'p-2' : 'p-1.5 justify-center'}
    `}
  >
    <div className={`
      flex items-center justify-center
      ${isActive ? 'bg-green-700' : color} 
      rounded-lg
      transition-all duration-300 ease-in-out
      group-hover:bg-green-700 group-hover:rotate-[900deg]
      ${showText ? 'p-1.5' : 'w-9 h-9 p-1'}
      ${isActive ? 'scale-105 shadow-md' : 'scale-100'}
      group-hover:scale-110
      shadow-sm
    `}>
      <Icon 
        size={isActive ? 22 : 20} 
        className="text-white transition-all duration-300"
      />
    </div>
    {showText && (
      <span className={`
        ml-3 whitespace-nowrap font-medium transition-all duration-300
        ${isActive ? 'text-white translate-x-1' : 'text-gray-600'}
        group-hover:text-white group-hover:translate-x-1
      `}>
        {text}
      </span>
    )}
  </button>
);

export default SidebarItem;