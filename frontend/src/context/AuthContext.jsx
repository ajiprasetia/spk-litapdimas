// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { AuthService } from "../services/AuthService";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = () => {
      const currentUser = AuthService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await AuthService.login(email, password);
      setUser(data.user);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const data = await AuthService.register(userData);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    navigate("/login");
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const data = await AuthService.changePassword(
        currentPassword,
        newPassword
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Password change failed",
      };
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;