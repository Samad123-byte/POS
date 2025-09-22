import React, { useState } from 'react';
import Swal from 'sweetalert2';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';

const Products = ({ products, onUpdateProduct, onDeleteProduct, onAddProduct }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = (productId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteProduct(productId);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Product has been deleted.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = React.useMemo(() => {
    if (!sortConfig.key) return filteredProducts;

    return [...filteredProducts].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle different data types
      if (sortConfig.key === 'costPrice' || sortConfig.key === 'retailPrice') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortConfig.key === 'id') {
        aValue = parseInt(aValue);
        bValue = parseInt(bValue);
      } else if (sortConfig.key === 'creationDate' || sortConfig.key === 'editDate') {
        // Convert dates to comparable format
        aValue = new Date(aValue || '1900-01-01').getTime();
        bValue = new Date(bValue || '1900-01-01').getTime();
      } else {
        // String comparison
        aValue = aValue?.toString().toLowerCase() || '';
        bValue = bValue?.toString().toLowerCase() || '';
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
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
      return <span className="ml-1 text-gray-400">↕</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="ml-1 text-white">↑</span> : 
      <span className="ml-1 text-white">↓</span>;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">Products</h2>
      
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold"
        >
          Add New Product
        </button>
        
        <input 
          type="text" 
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <tr>
            <th 
              className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
              onClick={() => handleSort('id')}
            >
              ID {getSortIcon('id')}
            </th>
            <th 
              className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
              onClick={() => handleSort('name')}
            >
              NAME {getSortIcon('name')}
            </th>
            <th 
              className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
              onClick={() => handleSort('code')}
            >
              CODE {getSortIcon('code')}
            </th>
            <th 
              className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
              onClick={() => handleSort('costPrice')}
            >
              COST PRICE {getSortIcon('costPrice')}
            </th>
            <th 
              className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
              onClick={() => handleSort('retailPrice')}
            >
              RETAIL PRICE {getSortIcon('retailPrice')}
            </th>
            <th 
              className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
              onClick={() => handleSort('creationDate')}
            >
              CREATION DATE {getSortIcon('creationDate')}
            </th>
            <th 
              className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
              onClick={() => handleSort('editDate')}
            >
              EDIT DATE {getSortIcon('editDate')}
            </th>
            <th className="border border-gray-300 px-4 py-3 font-semibold">ACTION</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map(product => (
            <tr key={product.id} className="border-b hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-3 font-semibold text-blue-600">{product.id}</td>
              <td className="border border-gray-300 px-4 py-3">{product.name}</td>
              <td className="border border-gray-300 px-4 py-3">{product.code}</td>
              <td className="border border-gray-300 px-4 py-3">{product.costPrice}</td>
              <td className="border border-gray-300 px-4 py-3">{product.retailPrice}</td>
              <td className="border border-gray-300 px-4 py-3">{product.creationDate}</td>
              <td className="border border-gray-300 px-4 py-3">{product.editDate || '--'}</td>
              <td className="border border-gray-300 px-4 py-3">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="bg-cyan-500 text-white px-3 py-1 rounded-md hover:bg-cyan-600 transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AddProductModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onAddProduct}
        existingProducts={products}
      />

      <EditProductModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdate={onUpdateProduct}
        product={editingProduct}
        existingProducts={products}
      />
    </div>
  );
};

export default Products;