import apiClient from './apiClient';

export const salespersonService = {
  getAllSalespersons: async () => {
    const res = await apiClient.get('/Salesperson/getall');
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
