import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/MuscleStrengthROMSkillsSection.scss';

const MuscleStrengthROMSkillsSection = ({ data, onChange, sectionId, config }) => {
  // Assessment fields for muscle strength and ROM evaluation
  const assessmentFields = [
    {
      key: 'upperExtremities',
      label: 'Upper Extremities (UE)',
      icon: 'fas fa-hands',
      description: 'Assessment of upper extremity muscle strength and range of motion',
      placeholder: 'Document upper extremity muscle strength testing, range of motion measurements, joint mobility, muscle tone abnormalities, compensatory patterns, functional limitations, or specific deficits affecting arm and hand function...'
    },
    {
      key: 'lowerExtremities',
      label: 'Lower Extremities (LE)',
      icon: 'fas fa-running',
      description: 'Assessment of lower extremity muscle strength and range of motion',
      placeholder: 'Document lower extremity muscle strength testing, range of motion measurements, joint mobility, weight bearing status, gait impairments, functional limitations, or specific deficits affecting leg and foot function...'
    },
    {
      key: 'additionalInformation',
      label: 'Additional Information',
      icon: 'fas fa-info-circle',
      description: 'General observations and supplementary clinical notes',
      placeholder: 'Enter additional clinical observations including bilateral comparisons, pain during testing, patient tolerance, environmental factors affecting assessment, assistive devices used, family education provided, or recommendations for strength and ROM training...'
    }
  ];

  // Handle assessment field changes
  const handleFieldChange = (fieldKey, value) => {
    const updatedData = {
      ...data,
      assessmentFields: {
        ...data?.assessmentFields,
        [fieldKey]: value
      }
    };
    onChange(updatedData);
  };

  // Get completed fields count
  const getCompletedFieldsCount = () => {
    const fields = data?.assessmentFields || {};
    return Object.values(fields).filter(value => value && value.trim().length > 0).length;
  };

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    return (getCompletedFieldsCount() / assessmentFields.length) * 100;
  };

  return (
    <div className="muscle-strength-rom-skills-section">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-dumbbell"></i>
          <h3>Muscle Strength & Range of Motion Assessment</h3>
        </div>
        <p className="section-description">
          Comprehensive evaluation of upper and lower extremity muscle strength and joint range of motion
        </p>
        <div className="assessment-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <i className="fas fa-clipboard-check"></i>
              <span>{getCompletedFieldsCount()} of {assessmentFields.length} assessments completed</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-chart-pie"></i>
              <span>{Math.round(getCompletionPercentage())}% complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Fields */}
      <div className="assessment-group assessment-fields">
        <div className="group-header">
          <h4 className="group-title">
            <i className="fas fa-stethoscope"></i>
            Clinical Assessment Documentation
          </h4>
          <p className="group-description">
            Document detailed muscle strength and range of motion findings for each extremity group
          </p>
        </div>

        <div className="fields-grid">
          {assessmentFields.map((field) => (
            <div key={field.key} className="assessment-field">
              <div className="field-header">
                <div className="field-title">
                  <i className={field.icon}></i>
                  <h5>{field.label}</h5>
                </div>
                <p className="field-description">{field.description}</p>
              </div>
              
              <div className="field-input-container">
                <textarea
                  value={data?.assessmentFields?.[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={field.key === 'additionalInformation' ? 6 : 5}
                  className="field-textarea"
                  maxLength={2000}
                />
                <div className="character-count">
                  {(data?.assessmentFields?.[field.key] || '').length} / 2000 characters
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Progress */}
      {getCompletedFieldsCount() > 0 && (
        <div className="assessment-progress">
          <div className="progress-header">
            <h4 className="progress-title">
              <i className="fas fa-chart-line"></i>
              Assessment Progress
            </h4>
          </div>
          
          <div className="progress-content">
            <div className="progress-section">
              <div className="progress-label">
                <i className="fas fa-clipboard-list"></i>
                <span>Assessment Fields</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${getCompletionPercentage()}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {getCompletedFieldsCount()} of {assessmentFields.length} completed ({Math.round(getCompletionPercentage())}%)
              </div>
            </div>
          </div>

          {/* Completed Fields Summary */}
          <div className="completed-fields-summary">
            <h5 className="summary-subtitle">
              <i className="fas fa-check-double"></i>
              Completed Assessments
            </h5>
            <div className="completed-fields">
              {assessmentFields
                .filter(field => data?.assessmentFields?.[field.key] && data.assessmentFields[field.key].trim().length > 0)
                .map(field => (
                  <div key={field.key} className="completed-field">
                    <i className={field.icon}></i>
                    <span>{field.label}</span>
                    <div className="word-count">
                      {data.assessmentFields[field.key].trim().split(/\s+/).length} words
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuscleStrengthROMSkillsSection;