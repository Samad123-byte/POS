import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Search, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import { salespersonService } from '../services/salespersonService';
import Pagination from './Pagination';
import   AddSalespersonModal from './AddSalespersonModal'
import EditSalespersonModal from './EditSalespersonModal'

const Salesperson = () => {
  const [salespersons, setSalespersons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSalesperson, setEditingSalesperson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // ✅ Load salespersons from backend with pagination
  useEffect(() => {
    loadSalespersons();
  }, [currentPage]); // ✅ Re-fetch when page changes

  const loadSalespersons = async () => {
    setLoading(true);
    try {
      // ✅ Calculate startIndex and endIndex (0-based)
      const startIndex = (currentPage - 1) * pageSize; // Page 1: 0, Page 2: 10
      const endIndex = startIndex + pageSize - 1;      // Page 1: 9, Page 2: 19

      console.log('🔄 Fetching salespersons:', { currentPage, startIndex, endIndex });

      // ✅ Backend returns ONLY the requested page
      const response = await salespersonService.getAll(startIndex, endIndex);
      
      console.log('✅ Response:', {
        itemsReceived: response.data?.length,
        totalRecords: response.totalRecords,
        startIndex: response.startIndex,
        endIndex: response.endIndex
      });

      setSalespersons(response.data || []);
      setTotalRecords(response.totalRecords || 0);
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
    setLoading(false);
  };

  const handleAddSalesperson = async (salespersonData) => {
    try {
      const response = await salespersonService.create(salespersonData);
      
      if (!response.success) {
        Swal.fire('Error', response.message, 'error');
        return response;
      }
      
      Swal.fire('Success', 'Salesperson added successfully!', 'success');
      setCurrentPage(1); // Go to first page
      loadSalespersons();
      return response;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      Swal.fire('Error', errorMsg, 'error');
      return { success: false, message: errorMsg };
    }
  };

  const handleUpdateSalesperson = async (salespersonData) => {
    try {
      const response = await salespersonService.update(salespersonData);
      
      if (!response.success) {
        Swal.fire('Error', response.message, 'error');
        return;
      }
      
      Swal.fire('Success', 'Salesperson updated successfully!', 'success');
      loadSalespersons(); // Reload current page
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || error.message, 'error');
    }
  };

  const handleDeleteSalesperson = async (salespersonId) => {
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
      try {
        const response = await salespersonService.delete(salespersonId);
        if (response.success) {
          Swal.fire('Deleted!', response.message, 'success');
          loadSalespersons();
        } else {
          Swal.fire('Error', response.message, 'error');
        }
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || error.message, 'error');
      }
    }
  };

  const handleEdit = (salesperson) => {
    setEditingSalesperson(salesperson);
    setShowEditModal(true);
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
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border-2 border-white/30">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Salespersons</h1>
                  <p className="text-indigo-100 text-sm mt-1">Manage your sales team</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <div className="text-white text-sm font-medium">Total Salespersons</div>
                <div className="text-white text-2xl font-bold">{totalRecords}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} /> Add New Salesperson
            </button>
            
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search salespersons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 w-80 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
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
              <div className="text-xl font-bold">{salespersons.length}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-600">Total Records</div>
              <div className="text-xl font-bold">{totalRecords}</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-800">
            <br/>
           
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">Loading salespersons...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Code</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Updated</th>
                      <th className="px-6 py-4 text-center font-bold text-sm uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {salespersons.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg font-medium">No salespersons found</p>
                          <p className="text-gray-400 text-sm mt-2">Add your first salesperson to get started</p>
                        </td>
                      </tr>
                    ) : (
                      salespersons.map(sp => (
                        <tr key={sp.salespersonId} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                          <td className="px-6 py-4">
                            <div className="bg-indigo-100 rounded-lg px-3 py-1 inline-block">
                              <span className="font-bold text-indigo-700">#{sp.salespersonId}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center">
                                <span className="text-purple-700 font-bold text-lg">
                                  {sp.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-semibold text-gray-900">{sp.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-gray-100 px-3 py-1 rounded-lg text-gray-700 font-medium">
                              {sp.code}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDateTime(sp.enteredDate)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {sp.updatedDate ? (
                              <span className="text-green-600 font-medium">
                                {formatDateTime(sp.updatedDate)}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Not updated</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center">
                              <button 
                                onClick={() => handleEdit(sp)}
                                className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors duration-200 font-semibold flex items-center gap-1 shadow-md hover:shadow-lg"
                              >
                                <Edit2 size={16} /> Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteSalesperson(sp.salespersonId)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold flex items-center gap-1 shadow-md hover:shadow-lg"
                              >
                                <Trash2 size={16} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
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

            {showAddModal && (
  <AddSalespersonModal
    isOpen={showAddModal}
    onClose={() => setShowAddModal(false)}
    onAdd={handleAddSalesperson}
    existingSalespersons={salespersons}
  />
)}

{showEditModal && (
  <EditSalespersonModal
    isOpen={showEditModal}
    onClose={() => setShowEditModal(false)}
    onUpdate={handleUpdateSalesperson}
    salesperson={editingSalesperson}
  />
)}

          </>
        )}
      </div>
    </div>
  );
};

export default Salesperson;