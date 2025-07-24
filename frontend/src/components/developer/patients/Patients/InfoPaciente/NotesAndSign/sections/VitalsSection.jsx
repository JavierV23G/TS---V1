import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/VitalsSection.scss';

const VitalsSection = ({ data, onChange, sectionId, config }) => {
  // Helper to handle nested field changes
  const handleNestedChange = (section, field, value) => {
    const updatedData = {
      ...data,
      [section]: {
        ...data?.[section],
        [field]: value
      }
    };
    onChange(updatedData);
  };

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
        {/* AT REST Section */}
        <div className="vitals-section at-rest">
          <div className="vitals-header">
            <div className="title-with-icon">
              <i className="fas fa-heart-pulse"></i>
              <h3>AT REST</h3>
            </div>
            <div className="info-badge">Baseline</div>
          </div>
          
          <div className="vitals-grid">
            <div className="vital-card">
              <label>Heart Rate</label>
              <div className="input-field">
                <input 
                  type="number" 
                  value={data?.at_rest?.heart_rate || ''} 
                  onChange={(e) => handleNestedChange('at_rest', 'heart_rate', e.target.value)}
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
                  value={data?.at_rest?.blood_pressure_systolic || ''} 
                  onChange={(e) => handleNestedChange('at_rest', 'blood_pressure_systolic', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="300"
                />
                <span className="bp-divider">/</span>
                <input 
                  type="number" 
                  value={data?.at_rest?.blood_pressure_diastolic || ''} 
                  onChange={(e) => handleNestedChange('at_rest', 'blood_pressure_diastolic', e.target.value)}
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
                  value={data?.at_rest?.respirations || ''} 
                  onChange={(e) => handleNestedChange('at_rest', 'respirations', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                />
                <span className="unit">breaths/min</span>
              </div>
            </div>
            
            <div className="vital-card">
              <label>O₂ Saturation</label>
              <div className="input-field">
                <input 
                  type="number" 
                  value={data?.at_rest?.o2_saturation || ''} 
                  onChange={(e) => handleNestedChange('at_rest', 'o2_saturation', e.target.value)}
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
                  value={data?.at_rest?.temperature || ''} 
                  onChange={(e) => handleNestedChange('at_rest', 'temperature', e.target.value)}
                  placeholder="0"
                  step="0.1"
                  min="90"
                  max="110"
                />
                <span className="unit">°C</span>
              </div>
            </div>
          </div>
          
          {/* Additional Notes for AT REST */}
          <div className="vitals-notes">
            <label>Vitals Additional Notes</label>
            <textarea 
              value={data?.at_rest?.vitals_additional || ''}
              onChange={(e) => handleNestedChange('at_rest', 'vitals_additional', e.target.value)}
              placeholder="Enter additional vitals information..."
              rows={3}
            />
          </div>
        </div>
        
        {/* AFTER EXERTION Section */}
        <div className="vitals-section after-exertion">
          <div className="vitals-header">
            <div className="title-with-icon">
              <i className="fas fa-person-running"></i>
              <h3>AFTER EXERTION</h3>
            </div>
            <div className="info-badge">Activity Response</div>
          </div>
          
          <div className="vitals-grid">
            <div className="vital-card">
              <label>Heart Rate</label>
              <div className="input-field">
                <input 
                  type="number" 
                  value={data?.after_exertion?.heart_rate || ''} 
                  onChange={(e) => handleNestedChange('after_exertion', 'heart_rate', e.target.value)}
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
                  value={data?.after_exertion?.blood_pressure_systolic || ''} 
                  onChange={(e) => handleNestedChange('after_exertion', 'blood_pressure_systolic', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="300"
                />
                <span className="bp-divider">/</span>
                <input 
                  type="number" 
                  value={data?.after_exertion?.blood_pressure_diastolic || ''} 
                  onChange={(e) => handleNestedChange('after_exertion', 'blood_pressure_diastolic', e.target.value)}
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
                  value={data?.after_exertion?.respirations || ''} 
                  onChange={(e) => handleNestedChange('after_exertion', 'respirations', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                />
                <span className="unit">breaths/min</span>
              </div>
            </div>
            
            <div className="vital-card">
              <label>O₂ Saturation</label>
              <div className="input-field">
                <input 
                  type="number" 
                  value={data?.after_exertion?.o2_saturation || ''} 
                  onChange={(e) => handleNestedChange('after_exertion', 'o2_saturation', e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                />
                <span className="unit">%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Vitals Out of Parameters Checkbox */}
        <div className="vitals-checkbox-section">
          <div className="checkbox-alert">
            <input 
              type="checkbox" 
              id="vitalsOutOfParameters" 
              checked={data?.vitals_out_of_parameters || false}
              onChange={(e) => handleChange('vitals_out_of_parameters', e.target.checked)}
            />
            <label htmlFor="vitalsOutOfParameters">
              <i className="fas fa-triangle-exclamation"></i>
              Vitals Out of Parameters
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitalsSection;