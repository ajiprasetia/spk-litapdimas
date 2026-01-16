// src/services/User/RiwayatPendidikanServices.js
import api from '../api';

const BASE_URL = 'http://localhost:5000';

export const RiwayatPendidikanServices = {
  getAllRiwayat: async () => {
    const response = await api.get('/riwayat-pendidikan');
    return response.data;
  },

  createRiwayat: async (formData) => {
    const response = await api.post('/riwayat-pendidikan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateRiwayat: async (id, formData) => {
    const response = await api.put(`/riwayat-pendidikan/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteRiwayat: async (id) => {
    const response = await api.delete(`/riwayat-pendidikan/${id}`);
    return response.data;
  },

  getIjazahUrl: (fileName) => {
    if (!fileName) return null;
    return `${BASE_URL}/uploads/ijazah/${fileName}`;
  }
};

export default RiwayatPendidikanServices;