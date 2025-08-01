import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../login/AuthContext';
import '../../../styles/developer/Welcome/InfoWelcome.scss';

const AdminInfoWelcome = ({ isMobile, isTablet }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Enhanced state for animations with performance optimizations
  const [animatedStats, setAnimatedStats] = useState({
    activePatients: 0,
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
  
  // API States - moved from static to dynamic API data
  const [patients, setPatients] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [error, setError] = useState(null);
  
  // Calculate statistics dynamically from API data
  const [stats, setStats] = useState({
    activePatients: 0,
    totalPatients: 0,
    revenue: 0,
    completedSessions: 0
  });
  
  // Financial data for Motive Home Care agency
  const [financialData, setFinancialData] = useState({
    totalRevenue: 58750,
    monthlyRevenue: 12450,
    pendingPayments: 3200,
    revenueGrowth: 18,
    completedSessions: 145
  });

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  // Function to fetch patients from API (same as soporte implementation)
  const fetchPatients = async () => {
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
      console.log('Fetched patients for Motive Home Care:', data);
      
      // Normalize patient data and determine status - filtering for Motive Home Care agency
      const normalizedPatients = data.map(patient => {
        let status;
        if (patient.is_active === true || patient.is_active === 'true' || patient.is_active === 1) {
          status = 'Active';
        } else if (patient.is_active === false || patient.is_active === 'false' || patient.is_active === 0) {
          status = 'Inactive';
        } else {
          status = 'Active'; // Default to active if undefined
        }
        
        return {
          ...patient,
          status: status,
        };
      });
      
      setPatients(normalizedPatients);
      
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.message);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  // Effect to calculate statistics when patients change
  useEffect(() => {
    if (patients && Array.isArray(patients)) {
      const totalPatients = patients.length;
      const activePatients = patients.filter(p => p.status === "Active").length;
      
      console.log('Calculating stats for Motive Home Care:', {
        totalPatients,
        activePatients
      });
      
      setStats({
        activePatients,
        totalPatients,
        revenue: financialData.totalRevenue,
        completedSessions: financialData.completedSessions
      });
    }
  }, [patients, financialData]);

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
    
    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchPatients();
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
        activePatients: Math.round(eased * stats.activePatients),
        revenue: Math.round(eased * stats.revenue),
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

  // Function to navigate to patients list
  const handleViewPatientsList = () => {
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    navigate(`/${baseRole}/patients?scrollTo=patients`);
  };
  
  // Function to navigate to accounting reports
  const handleViewFinancialReports = () => {
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'admin';
    navigate(`/${baseRole}/accounting`);
  };

  // Function to refresh patient data
  const handleRefreshData = () => {
    fetchPatients();
  };

  // Format number with commas for thousands
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className={`info-welcome-container ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
      {/* Error message */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Error loading patient data: {error}</span>
          <button onClick={handleRefreshData} className="retry-btn">
            <i className="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      )}
      {/* Premium dashboard cards with responsive layout */}
      <div className="dashboard-cards">
        {/* Patients card with enhanced responsive design */}
        <div 
          className={`dashboard-card ${activeCard === 'patients' ? 'active' : ''} ${isLoadingPatients ? 'loading' : ''}`}
          onMouseEnter={() => handleCardMouseEnter('patients')}
          onMouseLeave={handleCardMouseLeave}
          ref={cardRefs.patients}
        >
          {/* Neon border effect */}
          {activeCard === 'patients' && (
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
              <div className="icon-container patients-icon">
                <div className="icon-background"></div>
                <i className="fas fa-user-injured"></i>
              </div>
              <h3>Active Patients</h3>
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
                  animatedStats.activePatients
                )}
              </span>
              <div className="counter-badge">
                <i className="fas fa-arrow-up"></i>
                <span>12%</span>
              </div>
            </div>
            <div className="card-stats">
              <div className="stat-item">
                <div className="stat-label">Total patients</div>
                <div className="stat-value">
                  {isLoadingPatients ? (
                    <div className="skeleton-stat"></div>
                  ) : (
                    stats.totalPatients
                  )}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Active this month</div>
                <div className="stat-value">
                  {isLoadingPatients ? (
                    <div className="skeleton-stat"></div>
                  ) : (
                    stats.activePatients
                  )}
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button 
                className="action-button"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click event
                  handleViewPatientsList();
                }}
                disabled={isLoadingPatients}
              >
                <div className="button-content">
                  <i className="fas fa-clipboard-list"></i>
                  <span>View patients</span>
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
        
        {/* Finance card with enhanced responsive design */}
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
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Financial Overview</h3>
            </div>
            <div className="card-value">
              <span className="currency">$</span>
              <span className="counter">{formatNumber(animatedStats.revenue)}</span>
              <div className="counter-badge">
                <i className="fas fa-arrow-up"></i>
                <span>{financialData.revenueGrowth}%</span>
              </div>
            </div>
            <div className="finance-metrics">
              <div className="metric-item">
                <div className="metric-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="metric-details">
                  <div className="metric-label">Monthly Revenue</div>
                  <div className="metric-value">${formatNumber(financialData.monthlyRevenue)}</div>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="metric-details">
                  <div className="metric-label">Pending Payments</div>
                  <div className="metric-value">${formatNumber(financialData.pendingPayments)}</div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button 
                className="action-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewFinancialReports();
                }}
              >
                <div className="button-content">
                  <i className="fas fa-file-invoice-dollar"></i>
                  <span>View reports</span>
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
              <div className="icon-container learning-icon">
                <div className="icon-background"></div>
                <i className="fas fa-book-open"></i>
              </div>
              <h3>Learning Center</h3>
            </div>
            <div className="card-description">
              <p>Resources and tutorials to optimize your experience</p>
            </div>
            <div className="learning-progress">
              <div className="progress-header">
                <span>Learning progress</span>
                <span className="progress-percent">65%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: '65%' }}>
                  <div className="progress-glow"></div>
                </div>
              </div>
            </div>
            <div className="completed-sessions">
              <div className="sessions-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="sessions-details">
                <div className="sessions-value">{animatedStats.completedSessions}</div>
                <div className="sessions-label">Completed sessions</div>
              </div>
            </div>
            <div className="card-footer tutorial-options">
              <button className="tutorial-button">
                <div className="button-content">
                  <i className="fas fa-play-circle"></i>
                  <span>Video tutorial</span>
                </div>
                <div className="button-hover-effect"></div>
              </button>
              <button className="tutorial-button">
                <div className="button-content">
                  <i className="fas fa-file-alt"></i>
                  <span>PDF Guide</span>
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

export default AdminInfoWelcome;