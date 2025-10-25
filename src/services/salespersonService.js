import apiClient from './apiClient';

export const salespersonService = {
  // ✅ Add pagination parameters
  getAllSalespersons: async (pageNumber = 1, pageSize = 10) => {
    const res = await apiClient.get('/Salesperson/getall', {
      params: { pageNumber, pageSize }
    });
    return res.data;
  },
  
  getSalespersonById: async (id) => {
    const res = await apiClient.get(`/Salesperson/getbyid/${id}`);
    return res.data;
  },
  
  createSalesperson: async (salesperson) => {
    const res = await apiClient.post('/Salesperson/add', salesperson);
    return res.data;
  },
  
  updateSalesperson: async (id, salesperson) => {
    const res = await apiClient.post('/Salesperson/update', { SalespersonId: id, ...salesperson });
    return res.data;
  },
  
  deleteSalesperson: async (id) => {
    const res = await apiClient.post('/Salesperson/delete', { id });
    return res.data;
  },
};