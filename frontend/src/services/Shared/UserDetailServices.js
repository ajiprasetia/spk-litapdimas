// src/services/Shared/UserDetailServices.js
import api from '../api';

export const UserDetailServices = {
  getUserDetail: async (userId) => {
    const response = await api.get(`/user-detail/${userId}`);
    return response.data;
  }
};

export default UserDetailServices;