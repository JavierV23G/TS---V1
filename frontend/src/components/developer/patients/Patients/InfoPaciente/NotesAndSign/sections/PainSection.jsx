import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/PainSection.scss';

const PainSection = ({ data, onChange, sectionId, config }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  const handleCheckboxGroupChange = (field, option, isChecked) => {
    const currentValues = data?.[field] || [];
    let newValues;
    
    if (isChecked) {
      newValues = [...currentValues, option];
    } else {
      newValues = currentValues.filter(item => item !== option);
    }
    
    handleChange(field, newValues);
  };

  return (
    <div className="pain-section">
      <div className="section-title">
        <h2>Pain Assessment</h2>
      </div>
      
      <div className="pain-layout">
        {/* Is patient experiencing pain? */}
        <div className="form-group">
          <label>
            <i className="fas fa-question-circle"></i>
            Is patient experiencing pain?
          </label>
          <select 
            value={data?.is_experiencing_pain || ''}
            onChange={(e) => handleChange('is_experiencing_pain', e.target.value)}
            className="form-select"
          >
            <option value="">Select an option</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        {/* Pain Rating Scale (0-10) */}
        <div className="form-group">
          <label>
            <i className="fas fa-thermometer-half"></i>
            Pain Rating (0-10)
          </label>
          <div className="pain-scale-container">
            <input 
              type="number" 
              value={data?.pain_rating_scale || ''}
              onChange={(e) => handleChange('pain_rating_scale', parseInt(e.target.value))}
              min="0"
              max="10"
              placeholder="0-10"
              className="pain-rating-input"
            />
            <div className="pain-scale">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                <button 
                  key={level}
                  type="button"
                  className={`pain-level ${(data?.pain_rating_scale === level) ? 'active' : ''}`}
                  onClick={() => handleChange('pain_rating_scale', level)}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="pain-scale-labels">
              <span>No Pain</span>
              <span>Moderate</span>
              <span>Worst Pain</span>
            </div>
          </div>
        </div>

        {/* Intensity */}
        <div className="form-group">
          <label>
            <i className="fas fa-chart-bar"></i>
            Intensity
          </label>
          <select 
            value={data?.intensity || ''}
            onChange={(e) => handleChange('intensity', e.target.value)}
            className="form-select"
          >
            <option value="">Select intensity</option>
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
            <option value="Unbearable">Unbearable</option>
          </select>
        </div>

        {/* Collected using */}
        <div className="form-group">
          <label>
            <i className="fas fa-clipboard-check"></i>
            Collected using
          </label>
          <select 
            value={data?.collected_using || ''}
            onChange={(e) => handleChange('collected_using', e.target.value)}
            className="form-select"
          >
            <option value="">Select method</option>
            <option value="Numeric Scale">Numeric Scale</option>
            <option value="Wong-Baker FACES">Wong-Baker FACES</option>
            <option value="Verbal">Verbal</option>
            <option value="Behavioral Observation">Behavioral Observation</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Unable to communicate checkbox */}
        <div className="form-group checkbox-group">
          <div className="checkbox-item">
            <input 
              type="checkbox" 
              id="unable_to_communicate" 
              checked={data?.unable_to_communicate || false}
              onChange={(e) => handleChange('unable_to_communicate', e.target.checked)}
            />
            <label htmlFor="unable_to_communicate">
              <i className="fas fa-comment-slash"></i>
              Unable to communicate
            </label>
          </div>
        </div>

        {/* Pain interference description */}
        <div className="form-group">
          <label>
            <i className="fas fa-exclamation-triangle"></i>
            How does the pain interfere / impact their functional / activity level?
          </label>
          <textarea 
            value={data?.pain_interference_description || ''}
            onChange={(e) => handleChange('pain_interference_description', e.target.value)}
            placeholder="Describe how pain affects patient's daily activities and function..."
            rows={4}
            className="form-textarea"
          />
        </div>

        {/* Non-verbals demonstrated */}
        <div className="form-group">
          <label>
            <i className="fas fa-eye"></i>
            Non-verbals demonstrated
          </label>
          <div className="checkbox-grid">
            {[
              "Diaphoresis",
              "Grimacing", 
              "Moaning/Crying",
              "Guarding",
              "Irritability",
              "Anger",
              "Tense",
              "Restlessness",
              "Change in vital signs",
              "Self-assessment",
              "Implications",
              "Other"
            ].map(option => (
              <div className="checkbox-item" key={option}>
                <input 
                  type="checkbox" 
                  id={`nonverbal_${option.replace(/[^a-zA-Z0-9]/g, '_')}`}
                  checked={data?.non_verbals_demonstrated?.includes(option) || false}
                  onChange={(e) => handleCheckboxGroupChange('non_verbals_demonstrated', option, e.target.checked)}
                />
                <label htmlFor={`nonverbal_${option.replace(/[^a-zA-Z0-9]/g, '_')}`}>
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainSection;