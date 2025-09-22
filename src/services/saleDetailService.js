import apiClient from './apiClient';

export const saleDetailService = {
  getAllSaleDetails: async () => {
    try {
      const response = await apiClient.get('/SaleDetails');
      // Backend returns: { SaleDetailId, SaleId, ProductId, RetailPrice, Quantity, Discount }
      return response.data;
    } catch (error) {
      console.error('Error fetching sale details:', error);
      throw new Error(`Failed to fetch sale details: ${error.message}`);
    }
  },

  getSaleDetailById: async (id) => {
    try {
      const response = await apiClient.get(`/SaleDetails/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sale detail:', error);
      throw new Error(`Failed to fetch sale detail: ${error.message}`);
    }
  },

  getSaleDetailsBySaleId: async (saleId) => {
    try {
      const response = await apiClient.get(`/SaleDetails/BySale/${saleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sale details by sale ID:', error);
      throw new Error(`Failed to fetch sale details: ${error.message}`);
    }
  },

  getSaleTotal: async (saleId) => {
    try {
      const response = await apiClient.get(`/SaleDetails/Total/${saleId}`);
      // This returns just a decimal value, not an object
      return response.data;
    } catch (error) {
      console.error('Error fetching sale total:', error);
      throw new Error(`Failed to fetch sale total: ${error.message}`);
    }
  },

  createSaleDetail: async (saleDetail) => {
    try {
      // Send data with backend property names
      const saleDetailData = {
        SaleId: saleDetail.SaleId,
        ProductId: saleDetail.ProductId,
        RetailPrice: saleDetail.RetailPrice,
        Quantity: saleDetail.Quantity,
        Discount: saleDetail.Discount || 0,
      };
      
      const response = await apiClient.post('/SaleDetails', saleDetailData);
      return response.data;
    } catch (error) {
      console.error('Error creating sale detail:', error);
      throw new Error(`Failed to create sale detail: ${error.message}`);
    }
  },

  createMultipleSaleDetails: async (saleDetails) => {
    try {
      // Convert each item to backend property names
      const saleDetailsData = saleDetails.map(detail => ({
        SaleId: detail.SaleId,
        ProductId: detail.ProductId,
        RetailPrice: detail.RetailPrice,
        Quantity: detail.Quantity,
        Discount: detail.Discount || 0,
      }));
      
      const response = await apiClient.post('/SaleDetails/Batch', saleDetailsData);
      return response.data;
    } catch (error) {
      console.error('Error creating multiple sale details:', error);
      throw new Error(`Failed to create sale details: ${error.message}`);
    }
  },

  updateSaleDetail: async (id, saleDetail) => {
    try {
      // Send data with backend property names
      const saleDetailData = {
        SaleDetailId: id,
        SaleId: saleDetail.SaleId,
        ProductId: saleDetail.ProductId,
        RetailPrice: saleDetail.RetailPrice,
        Quantity: saleDetail.Quantity,
        Discount: saleDetail.Discount || 0,
      };
      
      await apiClient.put(`/SaleDetails/${id}`, saleDetailData);
      return saleDetailData;
    } catch (error) {
      console.error('Error updating sale detail:', error);
      throw new Error(`Failed to update sale detail: ${error.message}`);
    }
  },

  deleteSaleDetail: async (id) => {
    try {
      await apiClient.delete(`/SaleDetails/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting sale detail:', error);
      throw new Error(`Failed to delete sale detail: ${error.message}`);
    }
  },

  deleteSaleDetailsBySaleId: async (saleId) => {
    try {
      await apiClient.delete(`/SaleDetails/BySale/${saleId}`);
      return true;
    } catch (error) {
      console.error('Error deleting sale details by sale ID:', error);
      throw new Error(`Failed to delete sale details: ${error.message}`);
    }
  },
};