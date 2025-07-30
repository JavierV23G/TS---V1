class SessionTimeoutService {
    constructor() {
        this.sessionTimeout = null;
        this.warningTimeout = null;
        this.countdownInterval = null;
        this.lastActivity = Date.now();
        
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
    }

    iniciarMonitoreo(callbacks = {}) {
        this.onTimeout = callbacks.onTimeout || (() => {});
        this.onWarning = callbacks.onWarning || (() => {});
        this.onCountdownUpdate = callbacks.onCountdownUpdate || (() => {});
        
        this.reiniciarTimers();
        this.agregarListenersActividad();
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
        this.limpiarTimers();
        this.onTimeout();
    }

    extenderSesion() {
        this.isWarningActive = false;
        this.onWarning(false);
        this.reiniciarTimers();
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
    }

    manejarActividad = () => {
        if (!this.isWarningActive) {
            const ahora = Date.now();
            const tiempoInactivo = ahora - this.lastActivity;
            
            // Solo reiniciar si ha pasado más de 1 segundo desde la última actividad
            if (tiempoInactivo > 1000) {
                this.reiniciarTimers();
            }
        }
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