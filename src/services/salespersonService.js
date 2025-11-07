import apiClient from './apiClient';

export const salespersonService = {
  getAll: async () => {
    const res = await apiClient.get('/Salesperson/getall'); // no params
    return res.data;
  },
  
  getById: async (id) => {
    const res = await apiClient.post('/Salesperson/getById', { id });
    return res.data;
  },
  
  create: async (salesperson) => {
    const res = await apiClient.post('/Salesperson/add', salesperson);
    return res.data;
  },
  
  update: async (salesperson) => {
    const res = await apiClient.post('/Salesperson/update', salesperson);
    return res.data;
  },
  
  delete: async (id) => {
    const res = await apiClient.post('/Salesperson/delete', { id });
    return res.data;
  }
};