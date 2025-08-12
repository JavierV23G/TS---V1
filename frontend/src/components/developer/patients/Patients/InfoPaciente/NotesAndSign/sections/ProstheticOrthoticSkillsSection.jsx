import React, { useState } from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/ProstheticOrthoticSkillsSection.scss';

const ProstheticOrthoticSkillsSection = ({ data, onChange, sectionId, config }) => {
  // Prosthetic options
  const prostheticTypes = [
    { value: 'aka', label: 'AKA (Above Knee)', description: 'Above knee amputation prosthetic' },
    { value: 'bka', label: 'BKA (Below Knee)', description: 'Below knee amputation prosthetic' }
  ];

  // Orthotic types
  const orthoticTypes = [
    { value: 'kafo', label: 'KAFO (Knee/Ankle/Foot Orthosis)', description: 'Knee, ankle, and foot orthotic device' },
    { value: 'hkafo', label: 'HKAFO (Hip/Knee/Ankle/Foot Orthosis)', description: 'Hip, knee, ankle, and foot orthotic device' },
    { value: 'lso', label: 'LSO (Lumbar/Sacral Orthosis)', description: 'Lumbar and sacral spine orthotic' },
    { value: 'rgo', label: 'RGO (Reciprocating Gait Orthosis)', description: 'Reciprocating gait orthotic system' },
    { value: 'tlso', label: 'TLSO (Thoraco/Lumbar/Sacral Orthosis)', description: 'Thoracic, lumbar, and sacral spine orthotic' },
    { value: 'who', label: 'WHO (Wrist/Hand Orthosis)', description: 'Wrist and hand orthotic device' },
    { value: 'swedish_knee_cage', label: 'Swedish Knee Cage', description: 'Swedish knee cage orthotic' }
  ];

  // Assessment types (same for both prosthetic and orthotic)
  const assessmentTypes = [
    { value: 'donning_doffing', label: 'Donning/Doffing', description: 'Putting on and taking off device' },
    { value: 'evaluation', label: 'Evaluation', description: 'Assessment of device function and fit' },
    { value: 'both', label: 'Both', description: 'Both donning/doffing and evaluation' }
  ];

  // Initialize data structure
  const initializeData = () => {
    return {
      prosthetics: data?.prosthetics || [],
      orthotics: data?.orthotics || [],
      ...data
    };
  };

  // Handle adding new prosthetic
  const addProsthetic = () => {
    const currentData = initializeData();
    if (currentData.prosthetics.length < 10) {
      const newProsthetic = {
        id: Date.now().toString(),
        type: '',
        assessment: ''
      };
      const updatedData = {
        ...currentData,
        prosthetics: [...currentData.prosthetics, newProsthetic]
      };
      onChange(updatedData);
    }
  };

  // Handle removing prosthetic
  const removeProsthetic = (id) => {
    const currentData = initializeData();
    const updatedData = {
      ...currentData,
      prosthetics: currentData.prosthetics.filter(item => item.id !== id)
    };
    onChange(updatedData);
  };

  // Handle prosthetic changes
  const updateProsthetic = (id, field, value) => {
    const currentData = initializeData();
    const updatedData = {
      ...currentData,
      prosthetics: currentData.prosthetics.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    };
    onChange(updatedData);
  };

  // Handle adding new orthotic
  const addOrthotic = () => {
    const currentData = initializeData();
    if (currentData.orthotics.length < 10) {
      const newOrthotic = {
        id: Date.now().toString(),
        type: '',
        assessment: ''
      };
      const updatedData = {
        ...currentData,
        orthotics: [...currentData.orthotics, newOrthotic]
      };
      onChange(updatedData);
    }
  };

  // Handle removing orthotic
  const removeOrthotic = (id) => {
    const currentData = initializeData();
    const updatedData = {
      ...currentData,
      orthotics: currentData.orthotics.filter(item => item.id !== id)
    };
    onChange(updatedData);
  };

  // Handle orthotic changes
  const updateOrthotic = (id, field, value) => {
    const currentData = initializeData();
    const updatedData = {
      ...currentData,
      orthotics: currentData.orthotics.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    };
    onChange(updatedData);
  };

  // Get current data
  const currentData = initializeData();

  // Get completed items count
  const getCompletedProstheticsCount = () => {
    return currentData.prosthetics.filter(item => item.type && item.assessment).length;
  };

  const getCompletedOrthoticsCount = () => {
    return currentData.orthotics.filter(item => item.type && item.assessment).length;
  };

  return (
    <div className="prosthetic-orthotic-skills-section">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-hand-holding-medical"></i>
          <h3>Prosthetic & Orthotic Assessment</h3>
        </div>
        <p className="section-description">
          Comprehensive evaluation of prosthetic and orthotic devices, including donning/doffing skills and functional assessments
        </p>
        <div className="assessment-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <i className="fas fa-user-injured"></i>
              <span>{currentData.prosthetics.length} prosthetics ({getCompletedProstheticsCount()} completed)</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-wheelchair"></i>
              <span>{currentData.orthotics.length} orthotics ({getCompletedOrthoticsCount()} completed)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prosthetic Section */}
      <div className="assessment-group prosthetic-section">
        <div className="group-header">
          <h4 className="group-title">
            <i className="fas fa-user-injured"></i>
            Prosthetic Devices
          </h4>
          <p className="group-description">
            Assessment of prosthetic limbs and related functional skills (Maximum: 10 items)
          </p>
        </div>

        <div className="add-item-container">
          <button 
            className="add-item-btn"
            onClick={addProsthetic}
            disabled={currentData.prosthetics.length >= 10}
          >
            <i className="fas fa-plus"></i>
            Add Prosthetic
            <span className="count">({currentData.prosthetics.length}/10)</span>
          </button>
        </div>

        {currentData.prosthetics.length > 0 && (
          <div className="items-grid">
            {currentData.prosthetics.map((prosthetic, index) => (
              <div key={prosthetic.id} className="item-card prosthetic-card">
                <div className="item-header">
                  <h5 className="item-title">
                    <i className="fas fa-user-injured"></i>
                    Prosthetic #{index + 1}
                  </h5>
                  <button 
                    className="remove-btn"
                    onClick={() => removeProsthetic(prosthetic.id)}
                    title="Remove prosthetic"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="item-fields">
                  <div className="field-group">
                    <label className="field-label">Prosthetic Type</label>
                    <select
                      value={prosthetic.type || ''}
                      onChange={(e) => updateProsthetic(prosthetic.id, 'type', e.target.value)}
                      className="field-select"
                    >
                      <option value="">Select type...</option>
                      {prostheticTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {prosthetic.type && (
                      <div className="field-description">
                        {prostheticTypes.find(t => t.value === prosthetic.type)?.description}
                      </div>
                    )}
                  </div>

                  <div className="field-group">
                    <label className="field-label">Assessment Type</label>
                    <select
                      value={prosthetic.assessment || ''}
                      onChange={(e) => updateProsthetic(prosthetic.id, 'assessment', e.target.value)}
                      className="field-select"
                    >
                      <option value="">Select assessment...</option>
                      {assessmentTypes.map(assessment => (
                        <option key={assessment.value} value={assessment.value}>
                          {assessment.label}
                        </option>
                      ))}
                    </select>
                    {prosthetic.assessment && (
                      <div className="field-description">
                        {assessmentTypes.find(a => a.value === prosthetic.assessment)?.description}
                      </div>
                    )}
                  </div>
                </div>

                {prosthetic.type && prosthetic.assessment && (
                  <div className="completion-indicator">
                    <i className="fas fa-check-circle"></i>
                    <span>Complete</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {currentData.prosthetics.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-user-injured"></i>
            <h5>No Prosthetic Devices Added</h5>
            <p>Click "Add Prosthetic" to begin assessment</p>
          </div>
        )}
      </div>

      {/* Orthotic Section */}
      <div className="assessment-group orthotic-section">
        <div className="group-header">
          <h4 className="group-title">
            <i className="fas fa-wheelchair"></i>
            Orthotic Devices
          </h4>
          <p className="group-description">
            Assessment of orthotic braces and supportive devices (Maximum: 10 items)
          </p>
        </div>

        <div className="add-item-container">
          <button 
            className="add-item-btn"
            onClick={addOrthotic}
            disabled={currentData.orthotics.length >= 10}
          >
            <i className="fas fa-plus"></i>
            Add Orthotic
            <span className="count">({currentData.orthotics.length}/10)</span>
          </button>
        </div>

        {currentData.orthotics.length > 0 && (
          <div className="items-grid">
            {currentData.orthotics.map((orthotic, index) => (
              <div key={orthotic.id} className="item-card orthotic-card">
                <div className="item-header">
                  <h5 className="item-title">
                    <i className="fas fa-wheelchair"></i>
                    Orthotic #{index + 1}
                  </h5>
                  <button 
                    className="remove-btn"
                    onClick={() => removeOrthotic(orthotic.id)}
                    title="Remove orthotic"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="item-fields">
                  <div className="field-group">
                    <label className="field-label">Orthotic Type</label>
                    <select
                      value={orthotic.type || ''}
                      onChange={(e) => updateOrthotic(orthotic.id, 'type', e.target.value)}
                      className="field-select"
                    >
                      <option value="">Select type...</option>
                      {orthoticTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {orthotic.type && (
                      <div className="field-description">
                        {orthoticTypes.find(t => t.value === orthotic.type)?.description}
                      </div>
                    )}
                  </div>

                  <div className="field-group">
                    <label className="field-label">Assessment Type</label>
                    <select
                      value={orthotic.assessment || ''}
                      onChange={(e) => updateOrthotic(orthotic.id, 'assessment', e.target.value)}
                      className="field-select"
                    >
                      <option value="">Select assessment...</option>
                      {assessmentTypes.map(assessment => (
                        <option key={assessment.value} value={assessment.value}>
                          {assessment.label}
                        </option>
                      ))}
                    </select>
                    {orthotic.assessment && (
                      <div className="field-description">
                        {assessmentTypes.find(a => a.value === orthotic.assessment)?.description}
                      </div>
                    )}
                  </div>
                </div>

                {orthotic.type && orthotic.assessment && (
                  <div className="completion-indicator">
                    <i className="fas fa-check-circle"></i>
                    <span>Complete</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {currentData.orthotics.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-wheelchair"></i>
            <h5>No Orthotic Devices Added</h5>
            <p>Click "Add Orthotic" to begin assessment</p>
          </div>
        )}
      </div>

      {/* Progress Summary */}
      {(currentData.prosthetics.length > 0 || currentData.orthotics.length > 0) && (
        <div className="assessment-progress">
          <div className="progress-header">
            <h4 className="progress-title">
              <i className="fas fa-chart-line"></i>
              Assessment Progress
            </h4>
          </div>
          
          <div className="progress-content">
            {currentData.prosthetics.length > 0 && (
              <div className="progress-section">
                <div className="progress-label">
                  <i className="fas fa-user-injured"></i>
                  <span>Prosthetic Devices</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill prosthetic-progress"
                    style={{ 
                      width: currentData.prosthetics.length > 0 
                        ? `${(getCompletedProstheticsCount() / currentData.prosthetics.length) * 100}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
                <div className="progress-text">
                  {getCompletedProstheticsCount()} of {currentData.prosthetics.length} completed
                </div>
              </div>
            )}

            {currentData.orthotics.length > 0 && (
              <div className="progress-section">
                <div className="progress-label">
                  <i className="fas fa-wheelchair"></i>
                  <span>Orthotic Devices</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill orthotic-progress"
                    style={{ 
                      width: currentData.orthotics.length > 0 
                        ? `${(getCompletedOrthoticsCount() / currentData.orthotics.length) * 100}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
                <div className="progress-text">
                  {getCompletedOrthoticsCount()} of {currentData.orthotics.length} completed
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProstheticOrthoticSkillsSection;