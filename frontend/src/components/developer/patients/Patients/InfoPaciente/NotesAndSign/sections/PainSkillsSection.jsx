import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/PainSkillsSection.scss';

const PainSkillsSection = ({ data, onChange, sectionId, config }) => {
  // Pain scale levels with clinical descriptions and colors
  const painLevels = [
    { value: 0, label: 'No Pain', description: 'No pain at all', color: '#10b981', category: 'none' },
    { value: 1, label: 'Minimal', description: 'Very mild pain', color: '#84cc16', category: 'mild' },
    { value: 2, label: 'Mild', description: 'Mild pain', color: '#eab308', category: 'mild' },
    { value: 3, label: 'Mild', description: 'Moderate mild pain', color: '#f59e0b', category: 'mild' },
    { value: 4, label: 'Moderate', description: 'Moderate pain', color: '#f97316', category: 'moderate' },
    { value: 5, label: 'Moderate', description: 'Moderate to severe pain', color: '#ef4444', category: 'moderate' },
    { value: 6, label: 'Severe', description: 'Severe pain', color: '#dc2626', category: 'severe' },
    { value: 7, label: 'Severe', description: 'Very severe pain', color: '#b91c1c', category: 'severe' },
    { value: 8, label: 'Very Severe', description: 'Extremely severe pain', color: '#991b1b', category: 'very-severe' },
    { value: 9, label: 'Excruciating', description: 'Excruciating pain', color: '#7f1d1d', category: 'very-severe' },
    { value: 10, label: 'Worst Pain', description: 'Worst pain imaginable', color: '#450a0a', category: 'worst' }
  ];

  // Pain descriptors for better assessment
  const painDescriptors = {
    location: [
      'Head/Face', 'Neck', 'Upper Back', 'Lower Back', 'Chest', 'Abdomen',
      'Right Arm', 'Left Arm', 'Right Leg', 'Left Leg', 'Hands', 'Feet', 'Other'
    ],
    quality: [
      'Sharp', 'Dull', 'Aching', 'Burning', 'Stabbing', 'Throbbing', 
      'Cramping', 'Shooting', 'Tingling', 'Numbness'
    ],
    frequency: [
      'Constant', 'Intermittent', 'Occurs with movement', 'Occurs at rest', 
      'Morning pain', 'Evening pain', 'Night pain'
    ]
  };

  // Handle pain presence change
  const handlePainPresenceChange = (hasPain) => {
    const updatedData = {
      ...data,
      hasPain: hasPain,
      // Clear pain details if answering "No"
      ...(hasPain === false && {
        painLevel: null,
        painLocation: [],
        painQuality: [],
        painFrequency: '',
        painComments: ''
      })
    };
    onChange(updatedData);
  };

  // Handle pain level change
  const handlePainLevelChange = (level) => {
    const updatedData = {
      ...data,
      painLevel: level
    };
    onChange(updatedData);
  };

  // Handle pain location change (multiple selection)
  const handlePainLocationChange = (location) => {
    const currentLocations = data?.painLocation || [];
    const updatedLocations = currentLocations.includes(location)
      ? currentLocations.filter(loc => loc !== location)
      : [...currentLocations, location];
    
    const updatedData = {
      ...data,
      painLocation: updatedLocations
    };
    onChange(updatedData);
  };

  // Handle pain quality change (multiple selection)
  const handlePainQualityChange = (quality) => {
    const currentQualities = data?.painQuality || [];
    const updatedQualities = currentQualities.includes(quality)
      ? currentQualities.filter(qual => qual !== quality)
      : [...currentQualities, quality];
    
    const updatedData = {
      ...data,
      painQuality: updatedQualities
    };
    onChange(updatedData);
  };

  // Handle pain frequency change
  const handlePainFrequencyChange = (frequency) => {
    const updatedData = {
      ...data,
      painFrequency: frequency
    };
    onChange(updatedData);
  };

  // Handle pain comments change
  const handlePainCommentsChange = (comments) => {
    const updatedData = {
      ...data,
      painComments: comments
    };
    onChange(updatedData);
  };

  // Get pain level description and styling
  const getPainLevelInfo = (level) => {
    return painLevels.find(p => p.value === level) || painLevels[0];
  };

  return (
    <div className="pain-skills-section">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Pain Assessment</h2>
        </div>
        <div className="section-description">
          <p>Comprehensive pain evaluation using standardized pain scales</p>
        </div>
      </div>

      {/* Pain Presence Question */}
      <div className="pain-presence-card">
        <div className="presence-header">
          <div className="header-content">
            <div className="header-icon">
              <i className="fas fa-question-circle"></i>
            </div>
            <div className="header-text">
              <h3>Primary Assessment</h3>
              <p>Initial pain screening question</p>
            </div>
          </div>
        </div>

        <div className="presence-question">
          <h4>Is patient experiencing pain?</h4>
          <div className="presence-options">
            <label className={`presence-option ${data?.hasPain === true ? 'selected' : ''} yes`}>
              <input
                type="radio"
                name="painPresence"
                value="yes"
                checked={data?.hasPain === true}
                onChange={() => handlePainPresenceChange(true)}
              />
              <div className="option-content">
                <div className="option-icon">
                  <i className="fas fa-check"></i>
                </div>
                <span className="option-text">Yes</span>
              </div>
            </label>

            <label className={`presence-option ${data?.hasPain === false ? 'selected' : ''} no`}>
              <input
                type="radio"
                name="painPresence"
                value="no"
                checked={data?.hasPain === false}
                onChange={() => handlePainPresenceChange(false)}
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
      </div>

      {/* Pain Assessment Details - Only show if patient has pain */}
      {data?.hasPain === true && (
        <div className="pain-assessment-details">
          {/* Pain Scale */}
          <div className="pain-scale-card">
            <div className="scale-header">
              <div className="header-content">
                <div className="header-icon">
                  <i className="fas fa-thermometer-half"></i>
                </div>
                <div className="header-text">
                  <h3>Pain Intensity Scale</h3>
                  <p>Rate pain level from 0 (no pain) to 10 (worst pain imaginable)</p>
                </div>
              </div>
            </div>

            <div className="pain-scale-container">
              <div className="scale-labels">
                <span className="scale-start">No Pain</span>
                <span className="scale-end">Worst Pain</span>
              </div>
              
              <div className="pain-scale-grid">
                {painLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    className={`pain-level ${level.category} ${data?.painLevel === level.value ? 'selected' : ''}`}
                    onClick={() => handlePainLevelChange(level.value)}
                    style={{ 
                      backgroundColor: data?.painLevel === level.value ? level.color : 'transparent',
                      borderColor: level.color,
                      color: data?.painLevel === level.value ? '#ffffff' : level.color
                    }}
                  >
                    <div className="level-number">{level.value}</div>
                    <div className="level-label">{level.label}</div>
                    <div className="level-description">{level.description}</div>
                  </button>
                ))}
              </div>

              {/* Selected Pain Level Display */}
              {data?.painLevel !== null && data?.painLevel !== undefined && (
                <div className="selected-pain-display">
                  <div className="selected-info" data-pain-level={data.painLevel}>
                    <div 
                      className="selected-indicator"
                      style={{ backgroundColor: getPainLevelInfo(data.painLevel).color }}
                    >
                      {data.painLevel}
                    </div>
                    <div className="selected-details">
                      <div className="selected-level">{getPainLevelInfo(data.painLevel).label} Pain Level</div>
                      <div className="selected-description">{getPainLevelInfo(data.painLevel).description}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pain Characteristics */}
          <div className="pain-characteristics">
            {/* Pain Location */}
            <div className="characteristic-section">
              <div className="characteristic-header">
                <i className="fas fa-map-marker-alt"></i>
                <h4>Pain Location</h4>
                <span className="selection-count">
                  {(data?.painLocation?.length || 0)} selected
                </span>
              </div>
              <div className="characteristic-options location-options">
                {painDescriptors.location.map((location) => (
                  <label 
                    key={location}
                    className={`characteristic-option ${(data?.painLocation || []).includes(location) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={(data?.painLocation || []).includes(location)}
                      onChange={() => handlePainLocationChange(location)}
                    />
                    <div className="option-content">
                      <span className="option-text">{location}</span>
                      <div className="selection-indicator">
                        <i className="fas fa-check"></i>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Pain Quality */}
            <div className="characteristic-section">
              <div className="characteristic-header">
                <i className="fas fa-clipboard-list"></i>
                <h4>Pain Quality</h4>
                <span className="selection-count">
                  {(data?.painQuality?.length || 0)} selected
                </span>
              </div>
              <div className="characteristic-options quality-options">
                {painDescriptors.quality.map((quality) => (
                  <label 
                    key={quality}
                    className={`characteristic-option ${(data?.painQuality || []).includes(quality) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={(data?.painQuality || []).includes(quality)}
                      onChange={() => handlePainQualityChange(quality)}
                    />
                    <div className="option-content">
                      <span className="option-text">{quality}</span>
                      <div className="selection-indicator">
                        <i className="fas fa-check"></i>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Pain Frequency */}
            <div className="characteristic-section">
              <div className="characteristic-header">
                <i className="fas fa-clock"></i>
                <h4>Pain Frequency</h4>
              </div>
              <div className="frequency-options">
                {painDescriptors.frequency.map((frequency) => (
                  <label 
                    key={frequency}
                    className={`frequency-option ${data?.painFrequency === frequency ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="painFrequency"
                      value={frequency}
                      checked={data?.painFrequency === frequency}
                      onChange={() => handlePainFrequencyChange(frequency)}
                    />
                    <div className="option-content">
                      <div className="option-indicator">
                        <i className="fas fa-dot-circle"></i>
                      </div>
                      <span className="option-text">{frequency}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Pain Comments */}
          <div className="pain-comments">
            <div className="comments-header">
              <div className="header-icon">
                <i className="fas fa-comment-medical"></i>
              </div>
              <div className="header-text">
                <h3>Additional Pain Assessment Notes</h3>
                <p>Document pain management strategies, triggers, alleviating factors, or other relevant observations</p>
              </div>
            </div>

            <div className="comments-container">
              <textarea
                value={data?.painComments || ''}
                onChange={(e) => handlePainCommentsChange(e.target.value)}
                placeholder="Enter detailed pain assessment notes, including onset, duration, aggravating factors, relieving factors, pain management interventions, and patient's response to treatment..."
                className="comments-textarea"
                rows="4"
              />
              
              <div className="textarea-footer">
                <div className="char-count">
                  {(data?.painComments?.length || 0)} characters
                </div>
                <div className="assessment-tips">
                  <span className="tip">
                    <i className="fas fa-lightbulb"></i>
                    Include pain triggers, alleviating factors, and interventions tried
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pain Assessment Summary */}
      <div className="pain-summary">
        <div className="summary-header">
          <i className="fas fa-chart-pie"></i>
          <h3>Pain Assessment Summary</h3>
        </div>
        
        <div className="summary-grid">
          <div className="summary-card">
            <div className="card-icon">
              <i className="fas fa-user-injured"></i>
            </div>
            <div className="card-content">
              <h4>Pain Status</h4>
              <div className="status-indicator">
                {data?.hasPain === true ? (
                  <span className="has-pain">Pain Present</span>
                ) : data?.hasPain === false ? (
                  <span className="no-pain">No Pain Reported</span>
                ) : (
                  <span className="not-assessed">Not Assessed</span>
                )}
              </div>
            </div>
          </div>

          {data?.hasPain === true && (
            <>
              <div className="summary-card">
                <div className="card-icon">
                  <i className="fas fa-thermometer-half"></i>
                </div>
                <div className="card-content">
                  <h4>Pain Intensity</h4>
                  <div className="intensity-display">
                    {data?.painLevel !== null && data?.painLevel !== undefined ? (
                      <>
                        <span className="intensity-number"
                              style={{ color: getPainLevelInfo(data.painLevel).color }}>
                          {data.painLevel}/10
                        </span>
                        <span className="intensity-label">
                          {getPainLevelInfo(data.painLevel).label}
                        </span>
                      </>
                    ) : (
                      <span className="not-rated">Not Rated</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon">
                  <i className="fas fa-clipboard-check"></i>
                </div>
                <div className="card-content">
                  <h4>Assessment Details</h4>
                  <div className="details-summary">
                    <span className="detail-item">
                      Locations: {(data?.painLocation?.length || 0)}
                    </span>
                    <span className="detail-item">
                      Qualities: {(data?.painQuality?.length || 0)}
                    </span>
                    <span className="detail-item">
                      Notes: {data?.painComments?.trim() ? 'Documented' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PainSkillsSection;