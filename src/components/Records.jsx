import React, { useState, useEffect } from 'react';
import { Trash2, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import { saleService } from '../services/saleService';
import { salespersonService } from '../services/salespersonService';
import Pagination from './Pagination';

const Records = ({ onEditSale }) => {
  const [sales, setSales] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null); // For showing full comments

  useEffect(() => {
    fetchSalespersons();
  }, []);

  useEffect(() => {
    fetchSales();
  }, [currentPage]);

  const fetchSalespersons = async () => {
    try {
      const response = await salespersonService.getAll(1, 1000);
      setSalespersons(response.data || []);
    } catch (error) {
      console.error('Failed to fetch salespersons:', error);
    }
  };

  const getSalespersonName = (salespersonId) => {
    const salesperson = salespersons.find(sp => sp.salespersonId === salespersonId);
    return salesperson ? salesperson.name : `ID: ${salespersonId}`;
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await saleService.getAll(currentPage, pageSize);
      setSales(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalRecords(response.totalRecords || 0);
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch sales records', 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will delete the sale and all its details!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await saleService.delete(id);
        if (response.success) {
          Swal.fire('Deleted!', response.message, 'success');
          fetchSales();
        } else {
          Swal.fire('Error', response.message, 'error');
        }
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || error.message, 'error');
      }
      setLoading(false);
    }
  };

  const handleRowDoubleClick = (saleId) => {
    if (onEditSale) {
      onEditSale(saleId);
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Sales Records</h2>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Sale ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Sale Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Salesperson</th>
                    <th className="px-4 py-3 text-left font-semibold">Comments</th>
                    <th className="px-4 py-3 text-left font-semibold">Created</th>
                    <th className="px-4 py-3 text-left font-semibold">Updated</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                    <th className="px-4 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <React.Fragment key={sale.saleId}>
                      <tr 
                        className="border-t hover:bg-blue-50 cursor-pointer transition-colors"
                        onDoubleClick={() => handleRowDoubleClick(sale.saleId)}
                        title="Double click to edit"
                      >
                        <td className="px-4 py-3 font-semibold text-blue-600">{sale.saleId}</td>
                        <td className="px-4 py-3 text-sm">{formatDateTime(sale.saleDate)}</td>
                        <td className="px-4 py-3 font-medium">{getSalespersonName(sale.salespersonId)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {truncateText(sale.comments, 30)}
                            </span>
                            {sale.comments && sale.comments.length > 30 && (
                              <button
                                onClick={(e) => toggleExpandRow(sale.saleId, e)}
                                className="text-blue-500 hover:text-blue-700"
                                title="View full comment"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDateTime(sale.saleDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {sale.updatedDate ? formatDateTime(sale.updatedDate) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-green-600">
                          ${sale.total?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={(e) => handleDelete(sale.saleId, e)}
                              className="text-red-500 hover:text-red-700 flex items-center gap-1"
                              title="Delete"
                            >
                              <Trash2 size={18} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded row for full comments */}
                      {expandedRow === sale.saleId && sale.comments && (
                        <tr className="bg-blue-50 border-t">
                          <td colSpan="8" className="px-4 py-3">
                            <div className="bg-white p-3 rounded border border-blue-200">
                              <strong className="text-sm text-gray-700">Full Comments:</strong>
                              <p className="text-sm text-gray-600 mt-1">{sale.comments}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default Records;