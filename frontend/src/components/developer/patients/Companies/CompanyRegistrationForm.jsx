import React, { useState, useEffect } from 'react';
import '../../../../styles/developer/Patients/Companies/CompanyRegistrationForm.scss';

const CompanyRegistrationForm = ({ onCancel, onSave }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing company registration module...');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: '',
    fullCompanyName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    contact: {
      managerName: '',
      position: '',
      phone: '',
      email: '',
    },
    website: '',
    taxID: '',
    foundedYear: '',
    companyType: '',
    specialties: [],
    logo: null,
    status: 'active',
  });

  useEffect(() => {
    const loadingMessages = [
      { message: 'Connecting to database...', time: 800 },
      { message: 'Loading company registration module...', time: 600 },
      { message: 'Preparing company form...', time: 400 },
      { message: 'Verifying company templates...', time: 500 },
      { message: 'Ready to register new company', time: 1000 }
    ];
    
    const timeouts = [];
    
    loadingMessages.forEach((item, index) => {
      const timeout = setTimeout(() => {
        setLoadingMessage(item.message);
        if (index === loadingMessages.length - 1) {
          const finalTimeout = setTimeout(() => setIsLoading(false), 600);
          timeouts.push(finalTimeout);
        }
      }, item.time);
      
      timeouts.push(timeout);
    });
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSpecialtyChange = (specialty) => {
    const currentSpecialties = [...formData.specialties];
    
    if (currentSpecialties.includes(specialty)) {
      const updatedSpecialties = currentSpecialties.filter(s => s !== specialty);
      setFormData({
        ...formData,
        specialties: updatedSpecialties
      });
    } else {
      setFormData({
        ...formData,
        specialties: [...currentSpecialties, specialty]
      });
    }
  };

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      setFormData({
        ...formData,
        logo: e.target.files[0]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccessMessage(true);
      
      setTimeout(() => {
        if (onSave) {
          onSave(formData);
        }
      }, 2000);
    }, 2000);
  };

  const specialtyOptions = [
    'Physical Therapy',
    'Occupational Therapy',
    'Speech Therapy',
    'Nursing Care',
    'Elderly Care',
    'Pediatric Care',
    'Rehabilitative Care',
    'Post-Surgery Care',
    'Chronic Disease Management',
    'Disability Support'
  ];

  const companyTypes = [
    'Home Healthcare',
    'Hospital',
    'Medical Center',
    'Rehabilitation Center',
    'Nursing Home',
    'Physical Therapy Clinic',
    'Occupational Therapy Clinic',
    'Speech Therapy Clinic',
    'Multi-Specialty Care Center',
    'Other'
  ];

  const getSpecialtyIcon = (specialty) => {
    switch(specialty) {
      case 'Physical Therapy':
        return <i className="fas fa-walking"></i>;
      case 'Occupational Therapy':
        return <i className="fas fa-briefcase"></i>;
      case 'Speech Therapy':
        return <i className="fas fa-comment-medical"></i>;
      case 'Nursing Care':
        return <i className="fas fa-user-nurse"></i>;
      case 'Elderly Care':
        return <i className="fas fa-hand-holding-heart"></i>;
      case 'Pediatric Care':
        return <i className="fas fa-baby"></i>;
      case 'Rehabilitative Care':
        return <i className="fas fa-heartbeat"></i>;
      case 'Post-Surgery Care':
        return <i className="fas fa-hospital"></i>;
      case 'Chronic Disease Management':
        return <i className="fas fa-chart-line"></i>;
      case 'Disability Support':
        return <i className="fas fa-wheelchair"></i>;
      default:
        return <i className="fas fa-plus-circle"></i>;
    }
  };

  if (showSuccessMessage) {
    return (
      <div className="company-registration-container">
        <div className="success-message">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2>Company Successfully Registered!</h2>
          <p>The company has been added to the system and is now available for staff assignments.</p>
          <div className="success-actions">
            <button 
              className="new-company-btn" 
              onClick={() => {
                setFormData({
                  companyName: '',
                  fullCompanyName: '',
                  address: {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: '',
                  },
                  contact: {
                    managerName: '',
                    position: '',
                    phone: '',
                    email: '',
                  },
                  website: '',
                  taxID: '',
                  foundedYear: '',
                  companyType: '',
                  specialties: [],
                  logo: null,
                  status: 'active',
                });
                setShowSuccessMessage(false);
              }}
            >
              <i className="fas fa-plus"></i> Register Another Company
            </button>
            <button 
              className="view-companies-btn" 
              onClick={() => {
                if (onCancel) {
                  onCancel('viewCompanies');
                }
              }}
            >
              <i className="fas fa-list"></i> View All Companies
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="company-registration-container">
      {isLoading ? (
        <div className="premium-clinical-loading-container">
          {/* Advanced Clinical Background Effects */}
          <div className="clinical-background">
            {/* DNA Helix Animation */}
            <div className="dna-helix">
              {[...Array(15)].map((_, i) => (
                <div key={i} className={`helix-particle helix-${i + 1}`}></div>
              ))}
            </div>
            
            {/* Floating Molecules */}
            <div className="floating-molecules">
              {[...Array(25)].map((_, i) => (
                <div key={i} className={`molecule molecule-${i + 1}`}>
                  <div className="molecule-core"></div>
                  <div className="electron electron-1"></div>
                  <div className="electron electron-2"></div>
                  <div className="electron electron-3"></div>
                </div>
              ))}
            </div>
            
            {/* Medical Grid */}
            <div className="medical-grid"></div>
            
            {/* Advanced Pulse Waves */}
            <div className="pulse-waves">
              <div className="wave wave-1"></div>
              <div className="wave wave-2"></div>
              <div className="wave wave-3"></div>
              <div className="wave wave-4"></div>
            </div>
          </div>

          {/* Premium Clinical Interface */}
          <div className="clinical-interface">
            {/* Company Logo Section */}
            <div className="company-header">
              <div className="company-logo">
                MC
              </div>
              <h1 className="company-title">Motive Home Care</h1>
              <p className="company-subtitle">Premium Healthcare Registration System</p>
            </div>

            {/* Central Progress Display */}
            <div className="progress-center">
              <div className="progress-ring">
                {/* Advanced SVG Progress Ring */}
                <svg className="progress-svg" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="registrationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2196f3" />
                      <stop offset="25%" stopColor="#4caf50" />
                      <stop offset="50%" stopColor="#ff9800" />
                      <stop offset="75%" stopColor="#9c27b0" />
                      <stop offset="100%" stopColor="#2196f3" />
                    </linearGradient>
                    <filter id="registrationGlow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Background Circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="rgba(44, 62, 80, 0.15)"
                    strokeWidth="2"
                  />
                  
                  {/* Animated Progress Circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="url(#registrationGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="565"
                    strokeDashoffset="565"
                    transform="rotate(-90 100 100)"
                    filter="url(#registrationGlow)"
                    className="progress-path"
                  />
                </svg>
                
                {/* Inner Content */}
                <div className="progress-content">
                  <div className="registration-icon">
                    <i className="fas fa-building"></i>
                  </div>
                  <div className="progress-status">
                    <span className="status-text">LOADING</span>
                  </div>
                </div>
                
                {/* Pulse Ring */}
                <div className="pulse-ring"></div>
              </div>
            </div>

            {/* Registration Information Panel */}
            <div className="registration-panel">
              <div className="panel-header">
                <div className="medical-icon">
                  <i className="fas fa-clipboard-check"></i>
                </div>
                <div className="panel-content">
                  <h3 className="process-title">{loadingMessage}</h3>
                  <p className="process-description">Preparing healthcare company registration system</p>
                </div>
              </div>
              
              <div className="progress-metrics">
                <div className="metric">
                  <span className="metric-label">System Status</span>
                  <span className="metric-value" style={{color: '#2196f3'}}>
                    INITIALIZING
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Security Level</span>
                  <span className="metric-value">HIPAA COMPLIANT</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Database</span>
                  <span className="metric-value" style={{color: '#4caf50'}}>
                    CONNECTED
                  </span>
                </div>
              </div>

              <div className="status-indicator-bar">
                <div className="status-light" style={{backgroundColor: '#2196f3'}}></div>
                <div className="status-message">
                  TherapySync Pro - Company Registration Module
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="company-form-container">
          <div className="form-header">
            <div className="header-controls">
              <button 
                type="button" 
                className="back-btn" 
                onClick={onCancel}
                title="Back to Company Management"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Back</span>
              </button>
            </div>
            <h2>Register New Company</h2>
            <p>Complete the information to register a new healthcare company or agency in the system</p>
          </div>
          
          <form onSubmit={handleSubmit} className="company-form">
            <div className="form-section">
              <div className="section-header">
                <i className="fas fa-building"></i>
                <h3>Company Identity</h3>
              </div>
              <div className="section-content">
                <div className="form-group">
                  <label htmlFor="companyName">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter company name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fullCompanyName">Legal Company Name</label>
                  <input
                    type="text"
                    id="fullCompanyName"
                    name="fullCompanyName"
                    value={formData.fullCompanyName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter full legal name (including LLC, Inc, etc.)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="taxID">Tax ID / EIN</label>
                  <input
                    type="text"
                    id="taxID"
                    name="taxID"
                    value={formData.taxID}
                    onChange={handleInputChange}
                    required
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="foundedYear">Year Founded</label>
                  <input
                    type="text"
                    id="foundedYear"
                    name="foundedYear"
                    value={formData.foundedYear}
                    onChange={handleInputChange}
                    placeholder="YYYY"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="www.company.com"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="companyType">Company Type</label>
                  <select
                    id="companyType"
                    name="companyType"
                    value={formData.companyType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select company type</option>
                    {companyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Company Logo</label>
                  <div className="logo-upload">
                    {formData.logo ? (
                      <div className="logo-preview">
                        <img src={URL.createObjectURL(formData.logo)} alt="Company logo preview" />
                        <button type="button" onClick={() => setFormData({...formData, logo: null})}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="upload-container">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <span>Upload company logo</span>
                        <input 
                          type="file" 
                          onChange={handleLogoChange} 
                          accept="image/*" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <div className="section-header">
                <i className="fas fa-map-marker-alt"></i>
                <h3>Company Address</h3>
              </div>
              <div className="section-content">
                <div className="form-group full-width">
                  <label htmlFor="address.street">Street Address</label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    required
                    placeholder="Street address"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="address.city">City</label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    required
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="address.state">State</label>
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    required
                    placeholder="State"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="address.zipCode">Zip Code</label>
                  <input
                    type="text"
                    id="address.zipCode"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    required
                    placeholder="Zip Code"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="address.country">Country</label>
                  <input
                    type="text"
                    id="address.country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    required
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <div className="section-header">
                <i className="fas fa-user-tie"></i>
                <h3>Primary Contact Person</h3>
              </div>
              <div className="section-content">
                <div className="form-group">
                  <label htmlFor="contact.managerName">Contact Name</label>
                  <input
                    type="text"
                    id="contact.managerName"
                    name="contact.managerName"
                    value={formData.contact.managerName}
                    onChange={handleInputChange}
                    required
                    placeholder="Full name of primary contact"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact.position">Position</label>
                  <input
                    type="text"
                    id="contact.position"
                    name="contact.position"
                    value={formData.contact.position}
                    onChange={handleInputChange}
                    required
                    placeholder="Job title"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact.phone">Phone Number</label>
                  <input
                    type="tel"
                    id="contact.phone"
                    name="contact.phone"
                    value={formData.contact.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="(XXX) XXX-XXXX"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact.email">Email Address</label>
                  <input
                    type="email"
                    id="contact.email"
                    name="contact.email"
                    value={formData.contact.email}
                    onChange={handleInputChange}
                    required
                    placeholder="email@company.com"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section services-section">
              <div className="section-header">
                <i className="fas fa-stethoscope"></i>
                <h3>Services & Specialties</h3>
              </div>
              <div className="section-content">
                <div className="specialties-container">
                  <label className="specialties-label">Select services offered by this company (select all that apply)</label>
                  
                  <div className="specialties-cards">
                    {specialtyOptions.map((specialty) => (
                      <div 
                        key={specialty} 
                        className={`specialty-card ${formData.specialties.includes(specialty) ? 'selected' : ''}`}
                        onClick={() => handleSpecialtyChange(specialty)}
                      >
                        <div className="specialty-icon">
                          {getSpecialtyIcon(specialty)}
                        </div>
                        <div className="specialty-name">{specialty}</div>
                        <div className="specialty-check">
                          <i className="fas fa-check-circle"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-section status-section">
              <div className="section-header">
                <i className="fas fa-toggle-on"></i>
                <h3>Company Status</h3>
              </div>
              <div className="section-content">
                <div className="status-toggle">
                  <span className="status-label">Company Status:</span>
                  <div className="toggle-switch-container">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.status === 'active'}
                        onChange={() => 
                          setFormData({
                            ...formData,
                            status: formData.status === 'active' ? 'inactive' : 'active'
                          })
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className={`status-text ${formData.status === 'active' ? 'active-status' : 'inactive-status'}`}>
                      {formData.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <p className="status-description">
                  {formData.status === 'active' 
                    ? 'Active companies are visible in the system and can have staff assigned to them.' 
                    : 'Inactive companies are hidden from general use but their data is preserved in the system.'}
                </p>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onCancel} disabled={isSaving}>
                <i className="fas fa-times"></i> Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i> Registering...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Register Company
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CompanyRegistrationForm;