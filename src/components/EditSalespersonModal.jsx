import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditSalespersonModal = ({ isOpen, onClose, onUpdate, salesperson }) => {
  const [formData, setFormData] = useState({
    salespersonId: '',
    name: '',
    code: ''
  });

  useEffect(() => {
    if (salesperson) {
      setFormData({
        salespersonId: salesperson.salespersonId,
        name: salesperson.name,
        code: salesperson.code
      });
    }
  }, [salesperson]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdate(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Edit Salesperson</h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded flex-1 hover:bg-blue-600"
            >
              Update
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSalespersonModal;