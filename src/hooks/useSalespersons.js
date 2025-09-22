// hooks/useSalespersons.js
import { useState } from 'react';
import { salespersonService } from '../services/salespersonService';
import Swal from 'sweetalert2';

const useSalespersons = () => {
  const [salespersons, setSalespersons] = useState([]);

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
    editDate: salesperson.UpdatedDate ? new Date(salesperson.UpdatedDate).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) : null
  });

  const loadSalespersons = async () => {
    try {
      const salespersonsData = await salespersonService.getAllSalespersons();
      const transformedData = salespersonsData.map(transformSalesperson);
      setSalespersons(transformedData);
      return transformedData;
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
      const newSalesperson = transformSalesperson(createdSalesperson);
      
      setSalespersons(prev => [...prev, newSalesperson]);

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
      // Convert display date format to ISO string
      const enteredDateISO = updatedSalesperson.enteredDate ? 
        new Date(updatedSalesperson.enteredDate.replace(/(\d{2})\/(\d{2})\/(\d{4}), (.*)/, '$3-$2-$1T$4')).toISOString() :
        new Date().toISOString();

      const backendSalesperson = {
        Name: updatedSalesperson.name,
        Code: updatedSalesperson.code,
        EnteredDate: enteredDateISO
      };
      
      console.log('Updating salesperson:', updatedSalesperson.id, 'with data:', backendSalesperson); // Debug log
      
      await salespersonService.updateSalesperson(updatedSalesperson.id, backendSalesperson);
      
      const updatedSalespersonWithNewEditDate = {
        ...updatedSalesperson,
        editDate: new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };
      
      setSalespersons(prev => prev.map(salesperson => 
        salesperson.id === updatedSalesperson.id ? updatedSalespersonWithNewEditDate : salesperson
      ));

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
      console.log('Attempting to delete salesperson:', salespersonId); // Debug log
      
      await salespersonService.deleteSalesperson(salespersonId);
      setSalespersons(prev => prev.filter(salesperson => salesperson.id !== salespersonId));

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Salesperson has been deleted.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error deleting salesperson:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete salesperson. Please try again.',
      });
    }
  };

  return {
    salespersons,
    setSalespersons,
    loadSalespersons,
    handleAddSalesperson,
    handleUpdateSalesperson,
    handleDeleteSalesperson
  };
};

export default useSalespersons;