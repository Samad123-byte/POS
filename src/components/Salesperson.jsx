import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { salespersonService } from '../services/salespersonService';
import AddSalespersonModal from './AddSalespersonModal';
import EditSalespersonModal from './EditSalespersonModal';
import Pagination from './Pagination';

const Salesperson = () => {
  const [salespersons, setSalespersons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSalesperson, setEditingSalesperson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Helper function to format date and time
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

  useEffect(() => {
    loadSalespersons();
  }, [currentPage]);

  const loadSalespersons = async () => {
    setLoading(true);
    try {
      const response = await salespersonService.getAll(currentPage, pageSize);
      setSalespersons(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalRecords(response.totalRecords || 0);
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
    setLoading(false);
  };

  const handleAddSalesperson = async (salespersonData) => {
    try {
      await salespersonService.create(salespersonData);
      Swal.fire('Success', 'Salesperson added successfully!', 'success');
      loadSalespersons();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || error.message, 'error');
    }
  };

  const handleUpdateSalesperson = async (salespersonData) => {
    try {
      await salespersonService.update(salespersonData);
      Swal.fire('Success', 'Salesperson updated successfully!', 'success');
      loadSalespersons();
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

  const filteredSalespersons = salespersons.filter(sp =>
    sp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sp.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSalespersons = React.useMemo(() => {
    if (!sortConfig.key) return filteredSalespersons;

    return [...filteredSalespersons].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'salespersonId') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else if (sortConfig.key === 'enteredDate') {
        aValue = new Date(aValue || '1900-01-01').getTime();
        bValue = new Date(bValue || '1900-01-01').getTime();
      } else {
        aValue = aValue?.toString().toLowerCase() || '';
        bValue = bValue?.toString().toLowerCase() || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredSalespersons, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 text-gray-400">↕</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="ml-1 text-white">↑</span> : 
      <span className="ml-1 text-white">↓</span>;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">Salespersons</h2>
      
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center gap-2"
        >
          <Plus size={20} /> Add New Salesperson
        </button>
        
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search salespersons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th 
                    className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
                    onClick={() => handleSort('salespersonId')}
                  >
                    ID {getSortIcon('salespersonId')}
                  </th>
                  <th 
                    className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    NAME {getSortIcon('name')}
                  </th>
                  <th 
                    className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
                    onClick={() => handleSort('code')}
                  >
                    CODE {getSortIcon('code')}
                  </th>
                  <th 
                    className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
                    onClick={() => handleSort('enteredDate')}
                  >
                    ENTERED DATE {getSortIcon('enteredDate')}
                  </th>
                  <th className="border border-gray-300 px-4 py-3 font-semibold">UPDATED DATE</th>
                  <th className="border border-gray-300 px-4 py-3 font-semibold">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {sortedSalespersons.map(sp => (
                  <tr key={sp.salespersonId} className="border-b hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-blue-600">{sp.salespersonId}</td>
                    <td className="border border-gray-300 px-4 py-3">{sp.name}</td>
                    <td className="border border-gray-300 px-4 py-3">{sp.code}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">
                      {formatDateTime(sp.enteredDate)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">
                      {sp.updatedDate ? (
                        <span className="text-green-600 font-medium">
                          {formatDateTime(sp.updatedDate)}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">——</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => handleEdit(sp)}
                          className="bg-cyan-500 text-white px-3 py-1 rounded-md hover:bg-cyan-600 transition-colors duration-200 flex items-center gap-1"
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteSalesperson(sp.salespersonId)}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Delete
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

      <AddSalespersonModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSalesperson}
      />

      <EditSalespersonModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdate={handleUpdateSalesperson}
        salesperson={editingSalesperson}
      />
    </div>
  );
};

export default Salesperson;