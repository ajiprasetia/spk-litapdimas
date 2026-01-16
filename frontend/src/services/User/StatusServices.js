// src/services/User/StatusServices.js
import api from '../api';

export const StatusServices = {
  getPenelitiStatus: async () => {
    const response = await api.get('/peneliti/status');
    return response.data;
  },

  getReviewerStatus: async () => {
    const response = await api.get('/reviewer/status');
    return response.data;
  }
};

export default StatusServices;