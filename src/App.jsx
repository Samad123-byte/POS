import React, { useState } from 'react';
import { Package, ShoppingCart, FileText, User, Store } from 'lucide-react';
import Products from './components/Products';
import Sales from './components/Sales';
import Records from './components/Records';
import Salesperson from './components/Salesperson';

function App() {
  const [activeTab, setActiveTab] = useState('products');
  const [editingSaleId, setEditingSaleId] = useState(null);

  const handleEditSale = (saleId) => {
    setEditingSaleId(saleId);
    setActiveTab('sales');
  };

  const handleBackToRecords = () => {
    setEditingSaleId(null);
    setActiveTab('records');
  };

  const handleTabChange = (tab) => {
    if (tab !== 'sales') {
      setEditingSaleId(null);
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border-2 border-white/30">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">POS System</h1>
                <p className="text-indigo-100 text-sm font-medium">Point of Sale Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                <p className="text-white text-sm font-semibold">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Navigation Tabs */}
        <div className="container mx-auto px-6">
          <div className="flex gap-2 -mb-px">
            <button
              onClick={() => handleTabChange('products')}
              className={`group relative px-6 py-4 font-semibold flex items-center gap-3 transition-all duration-200 ${
                activeTab === 'products' 
                  ? 'bg-white text-indigo-600 rounded-t-xl shadow-lg' 
                  : 'text-white hover:bg-white/10 rounded-t-xl'
              }`}
            >
              <Package size={20} className={activeTab === 'products' ? 'text-indigo-600' : 'text-white'} />
              <span>Products</span>
              {activeTab === 'products' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-full"></div>
              )}
            </button>

            <button
              onClick={() => handleTabChange('sales')}
              className={`group relative px-6 py-4 font-semibold flex items-center gap-3 transition-all duration-200 ${
                activeTab === 'sales' 
                  ? 'bg-white text-indigo-600 rounded-t-xl shadow-lg' 
                  : 'text-white hover:bg-white/10 rounded-t-xl'
              }`}
            >
              <ShoppingCart size={20} className={activeTab === 'sales' ? 'text-indigo-600' : 'text-white'} />
              <span>Sales</span>
              {activeTab === 'sales' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-full"></div>
              )}
            </button>

            <button
              onClick={() => handleTabChange('records')}
              className={`group relative px-6 py-4 font-semibold flex items-center gap-3 transition-all duration-200 ${
                activeTab === 'records' 
                  ? 'bg-white text-indigo-600 rounded-t-xl shadow-lg' 
                  : 'text-white hover:bg-white/10 rounded-t-xl'
              }`}
            >
              <FileText size={20} className={activeTab === 'records' ? 'text-indigo-600' : 'text-white'} />
              <span>Records</span>
              {activeTab === 'records' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-full"></div>
              )}
            </button>

            <button
              onClick={() => handleTabChange('salesperson')}
              className={`group relative px-6 py-4 font-semibold flex items-center gap-3 transition-all duration-200 ${
                activeTab === 'salesperson' 
                  ? 'bg-white text-indigo-600 rounded-t-xl shadow-lg' 
                  : 'text-white hover:bg-white/10 rounded-t-xl'
              }`}
            >
              <User size={20} className={activeTab === 'salesperson' ? 'text-indigo-600' : 'text-white'} />
              <span>Salesperson</span>
              {activeTab === 'salesperson' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area with Modern Background */}
      <div className="container mx-auto py-8 px-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-2">
          {activeTab === 'products' && <Products />}
          {activeTab === 'sales' && (
            <Sales 
              editingSaleId={editingSaleId} 
              onBackToRecords={editingSaleId ? handleBackToRecords : null}
            />
          )}
          {activeTab === 'records' && <Records onEditSale={handleEditSale} />}
          {activeTab === 'salesperson' && <Salesperson />}
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-6 py-6 mt-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border-2 border-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Store size={16} />
              <span className="text-sm font-medium">POS System © 2025</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">Version 1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;