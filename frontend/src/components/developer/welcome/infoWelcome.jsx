import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../login/AuthContext';
import '../../../styles/developer/Welcome/InfoWelcome.scss';

const DevInfoWelcome = ({ isMobile, isTablet }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
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
  
  const [patients, setPatients] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    activeClients: 0,
    totalClients: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    completedSessions: 0
  });
  
  const [platformData, setPlatformData] = useState({
    activeAgencies: 1,
    totalAgencies: 3,
    monthlySubscriptionRate: 100,
    currentMonthRevenue: 100,
    totalRevenue: 1200,
    pendingPayments: 200,
    revenueGrowth: 25,
    platformUsers: 350,
    completedSessions: 145
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  const fetchPlatformStats = async () => {
    try {
      setIsLoadingPatients(true);
      setError(null);
      
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const platformStats = {
        activeAgencies: platformData.activeAgencies,
        totalAgencies: platformData.totalAgencies,
        monthlyRevenue: platformData.currentMonthRevenue,
        totalRevenue: platformData.totalRevenue,
        pendingPayments: platformData.pendingPayments,
        platformUsers: platformData.platformUsers,
        completedSessions: platformData.completedSessions
      };
      
      
      setStats({
        activeClients: platformStats.activeAgencies,
        totalClients: platformStats.totalAgencies,
        monthlyRevenue: platformStats.monthlyRevenue,
        pendingPayments: platformStats.pendingPayments,
        totalRevenue: platformStats.totalRevenue,
        completedSessions: platformStats.completedSessions
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  useEffect(() => {
    const calculatePlatformMetrics = () => {
      const currentMonthRevenue = platformData.activeAgencies * platformData.monthlySubscriptionRate;
      const projectedAnnualRevenue = currentMonthRevenue * 12;
      
      
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

  useEffect(() => {
    fetchPlatformStats();
    
    const interval = setInterval(() => {
      fetchPlatformStats();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const duration = isMobile ? 1800 : 2500;
    const steps = isMobile ? 30 : 50;
    const stepTime = duration / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += 1;
      const progress = current / steps;
      
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
  
  useEffect(() => {
    if (activeCard) {
      const neonAnimationFrame = requestAnimationFrame(animateNeonEffect);
      return () => cancelAnimationFrame(neonAnimationFrame);
    }
  }, [activeCard, neonPosition]);
  
  const animateNeonEffect = () => {
    setNeonPosition(prev => {
      const newPosition = (prev + 1) % 400;
      return newPosition;
    });
    requestAnimationFrame(animateNeonEffect);
  };
  
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
    const position = percentage % 400;
    
    
    let x, y;
    
    if (position < 100) {
      x = `${position}%`;
      y = '0%';
    } else if (position < 200) {
      x = '100%';
      y = `${position - 100}%`;
    } else if (position < 300) {
      x = `${300 - position}%`;
      y = '100%';
    } else {
      x = '0%';
      y = `${400 - position}%`;
    }
    
    return { x, y };
  };

  const handleViewClientsList = () => {
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    navigate(`/${baseRole}/patients`);
  };
  
  const handleViewRevenueDashboard = () => {
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    navigate(`/${baseRole}/accounting`);
  };

  const handleViewPlatformSettings = () => {
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    navigate(`/${baseRole}/settings`);
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleRefreshData = () => {
    fetchPlatformStats();
  };



  return (
    <div className={`info-welcome-container ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Error loading data: {error}</span>
          <button onClick={handleRefreshData} className="retry-btn">
            <i className="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      )}

      <div className="dashboard-cards">
        <div 
          className={`dashboard-card ${isLoadingPatients ? 'loading' : ''}`}
          ref={cardRefs.patients}
        >
          
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
          
          <div className="card-bg-decoration"></div>
          <div className="card-grid-lines"></div>
          <div className="card-decoration">
            <span className="deco-circle"></span>
            <span className="deco-square"></span>
            <span className="deco-triangle"></span>
          </div>
        </div>
        
        <div 
          className="dashboard-card"
          ref={cardRefs.finance}
        >
          
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
          
          <div className="card-bg-decoration"></div>
          <div className="card-grid-lines"></div>
          <div className="card-decoration">
            <span className="deco-circle"></span>
            <span className="deco-square"></span>
            <span className="deco-triangle"></span>
          </div>
        </div>
        
        <div 
          className="dashboard-card"
          ref={cardRefs.learning}
        >
          
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