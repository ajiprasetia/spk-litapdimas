// src/services/User/PenilaianProposalServices.js
import api from '../api';

const BASE_URL = 'http://localhost:5000';

export const PenilaianProposalServices = {
  // Get daftar penugasan reviewer
  getDaftarPenugasan: async () => {
    const response = await api.get('/penilaian-proposal/penugasan');
    return response.data;
  },

  // Get detail proposal dan form penilaian
  getDetailPenilaian: async (id) => {
    const response = await api.get(`/penilaian-proposal/${id}`);
    return response.data;
  },

  // Submit penilaian
  submitPenilaian: async (data) => {
    const response = await api.post('/penilaian-proposal', data);
    return response.data;
  },

  // Helper method untuk URL file
  getProposalFileUrl: (fileName) => {
    if (!fileName) return null;
    return `${BASE_URL}/uploads/proposal/${fileName}`;
  },

  getRABFileUrl: (fileName) => {
    if (!fileName) return null;
    return `${BASE_URL}/uploads/rab/${fileName}`;
  }
};

export default PenilaianProposalServices;