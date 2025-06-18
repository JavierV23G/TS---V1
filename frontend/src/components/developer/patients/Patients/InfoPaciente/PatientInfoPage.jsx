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
const PatientInfoHeader = ({ patient, activeTab, setActiveTab, onToggleStatus }) => {
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
        <button 
          className={`action-button status-toggle ${isActive ? 'deactivate' : 'activate'}`} 
          onClick={onToggleStatus}
        >
          <i className={`fas ${isActive ? 'fa-user-slash' : 'fa-user-check'}`}></i>
          <span>{isActive ? 'Deactivate' : 'Activate'}</span>
        </button>
        <button className="action-button print">
          <i className="fas fa-print"></i>
          <span>Print</span>
        </button>
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

// Personal Information Card Component
const PersonalInfoCard = ({ patient, onUpdatePatient }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    birthday: '',
    gender: '',
    address: '',
    contact_info: ''
  });

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Aquí harías la llamada a tu API para actualizar el paciente
      // Por ahora solo actualizamos el estado local
      onUpdatePatient({ ...patient, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating patient:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  return (
    <div className="info-card personal-info">
      <div className="card-header">
        <h3><i className="fas fa-user-circle"></i> Personal Information</h3>
        <button className="edit-button" onClick={toggleEdit} disabled={isSaving}>
          <i className={`fas ${isEditing ? 'fa-times' : 'fa-pen'}`}></i>
        </button>
      </div>
      <div className="card-body">
        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input 
                type="date" 
                name="birthday"
                value={formData.birthday}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
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
              />
            </div>
            <div className="form-group">
              <label>Contact Info</label>
              <input 
                type="text" 
                name="contact_info"
                value={formData.contact_info}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-actions">
              <button className="cancel-btn" onClick={toggleEdit} disabled={isSaving}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <>
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
          </>
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
  
  // Convert API patient data to format expected by existing components
  const convertedPatient = patient ? {
    ...patient,
    // Map API fields to component expected format
    name: patient.full_name,
    dob: patient.birthday,
    status: patient.is_active ? 'Active' : 'Inactive',
    // Add mock data for fields that might not be in API
    emergencyContact: 'Contact information not available',
    emergencyPhone: '',
    certPeriod: patient.initial_cert_start_date ? 
      `${patient.initial_cert_start_date} to ${patient.initial_cert_start_date}` : 
      'No certification period set'
  } : null;
  
  return (
    <div className="general-info-section">
      <PersonalInfoCard patient={patient} onUpdatePatient={onUpdatePatient} />
      <CertificationPeriodComponent 
        patient={convertedPatient} 
        onUpdateCertPeriod={handleUpdateCertPeriod}
      />
      <EmergencyContactsComponent patient={convertedPatient} />
    </div>
  );
};

// Medical Information Section Component
const MedicalInformationSection = ({ patient }) => {
  const handleUpdateMedicalInfo = (updatedMedicalData) => {
    console.log('Medical information updated:', updatedMedicalData);
  };

  // Convert API patient data to format expected by medical component
  const convertedPatient = patient ? {
    ...patient,
    medicalInfo: {
      weight: patient.weight || 0,
      height: patient.height || 0,
      nursingDiagnosis: patient.nursing_diagnosis || '',
      pmh: patient.past_medical_history || '',
      wbs: patient.weight_bearing_status || '',
      clinicalGrouping: patient.clinical_grouping || '',
      homebound: patient.homebound_status || ''
    }
  } : null;
  
  return (
    <div className="medical-info-section">
      <MedicalInfoComponent patient={convertedPatient} onUpdateMedicalInfo={handleUpdateMedicalInfo} />
    </div>
  );
};

// Disciplines Section Component
const DisciplinesSection = ({ patient }) => {
  const handleUpdateDisciplines = (updatedDisciplines) => {
    console.log('Disciplines updated:', updatedDisciplines);
  };

  // Convert API patient data and create mock disciplines data
  const convertedPatient = patient ? {
    ...patient,
    disciplines: {
      PT: {
        isActive: patient.required_disciplines?.includes('PT') || false,
        therapist: null,
        assistant: null,
        frequency: ''
      },
      OT: {
        isActive: patient.required_disciplines?.includes('OT') || false,
        therapist: null,
        assistant: null,
        frequency: ''
      },
      ST: {
        isActive: patient.required_disciplines?.includes('ST') || false,
        therapist: null,
        assistant: null,
        frequency: ''
      }
    }
  } : null;
  
  return (
    <div className="disciplines-section">
      <DisciplinesComponent patient={convertedPatient} onUpdateDisciplines={handleUpdateDisciplines} />
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

  // Handle patient status toggle
  const handleToggleStatus = async () => {
    if (!patient) return;
    
    try {
      // Aquí harías la llamada a tu API para actualizar el estado del paciente
      const updatedPatient = { ...patient, is_active: !patient.is_active };
      setPatient(updatedPatient);
      console.log(`Patient ${patient.id} status updated to ${updatedPatient.is_active ? 'Active' : 'Inactive'}`);
    } catch (error) {
      console.error('Error updating patient status:', error);
    }
  };

  // Handle patient update
  const handleUpdatePatient = (updatedPatient) => {
    setPatient(updatedPatient);
  };

  // Fetch all patients and find the specific one
  useEffect(() => {
    const fetchPatients = async () => {
      if (!patientId) {
        setError('Patient ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching patients from:', `${API_BASE_URL}/patients/`);
        
        const response = await fetch(`${API_BASE_URL}/patients/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch patients: ${response.status} ${response.statusText}`);
        }
        
        const patientsData = await response.json();
        console.log('Received patients data:', patientsData);
        
        setAllPatients(patientsData);
        
        // Find the specific patient by ID
        const foundPatient = patientsData.find(p => p.id.toString() === patientId.toString());
        
        if (!foundPatient) {
          setError('Patient not found');
          setLoading(false);
          return;
        }
        
        console.log('Found patient:', foundPatient);
        setPatient(foundPatient);
        
        // Set certification period dates if available
        if (foundPatient.initial_cert_start_date) {
          // Calculate end date (assuming 60 days certification period)
          const startDate = new Date(foundPatient.initial_cert_start_date);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 60);
          
          setCertPeriodDates({
            startDate: foundPatient.initial_cert_start_date,
            endDate: endDate.toISOString().split('T')[0]
          });
        }
        
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
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
              <MedicalInformationSection patient={patient} />
            )}
            {activeTab === 'disciplines' && (
              <DisciplinesSection patient={patient} />
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