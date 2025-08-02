import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFileInvoiceDollar, FaCalendar, FaUser, FaPrint } from 'react-icons/fa';

const InvoicePrint = ({ invoice, doctorInfo }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => {
      return sum + (item.quantity * item.amount - (item.discount || 0));
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const additionalDiscount = parseFloat(invoice.additionalDiscountAmount) || 0;
    return subtotal - additionalDiscount;
  };

  const currentDate = formatDate(new Date());

  return (
    <div className="invoice-print" style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: 'white',
      color: 'black'
    }}>
      {/* Header */}
      <div style={{ 
        borderBottom: '3px solid #2c3e50',
        paddingBottom: '20px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#2c3e50',
          margin: '0 0 10px 0'
        }}>
          <FaFileInvoiceDollar style={{ marginRight: '10px', color: '#3498db' }} />
          INVOICE
        </h1>
        <p style={{ 
          fontSize: '16px',
          color: '#7f8c8d',
          margin: '5px 0'
        }}>
          {doctorInfo?.clinicName || 'Medical Clinic'}
        </p>
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          fontSize: '14px',
          color: '#7f8c8d',
          marginTop: '15px'
        }}>
          <span><FaPhone style={{ marginRight: '5px' }} />{doctorInfo?.phone || 'Phone'}</span>
          <span><FaEnvelope style={{ marginRight: '5px' }} />{doctorInfo?.email || 'Email'}</span>
          <span><FaMapMarkerAlt style={{ marginRight: '5px' }} />{doctorInfo?.address || 'Address'}</span>
        </div>
      </div>

      {/* Invoice Details */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        marginBottom: '30px'
      }}>
        {/* Bill To */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#2c3e50' }}>
            <FaUser style={{ marginRight: '8px' }} />
            Bill To
          </h3>
          <div style={{ 
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold' }}>
              {invoice.name || 'Patient Name'}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#6c757d' }}>
              Patient ID: {invoice.uid || 'N/A'}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#6c757d' }}>
              Phone: {invoice.phone || 'N/A'}
            </p>
          </div>
        </div>

        {/* Invoice Info */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#2c3e50' }}>
            <FaFileInvoiceDollar style={{ marginRight: '8px' }} />
            Invoice Details
          </h3>
          <div style={{ 
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Invoice ID:</strong> {invoice.invoiceId || invoice._id}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Date:</strong> {formatDate(invoice.createdAt) || currentDate}
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Status:</strong> 
              <span style={{ 
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                marginLeft: '8px',
                backgroundColor: invoice.paymentStatus === 'Paid' ? '#d4edda' : '#f8d7da',
                color: invoice.paymentStatus === 'Paid' ? '#155724' : '#721c24'
              }}>
                {invoice.paymentStatus || 'Billed'}
              </span>
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Payment Mode:</strong> {invoice.paymentMode || 'Cash'}
            </p>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#2c3e50' }}>
          Services & Charges
        </h3>
        <div style={{ 
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>Service</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>Qty</th>
                <th style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>Rate</th>
                <th style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>Discount</th>
                <th style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '15px', fontWeight: '500' }}>{item.service || 'Service'}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>{item.quantity || 1}</td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>{formatCurrency(item.amount || 0)}</td>
                  <td style={{ padding: '15px', textAlign: 'right', color: '#dc3545' }}>
                    {formatCurrency(item.discount || 0)}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                    {formatCurrency((item.quantity || 1) * (item.amount || 0) - (item.discount || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '30px'
      }}>
        <div style={{ 
          width: '300px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px',
            fontSize: '14px'
          }}>
            <span>Subtotal:</span>
            <span>{formatCurrency(calculateSubtotal())}</span>
          </div>
          {invoice.additionalDiscountAmount > 0 && (
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              fontSize: '14px',
              color: '#dc3545'
            }}>
              <span>Additional Discount:</span>
              <span>-{formatCurrency(invoice.additionalDiscountAmount)}</span>
            </div>
          )}
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '18px',
            fontWeight: 'bold',
            borderTop: '2px solid #dee2e6',
            paddingTop: '10px',
            color: '#2c3e50'
          }}>
            <span>Total:</span>
            <span>{formatCurrency(calculateTotal())}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {(invoice.patientNote || invoice.privateNote) && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#2c3e50' }}>
            Notes
          </h3>
          <div style={{ 
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            {invoice.patientNote && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Patient Note:</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{invoice.patientNote}</p>
              </div>
            )}
            {invoice.privateNote && (
              <div>
                <strong>Private Note:</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{invoice.privateNote}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '2px solid #2c3e50',
        textAlign: 'center'
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ textAlign: 'left', fontSize: '12px', color: '#7f8c8d' }}>
            <p style={{ margin: '5px 0' }}>Patient Signature: _________________</p>
            <p style={{ margin: '5px 0' }}>Date: _________________</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#7f8c8d' }}>
            <p style={{ margin: '5px 0' }}>Authorized Signature: _________________</p>
            <p style={{ margin: '5px 0' }}>Date: {currentDate}</p>
          </div>
        </div>
        <div style={{ 
          fontSize: '10px',
          color: '#95a5a6',
          borderTop: '1px solid #ddd',
          paddingTop: '10px'
        }}>
          <p style={{ margin: '5px 0' }}>
            Thank you for choosing our services. Please keep this invoice for your records.
          </p>
          <p style={{ margin: '5px 0' }}>
            For any queries, please contact us during business hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint; 