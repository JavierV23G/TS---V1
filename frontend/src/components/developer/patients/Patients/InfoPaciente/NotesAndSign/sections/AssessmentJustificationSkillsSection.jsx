import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/AssessmentJustificationSkillsSection.scss';

const AssessmentJustificationSkillsSection = ({ data, onChange, sectionId, config }) => {
  // Opciones de evaluación para justificación clínica
  const assessmentOptions = [
    {
      value: 'tolerated_benefiting',
      label: 'Patient tolerated treatment and is benefiting from skilled OT / PT / ST.',
      type: 'positive',
      icon: 'fas fa-check-circle'
    },
    {
      value: 'could_not_tolerate',
      label: 'Patient could not tolerate the following treatments',
      type: 'negative',
      icon: 'fas fa-exclamation-triangle'
    }
  ];

  // Manejar cambios en la selección de evaluación
  const handleAssessmentChange = (value) => {
    const updatedData = {
      ...data,
      assessment_selection: value
    };
    onChange(updatedData);
  };

  // Manejar cambios en los comentarios
  const handleCommentChange = (value) => {
    const updatedData = {
      ...data,
      justification_comments: value
    };
    onChange(updatedData);
  };

  return (
    <div className="assessment-justification-skills-section">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-clipboard-check"></i>
          <h2>Assessment / Justification</h2>
        </div>
        <div className="section-description">
          <p>Clinical Assessment and Treatment Justification Documentation</p>
        </div>
      </div>

      <div className="assessment-content">
        <div className="assessment-options">
          <div className="options-header">
            <div className="header-icon">
              <i className="fas fa-stethoscope"></i>
            </div>
            <div className="header-text">
              <h3>Treatment Assessment</h3>
              <p>Select the appropriate clinical assessment</p>
            </div>
          </div>

          <div className="options-grid">
            {assessmentOptions.map((option) => (
              <div key={option.value} className={`assessment-option ${option.type}`}>
                <label className="option-label">
                  <input
                    type="radio"
                    name="assessment_selection"
                    value={option.value}
                    checked={data?.assessment_selection === option.value}
                    onChange={(e) => handleAssessmentChange(e.target.value)}
                    className="option-radio"
                  />
                  
                  <div className="option-content">
                    <div className="option-icon">
                      <i className={option.icon}></i>
                    </div>
                    <div className="option-text">
                      <span className="option-label-text">{option.label}</span>
                    </div>
                  </div>

                  <div className="selection-indicator">
                    <div className="indicator-check">
                      <i className="fas fa-check"></i>
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="justification-comments">
          <div className="comments-header">
            <div className="header-icon">
              <i className="fas fa-pen-alt"></i>
            </div>
            <div className="header-text">
              <h3>Clinical Justification & Additional Notes</h3>
              <p>Provide detailed justification for the assessment and any additional clinical observations</p>
            </div>
          </div>

          <div className="comments-container">
            <textarea
              value={data?.justification_comments || ''}
              onChange={(e) => handleCommentChange(e.target.value)}
              placeholder="Enter detailed clinical justification, treatment rationale, patient response observations, contraindications, modifications made, or any other relevant clinical information that supports the assessment..."
              className="comments-textarea"
              rows="6"
            />
            
            <div className="textarea-footer">
              <div className="char-count">
                {data?.justification_comments?.length || 0} characters
              </div>
              <div className="textarea-tools">
                <span className="tool-tip">
                  <i className="fas fa-lightbulb"></i>
                  Include specific clinical observations and measurable outcomes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-summary">
        <div className="summary-info">
          <div className="summary-item">
            <i className="fas fa-clipboard-list"></i>
            <span>Assessment: {data?.assessment_selection ? 'Selected' : 'Pending'}</span>
          </div>
          <div className="summary-item">
            <i className="fas fa-comment-alt"></i>
            <span>Justification: {data?.justification_comments?.trim() ? 'Documented' : 'Pending'}</span>
          </div>
          <div className="summary-item">
            <i className="fas fa-tasks"></i>
            <span>
              Completion: {
                data?.assessment_selection && data?.justification_comments?.trim() 
                  ? 'Complete' 
                  : data?.assessment_selection || data?.justification_comments?.trim()
                    ? 'Partial'
                    : 'Not Started'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentJustificationSkillsSection;