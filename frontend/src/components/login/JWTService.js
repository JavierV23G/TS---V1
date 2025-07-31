/**
 * Servicio para manejo de tokens JWT
 */
class JWTService {
  /**
   * Decodifica un token JWT sin verificar la firma
   * @param {string} token - Token JWT
   * @returns {Object|null} Payload decodificado o null si es inválido
   */
  static decodeToken(token) {
    if (!token) return null;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      // Decodificar el payload (parte 2)
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Error decodificando JWT:', error);
      return null;
    }
  }

  /**
   * Verifica si un token ha expirado
   * @param {string} token - Token JWT
   * @returns {boolean} True si el token expiró
   */
  static isTokenExpired(token) {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return true;
    
    // exp está en segundos, Date.now() en milisegundos
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  /**
   * Obtiene el tiempo restante antes de que expire el token
   * @param {string} token - Token JWT
   * @returns {number} Milisegundos restantes, 0 si ya expiró
   */
  static getTimeUntilExpiration(token) {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = payload.exp - currentTime;
    
    return Math.max(0, timeLeft * 1000); // Convertir a milisegundos
  }

  /**
   * Obtiene información completa del token
   * @param {string} token - Token JWT
   * @returns {Object} Información del token
   */
  static getTokenInfo(token) {
    const payload = this.decodeToken(token);
    if (!payload) {
      return {
        isValid: false,
        isExpired: true,
        timeUntilExpiration: 0,
        expirationDate: null
      };
    }

    const isExpired = this.isTokenExpired(token);
    const timeUntilExpiration = this.getTimeUntilExpiration(token);
    const expirationDate = payload.exp ? new Date(payload.exp * 1000) : null;

    return {
      isValid: true,
      isExpired,
      timeUntilExpiration,
      expirationDate,
      payload
    };
  }

  /**
   * Calcula el tiempo de advertencia recomendado para JWT
   * @param {string} token - Token JWT
   * @returns {number} Milisegundos antes de expiración para mostrar advertencia
   */
  static getRecommendedWarningTime(token) {
    // NO mostrar advertencia para JWT - expira silenciosamente a los 60 min
    // Solo el sistema de inactividad debe mostrar advertencias
    return 0;
  }
}

export default JWTService;