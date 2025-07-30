import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/developer/support/FloatingSupportButtonDev.scss';

const FloatingSupportButton = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(3);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (unreadCount > 0) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [unreadCount]);
  
  const handleNavigateToSupport = () => {
    navigate('/support');
    setUnreadCount(0);
  };
  
  return (
    <>
      <button 
        className={`floating-support-button ${isAnimating ? 'animate' : ''}`}
        onClick={handleNavigateToSupport}
        aria-label="Open Support Dashboard"
      >
        <div className="button-icon">
          <i className="fas fa-headset"></i>
        </div>
        
        {unreadCount > 0 && (
          <div className="unread-badge">{unreadCount}</div>
        )}
        
        <div className="button-tooltip">
          <span>Support Dashboard</span>
        </div>
      </button>
    </>
  );
};

export default FloatingSupportButton;