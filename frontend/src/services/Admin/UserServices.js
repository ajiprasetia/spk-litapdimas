// src/services/Admin/UserServices.js
import api from '../api';

const BASE_URL = 'http://localhost:5000';

export const UserServices = {
  getAllUsers: async () => {
    const response = await api.get('/users/all');
    return response.data;
  },

  getUserDetail: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  getPhotoUrl: (fileName) => {
    if (!fileName) return '/api/placeholder/150/150';
    return `${BASE_URL}/uploads/profile/${fileName}`;
  },

  getFileUrl: (fileName, type) => {
    if (!fileName) return null;
    return `${BASE_URL}/uploads/${type}/${fileName}`;
  },

  previewFile: async (fileUrl) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error previewing file:', error);
      throw new Error('Failed to preview file');
    }
  }
};

export default UserServices;