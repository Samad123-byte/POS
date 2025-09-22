import apiClient from './apiClient';

export const salesService = {
  getAllSales: async () => {
    try {
      const response = await apiClient.get('/Sales');
      return response.data;
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw new Error(`Failed to fetch sales: ${error.message}`);
    }
  },

  getSaleById: async (id) => {
    try {
      const response = await apiClient.get(`/Sales/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sale:', error);
      throw new Error(`Failed to fetch sale: ${error.message}`);
    }
  },

  getSaleWithDetails: async (id) => {
    try {
      const response = await apiClient.get(`/Sales/${id}/WithDetails`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sale with details:', error);
      throw new Error(`Failed to fetch sale details: ${error.message}`);
    }
  },

  getSalesByDateRange: async (startDate, endDate) => {
    try {
      const response = await apiClient.get(`/Sales/ByDateRange?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales by date range:', error);
      throw new Error(`Failed to fetch sales: ${error.message}`);
    }
  },

  getSalesBySalesperson: async (salespersonId) => {
    try {
      const response = await apiClient.get(`/Sales/BySalesperson/${salespersonId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales by salesperson:', error);
      throw new Error(`Failed to fetch sales: ${error.message}`);
    }
  },

  createSale: async (sale) => {
    try {
      const saleData = {
        Total: parseFloat(sale.Total || sale.total),
        SaleDate: sale.SaleDate || sale.saleDate || new Date().toISOString(),
        SalespersonId: parseInt(sale.SalespersonId || sale.salespersonId),
        Comments: sale.Comments || sale.comments || null,
      };
      
      const response = await apiClient.post('/Sales', saleData);
      return response.data;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw new Error(`Failed to create sale: ${error.message}`);
    }
  },

  updateSale: async (id, sale) => {
    try {
      // Parse the sale time properly if it's in display format
      let saleDate;
      if (sale.saleTime && typeof sale.saleTime === 'string') {
        // Convert from display format "22/09/2025, 09:59:43" to ISO string
        const parts = sale.saleTime.split(', ');
        const datePart = parts[0].split('/').reverse().join('-'); // Convert DD/MM/YYYY to YYYY-MM-DD
        const timePart = parts[1];
        saleDate = new Date(`${datePart}T${timePart}`).toISOString();
      } else {
        saleDate = sale.SaleDate || sale.saleDate || new Date().toISOString();
      }

      const saleData = {
        SaleId: parseInt(id),
        Total: parseFloat(sale.Total || sale.total),
        SaleDate: saleDate,
        SalespersonId: parseInt(sale.SalespersonId || sale.salespersonId),
        Comments: sale.Comments || sale.comments || null,
      };
      
      console.log('Updating sale with data:', saleData); // Debug log
      
      const response = await apiClient.put(`/Sales/${id}`, saleData);
      
      return {
        ...saleData,
        UpdatedDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating sale:', error);
      console.error('Request data:', {
        url: `/Sales/${id}`,
        data: sale
      });
      throw new Error(`Failed to update sale: ${error.message}`);
    }
  },

  deleteSale: async (id) => {
    try {
      // Make sure ID is properly formatted
      const saleId = parseInt(id);
      if (isNaN(saleId)) {
        throw new Error('Invalid sale ID');
      }
      
      console.log('Attempting to delete sale with ID:', saleId); // Debug log
      
      await apiClient.delete(`/Sales/${saleId}`);
      return true;
    } catch (error) {
      console.error('Error deleting sale:', error);
      console.error('Attempting to delete sale with ID:', id);
      throw new Error(`Failed to delete sale: ${error.message}`);
    }
  },
};