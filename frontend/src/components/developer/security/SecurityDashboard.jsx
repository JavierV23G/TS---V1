import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../header/Header';
import { useAuth } from '../../login/AuthContext';
import failedAttemptsService from '../../login/FailedAttemptsService';
import SecurityNotifications from './SecurityNotifications';
import SecurityMonitor from './SecurityMonitor';
import SecurityLiveMonitor from './SecurityLiveMonitor';
import '../../../styles/developer/Security/SecurityDashboard.scss';
import '../../../styles/developer/Security/ClinicalStyles.scss';
// 🧪 IMPORT TEST UTILITIES FOR DEVELOPMENT
import '../../../utils/TestDeviceFingerprint';

const SecurityDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubSection, setActiveSubSection] = useState(null);
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [activeBlocks, setActiveBlocks] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [revoking, setRevoking] = useState({});
  const [blocking, setBlocking] = useState({});
  const [blockDetails, setBlockDetails] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [terminating, setTerminating] = useState({});
  const [userDevices, setUserDevices] = useState(null);
  const [devicesSummary, setDevicesSummary] = useState(null);

  // Remove inline styles - using SCSS instead

  useEffect(() => {
    fetchData();
    // Actualizar cada 5 segundos para mejor tiempo real
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);
      await Promise.all([fetchSecurityData(), fetchUsers(), fetchActiveSessions(), fetchUserDevices()]);
      setError(null);
    } catch (err) {
      console.error('[FRONTEND] Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityData = async () => {
    const response = await fetch('http://localhost:8000/auth/security-stats');
    if (!response.ok) throw new Error('Failed to fetch security data');
    const data = await response.json();
    setSecurityData(data);

    const blocksResponse = await fetch('http://localhost:8000/auth/active-blocks');
    if (blocksResponse.ok) {
      const blocksData = await blocksResponse.json();
      const blocks = blocksData['📊 ACTIVE_BLOCKS'] || [];
      setActiveBlocks(blocks);
      
      // Procesar detalles de bloqueos con información más completa
      const details = {};
      blocks.forEach(block => {
        details[block.username] = {
          level: block.block_level || 7,
          type: block.block_level === 7 ? 'Permanent' : getBlockTypeText(block.block_level),
          reason: block.reason || 'Security block',
          blocked_by: block.blocked_by || 'System',
          blocked_at: block.blocked_at || new Date().toISOString(),
          expires_at: block.expires_at || null
        };
      });
      setBlockDetails(details);
    }
  };

  const getBlockTypeText = (level) => {
    const types = {
      1: '1 Minute',
      2: '2 Minutes', 
      3: '10 Minutes',
      4: '30 Minutes',
      5: '1 Hour',
      6: '2 Hours',
      7: 'Permanent'
    };
    return types[level] || `Level ${level}`;
  };

  const fetchUsers = async () => {
    const response = await fetch('http://localhost:8000/auth/all-users');
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    const users = data.users || data['👥 USERS'] || [];
    setAllUsers(users);
    setFilteredUsers(users);
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/active-sessions');
      if (response.ok) {
        const data = await response.json();
        const sessions = data['🔐 ACTIVE_SESSIONS'] || [];
        setActiveSessions(sessions);
      }
    } catch (err) {
      console.error('[FRONTEND] Error fetching active sessions:', err);
    }
  };

  const fetchUserDevices = async () => {
    try {
      console.log('[DEVICES] Fetching user devices...');
      const response = await fetch('http://localhost:8000/auth/user-devices');
      console.log('[DEVICES] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[DEVICES] Full response data:', data);
        console.log('[DEVICES] USER_DEVICES:', data['👥 USER_DEVICES']);
        console.log('[DEVICES] SUMMARY:', data['📊 SUMMARY']);
        
        setUserDevices(data['👥 USER_DEVICES'] || {});
        setDevicesSummary(data['📊 SUMMARY'] || {});
      } else {
        console.error('[DEVICES] Error response:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('[DEVICES] Error details:', errorText);
      }
    } catch (err) {
      console.error('[FRONTEND] Error fetching user devices:', err);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredUsers(getActiveUsers());
    } else {
      const filtered = getActiveUsers().filter(user =>
        user.name?.toLowerCase().includes(term.toLowerCase()) ||
        user.username?.toLowerCase().includes(term.toLowerCase()) ||
        user.email?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  // Separar usuarios activos de los bloqueados
  const getActiveUsers = () => {
    const blockedUsernames = activeBlocks.map(block => block.username);
    return allUsers.filter(user => !blockedUsernames.includes(user.username));
  };

  const getBlockedUsers = () => {
    const blockedUsernames = activeBlocks.map(block => block.username);
    return allUsers.filter(user => blockedUsernames.includes(user.username));
  };

  // Organizar sesiones por roles
  const getSessionsByRole = () => {
    const sessionsByRole = {};
    activeSessions.forEach(session => {
      const user = allUsers.find(u => u.username === session.username);
      const role = user ? user.role.split(' - ')[0] : 'Unknown';
      
      if (!sessionsByRole[role]) {
        sessionsByRole[role] = [];
      }
      sessionsByRole[role].push({...session, userRole: user?.role || 'Unknown'});
    });
    return sessionsByRole;
  };

  const getRoleIcon = (role) => {
    switch(role.toLowerCase()) {
      case 'developer': return 'fas fa-code';
      case 'admin': return 'fas fa-user-shield';
      case 'support': return 'fas fa-headset';
      case 'manager': return 'fas fa-user-tie';
      case 'staff': return 'fas fa-user-md';
      default: return 'fas fa-user';
    }
  };

  const getRoleColor = (role) => {
    switch(role.toLowerCase()) {
      case 'developer': return 'var(--info-blue)';
      case 'admin': return 'var(--danger-red)';
      case 'support': return 'var(--success-green)';
      case 'manager': return 'var(--warning-orange)';
      case 'staff': return 'var(--primary-blue)';
      default: return 'var(--gray-500)';
    }
  };

  const blockUser = async () => {
    if (!selectedUser) return;
    
    try {
      setBlocking(prev => ({ ...prev, [selectedUser.username]: true }));
      
      const response = await fetch('http://localhost:8000/auth/manual-block-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: selectedUser.username,
          block_level: 7,
          blocked_by: currentUser?.username || 'developer',
          reason: `Permanent security block applied by ${currentUser?.username || 'developer'}`
        })
      });

      const data = await response.json();
      
      if (response.ok && data['⚡ RESULT']?.success) {
        setShowBlockModal(false);
        await fetchData();
      } else {
        setError(data['⚡ RESULT']?.message || 'Failed to block user');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBlocking(prev => ({ ...prev, [selectedUser.username]: false }));
    }
  };

  const revokeBlock = async (username) => {
    try {
      console.log(`[FRONTEND] 🚀 Iniciando revocación para ${username}`);
      setRevoking(prev => ({ ...prev, [username]: true }));
      setRefreshing(true);
      
      const response = await fetch('http://localhost:8000/auth/revoke-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          revoked_by: currentUser?.username || 'developer'
        })
      });

      const data = await response.json();
      console.log(`[FRONTEND] Backend response:`, data);
      
      if (response.ok && data['⚡ RESULT']?.success) {
        console.log(`[FRONTEND] ✅ Backend confirmó revocación para ${username}`);
        
        // CRÍTICO: Limpiar localStorage del frontend
        console.log(`[FRONTEND] 🧹 Limpiando localStorage para ${username}`);
        
        // Verificar estado ANTES de limpiar
        const beforeClean = failedAttemptsService.isAccountLocked(username);
        console.log(`[FRONTEND] Estado ANTES de limpiar:`, beforeClean);
        
        // Limpiar localStorage
        const cleanResult = failedAttemptsService.forceUnlockAccount(username);
        console.log(`[FRONTEND] Resultado de limpieza:`, cleanResult);
        
        // Verificar estado DESPUÉS de limpiar
        const afterClean = failedAttemptsService.isAccountLocked(username);
        console.log(`[FRONTEND] Estado DESPUÉS de limpiar:`, afterClean);
        
        console.log(`[FRONTEND] ✅ localStorage limpiado para ${username}`);
        
        // Esperar un poco más para que el backend procese completamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Ahora sí actualizar desde el backend
        await fetchData();
        console.log(`[FRONTEND] ✅ Datos actualizados desde backend para ${username}`);
        
        // Verificación FINAL: Asegurar que el usuario puede hacer login
        const finalCheck = failedAttemptsService.isAccountLocked(username);
        console.log(`[FRONTEND] 🔍 VERIFICACIÓN FINAL - ¿${username} puede hacer login?`, !finalCheck.isLocked);
        
        if (finalCheck.isLocked) {
          console.error(`[FRONTEND] 🚨 PROBLEMA: ${username} AÚN está bloqueado después de la limpieza:`, finalCheck);
          // Intentar una limpieza adicional
          failedAttemptsService.clearAttempts(username);
          console.log(`[FRONTEND] 🔧 Limpieza adicional aplicada para ${username}`);
        }
        
        setError(null);
      } else {
        console.error(`[FRONTEND] ❌ Error del backend:`, data);
        setError(data['⚡ RESULT']?.message || 'Failed to revoke block');
      }
    } catch (err) {
      console.error(`[FRONTEND] ❌ Error en revocación:`, err);
      setError(err.message);
    } finally {
      setRevoking(prev => ({ ...prev, [username]: false }));
      setRefreshing(false);
    }
  };

  const terminateSession = async (username) => {
    try {
      console.log(`[FRONTEND] 🚀 Terminando sesión para ${username}`);
      setTerminating(prev => ({ ...prev, [username]: true }));
      setRefreshing(true);
      
      const response = await fetch('http://localhost:8000/auth/terminate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          reason: "Session terminated by developer from Security Dashboard",
          terminated_by: currentUser?.username || 'developer'
        })
      });

      const data = await response.json();
      console.log(`[FRONTEND] Backend response:`, data);
      
      if (response.ok && data['⚡ RESULT']?.success) {
        console.log(`[FRONTEND] ✅ Sesión terminada para ${username}`);
        
        // Actualizar datos inmediatamente
        await fetchData();
        
        setError(null);
      } else {
        console.error(`[FRONTEND] ❌ Error del backend:`, data);
        setError(data['⚡ RESULT']?.message || 'Failed to terminate session');
      }
    } catch (err) {
      console.error(`[FRONTEND] ❌ Error terminando sesión:`, err);
      setError(err.message);
    } finally {
      setTerminating(prev => ({ ...prev, [username]: false }));
      setRefreshing(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Render functions for each section
  const renderUsersSection = () => (
    <div className="clinical-section">
      <div className="clinical-section__header">
        <h2 className="clinical-section__title">
          <i className="fas fa-users"></i>
          Active Users Management
        </h2>
        <p className="clinical-section__subtitle">
          Manage active users and apply security measures
        </p>
      </div>

      <div className="clinical-search-bar">
        <div className="clinical-search-input">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="clinical-users-grid">
        {getActiveUsers().length === 0 ? (
          <div className="clinical-empty-state">
            <i className="fas fa-users"></i>
            <h3>No Active Users</h3>
            <p>All users are currently blocked or no users exist in the system.</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <div key={user.id} className="clinical-user-card">
              <div className="clinical-user-card__header">
                <div className="clinical-user-card__avatar" style={{backgroundColor: getRoleColor(user.role)}}>
                  {getInitials(user.name)}
                </div>
                <div className="clinical-user-card__info">
                  <h3 className="clinical-user-card__name">{user.name}</h3>
                  <p className="clinical-user-card__username">@{user.username}</p>
                  <div className="clinical-user-card__role">
                    <i className={getRoleIcon(user.role)}></i>
                    {user.role}
                  </div>
                </div>
              </div>
              
              <div className="clinical-user-card__actions">
                <button
                  className="clinical-btn clinical-btn--danger"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowBlockModal(true);
                  }}
                  disabled={blocking[user.username]}
                >
                  {blocking[user.username] ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Blocking...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-ban"></i>
                      Block User
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderBlockedUsers = () => (
    <div className="clinical-section">
      <div className="clinical-section__header">
        <h2 className="clinical-section__title">
          <i className="fas fa-user-slash"></i>
          Blocked Users
        </h2>
        <p className="clinical-section__subtitle">
          Users who have been blocked from accessing the system
        </p>
      </div>

      <div className="clinical-blocked-grid">
        {getBlockedUsers().length === 0 ? (
          <div className="clinical-empty-state">
            <i className="fas fa-check-circle"></i>
            <h3>No Blocked Users</h3>
            <p>All users currently have active access to the system.</p>
          </div>
        ) : (
          getBlockedUsers().map(user => {
            const blockInfo = activeBlocks.find(block => block.username === user.username);
            return (
              <div key={user.id} className="clinical-blocked-card">
                <div className="clinical-blocked-card__header">
                  <div className="clinical-blocked-card__avatar">
                    {getInitials(user.name)}
                  </div>
                  <div className="clinical-blocked-card__info">
                    <h3 className="clinical-blocked-card__name">{user.name}</h3>
                    <p className="clinical-blocked-card__username">@{user.username}</p>
                    <div className="clinical-blocked-card__role">
                      <i className={getRoleIcon(user.role)}></i>
                      {user.role}
                    </div>
                  </div>
                  <div className="clinical-blocked-badge">
                    <i className="fas fa-ban"></i>
                    BLOCKED
                  </div>
                </div>
                
                {blockInfo && (
                  <div className="clinical-blocked-card__details">
                    <div className="clinical-blocked-detail">
                      <span className="clinical-blocked-detail__label">Blocked:</span>
                      <span className="clinical-blocked-detail__value">
                        {new Date(blockInfo.blocked_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="clinical-blocked-detail">
                      <span className="clinical-blocked-detail__label">Reason:</span>
                      <span className="clinical-blocked-detail__value">{blockInfo.reason}</span>
                    </div>
                  </div>
                )}
                
                <div className="clinical-blocked-card__actions">
                  <button
                    className="clinical-btn clinical-btn--success"
                    onClick={() => revokeBlock(user.username)}
                    disabled={revoking[user.username]}
                  >
                    {revoking[user.username] ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Unblocking...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-unlock"></i>
                        Unblock User
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderSessionsByRole = () => {
    const sessionsByRole = getSessionsByRole();
    const roles = Object.keys(sessionsByRole);

    return (
      <div className="clinical-section">
        <div className="clinical-section__header">
          <h2 className="clinical-section__title">
            <i className="fas fa-desktop"></i>
            Active Sessions by Role
          </h2>
          <p className="clinical-section__subtitle">
            Monitor user sessions organized by their roles
          </p>
        </div>

        {roles.length === 0 ? (
          <div className="clinical-empty-state">
            <i className="fas fa-desktop"></i>
            <h3>No Active Sessions</h3>
            <p>No users are currently logged into the system.</p>
          </div>
        ) : (
          <div className="clinical-roles-grid">
            {roles.map(role => (
              <div key={role} className="clinical-role-section">
                <div className="clinical-role-header">
                  <div className="clinical-role-icon" style={{backgroundColor: getRoleColor(role)}}>
                    <i className={getRoleIcon(role)}></i>
                  </div>
                  <div className="clinical-role-info">
                    <h3 className="clinical-role-title">{role}</h3>
                    <p className="clinical-role-count">{sessionsByRole[role].length} active session{sessionsByRole[role].length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                
                <div className="clinical-sessions-list">
                  {sessionsByRole[role].map((session, index) => {
                    const isCurrentUserSession = session.username === currentUser?.username;
                    const isTerminatingThis = terminating[session.username];
                    
                    return (
                      <div key={index} className={`clinical-session-card ${isCurrentUserSession ? 'clinical-session-card--current' : ''}`}>
                        <div className="clinical-session-card__header">
                          <div className="clinical-session-card__avatar">
                            {getInitials(session.username)}
                          </div>
                          <div className="clinical-session-card__info">
                            <h4 className="clinical-session-card__username">{session.username}</h4>
                            <p className="clinical-session-card__status">
                              {isCurrentUserSession ? (
                                <span className="clinical-current-session">
                                  <i className="fas fa-star"></i> Your session • {session.duration_text}
                                </span>
                              ) : (
                                `Online • ${session.duration_text}`
                              )}
                            </p>
                          </div>
                          <div className="clinical-session-indicator">
                            <div className="clinical-online-dot"></div>
                          </div>
                        </div>
                        
                        <div className="clinical-session-card__details">
                          <div className="clinical-session-detail">
                            <span className="clinical-session-detail__label">Started:</span>
                            <span className="clinical-session-detail__value">
                              {new Date(session.started_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="clinical-session-detail">
                            <span className="clinical-session-detail__label">IP Address:</span>
                            <span className="clinical-session-detail__value">{session.ip_address}</span>
                          </div>
                        </div>
                        
                        <div className="clinical-session-card__actions">
                          {isCurrentUserSession ? (
                            <button className="clinical-btn clinical-btn--current" disabled>
                              <i className="fas fa-user-shield"></i>
                              Current Session
                            </button>
                          ) : (
                            <button
                              className="clinical-btn clinical-btn--warning"
                              onClick={() => terminateSession(session.username)}
                              disabled={isTerminatingThis}
                            >
                              {isTerminatingThis ? (
                                <>
                                  <i className="fas fa-spinner fa-spin"></i>
                                  Terminating...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-sign-out-alt"></i>
                                  Force Logout
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderOverview = () => {
    const activeUsers = getActiveUsers();
    const blockedUsers = getBlockedUsers();
    const sessionsByRole = getSessionsByRole();
    const roles = Object.keys(sessionsByRole);

    return (
      <div className="clinical-section">
        <div className="clinical-section__header">
          <h2 className="clinical-section__title">
            <i className="fas fa-chart-line"></i>
            Security Overview
          </h2>
          <p className="clinical-section__subtitle">
            Real-time security metrics and system status
          </p>
        </div>

        <div className="clinical-stats-grid">
          <div className="clinical-stat-card clinical-stat-card--primary">
            <div className="clinical-stat-card__icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="clinical-stat-card__content">
              <div className="clinical-stat-card__value">{activeUsers.length}</div>
              <div className="clinical-stat-card__label">Active Users</div>
            </div>
            <div className="clinical-stat-card__action">
              <button 
                className="clinical-quick-nav"
                onClick={() => setActiveTab('users')}
              >
                View All <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <div className="clinical-stat-card clinical-stat-card--danger">
            <div className="clinical-stat-card__icon">
              <i className="fas fa-user-slash"></i>
            </div>
            <div className="clinical-stat-card__content">
              <div className="clinical-stat-card__value">{blockedUsers.length}</div>
              <div className="clinical-stat-card__label">Blocked Users</div>
            </div>
            <div className="clinical-stat-card__action">
              <button 
                className="clinical-quick-nav"
                onClick={() => setActiveTab('blocked')}
              >
                Manage <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <div className="clinical-stat-card clinical-stat-card--success">
            <div className="clinical-stat-card__icon">
              <i className="fas fa-desktop"></i>
            </div>
            <div className="clinical-stat-card__content">
              <div className="clinical-stat-card__value">{activeSessions.length}</div>
              <div className="clinical-stat-card__label">Active Sessions</div>
            </div>
            <div className="clinical-stat-card__action">
              <button 
                className="clinical-quick-nav"
                onClick={() => setActiveTab('sessions')}
              >
                Monitor <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <div className="clinical-stat-card clinical-stat-card--info">
            <div className="clinical-stat-card__icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="clinical-stat-card__content">
              <div className="clinical-stat-card__value">{securityData?.total_successful_logins || 0}</div>
              <div className="clinical-stat-card__label">Total Logins</div>
            </div>
            <div className="clinical-stat-card__action">
              <span className="clinical-stat-trend">Today</span>
            </div>
          </div>
        </div>

        <div className="clinical-overview-sections">
          <div className="clinical-overview-section">
            <h3 className="clinical-overview-title">
              <i className="fas fa-users-cog"></i>
              Role Distribution
            </h3>
            <div className="clinical-role-overview">
              {roles.length === 0 ? (
                <p className="clinical-no-data">No active sessions to display</p>
              ) : (
                roles.map(role => (
                  <div key={role} className="clinical-role-item">
                    <div className="clinical-role-item__icon" style={{backgroundColor: getRoleColor(role)}}>
                      <i className={getRoleIcon(role)}></i>
                    </div>
                    <div className="clinical-role-item__info">
                      <span className="clinical-role-item__name">{role}</span>
                      <span className="clinical-role-item__count">{sessionsByRole[role].length} active</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="clinical-overview-section">
            <h3 className="clinical-overview-title">
              <i className="fas fa-shield-alt"></i>
              Security Status
            </h3>
            <div className="clinical-security-status">
              <div className="clinical-status-item clinical-status-item--good">
                <i className="fas fa-check-circle"></i>
                <span>Session Management: Active</span>
              </div>
              <div className="clinical-status-item clinical-status-item--good">
                <i className="fas fa-check-circle"></i>
                <span>User Authentication: Secure</span>
              </div>
              <div className={`clinical-status-item ${blockedUsers.length > 0 ? 'clinical-status-item--warning' : 'clinical-status-item--good'}`}>
                <i className={`fas ${blockedUsers.length > 0 ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
                <span>Blocked Users: {blockedUsers.length > 0 ? `${blockedUsers.length} users blocked` : 'No blocks active'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 1000);
  };

  const stats = securityData?.['📊 ENTERPRISE_METRICS'] || {};

  if (loading && !securityData) {
    return (
      <div className="security-dashboard">
        <Header onLogout={handleLogout} />
        <div className="security-dashboard__container">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: '#64748b'}}>
            <div>Loading Security Dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  const renderUserDevices = () => {
    if (!userDevices || !devicesSummary) {
      return (
        <div className="clinical-section">
          <div className="clinical-card">
            <div className="clinical-card__header">
              <h3>📱 User Devices</h3>
            </div>
            <div className="clinical-card__content">
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading device data...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const userCount = devicesSummary.total_users_with_devices || 0;
    const deviceCount = devicesSummary.total_devices_registered || 0;
    const highRiskCount = devicesSummary.high_risk_devices || 0;
    const botCount = devicesSummary.bot_devices || 0;

    return (
      <div className="clinical-section">
        {/* Summary Cards */}
        <div className="clinical-grid clinical-grid--4">
          <div className="clinical-card clinical-card--metric">
            <div className="clinical-metric">
              <div className="clinical-metric__icon clinical-metric__icon--primary">
                <i className="fas fa-users"></i>
              </div>
              <div className="clinical-metric__content">
                <div className="clinical-metric__value">{userCount}</div>
                <div className="clinical-metric__label">Users with Devices</div>
              </div>
            </div>
          </div>

          <div className="clinical-card clinical-card--metric">
            <div className="clinical-metric">
              <div className="clinical-metric__icon clinical-metric__icon--info">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <div className="clinical-metric__content">
                <div className="clinical-metric__value">{deviceCount}</div>
                <div className="clinical-metric__label">Total Devices</div>
              </div>
            </div>
          </div>

          <div className="clinical-card clinical-card--metric">
            <div className="clinical-metric">
              <div className="clinical-metric__icon clinical-metric__icon--warning">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="clinical-metric__content">
                <div className="clinical-metric__value">{highRiskCount}</div>
                <div className="clinical-metric__label">High Risk Devices</div>
              </div>
            </div>
          </div>

          <div className="clinical-card clinical-card--metric">
            <div className="clinical-metric">
              <div className="clinical-metric__icon clinical-metric__icon--danger">
                <i className="fas fa-robot"></i>
              </div>
              <div className="clinical-metric__content">
                <div className="clinical-metric__value">{botCount}</div>
                <div className="clinical-metric__label">Bot Detections</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Devices List */}
        <div className="clinical-card">
          <div className="clinical-card__header">
            <h3>
              <i className="fas fa-mobile-alt"></i>
              Device History by User
            </h3>
          </div>
          <div className="clinical-card__content">
            {Object.keys(userDevices).length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-mobile-alt"></i>
                <p>No device data available</p>
                <small>Devices will appear here when users log in</small>
              </div>
            ) : (
              <div className="user-devices-list">
                {Object.entries(userDevices).map(([username, devices]) => (
                  <div key={username} className="user-device-item">
                    <div className="user-device-header">
                      <div className="user-info">
                        <h4>👤 {username}</h4>
                        <span className="device-count">{devices.length} device(s)</span>
                      </div>
                      <div className="latest-activity">
                        {devices.length > 0 && (
                          <>
                            <span className="activity-time">
                              Last: {new Date(devices[devices.length - 1].timestamp).toLocaleString()}
                            </span>
                            <span className={`risk-badge risk-${devices[devices.length - 1].risk_score > 50 ? 'high' : devices[devices.length - 1].risk_score > 25 ? 'medium' : 'low'}`}>
                              Risk: {devices[devices.length - 1].risk_score}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="devices-grid">
                      {devices.slice(-3).map((device, index) => (
                        <div key={index} className="device-card">
                          <div className="device-card-header">
                            <div className="device-hash">
                              <code>{device.hash.substring(0, 16)}...</code>
                              <button
                                className="copy-btn"
                                onClick={() => navigator.clipboard.writeText(device.hash)}
                                title="Copy full hash"
                              >
                                <i className="fas fa-copy"></i>
                              </button>
                            </div>
                            <div className="device-indicators">
                              {device.is_bot && <span className="bot-indicator">🤖 Bot</span>}
                              {device.risk_score > 50 && <span className="risk-indicator">⚠️ High Risk</span>}
                            </div>
                          </div>
                          
                          <div className="device-details">
                            <div className="detail-row">
                              <span className="label">Features:</span>
                              <span className="value">{device.features_count}</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Screen:</span>
                              <span className="value">
                                {device.browser_info.screen.width}x{device.browser_info.screen.height}
                              </span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Timezone:</span>
                              <span className="value">{device.browser_info.timezone}</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">IP:</span>
                              <span className="value">{device.ip}</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Time:</span>
                              <span className="value">
                                {new Date(device.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="device-security">
                            <div className="security-features">
                              <span className={`feature ${device.security_features.canvas ? 'enabled' : 'disabled'}`}>
                                Canvas {device.security_features.canvas ? '✅' : '❌'}
                              </span>
                              <span className={`feature ${device.security_features.webgl ? 'enabled' : 'disabled'}`}>
                                WebGL {device.security_features.webgl ? '✅' : '❌'}
                              </span>
                              <span className={`feature ${device.security_features.audio ? 'enabled' : 'disabled'}`}>
                                Audio {device.security_features.audio ? '✅' : '❌'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="security-dashboard">
      <Header onLogout={handleLogout} />
      
      <div className="security-dashboard__container">
        {error && (
          <div className="error-alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="dashboard-header">
          <div className="dashboard-header__content">
            <div className="dashboard-header__title-section">
              <h1 className="dashboard-header__title">
                <i className="fas fa-shield-alt icon"></i>
                Security Dashboard
              </h1>
              <span className="dashboard-header__badge">Enterprise</span>
            </div>
            
            <div className="dashboard-header__actions">
              <SecurityMonitor />
              <SecurityNotifications />
              <button
                className={`refresh-button ${refreshing ? 'disabled' : ''}`}
                onClick={() => !refreshing && fetchData()}
                disabled={refreshing}
              >
                <i className={`fas fa-sync icon ${refreshing ? 'spinning' : ''}`}></i>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          <p className="dashboard-header__subtitle">
            Comprehensive security management and user administration
          </p>
        </div>

        <div className="clinical-navigation">
          <div className="clinical-nav-tabs">
            <button
              className={`clinical-nav-tab ${activeTab === 'overview' ? 'clinical-nav-tab--active' : ''}`}
              onClick={() => {setActiveTab('overview'); setActiveSubSection(null);}}
            >
              <i className="fas fa-chart-line"></i>
              <span>Overview</span>
            </button>
            <button
              className={`clinical-nav-tab ${activeTab === 'users' ? 'clinical-nav-tab--active' : ''}`}
              onClick={() => {setActiveTab('users'); setActiveSubSection(null);}}
            >
              <i className="fas fa-users"></i>
              <span>Active Users</span>
            </button>
            <button
              className={`clinical-nav-tab ${activeTab === 'blocked' ? 'clinical-nav-tab--active' : ''}`}
              onClick={() => {setActiveTab('blocked'); setActiveSubSection(null);}}
            >
              <i className="fas fa-user-slash"></i>
              <span>Blocked Users</span>
            </button>
            <button
              className={`clinical-nav-tab ${activeTab === 'sessions' ? 'clinical-nav-tab--active' : ''}`}
              onClick={() => {setActiveTab('sessions'); setActiveSubSection(null);}}
            >
              <i className="fas fa-desktop"></i>
              <span>Active Sessions</span>
            </button>
            <button
              className={`clinical-nav-tab ${activeTab === 'devices' ? 'clinical-nav-tab--active' : ''}`}
              onClick={() => {setActiveTab('devices'); setActiveSubSection(null);}}
            >
              <i className="fas fa-mobile-alt"></i>
              <span>User Devices</span>
            </button>
            <button
              className={`clinical-nav-tab ${activeTab === 'monitoring' ? 'clinical-nav-tab--active' : ''}`}
              onClick={() => {setActiveTab('monitoring'); setActiveSubSection(null);}}
            >
              <i className="fas fa-fingerprint"></i>
              <span>Live Monitor</span>
            </button>
          </div>
        </div>

        <div className="clinical-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsersSection()}
          {activeTab === 'blocked' && renderBlockedUsers()}
          {activeTab === 'sessions' && renderSessionsByRole()}
          {activeTab === 'devices' && renderUserDevices()}
          {activeTab === 'monitoring' && <SecurityLiveMonitor />}
        </div>
      </div>

      {showBlockModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal__title">Block User</h3>
            <p className="modal__message">
              Are you sure you want to permanently block user <strong>{selectedUser?.name}</strong>?
            </p>
            <div className="modal__actions">
              <button
                className="modal__button modal__button--cancel"
                onClick={() => setShowBlockModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal__button modal__button--confirm"
                onClick={blockUser}
                disabled={blocking[selectedUser?.username]}
              >
                {blocking[selectedUser?.username] ? 'Blocking...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;