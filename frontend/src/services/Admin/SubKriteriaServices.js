// src/services/Admin/SubKriteriaServices.js
import api from '../api';

export const SubKriteriaServices = {
  getAllSubKriteria: async () => {
    const response = await api.get('/sub-kriteria');
    return response.data;
  },

  getByKriteria: async (kriteriaId) => {
    const response = await api.get(`/sub-kriteria/kriteria/${kriteriaId}`);
    return response.data;
  },

  createSubKriteria: async (data) => {
    const response = await api.post('/sub-kriteria', data);
    return response.data;
  },

  updateSubKriteria: async (id, data) => {
    const response = await api.put(`/sub-kriteria/${id}`, data);
    return response.data;
  },

  deleteSubKriteria: async (id) => {
    const response = await api.delete(`/sub-kriteria/${id}`);
    return response.data;
  }
};

export default SubKriteriaServices;