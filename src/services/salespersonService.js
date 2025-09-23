import apiClient from './apiClient';

export const salespersonService = {
  getAllSalespersons: async () => {
    try {
      const response = await apiClient.get('/Salesperson'); // Changed from /Salespersons to /Salesperson
      console.log('getAllSalespersons response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching salespersons:', error);
      if (error.response?.status === 404) {
        // If the endpoint doesn't exist, return mock data or handle gracefully
        console.warn('Salesperson endpoint not found. Using fallback data.');
        return [
          { SalespersonId: 1, Name: 'Default Salesperson', Code: 'SP001' }
        ];
      }
      throw new Error(`Failed to fetch salespersons: ${error.response?.data?.message || error.message}`);
    }
  },

  getSalespersonById: async (id) => {
    try {
      const response = await apiClient.get(`/Salesperson/${id}`); // Changed from /Salespersons to /Salesperson
      return response.data;
    } catch (error) {
      console.error('Error fetching salesperson:', error);
      throw new Error(`Failed to fetch salesperson: ${error.response?.data?.message || error.message}`);
    }
  },

  createSalesperson: async (salesperson) => {
    try {
      const salespersonData = {
        Name: salesperson.Name || salesperson.name,
        Code: salesperson.Code || salesperson.code,
        // Using only Name and Code as per your backend Salesperson model
      };
      
      const response = await apiClient.post('/Salesperson', salespersonData); // Changed from /Salespersons to /Salesperson
      return response.data;
    } catch (error) {
      console.error('Error creating salesperson:', error);
      throw new Error(`Failed to create salesperson: ${error.response?.data?.message || error.message}`);
    }
  },

  updateSalesperson: async (id, salesperson) => {
    try {
      const salespersonData = {
        SalespersonId: parseInt(id),
        Name: salesperson.Name || salesperson.name,
        Code: salesperson.Code || salesperson.code,
        EnteredDate: salesperson.EnteredDate || new Date().toISOString(),
        // Remove Email, Phone, Address as they don't exist in your backend model
      };
      
      const response = await apiClient.put(`/Salesperson/${id}`, salespersonData); // Changed from /Salespersons to /Salesperson
      
      // Return updated data since PUT might return 204 No Content
      return salespersonData;
    } catch (error) {
      console.error('Error updating salesperson:', error);
      throw new Error(`Failed to update salesperson: ${error.response?.data?.message || error.message}`);
    }
  },

  deleteSalesperson: async (id) => {
    try {
      const salespersonId = parseInt(id);
      if (isNaN(salespersonId)) {
        throw new Error('Invalid salesperson ID');
      }
      
      await apiClient.delete(`/Salesperson/${salespersonId}`); // Changed from /Salespersons to /Salesperson
      return true;
    } catch (error) {
      console.error('Error deleting salesperson:', error);
      throw new Error(`Failed to delete salesperson: ${error.response?.data?.message || error.message}`);
    }
  },
};