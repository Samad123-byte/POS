import React, { useState } from 'react';
import { X, Package } from 'lucide-react';
import Swal from 'sweetalert2';


const AddProductModal = ({ isOpen, onClose, onAdd, existingProducts = [] }) => { // 👈 added prop
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    costPrice: '',
    retailPrice: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Check duplicate by code (case-insensitive)
    const isDuplicate = existingProducts.some(
      (p) => p.code && p.code.toLowerCase() === formData.code.toLowerCase()
    );

    if (isDuplicate) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Code',
        text: 'This product code already exists. Please enter a unique one.',
      });
      return; // stop submission
    }

    // ✅ Optional: check duplicate by name
    const isNameDuplicate = existingProducts.some(
      (p) => p.name.toLowerCase() === formData.name.toLowerCase()
    );

    if (isNameDuplicate) {
      Swal.fire({
        icon: 'warning',
        title: 'Duplicate Name',
        text: 'A product with this name already exists. Please confirm it’s not a duplicate.',
      });
      return;
    }

    await onAdd(formData);
    setFormData({ name: '', code: '', costPrice: '', retailPrice: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Add Product</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Product Code
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Enter product code"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                Cost Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                Retail Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.retailPrice}
                onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Product
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
