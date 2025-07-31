import React, { useState, useEffect } from 'react';
import '../../../../../styles/developer/Patients/InfoPaciente/MedicalInfoComponent.scss';

const MedicalInfoComponent = ({ patient, certPeriodId, onUpdateMedicalInfo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [medicalData, setMedicalData] = useState({
    weight: '',
    height: '',
    feet: '',
    inches: '',
    nursingDiagnosis: '',
    pmh: '',
    wbs: '',
    clinicalGrouping: '',
    homebound: '',
    physician: '',
    nurse: '',
    urgencyLevel: ''
  });
  
  const [approvedVisits, setApprovedVisits] = useState({
    pt: 0,
    ot: 0,
    st: 0
  });

  // Cargar datos médicos del paciente
  useEffect(() => {
    if (patient) {
      const totalInches = patient.height ? parseFloat(patient.height) : 0;
      const feet = totalInches > 0 ? Math.floor(totalInches / 12) : '';
      const inches = totalInches > 0 ? Math.round((totalInches % 12) * 10) / 10 : '';
      
      setMedicalData({
        weight: patient.weight || '',
        height: totalInches.toString() || '',
        feet: feet,
        inches: inches,
        nursingDiagnosis: patient.nursing_diagnosis || '',
        pmh: patient.past_medical_history || '',
        wbs: patient.weight_bearing_status || '',
        clinicalGrouping: patient.clinical_grouping || '',
        homebound: patient.homebound_status || '',
        physician: patient.physician || '',
        nurse: patient.nurse || '',
        urgencyLevel: patient.urgency_level || ''
      });
    }
  }, [patient]);

  // Cargar approved visits del cert period
  useEffect(() => {
    fetchApprovedVisits();
  }, [certPeriodId]);

  const fetchApprovedVisits = async () => {
    if (!certPeriodId) return;
    
    try {
      const response = await fetch(`http://localhost:8000/cert-periods/${certPeriodId}`);
      const certData = await response.json();
      
      setApprovedVisits({
        pt: certData.pt_approved_visits || 0,
        ot: certData.ot_approved_visits || 0,
        st: certData.st_approved_visits || 0
      });
    } catch (error) {
      console.error('Error fetching approved visits:', error);
    }
  };

  // Actualizar información médica
  const saveMedicalInfo = async () => {
    setLoading(true);
    try {
      const heightInInches = medicalData.feet && medicalData.inches 
        ? (parseInt(medicalData.feet) * 12) + parseFloat(medicalData.inches)
        : parseFloat(medicalData.height) || 0;

      const updateData = {
        weight: medicalData.weight,
        height: heightInInches.toString(),
        nursing_diagnosis: medicalData.nursingDiagnosis,
        past_medical_history: medicalData.pmh,
        weight_bearing_status: medicalData.wbs,
        clinical_grouping: medicalData.clinicalGrouping,
        homebound_status: medicalData.homebound,
        physician: medicalData.physician,
        nurse: medicalData.nurse,
        urgency_level: medicalData.urgencyLevel
      };

      const params = new URLSearchParams();
      Object.keys(updateData).forEach(key => {
        if (updateData[key]) params.append(key, updateData[key]);
      });

      const response = await fetch(`http://localhost:8000/patients/${patient.id}?${params.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdateMedicalInfo?.();
      }
    } catch (error) {
      console.error('Error updating medical info:', error);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar approved visits
  const updateApprovedVisits = async (discipline, value) => {
    try {
      const field = `${discipline}_approved_visits`;
      const response = await fetch(`http://localhost:8000/cert-periods/${certPeriodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: parseInt(value) || 0 })
      });

      if (response.ok) {
        setApprovedVisits(prev => ({
          ...prev,
          [discipline]: parseInt(value) || 0
        }));
      }
    } catch (error) {
      console.error('Error updating approved visits:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMedicalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatHeight = (totalInches) => {
    if (!totalInches) return 'Not set';
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round((totalInches % 12) * 10) / 10;
    return `${feet}'${inches}"`;
  };

  if (loading) return <div>Loading medical info...</div>;

  return (
    <div className="medical-info-component">
      <div className="component-decoration">
        <div className="glass-orb top-left"></div>
        <div className="glass-orb bottom-right"></div>
      </div>
      
      <div className="card-header">
        <div className="header-title">
          <div className="header-icon-wrapper">
            <i className="fas fa-heartbeat"></i>
            <div className="icon-glow"></div>
          </div>
          <h3>Medical Information</h3>
        </div>
        <div className="header-actions">
          <button 
            className="edit-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            <i className={isEditing ? 'fas fa-times' : 'fas fa-edit'}></i>
          </button>
        </div>
        <div className="header-decoration"></div>
      </div>
      
      <div className="card-body">

      {isEditing ? (
        <div className="edit-form glass-form">
          <div className="edit-form-decoration"></div>
          {loading && (
            <div className="saving-overlay">
              <div className="backdrop-blur"></div>
              <div className="saving-animation">
                <div className="loader">
                  <svg className="circular" viewBox="25 25 50 50">
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    <circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" strokeMiterlimit="10"/>
                  </svg>
                </div>
                <div className="saving-text">
                  Saving
                  <div className="dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <h4><i className="fas fa-weight"></i>Physical Information</h4>
          <div className="form-group weight-input">
            <label><i className="fas fa-weight"></i>Weight</label>
            <div className="input-with-icon">
              <input
                name="weight"
                value={medicalData.weight}
                onChange={handleInputChange}
                placeholder="Enter weight"
                className="glass-input"
              />
              <span className="unit-indicator">lbs</span>
            </div>
          </div>
          
          <div className="form-group height-input">
            <label><i className="fas fa-ruler-vertical"></i>Height</label>
            <div className="form-row">
              <div className="form-group">
                <input
                  name="feet"
                  value={medicalData.feet}
                  onChange={handleInputChange}
                  placeholder="Feet"
                  className="glass-input"
                  style={{ width: '80px' }}
                />
              </div>
              <span style={{ alignSelf: 'flex-end', marginBottom:'10px', fontSize:'18px', fontWeight:'600' }}>'</span>
              <div className="form-group">
                <input
                  name="inches"
                  value={medicalData.inches}
                  onChange={handleInputChange}
                  placeholder="Inches"
                  className="glass-input"
                  style={{ width: '80px' }}
                />
              </div>
              <span style={{ alignSelf: 'flex-end', marginBottom:'10px', fontSize:'18px', fontWeight:'600' }}>"</span>
            </div>
          </div>

          <h4><i className="fas fa-user-md"></i>Medical Details</h4>
          
          <div className="form-group physician-input">
            <label><i className="fas fa-user-md"></i>Physician</label>
            <input
              name="physician"
              value={medicalData.physician}
              onChange={handleInputChange}
              placeholder="Physician name"
              className="glass-input"
            />
          </div>
          
          <div className="form-group nurse-input">
            <label><i className="fas fa-user-nurse"></i>Nurse</label>
            <input
              name="nurse"
              value={medicalData.nurse}
              onChange={handleInputChange}
              placeholder="Nurse name"
              className="glass-input"
            />
          </div>
          
          <div className="form-group">
            <label><i className="fas fa-heartbeat"></i>Nursing Diagnosis</label>
            <textarea
              name="nursingDiagnosis"
              value={medicalData.nursingDiagnosis}
              onChange={handleInputChange}
              placeholder="Nursing diagnosis"
              className="glass-input"
            />
          </div>
          
          <div className="form-group">
            <label><i className="fas fa-history"></i>Past Medical History</label>
            <textarea
              name="pmh"
              value={medicalData.pmh}
              onChange={handleInputChange}
              placeholder="Past medical history"
              className="glass-input"
            />
          </div>
          
          <div className="form-group">
            <label><i className="fas fa-band-aid"></i>Weight Bearing Status</label>
            <input
              name="wbs"
              value={medicalData.wbs}
              onChange={handleInputChange}
              placeholder="Weight bearing status"
              className="glass-input"
            />
          </div>
          
          <div className="form-group clinical-group-select">
            <label><i className="fas fa-clipboard-list"></i>Clinical Grouping</label>
            <input
              name="clinicalGrouping"
              value={medicalData.clinicalGrouping}
              onChange={handleInputChange}
              placeholder="Clinical grouping"
              className="glass-input"
            />
          </div>
          
          <div className="form-group">
            <label><i className="fas fa-home"></i>Homebound Status</label>
            <input
              name="homebound"
              value={medicalData.homebound}
              onChange={handleInputChange}
              placeholder="Homebound status"
              className="glass-input"
            />
          </div>
          
          <div className="form-group urgency-level-select">
            <label><i className="fas fa-exclamation-triangle"></i>Urgency Level</label>
            <select
              name="urgencyLevel"
              value={medicalData.urgencyLevel}
              onChange={handleInputChange}
              className="glass-input"
            >
              <option value="">Select urgency level</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="form-actions">
            <button 
              className="cancel-btn glass-btn" 
              onClick={() => setIsEditing(false)}
            >
              <i className="fas fa-times"></i>
              Cancel
            </button>
            <button 
              className="save-btn glass-btn" 
              onClick={saveMedicalInfo} 
              disabled={loading}
            >
              <div className="btn-shine"></div>
              <i className="fas fa-save"></i>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="medical-info-display">
          <div className="info-section weight-section">
            <div className="info-icon">
              <i className="fas fa-weight"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Weight</div>
              <div className="info-value">
                {medicalData.weight ? (
                  <div className="data-display weight-value">
                    <span className="primary-data">{medicalData.weight}</span>
                    <span className="secondary-data">lbs</span>
                  </div>
                ) : (
                  <span className="no-data">Not set</span>
                )}
              </div>
            </div>
          </div>

          <div className="info-section height-section">
            <div className="info-icon">
              <i className="fas fa-ruler-vertical"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Height</div>
              <div className="info-value">
                {medicalData.height ? (
                  <div className="data-display">
                    <span className="primary-data">{formatHeight(parseFloat(medicalData.height))}</span>
                  </div>
                ) : (
                  <span className="no-data">Not set</span>
                )}
              </div>
            </div>
          </div>

          <div className="info-section physician-section">
            <div className="info-icon">
              <i className="fas fa-user-md"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Physician</div>
              <div className="info-value">
                {medicalData.physician ? (
                  <div className="data-box physician-data">
                    {medicalData.physician}
                  </div>
                ) : (
                  <span className="no-data">Not assigned</span>
                )}
              </div>
            </div>
          </div>

          <div className="info-section nurse-section">
            <div className="info-icon">
              <i className="fas fa-user-nurse"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Nurse</div>
              <div className="info-value">
                {medicalData.nurse ? (
                  <div className="data-box nurse-data">
                    {medicalData.nurse}
                  </div>
                ) : (
                  <span className="no-data">Not assigned</span>
                )}
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
                  <span className="no-data">Not set</span>
                )}
              </div>
            </div>
          </div>

          <div className="info-section">
            <div className="info-icon">
              <i className="fas fa-history"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Past Medical History</div>
              <div className="info-value">
                {medicalData.pmh ? (
                  <div className="data-box pmh-data">
                    {medicalData.pmh}
                  </div>
                ) : (
                  <span className="no-data">Not set</span>
                )}
              </div>
            </div>
          </div>

          <div className="info-section">
            <div className="info-icon">
              <i className="fas fa-band-aid"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Weight Bearing Status</div>
              <div className="info-value">
                {medicalData.wbs ? (
                  <div className="data-box wbs-data">
                    {medicalData.wbs}
                  </div>
                ) : (
                  <span className="no-data">Not set</span>
                )}
              </div>
            </div>
          </div>

          <div className="info-section clinical-section">
            <div className="info-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Clinical Grouping</div>
              <div className="info-value">
                {medicalData.clinicalGrouping ? (
                  <div className="clinical-grouping-badge">
                    <i className="fas fa-clipboard-list"></i>
                    <span>{medicalData.clinicalGrouping}</span>
                  </div>
                ) : (
                  <span className="no-data">Not set</span>
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
                  <span className="no-data">Not set</span>
                )}
              </div>
            </div>
          </div>

          <div className="info-section urgency-section">
            <div className="info-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Urgency Level</div>
              <div className="info-value">
                {medicalData.urgencyLevel ? (
                  <div className={`urgency-level-badge urgency-${medicalData.urgencyLevel.toLowerCase()}`} style={{
                    backgroundColor: medicalData.urgencyLevel === 'Critical' ? '#fef2f2' : 
                                   medicalData.urgencyLevel === 'High' ? '#fef3c7' :
                                   medicalData.urgencyLevel === 'Medium' ? '#ecfdf5' : '#f0f9ff',
                    color: medicalData.urgencyLevel === 'Critical' ? '#dc2626' : 
                           medicalData.urgencyLevel === 'High' ? '#d97706' :
                           medicalData.urgencyLevel === 'Medium' ? '#059669' : '#0ea5e9',
                    borderColor: medicalData.urgencyLevel === 'Critical' ? '#fecaca' : 
                                medicalData.urgencyLevel === 'High' ? '#fed7aa' :
                                medicalData.urgencyLevel === 'Medium' ? '#a7f3d0' : '#bae6fd'
                  }}>
                    <i className={
                      medicalData.urgencyLevel === 'Critical' ? 'fas fa-exclamation-triangle' :
                      medicalData.urgencyLevel === 'High' ? 'fas fa-exclamation' :
                      medicalData.urgencyLevel === 'Medium' ? 'fas fa-info-circle' : 'fas fa-check-circle'
                    }></i>
                    <span>{medicalData.urgencyLevel}</span>
                  </div>
                ) : (
                  <span className="no-data">Not set</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approved Visits Section */}
      <div className="approved-visits-section">
        <h5>
          <i className="fas fa-calendar-check"></i>
          Approved Visits (Visit Limits)
        </h5>
        <div className="visits-grid">
          {[
            { key: 'pt', name: 'Physical Therapy', icon: 'fas fa-walking', color: '#3b82f6' },
            { key: 'ot', name: 'Occupational Therapy', icon: 'fas fa-hand-paper', color: '#10b981' },
            { key: 'st', name: 'Speech Therapy', icon: 'fas fa-comments', color: '#f59e0b' }
          ].map(discipline => (
            <div key={discipline.key} className="visit-card">
              <div className="visit-header">
                <div className="discipline-icon" style={{ color: discipline.color }}>
                  <i className={discipline.icon}></i>
                </div>
                <div className="discipline-info">
                  <h6>{discipline.name}</h6>
                  <div className="discipline-code">{discipline.key.toUpperCase()}</div>
                </div>
              </div>
              <div className="visit-inputs">
                <div className="input-row">
                  <div className="input-group">
                    <label>Approved Visits</label>
                    <input
                      type="number"
                      min="0"
                      value={approvedVisits[discipline.key]}
                      onChange={(e) => updateApprovedVisits(discipline.key, e.target.value)}
                      placeholder="0"
                      className="visit-input approved-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="visits-note">
          <i className="fas fa-info-circle"></i>
          These limits prevent scheduling more visits than approved for each discipline.
        </p>
      </div>
      </div>
    </div>
  );
};

export default MedicalInfoComponent;