//src/services/Shared/RiwayatLoginServices.js
import api from '../api';

export const RiwayatLoginServices = {
  getRiwayatLogin: async (limit = 5) => {
    const response = await api.get(`/riwayat-login?limit=${limit}`);
    return response.data;
  }
};
export default RiwayatLoginServices;