// src/components/Layout/AdminLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TahunAnggaranServices } from "../../services/Admin/TahunAnggaranServices";
import {
  Home,
  UserCog,
  LayoutList,
  FileText,
  Blinds,
  Star,
  Key,
  LogOut,
} from "lucide-react";
import Sidebar from "../Shared/Sidebar/Sidebar";
import Header from "../Shared/Header/Header";

const AdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTahunAnggaran, setActiveTahunAnggaran] = useState(null);
  const [loadingTahunAnggaran, setLoadingTahunAnggaran] = useState(true);

  // Map paths to menu text
  const pathToText = {
    "/admin/beranda": "Beranda",
    "/admin/manajemen-users": "Manajemen User",
    "/admin/klaster": "Klaster",
    "/admin/kriteria": "Kriteria",
    "/admin/proposal": "Proposal",
    "/admin/hasil-rekomendasi": "Hasil Rekomendasi",
  };

  // Get current active menu from path
  const [activeMenu, setActiveMenu] = useState(
    pathToText[location.pathname] || "Beranda"
  );

  // Load active tahun anggaran
  useEffect(() => {
    const loadActiveTahunAnggaran = async () => {
      try {
        setLoadingTahunAnggaran(true);
        const data = await TahunAnggaranServices.getActiveTahunAnggaran();
        setActiveTahunAnggaran(data);
      } catch (error) {
        console.error('Error loading active tahun anggaran:', error);
        setActiveTahunAnggaran(null);
      } finally {
        setLoadingTahunAnggaran(false);
      }
    };

    loadActiveTahunAnggaran();

    // Listen untuk perubahan tahun anggaran
    const handleTahunAnggaranChange = () => {
      loadActiveTahunAnggaran();
    };

    window.addEventListener('tahunAnggaranChanged', handleTahunAnggaranChange);

    // Auto refresh every 5 minutes
    const interval = setInterval(loadActiveTahunAnggaran, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('tahunAnggaranChanged', handleTahunAnggaranChange);
    };
  }, []);

  const userData = {
    nama: user?.nama || "",
    email: user?.email || "",
    role: user?.role || "",
    profileImage: "/LOGO.png",
  };

  const menuItems = [
    {
      icon: Home,
      text: "Beranda",
      path: "/admin/beranda",
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
    {
      icon: UserCog,
      text: "Manajemen User",
      path: "/admin/manajemen-users",
      color: "bg-gradient-to-r from-indigo-500 to-purple-500",
    },
    {
      icon: Blinds,
      text: "Klaster",
      path: "/admin/klaster",
      color: "bg-gradient-to-r from-pink-500 to-rose-500",
    },
    {
      icon: LayoutList,
      text: "Kriteria",
      path: "/admin/kriteria",
      color: "bg-gradient-to-r from-amber-400 to-yellow-500",
    },
    {
      icon: FileText,
      text: "Proposal",
      path: "/admin/proposal",
      color: "bg-gradient-to-r from-red-500 to-orange-500",
    },
    {
      icon: Star,
      text: "Hasil Rekomendasi",
      path: "/admin/hasil-rekomendasi",
      color: "bg-gradient-to-r from-cyan-500 to-blue-500",
    },
  ];

  const userMenuItems = [
    { icon: Key, text: "Ganti Password", iconColor: "text-green-600" },
    { icon: LogOut, text: "Logout", iconColor: "text-red-600" },
  ];

  const loginHistory = [
    {
      id: 1,
      device: "Chrome on Windows",
      ipAddress: "192.168.1.1",
      time: "5 menit yang lalu",
    },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const toggleHistory = () => setIsHistoryOpen(!isHistoryOpen);

  const handleMenuClick = (menuText) => {
    const menuItem = menuItems.find((item) => item.text === menuText);
    if (menuItem) {
      setActiveMenu(menuText);
      navigate(menuItem.path);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        menuItems={menuItems}
        activeMenu={activeMenu}
        onMenuClick={handleMenuClick}
      />
      <div
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "ml-64" : "ml-16"}
        `}
      >
        <Header
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          activeMenu={activeMenu}
          userData={userData}
          userMenuItems={userMenuItems}
          loginHistory={loginHistory}
          isHistoryOpen={isHistoryOpen}
          isUserMenuOpen={isUserMenuOpen}
          toggleHistory={toggleHistory}
          toggleUserMenu={toggleUserMenu}
          activeTahunAnggaran={activeTahunAnggaran}
          loadingTahunAnggaran={loadingTahunAnggaran}
        />
        <main className="pt-16 min-h-screen bg-gray-100">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;