import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import { salespersonService } from '../services/salespersonService';
import { productService } from '../services/productService';
import { saleService } from '../services/saleService';
import { saleDetailService } from '../services/saleDetailService';

const Sales = () => {
  const [salespersons, setSalespersons] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState('');
  const [cart, setCart] = useState([]);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSalespersons();
    fetchProducts();
  }, []);

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
  };

  const updateCartItem = (productId, field, value) => {
    setCart(cart.map(item =>
      item.productId === productId ? { ...item, [field]: parseFloat(value) || 0 } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateItemTotal = (item) => {
    const subtotal = item.retailPrice * item.quantity;
    const discount = subtotal * (item.discount / 100);
    return subtotal - discount;
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const handleCreateSale = async () => {
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
      setCart([]);
      setSelectedSalesperson('');
      setComments('');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || error.message, 'error');
    }
    setLoading(false);
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Create Sale</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Salesperson & Products */}
        <div>
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <label className="block mb-2 font-medium">Select Salesperson *</label>
            <select
              value={selectedSalesperson}
              onChange={(e) => setSelectedSalesperson(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select Salesperson --</option>
              {salespersons.map(sp => (
                <option key={sp.salespersonId} value={sp.salespersonId}>
                  {sp.name} ({sp.code})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold mb-3 text-lg">Select Products</h3>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3 focus:ring-2 focus:ring-indigo-500"
            />
            <div className="max-h-96 overflow-y-auto">
              {filteredProducts.map(product => (
                <div
                  key={product.productId}
                  className="flex justify-between items-center p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => addToCart(product)}
                >
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-indigo-600">${product.retailPrice?.toFixed(2)}</div>
                    <button className="text-blue-500 text-sm hover:text-blue-700 flex items-center gap-1">
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Shopping Cart */}
        <div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-lg">
              <ShoppingCart size={20} className="text-indigo-600" /> Shopping Cart
            </h3>
            
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Cart is empty</div>
            ) : (
              <>
                <div className="max-h-80 overflow-y-auto mb-4">
                  {cart.map(item => (
                    <div key={item.productId} className="border-b py-3">
                      <div className="flex justify-between mb-2">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-gray-500 ml-2">({item.code})</span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateCartItem(item.productId, 'quantity', e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.retailPrice}
                            onChange={(e) => updateCartItem(item.productId, 'retailPrice', e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Discount %</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) => updateCartItem(item.productId, 'discount', e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                      <div className="text-right mt-2 font-medium text-indigo-600">
                        Subtotal: ${calculateItemTotal(item).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium text-sm">Comments</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    rows="2"
                    placeholder="Add any comments..."
                  ></textarea>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold mb-4">
                    <span>Total:</span>
                    <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCreateSale}
                    disabled={loading}
                    className="w-full bg-green-500 text-white px-4 py-3 rounded font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Creating Sale...' : 'Complete Sale'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;

