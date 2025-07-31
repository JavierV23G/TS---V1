import JWTService from './JWTService';

class SessionTimeoutService {
    constructor() {
        this.sessionTimeout = null;
        this.warningTimeout = null;
        this.countdownInterval = null;
        this.tokenCheckInterval = null;
        this.jwtTimeout = null;
        this.lastActivity = Date.now();
        
        // Sistema de inactividad (independiente del JWT)
        this.INACTIVITY_TIMEOUT = 1200000; // 20 minutos de inactividad
        this.INACTIVITY_WARNING = 180000;  // 3 minutos de advertencia
        
        // Valores para JWT (se calculan dinámicamente)
        this.SESSION_DURATION = 1200000;
        this.WARNING_TIME = 180000;
        
        this.onTimeout = null;
        this.onWarning = null;
        this.onCountdownUpdate = null;
        
        this.activityEvents = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];
        
        this.isWarningActive = false;
        this.currentToken = null;
    }

    iniciarMonitoreo(callbacks = {}) {
        this.onTimeout = callbacks.onTimeout || (() => {});
        this.onWarning = callbacks.onWarning || (() => {});
        this.onCountdownUpdate = callbacks.onCountdownUpdate || (() => {});
        
        // Obtener token del localStorage
        this.currentToken = localStorage.getItem('auth_token');
        
        console.log('🚀 Iniciando sistema de monitoreo dual:');
        console.log('   📋 Inactividad: 20 min → ⚠️  Advertencia a los 17 min');
        console.log('   🔑 JWT Token: 60 min → 🔕 Expira SILENCIOSAMENTE (sin advertencia)');
        
        // Iniciar AMBOS sistemas de monitoreo
        this.iniciarMonitoreoInactividad(); // Sistema de inactividad
        
        if (this.currentToken) {
            this.iniciarMonitoreoJWT(); // Sistema de JWT
        }
        
        this.agregarListenersActividad();
    }

    iniciarMonitoreoInactividad() {
        console.log('⏱️  Iniciando monitoreo de inactividad (20 min)');
        this.lastActivity = Date.now();
        this.isWarningActive = false;
        
        // Timer para advertencia de inactividad (17 minutos)
        this.warningTimeout = setTimeout(() => {
            this.mostrarAdvertenciaInactividad();
        }, this.INACTIVITY_TIMEOUT - this.INACTIVITY_WARNING);
        
        // Timer para logout por inactividad (20 minutos)
        this.sessionTimeout = setTimeout(() => {
            this.ejecutarTimeoutInactividad();
        }, this.INACTIVITY_TIMEOUT);
    }

    iniciarMonitoreoJWT() {
        const tokenInfo = JWTService.getTokenInfo(this.currentToken);
        
        if (!tokenInfo.isValid || tokenInfo.isExpired) {
            console.log('Token inválido o expirado, ejecutando logout');
            this.ejecutarTimeout();
            return;
        }

        console.log('Iniciando monitoreo JWT:', {
            expiresAt: tokenInfo.expirationDate,
            timeUntilExpiration: tokenInfo.timeUntilExpiration,
            recommendedWarning: JWTService.getRecommendedWarningTime(this.currentToken)
        });

        // Usar tiempos del JWT
        this.SESSION_DURATION = tokenInfo.timeUntilExpiration;
        this.WARNING_TIME = JWTService.getRecommendedWarningTime(this.currentToken);
        
        // Configurar timers basados en el JWT
        this.configurarTimersJWT(tokenInfo);
        
        // Verificar token cada 30 segundos
        this.tokenCheckInterval = setInterval(() => {
            this.verificarTokenJWT();
        }, 30000);
    }

    configurarTimersJWT(tokenInfo) {
        // JWT NO debe mostrar advertencias, solo verificar expiración
        console.log(`🔑 JWT configurado para expirar silenciosamente en ${tokenInfo.timeUntilExpiration / 1000 / 60} minutos`);
        
        // NO configurar advertencia para JWT
        // Solo configurar timeout final para logout silencioso
        this.jwtTimeout = setTimeout(() => {
            this.ejecutarTimeout();
        }, tokenInfo.timeUntilExpiration);
    }

    verificarTokenJWT() {
        if (!this.currentToken) return;
        
        const tokenInfo = JWTService.getTokenInfo(this.currentToken);
        
        if (!tokenInfo.isValid || tokenInfo.isExpired) {
            console.log('Token expirado detectado en verificación periódica');
            this.ejecutarTimeout();
            return;
        }
        
        // Actualizar token si cambió en localStorage
        const newToken = localStorage.getItem('auth_token');
        if (newToken !== this.currentToken) {
            console.log('Token actualizado detectado, reiniciando monitoreo');
            this.currentToken = newToken;
            this.iniciarMonitoreoJWT();
        }
    }


    mostrarAdvertenciaInactividad() {
        console.log('⚠️  Advertencia de inactividad (3 min restantes)');
        this.isWarningActive = true;
        this.onWarning(true);
        
        let tiempoRestante = Math.floor(this.INACTIVITY_WARNING / 1000); // 180 segundos
        
        this.countdownInterval = setInterval(() => {
            tiempoRestante--;
            this.onCountdownUpdate(tiempoRestante);
            
            if (tiempoRestante <= 0) {
                clearInterval(this.countdownInterval);
                this.ejecutarTimeoutInactividad();
            }
        }, 1000);
    }

    ejecutarTimeoutInactividad() {
        console.log('🚪 Logout por inactividad (20 min sin actividad)');
        this.limpiarTimers();
        
        // Invalidar token también
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        
        this.onTimeout();
    }

    detenerMonitoreo() {
        this.limpiarTimers();
        this.removerListenersActividad();
    }

    reiniciarTimers() {
        this.limpiarTimers();
        this.lastActivity = Date.now();
        this.isWarningActive = false;
        
        this.warningTimeout = setTimeout(() => {
            this.mostrarAdvertencia();
        }, this.SESSION_DURATION - this.WARNING_TIME);
        
        this.sessionTimeout = setTimeout(() => {
            this.ejecutarTimeout();
        }, this.SESSION_DURATION);
    }

    mostrarAdvertencia() {
        this.isWarningActive = true;
        this.onWarning(true);
        
        let tiempoRestante = Math.floor(this.WARNING_TIME / 1000);
        
        this.countdownInterval = setInterval(() => {
            tiempoRestante--;
            this.onCountdownUpdate(tiempoRestante);
            
            if (tiempoRestante <= 0) {
                clearInterval(this.countdownInterval);
            }
        }, 1000);
    }

    ejecutarTimeout() {
        console.log('🔑 Logout por expiración de JWT (60 min)');
        this.limpiarTimers();
        this.onTimeout();
    }

    extenderSesion() {
        console.log('🔄 Extendiendo sesión desde modal de advertencia');
        this.isWarningActive = false;
        this.onWarning(false);
        
        // Limpiar countdown actual
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // Reiniciar solo el timer de inactividad
        this.reiniciarTimerInactividad();
    }

    // Método para actualizar token (cuando implementes refresh token)
    actualizarToken(nuevoToken) {
        this.currentToken = nuevoToken;
        localStorage.setItem('auth_token', nuevoToken);
        
        // Reiniciar monitoreo con nuevo token
        this.iniciarMonitoreoJWT();
    }

    limpiarTimers() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }
        
        if (this.warningTimeout) {
            clearTimeout(this.warningTimeout);
            this.warningTimeout = null;
        }
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        if (this.tokenCheckInterval) {
            clearInterval(this.tokenCheckInterval);
            this.tokenCheckInterval = null;
        }
        
        if (this.jwtTimeout) {
            clearTimeout(this.jwtTimeout);
            this.jwtTimeout = null;
        }
    }

    manejarActividad = () => {
        if (!this.isWarningActive) {
            const ahora = Date.now();
            const tiempoInactivo = ahora - this.lastActivity;
            
            // Solo reiniciar si ha pasado más de 1 segundo desde la última actividad
            if (tiempoInactivo > 1000) {
                console.log('🖱️  Actividad detectada - reiniciando timer de inactividad');
                this.reiniciarTimerInactividad();
            }
        }
    }

    reiniciarTimerInactividad() {
        // Solo reiniciar el timer de inactividad, NO el JWT
        if (this.warningTimeout) {
            clearTimeout(this.warningTimeout);
        }
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }
        
        this.iniciarMonitoreoInactividad();
    }

    agregarListenersActividad() {
        this.activityEvents.forEach(evento => {
            document.addEventListener(evento, this.manejarActividad, true);
        });
    }

    removerListenersActividad() {
        this.activityEvents.forEach(evento => {
            document.removeEventListener(evento, this.manejarActividad, true);
        });
    }

    // Método para cambiar configuración (útil para cambiar entre pruebas y producción)
    configurarTiempos(duracionSesion, tiempoAdvertencia) {
        this.SESSION_DURATION = duracionSesion;
        this.WARNING_TIME = tiempoAdvertencia;
        
        // Si ya está monitoreando, reiniciar con nuevos tiempos
        if (this.sessionTimeout || this.warningTimeout) {
            this.reiniciarTimers();
        }
    }

    // Obtener tiempo restante de sesión
    obtenerTiempoRestante() {
        const tiempoTranscurrido = Date.now() - this.lastActivity;
        const tiempoRestante = Math.max(0, this.SESSION_DURATION - tiempoTranscurrido);
        return Math.floor(tiempoRestante / 1000); // retornar en segundos
    }
}

// Exportar una instancia única del servicio
const sessionTimeoutService = new SessionTimeoutService();
export default sessionTimeoutService;