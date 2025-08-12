import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/VitalsSkillsSection.scss';

const VitalsSkillsSection = ({ data, onChange, sectionId, config }) => {
  // Rangos normales de signos vitales para referencia visual
  const vitalRanges = {
    heartRate: { min: 60, max: 100, unit: 'bpm' },
    systolic: { min: 90, max: 120, unit: 'mmHg' },
    diastolic: { min: 60, max: 80, unit: 'mmHg' },
    respirations: { min: 12, max: 20, unit: 'rpm' },
    o2Saturation: { min: 95, max: 100, unit: '%' },
    temperature: { min: 97.8, max: 99.1, unit: '°F' }
  };

  // Función para determinar si un valor está en rango normal
  const getVitalStatus = (value, type) => {
    if (!value || value === '') return 'empty';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'invalid';
    
    const range = vitalRanges[type];
    if (!range) return 'normal';
    
    if (numValue < range.min) return 'low';
    if (numValue > range.max) return 'high';
    return 'normal';
  };

  // Función para determinar el color del indicador
  const getStatusColor = (status) => {
    switch(status) {
      case 'low': return '#3b82f6'; // Azul para valores bajos
      case 'high': return '#ef4444'; // Rojo para valores altos
      case 'normal': return '#10b981'; // Verde para normal
      case 'invalid': return '#f59e0b'; // Naranja para inválido
      default: return '#94a3b8'; // Gris para vacío
    }
  };

  // Manejar cambios en signos vitales en reposo
  const handleAtRestChange = (field, value) => {
    const updatedData = {
      ...data,
      atRest: {
        ...data?.atRest,
        [field]: value
      }
    };
    onChange(updatedData);
  };

  // Manejar cambios en signos vitales después del esfuerzo
  const handleAfterExertionChange = (field, value) => {
    const updatedData = {
      ...data,
      afterExertion: {
        ...data?.afterExertion,
        [field]: value
      }
    };
    onChange(updatedData);
  };

  // Calcular cambio porcentual entre reposo y esfuerzo
  const calculateChange = (atRestValue, afterExertionValue) => {
    const rest = parseFloat(atRestValue);
    const exertion = parseFloat(afterExertionValue);
    
    if (isNaN(rest) || isNaN(exertion) || rest === 0) return null;
    
    const change = ((exertion - rest) / rest) * 100;
    return change.toFixed(1);
  };

  // Renderizar campo de signo vital
  const renderVitalField = (label, field, value, onChange, unit, type, showTrend = false) => {
    const status = getVitalStatus(value, type);
    const statusColor = getStatusColor(status);
    
    // Para presión arterial, manejar sistólica y diastólica
    if (field === 'bloodPressure') {
      const systolic = value?.systolic || '';
      const diastolic = value?.diastolic || '';
      const systolicStatus = getVitalStatus(systolic, 'systolic');
      const diastolicStatus = getVitalStatus(diastolic, 'diastolic');
      
      return (
        <div className="vital-field blood-pressure">
          <div className="field-header">
            <label className="field-label">
              <i className="fas fa-heart"></i>
              {label}
            </label>
            <div className="field-unit">mmHg</div>
          </div>
          <div className="bp-inputs">
            <div className="bp-input-group">
              <input
                type="number"
                value={systolic}
                onChange={(e) => onChange('bloodPressure', { 
                  systolic: e.target.value, 
                  diastolic: value?.diastolic || '' 
                })}
                placeholder="Sys"
                className={`vital-input ${systolicStatus}`}
                min="60"
                max="200"
              />
              <div className={`status-indicator ${systolicStatus}`} 
                   style={{ backgroundColor: getStatusColor(systolicStatus) }}>
                {systolic && (
                  <span className="status-tooltip">
                    {systolicStatus === 'normal' ? 'Normal' : 
                     systolicStatus === 'high' ? 'High' : 
                     systolicStatus === 'low' ? 'Low' : ''}
                  </span>
                )}
              </div>
            </div>
            
            <span className="bp-separator">/</span>
            
            <div className="bp-input-group">
              <input
                type="number"
                value={diastolic}
                onChange={(e) => onChange('bloodPressure', { 
                  systolic: value?.systolic || '', 
                  diastolic: e.target.value 
                })}
                placeholder="Dia"
                className={`vital-input ${diastolicStatus}`}
                min="40"
                max="130"
              />
              <div className={`status-indicator ${diastolicStatus}`}
                   style={{ backgroundColor: getStatusColor(diastolicStatus) }}>
                {diastolic && (
                  <span className="status-tooltip">
                    {diastolicStatus === 'normal' ? 'Normal' : 
                     diastolicStatus === 'high' ? 'High' : 
                     diastolicStatus === 'low' ? 'Low' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
          {showTrend && data?.atRest?.bloodPressure?.systolic && systolic && (
            <div className="change-indicator">
              {(() => {
                const change = calculateChange(data.atRest.bloodPressure.systolic, systolic);
                if (!change) return null;
                const isIncrease = parseFloat(change) > 0;
                return (
                  <>
                    <i className={`fas fa-arrow-${isIncrease ? 'up' : 'down'}`}
                       style={{ color: isIncrease ? '#ef4444' : '#3b82f6' }}></i>
                    <span>{Math.abs(change)}%</span>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      );
    }

    // Para otros signos vitales
    return (
      <div className={`vital-field ${field}`}>
        <div className="field-header">
          <label className="field-label">
            <i className={getIconForVital(field)}></i>
            {label}
          </label>
          <div className="field-unit">{unit}</div>
        </div>
        <div className="input-wrapper">
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
            className={`vital-input ${status}`}
            step={field === 'temperature' ? '0.1' : '1'}
            min={getMinValue(field)}
            max={getMaxValue(field)}
          />
          <div className={`status-indicator ${status}`}
               style={{ backgroundColor: statusColor }}>
            {value && status !== 'empty' && (
              <span className="status-tooltip">
                {status === 'normal' ? 'Normal' : 
                 status === 'high' ? 'High' : 
                 status === 'low' ? 'Low' :
                 status === 'invalid' ? 'Invalid value' : ''}
              </span>
            )}
          </div>
          {showTrend && data?.atRest?.[field] && value && (
            <div className="change-indicator">
              {(() => {
                const change = calculateChange(data.atRest[field], value);
                if (!change) return null;
                const isIncrease = parseFloat(change) > 0;
                return (
                  <>
                    <i className={`fas fa-arrow-${isIncrease ? 'up' : 'down'}`}
                       style={{ color: isIncrease ? '#ef4444' : '#3b82f6' }}></i>
                    <span>{Math.abs(change)}%</span>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Obtener icono para cada signo vital
  const getIconForVital = (field) => {
    const icons = {
      heartRate: 'fas fa-heartbeat',
      respirations: 'fas fa-lungs',
      o2Saturation: 'fas fa-percentage',
      temperature: 'fas fa-thermometer-half',
      vitalsAdditional: 'fas fa-notes-medical'
    };
    return icons[field] || 'fas fa-clipboard';
  };

  // Obtener valores mínimos y máximos para validación
  const getMinValue = (field) => {
    const mins = {
      heartRate: 30,
      respirations: 5,
      o2Saturation: 70,
      temperature: 95
    };
    return mins[field] || 0;
  };

  const getMaxValue = (field) => {
    const maxs = {
      heartRate: 200,
      respirations: 60,
      o2Saturation: 100,
      temperature: 105
    };
    return maxs[field] || 999;
  };

  return (
    <div className="vitals-skills-section">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-heartbeat"></i>
          <h2>Vital Signs</h2>
        </div>
        <div className="section-description">
          <p>Complete vital signs assessment at rest and after exertion</p>
        </div>
      </div>

      <div className="vitals-reference-card">
        <div className="reference-header">
          <i className="fas fa-info-circle"></i>
          <h3>Normal Reference Ranges</h3>
        </div>
        <div className="reference-grid">
          <div className="reference-item">
            <span className="ref-label">HR:</span>
            <span className="ref-value">60-100 bpm</span>
          </div>
          <div className="reference-item">
            <span className="ref-label">BP:</span>
            <span className="ref-value">90-120/60-80 mmHg</span>
          </div>
          <div className="reference-item">
            <span className="ref-label">RR:</span>
            <span className="ref-value">12-20 rpm</span>
          </div>
          <div className="reference-item">
            <span className="ref-label">O2 Sat:</span>
            <span className="ref-value">95-100%</span>
          </div>
          <div className="reference-item">
            <span className="ref-label">Temp:</span>
            <span className="ref-value">97.8-99.1°F</span>
          </div>
        </div>
      </div>

      <div className="vitals-container">
        {/* Signos Vitales en Reposo */}
        <div className="vitals-section at-rest">
          <div className="section-header-card">
            <div className="header-content">
              <div className="header-icon">
                <i className="fas fa-bed"></i>
              </div>
              <div className="header-text">
                <h3>At Rest</h3>
                <p>Baseline vital signs assessment</p>
              </div>
            </div>
          </div>

          <div className="vitals-grid">
            {renderVitalField(
              'Heart Rate',
              'heartRate',
              data?.atRest?.heartRate,
              handleAtRestChange,
              'bpm',
              'heartRate'
            )}
            
            {renderVitalField(
              'Blood Pressure',
              'bloodPressure',
              data?.atRest?.bloodPressure,
              handleAtRestChange,
              'mmHg',
              'bloodPressure'
            )}
            
            {renderVitalField(
              'Respirations',
              'respirations',
              data?.atRest?.respirations,
              handleAtRestChange,
              'rpm',
              'respirations'
            )}
            
            {renderVitalField(
              'O2 Saturation',
              'o2Saturation',
              data?.atRest?.o2Saturation,
              handleAtRestChange,
              '%',
              'o2Saturation'
            )}
            
            {renderVitalField(
              'Temperature',
              'temperature',
              data?.atRest?.temperature,
              handleAtRestChange,
              '°F',
              'temperature'
            )}
          </div>

          <div className="vitals-additional">
            <label className="additional-label">
              <i className="fas fa-notes-medical"></i>
              Additional Observations
            </label>
            <textarea
              value={data?.atRest?.vitalsAdditional || ''}
              onChange={(e) => handleAtRestChange('vitalsAdditional', e.target.value)}
              placeholder="Enter additional observations about vital signs at rest..."
              className="additional-textarea"
              rows="3"
            />
          </div>
        </div>

        {/* Signos Vitales Después del Esfuerzo */}
        <div className="vitals-section after-exertion">
          <div className="section-header-card">
            <div className="header-content">
              <div className="header-icon">
                <i className="fas fa-running"></i>
              </div>
              <div className="header-text">
                <h3>After Exertion</h3>
                <p>Cardiovascular response to exercise</p>
              </div>
            </div>
          </div>

          <div className="vitals-grid">
            {renderVitalField(
              'Heart Rate',
              'heartRate',
              data?.afterExertion?.heartRate,
              handleAfterExertionChange,
              'bpm',
              'heartRate',
              true
            )}
            
            {renderVitalField(
              'Blood Pressure',
              'bloodPressure',
              data?.afterExertion?.bloodPressure,
              handleAfterExertionChange,
              'mmHg',
              'bloodPressure',
              true
            )}
            
            {renderVitalField(
              'Respirations',
              'respirations',
              data?.afterExertion?.respirations,
              handleAfterExertionChange,
              'rpm',
              'respirations',
              true
            )}
            
            {renderVitalField(
              'O2 Saturation',
              'o2Saturation',
              data?.afterExertion?.o2Saturation,
              handleAfterExertionChange,
              '%',
              'o2Saturation',
              true
            )}
          </div>
        </div>
      </div>

      {/* Resumen de Cambios */}
      <div className="vitals-summary">
        <div className="summary-header">
          <i className="fas fa-chart-line"></i>
          <h3>Exertional Response Summary</h3>
        </div>
        
        <div className="summary-grid">
          {data?.atRest?.heartRate && data?.afterExertion?.heartRate && (
            <div className="summary-item">
              <span className="summary-label">ΔHR:</span>
              <span className="summary-value">
                {parseInt(data.afterExertion.heartRate) - parseInt(data.atRest.heartRate)} bpm
              </span>
            </div>
          )}
          
          {data?.atRest?.bloodPressure?.systolic && data?.afterExertion?.bloodPressure?.systolic && (
            <div className="summary-item">
              <span className="summary-label">ΔSystolic BP:</span>
              <span className="summary-value">
                {parseInt(data.afterExertion.bloodPressure.systolic) - parseInt(data.atRest.bloodPressure.systolic)} mmHg
              </span>
            </div>
          )}
          
          {data?.atRest?.respirations && data?.afterExertion?.respirations && (
            <div className="summary-item">
              <span className="summary-label">ΔRR:</span>
              <span className="summary-value">
                {parseInt(data.afterExertion.respirations) - parseInt(data.atRest.respirations)} rpm
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VitalsSkillsSection;