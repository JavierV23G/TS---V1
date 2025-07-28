import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../login/AuthContext';
import '../../../styles/developer/Welcome/InfoWelcome.scss';

const DevInfoWelcome = ({ isMobile, isTablet }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Enhanced state for animations with performance optimizations
  const [animatedStats, setAnimatedStats] = useState({
    activeClients: 0,
    revenue: 0,
    completedSessions: 0
  });
  const [activeCard, setActiveCard] = useState(null);
  const [neonPosition, setNeonPosition] = useState(0);
  const [cardRefs] = useState({
    patients: useRef(null),
    finance: useRef(null),
    learning: useRef(null)
  });
  
  // API States
  const [patients, setPatients] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [error, setError] = useState(null);
  
  // Calculate statistics for SaaS platform
  const [stats, setStats] = useState({
    activeClients: 0, // Agencias activas usando la plataforma
    totalClients: 0,  // Total de agencias registradas
    monthlyRevenue: 0, // Ingresos mensuales de suscripciones
    pendingPayments: 0, // Pagos pendientes de agencias
    totalRevenue: 0,
    completedSessions: 0
  });
  
  // SaaS Platform Financial Data - Developer Revenue Model
  const [platformData, setPlatformData] = useState({
    // Datos estáticos para desarrollo - luego será dinámico
    activeAgencies: 1, // Motive Home Care por ahora
    totalAgencies: 3,  // Motive + 2 en proceso de onboarding
    monthlySubscriptionRate: 100, // $100 por agencia por mes
    currentMonthRevenue: 100, // 1 agencia × $100
    totalRevenue: 1200, // 12 meses × $100 (ejemplo)
    pendingPayments: 200, // Pagos atrasados
    revenueGrowth: 25, // Crecimiento del 25%
    platformUsers: 350, // Total users across all agencies
    completedSessions: 145
  });

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  // Function to fetch platform statistics for SaaS dashboard
  const fetchPlatformStats = async () => {
    try {
      setIsLoadingPatients(true);
      setError(null);
      
      // En el futuro, esto será una API que traiga estadísticas de la plataforma
      // Por ahora usamos datos simulados basados en la realidad actual
      
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos realistas actuales de TherapySync
      const platformStats = {
        activeAgencies: platformData.activeAgencies,
        totalAgencies: platformData.totalAgencies,
        monthlyRevenue: platformData.currentMonthRevenue,
        totalRevenue: platformData.totalRevenue,
        pendingPayments: platformData.pendingPayments,
        platformUsers: platformData.platformUsers,
        completedSessions: platformData.completedSessions
      };
      
      console.log('Platform stats loaded:', platformStats);
      
      setStats({
        activeClients: platformStats.activeAgencies,
        totalClients: platformStats.totalAgencies,
        monthlyRevenue: platformStats.monthlyRevenue,
        pendingPayments: platformStats.pendingPayments,
        totalRevenue: platformStats.totalRevenue,
        completedSessions: platformStats.completedSessions
      });
      
    } catch (err) {
      console.error('Error fetching platform stats:', err);
      setError(err.message);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  // Calculate platform revenue and client metrics
  useEffect(() => {
    // Calcular métricas en tiempo real de la plataforma SaaS
    const calculatePlatformMetrics = () => {
      const currentMonthRevenue = platformData.activeAgencies * platformData.monthlySubscriptionRate;
      const projectedAnnualRevenue = currentMonthRevenue * 12;
      
      console.log('Platform SaaS Metrics:', {
        activeAgencies: platformData.activeAgencies,
        monthlyRate: platformData.monthlySubscriptionRate,
        currentMonthRevenue,
        projectedAnnualRevenue
      });
      
      return {
        activeClients: platformData.activeAgencies,
        totalClients: platformData.totalAgencies,
        monthlyRevenue: currentMonthRevenue,
        totalRevenue: platformData.totalRevenue,
        pendingPayments: platformData.pendingPayments,
        completedSessions: platformData.completedSessions
      };
    };
    
    const metrics = calculatePlatformMetrics();
    setStats(metrics);
  }, [platformData]);

  // Fetch platform stats on component mount
  useEffect(() => {
    fetchPlatformStats();
    
    // Refresh platform data every 5 minutes
    const interval = setInterval(() => {
      fetchPlatformStats();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Enhanced counter animation with optimized timing for mobile
  useEffect(() => {
    // Shorter animation duration on mobile for better UX
    const duration = isMobile ? 1800 : 2500;
    // Fewer steps on mobile for better performance
    const steps = isMobile ? 30 : 50;
    const stepTime = duration / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += 1;
      const progress = current / steps;
      
      // Custom easing function with lighter computation for mobile
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedStats({
        activeClients: Math.round(eased * stats.activeClients),
        revenue: Math.round(eased * stats.totalRevenue),
        completedSessions: Math.round(eased * stats.completedSessions)
      });
      
      if (current >= steps) {
        clearInterval(timer);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [stats, isMobile]);
  
  // Neon border effect animation
  useEffect(() => {
    if (activeCard) {
      const neonAnimationFrame = requestAnimationFrame(animateNeonEffect);
      return () => cancelAnimationFrame(neonAnimationFrame);
    }
  }, [activeCard, neonPosition]);
  
  const animateNeonEffect = () => {
    setNeonPosition(prev => {
      // Loop from 0 to 400 (represents percentage position around the border)
      const newPosition = (prev + 1) % 400;
      return newPosition;
    });
    requestAnimationFrame(animateNeonEffect);
  };
  
  // Handle card interactions
  const handleCardMouseEnter = (card) => {
    if (!isMobile) {
      setActiveCard(card);
    }
  };
  
  const handleCardMouseLeave = () => {
    if (!isMobile) {
      setActiveCard(null);
    }
  };
  
  const calculateNeonPosition = (percentage) => {
    // Convert percentage (0-400) to position on card border
    const position = percentage % 400;
    
    // Calculate x, y coordinates for each side
    // 0-100: top edge (x increases from 0 to 100%, y is 0)
    // 100-200: right edge (x is 100%, y increases from 0 to 100%)
    // 200-300: bottom edge (x decreases from 100% to 0, y is 100%)
    // 300-400: left edge (x is 0, y decreases from 100% to 0)
    
    let x, y;
    
    if (position < 100) {
      // Top edge
      x = `${position}%`;
      y = '0%';
    } else if (position < 200) {
      // Right edge
      x = '100%';
      y = `${position - 100}%`;
    } else if (position < 300) {
      // Bottom edge
      x = `${300 - position}%`;
      y = '100%';
    } else {
      // Left edge
      x = '0%';
      y = `${400 - position}%`;
    }
    
    return { x, y };
  };

  // Function to navigate to patients (same as clients for developer)
  const handleViewClientsList = () => {
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    navigate(`/${baseRole}/patients`);
  };
  
  // Function to navigate to accounting dashboard
  const handleViewRevenueDashboard = () => {
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    navigate(`/${baseRole}/accounting`);
  };

  // Function to navigate to platform settings
  const handleViewPlatformSettings = () => {
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    navigate(`/${baseRole}/settings`);
  };

  // Format number with commas for thousands
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Function to refresh platform data
  const handleRefreshData = () => {
    fetchPlatformStats();
  };



  return (
    <div className={`info-welcome-container ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
      {/* Error message */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Error loading data: {error}</span>
          <button onClick={handleRefreshData} className="retry-btn">
            <i className="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      )}

      {/* Premium dashboard cards with responsive layout */}
      <div className="dashboard-cards">
        {/* Active Clients card - SaaS Dashboard */}
        <div 
          className={`dashboard-card ${activeCard === 'clients' ? 'active' : ''} ${isLoadingPatients ? 'loading' : ''}`}
          onMouseEnter={() => handleCardMouseEnter('clients')}
          onMouseLeave={handleCardMouseLeave}
          ref={cardRefs.patients}
        >
          {/* Neon border effect */}
          {activeCard === 'clients' && (
            <div className="neon-border-container">
              <div 
                className="neon-dot" 
                style={{
                  left: calculateNeonPosition(neonPosition).x,
                  top: calculateNeonPosition(neonPosition).y
                }}
              ></div>
              <div className="neon-glow"></div>
            </div>
          )}
          
          <div className="card-content">
            <div className="card-header">
              <div className="icon-container clients-icon">
                <div className="icon-background"></div>
                <i className="fas fa-building"></i>
              </div>
              <h3>Client Agencies</h3>
              {isLoadingPatients && (
                <div className="loading-spinner">
                  <i className="fas fa-spinner fa-spin"></i>
                </div>
              )}
            </div>
            <div className="card-value">
              <span className="counter">
                {isLoadingPatients ? (
                  <div className="skeleton-counter"></div>
                ) : (
                  animatedStats.activeClients
                )}
              </span>
              <div className="counter-badge success">
                <i className="fas fa-arrow-up"></i>
                <span>100%</span>
              </div>
            </div>
            <div className="card-stats">
              <div className="stat-item">
                <div className="stat-label">Active subscriptions</div>
                <div className="stat-value">
                  {isLoadingPatients ? (
                    <div className="skeleton-stat"></div>
                  ) : (
                    stats.activeClients
                  )}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Pipeline prospects</div>
                <div className="stat-value">
                  {isLoadingPatients ? (
                    <div className="skeleton-stat"></div>
                  ) : (
                    stats.totalClients - stats.activeClients
                  )}
                </div>
              </div>
            </div>
            <div className="client-agencies-list">
              <div className="agencies-header">
                <span>Current Active Clients:</span>
              </div>
              <div className="agency-item active">
                <div className="agency-status"></div>
                <div className="agency-info">
                  <span className="agency-name">Motive Home Care</span>
                  <span className="agency-status-text">Active • $100/month</span>
                </div>
                <div className="agency-revenue">$1,200 YTD</div>
              </div>
              <div className="agency-item pipeline">
                <div className="agency-status"></div>
                <div className="agency-info">
                  <span className="agency-name">Supportive Health LLC</span>
                  <span className="agency-status-text">Onboarding</span>
                </div>
                <div className="agency-revenue">Pending</div>
              </div>
            </div>
            <div className="card-footer">
              <button 
                className="action-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewClientsList();
                }}
                disabled={isLoadingPatients}
              >
                <div className="button-content">
                  <i className="fas fa-handshake"></i>
                  <span>Manage Agency Clients</span>
                </div>
                <div className="button-hover-effect"></div>
              </button>
            </div>
          </div>
          
          {/* Enhanced background decorations */}
          <div className="card-bg-decoration"></div>
          <div className="card-grid-lines"></div>
          <div className="card-decoration">
            <span className="deco-circle"></span>
            <span className="deco-square"></span>
            <span className="deco-triangle"></span>
          </div>
        </div>
        
        {/* Platform Revenue card - SaaS Financial Dashboard */}
        <div 
          className={`dashboard-card ${activeCard === 'finance' ? 'active' : ''}`}
          onMouseEnter={() => handleCardMouseEnter('finance')}
          onMouseLeave={handleCardMouseLeave}
          ref={cardRefs.finance}
        >
          {/* Neon border effect */}
          {activeCard === 'finance' && (
            <div className="neon-border-container">
              <div 
                className="neon-dot" 
                style={{
                  left: calculateNeonPosition(neonPosition).x,
                  top: calculateNeonPosition(neonPosition).y
                }}
              ></div>
              <div className="neon-glow"></div>
            </div>
          )}
          
          <div className="card-content">
            <div className="card-header">
              <div className="icon-container finance-icon">
                <div className="icon-background"></div>
                <i className="fas fa-dollar-sign"></i>
              </div>
              <h3>Platform Revenue</h3>
            </div>
            <div className="card-value">
              <span className="currency">$</span>
              <span className="counter">{formatNumber(animatedStats.revenue)}</span>
              <div className="counter-badge">
                <i className="fas fa-arrow-up"></i>
                <span>{platformData.revenueGrowth}%</span>
              </div>
            </div>
            <div className="finance-metrics">
              <div className="metric-item">
                <div className="metric-icon">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="metric-details">
                  <div className="metric-label">This Month (July)</div>
                  <div className="metric-value">${formatNumber(stats.monthlyRevenue)}</div>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-icon">
                  <i className="fas fa-user-friends"></i>
                </div>
                <div className="metric-details">
                  <div className="metric-label">Platform Users</div>
                  <div className="metric-value">{formatNumber(platformData.platformUsers)}</div>
                </div>
              </div>
            </div>
            <div className="saas-revenue-breakdown">
              <div className="revenue-header">
                <span>Revenue Model: $100/month per agency</span>
              </div>
              <div className="revenue-calculation">
                <div className="calc-item">
                  <span className="calc-label">Active Agencies:</span>
                  <span className="calc-value">{stats.activeClients}</span>
                </div>
                <div className="calc-operator">×</div>
                <div className="calc-item">
                  <span className="calc-label">Monthly Rate:</span>
                  <span className="calc-value">$100</span>
                </div>
                <div className="calc-operator">=</div>
                <div className="calc-item result">
                  <span className="calc-label">Monthly Revenue:</span>
                  <span className="calc-value">${stats.monthlyRevenue}</span>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button 
                className="action-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewRevenueDashboard();
                }}
              >
                <div className="button-content">
                  <i className="fas fa-calculator"></i>
                  <span>Financial Dashboard</span>
                </div>
                <div className="button-hover-effect"></div>
              </button>
            </div>
          </div>
          
          {/* Enhanced background decorations */}
          <div className="card-bg-decoration"></div>
          <div className="card-grid-lines"></div>
          <div className="card-decoration">
            <span className="deco-circle"></span>
            <span className="deco-square"></span>
            <span className="deco-triangle"></span>
          </div>
        </div>
        
        {/* Learning center card with enhanced responsive design */}
        <div 
          className={`dashboard-card ${activeCard === 'learning' ? 'active' : ''}`}
          onMouseEnter={() => handleCardMouseEnter('learning')}
          onMouseLeave={handleCardMouseLeave}
          ref={cardRefs.learning}
        >
          {/* Neon border effect */}
          {activeCard === 'learning' && (
            <div className="neon-border-container">
              <div 
                className="neon-dot" 
                style={{
                  left: calculateNeonPosition(neonPosition).x,
                  top: calculateNeonPosition(neonPosition).y
                }}
              ></div>
              <div className="neon-glow"></div>
            </div>
          )}
          
          <div className="card-content">
            <div className="card-header">
              <div className="icon-container control-icon">
                <div className="icon-background"></div>
                <i className="fas fa-cogs"></i>
              </div>
              <h3>Platform Control</h3>
            </div>
            <div className="card-description">
              <p>System administration and platform configuration tools</p>
            </div>
            <div className="system-status">
              <div className="status-header">
                <span>Platform Status</span>
                <span className="status-indicator online">
                  <i className="fas fa-circle"></i> Online
                </span>
              </div>
              <div className="status-metrics">
                <div className="metric-row">
                  <span className="metric-label">Server Load:</span>
                  <span className="metric-value">23%</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Database:</span>
                  <span className="metric-value">Healthy</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Last Backup:</span>
                  <span className="metric-value">2 hours ago</span>
                </div>
              </div>
            </div>
            <div className="platform-tools">
              <div className="tool-stat">
                <div className="stat-icon">
                  <i className="fas fa-users-cog"></i>
                </div>
                <div className="stat-details">
                  <div className="stat-value">{platformData.platformUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>
              <div className="tool-stat">
                <div className="stat-icon">
                  <i className="fas fa-server"></i>
                </div>
                <div className="stat-details">
                  <div className="stat-value">99.9%</div>
                  <div className="stat-label">Uptime</div>
                </div>
              </div>
              <div className="tool-stat">
                <div className="stat-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div className="stat-details">
                  <div className="stat-value">Secure</div>
                  <div className="stat-label">SSL Status</div>
                </div>
              </div>
            </div>
            <div className="card-footer platform-actions">
              <button 
                className="platform-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewPlatformSettings();
                }}
              >
                <div className="button-content">
                  <i className="fas fa-cogs"></i>
                  <span>Platform Settings</span>
                </div>
                <div className="button-hover-effect"></div>
              </button>
              <button className="platform-button">
                <div className="button-content">
                  <i className="fas fa-database"></i>
                  <span>Database Admin</span>
                </div>
                <div className="button-hover-effect"></div>
              </button>
            </div>
          </div>
          
          {/* Enhanced background decorations */}
          <div className="card-bg-decoration"></div>
          <div className="card-grid-lines"></div>
          <div className="card-decoration">
            <span className="deco-circle"></span>
            <span className="deco-square"></span>
            <span className="deco-triangle"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevInfoWelcome;