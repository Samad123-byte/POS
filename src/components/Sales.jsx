import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShoppingCart, Search, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import { salespersonService } from '../services/salespersonService';
import { productService } from '../services/productService';
import { saleService } from '../services/saleService';
import { saleDetailService } from '../services/saleDetailService';

const Sales = ({ editingSaleId = null, onBackToRecords = null }) => {
  const [salespersons, setSalespersons] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState('');
  const [comments, setComments] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSaleId, setCurrentSaleId] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentSalesperson, setCurrentSalesperson] = useState(null);
const [saleDate, setSaleDate] = useState(''); // NEW

useEffect(() => {
  const initializeComponent = async () => {
    setLoading(true);
    try {
     const [spResponse, productResponse] = await Promise.all([
  salespersonService.getAll(1, 100),
  productService.getAll(1, 100)
]);

const spList = spResponse.data || [];
const productList = productResponse.data || [];

setSalespersons(spList);
setProducts(productList);

// ✅ If editing, load sale details
if (editingSaleId) {
  await loadSaleForEdit(editingSaleId, spList);
}
    } catch (error) {
      console.error('Error initializing component:', error);
      Swal.fire('Error', 'Failed to load initial data', 'error');
    } finally {
      setLoading(false);
    }
  };

  initializeComponent();
}, [editingSaleId]);


const loadSaleForEdit = async (saleId, spList) => {
  setLoading(true);
  try {
    // Fetch sale + details in one API call
    const saleResponse = await saleService.getWithDetails(saleId);

    if (!saleResponse.success) {
      throw new Error(saleResponse.message || 'Failed to fetch sale with details');
    }

    const saleData = saleResponse.data;

    // Use passed salespersons
    const salespersonObj = spList.find(sp => sp.salespersonId === saleData.salespersonId);

    setCurrentSaleId(saleId);
    setIsEditMode(true);
    setSelectedSalesperson(saleData.salespersonId?.toString() || '');
    setCurrentSalesperson(salespersonObj || null);
    setComments(saleData.comments || '');
    setSaleDate(saleData.saleDate || ''); // store original sale date

    const productsResponse = await productService.getAll(1, 1000);
    const allProducts = productsResponse.data || [];

    const cartItems = Array.isArray(saleData.details)
      ? saleData.details.map(detail => {
          const product = allProducts.find(p => p.productId === detail.productId);
          return {
            saleDetailId: detail.saleDetailId,
            productId: detail.productId,
            name: product?.name || `Product ${detail.productId}`,
            code: product?.code || '',
            retailPrice: detail.retailPrice || 0,
            quantity: detail.quantity || 1,
            discount: detail.discount || 0
          };
        })
      : [];

    setCart(cartItems);

  } catch (error) {
    console.error('Error loading sale:', error);
    Swal.fire('Error', error.message, 'error');
    if (onBackToRecords) onBackToRecords();
  } finally {
    setLoading(false);
  }
};


const openProductModal = async () => {
   if (products.length === 0) {
    await fetchProducts(); // fetch only when needed
  }
  setShowProductModal(true);
};


  const fetchSalespersons = async () => {
    try {
      const response = await salespersonService.getAll(1, 100);
      setSalespersons(response.data || []);
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch salespersons', 'error');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll(1, 100);
      setProducts(response.data || []);
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch products', 'error');
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.productId);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.productId,
        name: product.name,
        code: product.code,
        retailPrice: product.retailPrice || 0,
        quantity: 1,
        discount: 0
      }]);
    }
    setProductSearch('');
   // setShowProductModal(false);
  };

  const updateCartItem = (productId, field, value) => {
    setCart(cart.map(item =>
      item.productId === productId ? { ...item, [field]: parseFloat(value) || 0 } : item
    ));
  };

 // ✅ FIXED: removeFromCart function in Sales.jsx
// Replace your existing removeFromCart function with this:

