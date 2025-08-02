import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaUserMd, FaCalendar, FaUser } from 'react-icons/fa';

const PrescriptionPrint = ({ patient, formData, doctorInfo, customSections }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const currentDate = formatDate(new Date());

  return (
    <div className="prescription-print" style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: 'white',
      color: 'black'
    }}>
      {/* Header */}
      <div style={{ 
        borderBottom: '2px solid #333',
        paddingBottom: '15px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#2c3e50',
          margin: '0 0 10px 0'
        }}>
          Dr. {doctorInfo?.name || 'Doctor Name'}
        </h1>
        <p style={{ 
          fontSize: '14px',
          color: '#7f8c8d',
          margin: '5px 0'
        }}>
          {doctorInfo?.specialization || 'General Physician'}
        </p>
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          fontSize: '12px',
          color: '#7f8c8d',
          marginTop: '10px'
        }}>
          <span><FaPhone style={{ marginRight: '5px' }} />{doctorInfo?.phone || 'Phone'}</span>
          <span><FaEnvelope style={{ marginRight: '5px' }} />{doctorInfo?.email || 'Email'}</span>
          <span><FaMapMarkerAlt style={{ marginRight: '5px' }} />{doctorInfo?.address || 'Address'}</span>
        </div>
      </div>

      {/* Patient Information */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#2c3e50' }}>
            <FaUser style={{ marginRight: '8px' }} />
            Patient Information
          </h3>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Name:</strong> {patient?.fullName || patient?.name || 'N/A'}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Age:</strong> {patient?.age || 'N/A'} years
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Gender:</strong> {patient?.gender || 'N/A'}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Phone:</strong> {patient?.phone || 'N/A'}
          </p>
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#2c3e50' }}>
            <FaCalendar style={{ marginRight: '8px' }} />
            Visit Information
          </h3>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Date:</strong> {currentDate}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Time:</strong> {new Date().toLocaleTimeString()}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Patient ID:</strong> {patient?.uid || patient?._id || 'N/A'}
          </p>
        </div>
      </div>

      {/* Vitals */}
      {Object.values(formData.vitals).some(vital => vital.trim() !== '') && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            Vital Signs
          </h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '10px',
            fontSize: '14px'
          }}>
            {Object.entries(formData.vitals).map(([key, value]) => (
              value.trim() !== '' && (
                <div key={key} style={{ 
                  padding: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  <strong>{key.toUpperCase()}:</strong> {value}
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Chief Complaints */}
      {formData.complaints.some(complaint => complaint.text.trim() !== '') && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            Chief Complaints
          </h3>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px' }}>
            {formData.complaints
              .filter(complaint => complaint.text.trim() !== '')
              .map((complaint, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>{complaint.text}</li>
              ))}
          </ul>
        </div>
      )}

      {/* History */}
      {(formData.pastHistory.some(h => h.value.trim() !== '') || 
        formData.surgicalHistory.some(h => h.value.trim() !== '') || 
        formData.drugAllergy.some(h => h.value.trim() !== '')) && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            History
          </h3>
          {formData.pastHistory.some(h => h.value.trim() !== '') && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Past History:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
                {formData.pastHistory
                  .filter(h => h.value.trim() !== '')
                  .map((h, index) => (
                    <li key={index}>{h.value}</li>
                  ))}
              </ul>
            </div>
          )}
          {formData.surgicalHistory.some(h => h.value.trim() !== '') && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Surgical History:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
                {formData.surgicalHistory
                  .filter(h => h.value.trim() !== '')
                  .map((h, index) => (
                    <li key={index}>{h.value}</li>
                  ))}
              </ul>
            </div>
          )}
          {formData.drugAllergy.some(h => h.value.trim() !== '') && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Drug Allergies:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
                {formData.drugAllergy
                  .filter(h => h.value.trim() !== '')
                  .map((h, index) => (
                    <li key={index}>{h.value}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Physical Examination */}
      {formData.physicalExamination.some(exam => exam.text.trim() !== '') && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            Physical Examination
          </h3>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px' }}>
            {formData.physicalExamination
              .filter(exam => exam.text.trim() !== '')
              .map((exam, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>{exam.text}</li>
              ))}
          </ul>
        </div>
      )}

      {/* Diagnosis */}
      {(formData.diagnosis.provisional.some(d => d.value.trim() !== '') || 
        formData.diagnosis.final.some(d => d.value.trim() !== '')) && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            Diagnosis
          </h3>
          {formData.diagnosis.provisional.some(d => d.value.trim() !== '') && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Provisional Diagnosis:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
                {formData.diagnosis.provisional
                  .filter(d => d.value.trim() !== '')
                  .map((d, index) => (
                    <li key={index}>{d.value}</li>
                  ))}
              </ul>
            </div>
          )}
          {formData.diagnosis.final.some(d => d.value.trim() !== '') && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Final Diagnosis:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
                {formData.diagnosis.final
                  .filter(d => d.value.trim() !== '')
                  .map((d, index) => (
                    <li key={index}>{d.value}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Investigations */}
      {formData.tests.some(test => test.value.trim() !== '') && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            Investigations
          </h3>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px' }}>
            {formData.tests
              .filter(test => test.value.trim() !== '')
              .map((test, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>{test.value}</li>
              ))}
          </ul>
        </div>
      )}

      {/* Medications */}
      {formData.medication.some(med => med.name.trim() !== '') && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            Medications
          </h3>
          <div style={{ 
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Medicine</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Dosage</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Frequency</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Duration</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {formData.medication
                  .filter(med => med.name.trim() !== '')
                  .map((med, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{med.name}</td>
                      <td style={{ padding: '12px' }}>{med.dosage}</td>
                      <td style={{ padding: '12px' }}>{med.frequency}</td>
                      <td style={{ padding: '12px' }}>{med.duration}</td>
                      <td style={{ padding: '12px' }}>{med.notes}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Sections */}
      {customSections.map(section => (
        section.fields.some(field => field.values.some(val => val.value.trim() !== '')) && (
          <div key={section.id} style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
              {section.heading}
            </h3>
            {section.fields.map((field, fieldIdx) => (
              field.values.some(val => val.value.trim() !== '') && (
                <div key={fieldIdx} style={{ marginBottom: '10px' }}>
                  <strong>{field.label}:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
                    {field.values
                      .filter(val => val.value.trim() !== '')
                      .map((val, idx) => (
                        <li key={idx}>{val.value}</li>
                      ))}
                  </ul>
                </div>
              )
            ))}
          </div>
        )
      ))}

      {/* Advice */}
      {formData.advice.trim() !== '' && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            Advice
          </h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
            {formData.advice}
          </p>
        </div>
      )}

      {/* Follow Up */}
      {formData.followUp.some(fu => fu.trim() !== '') && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            Follow Up
          </h3>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px' }}>
            {formData.followUp
              .filter(fu => fu.trim() !== '')
              .map((fu, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>{fu}</li>
              ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '2px solid #333',
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
            <p style={{ margin: '5px 0' }}>Doctor Signature: _________________</p>
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
            This prescription is valid for the date mentioned above. Please follow the instructions carefully.
          </p>
          <p style={{ margin: '5px 0' }}>
            For any queries, please contact the doctor during consultation hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionPrint; 