import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../components/login/AuthContext';
import logoImg from '../../../assets/LogoMHC.jpeg';
import '../../../styles/developer/Patients/PatientsPage.scss';
import LogoutAnimation from '../../../components/LogOut/LogOut';

// Company Gateway Screen - Obligatory selection before access
const CompanyGatewayScreen = ({ companies, onCompanySelect }) => {
  const [hoveredCompany, setHoveredCompany] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState(companies);
  const [currentColorScheme, setCurrentColorScheme] = useState(0);
  
  // Array of nebula color schemes that rotate on each reload
  const nebulaSchemes = [
    { // Cosmic Blue
      primary: '#0f0f23',
      secondary: '#1a1a3a', 
      accent: '#2d4de0',
      nebula: '#87ceeb'
    },
    { // Purple Galaxy
      primary: '#1a0d2e',
      secondary: '#16213e',
      accent: '#7209b7',
      nebula: '#c589e8'
    },
    { // Green Cosmic
      primary: '#0d1b0d',
      secondary: '#1e2a1e',
      accent: '#39ff14',
      nebula: '#90ee90'
    },
    { // Orange Nebula
      primary: '#2e1f0d',
      secondary: '#3e2a16',
      accent: '#ff6600',
      nebula: '#ffb366'
    },
    { // Pink Cosmos
      primary: '#2e0d1f',
      secondary: '#3e1629',
      accent: '#ff1493',
      nebula: '#ffb3d9'
    },
    { // Teal Galaxy
      primary: '#0d2e2e',
      secondary: '#163e3e',
      accent: '#20b2aa',
      nebula: '#7fffd4'
    }
  ];
  
  // Select random color scheme on mount
  useEffect(() => {
    const randomScheme = Math.floor(Math.random() * nebulaSchemes.length);
    setCurrentColorScheme(randomScheme);
  }, []);

  const handleCompanySelect = (company) => {
    setIsAnimating(true);
    setTimeout(() => {
      onCompanySelect(company);
    }, 800);
  };

  // Filter companies based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
  }, [searchTerm, companies]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div 
      className={`company-gateway-screen ${isAnimating ? 'animating-out' : ''}`}
      style={{
        '--nebula-primary': nebulaSchemes[currentColorScheme]?.primary,
        '--nebula-secondary': nebulaSchemes[currentColorScheme]?.secondary,
        '--nebula-accent': nebulaSchemes[currentColorScheme]?.accent,
        '--nebula-color': nebulaSchemes[currentColorScheme]?.nebula
      }}
    >
      
      
      <div className="gateway-content">
        <div className="gateway-header">
          <div className="brand-logo-nebula">
            <div className="nebula-logo-container">
              <div className="logo-constellation">
                <div className="star star-1"></div>
                <div className="star star-2"></div>
                <div className="star star-3"></div>
              </div>
              <div className="logo-icon-nebula">
                <div className="icon-glow"></div>
                <i className="fas fa-user-md"></i>
                <div className="icon-ring"></div>
              </div>
              <div className="logo-particles">
                <div className="particle p-1"></div>
                <div className="particle p-2"></div>
                <div className="particle p-3"></div>
                <div className="particle p-4"></div>
              </div>
            </div>
            <h1 className="nebula-title">
              <span className="title-char">T</span>
              <span className="title-char">h</span>
              <span className="title-char">e</span>
              <span className="title-char">r</span>
              <span className="title-char">a</span>
              <span className="title-char">p</span>
              <span className="title-char">y</span>
              <span className="title-separator">S</span>
              <span className="title-char">y</span>
              <span className="title-char">n</span>
              <span className="title-char">c</span>
            </h1>
            <div className="cosmic-underline"></div>
          </div>
          
          <div className="gateway-title-nebula">
            <h2 className="cosmic-header">
              <span className="cosmic-text">Select Your Healthcare Agency</span>
              <div className="text-aurora"></div>
            </h2>
            <p className="cosmic-description">
              Choose the home healthcare agency to access the patient management platform
              <div className="description-shimmer"></div>
            </p>
          </div>
          
          <div className="search-container">
            <div className="search-box">
              <div className="search-icon">
                <i className="fas fa-search"></i>
              </div>
              <input
                type="text"
                placeholder="Search ..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchTerm && (
                <button className="clear-search" onClick={clearSearch}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <div className="search-info">
              <span>Showing {filteredCompanies.length} of {companies.length} agencies</span>
            </div>
          </div>
        </div>

        <div className="companies-grid">
          {filteredCompanies.length > 0 ? filteredCompanies.map((company) => (
            <div 
              key={company.id}
              className={`company-card ${hoveredCompany === company.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCompany(company.id)}
              onMouseLeave={() => setHoveredCompany(null)}
              onClick={() => handleCompanySelect(company)}
            >
              <div className="company-card-background">
                <div className="card-gradient"></div>
                <div className="card-pattern"></div>
              </div>
              
              <div className="company-card-content">
                <div className="company-icon">
                  <div className="icon-background"></div>
                  <i className="fas fa-hospital-alt"></i>
                  <div className="icon-pulse"></div>
                </div>
                
                <div className="company-info">
                  <h3>{company.name}</h3>
                  <p className="company-type">{company.type}</p>
                  <div className="company-stats">
                    <div className="stat">
                      <i className="fas fa-users"></i>
                      <span>{company.patientCount} patients</span>
                    </div>
                    <div className="stat">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{company.location}</span>
                    </div>
                    <div className="stat">
                      <i className="fas fa-folder"></i>
                      <span>Agency #{company.id}</span>
                    </div>
                  </div>
                </div>
                
                <div className="company-action">
                  <div className="access-button">
                    <span>Access Platform</span>
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </div>
              </div>
              
              <div className="card-glow"></div>
            </div>
          )) : (
            <div className="no-results">
              <div className="no-results-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>No agencies found</h3>
              <p>Try adjusting your search terms or browse all available agencies</p>
              <button className="clear-search-btn" onClick={clearSearch}>
                <i className="fas fa-refresh"></i>
                Show All Agencies
              </button>
            </div>
          )}
        </div>
        
        <div className="gateway-footer-nebula">
          <div className="footer-constellation">
            <div className="constellation-line"></div>
            <div className="footer-star"></div>
            <div className="constellation-line"></div>
          </div>
          <p className="footer-main">Developer Dashboard • Patient Management System</p>
          <div className="database-info-nebula">
            <div className="info-glow"></div>
            <i className="fas fa-database"></i>
            <span>Future: Each agency will have its dedicated database folder</span>
            <div className="info-particles">
              <div className="info-particle"></div>
              <div className="info-particle"></div>
              <div className="info-particle"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Premium Tabs component
const PremiumTabs = ({ activeTab, onChangeTab }) => {
  return (
    <div className="premium-tabs">
      <div 
        className={`tab-button ${activeTab === 'Patients' ? 'active' : ''}`}
        onClick={() => onChangeTab('Patients')}
      >
        <div className="tab-icon">
          <i className="fas fa-user-injured"></i>
        </div>
        <span>Patients</span>
        {activeTab === 'Patients' && <div className="active-indicator"></div>}
        <div className="tab-hover-effect"></div>
      </div>
      <div 
        className={`tab-button ${activeTab === 'Staffing' ? 'active' : ''}`}
        onClick={() => onChangeTab('Staffing')}
      >
        <div className="tab-icon">
          <i className="fas fa-user-md"></i>
        </div>
        <span>Staffing</span>
        {activeTab === 'Staffing' && <div className="active-indicator"></div>}
        <div className="tab-hover-effect"></div>
      </div>
    </div>
  );
};

// Patient Card component
const PatientCard = ({ patient, onView, certPeriods = [], onStatusChange }) => {
  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': 
        return 'status-active';
      case 'inactive': 
        return 'status-inactive';
      default: 
        return 'status-active';
    }
  };

  const formatCertPeriod = (patientId) => {
    try {
      const patientCerts = certPeriods.filter(cert => 
        cert.patient_id === patientId && cert.is_active
      );
      
      if (patientCerts.length === 0) return 'No active cert period';
      
      const activeCert = patientCerts.sort((a, b) => 
        new Date(b.start_date) - new Date(a.start_date)
      )[0];
      
      const startDate = new Date(activeCert.start_date);
      const endDate = new Date(activeCert.end_date);
      
      const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit', 
          year: 'numeric'
        });
      };
      
      return `${formatDate(startDate)} to ${formatDate(endDate)}`;
    } catch (error) {
      console.error('Error formatting cert period:', error);
      return 'Invalid cert dates';
    }
  };
  
  return (
    <div className={`patient-card ${getStatusClass(patient.status)}`}>
      <div className="status-indicator">
        <span>{patient.status || 'Active'}</span>
      </div>
      <div className="patient-card-header">
        <div className="patient-info">
          <h3>{patient.full_name || 'N/A'}</h3>
          <span className={`status-badge ${(patient.status || 'active').toLowerCase()}`}>
            {patient.status || 'Active'}
          </span>
        </div>
        <div className="patient-id">#{patient.id}</div>
      </div>
      
      <div className="patient-card-body">
        <div className="info-row">
          <i className="fas fa-hospital-alt"></i>
          <span>{patient.agency_name || 'N/A'}</span>
        </div>
        <div className="info-row">
          <i className="fas fa-phone"></i>
          <span>{getPrimaryPhoneNumber(patient.contact_info)}</span>
        </div>
        <div className="info-row">
          <i className="fas fa-map-marker-alt"></i>
          <span>{patient.address || 'N/A'}</span>
        </div>
        <div className="info-row">
          <i className="fas fa-calendar-alt"></i>
          <span style={{fontSize: '0.85em'}}>{formatCertPeriod(patient.id)}</span>
        </div>
      </div>
      
      <div className="patient-card-footer">
        <button 
          className="card-btn view-profile" 
          title="View Profile" 
          onClick={() => onView(patient)}
        >
          <i className="fas fa-eye"></i> View Profile
          <span className="btn-highlight"></span>
        </button>
        {patient.status === 'Active' ? (
          <button 
            className="card-btn deactivate-btn" 
            title="Deactivate Patient" 
            onClick={() => onStatusChange(patient.id, 'deactivate')}
          >
            <i className="fas fa-user-times"></i> Deactivate
          </button>
        ) : (
          <button 
            className="card-btn activate-btn" 
            title="Activate Patient" 
            onClick={() => onStatusChange(patient.id, 'activate')}
          >
            <i className="fas fa-user-check"></i> Activate
          </button>
        )}
      </div>
    </div>
  );
};

// Stat Card component
const StatCard = ({ title, value, icon, color, isLoading }) => {
  return (
    <div className={`stat-card ${color} ${isLoading ? 'loading' : ''}`}>
      <div className="stat-icon">
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="stat-info">
        <div className="stat-header">
          <p className="stat-title">{title}</p>
          <h3 className="stat-value">
            {isLoading ? (
              <div className="stat-skeleton">
                <div className="skeleton-bar"></div>
              </div>
            ) : (
              <span className="stat-number">{value}</span>
            )}
          </h3>
        </div>
      </div>
      <div className="stat-bg-icon">
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
  );
};

// Loading skeleton component
const PatientCardSkeleton = () => (
  <div className="patient-card skeleton">
    <div className="skeleton-header">
      <div className="skeleton-bar skeleton-title"></div>
      <div className="skeleton-bar skeleton-status"></div>
    </div>
    <div className="skeleton-body">
      <div className="skeleton-bar"></div>
      <div className="skeleton-bar"></div>
      <div className="skeleton-bar"></div>
    </div>
    <div className="skeleton-footer">
      <div className="skeleton-btn"></div>
    </div>
  </div>
);

// Calculate statistics - CORREGIDO
const calculateStats = (patients) => {
  console.log('Calculating stats for patients:', patients);
  
  if (!patients || !Array.isArray(patients)) {
    return [
      { title: "Total Patients", value: 0, icon: "fa-users", color: "blue" },
      { title: "Active Patients", value: 0, icon: "fa-user-check", color: "green" },
      { title: "Inactive Patients", value: 0, icon: "fa-user-times", color: "red" },
    ];
  }

  const total = patients.length;
  
  // Conteo más explícito usando el campo 'status' que mapeamos desde 'is_active'
  const activePatients = patients.filter(p => {
    const isActive = p.status === "Active";
    console.log(`Patient ${p.id} status check: "${p.status}" === "Active" ? ${isActive}`);
    return isActive;
  });
  
  const inactivePatients = patients.filter(p => {
    const isInactive = p.status === "Inactive";
    console.log(`Patient ${p.id} status check: "${p.status}" === "Inactive" ? ${isInactive}`);
    return isInactive;
  });
  
  const active = activePatients.length;
  const inactive = inactivePatients.length;
  
  console.log('Stats calculation:', {
    total,
    active,
    inactive,
    activePatients: activePatients.map(p => ({ id: p.id, name: p.full_name, status: p.status })),
    inactivePatients: inactivePatients.map(p => ({ id: p.id, name: p.full_name, status: p.status }))
  });
  
  return [
    { title: "Total Patients", value: total, icon: "fa-users", color: "blue" },
    { title: "Active Patients", value: active, icon: "fa-user-check", color: "green" },
    { title: "Inactive Patients", value: inactive, icon: "fa-user-times", color: "red" },
  ];
};

// Función para formatear número telefónico
const formatPhoneNumber = (phoneStr) => {
  if (!phoneStr) return '';
  
  // Limpiar el string - solo números
  const cleaned = phoneStr.replace(/\D/g, '');
  
  // Validar que tiene al menos 10 dígitos
  if (cleaned.length < 10) return phoneStr; // Devolver original si no es válido
  
  // Formatear como (123) 456-7890
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phoneStr; // Devolver original si no coincide el patrón
};

// Función para obtener el número de teléfono principal del diccionario
const getPrimaryPhoneNumber = (contactInfo) => {
  if (!contactInfo) return 'No phone available';
  
  let phoneNumber = '';
  
  // Si es diccionario (nueva estructura)
  if (typeof contactInfo === 'object' && !Array.isArray(contactInfo)) {
    phoneNumber = contactInfo['primary#'] || contactInfo.primary || contactInfo.secondary;
    
    // Si no hay primary ni secondary, buscar en emergency contacts
    if (!phoneNumber) {
      const emergencyContacts = Object.entries(contactInfo).filter(([key]) => key.startsWith('emergency_'));
      if (emergencyContacts.length > 0) {
        const firstEmergency = emergencyContacts[0][1];
        if (typeof firstEmergency === 'string' && firstEmergency.includes('|')) {
          phoneNumber = firstEmergency.split('|')[1]; // Obtener el teléfono del formato codificado
        } else if (typeof firstEmergency === 'object') {
          phoneNumber = firstEmergency.phone;
        } else {
          phoneNumber = firstEmergency;
        }
      }
    }
  } else if (typeof contactInfo === 'string') {
    // Compatibilidad con estructura antigua
    try {
      const parsed = JSON.parse(contactInfo);
      if (Array.isArray(parsed) && parsed.length > 0) {
        phoneNumber = parsed[0].phone || parsed[0] || '';
      } else {
        phoneNumber = contactInfo;
      }
    } catch (e) {
      phoneNumber = contactInfo;
    }
  }
  
  // Formatear el número o devolver mensaje por defecto
  return phoneNumber ? formatPhoneNumber(phoneNumber) : 'No phone available';
};

const DevPatientsPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  // UI States
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeMenuOption, setActiveMenuOption] = useState('Patients');
  const [menuTransitioning, setMenuTransitioning] = useState(false);
  const [showMenuSwitch, setShowMenuSwitch] = useState(false);
  const [currentView, setCurrentView] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const notificationCount = 0;
  
  // API States
  const [patients, setPatients] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [certPeriods, setCertPeriods] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  
  // Stats state
  const [stats, setStats] = useState([
    { title: "Total Patients", value: 0, icon: "fa-users", color: "blue" },
    { title: "Active Patients", value: 0, icon: "fa-user-check", color: "green" },
    { title: "Inactive Patients", value: 0, icon: "fa-user-times", color: "red" },
  ]);
  
  // Company selector states
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [hostingCompanies, setHostingCompanies] = useState([]);
  const [hasSelectedCompany, setHasSelectedCompany] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  
  // Search and filter states - Inicializar con 'Active'
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [agencySearchTerm, setAgencySearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('Active'); // Cambio: Inicializar con 'Active'
  
  // Refs
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Constants
  const statusOptions = ['all', 'Active', 'Inactive'];
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  // Helper functions
  const getInitials = useCallback((name) => {
    if (!name) return "U";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, []);

  // Initialize static hosting companies
  const initializeHostingCompanies = useCallback(() => {
    setIsLoadingCompanies(true);
    
    // Simulate loading time for better UX
    setTimeout(() => {
      const companies = [
        {
          id: 1,
          name: "Motive Home Care",
          type: "Agencia de Salud Domiciliaria",
          patientCount: 245,
          location: "Miami, FL",
          status: "Activa",
          description: "Servicios premium de atención médica domiciliaria",
          color: "#667eea"
        },
        {
          id: 2,
          name: "Caring Hands Healthcare",
          type: "Agencia de Salud Domiciliaria", 
          patientCount: 189,
          location: "Tampa, FL",
          status: "Activa",
          description: "Soluciones integrales de atención domiciliaria",
          color: "#764ba2"
        },
        {
          id: 3,
          name: "Sunshine Health Services",
          type: "Agencia de Salud Domiciliaria",
          patientCount: 156,
          location: "Orlando, FL", 
          status: "Activa",
          description: "Servicios especializados de rehabilitación",
          color: "#f093fb"
        }
      ];
      
      setHostingCompanies(companies);
      setIsLoadingCompanies(false);
    }, 1200);
  }, []);

  // Company selection handler for gateway
  const handleCompanySelect = useCallback((company) => {
    if (isLoggingOut) return;
    
    setSelectedCompany(company);
    setHasSelectedCompany(true);
    
    // Reset filters when selecting company
    setPatientSearchTerm('');
    setAgencySearchTerm('');
    setSelectedAgency('all');
    setSelectedStatus('Active');
    setActivePage(1);
    
    // Note: fetchPatients will be called in useEffect when selectedCompany changes
  }, [isLoggingOut]);

  // Company change handler for already selected company (if needed later)
  const handleCompanyChange = useCallback((company) => {
    if (isLoggingOut) return;
    
    setSelectedCompany(company);
    
    // Reset filters when changing company
    setPatientSearchTerm('');
    setAgencySearchTerm('');
    setSelectedAgency('all');
    setSelectedStatus('Active');
    setActivePage(1);
  }, [isLoggingOut]);
  
  // User data
  const userData = {
    name: currentUser?.fullname || currentUser?.username || 'Usuario',
    avatar: getInitials(currentUser?.fullname || currentUser?.username || 'Usuario'),
    
    role: currentUser?.role || 'Usuario',
    status: 'online'
  };
  
  // API Functions
  const fetchAgenciesData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch staff: ${response.status}`);
      }
      
      const data = await response.json();
      
      const agenciesOnly = data.filter(person => {
        const role = person.role?.toLowerCase();
        return role === 'agency';
      });
      
      setAgencies(agenciesOnly);
      return agenciesOnly;
      
    } catch (err) {
      console.error('Error fetching agencies:', err);
      return [];
    }
  }, [API_BASE_URL]);
  
  const fetchAllCertPeriods = useCallback(async () => {
    try {
      const patientsResponse = await fetch(`${API_BASE_URL}/patients/`);
      if (!patientsResponse.ok) return [];
      
      const patientsData = await patientsResponse.json();
      const patientIds = patientsData.map(p => p.id);
      
      const certPromises = patientIds.map(async (patientId) => {
        try {
          const response = await fetch(`${API_BASE_URL}/patient/${patientId}/cert-periods`);
          if (response.ok) {
            return await response.json();
          }
          return [];
        } catch {
          return [];
        }
      });
      
      const allCertResults = await Promise.all(certPromises);
      return allCertResults.flat();
      
    } catch (err) {
      console.error('Error fetching cert periods:', err);
      return [];
    }
  }, [API_BASE_URL]);
  
  // FUNCIÓN FETCHPATIENTS CORREGIDA
  const fetchPatients = useCallback(async () => {
    try {
      setIsLoadingPatients(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/patients/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch patients: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('Raw data from API:', data); // Debug: Ver datos crudos
      
      const [agenciesData, certPeriodsData] = await Promise.all([
        fetchAgenciesData(),
        fetchAllCertPeriods()
      ]);
      
      const normalizedPatients = data.map(patient => ({
        ...patient,
        status: patient.is_active ? 'Active' : 'Inactive',
        agency_name: patient.agency_name || 'Unknown Agency'
      }));
      
      console.log('Normalized patients:', normalizedPatients);
      console.log('Active patients:', normalizedPatients.filter(p => p.status === 'Active'));
      console.log('Inactive patients:', normalizedPatients.filter(p => p.status === 'Inactive'));
      
      setPatients(normalizedPatients);
      setCertPeriods(certPeriodsData);
      setLastFetchTime(new Date());
      
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.message);
    } finally {
      setIsLoadingPatients(false);
    }
  }, [API_BASE_URL, fetchAgenciesData, fetchAllCertPeriods]);
  
  // Filter functions
  const uniqueAgencies = [...new Set(patients.map(patient => patient.agency_name).filter(Boolean))];
  
  const filteredAgencies = uniqueAgencies.filter(agency => 
    agency.toLowerCase().includes(agencySearchTerm.toLowerCase())
  );
  
  // FUNCIÓN GETFILTEREDPATIENTS CORREGIDA
  const getFilteredPatients = useCallback(() => {
    if (!Array.isArray(patients)) return [];
    
    console.log('Filtering patients:', {
      totalPatients: patients.length,
      selectedStatus,
      patientSearchTerm,
      selectedAgency
    });
    
    const filtered = patients.filter(patient => {
      const searchFields = [
        patient.full_name,
        getPrimaryPhoneNumber(patient.contact_info),
        patient.address,
        patient.agency_name
      ].filter(Boolean).join(' ').toLowerCase();
      
      const matchesPatientSearch = patientSearchTerm === '' || 
        searchFields.includes(patientSearchTerm.toLowerCase());
      
      const matchesAgency = selectedAgency === 'all' || 
        patient.agency_name === selectedAgency;
      
      // CORRECCIÓN: Filtro de estado que maneja tanto 'all' como estados específicos
      const matchesStatus = selectedStatus === 'all' || patient.status === selectedStatus;
      
      console.log(`Patient ${patient.id} filter check:`, {
        name: patient.full_name,
        status: patient.status,
        selectedStatus,
        matchesStatus,
        matchesPatientSearch,
        matchesAgency,
        finalMatch: matchesPatientSearch && matchesAgency && matchesStatus
      });
      
      return matchesPatientSearch && matchesAgency && matchesStatus;
    });
    
    console.log('Filtered results:', {
      filteredCount: filtered.length,
      filteredPatients: filtered.map(p => ({ id: p.id, name: p.full_name, status: p.status }))
    });
    
    return filtered;
  }, [patientSearchTerm, selectedAgency, selectedStatus, patients]);
  
  const filteredPatients = getFilteredPatients();
  
  // Paginación - CAMBIO: De 8 a 20 pacientes por página
  const patientsPerPage = 20;
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  
  const getPaginatedPatients = useCallback(() => {
    const startIndex = (activePage - 1) * patientsPerPage;
    return filteredPatients.slice(startIndex, startIndex + patientsPerPage);
  }, [filteredPatients, activePage]);
  
  const paginatedPatients = getPaginatedPatients();
  
  // Event handlers
  const handleMainMenuTransition = useCallback(() => {
    if (isLoggingOut) return;
    
    setMenuTransitioning(true);
    
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    
    setTimeout(() => {
      navigate(`/${baseRole}/homePage`);
    }, 300);
  }, [currentUser, navigate, isLoggingOut]);
  
  const handleTabChange = useCallback((tab) => {
    if (isLoggingOut) return;
    
    if (tab === 'Staffing') {
      setMenuTransitioning(true);
      
      const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
      
      setTimeout(() => {
        navigate(`/${baseRole}/staffing`);
      }, 300);
    }
  }, [currentUser, navigate, isLoggingOut]);
  
  const handleAgencySelect = useCallback((agency) => {
    if (isLoggingOut) return;
    
    setSelectedAgency(agency);
    setAgencySearchTerm('');
    setActivePage(1);
  }, [isLoggingOut]);
  
  const handleStatusSelect = useCallback((status) => {
    if (isLoggingOut) return;
    
    setSelectedStatus(status);
    setActivePage(1);
  }, [isLoggingOut]);
  
  const handleClearFilters = useCallback(() => {
    if (isLoggingOut) return;
    
    setPatientSearchTerm('');
    setAgencySearchTerm('');
    setSelectedAgency('all');
    setSelectedStatus('Active'); // CAMBIO: Resetear a 'Active' en lugar de 'all'
    setActivePage(1);
  }, [isLoggingOut]);
  
  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    setShowUserMenu(false);
    
    document.body.classList.add('logging-out');
  }, []);
  
  const handleLogoutAnimationComplete = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const toggleView = useCallback((view) => {
    if (isLoggingOut) return;
    setCurrentView(view);
  }, [isLoggingOut]);
  
  const toggleFilters = useCallback(() => {
    if (isLoggingOut) return;
    setShowFilters(!showFilters);
  }, [showFilters, isLoggingOut]);
  
  const handlePatientSearch = useCallback((e) => {
    if (isLoggingOut) return;
    setPatientSearchTerm(e.target.value);
    setActivePage(1);
  }, [isLoggingOut]);
  
  const handleActionClick = useCallback((action, patient) => {
    if (isLoggingOut) return;
    
    console.log(`${action} clicked for patient:`, patient);
    
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    
    if (action === 'view') {
      setMenuTransitioning(true);
      
      setTimeout(() => {
        navigate(`/${baseRole}/paciente/${patient.id}`);
      }, 300);
    }
  }, [currentUser, navigate, isLoggingOut]);
  
  const handlePageChange = useCallback((pageNumber) => {
    if (isLoggingOut || pageNumber < 1 || pageNumber > totalPages) return;
    setActivePage(pageNumber);
  }, [isLoggingOut, totalPages]);
  
  const getPageNumbers = useCallback(() => {
    let pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (activePage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (activePage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = activePage - 2; i <= activePage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }, [totalPages, activePage]);

  const handleNavigateToCreatePatient = useCallback(() => {
    if (isLoggingOut) return;
    navigate('/developer/referrals', { state: { initialView: 'createReferral' } });
  }, [navigate, isLoggingOut]);
  
  const handleRefresh = useCallback(() => {
    if (isLoggingOut) return;
    fetchPatients();
  }, [fetchPatients, isLoggingOut]);

  const handleStatusChange = useCallback(async (patientId, action) => {
    if (isLoggingOut) return;
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const isActive = action === 'activate';
      
      const params = new URLSearchParams();
      params.append('is_active', isActive.toString());
      
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}?${params.toString()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} patient`);
      }

      // Refresh the patients list to show updated status
      await fetchPatients();
      
    } catch (error) {
      console.error(`Error ${action}ing patient:`, error);
    }
  }, [isLoggingOut, fetchPatients]);

  const formatCertPeriodForTable = useCallback((patientId) => {
    try {
      const patientCerts = certPeriods.filter(cert => 
        cert.patient_id === patientId && cert.is_active
      );
      
      if (patientCerts.length === 0) return 'No active cert';
      
      const activeCert = patientCerts.sort((a, b) => 
        new Date(b.start_date) - new Date(a.start_date)
      )[0];
      
      const startDate = new Date(activeCert.start_date);
      const endDate = new Date(activeCert.end_date);
      
      const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit', 
          year: 'numeric'
        });
      };
      
      return `${formatDate(startDate)} to ${formatDate(endDate)}`;
    } catch (error) {
      console.error('Error formatting cert period for table:', error);
      return 'Invalid dates';
    }
  }, [certPeriods]);

  // Effects
  useEffect(() => {
    initializeHostingCompanies();
  }, [initializeHostingCompanies]);

  useEffect(() => {
    if (patients && Array.isArray(patients)) {
      const newStats = calculateStats(patients);
      setStats(newStats);
      setIsLoadingStats(false);
    }
  }, [patients]);

  // Effect to refetch patients when company changes
  useEffect(() => {
    if (selectedCompany) {
      fetchPatients();
    }
  }, [selectedCompany, fetchPatients]);
  
  useEffect(() => {
    fetchPatients();
    
    const interval = setInterval(() => {
      if (!isLoggingOut) {
        fetchPatients();
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchPatients, isLoggingOut]);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientX < 50) {
        setShowMenuSwitch(true);
      } else if (e.clientX > 100) {
        setShowMenuSwitch(false);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Show gateway screen if no company selected yet
  if (!hasSelectedCompany || !selectedCompany) {
    return (
      <div className="patients-dashboard gateway-mode">
        {isLoggingOut && (
          <LogoutAnimation 
            isMobile={isMobile} 
            onAnimationComplete={handleLogoutAnimationComplete} 
          />
        )}
        
        <CompanyGatewayScreen 
          companies={hostingCompanies}
          onCompanySelect={handleCompanySelect}
        />
      </div>
    );
  }

  return (
    <div className={`patients-dashboard ${menuTransitioning ? 'transitioning' : ''} ${isLoggingOut ? 'logging-out' : ''}`}>
      {isLoggingOut && (
        <LogoutAnimation 
          isMobile={isMobile} 
          onAnimationComplete={handleLogoutAnimationComplete} 
        />
      )}
      
      <div className="parallax-background">
        <div className="gradient-overlay"></div>
        <div className="animated-particles"></div>
      </div>
      
      {showMenuSwitch && !isLoggingOut && (
        <div 
          className="menu-switch-indicator"
          onClick={handleMainMenuTransition}
          title="Back to main menu"
        >
          <i className="fas fa-chevron-left"></i>
        </div>
      )}
      
      <header className={`main-header ${isLoggingOut ? 'logging-out' : ''}`}>
        <div className="header-container">
          <div className="logo-container">
            <div className="logo-wrapper">
              <img src={logoImg} alt="TherapySync Logo" className="logo" />
              <div className="logo-glow"></div>
            </div>
            
            <div className="menu-navigation">
              <button 
                className="nav-button main-menu" 
                onClick={handleMainMenuTransition}
                title="Back to main menu"
                disabled={isLoggingOut}
              >
                <i className="fas fa-th-large"></i>
                <span>Main Menu</span>
                <div className="button-effect"></div>
              </button>
              
              <button 
                className="nav-button patients-menu active" 
                title="Patients Menu"
                disabled={isLoggingOut}
              >
                <i className="fas fa-user-injured"></i>
                <span>Patients</span>
                <div className="button-effect"></div>
              </button>
            </div>
          </div>
          
          <div className="tabs-section">
            <PremiumTabs activeTab="Patients" onChangeTab={handleTabChange} />
          </div>
          
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
                      onClick={() => {
                        const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
                        navigate(`/${baseRole}/profile`);
                      }}
                    >
                      <i className="fas fa-user-circle"></i>
                      <span>My Profile</span>
                    </div>
                    <div 
                      className="support-menu-item"
                      onClick={() => {
                        const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
                        navigate(`/${baseRole}/settings`);
                      }}
                    >
                      <i className="fas fa-cog"></i>
                      <span>Settings</span>
                    </div>
                  </div>
                </div>
                
                
                <div className="support-menu-footer">
                  <div className="support-menu-item logout" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Log Out</span>
                  </div>
                  <div className="version-info">
                    <span>TherapySync™</span>
                    <span>v2.7.0</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className={`patients-content ${isLoggingOut ? 'fade-out' : ''}`}>
        <div className="patients-container">
          
          <div className="patients-header">
            <div className="patients-title-container">
              <h1 className="patients-title">
                Patient Management Center
                {selectedCompany && (
                  <span className="company-indicator">
                    <i className="fas fa-building"></i>
                    {selectedCompany.name}
                  </span>
                )}
              </h1>
              <p className="patients-subtitle">
                {selectedCompany 
                  ? `Managing ${selectedCompany.patientCount} patients for ${selectedCompany.name} - ${selectedCompany.location}`
                  : "Streamline your therapy workflow with complete patient information at your fingertips"
                }
              </p>
              <div className="header-actions">
                <button 
                  className="header-action-btn refresh-btn" 
                  onClick={handleRefresh}
                  disabled={isLoggingOut || isLoadingPatients}
                  title="Refresh patient data"
                >
                  <i className={`fas fa-sync-alt ${isLoadingPatients ? 'fa-spin' : ''}`}></i>
                  {isLoadingPatients ? 'Refreshing...' : 'Refresh'}
                </button>
                <button 
                  className="header-action-btn" 
                  onClick={handleNavigateToCreatePatient}
                  disabled={isLoggingOut}
                >
                  <i className="fas fa-plus"></i> New Patient
                </button>
              </div>
            </div>
          </div>

          <div className="stats-dashboard">
            {stats.map((stat, index) => (
              <StatCard 
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                isLoading={isLoadingStats}
              />
            ))}
          </div>
          
          <div className={`filter-container ${showFilters ? 'expanded' : 'collapsed'}`}>
            <div className="filter-card">
              <div className="filter-header" onClick={toggleFilters} style={{ cursor: 'pointer' }}>
                <h3>
                  <i className="fas fa-filter"></i> Advanced Filters
                </h3>
                <div className="filter-header-actions">
                  <span className="filter-count">
                    Showing <strong>{filteredPatients.length}</strong> of <strong>{patients.length}</strong> patients
                  </span>
                  <button 
                    className="toggle-filters-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFilters();
                    }}
                    title={showFilters ? "Collapse filters" : "Expand filters"}
                    disabled={isLoggingOut}
                  >
                    <i className={`fas fa-chevron-${showFilters ? 'up' : 'down'}`}></i>
                  </button>
                </div>
              </div>
              
              {showFilters && (
                <>
                  <div className="filter-section">
                    <div className="agency-filter">
                      <h4>Healthcare Agencies</h4>
                      <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input 
                          type="text" 
                          placeholder="Search agencies..." 
                          value={agencySearchTerm}
                          onChange={(e) => setAgencySearchTerm(e.target.value)}
                          disabled={isLoggingOut}
                        />
                      </div>
                      
                      <div className="agency-list">
                        <div 
                          className={`agency-item ${selectedAgency === 'all' ? 'active' : ''}`}
                          onClick={() => !isLoggingOut && handleAgencySelect('all')}
                        >
                          <i className="fas fa-hospital-alt"></i> All Agencies
                        </div>
                        {filteredAgencies.map((agency, index) => (
                          <div 
                            key={index} 
                            className={`agency-item ${selectedAgency === agency ? 'active' : ''}`}
                            onClick={() => !isLoggingOut && handleAgencySelect(agency)}
                          >
                            <i className="fas fa-building"></i> {agency}
                          </div>
                        ))}
                        {filteredAgencies.length === 0 && agencySearchTerm && (
                          <div className="agency-item disabled">
                            <i className="fas fa-search"></i> No agencies found
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="status-filter">
                      <h4>Patient Status</h4>
                      <div className="status-buttons">
                        {statusOptions.map((status, index) => (
                          <button 
                            key={index} 
                            className={`status-button ${selectedStatus === status ? 'active' : ''} ${status.toLowerCase()}`}
                            onClick={() => !isLoggingOut && handleStatusSelect(status)}
                            disabled={isLoggingOut}
                          >
                            {status === 'all' ? 'All Statuses' : status}
                            {status !== 'all' && (
                              <span className="status-count">
                                {patients.filter(p => p.status === status).length}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="filter-footer">
                    <button 
                      className="clear-filters" 
                      onClick={handleClearFilters}
                      disabled={isLoggingOut}
                    >
                      <i className="fas fa-times-circle"></i> Clear Filters
                    </button>
                    
                    <div className="filter-tips">
                      <div className="tip-icon">
                        <i className="fas fa-lightbulb"></i>
                      </div>
                      <p>Tip: Press <kbd>Ctrl</kbd> + <kbd>F</kbd> to quickly search patients</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="patients-table-area">
            <div className="table-header">
              <div className="patient-search">
                <i className="fas fa-search"></i>
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search patients by name or address..." 
                  value={patientSearchTerm}
                  onChange={handlePatientSearch}
                  disabled={isLoggingOut}
                />
                {patientSearchTerm && (
                  <button 
                    className="clear-search" 
                    onClick={() => setPatientSearchTerm('')}
                    disabled={isLoggingOut}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              
              <div className="view-options">
                <button 
                  className={`view-btn ${currentView === 'list' ? 'active' : ''}`}
                  onClick={() => toggleView('list')}
                  title="List View"
                  disabled={isLoggingOut}
                >
                  <i className="fas fa-list"></i>
                </button>
                <button 
                  className={`view-btn ${currentView === 'grid' ? 'active' : ''}`}
                  onClick={() => toggleView('grid')}
                  title="Grid View"
                  disabled={isLoggingOut}
                >
                  <i className="fas fa-th-large"></i>
                </button>
              </div>
            </div>
            
            {isLoadingPatients ? (
              currentView === 'grid' ? (
                <div className="patients-grid-wrapper">
                  <div className="patients-grid">
                    {Array.from({ length: 20 }).map((_, index) => (
                      <PatientCardSkeleton key={index} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="patients-table-wrapper">
                  <div className="table-skeleton">
                    <div className="skeleton-header">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton-header-cell"></div>
                      ))}
                    </div>
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="skeleton-row">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <div key={j} className="skeleton-cell"></div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : currentView === 'list' ? (
              <div className="patients-table-wrapper">
                <table className="patients-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Agency</th>
                      <th>Status</th>
                      <th>Address</th>
                      <th>Cert Period</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPatients.length > 0 ? (
                      paginatedPatients.map(patient => (
                        <tr key={patient.id} className={`status-${(patient.status || 'active').toLowerCase()}`}>
                          <td>{patient.id}</td>
                          <td className="patient-name-cell">{patient.full_name || 'N/A'}</td>
                          <td>
                            <span className="agency-name">{patient.agency_name || 'N/A'}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${(patient.status || 'active').toLowerCase()}`}>
                              {patient.status || 'Active'}
                            </span>
                          </td>
                          <td className="address-cell">{patient.address || 'N/A'}</td>
                          <td style={{fontSize: '0.85em'}}>{formatCertPeriodForTable(patient.id)}</td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="action-btn view" 
                                title="View Profile"
                                onClick={() => handleActionClick('view', patient)}
                                disabled={isLoggingOut}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="no-results">
                        <td colSpan="7">
                          <div className="no-results-message">
                            <i className="fas fa-search"></i>
                            <p>No patients found matching your search criteria</p>
                            <button 
                              className="reset-search" 
                              onClick={handleClearFilters}
                              disabled={isLoggingOut}
                            >
                              Reset Search
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="patients-grid-wrapper">
                {paginatedPatients.length > 0 ? (
                  <div className="patients-grid">
                    {paginatedPatients.map(patient => (
                      <PatientCard 
                        key={patient.id} 
                        patient={patient}
                        certPeriods={certPeriods}
                        onView={() => !isLoggingOut && handleActionClick('view', patient)}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <div className="no-results-message">
                      <i className="fas fa-search"></i>
                      <p>No patients found matching your search criteria</p>
                      <button 
                        className="reset-search" 
                        onClick={handleClearFilters}
                        disabled={isLoggingOut}
                      >
                        Reset Search
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {filteredPatients.length > 0 && !isLoadingPatients && (
              <div className="table-footer">
                <div className="pagination">
                  <button 
                    className="pagination-btn" 
                    onClick={() => handlePageChange(activePage - 1)}
                    disabled={activePage === 1 || isLoggingOut}
                  >
                    <i className="fas fa-chevron-left"></i> Previous
                  </button>
                  
                  <div className="page-numbers">
                    {getPageNumbers().map(pageNumber => (
                      <button 
                        key={pageNumber}
                        className={`page-number ${activePage === pageNumber ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNumber)}
                        disabled={isLoggingOut}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(activePage + 1)}
                    disabled={activePage === totalPages || isLoggingOut}
                  >
                    Next <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
                
                <div className="pagination-info">
                  Showing <strong>{Math.min(((activePage - 1) * patientsPerPage) + 1, filteredPatients.length)}-{Math.min(activePage * patientsPerPage, filteredPatients.length)}</strong> of <strong>{filteredPatients.length}</strong> patients
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      
    </div>
  );
};

export default DevPatientsPage;