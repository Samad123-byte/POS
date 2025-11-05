import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShoppingCart, Search, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import { salespersonService } from '../services/salespersonService';
import { productService } from '../services/productService';
import { saleService } from '../services/saleService';

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
const [currentTime, setCurrentTime] = useState(new Date());
const [deletedItems, setDeletedItems] = useState([]);


// ✅ Close product modal on Esc key
useEffect(() => {
  const handleEsc = (e) => {
    if (e.key === "Escape" && showProductModal) {
      setShowProductModal(false);
    }
  };
  window.addEventListener("keydown", handleEsc);
  return () => window.removeEventListener("keydown", handleEsc);
}, [showProductModal]);


useEffect(() => {
  const timer = setInterval(() => setCurrentTime(new Date()), 1000); // updates every second
  return () => clearInterval(timer);
}, []);


// 🕒 Auto-fill current live time until user picks
useEffect(() => {
  if (!saleDate) {
    const timer = setInterval(() => {
      const nowLocal = new Date(
        new Date().getTime() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);
      setSaleDate(nowLocal);
    }, 1000);
    return () => clearInterval(timer);
  }
}, [saleDate]);


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
  await loadSaleForEdit(editingSaleId, spList,  productList);
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


const loadSaleForEdit = async (saleId, spList, productList) => {
  setLoading(true);
  try {
    const saleResponse = await saleService.getWithDetails(saleId);

    if (!saleResponse.success) {
      throw new Error(saleResponse.message || 'Failed to fetch sale with details');
    }

    const saleData = saleResponse.data;
    const salespersonObj = spList.find(sp => sp.salespersonId === saleData.salespersonId);

    setCurrentSaleId(saleId);
    setIsEditMode(true);
    setSelectedSalesperson(saleData.salespersonId?.toString() || '');
    setCurrentSalesperson(salespersonObj || null);
    setComments(saleData.comments || '');

    if (saleData.saleDate) {
      const localDateTime = saleData.saleDate.slice(0, 16);
      setSaleDate(localDateTime);
    } else {
      setSaleDate('');
    }

    const allProducts = productList;

    const cartItems = Array.isArray(saleData.saleDetails)
  ? saleData.saleDetails
      .filter(
        (detail, index, self) =>
          self.findIndex(d => d.productId === detail.productId) === index // 🧩 prevent duplicates by productId
      )
      .map(detail => {
        const product = allProducts.find(p => p.productId === detail.productId);
        return {
          saleDetailId: detail.saleDetailId,
          productId: detail.productId,
          name: product?.name || `Product ${detail.productId}`,
          code: product?.code || '',
          retailPrice: detail.retailPrice || 0,
          quantity: detail.quantity || 1,
          discount: detail.discount || 0,
          rowState: 'Unchanged',
        };
      })
  : [];

    // 🧩 Set initial cart
    setCart(cartItems);

    // ✅ Remove accidental duplicate products safely
    setTimeout(() => {
      setCart(prev =>
        prev.filter(
          (v, i, a) => a.findIndex(t => t.productId === v.productId) === i
        )
      );
    }, 0);

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
  setCart(prevCart => {
    const existingItem = prevCart.find(item => item.productId === product.productId);

    if (existingItem) {
      // 🟢 If item was deleted before, reactivate it
      if (existingItem.rowState === 'Deleted') {
        return prevCart.map(item =>
          item.productId === product.productId
            ? { ...item, rowState: 'Modified', quantity: 1 } // restore item
            : item
        );
      }

      // 🟢 If item already exists, increase quantity
      return prevCart.map(item =>
        item.productId === product.productId
          ? { 
              ...item, 
              quantity: item.quantity + 1,
              rowState: item.rowState === 'Unchanged' ? 'Modified' : item.rowState 
            }
          : item
      );
    }

    // 🟢 Add brand new item
    return [
      ...prevCart,
      {
        productId: product.productId,
        name: product.name,
        code: product.code,
        retailPrice: product.retailPrice || 0,
        quantity: 1,
        discount: 0,
        rowState: 'Added'
      }
    ];
  });

  setProductSearch('');
  // setShowProductModal(false);
};


const updateCartItem = (productId, field, value) => {
  setCart(cart.map(item => {
    if (item.productId === productId) {
      const updatedItem = { ...item, [field]: parseFloat(value) || 0 };

      // ✅ Mark as Modified if it was previously Unchanged
      if (item.rowState === 'Unchanged') {
        updatedItem.rowState = 'Modified';
      }

      return updatedItem;
    }
    return item;
  }));
};


const removeFromCart = (productId) => {
  const item = cart.find(i => i.productId === productId);
  if (!item) return;

  Swal.fire({
    title: 'Delete this item?',
    text: "This will mark the item for removal from the sale",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      setCart(prev =>
        prev.map(i =>
          i.productId === productId
            ? { ...i, rowState: 'Deleted' } // ✅ mark deleted
            : i
        )
      );
      Swal.fire('Deleted!', 'Item marked for removal.', 'success');
    }
  });
};





  const calculateItemTotal = (item) => {
    const subtotal = item.retailPrice * item.quantity;
    const discount = subtotal * (item.discount / 100);
    return subtotal - discount;
  };



  const calculateTotal = () => {
    return cart
     .filter(item => item.rowState !== 'Deleted')
    .reduce((total, item) => total + calculateItemTotal(item), 0);
  };

const handleSaveRecord = async () => {
  if (!selectedSalesperson) {
    Swal.fire('Warning', 'Please select a salesperson', 'warning');
    return;
  }

  if (cart.filter(item => item.rowState !== 'Deleted').length === 0) {
    Swal.fire('Warning', 'Please add products to cart', 'warning');
    return;
  }

  setLoading(true);
  try {
    const saleData = {
      salespersonId: parseInt(selectedSalesperson),
      total: calculateTotal(),
      saleDate: saleDate
        ? new Date(new Date(saleDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString()
        : null,
      comments: comments || null,
      saleDetails: cart.map(item => ({
        saleDetailId: item.rowState === 'Added' ? null : item.saleDetailId,
        productId: item.productId,
        retailPrice: item.retailPrice,
        quantity: item.quantity,
        discount: item.discount || 0,
        rowState: item.rowState // Added / Modified / Deleted / Unchanged
      }))
    };

    if (isEditMode && currentSaleId) {
      saleData.saleId = currentSaleId;
      saleData.updatedDate = new Date().toISOString();

      const response = await saleService.update(currentSaleId, saleData);

      if (response.success) {
        Swal.fire('Success', 'Sale updated successfully!', 'success');

        // ✅ Remove deleted items locally after backend update
        setCart(cart.filter(item => item.rowState !== 'Deleted'));

        setIsEditMode(false);
        setCurrentSaleId(null);
        setSelectedSalesperson('');
        setComments('');
        setSaleDate('');
        if (onBackToRecords) onBackToRecords();
      } else {
        Swal.fire('Error', response.message || 'Failed to update sale', 'error');
      }
    } else {
      const response = await saleService.create(saleData);
      if (response.success) {
        Swal.fire('Success', 'Sale created successfully!', 'success');
        setCart([]);
        setSelectedSalesperson('');
        setComments('');
        setSaleDate('');
        if (onBackToRecords) onBackToRecords();
      } else {
        Swal.fire('Error', response.message || 'Failed to create sale', 'error');
      }
    }
  } catch (error) {
    console.error('Save error:', error);
    Swal.fire('Error', error.response?.data?.message || error.message || 'Failed to save sale', 'error');
  } finally {
    setLoading(false);
  }
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


{/*Date and Time*/}

<div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 mb-6 border border-amber-200">
  <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-11 8h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
    Sale Date & Time
  </h2>

  <div className="flex flex-col md:flex-row md:items-center gap-4">
    <input
      type="datetime-local"
      value={saleDate}
      onChange={(e) => setSaleDate(e.target.value)}
      max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)}
      className="border-2 border-amber-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-medium w-full md:w-1/2"
    />
  </div>

  <p className="text-sm text-gray-500 mt-2">
    You can pick a past date or leave it blank to use the current live time.
  </p>
</div>


        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-indigo-100">
  <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
    Salesperson
  </h2>

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

  {isEditMode && currentSalesperson && (
    <p className="text-sm text-gray-500 mt-2">
      Originally created by: <span className="font-semibold text-indigo-600">{currentSalesperson.name}</span>
    </p>
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
             Sale Items ({cart.filter(i => i.rowState !== 'Deleted').length} items)

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
                      cart
                       .filter(item => item.rowState !== 'Deleted') 
                      .filter(item => 
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
                              onClick={() => removeFromCart(item.productId)}
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