// hooks/useProducts.js
import { useState } from 'react';
import { productService } from '../services/productService';
import Swal from 'sweetalert2';

const useProducts = () => {
  const [products, setProducts] = useState([]);

  const transformProduct = (product) => ({
    id: product.ProductId,
    name: product.Name,
    code: product.Code,
    costPrice: product.CostPrice,
    retailPrice: product.RetailPrice,
    creationDate: new Date(product.CreationDate).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    editDate: product.UpdatedDate ? new Date(product.UpdatedDate).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) : null
  });

  const loadProducts = async () => {
    try {
      const productsData = await productService.getAllProducts();
      setProducts(productsData.map(transformProduct));
      return productsData.map(transformProduct);
    } catch (error) {
      console.error('Error loading products:', error);
      throw error;
    }
  };

  const handleAddProduct = async (product) => {
    try {
      const backendProduct = {
        Name: product.name,
        Code: product.code,
        CostPrice: product.costPrice,
        RetailPrice: product.retailPrice
      };
      
      const createdProduct = await productService.createProduct(backendProduct);
      const newProduct = transformProduct(createdProduct);
      
      setProducts(prev => [...prev, newProduct]);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Product added successfully!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error adding product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add product. Please try again.',
      });
    }
  };

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      const creationDateISO = updatedProduct.creationDate ? 
        new Date(updatedProduct.creationDate.split(' ').join('T')).toISOString() :
        new Date().toISOString();

      const backendProduct = {
        Name: updatedProduct.name,
        Code: updatedProduct.code,
        CostPrice: updatedProduct.costPrice,
        RetailPrice: updatedProduct.retailPrice,
        CreationDate: creationDateISO
      };
      
      await productService.updateProduct(updatedProduct.id, backendProduct);
      
      const updatedProductWithNewEditDate = {
        ...updatedProduct,
        editDate: new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };
      
      setProducts(prev => prev.map(product => 
        product.id === updatedProduct.id ? updatedProductWithNewEditDate : product
      ));

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Product updated successfully!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update product. Please try again.',
      });
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await productService.deleteProduct(productId);
      setProducts(prev => prev.filter(product => product.id !== productId));
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Product has been deleted.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete product. Please try again.',
      });
    }
  };

  return {
    products,
    setProducts,
    loadProducts,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct
  };
};

export default useProducts;