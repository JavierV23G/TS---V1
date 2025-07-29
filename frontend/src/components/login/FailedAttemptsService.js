class FailedAttemptsService {
    constructor() {
        this.MAX_ATTEMPTS = 5;
        this.LOCKOUT_DURATIONS = [
            60000,
            300000,  
            900000,
            3600000,
            86400000
        ];
        
        this.onLockout = null;
        this.onAttemptFailed = null;
        this.onAccountUnlocked = null;
        
        this.checkExpiredLockouts();
    }

    setCallbacks(callbacks = {}) {
        this.onLockout = callbacks.onLockout || (() => {});
        this.onAttemptFailed = callbacks.onAttemptFailed || (() => {});
        this.onAccountUnlocked = callbacks.onAccountUnlocked || (() => {});
    }

    getAttemptData(username) {
        const key = `failed_attempts_${username.toLowerCase()}`;
        const data = localStorage.getItem(key);
        
        if (!data) {
            return {
                attempts: 0,
                lastAttempt: null,
                lockoutUntil: null,
                lockoutLevel: 0
            };
        }
        
        return JSON.parse(data);
    }

    saveAttemptData(username, data) {
        const key = `failed_attempts_${username.toLowerCase()}`;
        localStorage.setItem(key, JSON.stringify(data));
    }

    isAccountLocked(username) {
        const data = this.getAttemptData(username);
        
        if (!data.lockoutUntil) {
            return { isLocked: false };
        }
        
        const now = Date.now();
        
        if (now >= data.lockoutUntil) {
            this.clearAttempts(username);
            this.onAccountUnlocked(username);
            return { isLocked: false };
        }
        
        return {
            isLocked: true,
            lockoutUntil: data.lockoutUntil,
            remainingTime: data.lockoutUntil - now,
            lockoutLevel: data.lockoutLevel,
            attempts: data.attempts
        };
    }

    recordFailedAttempt(username) {
        const data = this.getAttemptData(username);
        const now = Date.now();
        
        // Increment attempts
        data.attempts += 1;
        data.lastAttempt = now;
        
        // Check if should lock
        if (data.attempts >= this.MAX_ATTEMPTS) {
            const lockoutLevel = Math.min(data.lockoutLevel, this.LOCKOUT_DURATIONS.length - 1);
            const lockoutDuration = this.LOCKOUT_DURATIONS[lockoutLevel];
            
            data.lockoutUntil = now + lockoutDuration;
            data.lockoutLevel = lockoutLevel + 1;
            
            this.saveAttemptData(username, data);
            
            // Notify lockout
            this.onLockout({
                username,
                attempts: data.attempts,
                lockoutUntil: data.lockoutUntil,
                lockoutDuration,
                lockoutLevel: lockoutLevel + 1,
                isMaxLevel: lockoutLevel >= this.LOCKOUT_DURATIONS.length - 1
            });
            
            return {
                shouldLock: true,
                lockoutInfo: {
                    lockoutUntil: data.lockoutUntil,
                    lockoutDuration,
                    lockoutLevel: lockoutLevel + 1,
                    isMaxLevel: lockoutLevel >= this.LOCKOUT_DURATIONS.length - 1
                }
            };
        }
        
        // Just increment attempts
        this.saveAttemptData(username, data);
        
        // Notify failed attempt
        this.onAttemptFailed({
            username,
            attempts: data.attempts,
            remainingAttempts: this.MAX_ATTEMPTS - data.attempts
        });
        
        return {
            shouldLock: false,
            attempts: data.attempts,
            remainingAttempts: this.MAX_ATTEMPTS - data.attempts
        };
    }

    // Clear failed attempts (successful login)
    clearAttempts(username) {
        const key = `failed_attempts_${username.toLowerCase()}`;
        localStorage.removeItem(key);
    }

    // Get remaining lockout time in readable format
    getFormattedTimeRemaining(remainingTime) {
        const hours = Math.floor(remainingTime / 3600000);
        const minutes = Math.floor((remainingTime % 3600000) / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }

    // Get lockout level message
    getLockoutLevelMessage(lockoutLevel) {
        const messages = [
            'First temporary lockout',
            'Second lockout - increased duration',
            'Third lockout - extended duration', 
            'Fourth lockout - significant duration',
            'Maximum lockout - contact administrator'
        ];
        
        return messages[Math.min(lockoutLevel - 1, messages.length - 1)];
    }

    // Check and clear expired lockouts
    checkExpiredLockouts() {
        const now = Date.now();
        const keys = Object.keys(localStorage).filter(key => key.startsWith('failed_attempts_'));
        
        keys.forEach(key => {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.lockoutUntil && now >= data.lockoutUntil) {
                localStorage.removeItem(key);
            }
        });
    }

    // Get all lockout statistics (for administrators)
    getAllLockoutStats() {
        const stats = [];
        const keys = Object.keys(localStorage).filter(key => key.startsWith('failed_attempts_'));
        
        keys.forEach(key => {
            const username = key.replace('failed_attempts_', '');
            const data = JSON.parse(localStorage.getItem(key));
            const lockStatus = this.isAccountLocked(username);
            
            stats.push({
                username,
                attempts: data.attempts,
                lastAttempt: data.lastAttempt,
                isCurrentlyLocked: lockStatus.isLocked,
                lockoutLevel: data.lockoutLevel,
                remainingTime: lockStatus.remainingTime
            });
        });
        
        return stats;
    }

    // Manually unlock account (administrators only)
    unlockAccount(username) {
        this.clearAttempts(username);
        this.onAccountUnlocked(username);
        
        return {
            success: true,
            message: `Account ${username} successfully unlocked`
        };
    }

    // Set maximum attempts (for testing or dynamic configuration)
    setMaxAttempts(maxAttempts) {
        this.MAX_ATTEMPTS = maxAttempts;
    }

    // Get current configuration
    getConfiguration() {
        return {
            maxAttempts: this.MAX_ATTEMPTS,
            lockoutDurations: this.LOCKOUT_DURATIONS.map(duration => ({
                milliseconds: duration,
                formatted: this.getFormattedTimeRemaining(duration)
            }))
        };
    }
}

// Export singleton instance of the service
const failedAttemptsService = new FailedAttemptsService();
export default failedAttemptsService;