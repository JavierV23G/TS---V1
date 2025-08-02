import '../../styles/Login/SessionTimeoutModal.scss';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const SessionTimeoutModal = ({ timeRemaining, onExtendSession, isVisible }) => {
    const [displayTime, setDisplayTime] = useState(timeRemaining);

    useEffect(() => {
        setDisplayTime(timeRemaining);
    }, [timeRemaining]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressColor = () => {
        if (displayTime > 45) return '#4CAF50';
        if (displayTime > 30) return '#FFC107';
        return '#F44336';
    };

    const progressPercentage = (displayTime / 60) * 100;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    className="session-timeout-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div 
                        className="session-timeout-modal"
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
                                className="warning-icon"
                                animate={{ 
                                    rotate: [0, -10, 10, -10, 10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ 
                                    duration: 2, 
                                    repeat: Infinity,
                                    repeatDelay: 3
                                }}
                            >
                                <FontAwesomeIcon 
                                    icon={faExclamationTriangle} 
                                    className="icon-warning"
                                />
                            </motion.div>
                            <h2>Sesión por Expirar</h2>
                        </div>

                        <div className="modal-body">
                            <div className="time-display">
                                <FontAwesomeIcon 
                                    icon={faClock} 
                                    className="clock-icon"
                                    spin
                                />
                                <motion.span 
                                    className="time-text"
                                    key={displayTime}
                                    initial={{ scale: 1.2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {formatTime(displayTime)}
                                </motion.span>
                            </div>

                            <div className="progress-container">
                                <motion.div 
                                    className="progress-bar"
                                    style={{ 
                                        width: `${progressPercentage}%`,
                                        backgroundColor: getProgressColor()
                                    }}
                                    initial={{ width: '100%' }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>

                            <p className="warning-message">
                                Tu sesión expirará en {formatTime(displayTime)}. 
                                Por seguridad, el sistema cerrará automáticamente tu sesión.
                            </p>

                            <motion.div 
                                className="button-container"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <motion.button 
                                    className="extend-button"
                                    onClick={onExtendSession}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FontAwesomeIcon icon={faClock} className="button-icon" />
                                    Extender Sesión
                                </motion.button>
                            </motion.div>
                        </div>

                        <motion.div 
                            className="decorative-element element-1"
                            animate={{ 
                                rotate: 360,
                                scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                                duration: 20, 
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                        <motion.div 
                            className="decorative-element element-2"
                            animate={{ 
                                rotate: -360,
                                scale: [1, 0.8, 1]
                            }}
                            transition={{ 
                                duration: 15, 
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

export default SessionTimeoutModal;