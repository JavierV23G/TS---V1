// ===================================
// 🚨 ENHANCED SECURITY MONITOR
// Real-time security monitoring and device fingerprinting visualization
// ===================================

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../login/AuthContext';
import { toast } from 'react-toastify';
import DeviceFingerprint from '../../../utils/DeviceFingerprint';
import './SecurityMonitor.scss';

const SecurityMonitor = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [stats, setStats] = useState({
    totalAlerts: 0,
    criticalAlerts: 0,
    lastAlert: null,
    deviceScore: null
  });
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  const socketRef = useRef(null);
  const [riskAnalysis, setRiskAnalysis] = useState(null);

  useEffect(() => {
    initializeDeviceFingerprint();
    if (currentUser?.role === 'developer' || currentUser?.role === 'admin') {
      connectToWebSocket();
      fetchSecurityAlerts();
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [currentUser]);

  const initializeDeviceFingerprint = async () => {
    try {
      console.log('🔍 [SECURITY MONITOR] Generating device fingerprint...');
      const fingerprint = await DeviceFingerprint.generate();
      
      // Analyze device risk
      const isBot = DeviceFingerprint.isLikelyBot(fingerprint);
      const riskScore = calculateRiskScore(fingerprint);
      
      const analysis = {
        fingerprint,
        isBot,
        riskScore,
        features: Object.keys(fingerprint).length,
        uniqueness: fingerprint.hash ? 'High' : 'Low',
        timestamp: new Date().toISOString()
      };
      
      setDeviceInfo(analysis);
      setRiskAnalysis(analysis);
      
      console.log('🎯 [SECURITY MONITOR] Device analysis complete:', {
        hash: fingerprint.hash?.substring(0, 8) + '...',
        features: analysis.features,
        riskScore: analysis.riskScore,
        isBot: analysis.isBot
      });
      
    } catch (error) {
      console.error('❌ [SECURITY MONITOR] Device fingerprint error:', error);
      toast.error('Failed to generate device fingerprint');
    }
  };

  const calculateRiskScore = (fingerprint) => {
    let score = 0;
    
    // Base score
    if (fingerprint.canvas === 'error') score += 25;
    if (fingerprint.webgl === 'not_supported') score += 20;
    if (!fingerprint.languages || fingerprint.languages === '') score += 15;
    if (!fingerprint.plugins || fingerprint.plugins.length === 0) score += 15;
    if (fingerprint.screen.width < 800 || fingerprint.screen.height < 600) score += 10;
    if (!fingerprint.timezone) score += 10;
    if (fingerprint.userAgent.includes('HeadlessChrome')) score += 50;
    
    return Math.min(score, 100);
  };

  const connectToWebSocket = () => {
    try {
      const wsUrl = 'ws://localhost:8001';
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log('🚨 [SECURITY MONITOR] WebSocket connected');
        setConnectionStatus('connected');
        
        // Send authentication
        socket.send(JSON.stringify({
          type: 'AUTH',
          username: currentUser.username,
          role: currentUser.role,
          token: localStorage.getItem('auth_token'),
          source: 'SecurityMonitor'
        }));
        
        toast.success('🔗 Security monitoring connected', {
          position: 'top-right',
          autoClose: 3000
        });
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('🚨 [SECURITY MONITOR] Message parse error:', error);
        }
      };
      
      socket.onclose = () => {
        console.log('🚨 [SECURITY MONITOR] WebSocket disconnected');
        setConnectionStatus('disconnected');
        
        // Auto-reconnect
        setTimeout(() => {
          if (currentUser?.role === 'developer' || currentUser?.role === 'admin') {
            connectToWebSocket();
          }
        }, 5000);
      };
      
      socket.onerror = (error) => {
        console.error('🚨 [SECURITY MONITOR] WebSocket error:', error);
        setConnectionStatus('error');
        toast.error('Security monitoring connection failed');
      };
      
    } catch (error) {
      console.error('🚨 [SECURITY MONITOR] Failed to connect:', error);
      setConnectionStatus('error');
    }
  };

  const handleWebSocketMessage = (data) => {
    console.log('📨 [SECURITY MONITOR] Received:', data.type);
    
    switch (data.type) {
      case 'CONNECTED':
        console.log('✅ [SECURITY MONITOR] Authentication successful');
        requestRecentAlerts();
        break;
        
      case 'FAILED_LOGIN':
      case 'HIGH_RISK_LOGIN':
      case 'NEW_DEVICE':
      case 'ACCOUNT_LOCKOUT':
      case 'SESSION_TERMINATED':
        handleSecurityAlert(data);
        break;
        
      case 'RECENT_ALERTS':
        setNotifications(data.alerts || []);
        updateStats(data.alerts || []);
        break;
        
      default:
        console.log('🔔 [SECURITY MONITOR] Unknown message:', data.type);
    }
  };

  const handleSecurityAlert = (alert) => {
    console.log('🚨 [SECURITY MONITOR] New alert:', alert.type);
    
    // Add to notifications
    setNotifications(prev => [alert, ...prev.slice(0, 49)]);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalAlerts: prev.totalAlerts + 1,
      criticalAlerts: alert.severity === 'CRITICAL' ? prev.criticalAlerts + 1 : prev.criticalAlerts,
      lastAlert: alert.timestamp
    }));
    
    // Show toast
    showNotificationToast(alert);
  };

  const showNotificationToast = (alert) => {
    const message = `${alert.title}: ${alert.message}`;
    
    switch (alert.severity) {
      case 'CRITICAL':
        toast.error(message, { autoClose: 10000 });
        break;
      case 'HIGH':
        toast.error(message, { autoClose: 8000 });
        break;
      case 'MEDIUM':
      case 'WARNING':
        toast.warn(message, { autoClose: 6000 });
        break;
      default:
        toast.info(message, { autoClose: 4000 });
    }
  };

  const requestRecentAlerts = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'GET_RECENT_ALERTS',
        limit: 50
      }));
    }
  };

  const fetchSecurityAlerts = async () => {
    try {
      // This is a mock fetch since WebSocket handles real-time data
      console.log('📊 [SECURITY MONITOR] Fetching security alerts...');
    } catch (error) {
      console.error('❌ [SECURITY MONITOR] Failed to fetch alerts:', error);
    }
  };

  const updateStats = (alerts) => {
    const critical = alerts.filter(a => a.severity === 'CRITICAL').length;
    const latest = alerts.length > 0 ? alerts[0].timestamp : null;
    
    setStats(prev => ({
      ...prev,
      totalAlerts: alerts.length,
      criticalAlerts: critical,
      lastAlert: latest
    }));
  };

  const testDeviceFingerprint = async () => {
    try {
      console.log('🧪 [TEST] Starting comprehensive device test...');
      toast.info('🧪 Running device fingerprint test...', { autoClose: 2000 });
      
      const fp1 = await DeviceFingerprint.generate();
      const isBot = DeviceFingerprint.isLikelyBot(fp1);
      
      console.log('🎯 [TEST] Device fingerprint results:', {
        hash: fp1.hash,
        features: Object.keys(fp1).length,
        isBot,
        canvas: fp1.canvas !== 'error',
        webgl: fp1.webgl !== 'not_supported',
        audio: fp1.audio !== 'error'
      });
      
      toast.success(`✅ Device test complete! Hash: ${fp1.hash.substring(0, 12)}...`, {
        autoClose: 5000
      });
      
      // Update device info
      await initializeDeviceFingerprint();
      
    } catch (error) {
      console.error('❌ [TEST] Device test failed:', error);
      toast.error('Device fingerprint test failed');
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setStats(prev => ({
      ...prev,
      totalAlerts: 0,
      criticalAlerts: 0,
      lastAlert: null
    }));
    toast.success('🧹 Notifications cleared');
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return time.toLocaleDateString();
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
      {/* Monitor Badge */}
      <div className="security-monitor-badge" onClick={() => setShowPanel(!showPanel)}>
        <i className="fas fa-shield-alt"></i>
        {stats.totalAlerts > 0 && (
          <span className="alert-count">{stats.totalAlerts > 99 ? '99+' : stats.totalAlerts}</span>
        )}
        <div className={`connection-status ${connectionStatus}`}></div>
      </div>

      {/* Monitor Panel */}
      {showPanel && (
        <div className="security-monitor-panel">
          {/* Header */}
          <div className="monitor-header">
            <div className="monitor-title">
              <i className="fas fa-shield-alt"></i>
              Security Monitor
            </div>
            <div className="monitor-actions">
              <button 
                className="btn-icon" 
                onClick={testDeviceFingerprint}
                title="Test Device Fingerprint"
              >
                <i className="fas fa-fingerprint"></i>
              </button>
              <button 
                className="btn-icon" 
                onClick={requestRecentAlerts}
                title="Refresh Alerts"
              >
                <i className="fas fa-sync"></i>
              </button>
              <button 
                className="btn-icon" 
                onClick={clearNotifications}
                title="Clear All"
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

          {/* Status Bar */}
          <div className="status-bar">
            <div className={`connection-indicator ${connectionStatus}`}>
              <div className="status-dot"></div>
              <span>
                {connectionStatus === 'connected' && '🟢 Live Monitoring'}
                {connectionStatus === 'disconnected' && '🟡 Reconnecting...'}
                {connectionStatus === 'error' && '🔴 Connection Error'}
              </span>
            </div>
            
            <div className="quick-stats">
              <span className="stat">
                <i className="fas fa-bell"></i>
                {stats.totalAlerts}
              </span>
              <span className="stat critical">
                <i className="fas fa-exclamation-triangle"></i>
                {stats.criticalAlerts}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="monitor-tabs">
            <button 
              className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <i className="fas fa-bell"></i>
              Notifications ({notifications.length})
            </button>
            <button 
              className={`tab ${activeTab === 'device' ? 'active' : ''}`}
              onClick={() => setActiveTab('device')}
            >
              <i className="fas fa-fingerprint"></i>
              Device Info
            </button>
          </div>

          {/* Content */}
          <div className="monitor-content">
            {activeTab === 'notifications' && (
              <div className="notifications-tab">
                {notifications.length === 0 ? (
                  <div className="no-notifications">
                    <i className="fas fa-shield-check"></i>
                    <h3>No Security Alerts</h3>
                    <p>Your system is secure and monitoring is active.</p>
                    <button className="test-btn" onClick={testDeviceFingerprint}>
                      <i className="fas fa-fingerprint"></i>
                      Test Device Fingerprint
                    </button>
                  </div>
                ) : (
                  <div className="notifications-list">
                    {notifications.map((notification, index) => (
                      <div 
                        key={notification.id || index} 
                        className={`notification-item severity-${notification.severity?.toLowerCase()}`}
                      >
                        <div className="notification-icon">
                          {getAlertIcon(notification.type)}
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">{notification.title}</div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-meta">
                            <span className="time">{formatTimeAgo(notification.timestamp)}</span>
                            <span 
                              className="severity" 
                              style={{color: getSeverityColor(notification.severity)}}
                            >
                              {notification.severity}
                            </span>
                          </div>
                          {notification.data && (
                            <div className="notification-data">
                              {notification.data.username && (
                                <span>User: <strong>{notification.data.username}</strong></span>
                              )}
                              {notification.data.ip && (
                                <span>IP: <strong>{notification.data.ip}</strong></span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'device' && (
              <div className="device-tab">
                {deviceInfo ? (
                  <div className="device-info">
                    <div className="device-summary">
                      <div className="device-hash">
                        <h3>Device Fingerprint</h3>
                        <code>{deviceInfo.fingerprint.hash}</code>
                        <button 
                          className="copy-btn"
                          onClick={() => navigator.clipboard.writeText(deviceInfo.fingerprint.hash)}
                        >
                          <i className="fas fa-copy"></i>
                        </button>
                      </div>
                      
                      <div className="device-metrics">
                        <div className="metric">
                          <span className="label">Features Detected:</span>
                          <span className="value">{deviceInfo.features}</span>
                        </div>
                        <div className="metric">
                          <span className="label">Risk Score:</span>
                          <span className={`value risk-${deviceInfo.riskScore > 50 ? 'high' : deviceInfo.riskScore > 25 ? 'medium' : 'low'}`}>
                            {deviceInfo.riskScore}/100
                          </span>
                        </div>
                        <div className="metric">
                          <span className="label">Bot Detection:</span>
                          <span className={`value ${deviceInfo.isBot ? 'bot-detected' : 'human'}`}>
                            {deviceInfo.isBot ? '🤖 Bot Detected' : '👤 Human'}
                          </span>
                        </div>
                        <div className="metric">
                          <span className="label">Uniqueness:</span>
                          <span className="value">{deviceInfo.uniqueness}</span>
                        </div>
                      </div>
                    </div>

                    <div className="device-details">
                      <h4>Fingerprint Components</h4>
                      <div className="components">
                        <div className="component">
                          <span className="name">Screen Resolution:</span>
                          <span className="value">
                            {deviceInfo.fingerprint.screen.width}x{deviceInfo.fingerprint.screen.height}
                          </span>
                        </div>
                        <div className="component">
                          <span className="name">Timezone:</span>
                          <span className="value">{deviceInfo.fingerprint.timezone}</span>
                        </div>
                        <div className="component">
                          <span className="name">Languages:</span>
                          <span className="value">{deviceInfo.fingerprint.languages}</span>
                        </div>
                        <div className="component">
                          <span className="name">Canvas Support:</span>
                          <span className={`value ${deviceInfo.fingerprint.canvas === 'error' ? 'error' : 'ok'}`}>
                            {deviceInfo.fingerprint.canvas === 'error' ? '❌ Error' : '✅ Available'}
                          </span>
                        </div>
                        <div className="component">
                          <span className="name">WebGL Support:</span>
                          <span className={`value ${deviceInfo.fingerprint.webgl === 'not_supported' ? 'error' : 'ok'}`}>
                            {deviceInfo.fingerprint.webgl === 'not_supported' ? '❌ Not Supported' : '✅ Available'}
                          </span>
                        </div>
                        <div className="component">
                          <span className="name">Audio Context:</span>
                          <span className={`value ${deviceInfo.fingerprint.audio === 'error' ? 'error' : 'ok'}`}>
                            {deviceInfo.fingerprint.audio === 'error' ? '❌ Error' : '✅ Available'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="device-actions">
                      <button className="refresh-device-btn" onClick={initializeDeviceFingerprint}>
                        <i className="fas fa-sync"></i>
                        Refresh Device Info
                      </button>
                      <button className="test-device-btn" onClick={testDeviceFingerprint}>
                        <i className="fas fa-flask"></i>
                        Run Full Test
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="loading-device">
                    <i className="fas fa-fingerprint fa-spin"></i>
                    <p>Generating device fingerprint...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SecurityMonitor;