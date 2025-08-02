import React from 'react';
import { createRoot } from 'react-dom/client';
import InvoicePrint from '../components/ui/InvoicePrint';

export const printInvoice = (invoice, doctorInfo) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    alert('Please allow pop-ups to print the invoice');
    return;
  }

  // Create the print content
  const printContent = React.createElement(InvoicePrint, {
    invoice,
    doctorInfo
  });

  // Create a container for the React component
  const container = printWindow.document.createElement('div');
  container.id = 'invoice-print-root';
  printWindow.document.body.appendChild(container);

  // Add CSS for print styling
  const style = printWindow.document.createElement('style');
  style.textContent = `
    @media print {
      body {
        margin: 0;
        padding: 20px;
        font-family: Arial, sans-serif;
        background: white;
        color: black;
      }
      
      .invoice-print {
        max-width: none;
        margin: 0;
        padding: 0;
      }
      
      @page {
        margin: 1in;
        size: A4;
      }
      
      /* Hide any elements that shouldn't print */
      .no-print {
        display: none !important;
      }
      
      /* Ensure proper page breaks */
      .page-break {
        page-break-before: always;
      }
      
      /* Table styling for print */
      table {
        border-collapse: collapse;
        width: 100%;
      }
      
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      
      th {
        background-color: #f8f9fa;
        font-weight: bold;
      }
    }
    
    @media screen {
      body {
        font-family: Arial, sans-serif;
        background: white;
        color: black;
        margin: 0;
        padding: 20px;
      }
    }
  `;
  printWindow.document.head.appendChild(style);

  // Render the React component
  const root = createRoot(container);
  root.render(printContent);

  // Wait for the component to render, then print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    
    // Close the window after printing (optional)
    // printWindow.close();
  }, 500);
};

export default printInvoice; 