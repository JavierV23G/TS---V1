// ===================================
// 🚨 SECURITY LIVE MONITOR PAGE
// Full-page monitoring dashboard
// ===================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../login/AuthContext';
import { toast } from 'react-toastify';
import DeviceFingerprint from '../../../utils/DeviceFingerprint';
import SecurityTestPanel from './SecurityTestPanel';
import './SecurityLiveMonitor.scss';

const SecurityLiveMonitor = () => {
  const { currentUser } = useAuth();
  const [deviceFingerprint, setDeviceFingerprint] = useState(null);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    totalFingerprints: 0,
    uniqueDevices: 0,
    botDetections: 0,
    riskScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeMonitoring();
  }, []);

  const initializeMonitoring = async () => {
    try {
      setIsLoading(true);
      
      console.log('🚨 [LIVE MONITOR] Initializing comprehensive monitoring...');
      
      // Generate device fingerprint
      const fingerprint = await DeviceFingerprint.generate();
      
      // Analyze device
      const isBot = DeviceFingerprint.isLikelyBot(fingerprint);
      const riskScore = calculateAdvancedRiskScore(fingerprint);
      
      const deviceData = {
        fingerprint,
        isBot,
        riskScore,
        timestamp: new Date().toISOString(),
        features: Object.keys(fingerprint).length,
        uniqueComponents: analyzeUniqueComponents(fingerprint)
      };
      
      setDeviceFingerprint(deviceData);
      
      // Update metrics
      setSystemMetrics(prev => ({
        ...prev,
        totalFingerprints: prev.totalFingerprints + 1,
        uniqueDevices: prev.uniqueDevices + (fingerprint.hash ? 1 : 0),
        botDetections: prev.botDetections + (isBot ? 1 : 0),
        riskScore: riskScore
      }));
      
      // Simulate some security alerts for demonstration
      generateDemoAlerts();
      
      console.log('✅ [LIVE MONITOR] Monitoring initialized successfully');
      toast.success('🔍 Live monitoring activated', { autoClose: 3000 });
      
    } catch (error) {
      console.error('❌ [LIVE MONITOR] Initialization failed:', error);
      toast.error('Failed to initialize monitoring');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAdvancedRiskScore = (fingerprint) => {
    let score = 0;
    let factors = [];
    
    // Canvas fingerprinting
    if (fingerprint.canvas === 'error') {
      score += 30;
      factors.push('Canvas blocked');
    }
    
    // WebGL support
    if (fingerprint.webgl === 'not_supported') {
      score += 25;
      factors.push('WebGL unavailable');
    }
    
    // Audio context
    if (fingerprint.audio === 'error') {
      score += 20;
      factors.push('Audio context blocked');
    }
    
    // Screen resolution analysis
    const screenRatio = fingerprint.screen.width / fingerprint.screen.height;
    if (screenRatio < 1.2 || screenRatio > 2.0) {
      score += 15;
      factors.push('Unusual screen ratio');
    }
    
    // Language detection
    if (!fingerprint.languages || fingerprint.languages === '') {
      score += 15;
      factors.push('No languages detected');
    }
    
    // Plugin analysis
    if (!fingerprint.plugins || fingerprint.plugins.length === 0) {
      score += 10;
      factors.push('No plugins detected');
    }
    
    // User agent analysis
    if (fingerprint.userAgent.includes('HeadlessChrome') || 
        fingerprint.userAgent.includes('PhantomJS') ||
        fingerprint.userAgent.includes('Selenium')) {
      score += 50;
      factors.push('Automation detected');
    }
    
    return {
      score: Math.min(score, 100),
      factors
    };
  };

  const analyzeUniqueComponents = (fingerprint) => {
    const components = {
      canvas: fingerprint.canvas !== 'error',
      webgl: fingerprint.webgl !== 'not_supported',
      audio: fingerprint.audio !== 'error',
      fonts: fingerprint.fonts && fingerprint.fonts.length > 0,
      plugins: fingerprint.plugins && fingerprint.plugins.length > 0,
      timezone: !!fingerprint.timezone,
      languages: !!fingerprint.languages,
      screen: fingerprint.screen.width > 0 && fingerprint.screen.height > 0
    };
    
    return components;
  };

  const generateDemoAlerts = () => {
    const demoAlerts = [
      {
        id: 1,
        type: 'DEVICE_ANALYSIS',
        title: '🔍 Device Fingerprint Generated',
        message: 'New device fingerprint analyzed successfully',
        severity: 'INFO',
        timestamp: new Date().toISOString(),
        data: { source: 'DeviceFingerprint.js' }
      },
      {
        id: 2,
        type: 'RISK_ASSESSMENT',
        title: '⚡ Risk Analysis Complete',
        message: 'Device risk assessment completed with security scoring',
        severity: 'LOW',
        timestamp: new Date(Date.now() - 30000).toISOString(),
        data: { riskLevel: 'Low' }
      }
    ];
    
    setSecurityAlerts(demoAlerts);
  };

  const testAdvancedFingerprinting = async () => {
    try {
      console.log('🧪 [ADVANCED TEST] Starting comprehensive device analysis...');
      toast.info('🔬 Running advanced fingerprint analysis...', { autoClose: 2000 });
      
      // Generate multiple fingerprints for comparison
      const fingerprints = await Promise.all([
        DeviceFingerprint.generate(),
        DeviceFingerprint.generate(),
        DeviceFingerprint.generate()
      ]);
      
      // Compare fingerprints
      const similarities = [];
      for (let i = 0; i < fingerprints.length - 1; i++) {
        const similarity = DeviceFingerprint.compareFingerprints(fingerprints[i], fingerprints[i + 1]);
        similarities.push(similarity);
      }
      
      const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
      
      console.log('🎯 [ADVANCED TEST] Results:', {
        fingerprints: fingerprints.length,
        averageSimilarity: avgSimilarity + '%',
        consistency: avgSimilarity > 95 ? 'Excellent' : avgSimilarity > 85 ? 'Good' : 'Poor'
      });
      
      // Add test alert
      const testAlert = {
        id: Date.now(),
        type: 'FINGERPRINT_TEST',
        title: '🧪 Advanced Test Complete',
        message: `Fingerprint consistency test: ${avgSimilarity.toFixed(1)}% similarity across ${fingerprints.length} samples`,
        severity: avgSimilarity > 95 ? 'LOW' : avgSimilarity > 85 ? 'MEDIUM' : 'HIGH',
        timestamp: new Date().toISOString(),
        data: { 
          similarity: avgSimilarity,
          samples: fingerprints.length,
          hash: fingerprints[0].hash
        }
      };
      
      setSecurityAlerts(prev => [testAlert, ...prev]);
      
      toast.success(`✅ Test complete! Consistency: ${avgSimilarity.toFixed(1)}%`, {
        autoClose: 5000
      });
      
    } catch (error) {
      console.error('❌ [ADVANCED TEST] Test failed:', error);
      toast.error('Advanced fingerprint test failed');
    }
  };

  const refreshMonitoring = () => {
    initializeMonitoring();
  };

  const getRiskColor = (score) => {
    if (score.score <= 25) return '#10b981';
    if (score.score <= 50) return '#f59e0b';
    if (score.score <= 75) return '#ea580c';
    return '#dc2626';
  };

  const getRiskLevel = (score) => {
    if (score.score <= 25) return 'LOW';
    if (score.score <= 50) return 'MEDIUM';
    if (score.score <= 75) return 'HIGH';
    return 'CRITICAL';
  };

  if (isLoading) {
    return (
      <div className="live-monitor-loading">
        <div className="loading-spinner">
          <i className="fas fa-fingerprint fa-spin"></i>
        </div>
        <h3>Initializing Live Security Monitor</h3>
        <p>Analyzing device fingerprint and security metrics...</p>
      </div>
    );
  }

  return (
    <div className="security-live-monitor">
      {/* Header */}
      <div className="monitor-header">
        <div className="header-content">
          <div className="title-section">
            <h2>
              <i className="fas fa-fingerprint"></i>
              Live Security Monitor
            </h2>
            <span className="status-badge active">
              <i className="fas fa-circle"></i>
              ACTIVE
            </span>
          </div>
          
          <div className="header-actions">
            <button className="action-btn test" onClick={testAdvancedFingerprinting}>
              <i className="fas fa-flask"></i>
              Advanced Test
            </button>
            <button className="action-btn refresh" onClick={refreshMonitoring}>
              <i className="fas fa-sync"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-fingerprint"></i>
          </div>
          <div className="metric-data">
            <div className="value">{systemMetrics.totalFingerprints}</div>
            <div className="label">Total Fingerprints</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-devices"></i>
          </div>
          <div className="metric-data">
            <div className="value">{systemMetrics.uniqueDevices}</div>
            <div className="label">Unique Devices</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-robot"></i>
          </div>
          <div className="metric-data">
            <div className="value">{systemMetrics.botDetections}</div>
            <div className="label">Bot Detections</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-shield-alt"></i>
          </div>
          <div className="metric-data">
            <div className="value" style={{color: getRiskColor(systemMetrics.riskScore)}}>
              {typeof systemMetrics.riskScore === 'object' ? systemMetrics.riskScore.score : systemMetrics.riskScore}
            </div>
            <div className="label">Risk Score</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="monitor-content">
        {/* Testing Panel */}
        <div className="content-section full-width">
          <SecurityTestPanel />
        </div>
        
        {/* Device and Alerts Grid */}
        <div className="device-alerts-grid">
          {/* Device Information */}
          <div className="content-section device-section">
            <div className="section-header">
              <h3>
                <i className="fas fa-fingerprint"></i>
                Current Device Analysis
              </h3>
              {deviceFingerprint && (
                <span className={`risk-badge ${getRiskLevel(deviceFingerprint.riskScore).toLowerCase()}`}>
                  {getRiskLevel(deviceFingerprint.riskScore)} RISK
                </span>
              )}
            </div>
          
          {deviceFingerprint && (
            <div className="device-analysis">
              <div className="fingerprint-hash">
                <label>Device Fingerprint Hash:</label>
                <code>{deviceFingerprint.fingerprint.hash}</code>
                <button 
                  className="copy-hash"
                  onClick={() => navigator.clipboard.writeText(deviceFingerprint.fingerprint.hash)}
                >
                  <i className="fas fa-copy"></i>
                </button>
              </div>
              
              <div className="analysis-grid">
                <div className="analysis-item">
                  <div className="item-header">
                    <i className="fas fa-chart-pie"></i>
                    <span>Features Detected</span>
                  </div>
                  <div className="item-value">{deviceFingerprint.features}</div>
                </div>
                
                <div className="analysis-item">
                  <div className="item-header">
                    <i className="fas fa-robot"></i>
                    <span>Bot Detection</span>
                  </div>
                  <div className={`item-value ${deviceFingerprint.isBot ? 'bot' : 'human'}`}>
                    {deviceFingerprint.isBot ? '🤖 Bot' : '👤 Human'}
                  </div>
                </div>
                
                <div className="analysis-item">
                  <div className="item-header">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Risk Factors</span>
                  </div>
                  <div className="item-value">{deviceFingerprint.riskScore.factors.length}</div>
                </div>
                
                <div className="analysis-item">
                  <div className="item-header">
                    <i className="fas fa-clock"></i>
                    <span>Analysis Time</span>
                  </div>
                  <div className="item-value">
                    {new Date(deviceFingerprint.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              {deviceFingerprint.riskScore.factors.length > 0 && (
                <div className="risk-factors">
                  <h4>Identified Risk Factors:</h4>
                  <ul>
                    {deviceFingerprint.riskScore.factors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          </div>

          {/* Security Alerts */}
          <div className="content-section alerts-section">
          <div className="section-header">
            <h3>
              <i className="fas fa-bell"></i>
              Recent Security Alerts
            </h3>
            <span className="alert-count">{securityAlerts.length} alerts</span>
          </div>
          
          <div className="alerts-list">
            {securityAlerts.length === 0 ? (
              <div className="no-alerts">
                <i className="fas fa-shield-check"></i>
                <p>No security alerts detected</p>
                <small>System monitoring is active</small>
              </div>
            ) : (
              securityAlerts.map((alert) => (
                <div key={alert.id} className={`alert-item severity-${alert.severity.toLowerCase()}`}>
                  <div className="alert-icon">
                    {alert.title.includes('🔍') ? '🔍' : 
                     alert.title.includes('⚡') ? '⚡' : 
                     alert.title.includes('🧪') ? '🧪' : '🔔'}
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-time">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="alert-severity">
                    {alert.severity}
                  </div>
                </div>
              ))
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityLiveMonitor;