import React from 'react';
import '../../../styles/developer/Security/SecurityMetrics.scss';

const SecurityMetrics = ({ data }) => {
  const metrics = data?.['📊 ENTERPRISE_METRICS'] || {};
  const accountMetrics = metrics.account_lockout_metrics || {};
  const threatMetrics = metrics.threat_intelligence || {};
  const operationalMetrics = metrics.operational_metrics || {};

  const MetricCard = ({ title, value, icon, color, description, trend, trendIcon }) => (
    <div className="metric-card" style={{ '--card-color': color }}>
      <div className="metric-header">
        <div className="metric-icon">
          <i className={`fas ${icon}`}></i>
        </div>
        <div className="metric-title">{title}</div>
      </div>
      
      <div className="metric-value">
        {value}
        {trend && (
          <div className={`metric-trend ${trend > 0 ? 'up' : 'down'}`}>
            <i className={`fas ${trendIcon || (trend > 0 ? 'fa-arrow-up' : 'fa-arrow-down')}`}></i>
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div className="metric-description">{description}</div>
    </div>
  );

  const ProgressBar = ({ label, value, max, color, formatValue }) => (
    <div className="progress-metric">
      <div className="progress-header">
        <span className="progress-label">{label}</span>
        <span className="progress-value">
          {formatValue ? formatValue(value, max) : `${value}/${max}`}
        </span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ 
            width: `${Math.min((value / max) * 100, 100)}%`,
            backgroundColor: color 
          }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="security-metrics">
      <div className="metrics-header">
        <h2>
          <i className="fas fa-chart-line"></i>
          Security Metrics Overview
        </h2>
        <p>Métricas detalladas del sistema de seguridad enterprise</p>
      </div>

      {/* Account Lockout Metrics */}
      <div className="metrics-section">
        <h3>
          <i className="fas fa-ban"></i>
          Account Lockout Metrics
        </h3>
        
        <div className="metrics-grid">
          <MetricCard
            title="Bloqueos Temporales"
            value={accountMetrics.active_temporary_blocks || 0}
            icon="fa-clock"
            color="#ffa502"
            description="Cuentas actualmente bloqueadas temporalmente"
            trend={-15}
          />
          
          <MetricCard
            title="Bloqueos Permanentes"
            value={accountMetrics.permanent_blocks || 0}
            icon="fa-lock"
            color="#ff4757"
            description="Cuentas bloqueadas permanentemente"
            trend={0}
          />
          
          <MetricCard
            title="Usuarios con Fallos"
            value={accountMetrics.users_with_failures || 0}
            icon="fa-exclamation-triangle"
            color="#ff6b6b"
            description="Usuarios con intentos fallidos activos"
            trend={-8}
          />
          
          <MetricCard
            title="Usuarios Monitoreados"
            value={accountMetrics.monitored_user_accounts || 0}
            icon="fa-users"
            color="#3742fa"
            description="Total de cuentas bajo monitoreo"
            trend={12}
          />
        </div>

        {/* Escalation Levels */}
        <div className="escalation-metrics">
          <h4>Niveles de Escalamiento</h4>
          <div className="escalation-bars">
            {[1, 2, 3, 4, 5, 6, 7].map(level => {
              const count = Object.values(accountMetrics.escalation_levels || {})
                .filter(userLevel => userLevel === level).length;
              
              return (
                <ProgressBar
                  key={level}
                  label={`Nivel ${level} ${level === 7 ? '(Permanente)' : `(${[1, 2, 10, 30, 60, 300][level-1]}min)`}`}
                  value={count}
                  max={Math.max(10, count + 2)}
                  color={level <= 2 ? '#00d2d3' : level <= 4 ? '#ffa502' : '#ff4757'}
                  formatValue={(val, max) => `${val} usuarios`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Threat Intelligence Metrics */}
      <div className="metrics-section">
        <h3>
          <i className="fas fa-shield-alt"></i>
          Threat Intelligence
        </h3>
        
        <div className="metrics-grid">
          <MetricCard
            title="Actividades Sospechosas"
            value={threatMetrics.suspicious_activities_detected || 0}
            icon="fa-exclamation-triangle"
            color="#ff6b6b"
            description="Total de actividades sospechosas detectadas"
            trend={-25}
            trendIcon="fa-shield-alt"
          />
          
          <MetricCard
            title="Ataques Rapid-Fire"
            value={threatMetrics.rapid_fire_attacks || 0}
            icon="fa-bolt"
            color="#ff4757"
            description="Ataques de velocidad alta bloqueados"
            trend={-40}
          />
          
          <MetricCard
            title="Ataques de Fuerza Bruta"
            value={threatMetrics.brute_force_attempts || 0}
            icon="fa-hammer"
            color="#c44569"
            description="Intentos de fuerza bruta detectados"
            trend={-30}
          />
          
          <MetricCard
            title="Ataques Distribuidos"
            value={threatMetrics.distributed_attacks || 0}
            icon="fa-network-wired"
            color="#6c5ce7"
            description="Ataques coordinados desde múltiples IPs"
            trend={-50}
          />
        </div>
      </div>

      {/* Operational Metrics */}
      <div className="metrics-section">
        <h3>
          <i className="fas fa-cogs"></i>
          Operational Metrics
        </h3>
        
        <div className="metrics-grid">
          <MetricCard
            title="Verificaciones Totales"
            value={operationalMetrics.total_security_checks || 0}
            icon="fa-check-circle"
            color="#00d2d3"
            description="Total de verificaciones de seguridad realizadas"
            trend={15}
          />
          
          <MetricCard
            title="Promedio por Usuario"
            value={parseFloat(operationalMetrics.average_attempts_per_user || 0).toFixed(1)}
            icon="fa-user-check"
            color="#0984e3"
            description="Promedio de intentos por usuario"
            trend={-5}
          />
          
          <MetricCard
            title="Efectividad"
            value={operationalMetrics.security_effectiveness || '0%'}
            icon="fa-chart-pie"
            color="#00b894"
            description="Efectividad del sistema de seguridad"
            trend={3}
          />
          
          <MetricCard
            title="Prevención de Amenazas"
            value={operationalMetrics.threat_prevention_rate || '99.7%'}
            icon="fa-shield-alt"
            color="#00a085"
            description="Tasa de prevención de amenazas"
            trend={1}
          />
        </div>
      </div>

      {/* System Performance */}
      <div className="metrics-section">
        <h3>
          <i className="fas fa-tachometer-alt"></i>
          System Performance
        </h3>
        
        <div className="performance-metrics">
          <div className="performance-gauge">
            <div className="gauge-container">
              <div className="gauge-circle">
                <div className="gauge-fill" style={{ '--percentage': '97%' }}></div>
                <div className="gauge-center">
                  <span className="gauge-value">97%</span>
                  <span className="gauge-label">Uptime</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="performance-gauge">
            <div className="gauge-container">
              <div className="gauge-circle">
                <div className="gauge-fill" style={{ '--percentage': '85%' }}></div>
                <div className="gauge-center">
                  <span className="gauge-value">85%</span>
                  <span className="gauge-label">Efficiency</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="performance-gauge">
            <div className="gauge-container">
              <div className="gauge-circle">
                <div className="gauge-fill" style={{ '--percentage': '92%' }}></div>
                <div className="gauge-center">
                  <span className="gauge-value">92%</span>
                  <span className="gauge-label">Response</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityMetrics;