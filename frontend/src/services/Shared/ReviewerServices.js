// src/services/Shared/ReviewerServices.js
import api from '../api';

export const ReviewerServices = {
  getStatusReviewer: async () => {
    const response = await api.get('/reviewer/status');
    return response.data;
  },

  ajukanReviewer: async () => {
    const response = await api.post('/reviewer/ajukan');
    return response.data;
  },

  ajukanRevisi: async () => {
    const response = await api.post('/reviewer/revisi');
    return response.data;
  },

  // Admin services
  getAllPengajuan: async () => {
    const response = await api.get('/reviewer/pengajuan');
    return response.data;
  },

  verifikasiPengajuan: async (userId, data) => {
    const response = await api.post(`/reviewer/verifikasi/${userId}`, data);
    return response.data;
  }
};

export default ReviewerServices;