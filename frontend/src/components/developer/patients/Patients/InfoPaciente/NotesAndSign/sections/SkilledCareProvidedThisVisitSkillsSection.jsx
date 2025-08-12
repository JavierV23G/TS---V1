import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/SkilledCareProvidedThisVisitSkillsSection.scss';
import React, { useState, useEffect } from 'react';

const SkilledCareProvidedThisVisitSkillsSection = ({ data = {}, onChange, sectionId }) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    skilledCareNotes: ''
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

  // Obtener estadísticas del contenido
  const getContentStats = () => {
    const content = formData.skilledCareNotes || '';
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const charCount = content.length;
    const lineCount = content.split('\n').length;
    
    return { wordCount, charCount, lineCount };
  };

  const stats = getContentStats();

  return (
    <div className="skilled-care-provided-this-visit-skills-section">
      {/* Header */}
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-stethoscope"></i>
          <h3>Skilled Care Provided This Visit</h3>
        </div>
        <div className="section-description">
          Document all skilled care services, interventions, and professional treatments provided during this visit
        </div>
        
        {/* Content Stats */}
        <div className="content-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <i className="fas fa-file-alt"></i>
              {stats.wordCount} Words
            </div>
            <div className="stat-item">
              <i className="fas fa-keyboard"></i>
              {stats.charCount} Characters
            </div>
            <div className="stat-item">
              <i className="fas fa-list-ol"></i>
              {stats.lineCount} Lines
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Area */}
      <div className="documentation-group">
        <div className="group-header">
          <div className="group-title">
            <i className="fas fa-pen-nib"></i>
            Skilled Care Documentation
          </div>
          <div className="group-description">
            Provide detailed documentation of all skilled care services rendered during this visit
          </div>
        </div>

        <div className="documentation-section">
          <div className="documentation-container">
            <div className="textarea-wrapper">
              <textarea
                className="skilled-care-textarea"
                placeholder="Document skilled care provided during this visit including:&#10;&#10;• Assessment findings and clinical observations&#10;• Therapeutic interventions performed&#10;• Patient education provided&#10;• Skilled procedures completed&#10;• Patient response to treatment&#10;• Progress toward goals&#10;• Plan modifications made&#10;• Clinical decision-making rationale&#10;• Safety issues addressed&#10;• Coordination with other disciplines&#10;&#10;Be specific and detailed to support medical necessity and skilled level of care..."
                value={formData.skilledCareNotes || ''}
                onChange={(e) => handleChange('skilledCareNotes', e.target.value)}
                rows="12"
              />
              
              {/* Floating Stats */}
              <div className="floating-stats">
                <span className="word-count">{stats.wordCount} words</span>
                <span className="char-count">{stats.charCount} chars</span>
              </div>
            </div>

            {/* Documentation Guidelines */}
            <div className="documentation-guidelines">
              <div className="guidelines-header">
                <i className="fas fa-lightbulb"></i>
                Documentation Guidelines
              </div>
              <div className="guidelines-content">
                <div className="guideline-category">
                  <h4>Assessment & Clinical Findings</h4>
                  <ul>
                    <li>Vital signs and measurements</li>
                    <li>Physical examination findings</li>
                    <li>Functional status observations</li>
                    <li>Pain assessment results</li>
                  </ul>
                </div>
                <div className="guideline-category">
                  <h4>Therapeutic Interventions</h4>
                  <ul>
                    <li>Manual therapy techniques used</li>
                    <li>Exercise prescription and progression</li>
                    <li>Modalities applied</li>
                    <li>Skilled procedures performed</li>
                  </ul>
                </div>
                <div className="guideline-category">
                  <h4>Patient Response & Progress</h4>
                  <ul>
                    <li>Tolerance to interventions</li>
                    <li>Functional improvements noted</li>
                    <li>Patient understanding demonstration</li>
                    <li>Goal achievement progress</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Quality Indicator */}
      {stats.wordCount > 0 && (
        <div className="documentation-quality">
          <div className="quality-header">
            <h3 className="quality-title">
              <i className="fas fa-chart-line"></i>
              Documentation Quality Assessment
            </h3>
          </div>
          
          <div className="quality-indicators">
            <div className="quality-metrics">
              <div className={`quality-metric ${stats.wordCount >= 50 ? 'good' : stats.wordCount >= 25 ? 'fair' : 'needs-improvement'}`}>
                <div className="metric-icon">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="metric-content">
                  <span className="metric-label">Content Length</span>
                  <span className="metric-value">
                    {stats.wordCount >= 50 ? 'Comprehensive' : 
                     stats.wordCount >= 25 ? 'Adequate' : 'Brief'}
                  </span>
                </div>
              </div>
              
              <div className={`quality-metric ${stats.lineCount >= 5 ? 'good' : stats.lineCount >= 3 ? 'fair' : 'needs-improvement'}`}>
                <div className="metric-icon">
                  <i className="fas fa-align-left"></i>
                </div>
                <div className="metric-content">
                  <span className="metric-label">Organization</span>
                  <span className="metric-value">
                    {stats.lineCount >= 5 ? 'Well-Structured' : 
                     stats.lineCount >= 3 ? 'Organized' : 'Basic'}
                  </span>
                </div>
              </div>
            </div>

            <div className="documentation-tips">
              <div className="tips-header">
                <i className="fas fa-info-circle"></i>
                Documentation Tips
              </div>
              <div className="tips-list">
                {stats.wordCount < 25 && (
                  <div className="tip-item warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    Consider adding more detail to support skilled level of care
                  </div>
                )}
                {stats.wordCount >= 25 && stats.wordCount < 50 && (
                  <div className="tip-item info">
                    <i className="fas fa-info-circle"></i>
                    Good foundation - consider adding patient response details
                  </div>
                )}
                {stats.wordCount >= 50 && (
                  <div className="tip-item success">
                    <i className="fas fa-check-circle"></i>
                    Comprehensive documentation supporting skilled care
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkilledCareProvidedThisVisitSkillsSection;