import React, { useState, useEffect } from 'react';
import '../../../../../styles/developer/Patients/InfoPaciente/DisciplinesComponent.scss';

const DisciplinesComponent = ({ patient, patientId, certPeriodId, onDisciplineChange, onUpdateDisciplines }) => {
  const [disciplines, setDisciplines] = useState({});
  const [loading, setLoading] = useState(false);
  const [staffDetails, setStaffDetails] = useState({});

  // Extract patientId from patient prop if not provided directly
  const actualPatientId = patientId || patient?.id;
  const actualCertPeriodId = certPeriodId; // This might be provided by parent

  useEffect(() => {
    fetchDisciplines();
    fetchStaffDetails();
  }, [actualPatientId, actualCertPeriodId]);

  const fetchDisciplines = async () => {
    if (!actualPatientId) {
      console.log('DEBUG: No actualPatientId provided, actualPatientId:', actualPatientId);
      console.log('DEBUG: patient prop:', patient);
      console.log('DEBUG: patientId prop:', patientId);
      return;
    }
    
    setLoading(true);
    try {
      const url = actualCertPeriodId 
        ? `http://localhost:8000/patient/${actualPatientId}/assigned-staff?cert_period_id=${actualCertPeriodId}`
        : `http://localhost:8000/patient/${actualPatientId}/assigned-staff`;
      
      console.log('DEBUG: Fetching disciplines from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('DEBUG: Response not OK:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      console.log('DEBUG: Received disciplines data:', data);
      console.log('DEBUG: data.disciplines:', data.disciplines);
      console.log('DEBUG: Object.keys(data.disciplines):', Object.keys(data.disciplines || {}));
      
      setDisciplines(data.disciplines || {});
    } catch (error) {
      console.error('DEBUG: Error fetching disciplines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffDetails = async () => {
    try {
      const response = await fetch('http://localhost:8000/staff/');
      if (response.ok) {
        const staffList = await response.json();
        const staffMap = {};
        staffList.forEach(staff => {
          staffMap[staff.id] = {
            name: staff.name,
            email: staff.email,
            phone: staff.phone,
            role: staff.role
          };
        });
        setStaffDetails(staffMap);
        console.log('DEBUG: Staff details fetched:', staffMap);
      }
    } catch (error) {
      console.error('Error fetching staff details:', error);
    }
  };

  const assignStaff = async (discipline, staffId) => {
    try {
      console.log('DEBUG: Assigning staff', { discipline, staffId, actualPatientId });
      
      const response = await fetch(`http://localhost:8000/assign-staff?patient_id=${actualPatientId}&staff_id=${staffId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('DEBUG: Assignment successful:', result);
        fetchDisciplines();
        onDisciplineChange?.();
      } else {
        const error = await response.text();
        console.error('DEBUG: Assignment failed:', response.status, error);
      }
    } catch (error) {
      console.error('Error assigning staff:', error);
    }
  };

  const unassignStaff = async (discipline, roleType) => {
    try {
      // Determine the specific role to unassign
      const roleToUnassign = roleType === 'main' ? discipline : `${discipline}A`;
      
      console.log('DEBUG: Unassigning staff', { discipline, roleType, roleToUnassign, actualPatientId });
      
      const response = await fetch(`http://localhost:8000/unassign-staff?patient_id=${actualPatientId}&discipline=${roleToUnassign}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        console.log('DEBUG: Unassignment successful');
        fetchDisciplines();
        onDisciplineChange?.();
      } else {
        const error = await response.text();
        console.error('DEBUG: Unassignment failed:', response.status, error);
      }
    } catch (error) {
      console.error('Error unassigning staff:', error);
    }
  };

  const updateFrequency = async (discipline, frequency) => {
    if (!actualCertPeriodId) return;
    
    try {
      const response = await fetch(`http://localhost:8000/cert-periods/${actualCertPeriodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [`${discipline.toLowerCase()}_frequency`]: frequency })
      });
      
      if (response.ok) {
        fetchDisciplines();
        onDisciplineChange?.();
      }
    } catch (error) {
      console.error('Error updating frequency:', error);
    }
  };

  if (loading) return <div>Loading disciplines...</div>;

  // Debug logging
  console.log('DEBUG: Component render - disciplines state:', disciplines);
  console.log('DEBUG: Component render - Object.entries(disciplines):', Object.entries(disciplines));
  console.log('DEBUG: Component render - patientId prop:', patientId);
  console.log('DEBUG: Component render - patient prop:', patient);
  console.log('DEBUG: Component render - actualPatientId:', actualPatientId);
  console.log('DEBUG: Component render - certPeriodId:', certPeriodId);

  return (
    <div className="disciplines-component">
      <div className="component-decoration">
        <div className="glass-orb top-left"></div>
        <div className="glass-orb bottom-right"></div>
      </div>
      
      <div className="card-header">
        <div className="header-title">
          <div className="header-icon-wrapper">
            <i className="fas fa-user-friends"></i>
            <div className="icon-glow"></div>
          </div>
          <h3>Therapy Disciplines</h3>
        </div>
        <div className="header-decoration"></div>
      </div>
      
      <div className="card-body">
        <div className="disciplines-list">
          {Object.entries(disciplines).length === 0 ? (
            <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
              DEBUG: No disciplines data found. 
              <br/>patientId prop: {patientId}
              <br/>patient prop: {patient ? `id: ${patient.id}` : 'null'}
              <br/>actualPatientId: {actualPatientId}
              <br/>certPeriodId: {certPeriodId}
              <br/>disciplines keys: {Object.keys(disciplines).join(', ')}
            </div>
          ) : (
            Object.entries(disciplines).map(([discipline, data]) => (
              <DisciplineCard
                key={discipline}
                discipline={discipline}
                data={data}
                staffDetails={staffDetails}
                onAssignStaff={assignStaff}
                onUnassignStaff={unassignStaff}
                onUpdateFrequency={updateFrequency}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const DisciplineCard = ({ discipline, data, staffDetails, onAssignStaff, onUnassignStaff, onUpdateFrequency }) => {
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [editingRole, setEditingRole] = useState(null); // 'main' for PT/OT/ST, 'assistant' for PTA/COTA/STA
  const [isEditingFreq, setIsEditingFreq] = useState(false);
  const [newFrequency, setNewFrequency] = useState(data.frequency || '');
  // Auto-determine if discipline is active based on staff assignments
  const hasMainStaff = !!data[`assigned_${discipline.toLowerCase()}`];
  const hasAssistantStaff = !!data[`assigned_${discipline.toLowerCase()}a`];
  const isActive = hasMainStaff || hasAssistantStaff;

  const disciplineConfig = {
    PT: { 
      name: 'Physical Therapy', 
      icon: 'fas fa-walking', 
      color: '#3b82f6',
      colorLight: 'rgba(59, 130, 246, 0.1)',
      colorMedium: 'rgba(59, 130, 246, 0.2)',
      colorBorder: 'rgba(59, 130, 246, 0.3)',
      colorShadow: 'rgba(59, 130, 246, 0.2)',
      colorGradient: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    },
    OT: { 
      name: 'Occupational Therapy', 
      icon: 'fas fa-hand-paper', 
      color: '#8b5cf6',
      colorLight: 'rgba(139, 92, 246, 0.1)',
      colorMedium: 'rgba(139, 92, 246, 0.2)',
      colorBorder: 'rgba(139, 92, 246, 0.3)',
      colorShadow: 'rgba(139, 92, 246, 0.2)',
      colorGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    ST: { 
      name: 'Speech Therapy', 
      icon: 'fas fa-comments', 
      color: '#10b981',
      colorLight: 'rgba(16, 185, 129, 0.1)',
      colorMedium: 'rgba(16, 185, 129, 0.2)',
      colorBorder: 'rgba(16, 185, 129, 0.3)',
      colorShadow: 'rgba(16, 185, 129, 0.2)',
      colorGradient: 'linear-gradient(135deg, #10b981, #059669)'
    }
  };

  const config = disciplineConfig[discipline] || { 
    name: discipline, 
    icon: 'fas fa-user', 
    color: '#6b7280',
    colorLight: 'rgba(107, 114, 128, 0.1)',
    colorMedium: 'rgba(107, 114, 128, 0.2)',
    colorBorder: 'rgba(107, 114, 128, 0.3)',
    colorShadow: 'rgba(107, 114, 128, 0.2)',
    colorGradient: 'linear-gradient(135deg, #6b7280, #4b5563)'
  };

  const cardStyle = {
    '--card-color': config.color,
    '--card-color-light': config.colorLight,
    '--card-color-medium': config.colorMedium,
    '--card-color-border': config.colorBorder,
    '--card-color-shadow': config.colorShadow,
    '--card-color-gradient': config.colorGradient
  };

  const getStaffInfo = (staffId) => {
    return staffDetails[staffId] || { name: 'Unknown', email: 'No email', phone: 'No phone', role: '' };
  };

  return (
    <div className={`discipline-card glass-card hover-effect ${!isActive ? 'inactive' : ''}`} style={cardStyle}>
      <div className="card-bg-decoration"></div>
      

      <div className="discipline-header">
        <div className="discipline-icon">
          <div className="icon-3d">
            <i className={config.icon}></i>
            <div className="icon-shadow"></div>
          </div>
          <div className="icon-glow"></div>
        </div>
        
        <div className="discipline-title">
          <h3>{config.name}</h3>
          <span className="discipline-subtitle">{discipline} Therapy</span>
          <div className="title-decoration"></div>
        </div>
        
        <div className="discipline-status">
          <div className={`status-indicator ${isActive ? 'active' : 'inactive'}`}>
            <div className="status-dot"></div>
            <span>{isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>

      <div className="discipline-content">
        <div className="therapy-staff glass-card">
          {isEditingStaff ? (
            <div className="edit-form glass-form">
              <div className="edit-form-decoration"></div>
              <div className="form-group">
                <label><i className="fas fa-user-md"></i>
                  Select {editingRole === 'main' ? discipline : `${discipline}A`} Therapist
                </label>
                <div className="select-wrapper">
                  <select 
                    className="glass-input"
                    onChange={(e) => {
                      if (e.target.value) {
                        onAssignStaff(discipline, parseInt(e.target.value));
                        setIsEditingStaff(false);
                        setEditingRole(null);
                      }
                    }}
                  >
                    <option value="">Select therapist...</option>
                    {data.available_staff
                      ?.filter(staff => {
                        if (editingRole === 'main') {
                          // Show only main roles: PT, OT, ST
                          return staff.role === discipline;
                        } else if (editingRole === 'assistant') {
                          // Show only assistant roles: PTA, COTA, STA
                          return staff.role === `${discipline}A`;
                        }
                        return true;
                      })
                      ?.map(staff => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.role})
                        </option>
                      ))}
                  </select>
                  <i className="fas fa-chevron-down select-arrow"></i>
                </div>
              </div>
              <div className="form-actions">
                <button 
                  className="cancel-btn glass-btn" 
                  onClick={() => {
                    setIsEditingStaff(false);
                    setEditingRole(null);
                  }}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* PT/OT/ST Therapist - Left Column */}
              <div className="staff-item glass-card">
                <div className="staff-header">
                  <div className="staff-title">
                    <div className="title-icon">
                      <i className="fas fa-user-md"></i>
                      <div className="icon-glow"></div>
                    </div>
                    {discipline} Therapist
                  </div>
                  <div className="staff-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      className="edit-button glass-btn-sm" 
                      onClick={() => {
                        setIsEditingStaff(true);
                        setEditingRole('main'); // Editing PT/OT/ST
                      }}
                    >
                      <i className="fas fa-edit"></i>
                      <div className="btn-glow"></div>
                    </button>
                    {data[`assigned_${discipline.toLowerCase()}`] && (
                      <button 
                        className="remove-x-btn"
                        onClick={() => onUnassignStaff(discipline, 'main')}
                        title="Remove therapist"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                <div className="staff-details">
                  {data[`assigned_${discipline.toLowerCase()}`] ? (
                    <>
                      <div className="staff-name glass-highlight">
                        <div className="staff-avatar">
                          {data[`assigned_${discipline.toLowerCase()}`].name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          <div className="avatar-glow"></div>
                        </div>
                        <span>{data[`assigned_${discipline.toLowerCase()}`].name}</span>
                        <i className="fas fa-chevron-down"></i>
                      </div>
                      <div className="staff-info">
                        <div className="info-item glass-item">
                          <i className="fas fa-envelope"></i>
                          <span>{getStaffInfo(data[`assigned_${discipline.toLowerCase()}`].id).email}</span>
                        </div>
                        <div className="info-item glass-item">
                          <i className="fas fa-phone"></i>
                          <span>{getStaffInfo(data[`assigned_${discipline.toLowerCase()}`].id).phone}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="staff-placeholder">
                      <div className="placeholder-icon">
                        <i className="fas fa-user-plus"></i>
                        <div className="icon-glow"></div>
                      </div>
                      <span>No {discipline} assigned</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PTA/COTA/STA Assistant - Right Column */}
              <div className="staff-item glass-card">
                <div className="staff-header">
                  <div className="staff-title">
                    <div className="title-icon">
                      <i className="fas fa-user-friends"></i>
                      <div className="icon-glow"></div>
                    </div>
                    {discipline}A Assistant
                  </div>
                  <div className="staff-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      className="edit-button glass-btn-sm" 
                      onClick={() => {
                        setIsEditingStaff(true);
                        setEditingRole('assistant'); // Editing PTA/COTA/STA
                      }}
                    >
                      <i className="fas fa-edit"></i>
                      <div className="btn-glow"></div>
                    </button>
                    {data[`assigned_${discipline.toLowerCase()}a`] && (
                      <button 
                        className="remove-x-btn"
                        onClick={() => onUnassignStaff(discipline, 'assistant')}
                        title="Remove assistant"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                <div className="staff-details">
                  {data[`assigned_${discipline.toLowerCase()}a`] ? (
                    <>
                      <div className="staff-name glass-highlight">
                        <div className="staff-avatar">
                          {data[`assigned_${discipline.toLowerCase()}a`].name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          <div className="avatar-glow"></div>
                        </div>
                        <span>{data[`assigned_${discipline.toLowerCase()}a`].name}</span>
                        <i className="fas fa-chevron-down"></i>
                      </div>
                      <div className="staff-info">
                        <div className="info-item glass-item">
                          <i className="fas fa-envelope"></i>
                          <span>{getStaffInfo(data[`assigned_${discipline.toLowerCase()}a`].id).email}</span>
                        </div>
                        <div className="info-item glass-item">
                          <i className="fas fa-phone"></i>
                          <span>{getStaffInfo(data[`assigned_${discipline.toLowerCase()}a`].id).phone}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="staff-placeholder">
                      <div className="placeholder-icon">
                        <i className="fas fa-user-plus"></i>
                        <div className="icon-glow"></div>
                      </div>
                      <span>No {discipline}A assigned</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="therapy-frequency glass-card">
          <div className="frequency-header">
            <div className="staff-title">
              <div className="title-icon">
                <i className="fas fa-clock"></i>
                <div className="icon-glow"></div>
              </div>
              Therapy Frequency
            </div>
            <button 
              className="edit-button glass-btn-sm" 
              onClick={() => setIsEditingFreq(!isEditingFreq)}
            >
              <i className={isEditingFreq ? 'fas fa-times' : 'fas fa-edit'}></i>
              <div className="btn-glow"></div>
            </button>
          </div>

          {isEditingFreq ? (
            <div className="frequency-edit glass-form">
              <div className="edit-form-decoration"></div>
              <div className="input-group">
                <input
                  type="text"
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  placeholder="e.g., 3x/week"
                  className="glass-input frequency-input"
                />
                <div className="format-hint">
                  <i className="fas fa-info-circle"></i>
                  Format: 3x/week, 2x/day, etc.
                </div>
              </div>
              
              <div className="frequency-presets">
                {['1x/week', '2x/week', '3x/week', '1x/day', '2x/day'].map(preset => (
                  <button
                    key={preset}
                    className="glass-chip"
                    onClick={() => setNewFrequency(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              
              <div className="form-actions">
                <button 
                  className="cancel-btn glass-btn" 
                  onClick={() => setIsEditingFreq(false)}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button 
                  className="save-btn glass-btn"
                  onClick={() => {
                    onUpdateFrequency(discipline, newFrequency);
                    setIsEditingFreq(false);
                  }}
                >
                  <div className="btn-shine"></div>
                  <i className="fas fa-save"></i>
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="frequency-display">
              {data.frequency ? (
                <div className="frequency-value">
                  <div className="frequency-code glass-highlight">
                    <span>{data.frequency}</span>
                    <div className="frequency-glow"></div>
                  </div>
                  <div className="frequency-readable">
                    {data.frequency.includes('week') ? 'Weekly Schedule' : 'Daily Schedule'}
                  </div>
                  
                  <div className="frequency-visualization">
                    <div className="frequency-calendar glass-card-inner">
                      <div className="weeks-container">
                        {[1, 2].map(week => (
                          <div key={week} className="week">
                            <div className="week-label">W{week}</div>
                            <div className="days">
                              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                                <div 
                                  key={idx} 
                                  className={`day ${idx >= 5 ? 'weekend' : ''} ${
                                    (data.frequency === '3x/week' && [0, 2, 4].includes(idx)) ||
                                    (data.frequency === '2x/week' && [1, 3].includes(idx)) ||
                                    (data.frequency === '1x/week' && idx === 2) ? 'visit' : ''
                                  }`}
                                >
                                  {(data.frequency === '3x/week' && [0, 2, 4].includes(idx)) ||
                                   (data.frequency === '2x/week' && [1, 3].includes(idx)) ||
                                   (data.frequency === '1x/week' && idx === 2) ? (
                                    <div className="day-indicator">
                                      <i className="fas fa-check"></i>
                                      <div className="day-glow"></div>
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-frequency">
                  <div className="placeholder-icon">
                    <i className="fas fa-calendar-plus"></i>
                    <div className="icon-glow"></div>
                  </div>
                  <span>No frequency set</span>
                  <button 
                    className="set-frequency-btn glass-btn-sm"
                    onClick={() => setIsEditingFreq(true)}
                  >
                    <i className="fas fa-plus"></i>
                    Set Frequency
                    <div className="btn-shine"></div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisciplinesComponent;