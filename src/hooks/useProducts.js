import { useState } from 'react';
import { productService } from '../services/productService';
import Swal from 'sweetalert2';

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [rawProducts, setRawProducts] = useState([]);
  
  // ✅ ADD PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const transformProduct = (product) => ({
    id: product.ProductId,
    name: product.Name,
    code: product.Code,
    costPrice: product.CostPrice,
    retailPrice: product.RetailPrice,
    creationDate: product.CreationDate ? new Date(product.CreationDate).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) : null,
    editDate: (product.UpdatedDate && product.UpdatedDate !== null) 
              ? new Date(product.UpdatedDate).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                }) : null
  });

  // ✅ UPDATE loadProducts to accept pagination
const loadProducts = async (page = 1, size = 10) => {
  try {
    const response = await productService.getAllProducts(page, size);
    
    console.log('API Response:', response); // Debug log
    
    // ✅ Handle both PascalCase (Data) and camelCase (data) from backend
    const data = response.Data || response.data;
    const currentPageNum = response.CurrentPage || response.currentPage;
    const pageSizeNum = response.PageSize || response.pageSize;
    const totalRec = response.TotalRecords || response.totalRecords;
    const totalPgs = response.TotalPages || response.totalPages;
    
    // ✅ Check if response has pagination data
    if (data && Array.isArray(data)) {
      // Paginated response
      setRawProducts(data);
      const transformed = data.map(transformProduct);
      setProducts(transformed);
      setCurrentPage(currentPageNum || 1);
      setPageSize(pageSizeNum || 10);
      setTotalRecords(totalRec || 0);
      setTotalPages(totalPgs || 1);
      
      return { transformed, raw: data, pagination: response };
    } else if (Array.isArray(response)) {
      // Non-paginated response (backward compatible)
      setRawProducts(response);
      const transformed = response.map(transformProduct);
      setProducts(transformed);
      return { transformed, raw: response };
    } else {
      console.error('Unexpected response format:', response);
      throw new Error('Invalid response format from server');
    }
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
      
      // ✅ Reload current page after adding
      await loadProducts(currentPage, pageSize);
      
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
        new Date(updatedProduct.creationDate.replace(/(\d{2})\/(\d{2})\/(\d{4}), (.*)/, '$3-$2-$1T$4')).toISOString() :
        new Date().toISOString();

      const backendProduct = {
        Name: updatedProduct.name,
        Code: updatedProduct.code,
        CostPrice: updatedProduct.costPrice,
        RetailPrice: updatedProduct.retailPrice,
        CreationDate: creationDateISO
      };
      
      await productService.updateProduct(updatedProduct.id, backendProduct);
      
      // ✅ Reload current page after updating
      await loadProducts(currentPage, pageSize);

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
        text: 'Failed to update product.',
      });
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await productService.deleteProduct(productId);
      
      // ✅ Reload current page after deleting
      await loadProducts(currentPage, pageSize);
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Product has been deleted.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      
      const errorMessage = error.response?.data?.message || 
                          'Cannot delete product. This product is referenced in existing sale details. Please remove it from all sales before deleting the product.';
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    }
  };

  return {
    products,
    rawProducts,
    setProducts,
    loadProducts,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    // ✅ EXPORT PAGINATION STATE
    currentPage,
    pageSize,
    totalRecords,
    totalPages,
    setCurrentPage,
    setPageSize
  };
};

export default useProducts;