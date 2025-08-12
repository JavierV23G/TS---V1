import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/ADLSelfCareSkillsSection.scss';

const ADLSelfCareSkillsSection = ({ data, onChange, sectionId, config }) => {
  // Opciones de evaluación
  const evaluationOptions = [
    'NT', 'DEP', 'MAX', 'MOD', 'MIN', 'S', 'SBA', 'SUP', 'MI', 'I', 'CGA'
  ];

  // Actividades de ADL / Self Care Skills
  const adlActivities = [
    { key: 'self_feeding', label: 'Self Feeding' },
    { key: 'swallowing', label: 'Swallowing' },
    { key: 'oral_hygiene', label: 'Oral Hygiene' },
    { key: 'grooming_hygiene', label: 'Grooming / Hygiene' },
    { key: 'toileting', label: 'Toileting' },
    { key: 'ue_dressing', label: 'UE Dressing' },
    { key: 'le_dressing', label: 'LE Dressing' },
    { key: 'fasteners', label: 'Fasteners' },
    { key: 'functional_mobility', label: 'Functional Mobility' },
    { key: 'bathing', label: 'Bathing' },
    { key: 'bed_mobility', label: 'Bed Mobility' },
    { key: 'housework_homemaking', label: 'Housework / Homemaking' },
    { key: 'telephone_use', label: 'Telephone Use' },
    { key: 'meal_preparation', label: 'Meal Preparation' },
    { key: 'laundry', label: 'Laundry' },
    { key: 'money_management', label: 'Money Management' },
    { key: 'medication_management', label: 'Medication Management' }
  ];

  // Manejar cambios en la evaluación
  const handleEvaluationChange = (activityKey, value) => {
    const updatedData = {
      ...data,
      [activityKey]: {
        ...data?.[activityKey],
        evaluation: value
      }
    };
    onChange(updatedData);
  };

  // Manejar cambios en los comentarios
  const handleCommentChange = (activityKey, value) => {
    const updatedData = {
      ...data,
      [activityKey]: {
        ...data?.[activityKey],
        comment: value
      }
    };
    onChange(updatedData);
  };

  return (
    <div className="adl-self-care-skills-section">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-hand-holding-heart"></i>
          <h2>ADL / Self Care Skills</h2>
        </div>
        <div className="section-description">
          <p>Activities of Daily Living and Self-Care Skills Assessment</p>
        </div>
      </div>

      <div className="evaluation-legend">
        <div className="legend-title">
          <i className="fas fa-info-circle"></i>
          <span>Evaluation Key</span>
        </div>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-code">NT</span>
            <span className="legend-text">Not Tested</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">DEP</span>
            <span className="legend-text">Dependent</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">MAX</span>
            <span className="legend-text">Maximum Assistance</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">MOD</span>
            <span className="legend-text">Moderate Assistance</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">MIN</span>
            <span className="legend-text">Minimum Assistance</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">S</span>
            <span className="legend-text">Standby</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">SBA</span>
            <span className="legend-text">Standby Assistance</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">SUP</span>
            <span className="legend-text">Supervision</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">MI</span>
            <span className="legend-text">Minimal Independence</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">I</span>
            <span className="legend-text">Independent</span>
          </div>
          <div className="legend-item">
            <span className="legend-code">CGA</span>
            <span className="legend-text">Contact Guard Assist</span>
          </div>
        </div>
      </div>

      <div className="adl-activities-grid">
        {adlActivities.map((activity) => (
          <div key={activity.key} className="adl-activity-card">
            <div className="activity-header">
              <h3 className="activity-title">{activity.label}</h3>
            </div>
            
            <div className="evaluation-section">
              <label className="evaluation-label">Evaluation Level</label>
              <div className="evaluation-options">
                {evaluationOptions.map((option) => (
                  <label key={option} className="option-label">
                    <input
                      type="radio"
                      name={`${activity.key}_evaluation`}
                      value={option}
                      checked={data?.[activity.key]?.evaluation === option}
                      onChange={(e) => handleEvaluationChange(activity.key, e.target.value)}
                      className="option-radio"
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="comment-section">
              <label className="comment-label">
                <i className="fas fa-comment-alt"></i>
                Additional Comments (Optional)
              </label>
              <textarea
                value={data?.[activity.key]?.comment || ''}
                onChange={(e) => handleCommentChange(activity.key, e.target.value)}
                placeholder="Enter any additional observations or notes..."
                className="comment-textarea"
                rows="3"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="section-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <i className="fas fa-tasks"></i>
            <span>Total Activities: {adlActivities.length}</span>
          </div>
          <div className="stat-item">
            <i className="fas fa-check-circle"></i>
            <span>
              Evaluated: {adlActivities.filter(activity => data?.[activity.key]?.evaluation).length}
            </span>
          </div>
          <div className="stat-item">
            <i className="fas fa-comment"></i>
            <span>
              With Comments: {adlActivities.filter(activity => data?.[activity.key]?.comment?.trim()).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ADLSelfCareSkillsSection;