// src/services/Admin/RankingProposalServices.js
import api from '../api';

export const RankingProposalServices = {
  getKlasterList: async () => {
    const response = await api.get('/klaster');
    return response.data;
  },
  
  getProposalsByKlaster: async (klasterId) => {
    const response = await api.get(`/ranking-proposal/proposals/${klasterId}`);
    return response.data;
  },
  
  getRankingByKlaster: async (klasterId) => {
    const response = await api.get(`/ranking-proposal/${klasterId}`);
    return response.data;
  },

   getDetailPenilaianProposal: async (proposalId) => {
    const response = await api.get(`/ranking-proposal/detail-penilaian/${proposalId}`);
    return response.data;
  },
  
  // Metode untuk mendapatkan detail perhitungan
  getDetailPerhitungan: async (klasterId) => {
    const response = await api.get(`/ranking-proposal/details/${klasterId}`);
    return response.data;
  },
  
  calculateRanking: async (klasterId, onlyGetDetails = false) => {
    // Jika onlyGetDetails=true, gunakan endpoint details
    if (onlyGetDetails) {
      return await RankingProposalServices.getDetailPerhitungan(klasterId);
    }
    
    // Jika untuk menghitung ranking, gunakan endpoint calculate
    const response = await api.post(`/ranking-proposal/calculate/${klasterId}`);
    return response.data;
  },
  
  resetRanking: async (klasterId) => {
    const response = await api.post(`/ranking-proposal/reset/${klasterId}`);
    return response.data;
  }
};

export default RankingProposalServices;