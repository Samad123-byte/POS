import apiClient from './apiClient';

export const productService = {
  // ✅ Now sends StartIndex and EndIndex
  getAll: async (startIndex = 0, endIndex = 9) => {
    const res = await apiClient.get('/Products/getAll', {
      params: { startIndex, endIndex }
    });
    return res.data;
  },
  
  getById: async (id) => {
    const res = await apiClient.post('/Products/getById', { id });
    return res.data;
  },
  
  create: async (product) => {
    try {
      const res = await apiClient.post('/Products/create', product);
      return res.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: "Unknown error occurred." };
    }
  },

  update: async (product) => {
    const res = await apiClient.post('/Products/update', product);
    return res.data;
  },
  
  delete: async (id) => {
    const res = await apiClient.post('/Products/delete', { id });
    return res.data;
  }
};