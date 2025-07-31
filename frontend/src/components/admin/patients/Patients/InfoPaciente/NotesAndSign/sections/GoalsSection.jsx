import React, { useState } from 'react';
import '../../../../../../../styles/admin/Patients/InfoPaciente/NotesAndSign/sections/GoalsSection.scss';

const GoalsSection = ({ data, onChange, sectionId, config }) => {
  const [expandedSection, setExpandedSection] = useState('gait');

  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  // Opciones de asistencia consistentes para todos los dropdowns
  const assistLevelOptions = [
    { value: "I", label: "I (No Assist)" },
    { value: "MI", label: "MI (Uses Assistive Device)" },
    { value: "S", label: "S (Set up/Supervision)" },
    { value: "SBA", label: "SBA (Stand By Assist)" },
    { value: "MIN", label: "MIN (Requires 0-25% Assist)" },
    { value: "MOD", label: "MOD (Requires 26-50% Assist)" },
    { value: "MAX", label: "MAX (Requires 51-75% Assist)" },
    { value: "TOT", label: "TOT (Requires 76-99% Assist)" },
    { value: "DEP", label: "DEP (Requires 100% Assist)" },
    { value: "CGA", label: "CGA (Contact Guard Assist)" }
  ];

  // Opciones para Patient/Caregiver
  const personOptions = [
    { value: "Patient", label: "Patient" },
    { value: "Caregiver", label: "Caregiver" }
  ];

  // Formatear fechas para mostrar en las duraciones
  const formatWeekDate = (weeksToAdd) => {
    const startDate = new Date(data.evaluationDate || new Date());
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + (weeksToAdd * 7));
    return `Week of ${targetDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}`;
  };

  // Generar opciones de duración basadas en la fecha de evaluación
  const generateDurationOptions = () => {
    const options = [];
    for (let i = 1; i <= 8; i++) {
      options.push({
        value: i.toString(),
        label: `${i} ${i === 1 ? 'Week' : 'Weeks'} (${formatWeekDate(i)})`
      });
    }
    return options;
  };

  const durationOptions = generateDurationOptions();

  return (
    <div className="goals-section">
      <div className="form-section">
        <div className="section-title">
          <h2>
            <i className="fas fa-bullseye"></i>
            Short & Long Term Goals
          </h2>
        </div>

        {/* Global Duration Settings */}
        <div className="duration-settings">
          <div className="form-row dual-column">
            <div className="form-group">
              <label>
                <i className="fas fa-calendar-alt"></i>
                Short Term Goals Duration
              </label>
              <select 
                value={data.stgDuration || '1'}
                onChange={(e) => handleChange('stgDuration', e.target.value)}
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>
                <i className="fas fa-calendar-check"></i>
                Long Term Goals Duration
              </label>
              <select 
                value={data.ltgDuration || '3'}
                onChange={(e) => handleChange('ltgDuration', e.target.value)}
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Goals Accordion */}
        <div className="goals-accordion">
          {/* Gait Goals */}
          <div className="accordion-item">
            <div 
              className={`accordion-header ${expandedSection === 'gait' ? 'active' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'gait' ? '' : 'gait')}
            >
              <div className="header-content">
                <i className="fas fa-walking"></i>
                <h3>Gait Goals</h3>
              </div>
              <i className={`fas fa-chevron-${expandedSection === 'gait' ? 'up' : 'down'}`}></i>
            </div>
            
            {expandedSection === 'gait' && (
              <div className="accordion-content">
                <div className="goals-grid">
                  {/* Short Term Goals */}
                  <div className="goals-column">
                    <h4>Short Term Goals ({data.stgDuration || 1} week{(data.stgDuration || 1) > 1 ? 's' : ''})</h4>
                    
                    <div className="goal-item">
                      <div className="goal-header">
                        <input 
                          type="checkbox" 
                          id="gaitShortTerm1"
                          checked={data.gaitShortTerm1 || false}
                          onChange={(e) => handleChange('gaitShortTerm1', e.target.checked)}
                        />
                        <label htmlFor="gaitShortTerm1">Include this goal</label>
                      </div>
                      
                      {data.gaitShortTerm1 && (
                        <div className="goal-content">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Who will perform this goal?</label>
                              <select 
                                value={data.gaitStgPerson || ''}
                                onChange={(e) => handleChange('gaitStgPerson', e.target.value)}
                              >
                                <option value="">Select person</option>
                                {personOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Assistance Level</label>
                              <select 
                                value={data.gaitStgAssistLevel || ''}
                                onChange={(e) => handleChange('gaitStgAssistLevel', e.target.value)}
                              >
                                <option value="">Select assist level</option>
                                {assistLevelOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Distance/Duration</label>
                              <input 
                                type="text"
                                value={data.gaitStgDistance || ''}
                                onChange={(e) => handleChange('gaitStgDistance', e.target.value)}
                                placeholder="e.g., 50 feet, 5 minutes"
                              />
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Surface/Environment</label>
                              <input 
                                type="text"
                                value={data.gaitStgSurface || ''}
                                onChange={(e) => handleChange('gaitStgSurface', e.target.value)}
                                placeholder="e.g., level surfaces, uneven terrain"
                              />
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Outcome/Frequency</label>
                              <input 
                                type="text"
                                value={data.gaitStgOutcome || ''}
                                onChange={(e) => handleChange('gaitStgOutcome', e.target.value)}
                                placeholder="e.g., 3/5 trials, 80% of the time"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Long Term Goals */}
                  <div className="goals-column">
                    <h4>Long Term Goals ({data.ltgDuration || 3} week{(data.ltgDuration || 3) > 1 ? 's' : ''})</h4>
                    
                    <div className="goal-item">
                      <div className="goal-header">
                        <input 
                          type="checkbox" 
                          id="gaitLongTerm1"
                          checked={data.gaitLongTerm1 || false}
                          onChange={(e) => handleChange('gaitLongTerm1', e.target.checked)}
                        />
                        <label htmlFor="gaitLongTerm1">Include this goal</label>
                      </div>
                      
                      {data.gaitLongTerm1 && (
                        <div className="goal-content">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Who will perform this goal?</label>
                              <select 
                                value={data.gaitLtgPerson || ''}
                                onChange={(e) => handleChange('gaitLtgPerson', e.target.value)}
                              >
                                <option value="">Select person</option>
                                {personOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Assistance Level</label>
                              <select 
                                value={data.gaitLtgAssistLevel || ''}
                                onChange={(e) => handleChange('gaitLtgAssistLevel', e.target.value)}
                              >
                                <option value="">Select assist level</option>
                                {assistLevelOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Distance/Duration</label>
                              <input 
                                type="text"
                                value={data.gaitLtgDistance || ''}
                                onChange={(e) => handleChange('gaitLtgDistance', e.target.value)}
                                placeholder="e.g., 150 feet, community distances"
                              />
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Surface/Environment</label>
                              <input 
                                type="text"
                                value={data.gaitLtgSurface || ''}
                                onChange={(e) => handleChange('gaitLtgSurface', e.target.value)}
                                placeholder="e.g., all surfaces, community ambulation"
                              />
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Outcome/Frequency</label>
                              <input 
                                type="text"
                                value={data.gaitLtgOutcome || ''}
                                onChange={(e) => handleChange('gaitLtgOutcome', e.target.value)}
                                placeholder="e.g., 5/5 trials, 100% of the time"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ADL Goals */}
          <div className="accordion-item">
            <div 
              className={`accordion-header ${expandedSection === 'adl' ? 'active' : ''}`}
              onClick={() => setExpandedSection(expandedSection === 'adl' ? '' : 'adl')}
            >
              <div className="header-content">
                <i className="fas fa-hands-helping"></i>
                <h3>ADL Goals</h3>
              </div>
              <i className={`fas fa-chevron-${expandedSection === 'adl' ? 'up' : 'down'}`}></i>
            </div>
            
            {expandedSection === 'adl' && (
              <div className="accordion-content">
                <div className="goals-grid">
                  {/* Short Term ADL Goals */}
                  <div className="goals-column">
                    <h4>Short Term Goals ({data.stgDuration || 1} week{(data.stgDuration || 1) > 1 ? 's' : ''})</h4>
                    
                    <div className="goal-item">
                      <div className="goal-header">
                        <input 
                          type="checkbox" 
                          id="adlShortTerm1"
                          checked={data.adlShortTerm1 || false}
                          onChange={(e) => handleChange('adlShortTerm1', e.target.checked)}
                        />
                        <label htmlFor="adlShortTerm1">Self-feeding goal</label>
                      </div>
                      
                      {data.adlShortTerm1 && (
                        <div className="goal-content">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Assistance Level</label>
                              <select 
                                value={data.adlSelfFeedingAssistLevel || ''}
                                onChange={(e) => handleChange('adlSelfFeedingAssistLevel', e.target.value)}
                              >
                                <option value="">Select assist level</option>
                                {assistLevelOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Outcome/Frequency</label>
                              <input 
                                type="text"
                                value={data.adlSelfFeedingOutcome || ''}
                                onChange={(e) => handleChange('adlSelfFeedingOutcome', e.target.value)}
                                placeholder="e.g., 3/5 meals, 80% independence"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Long Term ADL Goals */}
                  <div className="goals-column">
                    <h4>Long Term Goals ({data.ltgDuration || 3} week{(data.ltgDuration || 3) > 1 ? 's' : ''})</h4>
                    
                    <div className="goal-item">
                      <div className="goal-header">
                        <input 
                          type="checkbox" 
                          id="adlLongTerm1"
                          checked={data.adlLongTerm1 || false}
                          onChange={(e) => handleChange('adlLongTerm1', e.target.checked)}
                        />
                        <label htmlFor="adlLongTerm1">Complete self-feeding independence</label>
                      </div>
                      
                      {data.adlLongTerm1 && (
                        <div className="goal-content">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Target Independence Level</label>
                              <select 
                                value={data.adlLongTermAssistLevel || ''}
                                onChange={(e) => handleChange('adlLongTermAssistLevel', e.target.value)}
                              >
                                <option value="">Select target level</option>
                                {assistLevelOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Success Criteria</label>
                              <input 
                                type="text"
                                value={data.adlLongTermOutcome || ''}
                                onChange={(e) => handleChange('adlLongTermOutcome', e.target.value)}
                                placeholder="e.g., 100% independence, all meals"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-info-circle"></i>
              Additional Goals Information
            </label>
            <textarea 
              value={data.goalsAdditional || ''}
              onChange={(e) => handleChange('goalsAdditional', e.target.value)}
              rows={4}
              placeholder="Additional information about goals and objectives..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsSection;