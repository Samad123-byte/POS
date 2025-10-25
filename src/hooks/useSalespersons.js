import { useState } from 'react';
import { salespersonService } from '../services/salespersonService';
import Swal from 'sweetalert2';

const useSalespersons = () => {
  const [salespersons, setSalespersons] = useState([]);
  const [rawSalespersons, setRawSalespersons] = useState([]);
  
  // ✅ ADD PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const transformSalesperson = (salesperson) => ({
    id: salesperson.SalespersonId,
    name: salesperson.Name,
    code: salesperson.Code,
    enteredDate: new Date(salesperson.EnteredDate).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    editDate: (salesperson.UpdatedDate && 
              new Date(salesperson.UpdatedDate).getTime() !== new Date(salesperson.EnteredDate).getTime()) 
              ? new Date(salesperson.UpdatedDate).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                }) : null
  });

// ✅ UPDATE loadSalespersons to accept pagination
// ✅ UPDATE loadSalespersons to accept pagination
const loadSalespersons = async (page = 1, size = 10) => {
  try {
    const response = await salespersonService.getAllSalespersons(page, size);
    
    console.log('Salespersons API Response:', response); // Debug log
    
    // ✅ Handle both PascalCase (Data) and camelCase (data) from backend
    const data = response.Data || response.data;
    const currentPageNum = response.CurrentPage || response.currentPage;
    const pageSizeNum = response.PageSize || response.pageSize;
    const totalRec = response.TotalRecords || response.totalRecords;
    const totalPgs = response.TotalPages || response.totalPages;
    
    // ✅ Check if response has pagination data
    if (data && Array.isArray(data)) {
      // Paginated response
      setRawSalespersons(data);
      const transformedData = data.map(transformSalesperson);
      setSalespersons(transformedData);
      setCurrentPage(currentPageNum || 1);
      setPageSize(pageSizeNum || 10);
      setTotalRecords(totalRec || 0);
      setTotalPages(totalPgs || 1);
      
      return { transformed: transformedData, raw: data, pagination: response };
    } else if (Array.isArray(response)) {
      // Non-paginated response (backward compatible)
      setRawSalespersons(response);
      const transformedData = response.map(transformSalesperson);
      setSalespersons(transformedData);
      return { transformed: transformedData, raw: response };
    } else {
      console.error('Unexpected response format:', response);
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    console.error('Error loading salespersons:', error);
    throw error;
  }
};

  const handleAddSalesperson = async (salesperson) => {
    try {
      const backendSalesperson = {
        Name: salesperson.name,
        Code: salesperson.code
      };
      
      const createdSalesperson = await salespersonService.createSalesperson(backendSalesperson);
      
      // ✅ Reload current page after adding
      await loadSalespersons(currentPage, pageSize);

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Salesperson added successfully!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error adding salesperson:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add salesperson. Please try again.',
      });
    }
  };

  const handleUpdateSalesperson = async (updatedSalesperson) => {
    try {
      const enteredDateISO = updatedSalesperson.enteredDate ? 
        new Date(updatedSalesperson.enteredDate.replace(/(\d{2})\/(\d{2})\/(\d{4}), (.*)/, '$3-$2-$1T$4')).toISOString() :
        new Date().toISOString();

      const backendSalesperson = {
        Name: updatedSalesperson.name,
        Code: updatedSalesperson.code,
        EnteredDate: enteredDateISO
      };
      
      await salespersonService.updateSalesperson(updatedSalesperson.id, backendSalesperson);
      
      // ✅ Reload current page after updating
      await loadSalespersons(currentPage, pageSize);

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Salesperson updated successfully!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating salesperson:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update salesperson. Please try again.',
      });
    }
  };

  const handleDeleteSalesperson = async (salespersonId) => {
    try {
      await salespersonService.deleteSalesperson(salespersonId);
      
      // ✅ Reload current page after deleting
      await loadSalespersons(currentPage, pageSize);

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Salesperson has been deleted.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error deleting salesperson:', error);
      
      const errorMessage = error.response?.data?.message || 
                          'Cannot delete salesperson. This salesperson has associated sales records in the database. Please reassign or delete the sales first before removing this salesperson.';
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    }
  };

  return {
    salespersons,
    rawSalespersons,
    setSalespersons,
    loadSalespersons,
    handleAddSalesperson,
    handleUpdateSalesperson,
    handleDeleteSalesperson,
    // ✅ EXPORT PAGINATION STATE
    currentPage,
    pageSize,
    totalRecords,
    totalPages,
    setCurrentPage,
    setPageSize
  };
};

export default useSalespersons;