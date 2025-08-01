
const ALLOWED_COUNTRIES = ['US', 'USA', 'United States'];
const GEO_API_URL = 'https://ipapi.co/json/';

const DEV_MODE = false; 

export const checkGeolocation = async () => {
  
  if (DEV_MODE) {
    return {
      allowed: true,
      reason: 'Development mode bypass',
      location: {
        country: 'United States',
        countryCode: 'US',
        region: 'Development',
        city: 'Development',
        ip: '127.0.0.1'
      }
    };
  }

  try {
    const locationData = await getLocationData();
    
    if (!locationData || !locationData.country_code) {
      return {
        allowed: false,
        reason: 'Unable to verify location',
        location: null
      };
    }
    
    const isAllowed = ALLOWED_COUNTRIES.includes(locationData.country_code) ||
                     ALLOWED_COUNTRIES.includes(locationData.country_name);
    
    
    return {
      allowed: isAllowed,
      reason: isAllowed ? 'Location allowed' : 'Geographic restriction',
      location: {
        country: locationData.country_name,
        countryCode: locationData.country_code,
        region: locationData.region,
        city: locationData.city,
        ip: locationData.ip
      }
    };
  } catch (error) {
    
    return {
      allowed: false,
      reason: 'Error verifying location, access denied',
      error: error.message
    };
  }
};

const getLocationData = async () => {
  // Descomentar esta línea para simular estar en otro país
  // return { country_code: 'MX', country_name: 'Mexico', region: 'Ciudad de Mexico', city: 'Mexico City', ip: '123.456.789.0' };
  
  try {
    // Hacer solicitud a la API de geolocalización
    console.log('Fetching location data from:', GEO_API_URL);
    const response = await fetch(GEO_API_URL);
    
    if (!response.ok) {
      throw new Error(`Geolocation API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Geolocation API response:', data);
    return data;
  } catch (error) {
    console.error('Error getting location data:', error);
    return null;
  }
};

/**
 * Servicio completo de geolocalización
 */
class GeolocationService {
  /**
   * Verificar acceso por ubicación
   * @returns {Promise<Object>} Resultado de la verificación
   */
  static async verifyLocationAccess() {
    return await checkGeolocation();
  }
  
  /**
   * Obtener información detallada de la ubicación
   * @returns {Promise<Object>} Información de ubicación
   */
  static async getDetailedLocation() {
    try {
      const locationData = await getLocationData();
      return locationData;
    } catch (error) {
      console.error('Error getting detailed location:', error);
      return null;
    }
  }
  
  /**
   * Comprobar si el país del usuario está permitido
   * @param {string} countryCode - Código de país a verificar
   * @returns {boolean} True si está permitido
   */
  static isCountryAllowed(countryCode) {
    if (DEV_MODE) return true;
    
    if (!countryCode) return false;
    return ALLOWED_COUNTRIES.includes(countryCode.toUpperCase());
  }
  
  /**
   * Función auxiliar para simular una ubicación diferente (solo para pruebas)
   * @param {string} countryCode - Código de país a simular
   */
  static simulateLocation(countryCode, countryName) {
    // Esta función es solo para pruebas
    localStorage.setItem('simulated_country_code', countryCode);
    localStorage.setItem('simulated_country_name', countryName);
    console.log('Simulating location:', countryCode, countryName);
  }
}

export default GeolocationService;