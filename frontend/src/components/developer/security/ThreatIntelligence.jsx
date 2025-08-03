import React from 'react';
import '../../../styles/developer/Security/ThreatIntelligence.scss';

const ThreatIntelligence = ({ data }) => {
  const threatData = data?.['📊 ENTERPRISE_METRICS']?.threat_intelligence || {};
  const systemInfo = data?.['📊 ENTERPRISE_METRICS']?.system_info || {};

  const threatTypes = [
    {
      type: 'rapid_fire_attacks',
      name: 'Ataques Rapid-Fire',
      icon: 'fa-bolt',
      color: '#ff4757',
      count: threatData.rapid_fire_attacks || 0,
      description: 'Múltiples intentos de login en menos de 2 segundos',
      severity: 'critical',
      trend: -40
    },
    {
      type: 'brute_force_attempts',
      name: 'Ataques de Fuerza Bruta',
      icon: 'fa-hammer',
      color: '#c44569',
      count: threatData.brute_force_attempts || 0,
      description: 'Intentos sistemáticos de adivinar credenciales',
      severity: 'high',
      trend: -25
    },
    {
      type: 'distributed_attacks',
      name: 'Ataques Distribuidos',
      icon: 'fa-network-wired',
      color: '#6c5ce7',
      count: threatData.distributed_attacks || 0,
      description: 'Ataques coordinados desde múltiples IPs',
      severity: 'high',
      trend: -60
    },
    {
      type: 'suspicious_activities',
      name: 'Actividades Sospechosas',
      icon: 'fa-exclamation-triangle',
      color: '#ffa502',
      count: threatData.suspicious_activities_detected || 0,
      description: 'Comportamientos anómalos detectados por IA',
      severity: 'medium',
      trend: -15
    }
  ];

  const recentThreats = threatData.latest_threats || [
    {
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: 'rapid_fire_attack',
      source_ip: '192.168.1.102',
      target_user: 'admin',
      severity: 'critical',
      status: 'blocked',
      details: 'Multiple login attempts detected in < 2 seconds'
    },
    {
      timestamp: new Date(Date.now() - 600000).toISOString(),
      type: 'brute_force_attempt',
      source_ip: '10.0.0.50',
      target_user: 'luis_ceo',
      severity: 'high',
      status: 'mitigated',
      details: 'Dictionary attack pattern detected and blocked'
    },
    {
      timestamp: new Date(Date.now() - 900000).toISOString(),
      type: 'suspicious_activity',
      source_ip: '172.16.0.25',
      target_user: 'multiple',
      severity: 'medium',
      status: 'monitoring',
      details: 'Unusual access pattern from unknown location'
    }
  ];

  const ThreatCard = ({ threat }) => (
    <div className={`threat-card ${threat.severity}`}>
      <div className="threat-header">
        <div className="threat-icon" style={{ color: threat.color }}>
          <i className={`fas ${threat.icon}`}></i>
        </div>
        <div className="threat-info">
          <h3>{threat.name}</h3>
          <p>{threat.description}</p>
        </div>
        <div className="threat-count">
          <span className="count-value">{threat.count}</span>
          <div className={`trend ${threat.trend < 0 ? 'down' : 'up'}`}>
            <i className={`fas ${threat.trend < 0 ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
            {Math.abs(threat.trend)}%
          </div>
        </div>
      </div>
      
      <div className="threat-status">
        <div className={`status-badge ${threat.count === 0 ? 'safe' : threat.severity}`}>
          {threat.count === 0 ? 'SEGURO' : threat.severity.toUpperCase()}
        </div>
        <div className="threat-bar">
          <div 
            className="threat-fill"
            style={{ 
              width: `${Math.min((threat.count / 10) * 100, 100)}%`,
              backgroundColor: threat.color 
            }}
          ></div>
        </div>
      </div>
    </div>
  );

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return '#ff4757';
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffa502';
      case 'low': return '#3742fa';
      default: return '#747d8c';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'blocked': return '#ff4757';
      case 'mitigated': return '#ffa502';
      case 'monitoring': return '#3742fa';
      case 'resolved': return '#2ed573';
      default: return '#747d8c';
    }
  };

  return (
    <div className="threat-intelligence">
      <div className="threat-header">
        <div className="header-content">
          <h2>
            <i className="fas fa-exclamation-triangle"></i>
            Threat Intelligence Dashboard
          </h2>
          <p>Monitoreo avanzado de amenazas y análisis de seguridad en tiempo real</p>
        </div>
        
        <div className="threat-summary">
          <div className="summary-stat">
            <div className="stat-icon critical">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="stat-content">
              <span className="stat-label">Amenazas Bloqueadas</span>
              <span className="stat-value">{
                threatTypes.reduce((sum, threat) => sum + threat.count, 0)
              }</span>
            </div>
          </div>
          
          <div className="summary-stat">
            <div className="stat-icon success">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <span className="stat-label">Tasa de Prevención</span>
              <span className="stat-value">99.7%</span>
            </div>
          </div>
          
          <div className="summary-stat">
            <div className="stat-icon info">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <span className="stat-label">Tiempo de Respuesta</span>
              <span className="stat-value">&lt; 2s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Overview */}
      <div className="threats-section">
        <h3>
          <i className="fas fa-chart-bar"></i>
          Análisis de Amenazas
        </h3>
        
        <div className="threats-grid">
          {threatTypes.map((threat) => (
            <ThreatCard key={threat.type} threat={threat} />
          ))}
        </div>
      </div>

      {/* Recent Threats */}
      <div className="recent-threats-section">
        <h3>
          <i className="fas fa-history"></i>
          Amenazas Recientes
        </h3>
        
        <div className="recent-threats-list">
          {recentThreats.map((threat, index) => (
            <div key={index} className="recent-threat-item">
              <div className="threat-timeline">
                <div 
                  className="timeline-dot"
                  style={{ backgroundColor: getSeverityColor(threat.severity) }}
                ></div>
                <div className="timeline-line"></div>
              </div>
              
              <div className="threat-content">
                <div className="threat-main">
                  <div className="threat-type">
                    <i className={`fas ${
                      threat.type === 'rapid_fire_attack' ? 'fa-bolt' :
                      threat.type === 'brute_force_attempt' ? 'fa-hammer' :
                      'fa-exclamation-triangle'
                    }`}></i>
                    <span>{
                      threat.type === 'rapid_fire_attack' ? 'Ataque Rapid-Fire' :
                      threat.type === 'brute_force_attempt' ? 'Fuerza Bruta' :
                      'Actividad Sospechosa'
                    }</span>
                  </div>
                  
                  <div className="threat-details">
                    <span className="target">
                      <i className="fas fa-user"></i>
                      {threat.target_user}
                    </span>
                    <span className="source">
                      <i className="fas fa-globe"></i>
                      {threat.source_ip}
                    </span>
                    <span className="timestamp">
                      <i className="fas fa-clock"></i>
                      {new Date(threat.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="threat-description">
                    {threat.details}
                  </div>
                </div>
                
                <div className="threat-badges">
                  <div 
                    className={`severity-badge ${threat.severity}`}
                    style={{ backgroundColor: getSeverityColor(threat.severity) }}
                  >
                    {threat.severity.toUpperCase()}
                  </div>
                  <div 
                    className={`status-badge ${threat.status}`}
                    style={{ backgroundColor: getStatusColor(threat.status) }}
                  >
                    {threat.status.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Threat Map */}
      <div className="threat-map-section">
        <h3>
          <i className="fas fa-globe"></i>
          Mapa de Amenazas Geográfico
        </h3>
        
        <div className="threat-map">
          <div className="map-placeholder">
            <div className="map-info">
              <i className="fas fa-map-marked-alt"></i>
              <h4>Visualización Geográfica de Amenazas</h4>
              <p>Mapa mundial mostrando origen de ataques bloqueados</p>
              <div className="map-stats">
                <div className="map-stat">
                  <span className="stat-color blocked"></span>
                  <span>Amenazas Bloqueadas: 127</span>
                </div>
                <div className="map-stat">
                  <span className="stat-color monitoring"></span>
                  <span>En Monitoreo: 23</span>
                </div>
                <div className="map-stat">
                  <span className="stat-color safe"></span>
                  <span>Países Seguros: 45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Threat Analysis */}
      <div className="ai-analysis-section">
        <h3>
          <i className="fas fa-brain"></i>
          Análisis de IA - Inteligencia Artificial
        </h3>
        
        <div className="ai-insights">
          <div className="ai-insight">
            <div className="insight-icon">
              <i className="fas fa-lightbulb"></i>
            </div>
            <div className="insight-content">
              <h4>Patrón Detectado</h4>
              <p>Se ha identificado un incremento del 15% en intentos de acceso durante horarios no laborales. Recomendación: Implementar autenticación de doble factor para accesos fuera de horario.</p>
            </div>
            <div className="insight-confidence">
              <span>Confianza: 94%</span>
            </div>
          </div>
          
          <div className="ai-insight">
            <div className="insight-icon">
              <i className="fas fa-search"></i>
            </div>
            <div className="insight-content">
              <h4>Anomalía Comportamental</h4>
              <p>Usuario 'luis_ceo' muestra patrón de acceso inusual. Múltiples intentos desde ubicaciones geográficas diferentes en corto período de tiempo.</p>
            </div>
            <div className="insight-confidence">
              <span>Confianza: 87%</span>
            </div>
          </div>
          
          <div className="ai-insight">
            <div className="insight-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="insight-content">
              <h4>Recomendación de Seguridad</h4>
              <p>El sistema ha funcionado óptimamente. Se recomienda mantener la configuración actual de escalamiento progresivo para maximizar la protección.</p>
            </div>
            <div className="insight-confidence">
              <span>Confianza: 99%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatIntelligence;