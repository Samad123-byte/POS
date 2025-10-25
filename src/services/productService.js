import apiClient from './apiClient';

export const productService = {
  // ✅ Add pagination parameters (BACKWARD COMPATIBLE - works with old code too)
  getAllProducts: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get('/Products/getAll', {
        params: { pageNumber, pageSize }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  // ✅ Rest stays the same
  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`/Products/getById/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  },

  createProduct: async (product) => {
    try {
      const productData = {
        Name: product.Name || product.name,
        Code: product.Code || product.code,
        CostPrice: parseFloat(product.CostPrice || product.costPrice),
        RetailPrice: parseFloat(product.RetailPrice || product.retailPrice),
      };
      
      const response = await apiClient.post('/Products/create', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  },

  updateProduct: async (id, product) => {
    try {
      const productData = {
        ProductId: parseInt(id),
        Name: product.Name || product.name,
        Code: product.Code || product.code,
        CostPrice: parseFloat(product.CostPrice || product.costPrice),
        RetailPrice: parseFloat(product.RetailPrice || product.retailPrice),
        CreationDate: product.CreationDate || product.creationDate || new Date().toISOString(),
      };
      
      const response = await apiClient.post('/Products/update', productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await apiClient.post('/Products/delete', id, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  },
};