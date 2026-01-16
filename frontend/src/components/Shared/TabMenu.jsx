import React from 'react';

const TabMenu = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b-2 border-green-500">
      <nav className="flex">
        {tabs.map((tab) => {
          // Destructure icon, atau gunakan null jika tidak ada
          const Icon = tab.icon || null;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative whitespace-nowrap py-3 px-5 font-medium text-sm transition-all duration-100
                flex items-center justify-center gap-2
                ${
                  activeTab === tab.id
                    ? 'text-green-600 bg-white border-t-2 border-l-2 border-r-2 border-green-500 rounded-t-xl -mb-0.5'
                    : 'text-slate-600 hover:text-green-700'
                }
              `}
            >
              {/* Render ikon jika tersedia */}
              {Icon && <Icon size={18} />}
              {tab.label}
              
              {/* Active indicator */}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default TabMenu;