import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/TreatmentAsToleratedBasicPOCSkillsSection.scss';
import React, { useState, useEffect } from 'react';

const TreatmentAsToleratedBasicPOCSkillsSection = ({ data = {}, onChange, sectionId }) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    treatmentOptions: {
      evaluationReEvaluation: false,
      fineMotorCoordination: false,
      adaptiveEquipment: false,
      adlTraining: false,
      orthoticsSplint: false,
      neuroDevelopmentTreatment: false,
      muscleReEducation: false,
      sensoryTreatment: false,
      motorTraining: false,
      strengthTraining: false,
      therapeuticActivities: false,
      manualTherapy: false,
      thermalModalities: false,
      patientCaregiverInvolvement: false
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

  // Definición de opciones de tratamiento
  const treatmentItems = [
    {
      key: 'evaluationReEvaluation',
      label: 'Evaluation/Re-evaluation',
      icon: 'fas fa-clipboard-check',
      description: 'Initial assessment and ongoing re-evaluation of patient status',
      color: 'blue',
      category: 'Assessment'
    },
    {
      key: 'fineMotorCoordination',
      label: 'Fine Motor Coordination',
      icon: 'fas fa-hand-holding',
      description: 'Training to improve precision and dexterity of hand movements',
      color: 'purple',
      category: 'Motor Skills'
    },
    {
      key: 'adaptiveEquipment',
      label: 'Adaptive Equipment',
      icon: 'fas fa-tools',
      description: 'Training in use of assistive devices and adaptive tools',
      color: 'orange',
      category: 'Equipment'
    },
    {
      key: 'adlTraining',
      label: 'ADL Training',
      icon: 'fas fa-user-circle',
      description: 'Activities of daily living skill training and practice',
      color: 'green',
      category: 'Functional'
    },
    {
      key: 'orthoticsSplint',
      label: 'Orthotics/Splint',
      icon: 'fas fa-hand-paper',
      description: 'Splinting, orthotic fitting and training',
      color: 'teal',
      category: 'Equipment'
    },
    {
      key: 'neuroDevelopmentTreatment',
      label: 'Neuro-Development Treatment',
      icon: 'fas fa-brain',
      description: 'Neurodevelopmental treatment approaches and techniques',
      color: 'indigo',
      category: 'Neurological'
    },
    {
      key: 'muscleReEducation',
      label: 'Muscle Re-education',
      icon: 'fas fa-dumbbell',
      description: 'Muscle re-education and motor control training',
      color: 'red',
      category: 'Motor Skills'
    },
    {
      key: 'sensoryTreatment',
      label: 'Sensory Treatment',
      icon: 'fas fa-hand-paper',
      description: 'Sensory integration and processing interventions',
      color: 'pink',
      category: 'Sensory'
    },
    {
      key: 'motorTraining',
      label: 'Motor Training',
      icon: 'fas fa-walking',
      description: 'Gross and fine motor skill development',
      color: 'cyan',
      category: 'Motor Skills'
    },
    {
      key: 'strengthTraining',
      label: 'Strength Training',
      icon: 'fas fa-weight-hanging',
      description: 'Progressive strength training and conditioning',
      color: 'brown',
      category: 'Physical'
    },
    {
      key: 'therapeuticActivities',
      label: 'Therapeutic Activities',
      icon: 'fas fa-puzzle-piece',
      description: 'Purposeful activities to address specific deficits',
      color: 'yellow',
      category: 'Therapeutic'
    },
    {
      key: 'manualTherapy',
      label: 'Manual Therapy',
      icon: 'fas fa-hands',
      description: 'Hands-on therapeutic techniques and mobilization',
      color: 'gray',
      category: 'Physical'
    },
    {
      key: 'thermalModalities',
      label: 'Thermal Modalities',
      icon: 'fas fa-thermometer-half',
      description: 'Heat and cold therapy applications',
      color: 'amber',
      category: 'Modalities'
    },
    {
      key: 'patientCaregiverInvolvement',
      label: 'Pt and CG involved in development of goals and in agreement with POC',
      icon: 'fas fa-users',
      description: 'Patient and caregiver participation in goal setting and plan of care',
      color: 'emerald',
      category: 'Collaboration'
    }
  ];

  // Obtener tratamientos seleccionados
  const getSelectedTreatments = () => {
    return treatmentItems.filter(item => formData.treatmentOptions[item.key]);
  };

  // Agrupar tratamientos por categoría
  const getTreatmentsByCategory = () => {
    const categories = {};
    treatmentItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    return categories;
  };

  const categorizedTreatments = getTreatmentsByCategory();

  return (
    <div className="treatment-as-tolerated-basic-poc-skills-section">
      {/* Header */}
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-medical-kit"></i>
          <h3>Treatment as Tolerated/Basic POC</h3>
        </div>
        <div className="section-description">
          Select all treatment interventions and approaches included in the plan of care as tolerated by patient
        </div>
        
        {/* Summary Stats */}
        <div className="treatment-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <i className="fas fa-check-square"></i>
              {getSelectedTreatments().length} Treatments Selected
            </div>
            <div className="stat-item">
              <i className="fas fa-list-ul"></i>
              {Object.keys(categorizedTreatments).length} Categories Available
            </div>
            <div className="stat-item">
              <i className="fas fa-percentage"></i>
              {Math.round((getSelectedTreatments().length / treatmentItems.length) * 100)}% Coverage
            </div>
          </div>
        </div>
      </div>

      {/* Treatment Selection by Categories */}
      {Object.entries(categorizedTreatments).map(([category, items]) => (
        <div key={category} className="treatment-category-group">
          <div className="category-header">
            <div className="category-title">
              <i className="fas fa-folder-open"></i>
              {category} Interventions
            </div>
            <div className="category-count">
              {items.filter(item => formData.treatmentOptions[item.key]).length} / {items.length} selected
            </div>
          </div>

          <div className="treatment-items-grid">
            {items.map((treatment) => (
              <label
                key={treatment.key}
                className="treatment-item-option"
                htmlFor={`treatment-${treatment.key}`}
              >
                <input
                  type="checkbox"
                  id={`treatment-${treatment.key}`}
                  checked={formData.treatmentOptions[treatment.key] || false}
                  onChange={(e) => handleChange(treatment.key, e.target.checked, 'treatmentOptions')}
                />
                <div className={`treatment-item-card ${treatment.color}`}>
                  <div className="treatment-icon">
                    <i className={treatment.icon}></i>
                  </div>
                  <div className="treatment-content">
                    <h4 className="treatment-label">{treatment.label}</h4>
                    <p className="treatment-description">{treatment.description}</p>
                  </div>
                  <div className="selection-indicator">
                    <i className="fas fa-check"></i>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Additional Comments */}
      <div className="assessment-group">
        <div className="group-header">
          <div className="group-title">
            <i className="fas fa-comment-alt"></i>
            Additional Comments
          </div>
          <div className="group-description">
            Provide additional details about selected treatments, frequency, duration, or specific protocols
          </div>
        </div>

        <div className="comments-section">
          <div className="comments-container">
            <textarea
              className="comments-textarea"
              placeholder="Document additional information about treatment plan including:&#10;&#10;• Specific protocols or techniques to be used&#10;• Treatment frequency and duration&#10;• Progression criteria and parameters&#10;• Patient tolerance considerations&#10;• Modifications based on patient response&#10;• Interdisciplinary coordination notes&#10;• Home program components&#10;• Safety precautions or contraindications..."
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

      {/* Selected Treatments Summary */}
      {getSelectedTreatments().length > 0 && (
        <div className="selected-treatments-summary">
          <div className="summary-header">
            <h3 className="summary-title">
              <i className="fas fa-clipboard-list"></i>
              Selected Treatment Plan ({getSelectedTreatments().length})
            </h3>
          </div>
          
          <div className="selected-treatments-by-category">
            {Object.entries(categorizedTreatments).map(([category, items]) => {
              const selectedInCategory = items.filter(item => formData.treatmentOptions[item.key]);
              if (selectedInCategory.length === 0) return null;

              return (
                <div key={category} className="selected-category-group">
                  <div className="selected-category-header">
                    <i className="fas fa-chevron-right"></i>
                    <span className="category-name">{category}</span>
                    <span className="category-badge">{selectedInCategory.length}</span>
                  </div>
                  <div className="selected-treatments-list">
                    {selectedInCategory.map((treatment) => (
                      <div key={treatment.key} className={`selected-treatment-item ${treatment.color}`}>
                        <i className={treatment.icon}></i>
                        <span className="treatment-name">{treatment.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="plan-recommendations">
            <div className="recommendations-header">
              <i className="fas fa-lightbulb"></i>
              Plan of Care Considerations
            </div>
            <div className="recommendations-content">
              <div className="recommendation-item">
                <i className="fas fa-arrow-right"></i>
                Treatments will be provided as tolerated by patient condition
              </div>
              <div className="recommendation-item">
                <i className="fas fa-arrow-right"></i>
                Progress monitoring and plan modifications based on patient response
              </div>
              <div className="recommendation-item">
                <i className="fas fa-arrow-right"></i>
                Patient and caregiver education integrated throughout interventions
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentAsToleratedBasicPOCSkillsSection;