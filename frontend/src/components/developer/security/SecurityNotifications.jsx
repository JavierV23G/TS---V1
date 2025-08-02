// ===================================
// 🚨 SECURITY NOTIFICATIONS SYSTEM
// Real-time security alerts component
// ===================================

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../login/AuthContext';
import { toast } from 'react-toastify';
import './SecurityNotifications.scss';

const SecurityNotifications = () => {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [alertCount, setAlertCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const socketRef = useRef(null);
  
  useEffect(() => {
    if (currentUser?.role === 'developer' || currentUser?.role === 'admin') {
      connectToWebSocket();
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [currentUser]);
  
  const connectToWebSocket = () => {
    try {
      const wsUrl = 'ws://localhost:8001';
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log('🚨 [WEBSOCKET] Connected to security alerts');
        setConnectionStatus('connected');
        
        // Send authentication
        socket.send(JSON.stringify({
          type: 'AUTH',
          username: currentUser.username,
          role: currentUser.role,
          token: localStorage.getItem('auth_token')
        }));
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('🚨 [WEBSOCKET] Message parse error:', error);
        }
      };
      
      socket.onclose = () => {
        console.log('🚨 [WEBSOCKET] Connection closed');
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (currentUser?.role === 'developer' || currentUser?.role === 'admin') {
            connectToWebSocket();
          }
        }, 5000);
      };
      
      socket.onerror = (error) => {
        console.error('🚨 [WEBSOCKET] Connection error:', error);
        setConnectionStatus('error');
      };
      
    } catch (error) {
      console.error('🚨 [WEBSOCKET] Failed to connect:', error);
      setConnectionStatus('error');
    }
  };
  
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'CONNECTED':
        console.log('🚨 [WEBSOCKET] Authentication successful');
        requestRecentAlerts();
        requestStatistics();
        break;
        
      case 'FAILED_LOGIN':
      case 'HIGH_RISK_LOGIN':
      case 'NEW_DEVICE':
      case 'ACCOUNT_LOCKOUT':
      case 'SESSION_TERMINATED':
        handleSecurityAlert(data);
        break;
        
      case 'RECENT_ALERTS':
        setAlerts(data.alerts || []);
        break;
        
      case 'STATISTICS':
        setStatistics(data.data);
        break;
        
      case 'ERROR':
        console.error('🚨 [WEBSOCKET] Server error:', data.message);
        break;
        
      default:
        console.log('🚨 [WEBSOCKET] Unknown message type:', data.type);
    }
  };
  
  const handleSecurityAlert = (alert) => {
    // Add to alerts list
    setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50
    setAlertCount(prev => prev + 1);
    
    // Show toast notification
    showToastAlert(alert);
  };
  
  const showToastAlert = (alert) => {
    const toastConfig = {
      position: 'top-right',
      autoClose: 8000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        maxWidth: '400px',
        fontSize: '14px'
      }
    };
    
    switch (alert.severity) {
      case 'CRITICAL':
        toast.error(
          <AlertToast alert={alert} />,
          { ...toastConfig, autoClose: 10000 }
        );
        break;
      case 'HIGH':
        toast.error(<AlertToast alert={alert} />, toastConfig);
        break;
      case 'MEDIUM':
      case 'WARNING':
        toast.warn(<AlertToast alert={alert} />, toastConfig);
        break;
      default:
        toast.info(<AlertToast alert={alert} />, toastConfig);
    }
  };
  
  const requestRecentAlerts = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'GET_RECENT_ALERTS',
        limit: 20
      }));
    }
  };
  
  const requestStatistics = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'GET_STATISTICS'
      }));
    }
  };
  
  const clearAlerts = () => {
    setAlerts([]);
    setAlertCount(0);
  };
  
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return alertTime.toLocaleDateString();
  };
  
  const getAlertIcon = (type) => {
    switch (type) {
      case 'FAILED_LOGIN': return '🚨';
      case 'HIGH_RISK_LOGIN': return '⚠️';
      case 'NEW_DEVICE': return '🆕';
      case 'ACCOUNT_LOCKOUT': return '🔒';
      case 'SESSION_TERMINATED': return '⚡';
      default: return '🔔';
    }
  };
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#d97706';
      case 'WARNING': return '#ca8a04';
      case 'LOW': return '#16a34a';
      default: return '#6b7280';
    }
  };
  
  if (!currentUser || (currentUser.role !== 'developer' && currentUser.role !== 'admin')) {
    return null;
  }
  
  return (
    <>
      {/* Notification Badge */}
      <div className="security-notifications-badge" onClick={() => setShowPanel(!showPanel)}>
        <i className="fas fa-bell"></i>
        {alertCount > 0 && (
          <span className="notification-count">{alertCount > 99 ? '99+' : alertCount}</span>
        )}
        <div className={`connection-indicator ${connectionStatus}`}></div>
      </div>
      
      {/* Notifications Panel */}
      {showPanel && (
        <div className="security-notifications-panel">
          <div className="panel-header">
            <div className="panel-title">
              <i className="fas fa-shield-alt"></i>
              Security Alerts
            </div>
            <div className="panel-actions">
              <button 
                className="btn-icon" 
                onClick={requestRecentAlerts}
                title="Refresh"
              >
                <i className="fas fa-sync"></i>
              </button>
              <button 
                className="btn-icon" 
                onClick={clearAlerts}
                title="Clear all"
              >
                <i className="fas fa-trash"></i>
              </button>
              <button 
                className="btn-icon" 
                onClick={() => setShowPanel(false)}
                title="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div className="connection-status">
            <div className={`status-indicator ${connectionStatus}`}>
              <div className="status-dot"></div>
              <span>
                {connectionStatus === 'connected' && 'Live Monitoring Active'}
                {connectionStatus === 'disconnected' && 'Reconnecting...'}
                {connectionStatus === 'error' && 'Connection Error'}
              </span>
            </div>
          </div>
          
          {statistics && (
            <div className="alert-statistics">
              <div className="stat-item">
                <span className="stat-value">{statistics.alerts_24h}</span>
                <span className="stat-label">Today</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{statistics.total_alerts}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{statistics.connected_admins}</span>
                <span className="stat-label">Admins</span>
              </div>
            </div>
          )}
          
          <div className="alerts-list">
            {alerts.length === 0 ? (
              <div className="no-alerts">
                <i className="fas fa-shield-check"></i>
                <p>No security alerts</p>
                <small>System monitoring active</small>
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div key={alert.id || index} className={`alert-item severity-${alert.severity?.toLowerCase()}`}>
                  <div className="alert-icon">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-meta">
                      <span className="alert-time">{formatTimeAgo(alert.timestamp)}</span>
                      <span className="alert-severity" style={{color: getSeverityColor(alert.severity)}}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                  {alert.actions && (
                    <div className="alert-actions">
                      {alert.actions.slice(0, 2).map((action, idx) => (
                        <button key={idx} className="alert-action-btn">
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Toast Alert Component
const AlertToast = ({ alert }) => (
  <div className="toast-alert">
    <div className="toast-title">
      <span className="toast-icon">{alert.title.includes('🚨') ? '🚨' : '⚠️'}</span>
      {alert.title}
    </div>
    <div className="toast-message">{alert.message}</div>
    {alert.data?.username && (
      <div className="toast-meta">
        User: <strong>{alert.data.username}</strong>
        {alert.data?.ip && ` • IP: ${alert.data.ip}`}
      </div>
    )}
  </div>
);

export default SecurityNotifications;