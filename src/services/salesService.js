import apiClient from './apiClient';

export const salesService = {
  getAllSales: async () => {
    try {
      const response = await apiClient.get('/Sales');
      console.log('getAllSales response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales:', error);
      if (error.response?.status === 404) {
        throw new Error('Sales endpoint not found. Check if your backend is running on the correct port and the Sales controller exists.');
      }
      throw new Error(`Failed to fetch sales: ${error.response?.data?.message || error.message}`);
    }
  },

  getSaleById: async (id) => {
    try {
      const response = await apiClient.get(`/Sales/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sale:', error);
      throw new Error(`Failed to fetch sale: ${error.response?.data?.message || error.message}`);
    }
  },

  getSaleWithDetails: async (id) => {
    try {
      const response = await apiClient.get(`/Sales/${id}/WithDetails`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sale with details:', error);
      throw new Error(`Failed to fetch sale details: ${error.response?.data?.message || error.message}`);
    }
  },

  getSalesByDateRange: async (startDate, endDate) => {
    try {
      const response = await apiClient.get(`/Sales/ByDateRange?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales by date range:', error);
      throw new Error(`Failed to fetch sales: ${error.response?.data?.message || error.message}`);
    }
  },

  getSalesBySalesperson: async (salespersonId) => {
    try {
      const response = await apiClient.get(`/Sales/BySalesperson/${salespersonId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales by salesperson:', error);
      throw new Error(`Failed to fetch sales: ${error.response?.data?.message || error.message}`);
    }
  },

  createSale: async (sale) => {
    try {
      // Ensure the data matches what your backend expects
      const saleData = {
        Total: parseFloat(sale.Total || sale.total || 0),
        SaleDate: sale.SaleDate || sale.saleDate || new Date().toISOString(),
        SalespersonId: sale.SalespersonId || sale.salespersonId || null,
        Comments: sale.Comments || sale.comments || null,
      };
      
      console.log('Creating sale with data:', saleData);
      
      const response = await apiClient.post('/Sales', saleData);
      return response.data;
    } catch (error) {
      console.error('Error creating sale:', error);
      console.error('Request payload:', sale);
      throw new Error(`Failed to create sale: ${error.response?.data?.message || error.message}`);
    }
  },

  updateSale: async (id, sale) => {
    try {
      // Parse the sale time properly if it's in display format
      let saleDate;
      if (sale.saleTime && typeof sale.saleTime === 'string') {
        // Convert from display format "22/09/2025, 09:59:43" to ISO string
        const parts = sale.saleTime.split(', ');
        if (parts.length === 2) {
          const datePart = parts[0].split('/').reverse().join('-'); // Convert DD/MM/YYYY to YYYY-MM-DD
          const timePart = parts[1];
          saleDate = new Date(`${datePart}T${timePart}`).toISOString();
        } else {
          saleDate = new Date().toISOString();
        }
      } else {
        saleDate = sale.SaleDate || sale.saleDate || new Date().toISOString();
      }

      const saleData = {
        SaleId: parseInt(id),
        Total: parseFloat(sale.Total || sale.total || 0),
        SaleDate: saleDate,
        SalespersonId: sale.SalespersonId || sale.salespersonId || null,
        Comments: sale.Comments || sale.comments || null,
      };
      
      console.log('Updating sale with data:', saleData);
      
      const response = await apiClient.put(`/Sales/${id}`, saleData);
      
      // Since PUT typically returns 204 No Content, return the updated data
      return {
        ...saleData,
        UpdatedDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating sale:', error);
      console.error('Request data:', { url: `/Sales/${id}`, data: sale });
      throw new Error(`Failed to update sale: ${error.response?.data?.message || error.message}`);
    }
  },

  deleteSale: async (id) => {
    try {
      const saleId = parseInt(id);
      if (isNaN(saleId)) {
        throw new Error('Invalid sale ID');
      }
      
      console.log('Attempting to delete sale with ID:', saleId);
      
      await apiClient.delete(`/Sales/${saleId}`);
      return true;
    } catch (error) {
      console.error('Error deleting sale:', error);
      console.error('Attempting to delete sale with ID:', id);
      throw new Error(`Failed to delete sale: ${error.response?.data?.message || error.message}`);
    }
  },
};