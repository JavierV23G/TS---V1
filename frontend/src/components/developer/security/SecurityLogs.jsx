import React, { useState, useEffect, useRef } from 'react';
import '../../../styles/developer/Security/SecurityLogs.scss';

const SecurityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLiveFeed, setIsLiveFeed] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const logsEndRef = useRef(null);

  // Simulated security logs - En producción vendría del backend
  const generateMockLogs = () => {
    const mockLogs = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: 'failed_login_attempt',
        severity: 'warning',
        username: 'luis_ceo',
        ip: '192.168.1.100',
        message: 'Intento de login fallido para usuario luis_ceo desde 192.168.1.100',
        details: {
          attempts_in_cycle: 2,
          block_level: 0,
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 240000).toISOString(),
        type: 'account_blocked_temporarily',
        severity: 'critical',
        username: 'luis_ceo',
        ip: '192.168.1.100',
        message: 'Cuenta luis_ceo bloqueada temporalmente por 1 minuto - Nivel 1',
        details: {
          duration_minutes: 1,
          block_level: 1,
          reason: '5 intentos fallidos consecutivos'
        }
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 180000).toISOString(),
        type: 'successful_login',
        severity: 'info',
        username: 'maria_admin',
        ip: '192.168.1.101',
        message: 'Login exitoso para usuario maria_admin desde 192.168.1.101',
        details: {
          previous_failures: 0,
          session_id: 'sess_abc123'
        }
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 120000).toISOString(),
        type: 'rapid_fire_attack',
        severity: 'critical',
        username: 'test_user',
        ip: '192.168.1.102',
        message: 'Ataque rapid-fire detectado - Múltiples intentos en < 2 segundos',
        details: {
          attempts_per_second: 5,
          total_attempts: 15,
          blocked: true
        }
      },
      {
        id: 5,
        timestamp: new Date(Date.now() - 60000).toISOString(),
        type: 'account_unlocked',
        severity: 'info',
        username: 'luis_ceo',
        ip: '192.168.1.100',
        message: 'Cuenta luis_ceo desbloqueada automáticamente - Tiempo de bloqueo expirado',
        details: {
          previous_block_level: 1,
          auto_unlock: true
        }
      },
      {
        id: 6,
        timestamp: new Date(Date.now() - 30000).toISOString(),
        type: 'brute_force_attempt',
        severity: 'high',
        username: 'admin',
        ip: '10.0.0.50',
        message: 'Intento de fuerza bruta detectado contra usuario admin',
        details: {
          pattern_detected: 'dictionary_attack',
          attempts_blocked: 25,
          source_blocked: true
        }
      }
    ];

    return mockLogs;
  };

  useEffect(() => {
    // Cargar logs iniciales
    const initialLogs = generateMockLogs();
    setLogs(initialLogs);
    setFilteredLogs(initialLogs);
    setLoading(false);

    // Simular logs en tiempo real
    if (isLiveFeed) {
      const interval = setInterval(() => {
        const newLog = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          type: Math.random() > 0.7 ? 'failed_login_attempt' : 'successful_login',
          severity: Math.random() > 0.8 ? 'warning' : 'info',
          username: ['luis_ceo', 'maria_admin', 'john_dev', 'ana_therapist'][Math.floor(Math.random() * 4)],
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          message: Math.random() > 0.7 ? 
            'Intento de login fallido detectado' : 
            'Login exitoso registrado',
          details: {
            attempts_in_cycle: Math.floor(Math.random() * 5),
            block_level: 0
          }
        };

        setLogs(prevLogs => {
          const updatedLogs = [newLog, ...prevLogs].slice(0, 100); // Mantener solo 100 logs
          return updatedLogs;
        });
      }, 10000); // Nuevo log cada 10 segundos

      return () => clearInterval(interval);
    }
  }, [isLiveFeed]);

  useEffect(() => {
    let filtered = logs;

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.type === filterType);
    }

    // Filtrar por severidad
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(log => log.severity === selectedSeverity);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip.includes(searchTerm) ||
        log.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, filterType, searchTerm, selectedSeverity]);

  useEffect(() => {
    if (logsEndRef.current && isLiveFeed) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs]);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return 'fa-exclamation-triangle';
      case 'high':
        return 'fa-exclamation-circle';
      case 'warning':
        return 'fa-exclamation';
      case 'info':
        return 'fa-info-circle';
      default:
        return 'fa-circle';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#ff4757';
      case 'high':
        return '#ff6b6b';
      case 'warning':
        return '#ffa502';
      case 'info':
        return '#3742fa';
      default:
        return '#747d8c';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'failed_login_attempt':
        return 'fa-times-circle';
      case 'successful_login':
        return 'fa-check-circle';
      case 'account_blocked_temporarily':
        return 'fa-ban';
      case 'account_blocked_permanently':
        return 'fa-lock';
      case 'account_unlocked':
        return 'fa-unlock';
      case 'rapid_fire_attack':
        return 'fa-bolt';
      case 'brute_force_attempt':
        return 'fa-hammer';
      default:
        return 'fa-circle';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // Less than 1 minute
      return `${Math.floor(diff / 1000)}s ago`;
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setFilteredLogs([]);
  };

  if (loading) {
    return (
      <div className="security-logs-loading">
        <div className="loading-spinner"></div>
        <p>Loading security logs...</p>
      </div>
    );
  }

  return (
    <div className="security-logs">
      <div className="logs-header">
        <div className="header-left">
          <h2>
            <i className="fas fa-list-alt"></i>
            Security Activity Logs
          </h2>
          <div className="logs-stats">
            <span className="stat">
              <i className="fas fa-file-alt"></i>
              {filteredLogs.length} logs
            </span>
            <div className={`live-indicator ${isLiveFeed ? 'active' : ''}`}>
              <div className="pulse-dot"></div>
              {isLiveFeed ? 'LIVE' : 'PAUSED'}
            </div>
          </div>
        </div>
        
        <div className="header-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar por usuario, IP o mensaje..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los tipos</option>
            <option value="failed_login_attempt">Intentos fallidos</option>
            <option value="successful_login">Logins exitosos</option>
            <option value="account_blocked_temporarily">Bloqueos temporales</option>
            <option value="account_blocked_permanently">Bloqueos permanentes</option>
            <option value="rapid_fire_attack">Ataques rapid-fire</option>
            <option value="brute_force_attempt">Ataques fuerza bruta</option>
          </select>
          
          <select 
            value={selectedSeverity} 
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="severity-select"
          >
            <option value="all">Todas las severidades</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          
          <button 
            className="live-toggle"
            onClick={() => setIsLiveFeed(!isLiveFeed)}
          >
            <i className={`fas ${isLiveFeed ? 'fa-pause' : 'fa-play'}`}></i>
            {isLiveFeed ? 'Pause' : 'Resume'}
          </button>
          
          <button 
            className="clear-logs"
            onClick={clearLogs}
          >
            <i className="fas fa-trash"></i>
            Clear
          </button>
        </div>
      </div>
      
      <div className="logs-container">
        {filteredLogs.length === 0 ? (
          <div className="no-logs">
            <i className="fas fa-inbox"></i>
            <h3>No logs found</h3>
            <p>No security logs match your current filters</p>
          </div>
        ) : (
          <div className="logs-list">
            {filteredLogs.map((log) => (
              <div key={log.id} className={`log-entry ${log.severity}`}>
                <div className="log-header">
                  <div className="log-icons">
                    <div 
                      className="severity-icon"
                      style={{ color: getSeverityColor(log.severity) }}
                    >
                      <i className={`fas ${getSeverityIcon(log.severity)}`}></i>
                    </div>
                    <div className="type-icon">
                      <i className={`fas ${getTypeIcon(log.type)}`}></i>
                    </div>
                  </div>
                  
                  <div className="log-info">
                    <div className="log-meta">
                      <span className="username">
                        <i className="fas fa-user"></i>
                        {log.username}
                      </span>
                      <span className="ip">
                        <i className="fas fa-globe"></i>
                        {log.ip}
                      </span>
                      <span className="timestamp">
                        <i className="fas fa-clock"></i>
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    
                    <div className="log-message">
                      {log.message}
                    </div>
                    
                    {log.details && (
                      <div className="log-details">
                        {Object.entries(log.details).map(([key, value]) => (
                          <span key={key} className="detail-tag">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className={`severity-badge ${log.severity}`}>
                    {log.severity.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityLogs;