import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/GaitMobilitySection.scss';
import StandardizedTest from '../StandardizedTest';

const GaitMobilitySection = ({ data, onChange, sectionId, config, onOpenTest }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  return (
    <div className="gait-mobility-section">
      <div className="form-section">
        <div className="section-title">
          <h3>
            <i className="fas fa-walking"></i>
            Gait / Mobility Training
          </h3>
        </div>
        
        <div className="alert-box">
          <div className="checkbox-item highlight">
            <input 
              type="checkbox" 
              id="mobilityNotApplicable" 
              checked={data?.mobilityNotApplicable || false}
              onChange={(e) => {
                const isChecked = e.target.checked;
                handleChange('mobilityNotApplicable', isChecked);
                if (isChecked) {
                  handleChange('levelSurface', false);
                  handleChange('unlevelSurface', false);
                  handleChange('carpetedSurface', false);
                  handleChange('gaitQualities', '');
                  handleChange('stairsCurb', '');
                  handleChange('sixMinuteWalk', '');
                }
              }}
            />
            <label htmlFor="mobilityNotApplicable">Not Applicable</label>
            {data?.mobilityNotApplicable && (
              <div className="alert-message">
                <i className="fas fa-info-circle"></i>
                <span>All mobility fields will be disabled</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="card-grid">
          <div className="feature-card">
            <div className="card-header">
              <h4>Surface Types</h4>
              <i className="fas fa-road"></i>
            </div>
            <div className="card-content">
              <div className="checkbox-grid three-columns">
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="levelSurface" 
                    checked={data?.levelSurface || false}
                    onChange={(e) => handleChange('levelSurface', e.target.checked)}
                    disabled={data?.mobilityNotApplicable}
                  />
                  <label htmlFor="levelSurface" className={data?.mobilityNotApplicable ? 'disabled' : ''}>
                    Level Surface
                  </label>
                </div>
                
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="unlevelSurface" 
                    checked={data?.unlevelSurface || false}
                    onChange={(e) => handleChange('unlevelSurface', e.target.checked)}
                    disabled={data?.mobilityNotApplicable}
                  />
                  <label htmlFor="unlevelSurface" className={data?.mobilityNotApplicable ? 'disabled' : ''}>
                    Unlevel Surface
                  </label>
                </div>
                
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="carpetedSurface" 
                    checked={data?.carpetedSurface || false}
                    onChange={(e) => handleChange('carpetedSurface', e.target.checked)}
                    disabled={data?.mobilityNotApplicable}
                  />
                  <label htmlFor="carpetedSurface" className={data?.mobilityNotApplicable ? 'disabled' : ''}>
                    Carpeted Surface
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-row dual-column">
          <div className="form-group">
            <label className={data?.mobilityNotApplicable ? 'disabled' : ''}>
              <i className="fas fa-shoe-prints"></i>
              Qualities / Deviations / Postures
            </label>
            <textarea 
              value={data?.gaitQualities || ''}
              onChange={(e) => handleChange('gaitQualities', e.target.value)}
              rows={4}
              placeholder="Describe gait qualities, deviations and postures"
              disabled={data?.mobilityNotApplicable}
            />
          </div>
          
          <div className="form-group">
            <label className={data?.mobilityNotApplicable ? 'disabled' : ''}>
              <i className="fas fa-angle-double-up"></i>
              Stairs / Curb
            </label>
            <textarea 
              value={data?.stairsCurb || ''}
              onChange={(e) => handleChange('stairsCurb', e.target.value)}
              rows={4}
              placeholder="Notes on stairs and curb navigation"
              disabled={data?.mobilityNotApplicable}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className={data?.mobilityNotApplicable ? 'disabled' : ''}>
              <i className="fas fa-stopwatch"></i>
              Six Minute Walk
            </label>
            <div className="input-with-unit">
              <input 
                type="text" 
                value={data?.sixMinuteWalk || ''}
                onChange={(e) => handleChange('sixMinuteWalk', e.target.value)}
                placeholder="Enter distance covered"
                disabled={data?.mobilityNotApplicable}
              />
              <span className="unit">feet</span>
            </div>
          </div>
        </div>
        
        {onOpenTest && (
          <div className="standardized-tests-section">
            <div className="section-title">
              <h4>Standardized Tests</h4>
            </div>
            <div className="tests-grid two-columns">
              <StandardizedTest 
                title="Tinetti" 
                isComplete={data?.standardizedTests?.['Tinetti']?.isComplete || false}
                onOpen={() => !data?.mobilityNotApplicable && onOpenTest('Tinetti')}
                status={data?.mobilityNotApplicable ? 'Not Required' : undefined}
                score={data?.standardizedTests?.['Tinetti']?.score}
              />
              
              <StandardizedTest 
                title="Timed Up And Go" 
                isComplete={data?.standardizedTests?.['Timed Up And Go']?.isComplete || false}
                onOpen={() => !data?.mobilityNotApplicable && onOpenTest('Timed Up And Go')}
                status={data?.mobilityNotApplicable ? 'Not Required' : undefined}
                score={data?.standardizedTests?.['Timed Up And Go']?.score}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GaitMobilitySection;