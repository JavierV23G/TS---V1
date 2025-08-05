import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../login/AuthContext';
import failedAttemptsService from '../../login/FailedAttemptsService';
import SecurityNotifications from './SecurityNotifications';
import SecurityMonitor from './SecurityMonitor';
import SecurityLiveMonitor from './SecurityLiveMonitor';
import logoImg from '../../../assets/LogoMHC.jpeg';
import LogoutAnimation from '../../../components/LogOut/LogOut';
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
  
  // Estados adicionales para el nuevo layout
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuTransitioning, setMenuTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs
  const userMenuRef = useRef(null);
  
  // 🌐 NUEVOS ESTADOS PARA IP MONITORING
  const [ipAnalytics, setIpAnalytics] = useState(null);
  const [blockedIps, setBlockedIps] = useState([]);
  const [revokingIp, setRevokingIp] = useState({});
  const [selectedIpDetails, setSelectedIpDetails] = useState(null);
  const [showIpDetailsModal, setShowIpDetailsModal] = useState(false);

  // Funciones de utilidad
  const getInitials = useCallback((name) => {
    if (!name) return "U";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, []);

  // User data
  const userData = {
    name: currentUser?.fullname || currentUser?.username || 'Usuario',
    avatar: getInitials(currentUser?.fullname || currentUser?.username || 'Usuario'),
    email: currentUser?.email || 'user@example.com',
    role: currentUser?.role || 'Usuario',
    status: 'online'
  };

  // Funciones de navegación
  const handleMainMenuTransition = useCallback(() => {
    if (isLoggingOut) return;
    
    setMenuTransitioning(true);
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    
    setTimeout(() => {
      navigate(`/${baseRole}/homePage`);
    }, 300);
  }, [currentUser, navigate, isLoggingOut]);

  const handleLogoutAnimationComplete = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

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
      await Promise.all([
        fetchSecurityData(), 
        fetchUsers(), 
        fetchActiveSessions(), 
        fetchUserDevices(),
        fetchIpAnalytics() // 🌐 NUEVO: Obtener datos de IP
      ]);
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

  // 🌐 NUEVAS FUNCIONES PARA IP MONITORING
  const fetchIpAnalytics = async () => {
    try {
      console.log('[IP-ANALYTICS] Fetching IP analytics...');
      const response = await fetch('http://localhost:8000/auth/ip-analytics');
      console.log('[IP-ANALYTICS] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[IP-ANALYTICS] Full response:', data);
        
        const analyticsData = data['📊 DATA'] || {};
        setIpAnalytics(analyticsData);
        setBlockedIps(analyticsData.blocked_ips || []);
        
        console.log('[IP-ANALYTICS] Analytics loaded:', {
          summary: analyticsData.summary,
          blocked_ips_count: analyticsData.blocked_ips?.length || 0,
          top_ips_count: analyticsData.top_ips?.length || 0
        });
      } else {
        console.error('[IP-ANALYTICS] Error response:', response.status, response.statusText);
        // No es crítico si falla - es una feature nueva
        setIpAnalytics({ summary: {}, top_ips: [], blocked_ips: [], configuration: {} });
        setBlockedIps([]);
      }
    } catch (err) {
      console.error('[FRONTEND] Error fetching IP analytics:', err);
      // Fallback para que no crashee el dashboard
      setIpAnalytics({ summary: {}, top_ips: [], blocked_ips: [], configuration: {} });
      setBlockedIps([]);
    }
  };

  const fetchIpDetails = async (ip) => {
    try {
      console.log(`[IP-DETAILS] Fetching details for IP: ${ip}`);
      const encodedIp = encodeURIComponent(ip);
      const response = await fetch(`http://localhost:8000/auth/ip-details/${encodedIp}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[IP-DETAILS] Details received:', data);
        
        setSelectedIpDetails(data['📋 DETAILS'] || {});
        setShowIpDetailsModal(true);
      } else {
        console.error('[IP-DETAILS] Error fetching details for IP:', ip);
        setError(`Failed to get details for IP ${ip}`);
      }
    } catch (err) {
      console.error('[FRONTEND] Error fetching IP details:', err);
      setError(`Error getting IP details: ${err.message}`);
    }
  };

  const revokeIpBlock = async (ip, reason = "Manual unblock from dashboard") => {
    try {
      console.log(`[IP-REVOKE] Revoking block for IP: ${ip}`);
      setRevokingIp(prev => ({ ...prev, [ip]: true }));
      
      const response = await fetch('http://localhost:8000/auth/revoke-ip-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: ip,
          revoked_by: currentUser?.username || 'developer',
          reason: reason
        })
      });

      const data = await response.json();
      console.log(`[IP-REVOKE] Backend response:`, data);
      
      if (response.ok && data['⚡ RESULT']?.success) {
        console.log(`[IP-REVOKE] ✅ IP ${ip} successfully unblocked`);
        
        // Actualizar datos inmediatamente
        await fetchIpAnalytics();
        setError(null);
        
        // Mostrar mensaje de éxito
        setTimeout(() => {
          alert(`IP ${ip} successfully unblocked!`);
        }, 100);
        
      } else {
        console.error(`[IP-REVOKE] ❌ Error from backend:`, data);
        setError(data['⚡ RESULT']?.message || data.message || 'Failed to revoke IP block');
      }
    } catch (err) {
      console.error(`[IP-REVOKE] ❌ Error revoking IP block:`, err);
      setError(`Error revoking IP block: ${err.message}`);
    } finally {
      setRevokingIp(prev => ({ ...prev, [ip]: false }));
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
                onClick={() => {
                  console.log('[NAVIGATION] Clicking Active Users button');
                  setActiveTab('users');
                }}
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
                onClick={() => {
                  console.log('[NAVIGATION] Clicking Blocked Users button');
                  setActiveTab('blocked');
                }}
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

          <div className="clinical-stat-card clinical-stat-card--warning">
            <div className="clinical-stat-card__icon">
              <i className="fas fa-mobile-alt"></i>
            </div>
            <div className="clinical-stat-card__content">
              <div className="clinical-stat-card__value">{devicesSummary?.total_devices_registered || 0}</div>
              <div className="clinical-stat-card__label">Tracked Devices</div>
            </div>
            <div className="clinical-stat-card__action">
              <button 
                className="clinical-quick-nav"
                onClick={() => setActiveTab('devices')}
              >
                Analyze <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <div className="clinical-stat-card clinical-stat-card--info">
            <div className="clinical-stat-card__icon">
              <i className="fas fa-fingerprint"></i>
            </div>
            <div className="clinical-stat-card__content">
              <div className="clinical-stat-card__value">{devicesSummary?.total_users_with_devices || 0}</div>
              <div className="clinical-stat-card__label">Users with Devices</div>
            </div>
            <div className="clinical-stat-card__action">
              <button 
                className="clinical-quick-nav"
                onClick={() => setActiveTab('monitoring')}
              >
                Monitor <i className="fas fa-arrow-right"></i>
              </button>
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
              <div className={`clinical-status-item ${(devicesSummary?.high_risk_devices || 0) > 0 ? 'clinical-status-item--warning' : 'clinical-status-item--good'}`}>
                <i className={`fas ${(devicesSummary?.high_risk_devices || 0) > 0 ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
                <span>Device Security: {(devicesSummary?.high_risk_devices || 0) > 0 ? `${devicesSummary.high_risk_devices} high-risk devices` : 'All devices secure'}</span>
              </div>
              <div className={`clinical-status-item ${(devicesSummary?.bot_devices || 0) > 0 ? 'clinical-status-item--danger' : 'clinical-status-item--good'}`}>
                <i className={`fas ${(devicesSummary?.bot_devices || 0) > 0 ? 'fa-robot' : 'fa-check-circle'}`}></i>
                <span>Bot Detection: {(devicesSummary?.bot_devices || 0) > 0 ? `${devicesSummary.bot_devices} bots detected` : 'No bots detected'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setShowUserMenu(false);
    document.body.classList.add('logging-out');
  };

  // useEffects adicionales para el nuevo layout
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stats = securityData?.['📊 ENTERPRISE_METRICS'] || {};

  if (loading && !securityData) {
    return (
      <div className="security-dashboard">
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

  // 🌐 RENDERIZAR IP MONITORING TAB
  const renderIpMonitoring = () => {
    if (!ipAnalytics) {
      return (
        <div className="clinical-section">
          <div className="clinical-card">
            <div className="clinical-card__header">
              <h3>🌐 IP Monitoring</h3>
            </div>
            <div className="clinical-card__content">
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading IP analytics...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const summary = ipAnalytics.summary || {};
    const configuration = ipAnalytics.configuration || {};

    return (
      <div className="clinical-section">
        {/* Summary Cards */}
        <div className="clinical-grid clinical-grid--4">
          <div className="clinical-card clinical-card--metric">
            <div className="clinical-metric">
              <div className="clinical-metric__icon clinical-metric__icon--info">
                <i className="fas fa-globe"></i>
              </div>
              <div className="clinical-metric__content">
                <div className="clinical-metric__value">{summary.total_unique_ips || 0}</div>
                <div className="clinical-metric__label">Unique IPs Tracked</div>
              </div>
            </div>
          </div>

          <div className="clinical-card clinical-card--metric">
            <div className="clinical-metric">
              <div className="clinical-metric__icon clinical-metric__icon--danger">
                <i className="fas fa-ban"></i>
              </div>
              <div className="clinical-metric__content">
                <div className="clinical-metric__value">{summary.currently_blocked || 0}</div>
                <div className="clinical-metric__label">Currently Blocked</div>
              </div>
            </div>
          </div>

          <div className="clinical-card clinical-card--metric">
            <div className="clinical-metric">
              <div className="clinical-metric__icon clinical-metric__icon--warning">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="clinical-metric__content">
                <div className="clinical-metric__value">{summary.suspicious_ips_count || 0}</div>
                <div className="clinical-metric__label">Suspicious IPs</div>
              </div>
            </div>
          </div>

          <div className="clinical-card clinical-card--metric">
            <div className="clinical-metric">
              <div className="clinical-metric__icon clinical-metric__icon--primary">
                <i className="fas fa-robot"></i>
              </div>
              <div className="clinical-metric__content">
                <div className="clinical-metric__value">{summary.bot_ips_count || 0}</div>
                <div className="clinical-metric__label">Bot IPs Detected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="clinical-card">
          <div className="clinical-card__header">
            <h3>
              <i className="fas fa-cog"></i>
              Rate Limiting Configuration
            </h3>
          </div>
          <div className="clinical-card__content">
            <div className="clinical-grid clinical-grid--4">
              <div className="config-item">
                <span className="config-label">Single User Limit:</span>
                <span className="config-value">12 attempts</span>
                <small className="config-description">Tolerant for forgotten passwords</small>
              </div>
              <div className="config-item">
                <span className="config-label">Multiple Users Limit:</span>
                <span className="config-value">8 attempts</span>
                <small className="config-description">Suspicious activity detection</small>
              </div>
              <div className="config-item">
                <span className="config-label">Time Window:</span>
                <span className="config-value">{configuration.time_window_minutes || 10} minutes</span>
                <small className="config-description">Rolling window</small>
              </div>
              <div className="config-item">
                <span className="config-label">Block Duration:</span>
                <span className="config-value">{configuration.block_duration_minutes || 30} minutes</span>
                <small className="config-description">Auto-unblock after</small>
              </div>
            </div>
            
            {/* Intelligent Detection Info */}
            <div className="intelligent-detection-info">
              <h5>🧠 Intelligent Detection Rules:</h5>
              <ul className="detection-rules">
                <li>👤 <strong>Single User:</strong> Up to 12 attempts (for forgotten passwords)</li>
                <li>👥 <strong>Multiple Users:</strong> Max 8 attempts (attack detection)</li>
                <li>🤖 <strong>Bot Detection:</strong> Immediate block on automated patterns</li>
                <li>⚡ <strong>Rapid Fire:</strong> Block if 3+ attempts within 3 seconds</li>
                <li>📱 <strong>Device Risk:</strong> Block high-risk fingerprints</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Blocked IPs List */}
        <div className="clinical-card">
          <div className="clinical-card__header">
            <h3>
              <i className="fas fa-ban"></i>
              Currently Blocked IPs ({blockedIps.length})
            </h3>
          </div>
          <div className="clinical-card__content">
            {blockedIps.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-check-circle"></i>
                <p>No IPs currently blocked</p>
                <small>IPs will appear here when blocked by rate limiting</small>
              </div>
            ) : (
              <div className="blocked-ips-list">
                {blockedIps.map((blockedIp, index) => (
                  <div key={index} className="blocked-ip-item">
                    <div className="blocked-ip-header">
                      <div className="ip-info">
                        <h4>🌐 {blockedIp.ip}</h4>
                        <span className="block-reason">{blockedIp.reason}</span>
                      </div>
                      <div className="block-status">
                        <span className="time-remaining">
                          {blockedIp.remaining_minutes} min remaining
                        </span>
                        <span className={`risk-badge risk-${blockedIp.device_risk > 70 ? 'high' : blockedIp.device_risk > 40 ? 'medium' : 'low'}`}>
                          Risk: {blockedIp.device_risk || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div className="blocked-ip-details">
                      <div className="detail-row">
                        <span className="label">Blocked At:</span>
                        <span className="value">{new Date(blockedIp.blocked_at).toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Attempts:</span>
                        <span className="value">{blockedIp.attempts}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Last User:</span>
                        <span className="value">{blockedIp.last_username || 'unknown'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Unique Users:</span>
                        <span className="value">{blockedIp.unique_users || 0}</span>
                      </div>
                    </div>

                    <div className="blocked-ip-actions">
                      <button
                        className="clinical-btn clinical-btn--info"
                        onClick={() => fetchIpDetails(blockedIp.ip)}
                        title="View detailed IP information"
                      >
                        <i className="fas fa-info-circle"></i>
                        Details
                      </button>
                      
                      <button
                        className="clinical-btn clinical-btn--success"
                        onClick={() => revokeIpBlock(blockedIp.ip)}
                        disabled={revokingIp[blockedIp.ip]}
                        title="Unblock this IP immediately"
                      >
                        {revokingIp[blockedIp.ip] ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Unblocking...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-unlock"></i>
                            Unblock IP
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Active IPs */}
        <div className="clinical-card">
          <div className="clinical-card__header">
            <h3>
              <i className="fas fa-chart-bar"></i>
              Top Active IPs
            </h3>
          </div>
          <div className="clinical-card__content">
            {!ipAnalytics.top_ips || ipAnalytics.top_ips.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-chart-bar"></i>
                <p>No IP activity data available</p>
              </div>
            ) : (
              <div className="top-ips-list">
                {ipAnalytics.top_ips.slice(0, 10).map((ipData, index) => (
                  <div key={index} className="top-ip-item">
                    <div className="ip-rank">#{index + 1}</div>
                    <div className="ip-details">
                      <div className="ip-address">
                        🌐 {ipData.ip}
                        {ipData.is_currently_blocked && <span className="blocked-indicator">🚫 BLOCKED</span>}
                        {ipData.is_suspicious && <span className="suspicious-indicator">⚠️ SUSPICIOUS</span>}
                        {ipData.is_bot && <span className="bot-indicator">🤖 BOT</span>}
                      </div>
                      <div className="ip-stats">
                        <span>Attempts: {ipData.total_attempts}</span>
                        <span>Success: {ipData.successful_logins}</span>
                        <span>Users: {ipData.unique_users}</span>
                        <span>Risk: {ipData.risk_score}</span>
                      </div>
                      <div className="ip-times">
                        <span>First: {new Date(ipData.first_seen).toLocaleDateString()}</span>
                        <span>Last: {new Date(ipData.last_seen).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="ip-actions">
                      <button
                        className="action-btn"
                        onClick={() => fetchIpDetails(ipData.ip)}
                        title="View IP details"
                      >
                        <i className="fas fa-info-circle"></i>
                      </button>
                      {ipData.is_currently_blocked && (
                        <button
                          className="action-btn unlock-btn"
                          onClick={() => revokeIpBlock(ipData.ip)}
                          disabled={revokingIp[ipData.ip]}
                          title="Unblock IP"
                        >
                          <i className="fas fa-unlock"></i>
                        </button>
                      )}
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
    <div className={`security-dashboard ${menuTransitioning ? 'transitioning' : ''} ${isLoggingOut ? 'logging-out' : ''}`}>
      {isLoggingOut && (
        <LogoutAnimation 
          isMobile={isMobile} 
          onAnimationComplete={handleLogoutAnimationComplete} 
        />
      )}
      
      <div className="parallax-background">
        <div className="gradient-overlay"></div>
        <div className="animated-particles"></div>
      </div>
      
      <header className={`main-header ${isLoggingOut ? 'logging-out' : ''}`}>
        <div className="header-container">
          <div className="logo-container">
            <div className="logo-wrapper">
              <img src={logoImg} alt="TherapySync Logo" className="logo" />
              <div className="logo-glow"></div>
            </div>
          </div>
          
          <div className="menu-navigation">
            <button 
              className="nav-button main-menu" 
              onClick={handleMainMenuTransition}
              title="Back to main menu"
              disabled={isLoggingOut}
            >
              <i className="fas fa-th-large"></i>
              <span>Main Menu</span>
              <div className="button-effect"></div>
            </button>
            
            <button 
              className="nav-button security-menu active" 
              title="Security Dashboard"
              disabled={isLoggingOut}
            >
              <i className="fas fa-shield-alt"></i>
              <span>Security</span>
              <div className="button-effect"></div>
            </button>
          </div>

          <div className="support-user-profile" ref={userMenuRef}>
            <div 
              className={`support-profile-button ${showUserMenu ? 'active' : ''}`} 
              onClick={() => !isLoggingOut && setShowUserMenu(!showUserMenu)}
              data-tooltip="Your profile and settings"
            >
              <div className="support-avatar">
                <div className="support-avatar-text">{userData.avatar}</div>
                <div className={`support-avatar-status ${userData.status}`}></div>
              </div>
              
              <div className="support-profile-info">
                <span className="support-user-name">{userData.name}</span>
                <span className="support-user-role">{userData.role}</span>
              </div>
              
              <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'}`}></i>
            </div>
            
            {showUserMenu && !isLoggingOut && (
              <div className="support-user-menu">
                <div className="support-menu-header">
                  <div className="support-user-info">
                    <div className="support-user-avatar">
                      <span>{userData.avatar}</span>
                      <div className={`avatar-status ${userData.status}`}></div>
                    </div>
                    <div className="support-user-details">
                      <h4>{userData.name}</h4>
                      <span className="support-user-email">{userData.email}</span>
                      <span className={`support-user-status ${userData.status}`}>
                        <i className="fas fa-circle"></i> 
                        {userData.status.charAt(0).toUpperCase() + userData.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="support-menu-section">
                  <div className="section-title">Account</div>
                  <div className="support-menu-items">
                    <div 
                      className="support-menu-item"
                      onClick={() => {
                        const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
                        navigate(`/${baseRole}/profile`);
                      }}
                    >
                      <i className="fas fa-user-circle"></i>
                      <span>My Profile</span>
                    </div>
                    <div 
                      className="support-menu-item"
                      onClick={() => {
                        const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
                        navigate(`/${baseRole}/settings`);
                      }}
                    >
                      <i className="fas fa-cog"></i>
                      <span>Settings</span>
                    </div>
                  </div>
                </div>
                
                <div className="support-menu-footer">
                  <div className="support-menu-item logout" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Log Out</span>
                  </div>
                  <div className="version-info">
                    <span>TherapySync™</span>
                    <span>v2.7.0</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className={`main-content ${isLoggingOut ? 'fade-out' : ''}`}>
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
            <button
              className={`clinical-nav-tab ${activeTab === 'ip-monitoring' ? 'clinical-nav-tab--active' : ''}`}
              onClick={() => {setActiveTab('ip-monitoring'); setActiveSubSection(null);}}
            >
              <i className="fas fa-globe"></i>
              <span>IP Monitoring</span>
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
            {activeTab === 'ip-monitoring' && renderIpMonitoring()}
          </div>
        </div>
      </main>

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

      {/* 🌐 MODAL DE DETALLES DE IP */}
      {showIpDetailsModal && selectedIpDetails && (
        <div className="modal-overlay">
          <div className="modal modal--large">
            <div className="modal__header">
              <h3 className="modal__title">
                🌐 IP Details: {selectedIpDetails.ip}
              </h3>
              <button 
                className="modal__close"
                onClick={() => setShowIpDetailsModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal__content">
              {/* Estado actual */}
              <div className="ip-detail-section">
                <h4>📊 Current Status</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`value ${selectedIpDetails.current_status?.is_blocked ? 'blocked' : 'active'}`}>
                      {selectedIpDetails.current_status?.is_blocked ? '🚫 BLOCKED' : '✅ Active'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Current Attempts:</span>
                    <span className="value">{selectedIpDetails.current_status?.current_attempts_in_window || 0}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Risk Level:</span>
                    <span className={`value risk-${selectedIpDetails.risk_assessment?.is_suspicious ? 'high' : 'low'}`}>
                      {selectedIpDetails.risk_assessment?.is_suspicious ? '⚠️ Suspicious' : '✅ Normal'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Bot Detection:</span>
                    <span className={`value ${selectedIpDetails.risk_assessment?.is_bot ? 'bot' : 'human'}`}>
                      {selectedIpDetails.risk_assessment?.is_bot ? '🤖 Bot' : '👤 Human'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadata histórica */}
              <div className="ip-detail-section">
                <h4>📈 Historical Data</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">First Seen:</span>
                    <span className="value">
                      {selectedIpDetails.metadata?.first_seen ? 
                        new Date(selectedIpDetails.metadata.first_seen).toLocaleString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Last Seen:</span>
                    <span className="value">
                      {selectedIpDetails.metadata?.last_seen ? 
                        new Date(selectedIpDetails.metadata.last_seen).toLocaleString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Total Attempts:</span>
                    <span className="value">{selectedIpDetails.metadata?.total_attempts || 0}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Successful Logins:</span>
                    <span className="value">{selectedIpDetails.metadata?.successful_logins || 0}</span>
                  </div>
                </div>
              </div>

              {/* Usuarios */}
              <div className="ip-detail-section">
                <h4>👥 Users from this IP</h4>
                {selectedIpDetails.metadata?.unique_users && selectedIpDetails.metadata.unique_users.length > 0 ? (
                  <div className="users-list">
                    {selectedIpDetails.metadata.unique_users.map((username, index) => (
                      <span key={index} className="user-tag">{username}</span>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No users recorded</p>
                )}
              </div>

              {/* Factores de riesgo */}
              {selectedIpDetails.risk_assessment?.risk_factors && selectedIpDetails.risk_assessment.risk_factors.length > 0 && (
                <div className="ip-detail-section">
                  <h4>⚠️ Risk Factors</h4>
                  <div className="risk-factors-list">
                    {selectedIpDetails.risk_assessment.risk_factors.map((factor, index) => (
                      <div key={index} className="risk-factor">
                        <i className="fas fa-exclamation-triangle"></i>
                        {factor}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Device History (últimos 5 dispositivos) */}
              {selectedIpDetails.device_history && selectedIpDetails.device_history.length > 0 && (
                <div className="ip-detail-section">
                  <h4>📱 Recent Device History</h4>
                  <div className="device-history-list">
                    {selectedIpDetails.device_history.slice(-5).map((device, index) => (
                      <div key={index} className="device-history-item">
                        <div className="device-header">
                          <span className="device-time">
                            {new Date(device.timestamp * 1000).toLocaleString()}
                          </span>
                          <span className="device-user">👤 {device.username}</span>
                          <span className={`device-status ${device.success ? 'success' : 'failed'}`}>
                            {device.success ? '✅ Success' : '❌ Failed'}
                          </span>
                        </div>
                        <div className="device-details">
                          <span>Hash: {device.hash.substring(0, 16)}...</span>
                          <span>Risk: {device.risk_score}</span>
                          {device.is_bot && <span className="bot-tag">🤖 Bot</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Información de bloqueo si existe */}
              {selectedIpDetails.current_status?.block_info && (
                <div className="ip-detail-section">
                  <h4>🚫 Block Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Reason:</span>
                      <span className="value">{selectedIpDetails.current_status.block_info.reason}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Blocked Until:</span>
                      <span className="value">
                        {new Date(selectedIpDetails.current_status.block_info.blocked_until * 1000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal__actions">
              {selectedIpDetails.current_status?.is_blocked && (
                <button
                  className="modal__button modal__button--warning"
                  onClick={() => {
                    revokeIpBlock(selectedIpDetails.ip);
                    setShowIpDetailsModal(false);
                  }}
                  disabled={revokingIp[selectedIpDetails.ip]}
                >
                  {revokingIp[selectedIpDetails.ip] ? 'Unblocking...' : 'Unblock IP'}
                </button>
              )}
              <button
                className="modal__button modal__button--cancel"
                onClick={() => setShowIpDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;