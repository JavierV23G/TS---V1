import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/BalanceSkillsSection.scss';

const BalanceSkillsSection = ({ data, onChange, sectionId, config }) => {
  // Opciones de evaluación de balance con significado clínico
  const balanceOptions = [
    { value: 'not_tested', label: 'Not Tested', category: 'none', description: 'Assessment not performed' },
    { value: 'p_minus', label: 'P-', category: 'poor', description: 'Poor balance - Unable to maintain' },
    { value: 'p', label: 'P', category: 'poor', description: 'Poor balance - Minimal control' },
    { value: 'p_plus', label: 'P+', category: 'poor', description: 'Poor balance - Brief moments of control' },
    { value: 'f_minus', label: 'F-', category: 'fair', description: 'Fair balance - Inconsistent control' },
    { value: 'f', label: 'F', category: 'fair', description: 'Fair balance - Adequate with effort' },
    { value: 'f_plus', label: 'F+', category: 'fair', description: 'Fair balance - Good with minimal support' },
    { value: 'g_minus', label: 'G-', category: 'good', description: 'Good balance - Stable with challenges' },
    { value: 'g', label: 'G', category: 'good', description: 'Good balance - Consistent control' },
    { value: 'g_plus', label: 'G+', category: 'good', description: 'Good balance - Excellent control' }
  ];

  // Evaluaciones de balance (Sitting y Standing)
  const balanceTypes = [
    {
      key: 'sitting',
      label: 'Sitting Balance',
      icon: 'fas fa-chair',
      description: 'Patient\'s ability to maintain balance while seated'
    },
    {
      key: 'standing',
      label: 'Standing Balance',
      icon: 'fas fa-male',
      description: 'Patient\'s ability to maintain balance while standing'
    }
  ];

  // Tipos de evaluación (Static y Dynamic)
  const evaluationTypes = [
    {
      key: 'static',
      label: 'Static',
      icon: 'fas fa-pause',
      description: 'Balance during stationary positions'
    },
    {
      key: 'dynamic',
      label: 'Dynamic',
      icon: 'fas fa-running',
      description: 'Balance during movement or perturbations'
    }
  ];

  // Manejar cambios en la evaluación de balance
  const handleBalanceChange = (balanceType, evaluationType, value) => {
    const updatedData = {
      ...data,
      [balanceType]: {
        ...data?.[balanceType],
        [evaluationType]: value
      }
    };
    onChange(updatedData);
  };

  // Manejar cambios en los comentarios
  const handleCommentChange = (value) => {
    const updatedData = {
      ...data,
      comments: value
    };
    onChange(updatedData);
  };

  return (
    <div className="balance-skills-section">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-balance-scale"></i>
          <h2>Balance Assessment</h2>
        </div>
        <div className="section-description">
          <p>Comprehensive evaluation of static and dynamic balance abilities</p>
        </div>
      </div>

      <div className="balance-evaluation-legend">
        <div className="legend-header">
          <i className="fas fa-info-circle"></i>
          <h3>Balance Evaluation Scale</h3>
        </div>
        <div className="legend-categories">
          <div className="legend-category poor">
            <div className="category-header">
              <span className="category-indicator"></span>
              <h4>Poor (P)</h4>
            </div>
            <div className="category-options">
              <span className="option">P- : Unable to maintain</span>
              <span className="option">P : Minimal control</span>
              <span className="option">P+ : Brief moments</span>
            </div>
          </div>
          <div className="legend-category fair">
            <div className="category-header">
              <span className="category-indicator"></span>
              <h4>Fair (F)</h4>
            </div>
            <div className="category-options">
              <span className="option">F- : Inconsistent</span>
              <span className="option">F : Adequate effort</span>
              <span className="option">F+ : Minimal support</span>
            </div>
          </div>
          <div className="legend-category good">
            <div className="category-header">
              <span className="category-indicator"></span>
              <h4>Good (G)</h4>
            </div>
            <div className="category-options">
              <span className="option">G- : Stable challenges</span>
              <span className="option">G : Consistent control</span>
              <span className="option">G+ : Excellent control</span>
            </div>
          </div>
        </div>
      </div>

      <div className="balance-assessments">
        {balanceTypes.map((balanceType) => (
          <div key={balanceType.key} className="balance-type-card">
            <div className="balance-type-header">
              <div className="header-content">
                <div className="header-icon">
                  <i className={balanceType.icon}></i>
                </div>
                <div className="header-text">
                  <h3>{balanceType.label}</h3>
                  <p>{balanceType.description}</p>
                </div>
              </div>
            </div>

            <div className="evaluation-types">
              {evaluationTypes.map((evalType) => (
                <div key={evalType.key} className="evaluation-type-section">
                  <div className="evaluation-type-header">
                    <div className="eval-icon">
                      <i className={evalType.icon}></i>
                    </div>
                    <div className="eval-text">
                      <h4>{evalType.label}</h4>
                      <span>{evalType.description}</span>
                    </div>
                  </div>

                  <div className="balance-options-grid">
                    {balanceOptions.map((option) => (
                      <div key={option.value} className={`balance-option ${option.category}`}>
                        <label className="option-label">
                          <input
                            type="radio"
                            name={`${balanceType.key}_${evalType.key}`}
                            value={option.value}
                            checked={data?.[balanceType.key]?.[evalType.key] === option.value}
                            onChange={(e) => handleBalanceChange(balanceType.key, evalType.key, e.target.value)}
                            className="option-radio"
                          />
                          <div className="option-content">
                            <div className="option-code">{option.label}</div>
                            <div className="option-description">{option.description}</div>
                          </div>
                          <div className="selection-indicator">
                            <i className="fas fa-check"></i>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="balance-comments">
        <div className="comments-header">
          <div className="header-icon">
            <i className="fas fa-comment-medical"></i>
          </div>
          <div className="header-text">
            <h3>Clinical Observations & Additional Notes</h3>
            <p>Document specific balance observations, environmental factors, assistive devices used, or safety considerations</p>
          </div>
        </div>

        <div className="comments-container">
          <textarea
            value={data?.comments || ''}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder="Enter clinical observations about balance performance, safety concerns, compensatory strategies, environmental modifications, assistive devices used, fall risk factors, or recommendations for balance training..."
            className="comments-textarea"
            rows="5"
          />
          
          <div className="textarea-footer">
            <div className="char-count">
              {data?.comments?.length || 0} characters
            </div>
            <div className="clinical-tips">
              <span className="tip">
                <i className="fas fa-lightbulb"></i>
                Include fall risk assessment and safety recommendations
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="section-summary">
        <div className="summary-header">
          <i className="fas fa-chart-line"></i>
          <h3>Balance Assessment Summary</h3>
        </div>
        
        <div className="summary-grid">
          <div className="summary-card">
            <div className="card-icon">
              <i className="fas fa-chair"></i>
            </div>
            <div className="card-content">
              <h4>Sitting Balance</h4>
              <div className="assessment-status">
                <span className="static-status">
                  Static: {data?.sitting?.static ? 
                    balanceOptions.find(opt => opt.value === data.sitting.static)?.label || 'Not Selected' 
                    : 'Not Selected'}
                </span>
                <span className="dynamic-status">
                  Dynamic: {data?.sitting?.dynamic ? 
                    balanceOptions.find(opt => opt.value === data.sitting.dynamic)?.label || 'Not Selected'
                    : 'Not Selected'}
                </span>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon">
              <i className="fas fa-male"></i>
            </div>
            <div className="card-content">
              <h4>Standing Balance</h4>
              <div className="assessment-status">
                <span className="static-status">
                  Static: {data?.standing?.static ? 
                    balanceOptions.find(opt => opt.value === data.standing.static)?.label || 'Not Selected'
                    : 'Not Selected'}
                </span>
                <span className="dynamic-status">
                  Dynamic: {data?.standing?.dynamic ? 
                    balanceOptions.find(opt => opt.value === data.standing.dynamic)?.label || 'Not Selected'
                    : 'Not Selected'}
                </span>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon">
              <i className="fas fa-clipboard-check"></i>
            </div>
            <div className="card-content">
              <h4>Completion Status</h4>
              <div className="completion-stats">
                <span className="assessments-completed">
                  Assessments: {[
                    data?.sitting?.static,
                    data?.sitting?.dynamic,
                    data?.standing?.static,
                    data?.standing?.dynamic
                  ].filter(Boolean).length}/4
                </span>
                <span className="comments-status">
                  Notes: {data?.comments?.trim() ? 'Documented' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSkillsSection;