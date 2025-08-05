import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import NoteTemplateModal from './NotesAndSign/NoteTemplateModal';
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
        <button 
          className={`action-button status-toggle ${isActive ? 'deactivate' : 'activate'}`} 
          onClick={onToggleStatus}
          disabled={isUpdatingStatus}
          title={isActive ? 'Deactivate patient' : 'Activate patient'}
        >
          <i className={`fas ${isActive ? 'fa-user-slash' : 'fa-user-check'}`}></i>
          <span>{isUpdatingStatus ? 'Updating...' : (isActive ? 'Deactivate' : 'Activate')}</span>
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

// Personal Information Card Component - OPTIMIZED
const PersonalInfoCard = ({ patient, onUpdatePatient }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    birthday: '',
    gender: '',
    address: '',
  });
  const [primaryContactPhone, setPrimaryContactPhone] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  // Simple phone formatter for display during editing
  const formatPhoneForDisplay = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  useEffect(() => {
    if (patient) {
      setFormData({
        full_name: patient.full_name || '',
        birthday: patient.birthday || '',
        gender: patient.gender || '',
        address: patient.address || '',
      });
      
      // Use the formatted phone from backend, extract raw number for editing
      const rawPhone = patient.primary_phone ? patient.primary_phone.replace(/\D/g, '') : '';
      setPrimaryContactPhone(rawPhone);
    }
  }, [patient]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneInputChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '');
    // Limitar a 10 dígitos
    if (cleaned.length <= 10) {
      setPrimaryContactPhone(cleaned);
    }
  };

  const handleSave = async () => {
    if (!patient?.id) {
      setError('Patient ID not available');
      return;
    }
    try {
      setIsSaving(true);
      setError(null);

      // Create contact_info structure
      let contactDict = {};
      
      // Preserve existing contact_info
      if (patient.contact_info && typeof patient.contact_info === 'object') {
        contactDict = { ...patient.contact_info };
      }
      
      // Update primary phone (let backend handle formatting)
      if (primaryContactPhone) {
        contactDict['primary#'] = primaryContactPhone;
      }

      // Create URL params only for changed fields
      const params = new URLSearchParams();
      
      if (formData.full_name !== patient.full_name) {
        params.append('full_name', formData.full_name);
      }
      if (formData.birthday !== patient.birthday) {
        params.append('birthday', formData.birthday);
      }
      if (formData.gender !== patient.gender) {
        params.append('gender', formData.gender);
      }
      if (formData.address !== patient.address) {
        params.append('address', formData.address);
      }
      
      // Update contact_info if phone changed
      const currentRawPhone = patient.primary_phone ? patient.primary_phone.replace(/\D/g, '') : '';
      if (primaryContactPhone !== currentRawPhone) {
        params.append('contact_info', JSON.stringify(contactDict));
      }

      const response = await fetch(`${API_BASE_URL}/patients/${patient.id}?${params.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Update failed');
      
      // Use onUpdatePatient to trigger refresh from parent, no double fetching
      onUpdatePatient(null); // Signal parent to refetch
      setIsEditing(false);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    // Reset state from patient prop
    if (patient) {
        setFormData({
            full_name: patient.full_name || '',
            birthday: patient.birthday || '',
            gender: patient.gender || '',
            address: patient.address || '',
        });
        const rawPhone = patient.primary_phone ? patient.primary_phone.replace(/\D/g, '') : '';
        setPrimaryContactPhone(rawPhone);
    }
  };

  if (!patient) return <div>Loading...</div>;

  return (
    <div className="info-card personal-info">
      <div className="card-header">
        <h3><i className="fas fa-user-circle"></i> Personal Information</h3>
        <button className="edit-button" onClick={() => setIsEditing(!isEditing)} disabled={isSaving}>
          <i className={`fas ${isEditing ? 'fa-times' : 'fa-pen'}`}></i>
        </button>
      </div>
      <div className="card-body">
        {error && <div className="error-message">{error}</div>}
        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} disabled={isSaving} />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="birthday" value={formData.birthday} onChange={handleInputChange} disabled={isSaving} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange} disabled={isSaving}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} disabled={isSaving} />
            </div>
            <div className="form-group">
              <label>Primary Contact Phone</label>
              <input type="tel" value={formatPhoneForDisplay(primaryContactPhone)} onChange={handlePhoneInputChange} disabled={isSaving} placeholder="(XXX) XXX-XXXX" />
            </div>
            <div className="form-actions">
              <button className="cancel-btn" onClick={handleCancel} disabled={isSaving}>Cancel</button>
              <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="patient-info-display">
            <div className="info-row">
              <div className="info-label">Full Name</div>
              <div className="info-value">{patient.full_name || 'Not available'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Date of Birth</div>
              <div className="info-value">{patient.birthday || 'Not available'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Gender</div>
              <div className="info-value">{patient.gender || 'Not available'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Address</div>
              <div className="info-value">{patient.address || 'Not available'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Primary Contact</div>
              <div className="info-value">{patient.primary_phone || 'Not available'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// General Information Section Component
const GeneralInformationSection = ({ patient, setCertPeriodDates, onUpdatePatient, setCurrentCertPeriod }) => {
  // Handler for certification period updates
  const handleUpdateCertPeriod = (updatedCertData) => {
    if (updatedCertData.startDate && updatedCertData.endDate) {
      setCertPeriodDates({ 
        startDate: updatedCertData.startDate, 
        endDate: updatedCertData.endDate 
      });
      
      // Update currentCertPeriod when certification period is updated
      const activeCertPeriod = patient?.certification_periods?.find(cp => 
        cp.start_date === updatedCertData.startDate && 
        cp.end_date === updatedCertData.endDate && 
        cp.is_active
      );
      
      if (activeCertPeriod) {
        setCurrentCertPeriod({
          id: activeCertPeriod.id,
          startDate: updatedCertData.startDate,
          endDate: updatedCertData.endDate
        });
      }
    }
  };

  // Handler for emergency contacts updates
  const handleUpdateContacts = (updatedContacts) => {
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
const MedicalInformationSection = ({ 
  patient, 
  onUpdatePatient, 
  scheduledVisits, 
  disciplines, 
  onSyncVisitsData 
}) => {
  const handleUpdateMedicalInfo = (updatedMedicalData) => {
    if (onUpdatePatient) {
      onUpdatePatient({ ...patient, ...updatedMedicalData });
    }
  };

  return (
    <div className="medical-info-section">
      <MedicalInfoComponent 
        patient={patient} 
        onUpdateMedicalInfo={handleUpdateMedicalInfo}
        scheduledVisits={scheduledVisits}
        disciplines={disciplines}
        onSyncVisitsData={onSyncVisitsData}
      />
    </div>
  );
};

// Disciplines Section Component
const DisciplinesSection = ({ 
  patient, 
  onUpdatePatient, 
  scheduledVisits, 
  approvedVisits, 
  onSyncDisciplinesData 
}) => {
  const handleUpdateDisciplines = (updatedDisciplines) => {
    if (onUpdatePatient) {
      onUpdatePatient({ ...patient, required_disciplines: updatedDisciplines });
    }
  };

  return (
    <div className="disciplines-section">
      <DisciplinesComponent 
        patient={patient} 
        onUpdateDisciplines={handleUpdateDisciplines}
        scheduledVisits={scheduledVisits}
        approvedVisits={approvedVisits}
        onSyncDisciplinesData={onSyncDisciplinesData}
      />
    </div>
  );
};

// Schedule Section Component
const ScheduleSection = ({ 
  patient, 
  certPeriodDates, 
  currentCertPeriod, 
  approvedVisits, 
  disciplines, 
  onSyncScheduleData 
}) => {
  const handleUpdateSchedule = (updatedSchedule) => {
  };
  
  return (
    <div className="schedule-section">
      <ScheduleComponent 
        patient={patient} 
        onUpdateSchedule={handleUpdateSchedule} 
        certPeriodDates={certPeriodDates}
        currentCertPeriod={currentCertPeriod}
        approvedVisits={approvedVisits}
        disciplines={disciplines}
        onSyncScheduleData={onSyncScheduleData}
      />
    </div>
  );
};

// Exercises Section Component
const ExercisesSection = ({ patient }) => {
  const handleUpdateExercises = (updatedExercises) => {
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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('general');
  const [patient, setPatient] = useState(null);
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
  const [currentCertPeriod, setCurrentCertPeriod] = useState(null);

  // Removed printable mode logic - now handled by dedicated PrintableVisitNote component

  // ===== ESTADO COMPARTIDO PARA SINCRONIZACIÓN =====
  const [scheduledVisits, setScheduledVisits] = useState([]);
  const [approvedVisits, setApprovedVisits] = useState(null);
  const [disciplines, setDisciplines] = useState(null);

  // Removed printable note loading logic - now handled by dedicated PrintableVisitNote component

  useEffect(() => {
    if (patient?.certification_periods?.length > 0) {
      const activeCertPeriod = patient.certification_periods.find(cp => 
        new Date(cp.end_date) >= new Date() && cp.is_active
      );
      if (activeCertPeriod) {
        setCurrentCertPeriod({
          id: activeCertPeriod.id,
          startDate: activeCertPeriod.start_date,
          endDate: activeCertPeriod.end_date
        });
        setCertPeriodDates({
          startDate: activeCertPeriod.start_date,
          endDate: activeCertPeriod.end_date
        });
      }
    }
  }, [patient]);

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
  const handleStatusChange = async (patientId, action) => {
    if (isLoggingOut) return;
    
    try {
      setIsUpdatingStatus(true);
      setError(null);
      const isActive = action === 'activate';
      
      // Primero actualizar el estado
      const params = new URLSearchParams();
      params.append('is_active', isActive.toString());
      
      const updateResponse = await fetch(`${API_BASE_URL}/patients/${patientId}?${params.toString()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to ${action} patient`);
      }

      // Luego obtener los datos completos del paciente
      const getResponse = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!getResponse.ok) {
        throw new Error('Failed to fetch updated patient data');
      }

      const completePatientData = await getResponse.json();
      setPatient(completePatientData);
      
    } catch (error) {
      console.error(`Error ${action}ing patient:`, error);
      setError(`Failed to ${action} patient: ${error.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdatePatient = async (updatedPatient) => {
    // If null is passed, refetch from backend (used by PersonalInfoCard after save)
    if (updatedPatient === null) {
      try {
        const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch updated patient data');
        const latestPatientData = await response.json();
        setPatient(latestPatientData);
      } catch (err) {
        console.error('Error refreshing patient data:', err);
      }
      return;
    }

    // For valid updated patient objects, update immediately
    if (updatedPatient && updatedPatient.id) {
      setPatient(updatedPatient);
    }
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

  // ===== FUNCIONES DE SINCRONIZACIÓN BIDIRECCIONAL =====
  
  // Sincronización desde MedicalInfoComponent
  const handleSyncVisitsData = (syncData) => {
    if (syncData.type === 'approved_visits_changed' && syncData.allVisits) {
      setApprovedVisits(syncData.allVisits);
    }
  };

  // Sincronización desde DisciplinesComponent  
  const handleSyncDisciplinesData = (syncData) => {
    if (syncData.type === 'frequency_manually_changed' && syncData.disciplines) {
      setDisciplines(syncData.disciplines);
    }
  };

  // Sincronización desde ScheduleComponent
  const handleSyncScheduleData = (syncData) => {
    if (syncData.type === 'visits_updated' && syncData.visits) {
      setScheduledVisits(syncData.visits);
    }
  };

  // Removed printable mode rendering logic - now handled by dedicated PrintableVisitNote component

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
            onToggleStatus={() => handleStatusChange(patient.id, patient.is_active ? 'deactivate' : 'activate')}
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
                setCurrentCertPeriod={setCurrentCertPeriod}
              />
            )}
            {activeTab === 'medical' && (
              <MedicalInformationSection 
                patient={patient} 
                onUpdatePatient={handleUpdatePatient}
                scheduledVisits={scheduledVisits}
                disciplines={disciplines}
                onSyncVisitsData={handleSyncVisitsData}
              />
            )}
            {activeTab === 'disciplines' && (
              <DisciplinesSection 
                patient={patient} 
                onUpdatePatient={handleUpdatePatient}
                scheduledVisits={scheduledVisits}
                approvedVisits={approvedVisits}
                onSyncDisciplinesData={handleSyncDisciplinesData}
              />
            )}
            {activeTab === 'schedule' && (
              <ScheduleSection 
                patient={patient} 
                certPeriodDates={certPeriodDates}
                currentCertPeriod={currentCertPeriod}
                approvedVisits={approvedVisits}
                disciplines={disciplines}
                onSyncScheduleData={handleSyncScheduleData}
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