import React, { useState, useEffect } from 'react';
import '../../../../styles/developer/Patients/Companies/CompanyAccessLoading.scss';

const CompanyAccessLoading = () => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const loadingSteps = [
    { range: [0, 25], title: 'Initializing Clinical System', subtitle: 'Preparing healthcare environment', icon: 'fas fa-heartbeat', color: '#2196f3' },
    { range: [25, 50], title: 'Authenticating Access', subtitle: 'Verifying security credentials', icon: 'fas fa-shield-alt', color: '#4caf50' },
    { range: [50, 75], title: 'Loading Company Database', subtitle: 'Connecting to healthcare registry', icon: 'fas fa-database', color: '#ff9800' },
    { range: [75, 95], title: 'Preparing Interface', subtitle: 'Setting up clinical workspace', icon: 'fas fa-desktop', color: '#9c27b0' },
    { range: [95, 100], title: 'System Ready', subtitle: 'Ready for company registration', icon: 'fas fa-check-circle', color: '#4caf50' }
  ];

  // Función para obtener el paso actual basado en el progreso
  const getCurrentStep = () => {
    return loadingSteps.find(step => progress >= step.range[0] && progress <= step.range[1]) || loadingSteps[0];
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Mantener en 100% por 1.5 segundos antes de marcar como completo
          setTimeout(() => {
            setIsComplete(true);
          }, 1500);
          return 100;
        }
        // Incremento más rápido y progresivo
        const increment = prev < 60 ? (Math.random() * 4 + 3) : // 3-7% inicial
                         prev < 85 ? (Math.random() * 3 + 2) : // 2-5% medio
                         (Math.random() * 2 + 1); // 1-3% final
        return Math.min(prev + increment, 100);
      });
    }, 80); // Más rápido - cada 80ms

    return () => clearInterval(interval);
  }, []);

  const currentStepData = getCurrentStep();

  return (
    <div className="clinical-loading-container">
      {/* Clinical Background Effects */}
      <div className="clinical-background">
        {/* DNA Helix Animation */}
        <div className="dna-helix">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`helix-particle helix-${i + 1}`}></div>
          ))}
        </div>
        
        {/* Floating Molecules */}
        <div className="floating-molecules">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`molecule molecule-${i + 1}`}>
              <div className="molecule-core"></div>
              <div className="electron electron-1"></div>
              <div className="electron electron-2"></div>
              <div className="electron electron-3"></div>
            </div>
          ))}
        </div>
        
        {/* Medical Grid */}
        <div className="medical-grid"></div>
        
        {/* Pulse Waves */}
        <div className="pulse-waves">
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
        </div>
      </div>

      {/* Free Clinical Loading Interface */}
      <div className="clinical-interface">
        {/* Central Progress Display */}
        <div className="progress-center">
          <div className="progress-ring">
            {/* Outer Ring */}
            <svg className="progress-svg" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2196f3" />
                  <stop offset="25%" stopColor="#4caf50" />
                  <stop offset="50%" stopColor="#ff9800" />
                  <stop offset="75%" stopColor="#9c27b0" />
                  <stop offset="100%" stopColor="#2196f3" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Background Circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="rgba(44, 62, 80, 0.2)"
                strokeWidth="3"
              />
              
              {/* Progress Circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${Math.round(progress) * 5.34} 534`}
                transform="rotate(-90 100 100)"
                filter="url(#glow)"
                className="progress-path"
              />
            </svg>
            
            {/* Inner Content */}
            <div className="progress-content">
              <div className="step-icon" style={{ color: currentStepData.color }}>
                <i className={currentStepData.icon}></i>
              </div>
              <div className="progress-percentage">
                <span className={`percentage-number ${progress >= 100 ? 'complete' : ''}`}>{Math.round(progress)}</span>
                <span className={`percentage-symbol ${progress >= 100 ? 'complete' : ''}`}>%</span>
              </div>
            </div>
            
            {/* Pulse Ring */}
            <div className={`pulse-ring ${progress >= 100 ? 'complete' : ''}`} style={{ borderColor: progress >= 100 ? '#4caf50' : currentStepData.color }}></div>
          </div>
        </div>

        {/* Clinical Information Panel */}
        <div className="clinical-panel">
          <div className="panel-header">
            <div className="medical-icon" style={{ color: currentStepData.color }}>
              <i className={currentStepData.icon}></i>
            </div>
            <div className="panel-content">
              <h3 className="process-title">{currentStepData.title}</h3>
              <p className="process-description">{currentStepData.subtitle}</p>
            </div>
          </div>
          
          <div className="progress-metrics">
            <div className="metric">
              <span className="metric-label">System Status</span>
              <span className="metric-value" style={{ color: currentStepData.color }}>
                {isComplete ? 'OPERATIONAL' : 'INITIALIZING'}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Security Level</span>
              <span className="metric-value">HIPAA COMPLIANT</span>
            </div>
          </div>

          <div className="status-indicator-bar">
            <div className="status-light" style={{ backgroundColor: currentStepData.color }}></div>
            <div className="status-message">
              {isComplete ? 'System ready - Proceeding to registration' : `${currentStepData.subtitle}...`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAccessLoading;