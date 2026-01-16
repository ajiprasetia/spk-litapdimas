// src/components/Layout/UserLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ProfileServices } from "../../services/User/ProfileServices";
import { TahunAnggaranServices } from "../../services/Admin/TahunAnggaranServices";
import {
  Home,
  Info,
  UserCircle,
  BookText,
  BookCheck,
  Key,
  LogOut,
} from "lucide-react";
import Sidebar from "../Shared/Sidebar/Sidebar";
import Header from "../Shared/Header/Header";
import { StatusServices } from "../../services/User/StatusServices";

const UserLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTahunAnggaran, setActiveTahunAnggaran] = useState(null);
  const [loadingTahunAnggaran, setLoadingTahunAnggaran] = useState(true);
  const [userProfile, setUserProfile] = useState({
    foto_profil: null,
    jenis_kelamin: "",
    nomor_whatsapp: "",
    alamat: "",
    online_profil: "",
    profesi: "",
    nip_niy: "",
    nidn: "",
    jabatan_fungsional: "",
    bidang_ilmu: "",
  });
  const [userStatus, setUserStatus] = useState({
    isPeneliti: false,
    isReviewer: false,
  });

  // Map paths to menu text
  const pathToText = {
    "/user/beranda": "Beranda",
    "/user/informasi": "Informasi",
    "/user/profil": "Profil",
    "/user/peneliti": "Peneliti",
    "/user/reviewer": "Reviewer",
  };

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

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        // Load profile
        const profileData = await ProfileServices.getProfile();
        setUserProfile(profileData);

        // Check status peneliti dan reviewer
        const [statusPeneliti, statusReviewer] = await Promise.all([
          StatusServices.getPenelitiStatus(),
          StatusServices.getReviewerStatus(),
        ]);

        setUserStatus({
          isPeneliti: statusPeneliti.status_peneliti === "Terdaftar",
          isReviewer: statusReviewer.status_reviewer === "Terdaftar",
        });
      } catch (error) {
        console.error("Error loading user data:", error);
        setUserProfile({
          foto_profil: null,
          jenis_kelamin: "",
          nomor_whatsapp: "",
          alamat: "",
          online_profil: "",
          profesi: "",
          nip_niy: "",
          nidn: "",
          jabatan_fungsional: "",
          bidang_ilmu: "",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const userData = {
    nama: user?.nama || "",
    email: user?.email || "",
    role: user?.role || "",
    profileImage: userProfile?.foto_profil
      ? ProfileServices.getProfilePhotoUrl(userProfile.foto_profil)
      : "/api/placeholder/150/150",
  };

  // Base menu items yang selalu ada
  const baseMenuItems = [
    {
      icon: Home,
      text: "Beranda",
      path: "/user/beranda",
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
    {
      icon: Info,
      text: "Informasi",
      path: "/user/informasi",
      color: "bg-gradient-to-r from-violet-500 to-purple-500",
    },
    {
      icon: UserCircle,
      text: "Profil",
      path: "/user/profil",
      color: "bg-gradient-to-r from-pink-500 to-rose-500",
    },
  ];

  // Menu items tambahan berdasarkan status
  const additionalMenuItems = [
    ...(userStatus.isPeneliti
      ? [
          {
            icon: BookText,
            text: "Peneliti",
            path: "/user/peneliti",
            color: "bg-gradient-to-r from-red-500 to-orange-500",
          },
        ]
      : []),
    ...(userStatus.isReviewer
      ? [
          {
            icon: BookCheck,
            text: "Reviewer",
            path: "/user/reviewer",
            color: "bg-gradient-to-r from-cyan-500 to-blue-500",
          },
        ]
      : []),
  ];

  // Gabungkan menu items
  const menuItems = [...baseMenuItems, ...additionalMenuItems];

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

  // Redirect jika mencoba akses halaman yang tidak diizinkan
  useEffect(() => {
    if (!loading) {
      // Tambahkan pengecekan loading
      const currentPath = location.pathname;
      if (currentPath.includes("/user/peneliti") && !userStatus.isPeneliti) {
        navigate("/user/beranda");
      }
      if (currentPath.includes("/user/reviewer") && !userStatus.isReviewer) {
        navigate("/user/beranda");
      }
    }
  }, [location.pathname, userStatus, loading, navigate]);

  return (
    <div className="flex min-h-screen">
      <style>
        {`
          @keyframes flipIn {
            0% {
              transform: perspective(400px) rotateX(-90deg);
              opacity: 0;
            }
            100% {
              transform: perspective(400px) rotateX(0);
              opacity: 1;
            }
          }
          .flip-animation {
            animation: flipIn 0.3s ease-out;
            transform-origin: top center;
            backface-visibility: hidden;
          }
        `}
      </style>
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

export default UserLayout;