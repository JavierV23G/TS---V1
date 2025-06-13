// components/developer/settings/SettingsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../login/AuthContext'; // Import Auth context to get user data
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
      // All the massive notes configuration object from before
      patientInformation: {
        pastMedicalHistory: true,
        pastTherapyHistory: true,
        height: true,
        weight: true,
        weightBearingStatus: true,
        nursingDiagnosis: true,
        reasonsForReferral: true,
        therapyDiagnosis: true,
        additionalDisciplines: true,
        patientCaregiverExpectations: true,
        homeboundStatus: true,
        needsAssistanceForAllActivities: true,
        residualWeakness: true,
        requiresAssistanceToAmbulate: true,
        confusionUnableToGoOutOfHomeAlone: true,
        unableToSafelyLeaveHomeUnassisted: true,
        severeSOBUponExertion: true,
        dependentUponAdaptiveDevices: true,
        medicalRestrictions: true,
        requiresTaxingEffortToLeaveHome: true,
        bedridden: true,
        otherReasons: true,
        priorLevelOfFunction: true,
        surgicalProceduresHistory: true,
        hospitalizationDates: true
      },
      vitals: {
        atRest: {
          heartRate: true,
          bloodPressure: true,
          respirations: true,
          oxygenSaturation: true,
          temperature: true
        },
        afterExertion: {
          heartRate: true,
          bloodPressure: true,
          respirations: true,
          oxygenSaturation: true
        },
        vitalSignsAnalysis: {
          heartRateAnalysis: true,
          bloodPressureAnalysis: true,
          oxygenSaturationAnalysis: true,
          vitalsOutOfParameters: true
        },
        additionalNotes: true
      },
      pain: {
        isPatientExperiencingPain: true
      },
      medication: {
        hasMedicationChanged: true,
        additionalInformation: true,
        viewAddMedicationList: true
      },
      standardizedTests: {
        aceIII: true,
        tinetti: true,
        timedUpAndGo: true,
        functionalReach: true,
        berg: true,
        fallRiskAssessment: true,
        advancedBalance: true,
        mahc10: true,
        barthelIndex: true,
        shortPhysicalPerformanceBattery: true,
        nutritionalStatusAssessment: true,
        diabeticFootExam: true,
        katzIndex: true,
        woundAssessment: true,
        bradenScale: true,
        mobergHandFunctionTest: true,
        slumsExamination: true,
        fourStageBalanceTest: true,
        medicationList: true
      },
      objective: {
        patientSubjectiveExperience: true,
        orientation: {
          person: true,
          place: true,
          time: true
        },
        reasonForTherapy: true,
        shortTermMemory: true,
        longTermMemory: true,
        attentionConcentration: true,
        sequencing: true,
        safetyJudgement: true,
        initiationOfActivity: true,
        hardOfHearing: true,
        auditoryComprehension: true,
        visualComprehension: true,
        selfControl: true,
        problemSolving: true,
        copingSkills: true,
        ableToExpressNeeds: true,
        additionalInformation: true
      },
      assessment: {
        mobilityMovement: {
          decreasedROM: true,
          dysfunctionalPosture: true,
          impairedFunctionalMobility: true,
          dysfunctionalGait: true,
          impairedTransfers: true
        },
        strengthBalance: {
          impairedFunctionalStrength: true,
          impairedBalance: true,
          impairedCoordination: true,
          fallRisk: true
        },
        activityTolerance: {
          impairedFunctionalActivityTolerance: true,
          painRestrictingFunction: true,
          urinaryIncontinence: true
        },
        safetyAwareness: {
          impairedSafetyAwareness: true
        },
        tissueJointIssues: {
          softTissueDysfunction: true,
          jointHyperHypomobility: true
        },
        additionalInformation: true,
        patientToleratedTreatment: true,
        patientCouldNotTolerate: true,
        assessmentAdditionalInformation: true,
        rehabPotential: true,
        rehabPotentialAdditionalInformation: true,
        basicInterventions: {
          evaluation: true,
          therapeuticExercise: true,
          stretchingFlexibility: true,
          manualTherapy: true
        },
        mobilityTraining: {
          gaitTraining: true,
          transferTraining: true,
          balance: true,
          neuromuscularReeducation: true
        },
        safetyEducation: {
          safetyTraining: true,
          establishHomeProgram: true,
          selfCareManagement: true,
          voiceTrainingEducation: true
        },
        specializedInterventions: {
          painModalities: true,
          woundCare: true,
          chestPhysicalTherapy: true,
          prostheticTherapy: true,
          fallRiskTreatment: true
        },
        ptAndCGInvolvement: true,
        treatmentAdditionalInformation: true,
        skilledCareDetails: true
      },
      plan: {
        stgCompletedBy: true,
        ltgCompletedBy: true,
        adls: true,
        transfers: true,
        balance: true,
        strengthROMActivityTolerance: true,
        pain: true,
        homeProgramHEP: true,
        additionalFunctionalGoals: true,
        diseaseSpecificGoals: true
      },
      transfersADL: {
        basicTransfers: {
          sitStand: true,
          rollTurn: true,
          sitSupine: true
        },
        mobilityTransfers: {
          auto: true,
          bedWheelchair: true,
          scootBridge: true
        },
        functionalTransfers: {
          toilet: true,
          tub: true
        },
        assistanceLevelGuide: true,
        doesPatientHaveWheelchair: true,
        transfersAdditionalInformation: true,
        personalCare: {
          groomingHygiene: true,
          toileting: true,
          functionalMobility: true
        },
        domesticSkills: {
          telephoneUse: true,
          mealPreparation: true,
          medicationManagement: true
        },
        adlAdditionalInformation: true,
        katzIndex: true,
        barthelIndex: true
      },
      finale: {
        finalNotes: true,
        summary: true
      }
    }
  });

  // Loading Animation Effect
  useEffect(() => {
    const loadingSteps = [
      { text: 'Connecting to TherapySync Settings...', duration: 600 },
      { text: 'Loading user preferences...', duration: 400 },
      { text: 'Initializing premium interface...', duration: 500 },
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
      <div className="premium-loading-screen">
        <div className="loading-background"></div>
        <div className="loading-particles"></div>
        
        <div className="loading-content">
          <div className="loading-logo">
            <div className="logo-circle">
              <i className="fas fa-cog"></i>
            </div>
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
      {/* Premium Background Effects */}
      <div className="premium-background">
        <div className="background-image"></div>
        <div className="background-overlay"></div>
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>

      {/* Premium Header */}
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
                Premium Settings
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
           <div className="settings-module-content">
             <div className="module-header">
               <h2>
                 <i className="fas fa-sticky-note"></i>
                 Notes Configuration Center
               </h2>
               <p>Advanced clinical documentation settings - Configure every aspect of patient notes</p>
             </div>
             
             {/* Notes Configuration Summary */}
             <div className="premium-card notes-overview">
               <div className="card-header">
                 <h3>Configuration Overview</h3>
                 <p>Quick overview of your current notes configuration</p>
               </div>
               
               <div className="notes-stats-grid">
                 <div className="notes-stat-card patient-info">
                   <div className="stat-icon">
                     <i className="fas fa-user-md"></i>
                   </div>
                   <div className="stat-content">
                     <div className="stat-title">Patient Information</div>
                     <div className="stat-value">
                       {Object.values(settings.notes.patientInformation).filter(Boolean).length}/
                       {Object.keys(settings.notes.patientInformation).length}
                     </div>
                     <div className="stat-label">Fields Active</div>
                   </div>
                 </div>
                 
                 <div className="notes-stat-card vitals">
                   <div className="stat-icon">
                     <i className="fas fa-heartbeat"></i>
                   </div>
                   <div className="stat-content">
                     <div className="stat-title">Vitals</div>
                     <div className="stat-value">
                       {(Object.values(settings.notes.vitals.atRest).filter(Boolean).length + 
                         Object.values(settings.notes.vitals.afterExertion).filter(Boolean).length + 
                         Object.values(settings.notes.vitals.vitalSignsAnalysis).filter(Boolean).length + 
                         (settings.notes.vitals.additionalNotes ? 1 : 0))}
                     </div>
                     <div className="stat-label">Fields Active</div>
                   </div>
                 </div>
                 
                 <div className="notes-stat-card tests">
                   <div className="stat-icon">
                     <i className="fas fa-clipboard-check"></i>
                   </div>
                   <div className="stat-content">
                     <div className="stat-title">Standardized Tests</div>
                     <div className="stat-value">
                       {Object.values(settings.notes.standardizedTests).filter(Boolean).length}/
                       {Object.keys(settings.notes.standardizedTests).length}
                     </div>
                     <div className="stat-label">Tests Enabled</div>
                   </div>
                 </div>
                 
                 <div className="notes-stat-card assessment">
                   <div className="stat-icon">
                     <i className="fas fa-clipboard-list"></i>
                   </div>
                   <div className="stat-content">
                     <div className="stat-title">Assessment</div>
                     <div className="stat-value">Advanced</div>
                     <div className="stat-label">Configuration</div>
                   </div>
                 </div>
               </div>
               
               <div className="notes-actions">
                 <button className="notes-action-btn enable-all">
                   <i className="fas fa-check-double"></i>
                   <span>Enable All</span>
                 </button>
                 <button className="notes-action-btn disable-all">
                   <i className="fas fa-times"></i>
                   <span>Disable All</span>
                 </button>
                 <button className="notes-action-btn reset-defaults">
                   <i className="fas fa-undo"></i>
                   <span>Reset Defaults</span>
                 </button>
               </div>
             </div>

             {/* Expandable Notes Sections */}
             <div className="notes-sections">
               {/* Patient Information Section */}
               <div className="notes-section patient-information">
                 <div 
                   className="notes-section-header"
                   onClick={() => toggleCardExpansion('patientInfo')}
                 >
                   <div className="section-left">
                     <div className="section-icon patient-info">
                       <i className="fas fa-user-md"></i>
                     </div>
                     <div className="section-title">
                       <h3>Patient Information</h3>
                       <p>Medical history, measurements, and clinical data</p>
                     </div>
                   </div>
                   <div className="section-right">
                     <div className="section-count">
                       {Object.values(settings.notes.patientInformation).filter(Boolean).length} active
                     </div>
                     <i className={`fas fa-chevron-${expandedCards.patientInfo ? 'up' : 'down'}`}></i>
                   </div>
                 </div>
                 
                 {expandedCards.patientInfo && (
                   <div className="notes-section-content">
                     <div className="notes-subsection">
                       <h4>Medical History</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'pastMedicalHistory', 'patientInformation',
                           'Past Medical History', 'Document previous medical conditions and treatments',
                           'fas fa-file-medical-alt'
                         )}
                         {renderToggleOption(
                           'notes', 'pastTherapyHistory', 'patientInformation',
                           'Past Therapy History', 'Track previous therapy sessions and outcomes',
                           'fas fa-history'
                         )}
                         {renderToggleOption(
                           'notes', 'surgicalProceduresHistory', 'patientInformation',
                           'Surgical Procedures History', 'Record surgical intervention history',
                           'fas fa-user-md'
                         )}
                         {renderToggleOption(
                           'notes', 'hospitalizationDates', 'patientInformation',
                           'Hospitalization Dates', 'Track hospitalization periods if applicable',
                           'fas fa-hospital'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Physical Measurements</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'height', 'patientInformation',
                           'Height', 'Record patient height measurements',
                           'fas fa-ruler-vertical'
                         )}
                         {renderToggleOption(
                           'notes', 'weight', 'patientInformation',
                           'Weight', 'Track patient weight measurements',
                           'fas fa-weight'
                         )}
                         {renderToggleOption(
                           'notes', 'weightBearingStatus', 'patientInformation',
                           'Weight Bearing Status', 'Document weight bearing restrictions and capabilities',
                           'fas fa-walking'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Clinical Information</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'nursingDiagnosis', 'patientInformation',
                           'Nursing Diagnosis', 'Include nursing diagnosis and assessments',
                           'fas fa-stethoscope'
                         )}
                         {renderToggleOption(
                           'notes', 'reasonsForReferral', 'patientInformation',
                           'Reasons for Referral', 'Document why patient was referred for therapy',
                           'fas fa-clipboard-list'
                         )}
                         {renderToggleOption(
                           'notes', 'therapyDiagnosis', 'patientInformation',
                           'Therapy Diagnosis', 'Include therapy-specific diagnosis and ICD codes',
                           'fas fa-diagnoses'
                         )}
                         {renderToggleOption(
                           'notes', 'additionalDisciplines', 'patientInformation',
                           'Additional Disciplines', 'Track other healthcare disciplines involved',
                           'fas fa-users-cog'
                         )}
                         {renderToggleOption(
                           'notes', 'patientCaregiverExpectations', 'patientInformation',
                           'Patient/Caregiver Expectations', 'Record patient and family treatment expectations',
                           'fas fa-comments'
                         )}
                         {renderToggleOption(
                           'notes', 'priorLevelOfFunction', 'patientInformation',
                           'Prior Level of Function', 'Document baseline functional capabilities',
                           'fas fa-chart-line'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Homebound Status</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'homeboundStatus', 'patientInformation',
                           'Homebound Status', 'Assess and document homebound qualification',
                           'fas fa-home'
                         )}
                         {renderToggleOption(
                           'notes', 'needsAssistanceForAllActivities', 'patientInformation',
                           'Needs Assistance for All Activities', 'Requires help with daily activities',
                           'fas fa-hands-helping'
                         )}
                         {renderToggleOption(
                           'notes', 'residualWeakness', 'patientInformation',
                           'Residual Weakness', 'Document persistent weakness from illness/injury',
                           'fas fa-user-injured'
                         )}
                         {renderToggleOption(
                           'notes', 'requiresAssistanceToAmbulate', 'patientInformation',
                           'Requires Assistance to Ambulate', 'Needs help with walking or mobility',
                           'fas fa-walking'
                         )}
                         {renderToggleOption(
                           'notes', 'confusionUnableToGoOutOfHomeAlone', 'patientInformation',
                           'Confusion - Unable to Go Out Alone', 'Cognitive limitations affecting independence',
                           'fas fa-brain'
                         )}
                         {renderToggleOption(
                           'notes', 'unableToSafelyLeaveHomeUnassisted', 'patientInformation',
                           'Unable to Safely Leave Home Unassisted', 'Safety concerns for independent mobility',
                           'fas fa-shield-alt'
                         )}
                         {renderToggleOption(
                           'notes', 'severeSOBUponExertion', 'patientInformation',
                           'Severe SOB Upon Exertion', 'Significant shortness of breath with activity',
                           'fas fa-lungs'
                         )}
                         {renderToggleOption(
                           'notes', 'dependentUponAdaptiveDevices', 'patientInformation',
                           'Dependent Upon Adaptive Devices', 'Requires assistive equipment for function',
                           'fas fa-crutch'
                         )}
                         {renderToggleOption(
                           'notes', 'medicalRestrictions', 'patientInformation',
                           'Medical Restrictions', 'Physician-ordered activity restrictions',
                           'fas fa-ban'
                         )}
                         {renderToggleOption(
                           'notes', 'requiresTaxingEffortToLeaveHome', 'patientInformation',
                           'Requires Taxing Effort to Leave Home', 'Excessive effort needed for home exit',
                           'fas fa-tired'
                         )}
                         {renderToggleOption(
                           'notes', 'bedridden', 'patientInformation',
                           'Bedridden', 'Patient is confined to bed',
                           'fas fa-bed'
                         )}
                         {renderToggleOption(
                           'notes', 'otherReasons', 'patientInformation',
                           'Other Homebound Reasons', 'Additional qualifying homebound factors',
                           'fas fa-ellipsis-h'
                         )}
                       </div>
                     </div>
                   </div>
                 )}
               </div>

               {/* Vitals Section */}
               <div className="notes-section vitals">
                 <div 
                   className="notes-section-header"
                   onClick={() => toggleCardExpansion('vitals')}
                 >
                   <div className="section-left">
                     <div className="section-icon vitals">
                       <i className="fas fa-heartbeat"></i>
                     </div>
                     <div className="section-title">
                       <h3>Vitals Configuration</h3>
                       <p>Heart rate, blood pressure, respiratory measurements</p>
                     </div>
                   </div>
                   <div className="section-right">
                     <div className="section-count">
                       {(Object.values(settings.notes.vitals.atRest).filter(Boolean).length + 
                         Object.values(settings.notes.vitals.afterExertion).filter(Boolean).length + 
                         Object.values(settings.notes.vitals.vitalSignsAnalysis).filter(Boolean).length + 
                         (settings.notes.vitals.additionalNotes ? 1 : 0))} active
                     </div>
                     <i className={`fas fa-chevron-${expandedCards.vitals ? 'up' : 'down'}`}></i>
                   </div>
                 </div>
                 
                 {expandedCards.vitals && (
                   <div className="notes-section-content">
                     <div className="notes-subsection">
                       <h4>At Rest Measurements</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'heartRate', 'vitals.atRest',
                           'Heart Rate at Rest', 'Record baseline heart rate measurement',
                           'fas fa-heartbeat'
                         )}
                         {renderToggleOption(
                           'notes', 'bloodPressure', 'vitals.atRest',
                           'Blood Pressure at Rest', 'Document systolic and diastolic pressure',
                           'fas fa-thermometer-half'
                         )}
                         {renderToggleOption(
                           'notes', 'respirations', 'vitals.atRest',
                           'Respirations at Rest', 'Count breaths per minute at baseline',
                           'fas fa-lungs'
                         )}
                         {renderToggleOption(
                           'notes', 'oxygenSaturation', 'vitals.atRest',
                           'Oxygen Saturation at Rest', 'Measure O2 saturation percentage at baseline',
                           'fas fa-tint'
                         )}
                         {renderToggleOption(
                           'notes', 'temperature', 'vitals.atRest',
                           'Body Temperature', 'Record core body temperature',
                           'fas fa-temperature-high'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>After Exertion Measurements</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'heartRate', 'vitals.afterExertion',
                           'Heart Rate After Exertion', 'Monitor heart rate response to activity',
                           'fas fa-heartbeat'
                         )}
                         {renderToggleOption(
                           'notes', 'bloodPressure', 'vitals.afterExertion',
                           'Blood Pressure After Exertion', 'Track BP response to physical activity',
                           'fas fa-thermometer-half'
                         )}
                         {renderToggleOption(
                           'notes', 'respirations', 'vitals.afterExertion',
                           'Respirations After Exertion', 'Monitor breathing rate post-activity',
                           'fas fa-lungs'
                         )}
                         {renderToggleOption(
                           'notes', 'oxygenSaturation', 'vitals.afterExertion',
                           'Oxygen Saturation After Exertion', 'Assess O2 saturation during recovery',
                           'fas fa-tint'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Vital Signs Analysis</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'heartRateAnalysis', 'vitals.vitalSignsAnalysis',
                           'Heart Rate Analysis', 'Automated analysis of heart rate patterns',
                           'fas fa-chart-line'
                         )}
                         {renderToggleOption(
                           'notes', 'bloodPressureAnalysis', 'vitals.vitalSignsAnalysis',
                           'Blood Pressure Analysis', 'Automated BP trend analysis and alerts',
                           'fas fa-chart-area'
                         )}
                         {renderToggleOption(
                           'notes', 'oxygenSaturationAnalysis', 'vitals.vitalSignsAnalysis',
                           'Oxygen Saturation Analysis', 'Automated O2 saturation trend monitoring',
                           'fas fa-chart-bar'
                         )}
                         {renderToggleOption(
                           'notes', 'vitalsOutOfParameters', 'vitals.vitalSignsAnalysis',
                           'Out of Parameters Alert', 'Automatic alerts for abnormal vital signs',
                           'fas fa-exclamation-triangle'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Additional Documentation</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'additionalNotes', 'vitals',
                           'Additional Vitals Notes', 'Free-text field for additional vital signs observations',
                           'fas fa-sticky-note'
                         )}
                       </div>
                     </div>
                   </div>
                 )}
               </div>

               {/* Standardized Tests Section */}
               <div className="notes-section standardized-tests">
                 <div 
                   className="notes-section-header"
                   onClick={() => toggleCardExpansion('standardizedTests')}
                 >
                   <div className="section-left">
                     <div className="section-icon tests">
                       <i className="fas fa-clipboard-check"></i>
                     </div>
                     <div className="section-title">
                       <h3>Standardized Tests</h3>
                       <p>Clinical assessment tools and standardized evaluations</p>
                     </div>
                   </div>
                   <div className="section-right">
                     <div className="section-count">
                       {Object.values(settings.notes.standardizedTests).filter(Boolean).length}/
                       {Object.keys(settings.notes.standardizedTests).length} enabled
                     </div>
                     <i className={`fas fa-chevron-${expandedCards.standardizedTests ? 'up' : 'down'}`}></i>
                   </div>
                 </div>
                 
                 {expandedCards.standardizedTests && (
                   <div className="notes-section-content">
                     <div className="notes-subsection">
                       <h4>Available Assessment Tools</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'aceIII', 'standardizedTests',
                           'ACE III', 'Addenbrooke\'s Cognitive Examination III',
                           'fas fa-brain'
                         )}
                         {renderToggleOption(
                           'notes', 'tinetti', 'standardizedTests',
                           'Tinetti Balance Assessment', 'Balance and gait evaluation tool',
                           'fas fa-walking'
                         )}
                         {renderToggleOption(
                           'notes', 'timedUpAndGo', 'standardizedTests',
                           'Timed Up and Go Test', 'Functional mobility assessment',
                           'fas fa-stopwatch'
                         )}
                         {renderToggleOption(
                           'notes', 'functionalReach', 'standardizedTests',
                           'Functional Reach Test', 'Balance and stability assessment',
                           'fas fa-hand-paper'
                         )}
                         {renderToggleOption(
                           'notes', 'berg', 'standardizedTests',
                           'Berg Balance Scale', 'Comprehensive balance evaluation',
                           'fas fa-balance-scale'
                         )}
                         {renderToggleOption(
                           'notes', 'fallRiskAssessment', 'standardizedTests',
                           'Fall Risk Assessment', 'Comprehensive fall risk evaluation',
                           'fas fa-exclamation-triangle'
                         )}
                         {renderToggleOption(
                           'notes', 'advancedBalance', 'standardizedTests',
                           'Advanced Balance Assessment', 'Complex balance testing protocols',
                           'fas fa-balance-scale-right'
                         )}
                         {renderToggleOption(
                           'notes', 'mahc10', 'standardizedTests',
                           'MAHC-10', 'Modified Activities-specific Balance Confidence Scale',
                           'fas fa-home'
                         )}
                         {renderToggleOption(
                           'notes', 'barthelIndex', 'standardizedTests',
                           'Barthel Index', 'Activities of Daily Living assessment',
                           'fas fa-list-ol'
                         )}
                         {renderToggleOption(
                           'notes', 'shortPhysicalPerformanceBattery', 'standardizedTests',
                           'Short Physical Performance Battery', 'SPPB lower extremity function test',
                           'fas fa-running'
                         )}
                         {renderToggleOption(
                           'notes', 'nutritionalStatusAssessment', 'standardizedTests',
                           'Nutritional Status Assessment', 'Comprehensive nutrition evaluation',
                           'fas fa-apple-alt'
                         )}
                         {renderToggleOption(
                           'notes', 'diabeticFootExam', 'standardizedTests',
                           'Diabetic Foot Examination', 'Specialized diabetic foot assessment',
                           'fas fa-foot-print'
                         )}
                         {renderToggleOption(
                           'notes', 'katzIndex', 'standardizedTests',
                           'Katz Index of Independence', 'ADL independence assessment',
                           'fas fa-user-check'
                         )}
                         {renderToggleOption(
                           'notes', 'woundAssessment', 'standardizedTests',
                           'Wound Assessment Protocol', 'Comprehensive wound evaluation',
                           'fas fa-band-aid'
                         )}
                         {renderToggleOption(
                           'notes', 'bradenScale', 'standardizedTests',
                           'Braden Scale', 'Pressure ulcer risk assessment',
                           'fas fa-bed'
                         )}
                         {renderToggleOption(
                           'notes', 'mobergHandFunctionTest', 'standardizedTests',
                           'Moberg Hand Function Test', 'Hand dexterity and sensation assessment',
                           'fas fa-hand-rock'
                         )}
                         {renderToggleOption(
                           'notes', 'slumsExamination', 'standardizedTests',
                           'SLUMS Examination', 'Saint Louis University Mental Status Exam',
                           'fas fa-search'
                         )}
                         {renderToggleOption(
                           'notes', 'fourStageBalanceTest', 'standardizedTests',
                           'Four Stage Balance Test', 'Progressive balance challenge assessment',
                           'fas fa-layer-group'
                         )}
                         {renderToggleOption(
                           'notes', 'medicationList', 'standardizedTests',
                           'Standardized Medication List', 'Comprehensive medication documentation',
                           'fas fa-prescription-bottle-alt'
                         )}
                       </div>
                     </div>
                   </div>
                 )}
               </div>

               {/* Assessment Section */}
               <div className="notes-section assessment">
                 <div 
                   className="notes-section-header"
                   onClick={() => toggleCardExpansion('assessment')}
                 >
                   <div className="section-left">
                     <div className="section-icon assessment">
                       <i className="fas fa-clipboard-list"></i>
                     </div>
                     <div className="section-title">
                       <h3>Assessment Configuration</h3>
                       <p>Problem identification, treatment planning, and clinical reasoning</p>
                     </div>
                   </div>
                   <div className="section-right">
                     <div className="section-count">Advanced</div>
                     <i className={`fas fa-chevron-${expandedCards.assessment ? 'up' : 'down'}`}></i>
                   </div>
                 </div>
                 
                 {expandedCards.assessment && (
                   <div className="notes-section-content">
                     <div className="notes-subsection">
                       <h4>Problem List / Functional Limitations</h4>
                       
                       <div className="sub-category">
                         <h5>Mobility & Movement</h5>
                         <div className="settings-grid">
                           {renderToggleOption(
                             'notes', 'decreasedROM', 'assessment.mobilityMovement',
                             'Decreased Range of Motion', 'Joint mobility limitations and restrictions',
                             'fas fa-expand-arrows-alt'
                           )}
                           {renderToggleOption(
                             'notes', 'dysfunctionalPosture', 'assessment.mobilityMovement',
                             'Dysfunctional Posture', 'Postural alignment and positioning issues',
                             'fas fa-user'
                           )}
                           {renderToggleOption(
                             'notes', 'impairedFunctionalMobility', 'assessment.mobilityMovement',
                             'Impaired Functional Mobility', 'Limitations in functional movement patterns',
                             'fas fa-wheelchair'
                           )}
                           {renderToggleOption(
                             'notes', 'dysfunctionalGait', 'assessment.mobilityMovement',
                             'Dysfunctional Gait Pattern', 'Walking pattern abnormalities and deviations',
                             'fas fa-walking'
                           )}
                           {renderToggleOption(
                             'notes', 'impairedTransfers', 'assessment.mobilityMovement',
                             'Impaired Transfer Ability', 'Difficulty with position changes and transfers',
                             'fas fa-exchange-alt'
                           )}
                         </div>
                       </div>
                       
                       <div className="sub-category">
                         <h5>Strength & Balance</h5>
                         <div className="settings-grid">
                           {renderToggleOption(
                             'notes', 'impairedFunctionalStrength', 'assessment.strengthBalance',
                             'Impaired Functional Strength', 'Strength deficits affecting daily function',
                             'fas fa-dumbbell'
                           )}
                           {renderToggleOption(
                             'notes', 'impairedBalance', 'assessment.strengthBalance',
                             'Impaired Balance', 'Static and dynamic balance deficits',
                             'fas fa-balance-scale'
                           )}
                           {renderToggleOption(
                             'notes', 'impairedCoordination', 'assessment.strengthBalance',
                             'Impaired Coordination', 'Motor coordination and control difficulties',
                             'fas fa-hand-paper'
                           )}
                           {renderToggleOption(
                             'notes', 'fallRisk', 'assessment.strengthBalance',
                             'Increased Fall Risk', 'Elevated risk for falls and injuries',
                             'fas fa-exclamation-triangle'
                           )}
                         </div>
                       </div>
                       
                       <div className="sub-category">
                         <h5>Activity Tolerance & Endurance</h5>
                         <div className="settings-grid">
                           {renderToggleOption(
                             'notes', 'impairedFunctionalActivityTolerance', 'assessment.activityTolerance',
                             'Impaired Activity Tolerance', 'Reduced endurance and activity capacity',
                             'fas fa-battery-quarter'
                           )}
                           {renderToggleOption(
                             'notes', 'painRestrictingFunction', 'assessment.activityTolerance',
                             'Pain Restricting Function', 'Pain limiting participation in activities',
                             'fas fa-user-injured'
                           )}
                           {renderToggleOption(
                             'notes', 'urinaryIncontinence', 'assessment.activityTolerance',
                             'Urinary Incontinence (affecting mobility)', 'Incontinence impacting movement and function',
                             'fas fa-tint'
                           )}
                         </div>
                       </div>
                       
                       <div className="sub-category">
                         <h5>Safety & Awareness</h5>
                         <div className="settings-grid">
                           {renderToggleOption(
                             'notes', 'impairedSafetyAwareness', 'assessment.safetyAwareness',
                             'Impaired Safety Awareness', 'Poor safety judgment and risk recognition',
                             'fas fa-shield-alt'
                           )}
                         </div>
                       </div>
                       
                       <div className="sub-category">
                         <h5>Tissue & Joint Issues</h5>
                         <div className="settings-grid">
                           {renderToggleOption(
                             'notes', 'softTissueDysfunction', 'assessment.tissueJointIssues',
                             'Soft Tissue Dysfunction', 'Muscle, tendon, and ligament impairments',
                             'fas fa-hand-holding-medical'
                           )}
                           {renderToggleOption(
                             'notes', 'jointHyperHypomobility', 'assessment.tissueJointIssues',
                             'Joint Hyper/Hypomobility', 'Joint mobility disorders and restrictions',
                             'fas fa-bone'
                           )}
                         </div>
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Treatment Interventions</h4>
                       
                       <div className="sub-category">
                         <h5>Basic Interventions</h5>
                         <div className="settings-grid">
                           {renderToggleOption(
                             'notes', 'evaluation', 'assessment.basicInterventions',
                             'Initial Evaluation', 'Comprehensive baseline assessment',
                             'fas fa-search'
                           )}
                           {renderToggleOption(
                             'notes', 'therapeuticExercise', 'assessment.basicInterventions',
                             'Therapeutic Exercise', 'Structured exercise interventions',
                             'fas fa-dumbbell'
                           )}
                           {renderToggleOption(
                             'notes', 'stretchingFlexibility', 'assessment.basicInterventions',
                             'Stretching & Flexibility', 'Range of motion and flexibility training',
                             'fas fa-expand-arrows-alt'
                           )}
                           {renderToggleOption(
                             'notes', 'manualTherapy', 'assessment.basicInterventions',
                             'Manual Therapy Techniques', 'Hands-on therapeutic interventions',
                             'fas fa-hands'
                           )}
                         </div>
                       </div>
                       
                       <div className="sub-category">
                         <h5>Mobility Training</h5>
                         <div className="settings-grid">
                           {renderToggleOption(
                             'notes', 'gaitTraining', 'assessment.mobilityTraining',
                             'Gait Training', 'Walking pattern improvement and training',
                             'fas fa-walking'
                           )}
                           {renderToggleOption(
                             'notes', 'transferTraining', 'assessment.mobilityTraining',
                             'Transfer Training', 'Safe transfer technique instruction',
                             'fas fa-exchange-alt'
                           )}
                           {renderToggleOption(
                             'notes', 'balance', 'assessment.mobilityTraining',
                             'Balance Training', 'Static and dynamic balance improvement',
                             'fas fa-balance-scale'
                           )}
                           {renderToggleOption(
                             'notes', 'neuromuscularReeducation', 'assessment.mobilityTraining',
                             'Neuromuscular Re-education', 'Motor pattern retraining and facilitation',
                             'fas fa-brain'
                           )}
                         </div>
                       </div>
                       
                       <div className="sub-category">
                         <h5>Education & Safety</h5>
                         <div className="settings-grid">
                           {renderToggleOption(
                             'notes', 'safetyTraining', 'assessment.safetyEducation',
                             'Safety Training', 'Safety awareness and fall prevention education',
                             'fas fa-shield-alt'
                           )}
                           {renderToggleOption(
                             'notes', 'establishHomeProgram', 'assessment.safetyEducation',
                             'Home Exercise Program', 'Development of independent exercise routine',
                             'fas fa-home'
                           )}
                           {renderToggleOption(
                             'notes', 'selfCareManagement', 'assessment.safetyEducation',
                             'Self-Care Management', 'ADL training and independence strategies',
                             'fas fa-user-check'
                           )}
                           {renderToggleOption(
                             'notes', 'voiceTrainingEducation', 'assessment.safetyEducation',
                             'Voice Training & Education', 'Communication and vocal instruction',
                             'fas fa-microphone'
                           )}
                         </div>
                       </div>
                       
                       <div className="sub-category">
                         <h5>Specialized Interventions</h5>
                         <div className="settings-grid">
                           {renderToggleOption(
                             'notes', 'painModalities', 'assessment.specializedInterventions',
                             'Pain Management Modalities', 'Therapeutic modalities for pain relief',
                             'fas fa-thermometer-half'
                           )}
                           {renderToggleOption(
                             'notes', 'woundCare', 'assessment.specializedInterventions',
                             'Wound Care Management', 'Specialized wound treatment and care',
                             'fas fa-band-aid'
                           )}
                           {renderToggleOption(
                             'notes', 'chestPhysicalTherapy', 'assessment.specializedInterventions',
                             'Chest Physical Therapy', 'Respiratory and pulmonary interventions',
                             'fas fa-lungs'
                           )}
                           {renderToggleOption(
                             'notes', 'prostheticTherapy', 'assessment.specializedInterventions',
                             'Prosthetic Training', 'Prosthetic device training and adaptation',
                             'fas fa-crutch'
                           )}
                           {renderToggleOption(
                             'notes', 'fallRiskTreatment', 'assessment.specializedInterventions',
                             'Fall Risk Treatment', 'Targeted fall prevention interventions',
                             'fas fa-exclamation-triangle'
                           )}
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
               </div>

               {/* Objective Section */}
               <div className="notes-section objective">
                 <div 
                   className="notes-section-header"
                   onClick={() => toggleCardExpansion('objective')}
                 >
                   <div className="section-left">
                     <div className="section-icon objective">
                       <i className="fas fa-eye"></i>
                     </div>
                     <div className="section-title">
                       <h3>Objective Assessment</h3>
                       <p>Cognitive evaluation, orientation, and functional observations</p>
                     </div>
                   </div>
                   <div className="section-right">
                     <div className="section-count">
                       {Object.values(settings.notes.objective).filter(val => 
                         typeof val === 'boolean' ? val : Object.values(val || {}).some(Boolean)
                       ).length} active
                     </div>
                     <i className={`fas fa-chevron-${expandedCards.objective ? 'up' : 'down'}`}></i>
                   </div>
                 </div>
                 
                 {expandedCards.objective && (
                   <div className="notes-section-content">
                     <div className="notes-subsection">
                       <h4>Subjective Experience</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'patientSubjectiveExperience', 'objective',
                           'Patient\'s Subjective Experience', 'Patient-reported symptoms and concerns',
                           'fas fa-comment-dots'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Cognitive Status & Orientation</h4>
                       <div className="sub-category">
                         <h5>Orientation Assessment</h5>
                         <div className="settings-grid">
                           {renderToggleOption(
                             'notes', 'person', 'objective.orientation',
                             'Orientation to Person', 'Awareness of self and others',
                             'fas fa-user'
                           )}
                           {renderToggleOption(
                             'notes', 'place', 'objective.orientation',
                             'Orientation to Place', 'Awareness of location and environment',
                             'fas fa-map-marker-alt'
                           )}
                           {renderToggleOption(
                             'notes', 'time', 'objective.orientation',
                             'Orientation to Time', 'Awareness of date, time, and temporal relationships',
                             'fas fa-clock'
                           )}
                         </div>
                       </div>
                       
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'reasonForTherapy', 'objective',
                           'Understanding Reason for Therapy', 'Patient comprehension of treatment purpose',
                           'fas fa-question-circle'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Memory Assessment</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'shortTermMemory', 'objective',
                           'Short-Term Memory', 'Recent memory and immediate recall abilities',
                           'fas fa-brain'
                         )}
                         {renderToggleOption(
                           'notes', 'longTermMemory', 'objective',
                           'Long-Term Memory', 'Remote memory and stored information recall',
                           'fas fa-history'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Attention & Processing</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'attentionConcentration', 'objective',
                           'Attention & Concentration', 'Sustained attention and focus abilities',
                           'fas fa-eye'
                         )}
                         {renderToggleOption(
                           'notes', 'sequencing', 'objective',
                           'Sequencing Abilities', 'Step-by-step task organization and execution',
                           'fas fa-sort-numeric-down'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Safety & Independence</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'safetyJudgement', 'objective',
                           'Safety Judgment', 'Risk assessment and safety decision-making',
                           'fas fa-shield-alt'
                         )}
                         {renderToggleOption(
                           'notes', 'initiationOfActivity', 'objective',
                           'Activity Initiation', 'Ability to begin tasks independently',
                           'fas fa-play'
                         )}
                         {renderToggleOption(
                           'notes', 'hardOfHearing', 'objective',
                           'Hearing Status', 'Auditory acuity and hearing difficulties',
                           'fas fa-deaf'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Comprehension & Communication</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'auditoryComprehension', 'objective',
                           'Auditory Comprehension', 'Understanding of spoken language and instructions',
                           'fas fa-ear'
                         )}
                         {renderToggleOption(
                           'notes', 'visualComprehension', 'objective',
                           'Visual Comprehension', 'Understanding of visual information and cues',
                           'fas fa-eye'
                         )}
                         {renderToggleOption(
                           'notes', 'selfControl', 'objective',
                           'Self-Control', 'Emotional regulation and impulse control',
                           'fas fa-hand-paper'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Functional Skills</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'problemSolving', 'objective',
                           'Problem-Solving Skills', 'Cognitive problem-solving and reasoning abilities',
                           'fas fa-puzzle-piece'
                         )}
                         {renderToggleOption(
                           'notes', 'copingSkills', 'objective',
                           'Coping Strategies', 'Stress management and adaptive coping mechanisms',
                           'fas fa-heart'
                         )}
                         {renderToggleOption(
                           'notes', 'ableToExpressNeeds', 'objective',
                           'Expression of Needs', 'Ability to communicate needs and preferences',
                           'fas fa-comments'
                         )}
                         {renderToggleOption(
                           'notes', 'additionalInformation', 'objective',
                           'Additional Objective Information', 'Supplementary objective observations',
                           'fas fa-plus-circle'
                         )}
                       </div>
                     </div>
                   </div>
                 )}
               </div>

               {/* Plan Section */}
               <div className="notes-section plan">
                 <div 
                   className="notes-section-header"
                   onClick={() => toggleCardExpansion('plan')}
                 >
                   <div className="section-left">
                     <div className="section-icon plan">
                       <i className="fas fa-calendar-check"></i>
                     </div>
                     <div className="section-title">
                       <h3>Treatment Plan</h3>
                       <p>Goal setting, timelines, and treatment objectives</p>
                     </div>
                   </div>
                   <div className="section-right">
                     <div className="section-count">
                       {Object.values(settings.notes.plan).filter(Boolean).length} active
                     </div>
                     <i className={`fas fa-chevron-${expandedCards.plan ? 'up' : 'down'}`}></i>
                   </div>
                 </div>
                 
                 {expandedCards.plan && (
                   <div className="notes-section-content">
                     <div className="notes-subsection">
                       <h4>Goal Timelines</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'stgCompletedBy', 'plan',
                           'Short-Term Goal Timeline', 'Target completion dates for short-term objectives',
                           'fas fa-flag-checkered'
                         )}
                         {renderToggleOption(
                           'notes', 'ltgCompletedBy', 'plan',
                           'Long-Term Goal Timeline', 'Target completion dates for long-term objectives',
                           'fas fa-flag'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Goal Categories</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'adls', 'plan',
                           'Activities of Daily Living Goals', 'Self-care and daily living skill objectives',
                           'fas fa-user-check'
                         )}
                         {renderToggleOption(
                           'notes', 'transfers', 'plan',
                           'Transfer Goals', 'Position change and mobility objectives',
                           'fas fa-exchange-alt'
                         )}
                         {renderToggleOption(
                           'notes', 'balance', 'plan',
                           'Balance Goals', 'Static and dynamic balance improvement objectives',
                           'fas fa-balance-scale'
                         )}
                         {renderToggleOption(
                           'notes', 'strengthROMActivityTolerance', 'plan',
                           'Strength/ROM/Activity Tolerance Goals', 'Physical capacity improvement objectives',
                           'fas fa-dumbbell'
                         )}
                         {renderToggleOption(
                           'notes', 'pain', 'plan',
                           'Pain Management Goals', 'Pain reduction and management objectives',
                           'fas fa-user-injured'
                         )}
                         {renderToggleOption(
                           'notes', 'homeProgramHEP', 'plan',
                           'Home Exercise Program Goals', 'Independent exercise compliance objectives',
                           'fas fa-home'
                         )}
                         {renderToggleOption(
                           'notes', 'Additional Functional Goals', 'Supplementary functional improvement objectives',
                           'fas fa-plus-circle'
                         )}
                         {renderToggleOption(
                           'notes', 'diseaseSpecificGoals', 'plan',
                           'Disease-Specific Goals', 'Condition-specific treatment objectives',
                           'fas fa-stethoscope'
                         )}
                       </div>
                     </div>
                   </div>
                 )}
               </div>

               {/* Transfers/ADL Section */}
               <div className="notes-section transfers-adl">
                 <div 
                   className="notes-section-header"
                   onClick={() => toggleCardExpansion('transfersADL')}
                 >
                   <div className="section-left">
                     <div className="section-icon transfers">
                       <i className="fas fa-exchange-alt"></i>
                     </div>
                     <div className="section-title">
                       <h3>Transfers & ADL Assessment</h3>
                       <p>Functional independence and daily living skill evaluation</p>
                     </div>
                   </div>
                   <div className="section-right">
                     <div className="section-count">
                       {Object.values(settings.notes.transfersADL).filter(val => 
                         typeof val === 'boolean' ? val : Object.values(val || {}).some(Boolean)
                       ).length} active
                     </div>
                     <i className={`fas fa-chevron-${expandedCards.transfersADL ? 'up' : 'down'}`}></i>
                   </div>
                 </div>
                 
                 {expandedCards.transfersADL && (
                   <div className="notes-section-content">
                     <div className="notes-subsection">
                       <h4>Transfer Assessment</h4>
                       
                       <div className="sub-category">
                         <h5>Basic Transfers</h5>
                         <div className="settings-grid">
                           {renderToggleOption(
                             'notes', 'sitStand', 'transfersADL.basicTransfers',
                             'Sit to Stand Transfer', 'Assessment of sitting to standing transition',
                             'fas fa-chair'
                           )}
                           {renderToggleOption(
                             'notes', 'rollTurn', 'transfersADL.basicTransfers',
                             'Rolling & Turning in Bed', 'Bed mobility and position change assessment',
                             'fas fa-redo'
                           )}
                           {renderToggleOption(
                             'notes', 'sitSupine', 'transfersADL.basicTransfers',
                             'Sitting to Supine Transfer', 'Transition from sitting to lying position',
                             'fas fa-bed'
                           )}
                         </div>
                       </div>
                       
                       <div className="sub-category">
                         <h5>Mobility Transfers</h5>
                         <div className="settings-grid">
                           {renderToggleOption(
                             'notes', 'auto', 'transfersADL.mobilityTransfers',
                             'Car Transfer Assessment', 'Vehicle entry and exit evaluation',
                             'fas fa-car'
                           )}
                           {renderToggleOption(
                             'notes', 'bedWheelchair', 'transfersADL.mobilityTransfers',
                             'Bed to Wheelchair Transfer', 'Bed-wheelchair transfer assessment',
                             'fas fa-wheelchair'
                           )}
                           {renderToggleOption(
                             'notes', 'scootBridge', 'transfersADL.mobilityTransfers',
                             'Scooting & Bridging', 'Bed repositioning and bridging movements',
                             'fas fa-arrows-alt'
                           )}
                         </div>
                       </div>
                       
                       <div className="sub-category">
                         <h5>Functional Transfers</h5>
                         <div className="settings-grid">
                           {renderToggleOption(
                             'notes', 'toilet', 'transfersADL.functionalTransfers',
                             'Toilet Transfer', 'Bathroom transfer safety and independence',
                             'fas fa-restroom'
                           )}
                           {renderToggleOption(
                             'notes', 'tub', 'transfersADL.functionalTransfers',
                             'Bathtub Transfer', 'Bathing transfer assessment and safety',
                             'fas fa-bath'
                           )}
                         </div>
                       </div>
                       
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'assistanceLevelGuide', 'transfersADL',
                           'Assistance Level Guide', 'Display assistance level reference and color coding',
                           'fas fa-info-circle'
                         )}
                         {renderToggleOption(
                           'notes', 'doesPatientHaveWheelchair', 'transfersADL',
                           'Wheelchair Availability', 'Document patient wheelchair access and type',
                           'fas fa-wheelchair'
                         )}
                         {renderToggleOption(
                           'notes', 'transfersAdditionalInformation', 'transfersADL',
                           'Additional Transfer Information', 'Supplementary transfer assessment notes',
                           'fas fa-sticky-note'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Activities of Daily Living</h4>
                       
                       <div className="sub-category">
                         <h5>Personal Care Skills</h5>
                         <div className="settings-grid">
                           {renderToggleOption(
                             'notes', 'groomingHygiene', 'transfersADL.personalCare',
                             'Grooming & Hygiene', 'Personal grooming and hygiene independence',
                             'fas fa-shower'
                           )}
                           {renderToggleOption(
                             'notes', 'toileting', 'transfersADL.personalCare',
                             'Toileting Independence', 'Bathroom use and toileting safety assessment',
                             'fas fa-restroom'
                           )}
                           {renderToggleOption(
                             'notes', 'functionalMobility', 'transfersADL.personalCare',
                             'Functional Mobility for Self-Care', 'Mobility required for personal care tasks',
                             'fas fa-walking'
                           )}
                         </div>
                       </div>
                       
                       <div className="sub-category">
                         <h5>Domestic Skills</h5>
                         <div className="settings-grid">
                           {renderToggleOption(
                             'notes', 'telephoneUse', 'transfersADL.domesticSkills',
                             'Telephone Use', 'Communication device operation and safety',
                             'fas fa-phone'
                           )}
                           {renderToggleOption(
                             'notes', 'mealPreparation', 'transfersADL.domesticSkills',
                             'Meal Preparation', 'Kitchen safety and food preparation skills',
                             'fas fa-utensils'
                           )}
                           {renderToggleOption(
                             'notes', 'medicationManagement', 'transfersADL.domesticSkills',
                             'Medication Management', 'Medication administration independence and safety',
                             'fas fa-pills'
                           )}
                         </div>
                       </div>
                       
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'adlAdditionalInformation', 'transfersADL',
                           'Additional ADL Information', 'Supplementary daily living skill notes',
                           'fas fa-plus-circle'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Standardized ADL Assessments</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'katzIndex', 'transfersADL',
                           'Katz Index of Independence', 'Standardized ADL independence assessment',
                           'fas fa-list-ol'
                         )}
                         {renderToggleOption(
                           'notes', 'barthelIndex', 'transfersADL',
                           'Barthel Index', 'Comprehensive ADL and mobility assessment',
                           'fas fa-clipboard-list'
                         )}
                       </div>
                     </div>
                   </div>
                 )}
               </div>

               {/* Finale Section */}
               <div className="notes-section finale">
                 <div 
                   className="notes-section-header"
                   onClick={() => toggleCardExpansion('finale')}
                 >
                   <div className="section-left">
                     <div className="section-icon finale">
                       <i className="fas fa-flag-checkered"></i>
                     </div>
                     <div className="section-title">
                       <h3>Session Finale</h3>
                       <p>Final documentation, summary, and session conclusions</p>
                     </div>
                   </div>
                   <div className="section-right">
                     <div className="section-count">
                       {Object.values(settings.notes.finale).filter(Boolean).length} active
                     </div>
                     <i className={`fas fa-chevron-${expandedCards.finale ? 'up' : 'down'}`}></i>
                   </div>
                 </div>
                 
                 {expandedCards.finale && (
                   <div className="notes-section-content">
                     <div className="notes-subsection">
                       <h4>Final Documentation</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'finalNotes', 'finale',
                           'Final Session Notes', 'Concluding observations and session summary',
                           'fas fa-sticky-note'
                         )}
                         {renderToggleOption(
                           'notes', 'summary', 'finale',
                           'Session Summary', 'Comprehensive session summary and outcomes',
                           'fas fa-file-alt'
                         )}
                       </div>
                     </div>
                   </div>
                 )}
               </div>

               {/* Additional Quick Sections */}
               <div className="notes-section pain-medication">
                 <div 
                   className="notes-section-header"
                   onClick={() => toggleCardExpansion('painMedication')}
                 >
                   <div className="section-left">
                     <div className="section-icon pain">
                       <i className="fas fa-user-injured"></i>
                     </div>
                     <div className="section-title">
                       <h3>Pain & Medication</h3>
                       <p>Pain assessment and medication tracking</p>
                     </div>
                   </div>
                   <div className="section-right">
                     <div className="section-count">
                       {(settings.notes.pain.isPatientExperiencingPain ? 1 : 0) +
                        Object.values(settings.notes.medication).filter(Boolean).length} active
                     </div>
                     <i className={`fas fa-chevron-${expandedCards.painMedication ? 'up' : 'down'}`}></i>
                   </div>
                 </div>
                 
                 {expandedCards.painMedication && (
                   <div className="notes-section-content">
                     <div className="notes-subsection">
                       <h4>Pain Assessment</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'isPatientExperiencingPain', 'pain',
                           'Is Patient Experiencing Pain?', 'Pain presence and assessment documentation',
                           'fas fa-user-injured'
                         )}
                       </div>
                     </div>
                     
                     <div className="notes-subsection">
                       <h4>Medication Tracking</h4>
                       <div className="settings-grid">
                         {renderToggleOption(
                           'notes', 'hasMedicationChanged', 'medication',
                           'Medication Changes', 'Track recent medication modifications',
                           'fas fa-exchange-alt'
                         )}
                         {renderToggleOption(
                           'notes', 'additionalInformation', 'medication',
                           'Additional Medication Information', 'Supplementary medication notes and observations',
                           'fas fa-info-circle'
                         )}
                         {renderToggleOption(
                           'notes', 'viewAddMedicationList', 'medication',
                           'Medication List Management', 'Enable comprehensive medication list features',
                           'fas fa-list-ul'
                         )}
                       </div>
                     </div>
                   </div>
                 )}
               </div>
             </div>
           </div>
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

     {/* Premium Particles Background */}
     <div className="premium-particles-container">
       {[...Array(50)].map((_, i) => (
         <div 
           key={i} 
           className="premium-particle"
           style={{
             '--delay': `${Math.random() * 20}s`,
             '--duration': `${15 + Math.random() * 10}s`,
             '--size': `${2 + Math.random() * 4}px`,
             '--x': `${Math.random() * 100}%`,
             '--y': `${Math.random() * 100}%`
           }}
         ></div>
       ))}
     </div>
   </div>
 );
};

export default SettingsPage;