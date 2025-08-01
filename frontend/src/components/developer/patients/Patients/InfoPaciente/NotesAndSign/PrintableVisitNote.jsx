import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/PrintableVisitNote.scss';

const PrintableVisitNote = () => {
  const { visitId } = useParams();
  const [noteData, setNoteData] = useState(null);
  const [visitData, setVisitData] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNoteData = async () => {
      try {
        // Fetch visit note data
        const noteResponse = await fetch(`http://localhost:8000/visit-notes/${visitId}`);
        if (!noteResponse.ok) {
          throw new Error('Failed to fetch visit note');
        }
        const noteResult = await noteResponse.json();
        setNoteData(noteResult);

        // Try to fetch visit data to get patient info
        try {
          const visitResponse = await fetch(`http://localhost:8000/visits/${visitId}`);
          if (visitResponse.ok) {
            const visitResult = await visitResponse.json();
            setVisitData(visitResult);
            
            // Fetch patient data
            if (visitResult.patient_id) {
              const patientResponse = await fetch(`http://localhost:8000/patients/${visitResult.patient_id}`);
              if (patientResponse.ok) {
                const patientResult = await patientResponse.json();
                setPatientData(patientResult);
              }
            }
          } else {
            console.warn('Visit endpoint returned:', visitResponse.status, 'Continuing without visit data');
          }
        } catch (visitError) {
          console.warn('Failed to fetch visit data:', visitError, 'Continuing with note data only');
        }
      } catch (err) {
        console.error('Error fetching note data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (visitId) {
      fetchNoteData();
    }
  }, [visitId]);

  // Special renderer for Vitals section
  const renderVitalsSection = (vitalsData) => {
    const { at_rest, after_exertion, vitals_additional, vitals_out_of_parameters, ...otherFields } = vitalsData;
    
    // Extract vital signs that appear in both at_rest and after_exertion
    const vitalSigns = ['heart_rate', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'respirations', 'o2_saturation', 'temperature'];
    
    return (
      <div className="vitals-content">
        {/* Vitals Table */}
        <div className="vitals-table">
          <div className="vitals-header">
            <div className="vital-name">Vital Sign</div>
            <div className="at-rest">At Rest</div>
            <div className="after-exertion">After Exertion</div>
          </div>
          
          {vitalSigns.map(vitalSign => {
            const atRestValue = at_rest?.[vitalSign];
            const afterExertionValue = after_exertion?.[vitalSign];
            
            if (!atRestValue && !afterExertionValue) return null;
            
            const formattedName = vitalSign.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            return (
              <div key={vitalSign} className="vitals-row">
                <div className="vital-name">{formattedName}</div>
                <div className="at-rest">{atRestValue || 'N/A'}</div>
                <div className="after-exertion">{afterExertionValue || 'N/A'}</div>
              </div>
            );
          })}
        </div>
        
        {/* Additional Information */}
        {(vitals_additional || vitals_out_of_parameters || Object.keys(otherFields).length > 0) && (
          <div className="vitals-additional">
            <h4>Additional Information</h4>
            {vitals_additional && (
              <div className="field-item">
                <strong>Additional Notes:</strong> {vitals_additional}
              </div>
            )}
            {vitals_out_of_parameters && (
              <div className="field-item">
                <strong>Out of Parameters:</strong> {vitals_out_of_parameters.toString()}
              </div>
            )}
            {Object.entries(otherFields).map(([key, value]) => {
              if (!value) return null;
              return (
                <div key={key} className="field-item">
                  <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {String(value)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Smart field grouping for better horizontal space usage
  const groupFields = (entries) => {
    const simpleFields = [];
    const complexFields = [];
    
    entries.forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        complexFields.push([key, value]);
      } else {
        simpleFields.push([key, value]);
      }
    });
    
    return { simpleFields, complexFields };
  };

  // Render simple fields in a grid layout
  const renderSimpleFields = (fields) => {
    if (fields.length === 0) return null;
    
    return (
      <div className="simple-fields-grid">
        {fields.map(([key, value]) => {
          const formattedLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const formattedValue = Array.isArray(value) ? value.join(', ') : String(value);
          
          return (
            <div key={key} className="simple-field-item">
              <span className="field-label">{formattedLabel}:</span>
              <span className="field-value">{formattedValue}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render complex fields with subsections
  const renderComplexFields = (fields) => {
    if (fields.length === 0) return null;
    
    return (
      <div className="complex-fields-container">
        {fields.map(([key, value]) => {
          const formattedLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          return (
            <div key={key} className="complex-field">
              <h4 className="subsection-title">{formattedLabel}</h4>
              <div className="subsection-grid">
                {Object.entries(value).map(([subKey, subValue]) => {
                  if (!subValue) return null;
                  return (
                    <div key={subKey} className="sub-field-item">
                      <span className="sub-label">{subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                      <span className="sub-value">{String(subValue)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSectionContent = (sectionName, sectionData) => {
    if (!sectionData || Object.keys(sectionData).length === 0) {
      return <p className="no-data">No data recorded</p>;
    }

    // Special handling for Vitals section - check various possible names
    const sectionNameLower = sectionName.toLowerCase();
    if (sectionNameLower === 'vitals' || sectionNameLower.includes('vital')) {
      return (
        <div className="section-content vitals-section">
          {renderVitalsSection(sectionData)}
        </div>
      );
    }

    // Smart grouping for optimal space usage
    const { simpleFields, complexFields } = groupFields(Object.entries(sectionData));

    return (
      <div className="section-content optimized-layout">
        {renderSimpleFields(simpleFields)}
        {renderComplexFields(complexFields)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="printable-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Loading visit note...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="printable-error">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h2>Error Loading Note</h2>
        <p>{error}</p>
        <button onClick={() => window.close()} className="close-btn">
          Close Window
        </button>
      </div>
    );
  }

  if (!noteData) {
    return (
      <div className="printable-error">
        <h2>Note Not Found</h2>
        <p>The requested visit note could not be found.</p>
        <button onClick={() => window.close()} className="close-btn">
          Close Window
        </button>
      </div>
    );
  }

  return (
    <div className="printable-visit-note">
      {/* Print Controls - Hidden in print */}
      <div className="print-controls no-print">
        <div className="controls-container">
          <div className="note-title">
            <h1>Visit Note</h1>
            <p>{patientData?.firstName} {patientData?.lastName}</p>
          </div>
          
          <div className="action-buttons">
            <button onClick={() => window.print()} className="print-button">
              <i className="fas fa-print"></i>
              Print
            </button>
            <button onClick={() => window.print()} className="pdf-button">
              <i className="fas fa-file-pdf"></i>
              Save as PDF
            </button>
            <button onClick={() => window.close()} className="close-button">
              <i className="fas fa-times"></i>
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Patient & Visit Info Header */}
      <div className="printable-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>Visit Note</h1>
            <p>Patient Care Documentation</p>
          </div>
          
          <div className="info-grid">
            <div className="info-section">
              <h3>Patient Information</h3>
              <div className="info-item">
                <span className="label">Name:</span>
                <span className="value">
                  {patientData?.firstName && patientData?.lastName 
                    ? `${patientData.firstName} ${patientData.lastName}`
                    : patientData?.full_name || 'Not available'}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Date of Birth:</span>
                <span className="value">
                  {patientData?.dateOfBirth || patientData?.birthday || 'Not available'}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Gender:</span>
                <span className="value">{patientData?.gender || 'Not available'}</span>
              </div>
              {patientData?.id && (
                <div className="info-item">
                  <span className="label">Patient ID:</span>
                  <span className="value">#{patientData.id}</span>
                </div>
              )}
            </div>
            
            <div className="info-section">
              <h3>Visit Information</h3>
              <div className="info-item">
                <span className="label">Visit ID:</span>
                <span className="value">{visitId}</span>
              </div>
              {visitData && (
                <>
                  <div className="info-item">
                    <span className="label">Date:</span>
                    <span className="value">
                      {visitData.appointment_date 
                        ? new Date(visitData.appointment_date).toLocaleDateString()
                        : visitData.visit_date 
                          ? new Date(visitData.visit_date).toLocaleDateString()
                          : 'Not available'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Type:</span>
                    <span className="value">{visitData.visit_type || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Therapy:</span>
                    <span className="value">{visitData.discipline || 'Not specified'}</span>
                  </div>
                </>
              )}
              {noteData?.therapist_name && (
                <div className="info-item">
                  <span className="label">Therapist:</span>
                  <span className="value">{noteData.therapist_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Note Content */}
      <div className="printable-content">
        <div className="note-sections">
          {noteData.sections_data && Object.keys(noteData.sections_data).length > 0 ? (
            (() => {
              // Handle nested sections_data structure (temporary fix while we clean up the data)
              let sectionsToRender = noteData.sections_data || {};
              
              // If sections_data contains nested sections_data, extract it
              if (sectionsToRender.sections_data && typeof sectionsToRender.sections_data === 'object') {
                sectionsToRender = sectionsToRender.sections_data;
              }
              
              return Object.entries(sectionsToRender)
                .filter(([sectionName]) => {
                  // Filter out unwanted sections
                  const unwantedSections = ['id', 'visit_id', 'status', 'therapist_name'];
                  const isUnwanted = unwantedSections.includes(sectionName.toLowerCase());
                  return !isUnwanted;
                })
                .map(([sectionName, sectionData]) => {
                  return (
                    <div key={sectionName} className="note-section">
                      <h2 className="section-title">
                        {sectionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h2>
                      {renderSectionContent(sectionName, sectionData)}
                    </div>
                  );
                });
            })()
          ) : (
            <div className="no-sections">
              <p>No sections data available for this visit note.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="printable-footer">
        <div className="footer-content">
          <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
          <p>This document contains confidential patient information</p>
        </div>
      </div>
    </div>
  );
};

export default PrintableVisitNote;