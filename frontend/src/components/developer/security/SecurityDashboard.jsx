import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/developer/Security/SecurityDashboard.scss';
import Header from '../../header/Header';
import { useAuth } from '../../login/AuthContext';
// import SecurityMetrics from './SecurityMetrics';
// import ThreatIntelligence from './ThreatIntelligence';
// import SecurityLogs from './SecurityLogs';
// import ComplianceStatus from './ComplianceStatus';

const SecurityDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [activeBlocks, setActiveBlocks] = useState([]);
  const [revoking, setRevoking] = useState({});
  
  const intervalRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Fetch security stats
      const statsResponse = await fetch('http://localhost:8000/auth/security-stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch security data');
      }

      const statsData = await statsResponse.json();
      setSecurityData(statsData);

      // Fetch active blocks
      const blocksResponse = await fetch('http://localhost:8000/auth/active-blocks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (blocksResponse.ok) {
        const blocksData = await blocksResponse.json();
        setActiveBlocks(blocksData['📊 ACTIVE_BLOCKS'] || []);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching security data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const revokeBlock = async (username) => {
    try {
      setRevoking(prev => ({ ...prev, [username]: true }));

      const response = await fetch('http://localhost:8000/auth/revoke-block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          username: username,
          revoked_by: currentUser?.username || 'developer'
        })
      });

      const data = await response.json();

      if (response.ok && data['⚡ RESULT']?.success) {
        // Refresh data immediately after successful revocation
        await fetchSecurityData();
        
        // Show success message (you could add a toast notification here)
        console.log(`✅ Block revoked successfully for ${username}`);
      } else {
        console.error('Failed to revoke block:', data);
        setError(data['⚡ RESULT']?.message || 'Failed to revoke block');
      }
    } catch (err) {
      console.error('Error revoking block:', err);
      setError('Failed to revoke block');
    } finally {
      setRevoking(prev => ({ ...prev, [username]: false }));
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchSecurityData();
      }, refreshInterval * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    document.body.classList.add('logging-out');
  };

  const handleLogoutAnimationComplete = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { 
      id: 'overview', 
      name: 'Security Overview', 
      icon: 'fa-shield-alt',
      color: '#4facfe',
      description: 'General security system status'
    }
  ];

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading security data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Security Data</h3>
          <p>{error}</p>
          <button onClick={fetchSecurityData} className="retry-button">
            <i className="fas fa-sync-alt"></i>
            Retry
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-content">
            <div className="security-status-card">
              <div className="status-header">
                <h2>
                  <i className="fas fa-shield-alt"></i>
                  Enterprise Security System
                </h2>
                <div className="status-badge active">
                  <i className="fas fa-check-circle"></i>
                  ACTIVE
                </div>
              </div>
              
              <div className="system-info">
                <div className="info-row">
                  <span className="label">Version:</span>
                  <span className="value">{securityData?.['🛡️ TERAPY_SUITE_ENTERPRISE_SECURITY'] || 'v2.1.0-TITANIUM'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Certification:</span>
                  <span className="value">{securityData?.['🏆 CERTIFICATION'] || 'NSA LEVEL 4'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Protection:</span>
                  <span className="value">{securityData?.['🔐 PROTECTION_LEVEL'] || 'TITANIUM FORTRESS'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Compliance:</span>
                  <span className="value">{securityData?.['📋 COMPLIANCE'] || 'HIPAA/SOX/PCI-DSS/ISO-27001'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className="value status-active">{securityData?.['⚡ SYSTEM_STATUS'] || 'ENTERPRISE ACTIVE'}</span>
                </div>
              </div>
            </div>
            
            <div className="quick-stats">
              <div className="stat-card blocked-accounts">
                <div className="stat-icon">
                  <i className="fas fa-ban"></i>
                </div>
                <div className="stat-content">
                  <h3>{securityData?.['📊 ENTERPRISE_METRICS']?.account_lockout_metrics?.active_temporary_blocks || 0}</h3>
                  <p>Blocked Accounts</p>
                </div>
              </div>
              
              <div className="stat-card permanent-blocks">
                <div className="stat-icon">
                  <i className="fas fa-lock"></i>
                </div>
                <div className="stat-content">
                  <h3>{securityData?.['📊 ENTERPRISE_METRICS']?.account_lockout_metrics?.permanent_blocks || 0}</h3>
                  <p>Permanent Blocks</p>
                </div>
              </div>
              
              <div className="stat-card monitored-users">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-content">
                  <h3>{securityData?.['📊 ENTERPRISE_METRICS']?.account_lockout_metrics?.monitored_user_accounts || 0}</h3>
                  <p>Monitored Users</p>
                </div>
              </div>
              
              <div className="stat-card threats-detected">
                <div className="stat-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="stat-content">
                  <h3>{securityData?.['📊 ENTERPRISE_METRICS']?.threat_intelligence?.suspicious_activities_detected || 0}</h3>
                  <p>Threats Detected</p>
                </div>
              </div>
            </div>

            {/* Active Blocks in Progress - DEVELOPER CONTROL */}
            {activeBlocks && activeBlocks.length > 0 && (
              <div className="active-blocks-section">
                <h3>
                  <i className="fas fa-clock"></i>
                  Active Blocks in Progress
                  <span className="developer-badge">DEVELOPER CONTROL</span>
                </h3>
                <div className="active-blocks-list">
                  {activeBlocks.map((block, index) => (
                    <div key={index} className={`active-block-item ${block.type}`}>
                      <div className="block-info">
                        <div className="user-details">
                          <i className={`fas ${block.type === 'permanent' ? 'fa-ban' : 'fa-user-clock'}`}></i>
                          <div className="user-data">
                            <span className="username">{block.username}</span>
                            <span className="block-type">
                              {block.type === 'permanent' 
                                ? 'Permanent Block' 
                                : `Level ${block.block_level} - ${block.remaining_minutes}min remaining`
                              }
                            </span>
                          </div>
                        </div>
                        
                        <div className="block-status-info">
                          <span className={`status-indicator ${block.type}`}>
                            {block.status}
                          </span>
                          {block.type === 'temporary' && (
                            <div className="countdown">
                              <i className="fas fa-hourglass-half"></i>
                              {block.remaining_minutes}m left
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="block-actions">
                        <button
                          className={`revoke-button ${revoking[block.username] ? 'revoking' : ''}`}
                          onClick={() => revokeBlock(block.username)}
                          disabled={revoking[block.username]}
                          title={`Revoke block for ${block.username}`}
                        >
                          {revoking[block.username] ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              Revoking...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-unlock"></i>
                              Revoke Block
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="developer-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>
                    <strong>Developer Control:</strong> Use revoke carefully. All revocations are logged for security audit.
                  </span>
                </div>
              </div>
            )}

            {/* Real Blocked Users List */}
            {securityData?.['📊 ENTERPRISE_METRICS']?.account_lockout_metrics?.blocked_usernames?.length > 0 && (
              <div className="blocked-users-section">
                <h3>
                  <i className="fas fa-ban"></i>
                  Currently Blocked Users
                </h3>
                <div className="blocked-users-list">
                  {securityData['📊 ENTERPRISE_METRICS'].account_lockout_metrics.blocked_usernames.map((username, index) => (
                    <div key={index} className="blocked-user-item">
                      <div className="user-info">
                        <i className="fas fa-user-slash"></i>
                        <span className="username">{username}</span>
                      </div>
                      <div className="block-status">
                        <span className="status-badge blocked">BLOCKED</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real Permanent Blocks List */}
            {securityData?.['📊 ENTERPRISE_METRICS']?.account_lockout_metrics?.permanently_blocked_usernames?.length > 0 && (
              <div className="permanent-blocks-section">
                <h3>
                  <i className="fas fa-lock"></i>
                  Permanently Blocked Users
                </h3>
                <div className="permanent-blocks-list">
                  {securityData['📊 ENTERPRISE_METRICS'].account_lockout_metrics.permanently_blocked_usernames.map((username, index) => (
                    <div key={index} className="permanent-block-item">
                      <div className="user-info">
                        <i className="fas fa-ban"></i>
                        <span className="username">{username}</span>
                      </div>
                      <div className="block-status">
                        <span className="status-badge permanent">PERMANENT</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real Escalation Levels */}
            {securityData?.['📊 ENTERPRISE_METRICS']?.account_lockout_metrics?.escalation_levels && 
             Object.keys(securityData['📊 ENTERPRISE_METRICS'].account_lockout_metrics.escalation_levels).length > 0 && (
              <div className="escalation-levels-section">
                <h3>
                  <i className="fas fa-chart-bar"></i>
                  User Escalation Levels
                </h3>
                <div className="escalation-list">
                  {Object.entries(securityData['📊 ENTERPRISE_METRICS'].account_lockout_metrics.escalation_levels).map(([username, level]) => (
                    <div key={username} className="escalation-item">
                      <div className="user-info">
                        <i className="fas fa-user"></i>
                        <span className="username">{username}</span>
                      </div>
                      <div className="escalation-info">
                        <span className={`level-badge level-${level}`}>
                          Level {level}
                        </span>
                        <span className="level-description">
                          {level === 7 ? 'Permanent' : `${[1, 2, 10, 30, 60, 300][level-1]} min`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`security-dashboard ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
      <Header onLogout={handleLogout} />
      
      <div className="security-content">
        <div className="security-header">
          <div className="header-content">
            <div className="title-section">
              <h1>
                <i className="fas fa-shield-alt"></i>
                Security Dashboard Enterprise
              </h1>
              <p className="subtitle">
                NSA Level 4 - Titanium Fortress Security Monitoring & Management
              </p>
            </div>
            
            <div className="header-controls">
              <div className="refresh-controls">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  <span className="slider"></span>
                  <span className="toggle-label">Auto-refresh</span>
                </label>
                
                {autoRefresh && (
                  <select 
                    value={refreshInterval} 
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="refresh-interval"
                  >
                    <option value={10}>10s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1m</option>
                    <option value={300}>5m</option>
                  </select>
                )}
              </div>
              
              <button onClick={fetchSecurityData} className="manual-refresh" disabled={loading}>
                <i className={`fas fa-sync-alt ${loading ? 'spinning' : ''}`}></i>
                Refresh
              </button>
            </div>
          </div>
          
          <div className="security-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`security-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  '--tab-color': tab.color
                }}
              >
                <div className="tab-icon">
                  <i className={`fas ${tab.icon}`}></i>
                </div>
                <div className="tab-content">
                  <span className="tab-title">{tab.name}</span>
                  {!isMobile && (
                    <span className="tab-description">{tab.description}</span>
                  )}
                </div>
                {activeTab === tab.id && (
                  <div className="tab-indicator"></div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="security-body">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;