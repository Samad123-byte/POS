import apiClient from './apiClient';

export const saleDetailService = {
  getAll: async () => {
    const res = await apiClient.get('/SaleDetails/getall');
    return res.data;
  },

  add: async (saleDetail) => {
    const res = await apiClient.post('/SaleDetails/add', saleDetail);
    return res.data;
  },

  update: async (saleDetail) => {
    const res = await apiClient.post('/SaleDetails/update', saleDetail);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/SaleDetails/delete/${id}`);
    return res.data;
  },

  deleteBySale: async (saleId) => {
    const res = await apiClient.delete(`/SaleDetails/deletebysale/${saleId}`);
    return res.data;
  },

  // ✅ Match lowercase routes exactly
  getSaleDetailsBySaleId: async (saleId) => {
    const res = await apiClient.get(`/SaleDetails/bysale/${saleId}`);
    return res.data;
  },

  createMultipleSaleDetails: async (saleDetails) => {
    const res = await apiClient.post('/SaleDetails/batch', saleDetails);
    return res.data;
  },

  deleteSaleDetailsBySaleId: async (saleId) => {
    const res = await apiClient.delete(`/SaleDetails/deletebysale/${saleId}`);
    return res.data;
  },

  getSaleTotal: async (saleId) => {
    const res = await apiClient.get(`/SaleDetails/total/${saleId}`);
    return res.data;
  }
};
