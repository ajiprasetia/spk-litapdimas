// src/components/Shared/Header/Header.jsx
import React from "react";
import { Menu, Clock, User, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import RiwayatLogin from "./RiwayatLogin";
import UserMenu from "./UserMenu";

const Header = ({
  isSidebarOpen,
  toggleSidebar,
  activeMenu,
  userData,
  userMenuItems,
  loginHistory,
  isHistoryOpen,
  isUserMenuOpen,
  toggleHistory,
  toggleUserMenu,
  activeTahunAnggaran,
  loadingTahunAnggaran,
}) => {
  return (
    <header
      className={`
        fixed top-0 right-0 h-16 bg-green-600
        transition-all duration-300 ease-in-out z-30
        ${isSidebarOpen ? "left-64" : "left-16"}
      `}
    >
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center">
          {isSidebarOpen && (
            <button
              className="p-2 hover:bg-green-700 rounded-lg text-white"
              onClick={toggleSidebar}
            >
              <Menu size={20} />
            </button>
          )}
          <h2
            className={`text-xl font-semibold text-white ${
              isSidebarOpen ? "ml-4" : ""
            }`}
          >
            {activeMenu}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Tahun Anggaran Aktif - Sebelum Riwayat Login */}
          <div className="flex items-center justify-center">
            {loadingTahunAnggaran ? (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span className="text-white text-sm">Memuat...</span>
              </div>
            ) : activeTahunAnggaran ? (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                <Calendar className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">
                  Tahun Anggaran:
                </span>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-white rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-green-800 text-sm font-semibold">
                    {activeTahunAnggaran.tahun_anggaran}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-orange-500/20 rounded-full backdrop-blur-sm border border-orange-300/30">
                <AlertCircle className="w-4 h-4 text-orange-200" />
                <span className="text-orange-100 text-sm font-medium">
                  Tidak ada tahun aktif
                </span>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="p-2 hover:bg-green-700 rounded-full relative text-white"
              onClick={() => {
                toggleHistory();
                if (isUserMenuOpen) toggleUserMenu();
              }}
            >
              <Clock size={20} />
            </button>
            <RiwayatLogin isOpen={isHistoryOpen} loginHistory={loginHistory} />
          </div>

          <div className="relative">
            <button
              className="flex items-center space-x-2 p-2 hover:bg-green-700 rounded-lg text-white relative"
              onClick={() => {
                toggleUserMenu();
                if (isHistoryOpen) toggleHistory();
              }}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white flex items-center justify-center bg-gray-100">
                {userData.profileImage &&
                userData.profileImage !== "/api/placeholder/150/150" ? (
                  <img
                    src={userData.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div
                className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white ml-1 transform transition-transform duration-200 ${
                  isUserMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <UserMenu
              isOpen={isUserMenuOpen}
              userData={userData}
              menuItems={userMenuItems}
              onClose={() => toggleUserMenu(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;