import React, { useState, useEffect } from 'react';
import Products from './components/Products';
import Sales from './components/Sales';
import Records from './components/Records';
import Salespersons from './components/Salespersons';
import useProducts from './hooks/useProducts';
import useSalespersons from './hooks/useSalesPersons';
import useSales from './hooks/useSales';
import Swal from 'sweetalert2';

const App = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Custom hooks for managing state and operations
  const {
    products,
    loadProducts,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct
  } = useProducts();

  const {
    salespersons,
    loadSalespersons,
    handleAddSalesperson,
    handleUpdateSalesperson,
    handleDeleteSalesperson
  } = useSalespersons();

  const {
    sales,
    loadSales,
    handleSaveSale: saveSale,
    handleUpdateSale: updateSale,
    handleDeleteSale: deleteSale
  } = useSales();

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [productsData, salespersonsData] = await Promise.all([
        loadProducts(),
        loadSalespersons()
      ]);

      // Load sales with details using raw backend data for proper linking
      const productsBackendData = await import('./services/productService').then(service => 
        service.productService.getAllProducts()
      );
      const salespersonsBackendData = await import('./services/salespersonService').then(service => 
        service.salespersonService.getAllSalespersons()
      );
      
      await loadSales(productsBackendData, salespersonsBackendData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Data',
        text: 'Failed to load data from server. Please check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Wrapper functions to maintain the same interface
  const handleSaveSale = (sale) => saveSale(sale, products, salespersons);
  const handleUpdateSale = (sale) => updateSale(sale, products, salespersons);
  const handleDeleteSale = (saleId) => deleteSale(saleId);

  const handleNewSale = () => {
    setActiveTab('sales');
  };

  const menuItems = [
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'sales', label: 'Sales', icon: '🛒' },
    { id: 'records', label: 'Records', icon: '📊' },
    { id: 'salespersons', label: 'SalePersons', icon: '👥' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading data from server...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-red-200">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAllData}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-xl transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-800">POS System</h1>
                <p className="text-sm text-gray-600">Point of Sale</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-4">
            {menuItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {!sidebarCollapsed && (
            <div className="text-center text-xs text-gray-500">
              <p>Version 1.0</p>
              <p>© 2024 POS System</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab}</h2>
              <p className="text-gray-600 text-sm">Manage your {activeTab} efficiently</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-GB', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}
              </div>
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'products' && (
              <Products 
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}
            
            {activeTab === 'sales' && (
              <Sales 
                products={products}
                salespersons={salespersons}
                onSaveSale={handleSaveSale}
              />
            )}
            
            {activeTab === 'records' && (
              <Records 
                sales={sales}
                products={products}
                salespersons={salespersons}
                onUpdateSale={handleUpdateSale}
                onDeleteSale={handleDeleteSale}
                onNewSale={handleNewSale}
              />
            )}
            
            {activeTab === 'salespersons' && (
              <Salespersons 
                salespersons={salespersons}
                onAddSalesperson={handleAddSalesperson}
                onUpdateSalesperson={handleUpdateSalesperson}
                onDeleteSalesperson={handleDeleteSalesperson}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;