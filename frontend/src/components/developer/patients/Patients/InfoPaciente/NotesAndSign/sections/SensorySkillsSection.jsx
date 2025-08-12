import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/SensorySkillsSection.scss';

const SensorySkillsSection = ({ data, onChange, sectionId, config }) => {
  // Sensory assessment options
  const assessmentOptions = [
    { value: 'normal', label: 'Normal (N)', className: 'normal' },
    { value: 'abnormal', label: 'Abnormal (AB)', className: 'abnormal' },
    { value: 'not_tested', label: 'Not Tested (NT)', className: 'not-tested' }
  ];

  // Hand dominance options
  const handDominanceOptions = [
    { value: 'na', label: 'N/A' },
    { value: 'right', label: 'Right' },
    { value: 'left', label: 'Left' }
  ];

  // Sensory assessments with standard options
  const sensoryAssessments = [
    { key: 'skin', label: 'Skin', icon: 'fas fa-hand-paper' },
    { key: 'edema', label: 'Edema', icon: 'fas fa-tint' },
    { key: 'vision', label: 'Vision', icon: 'fas fa-eye' },
    { key: 'sensation', label: 'Sensation', icon: 'fas fa-hand-rock' },
    { key: 'communication', label: 'Communication', icon: 'fas fa-comments' },
    { key: 'hearing', label: 'Hearing', icon: 'fas fa-ear-listen' },
    { key: 'posture', label: 'Posture', icon: 'fas fa-user-tie' },
    { key: 'activityTolerance', label: 'Activity Tolerance', icon: 'fas fa-running' }
  ];

  // Cognition checkboxes
  const cognitionOptions = [
    { key: 'oriented', label: 'Oriented' },
    { key: 'disoriented', label: 'Disoriented' },
    { key: 'confused', label: 'Confused' },
    { key: 'forgetful', label: 'Forgetful' },
    { key: 'depressed', label: 'Depressed' },
    { key: 'safetyJudgement', label: 'Safety Judgement' }
  ];

  // Behavior/Mental Status checkboxes
  const behaviorOptions = [
    { key: 'alert', label: 'Alert' },
    { key: 'oriented', label: 'Oriented' },
    { key: 'cooperative', label: 'Cooperative' },
    { key: 'confused', label: 'Confused' },
    { key: 'impairedJudgement', label: 'Impaired Judgement' },
    { key: 'stmDeficits', label: 'STM Deficits' },
    { key: 'ltmDeficits', label: 'LTM Deficits' }
  ];

  // Handle sensory assessment changes
  const handleAssessmentChange = (assessmentKey, value) => {
    const updatedData = {
      ...data,
      sensoryAssessments: {
        ...data?.sensoryAssessments,
        [assessmentKey]: value
      }
    };
    onChange(updatedData);
  };

  // Handle hand dominance change
  const handleHandDominanceChange = (value) => {
    const updatedData = {
      ...data,
      handDominance: value
    };
    onChange(updatedData);
  };

  // Handle cognition checkbox changes
  const handleCognitionChange = (option, checked) => {
    const currentCognition = data?.cognition || [];
    const updatedCognition = checked
      ? [...currentCognition, option]
      : currentCognition.filter(item => item !== option);
    
    const updatedData = {
      ...data,
      cognition: updatedCognition
    };
    onChange(updatedData);
  };

  // Handle behavior checkbox changes
  const handleBehaviorChange = (option, checked) => {
    const currentBehavior = data?.behaviorMentalStatus || [];
    const updatedBehavior = checked
      ? [...currentBehavior, option]
      : currentBehavior.filter(item => item !== option);
    
    const updatedData = {
      ...data,
      behaviorMentalStatus: updatedBehavior
    };
    onChange(updatedData);
  };

  // Handle comments change
  const handleCommentsChange = (value) => {
    const updatedData = {
      ...data,
      comments: value
    };
    onChange(updatedData);
  };

  return (
    <div className="sensory-skills-section">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-hand-paper"></i>
          <h3>Sensory Assessment</h3>
        </div>
        <p className="section-description">
          Comprehensive sensory, physical, and functional assessment including cognitive and behavioral evaluations
        </p>
      </div>

      {/* Sensory & Physical Assessments */}
      <div className="assessment-group">
        <h4 className="group-title">
          <i className="fas fa-stethoscope"></i>
          Sensory & Physical Assessments
        </h4>
        <div className="assessments-grid">
          {sensoryAssessments.map(assessment => (
            <div key={assessment.key} className="assessment-item">
              <div className="assessment-label">
                <i className={assessment.icon}></i>
                <span>{assessment.label}</span>
              </div>
              <div className="assessment-options">
                {assessmentOptions.map(option => (
                  <label key={option.value} className={`option-label ${option.className}`}>
                    <input
                      type="radio"
                      name={`sensory_${assessment.key}`}
                      value={option.value}
                      checked={data?.sensoryAssessments?.[assessment.key] === option.value}
                      onChange={(e) => handleAssessmentChange(assessment.key, e.target.value)}
                    />
                    <span className="option-text">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hand Dominance */}
      <div className="assessment-group">
        <h4 className="group-title">
          <i className="fas fa-hands"></i>
          Hand Dominance
        </h4>
        <div className="hand-dominance-options">
          {handDominanceOptions.map(option => (
            <label key={option.value} className="hand-dominance-label">
              <input
                type="radio"
                name="handDominance"
                value={option.value}
                checked={data?.handDominance === option.value}
                onChange={(e) => handleHandDominanceChange(e.target.value)}
              />
              <span className="option-text">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cognition */}
      <div className="assessment-group">
        <h4 className="group-title">
          <i className="fas fa-brain"></i>
          Cognition
        </h4>
        <div className="checkbox-grid">
          {cognitionOptions.map(option => (
            <label key={option.key} className="checkbox-label">
              <input
                type="checkbox"
                checked={data?.cognition?.includes(option.key) || false}
                onChange={(e) => handleCognitionChange(option.key, e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              <span className="option-text">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Behavior/Mental Status */}
      <div className="assessment-group">
        <h4 className="group-title">
          <i className="fas fa-user-check"></i>
          Behavior/Mental Status
        </h4>
        <div className="checkbox-grid">
          {behaviorOptions.map(option => (
            <label key={option.key} className="checkbox-label">
              <input
                type="checkbox"
                checked={data?.behaviorMentalStatus?.includes(option.key) || false}
                onChange={(e) => handleBehaviorChange(option.key, e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              <span className="option-text">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="assessment-group">
        <h4 className="group-title">
          <i className="fas fa-comment-medical"></i>
          Additional Clinical Notes
        </h4>
        <div className="comments-section">
          <textarea
            value={data?.comments || ''}
            onChange={(e) => handleCommentsChange(e.target.value)}
            placeholder="Enter detailed sensory assessment notes, specific findings, observations, recommendations, or other relevant clinical information..."
            rows={5}
            className="comments-textarea"
            maxLength={2000}
          />
          <div className="character-count">
            {(data?.comments || '').length} / 2000 characters
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorySkillsSection;