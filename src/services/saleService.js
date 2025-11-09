import apiClient from './apiClient';

export const saleService = {
  // ✅ FIXED: Now uses /Sales/getAll endpoint
  getAll: async (startIndex = 0, endIndex = 9) => {
    const res = await apiClient.post('/Sales/getAll', {
      startIndex,  // ← Direct properties, not nested in params
      endIndex
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
  
  // ✅ FIXED: Now uses /Sales/create endpoint
  create: async (sale) => {
    const res = await apiClient.post('/Sales/create', sale);
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
