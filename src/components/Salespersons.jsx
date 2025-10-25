import React, { useState } from 'react';
import Swal from 'sweetalert2';
import AddSalespersonModal from './AddSalespersonModal';
import EditSalespersonModal from './EditSalespersonModal';

const Salespersons = ({ 
  salespersons, 
  onAddSalesperson, 
  onUpdateSalesperson, 
  onDeleteSalesperson,
  currentPage,
  pageSize,
  totalRecords,
  totalPages,
  loadSalespersons 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSalesperson, setEditingSalesperson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (salesperson) => {
    setEditingSalesperson(salesperson);
    setShowEditModal(true);
  };

  const handleDelete = (salespersonId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteSalesperson(salespersonId);
      }
    });
  };

  const filteredSalespersons = salespersons.filter(salesperson =>
    salesperson.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salesperson.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">SalePersons</h2>
      
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold"
        >
          Add New Sale Person
        </button>
        
        <input 
          type="text" 
          placeholder="Search salespersons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <tr>
            <th className="border border-gray-300 px-4 py-3 font-semibold">ID</th>
            <th className="border border-gray-300 px-4 py-3 font-semibold">Name</th>
            <th className="border border-gray-300 px-4 py-3 font-semibold">Code</th>
            <th className="border border-gray-300 px-4 py-3 font-semibold">Entered Date</th>
            <th className="border border-gray-300 px-4 py-3 font-semibold">Edit Date</th>
            <th className="border border-gray-300 px-4 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredSalespersons.map(salesperson => (
            <tr key={salesperson.id} className="border-b hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-3 font-semibold text-blue-600">{salesperson.id}</td>
              <td className="border border-gray-300 px-4 py-3">{salesperson.name}</td>
              <td className="border border-gray-300 px-4 py-3">{salesperson.code}</td>
              <td className="border border-gray-300 px-4 py-3">{salesperson.enteredDate}</td>
              <td className="border border-gray-300 px-4 py-3">
                {salesperson.editDate ? (
                  <span className="text-green-600 font-medium">{salesperson.editDate}</span>
                ) : (
                  <span className="text-gray-400 italic">——</span> 
                )}
              </td>
              <td className="border border-gray-300 px-4 py-3">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(salesperson)}
                    className="bg-cyan-500 text-white px-3 py-1 rounded-md hover:bg-cyan-600 transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(salesperson.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ PAGINATION CONTROLS */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} salespersons
        </p>
        <div className="flex gap-2">
          <button 
            onClick={() => loadSalespersons(currentPage - 1, pageSize)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="px-3 py-1 border border-gray-300 rounded-md bg-indigo-600 text-white">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => loadSalespersons(currentPage + 1, pageSize)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      <AddSalespersonModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onAddSalesperson}
        existingSalespersons={salespersons}
      />

      <EditSalespersonModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdate={onUpdateSalesperson}
        salesperson={editingSalesperson}
        existingSalespersons={salespersons}
      />
    </div>
  );
};

export default Salespersons;