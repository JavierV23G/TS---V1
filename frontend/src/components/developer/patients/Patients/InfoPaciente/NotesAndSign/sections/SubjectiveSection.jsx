import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/SubjectiveSection.scss';

const SubjectiveSection = ({ data, onChange, sectionId, config }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  return (
    <div className="subjective-section">
      <div className="form-section">
        <div className="section-title">
          <h3>
            <i className="fas fa-comment-alt"></i>
            Subjective
          </h3>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-file-alt"></i>
              Patient's Subjective Experience
            </label>
            <textarea 
              value={data?.subjective || ''}
              onChange={(e) => handleChange('subjective', e.target.value)}
              rows={6}
              placeholder="Enter patient's subjective experience and complaints"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectiveSection;