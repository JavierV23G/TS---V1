
import React, { useEffect, useState, useCallback } from 'react';

const AuthLoadingModal = ({ isOpen, status, message, onClose, modalType = 'auth', userData = null }) => {
  const [progress, setProgress] = useState(0);
  const [showSpinner, setShowSpinner] = useState(true);
  const [showStatusIcon, setShowStatusIcon] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animateBg, setAnimateBg] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 576);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  const getSteps = useCallback(() => {
    if (modalType === 'auth') {
      return isMobile 
        ? [
          'Verifying credentials...',
          'Authenticating...',
          'Validating permissions...',
          'Loading profile...'
        ]
        : [
          'Establishing secure connection...',
          'Verifying credentials...',
          'Generating session token...',
          'Validating permissions...',
          'Preparing workspace environment...'
        ];
    } else {
      return isMobile
        ? [
          'Validating email...',
          'Creating token...',
          'Finalizing recovery...'
        ]
        : [
          'Validating email address...',
          'Creating secure token...',
          'Preparing recovery link...',
          'Configuring email delivery...',
          'Finalizing secure recovery...'
        ];
    }
  }, [modalType, isMobile]);
  
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setAnimateBg(true);
      }, 100);
    } else {
      setAnimateBg(false);
    }
  }, [isOpen]);
  
  useEffect(() => {
    let interval;
    
    if (isOpen && status === 'loading') {
      setProgress(0);
      setShowSpinner(true);
      setShowStatusIcon(false);
      setCurrentStep(0);
      
      interval = setInterval(() => {
        setProgress(prev => {
          const remainingProgress = 95 - prev;
          const baseIncrement = prev < 30 ? 7 : prev < 60 ? 5 : prev < 80 ? 3 : 1.5;
          const variableComponent = Math.random() * 2 - 1;
          const slowdownFactor = Math.max(0.3, (95 - prev) / 95);
          
          const increment = (baseIncrement + variableComponent) * slowdownFactor;
          const newProgress = prev + increment;
          
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);
      
      const steps = getSteps();
      let stepTimes = Array(steps.length).fill(0).map(() => 
        Math.floor(Math.random() * 800 + 1600)
      );
      
      const scheduleNextStep = (currentStepIndex) => {
        if (currentStepIndex < steps.length - 1) {
          setTimeout(() => {
            setCurrentStep(currentStepIndex + 1);
            scheduleNextStep(currentStepIndex + 1);
          }, stepTimes[currentStepIndex]);
        }
      };
      
      scheduleNextStep(0);
      
    } else if (status === 'success' || status === 'error') {
      setProgress(100);
      
      const timeout = setTimeout(() => {
        setShowSpinner(false);
        setShowStatusIcon(true);
        
        if (status === 'error') {
          setTimeout(() => {
            if (onClose) onClose();
          }, 2500);
        }
      }, 500);
      
      return () => clearTimeout(timeout);
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [isOpen, status, getSteps, onClose]);
  
  if (!isOpen) return null;
  
  const steps = getSteps();
  
  const displayMessage = status === 'loading' 
    ? (message || steps[currentStep])
    : message;
  
  const getUserName = () => {
    if (!userData) return 'User';
    
    if (userData.fullname) return userData.fullname;
    
    return userData.username || userData.email || 'User';
  };
  
  const generateServerId = () => {
    return `SEC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };
  
  const getEstimatedTime = () => {
    const remainingProgress = 100 - progress;
    if (remainingProgress < 5) return "Almost done...";
    if (remainingProgress < 20) return "Less than 5 sec";
    if (remainingProgress < 50) return "About 10 sec";
    return "Less than 15 sec";
  };
  
  return (
    <div className={`auth-loading-modal ${isOpen ? '' : 'hidden'}`}>
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="medical-cross"></div>
        </div>
        
        <div className={`loading-content ${status}`}>
          <div className="loading-title">
            {status === 'loading' ? (
              modalType === 'auth' ? 
                'Clinical Intelligence' : 
                'Account Recovery'
            ) : status === 'success' ? 
              'Authentication Complete' : 
              'Authentication Failed'}
          </div>
          
          <div className="loading-message">
            {displayMessage}
            <span className="loading-dots"></span>
          </div>
          
          {status === 'loading' && (
            <div className="loading-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingModal;