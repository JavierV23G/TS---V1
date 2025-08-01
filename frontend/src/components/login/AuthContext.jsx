import React, { createContext, useContext, useState, useEffect } from 'react';
import GeolocationService from './GeolocationService';
import sessionTimeoutService from './SessionTimeoutService';
import SessionTimeoutModal from './SessionTimeoutModal';
import JWTService from './JWTService';
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    loading: true,
    currentUser: null,
    token: null,
    error: null
  });

  const [sessionWarning, setSessionWarning] = useState({
    showWarning: false,
    timeRemaining: 180
  });

  // Hook para validar sesiones y forzar logout cuando sea necesario
  const useSessionValidatorHook = () => {
    const intervalRef = React.useRef(null);

    React.useEffect(() => {
      if (!authState.currentUser?.username || !authState.isAuthenticated) {
        return;
      }

      console.log(`[SESSION-VALIDATOR] Iniciando validación para ${authState.currentUser.username}`);

      // Verificar cada 10 segundos si la sesión es válida
      intervalRef.current = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:8000/auth/check-session-validity', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({
              username: authState.currentUser.username
            })
          });

          if (response.ok) {
            const data = await response.json();
            
            if (!data.valid && data.force_logout) {
              console.log(`[SESSION-VALIDATOR] 🚨 Sesión invalidada para ${authState.currentUser.username} - forzando logout`);
              console.log(`[SESSION-VALIDATOR] Razón: ${data.reason}`);
              
              // Mostrar mensaje apropiado según la razón
              if (data.reason && data.reason.includes('Security Dashboard')) {
                alert(`Your session has been terminated by an administrator.\n\nYou can log in again if needed.`);
              } else {
                alert(`Your session has been closed because you logged in from another device.\n\nThis is a security measure - only one active session is allowed per user.`);
              }
              
              // Forzar logout inmediato sin hacer cleanup en backend (ya fue terminada)
              clearInterval(intervalRef.current);
              clearAuthData();
              setAuthState({
                isAuthenticated: false,
                loading: false,
                currentUser: null,
                token: null,
                error: null
              });
              
              setSessionWarning({
                showWarning: false,
                timeRemaining: 180
              });
              
              window.location.href = '/';
            }
          }
        } catch (error) {
          console.error('[SESSION-VALIDATOR] Error verificando sesión:', error);
        }
      }, 5000); // Cada 5 segundos

      // Cleanup
      return () => {
        if (intervalRef.current) {
          console.log(`[SESSION-VALIDATOR] Deteniendo validación para ${authState.currentUser.username}`);
          clearInterval(intervalRef.current);
        }
      };
    }, [authState.currentUser, authState.isAuthenticated]);
  };

  // Ejecutar el hook de validación
  useSessionValidatorHook();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user');

    if (token && userData) {
      try {
        // Verificar si el token JWT es válido y no ha expirado
        const tokenInfo = JWTService.getTokenInfo(token);
        
        if (!tokenInfo.isValid || tokenInfo.isExpired) {
          console.log('Token expirado o inválido al inicializar:', {
            isValid: tokenInfo.isValid,
            isExpired: tokenInfo.isExpired,
            expirationDate: tokenInfo.expirationDate
          });
          clearAuthData();
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: 'Session expired'
          }));
          return;
        }

        const user = JSON.parse(userData);
        console.log('Token válido encontrado:', {
          user: user.username,
          expiresAt: tokenInfo.expirationDate,
          timeRemaining: tokenInfo.timeUntilExpiration / 1000 / 60, // minutos
        });

        setAuthState({
          isAuthenticated: true,
          loading: false,
          currentUser: user,
          token,
          error: null
        });
        
        iniciarMonitoreoSesion();
      } catch (err) {
        console.error('Error al verificar token:', err);
        clearAuthData();
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Invalid session data'
        }));
      }
    } else {
      setAuthState(prev => ({
        ...prev,
        loading: false
      }));
    }

    return () => {
      sessionTimeoutService.detenerMonitoreo();
    };
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const iniciarMonitoreoSesion = () => {
    sessionTimeoutService.iniciarMonitoreo({
      onTimeout: () => {
        logout();
      },
      onWarning: (mostrar) => {
        setSessionWarning(prev => ({
          ...prev,
          showWarning: mostrar
        }));
      },
      onCountdownUpdate: (tiempoRestante) => {
        setSessionWarning(prev => ({
          ...prev,
          timeRemaining: tiempoRestante
        }));
      }
    });
  };

  const extenderSesion = () => {
    sessionTimeoutService.extenderSesion();
    setSessionWarning({
      showWarning: false,
      timeRemaining: 180
    });
  };

  const login = async ({ token, user }) => {
    try {
      const geoResult = await GeolocationService.verifyLocationAccess();
      if (!geoResult.allowed) {
        return { success: false, error: 'Access denied due to geographic restriction.' };
      }

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      setAuthState({
        isAuthenticated: true,
        loading: false,
        currentUser: user,
        token,
        error: null
      });

      iniciarMonitoreoSesion();

      return { success: true };
    } catch (error) {
      clearAuthData();
      setAuthState({
        isAuthenticated: false,
        loading: false,
        currentUser: null,
        token: null,
        error: error.message || 'Login error'
      });
      return { success: false, error: error.message || 'Login error' };
    }
  };

  const logout = async () => {
    sessionTimeoutService.detenerMonitoreo();
    
    // Notificar al backend que el usuario está haciendo logout
    if (authState.currentUser?.username) {
      try {
        await fetch('http://localhost:8000/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: authState.currentUser.username
          })
        });
        console.log(`[LOGOUT] Sesión terminada para ${authState.currentUser.username}`);
      } catch (error) {
        console.error('[LOGOUT] Error notificando logout al backend:', error);
      }
    }
    
    clearAuthData();
    setAuthState({
      isAuthenticated: false,
      loading: false,
      currentUser: null,
      token: null,
      error: null
    });
    
    setSessionWarning({
      showWarning: false,
      timeRemaining: 180
    });
    
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        loading: authState.loading,
        currentUser: authState.currentUser,
        token: authState.token,
        error: authState.error,
        login,
        logout
      }}
    >
      {children}
      {authState.isAuthenticated && (
        <SessionTimeoutModal
          timeRemaining={sessionWarning.timeRemaining}
          onExtendSession={extenderSesion}
          isVisible={sessionWarning.showWarning}
        />
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;
