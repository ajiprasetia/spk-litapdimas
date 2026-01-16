// src/services/User/ProfileServices.js
import api from '../api';

const BASE_URL = 'http://localhost:5000';

export const ProfileServices = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.post('/user/profile', profileData);
    return response.data;
  },

  updateProfilePhoto: async (photoFile) => {
    const formData = new FormData();
    formData.append('foto_profil', photoFile);

    const response = await api.post('/user/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getProfilePhotoUrl: (photoName) => {
    if (!photoName) return null;
    return `${BASE_URL}/uploads/profile/${photoName}`;
  }
};

export default ProfileServices;