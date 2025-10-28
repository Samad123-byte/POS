import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { saleService } from '../services/saleService';
import { saleDetailService } from '../services/saleDetailService';

const SaleDetailView = ({ saleId, onBack }) => {
  const [sale, setSale] = useState(null);
  const [saleDetails, setSaleDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSaleDetails();
  }, [saleId]);

  const fetchSaleDetails = async () => {
    setLoading(true);
    try {
      const saleResponse = await saleService.getById(saleId);
      setSale(saleResponse);
      
      const detailsResponse = await saleDetailService.getSaleDetailsBySaleId(saleId);
      setSaleDetails(Array.isArray(detailsResponse) ? detailsResponse : []);
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch sale details', 'error');
    }
    setLoading(false);
  };

  const handleDeleteDetail = async (detailId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await saleDetailService.delete(detailId);
        if (response.success) {
          Swal.fire('Deleted!', response.message, 'success');
          fetchSaleDetails();
        } else {
          Swal.fire('Error', response.message, 'error');
        }
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || error.message, 'error');
      }
      setLoading(false);
    }
  };

  if (loading && !sale) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-blue-500 hover:text-blue-700 font-medium"
      >
        <ChevronLeft size={20} /> Back to Records
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-indigo-700">Sale #{sale?.saleId}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Date:</span> {sale?.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'N/A'}
          </div>
          <div>
            <span className="font-medium">Salesperson ID:</span> {sale?.salespersonId}
          </div>
          <div>
            <span className="font-medium">Total:</span> <span className="text-green-600 font-bold">${sale?.total?.toFixed(2)}</span>
          </div>
          <div>
            <span className="font-medium">Comments:</span> {sale?.comments || 'N/A'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="text-xl font-bold p-4 bg-gray-50">Sale Items</h3>
        <table className="w-full">
          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Detail ID</th>
              <th className="px-4 py-3 text-left font-semibold">Product ID</th>
              <th className="px-4 py-3 text-right font-semibold">Price</th>
              <th className="px-4 py-3 text-right font-semibold">Quantity</th>
              <th className="px-4 py-3 text-right font-semibold">Discount %</th>
              <th className="px-4 py-3 text-right font-semibold">Subtotal</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {saleDetails.map((detail) => {
              const subtotal = detail.retailPrice * detail.quantity;
              const discountAmount = subtotal * (detail.discount || 0) / 100;
              const total = subtotal - discountAmount;
              
              return (
                <tr key={detail.saleDetailId} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-blue-600">{detail.saleDetailId}</td>
                  <td className="px-4 py-3">{detail.productId}</td>
                  <td className="px-4 py-3 text-right">${detail.retailPrice?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{detail.quantity}</td>
                  <td className="px-4 py-3 text-right">{detail.discount || 0}%</td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">${total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteDetail(detail.saleDetailId)}
                      className="text-red-500 hover:text-red-700 inline-flex items-center gap-1"
                    >
                      <Trash2 size={18} /> Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SaleDetailView;
