import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../login/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../../../assets/LogoMHC.jpeg';
import LogoutAnimation from '../../LogOut/LogOut';
import '../../../styles/developer/accounting/ClinicalAccounting.scss';
import '../../../styles/Header/Header.scss';

// Importar sub-componentes (reutilizamos los de developer)
import ClinicalMetrics from '../../developer/accounting/ClinicalMetrics';
import MonthlyBreakdown from '../../developer/accounting/MonthlyBreakdown';
import TherapistModal from '../../developer/accounting/TherapistModal';

/**
 * THERAPIST ACCOUNTING - INDIVIDUAL VIEW
 * Vista individual para terapeutas PT-OT-ST
 * Solo muestra datos financieros del terapeuta actual
 * NO pueden ver datos de otros terapeutas
 */
const TherapistAccounting = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const userMenuRef = useRef(null);
  
  // Estados principales
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para header y navegación
  const [menuTransitioning, setMenuTransitioning] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showTherapistModal, setShowTherapistModal] = useState(false);
  
  // Estados para datos del terapeuta actual
  const [therapistData, setTherapistData] = useState(null);
  const [myPatients, setMyPatients] = useState([]);
  const [myVisits, setMyVisits] = useState([]);
  const [mySchedule, setMySchedule] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCompanyContacts, setShowCompanyContacts] = useState(false);

  // Funciones para manejar header y navegación
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const userData = {
    name: currentUser?.fullname || currentUser?.username || 'Therapist',
    avatar: getInitials(currentUser?.fullname || currentUser?.username || 'Therapist'),
    email: currentUser?.email || 'therapist@motivehomecare.com',
    role: currentUser?.role || 'Therapist',
    status: 'online'
  };

  const handleMainMenuTransition = () => {
    setMenuTransitioning(true);
    
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'pt-ot-st';
    
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
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'pt-ot-st';
    navigate(`/${baseRole}/profile`);
  };

  // Handle navigation to settings page
  const handleNavigateToSettings = () => {
    if (isLoggingOut) return;
    
    setShowUserMenu(false);
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'pt-ot-st';
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

  // Obtener información del terapeuta actual
  useEffect(() => {
    loadTherapistData();
  }, []);

  // Función para cargar datos del terapeuta actual
  const loadTherapistData = async () => {
    setIsLoading(true);
    
    try {
      // Cargar datos específicos del terapeuta logueado
      const therapistId = getCurrentTherapistId();
      
      await Promise.all([
        loadMyTherapistInfo(therapistId),
        loadMyPatients(therapistId),
        loadMyVisits(therapistId),
        loadMySchedule(therapistId)
      ]);
      
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
      
    } catch (error) {
      console.error('Error loading therapist data:', error);
      setIsLoading(false);
    }
  };

  // Obtener ID del terapeuta actual
  const getCurrentTherapistId = () => {
    // En producción esto vendría del JWT token o contexto
    // Por ahora simulamos basado en el email del usuario
    const userEmail = currentUser?.email || '';
    const userRole = currentUser?.role || '';
    
    // Simular ID basado en el rol del usuario
    if (userRole.includes('PT')) return 1;
    if (userRole.includes('OT')) return 2; 
    if (userRole.includes('ST')) return 3;
    if (userRole.includes('PTA')) return 4;
    if (userRole.includes('COTA')) return 5;
    if (userRole.includes('STA')) return 6;
    
    return 1; // Por defecto
  };

  // Cargar información del terapeuta actual
  const loadMyTherapistInfo = async (therapistId) => {
    try {
      // En producción sería: /api/therapists/${therapistId}
      const response = await fetch('http://localhost:8000/staff/');
      if (response.ok) {
        const allStaff = await response.json();
        // Buscar al terapeuta actual o usar datos simulados
        const currentTherapist = allStaff.find(s => s.id === therapistId) || 
                                 generateMockTherapistData(therapistId);
        setTherapistData(currentTherapist);
      } else {
        setTherapistData(generateMockTherapistData(therapistId));
      }
    } catch (error) {
      console.error('Error loading therapist info:', error);
      setTherapistData(generateMockTherapistData(therapistId));
    }
  };

  // Cargar pacientes asignados al terapeuta actual
  const loadMyPatients = async (therapistId) => {
    try {
      // En producción sería: /api/therapists/${therapistId}/patients
      const response = await fetch('http://localhost:8000/patients/');
      if (response.ok) {
        const allPatients = await response.json();
        // Filtrar pacientes asignados al terapeuta actual
        // En producción habría relación directa therapist_id
        const myPatients = allPatients.filter(p => 
          Math.random() > 0.7 // Simulamos algunos pacientes asignados
        ).slice(0, 5); // Máximo 5 pacientes
        
        setMyPatients(myPatients.length ? myPatients : generateMockPatients(therapistId));
      } else {
        setMyPatients(generateMockPatients(therapistId));
      }
    } catch (error) {
      console.error('Error loading my patients:', error);
      setMyPatients(generateMockPatients(therapistId));
    }
  };

  // Cargar visitas del terapeuta actual
  const loadMyVisits = async (therapistId) => {
    try {
      // En producción sería: /api/therapists/${therapistId}/visits
      setMyVisits(generateMockVisits(therapistId));
    } catch (error) {
      console.error('Error loading my visits:', error);
      setMyVisits(generateMockVisits(therapistId));
    }
  };

  // Cargar horario del terapeuta actual
  const loadMySchedule = async (therapistId) => {
    try {
      // En producción sería: /api/therapists/${therapistId}/schedule
      setMySchedule(generateMockSchedule(therapistId));
    } catch (error) {
      console.error('Error loading my schedule:', error);
      setMySchedule(generateMockSchedule(therapistId));
    }
  };

  // Generar datos simulados del terapeuta actual
  const generateMockTherapistData = (therapistId) => {
    const userRole = currentUser?.role || 'PT';
    const userName = currentUser?.fullname || currentUser?.username || 'Therapist';
    
    return {
      id: therapistId,
      name: userName,
      role: userRole.includes(' - ') ? userRole.split(' - ')[0] : userRole,
      email: currentUser?.email || 'therapist@motivehomecare.com',
      license_number: `LIC${String(therapistId).padStart(6, '0')}`,
      hire_date: '2024-01-15',
      is_active: true,
      phone: '(555) 123-4567',
      specialties: getSpecialtiesByRole(userRole),
      total_patients: 5,
      active_certifications: 2,
      monthly_visits: 18,
      completion_rate: 96
    };
  };

  const getSpecialtiesByRole = (role) => {
    const specialties = {
      'PT': ['Orthopedic', 'Neurological', 'Geriatric'],
      'PTA': ['Orthopedic', 'Post-Surgical'],
      'OT': ['Activities of Daily Living', 'Cognitive Therapy'],
      'COTA': ['Fine Motor Skills', 'Adaptive Equipment'],
      'ST': ['Swallowing Disorders', 'Speech Therapy'],
      'STA': ['Voice Therapy', 'Language Development']
    };
    
    const roleKey = role.includes(' - ') ? role.split(' - ')[0] : role;
    return specialties[roleKey] || ['General Therapy'];
  };

  const generateMockPatients = (therapistId) => {
    // Generar muchos más pacientes para simular escenario real
    const firstNames = ["Maria", "Robert", "Eleanor", "John", "Sarah", "Michael", "Jennifer", "David", "Lisa", "James"];
    const lastNames = ["Rodriguez", "Johnson", "Chen", "Smith", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore"];
    const diagnoses = [
      "Post-stroke rehabilitation",
      "Hip replacement recovery",
      "Balance and mobility",
      "Knee surgery recovery",
      "Shoulder rehabilitation",
      "Back pain management",
      "Parkinson's therapy",
      "Fall prevention",
      "Gait training",
      "Arthritis management"
    ];
    
    const patients = [];
    
    // Generar 120 pacientes para simular carga real
    for (let i = 0; i < 120; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 60);
      
      patients.push({
        id: 100 + i,
        first_name: firstNames[Math.floor(Math.random() * firstNames.length)],
        last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
        date_of_birth: `19${50 + Math.floor(Math.random() * 30)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
        cert_start_date: startDate.toISOString().split('T')[0],
        cert_end_date: endDate.toISOString().split('T')[0],
        visits_completed: Math.floor(Math.random() * 15),
        visits_remaining: Math.floor(Math.random() * 10) + 1,
        status: "active"
      });
    }
    
    return patients;
  };

  const generateMockVisits = (therapistId) => {
    const visits = [];
    const today = new Date();
    const visitTypes = ['Initial Evaluation', 'Follow Up', 'Re-evaluation', 'SOC OASIS', 'RA', 'DC'];
    const patientIds = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120];
    
    // Generar visitas de los últimos 90 días (3 meses) con distribución realista
    for (let i = 0; i < 45; i++) {
      const visitDate = new Date(today);
      visitDate.setDate(today.getDate() - Math.floor(Math.random() * 90));
      
      visits.push({
        id: 1000 + i,
        patient_id: patientIds[Math.floor(Math.random() * patientIds.length)],
        visit_date: visitDate.toISOString().split('T')[0],
        visit_type: visitTypes[Math.floor(Math.random() * visitTypes.length)],
        status: i < 35 ? 'completed' : Math.random() > 0.3 ? 'scheduled' : 'pending',
        duration_minutes: 45 + Math.floor(Math.random() * 30),
        notes: `Treatment session ${i + 1}`,
        therapy_type: therapistData?.role || 'PT'
      });
    }
    
    return visits.sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));
  };

  const generateMockSchedule = (therapistId) => {
    const schedule = [];
    const today = new Date();
    
    // Generar horario para los próximos 7 días
    for (let i = 0; i < 7; i++) {
      const scheduleDate = new Date(today);
      scheduleDate.setDate(today.getDate() + i);
      
      const daySchedule = {
        date: scheduleDate.toISOString().split('T')[0],
        dayOfWeek: scheduleDate.toLocaleDateString('en-US', { weekday: 'long' }),
        appointments: []
      };
      
      // Generar citas para el día (2-4 citas por día)
      const appointmentCount = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < appointmentCount; j++) {
        const hour = 9 + j * 2; // Citas cada 2 horas empezando a las 9 AM
        daySchedule.appointments.push({
          id: i * 10 + j,
          time: `${hour.toString().padStart(2, '0')}:00`,
          patient_id: 101 + (j % 3),
          patient_name: ['Maria Rodriguez', 'Robert Johnson', 'Eleanor Chen'][j % 3],
          type: 'Treatment Session',
          duration: 60,
          status: i === 0 ? 'completed' : 'scheduled'
        });
      }
      
      schedule.push(daySchedule);
    }
    
    return schedule;
  };

  // Calcular métricas financieras del terapeuta (solo lo que el terapeuta necesita ver)
  const calculateTherapistMetrics = () => {
    if (!myVisits.length) return null;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const completedVisits = myVisits.filter(v => v.status === 'completed');
    const pendingVisits = myVisits.filter(v => v.status === 'pending' || v.status === 'scheduled');
    
    // Filtrar visitas completadas de este mes para pagos completados
    const completedThisMonth = completedVisits.filter(v => {
      const visitDate = new Date(v.visit_date);
      return visitDate.getMonth() === currentMonth && visitDate.getFullYear() === currentYear;
    });

    // Tarifas por tipo de visita para terapeutas (solo lo que ellos reciben)
    const therapistRates = {
      'Initial Evaluation': 110,
      'Follow Up': 85,
      'Re-evaluation': 95,
      'SOC OASIS': 120,
      'RA': 100,
      'DC': 80
    };

    // Pagos completados de este mes solamente
    const completedEarningsThisMonth = completedThisMonth.reduce((sum, visit) => {
      const rate = therapistRates[visit.visit_type] || therapistRates['Follow Up'];
      return sum + rate;
    }, 0);

    // Total ganado de todas las visitas completadas (todo el tiempo)
    const totalEarningsAllTime = completedVisits.reduce((sum, visit) => {
      const rate = therapistRates[visit.visit_type] || therapistRates['Follow Up'];
      return sum + rate;
    }, 0);

    const pendingEarnings = pendingVisits.reduce((sum, visit) => {
      const rate = therapistRates[visit.visit_type] || therapistRates['Follow Up'];
      return sum + rate;
    }, 0);

    // Métricas según lo solicitado por Doc Luis
    return {
      // Pagos pendientes
      pendingPayments: pendingEarnings,
      // Pagos completados SOLO de este mes
      completedPayments: completedEarningsThisMonth,
      // Total ganado (todo el tiempo) - donde antes decía "total billed"
      totalBilled: totalEarningsAllTime,
      completedVisitsCount: completedVisits.length,
      pendingVisitsCount: pendingVisits.length,
      averagePerVisit: completedVisits.length ? totalEarningsAllTime / completedVisits.length : 0,
      totalVisits: myVisits.length
    };
  };

  // Helper functions for month patient display
  const getMonthPatients = (month) => {
    if (!month || !myVisits.length) return [];
    
    // Get visits for the selected month
    const monthVisits = myVisits.filter(visit => {
      const visitDate = new Date(visit.visit_date);
      const visitMonthKey = `${visitDate.getFullYear()}-${String(visitDate.getMonth() + 1).padStart(2, '0')}`;
      return visitMonthKey === month.key;
    });
    
    // Group visits by patient
    const patientGroups = {};
    
    monthVisits.forEach(visit => {
      if (!patientGroups[visit.patient_id]) {
        patientGroups[visit.patient_id] = {
          patient_id: visit.patient_id,
          visits: [],
          totalEarnings: 0
        };
      }
      
      patientGroups[visit.patient_id].visits.push(visit);
      
      // Calculate earnings only for completed visits
      if (visit.status === 'completed') {
        const earnings = getVisitRevenue(visit.visit_type);
        patientGroups[visit.patient_id].totalEarnings += earnings;
      }
    });
    
    return Object.values(patientGroups).sort((a, b) => b.totalEarnings - a.totalEarnings);
  };

  const getVisitRevenue = (visitType) => {
    const therapistRates = {
      'Initial Evaluation': 110,
      'Follow Up': 85,
      'Re-evaluation': 95,
      'SOC OASIS': 120,
      'RA': 100,
      'DC': 80
    };
    
    return therapistRates[visitType] || therapistRates['Follow Up'];
  };

  const getPatientName = (patientId) => {
    // First try to find in real patient data
    const realPatient = myPatients.find(p => p.id === patientId);
    if (realPatient) {
      return `${realPatient.first_name} ${realPatient.last_name}`;
    }
    
    // Fallback to mock names for consistency with MonthlyBreakdown
    const patientNames = {
      101: 'Maria Rodriguez',
      102: 'Robert Johnson', 
      103: 'Eleanor Chen',
      104: 'John Smith',
      105: 'Sarah Williams',
      106: 'Michael Brown',
      107: 'Jennifer Davis',
      108: 'David Miller',
      109: 'Lisa Wilson',
      110: 'James Moore',
      111: 'Patricia Garcia',
      112: 'Christopher Martinez',
      113: 'Nancy Anderson',
      114: 'Matthew Taylor',
      115: 'Karen Thomas',
      116: 'Joshua Jackson',
      117: 'Betty White',
      118: 'Daniel Harris',
      119: 'Helen Martin',
      120: 'Mark Thompson'
    };
    
    return patientNames[patientId] || `Patient ${patientId}`;
  };

  const getPatientInitials = (patientId) => {
    const name = getPatientName(patientId);
    return name.split(' ').map(word => word[0]).join('');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  // Handlers
  const handlePatientClick = (patientId) => {
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'pt-ot-st';
    navigate(`/${baseRole}/paciente/${patientId}`);
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

  if (isLoading) {
    return (
      <div className="clinical-accounting">
        <div className="clinical-loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Your Financial Data...</div>
        </div>
      </div>
    );
  }

  const metrics = calculateTherapistMetrics();

  return (
    <motion.div 
      className="clinical-accounting"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Premium - Exact replica for therapist dashboard */}
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
            
            {/* Navigation buttons for therapist accounting */}
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
                title="My Financial Data"
              >
                <i className="fas fa-chart-pie"></i>
                <span>My Accounting</span>
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

      {/* Header Personal del Terapeuta */}
      <motion.header className="clinical-header" variants={itemVariants}>
        <div className="header-content">
          <div className="clinical-title">
            <h1>
              <i className="fas fa-user-md title-icon"></i>
              My Financial Dashboard
            </h1>
            <p className="subtitle">
              Personal earnings, visit tracking, and financial metrics for {therapistData?.role}
            </p>
            {therapistData && (
              <div className="therapist-info">
                <span className="therapist-detail">
                  <i className="fas fa-users"></i>
                  {therapistData.total_patients} Active Patients
                </span>
                <span className="therapist-detail">
                  <i className="fas fa-calendar-check"></i>
                  {myVisits.filter(v => v.status === 'completed').length} Visits This Month
                </span>
              </div>
            )}
          </div>
          
          <div className="header-actions">
            <button className="clinical-btn" onClick={() => navigate(`/${currentUser?.role?.split(' - ')[0].toLowerCase() || 'pt'}/profile`)}>
              <i className="fas fa-user"></i>
              My Profile
            </button>
            <button className="clinical-btn primary">
              <i className="fas fa-file-pdf"></i>
              Export Report
            </button>
          </div>
        </div>
      </motion.header>

      {/* Contenido Principal */}
      <div className="clinical-content">
        
        {/* Métricas Personales */}
        <motion.div variants={itemVariants}>
          <ClinicalMetrics 
            metrics={metrics}
            isLoading={false}
            showProfits={false}
            isTherapistView={true}
            title="My Earnings Overview"
          />
        </motion.div>

        {/* Breakdown Mensual Personal */}
        <motion.div variants={itemVariants} className="monthly-breakdown-expanded">
          <MonthlyBreakdown 
            visits={myVisits}
            onMonthSelect={setSelectedMonth}
            selectedMonth={selectedMonth}
            title="My Monthly Performance"
          />
        </motion.div>

        {/* Panel de Búsqueda Rápida de Pacientes */}
        <motion.div variants={itemVariants} className="patient-quick-access-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-search"></i>
              Quick Patient Access
            </h2>
            <span className="patient-count">{myPatients.length} Active Patients</span>
          </div>
          
          <div className="patient-search-panel">
            <div className="search-input-wrapper">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by name, diagnosis, or cert period..."
                className="patient-search-input"
                value={searchTerm}
                onChange={(e) => {
                  const term = e.target.value.toLowerCase();
                  setSearchTerm(e.target.value);
                  
                  if (term === '') {
                    setFilteredPatients([]);
                  } else {
                    const filtered = myPatients.filter(patient => 
                      patient.first_name.toLowerCase().includes(term) ||
                      patient.last_name.toLowerCase().includes(term) ||
                      patient.diagnosis.toLowerCase().includes(term)
                    );
                    setFilteredPatients(filtered.slice(0, 10)); // Show max 10 results
                  }
                }}
              />
            </div>
            
            <div className="quick-filters">
              <button 
                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                <i className="fas fa-users"></i>
                All Patients
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'attention' ? 'active' : ''}`}
                onClick={() => setActiveFilter('attention')}
              >
                <i className="fas fa-exclamation-circle"></i>
                Need Attention
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'week' ? 'active' : ''}`}
                onClick={() => setActiveFilter('week')}
              >
                <i className="fas fa-calendar-check"></i>
                This Week
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'ending' ? 'active' : ''}`}
                onClick={() => setActiveFilter('ending')}
              >
                <i className="fas fa-hourglass-end"></i>
                Ending Soon
              </button>
            </div>
            
            {searchTerm && filteredPatients.length > 0 && (
              <div className="search-results">
                <h3>Search Results ({filteredPatients.length})</h3>
                <div className="results-list">
                  {filteredPatients.map((patient) => (
                    <div 
                      key={patient.id} 
                      className="recent-patient-item"
                      onClick={() => handlePatientClick(patient.id)}
                    >
                      <div className="patient-quick-avatar">
                        {patient.first_name[0]}{patient.last_name[0]}
                      </div>
                      <div className="patient-quick-info">
                        <span className="patient-name">{patient.first_name} {patient.last_name}</span>
                        <span className="patient-meta">
                          {patient.diagnosis} • 
                          {new Date(patient.cert_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                          {new Date(patient.cert_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!searchTerm && !selectedMonth && (
              <div className="month-selection-prompt">
                <div className="prompt-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <h3>Select a Month to View Patients</h3>
                <p>Click on any month in the Monthly Performance section above to see which patients you worked with and how much you earned from each one.</p>
                <div className="prompt-features">
                  <div className="feature-item">
                    <i className="fas fa-users"></i>
                    <span>View patients by month</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-dollar-sign"></i>
                    <span>See earnings per patient</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-chart-bar"></i>
                    <span>Track visit history</span>
                  </div>
                </div>
              </div>
            )}
            
            {!searchTerm && selectedMonth && (
              <div className="selected-month-patients">
                <h3>Patients in {selectedMonth.name}</h3>
                <div className="month-patients-list">
                  {getMonthPatients(selectedMonth).map((patientData) => (
                    <div 
                      key={patientData.patient_id} 
                      className="month-patient-item"
                      onClick={() => handlePatientClick(patientData.patient_id)}
                    >
                      <div className="patient-month-avatar">
                        {getPatientInitials(patientData.patient_id)}
                      </div>
                      <div className="patient-month-info">
                        <span className="patient-name">{getPatientName(patientData.patient_id)}</span>
                        <span className="patient-meta">
                          {patientData.visits.length} visit{patientData.visits.length !== 1 ? 's' : ''} • 
                          {formatCurrency(patientData.totalEarnings)} earned
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {getMonthPatients(selectedMonth).length === 0 && (
                    <div className="no-month-patients">
                      <i className="fas fa-user-slash"></i>
                      <span>No patients had visits in {selectedMonth.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Panel de Productividad y Objetivos */}
        <motion.div variants={itemVariants} className="productivity-goals-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-chart-line"></i>
              My Productivity & Goals
            </h2>
          </div>
          
          <div className="productivity-content">
            <div className="productivity-card">
              <div className="productivity-icon">
                <i className="fas fa-calendar-week"></i>
              </div>
              <div className="productivity-info">
                <h3>This Week</h3>
                <div className="productivity-stats">
                  <div className="stat-item">
                    <span className="stat-value">18</span>
                    <span className="stat-label">Visits Completed</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">95%</span>
                    <span className="stat-label">On-Time Rate</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="productivity-card">
              <div className="productivity-icon">
                <i className="fas fa-trophy"></i>
              </div>
              <div className="productivity-info">
                <h3>Monthly Goal</h3>
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '75%'}}></div>
                  </div>
                  <span className="progress-text">75% Complete (60/80 visits)</span>
                </div>
              </div>
            </div>
            
            <div className="productivity-card">
              <div className="productivity-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="productivity-info">
                <h3>Average Session Time</h3>
                <div className="productivity-stats">
                  <div className="stat-item">
                    <span className="stat-value">52</span>
                    <span className="stat-label">Minutes per Visit</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">98%</span>
                    <span className="stat-label">Documentation Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Support Contact Section - Simplified */}
        <motion.div variants={itemVariants} className="support-contact-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-headset"></i>
              Need Help?
            </h2>
          </div>
          
          <div className="support-content">
            <div className="support-card">
              <div className="support-icon">
                <i className="fas fa-phone-alt"></i>
              </div>
              <div className="support-info">
                <h3>Call Support</h3>
                <p>Technical assistance and scheduling help</p>
                <a href="tel:+1-555-THERAPY" className="support-link">
                  +1 (555) THERAPY
                </a>
              </div>
            </div>
            
            <div className="support-card">
              <div className="support-icon">
                <i className="fas fa-user-tie"></i>
              </div>
              <div className="support-info">
                <h3>Contact Your CEO</h3>
                <p>For company-specific questions or concerns</p>
                <button className="support-ceo-btn" onClick={() => setShowCompanyContacts(true)}>
                  <i className="fas fa-building"></i>
                  View Company Contacts
                </button>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Modal de Perfil del Terapeuta */}
      <AnimatePresence>
        {showTherapistModal && therapistData && (
          <TherapistModal 
            therapist={therapistData}
            visits={myVisits}
            patients={myPatients}
            onClose={() => setShowTherapistModal(false)}
            onPatientClick={handlePatientClick}
            isPersonalView={true}
          />
        )}
      </AnimatePresence>

      {/* Company Contacts Modal */}
      <AnimatePresence>
        {showCompanyContacts && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCompanyContacts(false)}
          >
            <motion.div
              className="company-contacts-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  <i className="fas fa-building"></i>
                  Company Contacts
                </h2>
                <button className="close-btn" onClick={() => setShowCompanyContacts(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="modal-content">
                <div className="company-info">
                  <h3>Motive Home Care Administrators</h3>
                  <p>Contact your company administrators for assistance</p>
                </div>
                
                <div className="contacts-list">
                  <div className="contact-card">
                    <div className="contact-avatar">
                      <i className="fas fa-user-tie"></i>
                    </div>
                    <div className="contact-info">
                      <h4>John Smith</h4>
                      <p className="contact-role">CEO</p>
                      <div className="contact-details">
                        <a href="tel:+1555123456" className="contact-link">
                          <i className="fas fa-phone"></i>
                          +1 (555) 123-4567
                        </a>
                        <a href="mailto:john.smith@motivehomecare.com" className="contact-link">
                          <i className="fas fa-envelope"></i>
                          john.smith@motivehomecare.com
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="contact-card">
                    <div className="contact-avatar">
                      <i className="fas fa-user-tie"></i>
                    </div>
                    <div className="contact-info">
                      <h4>Sarah Johnson</h4>
                      <p className="contact-role">COO</p>
                      <div className="contact-details">
                        <a href="tel:+1555123458" className="contact-link">
                          <i className="fas fa-phone"></i>
                          +1 (555) 123-4568
                        </a>
                        <a href="mailto:sarah.johnson@motivehomecare.com" className="contact-link">
                          <i className="fas fa-envelope"></i>
                          sarah.johnson@motivehomecare.com
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="contact-card">
                    <div className="contact-avatar">
                      <i className="fas fa-user-tie"></i>
                    </div>
                    <div className="contact-info">
                      <h4>Michael Davis</h4>
                      <p className="contact-role">HR Director</p>
                      <div className="contact-details">
                        <a href="tel:+1555123459" className="contact-link">
                          <i className="fas fa-phone"></i>
                          +1 (555) 123-4569
                        </a>
                        <a href="mailto:michael.davis@motivehomecare.com" className="contact-link">
                          <i className="fas fa-envelope"></i>
                          michael.davis@motivehomecare.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Animation */}
      {isLoggingOut && <LogoutAnimation />}

    </motion.div>
  );
};

export default TherapistAccounting;