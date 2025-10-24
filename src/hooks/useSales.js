// hooks/useSales.js
import { useState } from 'react';
import { salesService } from '../services/salesService';
import { saleDetailService } from '../services/saleDetailService';
import Swal from 'sweetalert2';

const useSales = () => {
  const [sales, setSales] = useState([]);
  const [salesBasicList, setSalesBasicList] = useState([]); // Just the sales list without details

  // Load sales WITHOUT details (for both Sales and Records page initial load)
  const loadSalesBasic = async (productsData, salespersonsData) => {
    try {
      const salesData = await salesService.getAllSales();
      
      const basicSales = salesData.map((sale) => {
        const salesperson = salespersonsData.find(sp => sp.SalespersonId === sale.SalespersonId);
        
        return {
          id: sale.SaleId,
          saleTime: new Date(sale.SaleDate).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          total: sale.Total,
          salespersonName: salesperson?.Name || 'Unknown',
          salespersonId: sale.SalespersonId,
          editDate: (sale.UpdatedDate && 
                    new Date(sale.UpdatedDate).getTime() !== new Date(sale.SaleDate).getTime()) 
                    ? new Date(sale.UpdatedDate).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      }) : null,
          comments: sale.Comments || '',
          items: [] // No items loaded yet
        };
      });

      setSalesBasicList(basicSales);
      setSales(basicSales); // Also set to sales state for Records page to use
      return basicSales;
    } catch (error) {
      console.error('Error loading basic sales:', error);
      throw error;
    }
  };

  // Load sales WITH details using getAll (for Records page - single call)
  const loadSales = async (productsData, salespersonsData) => {
    try {
      const salesData = await salesService.getAllSales();
      
      // Get ALL sale details in one call instead of individual calls
      const allSaleDetailsResponse = await saleDetailService.getAll();
      
      // Check if response is an array, if not it might be wrapped in a data property
      const allSaleDetails = Array.isArray(allSaleDetailsResponse) 
        ? allSaleDetailsResponse 
        : (allSaleDetailsResponse?.data || []);
      
      console.log('All sale details loaded:', allSaleDetails); // Debug log
      
      const salesWithDetails = salesData.map((sale) => {
        const salesperson = salespersonsData.find(sp => sp.SalespersonId === sale.SalespersonId);
        
        // Filter sale details for this specific sale
        const saleDetails = allSaleDetails.filter(detail => detail.SaleId === sale.SaleId);
        
        return {
          id: sale.SaleId,
          saleTime: new Date(sale.SaleDate).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          total: sale.Total,
          salespersonName: salesperson?.Name || 'Unknown',
          salespersonId: sale.SalespersonId,
          editDate: (sale.UpdatedDate && 
                    new Date(sale.UpdatedDate).getTime() !== new Date(sale.SaleDate).getTime()) 
                    ? new Date(sale.UpdatedDate).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      }) : null,
          comments: sale.Comments || '',
          items: saleDetails.map(detail => {
            const product = productsData.find(p => p.ProductId === detail.ProductId);
            return {
              code: product?.Code || 'Unknown',
              name: product?.Name || 'Unknown Product',
              quantity: detail.Quantity,
              discount: detail.Discount || 0,
              price: detail.RetailPrice,
              amount: (detail.RetailPrice * detail.Quantity) - ((detail.RetailPrice * detail.Quantity * detail.Discount) / 100)
            };
          })
        };
      });

      setSales(salesWithDetails);
      return salesWithDetails;
    } catch (error) {
      console.error('Error loading sales:', error);
      throw error;
    }
  };

  // Load details for a specific sale (when editing or viewing)
  const loadSaleDetails = async (saleId, productsData) => {
    try {
      const saleDetails = await saleDetailService.getSaleDetailsBySaleId(saleId);
      
      const items = saleDetails.map(detail => {
        const product = productsData.find(p => p.ProductId === detail.ProductId);
        return {
          code: product?.Code || 'Unknown',
          name: product?.Name || 'Unknown Product',
          quantity: detail.Quantity,
          discount: detail.Discount || 0,
          price: detail.RetailPrice,
          amount: (detail.RetailPrice * detail.Quantity) - ((detail.RetailPrice * detail.Quantity * detail.Discount) / 100)
        };
      });

      // Update the specific sale with its items
      setSales(prev => prev.map(sale => 
        sale.id === saleId ? { ...sale, items } : sale
      ));

      return items;
    } catch (error) {
      console.error('Error loading sale details:', error);
      throw error;
    }
  };

  const handleSaveSale = async (sale, products, salespersons) => {
    try {
      // Find salesperson by name to get ID
      const salesperson = salespersons.find(sp => sp.name === sale.salespersonName);
      if (!salesperson) {
        throw new Error('Salesperson not found');
      }

      // Create the sale
      const backendSale = {
        Total: sale.total,
        SaleDate: new Date().toISOString(),
        SalespersonId: salesperson.id,
        Comments: sale.comments || null
      };

      const createdSale = await salesService.createSale(backendSale);

      // Create sale details
      const saleDetails = sale.items.map(item => {
        const product = products.find(p => p.code === item.code);
        return {
          SaleId: createdSale.SaleId,
          ProductId: product.id,
          RetailPrice: item.price,
          Quantity: item.quantity,
          Discount: item.discount || 0
        };
      });

      await saleDetailService.createMultipleSaleDetails(saleDetails);

      // Reload basic sales list (no details)
      await loadSalesBasic(products, salespersons);

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Sale saved successfully!',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error saving sale:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save sale. Please try again.',
      });
    }
  };

  const handleUpdateSale = async (updatedSale, products, salespersons) => {
    try {
      // Find salesperson by name to get ID
      let salespersonId;
      if (updatedSale.salespersonId) {
        salespersonId = updatedSale.salespersonId;
      } else {
        const salesperson = salespersons.find(sp => sp.name === updatedSale.salespersonName);
        if (!salesperson) {
          throw new Error('Salesperson not found');
        }
        salespersonId = salesperson.id;
      }

      // Update the sale
      const backendSale = {
        Total: updatedSale.total,
        SaleDate: new Date(updatedSale.saleTime.replace(/(\d{2})\/(\d{2})\/(\d{4}), (.*)/, '$3-$2-$1T$4')).toISOString(),
        SalespersonId: salespersonId,
        Comments: updatedSale.comments || null
      };

      await salesService.updateSale(updatedSale.id, backendSale);

      // Delete existing sale details and create new ones
      await saleDetailService.deleteSaleDetailsBySaleId(updatedSale.id);

      const saleDetails = updatedSale.items.map(item => {
        const product = products.find(p => p.code === item.code);
        return {
          SaleId: updatedSale.id,
          ProductId: product.id,
          RetailPrice: item.price,
          Quantity: item.quantity,
          Discount: item.discount || 0
        };
      });

      if (saleDetails.length > 0) {
        await saleDetailService.createMultipleSaleDetails(saleDetails);
      }

      const updatedSaleWithNewEditDate = {
        ...updatedSale,
        editDate: new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };

      setSales(prev => prev.map(sale => 
        sale.id === updatedSale.id ? updatedSaleWithNewEditDate : sale
      ));

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Sale updated successfully!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating sale:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update sale. Please try again.',
      });
    }
  };

  const handleDeleteSale = async (saleId) => {
    try {
      // Delete sale details first
      await saleDetailService.deleteSaleDetailsBySaleId(saleId);
      // Then delete the sale
      await salesService.deleteSale(saleId);
      
      setSales(prev => prev.filter(sale => sale.id !== saleId));

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Sale has been deleted.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error deleting sale:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Cannot delete sale details. These records may be referenced by other transactions in the database.',
      });
    }
  };

  return {
    sales,
    salesBasicList,
    setSales,
    loadSales,
    loadSalesBasic,
    loadSaleDetails,
    handleSaveSale,
    handleUpdateSale,
    handleDeleteSale
  };
};

export default useSales;