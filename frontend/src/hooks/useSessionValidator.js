import { useEffect, useRef } from 'react';
import { useAuth } from '../components/login/AuthContext';

/**
 * Hook para validar sesiones en tiempo real
 * Verifica si el usuario fue bloqueado y fuerza logout
 */
export const useSessionValidator = () => {
  const { currentUser, logout } = useAuth();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.username) {
      return;
    }

    console.log(`[SESSION-VALIDATOR] Iniciando validación para ${currentUser.username}`);

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
            username: currentUser.username
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          if (!data.valid && data.force_logout) {
            console.log(`[SESSION-VALIDATOR] 🚨 Sesión invalidada para ${currentUser.username} - forzando logout`);
            
            // Mostrar mensaje al usuario
            alert(`Your session has been terminated by an administrator.\nReason: ${data.reason || 'Account blocked'}`);
            
            // Forzar logout
            logout();
          }
        }
      } catch (error) {
        console.error('[SESSION-VALIDATOR] Error verificando sesión:', error);
      }
    }, 10000); // Cada 10 segundos

    // Cleanup
    return () => {
      if (intervalRef.current) {
        console.log(`[SESSION-VALIDATOR] Deteniendo validación para ${currentUser.username}`);
        clearInterval(intervalRef.current);
      }
    };
  }, [currentUser, logout]);

  // Función para verificar manualmente
  const checkSessionNow = async () => {
    if (!currentUser?.username) return true;

    try {
      const response = await fetch('http://localhost:8000/auth/check-session-validity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          username: currentUser.username
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (!data.valid && data.force_logout) {
          console.log(`[SESSION-VALIDATOR] 🚨 Sesión invalidada para ${currentUser.username} - forzando logout inmediato`);
          
          alert(`Your session has been terminated by an administrator.\nReason: ${data.reason || 'Account blocked'}`);
          logout();
          return false;
        }
        
        return data.valid;
      }
      
      return true;
    } catch (error) {
      console.error('[SESSION-VALIDATOR] Error en verificación manual:', error);
      return true;
    }
  };

  return { checkSessionNow };
};

export default useSessionValidator;