// hooks/useSales.js
import { useState } from 'react';
import { salesService } from '../services/salesService';
import { saleDetailService } from '../services/saleDetailService';
import Swal from 'sweetalert2';

const useSales = () => {
  const [sales, setSales] = useState([]);

  const loadSales = async (productsData, salespersonsData) => {
    try {
      const salesData = await salesService.getAllSales();
      
      const salesWithDetails = await Promise.all(
        salesData.map(async (sale) => {
          try {
            const saleDetails = await saleDetailService.getSaleDetailsBySaleId(sale.SaleId);
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
              salespersonId: sale.SalespersonId, // Store the actual ID for updates
              editDate: (sale.UpdatedDate && 
                        new Date(sale.UpdatedDate).getTime() !== new Date(sale.SaleDate).getTime()) 
                        ? new Date(sale.UpdatedDate).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          }) : null, // Use null instead of empty string for consistency
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
          } catch (error) {
            console.error(`Error loading details for sale ${sale.SaleId}:`, error);
            return {
              id: sale.SaleId,
              saleTime: new Date(sale.SaleDate).toLocaleString('en-GB'),
              total: sale.Total,
              salespersonName: 'Unknown',
              salespersonId: sale.SalespersonId,
              editDate: null,
              comments: sale.Comments || '',
              items: []
            };
          }
        })
      );

      setSales(salesWithDetails);
      return salesWithDetails;
    } catch (error) {
      console.error('Error loading sales:', error);
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

      // Add to local state without editDate since it's a new sale
      const newSale = {
        id: createdSale.SaleId,
        saleTime: new Date(createdSale.SaleDate).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        total: createdSale.Total,
        salespersonName: salesperson.name,
        salespersonId: salesperson.id,
        editDate: null, // Set to null for new sales
        comments: createdSale.Comments || '',
        items: sale.items
      };

      setSales(prev => [...prev, newSale]);

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

      console.log('Updating sale:', updatedSale.id, 'with data:', backendSale); // Debug log

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
      console.log('Attempting to delete sale:', saleId); // Debug log
      
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
        text: 'Failed to delete sale. Please try again.',
      });
    }
  };

  return {
    sales,
    setSales,
    loadSales,
    handleSaveSale,
    handleUpdateSale,
    handleDeleteSale
  };
};

export default useSales;