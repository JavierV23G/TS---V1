import React from 'react';
import '../../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/AssessmentSections.scss';

// Múltiples secciones de Assessment optimizadas en un solo archivo

export const ProblemListSection = ({ data, onChange, sectionId, config }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  return (
    <div className="problem-list-section">
      <div className="form-section">
        <div className="section-title">
          <h2>
            <i className="fas fa-list-ul"></i>
            Problem List / Functional Limitations
          </h2>
        </div>
        
        <div className="problem-list-grid">
          {/* Mobility & Movement Problems */}
          <div className="problem-category">
            <h4 className="category-title">
              <i className="fas fa-walking"></i>
              Mobility & Movement
            </h4>
            <div className="checkbox-group">
              {[
                { id: 'decreasedROM', label: 'Decreased ROM', icon: 'fas fa-ruler-combined' },
                { id: 'dysfunctionalPosture', label: 'Dysfunctional Posture', icon: 'fas fa-user' },
                { id: 'impairedFunctionalMobility', label: 'Impaired Functional Mobility', icon: 'fas fa-wheelchair' },
                { id: 'dysfunctionalGait', label: 'Dysfunctional Gait', icon: 'fas fa-shoe-prints' },
                { id: 'impairedTransfers', label: 'Impaired Transfers', icon: 'fas fa-exchange-alt' }
              ].map(problem => (
                <div className="checkbox-item" key={problem.id}>
                  <input 
                    type="checkbox" 
                    id={problem.id} 
                    checked={data?.[problem.id] || false}
                    onChange={(e) => handleChange(problem.id, e.target.checked)}
                  />
                  <label htmlFor={problem.id}>
                    <i className={problem.icon}></i>
                    {problem.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Strength & Balance Problems */}
          <div className="problem-category">
            <h4 className="category-title">
              <i className="fas fa-dumbbell"></i>
              Strength & Balance
            </h4>
            <div className="checkbox-group">
              {[
                { id: 'impairedFunctionalStrength', label: 'Impaired Functional Strength', icon: 'fas fa-dumbbell' },
                { id: 'impairedBalance', label: 'Impaired Balance', icon: 'fas fa-balance-scale' },
                { id: 'impairedCoordination', label: 'Impaired Coordination', icon: 'fas fa-hand-pointer' },
                { id: 'fallRisk', label: 'Fall Risk', icon: 'fas fa-person-falling' }
              ].map(problem => (
                <div className="checkbox-item" key={problem.id}>
                  <input 
                    type="checkbox" 
                    id={problem.id} 
                    checked={data?.[problem.id] || false}
                    onChange={(e) => handleChange(problem.id, e.target.checked)}
                  />
                  <label htmlFor={problem.id}>
                    <i className={problem.icon}></i>
                    {problem.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Activity & Tolerance Problems */}
          <div className="problem-category">
            <h4 className="category-title">
              <i className="fas fa-running"></i>
              Activity & Tolerance
            </h4>
            <div className="checkbox-group">
              {[
                { id: 'impairedFunctionalActivityTolerance', label: 'Impaired Functional Activity Tolerance', icon: 'fas fa-running' },
                { id: 'painRestrictingFunction', label: 'Pain Restricting Function', icon: 'fas fa-bolt' },
                { id: 'urinaryIncontinence', label: 'Urinary Incontinence (Timed Up & Go)', icon: 'fas fa-tint' }
              ].map(problem => (
                <div className="checkbox-item" key={problem.id}>
                  <input 
                    type="checkbox" 
                    id={problem.id} 
                    checked={data?.[problem.id] || false}
                    onChange={(e) => handleChange(problem.id, e.target.checked)}
                  />
                  <label htmlFor={problem.id}>
                    <i className={problem.icon}></i>
                    {problem.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Safety & Awareness Problems */}
          <div className="problem-category">
            <h4 className="category-title">
              <i className="fas fa-shield-alt"></i>
              Safety & Awareness
            </h4>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input 
                  type="checkbox" 
                  id="impairedSafetyAwareness" 
                  checked={data?.impairedSafetyAwareness || false}
                  onChange={(e) => handleChange('impairedSafetyAwareness', e.target.checked)}
                />
                <label htmlFor="impairedSafetyAwareness">
                  <i className="fas fa-exclamation-triangle"></i>
                  Impaired Safety Awareness
                </label>
              </div>
            </div>
          </div>

          {/* Tissue & Joint Problems */}
          <div className="problem-category">
            <h4 className="category-title">
              <i className="fas fa-bone"></i>
              Tissue & Joint Issues
            </h4>
            <div className="checkbox-group">
              {[
                { id: 'softTissueDysfunction', label: 'Soft Tissue Dysfunction', icon: 'fas fa-hand-paper' },
                { id: 'jointHypoHypermobility', label: 'Joint Hyper/Hypomobility', icon: 'fas fa-bone' }
              ].map(problem => (
                <div className="checkbox-item" key={problem.id}>
                  <input 
                    type="checkbox" 
                    id={problem.id} 
                    checked={data?.[problem.id] || false}
                    onChange={(e) => handleChange(problem.id, e.target.checked)}
                  />
                  <label htmlFor={problem.id}>
                    <i className={problem.icon}></i>
                    {problem.label}
                  </label>
                </div>
              ))}
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
              value={data?.problemListAdditional || ''}
              onChange={(e) => handleChange('problemListAdditional', e.target.value)}
              rows={4}
              placeholder="Additional information about problems/limitations"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const AssessmentJustificationSection = ({ data, onChange, sectionId, config }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  return (
    <div className="assessment-justification-section">
      <div className="form-section">
        <div className="section-title">
          <h2>
            <i className="fas fa-clipboard-check"></i>
            Assessment/Justification
          </h2>
        </div>
        
        <div className="form-row">
          <div className="form-group radio-group">
            <div className="radio-options assessment-options">
              <div className="radio-option">
                <input 
                  type="radio" 
                  id="patientTolerated" 
                  name="assessmentJustification"
                  checked={data?.assessmentJustification === 'tolerated'}
                  onChange={() => handleChange('assessmentJustification', 'tolerated')}
                />
                <label htmlFor="patientTolerated">
                  <i className="fas fa-check-circle"></i>
                  Patient tolerated treatment and is benefiting from skilled PT.
                </label>
              </div>
              
              <div className="radio-option">
                <input 
                  type="radio" 
                  id="patientCouldNotTolerate" 
                  name="assessmentJustification"
                  checked={data?.assessmentJustification === 'couldNotTolerate'}
                  onChange={() => handleChange('assessmentJustification', 'couldNotTolerate')}
                />
                <label htmlFor="patientCouldNotTolerate">
                  <i className="fas fa-times-circle"></i>
                  Patient could not tolerate the following treatments
                </label>
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
              value={data?.assessmentJustificationAdditional || ''}
              onChange={(e) => handleChange('assessmentJustificationAdditional', e.target.value)}
              rows={4}
              placeholder="Additional information about assessment/justification"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const RehabPotentialSection = ({ data, onChange, sectionId, config }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  return (
    <div className="rehab-potential-section">
      <div className="form-section">
        <div className="section-title">
          <h2>
            <i className="fas fa-chart-line"></i>
            Rehab Potential
          </h2>
        </div>
        
        <div className="rehab-potential-container">
          <div className="form-row">
            <div className="form-group">
              <label>
                <i className="fas fa-chart-line"></i>
                Rehab Potential
              </label>
              <select 
                value={data?.rehabPotential || ''}
                onChange={(e) => handleChange('rehabPotential', e.target.value)}
              >
                <option value="">Select an option</option>
                <option value="Good for stated goals">Good for stated goals</option>
                <option value="Fair for stated goals">Fair for stated goals</option>
                <option value="Poor for stated goals">Poor for stated goals</option>
                <option value="Guarded for stated goals">Guarded for stated goals</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>
                <i className="fas fa-info-circle"></i>
                Additional Information
              </label>
              <textarea 
                value={data?.rehabPotentialAdditional || ''}
                onChange={(e) => handleChange('rehabPotentialAdditional', e.target.value)}
                rows={3}
                placeholder="Additional information about rehab potential"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkilledCareSection = ({ data, onChange, sectionId, config }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  return (
    <div className="skilled-care-section">
      <div className="form-section">
        <div className="section-title">
          <h2>
            <i className="fas fa-notes-medical"></i>
            Skilled Care Provided This Visit
          </h2>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-clipboard-list"></i>
              Detail skilled care provided during this visit
            </label>
            <textarea 
              value={data?.skilledCareProvided || ''}
              onChange={(e) => handleChange('skilledCareProvided', e.target.value)}
              rows={6}
              placeholder="Detail skilled care provided during this visit (e.g., specific exercises performed, patient education provided, safety training conducted, etc.)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};