import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/MuscleBalanceSections.scss';
import StandardizedTest from '../StandardizedTest';

export const MuscleStrengthSection = ({ data, onChange, sectionId, config, onOpenTest }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  return (
    <div className="muscle-strength-section">
      <div className="form-section">
        <div className="section-title">
          <h3>
            <i className="fas fa-dumbbell"></i>
            Muscle Strength/ROM
          </h3>
        </div>
        
        <div className="card-grid two-columns">
          <div className="feature-card">
            <div className="card-header">
              <h4>Upper Extremities (UE)</h4>
              <i className="fas fa-hand-paper"></i>
            </div>
            <div className="card-content">
              <textarea 
                value={data?.upperExtremities || ''}
                onChange={(e) => handleChange('upperExtremities', e.target.value)}
                rows={5}
                placeholder="Describe upper extremities strength and ROM"
              />
            </div>
          </div>
          
          <div className="feature-card">
            <div className="card-header">
              <h4>Lower Extremities (LE)</h4>
              <i className="fas fa-socks"></i>
            </div>
            <div className="card-content">
              <textarea 
                value={data?.lowerExtremities || ''}
                onChange={(e) => handleChange('lowerExtremities', e.target.value)}
                rows={5}
                placeholder="Describe lower extremities strength and ROM"
              />
            </div>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-info-circle"></i>
              Additional Information
            </label>
            <textarea 
              value={data?.muscleAdditional || ''}
              onChange={(e) => handleChange('muscleAdditional', e.target.value)}
              rows={3}
              placeholder="Additional information about muscle strength and ROM"
            />
          </div>
        </div>
        
        {onOpenTest && (
          <div className="standardized-tests-section">
            <div className="section-title">
              <h4>Standardized Tests</h4>
            </div>
            <div className="tests-grid">
              <StandardizedTest 
                title="Functional Reach" 
                isComplete={data?.standardizedTests?.['Functional Reach']?.isComplete || false}
                onOpen={() => onOpenTest('Functional Reach')}
                score={data?.standardizedTests?.['Functional Reach']?.score}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const BalanceSection = ({ data, onChange, sectionId, config, onOpenTest }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  return (
    <div className="balance-section">
      <div className="form-section">
        <div className="section-title">
          <h3>
            <i className="fas fa-balance-scale"></i>
            Balance
          </h3>
        </div>
        
        <div className="scale-reference">
          <button className="info-button" onClick={() => console.log('Show GFP Scale')}>
            <i className="fas fa-info-circle"></i>
            <span>Show GFP Scale Reference</span>
          </button>
        </div>
        
        <div className="card-grid two-columns">
          <div className="feature-card">
            <div className="card-header">
              <h4>Sitting Balance</h4>
              <i className="fas fa-chair"></i>
            </div>
            <div className="card-content balance-content">
              <div className="balance-option">
                <label>Static</label>
                <select 
                  value={data?.sittingStatic || ''}
                  onChange={(e) => handleChange('sittingStatic', e.target.value)}
                  className={data?.sittingStatic ? 
                    `score-${data.sittingStatic.charAt(0).toLowerCase()}` : ''}
                >
                  <option value="">Select an option</option>
                  <option value="Not Tested">Not Tested</option>
                  <option value="P-">P-</option>
                  <option value="P">P</option>
                  <option value="P+">P+</option>
                  <option value="F-">F-</option>
                  <option value="F">F</option>
                  <option value="F+">F+</option>
                  <option value="G-">G-</option>
                  <option value="G">G</option>
                  <option value="G+">G+</option>
                </select>
              </div>
              
              <div className="balance-option">
                <label>Dynamic</label>
                <select 
                  value={data?.sittingDynamic || ''}
                  onChange={(e) => handleChange('sittingDynamic', e.target.value)}
                  className={data?.sittingDynamic ? 
                    `score-${data.sittingDynamic.charAt(0).toLowerCase()}` : ''}
                >
                  <option value="">Select an option</option>
                  <option value="Not Tested">Not Tested</option>
                  <option value="P-">P-</option>
                  <option value="P">P</option>
                  <option value="P+">P+</option>
                  <option value="F-">F-</option>
                  <option value="F">F</option>
                  <option value="F+">F+</option>
                  <option value="G-">G-</option>
                  <option value="G">G</option>
                  <option value="G+">G+</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="card-header">
              <h4>Standing Balance</h4>
              <i className="fas fa-male"></i>
            </div>
            <div className="card-content balance-content">
              <div className="balance-option">
                <label>Static</label>
                <select 
                  value={data?.standingStatic || ''}
                  onChange={(e) => handleChange('standingStatic', e.target.value)}
                  className={data?.standingStatic ? 
                    `score-${data.standingStatic.charAt(0).toLowerCase()}` : ''}
                >
                  <option value="">Select an option</option>
                  <option value="Not Tested">Not Tested</option>
                  <option value="P-">P-</option>
                  <option value="P">P</option>
                  <option value="P+">P+</option>
                  <option value="F-">F-</option>
                  <option value="F">F</option>
                  <option value="F+">F+</option>
                  <option value="G-">G-</option>
                  <option value="G">G</option>
                  <option value="G+">G+</option>
                </select>
              </div>
              
              <div className="balance-option">
                <label>Dynamic</label>
                <select 
                  value={data?.standingDynamic || ''}
                  onChange={(e) => handleChange('standingDynamic', e.target.value)}
                  className={data?.standingDynamic ? 
                    `score-${data.standingDynamic.charAt(0).toLowerCase()}` : ''}
                >
                  <option value="">Select an option</option>
                  <option value="Not Tested">Not Tested</option>
                  <option value="P-">P-</option>
                  <option value="P">P</option>
                  <option value="P+">P+</option>
                  <option value="F-">F-</option>
                  <option value="F">F</option>
                  <option value="F+">F+</option>
                  <option value="G-">G-</option>
                  <option value="G">G</option>
                  <option value="G+">G+</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-info-circle"></i>
              Additional Information
            </label>
            <textarea 
              value={data?.balanceAdditional || ''}
              onChange={(e) => handleChange('balanceAdditional', e.target.value)}
              rows={3}
              placeholder="Additional information about balance"
            />
          </div>
        </div>
        
        {onOpenTest && (
          <div className="standardized-tests-section">
            <div className="section-title">
              <h4>Standardized Tests</h4>
            </div>
            <div className="tests-grid three-columns">
              <StandardizedTest 
                title="Berg" 
                isComplete={data?.standardizedTests?.['BERG']?.isComplete || false}
                onOpen={() => onOpenTest('BERG')}
                score={data?.standardizedTests?.['BERG']?.score}
              />
              
              <StandardizedTest 
                title="Fall Risk Assessment" 
                isComplete={data?.standardizedTests?.['Fall Risk Assessment']?.isComplete || false}
                onOpen={() => onOpenTest('Fall Risk Assessment')}
                score={data?.standardizedTests?.['Fall Risk Assessment']?.score}
              />
              
              <StandardizedTest 
                title="Advanced Balance" 
                isComplete={data?.standardizedTests?.['Advanced Balance']?.isComplete || false}
                onOpen={() => onOpenTest('Advanced Balance')}
                score={data?.standardizedTests?.['Advanced Balance']?.score}
              />
              
              <StandardizedTest 
                title="Four Stage Balance Test" 
                isComplete={data?.standardizedTests?.['Four Stage Balance Test']?.isComplete || false}
                onOpen={() => onOpenTest('Four Stage Balance Test')}
                score={data?.standardizedTests?.['Four Stage Balance Test']?.score}
              />
              
              <StandardizedTest 
                title="MAHC10" 
                isComplete={data?.standardizedTests?.['MAHC10']?.isComplete || false}
                onOpen={() => onOpenTest('MAHC10')}
                score={data?.standardizedTests?.['MAHC10']?.score}
              />
              
              <StandardizedTest 
                title="Short Physical Performance Battery" 
                isComplete={data?.standardizedTests?.['Short Physical Performance Battery']?.isComplete || false}
                onOpen={() => onOpenTest('Short Physical Performance Battery')}
                score={data?.standardizedTests?.['Short Physical Performance Battery']?.score}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};