import React from 'react';
import { createRoot } from 'react-dom/client';
import PrescriptionPrint from '../components/ui/PrescriptionPrint';

export const printPrescription = (patient, formData, doctorInfo, customSections) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    alert('Please allow pop-ups to print the prescription');
    return;
  }

  // Create the print content
  const printContent = React.createElement(PrescriptionPrint, {
    patient,
    formData,
    doctorInfo,
    customSections
  });

  // Create a container for the React component
  const container = printWindow.document.createElement('div');
  container.id = 'prescription-print-root';
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
      
      .prescription-print {
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
    printWindow.close();
  }, 500);
};

export default printPrescription; 