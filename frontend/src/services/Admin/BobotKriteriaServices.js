// src/services/Admin/BobotKriteriaServices.js
import api from '../api';

export const BobotKriteriaServices = {
  getLatestBobot: async () => {
    const response = await api.get('/bobot-kriteria');
    return response.data;
  },

  hitungBobot: async (matriksPerbandingan) => {
    const response = await api.post('/bobot-kriteria/hitung', {
      matriks_perbandingan: matriksPerbandingan
    });
    return response.data;
  },

  resetBobot: async () => {
    const response = await api.post('/bobot-kriteria/reset');
    return response.data;
  }
};

export default BobotKriteriaServices;