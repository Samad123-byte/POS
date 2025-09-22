import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const SaleDetailModal = ({ isOpen, onClose, sale, products, salespersons, onUpdateSale, onDeleteSale }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedSale, setEditedSale] = useState(null);
  const [originalSale, setOriginalSale] = useState(null);

  useEffect(() => {
    if (sale) {
      const saleData = {...sale};
      setEditedSale(saleData);
      setOriginalSale(JSON.parse(JSON.stringify(saleData))); // Deep copy for comparison
    }
  }, [sale]);

  // Add Escape key functionality
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        if (editMode) {
          // If in edit mode, cancel editing first
          setEditMode(false);
          setEditedSale({...originalSale});
        } else {
          // If not in edit mode, close the modal
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, editMode, onClose, originalSale]);

  const calculateItemAmount = (quantity, price, discount) => {
    const discountAmount = (price * discount) / 100;
    const discountedPrice = price - discountAmount;
    return quantity * discountedPrice;
  };

  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Quantity',
        text: 'Quantity cannot be negative!',
      });
      return;
    }

    const updatedItems = [...editedSale.items];
    const item = updatedItems[index];
    const quantity = parseInt(newQuantity) || 0;
    
    if (quantity === 0) {
      removeItem(index);
      return;
    }
    
    updatedItems[index] = {
      ...item,
      quantity,
      amount: calculateItemAmount(quantity, item.price, item.discount || 0)
    };

    const newTotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);

    setEditedSale({
      ...editedSale,
      items: updatedItems,
      total: newTotal
    });
  };

  const updateItemDiscount = (index, newDiscount) => {
    if (newDiscount < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Discount',
        text: 'Discount cannot be negative!',
      });
      return;
    }
    if (newDiscount > 100) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Discount',
        text: 'Discount cannot be more than 100%!',
      });
      return;
    }

    const updatedItems = [...editedSale.items];
    const item = updatedItems[index];
    const discount = parseFloat(newDiscount) || 0;
    
    updatedItems[index] = {
      ...item,
      discount,
      amount: calculateItemAmount(item.quantity, item.price, discount)
    };

    const newTotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);

    setEditedSale({
      ...editedSale,
      items: updatedItems,
      total: newTotal
    });
  };

  const removeItem = (index) => {
    const updatedItems = editedSale.items.filter((_, i) => i !== index);
    const newTotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);

    setEditedSale({
      ...editedSale,
      items: updatedItems,
      total: newTotal
    });
  };

  const hasChanges = () => {
    if (!originalSale || !editedSale) return false;
    
    // Compare main fields
    if (originalSale.salespersonName !== editedSale.salespersonName) return true;
    if (originalSale.comments !== editedSale.comments) return true;
    if (Math.abs(originalSale.total - editedSale.total) > 0.01) return true;
    
    // Compare items
    if (originalSale.items.length !== editedSale.items.length) return true;
    
    for (let i = 0; i < originalSale.items.length; i++) {
      const origItem = originalSale.items[i];
      const editItem = editedSale.items[i];
      
      if (origItem.quantity !== editItem.quantity) return true;
      if (Math.abs((origItem.discount || 0) - (editItem.discount || 0)) > 0.01) return true;
      if (Math.abs(origItem.amount - editItem.amount) > 0.01) return true;
    }
    
    return false;
  };

  const handleUpdate = () => {
    if (!editedSale) return;

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

    const updatedSale = {
      ...editedSale,
      editDate: new Date().toLocaleString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    };
    
    onUpdateSale(updatedSale);
    setEditMode(false);
    onClose();
    
    Swal.fire({
      icon: 'success',
      title: 'Updated!',
      text: 'Sale updated successfully!',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleDelete = () => {
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
        onDeleteSale(sale.id);
        onClose();
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Sale has been deleted.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-200 transform transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <h3 className="text-xl font-bold">Sale Details</h3>
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
              ID: #{sale.id}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200 text-xl font-bold"
            title="Close (ESC)"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Sale Information Grid */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              Sale Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">Sale Time:</label>
                <input 
                  type="text" 
                  value={editedSale?.saleTime || ''}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-700 shadow-inner focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">Total Amount:</label>
                <input 
                  type="text" 
                  value={`$${editedSale?.total?.toFixed(2) || '0.00'}`}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 font-bold text-green-700 text-lg shadow-inner focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">Salesperson:</label>
                {editMode ? (
                  <select 
                    value={editedSale?.salespersonName || ''}
                    onChange={(e) => setEditedSale({...editedSale, salespersonName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {salespersons.map(sp => (
                      <option key={sp.id} value={sp.name}>{sp.name}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={editedSale?.salespersonName || ''}
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-700 shadow-inner focus:outline-none"
                  />
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">Last Edit:</label>
                <input 
                  type="text" 
                  value={editedSale?.editDate || 'Never edited'}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-700 shadow-inner focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
              Comments:
            </label>
            {editMode ? (
              <textarea 
                value={editedSale?.comments || ''}
                onChange={(e) => setEditedSale({...editedSale, comments: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Add comments about this sale..."
              />
            ) : (
              <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-700 min-h-[96px] shadow-inner">
                {editedSale?.comments || 'No comments added'}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                Sale Items ({editedSale?.items?.length || 0})
              </h4>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold uppercase tracking-wide text-sm">Code</th>
                    <th className="px-6 py-4 text-left font-semibold uppercase tracking-wide text-sm">Product Name</th>
                    <th className="px-6 py-4 text-center font-semibold uppercase tracking-wide text-sm">Quantity</th>
                    <th className="px-6 py-4 text-center font-semibold uppercase tracking-wide text-sm">Discount</th>
                    <th className="px-6 py-4 text-right font-semibold uppercase tracking-wide text-sm">Price</th>
                    <th className="px-6 py-4 text-right font-semibold uppercase tracking-wide text-sm">Amount</th>
                    {editMode && <th className="px-6 py-4 text-center font-semibold uppercase tracking-wide text-sm">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {editedSale?.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 font-mono text-sm text-gray-900 bg-gray-50">{item.code}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-center">
                        {editMode ? (
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, e.target.value)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {item.quantity}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editMode ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.discount || 0}
                            onChange={(e) => updateItemDiscount(index, e.target.value)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            (item.discount || 0) > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.discount || 0}%
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">${item.price}</td>
                      <td className="px-6 py-4 text-right font-bold text-lg text-green-700">
                        ${item.amount.toFixed(2)}
                      </td>
                      {editMode && (
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => removeItem(index)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-full text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                            title="Remove item"
                          >
                            ×
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {(!editedSale?.items || editedSale.items.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 border-2 border-gray-300 rounded"></div>
                  </div>
                  <p className="text-lg font-medium">No items found</p>
                  <p className="text-sm">This sale doesn't have any items yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">ESC</kbd> to close
          </div>
          <div className="flex gap-3">
            {editMode ? (
              <>
                <button 
                  onClick={handleUpdate}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Save Changes
                </button>
                <button 
                  onClick={() => {
                    setEditMode(false);
                    setEditedSale({...originalSale});
                  }}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Edit Sale
                </button>
                <button 
                  onClick={handleDelete}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Delete Sale
                </button>
                <button 
                  onClick={onClose}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailModal;