import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/developer/Welcome/Welcome.scss';
import LogoutAnimation from '../../LogOut/LogOut';
import InfoWelcome from './infoWelcome';
import { useAuth } from '../../login/AuthContext';
import Header from '../../header/Header';

const DevHomePage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [parallaxPosition, setParallaxPosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [welcomeAnimComplete, setWelcomeAnimComplete] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const generateParticles = () => {
    const particlesArray = [];
    const particleCount = isMobile ? 15 : isTablet ? 25 : 35;
    
    for (let i = 0; i < particleCount; i++) {
      particlesArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (isMobile ? 2 : 4) + (isMobile ? 1 : 2),
        speed: Math.random() * 0.6 + 0.2,
        opacity: Math.random() * 0.5 + 0.1,
        color: `rgba(${Math.floor(Math.random() * 200 + 55)}, ${Math.floor(Math.random() * 200 + 55)}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.2 + 0.1})`,
        delay: Math.random() * 5,
        blurAmount: Math.random() * 2 + 1
      });
    }
    
    setParticles(particlesArray);
  };
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isMobile && cursorRef.current) {
        const { clientX, clientY } = e;
        setMousePosition({ x: clientX, y: clientY });
      }
    };
    
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);
  
  useEffect(() => {
    if (cursorRef.current && !isMobile) {
      cursorRef.current.style.transform = `translate(${mousePosition.x}px, ${mousePosition.y}px)`;
    }
  }, [mousePosition, isMobile]);
  
  useEffect(() => {
    generateParticles();
    
    setTimeout(() => {
      setWelcomeAnimComplete(true);
    }, isMobile ? 800 : 1200);
    
    const timer = setTimeout(() => {
      setShowAIAssistant(true);
    }, isMobile ? 1200 : 1800);
    
    return () => clearTimeout(timer);
  }, [isMobile]);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current && !isMobile) {
        const { clientX, clientY } = e;
        const { width, height } = containerRef.current.getBoundingClientRect();
        
        const multiplier = isTablet ? 10 : 15;
        const xPos = (clientX / width - 0.5) * multiplier;
        const yPos = (clientY / height - 0.5) * (isTablet ? 8 : 12);
        
        setParallaxPosition({ 
          x: xPos, 
          y: yPos 
        });
      }
    };
    
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, isTablet]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    setShowAIAssistant(false);
    
    document.body.classList.add('logging-out');
  };
  
  const handleLogoutAnimationComplete = () => {
    logout();
    navigate('/');
  };

  return (
    <div 
      className={`dashboard premium ${welcomeAnimComplete ? 'anim-complete' : ''} ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}
      ref={containerRef}
    >
      {!isMobile && (
        <div className="custom-cursor" ref={cursorRef}>
          <div className="cursor-dot"></div>
          <div className="cursor-ring"></div>
        </div>
      )}
      
      <div 
        className="parallax-background"
        style={{ 
          transform: isMobile ? 'scale(1.05)' : `translate3d(${parallaxPosition.x}px, ${parallaxPosition.y}px, 0) scale(1.1)` 
        }}
      >
        <div className="gradient-overlay"></div>
        
        <div className="particles-container">
          {particles.map(particle => (
            <div 
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity,
                backgroundColor: particle.color,
                filter: `blur(${particle.blurAmount}px)`,
                animationDuration: `${15 + particle.speed * 25}s`,
                animationDelay: `${particle.delay}s`
              }}
            ></div>
          ))}
        </div>
        
        <div className="nebula-effect nebula-1"></div>
        <div className="nebula-effect nebula-2"></div>
        <div className="nebula-effect nebula-3"></div>
      </div>
      
      <div className="gradient-mesh">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`mesh-line mesh-line-${i + 1}`}></div>
        ))}
      </div>
      
      {isLoggingOut && (
        <LogoutAnimation 
          isMobile={isMobile} 
          onAnimationComplete={handleLogoutAnimationComplete}
        />
      )}
      
      <Header onLogout={handleLogout} />
      
      <main className="main-content">
        <div className="welcome-container welcome-container-top">
          <div className="title-container">
            <h1 className="welcome-title">
              <span className="highlight">Welcome</span> to TherapySync
              <div className="title-decoration"></div>
            </h1>
            <div className="title-glow"></div>
          </div>
          <p className="welcome-subtitle">
            Select an option from the navigation menu to get started
            <span className="cursor-blink">_</span>
          </p>
        </div>
        
        <InfoWelcome isMobile={isMobile} isTablet={isTablet} />
      </main>
      
    </div>
  );
};

export default DevHomePage;