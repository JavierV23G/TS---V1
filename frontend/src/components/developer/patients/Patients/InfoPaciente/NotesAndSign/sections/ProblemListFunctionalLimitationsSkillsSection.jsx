import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/ProblemListFunctionalLimitationsSkillsSection.scss';
import React, { useState, useEffect } from 'react';

const ProblemListFunctionalLimitationsSkillsSection = ({ data = {}, onChange, sectionId }) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    problemList: {
      impairedADLSkills: false,
      impairedSafetyAwareness: false,
      decreasedSensation: false,
      impairedCognitionMemory: false,
      decreasedUEROM: false,
      synergisticPatterns: false,
      impairedVisualPerceptualSkills: false,
      decreasedFunctionalStrength: false,
      poorBodyMechanics: false,
      decreasedFunctionalActivityTolerance: false,
      jointHyperHypoMobility: false,
      softTissueSpasm: false,
      hypersensitivity: false
    },
    additionalComments: ''
  });

  // Cargar datos cuando cambie la prop data
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setFormData(prevData => ({
        ...prevData,
        ...data
      }));
    }
  }, [data]);

  // Manejar cambios en el formulario
  const handleChange = (field, value, category = null) => {
    let updatedData;
    
    if (category) {
      updatedData = {
        ...formData,
        [category]: {
          ...formData[category],
          [field]: value
        }
      };
    } else {
      updatedData = {
        ...formData,
        [field]: value
      };
    }
    
    setFormData(updatedData);
    if (onChange) {
      onChange(updatedData);
    }
  };

  // Definición de problemas/limitaciones funcionales
  const problemItems = [
    {
      key: 'impairedADLSkills',
      label: 'Impaired ADL Skills',
      icon: 'fas fa-user-injured',
      description: 'Activities of daily living skills are compromised',
      color: 'red'
    },
    {
      key: 'impairedSafetyAwareness',
      label: 'Impaired Safety Awareness',
      icon: 'fas fa-exclamation-triangle',
      description: 'Decreased awareness of potential safety hazards',
      color: 'orange'
    },
    {
      key: 'decreasedSensation',
      label: 'Decreased Sensation',
      icon: 'fas fa-hand-paper',
      description: 'Reduced sensory perception or tactile awareness',
      color: 'purple'
    },
    {
      key: 'impairedCognitionMemory',
      label: 'Impaired Cognition & Memory',
      icon: 'fas fa-brain',
      description: 'Cognitive processing and memory function deficits',
      color: 'indigo'
    },
    {
      key: 'decreasedUEROM',
      label: 'Decreased UE ROM',
      icon: 'fas fa-hand-holding',
      description: 'Limited upper extremity range of motion',
      color: 'blue'
    },
    {
      key: 'synergisticPatterns',
      label: 'Synergistic Patterns',
      icon: 'fas fa-arrows-alt',
      description: 'Abnormal movement patterns affecting function',
      color: 'cyan'
    },
    {
      key: 'impairedVisualPerceptualSkills',
      label: 'Impaired Visual Perceptual Skills',
      icon: 'fas fa-eye',
      description: 'Difficulties with visual processing and perception',
      color: 'teal'
    },
    {
      key: 'decreasedFunctionalStrength',
      label: 'Decreased Functional Strength',
      icon: 'fas fa-dumbbell',
      description: 'Reduced strength impacting functional activities',
      color: 'green'
    },
    {
      key: 'poorBodyMechanics',
      label: 'Poor Body Mechanics',
      icon: 'fas fa-user-slash',
      description: 'Improper body positioning and movement patterns',
      color: 'yellow'
    },
    {
      key: 'decreasedFunctionalActivityTolerance',
      label: 'Decreased Functional Activity Tolerance',
      icon: 'fas fa-battery-quarter',
      description: 'Reduced endurance for functional activities',
      color: 'amber'
    },
    {
      key: 'jointHyperHypoMobility',
      label: 'Joint Hyper/Hypo Mobility',
      icon: 'fas fa-bone',
      description: 'Joint mobility issues affecting function',
      color: 'brown'
    },
    {
      key: 'softTissueSpasm',
      label: 'Soft Tissue Spasm/Restriction',
      icon: 'fas fa-compress-arrows-alt',
      description: 'Muscle spasms or soft tissue restrictions',
      color: 'gray'
    },
    {
      key: 'hypersensitivity',
      label: 'Hypersensitivity',
      icon: 'fas fa-bolt',
      description: 'Heightened sensitivity affecting function',
      color: 'pink'
    }
  ];

  // Obtener problemas seleccionados
  const getSelectedProblems = () => {
    return problemItems.filter(problem => formData.problemList[problem.key]);
  };

  return (
    <div className="problem-list-functional-limitations-skills-section">
      {/* Header */}
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-list-ul"></i>
          <h3>Problem List / Functional Limitations</h3>
        </div>
        <div className="section-description">
          Identify and document functional limitations and problems impacting patient's ability to perform daily activities
        </div>
        
        {/* Summary Stats */}
        <div className="assessment-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <i className="fas fa-check-square"></i>
              {getSelectedProblems().length} Problems Identified
            </div>
            <div className="stat-item">
              <i className="fas fa-clipboard-list"></i>
              {problemItems.length - getSelectedProblems().length} Not Selected
            </div>
            <div className="stat-item">
              <i className="fas fa-percentage"></i>
              {Math.round((getSelectedProblems().length / problemItems.length) * 100)}% Coverage
            </div>
          </div>
        </div>
      </div>

      {/* Problem List Selection */}
      <div className="assessment-group">
        <div className="group-header">
          <div className="group-title">
            <i className="fas fa-tasks"></i>
            Functional Limitations Assessment
          </div>
          <div className="group-description">
            Select all functional limitations and problems identified during evaluation
          </div>
        </div>

        <div className="problem-list-selection">
          <div className="problem-items-grid">
            {problemItems.map((problem) => (
              <label
                key={problem.key}
                className="problem-item-option"
                htmlFor={`problem-${problem.key}`}
              >
                <input
                  type="checkbox"
                  id={`problem-${problem.key}`}
                  checked={formData.problemList[problem.key] || false}
                  onChange={(e) => handleChange(problem.key, e.target.checked, 'problemList')}
                />
                <div className={`problem-item-card ${problem.color}`}>
                  <div className="problem-icon">
                    <i className={problem.icon}></i>
                  </div>
                  <div className="problem-content">
                    <h4 className="problem-label">{problem.label}</h4>
                    <p className="problem-description">{problem.description}</p>
                  </div>
                  <div className="selection-indicator">
                    <i className="fas fa-check"></i>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Comments */}
      <div className="assessment-group">
        <div className="group-header">
          <div className="group-title">
            <i className="fas fa-comment-alt"></i>
            Additional Comments
          </div>
          <div className="group-description">
            Provide additional details about identified problems or other functional limitations
          </div>
        </div>

        <div className="comments-section">
          <div className="comments-container">
            <textarea
              className="comments-textarea"
              placeholder="Document additional functional limitations, specific manifestations of selected problems, contributing factors, or other relevant observations that impact the patient's functional status..."
              value={formData.additionalComments || ''}
              onChange={(e) => handleChange('additionalComments', e.target.value)}
              rows="4"
            />
            <div className="character-count">
              {(formData.additionalComments || '').length} characters
            </div>
          </div>
        </div>
      </div>

      {/* Selected Problems Summary */}
      {getSelectedProblems().length > 0 && (
        <div className="selected-problems-summary">
          <div className="summary-header">
            <h3 className="summary-title">
              <i className="fas fa-clipboard-check"></i>
              Identified Functional Limitations ({getSelectedProblems().length})
            </h3>
          </div>
          
          <div className="selected-problems-grid">
            {getSelectedProblems().map((problem) => (
              <div key={problem.key} className={`selected-problem-card ${problem.color}`}>
                <div className="selected-problem-icon">
                  <i className={problem.icon}></i>
                </div>
                <div className="selected-problem-content">
                  <h4 className="selected-problem-name">{problem.label}</h4>
                  <p className="selected-problem-desc">{problem.description}</p>
                </div>
                <div className="priority-indicator">
                  <i className="fas fa-exclamation"></i>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-recommendations">
            <div className="recommendations-header">
              <i className="fas fa-lightbulb"></i>
              Clinical Considerations
            </div>
            <div className="recommendations-content">
              <div className="recommendation-item">
                <i className="fas fa-arrow-right"></i>
                Consider impact of selected limitations on treatment planning
              </div>
              <div className="recommendation-item">
                <i className="fas fa-arrow-right"></i>
                Address prioritized problems in goal setting and interventions
              </div>
              <div className="recommendation-item">
                <i className="fas fa-arrow-right"></i>
                Monitor progress and reassess functional limitations regularly
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemListFunctionalLimitationsSkillsSection;