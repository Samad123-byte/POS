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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-blue px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-bold">Sale Details - ID: #{sale.id}</h3>
            <div className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
              Total: ${editedSale?.total?.toFixed(2) || '0.00'}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all duration-200 text-lg font-bold w-8 h-8 flex items-center justify-center"
            title="Close (ESC)"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-120px)]">
          {/* Sale Info - Compact Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Sale Time</label>
              <div className="text-sm bg-gray-50 p-2 rounded border">{editedSale?.saleTime || ''}</div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Salesperson</label>
              {editMode ? (
                <select 
                  value={editedSale?.salespersonName || ''}
                  onChange={(e) => setEditedSale({...editedSale, salespersonName: e.target.value})}
                  className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {salespersons.map(sp => (
                    <option key={sp.id} value={sp.name}>{sp.name}</option>
                  ))}
                </select>
              ) : (
                <div className="text-sm bg-gray-50 p-2 rounded border">{editedSale?.salespersonName || ''}</div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Last Edit</label>
              <div className="text-sm bg-gray-50 p-2 rounded border">{editedSale?.editDate || 'Never edited'}</div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Items Count</label>
              <div className="text-sm bg-blue-50 p-2 rounded border font-semibold text-blue-700">
                {editedSale?.items?.length || 0} items
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Comments</label>
            {editMode ? (
              <textarea 
                value={editedSale?.comments || ''}
                onChange={(e) => setEditedSale({...editedSale, comments: e.target.value})}
                className="w-full text-sm border border-gray-300 rounded p-2 h-16 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add comments about this sale..."
              />
            ) : (
              <div className="text-sm bg-gray-50 p-2 rounded border h-16 overflow-y-auto">
                {editedSale?.comments || 'No comments added'}
              </div>
            )}
          </div>

          {/* Items Table - Compact */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h4 className="text-sm font-semibold text-gray-800">Sale Items</h4>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-xs">Code</th>
                    <th className="px-3 py-2 text-left font-semibold text-xs">Product</th>
                    <th className="px-3 py-2 text-center font-semibold text-xs">Qty</th>
                    <th className="px-3 py-2 text-center font-semibold text-xs">Discount</th>
                    <th className="px-3 py-2 text-right font-semibold text-xs">Price</th>
                    <th className="px-3 py-2 text-right font-semibold text-xs">Amount</th>
                    {editMode && <th className="px-3 py-2 text-center font-semibold text-xs">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {editedSale?.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-xs bg-gray-50">{item.code}</td>
                      <td className="px-3 py-2 text-xs">{item.name}</td>
                      <td className="px-3 py-2 text-center">
                        {editMode ? (
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, e.target.value)}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {item.quantity}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {editMode ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.discount || 0}
                            onChange={(e) => updateItemDiscount(index, e.target.value)}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            (item.discount || 0) > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.discount || 0}%
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-xs">${item.price}</td>
                      <td className="px-3 py-2 text-right font-bold text-xs text-green-700">
                        ${item.amount.toFixed(2)}
                      </td>
                      {editMode && (
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => removeItem(index)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg font-medium">No items found</div>
                  <div className="text-sm">This sale doesn't have any items</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">ESC</kbd> to close
          </div>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button 
                  onClick={handleUpdate}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => {
                    setEditMode(false);
                    setEditedSale({...originalSale});
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Edit Sale
                </button>
                <button 
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                >
                  Delete Sale
                </button>
                <button 
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
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