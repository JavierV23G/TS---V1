import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/TransfersFunctionalIndependenceSkillsSection.scss';

const TransfersFunctionalIndependenceSkillsSection = ({ data, onChange, sectionId, config }) => {
  // Transfer assessment options
  const transferOptions = [
    { value: 'not_tested', label: 'Not Tested', category: 'none' },
    { value: 'i', label: 'I (No Assist)', description: 'Independent', category: 'independent' },
    { value: 'mi', label: 'MI (Uses Assistive Device)', description: 'Modified Independent', category: 'independent' },
    { value: 's', label: 'S (Set up/Supervision)', description: 'Supervision', category: 'supervision' },
    { value: 'sba', label: 'SBA (Stand By Assist)', description: 'Stand By Assist', category: 'supervision' },
    { value: 'min', label: 'MIN (Requires 0-25% Assist)', description: 'Minimal Assist', category: 'assist' },
    { value: 'mod', label: 'MOD (Requires 26-50% Assist)', description: 'Moderate Assist', category: 'assist' },
    { value: 'max', label: 'MAX (Requires 51-75% Assist)', description: 'Maximal Assist', category: 'assist' },
    { value: 'tot', label: 'TOT (Requires 76-99% Assist)', description: 'Total Assist', category: 'dependent' },
    { value: 'dep', label: 'DEP (100% Assist)', description: 'Dependent', category: 'dependent' },
    { value: 'cga', label: 'CGA (Contact Guard Assist)', description: 'Contact Guard Assist', category: 'supervision' }
  ];

  // Transfer activities
  const transferActivities = [
    {
      key: 'sitStand',
      label: 'Sit / Stand',
      icon: 'fas fa-chair',
      description: 'Transition from sitting to standing position'
    },
    {
      key: 'bedWheelchair',
      label: 'Bed / Wheelchair',
      icon: 'fas fa-bed',
      description: 'Transfer between bed and wheelchair'
    },
    {
      key: 'toilet',
      label: 'Toilet',
      icon: 'fas fa-toilet',
      description: 'Transfer to and from toilet'
    },
    {
      key: 'tub',
      label: 'Tub',
      icon: 'fas fa-bath',
      description: 'Transfer into and out of bathtub'
    },
    {
      key: 'auto',
      label: 'Auto',
      icon: 'fas fa-car',
      description: 'Transfer into and out of automobile'
    },
    {
      key: 'rollTurn',
      label: 'Roll / Turn',
      icon: 'fas fa-redo',
      description: 'Rolling and turning in bed'
    },
    {
      key: 'sitSupine',
      label: 'Sit / Supine',
      icon: 'fas fa-arrows-alt-v',
      description: 'Transition from sitting to lying supine'
    },
    {
      key: 'scootBridge',
      label: 'Scoot / Bridge',
      icon: 'fas fa-arrows-alt-h',
      description: 'Scooting and bridging movements'
    }
  ];

  // Wheelchair skills activities
  const wheelchairSkills = [
    {
      key: 'propulsion',
      label: 'Propulsion',
      icon: 'fas fa-wheelchair',
      description: 'Wheelchair propulsion and navigation'
    },
    {
      key: 'pressureRelief',
      label: 'Pressure Relief',
      icon: 'fas fa-compress-arrows-alt',
      description: 'Pressure relief techniques'
    },
    {
      key: 'locks',
      label: 'Locks',
      icon: 'fas fa-lock',
      description: 'Wheelchair brake operation'
    },
    {
      key: 'footRests',
      label: 'Foot Rests',
      icon: 'fas fa-shoe-prints',
      description: 'Footrest management'
    }
  ];

  // Handle transfer assessment changes
  const handleTransferChange = (activityKey, value) => {
    const updatedData = {
      ...data,
      transferAssessments: {
        ...data?.transferAssessments,
        [activityKey]: value
      }
    };
    onChange(updatedData);
  };

  // Handle wheelchair question change
  const handleWheelchairChange = (hasWheelchair) => {
    const updatedData = {
      ...data,
      hasWheelchair: hasWheelchair,
      // Clear wheelchair skills if wheelchair is not present
      ...(hasWheelchair ? {} : { wheelchairSkills: {} })
    };
    onChange(updatedData);
  };

  // Handle wheelchair skills changes
  const handleWheelchairSkillChange = (skillKey, value) => {
    const updatedData = {
      ...data,
      wheelchairSkills: {
        ...data?.wheelchairSkills,
        [skillKey]: value
      }
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

  // Get completed transfers count
  const getCompletedTransfersCount = () => {
    const transfers = data?.transferAssessments || {};
    return Object.values(transfers).filter(value => value && value !== 'not_tested').length;
  };

  // Get completed wheelchair skills count
  const getCompletedWheelchairSkillsCount = () => {
    if (!data?.hasWheelchair) return 0;
    const skills = data?.wheelchairSkills || {};
    return Object.values(skills).filter(value => value && value !== 'not_tested').length;
  };

  // Get assistance level category color
  const getCategoryColor = (value) => {
    const option = transferOptions.find(opt => opt.value === value);
    const categoryColors = {
      'independent': '#10b981',
      'supervision': '#f59e0b',
      'assist': '#ef4444',
      'dependent': '#dc2626',
      'none': '#6b7280'
    };
    return categoryColors[option?.category] || '#6b7280';
  };

  return (
    <div className="transfers-functional-independence-skills-section">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-exchange-alt"></i>
          <h3>Transfers & Functional Independence Assessment</h3>
        </div>
        <p className="section-description">
          Comprehensive evaluation of transfer abilities, functional mobility, and wheelchair skills assessment
        </p>
        <div className="assessment-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <i className="fas fa-arrows-alt"></i>
              <span>{getCompletedTransfersCount()} of {transferActivities.length} transfers assessed</span>
            </div>
            {data?.hasWheelchair && (
              <div className="stat-item">
                <i className="fas fa-wheelchair"></i>
                <span>{getCompletedWheelchairSkillsCount()} of {wheelchairSkills.length} wheelchair skills assessed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Activities Assessment */}
      <div className="assessment-group transfer-activities">
        <div className="group-header">
          <h4 className="group-title">
            <i className="fas fa-arrows-alt"></i>
            Transfer Activities Assessment
          </h4>
          <p className="group-description">
            Evaluate the level of assistance required for various transfer activities
          </p>
        </div>

        <div className="activities-grid">
          {transferActivities.map((activity) => (
            <div key={activity.key} className="activity-assessment">
              <div className="activity-header">
                <div className="activity-title">
                  <i className={activity.icon}></i>
                  <h5>{activity.label}</h5>
                </div>
                <p className="activity-description">{activity.description}</p>
              </div>
              
              <div className="assessment-options">
                <select
                  value={data?.transferAssessments?.[activity.key] || 'not_tested'}
                  onChange={(e) => handleTransferChange(activity.key, e.target.value)}
                  className="assessment-select"
                  style={{
                    borderColor: getCategoryColor(data?.transferAssessments?.[activity.key])
                  }}
                >
                  {transferOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {data?.transferAssessments?.[activity.key] && 
                 data.transferAssessments[activity.key] !== 'not_tested' && (
                  <div 
                    className="level-indicator"
                    style={{
                      backgroundColor: getCategoryColor(data.transferAssessments[activity.key])
                    }}
                  >
                    {transferOptions.find(opt => opt.value === data.transferAssessments[activity.key])?.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wheelchair Question */}
      <div className="assessment-group wheelchair-question">
        <div className="group-header">
          <h4 className="group-title">
            <i className="fas fa-wheelchair"></i>
            Wheelchair Assessment
          </h4>
          <p className="group-description">
            Determine if patient uses a wheelchair and assess related skills
          </p>
        </div>

        <div className="wheelchair-inquiry">
          <div className="question-container">
            <h5 className="question-label">Does patient have a wheelchair?</h5>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="hasWheelchair"
                  checked={data?.hasWheelchair === true}
                  onChange={() => handleWheelchairChange(true)}
                />
                <span className="radio-label">
                  <i className="fas fa-check"></i>
                  Yes
                </span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="hasWheelchair"
                  checked={data?.hasWheelchair === false}
                  onChange={() => handleWheelchairChange(false)}
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

      {/* Wheelchair Skills Assessment - Only show if patient has wheelchair */}
      {data?.hasWheelchair && (
        <div className="assessment-group wheelchair-skills">
          <div className="group-header">
            <h4 className="group-title">
              <i className="fas fa-cogs"></i>
              Wheelchair Skills Assessment
            </h4>
            <p className="group-description">
              Evaluate specific wheelchair operation and management skills
            </p>
          </div>

          <div className="skills-grid">
            {wheelchairSkills.map((skill) => (
              <div key={skill.key} className="skill-assessment">
                <div className="skill-header">
                  <div className="skill-title">
                    <i className={skill.icon}></i>
                    <h5>{skill.label}</h5>
                  </div>
                  <p className="skill-description">{skill.description}</p>
                </div>
                
                <div className="assessment-options">
                  <select
                    value={data?.wheelchairSkills?.[skill.key] || 'not_tested'}
                    onChange={(e) => handleWheelchairSkillChange(skill.key, e.target.value)}
                    className="assessment-select"
                    style={{
                      borderColor: getCategoryColor(data?.wheelchairSkills?.[skill.key])
                    }}
                  >
                    {transferOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  {data?.wheelchairSkills?.[skill.key] && 
                   data.wheelchairSkills[skill.key] !== 'not_tested' && (
                    <div 
                      className="level-indicator"
                      style={{
                        backgroundColor: getCategoryColor(data.wheelchairSkills[skill.key])
                      }}
                    >
                      {transferOptions.find(opt => opt.value === data.wheelchairSkills[skill.key])?.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Comments */}
      <div className="assessment-group comments-section">
        <div className="group-header">
          <h4 className="group-title">
            <i className="fas fa-comment-medical"></i>
            Additional Comments
          </h4>
          <p className="group-description">
            Document additional observations, safety concerns, or recommendations
          </p>
        </div>

        <div className="comments-container">
          <textarea
            value={data?.comments || ''}
            onChange={(e) => handleCommentsChange(e.target.value)}
            placeholder="Enter additional clinical observations about transfer abilities, safety concerns, equipment recommendations, family education provided, environmental modifications needed, or specific transfer training recommendations..."
            rows={5}
            className="comments-textarea"
            maxLength={1500}
          />
          <div className="character-count">
            {(data?.comments || '').length} / 1500 characters
          </div>
        </div>
      </div>

      {/* Assessment Progress */}
      {getCompletedTransfersCount() > 0 && (
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
                <i className="fas fa-arrows-alt"></i>
                <span>Transfer Activities</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill transfer-progress"
                  style={{ width: `${(getCompletedTransfersCount() / transferActivities.length) * 100}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {getCompletedTransfersCount()} of {transferActivities.length} completed
              </div>
            </div>

            {data?.hasWheelchair && (
              <div className="progress-section">
                <div className="progress-label">
                  <i className="fas fa-wheelchair"></i>
                  <span>Wheelchair Skills</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill wheelchair-progress"
                    style={{ width: `${(getCompletedWheelchairSkillsCount() / wheelchairSkills.length) * 100}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {getCompletedWheelchairSkillsCount()} of {wheelchairSkills.length} completed
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransfersFunctionalIndependenceSkillsSection;