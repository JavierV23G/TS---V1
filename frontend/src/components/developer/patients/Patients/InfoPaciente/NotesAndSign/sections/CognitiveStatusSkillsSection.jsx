import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/CognitiveStatusSkillsSection.scss';

const CognitiveStatusSkillsSection = ({ data, onChange, sectionId, config }) => {
  // Cognitive assessment areas organized by priority and clinical importance
  const cognitiveAssessments = [
    // Memory Functions (Core cognitive abilities)
    {
      key: 'shortTermMemory',
      label: 'Short Term Memory',
      description: 'Ability to retain and recall information for brief periods (immediate recall)',
      icon: 'fas fa-clock',
      category: 'memory',
      priority: 1
    },
    {
      key: 'longTermMemory',
      label: 'Long Term Memory',
      description: 'Ability to store and retrieve information over extended periods',
      icon: 'fas fa-archive',
      category: 'memory',
      priority: 2
    },

    // Attention & Concentration (Fundamental for all tasks)
    {
      key: 'attentionConcentration',
      label: 'Attention / Concentration',
      description: 'Ability to focus and maintain attention on tasks or stimuli',
      icon: 'fas fa-bullseye',
      category: 'attention',
      priority: 3
    },

    // Comprehension Skills (Communication foundation)
    {
      key: 'auditoryComprehension',
      label: 'Auditory Comprehension',
      description: 'Understanding of spoken language and verbal instructions',
      icon: 'fas fa-volume-up',
      category: 'comprehension',
      priority: 4
    },
    {
      key: 'visualComprehension',
      label: 'Visual Comprehension',
      description: 'Understanding of visual information and written instructions',
      icon: 'fas fa-eye',
      category: 'comprehension',
      priority: 5
    },

    // Communication & Expression
    {
      key: 'ableToExpressNeeds',
      label: 'Able to Express Needs',
      description: 'Ability to communicate personal needs and preferences effectively',
      icon: 'fas fa-comments',
      category: 'communication',
      priority: 6
    },

    // Executive Functions (Higher-order thinking)
    {
      key: 'problemSolving',
      label: 'Problem Solving',
      description: 'Ability to analyze situations and develop appropriate solutions',
      icon: 'fas fa-lightbulb',
      category: 'executive',
      priority: 7
    },
    {
      key: 'sequencing',
      label: 'Sequencing',
      description: 'Ability to organize and order steps in logical progression',
      icon: 'fas fa-sort-numeric-up',
      category: 'executive',
      priority: 8
    },
    {
      key: 'initiationOfActivity',
      label: 'Initiation of Activity',
      description: 'Ability to start and engage in activities independently',
      icon: 'fas fa-play-circle',
      category: 'executive',
      priority: 9
    },

    // Self-Regulation & Safety
    {
      key: 'selfControl',
      label: 'Self-Control',
      description: 'Ability to regulate behavior and emotional responses appropriately',
      icon: 'fas fa-hand-paper',
      category: 'regulation',
      priority: 10
    },
    {
      key: 'safetyJudgement',
      label: 'Safety / Judgement',
      description: 'Ability to assess risks and make safe decisions in daily activities',
      icon: 'fas fa-shield-check',
      category: 'safety',
      priority: 11
    },

    // Adaptive & Coping Skills
    {
      key: 'copingSkills',
      label: 'Coping Skills',
      description: 'Ability to manage stress and adapt to challenging situations',
      icon: 'fas fa-balance-scale-right',
      category: 'adaptive',
      priority: 12
    }
  ];

  // Cognitive assessment options
  const cognitiveOptions = [
    { value: 'intact', label: 'Intact', description: 'Functioning within normal limits', color: '#10b981' },
    { value: 'impaired', label: 'Impaired', description: 'Significantly reduced functioning', color: '#ef4444' },
    { value: 'functional', label: 'Functional', description: 'Adequate for daily activities', color: '#f59e0b' }
  ];

  // Handle cognitive assessment change
  const handleCognitiveChange = (assessmentKey, value) => {
    const updatedData = {
      ...data,
      [assessmentKey]: value
    };
    onChange(updatedData);
  };

  // Handle reason for therapy change
  const handleReasonChange = (reason) => {
    const updatedData = {
      ...data,
      reasonForTherapy: reason
    };
    onChange(updatedData);
  };

  // Handle hearing assessment change
  const handleHearingChange = (field, value) => {
    const updatedData = {
      ...data,
      [field]: value,
      // Clear hearing aids if hard of hearing is set to false
      ...(field === 'hardOfHearing' && value === false && { hearingAids: false })
    };
    onChange(updatedData);
  };

  // Handle comments change
  const handleCommentsChange = (comments) => {
    const updatedData = {
      ...data,
      comments: comments
    };
    onChange(updatedData);
  };

  // Get category color with better organization
  const getCategoryColor = (category) => {
    const categoryColors = {
      memory: '#8b5cf6',           // Purple for memory
      attention: '#06b6d4',        // Cyan for attention
      comprehension: '#10b981',    // Green for comprehension
      communication: '#3b82f6',    // Blue for communication
      executive: '#f59e0b',        // Amber for executive functions
      regulation: '#ec4899',       // Pink for self-regulation
      safety: '#ef4444',           // Red for safety
      adaptive: '#6366f1'          // Indigo for adaptive skills
    };
    return categoryColors[category] || '#64748b';
  };

  // Group assessments by category
  const groupedAssessments = cognitiveAssessments.reduce((groups, assessment) => {
    const category = assessment.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(assessment);
    return groups;
  }, {});

  const categoryInfo = {
    memory: { 
      name: 'Memory Functions', 
      icon: 'fas fa-brain', 
      description: 'Short and long-term memory capabilities',
      priority: 1
    },
    attention: { 
      name: 'Attention & Focus', 
      icon: 'fas fa-bullseye', 
      description: 'Concentration and sustained attention abilities',
      priority: 2
    },
    comprehension: { 
      name: 'Comprehension Skills', 
      icon: 'fas fa-ear', 
      description: 'Understanding of auditory and visual information',
      priority: 3
    },
    communication: { 
      name: 'Communication & Expression', 
      icon: 'fas fa-comments', 
      description: 'Ability to express needs and communicate effectively',
      priority: 4
    },
    executive: { 
      name: 'Executive Functions', 
      icon: 'fas fa-cogs', 
      description: 'Higher-order cognitive processes and planning',
      priority: 5
    },
    regulation: { 
      name: 'Self-Regulation', 
      icon: 'fas fa-hand-paper', 
      description: 'Behavioral and emotional control abilities',
      priority: 6
    },
    safety: { 
      name: 'Safety & Judgement', 
      icon: 'fas fa-shield-check', 
      description: 'Risk assessment and safety decision-making',
      priority: 7
    },
    adaptive: { 
      name: 'Adaptive & Coping Skills', 
      icon: 'fas fa-balance-scale-right', 
      description: 'Stress management and adaptation abilities',
      priority: 8
    }
  };

  return (
    <div className="cognitive-status-skills-section">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-brain"></i>
          <h2>Cognitive Status & Comprehension Assessment</h2>
        </div>
        <div className="section-description">
          <p>Comprehensive evaluation of cognitive functions and comprehension abilities</p>
        </div>
      </div>

      {/* Reason for Therapy */}
      <div className="therapy-reason-card">
        <div className="reason-header">
          <div className="header-content">
            <div className="header-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <div className="header-text">
              <h3>Reason for Therapy</h3>
              <p>Primary indication and rationale for cognitive therapy intervention</p>
            </div>
          </div>
        </div>

        <div className="reason-input-container">
          <textarea
            value={data?.reasonForTherapy || ''}
            onChange={(e) => handleReasonChange(e.target.value)}
            placeholder="Enter the primary reason for cognitive therapy, including specific deficits, functional limitations, medical conditions, or goals that necessitate therapeutic intervention..."
            className="reason-textarea"
            rows="4"
          />
          <div className="input-footer">
            <div className="char-count">
              {(data?.reasonForTherapy?.length || 0)} characters
            </div>
            <div className="input-tips">
              <span className="tip">
                <i className="fas fa-info-circle"></i>
                Include medical diagnosis, functional impact, and therapy goals
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cognitive Assessments by Category - Ordered by Priority */}
      <div className="cognitive-categories">
        {Object.entries(groupedAssessments)
          .sort(([catA], [catB]) => (categoryInfo[catA]?.priority || 999) - (categoryInfo[catB]?.priority || 999))
          .map(([category, assessments]) => (
          <div key={category} className="category-section">
            <div className="category-header">
              <div className="header-content">
                <div 
                  className="category-icon"
                  style={{ backgroundColor: getCategoryColor(category) }}
                >
                  <i className={categoryInfo[category].icon}></i>
                </div>
                <div className="category-info">
                  <h3>{categoryInfo[category].name}</h3>
                  <p className="category-description">{categoryInfo[category].description}</p>
                </div>
              </div>
            </div>

            <div className="assessments-grid">
              {assessments.map((assessment) => (
                <div key={assessment.key} className="assessment-item">
                  <div className="assessment-header">
                    <div className="assessment-icon">
                      <i className={assessment.icon} style={{ color: getCategoryColor(category) }}></i>
                    </div>
                    <div className="assessment-info">
                      <h4>{assessment.label}</h4>
                      <p>{assessment.description}</p>
                    </div>
                  </div>

                  <div className="assessment-options">
                    {cognitiveOptions.map((option) => (
                      <label 
                        key={option.value}
                        className={`assessment-option ${data?.[assessment.key] === option.value ? 'selected' : ''}`}
                        style={{ 
                          '--option-color': option.color,
                          '--option-bg': `${option.color}10`,
                          '--option-border': `${option.color}30`
                        }}
                      >
                        <input
                          type="radio"
                          name={assessment.key}
                          value={option.value}
                          checked={data?.[assessment.key] === option.value}
                          onChange={() => handleCognitiveChange(assessment.key, option.value)}
                          className="option-radio"
                        />
                        <div className="option-content">
                          <div className="option-left">
                            <div className="option-indicator">
                              <div className="radio-circle">
                                <div className="radio-inner"></div>
                              </div>
                            </div>
                            <div className="option-text">
                              <span className="option-label">{option.label}</span>
                              <span className="option-description">{option.description}</span>
                            </div>
                          </div>
                          <div className="option-badge">
                            <i className="fas fa-check"></i>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hearing Assessment */}
      <div className="hearing-assessment-card">
        <div className="hearing-header">
          <div className="header-content">
            <div className="header-icon">
              <i className="fas fa-deaf"></i>
            </div>
            <div className="header-text">
              <h3>Hearing Assessment</h3>
              <p>Evaluation of hearing status and assistive device usage</p>
            </div>
          </div>
        </div>

        <div className="hearing-questions">
          {/* Hard of Hearing Question */}
          <div className="hearing-question">
            <h4>Hard of Hearing</h4>
            <div className="yes-no-options">
              <label className={`yn-option ${data?.hardOfHearing === true ? 'selected' : ''} yes`}>
                <input
                  type="radio"
                  name="hardOfHearing"
                  value="yes"
                  checked={data?.hardOfHearing === true}
                  onChange={() => handleHearingChange('hardOfHearing', true)}
                />
                <div className="option-content">
                  <div className="option-icon">
                    <i className="fas fa-check"></i>
                  </div>
                  <span className="option-text">Yes</span>
                </div>
              </label>

              <label className={`yn-option ${data?.hardOfHearing === false ? 'selected' : ''} no`}>
                <input
                  type="radio"
                  name="hardOfHearing"
                  value="no"
                  checked={data?.hardOfHearing === false}
                  onChange={() => handleHearingChange('hardOfHearing', false)}
                />
                <div className="option-content">
                  <div className="option-icon">
                    <i className="fas fa-times"></i>
                  </div>
                  <span className="option-text">No</span>
                </div>
              </label>
            </div>
          </div>

          {/* Hearing Aids Question - Only show if hard of hearing is Yes */}
          {data?.hardOfHearing === true && (
            <div className="hearing-question hearing-aids-question">
              <h4>Hearing Aids</h4>
              <div className="yes-no-options">
                <label className={`yn-option ${data?.hearingAids === true ? 'selected' : ''} yes`}>
                  <input
                    type="radio"
                    name="hearingAids"
                    value="yes"
                    checked={data?.hearingAids === true}
                    onChange={() => handleHearingChange('hearingAids', true)}
                  />
                  <div className="option-content">
                    <div className="option-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="option-text">Yes</span>
                  </div>
                </label>

                <label className={`yn-option ${data?.hearingAids === false ? 'selected' : ''} no`}>
                  <input
                    type="radio"
                    name="hearingAids"
                    value="no"
                    checked={data?.hearingAids === false}
                    onChange={() => handleHearingChange('hearingAids', false)}
                  />
                  <div className="option-content">
                    <div className="option-icon">
                      <i className="fas fa-times"></i>
                    </div>
                    <span className="option-text">No</span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Comments */}
      <div className="cognitive-comments">
        <div className="comments-header">
          <div className="header-content">
            <div className="header-icon">
              <i className="fas fa-comment-medical"></i>
            </div>
            <div className="header-text">
              <h3>Additional Cognitive Assessment Notes</h3>
              <p>Document specific observations, behavioral patterns, compensatory strategies, or other relevant clinical findings</p>
            </div>
          </div>
        </div>

        <div className="comments-container">
          <textarea
            value={data?.comments || ''}
            onChange={(e) => handleCommentsChange(e.target.value)}
            placeholder="Enter detailed cognitive assessment notes including specific deficits observed, compensatory strategies used, environmental modifications needed, family education provided, or recommendations for cognitive therapy interventions..."
            className="comments-textarea"
            rows="5"
          />
          
          <div className="textarea-footer">
            <div className="char-count">
              {(data?.comments?.length || 0)} characters
            </div>
            <div className="assessment-tips">
              <span className="tip">
                <i className="fas fa-lightbulb"></i>
                Include specific examples, behavioral observations, and functional impact
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Summary */}
      <div className="cognitive-summary">
        <div className="summary-header">
          <i className="fas fa-chart-bar"></i>
          <h3>Cognitive Assessment Summary</h3>
        </div>
        
        <div className="summary-grid">
          {Object.entries(categoryInfo).map(([category, info]) => {
            const categoryAssessments = groupedAssessments[category] || [];
            const completedCount = categoryAssessments.filter(a => data?.[a.key]).length;
            const totalCount = categoryAssessments.length;
            
            return (
              <div key={category} className="summary-card">
                <div className="card-header">
                  <div 
                    className="card-icon"
                    style={{ backgroundColor: getCategoryColor(category) }}
                  >
                    <i className={info.icon}></i>
                  </div>
                  <div className="card-title">
                    <h4>{info.name}</h4>
                    <span className="completion-count">
                      {completedCount}/{totalCount} assessed
                    </span>
                  </div>
                </div>
                
                <div className="card-content">
                  {categoryAssessments.map((assessment) => {
                    const value = data?.[assessment.key];
                    const option = cognitiveOptions.find(opt => opt.value === value);
                    
                    return (
                      <div key={assessment.key} className="assessment-summary-item">
                        <div className="item-info">
                          <span className="item-name">{assessment.label}</span>
                          <span 
                            className={`item-status ${value ? 'assessed' : 'pending'}`}
                            style={{ 
                              color: option?.color || '#94a3b8',
                              backgroundColor: option ? `${option.color}15` : 'transparent'
                            }}
                          >
                            {option?.label || 'Not Assessed'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Documentation Status Card */}
          <div className="summary-card documentation-card">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-clipboard-check"></i>
              </div>
              <div className="card-title">
                <h4>Documentation Status</h4>
              </div>
            </div>
            
            <div className="card-content">
              <div className="documentation-status">
                <div className="status-item">
                  <span className="status-label">Reason for Therapy:</span>
                  <span className={`status-value ${data?.reasonForTherapy?.trim() ? 'documented' : 'pending'}`}>
                    {data?.reasonForTherapy?.trim() ? 'Documented' : 'Pending'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Hearing Assessment:</span>
                  <span className={`status-value ${data?.hardOfHearing !== undefined ? 'documented' : 'pending'}`}>
                    {data?.hardOfHearing !== undefined ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Clinical Notes:</span>
                  <span className={`status-value ${data?.comments?.trim() ? 'documented' : 'pending'}`}>
                    {data?.comments?.trim() ? 'Documented' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CognitiveStatusSkillsSection;