import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Search, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import { productService } from '../services/productService';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import Pagination from './Pagination';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getAll(currentPage, pageSize);
      setProducts(response.data || []);
      setTotalPages(response.totalPages || 1);
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
      await productService.create(data);
      Swal.fire('Success', 'Product added successfully!', 'success');
      // ✅ Go to page 1 to see new product at top
      setCurrentPage(1);
      loadProducts();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || error.message, 'error');
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      const data = {
        ...productData,
        costPrice: parseFloat(productData.costPrice) || 0,
        retailPrice: parseFloat(productData.retailPrice) || 0
      };
      await productService.update(data);
      Swal.fire('Success', 'Product updated successfully!', 'success');
      loadProducts();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || error.message, 'error');
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

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = React.useMemo(() => {
    if (!sortConfig.key) return filteredProducts;

    return [...filteredProducts].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'costPrice' || sortConfig.key === 'retailPrice') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortConfig.key === 'productId') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else {
        aValue = aValue?.toString().toLowerCase() || '';
        bValue = bValue?.toString().toLowerCase() || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProducts, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 text-gray-300">↕</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="ml-1 text-white">↑</span> : 
      <span className="ml-1 text-white">↓</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
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
                      <th 
                        className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors"
                        onClick={() => handleSort('productId')}
                      >
                        ID {getSortIcon('productId')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        Product Name {getSortIcon('name')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors"
                        onClick={() => handleSort('code')}
                      >
                        Code {getSortIcon('code')}
                      </th>
                      <th 
                        className="px-6 py-4 text-right font-bold text-sm uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors"
                        onClick={() => handleSort('costPrice')}
                      >
                        Cost Price {getSortIcon('costPrice')}
                      </th>
                      <th 
                        className="px-6 py-4 text-right font-bold text-sm uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors"
                        onClick={() => handleSort('retailPrice')}
                      >
                        Retail Price {getSortIcon('retailPrice')}
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Updated</th>
                      <th className="px-6 py-4 text-center font-bold text-sm uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedProducts.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg font-medium">No products found</p>
                          <p className="text-gray-400 text-sm mt-2">Add your first product to get started</p>
                        </td>
                      </tr>
                    ) : (
                      sortedProducts.map((product, index) => (
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

            <div className="mt-6">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}

        <AddProductModal 
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddProduct}
        />

        <EditProductModal 
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateProduct}
          product={editingProduct}
        />
      </div>
    </div>
  );
};

export default Products;
