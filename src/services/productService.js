import apiClient from './apiClient';

export const productService = {
  getAllProducts: async () => {
    try {
      const response = await apiClient.get('/Products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`/Products/${id}`);
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
      
      const response = await apiClient.post('/Products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  },

  updateProduct: async (id, product) => {
    try {
      // Ensure we're sending the correct data structure
      const productData = {
        ProductId: parseInt(id),
        Name: product.Name || product.name,
        Code: product.Code || product.code,
        CostPrice: parseFloat(product.CostPrice || product.costPrice),
        RetailPrice: parseFloat(product.RetailPrice || product.retailPrice),
        CreationDate: product.CreationDate || product.creationDate || new Date().toISOString(),
      };
      
      // Use PUT with the ID in the URL and full object in body
      const response = await apiClient.put(`/Products/${id}`, productData);
      
      // Since PUT might return 204 No Content, return the updated data
      return {
        ...productData,
        UpdatedDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating product:', error);
      // Log the actual request data for debugging
      console.error('Request data:', {
        url: `/Products/${id}`,
        data: product
      });
      throw new Error(`Failed to update product: ${error.message}`);
    }
  },

  deleteProduct: async (id) => {
    try {
      // Make sure ID is properly formatted
      const productId = parseInt(id);
      if (isNaN(productId)) {
        throw new Error('Invalid product ID');
      }
      
      await apiClient.delete(`/Products/${productId}`);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      console.error('Attempting to delete product with ID:', id);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  },
};