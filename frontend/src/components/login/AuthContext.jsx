// components/login/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import GeolocationService from './GeolocationService';
import sessionTimeoutService from './SessionTimeoutService';
import SessionTimeoutModal from './SessionTimeoutModal';

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

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          isAuthenticated: true,
          loading: false,
          currentUser: user,
          token,
          error: null
        });
        
        // Iniciar monitoreo de timeout de sesión
        iniciarMonitoreoSesion();
      } catch (err) {
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

    // Cleanup al desmontar
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
        // Cuando se agota el tiempo, cerrar sesión
        console.log('Sesión expirada por inactividad');
        logout();
      },
      onWarning: (mostrar) => {
        // Mostrar/ocultar advertencia
        setSessionWarning(prev => ({
          ...prev,
          showWarning: mostrar
        }));
      },
      onCountdownUpdate: (tiempoRestante) => {
        // Actualizar tiempo restante en el modal
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
      // ✅ Verificación de ubicación
      const geoResult = await GeolocationService.verifyLocationAccess();
      if (!geoResult.allowed) {
        return { success: false, error: 'Access denied due to geographic restriction.' };
      }

      // ✅ Guardar en localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      setAuthState({
        isAuthenticated: true,
        loading: false,
        currentUser: user,
        token,
        error: null
      });

      // Iniciar monitoreo de timeout de sesión después del login exitoso
      iniciarMonitoreoSesion();

      return { success: true };
    } catch (error) {
      console.error('Error during login context:', error);
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

  const logout = () => {
    // Detener monitoreo de sesión
    sessionTimeoutService.detenerMonitoreo();
    
    clearAuthData();
    setAuthState({
      isAuthenticated: false,
      loading: false,
      currentUser: null,
      token: null,
      error: null
    });
    
    // Resetear estado de advertencia
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
