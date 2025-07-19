import React from 'react';
import '../../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/TreatmentInterventionsSection.scss';

const TreatmentInterventionsSection = ({ data, onChange, sectionId, config }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  return (
    <div className="treatment-interventions-section">
      <div className="form-section">
        <div className="section-title">
          <h2>
            <i className="fas fa-stethoscope"></i>
            Treatment As Tolerated/Interventions
          </h2>
        </div>
        
        <div className="treatment-options-grid">
          {/* Basic Interventions */}
          <div className="treatment-category">
            <h4 className="category-title">
              <i className="fas fa-clipboard-check"></i>
              Basic Interventions
            </h4>
            <div className="checkbox-group">
              {[
                { id: 'treatmentEvaluation', label: 'Evaluation', icon: 'fas fa-clipboard-check' },
                { id: 'therapeuticExercise', label: 'Therapeutic Exercise', icon: 'fas fa-dumbbell' },
                { id: 'stretchingFlexibility', label: 'Stretching/Flexibility', icon: 'fas fa-arrows-alt-h' },
                { id: 'manualTherapy', label: 'Manual Therapy', icon: 'fas fa-hands' }
              ].map(treatment => (
                <div className="checkbox-item" key={treatment.id}>
                  <input 
                    type="checkbox" 
                    id={treatment.id} 
                    checked={data?.[treatment.id] || false}
                    onChange={(e) => handleChange(treatment.id, e.target.checked)}
                  />
                  <label htmlFor={treatment.id}>
                    <i className={treatment.icon}></i>
                    {treatment.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Mobility Training */}
          <div className="treatment-category">
            <h4 className="category-title">
              <i className="fas fa-walking"></i>
              Mobility Training
            </h4>
            <div className="checkbox-group">
              {[
                { id: 'gaitTraining', label: 'Gait Training', icon: 'fas fa-walking' },
                { id: 'transferTraining', label: 'Transfer Training', icon: 'fas fa-exchange-alt' },
                { id: 'balance', label: 'Balance', icon: 'fas fa-balance-scale' },
                { id: 'neuromuscularReeducation', label: 'Neuromuscular Re-Education', icon: 'fas fa-brain' }
              ].map(treatment => (
                <div className="checkbox-item" key={treatment.id}>
                  <input 
                    type="checkbox" 
                    id={treatment.id} 
                    checked={data?.[treatment.id] || false}
                    onChange={(e) => handleChange(treatment.id, e.target.checked)}
                  />
                  <label htmlFor={treatment.id}>
                    <i className={treatment.icon}></i>
                    {treatment.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Safety & Education */}
          <div className="treatment-category">
            <h4 className="category-title">
              <i className="fas fa-shield-alt"></i>
              Safety & Education
            </h4>
            <div className="checkbox-group">
              {[
                { id: 'safetyTraining', label: 'Safety Training', icon: 'fas fa-shield-alt' },
                { id: 'establishHomeProgram', label: 'Establish Home Program', icon: 'fas fa-home' },
                { id: 'selfCareManagement', label: 'Self Care Management', icon: 'fas fa-user-cog' },
                { id: 'voiceTrainingEducation', label: 'Voice Training Education', icon: 'fas fa-microphone' }
              ].map(treatment => (
                <div className="checkbox-item" key={treatment.id}>
                  <input 
                    type="checkbox" 
                    id={treatment.id} 
                    checked={data?.[treatment.id] || false}
                    onChange={(e) => handleChange(treatment.id, e.target.checked)}
                  />
                  <label htmlFor={treatment.id}>
                    <i className={treatment.icon}></i>
                    {treatment.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Specialized Interventions */}
          <div className="treatment-category">
            <h4 className="category-title">
              <i className="fas fa-star"></i>
              Specialized Interventions
            </h4>
            <div className="checkbox-group">
              {[
                { id: 'painModalities', label: 'Pain Modalities', icon: 'fas fa-bolt' },
                { id: 'woundCare', label: 'Wound Care', icon: 'fas fa-band-aid' },
                { id: 'chestPhysicalTherapy', label: 'Chest Physical Therapy', icon: 'fas fa-lungs' },
                { id: 'prostheticTherapy', label: 'Prosthetic Therapy', icon: 'fas fa-hand-paper' },
                { id: 'fallRiskTreatment', label: 'Fall Risk Treatment', icon: 'fas fa-person-falling' }
              ].map(treatment => (
                <div className="checkbox-item" key={treatment.id}>
                  <input 
                    type="checkbox" 
                    id={treatment.id} 
                    checked={data?.[treatment.id] || false}
                    onChange={(e) => handleChange(treatment.id, e.target.checked)}
                  />
                  <label htmlFor={treatment.id}>
                    <i className={treatment.icon}></i>
                    {treatment.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Special Agreement Checkbox */}
        <div className="form-row special-agreement">
          <div className="checkbox-item wide-checkbox">
            <input 
              type="checkbox" 
              id="ptcgInvolvedInGoals" 
              checked={data?.ptcgInvolvedInGoals || false}
              onChange={(e) => handleChange('ptcgInvolvedInGoals', e.target.checked)}
            />
            <label htmlFor="ptcgInvolvedInGoals">
              <i className="fas fa-users"></i>
              PT and CG involved in development of goals and in agreement with POC
            </label>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-info-circle"></i>
              Additional Information
            </label>
            <textarea 
              value={data?.treatmentToleratedAdditional || ''}
              onChange={(e) => handleChange('treatmentToleratedAdditional', e.target.value)}
              rows={3}
              placeholder="Additional information about treatment"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentInterventionsSection;