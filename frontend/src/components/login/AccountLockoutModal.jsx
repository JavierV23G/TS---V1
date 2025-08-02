import '../../styles/Login/AccountLockoutModal.scss';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faExclamationTriangle, faShieldAlt, faClock } from '@fortawesome/free-solid-svg-icons';

const AccountLockoutModal = ({ 
    isVisible, 
    lockoutInfo, 
    username, 
    onContactAdmin,
    onTryAgainLater 
}) => {
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [formattedTime, setFormattedTime] = useState('');

    useEffect(() => {
        if (lockoutInfo) {
            // Sistema frontend (localStorage) - tiene lockoutUntil
            if (lockoutInfo.lockoutUntil) {
                const updateCountdown = () => {
                    const now = Date.now();
                    const remaining = Math.max(0, lockoutInfo.lockoutUntil - now);
                    setTimeRemaining(remaining);
                    
                    if (remaining > 0) {
                        setFormattedTime(formatTime(remaining));
                    } else {
                        setFormattedTime('');
                        if (onTryAgainLater) {
                            setTimeout(() => onTryAgainLater(), 1000);
                        }
                    }
                };

                updateCountdown();
                const interval = setInterval(updateCountdown, 1000);
                return () => clearInterval(interval);
            }
            // Sistema backend - tiene retry_after (segundos) o remaining_minutes
            else if (lockoutInfo.retry_after || lockoutInfo.remaining_minutes) {
                const initialSeconds = lockoutInfo.retry_after || (lockoutInfo.remaining_minutes * 60);
                const startTime = Date.now();
                
                const updateCountdown = () => {
                    const elapsed = Math.floor((Date.now() - startTime) / 1000);
                    const remaining = Math.max(0, initialSeconds - elapsed);
                    setTimeRemaining(remaining * 1000); // Convertir a milisegundos para formatTime
                    
                    if (remaining > 0) {
                        setFormattedTime(formatTime(remaining * 1000));
                    } else {
                        setFormattedTime('');
                        if (onTryAgainLater) {
                            setTimeout(() => onTryAgainLater(), 1000);
                        }
                    }
                };

                updateCountdown();
                const interval = setInterval(updateCountdown, 1000);
                return () => clearInterval(interval);
            }
        }
    }, [lockoutInfo, onTryAgainLater]);

    const formatTime = (milliseconds) => {
        const hours = Math.floor(milliseconds / 3600000);
        const minutes = Math.floor((milliseconds % 3600000) / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    };

    const getLockoutSeverity = () => {
        if (!lockoutInfo) return 'low';
        
        if (lockoutInfo.isMaxLevel) return 'critical';
        if (lockoutInfo.lockoutLevel >= 4) return 'high';
        if (lockoutInfo.lockoutLevel >= 2) return 'medium';
        return 'low';
    };

    const getSeverityConfig = () => {
        const severity = getLockoutSeverity();
        
        const configs = {
            low: {
                iconColor: '#f59e0b',
                progressColor: '#fbbf24',
                title: 'Account Security Block',
                description: 'Your account has been blocked by the Security System. Please contact your administrator for assistance.'
            },
            medium: {
                iconColor: '#f97316', 
                progressColor: '#fb923c',
                title: 'Account Security Block',
                description: 'Your account has been blocked by the Security System. Please contact your administrator for assistance.'
            },
            high: {
                iconColor: '#dc2626',
                progressColor: '#ef4444', 
                title: 'Account Security Block',
                description: 'Your account has been blocked by the Security System. Please contact your administrator for assistance.'
            },
            critical: {
                iconColor: '#991b1b',
                progressColor: '#dc2626',
                title: 'Account Security Block',
                description: 'Your account has been blocked by the Security System. Please contact your administrator for assistance.'
            }
        };
        
        return configs[severity];
    };

    const getBlockLevelText = (level) => {
        const blockLevels = {
            1: 'One Minute Block',
            2: 'Two Minutes Block',
            3: 'Ten Minutes Block',
            4: 'Thirty Minutes Block',
            5: 'One Hour Block',
            6: 'Two Hours Block',
            7: 'Permanent Block'
        };
        
        return blockLevels[level] || `Level ${level} Block`;
    };

    const config = getSeverityConfig();
    const progressPercentage = lockoutInfo?.lockoutDuration ? 
        ((lockoutInfo.lockoutDuration - timeRemaining) / lockoutInfo.lockoutDuration) * 100 : 0;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    className="account-lockout-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div 
                        className="account-lockout-modal"
                        initial={{ scale: 0.8, opacity: 0, y: -50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: -50 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 25 
                        }}
                    >
                        <div className="modal-header">
                            <motion.div 
                                className="security-icon"
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    rotate: [0, -5, 5, 0]
                                }}
                                transition={{ 
                                    duration: 2, 
                                    repeat: Infinity,
                                    repeatDelay: 3
                                }}
                            >
                                <FontAwesomeIcon 
                                    icon={faShieldAlt} 
                                    className="icon-shield"
                                    style={{ color: config.iconColor }}
                                />
                                <FontAwesomeIcon 
                                    icon={faLock} 
                                    className="icon-lock"
                                />
                            </motion.div>
                            <h2>{config.title}</h2>
                        </div>

                        <div className="modal-body">
                            <div className="lockout-info">
                                <div className="user-info">
                                    <strong>User:</strong> {username}
                                </div>
                                
                                <div className="description">
                                    {/* Mostrar mensaje del backend si existe */}
                                    {lockoutInfo?.message || config.description}
                                </div>

                                {timeRemaining > 0 && (
                                    <div className="countdown-section">
                                        <div className="time-display">
                                            <FontAwesomeIcon 
                                                icon={faClock} 
                                                className="clock-icon"
                                                spin
                                            />
                                            <motion.span 
                                                className="time-text"
                                                key={formattedTime}
                                                initial={{ scale: 1.2, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {formattedTime}
                                            </motion.span>
                                        </div>

                                        <div className="progress-container">
                                            <motion.div 
                                                className="progress-bar"
                                                style={{ 
                                                    width: `${progressPercentage}%`,
                                                    backgroundColor: config.progressColor
                                                }}
                                                initial={{ width: '0%' }}
                                                animate={{ width: `${progressPercentage}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>

                                        <div className="progress-label">
                                            Lockout time elapsed
                                        </div>
                                    </div>
                                )}

                                <div className="security-details">
                                    <div className="detail-item">
                                        <FontAwesomeIcon icon={faExclamationTriangle} />
                                        <span>Block Level: {getBlockLevelText(lockoutInfo?.block_level || lockoutInfo?.lockoutLevel || 1)}</span>
                                    </div>
                                    
                                    <div className="detail-item">
                                        <FontAwesomeIcon icon={faLock} />
                                        <span>Account has been blocked by Security System</span>
                                    </div>
                                </div>
                            </div>

                            <motion.div 
                                className="action-buttons"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <motion.button 
                                    className="try-later-button"
                                    onClick={onTryAgainLater}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={timeRemaining > 0}
                                >
                                    <FontAwesomeIcon icon={faClock} className="button-icon" />
                                    {timeRemaining > 0 ? 'Waiting...' : 'Close'}
                                </motion.button>
                            </motion.div>

                            <div className="security-notice">
                                <FontAwesomeIcon icon={faShieldAlt} />
                                <span>
                                    Please contact your system administrator to restore account access.
                                </span>
                            </div>
                        </div>

                        <motion.div 
                            className="decorative-element element-1"
                            animate={{ 
                                rotate: 360,
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                                duration: 25, 
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                        <motion.div 
                            className="decorative-element element-2"
                            animate={{ 
                                rotate: -360,
                                scale: [1, 0.9, 1]
                            }}
                            transition={{ 
                                duration: 20, 
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AccountLockoutModal;