// src/services/Shared/ProposalServices.js
import api from '../api';

const BASE_URL = 'http://localhost:5000';

export const ProposalServices = {
  getAllProposal: async (tahunAnggaranId = null) => {
    const url = tahunAnggaranId 
      ? `/proposal?tahun_anggaran_id=${tahunAnggaranId}` 
      : '/proposal';
    const response = await api.get(url);
    return response.data;
  },

  getProposalById: async (id) => {
    const response = await api.get(`/proposal/${id}`);
    return response.data;
  },

  getKlasterList: async () => {
    const response = await api.get('/klaster');
    return response.data;
  },

  getKlasterByTahunAnggaran: async (tahunAnggaranId) => {
    const response = await api.get(`/klaster/tahun/${tahunAnggaranId}`);
    return response.data;
  },

  createProposal: async (formData) => {
    const response = await api.post('/proposal', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin methods
  getAllProposalAdmin: async (tahunAnggaranId = null) => {
    const url = tahunAnggaranId 
      ? `/proposal/admin/all?tahun_anggaran_id=${tahunAnggaranId}` 
      : '/proposal/admin/all';
    const response = await api.get(url);
    return response.data;
  },

  getAvailableReviewers: async (proposalId) => {
    const response = await api.get(`/proposal/${proposalId}/reviewers`);
    return response.data;
  },

  updateStatus: async (id, data) => {
    const response = await api.put(`/proposal/admin/${id}/status`, data);
    return response.data;
  },

  // Helper methods untuk URL file
  getProposalFileUrl: (fileName) => {
    if (!fileName) return null;
    return `${BASE_URL}/uploads/proposal/${fileName}`;
  },

  getRABFileUrl: (fileName) => {
    if (!fileName) return null;
    return `${BASE_URL}/uploads/rab/${fileName}`;
  }
};

export default ProposalServices;