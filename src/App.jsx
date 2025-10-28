import React, { useState } from 'react';
import { Package, ShoppingCart, FileText, User } from 'lucide-react';
import Products from './components/Products';
import Sales from './components/Sales';
import Records from './components/Records';
import SaleDetailView from './components/SaleDetailView';
import Salesperson from './components/Salesperson';

function App() {
  const [activeTab, setActiveTab] = useState('products');
  const [viewingSaleId, setViewingSaleId] = useState(null);

  const handleViewSale = (saleId) => {
    setViewingSaleId(saleId);
    setActiveTab('saleDetail');
  };

  const handleBackToRecords = () => {
    setViewingSaleId(null);
    setActiveTab('records');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg">
        <h1 className="text-3xl font-bold text-center">🛒 POS System</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b bg-white shadow">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-4 font-medium flex items-center gap-2 transition-colors ${
            activeTab === 'products' 
              ? 'bg-indigo-600 text-white border-b-2 border-indigo-800' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <Package size={20} /> Products
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-6 py-4 font-medium flex items-center gap-2 transition-colors ${
            activeTab === 'sales' 
              ? 'bg-indigo-600 text-white border-b-2 border-indigo-800' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <ShoppingCart size={20} /> Sales
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-6 py-4 font-medium flex items-center gap-2 transition-colors ${
            activeTab === 'records' 
              ? 'bg-indigo-600 text-white border-b-2 border-indigo-800' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <FileText size={20} /> Records
        </button>
        <button
          onClick={() => setActiveTab('salesperson')}
          className={`px-6 py-4 font-medium flex items-center gap-2 transition-colors ${
            activeTab === 'salesperson' 
              ? 'bg-indigo-600 text-white border-b-2 border-indigo-800' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <User size={20} /> Salesperson
        </button>
      </div>

      {/* Content Area */}
      <div className="container mx-auto py-6 px-4">
        {activeTab === 'products' && <Products />}
        {activeTab === 'sales' && <Sales />}
        {activeTab === 'records' && <Records onViewSale={handleViewSale} />}
        {activeTab === 'saleDetail' && viewingSaleId && (
          <SaleDetailView saleId={viewingSaleId} onBack={handleBackToRecords} />
        )}
        {activeTab === 'salesperson' && <Salesperson />}
      </div>
    </div>
  );
}

export default App;