const removeFromCart = async (productId, saleDetailId = null) => {
  if (isEditMode && saleDetailId) {
    const result = await Swal.fire({
      title: 'Delete this item?',
      text: "This will remove the item from the sale",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await saleDetailService.delete(saleDetailId);
        
        // ✅ Check if deletion was successful
        if (response.success) {
          setCart(cart.filter(item => item.productId !== productId));
          Swal.fire('Deleted!', response.message || 'Item removed successfully', 'success');
        } else {
          // ✅ Show backend error message
          Swal.fire({
            title: 'Cannot Delete',
            text: response.message || 'Failed to delete item',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        // ✅ Show detailed error message from backend
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.Message || 
                           error.message || 
                           'Failed to delete item';
        
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  } else {
    // Not in edit mode, just remove from cart
    setCart(cart.filter(item => item.productId !== productId));
  }
};

  const calculateItemTotal = (item) => {
    const subtotal = item.retailPrice * item.quantity;
    const discount = subtotal * (item.discount / 100);
    return subtotal - discount;
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

const handleSaveRecord = async () => {
  if (!selectedSalesperson) {
    Swal.fire('Warning', 'Please select a salesperson', 'warning');
    return;
  }
  if (cart.length === 0) {
    Swal.fire('Warning', 'Please add products to cart', 'warning');
    return;
  }

  setLoading(true);
  try {
    const utcNow = new Date().toISOString();

    if (isEditMode && currentSaleId) {
      // ===== UPDATE SALE =====
      const saleData = {
        saleId: currentSaleId,
        salespersonId: parseInt(selectedSalesperson),
        total: calculateTotal(),
        saleDate: saleDate || new Date().toISOString(),
        comments: comments || null,
        updatedDate: new Date().toISOString()
      };

      // Update the sale itself
      await saleService.update(currentSaleId, saleData);

      // Split cart into existing and new items
      const existingItems = cart.filter(item => item.saleDetailId);
      const newItems = cart.filter(item => !item.saleDetailId);

      // Batch update existing items
      if (existingItems.length > 0) {
        await saleDetailService.batchUpdate(
          existingItems.map(item => ({
            saleDetailId: item.saleDetailId,
            saleId: currentSaleId,
            productId: item.productId,
            retailPrice: item.retailPrice,
            quantity: item.quantity,
            discount: item.discount || 0
          }))
        );
      }

      // Batch create new items
      if (newItems.length > 0) {
        await saleDetailService.createBatch(
          newItems.map(item => ({
            saleId: currentSaleId,
            productId: item.productId,
            retailPrice: item.retailPrice,
            quantity: item.quantity,
            discount: item.discount || 0
          }))
        );
      }

      Swal.fire('Success', 'Sale updated successfully!', 'success');
    } else {
      // ===== CREATE SALE =====
      const saleData = {
        salespersonId: parseInt(selectedSalesperson),
        total: calculateTotal(),
        comments: comments || null
      };

      const saleResponse = await saleService.create(saleData);
      const saleDataFromServer = saleResponse.data;

      if (!saleDataFromServer || !saleDataFromServer.saleId) {
        throw new Error('Failed to create sale. SaleId not returned.');
      }

      // Batch create all sale details
      const saleDetails = cart.map(item => ({
        saleId: saleDataFromServer.saleId,
        productId: item.productId,
        retailPrice: item.retailPrice,
        quantity: item.quantity,
        discount: item.discount || 0
      }));

      await saleDetailService.createBatch(saleDetails);

      Swal.fire('Success', 'Sale created successfully!', 'success');
    }

    // ===== RESET STATES =====
    setCart([]);
    setSelectedSalesperson('');
    setComments('');
    setIsEditMode(false);
    setCurrentSaleId(null);

    if (onBackToRecords) {
      onBackToRecords();
    }
  } catch (error) {
    console.error('Save error:', error);
    Swal.fire('Error', error.response?.data?.message || error.message, 'error');
  }

  setLoading(false);
};


  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.code?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {onBackToRecords && (
          <button
            onClick={onBackToRecords}
            className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Records
          </button>
        )}
        
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-white" />
              <h1 className="text-3xl font-bold text-white">
                {isEditMode ? 'Edit Sale' : 'New Sale'}
              </h1>
            </div>
          </div>

         <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-indigo-100">
  <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
    Salesperson
  </h2>

  {isEditMode && currentSalesperson ? (
    <div className="text-lg font-semibold text-indigo-700">
      {currentSalesperson.name} ({currentSalesperson.code})
    </div>
  ) : (
    <select
      value={selectedSalesperson}
      onChange={(e) => setSelectedSalesperson(e.target.value)}
      className="w-full border-2 border-indigo-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg font-medium"
    >
      <option value="">-- Select Salesperson --</option>
      {salespersons.map(sp => (
        <option key={sp.salespersonId} value={sp.salespersonId}>
          {sp.name} ({sp.code})
        </option>
      ))}
    </select>
  )}
</div>


           {/* Add Products Button */}

{/* Add Products Button */}
<div className="mb-6">
  <button
    onClick={openProductModal}
    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
  >
    <Package className="w-6 h-6" />
    Add Items to Sale
  </button>
</div>

{/* Popup Modal */}
{showProductModal && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={(e) => {
      // Optional: close only if clicking on the background
      if (e.target === e.currentTarget) setShowProductModal(false);
    }}
  >
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl w-[95%] max-w-4xl p-6 relative animate-fadeIn border-2 border-purple-200">

      {/* Close Button */}
      <button
        onClick={() => setShowProductModal(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
      >
        <X size={28} />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Package className="w-7 h-7 text-purple-600" />
        <h2 className="text-2xl font-extrabold text-purple-900">Select Products</h2>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="🔍 Search products by name or code..."
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // ✅ stops form submit or modal close
              const match = filteredProducts.find(
                (p) =>
                  p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                  p.code.toLowerCase() === productSearch.toLowerCase()
              );
              if (match) {
                addToCart(match);
                setProductSearch(""); // Clear input after adding
              }
            }
          }}
          className="w-full border-2 border-purple-300 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-lg shadow-sm"
        />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">
            No products found
          </p>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.productId}
              className="bg-white rounded-xl p-4 border-2 border-purple-100 hover:border-purple-300 hover:shadow-md transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="bg-purple-100 rounded-lg px-3 py-1">
                  <span className="text-purple-700 font-bold text-sm">
                    {product.code}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ${product.retailPrice?.toFixed(2)}
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">
                {product.name}
              </h3>
              <button
                onClick={(e) => {
                  e.preventDefault(); // ✅ prevents any accidental form submit
                  addToCart(product); // stays open
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                Add to Sale
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}
            {/* Shopping Cart - MOVED UP */}
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                 Sale Items ({cart.length} items)
                </h2>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Search items in sale…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-2 border-white rounded-lg px-4 py-2 text-sm w-64 focus:ring-2 focus:ring-white"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Product Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Code</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Quantity</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Discount %</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Unit Price</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Total</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
                          <p className="text-gray-400 text-sm mt-2">Click "Browse & Add Products" to get started</p>
                        </td>
                      </tr>
                    ) : (
                      cart.filter(item => 
                        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.code?.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((item, index) => (
                        <tr key={item.productId} className="border-t hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 text-gray-600">{item.code}</td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateCartItem(item.productId, 'quantity', e.target.value)}
                              className="w-24 border-2 border-indigo-200 rounded-lg px-3 py-2 text-center font-semibold focus:ring-2 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount}
                              onChange={(e) => updateCartItem(item.productId, 'discount', e.target.value)}
                              className="w-24 border-2 border-indigo-200 rounded-lg px-3 py-2 text-center font-semibold focus:ring-2 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">
                            ${item.retailPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-green-600 text-lg">
                            ${calculateItemTotal(item).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => removeFromCart(item.productId, item.saleDetailId)}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center gap-2 mx-auto"
                            >
                              <Trash2 size={18} />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comments Section - MOVED DOWN */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 mb-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Sale Notes (Optional)
              </h2>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any notes or comments about this sale..."
                rows="3"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
              />
            </div>

            {/* Total and Save Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border-2 border-green-200">
              <div className="flex justify-between items-center mb-6">
                <span className="text-2xl font-bold text-gray-700">Grand Total:</span>
                <span className="text-4xl font-bold text-green-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              
              <button
                onClick={handleSaveRecord}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <ShoppingCart className="w-6 h-6" />
                    {isEditMode ? 'Update Sale Record' : 'Finalize Sale'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default Sales;