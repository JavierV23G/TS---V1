import React, { useState, useEffect, useRef } from 'react';
import '../../../../styles/developer/Referrals/CreateNF/LoadingDates.scss';

const DevLoadingScreen = ({ isLoading, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [particulas, setParticulas] = useState([]);
  const canvasRef = useRef(null);
  
  const steps = [
    { 
      message: "INITIALIZING CLINICAL SYSTEM", 
      descripcion: "Establishing secure connection with medical protocols...",
      duration: 800,
      icono: "fas fa-shield-alt",
      color: "#2563eb"
    },
    { 
      message: "VERIFYING HIPAA CREDENTIALS", 
      descripcion: "Validating access permissions and data security...",
      duration: 600,
      icono: "fas fa-user-shield",
      color: "#059669"
    },
    { 
      message: "PROCESSING CLINICAL INFORMATION", 
      descripcion: "Analyzing medical history and patient data...",
      duration: 1000,
      icono: "fas fa-heartbeat",
      color: "#dc2626"
    },
    { 
      message: "VALIDATING INSURANCE COVERAGE", 
      descripcion: "Verifying eligibility and available benefits...",
      duration: 700,
      icono: "fas fa-file-medical-alt",
      color: "#7c3aed"
    },
    { 
      message: "INTELLIGENT THERAPEUTIC ASSIGNMENT", 
      descripcion: "Selecting specialists by clinical discipline...",
      duration: 900,
      icono: "fas fa-user-md",
      color: "#0891b2"
    },
    { 
      message: "GENERATING TREATMENT PROTOCOL", 
      descripcion: "Creating personalized plan based on diagnosis...",
      duration: 800,
      icono: "fas fa-clipboard-list",
      color: "#ea580c"
    },
    { 
      message: "SYNCHRONIZING MEDICAL RECORDS", 
      descripcion: "Updating EMR system and clinical database...",
      duration: 500,
      icono: "fas fa-sync-alt",
      color: "#059669"
    },
    { 
      message: "FINALIZING CLINICAL PROCESS", 
      descripcion: "Confirming integrity and sending notifications...",
      duration: 600,
      icono: "fas fa-check-circle",
      color: "#10b981"
    }
  ];
  
  // Inicializar sistema de partículas
  useEffect(() => {
    const nuevasParticulas = [];
    for (let i = 0; i < 40; i++) {
      nuevasParticulas.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.6 + 0.4
      });
    }
    setParticulas(nuevasParticulas);
  }, []);

  // Sistema de progreso avanzado
  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }
    
    const totalDuration = steps.reduce((total, step) => total + step.duration, 0);
    const progressInterval = 50;
    
    let currentTime = 0;
    let stepIndex = 0;
    
    const interval = setInterval(() => {
      currentTime += progressInterval;
      
      // Progreso suave con easing cúbico
      const basicProgress = (currentTime / totalDuration) * 100;
      const smoothProgress = Math.min(100, basicProgress * (2 - basicProgress / 100));
      setProgress(smoothProgress);
      
      // Cambio de fase inteligente
      let accumulatedTime = 0;
      for (let i = 0; i < steps.length; i++) {
        accumulatedTime += steps[i].duration;
        if (currentTime <= accumulatedTime && stepIndex !== i) {
          setCurrentStep(i);
          stepIndex = i;
          break;
        }
      }
      
      if (smoothProgress >= 99) {
        clearInterval(interval);
        setTimeout(() => {
          if (onComplete && typeof onComplete === 'function') {
            onComplete();
          }
        }, 800);
      }
    }, progressInterval);
    
    return () => clearInterval(interval);
  }, [isLoading, onComplete]);

  // Animación de partículas
  useEffect(() => {
    const animateParticles = setInterval(() => {
      setParticulas(prev => prev.map(particula => ({
        ...particula,
        x: (particula.x + particula.speedX) % 100,
        y: (particula.y + particula.speedY) % 100,
        opacity: 0.4 + Math.sin(Date.now() * 0.002 + particula.id) * 0.3
      })));
    }, 100);
    
    return () => clearInterval(animateParticles);
  }, []);
  
  if (!isLoading) return null;

  const stepActual = steps[currentStep] || steps[0];
  
  return (
    <div className="clinical-loading-system">
      {/* Sistema de fondo dinámico */}
      <div className="dynamic-background-system">
        <div className="gradient-mesh"></div>
        <div className="neural-network">
          {particulas.map(particula => (
            <div
              key={particula.id}
              className="neural-particle"
              style={{
                left: `${particula.x}%`,
                top: `${particula.y}%`,
                width: `${particula.size}px`,
                height: `${particula.size}px`,
                opacity: particula.opacity
              }}
            />
          ))}
        </div>
      </div>

      {/* Contenedor principal premium */}
      <div className="clinical-main-container">
        {/* Header clínico profesional */}
        <div className="clinical-header">
          <div className="clinical-logo-system">
            <div className="logo-rings">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
            </div>
            <div className="logo-core">
              <span className="logo-text">TS</span>
              <div className="logo-pulse"></div>
            </div>
          </div>
          <h1 className="clinical-brand">TheraSoft Clinical</h1>
          <p className="clinical-subtitle">Advanced Referral Management System</p>
        </div>

        {/* Display de fase actual */}
        <div className="clinical-phase-display">
          <div className="phase-icon-container">
            <div 
              className="phase-icon-bg"
              style={{ backgroundColor: `${stepActual.color}15` }}
            >
              <i 
                className={stepActual.icono}
                style={{ color: stepActual.color }}
              ></i>
            </div>
          </div>
          
          <div className="phase-content">
            <h2 className="phase-title">{stepActual.message}</h2>
            <p className="phase-description">{stepActual.descripcion}</p>
          </div>
        </div>

        {/* Sistema de progreso premium */}
        <div className="clinical-progress-system">
          <div className="progress-header">
            <span className="progress-label">Clinical System Progress</span>
            <span className="progress-percentage">{Math.round(progress)}%</span>
          </div>
          
          <div className="progress-container">
            <div className="progress-track">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: stepActual.color
                }}
              >
                <div className="progress-shine"></div>
              </div>
            </div>
          </div>
          
          <div className="progress-indicators">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`phase-indicator ${index <= currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
                style={{ 
                  backgroundColor: index <= currentStep ? step.color : '#e2e8f0',
                  left: `${(index / (steps.length - 1)) * 100}%`
                }}
              >
                <div className="indicator-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Información técnica profesional */}
        <div className="clinical-tech-info">
          <div className="tech-stats">
            <div className="stat-item">
              <span className="stat-value">{currentStep + 1}</span>
              <span className="stat-label">/ {steps.length} Processes</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">
                <i className="fas fa-shield-check"></i>
              </span>
              <span className="stat-label">HIPAA Secure</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">
                <i className="fas fa-lock"></i>
              </span>
              <span className="stat-label">SSL Encrypted</span>
            </div>
          </div>
        </div>

        {/* Animación de carga premium */}
        <div className="clinical-loading-dots">
          <div className="dot dot-1"></div>
          <div className="dot dot-2"></div>
          <div className="dot dot-3"></div>
          <div className="dot dot-4"></div>
        </div>

        {/* Footer informativo */}
        <div className="clinical-footer">
          <p className="system-message">
            <i className="fas fa-medical-plus"></i>
            Secure medical data processing - All HIPAA protocols applied
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevLoadingScreen;