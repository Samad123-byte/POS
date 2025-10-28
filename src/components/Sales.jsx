import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { salespersonService } from '../services/salespersonService';
import { productService } from '../services/productService';
import { saleService } from '../services/saleService';
import { saleDetailService } from '../services/saleDetailService';

const Sales = ({ editingSaleId = null, onBackToRecords = null }) => {
  const [salespersons, setSalespersons] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [comments, setComments] = useState(''); // ✅ NEW: Comments field
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSaleId, setCurrentSaleId] = useState(null);

  useEffect(() => {
    const initializeComponent = async () => {
      await fetchSalespersons();
      await fetchProducts();
      
      if (editingSaleId) {
        await loadSaleForEdit(editingSaleId);
      } else {
        // Set current date/time for new sales
        const now = new Date();
        const formattedDateTime = now.toISOString().slice(0, 16);
        setSaleDate(formattedDateTime);
      }
    };
    
    initializeComponent();
  }, [editingSaleId]);

  const loadSaleForEdit = async (saleId) => {
    setLoading(true);
    try {
      // First try to get sale details
      const detailsResponse = await saleDetailService.getSaleDetailsBySaleId(saleId);
      
      if (!detailsResponse || (Array.isArray(detailsResponse) && detailsResponse.length === 0)) {
        throw new Error('No sale details found for this sale ID');
      }
      
      // Try to get the main sale record
      let saleResponse;
      try {
        saleResponse = await saleService.getById(saleId);
      } catch (saleError) {
        console.warn('Could not fetch sale record, using details only');
        const firstDetail = Array.isArray(detailsResponse) ? detailsResponse[0] : detailsResponse;
        saleResponse = {
          saleId: saleId,
          salespersonId: firstDetail.salespersonId || '',
          saleDate: firstDetail.saleDate || new Date().toISOString(),
          total: 0,
          comments: '' // ✅ NEW
        };
      }
      
      setIsEditMode(true);
      setCurrentSaleId(saleId);
      setSelectedSalesperson(saleResponse.salespersonId?.toString() || '');
      setSaleDate(saleResponse.saleDate ? new Date(saleResponse.saleDate).toISOString().slice(0, 16) : '');
      setComments(saleResponse.comments || ''); // ✅ NEW: Load comments
      
      // Fetch all products to get names and codes
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
  };

  const updateCartItem = (productId, field, value) => {
    setCart(cart.map(item =>
      item.productId === productId ? { ...item, [field]: parseFloat(value) || 0 } : item
    ));
  };

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
          await saleDetailService.delete(saleDetailId);
          setCart(cart.filter(item => item.productId !== productId));
          Swal.fire('Deleted!', 'Item removed successfully', 'success');
        } catch (error) {
          Swal.fire('Error', 'Failed to delete item', 'error');
        }
      }
    } else {
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
    if (!saleDate) {
      Swal.fire('Warning', 'Please select a date', 'warning');
      return;
    }
    if (cart.length === 0) {
      Swal.fire('Warning', 'Please add products to cart', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && currentSaleId) {
        // Update existing sale
        const saleData = {
          saleId: currentSaleId,
          salespersonId: parseInt(selectedSalesperson),
          total: calculateTotal(),
          saleDate: new Date(saleDate).toISOString(),
          comments: comments || null, // ✅ NEW: Include comments
          updatedDate: new Date().toISOString()
        };

        await saleService.update(currentSaleId, saleData);
        
        // Update sale details
        for (const item of cart) {
          if (item.saleDetailId) {
            // Update existing detail
            await saleDetailService.update({
              saleDetailId: item.saleDetailId,
              saleId: currentSaleId,
              productId: item.productId,
              retailPrice: item.retailPrice,
              quantity: item.quantity,
              discount: item.discount || 0
            });
          } else {
            // Add new detail
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
        // Create new sale
        const saleData = {
          salespersonId: parseInt(selectedSalesperson),
          total: calculateTotal(),
          saleDate: new Date(saleDate).toISOString(),
          comments: comments || null // ✅ NEW: Include comments
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
      
      // Reset form
      setCart([]);
      setSelectedSalesperson('');
      setComments(''); // ✅ NEW: Reset comments
      const now = new Date();
      setSaleDate(now.toISOString().slice(0, 16));
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      {onBackToRecords && (
        <button
          onClick={onBackToRecords}
          className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Records
        </button>
      )}
      
      <div className="border-b pb-4 mb-6">
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded">
            Sale
          </button>
          <button className="px-6 py-2 text-gray-600 font-semibold">
            Records
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <input
            type="datetime-local"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Salesperson</label>
          <select
            value={selectedSalesperson}
            onChange={(e) => setSelectedSalesperson(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- Select Sale Person --</option>
            {salespersons.map(sp => (
              <option key={sp.salespersonId} value={sp.salespersonId}>
                {sp.name} ({sp.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ✅ NEW: Comments Field */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add any notes or comments about this sale..."
          rows="3"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Enter Product...</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {productSearch && filteredProducts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
              {filteredProducts.map(product => (
                <div
                  key={product.productId}
                  onClick={() => addToCart(product)}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b"
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">
                    Code: {product.code} | Price: ${product.retailPrice?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Show 10 entries</span>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm w-48"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden mb-4">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Quantity</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Discount</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Price</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No items in cart
                </td>
              </tr>
            ) : (
              cart.filter(item => 
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.code?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((item, index) => (
                <tr key={item.productId} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.code}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateCartItem(item.productId, 'quantity', e.target.value)}
                      className="w-20 border rounded px-2 py-1 text-center"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount}
                      onChange={(e) => updateCartItem(item.productId, 'discount', e.target.value)}
                      className="w-20 border rounded px-2 py-1 text-center"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">{item.retailPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {calculateItemTotal(item).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => removeFromCart(item.productId, item.saleDetailId)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">
          Showing {cart.length} of {cart.length} entries
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded text-sm">Previous</button>
          <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">1</button>
          <button className="px-3 py-1 border rounded text-sm">Next</button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center text-lg font-semibold mb-4">
          <span>Net Total :</span>
          <span className="text-green-600">{calculateTotal().toFixed(2)}</span>
        </div>
        <button
          onClick={handleSaveRecord}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving...' : (isEditMode ? 'Update Record' : 'Save Record')}
        </button>
      </div>
    </div>
  );
};

export default Sales;