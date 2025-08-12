import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/PatientCaregiverEducationSkillsSection.scss';
import React, { useState, useEffect } from 'react';

const PatientCaregiverEducationSkillsSection = ({ data = {}, onChange, sectionId }) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    educationAreas: {
      woundCare: false,
      diabeticFootExamCare: false,
      insulinAdministration: false,
      glucometerUse: false,
      nutritionalManagement: false,
      medicationAdministration: false,
      painManagement: false,
      oxygenUse: false,
      medicalDevicesUse: false,
      trachCare: false,
      ostomyCare: false,
      otherCares: false,
      caregiverPresent: false,
      satisfactoryReturnDemo: false
    },
    hasActionPlan: '',
    understandsInformation: '',
    comments: ''
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

  // Definición de áreas de educación
  const educationAreas = [
    {
      key: 'woundCare',
      label: 'Wound Care',
      icon: 'fas fa-band-aid',
      description: 'Patient/caregiver education on proper wound care techniques'
    },
    {
      key: 'diabeticFootExamCare',
      label: 'Diabetic Foot Exam/Care',
      icon: 'fas fa-shoe-prints',
      description: 'Education on diabetic foot examination and care procedures'
    },
    {
      key: 'insulinAdministration',
      label: 'Insulin Administration',
      icon: 'fas fa-syringe',
      description: 'Training on proper insulin administration techniques'
    },
    {
      key: 'glucometerUse',
      label: 'Glucometer Use',
      icon: 'fas fa-tint',
      description: 'Education on blood glucose monitoring and device operation'
    },
    {
      key: 'nutritionalManagement',
      label: 'Nutritional Management',
      icon: 'fas fa-apple-alt',
      description: 'Dietary education and nutritional planning guidance'
    },
    {
      key: 'medicationAdministration',
      label: 'Oral/Injected/Infused/Inhaled Medication(s) Administration',
      icon: 'fas fa-pills',
      description: 'Training on various medication administration routes'
    },
    {
      key: 'painManagement',
      label: 'Pain Management',
      icon: 'fas fa-hand-holding-heart',
      description: 'Education on pain assessment and management strategies'
    },
    {
      key: 'oxygenUse',
      label: 'Oxygen Use',
      icon: 'fas fa-lungs',
      description: 'Training on oxygen therapy equipment and safety'
    },
    {
      key: 'medicalDevicesUse',
      label: 'Use of Medical Devices',
      icon: 'fas fa-stethoscope',
      description: 'Education on proper use and maintenance of medical equipment'
    },
    {
      key: 'trachCare',
      label: 'Trach Care',
      icon: 'fas fa-user-md',
      description: 'Tracheostomy care and maintenance procedures'
    },
    {
      key: 'ostomyCare',
      label: 'Ostomy Care',
      icon: 'fas fa-hand-holding-medical',
      description: 'Ostomy care, maintenance, and troubleshooting'
    },
    {
      key: 'otherCares',
      label: 'Other Care(s)',
      icon: 'fas fa-plus-circle',
      description: 'Additional care procedures as needed'
    },
    {
      key: 'caregiverPresent',
      label: 'Caregiver Present at time of visit',
      icon: 'fas fa-users',
      description: 'Caregiver participation and presence during education'
    },
    {
      key: 'satisfactoryReturnDemo',
      label: 'Satisfactory Return Demo',
      icon: 'fas fa-check-circle',
      description: 'Patient/caregiver demonstrates competency in learned skills'
    }
  ];

  // Obtener áreas seleccionadas
  const getSelectedAreas = () => {
    return educationAreas.filter(area => formData.educationAreas[area.key]);
  };

  return (
    <div className="patient-caregiver-education-skills-section">
      {/* Header */}
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-graduation-cap"></i>
          <h3>Patient / Caregiver Education</h3>
        </div>
        <div className="section-description">
          Assessment of patient and caregiver education needs, training provided, and competency demonstration
        </div>
        
        {/* Summary Stats */}
        <div className="assessment-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <i className="fas fa-clipboard-check"></i>
              {getSelectedAreas().length} Education Areas Selected
            </div>
            <div className="stat-item">
              <i className="fas fa-user-graduate"></i>
              {formData.understandsInformation === 'yes' ? 'Understanding Confirmed' : 
               formData.understandsInformation === 'no' ? 'Needs Reinforcement' : 'Assessment Pending'}
            </div>
          </div>
        </div>
      </div>

      {/* Education Areas Selection */}
      <div className="assessment-group">
        <div className="group-header">
          <div className="group-title">
            <i className="fas fa-check-square"></i>
            Patient/Caregiver Independent with
          </div>
          <div className="group-description">
            Select all education areas addressed during this visit
          </div>
        </div>

        <div className="education-areas">
          <div className="education-areas-grid">
            {educationAreas.map((area) => (
              <label
                key={area.key}
                className="education-area-option"
                htmlFor={`education-${area.key}`}
              >
                <input
                  type="checkbox"
                  id={`education-${area.key}`}
                  checked={formData.educationAreas[area.key] || false}
                  onChange={(e) => handleChange(area.key, e.target.checked, 'educationAreas')}
                />
                <div className="education-area-card">
                  <div className="area-icon">
                    <i className={area.icon}></i>
                  </div>
                  <div className="area-content">
                    <h4 className="area-label">{area.label}</h4>
                    <p className="area-description">{area.description}</p>
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

      {/* Assessment Questions */}
      <div className="assessment-group">
        <div className="group-header">
          <div className="group-title">
            <i className="fas fa-question-circle"></i>
            Assessment Questions
          </div>
          <div className="group-description">
            Evaluate patient/caregiver understanding and preparedness
          </div>
        </div>

        <div className="assessment-questions">
          <div className="questions-container">
            {/* Action Plan Question */}
            <div className="question-item">
              <div className="question-header">
                <h4 className="question-text">
                  Does the patient/caregiver have an action plan when disease symptoms exacerbate (e.g., when to call the homecare agency vs. emergency services)?
                </h4>
              </div>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="hasActionPlan"
                    value="yes"
                    checked={formData.hasActionPlan === 'yes'}
                    onChange={(e) => handleChange('hasActionPlan', e.target.value)}
                  />
                  <span className="radio-label">
                    <i className="fas fa-check"></i>
                    Yes
                  </span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="hasActionPlan"
                    value="no"
                    checked={formData.hasActionPlan === 'no'}
                    onChange={(e) => handleChange('hasActionPlan', e.target.value)}
                  />
                  <span className="radio-label">
                    <i className="fas fa-times"></i>
                    No
                  </span>
                </label>
              </div>
            </div>

            {/* Understanding Question */}
            <div className="question-item">
              <div className="question-header">
                <h4 className="question-text">
                  Does patient/caregiver appear to understand all information given?
                </h4>
              </div>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="understandsInformation"
                    value="yes"
                    checked={formData.understandsInformation === 'yes'}
                    onChange={(e) => handleChange('understandsInformation', e.target.value)}
                  />
                  <span className="radio-label">
                    <i className="fas fa-check"></i>
                    Yes
                  </span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="understandsInformation"
                    value="no"
                    checked={formData.understandsInformation === 'no'}
                    onChange={(e) => handleChange('understandsInformation', e.target.value)}
                  />
                  <span className="radio-label">
                    <i className="fas fa-times"></i>
                    No
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="assessment-group">
        <div className="group-header">
          <div className="group-title">
            <i className="fas fa-comment-alt"></i>
            Comments
          </div>
          <div className="group-description">
            Additional notes, observations, or specific education provided
          </div>
        </div>

        <div className="comments-section">
          <div className="comments-container">
            <textarea
              className="comments-textarea"
              placeholder="Document specific education provided, patient/caregiver response, areas needing reinforcement, or any additional observations relevant to education goals..."
              value={formData.comments || ''}
              onChange={(e) => handleChange('comments', e.target.value)}
              rows="4"
            />
            <div className="character-count">
              {(formData.comments || '').length} characters
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Progress */}
      {getSelectedAreas().length > 0 && (
        <div className="assessment-progress">
          <div className="progress-header">
            <h3 className="progress-title">
              <i className="fas fa-chart-line"></i>
              Education Summary
            </h3>
          </div>
          
          <div className="selected-areas-summary">
            <h4 className="summary-subtitle">
              <i className="fas fa-list-check"></i>
              Selected Education Areas ({getSelectedAreas().length})
            </h4>
            <div className="selected-areas">
              {getSelectedAreas().map((area) => (
                <div key={area.key} className="selected-area">
                  <i className={area.icon}></i>
                  {area.label}
                </div>
              ))}
            </div>
          </div>

          <div className="assessment-results">
            <h4 className="results-subtitle">
              <i className="fas fa-clipboard-list"></i>
              Assessment Results
            </h4>
            <div className="results-grid">
              <div className="result-item">
                <span className="result-label">Action Plan Status</span>
                <span className={`result-value ${
                  formData.hasActionPlan === 'yes' ? 'positive' : 
                  formData.hasActionPlan === 'no' ? 'negative' : 'pending'
                }`}>
                  {formData.hasActionPlan === 'yes' ? 'In Place' :
                   formData.hasActionPlan === 'no' ? 'Needs Development' : 'Not Assessed'}
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">Understanding Level</span>
                <span className={`result-value ${
                  formData.understandsInformation === 'yes' ? 'positive' : 
                  formData.understandsInformation === 'no' ? 'negative' : 'pending'
                }`}>
                  {formData.understandsInformation === 'yes' ? 'Demonstrates Understanding' :
                   formData.understandsInformation === 'no' ? 'Requires Reinforcement' : 'Not Assessed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientCaregiverEducationSkillsSection;