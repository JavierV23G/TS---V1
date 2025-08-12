import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/RehabPotentialSkillsSection.scss';
import React, { useState, useEffect } from 'react';

const RehabPotentialSkillsSection = ({ data = {}, onChange, sectionId, config }) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    rehabPotential: '',
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

  // Detectar tipo de disciplina desde config o URL para mostrar la opción correcta
  const getDisciplineType = () => {
    // Intentar obtener disciplina desde config
    if (config?.discipline) {
      return config.discipline.toUpperCase();
    }
    
    // Fallback: detectar desde la URL o context
    const currentPath = window.location.pathname;
    if (currentPath.includes('physical-therapy') || currentPath.includes('pt')) {
      return 'PT';
    } else if (currentPath.includes('occupational-therapy') || currentPath.includes('ot')) {
      return 'OT';
    } else if (currentPath.includes('speech-therapy') || currentPath.includes('st')) {
      return 'ST';
    }
    
    // Default PT si no se puede determinar
    return 'PT';
  };

  const disciplineType = getDisciplineType();

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    const updatedData = {
      ...formData,
      [field]: value
    };
    
    setFormData(updatedData);
    if (onChange) {
      onChange(updatedData);
    }
  };

  // Definición de opciones de rehabilitación
  const rehabOptions = [
    {
      value: 'excellent',
      label: 'Excellent for stated goals',
      icon: 'fas fa-star',
      description: 'Patient demonstrates excellent potential to achieve rehabilitation goals',
      color: 'excellent'
    },
    {
      value: 'good',
      label: 'Good for stated goals',
      icon: 'fas fa-thumbs-up',
      description: 'Patient shows good potential with likely successful outcomes',
      color: 'good'
    },
    {
      value: 'fair',
      label: 'Fair for stated goals',
      icon: 'fas fa-hand-paper',
      description: 'Patient has fair potential with moderate expected outcomes',
      color: 'fair'
    },
    {
      value: 'not-candidate',
      label: `Not a candidate for ${disciplineType}`,
      icon: 'fas fa-times-circle',
      description: `Patient is not appropriate for ${disciplineType} services at this time`,
      color: 'not-candidate'
    }
  ];

  // Obtener información de la opción seleccionada
  const getSelectedOptionInfo = () => {
    return rehabOptions.find(option => option.value === formData.rehabPotential);
  };

  const selectedOption = getSelectedOptionInfo();

  return (
    <div className="rehab-potential-skills-section">
      {/* Header */}
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-chart-line"></i>
          <h3>Rehabilitation Potential</h3>
        </div>
        <div className="section-description">
          Assess patient's potential for achieving rehabilitation goals and appropriateness for {disciplineType} services
        </div>
        
        {/* Current Assessment */}
        {selectedOption && (
          <div className="current-assessment">
            <div className={`assessment-badge ${selectedOption.color}`}>
              <i className={selectedOption.icon}></i>
              <span>Current Assessment: {selectedOption.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Rehabilitation Potential Assessment */}
      <div className="assessment-group">
        <div className="group-header">
          <div className="group-title">
            <i className="fas fa-clipboard-check"></i>
            Rehabilitation Potential Assessment
          </div>
          <div className="group-description">
            Select the most appropriate rehabilitation potential based on clinical evaluation
          </div>
        </div>

        <div className="rehab-options-section">
          <div className="rehab-options-container">
            {rehabOptions.map((option) => (
              <label
                key={option.value}
                className="rehab-option"
                htmlFor={`rehab-${option.value}`}
              >
                <input
                  type="radio"
                  id={`rehab-${option.value}`}
                  name="rehabPotential"
                  value={option.value}
                  checked={formData.rehabPotential === option.value}
                  onChange={(e) => handleChange('rehabPotential', e.target.value)}
                />
                <div className={`rehab-option-card ${option.color}`}>
                  <div className="option-icon">
                    <i className={option.icon}></i>
                  </div>
                  <div className="option-content">
                    <h4 className="option-label">{option.label}</h4>
                    <p className="option-description">{option.description}</p>
                  </div>
                  <div className="selection-indicator">
                    <div className="radio-dot"></div>
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
            Provide rationale for rehabilitation potential assessment and any relevant factors
          </div>
        </div>

        <div className="comments-section">
          <div className="comments-container">
            <textarea
              className="comments-textarea"
              placeholder="Document specific factors influencing rehabilitation potential including:&#10;&#10;• Patient motivation and engagement level&#10;• Cognitive status and learning capacity&#10;• Support system and home environment&#10;• Medical complexity and comorbidities&#10;• Previous therapy experience and outcomes&#10;• Functional baseline and recovery trajectory&#10;• Barriers to participation&#10;• Prognostic indicators..."
              value={formData.additionalComments || ''}
              onChange={(e) => handleChange('additionalComments', e.target.value)}
              rows="6"
            />
            <div className="character-count">
              {(formData.additionalComments || '').length} characters
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Rationale */}
      {selectedOption && (
        <div className="clinical-rationale">
          <div className="rationale-header">
            <h3 className="rationale-title">
              <i className="fas fa-lightbulb"></i>
              Clinical Rationale for {selectedOption.label}
            </h3>
          </div>
          
          <div className={`rationale-content ${selectedOption.color}`}>
            <div className="rationale-explanation">
              <div className="explanation-icon">
                <i className={selectedOption.icon}></i>
              </div>
              <div className="explanation-text">
                <h4 className="explanation-title">Assessment Implications</h4>
                <div className="explanation-details">
                  {selectedOption.value === 'excellent' && (
                    <div className="implication-items">
                      <div className="implication-item">
                        <i className="fas fa-arrow-right"></i>
                        Strong likelihood of achieving functional goals within projected timeframe
                      </div>
                      <div className="implication-item">
                        <i className="fas fa-arrow-right"></i>
                        Patient demonstrates optimal conditions for rehabilitation success
                      </div>
                      <div className="implication-item">
                        <i className="fas fa-arrow-right"></i>
                        May progress beyond initial goals with comprehensive intervention
                      </div>
                    </div>
                  )}
                  {selectedOption.value === 'good' && (
                    <div className="implication-items">
                      <div className="implication-item">
                        <i className="fas fa-arrow-right"></i>
                        High probability of meaningful functional improvements
                      </div>
                      <div className="implication-item">
                        <i className="fas fa-arrow-right"></i>
                        Patient shows favorable prognostic indicators
                      </div>
                      <div className="implication-item">
                        <i className="fas fa-arrow-right"></i>
                        Goal achievement expected with consistent intervention
                      </div>
                    </div>
                  )}
                  {selectedOption.value === 'fair' && (
                    <div className="implication-items">
                      <div className="implication-item">
                        <i className="fas fa-arrow-right"></i>
                        Moderate potential with realistic goal modifications
                      </div>
                      <div className="implication-item">
                        <i className="fas fa-arrow-right"></i>
                        May require extended timeline or adjusted expectations
                      </div>
                      <div className="implication-item">
                        <i className="fas fa-arrow-right"></i>
                        Benefits possible with consistent effort and support
                      </div>
                    </div>
                  )}
                  {selectedOption.value === 'not-candidate' && (
                    <div className="implication-items">
                      <div className="implication-item">
                        <i className="fas fa-arrow-right"></i>
                        Current medical/functional status precludes therapy benefit
                      </div>
                      <div className="implication-item">
                        <i className="fas fa-arrow-right"></i>
                        Consider reassessment when status changes
                      </div>
                      <div className="implication-item">
                        <i className="fas fa-arrow-right"></i>
                        Alternative interventions may be more appropriate
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="documentation-tips">
              <div className="tips-header">
                <i className="fas fa-info-circle"></i>
                Documentation Tips
              </div>
              <div className="tips-content">
                <div className="tip-item">
                  <i className="fas fa-check"></i>
                  Support assessment with specific clinical findings
                </div>
                <div className="tip-item">
                  <i className="fas fa-check"></i>
                  Consider patient's motivation and participation level
                </div>
                <div className="tip-item">
                  <i className="fas fa-check"></i>
                  Factor in social support and environmental context
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RehabPotentialSkillsSection;