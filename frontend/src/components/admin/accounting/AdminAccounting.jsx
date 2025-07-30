import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../login/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../../../assets/LogoMHC.jpeg';
import LogoutAnimation from '../../LogOut/LogOut';
import '../../../styles/developer/accounting/ClinicalAccounting.scss';
import '../../../styles/Header/Header.scss';

// Importar sub-componentes (reutilizamos los de developer pero con lógica filtrada)
import ClinicalMetrics from '../../developer/accounting/ClinicalMetrics';
import MonthlyBreakdown from '../../developer/accounting/MonthlyBreakdown';
import DisciplineSelector from '../../developer/accounting/DisciplineSelector';
import TherapistModal from '../../developer/accounting/TherapistModal';
import AnalyticsView from './AnalyticsView';

/**
 * ADMIN ACCOUNTING - CEO VIEW
 * Vista limitada para CEOs de empresas cliente
 * Solo muestra datos de SU empresa específica
 * NO pueden ver otras empresas
 */
const AdminAccounting = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const userMenuRef = useRef(null);
  
  // Estados principales
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Estados para header y navegación
  const [menuTransitioning, setMenuTransitioning] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [financialData, setFinancialData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [showTherapistModal, setShowTherapistModal] = useState(false);
  
  // Estados para datos de API (filtrados por empresa)
  const [staff, setStaff] = useState([]);
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);

  // Funciones para manejar header y navegación
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const userData = {
    name: currentUser?.fullname || currentUser?.username || 'Administrator',
    avatar: getInitials(currentUser?.fullname || currentUser?.username || 'Administrator'),
    email: currentUser?.email || 'admin@company.com',
    role: currentUser?.role || 'Administrator',
    status: 'online'
  };

  const handleMainMenuTransition = () => {
    setMenuTransitioning(true);
    
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'administrator';
    
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
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'administrator';
    navigate(`/${baseRole}/profile`);
  };

  // Handle navigation to settings page
  const handleNavigateToSettings = () => {
    if (isLoggingOut) return;
    
    setShowUserMenu(false);
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'administrator';
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

  // Obtener información de la empresa del admin
  useEffect(() => {
    loadCompanyData();
    loadAgencies();
  }, []);

  // Función para cargar datos de la empresa específica
  const loadCompanyData = async () => {
    setIsLoading(true);
    
    try {
      // En un entorno real, esto vendría del token/contexto del usuario
      // Por ahora simulamos que cada admin tiene un company_id
      const companyId = getCurrentUserCompanyId();
      
      await Promise.all([
        loadCompanyInfo(companyId),
        loadCompanyStaff(companyId),
        loadCompanyPatients(companyId), 
        loadCompanyVisits(companyId)
      ]);
      
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
      
    } catch (error) {
      console.error('Error loading company data:', error);
      setIsLoading(false);
    }
  };

  // Obtener company_id del usuario actual
  const getCurrentUserCompanyId = () => {
    // En producción esto vendría del JWT token o contexto
    // Por ahora simulamos basado en el email del usuario
    const userEmail = currentUser?.email || '';
    
    if (userEmail.includes('motivecare') || userEmail.includes('motive')) {
      return 'motive-home-care';
    } else if (userEmail.includes('california')) {
      return 'california-ca';
    } else {
      return 'default-company'; // Empresa por defecto
    }
  };

  // Cargar información de la empresa
  const loadCompanyInfo = async (companyId) => {
    try {
      // En producción sería: /api/companies/${companyId}
      const mockCompanyInfo = {
        'motive-home-care': {
          id: 'motive-home-care',
          name: 'Motive Home Care',
          logo: null,
          established: '2020',
          location: 'California, USA'
        },
        'california-ca': {
          id: 'california-ca',
          name: 'California Care Services',
          logo: null,
          established: '2018',
          location: 'Los Angeles, CA'
        },
        'default-company': {
          id: 'default-company',
          name: 'Healthcare Services Inc.',
          logo: null,
          established: '2019',
          location: 'USA'
        }
      };
      
      setCompanyInfo(mockCompanyInfo[companyId] || mockCompanyInfo['default-company']);
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  };

  // Cargar staff de la empresa específica
  const loadCompanyStaff = async (companyId) => {
    try {
      const response = await fetch('http://localhost:8000/staff/');
      if (response.ok) {
        const allStaff = await response.json();
        // Filtrar por empresa (en producción habría un campo company_id)
        const companyStaff = allStaff.filter(s => 
          // Por ahora simulamos el filtro por email domain
          s.email.includes(companyId.replace('-', '')) || 
          s.email.includes('company') // Fallback
        );
        setStaff(companyStaff.length ? companyStaff : generateMockCompanyStaff(companyId));
      }
    } catch (error) {
      console.error('Error loading company staff:', error);
      setStaff(generateMockCompanyStaff(companyId));
    }
  };

  // Cargar pacientes de la empresa específica
  const loadCompanyPatients = async (companyId) => {
    try {
      const response = await fetch('http://localhost:8000/patients/');
      if (response.ok) {
        const allPatients = await response.json();
        // Filtrar por empresa (agency_id correspondería a la empresa)
        const companyPatients = allPatients.filter(p => 
          // En producción habría relación directa
          p.agency_name?.toLowerCase().includes(companyId.replace('-', ' '))
        );
        setPatients(companyPatients.length ? companyPatients : generateMockCompanyPatients(companyId));
      }
    } catch (error) {
      console.error('Error loading company patients:', error);
      setPatients(generateMockCompanyPatients(companyId));
    }
  };

  // Cargar visitas de la empresa específica
  const loadCompanyVisits = async (companyId) => {
    try {
      // En producción habría un endpoint: /api/visits/company/${companyId}
      setVisits(generateMockCompanyVisits(companyId));
    } catch (error) {
      console.error('Error loading company visits:', error);
      setVisits(generateMockCompanyVisits(companyId));
    }
  };

  // Generar datos simulados por empresa
  const generateMockCompanyStaff = (companyId) => {
    const baseStaff = [
      { id: 1, name: "Dr. Sarah Johnson", role: "PT", email: `sarah@${companyId}.com`, is_active: true },
      { id: 2, name: "Mike Rodriguez", role: "PTA", email: `mike@${companyId}.com`, is_active: true },
      { id: 3, name: "Lisa Chen", role: "OT", email: `lisa@${companyId}.com`, is_active: true },
      { id: 4, name: "Amanda Foster", role: "COTA", email: `amanda@${companyId}.com`, is_active: true },
      { id: 5, name: "David Wilson", role: "ST", email: `david@${companyId}.com`, is_active: true }
    ];
    
    // Personalizar por empresa
    if (companyId === 'motive-home-care') {
      return [
        ...baseStaff,
        { id: 6, name: "Jennifer Martinez", role: "STA", email: `jennifer@${companyId}.com`, is_active: true },
        { id: 7, name: "Robert Thompson", role: "PT", email: `robert@${companyId}.com`, is_active: true }
      ];
    }
    
    return baseStaff;
  };

  const generateMockCompanyPatients = (companyId) => {
    return [
      { id: 1, full_name: "John Smith", agency_id: 1, is_active: true, agency_name: companyInfo?.name },
      { id: 2, full_name: "Mary Johnson", agency_id: 1, is_active: true, agency_name: companyInfo?.name },
      { id: 3, full_name: "Robert Williams", agency_id: 1, is_active: true, agency_name: companyInfo?.name }
    ];
  };

  const generateMockCompanyVisits = (companyId) => {
    // Generar más o menos visitas basado en el tamaño de la empresa
    const visitCount = companyId === 'motive-home-care' ? 15 : 8;
    const visits = [];
    
    for (let i = 1; i <= visitCount; i++) {
      visits.push({
        id: i,
        patient_id: Math.ceil(Math.random() * 3),
        staff_id: Math.ceil(Math.random() * 5),
        visit_date: new Date(2025, 0, Math.ceil(Math.random() * 30)).toISOString().split('T')[0],
        visit_type: ['Initial Evaluation', 'Follow Up', 'SOC OASIS'][Math.floor(Math.random() * 3)],
        status: Math.random() > 0.3 ? 'completed' : 'pending',
        therapy_type: ['PT', 'OT', 'ST'][Math.floor(Math.random() * 3)]
      });
    }
    
    return visits;
  };

  // Calcular métricas financieras (similar a developer pero solo para esta empresa)
  const calculateFinancialMetrics = () => {
    if (!visits.length) return null;

    const completedVisits = visits.filter(v => v.status === 'completed');
    const pendingVisits = visits.filter(v => v.status === 'pending' || v.status === 'scheduled');

    const visitPrices = {
      'Initial Evaluation': { agency_pays: 130, therapist_receives: 110 },
      'Follow Up': { agency_pays: 110, therapist_receives: 55 },
      'SOC OASIS': { agency_pays: 150, therapist_receives: 120 }
    };

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

  // Handlers (similares a developer)
  const handleDisciplineSelect = (discipline) => {
    setSelectedDiscipline(discipline);
    setSelectedTherapist(null);
  };

  const handleTherapistSelect = (therapist) => {
    setSelectedTherapist(therapist);
    setShowTherapistModal(true);
  };

  const handlePatientClick = (patientId) => {
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'administrator';
    navigate(`/${baseRole}/paciente/${patientId}`);
  };

  // Función para cargar agencias
  const loadAgencies = async () => {
    try {
      const response = await fetch('http://localhost:8000/staff/');
      if (response.ok) {
        const allStaff = await response.json();
        const agencyData = allStaff.filter(s => s.role === 'Agency' || s.role === 'agency');
        setAgencies(agencyData.length ? agencyData : generateMockAgencies());
      }
    } catch (error) {
      console.error('Error loading agencies:', error);
      setAgencies(generateMockAgencies());
    }
  };

  // Generar agencias simuladas
  const generateMockAgencies = () => {
    return [
      { 
        id: 1, 
        name: 'Supportive Home Health', 
        email: 'contact@supportivehh.com',
        phone: '(323) 555-1234',
        address: '123 Healthcare Blvd, Los Angeles, CA 90001',
        patients_count: 12,
        active_since: '2021-03-15'
      },
      { 
        id: 2, 
        name: 'California Care Services', 
        email: 'info@calcare.com',
        phone: '(310) 555-5678',
        address: '456 Sunset Ave, Beverly Hills, CA 90210',
        patients_count: 8,
        active_since: '2020-11-20'
      },
      { 
        id: 3, 
        name: 'Golden State Health', 
        email: 'admin@goldenstate.com',
        phone: '(562) 555-9012',
        address: '789 Ocean Dr, Long Beach, CA 90802',
        patients_count: 15,
        active_since: '2019-08-10'
      }
    ];
  };

  // Función para imprimir
  const handlePrint = () => {
    // Crear una nueva ventana para imprimir
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent();
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Esperar a que se cargue el contenido antes de imprimir
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // Generar contenido para imprimir
  const generatePrintContent = () => {
    const metrics = calculateFinancialMetrics();
    const currentDate = new Date().toLocaleDateString();
    
    // Validar que metrics tenga valores por defecto
    const safeMetrics = {
      currentRevenue: metrics?.currentRevenue || 0,
      revenueGrowth: metrics?.revenueGrowth || 0,
      accountsReceivable: metrics?.accountsReceivable || 0,
      pendingVisits: metrics?.pendingVisits || 0,
      completedVisits: metrics?.completedVisits || 0
    };
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Financial Report - ${companyInfo?.name}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #2196f3;
              padding-bottom: 20px;
            }
            
            .print-header h1 {
              font-size: 28px;
              color: #2196f3;
              margin-bottom: 10px;
            }
            
            .print-header p {
              font-size: 16px;
              color: #666;
            }
            
            .print-date {
              text-align: right;
              margin-bottom: 20px;
              font-size: 14px;
              color: #666;
            }
            
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 30px;
              margin-bottom: 40px;
            }
            
            .metric-card {
              border: 1px solid #ddd;
              padding: 20px;
              border-radius: 8px;
              background: #f9f9f9;
            }
            
            .metric-title {
              font-size: 14px;
              color: #666;
              margin-bottom: 8px;
              text-transform: uppercase;
              font-weight: 600;
            }
            
            .metric-value {
              font-size: 32px;
              font-weight: 700;
              color: #2196f3;
              margin-bottom: 4px;
            }
            
            .metric-subtitle {
              font-size: 12px;
              color: #888;
            }
            
            .section {
              margin-bottom: 40px;
            }
            
            .section h2 {
              font-size: 20px;
              color: #333;
              margin-bottom: 20px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
            }
            
            .staff-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            
            .staff-table th,
            .staff-table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            
            .staff-table th {
              background-color: #2196f3;
              color: white;
              font-weight: 600;
            }
            
            .staff-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            
            .agencies-list {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
            
            .agency-item {
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 8px;
              background: #f9f9f9;
            }
            
            .agency-name {
              font-weight: 600;
              color: #2196f3;
              margin-bottom: 5px;
            }
            
            .agency-detail {
              font-size: 14px;
              color: #666;
              margin-bottom: 3px;
            }
            
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #888;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            
            @media print {
              body { -webkit-print-color-adjust: exact; }
              .metric-card { page-break-inside: avoid; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>${companyInfo?.name || 'Healthcare Company'} - Financial Report</h1>
            <p>Comprehensive Financial Overview and Business Metrics</p>
          </div>
          
          <div class="print-date">
            Generated on: ${currentDate}
          </div>
          
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-title">Current Month Revenue</div>
              <div class="metric-value">$${safeMetrics.currentRevenue.toLocaleString()}</div>
              <div class="metric-subtitle">Growth: ${safeMetrics.revenueGrowth}% vs last month</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-title">Accounts Receivable</div>
              <div class="metric-value">$${safeMetrics.accountsReceivable.toLocaleString()}</div>
              <div class="metric-subtitle">${safeMetrics.pendingVisits} pending visits</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-title">Completed Visits</div>
              <div class="metric-value">${safeMetrics.completedVisits}</div>
              <div class="metric-subtitle">This month</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-title">Active Staff</div>
              <div class="metric-value">${(staff || []).filter(s => s?.is_active).length}</div>
              <div class="metric-subtitle">Total: ${(staff || []).length} staff members</div>
            </div>
          </div>
          
          <div class="section">
            <h2>Active Staff by Role</h2>
            <table class="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${(staff || []).map(member => `
                  <tr>
                    <td>${member?.name || 'N/A'}</td>
                    <td>${member?.role || 'N/A'}</td>
                    <td>${member?.email || 'N/A'}</td>
                    <td>${member?.is_active ? 'Active' : 'Inactive'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2>Healthcare Agencies</h2>
            <div class="agencies-list">
              ${(agencies || []).map(agency => `
                <div class="agency-item">
                  <div class="agency-name">${agency?.name || 'N/A'}</div>
                  <div class="agency-detail">Email: ${agency?.email || 'N/A'}</div>
                  <div class="agency-detail">Phone: ${agency?.phone || 'N/A'}</div>
                  <div class="agency-detail">Patients: ${agency?.patients_count || 0}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="section">
            <h2>Recent Visits Summary</h2>
            <table class="staff-table">
              <thead>
                <tr>
                  <th>Visit Type</th>
                  <th>Count</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>SOC OASIS</td>
                  <td>${(visits || []).filter(v => v?.visit_type === 'SOC OASIS').length}</td>
                  <td>$${((visits || []).filter(v => v?.visit_type === 'SOC OASIS').length * 150).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Initial Evaluation</td>
                  <td>${(visits || []).filter(v => v?.visit_type === 'Initial Evaluation').length}</td>
                  <td>$${((visits || []).filter(v => v?.visit_type === 'Initial Evaluation').length * 130).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Follow Up</td>
                  <td>${(visits || []).filter(v => v?.visit_type === 'Follow Up').length}</td>
                  <td>$${((visits || []).filter(v => v?.visit_type === 'Follow Up').length * 110).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>This report was generated automatically by TherapySync™ Pro</p>
            <p>For questions or support, contact your system administrator</p>
          </div>
        </body>
      </html>
    `;
  };

  // Función para vista de analytics
  const handleAnalyticsView = () => {
    setShowAnalytics(true);
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
          <div className="loading-text">Loading Company Financial Data...</div>
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
      {/* Header Premium - Exact replica for admin dashboard */}
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
            
            {/* Navigation buttons for admin accounting */}
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

      {/* Header Clínico con información de la empresa */}
      <motion.header className="clinical-header" variants={itemVariants}>
        <div className="header-content">
          <div className="clinical-title">
            <h1>
              <i className="fas fa-building title-icon"></i>
              {companyInfo?.name} - Financial Dashboard
            </h1>
            <p className="subtitle">
              Financial overview and management for your healthcare practice
            </p>
            {companyInfo && (
              <div className="company-info">
                <span className="company-detail">
                  <i className="fas fa-calendar"></i>
                  Established {companyInfo.established}
                </span>
                <span className="company-detail">
                  <i className="fas fa-map-marker-alt"></i>
                  {companyInfo.location}
                </span>
              </div>
            )}
          </div>
          
          <div className="header-actions">
            <button className="clinical-btn" onClick={handlePrint}>
              <i className="fas fa-print"></i>
              Print Report
            </button>
            <button className="clinical-btn primary" onClick={handleAnalyticsView}>
              <i className="fas fa-chart-bar"></i>
              Analytics
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

        {/* Selector de Disciplinas con agencias */}
        <motion.div variants={itemVariants}>
          <DisciplineSelector 
            staff={staff}
            agencies={agencies} // Ahora los admin sí ven agencias
            visits={visits}
            selectedDiscipline={selectedDiscipline}
            onDisciplineSelect={handleDisciplineSelect}
            onTherapistSelect={handleTherapistSelect}
            onAgencySelect={(agency) => {
              setSelectedAgency(agency);
            }}
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

      {/* Modal de Analytics */}
      <AnimatePresence>
        {showAnalytics && (
          <AnalyticsView
            visits={visits}
            agencies={agencies}
            staff={staff}
            patients={patients}
            onClose={() => setShowAnalytics(false)}
          />
        )}
      </AnimatePresence>


      {/* Modal de Detalle de Agencia */}
      <AnimatePresence>
        {selectedAgency && (
          <motion.div 
            className="agency-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAgency(null)}
          >
            <motion.div 
              className="agency-detail-modal"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="detail-header">
                <button className="back-btn" onClick={() => setSelectedAgency(null)}>
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <h2>{selectedAgency.name}</h2>
              </div>

              <div className="detail-content">
                <div className="agency-info-section">
                  <h3>Agency Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Email:</label>
                      <span>{selectedAgency.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone:</label>
                      <span>{selectedAgency.phone}</span>
                    </div>
                    <div className="info-item">
                      <label>Address:</label>
                      <span>{selectedAgency.address}</span>
                    </div>
                    <div className="info-item">
                      <label>Active Since:</label>
                      <span>{new Date(selectedAgency.active_since).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pricing-section">
                  <h3>Service Pricing</h3>
                  <div className="pricing-grid">
                    <div className="price-card">
                      <h4>SOC OASIS</h4>
                      <p className="price">$150</p>
                      <p className="price-note">per evaluation</p>
                    </div>
                    <div className="price-card">
                      <h4>Initial Evaluation</h4>
                      <p className="price">$130</p>
                      <p className="price-note">per session</p>
                    </div>
                    <div className="price-card">
                      <h4>Follow Up</h4>
                      <p className="price">$110</p>
                      <p className="price-note">per visit</p>
                    </div>
                  </div>
                </div>

                <div className="patients-section">
                  <h3>Active Patients ({selectedAgency.patients_count})</h3>
                  <div className="patients-list">
                    {patients.filter(p => p.agency_name === selectedAgency.name).map(patient => (
                      <div key={patient.id} className="patient-row">
                        <div className="patient-info">
                          <h4>{patient.full_name}</h4>
                          <p>ID: #{patient.id}</p>
                        </div>
                        <div className="patient-services">
                          <span className="service-badge">PT</span>
                          <span className="service-price">$110/visit</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Animation */}
      {isLoggingOut && <LogoutAnimation />}

      <style jsx>{`
        .company-info {
          display: flex;
          gap: 24px;
          margin-top: 8px;
        }

        .company-detail {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #757575;
          font-weight: 500;
        }

        .company-detail i {
          color: #2196f3;
          width: 12px;
        }

        /* Estilos para modal de agencias */
        .agencies-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }

        .agencies-modal {
          background: white;
          width: 90%;
          max-width: 1000px;
          max-height: 85vh;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          padding: 24px 32px;
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.3s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .search-section {
          padding: 24px 32px;
          border-bottom: 1px solid #e0e0e0;
        }

        .search-box {
          position: relative;
          max-width: 500px;
        }

        .search-box i {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #757575;
        }

        .search-box input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s;
        }

        .search-box input:focus {
          outline: none;
          border-color: #2196f3;
        }

        .agencies-list {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .agency-card {
          background: #f5f5f5;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s;
          border: 2px solid transparent;
        }

        .agency-card:hover {
          background: white;
          border-color: #2196f3;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .agency-main-info h3 {
          margin: 0 0 12px 0;
          color: #333;
          font-size: 20px;
        }

        .agency-contact {
          margin: 4px 0;
          color: #666;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .agency-contact i {
          width: 16px;
          color: #2196f3;
        }

        .agency-stats {
          display: flex;
          gap: 24px;
          margin: 16px 0;
          padding: 16px 0;
          border-top: 1px solid #e0e0e0;
          border-bottom: 1px solid #e0e0e0;
        }

        .stat {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #2196f3;
        }

        .stat-label {
          font-size: 12px;
          color: #757575;
          margin-top: 4px;
        }

        .view-details-btn {
          width: 100%;
          padding: 12px;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .view-details-btn:hover {
          background: #1976d2;
        }

        /* Estilos para modal de detalle de agencia */
        .agency-detail-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1100;
          display: flex;
          justify-content: flex-end;
        }

        .agency-detail-modal {
          background: white;
          width: 600px;
          height: 100%;
          overflow-y: auto;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.2);
        }

        .detail-header {
          padding: 24px;
          background: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          gap: 16px;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .back-btn {
          padding: 8px 16px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          transition: all 0.3s;
        }

        .back-btn:hover {
          background: #f5f5f5;
        }

        .detail-header h2 {
          margin: 0;
          flex: 1;
        }

        .detail-content {
          padding: 24px;
        }

        .agency-info-section,
        .pricing-section,
        .patients-section {
          margin-bottom: 32px;
        }

        .agency-info-section h3,
        .pricing-section h3,
        .patients-section h3 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 18px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-item label {
          font-size: 12px;
          color: #757575;
          font-weight: 500;
        }

        .info-item span {
          font-size: 14px;
          color: #333;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .price-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          border: 2px solid #e0e0e0;
        }

        .price-card h4 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 16px;
        }

        .price {
          font-size: 32px;
          font-weight: 700;
          color: #2196f3;
          margin: 8px 0;
        }

        .price-note {
          font-size: 12px;
          color: #757575;
          margin: 0;
        }

        .patients-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .patient-row {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #e0e0e0;
        }

        .patient-info h4 {
          margin: 0 0 4px 0;
          color: #333;
          font-size: 16px;
        }

        .patient-info p {
          margin: 0;
          color: #757575;
          font-size: 14px;
        }

        .patient-services {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .service-badge {
          background: #e3f2fd;
          color: #1976d2;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
        }

        .service-price {
          color: #4caf50;
          font-weight: 600;
        }

        /* Estilos para impresión */
        @media print {
          .main-header,
          .header-actions,
          .clinical-btn,
          .view-details-btn,
          .back-btn,
          .close-btn {
            display: none !important;
          }

          .clinical-content {
            padding: 0;
          }

          .clinical-header {
            page-break-after: avoid;
          }
        }

        @media (max-width: 768px) {
          .company-info {
            flex-direction: column;
            gap: 8px;
          }

          .agencies-list {
            grid-template-columns: 1fr;
            padding: 16px;
          }

          .agency-detail-modal {
            width: 100%;
          }

          .pricing-grid {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default AdminAccounting;