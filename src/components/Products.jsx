import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Search, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import { productService } from '../services/productService';
import Pagination from './Pagination';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';


const Products = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // ✅ Load products from backend with pagination
  useEffect(() => {
    loadProducts();
  }, [currentPage]); // ✅ Re-fetch when page changes

  const loadProducts = async () => {
    setLoading(true);
    try {
      // ✅ Calculate startIndex and endIndex (0-based)
      const startIndex = (currentPage - 1) * pageSize; // Page 1: 0, Page 2: 10
      const endIndex = startIndex + pageSize - 1;      // Page 1: 9, Page 2: 19

      console.log('🔄 Fetching products:', { currentPage, startIndex, endIndex });

      // ✅ Backend returns ONLY the requested page
      const response = await productService.getAll(startIndex, endIndex);
      
      console.log('✅ Response:', {
        itemsReceived: response.data?.length,
        totalRecords: response.totalRecords,
        startIndex: response.startIndex,
        endIndex: response.endIndex
      });

      setProducts(response.data || []);
      setTotalRecords(response.totalRecords || 0);
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
    setLoading(false);
  };

  const handleAddProduct = async (productData) => {
    try {
      const data = {
        ...productData,
        costPrice: parseFloat(productData.costPrice) || 0,
        retailPrice: parseFloat(productData.retailPrice) || 0
      };

      const res = await productService.create(data);

      if (res.success) {
        Swal.fire('Success', res.message || 'Product added successfully!', 'success');
        setCurrentPage(1); // Go to first page
        loadProducts();
      } else {
        Swal.fire('Error', res.message || 'Failed to create product', 'error');
      }

      return res;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      Swal.fire('Error', message, 'error');
      return { success: false, message };
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      const data = {
        ...productData,
        costPrice: parseFloat(productData.costPrice) || 0,
        retailPrice: parseFloat(productData.retailPrice) || 0
      };

      const res = await productService.update(data);

      if (res.success) {
        Swal.fire('Success', res.message || 'Product updated successfully!', 'success');
        loadProducts(); // Reload current page
      } else {
        Swal.fire('Error', res.message || 'Failed to update product', 'error');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      Swal.fire('Error', message, 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await productService.delete(productId);
        if (response.success) {
          Swal.fire('Deleted!', response.message, 'success');
          loadProducts();
        } else {
          Swal.fire('Error', response.message, 'error');
        }
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || error.message, 'error');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  // Handle page change - triggers new API call
  const handlePageChange = (newPage) => {
    console.log('📍 Changing page from', currentPage, 'to', newPage);
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border-2 border-white/30">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Products</h1>
                  <p className="text-indigo-100 text-sm mt-1">Manage your product inventory</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <div className="text-white text-sm font-medium">Total Products</div>
                <div className="text-white text-2xl font-bold">{totalRecords}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} /> Add New Product
            </button>
            
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 w-80 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-6">
          <div className="font-bold text-blue-800 mb-2"></div>
          <div className="grid grid-cols-4 gap-4 text-sm text-blue-900">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-600">Current Page</div>
              <div className="text-xl font-bold">{currentPage}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-600">Page Size</div>
              <div className="text-xl font-bold">{pageSize}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-600">Items on Page</div>
              <div className="text-xl font-bold">{products.length}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-600">Total Records</div>
              <div className="text-xl font-bold">{totalRecords}</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-800">
           
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">Loading products...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Product Name</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Code</th>
                      <th className="px-6 py-4 text-right font-bold text-sm uppercase tracking-wider">Cost Price</th>
                      <th className="px-6 py-4 text-right font-bold text-sm uppercase tracking-wider">Retail Price</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Updated</th>
                      <th className="px-6 py-4 text-center font-bold text-sm uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg font-medium">No products found</p>
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.productId} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                          <td className="px-6 py-4">
                            <div className="bg-indigo-100 rounded-lg px-3 py-1 inline-block">
                              <span className="font-bold text-indigo-700">#{product.productId}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">{product.name}</td>
                          <td className="px-6 py-4">
                            <span className="bg-gray-100 px-3 py-1 rounded-lg text-gray-700 font-medium">
                              {product.code || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-semibold text-orange-600">
                              ${product.costPrice?.toFixed(2) || '0.00'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-green-600 text-lg">
                              ${product.retailPrice?.toFixed(2) || '0.00'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDateTime(product.creationDate)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {product.updatedDate ? (
                              <span className="text-green-600 font-medium">
                                {formatDateTime(product.updatedDate)}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Not updated</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center">
                              <button 
                                onClick={() => handleEdit(product)}
                                className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors duration-200 font-semibold flex items-center gap-1 shadow-md hover:shadow-lg"
                              >
                                <Edit2 size={16} /> Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product.productId)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold flex items-center gap-1 shadow-md hover:shadow-lg"
                              >
                                <Trash2 size={16} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalRecords > 0 && (
              <div className="mt-6">
                <Pagination 
                  currentPage={currentPage}
                  totalRecords={totalRecords}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* Add Product Modal */}
<AddProductModal 
  isOpen={showAddModal}
  onClose={() => setShowAddModal(false)}
  onAdd={handleAddProduct}
/>

{/* Edit Product Modal */}
<EditProductModal 
  isOpen={showEditModal}
  onClose={() => setShowEditModal(false)}
  onUpdate={handleUpdateProduct}
  product={editingProduct}
/>

          </>
        )}
      </div>
    </div>
  );
};

export default Products;