import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const AddProductModal = ({ isOpen, onClose, onAdd, existingProducts }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    costPrice: '',
    retailPrice: ''
  });

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Generate next ID
  const getNextId = () => {
    if (existingProducts.length === 0) return 1;
    return Math.max(...existingProducts.map(p => p.id)) + 1;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.code && formData.costPrice && formData.retailPrice) {
      // Check for duplicate code
      const existingProduct = existingProducts.find(p => p.code.toLowerCase() === formData.code.toLowerCase());
      if (existingProduct) {
        Swal.fire({
          icon: 'error',
          title: 'Duplicate Code',
          text: 'A product with this code already exists!',
        });
        return;
      }

      const newProduct = {
        id: getNextId(), // Auto-generated unique ID
        name: formData.name,
        code: formData.code,
        costPrice: parseFloat(formData.costPrice),
        retailPrice: parseFloat(formData.retailPrice),
        creationDate: new Date().toLocaleString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }),
        editDate: ''
      };
      onAdd(newProduct);
      setFormData({ name: '', code: '', costPrice: '', retailPrice: '' });
      onClose();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Product added successfully!',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-indigo-700">Add Product</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">ID (Auto-generated)</label>
            <input 
              type="text" 
              value={getNextId()}
              disabled
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed font-semibold text-blue-600"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Product Name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Code</label>
            <input 
              type="text" 
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Product Code"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Cost Price</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Cost Price"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Retail Price</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.retailPrice}
              onChange={(e) => setFormData({...formData, retailPrice: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Retail Price"
              required
            />
          </div>
          <div className="flex gap-3">
            <button 
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 font-semibold"
            >
              Add
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;