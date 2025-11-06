import apiClient from './apiClient';

export const saleService = {
  getAll: async (pageNumber = 1, pageSize = 10) => {
    const res = await apiClient.get('/Sales', {
      params: { pageNumber, pageSize }
    });
    return res.data;
  },
  
  getById: async (id) => {
    const res = await apiClient.post('/Sales/getById', { id });
    return res.data;
  },
  
  getWithDetails: async (id) => {
    const res = await apiClient.post('/Sales/getByIdWithDetails', { id });
    return res.data;
  },
  
  create: async (sale) => {
    const res = await apiClient.post('/Sales', sale);
    return res.data;
  },
  
  update: async (sale) => {
    const res = await apiClient.post('/Sales/update', sale);
    return res.data;
  },
  
  delete: async (id) => {
    const res = await apiClient.post('/Sales/delete', { id });
    return res.data;
  }
};