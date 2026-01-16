// src/services/User/BerkasUserServices.js
import api from '../api';

const BASE_URL = 'http://localhost:5000';

export const BerkasUserServices = {
  getAllBerkas: async () => {
    const response = await api.get('/berkas-user');
    return response.data;
  },

  createBerkas: async (formData) => {
    const response = await api.post('/berkas-user', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateBerkas: async (id, formData) => {
    const response = await api.put(`/berkas-user/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteBerkas: async (id) => {
    const response = await api.delete(`/berkas-user/${id}`);
    return response.data;
  },

  getBerkasUrl: (fileName) => {
    if (!fileName) return null;
    return `${BASE_URL}/uploads/berkas/${fileName}`;
  }
};

export default BerkasUserServices;