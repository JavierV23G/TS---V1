import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../login/AuthContext';
import logoImg from '../../../../../assets/LogoMHC.jpeg';
import EmergencyContactsComponent from './EmergencyContactsComponent';
import CertificationPeriodComponent from './CertificationPeriodComponent';
import MedicalInfoComponent from './MedicalInfoComponent';
import DisciplinesComponent from './DisciplinesComponent';
import ScheduleComponent from './ScheduleComponent';
import ExercisesComponent from './ExercisesComponent';
import DocumentsComponent from './DocumentsComponent';
import NotesComponent from './NotesComponent';
import LogoutAnimation from '../../../../../components/LogOut/LogOut';
import '../../../../../styles/developer/Patients/InfoPaciente/PatientInfoPage.scss';

// Patient Info Header Component
const PatientInfoHeader = ({ patient, activeTab, setActiveTab, onToggleStatus, isUpdatingStatus }) => {
  const navigate = useNavigate();
  const rolePrefix = window.location.hash.split('/')[1];

  const handleBackToPatients = () => {
    navigate(`/${rolePrefix}/patients`);
  };

  const isActive = patient?.is_active;

  return (
    <div className="patient-info-header">
      <div className="header-left">
        <button className="back-button" onClick={handleBackToPatients}>
          <i className="fas fa-arrow-left"></i>
          <span>Back to Patients</span>
        </button>
        <h1 className="patient-name">
          {patient?.full_name || 'Patient Information'}
          <span className={`status-indicator ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </h1>
        <div className="patient-id">#{patient?.id || '0'}</div>
      </div>
      <div className="header-actions">
        {/* BOTÓN DE ACTIVAR/DESACTIVAR - TEMPORALMENTE DESHABILITADO */}
        <button 
          className={`action-button status-toggle ${isActive ? 'deactivate' : 'activate'}`} 
          onClick={() => {
            alert('Patient status update feature will be available when the PATCH /patients/{id} endpoint is implemented.');
          }}
          title="Feature coming soon - requires API endpoint"
        >
          <i className={`fas ${isActive ? 'fa-user-slash' : 'fa-user-check'}`}></i>
          <span>{isActive ? 'Deactivate' : 'Activate'} (Coming Soon)</span>
        </button>
        
        {/* BOTÓN DE IMPRIMIR - REMOVIDO */}
        {/* 
        <button className="action-button print">
          <i className="fas fa-print"></i>
          <span>Print</span>
        </button>
        */}
      </div>
    </div>
  );
};

// Tabs Navigation Component
const TabsNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'general', label: 'General Info', icon: 'fas fa-user' },
    { id: 'medical', label: 'Medical Info', icon: 'fas fa-notes-medical' },
    { id: 'disciplines', label: 'Disciplines', icon: 'fas fa-user-md' },
    { id: 'schedule', label: 'Schedule', icon: 'fas fa-calendar-alt' },
    { id: 'exercises', label: 'Exercises', icon: 'fas fa-dumbbell' },
    { id: 'documents', label: 'Documents', icon: 'fas fa-file-alt' },
    { id: 'notes', label: 'Notes', icon: 'fas fa-sticky-note' }
  ];

  return (
    <div className="patient-tabs-navigation">
      {tabs.map(tab => (
        <div 
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <div className="tab-icon"><i className={tab.icon}></i></div>
          <span>{tab.label}</span>
          {activeTab === tab.id && <div className="active-indicator"></div>}
          <div className="tab-hover-effect"></div>
        </div>
      ))}
    </div>
  );
};

// Personal Information Card Component - EDIT FUNCTIONALITY FIXED
const PersonalInfoCard = ({ patient, onUpdatePatient }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    birthday: '',
    gender: '',
    address: '',
    contact_info: ''
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Update form data when patient prop changes
  useEffect(() => {
    if (patient) {
      setFormData({
        full_name: patient.full_name || '',
        birthday: patient.birthday || '',
        gender: patient.gender || '',
        address: patient.address || '',
        contact_info: patient.contact_info || ''
      });
    }
  }, [patient]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to ${value}`); // Depuración
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!patient?.id) {
      setError('Patient ID not available');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const updateData = {
        full_name: formData.full_name || '',
        birthday: formData.birthday || '',
        gender: formData.gender || '',
        address: formData.address || '',
        contact_info: formData.contact_info || ''
      };
      console.log('Final update data before send:', updateData); // Depuración

      const response = await fetch(`${API_BASE_URL}/patients/${patient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Received response data:', responseData);

      if (!responseData || !responseData.patient_id) {
        throw new Error('Invalid response format from server');
      }

      const updatedPatient = {
        id: responseData.patient_id,
        full_name: responseData.full_name || '',
        birthday: responseData.birthday || '',
        gender: responseData.gender || '',
        address: responseData.address || '',
        contact_info: responseData.contact_info || '',
        insurance: responseData.insurance || '',
        physician: responseData.physician || '',
        agency_id: responseData.agency_id || null,
        agency_name: responseData.agency_name || '',
        nursing_diagnosis: responseData.nursing_diagnosis || '',
        urgency_level: responseData.urgency_level || '',
        prior_level_of_function: responseData.prior_level_of_function || '',
        homebound_status: responseData.homebound_status || '',
        weight_bearing_status: responseData.weight_bearing_status || '',
        referral_reason: responseData.referral_reason || '',
        weight: responseData.weight || '',
        height: responseData.height || '',
        past_medical_history: responseData.past_medical_history || '',
        clinical_grouping: responseData.clinical_grouping || '',
        required_disciplines: responseData.required_disciplines || '',
        is_active: responseData.is_active || false
      };

      setFormData({
        full_name: updatedPatient.full_name,
        birthday: updatedPatient.birthday,
        gender: updatedPatient.gender,
        address: updatedPatient.address,
        contact_info: updatedPatient.contact_info
      });

      setIsEditing(false);
      if (onUpdatePatient && typeof onUpdatePatient === 'function') {
        onUpdatePatient(updatedPatient);
        console.log('Patient updated in parent:', updatedPatient);
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      setError(`Update failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original patient data
    if (patient) {
      setFormData({
        full_name: patient.full_name || '',
        birthday: patient.birthday || '',
        gender: patient.gender || '',
        address: patient.address || '',
        contact_info: patient.contact_info || ''
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const toggleEdit = () => {
    if (isEditing) {
      handleCancel();
    } else {
      setIsEditing(true);
      setError(null);
    }
  };

  // Show loading if no patient data
  if (!patient) {
    return (
      <div className="info-card personal-info">
        <div className="card-header">
          <h3><i className="fas fa-user-circle"></i> Personal Information</h3>
        </div>
        <div className="card-body">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Loading patient information...</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="info-card personal-info">
      <div className="card-header">
        <h3><i className="fas fa-user-circle"></i> Personal Information</h3>
        <button className="edit-button" onClick={toggleEdit} disabled={isSaving}>
          <i className={`fas ${isEditing ? 'fa-times' : 'fa-pen'}`}></i>
        </button>
      </div>
      <div className="card-body">
        {error && (
          <div className="error-message" style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            backgroundColor: '#fee', 
            border: '1px solid #fcc', 
            borderRadius: '4px', 
            color: '#c00' 
          }}>
            <i className="fas fa-exclamation-triangle"></i>
            <span style={{ marginLeft: '8px' }}>{error}</span>
          </div>
        )}
        
        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                disabled={isSaving}
                placeholder="Enter full name"
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input 
                type="date" 
                name="birthday"
                value={formData.birthday}
                onChange={handleInputChange}
                disabled={isSaving}
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={isSaving}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Full Address"
                disabled={isSaving}
              />
            </div>
            <div className="form-group">
              <label>Contact Info</label>
              <input 
                type="text" 
                name="contact_info"
                value={formData.contact_info}
                onChange={handleInputChange}
                placeholder="Phone number, email, etc."
                disabled={isSaving}
              />
            </div>
            <div className="form-actions">
              <button className="cancel-btn" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="patient-info-display">
            <div className="info-row">
              <div className="info-label">Full Name</div>
              <div className="info-value">{patient?.full_name || 'Not available'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Date of Birth</div>
              <div className="info-value">{patient?.birthday || 'Not available'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Gender</div>
              <div className="info-value">{patient?.gender || 'Not available'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Address</div>
              <div className="info-value">{patient?.address || 'Not available'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Contact Info</div>
              <div className="info-value">{patient?.contact_info || 'Not available'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// General Information Section Component
const GeneralInformationSection = ({ patient, setCertPeriodDates, onUpdatePatient }) => {
  // Handler for certification period updates
  const handleUpdateCertPeriod = (updatedCertData) => {
    console.log('Certification period updated:', updatedCertData);
    if (updatedCertData.startDate && updatedCertData.endDate) {
      setCertPeriodDates({ 
        startDate: updatedCertData.startDate, 
        endDate: updatedCertData.endDate 
      });
    }
  };

  // Handler for emergency contacts updates
  const handleUpdateContacts = (updatedContacts) => {
    console.log('Emergency contacts updated:', updatedContacts);
  };
  
  return (
    <div className="general-info-section">
      <PersonalInfoCard patient={patient} onUpdatePatient={onUpdatePatient} />
      <CertificationPeriodComponent 
        patient={patient} 
        onUpdateCertPeriod={handleUpdateCertPeriod}
      />
      <EmergencyContactsComponent 
        patient={patient} 
        onUpdateContacts={handleUpdateContacts}
      />
    </div>
  );
};

// Medical Information Section Component
const MedicalInformationSection = ({ patient, onUpdatePatient }) => {
  const handleUpdateMedicalInfo = (updatedMedicalData) => {
    console.log('Medical information updated:', updatedMedicalData);
    if (onUpdatePatient) {
      onUpdatePatient({ ...patient, ...updatedMedicalData });
    }
  };

  return (
    <div className="medical-info-section">
      <MedicalInfoComponent patient={patient} onUpdateMedicalInfo={handleUpdateMedicalInfo} />
    </div>
  );
};

// Disciplines Section Component
const DisciplinesSection = ({ patient, onUpdatePatient }) => {
  const handleUpdateDisciplines = (updatedDisciplines) => {
    console.log('Disciplines updated:', updatedDisciplines);
    if (onUpdatePatient) {
      onUpdatePatient({ ...patient, required_disciplines: updatedDisciplines });
    }
  };

  return (
    <div className="disciplines-section">
      <DisciplinesComponent patient={patient} onUpdateDisciplines={handleUpdateDisciplines} />
    </div>
  );
};

// Schedule Section Component
const ScheduleSection = ({ patient, certPeriodDates }) => {
  const handleUpdateSchedule = (updatedSchedule) => {
    console.log('Schedule updated:', updatedSchedule);
  };
  
  return (
    <div className="schedule-section">
      <ScheduleComponent 
        patient={patient} 
        onUpdateSchedule={handleUpdateSchedule} 
        certPeriodDates={certPeriodDates}
      />
    </div>
  );
};

// Exercises Section Component
const ExercisesSection = ({ patient }) => {
  const handleUpdateExercises = (updatedExercises) => {
    console.log('Exercises updated:', updatedExercises);
  };
  
  return (
    <div className="exercises-section">
      <ExercisesComponent patient={patient} onUpdateExercises={handleUpdateExercises} />
    </div>
  );
};

// Documents Section Component
const DocumentsSection = ({ patient }) => {
  const handleUpdateDocuments = (updatedDocuments) => {
    console.log('Documents updated:', updatedDocuments);
  };
  
  return (
    <div className="documents-section">
      <DocumentsComponent patient={patient} onUpdateDocuments={handleUpdateDocuments} />
    </div>
  );
};

// Notes Section Component
const NotesSection = ({ patient }) => {
  const handleUpdateNotes = (updatedNotes) => {
    console.log('Notes updated:', updatedNotes);
  };
  
  return (
    <div className="notes-section">
      <NotesComponent patient={patient} onUpdateNotes={handleUpdateNotes} />
    </div>
  );
};

// Main Patient Information Page Component
const PatientInfoPage = () => {
  const { patientId } = useParams();
  const [activeTab, setActiveTab] = useState('general');
  const [patient, setPatient] = useState(null);
  const [allPatients, setAllPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const rolePrefix = window.location.hash.split('/')[1];
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);
  const [isMobile, setIsMobile] = useState(false);
  const userMenuRef = useRef(null);
  const [certPeriodDates, setCertPeriodDates] = useState({ startDate: '', endDate: '' });

  // API Configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Detect device size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Function to get initials from name
  function getInitials(name) {
    if (!name) return "U";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  // User data from auth context
  const userData = currentUser ? {
    name: currentUser.fullname || currentUser.username,
    avatar: getInitials(currentUser.fullname || currentUser.username),
    email: currentUser.email,
    role: currentUser.role,
    status: 'online'
  } : {
    name: '',
    avatar: '',
    email: '',
    role: '',
    status: 'online'
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggingOut(true);
    setShowUserMenu(false);
    document.body.classList.add('logging-out');
  };
  
  const handleLogoutAnimationComplete = () => {
    logout();
    navigate('/');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle patient status toggle - DESHABILITADO TEMPORALMENTE
  const handleToggleStatus = async () => {
    // Esta función estará disponible cuando se implemente el endpoint PATCH /patients/{id}
    console.log('Toggle status feature disabled - waiting for API endpoint implementation');
    return;
    
    /* 
    // CÓDIGO PARA CUANDO TENGAS EL ENDPOINT LISTO:
    
    if (!patient || isUpdatingStatus) return;
    
    try {
      setIsUpdatingStatus(true);
      setError(null);
      
      const newStatus = !patient.is_active;
      
      console.log(`Updating patient ${patient.id} status from ${patient.is_active} to ${newStatus}`);
      
      const response = await fetch(`${API_BASE_URL}/patients/${patient.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: newStatus
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update patient status: ${response.status} ${response.statusText}`);
      }
      
      const updatedPatient = await response.json();
      console.log('Patient status updated successfully:', updatedPatient);
      
      setPatient(updatedPatient);
      
      setAllPatients(prevPatients => 
        prevPatients.map(p => 
          p.id === patient.id ? updatedPatient : p
        )
      );
      
    } catch (error) {
      console.error('Error updating patient status:', error);
      setError(`Failed to ${patient.is_active ? 'deactivate' : 'activate'} patient: ${error.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
    */
  };

  const handleUpdatePatient = (updatedPatient) => {
    console.log('handleUpdatePatient called with:', updatedPatient);
    
    if (!updatedPatient || !updatedPatient.id) {
      console.error('Invalid updated patient data received');
      return;
    }

    setPatient(prevPatient => {
      const newPatient = {
        ...prevPatient,
        ...updatedPatient,
        id: prevPatient.id // Ensure ID is preserved
      };
      console.log('Patient state updated:', newPatient);
      return newPatient;
    });

    setAllPatients(prevPatients => 
      prevPatients.map(p => 
        p.id === updatedPatient.id ? { ...p, ...updatedPatient } : p
      )
    );
  };

  // Fetch specific patient by ID using the correct endpoint
  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) {
        setError('Patient ID not provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching patient from:', `${API_BASE_URL}/patients/${patientId}`);
        
        const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
          method: 'GET',  
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Patient not found');
          }
          throw new Error(`Failed to fetch patient: ${response.status} ${response.statusText}`);
        }
        
        const patientData = await response.json();
        console.log('Received patient data:', patientData);
        
        setPatient(patientData);
        
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatient();
  }, [patientId, API_BASE_URL]);

  // Render loading state
  if (loading) {
    return (
      <div className="patient-info-loading">
        <div className="loading-spinner">
          <div className="spinner-animation">
            <i className="fas fa-circle-notch fa-spin"></i>
          </div>
          <div className="loading-text">
            <span>Loading patient information</span>
            <div className="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="patient-not-found">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h2>Error Loading Patient</h2>
        <p>{error}</p>
        <button 
          className="back-button"
          onClick={() => navigate(`/${rolePrefix}/patients`)}
        >
          <i className="fas fa-arrow-left"></i> Back to Patients List
        </button>
      </div>
    );
  }

  // Render patient not found
  if (!patient) {
    return (
      <div className="patient-not-found">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h2>Patient Not Found</h2>
        <p>The patient you are looking for does not exist or you don't have permission to view it.</p>
        <button 
          className="back-button"
          onClick={() => navigate(`/${rolePrefix}/patients`)}
        >
          <i className="fas fa-arrow-left"></i> Back to Patients List
        </button>
      </div>
    );
  }

  return (
    <div className={`patient-info-page ${isLoggingOut ? 'logging-out' : ''}`}>
      {/* Logout Animation Component */}
      {isLoggingOut && (
        <LogoutAnimation 
          isMobile={isMobile} 
          onAnimationComplete={handleLogoutAnimationComplete} 
        />
      )}
      
      {/* Page header */}
      <header className="main-header">
        <div className="header-container">
          {/* Logo and navigation */}
          <div className="logo-container">
            <div className="logo-wrapper">
              <img src={logoImg} alt="TherapySync Logo" className="logo" />
              <div className="logo-glow"></div>
            </div>
            
            {/* Menu navigation */}
            <div className="menu-navigation">
              <button 
                className="nav-button main-menu" 
                onClick={() => navigate(`/${rolePrefix}/homePage`)}
                title="Back to main menu"
              >
                <i className="fas fa-th-large"></i>
                <span>Main Menu</span>
                <div className="button-effect"></div>
              </button>
              
              <button 
                className="nav-button patients-menu" 
                onClick={() => navigate(`/${rolePrefix}/patients`)}
                title="Patients Menu"
              >
                <i className="fas fa-user-injured"></i>
                <span>Patients</span>
                <div className="button-effect"></div>
              </button>
            </div>
          </div>
          
          {/* User profile with dropdown menu */}
          <div className="support-user-profile" ref={userMenuRef}>
            <div 
              className={`support-profile-button ${showUserMenu ? 'active' : ''}`} 
              onClick={() => !isLoggingOut && setShowUserMenu(!showUserMenu)}
              data-tooltip="Your profile and settings"
            >
              <div className="support-avatar">
                <div className="support-avatar-text">{userData.avatar}</div>
                <div className={`support-avatar-status ${userData.status}`}></div>
              </div>
              
              <div className="support-profile-info">
                <span className="support-user-name">{userData.name}</span>
                <span className="support-user-role">{userData.role}</span>
              </div>
              
              <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'}`}></i>
            </div>
            
            {/* Enhanced dropdown menu */}
            {showUserMenu && !isLoggingOut && (
              <div className="support-user-menu">
                <div className="support-menu-header">
                  <div className="support-user-info">
                    <div className="support-user-avatar">
                      <span>{userData.avatar}</span>
                      <div className={`avatar-status ${userData.status}`}></div>
                    </div>
                    <div className="support-user-details">
                      <h4>{userData.name}</h4>
                      <span className="support-user-email">{userData.email}</span>
                      <span className={`support-user-status ${userData.status}`}>
                        <i className="fas fa-circle"></i> 
                        {userData.status.charAt(0).toUpperCase() + userData.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="support-menu-section">
                  <div className="section-title">Account</div>
                  <div className="support-menu-items">
                    <div 
                      className="support-menu-item"
                      onClick={() => navigate(`/${rolePrefix}/profile`)}
                    >
                      <i className="fas fa-user-circle"></i>
                      <span>My Profile</span>
                    </div>
                    <div className="support-menu-item">
                      <i className="fas fa-cog"></i>
                      <span>Settings</span>
                    </div>
                    <div className="support-menu-item">
                      <i className="fas fa-calendar-alt"></i>
                      <span>My Schedule</span>
                    </div>
                  </div>
                </div>
                
                <div className="support-menu-section">
                  <div className="section-title">Preferences</div>
                  <div className="support-menu-items">
                    <div className="support-menu-item">
                      <i className="fas fa-bell"></i>
                      <span>Notifications</span>
                      <div className="support-notification-badge">{notificationCount}</div>
                    </div>
                    <div className="support-menu-item toggle-item">
                      <div className="toggle-item-content">
                        <i className="fas fa-volume-up"></i>
                        <span>Sound Alerts</span>
                      </div>
                      <div className="toggle-switch">
                        <div className="toggle-handle"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="support-menu-section">
                  <div className="section-title">Support</div>
                  <div className="support-menu-items">
                    <div className="support-menu-item">
                      <i className="fas fa-headset"></i>
                      <span>Contact Support</span>
                    </div>
                    <div className="support-menu-item">
                      <i className="fas fa-bug"></i>
                      <span>Report Issue</span>
                    </div>
                  </div>
                </div>
                
                <div className="support-menu-footer">
                  <div className="support-menu-item logout" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Log Out</span>
                  </div>
                  <div className="version-info">
                    <span>TherapySync™ Support</span>
                    <span>v2.7.0</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={`patient-info-content ${isLoggingOut ? 'fade-out' : ''}`}>
        <div className="patient-info-container">
          {/* Patient header with back button and actions */}
          <PatientInfoHeader 
            patient={patient} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            onToggleStatus={handleToggleStatus}
            isUpdatingStatus={isUpdatingStatus}
          />
          
          {/* Tabs navigation */}
          <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Tab content */}
          <div className="tab-content">
            {activeTab === 'general' && (
              <GeneralInformationSection 
                patient={patient} 
                setCertPeriodDates={setCertPeriodDates}
                onUpdatePatient={handleUpdatePatient}
              />
            )}
            {activeTab === 'medical' && (
              <MedicalInformationSection 
                patient={patient} 
                onUpdatePatient={handleUpdatePatient}
              />
            )}
            {activeTab === 'disciplines' && (
              <DisciplinesSection 
                patient={patient} 
                onUpdatePatient={handleUpdatePatient}
              />
            )}
            {activeTab === 'schedule' && (
              <ScheduleSection 
                patient={patient} 
                certPeriodDates={certPeriodDates} 
              />
            )}
            {activeTab === 'exercises' && (
              <ExercisesSection patient={patient} />
            )}
            {activeTab === 'documents' && (
              <DocumentsSection patient={patient} />
            )}
            {activeTab === 'notes' && (
              <NotesSection patient={patient} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientInfoPage;       