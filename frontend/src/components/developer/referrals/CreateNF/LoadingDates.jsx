import React, { useState, useEffect } from 'react';
import '../../../../styles/developer/Referrals/CreateNF/LoadingDates.scss';

const DevLoadingScreen = ({ isLoading, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { message: "Iniciando procesamiento de datos...", duration: 500 },
    { message: "Verificando información del paciente...", duration: 200 },
    { message: "Validando cobertura de seguro...", duration: 100 },
    { message: "Procesando historial médico...", duration: 500 },
    { message: "Asignando terapeutas...", duration: 300 },
    { message: "Generando número de referencia...", duration: 100 },
    { message: "Guardando referral en la base de datos...", duration: 200 },
    { message: "Enviando notificaciones...", duration: 100 },
    { message: "Finalizando proceso...", duration: 900 }
  ];
  
  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }
    
    const totalDuration = steps.reduce((total, step) => total + step.duration, 0);
    const progressInterval = 20;
    
    let currentTime = 0;
    let currentProgress = 0;
    let stepIndex = 0;
    let stepTime = 0;
    
    const interval = setInterval(() => {
      currentTime += progressInterval;
      currentProgress = Math.min(100, (currentTime / totalDuration) * 100);
      
      setProgress(currentProgress);
      
      stepTime += progressInterval;
      if (stepTime >= steps[stepIndex].duration) {
        stepTime = 0;
        stepIndex = Math.min(stepIndex + 1, steps.length - 1);
        setCurrentStep(stepIndex);
      }
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        
        setTimeout(() => {
          if (onComplete && typeof onComplete === 'function') {
            onComplete();
          }
        }, 500);
      }
    }, progressInterval);
    
    return () => clearInterval(interval);
  }, [isLoading, onComplete]);
  
  if (!isLoading) return null;
  
  return (
    <div className="loading-screen-overlay">
      <div className="loading-screen-container">
        <div className="loading-content">
          <div className="logo-container">
            <div className="pulse-ring"></div>
            <div className="logo">
              <span className="logo-text">TS</span>
            </div>
          </div>
          
          <h2 className="loading-title">Procesando Referral</h2>
          
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-percentage">{Math.round(progress)}%</div>
          </div>
          
          <div className="status-message">{steps[currentStep].message}</div>
          
          <div className="steps-indicator">
            <span className="current-step">Paso {currentStep + 1}</span>
            <span className="total-steps">de {steps.length}</span>
          </div>
          
          <div className="loading-animation">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          
          <p className="info-message">
            <i className="fas fa-info-circle"></i> Esta operación puede tardar unos segundos
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevLoadingScreen;