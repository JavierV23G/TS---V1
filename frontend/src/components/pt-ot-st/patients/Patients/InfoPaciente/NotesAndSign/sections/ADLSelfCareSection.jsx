import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/ADLSelfCareSection.scss';

const ADLSelfCareSection = ({ data, onChange, sectionId, config }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  // 🔥 ADL SKILLS ORGANIZADAS POR CATEGORÍA
  const personalCareSkills = [
    { id: 'grooming', label: 'Grooming / Hygiene', icon: 'fas fa-shower' },
    { id: 'toileting', label: 'Toileting', icon: 'fas fa-toilet' },
    { id: 'functionalMobility', label: 'Functional Mobility', icon: 'fas fa-walking' }
  ];

  const domesticSkills = [
    { id: 'telephoneUse', label: 'Telephone Use', icon: 'fas fa-phone' },
    { id: 'mealPreparation', label: 'Meal Preparation', icon: 'fas fa-utensils' },
    { id: 'medicationManagement', label: 'Medication Management', icon: 'fas fa-pills' }
  ];

  // Assistance level colors for visual feedback
  const assistLevelColors = {
    'I': '#22c55e',      // Green - Independent
    'MI': '#3b82f6',     // Blue - Minimal help
    'SBA': '#06b6d4',    // Cyan - Stand by
    'CGA': '#8b5cf6',    // Purple - Contact guard
    'MIN': '#eab308',    // Yellow - Minimal assist
    'MOD': '#f59e0b',    // Orange - Moderate assist
    'MAX': '#f97316',    // Red-orange - Max assist
    'TOT': '#ef4444',    // Red - Total assist
    'DEP': '#dc2626',    // Dark red - Dependent
    'S': '#10b981'       // Teal - Supervision
  };

  return (
    <div className="adl-self-care-section">
      <div className="form-section">
        <div className="section-title">
          <h2>
            <i className="fas fa-hands-helping"></i>
            ADL / Self Care Skills
          </h2>
        </div>

        <div className="adl-categories">
          {/* Personal Care Skills */}
          <div className="adl-category">
            <h4 className="category-title">
              <i className="fas fa-user-nurse"></i>
              Personal Care
            </h4>
            <div className="adl-skills-grid">
              {personalCareSkills.map(skill => (
                <div className="adl-skill" key={skill.id}>
                  <div className="skill-header">
                    <div className="skill-label">
                      <i className={skill.icon}></i>
                      <label>{skill.label}</label>
                    </div>
                    <select 
                      value={data[skill.id] || ''}
                      onChange={(e) => handleChange(skill.id, e.target.value)}
                      className={data[skill.id] ? `selected level-${data[skill.id]}` : ''}
                      style={{
                        '--level-color': data[skill.id] ? assistLevelColors[data[skill.id]] || '#6b7280' : '#6b7280'
                      }}
                    >
                      <option value="">Select an option</option>
                      <option value="I">I</option>
                      <option value="MI">MI</option>
                      <option value="SBA">SBA</option>
                      <option value="CGA">CGA</option>
                      <option value="MIN">MIN</option>
                      <option value="MOD">MOD</option>
                      <option value="MAX">MAX</option>
                      <option value="TOT">TOT</option>
                      <option value="DEP">DEP</option>
                      <option value="S">S</option>
                    </select>
                  </div>
                  <textarea 
                    value={data[`${skill.id}Comments`] || ''}
                    onChange={(e) => handleChange(`${skill.id}Comments`, e.target.value)}
                    placeholder="Comments"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Domestic Skills */}
          <div className="adl-category">
            <h4 className="category-title">
              <i className="fas fa-home"></i>
              Domestic Skills
            </h4>
            <div className="adl-skills-grid">
              {domesticSkills.map(skill => (
                <div className="adl-skill" key={skill.id}>
                  <div className="skill-header">
                    <div className="skill-label">
                      <i className={skill.icon}></i>
                      <label>{skill.label}</label>
                    </div>
                    <select 
                      value={data[skill.id] || ''}
                      onChange={(e) => handleChange(skill.id, e.target.value)}
                      className={data[skill.id] ? `selected level-${data[skill.id]}` : ''}
                      style={{
                        '--level-color': data[skill.id] ? assistLevelColors[data[skill.id]] || '#6b7280' : '#6b7280'
                      }}
                    >
                      <option value="">Select an option</option>
                      <option value="I">I</option>
                      <option value="MI">MI</option>
                      <option value="SBA">SBA</option>
                      <option value="CGA">CGA</option>
                      <option value="MIN">MIN</option>
                      <option value="MOD">MOD</option>
                      <option value="MAX">MAX</option>
                      <option value="TOT">TOT</option>
                      <option value="DEP">DEP</option>
                      <option value="S">S</option>
                    </select>
                  </div>
                  <textarea 
                    value={data[`${skill.id}Comments`] || ''}
                    onChange={(e) => handleChange(`${skill.id}Comments`, e.target.value)}
                    placeholder="Comments"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-comment-medical"></i>
              Additional Information about ADL / Self Care Skills
            </label>
            <textarea 
              value={data.adlAdditional || ''}
              onChange={(e) => handleChange('adlAdditional', e.target.value)}
              rows={3}
              placeholder="Additional information about ADL / Self Care Skills..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ADLSelfCareSection;