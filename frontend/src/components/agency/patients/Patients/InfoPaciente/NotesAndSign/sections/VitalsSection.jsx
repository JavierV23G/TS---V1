import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/VitalsSection.scss';

const VitalsSection = ({ data, onChange, sectionId, config }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  return (
    <div className="vitals-section">
      <div className="section-title">
        <h2>Vitals</h2>
      </div>
      
      <div className="vitals-layout">
        {/* Sección de signos vitales en reposo */}
        <div className="vitals-section at-rest">
          <div className="vitals-header">
            <div className="title-with-icon">
              <i className="fas fa-heart-pulse"></i>
              <h3>At Rest</h3>
            </div>
            <div className="info-badge">Baseline</div>
          </div>
          
          <div className="vitals-grid">
            <div className="vital-card">
              <label>Heart Rate</label>
              <div className="input-field">
                <input 
                  type="number" 
                  value={data?.restHeartRate || ''} 
                  onChange={(e) => handleChange('restHeartRate', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="300"
                />
                <span className="unit">bpm</span>
              </div>
            </div>
            
            <div className="vital-card wide">
              <label>Blood Pressure</label>
              <div className="bp-field">
                <input 
                  type="number" 
                  value={data?.restSystolic || ''} 
                  onChange={(e) => handleChange('restSystolic', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="300"
                />
                <span className="bp-divider">/</span>
                <input 
                  type="number" 
                  value={data?.restDiastolic || ''} 
                  onChange={(e) => handleChange('restDiastolic', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="300"
                />
                <span className="unit">mmHg</span>
              </div>
            </div>
            
            <div className="vital-card">
              <label>Respirations</label>
              <div className="input-field">
                <input 
                  type="number" 
                  value={data?.restRespirations || ''} 
                  onChange={(e) => handleChange('restRespirations', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                />
                <span className="unit">breaths/min</span>
              </div>
            </div>
            
            <div className="vital-card">
              <label>O<sub>2</sub> Saturation</label>
              <div className="input-field">
                <input 
                  type="number" 
                  value={data?.restO2Saturation || ''} 
                  onChange={(e) => handleChange('restO2Saturation', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                />
                <span className="unit">%</span>
              </div>
            </div>
            
            <div className="vital-card">
              <label>Temperature</label>
              <div className="input-field">
                <input 
                  type="number" 
                  value={data?.temperature || ''} 
                  onChange={(e) => handleChange('temperature', e.target.value)}
                  placeholder="0"
                  step="0.1"
                  min="90"
                  max="110"
                />
                <span className="unit">°F</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sección de signos vitales después del ejercicio */}
        <div className="vitals-section after-exertion">
          <div className="vitals-header">
            <div className="title-with-icon">
              <i className="fas fa-person-running"></i>
              <h3>After Exertion</h3>
            </div>
            <div className="info-badge">Activity Response</div>
          </div>
          
          <div className="vitals-grid">
            <div className="vital-card">
              <label>Heart Rate</label>
              <div className="input-field">
                <input 
                  type="number" 
                  value={data?.exertionHeartRate || ''} 
                  onChange={(e) => handleChange('exertionHeartRate', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="300"
                />
                <span className="unit">bpm</span>
              </div>
            </div>
            
            <div className="vital-card wide">
              <label>Blood Pressure</label>
              <div className="bp-field">
                <input 
                  type="number" 
                  value={data?.exertionSystolic || ''} 
                  onChange={(e) => handleChange('exertionSystolic', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="300"
                />
                <span className="bp-divider">/</span>
                <input 
                  type="number" 
                  value={data?.exertionDiastolic || ''} 
                  onChange={(e) => handleChange('exertionDiastolic', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="300"
                />
                <span className="unit">mmHg</span>
              </div>
            </div>
            
            <div className="vital-card">
              <label>Respirations</label>
              <div className="input-field">
                <input 
                  type="number" 
                  value={data?.exertionRespirations || ''} 
                  onChange={(e) => handleChange('exertionRespirations', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                />
                <span className="unit">breaths/min</span>
              </div>
            </div>
            
            <div className="vital-card">
              <label>O<sub>2</sub> Saturation</label>
              <div className="input-field">
                <input 
                  type="number" 
                  value={data?.exertionO2Saturation || ''} 
                  onChange={(e) => handleChange('exertionO2Saturation', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                />
                <span className="unit">%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sección de análisis de signos vitales */}
        <div className="vitals-analytics-section">
          <div className="vitals-summary-card">
            <div className="card-header">
              <h4>Vital Signs Analysis</h4>
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="vital-comparison">
              <div className="comparison-item">
                <div className="label">
                  <i className="fas fa-heartbeat"></i>
                  Heart Rate Δ:
                </div>
                <div className="value">{
                  data?.restHeartRate && data?.exertionHeartRate 
                  ? `+${Math.max(0, data.exertionHeartRate - data.restHeartRate)} bpm` 
                  : 'N/A'
                }</div>
              </div>
              <div className="comparison-item">
                <div className="label">
                  <i className="fas fa-stethoscope"></i>
                  Blood Pressure Δ:
                </div>
                <div className="value">{
                  data?.restSystolic && data?.exertionSystolic 
                  ? `+${Math.max(0, data.exertionSystolic - data.restSystolic)}/${Math.max(0, data.exertionDiastolic - data.restDiastolic)} mmHg` 
                  : 'N/A'
                }</div>
              </div>
              <div className="comparison-item">
                <div className="label">
                  <i className="fas fa-lungs"></i>
                  O<sub>2</sub> Saturation Δ:
                </div>
                <div className={`value ${
                  data?.restO2Saturation && data?.exertionO2Saturation && (data.exertionO2Saturation - data.restO2Saturation < -3) 
                  ? 'negative' : ''}`
                }>{
                  data?.restO2Saturation && data?.exertionO2Saturation 
                  ? `${data.exertionO2Saturation - data.restO2Saturation > 0 ? '+' : ''}${data.exertionO2Saturation - data.restO2Saturation}%` 
                  : 'N/A'
                }</div>
              </div>
            </div>
            <div className="vital-status">
              <div className="checkbox-alert">
                <input 
                  type="checkbox" 
                  id="vitalsOutOfParameters" 
                  checked={data?.vitalsOutOfParameters || false}
                  onChange={(e) => handleChange('vitalsOutOfParameters', e.target.checked)}
                />
                <label htmlFor="vitalsOutOfParameters">
                  <i className="fas fa-triangle-exclamation"></i>
                  Vitals Out of Parameters
                </label>
              </div>
            </div>
          </div>
          
          <div className="vitals-notes-card">
            <div className="card-header">
              <h4>Additional Notes</h4>
              <i className="fas fa-clipboard-list"></i>
            </div>
            <textarea 
              value={data?.vitalsAdditional || ''}
              onChange={(e) => handleChange('vitalsAdditional', e.target.value)}
              placeholder="Enter additional vitals information or observations..."
              rows={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitalsSection;