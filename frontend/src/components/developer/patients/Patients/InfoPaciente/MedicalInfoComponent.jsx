import React, { useState, useEffect } from 'react';
import '../../../../../styles/developer/Patients/InfoPaciente/MedicalInfoComponent.scss';

const MedicalInfoComponent = ({ patient, onUpdateMedicalInfo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [medicalData, setMedicalData] = useState({
    weight: 0,
    height: 0, // Height in inches (total)
    feet: 0,   // Added feet for display
    inches: 0, // Added inches for display
    nursingDiagnosis: '',
    pmh: '',
    wbs: '',
    clinicalGrouping: '',
    homebound: '',
    // New visits data
    approvedVisits: {
      pt: {
        approved: 12,
        used: 3,
        status: 'active' // active, waiting, no_more
      },
      ot: {
        approved: 8,
        used: 2,
        status: 'active'
      },
      st: {
        approved: 6,
        used: 6,
        status: 'no_more'
      }
    }
  });
  
  // Initialize with patient data
  useEffect(() => {
    if (patient?.medicalInfo) {
      // Convert total inches to feet and inches for display
      const totalInches = patient.medicalInfo.height || 0;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round((totalInches % 12) * 10) / 10; // Round to 1 decimal place
      
      setMedicalData({
        weight: patient.medicalInfo.weight || 0,
        height: totalInches,
        feet: feet,
        inches: inches,
        nursingDiagnosis: patient.medicalInfo.nursingDiagnosis || '',
        pmh: patient.medicalInfo.pmh || '',
        wbs: patient.medicalInfo.wbs || '',
        clinicalGrouping: patient.medicalInfo.clinicalGrouping || '',
        homebound: patient.medicalInfo.homebound || '',
        approvedVisits: patient.medicalInfo.approvedVisits || {
          pt: { approved: 0, used: 0, status: 'waiting' },
          ot: { approved: 0, used: 0, status: 'waiting' },
          st: { approved: 0, used: 0, status: 'waiting' }
        }
      });
    }
  }, [patient]);
  
  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMedicalData({
      ...medicalData,
      [name]: value
    });
  };
  
  // Handle weight input specifically
  const handleWeightChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setMedicalData({
      ...medicalData,
      weight: value
    });
  };
  
  // Handle feet input for height
  const handleFeetChange = (e) => {
    const feetValue = parseInt(e.target.value) || 0;
    // Calculate total height in inches
    const totalInches = (feetValue * 12) + medicalData.inches;
    
    setMedicalData({
      ...medicalData,
      feet: feetValue,
      height: totalInches
    });
  };
  
  // Handle inches input for height
  const handleInchesChange = (e) => {
    const inchesValue = parseFloat(e.target.value) || 0;
    // Calculate total height in inches
    const totalInches = (medicalData.feet * 12) + inchesValue;
    
    setMedicalData({
      ...medicalData,
      inches: inchesValue,
      height: totalInches
    });
  };

  // Handle visits input changes
  const handleVisitsChange = (discipline, field, value) => {
    console.log('Changing visits:', discipline, field, value); // Debug log
    
    // Allow empty values and handle them properly
    const numericValue = value === '' ? '' : (parseInt(value) || 0);
    
    const newApprovedVisits = {
      ...medicalData.approvedVisits,
      [discipline]: {
        ...medicalData.approvedVisits[discipline],
        [field]: numericValue
      }
    };

    // Auto-update status based on visits (only if not manually set)
    const disciplineData = newApprovedVisits[discipline];
    const approvedNum = parseInt(disciplineData.approved) || 0;
    const usedNum = parseInt(disciplineData.used) || 0;
    
    if (approvedNum === 0) {
      disciplineData.status = 'waiting';
    } else if (usedNum >= approvedNum && approvedNum > 0) {
      disciplineData.status = 'no_more';
    } else if (approvedNum > 0 && usedNum < approvedNum) {
      disciplineData.status = 'active';
    }

    setMedicalData({
      ...medicalData,
      approvedVisits: newApprovedVisits
    });
  };

  // Handle status change
  const handleStatusChange = (discipline, status) => {
    console.log('Changing status:', discipline, status); // Debug log
    
    setMedicalData({
      ...medicalData,
      approvedVisits: {
        ...medicalData.approvedVisits,
        [discipline]: {
          ...medicalData.approvedVisits[discipline],
          status: status
        }
      }
    });
  };
  
  // Save changes
  const handleSaveChanges = () => {
    // Show saving animation
    setIsSaving(true);
    
    // Prepare data for saving - we want to save the total height in inches
    const dataToSave = {
      ...medicalData,
      // Ensure height is saved as total inches
      height: (medicalData.feet * 12) + medicalData.inches
    };
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Notify parent component
      if (onUpdateMedicalInfo) {
        onUpdateMedicalInfo(dataToSave);
      }
      
      // Hide saving animation and exit edit mode
      setIsSaving(false);
      setIsEditing(false);
    }, 1500); // 1.5 seconds for animation to be visible
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    // Restore original data
    if (patient?.medicalInfo) {
      const totalInches = patient.medicalInfo.height || 0;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round((totalInches % 12) * 10) / 10;
      
      setMedicalData({
        weight: patient.medicalInfo.weight || 0,
        height: totalInches,
        feet: feet,
        inches: inches,
        nursingDiagnosis: patient.medicalInfo.nursingDiagnosis || '',
        pmh: patient.medicalInfo.pmh || '',
        wbs: patient.medicalInfo.wbs || '',
        clinicalGrouping: patient.medicalInfo.clinicalGrouping || '',
        homebound: patient.medicalInfo.homebound || '',
        approvedVisits: patient.medicalInfo.approvedVisits || {
          pt: { approved: 0, used: 0, status: 'waiting' },
          ot: { approved: 0, used: 0, status: 'waiting' },
          st: { approved: 0, used: 0, status: 'waiting' }
        }
      });
    } else {
      // Reset to defaults if no patient data
      setMedicalData({
        weight: 0,
        height: 0,
        feet: 0,
        inches: 0,
        nursingDiagnosis: '',
        pmh: '',
        wbs: '',
        clinicalGrouping: '',
        homebound: '',
        approvedVisits: {
          pt: { approved: 0, used: 0, status: 'waiting' },
          ot: { approved: 0, used: 0, status: 'waiting' },
          st: { approved: 0, used: 0, status: 'waiting' }
        }
      });
    }
    
    // Exit edit mode
    setIsEditing(false);
  };

  // Format height for display in view mode
  const formatHeight = (totalInches) => {
    if (!totalInches || totalInches <= 0) return null;
    
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round((totalInches % 12) * 10) / 10;
    
    return {
      feet,
      inches
    };
  };

  // Get icon for clinical grouping
  const getClinicalGroupingIcon = (grouping) => {
    if (!grouping) return 'fas fa-layer-group';
    
    if (grouping.includes('Cardiac') || grouping.includes('Circulatory')) 
      return 'fas fa-heartbeat';
    if (grouping.includes('Respiratory')) 
      return 'fas fa-lungs';
    if (grouping.includes('Neuro')) 
      return 'fas fa-brain';
    if (grouping.includes('Wound')) 
      return 'fas fa-band-aid';
    if (grouping.includes('Musculoskeletal')) 
      return 'fas fa-bone';
    if (grouping.includes('Behavioral')) 
      return 'fas fa-brain';
    if (grouping.includes('Endocrine')) 
      return 'fas fa-pills';
    
    return 'fas fa-layer-group';
  };
  
  // Get color for clinical grouping
  const getClinicalGroupingColor = (grouping) => {
    if (!grouping) return '#64748b';
    
    if (grouping.includes('Cardiac') || grouping.includes('Circulatory')) 
      return '#ef4444';
    if (grouping.includes('Respiratory')) 
      return '#3b82f6';
    if (grouping.includes('Neuro')) 
      return '#8b5cf6';
    if (grouping.includes('Wound')) 
      return '#f97316';
    if (grouping.includes('Musculoskeletal')) 
      return '#14b8a6';
    if (grouping.includes('Behavioral')) 
      return '#a855f7';
    if (grouping.includes('Endocrine')) 
      return '#eab308';
    
    return '#64748b';
  };

  // Get discipline details
  const getDisciplineDetails = (discipline) => {
    const details = {
      pt: {
        name: 'Physical Therapy',
        shortName: 'PT',
        icon: 'fas fa-dumbbell',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)'
      },
      ot: {
        name: 'Occupational Therapy',
        shortName: 'OT',
        icon: 'fas fa-hands',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #059669)'
      },
      st: {
        name: 'Speech Therapy',
        shortName: 'ST',
        icon: 'fas fa-comments',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
      }
    };
    return details[discipline];
  };

  // Get status details
  const getStatusDetails = (status) => {
    const statusDetails = {
      waiting: {
        text: 'Waiting for more visits',
        icon: 'fas fa-clock',
        color: '#64748b',
        bgColor: '#f1f5f9'
      },
      active: {
        text: 'Visits available',
        icon: 'fas fa-check-circle',
        color: '#10b981',
        bgColor: '#ecfdf5'
      },
      no_more: {
        text: 'No more visits approved',
        icon: 'fas fa-times-circle',
        color: '#ef4444',
        bgColor: '#fef2f2'
      }
    };
    return statusDetails[status];
  };
  
  return (
    <div className="medical-info-component">
      <div className="card-header">
        <div className="header-title">
          <i className="fas fa-notes-medical"></i>
          <h3>Medical Information</h3>
        </div>
        <div className="header-actions">
          {!isEditing && (
            <button 
              className="edit-button" 
              onClick={() => setIsEditing(true)}
              title="Edit medical information"
            >
              <i className="fas fa-edit"></i>
            </button>
          )}
        </div>
      </div>
      
      <div className="card-body">
        {isEditing ? (
          // Edit form
          <div className="edit-form">
            <h4>
              <i className="fas fa-pen-fancy"></i>
              Edit Medical Information
            </h4>
            
            {isSaving && (
              <div className="saving-overlay">
                <div className="saving-animation">
                  <div className="loader">
                    <svg className="circular" viewBox="25 25 50 50">
                      <circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="3" strokeMiterlimit="10"/>
                    </svg>
                  </div>
                  <div className="saving-text">
                    <span>Saving</span>
                    <span className="dots"><span>.</span><span>.</span><span>.</span></span>
                  </div>
                </div>
                <div className="backdrop-blur"></div>
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group weight-input">
                <label>
                  <i className="fas fa-weight"></i>
                  Weight (lbs)
                </label>
                <div className="input-with-icon">
                  <input 
                    type="number" 
                    name="weight"
                    value={medicalData.weight} 
                    onChange={handleWeightChange}
                    min="0"
                    step="0.1"
                  />
                  <span className="unit-indicator">lbs</span>
                </div>
              </div>
              
              {/* Updated height input with feet and inches */}
              <div className="form-group height-input">
                <label>
                  <i className="fas fa-ruler-vertical"></i>
                  Height
                </label>
                <div className="height-inputs-container">
                  <div className="input-with-icon ft-input">
                    <input 
                      type="number" 
                      name="feet"
                      value={medicalData.feet} 
                      onChange={handleFeetChange}
                      min="0"
                      step="1"
                    />
                    <span className="unit-indicator">ft</span>
                  </div>
                  <div className="input-with-icon in-input">
                    <input 
                      type="number" 
                      name="inches"
                      value={medicalData.inches} 
                      onChange={handleInchesChange}
                      min="0"
                      max="11.9"
                      step="0.1"
                    />
                    <span className="unit-indicator">in</span>
                  </div>
                </div>
              </div>
              
              <div className="form-group clinical-group-select">
                <label>
                  <i className="fas fa-layer-group"></i>
                  Clinical Grouping
                </label>
                <select 
                  name="clinicalGrouping"
                  value={medicalData.clinicalGrouping} 
                  onChange={handleInputChange}
                >
                  <option value="">Select Clinical Grouping</option>
                  <option value="No wounds present">No wounds present</option>
                  <option value="Wound healing well, no signs of infection">Wound healing well, no signs of infection</option>
                  <option value="Clean wound, granulating tissue present">Clean wound, granulating tissue present</option>
                  <option value="Red, inflamed wound edges">Red, inflamed wound edges</option>
                  <option value="Wound with serous drainage">Wound with serous drainage</option>
                  <option value="Wound with purulent drainage">Wound with purulent drainage</option>
                  <option value="Wound with necrotic tissue">Wound with necrotic tissue</option>
                  <option value="Pressure ulcer, Stage 1">Pressure ulcer, Stage 1</option>
                  <option value="Pressure ulcer, Stage 2">Pressure ulcer, Stage 2</option>
                  <option value="Pressure ulcer, Stage 3">Pressure ulcer, Stage 3</option>
                  <option value="Pressure ulcer, Stage 4">Pressure ulcer, Stage 4</option>
                  <option value="Unstageable pressure ulcer">Unstageable pressure ulcer</option>
                  <option value="Deep tissue pressure injury">Deep tissue pressure injury</option>
                  <option value="Venous ulcer">Venous ulcer</option>
                  <option value="Arterial ulcer">Arterial ulcer</option>
                  <option value="Diabetic ulcer">Diabetic ulcer</option>
                  <option value="Surgical wound, well-healing">Surgical wound, well-healing</option>
                  <option value="Surgical wound, dehiscence present">Surgical wound, dehiscence present</option>
                  <option value="Abrasion/Skin tear">Abrasion/Skin tear</option>
                  <option value="To be assessed">To be assessed</option>
                  <option value="TBD">TBD</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>
                <i className="fas fa-heartbeat"></i>
                Nursing Diagnosis
              </label>
              <textarea 
                name="nursingDiagnosis"
                value={medicalData.nursingDiagnosis} 
                onChange={handleInputChange}
                placeholder="Enter nursing diagnosis"
                rows="2"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>
                <i className="fas fa-history"></i>
                PMH (Past Medical History)
              </label>
              <textarea 
                name="pmh"
                value={medicalData.pmh} 
                onChange={handleInputChange}
                placeholder="Enter past medical history"
                rows="3"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>
                <i className="fas fa-band-aid"></i>
                WBS (Wound Bed Status)
              </label>
              <textarea 
                name="wbs"
                value={medicalData.wbs} 
                onChange={handleInputChange}
                placeholder="Enter wound bed status"
                rows="2"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>
                <i className="fas fa-home"></i>
                Homebound Status
              </label>
              <textarea 
                name="homebound"
                value={medicalData.homebound} 
                onChange={handleInputChange}
                placeholder="Enter homebound reason"
                rows="2"
              ></textarea>
            </div>

            {/* NUEVA SECCIÓN DE VISITAS APROBADAS */}
            <div style={{ marginTop: '32px', paddingTop: '28px', borderTop: '2px solid #e2e8f0' }}>
              <h5 style={{ 
                margin: '0 0 24px 0', 
                fontSize: '16px', 
                color: '#0f172a', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="fas fa-calendar-check" style={{ 
                  color: '#3b82f6',
                  fontSize: '18px',
                  background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px'
                }}></i>
                Approved Visits Management
              </h5>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '20px' 
              }}>
                {Object.entries(medicalData.approvedVisits).map(([discipline, data]) => {
                  const disciplineInfo = getDisciplineDetails(discipline);
                  return (
                    <div key={discipline} style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '20px',
                      border: '2px solid #e5e7eb',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '14px', 
                        marginBottom: '20px' 
                      }}>
                        <div style={{ 
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          backgroundColor: `${disciplineInfo.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          color: disciplineInfo.color
                        }}>
                          <i className={disciplineInfo.icon}></i>
                        </div>
                        <div>
                          <h6 style={{ 
                            margin: '0 0 4px 0', 
                            fontSize: '15px', 
                            fontWeight: '600', 
                            color: '#1e293b' 
                          }}>
                            {disciplineInfo.name}
                          </h6>
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#64748b', 
                            fontWeight: '500', 
                            background: '#f1f5f9', 
                            padding: '2px 8px', 
                            borderRadius: '20px' 
                          }}>
                            {disciplineInfo.shortName}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ flex: '1' }}>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '11px', 
                              color: '#64748b', 
                              fontWeight: '700', 
                              marginBottom: '8px', 
                              textTransform: 'uppercase', 
                              letterSpacing: '1px' 
                            }}>
                              APPROVED
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={data.approved}
                              onChange={(e) => handleVisitsChange(discipline, 'approved', e.target.value)}
                              onMouseDown={(e) => e.stopPropagation()}
                              onFocus={(e) => e.stopPropagation()}
                              placeholder="0"
                              style={{
                                width: '100%',
                                height: '45px',
                                padding: '12px 16px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                textAlign: 'center',
                                background: '#ffffff',
                                color: '#1e293b',
                                outline: 'none',
                                boxSizing: 'border-box',
                                appearance: 'none',
                                MozAppearance: 'textfield',
                                WebkitAppearance: 'none'
                              }}
                            />
                          </div>
                          <div style={{ flex: '1' }}>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '11px', 
                              color: '#64748b', 
                              fontWeight: '700', 
                              marginBottom: '8px', 
                              textTransform: 'uppercase', 
                              letterSpacing: '1px' 
                            }}>
                              USED
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              max={parseInt(data.approved) || 999}
                              value={data.used}
                              onChange={(e) => handleVisitsChange(discipline, 'used', e.target.value)}
                              onMouseDown={(e) => e.stopPropagation()}
                              onFocus={(e) => e.stopPropagation()}
                              placeholder="0"
                              style={{
                                width: '100%',
                                height: '45px',
                                padding: '12px 16px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                textAlign: 'center',
                                background: '#ffffff',
                                color: '#1e293b',
                                outline: 'none',
                                boxSizing: 'border-box',
                                appearance: 'none',
                                MozAppearance: 'textfield',
                                WebkitAppearance: 'none'
                              }}
                            />
                          </div>
                        </div>
                        
                        <div style={{ marginTop: '16px' }}>
                          <label style={{ 
                            display: 'block', 
                            fontSize: '11px', 
                            color: '#64748b', 
                            fontWeight: '700', 
                            marginBottom: '8px', 
                            textTransform: 'uppercase', 
                            letterSpacing: '1px' 
                          }}>
                            STATUS
                          </label>
                          <select
                            value={data.status}
                            onChange={(e) => handleStatusChange(discipline, e.target.value)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            style={{
                              width: '100%',
                              height: '45px',
                              padding: '12px 16px',
                              border: '2px solid #e2e8f0',
                              borderRadius: '12px',
                              fontSize: '14px',
                              fontWeight: '500',
                              background: '#ffffff',
                              color: '#1e293b',
                              outline: 'none',
                              cursor: 'pointer',
                              boxSizing: 'border-box'
                            }}
                          >
                            <option value="waiting">Waiting for more visits</option>
                            <option value="active">Visits available</option>
                            <option value="no_more">No more visits approved</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="form-actions">
              <button className="cancel-btn" onClick={handleCancelEdit}>
                <i className="fas fa-times"></i>
                Cancel
              </button>
              <button 
                className="save-btn" 
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                <i className="fas fa-check"></i>
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          // View mode
          <div className="medical-info-display">
            <div className="info-section weight-section">
              <div className="info-icon">
                <i className="fas fa-weight"></i>
              </div>
              <div className="info-content">
                <div className="info-label">Weight</div>
                <div className="info-value weight-value">
                  {medicalData.weight > 0 ? (
                    <div className="data-display">
                      <span className="primary-data">{medicalData.weight}</span>
                      <span className="secondary-data">lbs</span>
                    </div>
                  ) : (
                    <span className="no-data">Not recorded</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Updated height display with feet and inches */}
            <div className="info-section height-section">
              <div className="info-icon">
                <i className="fas fa-ruler-vertical"></i>
              </div>
              <div className="info-content">
                <div className="info-label">Height</div>
                <div className="info-value height-value">
                  {medicalData.height > 0 ? (
                    <div className="data-display">
                      <span className="primary-data">
                        {formatHeight(medicalData.height).feet}' {formatHeight(medicalData.height).inches}"
                      </span>
                      <span className="secondary-data">({medicalData.height} in)</span>
                    </div>
                  ) : (
                    <span className="no-data">Not recorded</span>
                  )}
                </div>
              </div>
            </div>

            {/* NUEVA SECCIÓN DE VISITAS APROBADAS - VIEW MODE */}
            <div className="info-section approved-visits-section-view">
              <div className="info-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="info-content">
                <div className="info-label">Approved Visits</div>
                <div className="info-value">
                  <div className="visits-grid-view">
                    {Object.entries(medicalData.approvedVisits).map(([discipline, data]) => {
                      const disciplineInfo = getDisciplineDetails(discipline);
                      const statusInfo = getStatusDetails(data.status);
                      const remaining = Math.max(0, (parseInt(data.approved) || 0) - (parseInt(data.used) || 0));
                      const progressPercentage = (parseInt(data.approved) || 0) > 0 ? ((parseInt(data.used) || 0) / (parseInt(data.approved) || 0)) * 100 : 0;
                      
                      return (
                        <div key={discipline} className="visit-card-view">
                          <div className="visit-card-header">
                            <div className="discipline-badge" style={{ background: disciplineInfo.gradient }}>
                              <i className={disciplineInfo.icon}></i>
                              <span>{disciplineInfo.shortName}</span>
                            </div>
                            <div className="status-badge" style={{ 
                              color: statusInfo.color, 
                              backgroundColor: statusInfo.bgColor 
                            }}>
                              <i className={statusInfo.icon}></i>
                              <span>{statusInfo.text}</span>
                            </div>
                          </div>
                          
                          <div className="visit-stats">
                            <div className="stats-row">
                              <div className="stat">
                                <span className="stat-label">Approved</span>
                                <span className="stat-value" style={{ color: disciplineInfo.color }}>
                                  {data.approved || 0}
                                </span>
                              </div>
                              <div className="stat">
                                <span className="stat-label">Used</span>
                                <span className="stat-value">{data.used || 0}</span>
                              </div>
                              <div className="stat">
                                <span className="stat-label">Remaining</span>
                                <span className="stat-value remaining" style={{ 
                                  color: remaining > 0 ? disciplineInfo.color : '#ef4444' 
                                }}>
                                  {remaining}
                                </span>
                              </div>
                            </div>
                            
                            <div className="progress-container">
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill" 
                                  style={{ 
                                    width: `${progressPercentage}%`,
                                    background: progressPercentage >= 100 ? '#ef4444' : disciplineInfo.gradient
                                  }}
                                ></div>
                              </div>
                              <span className="progress-text">
                                {Math.round(progressPercentage)}% used
                              </span>
                            </div>
                          </div>
                          
                          <div className="discipline-name">{disciplineInfo.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <div className="info-icon">
                <i className="fas fa-heartbeat"></i>
              </div>
              <div className="info-content">
                <div className="info-label">Nursing Diagnosis</div>
                <div className="info-value">
                  {medicalData.nursingDiagnosis ? (
                    <div className="data-box nursing-diagnosis">
                      {medicalData.nursingDiagnosis}
                    </div>
                  ) : (
                    <span className="no-data">Not available</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <div className="info-icon">
                <i className="fas fa-history"></i>
              </div>
              <div className="info-content">
                <div className="info-label">PMH (Past Medical History)</div>
                <div className="info-value">
                  {medicalData.pmh ? (
                    <div className="data-box pmh-data">
                      {medicalData.pmh}
                    </div>
                  ) : (
                    <span className="no-data">Not available</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <div className="info-icon">
                <i className="fas fa-band-aid"></i>
              </div>
              <div className="info-content">
                <div className="info-label">WBS (Wound Bed Status)</div>
                <div className="info-value">
                  {medicalData.wbs ? (
                    <div className="data-box wbs-data">
                      {medicalData.wbs}
                    </div>
                  ) : (
                    <span className="no-data">Not available</span>
                  )}
                </div>
              </div>
            </div>
            <div className="info-section clinical-section">
              <div className="info-icon" style={{ 
                color: getClinicalGroupingColor(medicalData.clinicalGrouping),
                background: `${getClinicalGroupingColor(medicalData.clinicalGrouping)}15` 
              }}>
                <i className={getClinicalGroupingIcon(medicalData.clinicalGrouping)}></i>
              </div>
              <div className="info-content">
                <div className="info-label">Clinical Grouping</div>
                <div className="info-value">
                  {medicalData.clinicalGrouping ? (
                    <div className="clinical-grouping-badge" style={{ 
                      color: getClinicalGroupingColor(medicalData.clinicalGrouping),
                      borderColor: `${getClinicalGroupingColor(medicalData.clinicalGrouping)}50`,
                      background: `${getClinicalGroupingColor(medicalData.clinicalGrouping)}10`
                    }}>
                      <i className={getClinicalGroupingIcon(medicalData.clinicalGrouping)}></i>
                      <span>{medicalData.clinicalGrouping}</span>
                    </div>
                  ) : (
                    <span className="no-data">Not assigned</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <div className="info-icon">
                <i className="fas fa-home"></i>
              </div>
              <div className="info-content">
                <div className="info-label">Homebound Status</div>
                <div className="info-value">
                  {medicalData.homebound ? (
                    <div className="data-box homebound-data">
                      {medicalData.homebound}
                    </div>
                  ) : (
                    <span className="no-data">Not specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalInfoComponent;