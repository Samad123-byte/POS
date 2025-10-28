import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShoppingCart, Search, Package, DollarSign } from 'lucide-react';
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

  useEffect(() => {
    const initializeComponent = async () => {
      await fetchSalespersons();
      await fetchProducts();
      
      if (editingSaleId) {
        await loadSaleForEdit(editingSaleId);
      }
    };
    
    initializeComponent();
  }, [editingSaleId]);

  const loadSaleForEdit = async (saleId) => {
    setLoading(true);
    try {
      const detailsResponse = await saleDetailService.getSaleDetailsBySaleId(saleId);
      
      if (!detailsResponse || (Array.isArray(detailsResponse) && detailsResponse.length === 0)) {
        throw new Error('No sale details found for this sale ID');
      }
      
      let saleResponse;
      try {
        saleResponse = await saleService.getById(saleId);
      } catch (saleError) {
        console.warn('Could not fetch sale record, using details only');
        const firstDetail = Array.isArray(detailsResponse) ? detailsResponse[0] : detailsResponse;
        saleResponse = {
          saleId: saleId,
          salespersonId: firstDetail.salespersonId || '',
          total: 0,
          comments: ''
        };
      }
      
      setIsEditMode(true);
      setCurrentSaleId(saleId);
      setSelectedSalesperson(saleResponse.salespersonId?.toString() || '');
      setComments(saleResponse.comments || '');
      
      const productsResponse = await productService.getAll(1, 1000);
      const allProducts = productsResponse.data || [];
      
      const cartItems = Array.isArray(detailsResponse) ? detailsResponse.map(detail => {
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
      }) : [];
      
      setCart(cartItems);
    } catch (error) {
      console.error('Error loading sale:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || error.message || 'Failed to load sale details',
        icon: 'error',
        confirmButtonText: 'Go Back'
      }).then(() => {
        if (onBackToRecords) {
          onBackToRecords();
        }
      });
    }
    setLoading(false);
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
    setShowProductModal(false);
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
        
        // ✅ If we reach here, deletion was successful (status 200)
        setCart(cart.filter(item => item.productId !== productId));
        Swal.fire('Deleted!', response.message || 'Item removed successfully', 'success');
      } catch (error) {
        // ✅ Backend returns 400/error status when deletion fails
        // Extract the error message from the response
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.Message || 
                           error.message || 
                           'Failed to delete item';
        
        Swal.fire({
          title: 'Cannot Delete',
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
      Swal.fire('Warning', 'Please add products to sale', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && currentSaleId) {
        const saleData = {
          saleId: currentSaleId,
          salespersonId: parseInt(selectedSalesperson),
          total: calculateTotal(),
          saleDate: new Date().toISOString(),
          comments: comments || null,
          updatedDate: new Date().toISOString()
        };

        await saleService.update(currentSaleId, saleData);
        
        for (const item of cart) {
          if (item.saleDetailId) {
            await saleDetailService.update({
              saleDetailId: item.saleDetailId,
              saleId: currentSaleId,
              productId: item.productId,
              retailPrice: item.retailPrice,
              quantity: item.quantity,
              discount: item.discount || 0
            });
          } else {
            await saleDetailService.add({
              saleId: currentSaleId,
              productId: item.productId,
              retailPrice: item.retailPrice,
              quantity: item.quantity,
              discount: item.discount || 0
            });
          }
        }
        
        Swal.fire('Success', 'Sale updated successfully!', 'success');
      } else {
        const saleData = {
          salespersonId: parseInt(selectedSalesperson),
          total: calculateTotal(),
          saleDate: new Date().toISOString(),
          comments: comments || null
        };

        const saleResponse = await saleService.create(saleData);
        
        const saleDetails = cart.map(item => ({
          saleId: saleResponse.saleId,
          productId: item.productId,
          retailPrice: item.retailPrice,
          quantity: item.quantity,
          discount: item.discount || 0
        }));

        await saleDetailService.createBatch(saleDetails);
        
        Swal.fire('Success', 'Sale created successfully!', 'success');
      }
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-[1800px] mx-auto">
        {onBackToRecords && (
          <button
            onClick={onBackToRecords}
            className="mb-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Records
          </button>
        )}
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-t-2xl px-8 py-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-white" />
              <h1 className="text-3xl font-bold text-white">
                {isEditMode ? 'Edit Sale' : 'Point of Sale'}
              </h1>
            </div>
            <div className="text-white text-right">
              <div className="text-sm opacity-90">Sale #{isEditMode ? currentSaleId : 'NEW'}</div>
              <div className="text-xs opacity-75">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Main POS Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-white rounded-b-2xl shadow-2xl p-6">
          
          {/* LEFT SIDE - Product Selection & Salesperson */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Salesperson Selection */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-indigo-200">
              <label className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Salesperson *
              </label>
              
              <select
                value={selectedSalesperson}
                onChange={(e) => setSelectedSalesperson(e.target.value)}
                className="w-full border-2 border-indigo-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium bg-white"
              >
                <option value="">-- Select Salesperson --</option>
                {salespersons.map(sp => (
                  <option key={sp.salespersonId} value={sp.salespersonId}>
                    {sp.name} ({sp.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Search */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Product Catalog
                </h2>
                <button
                  onClick={() => setShowProductModal(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
                >
                  View All Products
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="🔍 Search products by name or code..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg pl-11 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Quick Product Grid - Only show when searching */}
              {productSearch && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 max-h-[400px] overflow-y-auto">
                  {filteredProducts.slice(0, 9).map(product => (
                    <div
                      key={product.productId}
                      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => addToCart(product)}
                    >
                      <div className="bg-indigo-600 text-white rounded-md px-2 py-1 text-xs font-bold mb-2 inline-block">
                        {product.code}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[40px]">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-green-600">
                          ${product.retailPrice?.toFixed(2)}
                        </div>
                        <Plus className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!productSearch && (
                <div className="text-center py-8 text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Start typing to search products...</p>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <label className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Sale Notes (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any notes about this sale..."
                rows="2"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all text-sm"
              />
            </div>
          </div>

          {/* RIGHT SIDE - Sale Items & Checkout */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Sale Items */}
            <div className="bg-white rounded-xl border-2 border-indigo-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
                <h2 className="text-lg font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Sale Items
                  </span>
                  <span className="bg-white text-indigo-600 rounded-full px-3 py-1 text-sm font-bold">
                    {cart.length}
                  </span>
                </h2>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="px-4 py-16 text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No items in sale</p>
                    <p className="text-gray-400 text-sm mt-1">Add products to begin</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {cart.map((item) => (
                      <div key={item.productId} className="p-4 hover:bg-indigo-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                            <p className="text-xs text-gray-500">{item.code}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.productId, item.saleDetailId)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="text-xs text-gray-600">Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateCartItem(item.productId, 'quantity', e.target.value)}
                              className="w-full border-2 border-indigo-200 rounded px-2 py-1 text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Disc %</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount}
                              onChange={(e) => updateCartItem(item.productId, 'discount', e.target.value)}
                              className="w-full border-2 border-indigo-200 rounded px-2 py-1 text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            ${item.retailPrice.toFixed(2)} × {item.quantity}
                          </span>
                          <span className="font-bold text-green-600 text-base">
                            ${calculateItemTotal(item).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Checkout Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-800">${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-semibold text-gray-800">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="border-t-2 border-green-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">Total:</span>
                    <span className="text-3xl font-bold text-green-600">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSaveRecord}
                disabled={loading || cart.length === 0}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-6 h-6" />
                    {isEditMode ? 'Update Sale' : 'Complete Sale'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Product Modal with Blur Background */}
      {showProductModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowProductModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Package className="w-7 h-7" />
                Select Products
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="🔍 Search products by name or code..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full border-2 border-indigo-300 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {filteredProducts.map(product => (
                  <div
                    key={product.productId}
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-indigo-600 text-white rounded-lg px-3 py-1">
                        <span className="font-bold text-sm">{product.code}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          ${product.retailPrice?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-3 min-h-[48px]">{product.name}</h3>
                    <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all group-hover:shadow-md flex items-center justify-center gap-2">
                      <Plus size={18} />
                      Add to Sale
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Sales;
