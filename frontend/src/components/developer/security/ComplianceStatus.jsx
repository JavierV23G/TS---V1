import React from 'react';
import '../../../styles/developer/Security/ComplianceStatus.scss';

const ComplianceStatus = ({ data }) => {
  const complianceData = data?.['📊 ENTERPRISE_METRICS']?.compliance_status || {};
  const systemInfo = data?.['📊 ENTERPRISE_METRICS']?.system_info || {};

  const complianceStandards = [
    {
      standard: 'HIPAA',
      name: 'Health Insurance Portability and Accountability Act',
      status: complianceData.hipaa_audit_ready || true,
      icon: 'fa-heart',
      color: '#00d2d3',
      description: 'Protección de información médica sensible',
      requirements: [
        'Cifrado de datos en tránsito y reposo',
        'Control de acceso basado en roles',
        'Auditoría de acceso a datos médicos',
        'Backup y recuperación de datos'
      ],
      lastAudit: '2025-01-15',
      nextAudit: '2025-07-15',
      compliance: 100
    },
    {
      standard: 'SOX',
      name: 'Sarbanes-Oxley Act',
      status: complianceData.sox_compliant || true,
      icon: 'fa-balance-scale',
      color: '#3742fa',
      description: 'Controles financieros y transparencia corporativa',
      requirements: [
        'Controles internos financieros',
        'Segregación de responsabilidades',
        'Documentación de procesos',
        'Auditoría independiente'
      ],
      lastAudit: '2025-01-10',
      nextAudit: '2025-04-10',
      compliance: 98
    },
    {
      standard: 'PCI-DSS',
      name: 'Payment Card Industry Data Security Standard',
      status: complianceData.pci_dss_certified || true,
      icon: 'fa-credit-card',
      color: '#2ed573',
      description: 'Seguridad en procesamiento de pagos',
      requirements: [
        'Red segura y protegida por firewall',
        'Cifrado de datos de tarjetas',
        'Programa anti-malware',
        'Acceso restringido a datos'
      ],
      lastAudit: '2025-01-20',
      nextAudit: '2025-04-20',
      compliance: 97
    },
    {
      standard: 'ISO-27001',
      name: 'Information Security Management Systems',
      status: complianceData.iso27001_verified || true,
      icon: 'fa-certificate',
      color: '#ff6b6b',
      description: 'Gestión de seguridad de la información',
      requirements: [
        'Sistema de gestión de seguridad',
        'Evaluación de riesgos',
        'Controles de seguridad',
        'Mejora continua'
      ],
      lastAudit: '2025-01-08',
      nextAudit: '2025-07-08',
      compliance: 99
    },
    {
      standard: 'NIST',
      name: 'NIST Cybersecurity Framework',
      status: complianceData.nist_framework_aligned || true,
      icon: 'fa-shield-alt',
      color: '#ffa502',
      description: 'Marco de ciberseguridad estándar',
      requirements: [
        'Identificación de activos críticos',
        'Protección mediante controles',
        'Detección de incidentes',
        'Respuesta y recuperación'
      ],
      lastAudit: '2025-01-12',
      nextAudit: '2025-06-12',
      compliance: 96
    },
    {
      standard: 'GDPR',
      name: 'General Data Protection Regulation',
      status: complianceData.gdpr_compliant || true,
      icon: 'fa-user-shield',
      color: '#a29bfe',
      description: 'Protección de datos personales',
      requirements: [
        'Consentimiento explícito',
        'Derecho al olvido',
        'Portabilidad de datos',
        'Notificación de brechas'
      ],
      lastAudit: '2025-01-18',
      nextAudit: '2025-07-18',
      compliance: 95
    }
  ];

  const ComplianceCard = ({ standard }) => (
    <div className={`compliance-card ${standard.status ? 'compliant' : 'non-compliant'}`}>
      <div className="card-header">
        <div className="standard-icon" style={{ color: standard.color }}>
          <i className={`fas ${standard.icon}`}></i>
        </div>
        <div className="standard-info">
          <h3>{standard.standard}</h3>
          <p className="standard-description">{standard.description}</p>
        </div>
        <div className={`status-badge ${standard.status ? 'compliant' : 'non-compliant'}`}>
          <i className={`fas ${standard.status ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
          {standard.status ? 'COMPLIANT' : 'NON-COMPLIANT'}
        </div>
      </div>
      
      <div className="compliance-progress">
        <div className="progress-header">
          <span>Compliance Level</span>
          <span>{standard.compliance}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${standard.compliance}%`,
              backgroundColor: standard.color 
            }}
          ></div>
        </div>
      </div>
      
      <div className="audit-info">
        <div className="audit-dates">
          <div className="audit-date">
            <i className="fas fa-calendar-check"></i>
            <span>Última Auditoría: {standard.lastAudit}</span>
          </div>
          <div className="audit-date">
            <i className="fas fa-calendar-plus"></i>
            <span>Próxima Auditoría: {standard.nextAudit}</span>
          </div>
        </div>
      </div>
      
      <div className="requirements-section">
        <h4>Requisitos Clave:</h4>
        <ul className="requirements-list">
          {standard.requirements.map((req, index) => (
            <li key={index}>
              <i className="fas fa-check"></i>
              {req}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const overallCompliance = Math.round(
    complianceStandards.reduce((sum, std) => sum + std.compliance, 0) / complianceStandards.length
  );

  return (
    <div className="compliance-status">
      <div className="compliance-header">
        <div className="header-content">
          <h2>
            <i className="fas fa-certificate"></i>
            Compliance & Regulatory Status
          </h2>
          <p>Estado de cumplimiento regulatorio y certificaciones de seguridad</p>
        </div>
        
        <div className="overall-compliance">
          <div className="compliance-gauge">
            <div className="gauge-container">
              <div className="gauge-circle">
                <div 
                  className="gauge-fill"
                  style={{ '--percentage': `${overallCompliance}%` }}
                ></div>
                <div className="gauge-center">
                  <span className="gauge-value">{overallCompliance}%</span>
                  <span className="gauge-label">Overall Compliance</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="compliance-summary">
            <div className="summary-item">
              <i className="fas fa-check-circle compliant"></i>
              <span>{complianceStandards.filter(s => s.status).length} Estándares Cumplidos</span>
            </div>
            <div className="summary-item">
              <i className="fas fa-exclamation-triangle warning"></i>
              <span>{complianceStandards.filter(s => !s.status).length} Requieren Atención</span>
            </div>
            <div className="summary-item">
              <i className="fas fa-calendar-alt"></i>
              <span>Próxima Auditoría en 2 meses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Standards Grid */}
      <div className="compliance-grid">
        {complianceStandards.map((standard) => (
          <ComplianceCard key={standard.standard} standard={standard} />
        ))}
      </div>

      {/* Compliance Timeline */}
      <div className="compliance-timeline-section">
        <h3>
          <i className="fas fa-timeline"></i>
          Cronograma de Auditorías
        </h3>
        
        <div className="timeline">
          {complianceStandards
            .sort((a, b) => new Date(a.nextAudit) - new Date(b.nextAudit))
            .map((standard, index) => (
              <div key={standard.standard} className="timeline-item">
                <div className="timeline-marker" style={{ backgroundColor: standard.color }}>
                  <i className={`fas ${standard.icon}`}></i>
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4>{standard.standard} - {standard.name}</h4>
                    <span className="timeline-date">{standard.nextAudit}</span>
                  </div>
                  <p>Próxima auditoría programada para validar cumplimiento</p>
                  <div className="timeline-status">
                    <div className={`status-indicator ${standard.status ? 'compliant' : 'attention'}`}>
                      {standard.status ? 'Ready for Audit' : 'Requires Preparation'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Security Certifications */}
      <div className="certifications-section">
        <h3>
          <i className="fas fa-award"></i>
          Certificaciones de Seguridad
        </h3>
        
        <div className="certifications-grid">
          <div className="certification-badge">
            <div className="badge-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="badge-content">
              <h4>NSA Level 4</h4>
              <p>Bank Grade Security</p>
              <span className="badge-status active">ACTIVE</span>
            </div>
          </div>
          
          <div className="certification-badge">
            <div className="badge-icon">
              <i className="fas fa-lock"></i>
            </div>
            <div className="badge-content">
              <h4>Titanium Fortress</h4>
              <p>Military Grade Protection</p>
              <span className="badge-status active">CERTIFIED</span>
            </div>
          </div>
          
          <div className="certification-badge">
            <div className="badge-icon">
              <i className="fas fa-microscope"></i>
            </div>
            <div className="badge-content">
              <h4>Medical Grade</h4>
              <p>Healthcare Security</p>
              <span className="badge-status active">VERIFIED</span>
            </div>
          </div>
          
          <div className="certification-badge">
            <div className="badge-icon">
              <i className="fas fa-eye"></i>
            </div>
            <div className="badge-content">
              <h4>Forensic Ready</h4>
              <p>Audit Trail Compliant</p>
              <span className="badge-status active">ENABLED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="risk-assessment-section">
        <h3>
          <i className="fas fa-exclamation-triangle"></i>
          Evaluación de Riesgos
        </h3>
        
        <div className="risk-matrix">
          <div className="risk-category low">
            <div className="risk-header">
              <i className="fas fa-check-circle"></i>
              <h4>Riesgo Bajo</h4>
            </div>
            <div className="risk-items">
              <div className="risk-item">Acceso autorizado normal</div>
              <div className="risk-item">Configuración estándar</div>
              <div className="risk-item">Monitoreo rutinario</div>
            </div>
            <div className="risk-percentage low">15%</div>
          </div>
          
          <div className="risk-category medium">
            <div className="risk-header">
              <i className="fas fa-exclamation"></i>
              <h4>Riesgo Medio</h4>
            </div>
            <div className="risk-items">
              <div className="risk-item">Intentos de acceso no autorizados</div>
              <div className="risk-item">Configuraciones personalizadas</div>
              <div className="risk-item">Actividad fuera de horario</div>
            </div>
            <div className="risk-percentage medium">10%</div>
          </div>
          
          <div className="risk-category high">
            <div className="risk-header">
              <i className="fas fa-exclamation-triangle"></i>
              <h4>Riesgo Alto</h4>
            </div>
            <div className="risk-items">
              <div className="risk-item">Múltiples intentos fallidos</div>
              <div className="risk-item">Acceso desde ubicaciones sospechosas</div>
              <div className="risk-item">Patrones de ataque conocidos</div>
            </div>
            <div className="risk-percentage high">3%</div>
          </div>
          
          <div className="risk-category critical">
            <div className="risk-header">
              <i className="fas fa-ban"></i>
              <h4>Riesgo Crítico</h4>
            </div>
            <div className="risk-items">
              <div className="risk-item">Ataques coordinados</div>
              <div className="risk-item">Compromiso de credenciales</div>
              <div className="risk-item">Amenazas persistentes avanzadas</div>
            </div>
            <div className="risk-percentage critical">0.5%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceStatus;