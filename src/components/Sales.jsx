import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const Sales = ({ products, salespersons, onSaveSale }) => {
  const [selectedSalesperson, setSelectedSalesperson] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [comments, setComments] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalProductSearch, setModalProductSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showProductModal) {
        setShowProductModal(false);
        setModalProductSearch('');
        setCurrentPage(1);
      }
    };

    if (showProductModal) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showProductModal]);

  const addProductToCart = (product, closeModal = false) => {
    const existingItem = cartItems.find(item => item.code === product.code);
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.code === product.code 
          ? { ...item, quantity: item.quantity + 1, amount: (item.quantity + 1) * item.price * (1 - item.discount / 100) }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        code: product.code,
        name: product.name,
        quantity: 1,
        discount: 0,
        price: product.retailPrice,
        amount: product.retailPrice
      }]);
    }
    
    // Show success feedback
    Swal.fire({
      icon: 'success',
      title: 'Product Added!',
      text: `${product.name} added to cart`,
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      customClass: {
        container: 'swal2-top-end-container'
      },
      didOpen: () => {
        // Ensure the toast has highest z-index and no blur
        const swalContainer = document.querySelector('.swal2-top-end-container');
        if (swalContainer) {
          swalContainer.style.zIndex = '999999';
          swalContainer.style.backdropFilter = 'none';
          swalContainer.style.filter = 'none';
          swalContainer.style.position = 'fixed';
        }
      }
    });
    
    // Only close modal and clear search if it's from the dropdown search
    if (closeModal) {
      setProductSearch('');
      setShowProductModal(false);
      setModalProductSearch('');
      setCurrentPage(1);
    }
  };

  const updateQuantity = (code, quantity) => {
    if (quantity < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Quantity',
        text: 'Quantity cannot be negative!',
      });
      return;
    }
    if (quantity === 0) {
      deleteItem(code);
      return;
    }
    setCartItems(cartItems.map(item => 
      item.code === code 
        ? { ...item, quantity, amount: quantity * item.price * (1 - item.discount / 100) }
        : item
    ));
  };

  const updateDiscount = (code, discount) => {
    if (discount < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Discount',
        text: 'Discount cannot be negative!',
      });
      return;
    }
    if (discount > 100) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Discount',
        text: 'Discount cannot be more than 100%!',
      });
      return;
    }
    setCartItems(cartItems.map(item => 
      item.code === code 
        ? { ...item, discount, amount: item.quantity * item.price * (1 - discount / 100) }
        : item
    ));
  };

  const deleteItem = (code) => {
    setCartItems(cartItems.filter(item => item.code !== code));
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + item.amount, 0);
  };

  const handleSaveSale = () => {
    if (!selectedSalesperson || cartItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Sale',
        text: 'Please select a salesperson and add at least one item to the cart!',
      });
      return;
    }
    
    const sale = {
      id: Date.now(),
      saleTime: new Date().toLocaleString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }),
      total: getTotal(),
      salespersonName: salespersons.find(sp => sp.id === parseInt(selectedSalesperson))?.name || '',
      editDate: '',
      comments,
      items: [...cartItems]
    };
    
    onSaveSale(sale);
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Sale saved successfully!',
      timer: 2000,
      showConfirmButton: false
    });
    handleNewSale();
  };

  const handleNewSale = () => {
    setSelectedSalesperson('');
    setCartItems([]);
    setComments('');
    setProductSearch('');
  };

  const closeModal = () => {
    setShowProductModal(false);
    setModalProductSearch('');
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return 'Ã¢â€ â€¢';
    return sortOrder === 'asc' ? 'Ã¢â€ â€˜' : 'Ã¢â€ â€œ';
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.code.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Modal products filtering, sorting and pagination
  const modalFilteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(modalProductSearch.toLowerCase()) ||
      product.code.toLowerCase().includes(modalProductSearch.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue;
      
      if (sortField === 'retailPrice') {
        // Handle numeric sorting for retailPrice
        aValue = parseFloat(a[sortField]) || 0;
        bValue = parseFloat(b[sortField]) || 0;
      } else {
        // Handle string sorting for code and name (case insensitive)
        aValue = (a[sortField] || '').toString().toLowerCase();
        bValue = (b[sortField] || '').toString().toLowerCase();
      }
      
      let comparison = 0;
      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const totalPages = Math.ceil(modalFilteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = modalFilteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">POINT OF SALE</h2>
        
        <div className="flex justify-between mb-6">
          <div className="flex gap-4 items-center">
            <span className="text-gray-700 font-medium">Sales Person:</span>
            <select 
              value={selectedSalesperson} 
              onChange={(e) => setSelectedSalesperson(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Salesperson</option>
              {salespersons.map(sp => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Product:</span>
            <div className="relative flex items-center gap-2">
              <input 
                type="text" 
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search product by name or code..."
                className="border border-gray-300 rounded-md px-3 py-2 w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={() => setShowProductModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-center"
                title="Select Product"
              >
               🛒
              </button>
              {productSearch && !showProductModal && (
                <div className="absolute top-full left-0 w-64 bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto z-10 shadow-lg">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => addProductToCart(product, true)}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      {product.name} ({product.code}) - {product.retailPrice}
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="px-3 py-2 text-gray-500">No products found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-gray-600 font-medium">
            {new Date().toLocaleString('en-GB', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </div>
        </div>

        <table className="w-full border-collapse border border-gray-300 mb-4 rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <tr>
              <th className="border border-gray-300 px-4 py-3 font-semibold">CODE</th>
              <th className="border border-gray-300 px-4 py-3 font-semibold">NAME</th>
              <th className="border border-gray-300 px-4 py-3 font-semibold">QUANTITY</th>
              <th className="border border-gray-300 px-4 py-3 font-semibold">DISCOUNT (%)</th>
              <th className="border border-gray-300 px-4 py-3 font-semibold">PRICE</th>
              <th className="border border-gray-300 px-4 py-3 font-semibold">AMOUNT</th>
              <th className="border border-gray-300 px-4 py-3 font-semibold">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map(item => (
              <tr key={item.code} className="border-b hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3">{item.code}</td>
                <td className="border border-gray-300 px-4 py-3">{item.name}</td>
                <td className="border border-gray-300 px-4 py-3">
                  <input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.code, parseInt(e.target.value) || 0)}
                    className="w-16 text-center border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                    min="0"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  <input 
                    type="number" 
                    value={item.discount}
                    onChange={(e) => updateDiscount(item.code, parseFloat(e.target.value) || 0)}
                    className="w-16 text-center border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-3">{item.price}</td>
                <td className="border border-gray-300 px-4 py-3 font-semibold">{item.amount.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-3">
                  <button 
                    onClick={() => deleteItem(item.code)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-600">
              Showing {cartItems.length} entries
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-xl font-bold">
              Total: <span className="text-green-600">{getTotal().toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Comments:</label>
          <textarea 
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-20 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleSaveSale}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold"
          >
            Save Sale
          </button>
          <button 
            onClick={handleNewSale}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-md hover:from-green-600 hover:to-teal-600 transition-all duration-200 font-semibold"
          >
            New Sale
          </button>
        </div>
      </div>

      {/* Product Selection Modal */}
      {showProductModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[9999]"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}
        >
          <div className="bg-white p-6 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-gray-200 relative z-[10000]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-600">Select Product</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Press ESC to close</span>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                >
              ❌
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span>Search:</span>
                <input
                  type="text"
                  value={modalProductSearch}
                  onChange={(e) => {
                    setModalProductSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search..."
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    <th 
                      className="border border-gray-300 px-4 py-2 text-left cursor-pointer hover:bg-blue-600 select-none"
                      onClick={() => handleSort('code')}
                    >
                      <div className="flex items-center justify-between">
                        CODE
                        <span className="ml-1 text-sm">{getSortIcon('code')}</span>
                      </div>
                    </th>
                    <th 
                      className="border border-gray-300 px-4 py-2 text-left cursor-pointer hover:bg-blue-600 select-none"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center justify-between">
                        NAME
                        <span className="ml-1 text-sm">{getSortIcon('name')}</span>
                      </div>
                    </th>
                    <th 
                      className="border border-gray-300 px-4 py-2 text-left cursor-pointer hover:bg-blue-600 select-none"
                      onClick={() => handleSort('retailPrice')}
                    >
                      <div className="flex items-center justify-between">
                        RETAIL PRICE
                        <span className="ml-1 text-sm">{getSortIcon('retailPrice')}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product, index) => (
                    <tr 
                      key={product.id} 
                      className={`cursor-pointer hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      onClick={() => addProductToCart(product)}
                    >
                      <td className="border border-gray-300 px-4 py-2">{product.code}</td>
                      <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                      <td className="border border-gray-300 px-4 py-2">{product.retailPrice}</td>
                    </tr>
                  ))}
                  {paginatedProducts.length === 0 && (
                    <tr>
                      <td colSpan="3" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, modalFilteredProducts.length)} of {modalFilteredProducts.length} entries
                {modalProductSearch && (
                  <span className="ml-2 text-blue-600">(filtered from {products.length} total entries)</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors ${
                        currentPage === pageNum ? 'bg-blue-500 text-white border-blue-500' : ''
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sales;