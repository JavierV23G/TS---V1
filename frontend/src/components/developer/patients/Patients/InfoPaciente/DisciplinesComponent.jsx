import React, { useState, useEffect } from 'react';
import '../../../../../styles/developer/Patients/InfoPaciente/DisciplinesComponent.scss';

const DisciplineCard = ({ 
  disciplineType, 
  disciplineLabel,
  assistantLabel,
  therapist, 
  assistant, 
  frequency, 
  isActive, 
  onToggle, 
  onChangeTherapist,
  onChangeAssistant,
  onChangeFrequency,
  therapistsList,
  assistantsList,
  scheduledVisits = []  // NUEVO PROP PARA SINCRONIZACIÓN
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isFrequencyEditing, setIsFrequencyEditing] = useState(false);
  const [tempFrequency, setTempFrequency] = useState(frequency);
  const [selectedTherapist, setSelectedTherapist] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [showTherapistInfo, setShowTherapistInfo] = useState(false);
  const [showAssistantInfo, setShowAssistantInfo] = useState(false);
  const [hoverEffect, setHoverEffect] = useState(false);

  // Inicializar selectedTherapist y selectedAssistant al entrar en modo de edición
  useEffect(() => {
    if (isEditing) {
      setSelectedTherapist(therapist?.id?.toString() || '');
      setSelectedAssistant(assistant?.id?.toString() || '');
    }
  }, [isEditing, therapist, assistant]);

  // Update tempFrequency when frequency prop changes
  useEffect(() => {
    setTempFrequency(frequency);
  }, [frequency]);

  // Get icon and color based on discipline type
  const getDisciplineIcon = () => {
    switch (disciplineType) {
      case 'PT':
        return 'fas fa-walking';
      case 'OT':
        return 'fas fa-hands';
      case 'ST':
        return 'fas fa-comment-medical';
      default:
        return 'fas fa-user-md';
    }
  };
  
  const getDisciplineColor = () => {
    switch (disciplineType) {
      case 'PT':
        return {
          primary: '#3b82f6',
          light: 'rgba(59, 130, 246, 0.1)',
          medium: 'rgba(59, 130, 246, 0.2)',
          border: 'rgba(59, 130, 246, 0.3)',
          shadow: 'rgba(59, 130, 246, 0.4)',
          gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa, #93c5fd)',
          glow: '0 0 20px rgba(59, 130, 246, 0.5)'
        };
      case 'OT':
        return {
          primary: '#8b5cf6',
          light: 'rgba(139, 92, 246, 0.1)',
          medium: 'rgba(139, 92, 246, 0.2)',
          border: 'rgba(139, 92, 246, 0.3)',
          shadow: 'rgba(139, 92, 246, 0.4)',
          gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa, #c4b5fd)',
          glow: '0 0 20px rgba(139, 92, 246, 0.5)'
        };
      case 'ST':
        return {
          primary: '#10b981',
          light: 'rgba(16, 185, 129, 0.1)',
          medium: 'rgba(16, 185, 129, 0.2)',
          border: 'rgba(16, 185, 129, 0.3)',
          shadow: 'rgba(16, 185, 129, 0.4)',
          gradient: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)',
          glow: '0 0 20px rgba(16, 185, 129, 0.5)'
        };
      default:
        return {
          primary: '#64748b',
          light: 'rgba(100, 116, 139, 0.1)',
          medium: 'rgba(100, 116, 139, 0.2)',
          border: 'rgba(100, 116, 139, 0.3)',
          shadow: 'rgba(100, 116, 139, 0.4)',
          gradient: 'linear-gradient(135deg, #64748b, #94a3b8, #cbd5e1)',
          glow: '0 0 20px rgba(100, 116, 139, 0.5)'
        };
    }
  };
  
  const colors = getDisciplineColor();
  
  // Handle save therapist changes
  const handleSaveChanges = () => {
    // Buscar el nuevo terapeuta y asistente
    const newTherapist = selectedTherapist 
      ? therapistsList.find(t => t.id === parseInt(selectedTherapist)) || null 
      : null;
    const newAssistant = selectedAssistant 
      ? assistantsList.find(a => a.id === parseInt(selectedAssistant)) || null 
      : null;

    console.log('Saving therapist:', newTherapist);
    console.log('Saving assistant:', newAssistant);

    // Comparar IDs para determinar si hay un cambio
    const therapistId = therapist?.id || null;
    const newTherapistId = newTherapist?.id || null;
    const assistantId = assistant?.id || null;
    const newAssistantId = newAssistant?.id || null;

    // Only call onChange if there's an actual change in selection
    if (newTherapistId !== therapistId) {
      onChangeTherapist(newTherapist);
    }
    if (newAssistantId !== assistantId) {
      onChangeAssistant(newAssistant);
    }
    
    // If both are null, and the discipline was active, deactivate it
    if (!newTherapist && !newAssistant && isActive) {
      onToggle(false); // Pass false to explicitly deactivate
    } else if ((newTherapist || newAssistant) && !isActive) {
      onToggle(true); // Pass true to explicitly activate if staff is assigned
    }

    setIsEditing(false);
  };
  
  // Handle save frequency changes
  const handleSaveFrequency = () => {
    onChangeFrequency(tempFrequency);
    setIsFrequencyEditing(false);
  };
  
  // Get frequency display format - updated to match correct interpretation
  const getFrequencyDisplay = (freq) => {
    if (!freq) return 'Not set';
    
    const parts = freq.match(/(\d+)w(\d+)/);
    if (parts && parts.length === 3) {
      const visits = parts[1];
      const weeks = parts[2];
      return `${visits} visit${visits > 1 ? 's' : ''} every ${weeks} week${weeks > 1 ? 's' : ''}`;
    }
    
    return freq;
  };

  // Available frequency options
  const frequencyPresets = [
    { value: '1w1', label: '1w1' }, // 1 visit every 1 week
    { value: '2w2', label: '2w2' }, // 2 visits every 2 weeks
    { value: '1w2', label: '1w2' }, // 1 visit every 2 weeks 
    { value: '1w5', label: '1w5' }, // 1 visit every 5 weeks
    { value: '2w4', label: '2w4' }, // 2 visits every 4 weeks
    { value: '3w2', label: '3w2' }, // 3 visits every 2 weeks
    { value: '5w4', label: '5w4' }, // 5 visits every 4 weeks
    { value: '2w1', label: '2w1' }, // 2 visits every 1 week
    { value: '3w1', label: '3w1' }  // 3 visits every 1 week
  ];
  
  return (
    <div 
      className={`discipline-card ${isActive ? 'active' : 'inactive'} ${hoverEffect ? 'hover-effect' : ''}`}
      style={{
        '--card-color': colors.primary,
        '--card-color-light': colors.light,
        '--card-color-medium': colors.medium,
        '--card-color-border': colors.border,
        '--card-color-shadow': colors.shadow,
        '--card-color-gradient': colors.gradient,
        '--card-color-glow': colors.glow
      }}
      onMouseEnter={() => setHoverEffect(true)}
      onMouseLeave={() => setHoverEffect(false)}
    >
      <div className="discipline-header">
        <div className="discipline-icon">
          <div className="icon-3d">
            <i className={getDisciplineIcon()}></i>
            <div className="icon-shadow"></div>
          </div>
          <div className="icon-glow"></div>
        </div>
        <div className="discipline-title">
          <h3>{disciplineType}</h3>
          <span className="discipline-subtitle">{disciplineLabel}</span>
          <div className="title-decoration"></div>
        </div>
        <div className="discipline-toggle">
          <button 
            className={`toggle-button glass-effect ${isActive ? 'active' : ''}`}
            onClick={() => onToggle(null)}
            title={isActive ? 'Deactivate discipline' : 'Activate discipline'}
          >
            <div className="toggle-track">
              <div className="toggle-indicator">
                <div className="toggle-glow"></div>
              </div>
            </div>
          </button>
        </div>
      </div>
      
      {!isActive && (
        <div className="inactive-overlay glass-effect">
          <span>This discipline is currently inactive</span>
          <button className="activate-btn glass-effect" onClick={onToggle}>
            <i className="fas fa-power-off"></i>
            <span>Activate</span>
            <div className="btn-shine"></div>
          </button>
        </div>
      )}
      
      <div className="discipline-content">
        {/* Therapist Section */}
        <div className="therapy-staff">
          {isEditing ? (
            <div className="edit-form glass-form">
              <div className="edit-form-decoration"></div>
              <div className="form-group">
                <label htmlFor={`therapist-select-${disciplineType}`}>
                  <i className="fas fa-user-md"></i>
                  {disciplineLabel}
                </label>
                <div className="select-wrapper">
                  <select 
                    id={`therapist-select-${disciplineType}`}
                    value={selectedTherapist}
                    onChange={(e) => {
                      console.log('Selected therapist ID:', e.target.value);
                      setSelectedTherapist(e.target.value);
                    }}
                    disabled={!isActive}
                    className="glass-input"
                  >
                    <option value="">Select {disciplineLabel}</option>
                    {therapistsList.length > 0 ? (
                      therapistsList.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))
                    ) : (
                      <option value="" disabled>No therapists available</option>
                    )}
                  </select>
                  <i className="fas fa-chevron-down select-arrow"></i>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor={`assistant-select-${disciplineType}`}>
                  <i className="fas fa-user-nurse"></i>
                  {assistantLabel}
                </label>
                <div className="select-wrapper">
                  <select 
                    id={`assistant-select-${disciplineType}`}
                    value={selectedAssistant}
                    onChange={(e) => {
                      console.log('Selected assistant ID:', e.target.value);
                      setSelectedAssistant(e.target.value);
                    }}
                    disabled={!isActive}
                    className="glass-input"
                  >
                    <option value="">Select {assistantLabel}</option>
                    {assistantsList.length > 0 ? (
                      assistantsList.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))
                    ) : (
                      <option value="" disabled>No assistants available</option>
                    )}
                  </select>
                  <i className="fas fa-chevron-down select-arrow"></i>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  className="cancel-btn glass-btn" 
                  onClick={() => setIsEditing(false)}
                >
                  <i className="fas fa-times"></i>
                  <span>Cancel</span>
                </button>
                <button 
                  className="save-btn glass-btn" 
                  onClick={handleSaveChanges}
                  disabled={!isActive}
                >
                  <i className="fas fa-check"></i>
                  <span>Save</span>
                  <div className="btn-shine"></div>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="staff-item therapist glass-card">
                <div className="staff-header">
                  <div className="staff-title">
                    <div className="title-icon">
                      <i className="fas fa-user-md"></i>
                      <div className="icon-glow"></div>
                    </div>
                    <span>{disciplineLabel}</span>
                  </div>
                  {isActive && (
                    <button 
                      className="edit-button glass-btn-sm" 
                      onClick={() => setIsEditing(true)}
                      title={`Change ${disciplineLabel}`}
                    >
                      <i className="fas fa-edit"></i>
                      <div className="btn-glow"></div>
                    </button>
                  )}
                </div>
                
                {therapist ? (
                  <div className="staff-details">
                    <div 
                      className="staff-name glass-highlight" 
                      onClick={() => setShowTherapistInfo(!showTherapistInfo)}
                    >
                      <div className="staff-avatar">
                        {therapist.name.charAt(0)}
                        <div className="avatar-glow"></div>
                      </div>
                      <span>{therapist.name}</span>
                      <i className={`fas fa-chevron-${showTherapistInfo ? 'up' : 'down'}`}></i>
                    </div>
                    
                    {showTherapistInfo && (
                      <div className="staff-info">
                        {therapist.phone && (
                          <div className="info-item glass-item">
                            <i className="fas fa-phone-alt"></i>
                            <span>{therapist.phone}</span>
                          </div>
                        )}
                        {therapist.email && (
                          <div className="info-item glass-item">
                            <i className="fas fa-envelope"></i>
                            <span>{therapist.email}</span>
                          </div>
                        )}
                        {therapist.alt_phone && (
                          <div className="info-item glass-item">
                            <i className="fas fa-phone"></i>
                            <span>Alt #: {therapist.alt_phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="staff-placeholder">
                    <div className="placeholder-icon">
                      <i className="fas fa-user-plus"></i>
                      <div className="icon-glow"></div>
                    </div>
                    <span>No {disciplineLabel} assigned</span>
                  </div>
                )}
              </div>
              
              <div className="staff-item assistant glass-card">
                <div className="staff-header">
                  <div className="staff-title">
                    <div className="title-icon">
                      <i className="fas fa-user-nurse"></i>
                      <div className="icon-glow"></div>
                    </div>
                    <span>{assistantLabel}</span>
                  </div>
                </div>
                
                {assistant ? (
                  <div className="staff-details">
                    <div 
                      className="staff-name glass-highlight" 
                      onClick={() => setShowAssistantInfo(!showAssistantInfo)}
                    >
                      <div className="staff-avatar">
                        {assistant.name.charAt(0)}
                        <div className="avatar-glow"></div>
                      </div>
                      <span>{assistant.name}</span>
                      <i className={`fas fa-chevron-${showAssistantInfo ? 'up' : 'down'}`}></i>
                    </div>
                    
                    {showAssistantInfo && (
                      <div className="staff-info">
                        {assistant.phone && (
                          <div className="info-item glass-item">
                            <i className="fas fa-phone-alt"></i>
                            <span>{assistant.phone}</span>
                          </div>
                        )}
                        {assistant.email && (
                          <div className="info-item glass-item">
                            <i className="fas fa-envelope"></i>
                            <span>{assistant.email}</span>
                          </div>
                        )}
                        {assistant.alt_phone && (
                          <div className="info-item glass-item">
                            <i className="fas fa-phone"></i>
                            <span>Alt #: {assistant.alt_phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="staff-placeholder">
                    <div className="placeholder-icon">
                      <i className="fas fa-user-plus"></i>
                      <div className="icon-glow"></div>
                    </div>
                    <span>No {assistantLabel} assigned</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Frequency Section */}
        <div className="therapy-frequency glass-card">
          <div className="frequency-header">
            <div className="staff-title">
              <div className="title-icon">
                <i className="fas fa-calendar-alt"></i>
                <div className="icon-glow"></div>
              </div>
              <span>Frequency</span>
            </div>
            {isActive && !isFrequencyEditing && (
              <button 
                className="edit-button glass-btn-sm" 
                onClick={() => setIsFrequencyEditing(true)}
                title="Edit frequency"
              >
                <i className="fas fa-edit"></i>
                <div className="btn-glow"></div>
              </button>
            )}
          </div>
          
          {isFrequencyEditing ? (
            <div className="frequency-edit glass-form">
              <div className="edit-form-decoration"></div>
              <div className="input-group">
                <input 
                  type="text" 
                  value={tempFrequency} 
                  onChange={(e) => setTempFrequency(e.target.value)}
                  placeholder="e.g. 1w1"
                  className="glass-input frequency-input"
                />
                <div className="format-hint">
                  <i className="fas fa-info-circle"></i>
                  <span>Format: [visits]w[weeks] (e.g. 1w1 = 1 visit every 1 week)</span>
                </div>
              </div>
              
              <div className="frequency-presets-container">
                <div className="frequency-presets">
                  {frequencyPresets.map((preset) => (
                    <button 
                      key={preset.value} 
                      onClick={() => setTempFrequency(preset.value)} 
                      className={`glass-chip ${tempFrequency === preset.value ? 'active' : ''}`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  className="cancel-btn glass-btn" 
                  onClick={() => {
                    setTempFrequency(frequency);
                    setIsFrequencyEditing(false);
                  }}
                >
                  <i className="fas fa-times"></i>
                  <span>Cancel</span>
                </button>
                <button 
                  className="save-btn glass-btn" 
                  onClick={handleSaveFrequency}
                >
                  <i className="fas fa-check"></i>
                  <span>Save</span>
                  <div className="btn-shine"></div>
                </button>
              </div>
            </div>
          ) : (
            <div className={`frequency-display ${!frequency ? 'no-frequency' : ''}`}>
              {frequency ? (
                <>
                  <div className="frequency-value">
                    <div className="frequency-code glass-highlight">
                      <span>{frequency}</span>
                      <div className="frequency-glow"></div>
                      {scheduledVisits.length > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#10b981',
                          color: 'white',
                          fontSize: '10px',
                          padding: '2px 4px',
                          borderRadius: '8px',
                          fontWeight: 'bold'
                        }}>
                          🔗
                        </span>
                      )}
                    </div>
                    <span className="frequency-readable">
                      {getFrequencyDisplay(frequency)}
                      {scheduledVisits.length > 0 && (
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#10b981', 
                          marginLeft: '8px',
                          fontWeight: '500'
                        }}>
                          (Auto-sync)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="frequency-visualization">
                    {renderFrequencyVisualization(frequency, colors)}
                  </div>
                </>
              ) : (
                <div className="no-frequency">
                  <div className="placeholder-icon">
                    <i className="fas fa-calendar-times"></i>
                    <div className="icon-glow"></div>
                  </div>
                  <span>No frequency set</span>
                  {isActive && (
                    <button 
                      className="set-frequency-btn glass-btn-sm"
                      onClick={() => setIsFrequencyEditing(true)}
                    >
                      <i className="fas fa-plus"></i>
                      <span>Set Frequency</span>
                      <div className="btn-shine"></div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="card-bg-decoration"></div>
    </div>
  );
};

// Helper function to render frequency visualization - CORRECTED
const renderFrequencyVisualization = (frequency, colors) => {
  if (!frequency) return null;
  
  // Updated regex to match the format [visits-per-week]w[total-weeks]
  const parts = frequency.match(/(\d+)w(\d+)/);
  if (!parts || parts.length < 3) return null;
  
  // Correctly parsing the frequency
  const visitsPerWeek = parseInt(parts[1]);
  const totalWeeks = parseInt(parts[2]);
  
  const daysInWeek = 7;
  const totalDays = totalWeeks * daysInWeek;
  
  const dayDots = [];
  
  // Calculate days with visits based on the correct interpretation
  const calculateVisitDays = () => {
    const visitDaysArray = [];
    
    // For each week
    for (let weekIdx = 0; weekIdx < totalWeeks; weekIdx++) {
      // Distribute the visits per week evenly (excluding weekends if possible)
      for (let visitIdx = 0; visitIdx < visitsPerWeek; visitIdx++) {
        // If we have more visits than weekdays, we'll need to place multiple visits on some days
        if (visitsPerWeek <= 5) {
          // We can place visits on weekdays only
          // Spread visits evenly across weekdays (Mon-Fri)
          const dayOffset = Math.floor(visitIdx * (5 / visitsPerWeek));
          // Add to visit days (weekIdx * 7 for week offset, dayOffset for day within week, +1 to start on Monday)
          visitDaysArray.push(weekIdx * daysInWeek + dayOffset + 1);
        } else {
          // If more than 5 visits per week, we need to use weekends too
          const dayOffset = Math.floor(visitIdx * (daysInWeek / visitsPerWeek));
          visitDaysArray.push(weekIdx * daysInWeek + dayOffset);
        }
      }
    }
    
    return visitDaysArray;
  };
  
  const visitDays = calculateVisitDays();
  
  // Create the array of day objects
  for (let day = 0; day < totalDays; day++) {
    const isVisit = visitDays.includes(day);
    const isWeekend = day % 7 === 5 || day % 7 === 6;
    
    dayDots.push({
      day,
      isVisit,
      isWeekend
    });
  }
  
  return (
    <div className="frequency-calendar glass-card-inner">
      <div className="weeks-container">
        {Array.from({ length: totalWeeks }).map((_, weekIndex) => (
          <div key={weekIndex} className="week">
            <div className="week-label">W{weekIndex + 1}</div>
            <div className="days">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dotIndex = weekIndex * 7 + dayIndex;
                const dot = dayDots[dotIndex];
                return (
                  <div 
                    key={dayIndex} 
                    className={`day ${dot.isVisit ? 'visit' : ''} ${dot.isWeekend ? 'weekend' : ''}`}
                    title={dot.isVisit ? `Visit day` : ''}
                  >
                    {dot.isVisit && (
                      <div className="day-indicator">
                        <i className="fas fa-check"></i>
                        <div className="day-glow"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DisciplinesComponent = ({ 
  patient, 
  onUpdateDisciplines,
  // NUEVOS PROPS PARA SINCRONIZACIÓN
  scheduledVisits = [],     // Visitas del calendario
  approvedVisits = null,    // Datos de medical info
  onSyncDisciplinesData     // Callback para sincronizar cambios
}) => {
  
  const [disciplines, setDisciplines] = useState({
    PT: {
      isActive: false,
      therapist: null,
      assistant: null,
      frequency: ''
    },
    OT: {
      isActive: false,
      therapist: null,
      assistant: null,
      frequency: ''
    },
    ST: {
      isActive: false,
      therapist: null,
      assistant: null,
      frequency: ''
    }
  });
  
  // Estados para datos de API - CORREGIDO
  const [allStaff, setAllStaff] = useState([]);
  const [assignedStaff, setAssignedStaff] = useState(null); // Cambiar a null para detectar cuando no se ha cargado
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // ===== FUNCIONES DE ALMACENAMIENTO LOCAL =====
  
  // Guardar disciplines data en localStorage
  const saveDisciplinesToLocal = (disciplinesData) => {
    if (patient?.id) {
      const key = `disciplines_${patient.id}`;
      localStorage.setItem(key, JSON.stringify(disciplinesData));
    }
  };

  // Cargar disciplines data desde localStorage
  const loadDisciplinesFromLocal = () => {
    if (patient?.id) {
      const key = `disciplines_${patient.id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed;
        } catch (e) {
          console.warn('Error parsing stored disciplines:', e);
        }
      }
    }
    return null;
  };

  // ===== FUNCIONES DE SINCRONIZACIÓN =====
  
  // Calcular frecuencia automáticamente basado en visitas del calendario
  const calculateFrequencyFromVisits = (disciplineType, visits = scheduledVisits) => {
    const disciplineMapping = {
      'PT': ['PT', 'PTA'],
      'OT': ['OT', 'COTA'],
      'ST': ['ST', 'STA']
    };
    
    const relevantRoles = disciplineMapping[disciplineType] || [];
    
    // Filtrar visitas de esta disciplina
    const disciplineVisits = visits.filter(visit => {
      const therapyType = visit.therapy_type?.toUpperCase();
      const status = visit.status?.toLowerCase();
      const validStatuses = ['completed', 'scheduled', 'in_progress'];
      return relevantRoles.includes(therapyType) && validStatuses.includes(status);
    });
    
    if (disciplineVisits.length === 0) return '';
    
    // Agrupar visitas por semana
    const visitsByWeek = {};
    disciplineVisits.forEach(visit => {
      const visitDate = new Date(visit.visit_date);
      const weekKey = getWeekKey(visitDate);
      
      if (!visitsByWeek[weekKey]) {
        visitsByWeek[weekKey] = [];
      }
      visitsByWeek[weekKey].push(visit);
    });
    
    const weeks = Object.keys(visitsByWeek).sort();
    if (weeks.length === 0) return '';
    
    // Calcular frecuencia más común
    const weeklyVisitCounts = weeks.map(week => visitsByWeek[week].length);
    const totalVisits = weeklyVisitCounts.reduce((sum, count) => sum + count, 0);
    const totalWeeks = weeks.length;
    
    // Determinar el patrón más representativo
    if (totalWeeks === 1) {
      return `${totalVisits}w1`; // X visitas en 1 semana
    }
    
    // Para múltiples semanas, calcular el promedio
    const avgVisitsPerWeek = Math.round(totalVisits / totalWeeks);
    
    // Patrones comunes
    if (avgVisitsPerWeek === 1 && totalWeeks <= 2) return '1w1';
    if (avgVisitsPerWeek === 2 && totalWeeks <= 2) return '2w1';
    if (avgVisitsPerWeek === 3 && totalWeeks <= 2) return '3w1';
    
    // Para períodos más largos
    return `${totalVisits}w${totalWeeks}`;
  };
  
  // Obtener clave de semana para una fecha
  const getWeekKey = (date) => {
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-W${week}`;
  };
  
  // Calcular número de semana
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };
  
  // Sincronizar datos con otros componentes
  const syncWithOtherComponents = (updatedDisciplinesData) => {
    if (onSyncDisciplinesData && typeof onSyncDisciplinesData === 'function') {
      onSyncDisciplinesData(updatedDisciplinesData);
    }
  };
  
  // Obtener límites de visitas aprobadas desde medical info
  const getApprovedVisitsLimit = (disciplineType) => {
    if (!approvedVisits) return null;
    
    const disciplineMap = {
      'PT': 'pt',
      'OT': 'ot',
      'ST': 'st'
    };
    
    const disciplineKey = disciplineMap[disciplineType];
    const approved = approvedVisits[disciplineKey]?.approved;
    
    return approved ? parseInt(approved) : null;
  };
  
  // Fetch staff data from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/staff/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch staff: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received staff data:', data);
        setAllStaff(data);
        
      } catch (err) {
        console.error('Error fetching staff:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStaff();
  }, [API_BASE_URL]);

  // Fetch assigned staff for patient - CORREGIDO PARA BACKEND
  useEffect(() => {
    const fetchAssignedStaff = async () => {
      if (!patient?.id) {
        console.log('❌ No patient ID found for fetching assigned staff');
        setAssignedStaff([]);
        return;
      }
      
      try {
        console.log('🔍 Fetching assigned staff for patient:', patient.id);
        // USAR LA URL CORRECTA SEGÚN TU BACKEND
        const response = await fetch(`${API_BASE_URL}/patient/${patient.id}/assigned-staff`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📡 Assigned staff response status:', response.status);
        console.log('📡 Response URL:', response.url);
        
        if (response.ok) {
          const assignedData = await response.json();
          console.log('✅ Assigned staff data received:', assignedData);
          console.log('📊 Number of assignments found:', assignedData.length);
          
          // Log each assignment details
          assignedData.forEach((assignment, index) => {
            console.log(`   Assignment ${index + 1}:`, {
              id: assignment.id,
              role: assignment.assigned_role,
              staff_name: assignment.staff?.name,
              staff_id: assignment.staff?.id
            });
          });
          
          setAssignedStaff(assignedData);
        } else {
          console.log('❌ Failed to fetch assigned staff. Status:', response.status);
          try {
            const errorText = await response.text();
            console.log('❌ Error response:', errorText);
          } catch (e) {
            console.log('❌ Could not read error response');
          }
          setAssignedStaff([]);
        }
      } catch (err) {
        console.error('💥 Error fetching assigned staff:', err);
        console.error('💥 Error details:', {
          message: err.message,
          name: err.name,
          stack: err.stack
        });
        
        // Si falla por CORS o red, intentar endpoint alternativo
        console.log('🔄 Trying alternative approach...');
        try {
          // Verificar si el endpoint existe usando otra estrategia
          const testResponse = await fetch(`${API_BASE_URL}/staff/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (testResponse.ok) {
            console.log('✅ Basic API connection works, but assigned-staff endpoint has issues');
          }
        } catch (testErr) {
          console.error('💥 Complete API failure:', testErr);
        }
        
        setAssignedStaff([]);
      }
    };
    
    fetchAssignedStaff();
  }, [patient?.id, API_BASE_URL]);
  
  // Initialize with patient data and assigned staff - CORREGIDO PARA REINICIALIZAR CUANDO CAMBIAN LOS DATOS
  useEffect(() => {
    console.log('🔄 Initialization check:', {
      hasPatient: !!patient,
      patientId: patient?.id,
      allStaffCount: allStaff.length,
      assignedStaffCount: assignedStaff ? assignedStaff.length : 'null',
      isInitialized
    });
    
    // CAMBIO CLAVE: Reinicializar cuando assignedStaff tiene datos nuevos
    if (patient && allStaff.length > 0 && assignedStaff !== null && 
        (!isInitialized || (assignedStaff.length > 0 && !disciplines.PT.therapist && !disciplines.OT.therapist && !disciplines.ST.therapist))) {
      console.log('🚀 Starting disciplines initialization with:', {
        patient: patient.id,
        staffCount: allStaff.length,
        assignedStaffCount: assignedStaff.length,
        assignedStaff
      });
      
      // Procesar required_disciplines - CON MEJOR DEBUG
      let requiredDisciplines = [];
      
      console.log('🔍 Raw required_disciplines from patient:', patient.required_disciplines);
      console.log('🔍 Type of required_disciplines:', typeof patient.required_disciplines);
      
      if (patient.required_disciplines) {
        try {
          if (typeof patient.required_disciplines === 'string') {
            requiredDisciplines = JSON.parse(patient.required_disciplines);
            console.log('✅ Parsed string required_disciplines:', requiredDisciplines);
          } else if (Array.isArray(patient.required_disciplines)) {
            requiredDisciplines = patient.required_disciplines;
            console.log('✅ Used array required_disciplines:', requiredDisciplines);
          } else if (typeof patient.required_disciplines === 'object') {
            // NUEVO: Si viene como objeto {PT: {...}, OT: {...}}, extraer las activas
            const disciplineObj = patient.required_disciplines;
            requiredDisciplines = Object.keys(disciplineObj).filter(key => 
              disciplineObj[key] && disciplineObj[key].isActive
            );
            console.log('✅ Extracted from object required_disciplines:', requiredDisciplines);
          } else {
            requiredDisciplines = [];
            console.log('⚠️ Unknown format for required_disciplines, using empty array');
          }
        } catch (parseError) {
          console.warn('⚠️ Failed to parse required_disciplines:', parseError);
          requiredDisciplines = [];
        }
      } else {
        console.log('⚠️ No required_disciplines found in patient data');
      }
      
      console.log('📋 Required disciplines from patient:', requiredDisciplines);
      
      // Mapear staff asignado por rol
      const assignedByRole = {};
      assignedStaff.forEach(assignment => {
        const role = assignment.assigned_role.toUpperCase();
        assignedByRole[role] = assignment.staff;
        console.log(`🔗 Mapped assigned staff: ${role} -> ${assignment.staff.name} (ID: ${assignment.staff.id})`);
      });
      
      console.log('👥 Final assigned staff by role:', assignedByRole);
      
      // Crear estado inicial de disciplinas - MEJORADO
      const newDisciplines = {
        PT: {
          // CAMBIO CLAVE: Priorizar required_disciplines sobre staff asignado
          isActive: requiredDisciplines.includes('PT') || Boolean(assignedByRole['PT']) || Boolean(assignedByRole['PTA']),
          therapist: assignedByRole['PT'] || null,
          assistant: assignedByRole['PTA'] || null,
          frequency: ''
        },
        OT: {
          isActive: requiredDisciplines.includes('OT') || Boolean(assignedByRole['OT']) || Boolean(assignedByRole['COTA']),
          therapist: assignedByRole['OT'] || null,
          assistant: assignedByRole['COTA'] || null,
          frequency: ''
        },
        ST: {
          isActive: requiredDisciplines.includes('ST') || Boolean(assignedByRole['ST']) || Boolean(assignedByRole['STA']),
          therapist: assignedByRole['ST'] || null,
          assistant: assignedByRole['STA'] || null,
          frequency: ''
        }
      };
      
      // NUEVO: Cargar disciplines_data desde localStorage primero, luego desde paciente
      const localData = loadDisciplinesFromLocal();
      if (localData) {
        // Combinar datos guardados con datos generados
        Object.keys(newDisciplines).forEach(type => {
          if (localData[type]) {
            // Preservar frecuencias guardadas
            if (localData[type].frequency) {
              newDisciplines[type].frequency = localData[type].frequency;
            }
            // Preservar otros datos si existen
            if (localData[type].isActive !== undefined) {
              newDisciplines[type].isActive = localData[type].isActive;
            }
          }
        });
      }
      // Fallback: cargar desde patient data si existe
      else if (patient.disciplines_data) {
        try {
          const parsedDisciplinesData = typeof patient.disciplines_data === 'string' 
            ? JSON.parse(patient.disciplines_data) 
            : patient.disciplines_data;
          
          // Combinar datos guardados con datos generados
          Object.keys(newDisciplines).forEach(type => {
            if (parsedDisciplinesData[type]) {
              // Preservar frecuencias guardadas
              if (parsedDisciplinesData[type].frequency) {
                newDisciplines[type].frequency = parsedDisciplinesData[type].frequency;
              }
              // Preservar otros datos si existen
              if (parsedDisciplinesData[type].isActive !== undefined) {
                newDisciplines[type].isActive = parsedDisciplinesData[type].isActive;
              }
            }
          });
          
        } catch (e) {
          console.warn('Error parsing disciplines_data:', e);
        }
      }

      console.log('🎯 Final disciplines state being set:', newDisciplines);
      
      // Log each discipline status
      Object.keys(newDisciplines).forEach(type => {
        const disc = newDisciplines[type];
        console.log(`   ${type}: Active=${disc.isActive}, Therapist=${disc.therapist?.name || 'None'}, Assistant=${disc.assistant?.name || 'None'}, Frequency=${disc.frequency || 'None'}`);
      });
      
      setDisciplines(newDisciplines);
      setIsInitialized(true);
      console.log('✅ Disciplines initialization completed');
    }
  }, [patient, allStaff, assignedStaff, isInitialized]);

  // NUEVO: Sincronización automática de frecuencias con visitas del calendario
  useEffect(() => {
    if (scheduledVisits.length >= 0 && isInitialized) {
      console.log('🔄 Disciplines: Syncing frequencies with calendar visits:', scheduledVisits.length);
      
      setDisciplines(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        
        Object.keys(updated).forEach(disciplineType => {
          if (updated[disciplineType].isActive) {
            const calculatedFrequency = calculateFrequencyFromVisits(disciplineType, scheduledVisits);
            
            // Solo actualizar si la frecuencia calculada es diferente y no está vacía
            if (calculatedFrequency && calculatedFrequency !== updated[disciplineType].frequency) {
              console.log(`📊 ${disciplineType}: Auto-calculated frequency: ${calculatedFrequency}`);
              updated[disciplineType] = {
                ...updated[disciplineType],
                frequency: calculatedFrequency
              };
              hasChanges = true;
            }
          }
        });
        
        // Sincronizar cambios con otros componentes si hay cambios
        if (hasChanges) {
          syncWithOtherComponents({
            type: 'frequency_auto_calculated',
            disciplines: updated
          });
          
          // Notificar al componente padre
          if (onUpdateDisciplines) {
            setTimeout(() => {
              onUpdateDisciplines(updated);
            }, 0);
          }
        }
        
        return hasChanges ? updated : prev;
      });
    }
  }, [scheduledVisits, isInitialized]); // Se ejecuta cuando cambian las visitas del calendario
  
  // TODAS LAS FUNCIONES DE MANEJO - SIN VERIFICACIÓN AUTOMÁTICA
  
  // Filter therapists by type
  const getTherapistsByType = (type) => {
    return allStaff.filter(staff => 
      staff.role && staff.role.toLowerCase() === type.toLowerCase()
    );
  };
  
  // Filter assistants by type
  const getAssistantsByType = (type) => {
    let assistantType;
    switch (type) {
      case 'PT':
        assistantType = 'pta';
        break;
      case 'OT':
        assistantType = 'cota';
        break;
      case 'ST':
        assistantType = 'sta';
        break;
      default:
        return [];
    }
    
    return allStaff.filter(staff => 
      staff.role && staff.role.toLowerCase() === assistantType
    );
  };

  // Assign staff to patient via API
  const assignStaffToPatient = async (staffId, patientId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assign-staff?patient_id=${patientId}&staff_id=${staffId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to assign staff: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Staff assigned successfully:', result);
      return result;
    } catch (error) {
      console.error('Error assigning staff:', error);
      throw error;
    }
  };

  // Unassign staff from patient via API
  const unassignStaffFromPatient = async (patientId, staffRole) => {
    try {
      const response = await fetch(`${API_BASE_URL}/unassign-staff?patient_id=${patientId}&staff_role=${staffRole}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to unassign staff: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Staff unassigned successfully:', result);
      return result;
    } catch (error) {
      console.error('Error unassigning staff:', error);
      throw error;
    }
  };

  // Update required disciplines in patient - CORREGIDO
  const updatePatientDisciplines = async (patientId, activeDisciplines) => {
    try {
      console.log('Updating patient disciplines. Active disciplines:', activeDisciplines);
      
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          required_disciplines: JSON.stringify(activeDisciplines) // CORREGIDO: Ya es un array
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update patient disciplines: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Patient disciplines updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating patient disciplines:', error);
      throw error;
    }
  };

  // Toggle discipline active status - CORREGIDO Y MEJORADO
  const handleToggleDiscipline = async (type, explicitActiveState = null) => {
    console.log(`[handleToggleDiscipline] Toggling ${type} discipline. Explicit state: ${explicitActiveState}`);
    
    const currentDiscipline = disciplines[type];
    let newActiveState = explicitActiveState !== null ? explicitActiveState : !currentDiscipline.isActive;
    
    let updatedDisciplines = { ...disciplines };

    if (!newActiveState) {
      // If deactivating, clear therapist and assistant
      updatedDisciplines = {
        ...updatedDisciplines,
        [type]: {
          ...updatedDisciplines[type],
          isActive: false,
          therapist: null,
          assistant: null
        }
      };
      console.log(`[handleToggleDiscipline] Deactivating ${type}. Clearing staff.`);
    } else {
      // If activating, set isActive to true
      updatedDisciplines = {
        ...updatedDisciplines,
        [type]: {
          ...updatedDisciplines[type],
          isActive: true
        }
      };
      console.log(`[handleToggleDiscipline] Activating ${type}.`);
    }

    setDisciplines(updatedDisciplines);

    // Always update required_disciplines in the backend
    const activeDisciplines = Object.keys(updatedDisciplines)
      .filter(key => updatedDisciplines[key].isActive);
    
    console.log('[handleToggleDiscipline] Active disciplines to save:', activeDisciplines);
    
    if (patient?.id) {
      try {
        await updatePatientDisciplines(patient.id, activeDisciplines);
        console.log(`[handleToggleDiscipline] Successfully updated patient disciplines for ${type}.`);
      } catch (err) {
        console.error(`[handleToggleDiscipline] Error updating patient disciplines for ${type}:`, err);
        setError(`Failed to update discipline status: ${err.message}`);
      }
    }
    
    // Notify parent component of the change - usando setTimeout para evitar warning de React  
    if (onUpdateDisciplines) {
      setTimeout(() => {
        onUpdateDisciplines(updatedDisciplines);
      }, 0);
    }
  };

  // Change therapist
  const handleChangeTherapist = async (type, therapist) => {
    console.log(`[handleChangeTherapist] Updating ${type} therapist:`, therapist);
    
    try {
      if (therapist && patient?.id) {
        console.log(`[handleChangeTherapist] Assigning therapist ${therapist.name} (ID: ${therapist.id}) to patient ${patient.id}`);
        const result = await assignStaffToPatient(therapist.id, patient.id);
        console.log('[handleChangeTherapist] Assignment result:', result);
        
        // Update assignedStaff with the API response
        setAssignedStaff(prevAssigned => {
          const updated = prevAssigned ? [...prevAssigned] : [];
          // Remove assignment if role already exists and add new one
          const filteredUpdated = updated.filter(a => a.assigned_role.toUpperCase() !== type.toUpperCase());
          filteredUpdated.push(result);
          console.log('[handleChangeTherapist] Updated assigned staff state:', filteredUpdated);
          return filteredUpdated;
        });
      } else if (!therapist && patient?.id) {
        console.log(`[handleChangeTherapist] Unassigning ${type} therapist from patient ${patient.id}.`);
        await unassignStaffFromPatient(patient.id, type);
        
        setAssignedStaff(prevAssigned => {
          const updated = prevAssigned ? [...prevAssigned] : [];
          const filteredUpdated = updated.filter(a => a.assigned_role.toUpperCase() !== type.toUpperCase());
          return filteredUpdated;
        });
      }
      
      setDisciplines(prevDisciplines => {
        const updatedDisciplines = {
          ...prevDisciplines,
          [type]: {
            ...prevDisciplines[type],
            therapist: therapist || null,
            isActive: (therapist || prevDisciplines[type].assistant) ? true : false
          }
        };
        
        const activeDisciplines = Object.keys(updatedDisciplines)
          .filter(key => updatedDisciplines[key].isActive);
        
        if (patient?.id) {
          updatePatientDisciplines(patient.id, activeDisciplines);
        }
        
        if (onUpdateDisciplines) {
          setTimeout(() => {
            onUpdateDisciplines(updatedDisciplines);
          }, 0);
        }
        
        return updatedDisciplines;
      });
      
    } catch (error) {
      console.error('[handleChangeTherapist] Error updating therapist:', error);
      setError(`Failed to assign ${therapist?.name || 'therapist'}: ${error.message}`);
    }
  };

  // Change assistant
  const handleChangeAssistant = async (type, assistant) => {
    console.log(`[handleChangeAssistant] Updating ${type} assistant:`, assistant);
    const assistantRole = type === 'PT' ? 'PTA' : type === 'OT' ? 'COTA' : 'STA';
    
    try {
      if (assistant && patient?.id) {
        console.log(`[handleChangeAssistant] Assigning assistant ${assistant.name} (ID: ${assistant.id}) to patient ${patient.id}`);
        const result = await assignStaffToPatient(assistant.id, patient.id);
        console.log('[handleChangeAssistant] Assignment result:', result);
        
        // Update assignedStaff with the API response
        setAssignedStaff(prevAssigned => {
          const updated = prevAssigned ? [...prevAssigned] : [];
          // Remove assignment if role already exists and add new one
          const filteredUpdated = updated.filter(a => a.assigned_role.toUpperCase() !== assistantRole.toUpperCase());
          filteredUpdated.push(result);
          console.log('[handleChangeAssistant] Updated assigned staff state:', filteredUpdated);
          return filteredUpdated;
        });
      } else if (!assistant && patient?.id) {
        console.log(`[handleChangeAssistant] Unassigning ${assistantRole} assistant from patient ${patient.id}.`);
        await unassignStaffFromPatient(patient.id, assistantRole);
        
        setAssignedStaff(prevAssigned => {
          const updated = prevAssigned ? [...prevAssigned] : [];
          const filteredUpdated = updated.filter(a => a.assigned_role.toUpperCase() !== assistantRole.toUpperCase());
          return filteredUpdated;
        });
      }
      
      setDisciplines(prevDisciplines => {
        const updatedDisciplines = {
          ...prevDisciplines,
          [type]: {
            ...prevDisciplines[type],
            assistant: assistant || null,
            isActive: (assistant || prevDisciplines[type].therapist) ? true : false
          }
        };
        
        const activeDisciplines = Object.keys(updatedDisciplines)
          .filter(key => updatedDisciplines[key].isActive);
        
        if (patient?.id) {
          updatePatientDisciplines(patient.id, activeDisciplines);
        }
        
        if (onUpdateDisciplines) {
          setTimeout(() => {
            onUpdateDisciplines(updatedDisciplines);
          }, 0);
        }
        
        return updatedDisciplines;
      });
      
    } catch (error) {
      console.error('[handleChangeAssistant] Error updating assistant:', error);
      setError(`Failed to assign ${assistant?.name || 'assistant'}: ${error.message}`);
    }
  };

  // Change frequency - MEJORADO CON SINCRONIZACIÓN
  const handleChangeFrequency = async (type, frequency) => {
    console.log(`🔄 Updating ${type} frequency to: ${frequency}`);
    
    setDisciplines(prevDisciplines => {
      const updatedDisciplines = {
        ...prevDisciplines,
        [type]: {
          ...prevDisciplines[type],
          frequency
        }
      };
      
      // NUEVO: Guardar en localStorage
      saveDisciplinesToLocal(updatedDisciplines);
      
      // NUEVO: Sincronizar cambios con otros componentes
      syncWithOtherComponents({
        type: 'frequency_manually_changed',
        discipline: type,
        frequency: frequency,
        disciplines: updatedDisciplines
      });
      
      if (onUpdateDisciplines) {
        setTimeout(() => {
          onUpdateDisciplines(updatedDisciplines);
        }, 0);
      }
      
      return updatedDisciplines;
    });
  };

  

  // Generate cards for each discipline type
  const disciplineCards = [
    {
      type: 'PT',
      label: 'Physical Therapist',
      assistantLabel: 'Physical Therapist Assistant',
      data: disciplines.PT
    },
    {
      type: 'OT',
      label: 'Occupational Therapist',
      assistantLabel: 'Certified Occupational Therapy Assistant',
      data: disciplines.OT
    },
    {
      type: 'ST',
      label: 'Speech Therapist',
      assistantLabel: 'Speech-Language Pathology Assistant',
      data: disciplines.ST
    }
  ];

  // Loading state - MEJORADO
  if (isLoading || assignedStaff === null) {
    return (
      <div className="disciplines-component">
        <div className="card-header">
          <div className="header-title">
            <div className="header-icon-wrapper">
              <i className="fas fa-user-md"></i>
              <div className="icon-glow"></div>
            </div>
            <h3>Therapy Disciplines</h3>
          </div>
        </div>
        
        <div className="card-body">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading therapy staff and assignments...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="disciplines-component">
        <div className="card-header">
          <div className="header-title">
            <div className="header-icon-wrapper">
              <i className="fas fa-user-md"></i>
              <div className="icon-glow"></div>
            </div>
            <h3>Therapy Disciplines</h3>
          </div>
        </div>
        
        <div className="card-body">
          <div className="error-message" style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            <span>Error: {error}</span>
            <button 
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              style={{
                marginLeft: '10px',
                padding: '5px 10px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="disciplines-component">
      <div className="card-header">
        <div className="header-title">
          <div className="header-icon-wrapper">
            <i className="fas fa-user-md"></i>
            <div className="icon-glow"></div>
          </div>
          <h3>Therapy Disciplines</h3>
        </div>
        <div className="header-decoration"></div>
      </div>
      
      <div className="card-body">
        {/* Mostrar información si no hay staff */}
        {allStaff.length === 0 && !isLoading && (
          <div style={{ 
            backgroundColor: '#fef3c7', 
            border: '1px solid #fbbf24', 
            color: '#92400e', 
            padding: '10px', 
            borderRadius: '6px', 
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i>
            No staff members found. Please ensure staff data is available in the system.
          </div>
        )}
        
        {/* Mostrar mensaje de éxito temporal */}
        {error && error.includes('successfully') && (
          <div style={{ 
            backgroundColor: '#d1fae5', 
            border: '1px solid #10b981', 
            color: '#065f46', 
            padding: '10px', 
            borderRadius: '6px', 
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            <i className="fas fa-check-circle" style={{ marginRight: '6px' }}></i>
            {error}
          </div>
        )}
        
        <div className="disciplines-list">
          {disciplineCards.map((card) => {
            const approvedLimit = getApprovedVisitsLimit(card.type);
            
            return (
              <div key={card.type} style={{ position: 'relative' }}>
                {/* Indicador de límite de visitas aprobadas */}
                {approvedLimit && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                  }}>
                    📋 {approvedLimit} visits approved
                  </div>
                )}
                
                <DisciplineCard
                  disciplineType={card.type}
                  disciplineLabel={card.label}
                  assistantLabel={card.assistantLabel}
                  therapist={card.data.therapist}
                  assistant={card.data.assistant}
                  frequency={card.data.frequency}
                  isActive={card.data.isActive}
                  onToggle={() => handleToggleDiscipline(card.type)}
                  onChangeTherapist={(therapist) => handleChangeTherapist(card.type, therapist)}
                  onChangeAssistant={(assistant) => handleChangeAssistant(card.type, assistant)}
                  onChangeFrequency={(frequency) => handleChangeFrequency(card.type, frequency)}
                  therapistsList={getTherapistsByType(card.type)}
                  assistantsList={getAssistantsByType(card.type)}
                  // NUEVOS PROPS PARA SINCRONIZACIÓN
                  scheduledVisits={scheduledVisits}
                  approvedVisitsLimit={approvedLimit}
                />
              </div>
            );
          })}
        </div>
        
        {/* Información adicional y sincronización */}
        <div className="disciplines-info">
          {/* Panel de sincronización */}
          {(scheduledVisits.length > 0 || approvedVisits) && (
            <div style={{
              backgroundColor: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              border: '1px solid #10b981',
              color: '#065f46',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '13px',
              marginTop: '15px',
              marginBottom: '15px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <i className="fas fa-sync-alt" style={{ color: '#10b981' }}></i>
                <strong>Live Synchronization Active</strong>
              </div>
              <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
                {scheduledVisits.length > 0 && (
                  <li>✅ <strong>Frequencies</strong> auto-calculate from {scheduledVisits.length} calendar visits</li>
                )}
                {approvedVisits && (
                  <li>✅ <strong>Visit limits</strong> sync with Medical Info component</li>
                )}
                <li>✅ Manual frequency changes <strong>override auto-calculation</strong></li>
                <li>✅ All changes <strong>sync instantly</strong> with Calendar and Medical Info</li>
              </ul>
            </div>
          )}
          
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #0ea5e9',
            color: '#0c4a6e',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '13px'
          }}>
            <i className="fas fa-lightbulb" style={{ marginRight: '6px' }}></i>
            <strong>Tip:</strong> Frequencies update automatically as you add visits to the calendar. 
            You can manually override them by editing the frequency field.
          </div>
        </div>
        
        <div className="component-decoration">
          <div className="glass-orb top-left"></div>
          <div className="glass-orb bottom-right"></div>
        </div>
      </div>
    </div>
  );
};

export default DisciplinesComponent;