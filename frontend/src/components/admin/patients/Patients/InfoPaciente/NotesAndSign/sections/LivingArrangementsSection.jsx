import React from 'react';
import '../../../../../../../styles/admin/Patients/InfoPaciente/NotesAndSign/sections/LivingArrangementsSection.scss';

const LivingArrangementsSection = ({ data, onChange, sectionId, config }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  return (
    <div className="living-arrangements-section">
      <div className="form-section">
        <div className="section-title">
          <h3>
            <i className="fas fa-home"></i>
            Living Arrangements
          </h3>
        </div>
        
        <div className="card-grid two-columns">
          <div className="feature-card">
            <div className="card-header">
              <h4>Home Features</h4>
              <i className="fas fa-house-user"></i>
            </div>
            <div className="card-content">
              <div className="checkbox-grid">
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="clutter" 
                    checked={data?.clutter || false}
                    onChange={(e) => handleChange('clutter', e.target.checked)}
                  />
                  <label htmlFor="clutter">Clutter</label>
                </div>
                
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="throwRugs" 
                    checked={data?.throwRugs || false}
                    onChange={(e) => handleChange('throwRugs', e.target.checked)}
                  />
                  <label htmlFor="throwRugs">Throw Rugs</label>
                </div>
                
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="steps" 
                    checked={data?.steps || false}
                    onChange={(e) => handleChange('steps', e.target.checked)}
                  />
                  <label htmlFor="steps">Steps</label>
                </div>
                
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="stairs" 
                    checked={data?.stairs || false}
                    onChange={(e) => handleChange('stairs', e.target.checked)}
                  />
                  <label htmlFor="stairs">Stairs</label>
                </div>
                
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="railing" 
                    checked={data?.railing || false}
                    onChange={(e) => handleChange('railing', e.target.checked)}
                  />
                  <label htmlFor="railing">Railing</label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="card-header">
              <h4>Housing Type</h4>
              <i className="fas fa-building"></i>
            </div>
            <div className="card-content">
              <div className="checkbox-grid">
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="house" 
                    checked={data?.house || false}
                    onChange={(e) => handleChange('house', e.target.checked)}
                  />
                  <label htmlFor="house">House</label>
                </div>
                
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="apartment" 
                    checked={data?.apartment || false}
                    onChange={(e) => handleChange('apartment', e.target.checked)}
                  />
                  <label htmlFor="apartment">Apartment</label>
                </div>
                
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="mobileHome" 
                    checked={data?.mobileHome || false}
                    onChange={(e) => handleChange('mobileHome', e.target.checked)}
                  />
                  <label htmlFor="mobileHome">Mobile Home</label>
                </div>
                
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="assistedLiving" 
                    checked={data?.assistedLiving || false}
                    onChange={(e) => handleChange('assistedLiving', e.target.checked)}
                  />
                  <label htmlFor="assistedLiving">Assisted Living</label>
                </div>
                
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="governmentHousing" 
                    checked={data?.governmentHousing || false}
                    onChange={(e) => handleChange('governmentHousing', e.target.checked)}
                  />
                  <label htmlFor="governmentHousing">Government Housing</label>
                </div>
                
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="nursingHome" 
                    checked={data?.nursingHome || false}
                    onChange={(e) => handleChange('nursingHome', e.target.checked)}
                  />
                  <label htmlFor="nursingHome">Nursing Home</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-info-circle"></i>
              Additional Information
            </label>
            <textarea 
              value={data?.livingAdditional || ''}
              onChange={(e) => handleChange('livingAdditional', e.target.value)}
              rows={4}
              placeholder="Additional information about living arrangements"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivingArrangementsSection;