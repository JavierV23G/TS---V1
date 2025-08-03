// ===================================
// 🖥️ DEVICE FINGERPRINTING SYSTEM
// Generates unique device signatures for security
// ===================================

class DeviceFingerprint {
  static async generate() {
    try {
      const fingerprint = {
        // Basic Device Info
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages?.join(',') || '',
        platform: navigator.platform,
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        
        // Screen & Display
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          colorDepth: window.screen.colorDepth,
          pixelDepth: window.screen.pixelDepth,
          availWidth: window.screen.availWidth,
          availHeight: window.screen.availHeight
        },
        
        // Window & Viewport
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          outerWidth: window.outerWidth,
          outerHeight: window.outerHeight
        },
        
        // Timezone & Location
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        
        // Hardware
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: navigator.deviceMemory || 'unknown',
        maxTouchPoints: navigator.maxTouchPoints || 0,
        
        // Browser Features
        webgl: await this.getWebGLInfo(),
        canvas: await this.getCanvasFingerprint(),
        fonts: await this.getAvailableFonts(),
        plugins: this.getPluginInfo(),
        
        // Advanced Features
        audioFingerprint: await this.getAudioFingerprint(),
        mediaDevices: await this.getMediaDevicesInfo(),
        
        // Generate unique hash
        hash: null // Will be calculated after all data is collected
      };
      
      // Generate hash from all collected data
      fingerprint.hash = await this.generateHash(fingerprint);
      
      return fingerprint;
    } catch (error) {
      console.error('[FINGERPRINT] Error generating fingerprint:', error);
      return this.getBasicFingerprint();
    }
  }
  
  static async getWebGLInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return 'not_supported';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        unmaskedVendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown',
        unmaskedRenderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown'
      };
    } catch (error) {
      return 'error';
    }
  }
  
  static async getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Draw unique pattern
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('TherapySync Security 🔒', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Device Fingerprint', 4, 45);
      
      return canvas.toDataURL();
    } catch (error) {
      return 'error';
    }
  }
  
  static async getAvailableFonts() {
    const fonts = [
      'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
      'Calibri', 'Cambria', 'Comic Sans MS', 'Consolas', 'Courier New',
      'Georgia', 'Helvetica', 'Impact', 'Lucida Console', 'Lucida Sans Unicode',
      'Microsoft Sans Serif', 'Palatino Linotype', 'Segoe UI', 'Tahoma',
      'Times New Roman', 'Trebuchet MS', 'Verdana'
    ];
    
    const available = [];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    
    // Create test canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Baseline measurement
    context.font = testSize + ' monospace';
    const baselineWidth = context.measureText(testString).width;
    
    for (const font of fonts) {
      context.font = testSize + ' ' + font + ', monospace';
      const width = context.measureText(testString).width;
      
      if (width !== baselineWidth) {
        available.push(font);
      }
    }
    
    return available;
  }
  
  static getPluginInfo() {
    const plugins = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      const plugin = navigator.plugins[i];
      plugins.push({
        name: plugin.name,
        filename: plugin.filename,
        description: plugin.description
      });
    }
    return plugins;
  }
  
  static async getAudioFingerprint() {
    return new Promise((resolve) => {
      let audioContext = null;
      let resolved = false;
      
      const cleanup = () => {
        if (audioContext && audioContext.state !== 'closed') {
          try {
            audioContext.close();
          } catch (e) {
            // Ignore close errors
          }
        }
      };
      
      const safeResolve = (value) => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(value);
        }
      };
      
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const analyser = audioContext.createAnalyser();
        const gainNode = audioContext.createGain();
        const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        
        oscillator.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        scriptProcessor.onaudioprocess = function(bins) {
          const fingerprint = Array.from(bins.inputBuffer.getChannelData(0))
            .slice(4500, 5000)
            .reduce((acc, val) => acc + Math.abs(val), 0)
            .toString();
          
          safeResolve(fingerprint);
        };
        
        oscillator.start(0);
        
        // Timeout after 1 second
        setTimeout(() => {
          safeResolve('timeout');
        }, 1000);
        
      } catch (error) {
        safeResolve('not_supported');
      }
    });
  }
  
  static async getMediaDevicesInfo() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return 'not_supported';
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.map(device => ({
        kind: device.kind,
        label: device.label ? 'available' : 'restricted'
      }));
    } catch (error) {
      return 'error';
    }
  }
  
  static async generateHash(data) {
    try {
      // Create string from fingerprint data
      const fingerprintString = JSON.stringify(data, null, 0);
      
      // Generate SHA-256 hash
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(fingerprintString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    } catch (error) {
      // Fallback to simple hash
      return this.simpleHash(JSON.stringify(data));
    }
  }
  
  static simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
  
  static getBasicFingerprint() {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hash: this.simpleHash(navigator.userAgent + window.screen.width + window.screen.height),
      basic: true
    };
  }
  
  // Utility methods for analysis
  static compareFingerprints(fp1, fp2) {
    if (!fp1 || !fp2) return 0;
    
    let score = 0;
    let totalChecks = 0;
    
    // Compare key fields
    const comparisons = [
      { field: 'userAgent', weight: 20 },
      { field: 'screen', weight: 15 },
      { field: 'timezone', weight: 10 },
      { field: 'language', weight: 10 },
      { field: 'platform', weight: 15 },
      { field: 'canvas', weight: 20 },
      { field: 'webgl', weight: 10 }
    ];
    
    for (const comp of comparisons) {
      totalChecks += comp.weight;
      
      const val1 = this.getNestedValue(fp1, comp.field);
      const val2 = this.getNestedValue(fp2, comp.field);
      
      if (val1 && val2 && JSON.stringify(val1) === JSON.stringify(val2)) {
        score += comp.weight;
      }
    }
    
    return Math.round((score / totalChecks) * 100);
  }
  
  static getNestedValue(obj, field) {
    if (field.includes('.')) {
      const parts = field.split('.');
      let value = obj;
      for (const part of parts) {
        value = value?.[part];
      }
      return value;
    }
    return obj?.[field];
  }
  
  static isLikelyBot(fingerprint) {
    const botIndicators = [
      !fingerprint.webgl || fingerprint.webgl === 'not_supported',
      !fingerprint.canvas || fingerprint.canvas === 'error',
      fingerprint.languages === '',
      fingerprint.plugins?.length === 0,
      fingerprint.hardwareConcurrency === 'unknown',
      !fingerprint.timezone
    ];
    
    const botScore = botIndicators.filter(Boolean).length;
    return botScore >= 3;
  }
}

export default DeviceFingerprint;