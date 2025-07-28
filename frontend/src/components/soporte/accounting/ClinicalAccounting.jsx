import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../login/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../../../assets/LogoMHC.jpeg';
import LogoutAnimation from '../../LogOut/LogOut';
import '../../../styles/developer/accounting/ClinicalAccounting.scss';
import '../../../styles/Header/Header.scss';

// Importar sub-componentes
import ClinicalMetrics from './ClinicalMetrics';
import MonthlyBreakdown from './MonthlyBreakdown';
import DisciplineSelector from './DisciplineSelector';
import TherapistModal from './TherapistModal';
import AgencyModal from './AgencyModal';

/**
 * CLINICAL ACCOUNTING - DEVELOPER VIEW
 * Sistema de empresas donde developer ve TODAS las agencias cliente
 * Usar datos REALES del backend sin modificar endpoints
 */
const ClinicalAccounting = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const userMenuRef = useRef(null);
  
  // Estados para sistema de empresas
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanySelector, setShowCompanySelector] = useState(true);
  const [availableCompanies] = useState([
    {
      id: 'motive-home-care',
      name: 'Motive Home Care',
      logo: null,
      description: 'Premium healthcare services',
      established: '2020',
      location: 'California, USA'
    }
    // Doc Luis dijo por ahora solo dejar Motive Home Care
  ]);
  
  // Estados principales
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [showTherapistModal, setShowTherapistModal] = useState(false);
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  
  // Estados para header y navegación
  const [menuTransitioning, setMenuTransitioning] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Estados para datos REALES de API (filtrados por empresa)
  const [staff, setStaff] = useState([]);
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [certificationPeriods, setCertificationPeriods] = useState([]);

  // Funciones para manejar header y navegación
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const userData = {
    name: currentUser?.fullname || currentUser?.username || 'Developer',
    avatar: getInitials(currentUser?.fullname || currentUser?.username || 'Developer'),
    email: currentUser?.email || 'developer@motivehomecare.com',
    role: currentUser?.role || 'Developer',
    status: 'online'
  };

  const handleMainMenuTransition = () => {
    setMenuTransitioning(true);
    
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    
    setTimeout(() => {
      navigate(`/${baseRole}/homePage`);
    }, 300);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setShowUserMenu(false);
    
    document.body.classList.add('logging-out');
    
    // No llamar logout() directamente, dejar que LogoutAnimation maneje todo
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 4000); // Tiempo para la animación completa
  };

  // Handle navigation to profile page
  const handleNavigateToProfile = () => {
    if (isLoggingOut) return;
    
    setShowUserMenu(false);
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    navigate(`/${baseRole}/profile`);
  };

  // Handle navigation to settings page
  const handleNavigateToSettings = () => {
    if (isLoggingOut) return;
    
    setShowUserMenu(false);
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    navigate(`/${baseRole}/settings`);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Click outside handler para cerrar menú de usuario
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  // Función para seleccionar empresa y cargar sus datos
  const handleCompanySelect = async (company) => {
    setSelectedCompany(company);
    setShowCompanySelector(false);
    setIsLoading(true);
    
    try {
      await loadCompanyData(company.id);
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error loading company data:', error);
      setIsLoading(false);
    }
  };

  // Cargar datos reales filtrados por empresa
  const loadCompanyData = async (companyId) => {
    try {
      // Cargar ALL staff first to use for both therapists and agencies
      const response = await fetch('http://localhost:8000/staff/');
      if (!response.ok) {
        setStaff([]);
        setAgencies([]);
        setPatients([]);
        return;
      }
      
      const allStaff = await response.json();
      console.log('All staff from API:', allStaff);
      
      // Process staff data for Motive Home Care
      await processMotiveHomeCarePart(companyId, allStaff);
      
      // Load patients and extract agencies
      await loadRealPatientsData(companyId, allStaff);
      
    } catch (error) {
      console.error('Error loading company data:', error);
      setStaff([]);
      setAgencies([]);
      setPatients([]);
    }
  };
  
  // Process Motive Home Care therapists and agencies
  const processMotiveHomeCarePart = async (companyId, allStaff) => {
    if (companyId === 'motive-home-care') {
      // Motive Home Care therapists
      const motiveTherapists = allStaff.filter(s => {
        const validRoles = ['PT', 'PTA', 'OT', 'COTA', 'ST', 'STA'];
        return s.role && validRoles.includes(s.role) && s.is_active;
      });
      
      setStaff(motiveTherapists);
      console.log('Motive Home Care therapists:', motiveTherapists);
    } else {
      setStaff([]);
    }
  };


  // Cargar pacientes REALES desde API filtrados por empresa  
  const loadRealPatientsData = async (companyId, allStaff) => {
    try {
      const response = await fetch('http://localhost:8000/patients/');
      if (response.ok) {
        const allPatients = await response.json();
        console.log('All patients from API:', allPatients);
        
        // Filter patients based on real data only
        const companyPatients = allPatients.filter(p => {
          if (companyId === 'motive-home-care') {
            // Include patients that actually belong to Motive Home Care based on real data
            return p.agency_name?.toLowerCase().includes('motive') || 
                   p.agency_id === 1;
          }
          return false;
        });
        
        setPatients(companyPatients);
        console.log('Filtered patients for company:', companyPatients);
        
        // Extract REAL agencies from patient data using the staff already loaded
        // Las agencias están en la tabla Staff, referenciadas por patient.agency_id
        const realAgencies = [];
        const seenAgencyIds = new Set();
        
        allPatients.forEach(patient => {
          if (patient.agency_id && !seenAgencyIds.has(patient.agency_id)) {
            seenAgencyIds.add(patient.agency_id);
            
            // Find the staff member that corresponds to this agency_id
            const agencyStaff = allStaff.find(s => s.id === patient.agency_id);
            
            if (agencyStaff) {
              realAgencies.push({
                id: agencyStaff.id,
                name: agencyStaff.name, // Use the real staff name
                email: agencyStaff.email, // Use the real staff email
                role: agencyStaff.role || 'Agency',
                is_active: agencyStaff.is_active
              });
            } else {
              // Fallback if staff not found - use patient.agency_name
              realAgencies.push({
                id: patient.agency_id,
                name: patient.agency_name || `Agency ${patient.agency_id}`,
                email: `billing@agency${patient.agency_id}.com`,
                role: 'Agency',
                is_active: true
              });
            }
          }
        });
        
        setAgencies(realAgencies);
        console.log('Real agencies extracted from patient->staff relationship:', realAgencies);
        
        // Load certification periods for these patients
        await loadCertificationPeriods(companyPatients.map(p => p.id));
        
        return companyPatients;
      } else {
        setPatients([]);
        setAgencies([]);
        return [];
      }
    } catch (error) {
      console.error('Error loading real patients:', error);
      setPatients([]);
      setAgencies([]);
      return [];
    }
  };

  // Cargar certification periods para obtener visitas
  const loadCertificationPeriods = async (patientIds) => {
    try {
      const allCertPeriods = [];
      
      // Obtener cert periods para cada paciente
      for (const patientId of patientIds) {
        try {
          const response = await fetch(`http://localhost:8000/patient/${patientId}/cert-periods`);
          if (response.ok) {
            const certPeriods = await response.json();
            allCertPeriods.push(...certPeriods);
          }
        } catch (error) {
          console.log(`No cert periods for patient ${patientId}`);
        }
      }
      
      setCertificationPeriods(allCertPeriods);
      
      // Cargar visitas para estos certification periods
      if (allCertPeriods.length > 0) {
        await loadRealVisitsData(selectedCompany?.id, allCertPeriods);
      } else {
        // Si no hay cert periods, NO HAY visitas
        setVisits([]);
      }
      
      return allCertPeriods;
    } catch (error) {
      console.error('Error loading certification periods:', error);
      setVisits([]);
      return [];
    }
  };

  // Cargar visitas REALES desde API
  const loadRealVisitsData = async (companyId, certPeriodsToUse = null) => {
    try {
      const allVisits = [];
      const certPeriodsForVisits = certPeriodsToUse || certificationPeriods;
      
      // Obtener visitas para cada certification period
      for (const certPeriod of certPeriodsForVisits) {
        try {
          const response = await fetch(`http://localhost:8000/visits/certperiod/${certPeriod.id}`);
          if (response.ok) {
            const visits = await response.json();
            allVisits.push(...visits);
          }
        } catch (error) {
          console.log(`No visits for cert period ${certPeriod.id}`);
        }
      }
      
      // Set visits - if no real visits, then there are NO visits
      setVisits(allVisits);
    } catch (error) {
      console.error('Error loading real visits:', error);
      // If there's an error, NO visits
      setVisits([]);
    }
  };


  // Calcular métricas financieras basadas en datos reales
  const calculateFinancialMetrics = () => {
    if (!visits.length) return null;

    const completedVisits = visits.filter(v => v.status === 'completed');
    const pendingVisits = visits.filter(v => v.status === 'pending' || v.status === 'scheduled');

    // Precios reales por tipo de visita según Doc Luis
    const visitPrices = {
      'Initial Evaluation': { agency_pays: 130, therapist_receives: 110 },
      'Follow Up': { agency_pays: 110, therapist_receives: 55 },
      'SOC OASIS': { agency_pays: 140, therapist_receives: 120 },
      'RA': { agency_pays: 120, therapist_receives: 100 },
      'DC': { agency_pays: 100, therapist_receives: 80 }
    };

    // Calcular totales
    const totalBilled = completedVisits.reduce((sum, visit) => {
      const price = visitPrices[visit.visit_type] || visitPrices['Follow Up'];
      return sum + price.agency_pays;
    }, 0);

    const pendingPayments = pendingVisits.reduce((sum, visit) => {
      const price = visitPrices[visit.visit_type] || visitPrices['Follow Up'];
      return sum + price.therapist_receives;
    }, 0);

    const completedPayments = completedVisits.reduce((sum, visit) => {
      const price = visitPrices[visit.visit_type] || visitPrices['Follow Up'];
      return sum + price.therapist_receives;
    }, 0);

    const profits = totalBilled - completedPayments;

    return {
      totalBilled,
      pendingPayments,
      completedPayments, 
      profits,
      completedVisitsCount: completedVisits.length,
      pendingVisitsCount: pendingVisits.length
    };
  };

  // Handlers
  const handleDisciplineSelect = (discipline) => {
    setSelectedDiscipline(discipline);
    setSelectedTherapist(null);
    setSelectedAgency(null);
  };

  const handleTherapistSelect = (therapist) => {
    setSelectedTherapist(therapist);
    setShowTherapistModal(true);
  };

  const handleAgencySelect = (agency) => {
    setSelectedAgency(agency);
    setShowAgencyModal(true);
  };

  const handlePatientClick = (patientId) => {
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    navigate(`/${baseRole}/paciente/${patientId}`);
  };

  const handleBackToCompanies = () => {
    setSelectedCompany(null);
    setShowCompanySelector(true);
    setStaff([]);
    setPatients([]);
    setVisits([]);
    setAgencies([]);
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Mostrar selector de empresas
  if (showCompanySelector) {
    return (
      <motion.div 
        className="clinical-accounting"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header Premium - Exact replica from Header.jsx */}
        <header className={`main-header ${isLoggingOut ? 'logging-out' : ''}`}>
          <div className="header-container">
            {/* Logo with effects */}
            <div className="logo-container">
              <div className="logo-glow"></div>
              <img 
                src={logoImg} 
                alt="TherapySync Logo" 
                className="logo" 
                onClick={() => !isLoggingOut && handleMainMenuTransition()} 
              />
              
              {/* Navigation buttons for accounting */}
              <div className="menu-navigation">
                <button 
                  className="nav-button main-menu" 
                  onClick={handleMainMenuTransition}
                  title="Back to main menu"
                >
                  <i className="fas fa-th-large"></i>
                  <span>Main Menu</span>
                </button>
                
                <button 
                  className="nav-button accounting-menu active" 
                  title="Financial Management"
                >
                  <i className="fas fa-chart-pie"></i>
                  <span>Accounting</span>
                </button>
              </div>
            </div>
            
            
            {/* Enhanced user profile - exact replica */}
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
              
              {/* Enhanced dropdown menu - exact replica */}
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
                        onClick={handleNavigateToProfile}
                      >
                        <i className="fas fa-user-circle"></i>
                        <span>My Profile</span>
                      </div>
                      <div 
                        className="support-menu-item"
                        onClick={handleNavigateToSettings}
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

        <motion.div className="company-selector" variants={itemVariants}>
          <div className="company-selector-header">
            <h1>
              <i className="fas fa-building"></i>
              Select Client Company
            </h1>
            <p>As a developer, you have complete access to all client companies</p>
          </div>
          
          <div className="companies-grid">
            {availableCompanies.map((company) => (
              <motion.div
                key={company.id}
                className="company-card"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCompanySelect(company)}
              >
                <div className="company-logo">
                  <i className="fas fa-building"></i>
                </div>
                <div className="company-info">
                  <h3>{company.name}</h3>
                  <p>{company.description}</p>
                  <div className="company-details">
                    <span>
                      <i className="fas fa-calendar"></i>
                      Est. {company.established}
                    </span>
                    <span>
                      <i className="fas fa-map-marker-alt"></i>
                      {company.location}
                    </span>
                  </div>
                </div>
                <div className="company-action">
                  <i className="fas fa-arrow-right"></i>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="clinical-accounting">
        <div className="clinical-loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading {selectedCompany?.name} data...</div>
        </div>
      </div>
    );
  }

  const metrics = calculateFinancialMetrics();

  return (
    <motion.div 
      className="clinical-accounting"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Premium - Exact replica for main dashboard */}
      <header className={`main-header ${isLoggingOut ? 'logging-out' : ''}`}>
        <div className="header-container">
          {/* Logo with effects */}
          <div className="logo-container">
            <div className="logo-glow"></div>
            <img 
              src={logoImg} 
              alt="TherapySync Logo" 
              className="logo" 
              onClick={() => !isLoggingOut && handleMainMenuTransition()} 
            />
            
            {/* Navigation buttons for accounting with companies */}
            <div className="menu-navigation">
              <button 
                className="nav-button main-menu" 
                onClick={handleMainMenuTransition}
                title="Back to main menu"
              >
                <i className="fas fa-th-large"></i>
                <span>Main Menu</span>
              </button>
              
              <button 
                className="nav-button companies-menu" 
                onClick={handleBackToCompanies}
                title="Back to companies"
              >
                <i className="fas fa-building"></i>
                <span>Companies</span>
              </button>
              
              <button 
                className="nav-button accounting-menu active" 
                title="Financial Management"
              >
                <i className="fas fa-chart-pie"></i>
                <span>Accounting</span>
              </button>
            </div>
          </div>
          
          
          {/* Enhanced user profile - exact replica */}
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
            
            {/* Enhanced dropdown menu - exact replica */}
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
                      onClick={handleNavigateToProfile}
                    >
                      <i className="fas fa-user-circle"></i>
                      <span>My Profile</span>
                    </div>
                    <div 
                      className="support-menu-item"
                      onClick={handleNavigateToSettings}
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

      {/* Header con empresa seleccionada */}
      <motion.header className="clinical-header" variants={itemVariants}>
        <div className="header-content">
          <div className="clinical-title">
            <div className="company-breadcrumb">
              <button onClick={handleBackToCompanies} className="back-btn">
                <i className="fas fa-arrow-left"></i>
                Companies
              </button>
              <i className="fas fa-chevron-right"></i>
              <span>{selectedCompany?.name}</span>
            </div>
            <h1>
              <i className="fas fa-chart-line title-icon"></i>
              Financial Management - {selectedCompany?.name}
            </h1>
            <p className="subtitle">
              Financial overview and management for {selectedCompany?.name}
            </p>
          </div>
          
          <div className="header-actions">
            <button className="clinical-btn">
              <i className="fas fa-download"></i>
              Export Report
            </button>
            <button className="clinical-btn primary">
              <i className="fas fa-plus"></i>
              New Payment
            </button>
          </div>
        </div>
      </motion.header>

      {/* Contenido Principal */}
      <div className="clinical-content">
        
        {/* Métricas Principales */}
        <motion.div variants={itemVariants}>
          <ClinicalMetrics 
            metrics={metrics}
            isLoading={false}
          />
        </motion.div>

        {/* Breakdown Mensual */}
        <motion.div variants={itemVariants}>
          <MonthlyBreakdown 
            visits={visits}
            onMonthSelect={setSelectedMonth}
            selectedMonth={selectedMonth}
          />
        </motion.div>

        {/* Selector de Disciplinas */}
        <motion.div variants={itemVariants}>
          <DisciplineSelector 
            staff={staff}
            agencies={agencies}
            visits={visits}
            selectedDiscipline={selectedDiscipline}
            onDisciplineSelect={handleDisciplineSelect}
            onTherapistSelect={handleTherapistSelect}
            onAgencySelect={handleAgencySelect}
          />
        </motion.div>

      </div>

      {/* Modal de Terapeuta */}
      <AnimatePresence>
        {showTherapistModal && selectedTherapist && (
          <TherapistModal 
            therapist={selectedTherapist}
            visits={visits}
            patients={patients}
            onClose={() => {
              setShowTherapistModal(false);
              setSelectedTherapist(null);
            }}
            onPatientClick={handlePatientClick}
          />
        )}
      </AnimatePresence>

      {/* Modal de Agencia */}
      <AnimatePresence>
        {showAgencyModal && selectedAgency && (
          <AgencyModal 
            agency={selectedAgency}
            visits={visits}
            patients={patients}
            staff={staff}
            onClose={() => {
              setShowAgencyModal(false);
              setSelectedAgency(null);
            }}
            onPatientClick={handlePatientClick}
          />
        )}
      </AnimatePresence>

      {/* Logout Animation */}
      {isLoggingOut && <LogoutAnimation />}

    </motion.div>
  );
};

export default ClinicalAccounting;