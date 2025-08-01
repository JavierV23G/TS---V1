import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/PainSection.scss';

const PainSection = ({ data, onChange, sectionId, config }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  return (
    <div className="pain-section">
      <div className="form-section">
        <div className="section-title">
          <h2>Pain Assessment</h2>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label><i className="fas fa-question-circle"></i> Is patient experiencing pain?</label>
            <select 
              value={data?.experiencingPain || ''}
              onChange={(e) => handleChange('experiencingPain', e.target.value)}
            >
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
        
        {data?.experiencingPain === 'Yes' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-map-marker-alt"></i> Pain Location</label>
                <input 
                  type="text" 
                  value={data?.painLocation || ''}
                  onChange={(e) => handleChange('painLocation', e.target.value)}
                  placeholder="Enter pain location"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-thermometer-half"></i> Pain Intensity</label>
                <div className="pain-scale">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                    <button 
                      key={level}
                      type="button"
                      className={`pain-level ${data?.painIntensity === level ? 'active' : ''}`}
                      onClick={() => handleChange('painIntensity', level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="pain-scale-labels">
                  <span>No Pain</span>
                  <span>Moderate</span>
                  <span>Worst Pain</span>
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-comment-alt"></i> Pain Description</label>
                <div className="pain-description-options">
                  {['Sharp', 'Dull', 'Aching', 'Throbbing', 'Burning', 'Stabbing', 'Tingling', 'Numbness'].map(type => (
                    <div className="checkbox-item" key={type}>
                      <input 
                        type="checkbox" 
                        id={`pain${type}`} 
                        checked={data?.[`pain${type}`] || false}
                        onChange={(e) => handleChange(`pain${type}`, e.target.checked)}
                      />
                      <label htmlFor={`pain${type}`}>{type}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-exclamation-circle"></i> Pain Severity</label>
                <select 
                  value={data?.painSeverity || ''}
                  onChange={(e) => handleChange('painSeverity', e.target.value)}
                >
                  <option value="">Select an option</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-walking"></i> Pain Effect on Function</label>
                <textarea 
                  value={data?.painEffect || ''}
                  onChange={(e) => handleChange('painEffect', e.target.value)}
                  rows={3}
                  placeholder="Describe how pain affects function"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PainSection;