import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/developer/Welcome/WelcomeNew.scss';
import LogoutAnimation from '../../LogOut/LogOut';
import InfoWelcome from './infoWelcome';
import { useAuth } from '../../login/AuthContext';
import PremiumHeader from '../../header/Header';

const DevHomePage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    document.body.classList.add('logging-out');
  };
  
  const handleLogoutAnimationComplete = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`clinify-welcome-container ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
      {/* Fondo clínico profesional */}
      <div className="clinify-background"></div>
      
      {/* Header Premium Quantum */}
      <PremiumHeader onLogout={handleLogout} />
      
      {/* Animación de logout */}
      {isLoggingOut && (
        <LogoutAnimation 
          isMobile={isMobile} 
          onAnimationComplete={handleLogoutAnimationComplete}
        />
      )}
      
      {/* Contenido principal */}
      <main className="clinify-main-content">
        {/* Título de bienvenida */}
        <div className="clinify-welcome-header">
          <div className="clinify-title-container">
            <h1 className="clinify-title">
              <span className="clinify-highlight">Welcome</span> to Clinify AI
            </h1>
            <p className="clinify-subtitle">
              Select an option from the navigation menu to get started
            </p>
          </div>
        </div>
        
        {/* Dashboard con las cards */}
        <div className="clinify-dashboard-section">
          <InfoWelcome isMobile={isMobile} isTablet={isTablet} />
        </div>
      </main>
    </div>
  );
};

export default DevHomePage;