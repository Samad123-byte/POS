import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const EditProductModal = ({ isOpen, onClose, onUpdate, product, existingProducts }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    costPrice: '',
    retailPrice: ''
  });
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    if (product) {
      const productData = {
        name: product.name,
        code: product.code,
        costPrice: product.costPrice.toString(),
        retailPrice: product.retailPrice.toString()
      };
      setFormData(productData);
      setOriginalData({ ...productData });
    }
  }, [product]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);

  const hasChanges = () => {
    if (!originalData) return false;
    return (
      originalData.name !== formData.name ||
      originalData.code !== formData.code ||
      originalData.costPrice !== formData.costPrice ||
      originalData.retailPrice !== formData.retailPrice
    );
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code || !formData.costPrice || !formData.retailPrice) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please fill in all required fields!'
      });
      return;
    }

    // ✅ Check for duplicate product codes
    const duplicate = existingProducts.find(
      (p) => p.code === formData.code && p.id !== product.id
    );
    if (duplicate) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Code',
        text: 'This product code already exists. Please use a unique code.'
      });
      return;
    }

    if (!hasChanges()) {
      Swal.fire({
        icon: 'info',
        title: 'No Changes',
        text: 'No changes made to save!',
        timer: 1500,
        showConfirmButton: false
      });
      return;
    }

    const updatedProduct = {
      ...product,
      name: formData.name,
      code: formData.code,
      costPrice: parseFloat(formData.costPrice),
      retailPrice: parseFloat(formData.retailPrice),
      editDate: new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };

    onUpdate(updatedProduct);
    onClose();

    Swal.fire({
      icon: 'success',
      title: 'Updated!',
      text: 'Product updated successfully!',
      timer: 1500,
      showConfirmButton: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-indigo-700">Edit Product</h3>
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">ID</label>
            <input
              type="text"
              value={product?.id || ''}
              disabled
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed font-semibold text-blue-600"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Product Name"
            />
          </div>

          {/* ✅ Code is now editable */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Product Code"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Cost Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Cost Price"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Retail Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.retailPrice}
              onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Retail Price"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 font-semibold"
            >
              Update
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
