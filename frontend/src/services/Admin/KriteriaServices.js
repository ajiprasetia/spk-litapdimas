// src/services/Admin/KriteriaServices.js
import api from '../api';

export const KriteriaServices = {
  getAllKriteria: async () => {
    const response = await api.get('/kriteria');
    return response.data;
  },

  getKriteriaById: async (id) => {
    const response = await api.get(`/kriteria/${id}`);
    return response.data;
  },

  createKriteria: async (data) => {
    const response = await api.post('/kriteria', data);
    return response.data;
  },

  updateKriteria: async (id, data) => {
    const response = await api.put(`/kriteria/${id}`, data);
    return response.data;
  },

  deleteKriteria: async (id) => {
    const response = await api.delete(`/kriteria/${id}`);
    return response.data;
  },

  getNextKodeKriteria: async () => {
    const response = await api.get('/kriteria/next-kode');
    return response.data;
  }
};

export default KriteriaServices;