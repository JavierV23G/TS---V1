// Enhanced TransfersSection.jsx
import React, { useState } from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/TransfersSection.scss';
import StandardizedTest from './StandardizedTest';
import KatzModal from './standardizedTests/KatzModal';
import BarthelModal from './standardizedTests/BarthelModal';

const TransfersSection = ({ data, onChange, autoSaveMessage }) => {
  // State to manage modal visibility
  const [isKatzModalOpen, setIsKatzModalOpen] = useState(false);
  const [isBarthelModalOpen, setIsBarthelModalOpen] = useState(false);

  // State to store standardized test data
  const [katzData, setKatzData] = useState(data.katz || { isComplete: false });
  const [barthelData, setBarthelData] = useState(data.barthel || { isComplete: false });

  // State for active accordions - SIMPLIFICADO
  const [activeAccordions, setActiveAccordions] = useState({
    transfers: true,
    adls: true,
    tests: true
  });

  // Handler for form changes
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  // Handler for Katz modal submission
  const handleKatzSubmit = (katzFormData) => {
    setKatzData(katzFormData);
    onChange({ ...data, katz: katzFormData });
    setIsKatzModalOpen(false);
  };

  // Handler for Barthel modal submission
  const handleBarthelSubmit = (barthelFormData) => {
    setBarthelData(barthelFormData);
    onChange({ ...data, barthel: barthelFormData });
    setIsBarthelModalOpen(false);
  };

  // Handle accordion toggle
  const toggleAccordion = (accordion) => {
    setActiveAccordions(prev => ({
      ...prev,
      [accordion]: !prev[accordion]
    }));
  };

  // 🔥 TRANSFERENCIAS ORGANIZADAS POR TIPO
  const basicTransfers = [
    { id: 'sitStand', label: 'Sit / Stand', icon: 'fas fa-chair' },
    { id: 'rollTurn', label: 'Roll / Turn', icon: 'fas fa-redo' },
    { id: 'sitSupine', label: 'Sit / Supine', icon: 'fas fa-bed' }
  ];

  const mobilityTransfers = [
    { id: 'auto', label: 'Auto', icon: 'fas fa-car' },
    { id: 'bedWheelchair', label: 'Bed / Wheelchair', icon: 'fas fa-wheelchair' },
    { id: 'scootBridge', label: 'Scoot / Bridge', icon: 'fas fa-arrows-alt-h' }
  ];

  const functionalTransfers = [
    { id: 'toilet', label: 'Toilet', icon: 'fas fa-toilet' },
    { id: 'tub', label: 'Tub', icon: 'fas fa-bath' }
  ];

  // Assistant levels for dropdown options
  const assistLevels = [
    { value: "", label: "Select an Option" },
    { value: "I", label: "I (No Assist)" },
    { value: "MI", label: "MI (Uses Assistive Device)" },
    { value: "SBA", label: "SBA (Stand By Assist)" },
    { value: "CGA", label: "CGA (Contact Guard Assist)" },
    { value: "MIN", label: "MIN (Requires 0-25% Assist)" },
    { value: "MOD", label: "MOD (Requires 26-50% Assist)" },
    { value: "MAX", label: "MAX (Requires 51-75% Assist)" },
    { value: "TOT", label: "TOT (Requires 76-99% Assist)" },
    { value: "DEP", label: "DEP (100% Assist)" },
    { value: "S", label: "S (Set up/Supervision)" }
  ];

  // 🔥 ADL SKILLS ORGANIZADAS POR CATEGORÍA
  const personalCareSkills = [
    { id: 'grooming', label: 'Grooming / Hygiene', icon: 'fas fa-shower' },
    { id: 'toileting', label: 'Toileting', icon: 'fas fa-toilet' },
    { id: 'functionalMobility', label: 'Functional Mobility', icon: 'fas fa-walking' }
  ];

  const domesticSkills = [
    { id: 'telephoneUse', label: 'Telephone Use', icon: 'fas fa-phone' },
    { id: 'mealPreparation', label: 'Meal Preparation', icon: 'fas fa-utensils' },
    { id: 'medicationManagement', label: 'Medication Management', icon: 'fas fa-pills' }
  ];

  // Assistance level colors for visual feedback
  const assistLevelColors = {
    'I': '#22c55e',      // Green - Independent
    'MI': '#3b82f6',     // Blue - Minimal help
    'SBA': '#06b6d4',    // Cyan - Stand by
    'CGA': '#8b5cf6',    // Purple - Contact guard
    'MIN': '#eab308',    // Yellow - Minimal assist
    'MOD': '#f59e0b',    // Orange - Moderate assist
    'MAX': '#f97316',    // Red-orange - Max assist
    'TOT': '#ef4444',    // Red - Total assist
    'DEP': '#dc2626',    // Dark red - Dependent
    'S': '#10b981'       // Teal - Supervision
  };

  return (
    <div className="transfers-section-container">
      {/* SECCIÓN 1: Transfers / Functional Independence */}
      <div className="form-section">
        <div className="section-title">
          <h2>
            <i className="fas fa-exchange-alt"></i>
            Transfers / Functional Independence
          </h2>
          <span className={`autosaved-badge ${autoSaveMessage ? 'visible' : ''}`}>
            <i className="fas fa-check-circle"></i>
            {autoSaveMessage || 'AUTOSAVED'}
          </span>
        </div>

        <div className="transfers-categories">
          {/* Basic Transfers */}
          <div className="transfer-category">
            <h4 className="category-title">
              <i className="fas fa-user"></i>
              Basic Transfers
            </h4>
            <div className="transfers-grid">
              {basicTransfers.map(transfer => (
                <div className="transfer-item" key={transfer.id}>
                  <div className="transfer-header">
                    <i className={transfer.icon}></i>
                    <label>{transfer.label}</label>
                  </div>
                  <select 
                    value={data[transfer.id] || ''}
                    onChange={(e) => handleChange(transfer.id, e.target.value)}
                    className={data[transfer.id] ? `selected level-${data[transfer.id]}` : ''}
                    style={{
                      '--level-color': data[transfer.id] ? assistLevelColors[data[transfer.id]] || '#6b7280' : '#6b7280'
                    }}
                  >
                    {assistLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Mobility Transfers */}
          <div className="transfer-category">
            <h4 className="category-title">
              <i className="fas fa-wheelchair"></i>
              Mobility Transfers
            </h4>
            <div className="transfers-grid">
              {mobilityTransfers.map(transfer => (
                <div className="transfer-item" key={transfer.id}>
                  <div className="transfer-header">
                    <i className={transfer.icon}></i>
                    <label>{transfer.label}</label>
                  </div>
                  <select 
                    value={data[transfer.id] || ''}
                    onChange={(e) => handleChange(transfer.id, e.target.value)}
                    className={data[transfer.id] ? `selected level-${data[transfer.id]}` : ''}
                    style={{
                      '--level-color': data[transfer.id] ? assistLevelColors[data[transfer.id]] || '#6b7280' : '#6b7280'
                    }}
                  >
                    {assistLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Functional Transfers */}
          <div className="transfer-category">
            <h4 className="category-title">
              <i className="fas fa-home"></i>
              Functional Transfers
            </h4>
            <div className="transfers-grid">
              {functionalTransfers.map(transfer => (
                <div className="transfer-item" key={transfer.id}>
                  <div className="transfer-header">
                    <i className={transfer.icon}></i>
                    <label>{transfer.label}</label>
                  </div>
                  <select 
                    value={data[transfer.id] || ''}
                    onChange={(e) => handleChange(transfer.id, e.target.value)}
                    className={data[transfer.id] ? `selected level-${data[transfer.id]}` : ''}
                    style={{
                      '--level-color': data[transfer.id] ? assistLevelColors[data[transfer.id]] || '#6b7280' : '#6b7280'
                    }}
                  >
                    {assistLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assistance Level Guide */}
        <div className="assistance-guide">
          <div className="guide-header">
            <i className="fas fa-info-circle"></i>
            <h4>Assistance Level Guide</h4>
          </div>
          <div className="assistance-levels">
            {Object.entries(assistLevelColors).map(([level, color]) => (
              <div className="level-badge" key={level} style={{ '--badge-color': color }}>
                <span className="level-code">{level}</span>
                <span className="level-name">
                  {assistLevels.find(l => l.value === level)?.label.split(' ')[0] || level}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-wheelchair"></i>
              Does patient have a wheelchair?
            </label>
            <select 
              value={data.hasWheelchair || ''}
              onChange={(e) => handleChange('hasWheelchair', e.target.value)}
            >
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-info-circle"></i>
              Additional Information
            </label>
            <textarea 
              value={data.transfersAdditional || ''}
              onChange={(e) => handleChange('transfersAdditional', e.target.value)}
              rows={3}
              placeholder="Additional information about transfers and functional independence..."
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: ADL / Self Care Skills */}
      <div className="form-section">
        <div className="section-title">
          <h2>
            <i className="fas fa-hands-helping"></i>
            ADL / Self Care Skills
          </h2>
        </div>

        <div className="adl-categories">
          {/* Personal Care Skills */}
          <div className="adl-category">
            <h4 className="category-title">
              <i className="fas fa-user-nurse"></i>
              Personal Care
            </h4>
            <div className="adl-skills-grid">
              {personalCareSkills.map(skill => (
                <div className="adl-skill" key={skill.id}>
                  <div className="skill-header">
                    <div className="skill-label">
                      <i className={skill.icon}></i>
                      <label>{skill.label}</label>
                    </div>
                    <select 
                      value={data[skill.id] || ''}
                      onChange={(e) => handleChange(skill.id, e.target.value)}
                      className={data[skill.id] ? `selected level-${data[skill.id]}` : ''}
                      style={{
                        '--level-color': data[skill.id] ? assistLevelColors[data[skill.id]] || '#6b7280' : '#6b7280'
                      }}
                    >
                      <option value="">Select an option</option>
                      <option value="I">I</option>
                      <option value="MI">MI</option>
                      <option value="SBA">SBA</option>
                      <option value="CGA">CGA</option>
                      <option value="MIN">MIN</option>
                      <option value="MOD">MOD</option>
                      <option value="MAX">MAX</option>
                      <option value="TOT">TOT</option>
                      <option value="DEP">DEP</option>
                      <option value="S">S</option>
                    </select>
                  </div>
                  <textarea 
                    value={data[`${skill.id}Comments`] || ''}
                    onChange={(e) => handleChange(`${skill.id}Comments`, e.target.value)}
                    placeholder="Comments"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Domestic Skills */}
          <div className="adl-category">
            <h4 className="category-title">
              <i className="fas fa-home"></i>
              Domestic Skills
            </h4>
            <div className="adl-skills-grid">
              {domesticSkills.map(skill => (
                <div className="adl-skill" key={skill.id}>
                  <div className="skill-header">
                    <div className="skill-label">
                      <i className={skill.icon}></i>
                      <label>{skill.label}</label>
                    </div>
                    <select 
                      value={data[skill.id] || ''}
                      onChange={(e) => handleChange(skill.id, e.target.value)}
                      className={data[skill.id] ? `selected level-${data[skill.id]}` : ''}
                      style={{
                        '--level-color': data[skill.id] ? assistLevelColors[data[skill.id]] || '#6b7280' : '#6b7280'
                      }}
                    >
                      <option value="">Select an option</option>
                      <option value="I">I</option>
                      <option value="MI">MI</option>
                      <option value="SBA">SBA</option>
                      <option value="CGA">CGA</option>
                      <option value="MIN">MIN</option>
                      <option value="MOD">MOD</option>
                      <option value="MAX">MAX</option>
                      <option value="TOT">TOT</option>
                      <option value="DEP">DEP</option>
                      <option value="S">S</option>
                    </select>
                  </div>
                  <textarea 
                    value={data[`${skill.id}Comments`] || ''}
                    onChange={(e) => handleChange(`${skill.id}Comments`, e.target.value)}
                    placeholder="Comments"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-comment-medical"></i>
              Additional Information about ADL / Self Care Skills
            </label>
            <textarea 
              value={data.adlAdditional || ''}
              onChange={(e) => handleChange('adlAdditional', e.target.value)}
              rows={3}
              placeholder="Additional information about ADL / Self Care Skills..."
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: Standardized Tests */}
      <div className="form-section">
        <div className="section-title">
          <h2>
            <i className="fas fa-clipboard-check"></i>
            Standardized Tests
          </h2>
        </div>

        <div className="standardized-tests-container">
          <div className="tests-grid">
            <StandardizedTest 
              title="Katz Index" 
              description="Activities of Daily Living Scale"
              isComplete={katzData.isComplete}
              score={katzData.isComplete ? katzData.totalScore : null}
              onOpen={() => setIsKatzModalOpen(true)}
              icon="fas fa-clipboard-list"
            />
            
            <StandardizedTest 
              title="Barthel Index" 
              description="Functional Independence Measure"
              isComplete={barthelData.isComplete}
              score={barthelData.isComplete ? barthelData.totalScore : null}
              onOpen={() => setIsBarthelModalOpen(true)}
              icon="fas fa-tasks"
            />
          </div>

          {(katzData.isComplete || barthelData.isComplete) && (
            <div className="tests-summary">
              <h4>
                <i className="fas fa-chart-bar"></i>
                Test Results Summary
              </h4>
              <div className="summary-cards">
                {katzData.isComplete && (
                  <div className="summary-card">
                    <div className="card-header">
                      <i className="fas fa-clipboard-list"></i>
                      <span>Katz Index</span>
                    </div>
                    <div className="card-content">
                      <div className="score">Score: {katzData.totalScore}/6</div>
                      <div className="interpretation">
                        {katzData.totalScore >= 5 ? 'High Independence' : 
                         katzData.totalScore >= 3 ? 'Moderate Independence' : 
                         'Low Independence'}
                      </div>
                    </div>
                  </div>
                )}
                
                {barthelData.isComplete && (
                  <div className="summary-card">
                    <div className="card-header">
                      <i className="fas fa-tasks"></i>
                      <span>Barthel Index</span>
                    </div>
                    <div className="card-content">
                      <div className="score">Score: {barthelData.totalScore}/100</div>
                      <div className="interpretation">
                        {barthelData.totalScore >= 80 ? 'Independent' : 
                         barthelData.totalScore >= 60 ? 'Mild Dependency' :
                         barthelData.totalScore >= 40 ? 'Moderate Dependency' : 
                         'Severe Dependency'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals for Katz and Barthel */}
      <KatzModal 
        isOpen={isKatzModalOpen}
        onClose={(data) => {
          if (!data) setIsKatzModalOpen(false);
          else handleKatzSubmit(data);
        }}
        initialData={katzData}
      />
      
      <BarthelModal 
        isOpen={isBarthelModalOpen}
        onClose={(data) => {
          if (!data) setIsBarthelModalOpen(false);
          else handleBarthelSubmit(data);
        }}
        initialData={barthelData}
      />
    </div>
  );
};

export default TransfersSection;