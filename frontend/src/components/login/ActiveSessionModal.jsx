import React from 'react';
import './ActiveSessionModal.scss';

const ActiveSessionModal = ({ 
  isVisible, 
  username, 
  sessionInfo, 
  onForceLogin, 
  onCancel 
}) => {
  if (!isVisible) return null;

  const formatDuration = (duration) => {
    if (!duration) return 'Unknown duration';
    // duration viene como "2h 15m" desde el backend
    return duration;
  };

  const formatDevice = (userAgent) => {
    if (!userAgent) return 'Unknown device';
    
    // Detectar navegador
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    // Detectar OS
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    
    return `${browser} on ${os}`;
  };

  return (
    <div className="active-session-modal-overlay">
      <div className="active-session-modal">
        <div className="modal-header">
          <div className="modal-icon">
            <i className="fas fa-desktop"></i>
          </div>
          <h2 className="modal-title">Session Already Active</h2>
        </div>

        <div className="modal-body">
          <div className="session-warning">
            <p className="main-message">
              <strong>{username}</strong> is already logged in from another location.
            </p>
          </div>

          <div className="session-details">
            <div className="detail-item">
              <div className="detail-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="detail-content">
                <span className="detail-label">Active for</span>
                <span className="detail-value">{formatDuration(sessionInfo?.session_duration)}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <i className="fas fa-globe"></i>
              </div>
              <div className="detail-content">
                <span className="detail-label">Device</span>
                <span className="detail-value">{formatDevice(sessionInfo?.user_agent)}</span>
              </div>
            </div>

            {sessionInfo?.started_at && (
              <div className="detail-item">
                <div className="detail-icon">
                  <i className="fas fa-calendar"></i>
                </div>
                <div className="detail-content">
                  <span className="detail-label">Started</span>
                  <span className="detail-value">
                    {new Date(sessionInfo.started_at).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="modal-question">
            <p>Would you like to close the other session and continue here?</p>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="modal-button modal-button--cancel"
            onClick={onCancel}
          >
            <i className="fas fa-times"></i>
            Keep Other Session
          </button>
          
          <button 
            className="modal-button modal-button--confirm"
            onClick={onForceLogin}
          >
            <i className="fas fa-sign-in-alt"></i>
            Continue Here
          </button>
        </div>

        <div className="modal-footer">
          <div className="security-note">
            <i className="fas fa-shield-alt"></i>
            <span>For security, only one session is allowed per user</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveSessionModal;