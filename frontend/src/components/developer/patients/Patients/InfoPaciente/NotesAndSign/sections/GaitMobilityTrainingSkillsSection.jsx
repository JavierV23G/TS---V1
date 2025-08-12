import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/GaitMobilityTrainingSkillsSection.scss';

const GaitMobilityTrainingSkillsSection = ({ data, onChange, sectionId, config }) => {
  // Surface types for gait training
  const surfaceTypes = [
    {
      key: 'levelSurface',
      label: 'Level Surface',
      icon: 'fas fa-arrows-alt-h',
      description: 'Walking on flat, even surfaces'
    },
    {
      key: 'unlevelSurface',
      label: 'Unlevel Surface',
      icon: 'fas fa-mountain',
      description: 'Walking on uneven terrain or slopes'
    },
    {
      key: 'carpetedSurface',
      label: 'Carpeted Surface',
      icon: 'fas fa-rug',
      description: 'Walking on carpet or soft surfaces'
    }
  ];

  // Assessment fields with clinical focus
  const assessmentFields = [
    {
      key: 'qualitiesDeviationsPostures',
      label: 'Qualities / Deviations / Postures',
      icon: 'fas fa-user-check',
      description: 'Gait patterns, compensations, and postural observations',
      placeholder: 'Describe gait quality, observed deviations, postural abnormalities, compensatory strategies, asymmetries, or specific movement patterns during mobility...'
    },
    {
      key: 'stairsCurb',
      label: 'Stairs / Curb',
      icon: 'fas fa-stairs',
      description: 'Stair climbing and curb negotiation abilities',
      placeholder: 'Document stair climbing ability, step negotiation, curb management, handrail use, safety awareness, or modifications needed for elevation changes...'
    },
    {
      key: 'sixMinuteWalk',
      label: 'Six Minute Walk',
      icon: 'fas fa-stopwatch',
      description: 'Endurance and distance assessment',
      placeholder: 'Record distance covered, endurance level, rest breaks needed, vital sign changes, fatigue level, or modifications required during extended walking...'
    },
    {
      key: 'additionalComments',
      label: 'Additional Comments',
      icon: 'fas fa-comment-medical',
      description: 'General observations and clinical notes',
      placeholder: 'Enter additional clinical observations, safety concerns, equipment recommendations, family education provided, discharge planning considerations, or other relevant findings...'
    }
  ];

  // Handle surface selection changes
  const handleSurfaceChange = (surfaceKey, checked) => {
    const updatedData = {
      ...data,
      surfaces: {
        ...data?.surfaces,
        [surfaceKey]: checked
      }
    };
    onChange(updatedData);
  };

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

  // Get selected surfaces count
  const getSelectedSurfacesCount = () => {
    const surfaces = data?.surfaces || {};
    return Object.values(surfaces).filter(Boolean).length;
  };

  // Get completed fields count
  const getCompletedFieldsCount = () => {
    const fields = data?.assessmentFields || {};
    return Object.values(fields).filter(value => value && value.trim().length > 0).length;
  };

  return (
    <div className="gait-mobility-training-skills-section">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-walking"></i>
          <h3>Gait & Mobility Training Assessment</h3>
        </div>
        <p className="section-description">
          Comprehensive evaluation of gait patterns, mobility training, and functional ambulation across various surfaces
        </p>
        <div className="assessment-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <i className="fas fa-check-square"></i>
              <span>{getSelectedSurfacesCount()} of {surfaceTypes.length} surfaces selected</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-edit"></i>
              <span>{getCompletedFieldsCount()} of {assessmentFields.length} assessments completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Surface Types Selection */}
      <div className="assessment-group surface-selection">
        <div className="group-header">
          <h4 className="group-title">
            <i className="fas fa-route"></i>
            Training Surface Types
          </h4>
          <p className="group-description">
            Select the surface types used during gait and mobility training assessment
          </p>
        </div>

        <div className="surface-grid">
          {surfaceTypes.map((surface) => (
            <label key={surface.key} className="surface-option">
              <input
                type="checkbox"
                checked={data?.surfaces?.[surface.key] || false}
                onChange={(e) => handleSurfaceChange(surface.key, e.target.checked)}
              />
              <div className="surface-card">
                <div className="surface-icon">
                  <i className={surface.icon}></i>
                </div>
                <div className="surface-info">
                  <h5 className="surface-label">{surface.label}</h5>
                  <p className="surface-description">{surface.description}</p>
                </div>
                <div className="selection-indicator">
                  <i className="fas fa-check"></i>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Assessment Fields */}
      <div className="assessment-group assessment-fields">
        <div className="group-header">
          <h4 className="group-title">
            <i className="fas fa-clipboard-list"></i>
            Clinical Assessment Documentation
          </h4>
          <p className="group-description">
            Document detailed observations and findings for each assessment area
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
                  rows={field.key === 'additionalComments' ? 5 : 4}
                  className="field-textarea"
                  maxLength={1500}
                />
                <div className="character-count">
                  {(data?.assessmentFields?.[field.key] || '').length} / 1500 characters
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Progress */}
      {(getSelectedSurfacesCount() > 0 || getCompletedFieldsCount() > 0) && (
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
                <i className="fas fa-route"></i>
                <span>Surface Types</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill surface-progress"
                  style={{ width: `${(getSelectedSurfacesCount() / surfaceTypes.length) * 100}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {getSelectedSurfacesCount()} of {surfaceTypes.length} selected
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-label">
                <i className="fas fa-clipboard-list"></i>
                <span>Assessment Fields</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill field-progress"
                  style={{ width: `${(getCompletedFieldsCount() / assessmentFields.length) * 100}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {getCompletedFieldsCount()} of {assessmentFields.length} completed
              </div>
            </div>
          </div>

          {/* Selected Surfaces Summary */}
          {getSelectedSurfacesCount() > 0 && (
            <div className="selected-surfaces-summary">
              <h5 className="summary-subtitle">
                <i className="fas fa-list-check"></i>
                Selected Training Surfaces
              </h5>
              <div className="selected-surfaces">
                {surfaceTypes
                  .filter(surface => data?.surfaces?.[surface.key])
                  .map(surface => (
                    <div key={surface.key} className="selected-surface">
                      <i className={surface.icon}></i>
                      <span>{surface.label}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GaitMobilityTrainingSkillsSection;