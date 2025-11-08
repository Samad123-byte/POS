import React, { useState, useEffect } from 'react';
import { Eye, FileText, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { saleService } from '../services/saleService';
import Pagination from './Pagination';

const Records = ({ onEditSale }) => {
  const [sales, setSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Load sales from backend with pagination
  useEffect(() => {
    fetchSales();
  }, [currentPage]); // ✅ Re-fetch when page changes

  const fetchSales = async () => {
    setLoading(true);
    try {
      // ✅ Calculate startIndex and endIndex (0-based)
      const startIndex = (currentPage - 1) * pageSize; // Page 1: 0, Page 2: 10
      const endIndex = startIndex + pageSize - 1;      // Page 1: 9, Page 2: 19

      console.log('🔄 Fetching sales:', { currentPage, startIndex, endIndex });

      // ✅ Backend returns ONLY the requested page
      const response = await saleService.getAll(startIndex, endIndex);
      
      console.log('✅ Response:', {
        itemsReceived: response.data?.length,
        totalRecords: response.totalRecords,
        startIndex: response.startIndex,
        endIndex: response.endIndex
      });

      const salesData = response.data || [];

      // Safe mapping
      const enrichedSales = salesData.map(sale => ({
        ...sale,
        salespersonName: sale.salespersonName || "N/A"
      }));

      setSales(enrichedSales);
      setTotalRecords(response.totalRecords || 0);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
      Swal.fire('Error', 'Failed to fetch sales records', 'error');
    }
    setLoading(false);
  };

  const handleDeleteSale = async (saleId) => {
    const confirmResult = await Swal.fire({
      title: `Delete Sale #${saleId}?`,
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirmResult.isConfirmed) {
      try {
        const response = await saleService.delete(saleId);
        Swal.fire('Deleted!', response.message || 'Sale has been deleted.', 'success');
        fetchSales(); // ✅ Reload current page
      } catch (error) {
        console.error('Delete failed:', error);
        const message = error.response?.data?.message || 'Failed to delete sale';
        Swal.fire('Error', message, 'error');
      }
    }
  };

  const handleRowDoubleClick = (saleId) => {
    if (onEditSale) {
      const selectedSale = sales.find(s => s.saleId === saleId);
      if (selectedSale) {
        onEditSale(saleId);
      }
    }
  };

  const toggleExpandRow = (saleId, e) => {
    e.stopPropagation();
    setExpandedRow(expandedRow === saleId ? null : saleId);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Handle page change - triggers new API call
  const handlePageChange = (newPage) => {
    console.log('📍 Changing page from', currentPage, 'to', newPage);
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-white" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Sales Records</h1>
                  <p className="text-indigo-100 text-sm mt-1">View and manage all sales transactions</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
                <div className="text-white text-sm font-medium">Total Records</div>
                <div className="text-white text-2xl font-bold">{totalRecords}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by Sale ID, Salesperson, or Comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-6">
          <div className="font-bold text-blue-800 mb-2"></div>
          <div className="grid grid-cols-4 gap-4 text-sm text-blue-900">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-600">Current Page</div>
              <div className="text-xl font-bold">{currentPage}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-600">Page Size</div>
              <div className="text-xl font-bold">{pageSize}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-600">Items on Page</div>
              <div className="text-xl font-bold">{sales.length}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-600">Total Records</div>
              <div className="text-xl font-bold">{totalRecords}</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-800">
           
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="flex flex-col items-center justify-center">
              <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 text-lg font-medium">Loading records...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Sale ID</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Sale Date</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Salesperson</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Comments</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Updated</th>
                      <th className="px-6 py-4 text-right font-bold text-sm uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-4 text-right font-bold text-sm uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sales.map(sale => (
                      <React.Fragment key={sale.saleId}>
                        <tr 
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200"
                          onDoubleClick={() => handleRowDoubleClick(sale.saleId)}
                          title="Double click to edit"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="bg-indigo-100 rounded-lg px-3 py-1">
                                <span className="font-bold text-indigo-700">#{sale.saleId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">{formatDateTime(sale.saleDate)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center">
                                <span className="text-purple-700 font-bold text-sm">
                                  {sale.salespersonName?.charAt(0) || "N"}
                                </span>
                              </div>
                              <span className="font-semibold text-gray-900">
                                {sale.salespersonName || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{truncateText(sale.comments, 30)}</span>
                              {sale.comments?.length > 30 && (
                                <button onClick={(e) => toggleExpandRow(sale.saleId, e)} className="text-blue-500 hover:text-blue-700 transition-colors p-1 hover:bg-blue-50 rounded" title="View full comment">
                                  <Eye size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">{sale.createdDate ? formatDateTime(sale.createdDate) : formatDateTime(sale.saleDate)}</td>
                          <td className="px-6 py-4">{sale.updatedDate ? formatDateTime(sale.updatedDate) : <span className="text-gray-400 italic">Not updated</span>}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg px-4 py-2">
                              <span className="text-xl font-bold text-green-700">${sale.total?.toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteSale(sale.saleId); }}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>

                        {expandedRow === sale.saleId && sale.comments && (
                          <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <td colSpan="8" className="px-6 py-4">
                              <div className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-inner">
                                <div className="flex items-start gap-3">
                                  <div className="bg-blue-100 rounded-full p-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <strong className="text-sm font-bold text-gray-700 uppercase tracking-wide">Full Comments:</strong>
                                    <p className="text-gray-700 mt-2 leading-relaxed">{sale.comments}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {sales.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg font-medium">No sales records found</p>
                          <p className="text-gray-400 text-sm mt-2">Create your first sale to see it here</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalRecords > 0 && (
              <div className="mt-6">
                <Pagination 
                  currentPage={currentPage}
                  totalRecords={totalRecords}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Records;