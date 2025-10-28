import React, { useState, useEffect } from 'react';
import { Trash2, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import { saleService } from '../services/saleService';
import Pagination from './Pagination';

const Records = ({ onViewSale }) => {
  const [sales, setSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSales();
  }, [currentPage]);

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

  const handleDelete = async (id) => {
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Sales Records</h2>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Sale ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Salesperson ID</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Comments</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.saleId} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-blue-600">{sale.saleId}</td>
                    <td className="px-4 py-3">{new Date(sale.saleDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{sale.salespersonId}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">${sale.total?.toFixed(2)}</td>
                    <td className="px-4 py-3">{sale.comments || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onViewSale(sale.saleId)}
                          className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye size={18} /> View
                        </button>
                        <button
                          onClick={() => handleDelete(sale.saleId)}
                          className="text-red-500 hover:text-red-700 flex items-center gap-1"
                          title="Delete"
                        >
                          <Trash2 size={18} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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