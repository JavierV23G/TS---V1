import React, { useState, useEffect } from 'react';
import '../../../../styles/developer/Patients/Companies/CompanyProfileModal.scss';

const CompanyProfileModal = ({ company, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    status: 'paid',
  });

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

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName || '',
        fullCompanyName: company.fullCompanyName || '',
        address: {
          street: company.address?.street || '',
          city: company.address?.city || '',
          state: company.address?.state || '',
          zipCode: company.address?.zipCode || '',
          country: company.address?.country || '',
        },
        contact: {
          managerName: company.contact?.managerName || '',
          position: company.contact?.position || '',
          phone: company.contact?.phone || '',
          email: company.contact?.email || '',
        },
        website: company.website || '',
        taxID: company.taxID || '',
        foundedYear: company.foundedYear || '',
        companyType: company.companyType || '',
        specialties: company.specialties || [],
        logo: null,
        status: company.status || 'paid',
      });
    }
  }, [company]);

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

  const handleSpecialtyToggle = (specialty) => {
    const currentSpecialties = [...formData.specialties];
    if (currentSpecialties.includes(specialty)) {
      setFormData({
        ...formData,
        specialties: currentSpecialties.filter(s => s !== specialty)
      });
    } else {
      setFormData({
        ...formData,
        specialties: [...currentSpecialties, specialty]
      });
    }
  };

  const handleStatusToggle = () => {
    const statusOptions = ['paid', 'suspended', 'unpaid'];
    const currentIndex = statusOptions.indexOf(formData.status);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    setFormData({
      ...formData,
      status: statusOptions[nextIndex]
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      if (onSave) {
        onSave(formData);
      }
    }, 1000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
    if (company) {
      setFormData({
        companyName: company.companyName || '',
        fullCompanyName: company.fullCompanyName || '',
        address: {
          street: company.address?.street || '',
          city: company.address?.city || '',
          state: company.address?.state || '',
          zipCode: company.address?.zipCode || '',
          country: company.address?.country || '',
        },
        contact: {
          managerName: company.contact?.managerName || '',
          position: company.contact?.position || '',
          phone: company.contact?.phone || '',
          email: company.contact?.email || '',
        },
        website: company.website || '',
        taxID: company.taxID || '',
        foundedYear: company.foundedYear || '',
        companyType: company.companyType || '',
        specialties: company.specialties || [],
        logo: null,
        status: company.status || 'paid',
      });
    }
  };

  if (!company) return null;

  const getStatusConfig = (status) => {
    const configs = {
      paid: {
        icon: 'fas fa-check-circle',
        text: 'Paid',
        class: 'paid'
      },
      suspended: {
        icon: 'fas fa-pause-circle',
        text: 'Suspended',
        class: 'suspended'
      },
      unpaid: {
        icon: 'fas fa-exclamation-circle',
        text: 'Unpaid',
        class: 'unpaid'
      }
    };
    return configs[status] || configs.paid;
  };

  const statusConfig = getStatusConfig(formData.status);

  return (
    <div className="epic-modal-overlay" onClick={onClose}>
      <div className="epic-modal-container" onClick={e => e.stopPropagation()}>
        {/* Floating Particles Background */}
        <div className="particles-container">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>

        {/* Animated Border Effect */}
        <div className="border-glow"></div>

        {/* Header Section */}
        <div className="epic-header">
          <div className="header-background">
            <div className="header-wave"></div>
            <div className="header-dots"></div>
          </div>
          <div className="header-content">
            <div className="company-avatar-section">
              <div className="avatar-ring">
                <div className="avatar-inner">
                  {formData.companyName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="company-meta">
                <h1 className="company-name">{formData.companyName}</h1>
                <p className="company-subtitle">{formData.companyType} Healthcare Provider</p>
                <div className={`status-badge ${statusConfig.class}`}>
                  <i className={statusConfig.icon}></i>
                  <span>{statusConfig.text}</span>
                </div>
              </div>
            </div>
            <div className="header-controls">
              {!isEditing ? (
                <>
                  <button className="epic-btn edit-btn" onClick={() => setIsEditing(true)}>
                    <div className="btn-glow"></div>
                    <i className="fas fa-edit"></i>
                    <span>Edit Profile</span>
                  </button>
                  <button className="epic-btn close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                  </button>
                </>
              ) : (
                <>
                  <button className="epic-btn cancel-btn" onClick={handleCancel} disabled={isSaving}>
                    <i className="fas fa-times"></i>
                    <span>Cancel</span>
                  </button>
                  <button className="epic-btn save-btn" onClick={handleSave} disabled={isSaving}>
                    <div className="btn-glow"></div>
                    {isSaving ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="epic-content">
          {/* Company Information Section */}
          <div className="content-section company-section">
            <div className="section-header">
              <div className="section-icon">
                <i className="fas fa-building"></i>
              </div>
              <h2>Company Information</h2>
              <div className="section-line"></div>
            </div>
            <div className="section-content">
              <div className="field-row">
                <div className="epic-field">
                  <label>Company Name</label>
                  <div className="field-container">
                    {isEditing ? (
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="epic-input"
                      />
                    ) : (
                      <div className="field-display">{formData.companyName}</div>
                    )}
                    <div className="field-glow"></div>
                  </div>
                </div>
                <div className="epic-field">
                  <label>Legal Name</label>
                  <div className="field-container">
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullCompanyName"
                        value={formData.fullCompanyName}
                        onChange={handleInputChange}
                        className="epic-input"
                      />
                    ) : (
                      <div className="field-display">{formData.fullCompanyName}</div>
                    )}
                    <div className="field-glow"></div>
                  </div>
                </div>
              </div>
              <div className="field-row">
                <div className="epic-field">
                  <label>Tax ID</label>
                  <div className="field-container">
                    {isEditing ? (
                      <input
                        type="text"
                        name="taxID"
                        value={formData.taxID}
                        onChange={handleInputChange}
                        className="epic-input"
                      />
                    ) : (
                      <div className="field-display">{formData.taxID}</div>
                    )}
                    <div className="field-glow"></div>
                  </div>
                </div>
                <div className="epic-field">
                  <label>Founded Year</label>
                  <div className="field-container">
                    {isEditing ? (
                      <input
                        type="text"
                        name="foundedYear"
                        value={formData.foundedYear}
                        onChange={handleInputChange}
                        className="epic-input"
                      />
                    ) : (
                      <div className="field-display">{formData.foundedYear}</div>
                    )}
                    <div className="field-glow"></div>
                  </div>
                </div>
              </div>
              <div className="field-row">
                <div className="epic-field">
                  <label>Company Type</label>
                  <div className="field-container">
                    {isEditing ? (
                      <select
                        name="companyType"
                        value={formData.companyType}
                        onChange={handleInputChange}
                        className="epic-select"
                      >
                        <option value="">Select type</option>
                        {companyTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="field-display">{formData.companyType}</div>
                    )}
                    <div className="field-glow"></div>
                  </div>
                </div>
                <div className="epic-field">
                  <label>Website</label>
                  <div className="field-container">
                    {isEditing ? (
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="epic-input"
                      />
                    ) : (
                      <div className="field-display">
                        {formData.website && (
                          <a href={`https://${formData.website}`} target="_blank" rel="noopener noreferrer">
                            {formData.website}
                          </a>
                        )}
                      </div>
                    )}
                    <div className="field-glow"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="content-section contact-section">
            <div className="section-header">
              <div className="section-icon">
                <i className="fas fa-user-tie"></i>
              </div>
              <h2>Primary Contact</h2>
              <div className="section-line"></div>
            </div>
            <div className="section-content">
              <div className="field-row">
                <div className="epic-field">
                  <label>Contact Name</label>
                  <div className="field-container">
                    {isEditing ? (
                      <input
                        type="text"
                        name="contact.managerName"
                        value={formData.contact.managerName}
                        onChange={handleInputChange}
                        className="epic-input"
                      />
                    ) : (
                      <div className="field-display">{formData.contact.managerName}</div>
                    )}
                    <div className="field-glow"></div>
                  </div>
                </div>
                <div className="epic-field">
                  <label>Position</label>
                  <div className="field-container">
                    {isEditing ? (
                      <input
                        type="text"
                        name="contact.position"
                        value={formData.contact.position}
                        onChange={handleInputChange}
                        className="epic-input"
                      />
                    ) : (
                      <div className="field-display">{formData.contact.position}</div>
                    )}
                    <div className="field-glow"></div>
                  </div>
                </div>
              </div>
              <div className="field-row">
                <div className="epic-field">
                  <label>Phone Number</label>
                  <div className="field-container">
                    {isEditing ? (
                      <input
                        type="tel"
                        name="contact.phone"
                        value={formData.contact.phone}
                        onChange={handleInputChange}
                        className="epic-input"
                      />
                    ) : (
                      <div className="field-display">{formData.contact.phone}</div>
                    )}
                    <div className="field-glow"></div>
                  </div>
                </div>
                <div className="epic-field">
                  <label>Email Address</label>
                  <div className="field-container">
                    {isEditing ? (
                      <input
                        type="email"
                        name="contact.email"
                        value={formData.contact.email}
                        onChange={handleInputChange}
                        className="epic-input"
                      />
                    ) : (
                      <div className="field-display">{formData.contact.email}</div>
                    )}
                    <div className="field-glow"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="content-section address-section">
            <div className="section-header">
              <div className="section-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h2>Company Address</h2>
              <div className="section-line"></div>
            </div>
            <div className="section-content">
              <div className="field-row full-width">
                <div className="epic-field">
                  <label>Street Address</label>
                  <div className="field-container">
                    {isEditing ? (
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        className="epic-input"
                      />
                    ) : (
                      <div className="field-display">{formData.address.street}</div>
                    )}
                    <div className="field-glow"></div>
                  </div>
                </div>
              </div>
              <div className="field-row">
                <div className="epic-field">
                  <label>City</label>
                  <div className="field-container">
                    {isEditing ? (
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        className="epic-input"
                      />
                    ) : (
                      <div className="field-display">{formData.address.city}</div>
                    )}
                    <div className="field-glow"></div>
                  </div>
                </div>
                <div className="epic-field small">
                  <label>State</label>
                  <div className="field-container">
                    {isEditing ? (
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        className="epic-input"
                      />
                    ) : (
                      <div className="field-display">{formData.address.state}</div>
                    )}
                    <div className="field-glow"></div>
                  </div>
                </div>
                <div className="epic-field small">
                  <label>ZIP Code</label>
                  <div className="field-container">
                    {isEditing ? (
                      <input
                        type="text"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleInputChange}
                        className="epic-input"
                      />
                    ) : (
                      <div className="field-display">{formData.address.zipCode}</div>
                    )}
                    <div className="field-glow"></div>
                  </div>
                </div>
              </div>
              <div className="field-row">
                <div className="epic-field">
                  <label>Country</label>
                  <div className="field-container">
                    {isEditing ? (
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleInputChange}
                        className="epic-input"
                      />
                    ) : (
                      <div className="field-display">{formData.address.country}</div>
                    )}
                    <div className="field-glow"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services & Status Section */}
          <div className="content-section services-section">
            <div className="section-header">
              <div className="section-icon">
                <i className="fas fa-stethoscope"></i>
              </div>
              <h2>Services & Status</h2>
              <div className="section-line"></div>
            </div>
            <div className="section-content">
              <div className="specialties-container">
                <label>Healthcare Specialties</label>
                <div className="specialties-grid">
                  {specialtyOptions.map(specialty => (
                    <div
                      key={specialty}
                      className={`specialty-chip ${formData.specialties.includes(specialty) ? 'active' : ''} ${!isEditing ? 'readonly' : ''}`}
                      onClick={() => isEditing && handleSpecialtyToggle(specialty)}
                    >
                      <div className="chip-glow"></div>
                      <span>{specialty}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="status-container">
                <label>Payment Status</label>
                <div className="status-controls">
                  <div className={`current-status ${statusConfig.class}`}>
                    <div className="status-indicator">
                      <i className={statusConfig.icon}></i>
                    </div>
                    <div className="status-info">
                      <span className="status-text">{statusConfig.text}</span>
                      <small>Current Status</small>
                    </div>
                  </div>
                  {isEditing && (
                    <button 
                      className="status-cycle-btn"
                      onClick={handleStatusToggle}
                      type="button"
                    >
                      <div className="btn-ripple"></div>
                      <i className="fas fa-sync-alt"></i>
                      <span>Change Status</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileModal;