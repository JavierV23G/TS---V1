import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLoadingModal from './AuthLoadingModal';
import logoImg from '../../assets/LogoMHC.jpeg';
import { useAuth } from './AuthContext';

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

  // Detectar tamaño de pantalla para ajustes responsive
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
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };
  
  const handlePasswordFocus = (e) => {
    // Prevenir que el foco salte cuando el usuario está escribiendo
    e.target.dataset.focused = 'true';
  };
  
  const handlePasswordBlur = (e) => {
    // Limpiar el indicador de foco
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
    // Guardar el elemento actualmente enfocado
    const currentlyFocused = document.activeElement;
    
    setErrors({ ...errors, [field]: true, message });
    const element = document.getElementById(`${field}Group`);
    if (element) {
      element.classList.add('form-pulse');
      setTimeout(() => element.classList.remove('form-pulse'), 500);
    }
    
    // Restaurar el foco al elemento que estaba enfocado
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
    // Mantener el foco en el campo de contraseña
    setTimeout(() => {
      document.getElementById('password')?.focus();
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setAuthModal({
      isOpen: true,
      status: 'loading',
      message: 'Verifying credentials...'
    });

    try {
      // PASO 1: Verificar credenciales (SLAVE)
      const credentialsRes = await fetch('http://localhost:8000/auth/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!credentialsRes.ok) throw new Error('Invalid username or password');

      const userCredentials = await credentialsRes.json();
      
      setAuthModal({
        isOpen: true,
        status: 'loading',
        message: 'Creating session...'
      });

      // PASO 2: Crear token (MAIN)
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

      // Crear objeto user para el contexto
      const user = {
        id: userCredentials.user_id,
        username: userCredentials.username,
        role: userCredentials.role
      };

      // Guardar datos de sesión
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      rememberMe
        ? localStorage.setItem('rememberedUsername', user.username)
        : localStorage.removeItem('rememberedUsername');

      // Actualizar contexto de autenticación
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

  return (
    <>
      <div className="login__logo">
        <img src={logoImg} alt="Motive Homecare Logo" className="login__logo-img" />
      </div>

      <h2 className="login__title">Welcome{!isMobile ? " " : ""}</h2>

      <form className="login__form" onSubmit={handleSubmit}>
        <div className={`login__form-group ${errors.username ? 'error' : ''}`} id="usernameGroup">
          <label htmlFor="username" className="login__label">
            <i className="fas fa-user"></i> Username
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
          <span>LOG IN</span>
          <i className="fas fa-arrow-right login-arrow"></i>
        </button>
      </form>

      <div className="login__extra-links">
        <a href="#" onClick={(e) => { e.preventDefault(); onForgotPassword(e); }}>
          Forgot your password?
        </a>
      </div>

      <AuthLoadingModal {...authModal} onClose={closeAuthModal} userData={{ fullname: formData.username }} />
    </>
  );
};

export default Login;