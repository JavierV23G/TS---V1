import React from 'react';
import '../../../../../../../styles/admin/Patients/InfoPaciente/NotesAndSign/sections/MedicationSection.scss';

const MedicationSection = ({ data, onChange, sectionId, config, onOpenTest }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  return (
    <div className="medication-section">
      <div className="form-section">
        <div className="section-title">
          <h2>Medication</h2>
        </div>
        
        <div className="form-row">
          <div className="form-group radio-group">
            <label><i className="fas fa-pills"></i> Has Medication Changed</label>
            <div className="radio-options">
              <div className="radio-option">
                <input 
                  type="radio" 
                  id="medicationChangedNA" 
                  name="medicationChanged"
                  checked={data?.medicationChanged === 'N/A'}
                  onChange={() => handleChange('medicationChanged', 'N/A')}
                />
                <label htmlFor="medicationChangedNA">N/A</label>
              </div>
              <div className="radio-option">
                <input 
                  type="radio" 
                  id="medicationChangedYes" 
                  name="medicationChanged"
                  checked={data?.medicationChanged === 'Yes'}
                  onChange={() => handleChange('medicationChanged', 'Yes')}
                />
                <label htmlFor="medicationChangedYes">Yes</label>
              </div>
              <div className="radio-option">
                <input 
                  type="radio" 
                  id="medicationChangedNo" 
                  name="medicationChanged"
                  checked={data?.medicationChanged === 'No'}
                  onChange={() => handleChange('medicationChanged', 'No')}
                />
                <label htmlFor="medicationChangedNo">No</label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label><i className="fas fa-info-circle"></i> Additional Information</label>
            <textarea 
              value={data?.medicationAdditional || ''}
              onChange={(e) => handleChange('medicationAdditional', e.target.value)}
              rows={4}
              placeholder="Additional medication information"
            />
          </div>
        </div>
        
        {onOpenTest && (
          <button 
            className="medication-list-btn"
            onClick={() => onOpenTest('Medication List')}
          >
            <i className="fas fa-pills"></i>
            <span>View/Add Medication List</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MedicationSection;