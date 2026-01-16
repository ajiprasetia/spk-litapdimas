// src/services/Admin/TahunAnggaranServices.js
import api from '../api';

export const TahunAnggaranServices = {
  // Get all tahun anggaran (accessible by all authenticated users)
  getAllTahunAnggaran: async () => {
    const response = await api.get('/tahun-anggaran');
    return response.data;
  },

  // Get active tahun anggaran (accessible by all authenticated users)
  getActiveTahunAnggaran: async () => {
    const response = await api.get('/tahun-anggaran/active/current');
    return response.data;
  },

  // Get tahun anggaran by id (accessible by all authenticated users)
  getTahunAnggaranById: async (id) => {
    const response = await api.get(`/tahun-anggaran/${id}`);
    return response.data;
  },

  // Admin only methods
  createTahunAnggaran: async (data) => {
    const response = await api.post('/tahun-anggaran', data);
    return response.data;
  },

  updateTahunAnggaran: async (id, data) => {
    const response = await api.put(`/tahun-anggaran/${id}`, data);
    return response.data;
  },

  deleteTahunAnggaran: async (id) => {
    const response = await api.delete(`/tahun-anggaran/${id}`);
    return response.data;
  }
};

export default TahunAnggaranServices;