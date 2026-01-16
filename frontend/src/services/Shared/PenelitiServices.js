// src/services/Shared/PenelitiServices.js
import api from '../api';

export const PenelitiServices = {
  getStatusPeneliti: async () => {
    const response = await api.get('/peneliti/status');
    return response.data;
  },

  ajukanPeneliti: async () => {
    const response = await api.post('/peneliti/ajukan');
    return response.data;
  },

  ajukanRevisi: async () => {
    const response = await api.post('/peneliti/revisi');
    return response.data;
  },

  getAllPengajuan: async () => {
    const response = await api.get('/peneliti/pengajuan');
    return response.data;
  },

  verifikasiPengajuan: async (userId, data) => {
    const response = await api.post(`/peneliti/verifikasi/${userId}`, data);
    return response.data;
  }
};

export default PenelitiServices;