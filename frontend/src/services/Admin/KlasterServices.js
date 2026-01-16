// src/services/Admin/KlasterServices.js
import api from '../api';

export const KlasterServices = {
  getAllKlaster: async () => {
    const response = await api.get('/klaster');
    return response.data;
  },

  getKlasterByTahun: async (tahunAnggaranId) => {
    const response = await api.get(`/klaster/tahun/${tahunAnggaranId}`);
    return response.data;
  },

  getKlasterById: async (id) => {
    const response = await api.get(`/klaster/${id}`);
    return response.data;
  },

  createKlaster: async (data) => {
    const response = await api.post('/klaster', data);
    return response.data;
  },

  updateKlaster: async (id, data) => {
    const response = await api.put(`/klaster/${id}`, data);
    return response.data;
  },

  deleteKlaster: async (id) => {
    const response = await api.delete(`/klaster/${id}`);
    return response.data;
  }
};

export default KlasterServices;