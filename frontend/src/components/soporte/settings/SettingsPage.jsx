// components/developer/settings/SettingsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../login/AuthContext';
import NotesModule from './NotesModule';
import './../../../styles/settings/SettingsPage.scss';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Loading Animation States
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Connecting to TherapySync Settings...');
  const [isLoading, setIsLoading] = useState(true);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  
  // Main App States
  const [activeModule, setActiveModule] = useState('overview');
  const [expandedCards, setExpandedCards] = useState({});
  const [animatingElements, setAnimatingElements] = useState([]);

  
  // Settings States
  const [settings, setSettings] = useState({
    dashboard: {
      showTotalPatients: true,
      showActivePatients: true,
      showDeactivatedPatients: true,
      showPendingPatients: true
    },
    financial: {
      defaultView: 'next'
    },
    filters: {
      advancedFiltersExpanded: false,
      patientStatusFilters: ['active', 'deactive', 'pending', 'review']
    },
    layout: {
      patientViewMode: 'cards',
      dashboardMetrics: 'detailed'
    },
    notes: {
      sections: [],
      lastUpdated: Date.now()
    }
  });

  // Loading Animation Effect
  useEffect(() => {
    const loadingSteps = [
      { text: 'Connecting to TherapySync Settings...', duration: 600 },
      { text: 'Loading user preferences...', duration: 400 },
      { text: 'Initializing clinical interface...', duration: 500 },
      { text: 'Rendering advanced configurations...', duration: 500 }
    ];

    let currentProgress = 0;
    let stepIndex = 0;
    
    const progressInterval = setInterval(() => {
      currentProgress += 2;
      setLoadingProgress(currentProgress);
      
      // Change text at specific progress points
      const progressThresholds = [25, 50, 75];
      if (progressThresholds.includes(currentProgress) && stepIndex < loadingSteps.length - 1) {
        stepIndex++;
        setCurrentLoadingStep(stepIndex);
        setLoadingText(loadingSteps[stepIndex].text);
      }
      
      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          setIsLoading(false);
          // Start main animations
          setTimeout(() => {
            setAnimatingElements(['header', 'modules', 'sidebar']);
          }, 100);
        }, 300);
      }
    }, 20);

    return () => clearInterval(progressInterval);
  }, []);

  // Load saved settings
  useEffect(() => {
    if (!isLoading) {
      const savedSettings = localStorage.getItem('therapySyncSettings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error('Error loading settings:', e);
        }
      }
    }
  }, [isLoading]);


  // Save settings
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('therapySyncSettings', JSON.stringify(settings));
    }
  }, [settings, isLoading]);


  // Helper function to get nested property
  const getNestedProperty = (obj, path) => {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  };

  // Helper function to set nested property
  const setNestedProperty = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  };

  // Handle toggle changes
  const handleToggleChange = (section, setting, subsection = null) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings };
      
      if (subsection) {
        const fullPath = `${section}.${subsection}.${setting}`;
        const currentValue = getNestedProperty(newSettings, fullPath);
        setNestedProperty(newSettings, fullPath, !currentValue);
      } else {
        if (!newSettings[section]) {
          newSettings[section] = {};
        }
        newSettings[section] = {
          ...newSettings[section],
          [setting]: !newSettings[section][setting]
        };
      }
      
      return newSettings;
    });
    
    // Add toggle animation
    const toggleElement = document.querySelector(`.toggle-${section}-${subsection ? subsection + '-' : ''}${setting}`);
    if (toggleElement) {
      toggleElement.classList.add('toggle-pulse');
      setTimeout(() => {
        toggleElement.classList.remove('toggle-pulse');
      }, 600);
    }
  };

  // Handle selection changes
  const handleSelectChange = (section, setting, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section],
        [setting]: value
      }
    }));
  };

  // Handle multi-select changes
  const handleMultiSelectChange = (section, setting, value) => {
    setSettings(prevSettings => {
      const currentValues = prevSettings[section][setting];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];

      return {
        ...prevSettings,
        [section]: {
          ...prevSettings[section],
          [setting]: newValues
        }
      };
    });
  };

  // Toggle card expansion
  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (currentUser && currentUser.fullname) {
      return currentUser.fullname;
    } else if (currentUser && currentUser.username) {
      return currentUser.username;
    }
    return "TherapySync User";
  };

  // Get user role
  const getUserRole = () => {
    if (currentUser && currentUser.role) {
      return currentUser.role;
    }
    return "Healthcare Professional";
  };

  // Navigation modules
  const navigationModules = [
    { 
      id: 'overview', 
      title: 'Overview', 
      icon: 'fas fa-home',
      description: 'Settings dashboard and quick access',
      color: 'from-blue-500 to-purple-600'
    },
    { 
      id: 'dashboard', 
      title: 'Dashboard', 
      icon: 'fas fa-tachometer-alt',
      description: 'Configure dashboard display preferences',
      color: 'from-green-500 to-teal-600'
    },
    { 
      id: 'financial', 
      title: 'Financial', 
      icon: 'fas fa-chart-line',
      description: 'Manage financial view settings',
      color: 'from-yellow-500 to-orange-600'
    },
    { 
      id: 'filters', 
      title: 'Filters & Search', 
      icon: 'fas fa-filter',
      description: 'Customize search and filter behavior',
      color: 'from-purple-500 to-pink-600'
    },
    { 
      id: 'layout', 
      title: 'Layout', 
      icon: 'fas fa-th-large',
      description: 'Personalize interface layout options',
      color: 'from-indigo-500 to-blue-600'
    },
    { 
      id: 'notes', 
      title: 'Notes Configuration', 
      icon: 'fas fa-sticky-note',
      description: 'Advanced clinical documentation settings',
      color: 'from-red-500 to-pink-600'
    }
  ];

  // Render toggle option
  const renderToggleOption = (section, setting, subsection, title, description, icon) => {
    let isActive;
    
    if (subsection) {
      const fullPath = `${section}.${subsection}.${setting}`;
      isActive = getNestedProperty(settings, fullPath);
    } else {
      isActive = settings[section] && settings[section][setting];
    }
    
    return (
      <div className="premium-toggle-option" key={`${section}-${subsection || ''}-${setting}`}>
        <div className="toggle-content">
          <div className="toggle-icon">
            <i className={icon}></i>
          </div>
          <div className="toggle-info">
            <div className="toggle-title">{title}</div>
            <div className="toggle-description">{description}</div>
          </div>
        </div>
        <div 
          className={`premium-toggle-switch toggle-${section}-${subsection ? subsection + '-' : ''}${setting} ${isActive ? 'active' : ''}`}
          onClick={() => handleToggleChange(section, setting, subsection)}
        >
          <div className="toggle-track">
            <div className="toggle-thumb">
              <div className="toggle-thumb-inner"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Handle save all settings
  const handleSaveAll = () => {
    // Create floating notification
    const notification = document.createElement('div');
    notification.className = 'premium-notification success';
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-check-circle"></i>
        <span>All settings saved successfully!</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="clinical-loading-screen">
        <div className="loading-content">
          <div className="medical-logo">
            <div className="logo-circle">
              <i className="fas fa-cog"></i>
            </div>
            <div className="pulse-ring"></div>
          </div>
          
          <div className="loading-progress-container">
            <div className="loading-progress-circle">
              <svg className="progress-ring" width="120" height="120">
                <circle
                  className="progress-ring-background"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3"
                  fill="transparent"
                  r="55"
                  cx="60"
                  cy="60"
                />
                <circle
                  className="progress-ring-progress"
                  stroke="url(#progressGradient)"
                  strokeWidth="3"
                  fill="transparent"
                  r="55"
                  cx="60"
                  cy="60"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 55}`,
                    strokeDashoffset: `${2 * Math.PI * 55 * (1 - loadingProgress / 100)}`,
                    transition: 'stroke-dashoffset 0.3s ease'
                  }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: '#3b82f6'}} />
                    <stop offset="50%" style={{stopColor: '#8b5cf6'}} />
                    <stop offset="100%" style={{stopColor: '#06b6d4'}} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="progress-percentage">{loadingProgress}%</div>
            </div>
          </div>
          
          <div className="loading-text">
            <h2>{loadingText}</h2>
            <div className="loading-steps">
              <div className="step-indicators">
                {['Connecting', 'Loading', 'Initializing', 'Rendering'].map((step, index) => (
                  <div 
                    key={step}
                    className={`step-indicator ${index <= currentLoadingStep ? 'active' : ''} ${index < currentLoadingStep ? 'completed' : ''}`}
                  >
                    <div className="step-icon">
                      {index < currentLoadingStep ? (
                        <i className="fas fa-check"></i>
                      ) : index === currentLoadingStep ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-circle"></i>
                      )}
                    </div>
                    <span className="step-label">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-settings-page">
      {/* Clinical Medical Particles */}
      <div className="clinical-particles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>

      {/* Clinical Header */}
      <header className={`premium-header ${animatingElements.includes('header') ? 'animate-in' : ''}`}>
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={handleBack}>
              <i className="fas fa-arrow-left"></i>
              <span>Back</span>
            </button>
            <div className="header-title">
              <h1>
                <i className="fas fa-sliders-h"></i>
                Clinical Settings
              </h1>
              <p>Advanced configuration center for TherapySync</p>
            </div>
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                <i className="fas fa-user-md"></i>
              </div>
              <div className="user-details">
                <div className="user-name">{getUserDisplayName()}</div>
                <div className="user-role">{getUserRole()}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="premium-container">
        {/* Navigation Modules */}
        <div className={`navigation-modules ${animatingElements.includes('modules') ? 'animate-in' : ''}`}>
          {navigationModules.map((module, index) => (
            <div
              key={module.id}
              className={`navigation-module ${activeModule === module.id ? 'active' : ''}`}
              onClick={() => setActiveModule(module.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`module-gradient bg-gradient-to-br ${module.color}`}></div>
              <div className="module-content">
                <div className="module-icon">
                  <i className={module.icon}></i>
                </div>
                <div className="module-info">
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                </div>
                <div className="module-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
              <div className="module-glow"></div>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="content-area">
          {activeModule === 'overview' && (
            <div className="overview-content">
              <div className="overview-header">
                <h2>Settings Overview</h2>
                <p>Manage all your TherapySync configurations from this central hub</p>
              </div>
              
              <div className="quick-stats">
                <div className="stat-card">
                  <div className="stat-icon dashboard">
                    <i className="fas fa-tachometer-alt"></i>
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">
                      {Object.values(settings.dashboard).filter(Boolean).length}/4
                    </div>
                    <div className="stat-label">Dashboard Metrics</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon financial">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">Configured</div>
                    <div className="stat-label">Financial View</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon notes">
                    <i className="fas fa-sticky-note"></i>
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">850+</div>
                    <div className="stat-label">Notes Fields</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon layout">
                    <i className="fas fa-th-large"></i>
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">Optimized</div>
                    <div className="stat-label">Layout Settings</div>
                  </div>
                </div>
              </div>
              
              <div className="recent-activity">
                <h3>Recent Configuration Changes</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-toggle-on"></i>
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Dashboard metrics updated</div>
                      <div className="activity-time">2 minutes ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-filter"></i>
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Filter preferences modified</div>
                      <div className="activity-time">1 hour ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-save"></i>
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">All settings synchronized</div>
                      <div className="activity-time">3 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'dashboard' && (
            <div className="settings-module-content">
              <div className="module-header">
                <h2>
                  <i className="fas fa-tachometer-alt"></i>
                  Dashboard Configuration
                </h2>
                <p>Configure which metrics and information appear on your main dashboard</p>
              </div>
              
              <div className="premium-card">
                <div className="card-header">
                  <h3>Patient Statistics Display</h3>
                  <p>Select which patient metrics to show on your dashboard</p>
                </div>
                
                <div className="settings-grid">
                  {renderToggleOption(
                    'dashboard', 'showTotalPatients', null,
                    'Total Patients', 'Display the total number of patients in the system',
                    'fas fa-users'
                  )}
                  
                  {renderToggleOption(
                    'dashboard', 'showActivePatients', null,
                    'Active Patients', 'Show currently active patients receiving treatment',
                    'fas fa-user-check'
                  )}
                  
                  {renderToggleOption(
                    'dashboard', 'showDeactivatedPatients', null,
                    'Deactivated Patients', 'Display patients who are no longer active',
                    'fas fa-user-slash'
                  )}
                  
                  {renderToggleOption(
                    'dashboard', 'showPendingPatients', null,
                    'Pending Patients', 'Show patients waiting for approval or assessment',
                    'fas fa-user-clock'
                  )}
                </div>
                
                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Live Preview</h4>
                    <div className="preview-badge">Real-time</div>
                  </div>
                  
                  <div className="metrics-preview">
                    {settings.dashboard.showTotalPatients && (
                      <div className="metric-preview total">
                        <div className="metric-icon">
                          <i className="fas fa-users"></i>
                        </div>
                        <div className="metric-details">
                          <div className="metric-value">142</div>
                          <div className="metric-label">Total Patients</div>
                        </div>
                      </div>
                    )}
                    
                    {settings.dashboard.showActivePatients && (
                      <div className="metric-preview active">
                        <div className="metric-icon">
                          <i className="fas fa-user-check"></i>
                        </div>
                        <div className="metric-details">
                          <div className="metric-value">98</div>
                          <div className="metric-label">Active</div>
                        </div>
                      </div>
                    )}
                    
                    {settings.dashboard.showDeactivatedPatients && (
                      <div className="metric-preview deactive">
                        <div className="metric-icon">
                          <i className="fas fa-user-slash"></i>
                        </div>
                        <div className="metric-details">
                          <div className="metric-value">32</div>
                          <div className="metric-label">Deactivated</div>
                        </div>
                      </div>
                    )}
                    
                    {settings.dashboard.showPendingPatients && (
                      <div className="metric-preview pending">
                        <div className="metric-icon">
                          <i className="fas fa-user-clock"></i>
                        </div>
                        <div className="metric-details">
                          <div className="metric-value">12</div>
                          <div className="metric-label">Pending</div>
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           </div>
         )}

         {activeModule === 'financial' && (
           <div className="settings-module-content">
             <div className="module-header">
               <h2>
                 <i className="fas fa-chart-line"></i>
                 Financial Configuration
               </h2>
               <p>Customize how financial information is presented throughout the platform</p>
             </div>
             
             <div className="premium-card">
               <div className="card-header">
                 <h3>Default Financial View</h3>
                 <p>Choose what financial data is displayed by default</p>
               </div>
               
               <div className="radio-group">
                 <div 
                   className={`premium-radio-option ${settings.financial.defaultView === 'next' ? 'active' : ''}`}
                   onClick={() => handleSelectChange('financial', 'defaultView', 'next')}
                 >
                   <div className="radio-indicator">
                     <div className="radio-dot"></div>
                   </div>
                   <div className="radio-content">
                     <div className="radio-icon">
                       <i className="fas fa-calendar-alt"></i>
                     </div>
                     <div className="radio-info">
                       <div className="radio-title">Next Payment Cycle</div>
                       <div className="radio-description">Show expected earnings in the upcoming payment period</div>
                     </div>
                   </div>
                 </div>
                 
                 <div 
                   className={`premium-radio-option ${settings.financial.defaultView === 'total' ? 'active' : ''}`}
                   onClick={() => handleSelectChange('financial', 'defaultView', 'total')}
                 >
                   <div className="radio-indicator">
                     <div className="radio-dot"></div>
                   </div>
                   <div className="radio-content">
                     <div className="radio-icon">
                       <i className="fas fa-money-check-alt"></i>
                     </div>
                     <div className="radio-info">
                       <div className="radio-title">Total Payments</div>
                       <div className="radio-description">Display all-time earnings and comprehensive payment history</div>
                     </div>
                   </div>
                 </div>
                 
                 <div 
                   className={`premium-radio-option ${settings.financial.defaultView === 'pending' ? 'active' : ''}`}
                   onClick={() => handleSelectChange('financial', 'defaultView', 'pending')}
                 >
                   <div className="radio-indicator">
                     <div className="radio-dot"></div>
                   </div>
                   <div className="radio-content">
                     <div className="radio-icon">
                       <i className="fas fa-hourglass-half"></i>
                     </div>
                     <div className="radio-info">
                       <div className="radio-title">Pending Submissions</div>
                       <div className="radio-description">Show billable work that needs to be submitted for processing</div>
                     </div>
                   </div>
                 </div>
               </div>
               
               <div className="preview-section">
                 <div className="preview-header">
                   <h4>Financial Preview</h4>
                   <div className="preview-badge">Live Data</div>
                 </div>
                 
                 <div className="financial-preview">
                   {settings.financial.defaultView === 'next' && (
                     <div className="financial-card next-payment">
                       <div className="financial-header">
                         <div className="financial-title">Next Payment Cycle</div>
                         <div className="financial-period">May 15 - May 30, 2025</div>
                       </div>
                       <div className="financial-amount">
                         <span className="currency">$</span>
                         <span className="value">4,850</span>
                       </div>
                       <div className="financial-stats">
                         <div className="stat">
                           <i className="fas fa-calendar-check"></i>
                           <span>42 Sessions</span>
                         </div>
                         <div className="stat">
                           <i className="fas fa-clock"></i>
                           <span>37.5 Hours</span>
                         </div>
                         <div className="stat">
                           <i className="fas fa-cogs"></i>
                           <span>Processing</span>
                         </div>
                       </div>
                     </div>
                   )}
                   
                   {settings.financial.defaultView === 'total' && (
                     <div className="financial-card total-payments">
                       <div className="financial-header">
                         <div className="financial-title">Total Payments (2025)</div>
                         <div className="financial-period">January 1 - Present</div>
                       </div>
                       <div className="financial-amount">
                         <span className="currency">$</span>
                         <span className="value">54,230</span>
                       </div>
                       <div className="financial-stats">
                         <div className="stat">
                           <i className="fas fa-calendar-check"></i>
                           <span>487 Sessions</span>
                         </div>
                         <div className="stat">
                           <i className="fas fa-clock"></i>
                           <span>412.5 Hours</span>
                         </div>
                         <div className="stat positive">
                           <i className="fas fa-chart-line"></i>
                           <span>+12.4% YOY</span>
                         </div>
                       </div>
                     </div>
                   )}
                   
                   {settings.financial.defaultView === 'pending' && (
                     <div className="financial-card pending-submissions">
                       <div className="financial-header">
                         <div className="financial-title">Pending Submissions</div>
                         <div className="financial-period">Due by May 12, 2025</div>
                       </div>
                       <div className="financial-amount">
                         <span className="currency">$</span>
                         <span className="value">1,820</span>
                       </div>
                       <div className="financial-stats">
                         <div className="stat">
                           <i className="fas fa-calendar-check"></i>
                           <span>16 Sessions</span>
                         </div>
                         <div className="stat">
                           <i className="fas fa-clock"></i>
                           <span>14.0 Hours</span>
                         </div>
                         <div className="stat urgent">
                           <i className="fas fa-exclamation-circle"></i>
                           <span>Action Required</span>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           </div>
         )}

         {activeModule === 'filters' && (
           <div className="settings-module-content">
             <div className="module-header">
               <h2>
                 <i className="fas fa-filter"></i>
                 Filters & Search Configuration
               </h2>
               <p>Customize filter behavior and search options for optimal data exploration</p>
             </div>
             
             <div className="premium-card">
               <div className="card-header">
                 <h3>Advanced Filters Behavior</h3>
                 <p>Set how advanced filters appear when loading patient lists</p>
               </div>
               
               <div className="settings-grid">
                 {renderToggleOption(
                   'filters', 'advancedFiltersExpanded', null,
                   'Expand Filters By Default', 'Show all available filters when the page loads',
                   'fas fa-angle-down'
                 )}
               </div>
             </div>
             
             <div className="premium-card">
               <div className="card-header">
                 <h3>Patient Status Filters</h3>
                 <p>Select which status filters to display in the filter section</p>
               </div>
               
               <div className="checkbox-grid">
                 <div 
                   className={`premium-checkbox-option ${settings.filters.patientStatusFilters.includes('active') ? 'active' : ''}`}
                   onClick={() => handleMultiSelectChange('filters', 'patientStatusFilters', 'active')}
                 >
                   <div className="checkbox-indicator">
                     <i className="fas fa-check"></i>
                   </div>
                   <div className="checkbox-content">
                     <div className="status-badge active">Active</div>
                     <div className="checkbox-description">Patients currently in therapy</div>
                   </div>
                 </div>
                 
                 <div 
                   className={`premium-checkbox-option ${settings.filters.patientStatusFilters.includes('deactive') ? 'active' : ''}`}
                   onClick={() => handleMultiSelectChange('filters', 'patientStatusFilters', 'deactive')}
                 >
                   <div className="checkbox-indicator">
                     <i className="fas fa-check"></i>
                   </div>
                   <div className="checkbox-content">
                     <div className="status-badge deactive">Deactivated</div>
                     <div className="checkbox-description">Patients no longer in therapy</div>
                   </div>
                 </div>
                 
                 <div 
                   className={`premium-checkbox-option ${settings.filters.patientStatusFilters.includes('pending') ? 'active' : ''}`}
                   onClick={() => handleMultiSelectChange('filters', 'patientStatusFilters', 'pending')}
                 >
                   <div className="checkbox-indicator">
                     <i className="fas fa-check"></i>
                   </div>
                   <div className="checkbox-content">
                     <div className="status-badge pending">Pending</div>
                     <div className="checkbox-description">Patients awaiting approval</div>
                   </div>
                 </div>
                 
                 <div 
                   className={`premium-checkbox-option ${settings.filters.patientStatusFilters.includes('review') ? 'active' : ''}`}
                   onClick={() => handleMultiSelectChange('filters', 'patientStatusFilters', 'review')}
                 >
                   <div className="checkbox-indicator">
                     <i className="fas fa-check"></i>
                   </div>
                   <div className="checkbox-content">
                     <div className="status-badge review">Review</div>
                     <div className="checkbox-description">Patients needing clinical review</div>
                   </div>
                 </div>
               </div>
               
               <div className="preview-section">
                 <div className="preview-header">
                   <h4>Filter Preview</h4>
                   <div className="preview-badge">Interactive</div>
                 </div>
                 
                 <div className="filters-preview">
                   <div className="filter-toolbar">
                     <div className="filter-title">
                       <i className="fas fa-filter"></i>
                       <span>Patient Status</span>
                     </div>
                     <div className="filter-actions">
                       <button className="filter-action">
                         <i className="fas fa-times-circle"></i>
                         <span>Clear</span>
                       </button>
                       <button className="filter-expand">
                         <i className={`fas ${settings.filters.advancedFiltersExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                       </button>
                     </div>
                   </div>
                   
                   <div className="filter-pills">
                     {settings.filters.patientStatusFilters.map(status => (
                       <div key={status} className={`filter-pill ${status}`}>
                         <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                         <i className="fas fa-times"></i>
                       </div>
                     ))}
                   </div>
                   
                   {settings.filters.advancedFiltersExpanded && (
                     <div className="advanced-filters">
                       <div className="filter-group">
                         <div className="filter-group-title">Insurance</div>
                         <div className="filter-options">
                           <div className="filter-chip">Medicare</div>
                           <div className="filter-chip">Medicaid</div>
                           <div className="filter-chip">Blue Cross</div>
                         </div>
                       </div>
                       <div className="filter-group">
                         <div className="filter-group-title">Therapy Type</div>
                         <div className="filter-options">
                           <div className="filter-chip">Physical</div>
                           <div className="filter-chip">Occupational</div>
                           <div className="filter-chip">Speech</div>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           </div>
         )}

         {activeModule === 'layout' && (
           <div className="settings-module-content">
             <div className="module-header">
               <h2>
                 <i className="fas fa-th-large"></i>
                 Layout Configuration
               </h2>
               <p>Configure how content is presented throughout your workflow</p>
             </div>
             
             <div className="premium-card">
               <div className="card-header">
                 <h3>Patient View Mode</h3>
                 <p>Select your preferred way to view patient information</p>
               </div>
               
               <div className="view-mode-selector">
                 <div 
                   className={`view-mode-option ${settings.layout.patientViewMode === 'cards' ? 'active' : ''}`}
                   onClick={() => handleSelectChange('layout', 'patientViewMode', 'cards')}
                 >
                   <div className="view-mode-icon">
                     <i className="fas fa-th-large"></i>
                   </div>
                   <div className="view-mode-title">Cards View</div>
                   <div className="view-mode-description">Visual card-based layout</div>
                 </div>
                 
                 <div 
                   className={`view-mode-option ${settings.layout.patientViewMode === 'list' ? 'active' : ''}`}
                   onClick={() => handleSelectChange('layout', 'patientViewMode', 'list')}
                 >
                   <div className="view-mode-icon">
                     <i className="fas fa-list"></i>
                   </div>
                   <div className="view-mode-title">List View</div>
                   <div className="view-mode-description">Compact table layout</div>
                 </div>
               </div>
             </div>
             
             <div className="premium-card">
               <div className="card-header">
                 <h3>Dashboard Metrics Display</h3>
                 <p>Choose how detailed your dashboard metrics should be</p>
               </div>
               
               <div className="radio-group">
                 <div 
                   className={`premium-radio-option ${settings.layout.dashboardMetrics === 'detailed' ? 'active' : ''}`}
                   onClick={() => handleSelectChange('layout', 'dashboardMetrics', 'detailed')}
                 >
                   <div className="radio-indicator">
                     <div className="radio-dot"></div>
                   </div>
                   <div className="radio-content">
                     <div className="radio-icon">
                       <i className="fas fa-chart-pie"></i>
                     </div>
                     <div className="radio-info">
                       <div className="radio-title">Detailed Metrics</div>
                       <div className="radio-description">Comprehensive statistics with additional data points</div>
                     </div>
                   </div>
                 </div>
                 
                 <div 
                   className={`premium-radio-option ${settings.layout.dashboardMetrics === 'compact' ? 'active' : ''}`}
                   onClick={() => handleSelectChange('layout', 'dashboardMetrics', 'compact')}
                 >
                   <div className="radio-indicator">
                     <div className="radio-dot"></div>
                   </div>
                   <div className="radio-content">
                     <div className="radio-icon">
                       <i className="fas fa-compress-alt"></i>
                     </div>
                     <div className="radio-info">
                       <div className="radio-title">Compact Metrics</div>
                       <div className="radio-description">Simplified key metrics for cleaner dashboard</div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         )}

         {activeModule === 'notes' && (
          <NotesModule />
        )}
       </div>
     </div>

     {/* Premium Footer with Actions */}
     <footer className="premium-footer">
       <div className="footer-content">
         <div className="footer-left">
           <div className="last-saved">
             <i className="fas fa-cloud-upload-alt"></i>
             <span>Auto-saved • {new Date().toLocaleTimeString()}</span>
           </div>
           <div className="sync-status">
             <div className="sync-indicator active">
               <div className="sync-dot"></div>
             </div>
             <span>All changes synchronized</span>
           </div>
         </div>
         
         <div className="footer-right">
           <button className="footer-action secondary">
             <i className="fas fa-undo"></i>
             <span>Reset All</span>
           </button>
           <button className="footer-action secondary">
             <i className="fas fa-download"></i>
             <span>Export</span>
           </button>
           <button className="footer-action primary" onClick={handleSaveAll}>
             <i className="fas fa-save"></i>
             <span>Save All Settings</span>
             <div className="button-shine"></div>
           </button>
         </div>
       </div>
       
       <div className="footer-decoration">
         <div className="decoration-line"></div>
         <div className="decoration-dots">
           <div className="dot"></div>
           <div className="dot"></div>
           <div className="dot"></div>
         </div>
       </div>
     </footer>

     {/* Floating Action Button for Quick Access */}
     <div className="floating-actions">
       <div className="fab-main">
         <i className="fas fa-magic"></i>
       </div>
       <div className="fab-options">
         <div className="fab-option" data-tooltip="Quick Save">
           <i className="fas fa-save"></i>
         </div>
         <div className="fab-option" data-tooltip="Reset to Defaults">
           <i className="fas fa-undo"></i>
         </div>
         <div className="fab-option" data-tooltip="Export Settings">
           <i className="fas fa-download"></i>
         </div>
       </div>
     </div>

   </div>
 );
};

export default SettingsPage;