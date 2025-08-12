import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../login/AuthContext';
import logoImg from '../../assets/LogoMHC.jpeg';
import '../../styles/Header/Header.scss';
import '../../styles/Header/SimpleMobileMenu.scss';
// 🚨 IMPORT SECURITY NOTIFICATIONS
import SecurityNotifications from '../developer/security/SecurityNotifications';

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Estados principales
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const [menuTransitioning, setMenuTransitioning] = useState(false);
  const [headerGlow, setHeaderGlow] = useState(false);
  const [parallaxPosition, setParallaxPosition] = useState({ x: 0, y: 0 });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Estados responsive
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  
  const userMenuRef = useRef(null);
  const menuRef = useRef(null);
  
  const roleData = getRoleInfo(currentUser?.role);
  const baseRole = roleData.baseRole;
  const roleType = roleData.roleType;
  
  const isReferralsPage = location.pathname.includes('/referrals') || 
                          location.pathname.includes('/createNewReferral');
  
  function getRoleInfo(role) {
    if (!role) return { baseRole: 'developer', roleType: 'admin' };
    
    const roleLower = role.toLowerCase();
    let baseRole = roleLower.split(' - ')[0];
    let roleType = 'therapist';
    
    if (baseRole === 'developer') {
      roleType = 'developer';
    } else if (baseRole === 'administrator') {
      roleType = 'admin';
    } else if (['pt', 'ot', 'st', 'pta', 'cota', 'sta'].includes(baseRole)) {
      roleType = 'therapist';
    } else if (['supportive', 'support'].includes(baseRole)) {
      roleType = 'support';
    } else if (baseRole === 'agency' || roleLower.includes('agency')) {
      roleType = 'agency';
    }
    
    return { baseRole, roleType };
  }
  
  function getFilteredMenuOptions() {
    // Opción de Patients/Clients basada en el rol
    const patientsOption = roleType === 'developer' 
      ? { id: 1, name: "Clients", icon: "fa-users", route: `/${baseRole}/patients`, color: "#36D1DC" }
      : { id: 1, name: "Patients", icon: "fa-user-injured", route: `/${baseRole}/patients`, color: "#36D1DC" };
    
    const allMenuOptions = [
      patientsOption,
      { id: 2, name: "Referrals", icon: "fa-file-medical", route: `/${baseRole}/referrals`, color: "#FF9966" },
      ...(roleType === 'developer' ? [{ id: 3, name: "Security", icon: "fa-shield-alt", route: `/${baseRole}/security`, color: "#ff4757" }] : []),
      { id: 4, name: "Accounting", icon: "fa-chart-pie", route: `/${baseRole}/accounting`, color: "#4CAF50" }
    ];
    
    const isAgency = roleType === 'agency' || 
                     baseRole === 'agency' || 
                     (currentUser?.role && currentUser.role.toLowerCase().includes('agency'));
    
    if (roleType === 'developer' || roleType === 'admin') {
      return allMenuOptions;
    } else if (isAgency) {
      const filtered = allMenuOptions.filter(option => 
        option.name === "Patients" || option.name === "Accounting"
      );
      return filtered;
    } else if (roleType === 'therapist' || roleType === 'support') {
      return allMenuOptions.filter(option => 
        option.name === "Patients" || option.name === "Accounting"
      );
    }
    
    return allMenuOptions.filter(option => 
      option.name === "Patients" || option.name === "Referrals"
    );
  }
  
  const defaultMenuOptions = getFilteredMenuOptions();
  
  const referralsMenuOptions = [
    { id: 1, name: "Admin Referral Inbox", icon: "fa-inbox", route: `/${baseRole}/referrals/inbox`, color: "#4facfe" },
    { id: 2, name: "Create New Referral", icon: "fa-file-medical", route: `/${baseRole}/createNewReferral`, color: "#ff9966" },
    { id: 3, name: "Resend Referral", icon: "fa-paper-plane", route: `/${baseRole}/referrals/resend`, color: "#00e5ff" },
    { id: 4, name: "View Referral History", icon: "fa-history", route: `/${baseRole}/referrals/history`, color: "#8c54ff" },
    { id: 5, name: "Referral Stats", icon: "fa-chart-bar", route: `/${baseRole}/referrals/stats`, color: "#4CAF50" }
  ];
  
  const menuOptions = isReferralsPage && (roleType === 'developer' || roleType === 'admin') 
    ? referralsMenuOptions 
    : defaultMenuOptions;
    
  const userData = currentUser ? {
    name: currentUser.fullname || currentUser.username,
    avatar: getInitials(currentUser.fullname || currentUser.username),
    email: currentUser.email,
    role: currentUser.role,
    status: 'online'
  } : {
    name: '',
    avatar: '',
    email: '',
    role: '',
    status: 'online'
  };
  
  function getInitials(name) {
    if (!name) return "U";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // ===================================
  // EFECTOS Y EVENT LISTENERS
  // ===================================

  // Detector de pantalla móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth <= 992);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Función toggle del menú
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  

  // Auto-navegación del carousel (solo desktop)
  useEffect(() => {
    if (isLoggingOut || menuTransitioning || menuOptions.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveMenuIndex((prevIndex) => 
        prevIndex >= menuOptions.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000);
    
    return () => clearInterval(interval);
  }, [menuOptions.length, menuTransitioning, isLoggingOut]);

  // Efecto parallax (solo desktop)
  useEffect(() => {
    if (isLoggingOut) return;
    
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const multiplier = 20;
      const xPos = (clientX / width - 0.5) * multiplier;
      const yPos = (clientY / height - 0.5) * 15;
      
      setParallaxPosition({ x: xPos, y: yPos });
      
      if (clientY < 100) {
        setHeaderGlow(true);
      } else {
        setHeaderGlow(false);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isLoggingOut]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Menú desktop
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ===================================
  // HANDLERS
  // ===================================

  const handlePrevious = () => {
    if (isLoggingOut || menuOptions.length <= 1) return;
    
    setActiveMenuIndex((prevIndex) => 
      prevIndex <= 0 ? menuOptions.length - 1 : prevIndex - 1
    );
  };
  
  const handleNext = () => {
    if (isLoggingOut || menuOptions.length <= 1) return;
    
    setActiveMenuIndex((prevIndex) => 
      prevIndex >= menuOptions.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setShowUserMenu(false);
    
    document.body.classList.add('logging-out');
    
    if (onLogout && typeof onLogout === 'function') {
      onLogout();
    }
  };

  const handleMenuOptionClick = (option) => {
    if (isLoggingOut) return;
    
    setActiveMenuIndex(menuOptions.findIndex(o => o.id === option.id));
    setMenuTransitioning(true);
    
    setTimeout(() => {
      navigate(option.route);
    }, 500);
  };

  const handleNavigateToProfile = () => {
    if (isLoggingOut) return;
    
    setShowUserMenu(false);
    setMenuTransitioning(true);
    
    setTimeout(() => {
      navigate(`/${baseRole}/profile`);
    }, 500);
  };

  const handleNavigateToSettings = () => {
    if (isLoggingOut) return;
    
    setShowUserMenu(false);
    setMenuTransitioning(true);
    
    setTimeout(() => {
      navigate(`/${baseRole}/settings`);
    }, 500);
  };

  const handleMainMenuTransition = () => {
    if (isLoggingOut) return;
    navigate(`/${baseRole}/homePage`);
  };

  // ===================================
  // FUNCIONES HELPER
  // ===================================

  const getCarouselPositions = () => {
    
    const result = [];
    const totalOptions = menuOptions.length;
    
    for (let i = 0; i < totalOptions; i++) {
      let position;
      const relativePos = (i - activeMenuIndex + totalOptions) % totalOptions;
      
      if (relativePos === 0) {
        position = "center";
      } else if (relativePos === 1 || (relativePos === totalOptions - 1 && totalOptions === 2)) {
        position = "right";
      } else if (relativePos === totalOptions - 1) {
        position = "left";
      } else {
        position = "hidden";
      }
      
      result.push({
        ...menuOptions[i],
        position
      });
    }
    
    return result;
  };

  const isTherapist = ['pt', 'ot', 'st', 'pta', 'cota', 'sta'].includes(baseRole);
  const showCarouselArrows = menuOptions.length > 1;

  // ===================================
  // RENDER
  // ===================================

  return (
    <>
      {/* Menú móvil premium - igual al menú de usuario */}
      {showMobileMenu && isMobileView && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)} />
          <div className="support-user-menu mobile-version">
            <div className="support-menu-header">
              <div className="mobile-close-button" onClick={() => setShowMobileMenu(false)}>
                <i className="fas fa-times"></i>
              </div>
              <div className="support-user-info">
                <div className="support-user-avatar">
                  <span>{userData.avatar}</span>
                  <div className={`avatar-status ${userData.status}`}></div>
                </div>
                <div className="support-user-details">
                  <h4>{userData.name}</h4>
                  <span className="support-user-email">{userData.email}</span>
                  <span className={`support-user-status ${userData.status}`}>
                    <i className="fas fa-circle"></i> 
                    {userData.status.charAt(0).toUpperCase() + userData.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="support-menu-section">
              <div className="section-title">Navigation</div>
              <div className="support-menu-items">
                {menuOptions.map((option) => (
                  <div 
                    key={option.id}
                    className="support-menu-item"
                    onClick={() => {
                      handleMenuOptionClick(option);
                      setShowMobileMenu(false);
                    }}
                    style={{ '--menu-color': option.color, '--menu-glow': `${option.color}60` }}
                  >
                    <i className={`fas ${option.icon}`}></i>
                    <span className="menu-item-text">{option.name}</span>
                  </div>
                ))}
                
                {/* Navegación adicional para referrals en móvil */}
                {isReferralsPage && (roleType === 'developer' || roleType === 'admin') && (
                  <div 
                    className="support-menu-item"
                    onClick={() => {
                      handleMainMenuTransition();
                      setShowMobileMenu(false);
                    }}
                    style={{ '--menu-color': '#36D1DC', '--menu-glow': '#36D1DC60' }}
                  >
                    <i className="fas fa-th-large"></i>
                    <span className="menu-item-text">Main Menu</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="support-menu-section">
              <div className="section-title">Account</div>
              <div className="support-menu-items">
                <div 
                  className="support-menu-item"
                  onClick={() => {
                    handleNavigateToProfile();
                    setShowMobileMenu(false);
                  }}
                  style={{ '--menu-color': '#36D1DC', '--menu-glow': '#36D1DC60' }}
                >
                  <i className="fas fa-user-circle"></i>
                  <span className="menu-item-text">My Profile</span>
                </div>
                <div 
                  className="support-menu-item"
                  onClick={() => {
                    handleNavigateToSettings();
                    setShowMobileMenu(false);
                  }}
                  style={{ '--menu-color': '#4CAF50', '--menu-glow': '#4CAF5060' }}
                >
                  <i className="fas fa-cog"></i>
                  <span className="menu-item-text">Settings</span>
                </div>
                {isTherapist && (
                  <div 
                    className="support-menu-item"
                    style={{ '--menu-color': '#FF9966', '--menu-glow': '#FF996660' }}
                  >
                    <i className="fas fa-calendar-alt"></i>
                    <span className="menu-item-text">My Schedule</span>
                  </div>
                )}
              </div>
            </div>
            
            {roleType !== 'developer' && (
              <div className="support-menu-section">
                <div className="section-title">Support</div>
                <div className="support-menu-items">
                  <div 
                    className="support-menu-item"
                    style={{ '--menu-color': '#ff4757', '--menu-glow': '#ff475760' }}
                  >
                    <i className="fas fa-headset"></i>
                    <span className="menu-item-text">Contact Support</span>
                  </div>
                  <div 
                    className="support-menu-item"
                    style={{ '--menu-color': '#8c54ff', '--menu-glow': '#8c54ff60' }}
                  >
                    <i className="fas fa-bug"></i>
                    <span className="menu-item-text">Report Issue</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="support-menu-footer">
              <div 
                className="support-menu-item logout" 
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                style={{ '--menu-color': '#ff4757', '--menu-glow': '#ff475760' }}
              >
                <i className="fas fa-sign-out-alt"></i>
                <span className="menu-item-text">Sign Out</span>
              </div>
              <div className="version-info">
                <span>Clinify AI™</span>
                <span>v2.7.0</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Header principal */}
      <header className={`main-header ${headerGlow ? 'glow-effect' : ''} ${menuTransitioning ? 'transitioning' : ''} ${isLoggingOut ? 'logging-out' : ''}`}>
        <div className="header-container">
          {/* Logo y navegación */}
          <div className="logo-container">
            <div className="logo-glow"></div>
            <img 
              src={logoImg} 
              alt="Clinify AI Logo" 
              className="logo" 
              onClick={() => !isLoggingOut && handleMainMenuTransition()} 
            />
            
            {/* Navegación para referrals (solo desktop) */}
            {isReferralsPage && (roleType === 'developer' || roleType === 'admin') && (
              <div className="menu-navigation">
                <button 
                  className="nav-button main-menu" 
                  onClick={handleMainMenuTransition}
                  title="Back to main menu"
                  style={{ '--nav-color': '#36D1DC', '--nav-glow': '#36D1DC60' }}
                >
                  <i className="fas fa-th-large"></i>
                  <span className="nav-text">Main Menu</span>
                </button>
                
                <button 
                  className="nav-button referrals-menu active" 
                  title="Referrals Menu"
                  style={{ '--nav-color': '#FF9966', '--nav-glow': '#FF996660' }}
                >
                  <i className="fas fa-file-medical"></i>
                  <span className="nav-text active-nav-text">Referrals</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Carousel 3D (solo desktop) */}
          <div className="top-carousel" ref={menuRef}>
            {showCarouselArrows && (
              <button 
                className="carousel-arrow left" 
                onClick={handlePrevious} 
                aria-label="Previous" 
                disabled={isLoggingOut}
              >
                <div className="arrow-icon">
                  <i className="fas fa-chevron-left"></i>
                </div>
              </button>
            )}
            
            <div className="carousel-options">
              {getCarouselPositions()
                .filter(item => item.position !== 'hidden')
                .map((item) => (
                <div 
                  key={item.id} 
                  className={`carousel-option ${item.position}`}
                  onClick={() => handleMenuOptionClick(item)}
                >
                  <div className="option-content">
                    <div 
                      className="option-icon" 
                      style={{ 
                        background: `linear-gradient(135deg, ${item.color}, ${item.color}88)`,
                        opacity: item.position === 'center' ? 1 : 0
                      }}
                    >
                      <i className={`fas ${item.icon}`}></i>
                    </div>
                    <span 
                      className={`option-text ${item.position === 'center' ? 'active-center-text' : ''}`}
                      style={{ 
                        '--active-color': item.color,
                        '--glow-color': `${item.color}60`
                      }}
                    >
                      {item.name}
                    </span>
                    {item.position === 'center' && (
                      <div className="active-underline"></div>
                    )}
                  </div>
                  {item.position === 'center' && (
                    <div className="option-glow"></div>
                  )}
                </div>
              ))}
            </div>
            
            {showCarouselArrows && (
              <button 
                className="carousel-arrow right" 
                onClick={handleNext} 
                aria-label="Next" 
                disabled={isLoggingOut}
              >
                <div className="arrow-icon">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </button>
            )}
          </div>
          
          {/* Notificaciones de seguridad (solo desktop) */}
          {(currentUser?.role === 'developer' || currentUser?.role === 'admin') && (
            <div className="security-notifications-container">
              <SecurityNotifications />
            </div>
          )}
          
          {/* Botón hamburguesa premium */}
          {isMobileView && (
            <button 
              className="simple-hamburger"
              onClick={toggleMobileMenu}
            >
              <div className="hamburger-lines">
                <span className={showMobileMenu ? 'active' : ''}></span>
                <span className={showMobileMenu ? 'active' : ''}></span>
                <span className={showMobileMenu ? 'active' : ''}></span>
              </div>
            </button>
          )}
          
          {/* Perfil de usuario (solo desktop) */}
          <div className="support-user-profile" ref={userMenuRef}>
            <div 
              className={`support-profile-button ${showUserMenu ? 'active' : ''}`} 
              onClick={() => !isLoggingOut && setShowUserMenu(!showUserMenu)}
              data-tooltip="Your profile and settings"
            >
              <div className="support-avatar">
                <div className="support-avatar-text">{userData.avatar}</div>
                <div className={`support-avatar-status ${userData.status}`}></div>
              </div>
              
              <div className="support-profile-info">
                <span className="support-user-name">{userData.name}</span>
                <span className="support-user-role">{userData.role}</span>
              </div>
              
              <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'}`}></i>
            </div>
            
            {showUserMenu && !isLoggingOut && (
              <div className="support-user-menu">
                <div className="support-menu-header">
                  <div className="support-user-info">
                    <div className="support-user-avatar">
                      <span>{userData.avatar}</span>
                      <div className={`avatar-status ${userData.status}`}></div>
                    </div>
                    <div className="support-user-details">
                      <h4>{userData.name}</h4>
                      <span className="support-user-email">{userData.email}</span>
                      <span className={`support-user-status ${userData.status}`}>
                        <i className="fas fa-circle"></i> 
                        {userData.status.charAt(0).toUpperCase() + userData.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="support-menu-section">
                  <div className="section-title">Account</div>
                  <div className="support-menu-items">
                    <div 
                      className="support-menu-item"
                      onClick={handleNavigateToProfile}
                      style={{ '--menu-color': '#36D1DC', '--menu-glow': '#36D1DC60' }}
                    >
                      <i className="fas fa-user-circle"></i>
                      <span className="menu-item-text">My Profile</span>
                    </div>
                    <div 
                      className="support-menu-item"
                      onClick={handleNavigateToSettings}
                      style={{ '--menu-color': '#4CAF50', '--menu-glow': '#4CAF5060' }}
                    >
                      <i className="fas fa-cog"></i>
                      <span className="menu-item-text">Settings</span>
                    </div>
                    {isTherapist && (
                      <div 
                        className="support-menu-item"
                        style={{ '--menu-color': '#FF9966', '--menu-glow': '#FF996660' }}
                      >
                        <i className="fas fa-calendar-alt"></i>
                        <span className="menu-item-text">My Schedule</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {roleType !== 'developer' && (
                  <div className="support-menu-section">
                    <div className="section-title">Support</div>
                    <div className="support-menu-items">
                      <div 
                        className="support-menu-item"
                        style={{ '--menu-color': '#ff4757', '--menu-glow': '#ff475760' }}
                      >
                        <i className="fas fa-headset"></i>
                        <span className="menu-item-text">Contact Support</span>
                      </div>
                      <div 
                        className="support-menu-item"
                        style={{ '--menu-color': '#8c54ff', '--menu-glow': '#8c54ff60' }}
                      >
                        <i className="fas fa-bug"></i>
                        <span className="menu-item-text">Report Issue</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="support-menu-footer">
                  <div 
                    className="support-menu-item logout" 
                    onClick={handleLogout}
                    style={{ '--menu-color': '#ff4757', '--menu-glow': '#ff475760' }}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span className="menu-item-text">Sign Out</span>
                  </div>
                  <div className="version-info">
                    <span>Clinify AI™</span>
                    <span>v2.7.0</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;