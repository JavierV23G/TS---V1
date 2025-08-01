/**
 * Utilidades de seguridad para el manejo de bloqueos de usuario
 * Funciones auxiliares para verificar y manejar el estado de bloqueos
 */
import failedAttemptsService from '../components/login/FailedAttemptsService';

/**
 * Verifica si un usuario aún está bloqueado después de una revocación
 * @param {string} username - Nombre de usuario a verificar
 * @param {number} maxRetries - Máximo número de reintentos (default: 3)
 * @param {number} retryDelay - Delay entre reintentos en ms (default: 1000)
 * @returns {Promise<{blocked: boolean, blockInfo?: Object}>}
 */
export const checkUserBlockStatus = async (username, maxRetries = 3, retryDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('http://localhost:8000/auth/check-block-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ username })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[SECURITY-UTILS] Intento ${attempt}: Usuario ${username} - Bloqueado: ${data.blocked}`);
        
        if (!data.blocked) {
          // Usuario no bloqueado - revocación exitosa
          return { blocked: false };
        } else {
          // Usuario aún bloqueado
          return { blocked: true, blockInfo: data.block_info };
        }
      } else {
        console.warn(`[SECURITY-UTILS] Error en intento ${attempt}: ${response.status}`);
      }
    } catch (error) {
      console.error(`[SECURITY-UTILS] Error en intento ${attempt}:`, error);
    }

    // Esperar antes del siguiente intento (excepto en el último)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  // Si llegamos aquí, asumimos que el usuario no está bloqueado
  console.warn(`[SECURITY-UTILS] Máximo de reintentos alcanzado para ${username}, asumiendo no bloqueado`);
  return { blocked: false };
};

/**
 * Espera a que un usuario sea desbloqueado después de una revocación
 * @param {string} username - Nombre de usuario
 * @param {number} timeoutMs - Timeout máximo en ms (default: 10000)
 * @returns {Promise<boolean>} - true si se desbloqueó, false si timeout
 */
export const waitForUserUnblock = async (username, timeoutMs = 10000) => {
  const startTime = Date.now();
  const pollInterval = 500; // 500ms entre verificaciones

  while (Date.now() - startTime < timeoutMs) {
    const { blocked } = await checkUserBlockStatus(username, 1, 0);
    
    if (!blocked) {
      console.log(`[SECURITY-UTILS] ✅ Usuario ${username} desbloqueado exitosamente`);
      return true;
    }

    // Esperar antes de la siguiente verificación
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  console.warn(`[SECURITY-UTILS] ⏰ Timeout esperando desbloqueo de ${username}`);
  return false;
};

/**
 * Revoca un bloqueo directamente
 * @param {string} username - Nombre de usuario
 * @param {string} blockType - Tipo de bloqueo ('temporary' o 'permanent')
 * @param {string} revokedBy - Quien revoca el bloqueo
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const revokeBlockAndWait = async (username, blockType, revokedBy = 'developer') => {
  try {
    // Determinar el endpoint según el tipo
    const endpoint = blockType === 'temporary' ? 
      'revoke-temporary-block' : 
      'revoke-permanent-block';

    console.log(`[SECURITY-UTILS] 🚨 Revocando bloqueo ${blockType} para ${username} con limpieza completa`);

    // Hacer la revocación - ahora con limpieza completa garantizada
    const response = await fetch(`http://localhost:8000/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        username: username,
        revoked_by: revokedBy
      })
    });

    const data = await response.json();

    if (response.ok && data['⚡ RESULT']?.success) {
      console.log(`[SECURITY-UTILS] ✅ Bloqueo ${blockType} revocado exitosamente para ${username} - Usuario completamente limpiado`);
      
      // CRÍTICO: Limpiar también el localStorage del frontend
      console.log(`[SECURITY-UTILS] 🧹 Limpiando localStorage para ${username}`);
      failedAttemptsService.forceUnlockAccount(username);
      
      return {
        success: true,
        message: `${blockType} block successfully revoked for ${username} - User completely reset`
      };
    } else {
      console.error(`[SECURITY-UTILS] ❌ Error en revocación:`, data);
      return {
        success: false,
        message: data['⚡ RESULT']?.message || 'Failed to revoke block'
      };
    }
  } catch (error) {
    console.error(`[SECURITY-UTILS] ❌ Error revocando bloqueo:`, error);
    return {
      success: false,
      message: 'Network error during block revocation'
    };
  }
};

/**
 * Formatea el tiempo de bloqueo restante para mostrar al usuario
 * @param {number} remainingSeconds - Segundos restantes
 * @returns {string} - Tiempo formateado
 */
export const formatRemainingTime = (remainingSeconds) => {
  if (remainingSeconds <= 0) return 'Expirado';
  
  if (remainingSeconds < 60) {
    return `${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.ceil(remainingSeconds / 60);
  return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
};

export default {
  checkUserBlockStatus,
  waitForUserUnblock,
  revokeBlockAndWait,
  formatRemainingTime
};