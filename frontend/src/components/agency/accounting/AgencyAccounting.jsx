import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../login/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../../../assets/LogoMHC.jpeg';
import LogoutAnimation from '../../LogOut/LogOut';
import FloatingSupportButton from '../support/FloatingSupportButton';
import '../../../styles/developer/accounting/ClinicalAccounting.scss';
import '../../../styles/Header/Header.scss';

/**
 * AGENCY ACCOUNTING - BUSINESS PERSPECTIVE
 * Vista empresarial para agencias como Supportive Home Health
 * Enfoque: Facturación, cobros, performance de terapeutas asignados
 */
const AgencyAccounting = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const userMenuRef = useRef(null);
  
  // Estados principales
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedView, setSelectedView] = useState('patients'); // patients, overview, billing
  
  // Estados para header y navegación
  const [menuTransitioning, setMenuTransitioning] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Estados para datos de agencia
  const [agencyData, setAgencyData] = useState(null);
  const [monthlyPatients, setMonthlyPatients] = useState([]);
  const [assignedTherapists, setAssignedTherapists] = useState([]);
  const [billingData, setBillingData] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedPatientFilters, setSelectedPatientFilters] = useState([]);
  
  // Estados para dashboard mejorado de pacientes
  const [showAllPatients, setShowAllPatients] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [selectedTherapistFilter, setSelectedTherapistFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25); // 25 pacientes por página
  const [selectedPatientForVerification, setSelectedPatientForVerification] = useState(null);

  // Funciones para manejar header y navegación
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const userData = {
    name: currentUser?.fullname || currentUser?.username || 'Agency Admin',
    avatar: getInitials(currentUser?.fullname || currentUser?.username || 'Agency Admin'),
    email: currentUser?.email || 'admin@supportivehomehealth.com',
    role: currentUser?.role || 'Agency',
    status: 'online'
  };

  const handleMainMenuTransition = () => {
    setMenuTransitioning(true);
    
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'agency';
    
    setTimeout(() => {
      navigate(`/${baseRole}/homePage`);
    }, 300);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setShowUserMenu(false);
    
    document.body.classList.add('logging-out');
    
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 4000);
  };

  const handleNavigateToProfile = () => {
    if (isLoggingOut) return;
    
    setShowUserMenu(false);
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'agency';
    navigate(`/${baseRole}/profile`);
  };

  const handleNavigateToSettings = () => {
    if (isLoggingOut) return;
    
    setShowUserMenu(false);
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'agency';
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

  // Cargar datos de la agencia y establecer mes actual
  useEffect(() => {
    loadAgencyData();
    setCurrentMonth();
  }, []);

  // No establecer mes por defecto - dejar null para que el usuario seleccione
  const setCurrentMonth = () => {
    // Don't set a default month - user needs to select one
    setSelectedMonth(null);
  };

  const loadAgencyData = async () => {
    setIsLoading(true);
    
    try {
      // Simular carga de datos de agencia empresarial
      await Promise.all([
        loadAgencyFinancialData(),
        loadMonthlyPatientsData(),
        loadAssignedTherapistsData(),
        loadBillingInformation()
      ]);
      
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
      
    } catch (error) {
      console.error('Error loading agency data:', error);
      setIsLoading(false);
    }
  };

  // Cargar datos financieros principales de la agencia
  const loadAgencyFinancialData = async () => {
    // Datos simulados para agencia de 350+ pacientes mensualmente
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    setAgencyData({
      agencyName: 'Supportive Home Health',
      currentMonth: currentMonth,
      monthlyPatients: 350,
      totalRevenue: 42750, // 350 pacientes × promedio $122 por visita
      pendingCollections: 28900, // Dinero que deben pagar las insurance companies
      completedVisits: 892, // Total de visitas completadas este mes
      pendingVisits: 156, // Visitas programadas pero no completadas
      activeTherapists: 28, // Terapeutas actualmente asignados
      averageRevenuePerPatient: 122,
      collectionRate: 94.2, // % de pagos recibidos vs facturados
      monthlyGrowth: 8.7
    });
  };

  // Cargar pacientes asignados por mes
  const loadMonthlyPatientsData = async () => {
    // Real patient names with diverse backgrounds
    const patientNames = [
      "Emma Rodriguez", "Liam Chen", "Olivia Johnson", "Noah Williams", "Ava Martinez",
      "Isabella Garcia", "Lucas Anderson", "Sophia Thompson", "Mason Rodriguez", "Charlotte Davis",
      "Ethan Wilson", "Amelia Brown", "Alexander Jones", "Harper Miller", "Benjamin Taylor",
      "Evelyn Anderson", "Sebastian Garcia", "Abigail Thomas", "Michael Jackson", "Emily White",
      "Logan Harris", "Elizabeth Martin", "Daniel Thompson", "Sofia Gonzalez", "Matthew Lee",
      "Scarlett Walker", "Henry Hall", "Madison Young", "Joseph Allen", "Aria King",
      "Samuel Wright", "Luna Lopez", "David Hill", "Grace Scott", "Carter Green",
      "Chloe Adams", "Wyatt Baker", "Penelope Gonzalez", "John Nelson", "Layla Carter",
      "Jack Mitchell", "Riley Perez", "Luke Roberts", "Zoey Turner", "Gabriel Phillips",
      "Nora Campbell", "Anthony Parker", "Lily Evans", "Isaac Edwards", "Eleanor Collins",
      "Owen Stewart", "Hannah Sanchez", "Nathan Morris", "Lillian Rogers", "Caleb Reed",
      "Addison Cook", "Ryan Bailey", "Natalie Rivera", "Connor Cooper", "Leah Richardson",
      "Elijah Cox", "Hazel Howard", "Thomas Ward", "Violet Torres", "Charles Peterson",
      "Aurora Gray", "Christopher Ramirez", "Savannah James", "Daniel Watson", "Brooklyn Brooks",
      "Matthew Kelly", "Bella Sanders", "Andrew Price", "Claire Bennett", "Joshua Wood",
      "Lucy Barnes", "Christopher Ross", "Paisley Henderson", "Nicholas Coleman", "Naomi Jenkins"
    ];
    
    // Insurance providers with realistic reimbursement rates and authorization data
    const insuranceProviders = [
      { 
        name: 'Medicare', 
        reimbursementRate: 0.85, 
        processingDays: 14,
        authRequired: true,
        avgReimbursement: 120
      },
      { 
        name: 'Medicaid', 
        reimbursementRate: 0.75, 
        processingDays: 21,
        authRequired: true,
        avgReimbursement: 95
      },
      { 
        name: 'Blue Cross Blue Shield', 
        reimbursementRate: 0.90, 
        processingDays: 10,
        authRequired: false,
        avgReimbursement: 135
      },
      { 
        name: 'Aetna', 
        reimbursementRate: 0.88, 
        processingDays: 12,
        authRequired: false,
        avgReimbursement: 130
      },
      { 
        name: 'Humana', 
        reimbursementRate: 0.82, 
        processingDays: 18,
        authRequired: true,
        avgReimbursement: 115
      },
      { 
        name: 'United Healthcare', 
        reimbursementRate: 0.91, 
        processingDays: 9,
        authRequired: false,
        avgReimbursement: 140
      }
    ];
    
    const therapistNames = [
      "Sarah Johnson, PT", "Michael Rodriguez, OT", "Emily Chen, ST", 
      "David Williams, PTA", "Lisa Brown, COTA", "James Davis, STA",
      "Maria Garcia, PT", "Robert Miller, OT", "Jennifer Wilson, ST",
      "Christopher Moore, PTA", "Amanda Taylor, COTA", "Daniel Anderson, STA"
    ];

    // Generate realistic patient data
    const patientsData = [];
    const numPatients = Math.floor(Math.random() * 351) + 150;
    
    for (let i = 1; i <= numPatients; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
      
      const patientName = patientNames[Math.floor(Math.random() * patientNames.length)];
      const insurance = insuranceProviders[Math.floor(Math.random() * insuranceProviders.length)];
      const therapist = therapistNames[Math.floor(Math.random() * therapistNames.length)];
      const visitCount = Math.floor(Math.random() * 8) + 1;
      const completedVisits = Math.floor(visitCount * 0.8);
      const revenuePerVisit = insurance.avgReimbursement + Math.floor(Math.random() * 20) - 10;
      
      // Generate authorization number if required
      const authNumber = insurance.authRequired ? 
        `AUTH-${Math.random().toString(36).substr(2, 8).toUpperCase()}` : null;
      
      patientsData.push({
        id: 1000 + i,
        patientName: patientName,
        assignedTherapist: therapist,
        startDate: startDate.toISOString().split('T')[0],
        totalVisits: visitCount,
        completedVisits: completedVisits,
        pendingVisits: visitCount - completedVisits,
        revenuePerVisit: revenuePerVisit,
        totalRevenue: completedVisits * revenuePerVisit,
        status: completedVisits === visitCount ? 'Completed' : 'Active',
        insuranceProvider: insurance.name,
        insuranceDetails: {
          reimbursementRate: insurance.reimbursementRate,
          processingDays: insurance.processingDays,
          authorizationNumber: authNumber,
          authRequired: insurance.authRequired
        },
        paymentStatus: Math.random() > 0.3 ? 'Pending Payment' : 'Paid',
        billingInfo: {
          lastBillingDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          expectedPaymentDate: new Date(Date.now() + insurance.processingDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });
    }
    
    setMonthlyPatients(patientsData);
  };

  // Cargar terapeutas asignados y su performance
  const loadAssignedTherapistsData = async () => {
    const therapists = [
      { id: 1, name: "Sarah Johnson", discipline: "PT", patients: 18, completedVisits: 72, revenue: 8640, efficiency: 96.2 },
      { id: 2, name: "Michael Rodriguez", discipline: "OT", patients: 15, completedVisits: 58, revenue: 6960, efficiency: 94.8 },
      { id: 3, name: "Emily Chen", discipline: "ST", patients: 12, completedVisits: 45, revenue: 5400, efficiency: 97.1 },
      { id: 4, name: "David Williams", discipline: "PTA", patients: 16, completedVisits: 64, revenue: 7040, efficiency: 92.3 },
      { id: 5, name: "Lisa Brown", discipline: "COTA", patients: 14, completedVisits: 53, revenue: 6360, efficiency: 95.7 },
      { id: 6, name: "James Davis", discipline: "STA", patients: 11, completedVisits: 41, revenue: 4920, efficiency: 98.4 }
    ];
    
    setAssignedTherapists(therapists);
  };

  // Cargar información de facturación
  const loadBillingInformation = async () => {
    setBillingData({
      totalInvoiced: 42750,
      paidInvoices: 35200,
      pendingInvoices: 7550,
      overdueInvoices: 2100,
      averageCollectionTime: 28, // días
      thisMonthCollections: 35200,
      projectedCollections: 40650
    });
  };

  // Calcular métricas principales para agencia
  const calculateAgencyMetrics = () => {
    if (!agencyData) return null;

    return {
      // Total que deben pagar las insurance companies a la agencia
      totalCollections: agencyData.pendingCollections,
      // Visitas completadas este mes
      completedVisits: agencyData.completedVisits,
      // Visitas pendientes/programadas
      pendingVisits: agencyData.pendingVisits,
      // Métricas adicionales para agencia
      totalRevenue: agencyData.totalRevenue,
      monthlyPatients: agencyData.monthlyPatients,
      activeTherapists: agencyData.activeTherapists,
      collectionRate: agencyData.collectionRate
    };
  };

  // Handlers para navegación de vistas
  const handleViewChange = (view) => {
    setSelectedView(view);
  };

  // Handler para selección de mes
  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
  };

  // Obtener pacientes del mes seleccionado
  const getMonthPatients = (month) => {
    if (!month || !monthlyPatients.length) return monthlyPatients;
    
    // Filter patients based on their start date being in the selected month
    return monthlyPatients.filter(patient => {
      const startDate = new Date(patient.startDate);
      const patientMonthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      return patientMonthKey === month.key;
    });
  };

  // Calcular datos mensuales para el breakdown
  const getMonthlyBreakdownData = () => {
    if (!monthlyPatients.length) return [];
    
    // Group patients by month
    const monthlyGroups = {};
    
    monthlyPatients.forEach(patient => {
      const startDate = new Date(patient.startDate);
      const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = {
          key: monthKey,
          name: monthName,
          month: startDate.getMonth() + 1,
          year: startDate.getFullYear(),
          patients: [],
          totalRevenue: 0,
          totalVisits: 0,
          paidAmount: 0,
          pendingAmount: 0
        };
      }
      
      monthlyGroups[monthKey].patients.push(patient);
      monthlyGroups[monthKey].totalRevenue += patient.totalRevenue;
      monthlyGroups[monthKey].totalVisits += patient.completedVisits;
      
      if (patient.paymentStatus === 'Paid') {
        monthlyGroups[monthKey].paidAmount += patient.totalRevenue;
      } else {
        monthlyGroups[monthKey].pendingAmount += patient.totalRevenue;
      }
    });
    
    // Convert to array and sort by date
    const monthsArray = Object.values(monthlyGroups).sort((a, b) => {
      return new Date(a.year, a.month - 1) - new Date(b.year, b.month - 1);
    });
    
    // Calculate growth percentage
    return monthsArray.map((month, index) => {
      const previousMonth = monthsArray[index - 1];
      let growthPercentage = 0;
      
      if (previousMonth && previousMonth.totalRevenue > 0) {
        growthPercentage = ((month.totalRevenue - previousMonth.totalRevenue) / previousMonth.totalRevenue) * 100;
      }
      
      return {
        ...month,
        growthPercentage: Math.round(growthPercentage * 10) / 10,
        patientCount: month.patients.length
      };
    });
  };

  const handlePatientClick = (patientId) => {
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'agency';
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
          <div className="loading-text">Loading Agency Financial Data...</div>
        </div>
      </div>
    );
  }

  const metrics = calculateAgencyMetrics();

  return (
    <motion.div 
      className="clinical-accounting agency-accounting"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Premium */}
      <header className={`main-header ${isLoggingOut ? 'logging-out' : ''}`}>
        <div className="header-container">
          <div className="logo-container">
            <div className="logo-glow"></div>
            <img 
              src={logoImg} 
              alt="TherapySync Logo" 
              className="logo" 
              onClick={() => !isLoggingOut && handleMainMenuTransition()} 
            />
            
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
                title="Agency Financial Management"
              >
                <i className="fas fa-building"></i>
                <span>Agency Accounting</span>
              </button>
            </div>
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

      {/* Header de Agencia */}
      <motion.header className="clinical-header agency-header" variants={itemVariants}>
        <div className="header-content">
          <div className="clinical-title">
            <h1>
              <i className="fas fa-building title-icon"></i>
              {agencyData?.agencyName} - Financial Dashboard
            </h1>
            <p className="subtitle">
              Business management for {agencyData?.monthlyPatients} patients • {agencyData?.currentMonth}
            </p>
            {agencyData && (
              <div className="agency-info">
                <span className="agency-detail">
                  <i className="fas fa-users"></i>
                  {agencyData.activeTherapists} Active Therapists
                </span>
                <span className="agency-detail">
                  <i className="fas fa-chart-line"></i>
                  {agencyData.collectionRate}% Collection Rate
                </span>
                <span className="agency-detail">
                  <i className="fas fa-trending-up"></i>
                  +{agencyData.monthlyGrowth}% Growth
                </span>
              </div>
            )}
          </div>
          
          <div className="header-actions">
            <button className="clinical-btn">
              <i className="fas fa-file-invoice"></i>
              Generate Invoice
            </button>
            <button className="clinical-btn primary">
              <i className="fas fa-download"></i>
              Export Report
            </button>
          </div>
        </div>
      </motion.header>

      {/* Contenido Principal */}
      <div className="clinical-content agency-content">
        
        {/* Métricas Principales de Agencia */}
        <motion.div variants={itemVariants} className="agency-metrics-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-chart-bar"></i>
              Key Business Metrics
            </h2>
          </div>
          
          <div className="agency-metrics-grid">
            {/* Total a Cobrar */}
            <div className="agency-metric-card primary">
              <div className="metric-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="metric-content">
                <h3>Total Collections Due</h3>
                <div className="metric-value">
                  ${metrics?.totalCollections?.toLocaleString() || '0'}
                </div>
                <p className="metric-description">
                  Amount owed by insurance companies
                </p>
              </div>
            </div>

            {/* Visitas Completadas */}
            <div className="agency-metric-card success">
              <div className="metric-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="metric-content">
                <h3>Completed Visits</h3>
                <div className="metric-value">
                  {metrics?.completedVisits?.toLocaleString() || '0'}
                </div>
                <p className="metric-description">
                  Visits completed this month
                </p>
              </div>
            </div>

            {/* Visitas Pendientes */}
            <div className="agency-metric-card warning">
              <div className="metric-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="metric-content">
                <h3>Pending Visits</h3>
                <div className="metric-value">
                  {metrics?.pendingVisits?.toLocaleString() || '0'}
                </div>
                <p className="metric-description">
                  Scheduled visits remaining
                </p>
              </div>
            </div>

            {/* Pacientes Activos */}
            <div className="agency-metric-card info">
              <div className="metric-icon">
                <i className="fas fa-user-injured"></i>
              </div>
              <div className="metric-content">
                <h3>Active Patients</h3>
                <div className="metric-value">
                  {metrics?.monthlyPatients?.toLocaleString() || '0'}
                </div>
                <p className="metric-description">
                  Patients served this month
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Selector de Vistas */}
        <motion.div variants={itemVariants} className="view-selector-section">
          <div className="view-tabs">
            <button 
              className={`view-tab ${selectedView === 'patients' ? 'active' : ''}`}
              onClick={() => handleViewChange('patients')}
            >
              <i className="fas fa-users"></i>
              <span>Patients</span>
            </button>
            <button 
              className={`view-tab ${selectedView === 'overview' ? 'active' : ''}`}
              onClick={() => handleViewChange('overview')}
            >
              <i className="fas fa-chart-pie"></i>
              <span>Overview</span>
            </button>
            <button 
              className={`view-tab ${selectedView === 'billing' ? 'active' : ''}`}
              onClick={() => handleViewChange('billing')}
            >
              <i className="fas fa-file-invoice-dollar"></i>
              <span>Billing</span>
            </button>
          </div>
        </motion.div>

        {/* Vista de Contenido Dinámico */}
        <motion.div variants={itemVariants} className="dynamic-content">
          {selectedView === 'patients' && (
            <div className="patients-content">
              <div className="patients-header">
                <h3>
                  <i className="fas fa-users"></i>
                  Patient Management ({monthlyPatients.length} active patients)
                </h3>
              </div>
              
              {/* Resumen rápido de pacientes */}
              <div className="patients-summary">
                <div className="summary-grid">
                  <div className="summary-card">
                    <div className="summary-icon">
                      <i className="fas fa-heartbeat"></i>
                    </div>
                    <div className="summary-content">
                      <h4>Active Treatments</h4>
                      <div className="summary-value">{monthlyPatients.filter(p => p.status === 'Active').length}</div>
                      <p>Currently receiving therapy</p>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-icon">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <div className="summary-content">
                      <h4>Visits This Month</h4>
                      <div className="summary-value">{monthlyPatients.reduce((total, p) => total + p.completedVisits, 0)}</div>
                      <p>Total completed visits</p>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-icon">
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="summary-content">
                      <h4>Total Revenue</h4>
                      <div className="summary-value">${monthlyPatients.reduce((total, p) => total + p.totalRevenue, 0).toLocaleString()}</div>
                      <p>From patient treatments</p>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="summary-content">
                      <h4>Pending Visits</h4>
                      <div className="summary-value">{monthlyPatients.reduce((total, p) => total + p.pendingVisits, 0)}</div>
                      <p>Scheduled for completion</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Monthly Breakdown Section */}
              <div className="monthly-breakdown">
                <div className="section-header compact">
                  <div className="header-content">
                    <div className="header-icon">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="header-text">
                      <h2>Monthly Performance</h2>
                      <span className="header-subtitle">Select month to view patient details</span>
                    </div>
                  </div>
                </div>

                <motion.div 
                  className="months-grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {getMonthlyBreakdownData().map((month, index) => {
                    const isSelected = selectedMonth?.key === month.key;
                    const isCurrentMonth = new Date().getMonth() + 1 === month.month && 
                                          new Date().getFullYear() === month.year;
                    
                    return (
                      <motion.div
                        key={month.key}
                        className={`month-card premium ${isSelected ? 'selected' : ''} ${isCurrentMonth ? 'current' : ''}`}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          scale: 1.03,
                          y: -8,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleMonthSelect(month)}
                      >
                        {/* Premium gradient overlay */}
                        <div className="month-overlay"></div>
                        
                        {/* Premium glow effect */}
                        <div className="month-glow"></div>

                        <div className="month-header">
                          <div className="month-info">
                            <div className="month-title">
                              <h3 className="month-name">{month.name}</h3>
                              {isCurrentMonth && (
                                <div className="current-badge">
                                  <i className="fas fa-star"></i>
                                  <span>Current</span>
                                </div>
                              )}
                            </div>
                            <div className="month-revenue">
                              <span className="currency">$</span>
                              <span className="amount">{month.totalRevenue.toLocaleString()}</span>
                            </div>
                            
                            {month.growthPercentage !== 0 && (
                              <div className={`growth-badge ${month.growthPercentage > 0 ? 'positive' : 'negative'}`}>
                                <i className={`fas fa-arrow-${month.growthPercentage > 0 ? 'up' : 'down'}`}></i>
                                <span>{Math.abs(month.growthPercentage).toFixed(1)}%</span>
                                <small>{month.growthPercentage > 0 ? 'growth' : 'decline'}</small>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="month-stats">
                          <div className="stats-row">
                            <div className="stat-item compact">
                              <div className="stat-icon patients">
                                <i className="fas fa-user-friends"></i>
                              </div>
                              <div className="stat-content">
                                <div className="stat-value">{month.patientCount}</div>
                                <div className="stat-label">Patients</div>
                              </div>
                            </div>
                            
                            <div className="stat-item compact">
                              <div className="stat-icon visits">
                                <i className="fas fa-calendar-check"></i>
                              </div>
                              <div className="stat-content">
                                <div className="stat-value">{month.totalVisits}</div>
                                <div className="stat-label">Visits</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="stats-row">
                            <div className="stat-item compact success">
                              <div className="stat-icon paid">
                                <i className="fas fa-check-circle"></i>
                              </div>
                              <div className="stat-content">
                                <div className="stat-value">${(month.paidAmount / 1000).toFixed(0)}k</div>
                                <div className="stat-label">Collected</div>
                              </div>
                            </div>
                            
                            <div className="stat-item compact warning">
                              <div className="stat-icon pending">
                                <i className="fas fa-hourglass-half"></i>
                              </div>
                              <div className="stat-content">
                                <div className="stat-value">${(month.pendingAmount / 1000).toFixed(0)}k</div>
                                <div className="stat-label">Pending</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Selection indicator */}
                        {isSelected && (
                          <motion.div 
                            className="selection-indicator"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <i className="fas fa-check"></i>
                          </motion.div>
                        )}

                        {/* Hover effect overlay */}
                        <div className="hover-overlay"></div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
              
              {/* Patient List Section - Show only when month is selected */}
              {!selectedMonth && (
                <div className="month-selection-prompt">
                  <div className="prompt-content">
                    <div className="prompt-icon">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <h3>Select a Month to View Patients</h3>
                    <p>Click on any month in the Monthly Performance section above to see which patients received services and their financial details for that specific period.</p>
                    <div className="prompt-features">
                      <div className="feature-item">
                        <i className="fas fa-users"></i>
                        <span>View patients by month</span>
                      </div>
                      <div className="feature-item">
                        <i className="fas fa-dollar-sign"></i>
                        <span>Track monthly revenue</span>
                      </div>
                      <div className="feature-item">
                        <i className="fas fa-chart-line"></i>
                        <span>Monitor payment status</span>
                      </div>
                      <div className="feature-item">
                        <i className="fas fa-file-invoice"></i>
                        <span>Generate reports</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedMonth && (
                <div className="clinical-patient-dashboard">
                  {/* Clinical Header */}
                  <div className="clinical-dashboard-header">
                    <div className="dashboard-title">
                      <div className="title-icon">
                        <i className="fas fa-user-md"></i>
                      </div>
                      <div className="title-content">
                        <h3>Patient Registry - {selectedMonth.name}</h3>
                        <span className="subtitle">Financial Overview & Clinical Status</span>
                      </div>
                    </div>
                    <div className="dashboard-actions">
                      <button 
                        className="action-button secondary"
                        onClick={() => setSelectedMonth(null)}
                      >
                        <i className="fas fa-arrow-left"></i>
                        Back to Months
                      </button>
                    </div>
                  </div>

                  {/* Clinical Filters */}
                  <div className="clinical-filters">
                    <div className="filter-group">
                      <div className="search-field">
                        <div className="field-icon">
                          <i className="fas fa-search"></i>
                        </div>
                        <input
                          type="text"
                          placeholder="Search patient records..."
                          value={patientSearchTerm}
                          onChange={(e) => setPatientSearchTerm(e.target.value)}
                          className="clinical-input"
                        />
                      </div>
                      <div className="filter-field">
                        <div className="field-icon">
                          <i className="fas fa-stethoscope"></i>
                        </div>
                        <select
                          value={selectedTherapistFilter}
                          onChange={(e) => setSelectedTherapistFilter(e.target.value)}
                          className="clinical-select"
                        >
                          <option value="all">All Clinicians</option>
                          {[...new Set(getMonthPatients(selectedMonth).map(p => p.assignedTherapist))].map(therapist => (
                            <option key={therapist} value={therapist}>{therapist}</option>
                          ))}
                        </select>
                      </div>
                      <div className="filter-field">
                        <div className="field-icon">
                          <i className="fas fa-credit-card"></i>
                        </div>
                        <select
                          value={selectedStatusFilter}
                          onChange={(e) => setSelectedStatusFilter(e.target.value)}
                          className="clinical-select"
                        >
                          <option value="all">All Payment Status</option>
                          <option value="Pending Payment">Pending Reimbursement</option>
                          <option value="Paid">Reimbursed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Patient Cards */}
                  <div className="clinical-patient-grid">
                    {(() => {
                      // Only show patients from selected month
                      let filteredPatients = getMonthPatients(selectedMonth);
                      
                      // Apply search filter
                      if (patientSearchTerm) {
                        filteredPatients = filteredPatients.filter(patient => 
                          patient.patientName.toLowerCase().includes(patientSearchTerm.toLowerCase())
                        );
                      }
                      
                      // Apply therapist filter
                      if (selectedTherapistFilter !== 'all') {
                        filteredPatients = filteredPatients.filter(patient => 
                          patient.assignedTherapist === selectedTherapistFilter
                        );
                      }
                      
                      // Apply payment status filter
                      if (selectedStatusFilter !== 'all') {
                        filteredPatients = filteredPatients.filter(patient => 
                          patient.paymentStatus === selectedStatusFilter
                        );
                      }
                      
                      // Pagination
                      const startIndex = showAllPatients ? (currentPage - 1) * itemsPerPage : 0;
                      const endIndex = showAllPatients ? startIndex + itemsPerPage : 12;
                      const paginatedPatients = filteredPatients.slice(startIndex, endIndex);
                      
                      if (paginatedPatients.length === 0) {
                        return (
                          <div className="no-patients-found">
                            <div className="no-results-icon">
                              <i className="fas fa-user-slash"></i>
                            </div>
                            <h4>No Patients Found</h4>
                            <p>No patients match your current search criteria for {selectedMonth.name}</p>
                          </div>
                        );
                      }
                      
                      return paginatedPatients.map((patient, index) => (
                        <motion.div
                          key={patient.id}
                          className="clinical-patient-card"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          onClick={() => handlePatientClick(patient.id)}
                        >
                          {/* Patient Header */}
                          <div className="patient-header">
                            <div className="patient-avatar">
                              <div className="avatar-circle">
                                <i className="fas fa-user"></i>
                              </div>
                              <div className="patient-status-indicator">
                                <div className={`status-dot ${patient.status.toLowerCase()}`}></div>
                              </div>
                            </div>
                            <div className="patient-identity">
                              <h4 className="patient-name">{patient.patientName}</h4>
                              <div className="patient-meta">
                                <span className="patient-id">ID: {patient.id}</span>
                                <span className="care-period">Active Care</span>
                              </div>
                            </div>
                            <div className="patient-priority">
                              <div className={`payment-badge ${patient.paymentStatus === 'Paid' ? 'paid' : 'pending'}`}>
                                <i className={`fas ${patient.paymentStatus === 'Paid' ? 'fa-check-circle' : 'fa-clock'}`}></i>
                                <span>{patient.paymentStatus === 'Paid' ? 'Reimbursed' : 'Pending'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Clinical Information */}
                          <div className="clinical-info">
                            <div className="info-row">
                              <div className="info-item">
                                <div className="info-icon therapist">
                                  <i className="fas fa-user-nurse"></i>
                                </div>
                                <div className="info-content">
                                  <span className="info-label">Primary Clinician</span>
                                  <span className="info-value">{patient.assignedTherapist}</span>
                                </div>
                              </div>
                              <div className="info-item">
                                <div className="info-icon insurance">
                                  <i className="fas fa-shield-alt"></i>
                                </div>
                                <div className="info-content">
                                  <span className="info-label">Insurance Provider</span>
                                  <span className="info-value">{patient.insuranceProvider}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="info-row">
                              <div className="info-item">
                                <div className="info-icon visits">
                                  <i className="fas fa-calendar-check"></i>
                                </div>
                                <div className="info-content">
                                  <span className="info-label">Treatment Sessions</span>
                                  <span className="info-value">{patient.completedVisits} completed</span>
                                </div>
                              </div>
                              <div className="info-item">
                                <div className="info-icon revenue">
                                  <i className="fas fa-dollar-sign"></i>
                                </div>
                                <div className="info-content">
                                  <span className="info-label">Total Reimbursement</span>
                                  <span className="info-value">${patient.totalRevenue.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Financial Summary */}
                          <div className="financial-summary">
                            <div className="summary-item">
                              <span className="summary-label">Per Session Rate</span>
                              <span className="summary-value">${patient.revenuePerVisit}</span>
                            </div>
                            <div className="summary-item">
                              <span className="summary-label">Expected Payment</span>
                              <span className="summary-value">{patient.billingInfo?.expectedPaymentDate ? 
                                new Date(patient.billingInfo.expectedPaymentDate).toLocaleDateString() : 'Processing'}</span>
                            </div>
                            {patient.insuranceDetails?.authorizationNumber && (
                              <div className="summary-item">
                                <span className="summary-label">Auth #</span>
                                <span className="summary-value auth-number">{patient.insuranceDetails.authorizationNumber}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Bar */}
                          <div className="patient-actions">
                            <button 
                              className="action-button primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatientForVerification(patient);
                              }}
                              title="Review Clinical Records"
                            >
                              <i className="fas fa-file-medical"></i>
                              Review
                            </button>
                            {patient.paymentStatus === 'Pending Payment' && (
                              <button 
                                className="action-button success"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updatedPatients = monthlyPatients.map(p => 
                                    p.id === patient.id ? { ...p, paymentStatus: 'Paid' } : p
                                  );
                                  setMonthlyPatients(updatedPatients);
                                }}
                                title="Mark as Reimbursed"
                              >
                                <i className="fas fa-check-double"></i>
                                Mark Paid
                              </button>
                            )}
                            <button 
                              className="action-button secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Generate report functionality
                              }}
                              title="Generate Financial Report"
                            >
                              <i className="fas fa-chart-bar"></i>
                              Report
                            </button>
                          </div>
                        </motion.div>
                      ));
                    })()}
                  </div>

                  {/* Clinical Pagination */}
                  {!showAllPatients && getMonthPatients(selectedMonth).length > 12 && (
                    <div className="clinical-pagination">
                      <div className="pagination-info">
                        <span>Showing {Math.min(12, getMonthPatients(selectedMonth).length)} of {getMonthPatients(selectedMonth).length} patients</span>
                      </div>
                      <button 
                        className="action-button primary"
                        onClick={() => setShowAllPatients(true)}
                      >
                        <i className="fas fa-expand-arrows-alt"></i>
                        View All Patients
                      </button>
                    </div>
                  )}

                  {showAllPatients ? (
                    <div className="pagination-controls">
                      <div className="pagination-info">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, getMonthPatients(selectedMonth).length)} of {getMonthPatients(selectedMonth).length} patients
                      </div>
                      <div className="pagination-buttons">
                        <button 
                          className="pagination-btn"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <i className="fas fa-chevron-left"></i>
                          Previous
                        </button>
                        
                        {/* Números de página */}
                        {(() => {
                          const totalPages = Math.ceil(getMonthPatients(selectedMonth).length / itemsPerPage);
                          const pageNumbers = [];
                          const maxVisiblePages = 5;
                          
                          let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                          let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                          
                          if (endPage - startPage + 1 < maxVisiblePages) {
                            startPage = Math.max(1, endPage - maxVisiblePages + 1);
                          }
                          
                          for (let i = startPage; i <= endPage; i++) {
                            pageNumbers.push(
                              <button
                                key={i}
                                className={`page-number ${currentPage === i ? 'active' : ''}`}
                                onClick={() => setCurrentPage(i)}
                              >
                                {i}
                              </button>
                            );
                          }
                          
                          return pageNumbers;
                        })()}
                        
                        <button 
                          className="pagination-btn"
                          onClick={() => setCurrentPage(Math.min(Math.ceil(getMonthPatients(selectedMonth).length / itemsPerPage), currentPage + 1))}
                          disabled={currentPage >= Math.ceil(getMonthPatients(selectedMonth).length / itemsPerPage)}
                        >
                          Next
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                      <div className="view-controls">
                        <button 
                          className="clinical-btn secondary"
                          onClick={() => {
                            setShowAllPatients(false);
                            setCurrentPage(1);
                            setPatientSearchTerm('');
                            setSelectedTherapistFilter('all');
                            setSelectedStatusFilter('all');
                          }}
                        >
                          <i className="fas fa-compress"></i>
                          Compact View
                        </button>
                      </div>
                    </div>
                  ) : (
                    getMonthPatients(selectedMonth).length > 12 && (
                      <div className="load-more">
                        <button 
                          className="clinical-btn"
                          onClick={() => setShowAllPatients(true)}
                        >
                          <i className="fas fa-expand"></i>
                          View All {getMonthPatients(selectedMonth).length} Patients
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {selectedView === 'overview' && (
            <div className="overview-content">
              <h3>
                <i className="fas fa-chart-line"></i>
                Business Performance Overview
              </h3>
              
              <div className="overview-grid">
                <div className="overview-section">
                  <h4>Top Performing Patients (Revenue)</h4>
                  <div className="top-patients-list">
                    {monthlyPatients
                      .sort((a, b) => b.totalRevenue - a.totalRevenue)
                      .slice(0, 5)
                      .map((patient, index) => (
                        <div key={patient.id} className="top-patient-item">
                          <div className="rank">#{index + 1}</div>
                          <div className="patient-info">
                            <span className="name">{patient.patientName}</span>
                            <span className="therapist">{patient.assignedTherapist}</span>
                          </div>
                          <div className="revenue">${patient.totalRevenue.toLocaleString()}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
                
                <div className="overview-section">
                  <h4>Therapist Distribution</h4>
                  <div className="therapist-distribution">
                    {assignedTherapists.slice(0, 6).map(therapist => (
                      <div key={therapist.id} className="therapist-item">
                        <div className="therapist-name">{therapist.name}</div>
                        <div className="patient-count">{therapist.patients} patients</div>
                        <div className="revenue-bar">
                          <div 
                            className="revenue-fill" 
                            style={{ width: `${(therapist.revenue / 10000) * 100}%` }}
                          ></div>
                        </div>
                        <div className="revenue-amount">${therapist.revenue.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedView === 'billing' && (
            <div className="billing-content">
              <h3>
                <i className="fas fa-file-invoice-dollar"></i>
                Monthly Billing & Collections
              </h3>
              
              <div className="billing-summary">
                <div className="billing-metrics">
                  <div className="billing-metric">
                    <h4>Total Invoiced This Month</h4>
                    <div className="metric-value">${billingData?.totalInvoiced?.toLocaleString() || '0'}</div>
                  </div>
                  <div className="billing-metric">
                    <h4>Collections Received</h4>
                    <div className="metric-value paid">${billingData?.paidInvoices?.toLocaleString() || '0'}</div>
                  </div>
                  <div className="billing-metric">
                    <h4>Outstanding Balance</h4>
                    <div className="metric-value pending">${billingData?.pendingInvoices?.toLocaleString() || '0'}</div>
                  </div>
                  <div className="billing-metric">
                    <h4>Overdue Amounts</h4>
                    <div className="metric-value overdue">${billingData?.overdueInvoices?.toLocaleString() || '0'}</div>
                  </div>
                </div>
              </div>
              
              <div className="monthly-invoices">
                <h4>Monthly Invoice Breakdown</h4>
                <div className="invoice-table">
                  <div className="invoice-header">
                    <span>Month</span>
                    <span>Patients Served</span>
                    <span>Total Visits</span>
                    <span>Amount Invoiced</span>
                    <span>Amount Collected</span>
                    <span>Outstanding</span>
                    <span>Collection Rate</span>
                  </div>
                  {[
                    { month: 'July 2024', patients: monthlyPatients.length, visits: 892, invoiced: 42750, collected: 35200, outstanding: 7550, rate: 82.3 },
                    { month: 'June 2024', patients: 328, visits: 834, invoiced: 41200, collected: 39800, outstanding: 1400, rate: 96.6 },
                    { month: 'May 2024', patients: 315, visits: 798, invoiced: 39900, collected: 38950, outstanding: 950, rate: 97.6 },
                    { month: 'April 2024', patients: 302, visits: 765, invoiced: 38250, collected: 38250, outstanding: 0, rate: 100 },
                    { month: 'March 2024', patients: 295, visits: 742, invoiced: 37100, collected: 37100, outstanding: 0, rate: 100 }
                  ].map((invoice, index) => (
                    <div key={index} className="invoice-row">
                      <span className="month">{invoice.month}</span>
                      <span className="patients">{invoice.patients}</span>
                      <span className="visits">{invoice.visits}</span>
                      <span className="invoiced">${invoice.invoiced.toLocaleString()}</span>
                      <span className="collected">${invoice.collected.toLocaleString()}</span>
                      <span className="outstanding">${invoice.outstanding.toLocaleString()}</span>
                      <span className={`rate ${invoice.rate === 100 ? 'perfect' : invoice.rate > 95 ? 'excellent' : 'good'}`}>
                        {invoice.rate}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

      </div>

      {/* Premium Visit Verification Modal */}
      {selectedPatientForVerification && (
        <div className="verification-modal-overlay" onClick={() => setSelectedPatientForVerification(null)}>
          <div className="verification-modal" onClick={(e) => e.stopPropagation()}>
            {/* Enhanced Header with Patient Avatar */}
            <div className="modal-header">
              <div className="patient-header-info">
                <div className="patient-avatar">
                  <div className="avatar-circle">
                    {selectedPatientForVerification.patientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="patient-status-indicator">
                    <i className="fas fa-heartbeat"></i>
                  </div>
                </div>
                <div className="patient-title">
                  <h2>Visit Verification</h2>
                  <h3>{selectedPatientForVerification.patientName}</h3>
                  <span className="patient-id">ID: #{selectedPatientForVerification.id}</span>
                </div>
              </div>
              <button 
                className="close-modal-btn"
                onClick={() => setSelectedPatientForVerification(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-content">
              {/* Premium Summary Cards */}
              <div className="verification-summary-grid">
                <div className="summary-card therapist-card">
                  <div className="card-icon">
                    <i className="fas fa-user-md"></i>
                  </div>
                  <div className="card-content">
                    <h4>Assigned Therapist</h4>
                    <p>{selectedPatientForVerification.assignedTherapist}</p>
                  </div>
                </div>
                
                <div className="summary-card insurance-card">
                  <div className="card-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div className="card-content">
                    <h4>Insurance Provider</h4>
                    <p>{selectedPatientForVerification.insuranceProvider}</p>
                    <span className="insurance-details">
                      {Math.round(selectedPatientForVerification.reimbursementRate * 100)}% reimbursement
                    </span>
                  </div>
                </div>
                
                <div className="summary-card visits-card">
                  <div className="card-icon">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <div className="card-content">
                    <h4>Visit Progress</h4>
                    <p>
                      <span className="visits-completed">{selectedPatientForVerification.completedVisits}</span>
                      <span className="visits-separator"> of </span>
                      <span className="visits-total">{selectedPatientForVerification.totalVisits}</span>
                      <span className="visits-label"> completed</span>
                    </p>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{
                          width: `${(selectedPatientForVerification.completedVisits / selectedPatientForVerification.totalVisits) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className={`summary-card payment-card ${selectedPatientForVerification.paymentStatus === 'Paid' ? 'paid' : 'pending'}`}>
                  <div className="card-icon">
                    <i className={`fas fa-${selectedPatientForVerification.paymentStatus === 'Paid' ? 'check-circle' : 'clock'}`}></i>
                  </div>
                  <div className="card-content">
                    <h4>Payment Status</h4>
                    <p className="payment-status">
                      {selectedPatientForVerification.paymentStatus}
                    </p>
                    <span className="payment-amount">
                      ${selectedPatientForVerification.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Premium Visit Timeline */}
              <div className="visits-timeline-section">
                <div className="section-header">
                  <h4>
                    <i className="fas fa-history"></i>
                    Visit History & Timeline
                  </h4>
                  <span className="timeline-stats">
                    {selectedPatientForVerification.completedVisits} completed • {selectedPatientForVerification.totalVisits - selectedPatientForVerification.completedVisits} pending
                  </span>
                </div>
                
                <div className="visits-timeline">
                  {(() => {
                    const visits = [];
                    for (let i = 1; i <= selectedPatientForVerification.totalVisits; i++) {
                      const isCompleted = i <= selectedPatientForVerification.completedVisits;
                      const visitDate = new Date();
                      visitDate.setDate(visitDate.getDate() - (selectedPatientForVerification.totalVisits - i) * 3);
                      
                      visits.push(
                        <div key={i} className={`timeline-item ${isCompleted ? 'completed' : 'pending'}`}>
                          <div className="timeline-marker">
                            <div className="marker-dot">
                              <i className={`fas fa-${isCompleted ? 'check' : 'clock'}`}></i>
                            </div>
                            {i < selectedPatientForVerification.totalVisits && <div className="timeline-line"></div>}
                          </div>
                          
                          <div className="timeline-content">
                            <div className="visit-header">
                              <h5>Visit #{i}</h5>
                              <span className={`visit-badge ${isCompleted ? 'completed' : 'pending'}`}>
                                {isCompleted ? 'Completed' : 'Scheduled'}
                              </span>
                            </div>
                            
                            <div className="visit-details">
                              <div className="visit-date">
                                <i className="fas fa-calendar"></i>
                                <span>{isCompleted ? visitDate.toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                }) : 'To be scheduled'}</span>
                              </div>
                              
                              {isCompleted && (
                                <div className="visit-revenue">
                                  <i className="fas fa-dollar-sign"></i>
                                  <span>${selectedPatientForVerification.revenuePerVisit}</span>
                                </div>
                              )}
                              
                              <div className="visit-type">
                                <i className="fas fa-clipboard-list"></i>
                                <span>{i === 1 ? 'Initial Evaluation' : 'Follow-up Session'}</span>
                              </div>
                            </div>
                            
                            {isCompleted && (
                              <div className="visit-notes">
                                <i className="fas fa-sticky-note"></i>
                                <span>Session completed successfully. Patient showing good progress.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return visits;
                  })()}
                </div>
              </div>
              
              {/* Premium Action Buttons */}
              <div className="verification-actions-premium">
                {selectedPatientForVerification.paymentStatus === 'Pending Payment' && (
                  <button 
                    className="premium-btn mark-paid-btn"
                    onClick={() => {
                      const updatedPatients = monthlyPatients.map(p => 
                        p.id === selectedPatientForVerification.id ? { ...p, paymentStatus: 'Paid' } : p
                      );
                      setMonthlyPatients(updatedPatients);
                      setSelectedPatientForVerification(null);
                    }}
                  >
                    <div className="btn-icon">
                      <i className="fas fa-credit-card"></i>
                    </div>
                    <div className="btn-content">
                      <span className="btn-title">Mark as Paid</span>
                      <span className="btn-subtitle">Update payment status</span>
                    </div>
                  </button>
                )}
                
                <button 
                  className="premium-btn export-btn"
                  onClick={() => {
                    // Enhanced export functionality
                    console.log('Exporting patient data:', selectedPatientForVerification);
                  }}
                >
                  <div className="btn-icon">
                    <i className="fas fa-file-export"></i>
                  </div>
                  <div className="btn-content">
                    <span className="btn-title">Export Report</span>
                    <span className="btn-subtitle">Download visit history</span>
                  </div>
                </button>
                
                <button 
                  className="premium-btn contact-btn"
                  onClick={() => {
                    console.log('Opening contact for:', selectedPatientForVerification.assignedTherapist);
                  }}
                >
                  <div className="btn-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="btn-content">
                    <span className="btn-title">Contact Therapist</span>
                    <span className="btn-subtitle">Get in touch</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Animation */}
      {isLoggingOut && <LogoutAnimation />}

      {/* Floating Support Button */}
      <FloatingSupportButton />

    </motion.div>
  );
};

export default AgencyAccounting;