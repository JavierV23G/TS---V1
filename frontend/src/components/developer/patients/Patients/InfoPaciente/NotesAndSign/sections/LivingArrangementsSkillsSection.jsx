import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/LivingArrangementsSkillsSection.scss';

const LivingArrangementsSkillsSection = ({ data, onChange, sectionId, config }) => {
  // Living arrangement categories with improved organization and visual hierarchy
  const livingArrangementOptions = [
    {
      category: 'Housing Type & Residence',
      icon: 'fas fa-home',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      priority: 1,
      options: [
        { key: 'house', label: 'Single-Family House', description: 'Independent single-family residence', icon: 'fas fa-home', priority: 1 },
        { key: 'apartment', label: 'Apartment/Condo', description: 'Multi-unit residential building', icon: 'fas fa-building', priority: 2 },
        { key: 'mobileHome', label: 'Mobile/Manufactured Home', description: 'Manufactured or mobile housing unit', icon: 'fas fa-caravan', priority: 3 }
      ]
    },
    {
      category: 'Safety & Environmental Assessment',
      icon: 'fas fa-shield-alt',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      priority: 2,
      options: [
        { key: 'clutter', label: 'Excessive Clutter', description: 'Items creating mobility barriers and fall risks', icon: 'fas fa-boxes', priority: 1 },
        { key: 'throwRugs', label: 'Throw Rugs/Loose Carpets', description: 'Loose rugs creating trip and fall hazards', icon: 'fas fa-square', priority: 2 },
        { key: 'steps', label: 'Entry Steps', description: 'Single or multiple steps at entrances', icon: 'fas fa-shoe-prints', priority: 3 },
        { key: 'stairs', label: 'Interior Stairs', description: 'Internal staircases within residence', icon: 'fas fa-stairs', priority: 4 },
        { key: 'railing', label: 'Handrails/Grab Bars', description: 'Available support rails and grab bars', icon: 'fas fa-hand-paper', priority: 5 }
      ]
    },
    {
      category: 'Care & Support Facilities',
      icon: 'fas fa-hands-helping',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      priority: 3,
      options: [
        { key: 'assistedLivingFacility', label: 'Assisted Living Facility', description: 'Residential care with daily living support services', icon: 'fas fa-user-nurse', priority: 1 },
        { key: 'nursingHome', label: 'Skilled Nursing Facility', description: '24-hour skilled nursing care facility', icon: 'fas fa-clinic-medical', priority: 2 },
        { key: 'governmentHousing', label: 'Subsidized Housing', description: 'Government-subsidized or public housing', icon: 'fas fa-landmark', priority: 3 }
      ]
    }
  ];

  // Handle checkbox change
  const handleOptionChange = (optionKey) => {
    const currentSelections = data || {};
    const updatedData = {
      ...currentSelections,
      [optionKey]: !currentSelections[optionKey]
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

  // Get count of selected options by category
  const getSelectedCount = (category) => {
    const categoryOptions = livingArrangementOptions.find(cat => cat.category === category)?.options || [];
    return categoryOptions.filter(option => data?.[option.key]).length;
  };

  // Get total selected count
  const getTotalSelectedCount = () => {
    let total = 0;
    livingArrangementOptions.forEach(category => {
      total += getSelectedCount(category.category);
    });
    return total;
  };

  return (
    <div className="living-arrangements-skills-section">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-home"></i>
          <h2>Living Arrangements Assessment</h2>
        </div>
        <div className="section-description">
          <p>Environmental and housing evaluation for safety and accessibility planning</p>
        </div>
      </div>

      <div className="assessment-overview">
        <div className="overview-header">
          <div className="header-content">
            <div className="header-icon">
              <i className="fas fa-clipboard-check"></i>
            </div>
            <div className="header-text">
              <h3>Assessment Overview</h3>
              <p>Select all applicable living arrangement characteristics</p>
            </div>
          </div>
          <div className="overview-stats">
            <div className="stat-item">
              <span className="stat-number">{getTotalSelectedCount()}</span>
              <span className="stat-label">Selected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="arrangement-categories">
        {livingArrangementOptions.map((category, categoryIndex) => (
          <div key={category.category} className="category-section">
            <div className="category-header">
              <div className="header-content">
                <div 
                  className="category-icon"
                  style={{ backgroundColor: category.color }}
                >
                  <i className={category.icon}></i>
                </div>
                <div className="category-info">
                  <h3>{category.category}</h3>
                  <span className="selection-indicator">
                    {getSelectedCount(category.category)} of {category.options.length} selected
                  </span>
                </div>
              </div>
            </div>

            <div className="category-options">
              {category.options.map((option, optionIndex) => (
                <label 
                  key={option.key}
                  className={`arrangement-option ${data?.[option.key] ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={data?.[option.key] || false}
                    onChange={() => handleOptionChange(option.key)}
                    className="option-checkbox"
                  />
                  <div className="option-content">
                    <div className="option-header">
                      <div 
                        className="option-icon"
                        style={{ color: category.color }}
                      >
                        <i className={option.icon}></i>
                      </div>
                      <div className="option-text">
                        <div className="option-label">{option.label}</div>
                        <div className="option-description">{option.description}</div>
                      </div>
                    </div>
                    <div className="selection-indicator">
                      <div className="checkbox-custom">
                        <i className="fas fa-check"></i>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comments Section */}
      <div className="arrangement-comments">
        <div className="comments-header">
          <div className="header-content">
            <div className="header-icon">
              <i className="fas fa-comment-dots"></i>
            </div>
            <div className="header-text">
              <h3>Additional Living Arrangement Notes</h3>
              <p>Document specific environmental factors, safety concerns, accessibility modifications, or other relevant housing details</p>
            </div>
          </div>
        </div>

        <div className="comments-container">
          <textarea
            value={data?.comments || ''}
            onChange={(e) => handleCommentsChange(e.target.value)}
            placeholder="Enter detailed notes about living arrangements including room layout, lighting, accessibility features, safety modifications needed, caregiver availability, emergency access, or other environmental factors that may impact patient care and mobility..."
            className="comments-textarea"
            rows="4"
          />
          
          <div className="textarea-footer">
            <div className="char-count">
              {(data?.comments?.length || 0)} characters
            </div>
            <div className="assessment-tips">
              <span className="tip">
                <i className="fas fa-lightbulb"></i>
                Include accessibility modifications and safety recommendations
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Summary */}
      <div className="arrangement-summary">
        <div className="summary-header">
          <i className="fas fa-chart-bar"></i>
          <h3>Living Arrangement Summary</h3>
        </div>
        
        <div className="summary-grid">
          {livingArrangementOptions.map((category) => {
            const selectedCount = getSelectedCount(category.category);
            return (
              <div key={category.category} className="summary-card">
                <div className="card-header">
                  <div 
                    className="card-icon"
                    style={{ backgroundColor: category.color }}
                  >
                    <i className={category.icon}></i>
                  </div>
                  <div className="card-title">
                    <h4>{category.category}</h4>
                    <span className="category-count">
                      {selectedCount}/{category.options.length}
                    </span>
                  </div>
                </div>
                
                <div className="card-content">
                  {selectedCount > 0 ? (
                    <div className="selected-items">
                      {category.options
                        .filter(option => data?.[option.key])
                        .map(option => (
                          <div key={option.key} className="selected-item">
                            <i className={option.icon}></i>
                            <span>{option.label}</span>
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <div className="no-selection">
                      <span>No items selected</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Comments Status Card */}
          <div className="summary-card comments-card">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-comment-medical"></i>
              </div>
              <div className="card-title">
                <h4>Documentation</h4>
              </div>
            </div>
            
            <div className="card-content">
              <div className="documentation-status">
                <span className={`status-indicator ${data?.comments?.trim() ? 'documented' : 'pending'}`}>
                  {data?.comments?.trim() ? (
                    <>
                      <i className="fas fa-check-circle"></i>
                      Notes Documented
                    </>
                  ) : (
                    <>
                      <i className="fas fa-clock"></i>
                      Notes Pending
                    </>
                  )}
                </span>
                {data?.comments?.trim() && (
                  <div className="comment-preview">
                    {data.comments.substring(0, 60)}
                    {data.comments.length > 60 && '...'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivingArrangementsSkillsSection;