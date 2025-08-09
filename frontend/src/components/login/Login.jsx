import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLoadingModal from './AuthLoadingModal';
import AccountLockoutModal from './AccountLockoutModal';
import ActiveSessionModal from './ActiveSessionModal';
import failedAttemptsService from './FailedAttemptsService';
import logoImg from '../../assets/LogoMHC.jpeg';
import { useAuth } from './AuthContext';
// 🖥️ IMPORT INTELLIGENT DEVICE FINGERPRINTING
import DeviceFingerprint from '../../utils/DeviceFingerprint';

const Login = ({ onForgotPassword }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({ username: false, password: false, message: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, status: 'loading', message: '' });
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [lockoutModal, setLockoutModal] = useState({
    isVisible: false,
    lockoutInfo: null,
    username: ''
  });
  const [activeSessionModal, setActiveSessionModal] = useState({
    isVisible: false,
    sessionInfo: null,
    username: ''
  });
  const [unblockAnimation, setUnblockAnimation] = useState({
    isActive: false,
    unblockedBy: '',
    username: ''
  });
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 576);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setFormData(prev => ({ ...prev, username: savedUsername }));
      setRememberMe(true);
    }

    failedAttemptsService.setCallbacks({
      onLockout: (lockoutInfo) => {
        setLockoutModal({
          isVisible: true,
          lockoutInfo,
          username: lockoutInfo.username
        });
        setAuthModal({ isOpen: false, status: 'loading', message: '' });
      },
      onAttemptFailed: (attemptInfo) => {
        const remainingAttempts = attemptInfo.remainingAttempts;
        setErrors({
          username: false,
          password: true,
          message: `Invalid credentials. ${remainingAttempts} ${remainingAttempts === 1 ? 'attempt remaining' : 'attempts remaining'}.`
        });
      },
      onAccountUnlocked: (username) => {
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };
  
  const handlePasswordFocus = (e) => {
    e.target.dataset.focused = 'true';
  };
  
  const handlePasswordBlur = (e) => {
    delete e.target.dataset.focused;
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleKeyDown = (e) => {
    if (e.getModifierState('CapsLock')) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  const showError = (field, message) => {
    const currentlyFocused = document.activeElement;
    
    setErrors({ ...errors, [field]: true, message });
    const element = document.getElementById(`${field}Group`);
    if (element) {
      element.classList.add('form-pulse');
      setTimeout(() => element.classList.remove('form-pulse'), 500);
    }
    
    if (currentlyFocused && currentlyFocused.id) {
      setTimeout(() => {
        currentlyFocused.focus();
      }, 0);
    }
  };

  const validateForm = () => {
    let isValid = true;
    if (formData.username.trim() === '') {
      showError('username', 'Username cannot be empty');
      isValid = false;
    }
    if (formData.password === '') {
      showError('password', 'Password cannot be empty');
      isValid = false;
    }
    return isValid;
  };

  const closeAuthModal = () => setAuthModal(prev => ({ ...prev, isOpen: false }));
  
  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
    setTimeout(() => {
      document.getElementById('password')?.focus();
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // NUEVO: Verificar estado del localStorage con logs detallados
    const lockStatus = failedAttemptsService.isAccountLocked(formData.username);
    console.log(`[LOGIN] 🔍 Verificando estado de ${formData.username} en localStorage:`, lockStatus);
    
    if (lockStatus.isLocked) {
      console.log(`[LOGIN] ❌ Usuario ${formData.username} AÚN bloqueado en localStorage, mostrando modal`);
      console.log(`[LOGIN] Datos del bloqueo:`, {
        remainingTime: lockStatus.remainingTime,
        lockoutLevel: lockStatus.lockoutLevel,
        lockoutUntil: new Date(lockStatus.lockoutUntil).toISOString()
      });
      
      // DOBLE VERIFICACIÓN: Consultar backend para confirmar
      console.log(`[LOGIN] 🔍 Verificando con backend si ${formData.username} realmente está bloqueado...`);
      
      try {
        const backendCheck = await fetch('http://localhost:8000/auth/check-block-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username })
        });
        
        if (backendCheck.ok) {
          const backendData = await backendCheck.json();
          console.log(`[LOGIN] Backend dice que ${formData.username} bloqueado:`, backendData.blocked);
          
          if (!backendData.blocked) {
            // Backend dice que NO está bloqueado - limpiar localStorage
            console.log(`[LOGIN] 🚨 INCONSISTENCIA: localStorage dice bloqueado, backend dice NO bloqueado`);
            console.log(`[LOGIN] 🧹 Limpiando localStorage para sincronizar con backend...`);
            
            failedAttemptsService.clearAttempts(formData.username);
            
            // Continuar con el login normalmente
            console.log(`[LOGIN] ✅ localStorage limpiado, continuando con login...`);
          } else {
            // Backend confirma el bloqueo - mostrar modal
            console.log(`[LOGIN] ✅ Backend confirma el bloqueo, mostrando modal...`);
            setLockoutModal({
              isVisible: true,
              lockoutInfo: lockStatus,
              username: formData.username
            });
            return;
          }
        } else {
          // Error consultando backend - usar localStorage como fallback
          console.log(`[LOGIN] ⚠️ Error consultando backend, usando localStorage como fallback`);
          setLockoutModal({
            isVisible: true,
            lockoutInfo: lockStatus,
            username: formData.username
          });
          return;
        }
      } catch (err) {
        console.error(`[LOGIN] ❌ Error en verificación con backend:`, err);
        setLockoutModal({
          isVisible: true,
          lockoutInfo: lockStatus,
          username: formData.username
        });
        return;
      }
    }
    
    console.log(`[LOGIN] ✅ Usuario ${formData.username} NO está bloqueado en localStorage, continuando con backend...`);

    setAuthModal({
      isOpen: true,
      status: 'loading',
      message: 'Verifying credentials...'
    });

    try {
      // 🖥️ GENERATE DEVICE FINGERPRINT
      console.log('[LOGIN] 🖥️ Generating device fingerprint...');
      const deviceFingerprint = await DeviceFingerprint.generate();
      console.log('[LOGIN] ✅ Device fingerprint generated:', {
        hash: deviceFingerprint.hash,
        userAgent: deviceFingerprint.userAgent?.substring(0, 50) + '...',
        screen: deviceFingerprint.screen,
        timezone: deviceFingerprint.timezone
      });

      const credentialsRes = await fetch('http://localhost:8000/auth/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          device_fingerprint: deviceFingerprint  // 🚨 Include device fingerprint (snake_case)
        })
      });

      // MANEJAR STATUS 429 - CUENTA BLOQUEADA POR EL BACKEND
      if (credentialsRes.status === 429) {
        const errorData = await credentialsRes.json();
        console.log('[LOGIN DEBUG] Status 429 recibido del backend:', errorData);
        
        // Mostrar el modal de cuenta bloqueada con la información del backend
        setLockoutModal({
          isVisible: true,
          lockoutInfo: {
            username: formData.username,
            message: errorData.message || 'Cuenta bloqueada temporalmente',
            error: errorData.error || 'Account Temporarily Blocked',
            retry_after: errorData.retry_after,
            remaining_minutes: errorData.remaining_minutes,
            block_level: errorData.block_level,
            contact_admin: errorData.contact_admin || false
          },
          username: formData.username
        });
        
        setAuthModal({ isOpen: false, status: 'loading', message: '' });
        return; // Salir sin procesar más
      }

      // MANEJAR STATUS 409 - SESIÓN YA ACTIVA
      if (credentialsRes.status === 409) {
        const sessionData = await credentialsRes.json();
        console.log('[LOGIN DEBUG] Status 409 recibido - sesión ya existe:', sessionData);
        
        // Mostrar modal elegante de sesión activa
        setAuthModal({ isOpen: false, status: 'loading', message: '' });
        setActiveSessionModal({
          isVisible: true,
          sessionInfo: sessionData.existing_session,
          username: formData.username
        });
        return;
      }

      // MANEJAR STATUS 401 - CREDENCIALES INCORRECTAS
      if (!credentialsRes.ok) {
        // Solo registrar intento fallido si NO es bloqueo de cuenta
        failedAttemptsService.recordFailedAttempt(formData.username);
        throw new Error('Invalid username or password');
      }

      const userCredentials = await credentialsRes.json();
      
      failedAttemptsService.clearAttempts(formData.username);
      
      setAuthModal({
        isOpen: true,
        status: 'loading',
        message: 'Creating session...'
      });

      const tokenRes = await fetch('http://localhost:8000/auth/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userCredentials.user_id,
          username: userCredentials.username,
          role: userCredentials.role
        })
      });

      if (!tokenRes.ok) throw new Error('Failed to create session');

      const { access_token: token } = await tokenRes.json();

      const user = {
        id: userCredentials.user_id,
        username: userCredentials.username,
        role: userCredentials.role
      };

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      rememberMe
        ? localStorage.setItem('rememberedUsername', user.username)
        : localStorage.removeItem('rememberedUsername');

      const loginResult = await login({ token, user });
      if (!loginResult.success) throw new Error('Authentication failed');

      setAuthModal({
        isOpen: true,
        status: 'success',
        message: 'Login successful. Redirecting...'
      });

      const baseRole = user.role.split(' - ')[0].toLowerCase();
      navigate(`/${baseRole}/homePage`);

    } catch (err) {
      setAuthModal({
        isOpen: true,
        status: 'error',
        message: err.message || 'Login failed'
      });
    }
  };

  const handleContactAdmin = () => {
    alert('Please contact the system administrator to unlock your account.');
  };

  const handleTryAgainLater = () => {
    setLockoutModal({
      isVisible: false,
      lockoutInfo: null,
      username: ''
    });
  };

  const handleForceLogin = async () => {
    // Usuario eligió forzar el login - primero terminar sesión existente
    try {
      setActiveSessionModal({ isVisible: false, sessionInfo: null, username: '' });
      setAuthModal({
        isOpen: true,
        status: 'loading',
        message: 'Closing other session... Please wait 8 seconds.'
      });

      await fetch('http://localhost:8000/auth/terminate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          reason: `Forced login from new device/browser`,
          terminated_by: 'user_self'
        })
      });
      
      // Esperar 8 segundos para que la primera sesión detecte la invalidación y haga logout
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      // Reintentar el login
      console.log('[LOGIN] Reintentando login después de forzar terminación...');
      
      // Simular el evento de submit
      const fakeEvent = { preventDefault: () => {} };
      handleSubmit(fakeEvent);
      
    } catch (err) {
      console.error('[LOGIN] Error forzando terminación de sesión:', err);
      setAuthModal({
        isOpen: true,
        status: 'error',
        message: 'Failed to terminate existing session'
      });
    }
  };

  const handleCancelActiveSession = () => {
    // Usuario canceló - cerrar modal y no hacer login
    setActiveSessionModal({
      isVisible: false,
      sessionInfo: null,
      username: ''
    });
  };

  // POLLING OPTIMIZADO PARA DETECTAR DESBLOQUEO POR DEVELOPER
  useEffect(() => {
    if (lockoutModal.isVisible && lockoutModal.username) {
      console.log('[POLLING] Iniciando verificación RÁPIDA de desbloqueo para:', lockoutModal.username);
      
      // Verificar cada 500ms para respuesta INMEDIATA
      pollIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:8000/auth/check-block-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: lockoutModal.username
            })
          });

          if (response.ok) {
            const data = await response.json();
            console.log('[POLLING] Estado de bloqueo:', data);

            // Si blocked = false, el usuario fue desbloqueado
            if (!data.blocked) {
              console.log('[POLLING] 🚀 ¡Usuario desbloqueado INMEDIATAMENTE! Iniciando animación...');
              clearInterval(pollIntervalRef.current);
              
              // Activar animación de desbloqueo
              setUnblockAnimation({
                isActive: true,
                unblockedBy: 'Security Administrator',
                username: lockoutModal.username
              });

              // Cerrar modal de bloqueo después de 500ms para respuesta rápida
              setTimeout(() => {
                setLockoutModal({ isVisible: false, lockoutInfo: null, username: '' });
                
                // Después de 3 segundos, cerrar animación de desbloqueo
                setTimeout(() => {
                  setUnblockAnimation({ isActive: false, unblockedBy: '', username: '' });
                }, 3000);
              }, 500);
            }
          }
        } catch (error) {
          console.error('[POLLING] Error verificando estado:', error);
        }
      }, 500); // ⚡ POLLING CADA 500ms PARA RESPUESTA INMEDIATA
    }

    return () => {
      if (pollIntervalRef.current) {
        console.log('[POLLING] Deteniendo verificación rápida');
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [lockoutModal.isVisible, lockoutModal.username]);

  return (
    <>
      <div className="login__logo">
        <img src={logoImg} alt="Motive Homecare Logo" className="login__logo-img" />
      </div>

      <h2 className="login__title">
        Clinical <span>Intelligence</span>
      </h2>
      <p className="login__subtitle">Enter your credentials to continue</p>

      <form className="login__form" onSubmit={handleSubmit}>
        <div className={`login__form-group ${errors.username ? 'error' : ''}`} id="usernameGroup">
          <label htmlFor="username" className="login__label">
            <i className="fas fa-user-md"></i> Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="login__input"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleInputChange}
            required
            autoComplete="username"
          />
          {errors.username && <div className="login__error-message">{errors.message}</div>}
        </div>

        <div className={`login__form-group ${errors.password ? 'error' : ''}`} id="passwordGroup">
          <label htmlFor="password" className="login__label">
            <i className="fas fa-lock"></i> Password
          </label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="login__input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              required
              autoComplete="current-password"
            />
            <button 
              type="button" 
              className="password-toggle-btn" 
              onClick={togglePasswordVisibility}
              onMouseDown={(e) => e.preventDefault()}
              tabIndex="-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          {capsLockOn && <div className="caps-lock-warning">Caps Lock is on</div>}
          {errors.password && <div className="login__error-message">{errors.message}</div>}
        </div>

        <label className="custom-checkbox">
          <input 
            type="checkbox" 
            checked={rememberMe} 
            onChange={handleRememberMeChange} 
          />
          <span className="checkmark"></span> Remember me
        </label>

        <button type="submit" className="login__button">
          <span>Sign In</span>
          <i className="fas fa-arrow-right login-arrow"></i>
        </button>
      </form>

      <div className="login__extra-links">
        <a href="#" onClick={(e) => { e.preventDefault(); onForgotPassword(e); }}>
          Forgot your password?
        </a>
      </div>

      <AuthLoadingModal {...authModal} onClose={closeAuthModal} userData={{ fullname: formData.username }} />
      
      <AccountLockoutModal
        isVisible={lockoutModal.isVisible}
        lockoutInfo={lockoutModal.lockoutInfo}
        username={lockoutModal.username}
        onContactAdmin={handleContactAdmin}
        onTryAgainLater={handleTryAgainLater}
      />

      <ActiveSessionModal
        isVisible={activeSessionModal.isVisible}
        username={activeSessionModal.username}
        sessionInfo={activeSessionModal.sessionInfo}
        onForceLogin={handleForceLogin}
        onCancel={handleCancelActiveSession}
      />

      {/* ANIMACIÓN DE DESBLOQUEO POR DEVELOPER */}
      {unblockAnimation.isActive && (
        <div className="unblock-animation-overlay">
          <div className="unblock-animation-container">
            <div className="unlock-icon-wrapper">
              <i className="fas fa-lock unlock-icon locked"></i>
              <i className="fas fa-unlock unlock-icon unlocked"></i>
            </div>
            
            <h2 className="unblock-title">Account Unlocked!</h2>
            
            <div className="unblock-message">
              <p className="unblock-username">{unblockAnimation.username}</p>
              <p className="unblock-text">
                Your account has been unlocked by
              </p>
              <p className="unblock-admin">{unblockAnimation.unblockedBy}</p>
            </div>
            
            <div className="unblock-subtext">
              <i className="fas fa-check-circle"></i>
              You can now log in with your credentials
            </div>
            
            <div className="unlock-progress-bar">
              <div className="unlock-progress-fill"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;