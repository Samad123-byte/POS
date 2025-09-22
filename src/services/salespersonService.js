import apiClient from './apiClient';

export const salespersonService = {
  getAllSalespersons: async () => {
    try {
      const response = await apiClient.get('/Salesperson');
      return response.data;
    } catch (error) {
      console.error('Error fetching salespersons:', error);
      throw new Error(`Failed to fetch salespersons: ${error.message}`);
    }
  },

  getSalespersonById: async (id) => {
    try {
      const response = await apiClient.get(`/Salesperson/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching salesperson:', error);
      throw new Error(`Failed to fetch salesperson: ${error.message}`);
    }
  },

  getSalespersonByCode: async (code) => {
    try {
      const response = await apiClient.get(`/Salesperson/ByCode/${code}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching salesperson by code:', error);
      throw new Error(`Failed to fetch salesperson: ${error.message}`);
    }
  },

  getActiveSalespersons: async () => {
    try {
      const response = await apiClient.get('/Salesperson/Active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active salespersons:', error);
      throw new Error(`Failed to fetch active salespersons: ${error.message}`);
    }
  },

  createSalesperson: async (salesperson) => {
    try {
      const salespersonData = {
        Name: salesperson.Name || salesperson.name,
        Code: salesperson.Code || salesperson.code,
      };
      
      const response = await apiClient.post('/Salesperson', salespersonData);
      return response.data;
    } catch (error) {
      console.error('Error creating salesperson:', error);
      throw new Error(`Failed to create salesperson: ${error.message}`);
    }
  },

  updateSalesperson: async (id, salesperson) => {
    try {
      // Ensure we're sending the correct data structure
      const salespersonData = {
        SalespersonId: parseInt(id),
        Name: salesperson.Name || salesperson.name,
        Code: salesperson.Code || salesperson.code,
        EnteredDate: salesperson.EnteredDate || salesperson.enteredDate || new Date().toISOString(),
      };
      
      console.log('Updating salesperson with data:', salespersonData); // Debug log
      
      const response = await apiClient.put(`/Salesperson/${id}`, salespersonData);
      
      return {
        ...salespersonData,
        UpdatedDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating salesperson:', error);
      console.error('Request data:', {
        url: `/Salesperson/${id}`,
        data: salesperson
      });
      throw new Error(`Failed to update salesperson: ${error.message}`);
    }
  },

  deleteSalesperson: async (id) => {
    try {
      // Make sure ID is properly formatted
      const salespersonId = parseInt(id);
      if (isNaN(salespersonId)) {
        throw new Error('Invalid salesperson ID');
      }
      
      await apiClient.delete(`/Salesperson/${salespersonId}`);
      return true;
    } catch (error) {
      console.error('Error deleting salesperson:', error);
      console.error('Attempting to delete salesperson with ID:', id);
      throw new Error(`Failed to delete salesperson: ${error.message}`);
    }
  },
};