import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DISCIPLINE SELECTOR COMPONENT
 * Selector de disciplinas + AGENCIAS con listas de terapeutas/agencias
 * Orden: PT, OT, ST, PTA, COTA, STA, Agencias
 */
const DisciplineSelector = ({ 
  staff, 
  agencies, 
  visits, 
  selectedDiscipline, 
  onDisciplineSelect, 
  onTherapistSelect,
  onAgencySelect 
}) => {

  // Obtener revenue por tipo de visita (MOVER ANTES DEL useMemo)
  const getVisitRevenue = (visitType) => {
    const revenueRates = {
      'Initial Evaluation': 130,
      'Follow Up': 110,
      'SOC OASIS': 150,
      'RA': 120,
      'DC': 100
    };
    return revenueRates[visitType] || 110;
  };
  
  // Definir las disciplinas en el orden específico requerido
  const disciplines = [
    { key: 'PT', name: 'Physical Therapy', icon: 'fas fa-walking', color: '#2196f3' },
    { key: 'OT', name: 'Occupational Therapy', icon: 'fas fa-hand-holding', color: '#ff9800' },
    { key: 'ST', name: 'Speech Therapy', icon: 'fas fa-comments', color: '#00bcd4' },
    { key: 'PTA', name: 'Physical Therapist Assistant', icon: 'fas fa-user-md', color: '#3f51b5' },
    { key: 'COTA', name: 'Certified Occupational Therapist Assistant', icon: 'fas fa-hands-helping', color: '#ff5722' },
    { key: 'STA', name: 'Speech Therapist Assistant', icon: 'fas fa-microphone', color: '#009688' },
    { key: 'AGENCIES', name: 'Healthcare Agencies', icon: 'fas fa-building', color: '#9c27b0' }
  ];

  // Calcular estadísticas por disciplina
  const disciplineStats = useMemo(() => {
    const stats = {};
    
    disciplines.forEach(discipline => {
      if (discipline.key === 'AGENCIES') {
        // Para agencias, contar pacientes y visitas por agencia
        const agencyVisits = visits.filter(visit => {
          // Aquí necesitaríamos relacionar las visitas con las agencias
          // Por ahora simulamos datos
          return true;
        });
        
        stats[discipline.key] = {
          count: agencies?.length || 0,
          totalVisits: agencyVisits.length,
          totalRevenue: agencyVisits.length * 110, // Precio promedio
          entities: agencies || []
        };
      } else {
        // Para disciplinas médicas, filtrar staff por role
        const disciplineStaff = staff?.filter(s => s.role === discipline.key) || [];
        const disciplineVisits = visits?.filter(visit => {
          const therapist = staff?.find(s => s.id === visit.staff_id);
          return therapist?.role === discipline.key;
        }) || [];
        
        const totalRevenue = disciplineVisits.reduce((sum, visit) => {
          return sum + getVisitRevenue(visit.visit_type);
        }, 0);
        
        stats[discipline.key] = {
          count: disciplineStaff.length,
          totalVisits: disciplineVisits.length,
          totalRevenue,
          entities: disciplineStaff
        };
      }
    });
    
    return stats;
  }, [staff, agencies, visits]);

  // Formatear currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  // Manejar selección de disciplina
  const handleDisciplineClick = (discipline) => {
    if (selectedDiscipline === discipline.key) {
      onDisciplineSelect(null);
    } else {
      onDisciplineSelect(discipline.key);
    }
  };

  // Manejar selección de entidad (terapeuta o agencia)
  const handleEntityClick = (entity, disciplineKey) => {
    if (disciplineKey === 'AGENCIES') {
      onAgencySelect(entity);
    } else {
      onTherapistSelect(entity);
    }
  };

  // Obtener las visitas de una entidad específica
  const getEntityVisits = (entity, disciplineKey) => {
    if (disciplineKey === 'AGENCIES') {
      // Para agencias, buscar visitas de pacientes de esa agencia
      return visits.filter(visit => {
        // Aquí necesitaríamos la relación paciente-agencia
        // Por ahora simulamos
        return Math.random() > 0.7; // Simular algunas visitas
      });
    } else {
      // Para terapeutas, buscar visitas donde staff_id coincida
      return visits.filter(visit => visit.staff_id === entity.id);
    }
  };

  // Variants para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const disciplineCardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 120,
        damping: 15
      }
    }
  };

  const listVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: 'auto', 
      opacity: 1,
      transition: {
        height: { duration: 0.4, ease: "easeInOut" },
        opacity: { duration: 0.3, delay: 0.1 }
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2 }
      }
    }
  };

  return (
    <div className="discipline-selector">
      <div className="section-header">
        <h2>
          <i className="fas fa-user-md"></i>
          Staff & Agencies Management
        </h2>
        <p className="section-subtitle">
          Select a discipline or agency to view detailed financial information
        </p>
      </div>

      <motion.div 
        className="disciplines-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {disciplines.map((discipline) => {
          const stats = disciplineStats[discipline.key] || { count: 0, totalVisits: 0, totalRevenue: 0, entities: [] };
          const isSelected = selectedDiscipline === discipline.key;
          
          return (
            <motion.div
              key={discipline.key}
              className={`discipline-card ${isSelected ? 'selected' : ''}`}
              variants={disciplineCardVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="discipline-header"
                onClick={() => handleDisciplineClick(discipline)}
                style={{ '--discipline-color': discipline.color }}
              >
                <div className="discipline-icon">
                  <i className={discipline.icon}></i>
                </div>
                
                <div className="discipline-info">
                  <h3 className="discipline-name">{discipline.name}</h3>
                  <div className="discipline-count">
                    {stats.count} {discipline.key === 'AGENCIES' ? 'agencies' : 'therapists'}
                  </div>
                </div>

                <div className="discipline-stats">
                  <div className="stat-item">
                    <div className="stat-value">{stats.totalVisits}</div>
                    <div className="stat-label">Visits</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                    <div className="stat-label">Revenue</div>
                  </div>
                </div>

                <div className="expand-indicator">
                  <i className={`fas fa-chevron-${isSelected ? 'up' : 'down'}`}></i>
                </div>
              </div>

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    className="entities-list"
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {stats.entities.map((entity) => {
                      const entityVisits = getEntityVisits(entity, discipline.key);
                      const entityRevenue = entityVisits.reduce((sum, visit) => {
                        return sum + getVisitRevenue(visit.visit_type);
                      }, 0);
                      
                      return (
                        <motion.div
                          key={entity.id}
                          className="entity-item"
                          onClick={() => handleEntityClick(entity, discipline.key)}
                          whileHover={{ 
                            backgroundColor: '#f5f5f5',
                            transition: { duration: 0.2 }
                          }}
                        >
                          <div className="entity-avatar">
                            <div 
                              className="avatar-circle"
                              style={{ backgroundColor: discipline.color }}
                            >
                              {entity.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                          </div>
                          
                          <div className="entity-info">
                            <div className="entity-name">{entity.name}</div>
                            <div className="entity-email">{entity.email}</div>
                          </div>

                          <div className="entity-stats">
                            <div className="entity-visits">
                              <i className="fas fa-calendar-check"></i>
                              <span>{entityVisits.length} visits</span>
                            </div>
                            <div className="entity-revenue">
                              <i className="fas fa-dollar-sign"></i>
                              <span>{formatCurrency(entityRevenue)}</span>
                            </div>
                          </div>

                          <div className="entity-action">
                            <i className="fas fa-chevron-right"></i>
                          </div>
                        </motion.div>
                      );
                    })}

                    {stats.entities.length === 0 && (
                      <div className="no-entities-message">
                        <i className={`fas fa-${discipline.key === 'AGENCIES' ? 'building' : 'user-md'}`}></i>
                        <h4>No {discipline.key === 'AGENCIES' ? 'Agencies' : 'Therapists'} Available</h4>
                        <p>
                          {discipline.key === 'AGENCIES' 
                            ? 'No agencies found for this company currently.' 
                            : `No ${discipline.name.toLowerCase()} therapists available currently.`
                          }
                        </p>
                      </div>
                    )}

                    <div className="discipline-summary">
                      <div className="summary-title">
                        {discipline.name} Summary
                      </div>
                      <div className="summary-stats">
                        <div className="summary-stat">
                          <span className="summary-label">Total {discipline.key === 'AGENCIES' ? 'Agencies' : 'Therapists'}:</span>
                          <span className="summary-value">{stats.count}</span>
                        </div>
                        <div className="summary-stat">
                          <span className="summary-label">Total Visits:</span>
                          <span className="summary-value">{stats.totalVisits}</span>
                        </div>
                        <div className="summary-stat">
                          <span className="summary-label">Total Revenue:</span>
                          <span className="summary-value">{formatCurrency(stats.totalRevenue)}</span>
                        </div>
                        {stats.totalVisits > 0 && (
                          <div className="summary-stat">
                            <span className="summary-label">Average per Visit:</span>
                            <span className="summary-value">
                              {formatCurrency(stats.totalRevenue / stats.totalVisits)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      <style jsx>{`
        .discipline-selector {
          margin-bottom: 48px;
        }

        .section-header {
          margin-bottom: 32px;
        }

        .section-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #424242;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-header h2 i {
          color: #2196f3;
        }

        .section-subtitle {
          font-size: 14px;
          color: #757575;
          margin: 0;
        }

        .disciplines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .discipline-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
          border: 2px solid transparent;
          overflow: hidden;
          transition: all 0.25s ease-out;
        }

        .discipline-card:hover {
          box-shadow: 0 6px 20px rgba(33, 150, 243, 0.15);
        }

        .discipline-card.selected {
          border-color: var(--discipline-color);
          box-shadow: 0 8px 24px rgba(33, 150, 243, 0.2);
        }

        .discipline-header {
          padding: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid transparent;
          transition: border-color 0.25s ease-out;
        }

        .discipline-card.selected .discipline-header {
          border-bottom-color: #e0e0e0;
        }

        .discipline-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: var(--discipline-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          flex-shrink: 0;
        }

        .discipline-info {
          flex: 1;
        }

        .discipline-name {
          font-size: 16px;
          font-weight: 600;
          color: #424242;
          margin: 0 0 4px 0;
        }

        .discipline-count {
          font-size: 14px;
          color: #757575;
        }

        .discipline-stats {
          display: flex;
          gap: 24px;
          margin-right: 16px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: #424242;
        }

        .stat-label {
          font-size: 12px;
          color: #757575;
          margin-top: 2px;
        }

        .expand-indicator {
          color: #9e9e9e;
          transition: transform 0.25s ease-out;
          font-size: 16px;
        }

        .discipline-card.selected .expand-indicator {
          transform: rotate(180deg);
        }

        .entities-list {
          overflow: hidden;
        }

        .entity-item {
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: background-color 0.2s ease-out;
          border-bottom: 1px solid #f0f0f0;
        }

        .entity-item:last-of-type {
          border-bottom: none;
        }

        .entity-avatar {
          flex-shrink: 0;
        }

        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: 600;
        }

        .entity-info {
          flex: 1;
        }

        .entity-name {
          font-size: 14px;
          font-weight: 600;
          color: #424242;
          margin-bottom: 2px;
        }

        .entity-email {
          font-size: 12px;
          color: #757575;
        }

        .entity-stats {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .entity-visits,
        .entity-revenue {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #616161;
        }

        .entity-visits i,
        .entity-revenue i {
          color: #9e9e9e;
          width: 12px;
        }

        .entity-action {
          color: #9e9e9e;
          font-size: 14px;
        }

        .discipline-summary {
          padding: 20px 24px;
          background: #fafafa;
          border-top: 1px solid #e0e0e0;
        }

        .summary-title {
          font-size: 14px;
          font-weight: 600;
          color: #424242;
          margin-bottom: 12px;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .summary-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .summary-label {
          color: #757575;
        }

        .summary-value {
          font-weight: 600;
          color: #424242;
        }

        .no-entities-message {
          text-align: center;
          padding: 40px 20px;
          color: #9e9e9e;
          border: 2px dashed #e0e0e0;
          border-radius: 12px;
          margin: 16px 24px;
          background: #fafafa;
        }

        .no-entities-message i {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.6;
          color: #bdbdbd;
        }

        .no-entities-message h4 {
          font-size: 16px;
          font-weight: 600;
          color: #757575;
          margin: 0 0 8px 0;
        }

        .no-entities-message p {
          font-size: 14px;
          color: #9e9e9e;
          margin: 0;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .disciplines-grid {
            grid-template-columns: 1fr;
          }

          .discipline-stats {
            flex-direction: column;
            gap: 8px;
            margin-right: 8px;
          }

          .entity-stats {
            flex-direction: column;
            gap: 4px;
            align-items: flex-end;
          }

          .summary-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DisciplineSelector;