import apiClient from './apiClient';

export const productService = {
  getAll: async (pageNumber = 1, pageSize = 10) => {
    const res = await apiClient.get('/Products/getAll', {
      params: { pageNumber, pageSize }
    });
    return res.data;
  },
  
  getById: async (id) => {
    const res = await apiClient.post('/Products/getById', { id }); // ✅ Fixed to POST with body
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
    const res = await apiClient.post('/Products/delete', { id }); // ✅ Already correct
    return res.data;
  }
};