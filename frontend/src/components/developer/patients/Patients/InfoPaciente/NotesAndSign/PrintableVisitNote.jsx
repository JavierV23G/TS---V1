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
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const noteResponse = await fetch(`${API_BASE_URL}/visit-notes/${visitId}`);
        if (!noteResponse.ok) {
          throw new Error('Failed to fetch visit note');
        }
        const noteResult = await noteResponse.json();
        console.log('🔍 Note data structure:', JSON.stringify(noteResult, null, 2));
        console.log('🔍 Note data keys:', Object.keys(noteResult));
        
        // Log specific fields we're looking for based on schemas
        console.log('🔍 Available fields in noteResult:');
        console.log('  - id:', noteResult.id);
        console.log('  - visit_id:', noteResult.visit_id);
        console.log('  - status:', noteResult.status);
        console.log('  - therapist_name:', noteResult.therapist_name);
        console.log('  - sections_data keys:', noteResult.sections_data ? Object.keys(noteResult.sections_data) : 'none');
        
        // Check if visit or patient data is embedded
        console.log('🔍 Checking for embedded relationships:');
        console.log('  - visit:', noteResult.visit);
        console.log('  - patient:', noteResult.patient);
        console.log('  - staff:', noteResult.staff);
        setNoteData(noteResult);
        
        // Check if visit and patient data are embedded in note data
        if (noteResult.visit_data) {
          console.log('🔍 Found embedded visit data:', noteResult.visit_data);
          setVisitData(noteResult.visit_data);
        }
        if (noteResult.patient_data) {
          console.log('🔍 Found embedded patient data:', noteResult.patient_data);
          setPatientData(noteResult.patient_data);
        }
        
        // Check for other possible field names
        if (noteResult.visit) {
          console.log('🔍 Found visit field:', noteResult.visit);
          setVisitData(noteResult.visit);
        }
        if (noteResult.patient) {
          console.log('🔍 Found patient field:', noteResult.patient);
          setPatientData(noteResult.patient);
        }
        
        // Check if visit type is directly in noteResult
        if (noteResult.visit_type) {
          console.log('🔍 Found visit_type in note data:', noteResult.visit_type);
        }
        
        // Also check sections_data for embedded info
        if (noteResult.sections_data) {
          console.log('🔍 Checking sections_data for embedded info...');
          const sections = noteResult.sections_data;
          if (sections.visit_type) console.log('  - sections visit_type:', sections.visit_type);
          if (sections.patient_name) console.log('  - sections patient_name:', sections.patient_name);
          if (sections.therapist_name) console.log('  - sections therapist_name:', sections.therapist_name);
        }

        // Get visit data by first fetching all visits from certification periods
        // Since we don't have direct /visits/{visit_id}, we need to find the visit through cert periods
        if (noteResult.visit_id) {
          console.log('🔍 Searching for visit data using visit_id:', noteResult.visit_id);
          try {
            // First, we need to get all patients to find which one has this visit
            const patientsResponse = await fetch(`${API_BASE_URL}/patients/`);
            if (patientsResponse.ok) {
              const patients = await patientsResponse.json();
              console.log('🔍 Searching through', patients.length, 'patients for visit');
              
              let foundVisit = null;
              let foundPatient = null;
              
              // Search through each patient's certification periods for the visit
              for (const patient of patients) {
                try {
                  const certPeriodsResponse = await fetch(`${API_BASE_URL}/patient/${patient.id}/cert-periods`);
                  if (certPeriodsResponse.ok) {
                    const certPeriods = await certPeriodsResponse.json();
                    
                    // Check visits in each certification period
                    for (const certPeriod of certPeriods) {
                      const visitsResponse = await fetch(`${API_BASE_URL}/visits/certperiod/${certPeriod.id}`);
                      if (visitsResponse.ok) {
                        const visits = await visitsResponse.json();
                        const targetVisit = visits.find(visit => visit.id === noteResult.visit_id);
                        
                        if (targetVisit) {
                          foundVisit = targetVisit;
                          foundPatient = patient;
                          console.log('🔍 Found visit data:', foundVisit);
                          console.log('🔍 Found patient data:', foundPatient);
                          break;
                        }
                      }
                    }
                    
                    if (foundVisit) break;
                  }
                } catch (certError) {
                  console.warn('Error checking cert periods for patient', patient.id, ':', certError);
                  continue;
                }
              }
              
              if (foundVisit && foundPatient) {
                setVisitData(foundVisit);
                setPatientData(foundPatient);
              } else {
                console.warn('Could not find visit', noteResult.visit_id, 'in any certification period');
              }
            } else {
              console.warn('Failed to fetch patients list:', patientsResponse.status);
            }
          } catch (searchError) {
            console.warn('Failed to search for visit data:', searchError, 'Continuing with note data only');
          }
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

  // Utility function to extract data from multiple possible sources
  const extractData = (field, sources = [noteData, visitData, patientData]) => {
    for (const source of sources) {
      if (source && source[field]) return source[field];
      // Also check nested objects
      if (source && source.sections_data && source.sections_data[field]) {
        return source.sections_data[field];
      }
    }
    return null;
  };

  // Get visit type from any available source - based on VisitResponse schema
  const getVisitType = () => {
    return visitData?.visit_type || 
           noteData?.visit_type || 
           extractData('visit_type') ||
           'Initial Evaluation';
  };

  // Get patient name from any available source - based on PatientResponse schema
  const getPatientName = () => {
    // Schema shows PatientResponse has 'full_name' field
    return patientData?.full_name || 
           extractData('full_name') ||
           extractData('patient_name') ||
           'N/A';
  };

  // Get patient DOB - based on PatientResponse schema  
  const getPatientDOB = () => {
    // Schema shows PatientResponse has 'birthday' field
    return patientData?.birthday || 
           extractData('birthday') ||
           extractData('date_of_birth') ||
           'N/A';
  };

  // Get patient gender - based on PatientResponse schema
  const getPatientGender = () => {
    return patientData?.gender || 
           extractData('gender') ||
           'N/A';
  };

  // Get visit date - based on VisitResponse schema
  const getVisitDate = () => {
    const visitDate = visitData?.visit_date || extractData('visit_date');
    if (visitDate) {
      return new Date(visitDate).toLocaleDateString();
    }
    return 'N/A';
  };

  // Get therapy type - based on VisitResponse schema
  const getTherapyType = () => {
    return visitData?.therapy_type || 
           extractData('therapy_type') ||
           extractData('discipline') ||
           'N/A';
  };

  // Get therapist name - based on VisitNoteResponse schema
  const getTherapistName = () => {
    return noteData?.therapist_name || 
           extractData('therapist_name') ||
           'N/A';
  };

  // Compact renderer for Vitals section
  const renderCompactVitals = (vitalsData) => {
    const { at_rest, after_exertion, vitals_additional, vitals_out_of_parameters, ...otherFields } = vitalsData;
    const vitalSigns = ['heart_rate', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'respirations', 'o2_saturation', 'temperature'];
    
    const vitalsText = [];
    
    // Process standard vital signs
    vitalSigns.forEach(vitalSign => {
      const atRestValue = at_rest?.[vitalSign];
      const afterExertionValue = after_exertion?.[vitalSign];
      
      if (atRestValue || afterExertionValue) {
        const name = vitalSign.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        vitalsText.push(`${name}: ${atRestValue || '--'}/${afterExertionValue || '--'}`);
      }
    });
    
    // Process additional fields
    const additionalText = [];
    if (vitals_additional && vitals_additional.trim()) {
      additionalText.push(`Additional: ${vitals_additional.trim()}`);
    }
    if (vitals_out_of_parameters !== null && vitals_out_of_parameters !== undefined) {
      const outOfParams = typeof vitals_out_of_parameters === 'boolean' 
        ? (vitals_out_of_parameters ? 'Yes' : 'No')
        : String(vitals_out_of_parameters);
      additionalText.push(`Out of Parameters: ${outOfParams}`);
    }
    
    // Process any other fields that might exist
    Object.entries(otherFields).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
        additionalText.push(`${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${displayValue}`);
      }
    });
    
    // Combine all vitals information
    const allVitalsInfo = [...vitalsText, ...additionalText];
    
    return allVitalsInfo.length > 0 ? (
      <div className="compact-vitals">
        {allVitalsInfo.join(' | ')}
      </div>
    ) : null;
  };

  // Compact field renderer - inline format for maximum density
  const renderCompactFields = (data) => {
    const fields = [];
    
    const processObject = (obj, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        // Skip null, undefined, empty strings, and empty objects/arrays
        if (value === null || value === undefined || value === '' || 
            (typeof value === 'object' && Object.keys(value).length === 0) ||
            (Array.isArray(value) && value.length === 0)) {
          return;
        }
        
        const label = prefix ? `${prefix} ${key.replace(/_/g, ' ')}` : key.replace(/_/g, ' ');
        const formattedLabel = label.replace(/\b\w/g, l => l.toUpperCase());
        
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Recursively process nested objects
          processObject(value, formattedLabel);
        } else {
          // Handle arrays and primitive values
          let displayValue;
          if (Array.isArray(value)) {
            displayValue = value.filter(item => item !== null && item !== undefined && item !== '').join(', ');
          } else if (typeof value === 'boolean') {
            displayValue = value ? 'Yes' : 'No';
          } else {
            displayValue = String(value).trim();
          }
          
          if (displayValue) {
            fields.push(`${formattedLabel}: ${displayValue}`);
          }
        }
      });
    };
    
    processObject(data);
    return fields.join(' | ');
  };

  const renderSectionContent = (sectionName, sectionData) => {
    if (!sectionData || Object.keys(sectionData).length === 0) {
      return null; // Don't render empty sections
    }

    // Special handling for Vitals section
    const sectionNameLower = sectionName.toLowerCase();
    if (sectionNameLower === 'vitals' || sectionNameLower.includes('vital')) {
      return renderCompactVitals(sectionData);
    }

    // Render all other sections in compact text format
    const compactText = renderCompactFields(sectionData);
    return compactText ? <div className="compact-section-content">{compactText}</div> : null;
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
      <div className="compact-error">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Error Loading Note</h3>
        <p>{error}</p>
        <button onClick={() => window.close()}>Close Window</button>
      </div>
    );
  }

  if (!noteData) {
    return (
      <div className="compact-error">
        <h3>Note Not Found</h3>
        <p>The requested visit note could not be found. This may mean the note hasn't been created yet or the visit ID is invalid.</p>
        <button onClick={() => window.close()}>Close Window</button>
      </div>
    );
  }

  return (
    <div className="printable-visit-note">
      {/* Print Controls - Hidden in print */}
      <div className="print-controls no-print">
        <div className="controls-container">
          <div className="note-title">
            <h1>{getVisitType()}</h1>
            <p>{getPatientName()}</p>
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

      {/* Compact Header */}
      <div className="compact-header">
        <div className="header-line">
          <strong>Patient:</strong> {getPatientName()} | 
          <strong> DOB:</strong> {getPatientDOB()} | 
          <strong> ID:</strong> #{patientData?.id || visitData?.patient_id || 'N/A'} | 
          <strong> Gender:</strong> {getPatientGender()}
        </div>
        <div className="header-line">
          <strong>Visit #{visitId}</strong> | 
          <strong> Date:</strong> {getVisitDate()} | 
          <strong> Type:</strong> {getVisitType()} | 
          <strong> Therapy:</strong> {getTherapyType()} | 
          <strong> Therapist:</strong> {getTherapistName()}
        </div>
      </div>

      {/* Compact Content */}
      <div className="compact-content">
        {noteData.sections_data && Object.keys(noteData.sections_data).length > 0 ? (
          (() => {
            // Handle nested sections_data structure
            let sectionsToRender = noteData.sections_data || {};
            
            // If sections_data contains nested sections_data, extract it
            while (sectionsToRender.sections_data && typeof sectionsToRender.sections_data === 'object') {
              sectionsToRender = sectionsToRender.sections_data;
            }
            
            const sectionsToProcess = Object.entries(sectionsToRender)
              .filter(([sectionName, sectionData]) => {
                // Filter out metadata fields and empty sections
                const metadataFields = ['id', 'visit_id', 'status', 'therapist_name', 'created_at', 'updated_at'];
                const isMetadata = metadataFields.includes(sectionName.toLowerCase());
                
                // Check if section has actual content
                const hasContent = sectionData && 
                  typeof sectionData === 'object' && 
                  Object.keys(sectionData).length > 0 &&
                  !isMetadata;
                
                return hasContent;
              });
            
            // Debug: Log sections being rendered
            console.log('Compact PrintableNote - Sections to render:', sectionsToProcess.map(([name]) => name));
            
            return sectionsToProcess
              .map(([sectionName, sectionData]) => {
                const content = renderSectionContent(sectionName, sectionData);
                if (!content) return null;
                
                return (
                  <div key={sectionName} className="compact-section">
                    <span className="section-title">
                      {sectionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                    </span>
                    {content}
                  </div>
                );
              })
              .filter(section => section !== null);
          })()
        ) : (
          <div className="no-data">No evaluation data available</div>
        )}
      </div>

      {/* Compact Footer */}
      <div className="compact-footer">
        <span>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
        <span className="confidential">CONFIDENTIAL PATIENT INFORMATION</span>
      </div>
    </div>
  );
};

export default PrintableVisitNote;