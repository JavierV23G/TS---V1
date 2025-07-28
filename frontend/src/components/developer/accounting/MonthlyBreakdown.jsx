import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MONTHLY BREAKDOWN COMPONENT
 * Muestra métricas mensuales expandibles con:
 * - Grid de meses con dinero ganado
 * - Expansión al hacer clic mostrando visitas hechas, perdidas y % comparación
 */
const MonthlyBreakdown = ({ visits, onMonthSelect, selectedMonth }) => {
  const [expandedMonth, setExpandedMonth] = useState(null);

  // Obtener revenue por tipo de visita (MOVER ANTES DEL useMemo)
  const getVisitRevenue = (visitType) => {
    const revenueRates = {
      'Initial Evaluation': 130,
      'Follow Up': 110,
      'SOC OASIS': 140,
      'RA': 120,
      'DC': 100,
      'Re-evaluation': 125,
      'Discharge': 100
    };

    return revenueRates[visitType] || 110; // Default Follow Up rate
  };

  // Calcular datos por mes
  const monthlyData = useMemo(() => {
    if (!visits?.length) return [];

    // Agrupar visitas por mes
    const groupedByMonth = visits.reduce((acc, visit) => {
      const date = new Date(visit.visit_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (!acc[monthKey]) {
        acc[monthKey] = {
          key: monthKey,
          name: monthName,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          visits: [],
          completed: 0,
          pending: 0,
          revenue: 0
        };
      }

      acc[monthKey].visits.push(visit);
      
      if (visit.status === 'completed') {
        acc[monthKey].completed++;
        // Calcular revenue basado en tipo de visita
        const revenue = getVisitRevenue(visit.visit_type);
        acc[monthKey].revenue += revenue;
      } else {
        acc[monthKey].pending++;
      }

      return acc;
    }, {});

    // Convertir a array y ordenar por fecha
    const monthsArray = Object.values(groupedByMonth).sort((a, b) => {
      return new Date(a.year, a.month - 1) - new Date(b.year, b.month - 1);
    });

    // Calcular porcentaje de crecimiento comparado con mes anterior
    return monthsArray.map((month, index) => {
      const previousMonth = monthsArray[index - 1];
      let growthPercentage = 0;

      if (previousMonth && previousMonth.revenue > 0) {
        growthPercentage = ((month.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
      }

      return {
        ...month,
        growthPercentage: Math.round(growthPercentage * 10) / 10,
        totalVisits: month.completed + month.pending
      };
    });
  }, [visits, getVisitRevenue]);

  // Formatear currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };
  
  // Agrupar visitas por paciente para mostrar en el mes expandido
  const getUniquePatients = (visitsInMonth) => {
    const patientGroups = {};
    
    visitsInMonth.forEach(visit => {
      if (!patientGroups[visit.patient_id]) {
        patientGroups[visit.patient_id] = {
          patient_id: visit.patient_id,
          visits: [],
          totalEarnings: 0
        };
      }
      
      patientGroups[visit.patient_id].visits.push(visit);
      
      // Calcular ganancias solo de visitas completadas
      if (visit.status === 'completed') {
        const earnings = getVisitRevenue(visit.visit_type);
        patientGroups[visit.patient_id].totalEarnings += earnings;
      }
    });
    
    return Object.values(patientGroups).sort((a, b) => b.totalEarnings - a.totalEarnings);
  };
  
  // Obtener nombre del paciente (simulado pero más extenso)
  const getPatientName = (patientId) => {
    const patientNames = {
      101: 'Maria Rodriguez',
      102: 'Robert Johnson', 
      103: 'Eleanor Chen',
      104: 'John Smith',
      105: 'Sarah Williams',
      106: 'Michael Brown',
      107: 'Jennifer Davis',
      108: 'David Miller',
      109: 'Lisa Wilson',
      110: 'James Moore',
      111: 'Patricia Garcia',
      112: 'Christopher Martinez',
      113: 'Nancy Anderson',
      114: 'Matthew Taylor',
      115: 'Karen Thomas',
      116: 'Joshua Jackson',
      117: 'Betty White',
      118: 'Daniel Harris',
      119: 'Helen Martin',
      120: 'Mark Thompson'
    };
    
    return patientNames[patientId] || `Patient ${patientId}`;
  };
  
  // Obtener iniciales del paciente
  const getPatientInitials = (patientId) => {
    const name = getPatientName(patientId);
    return name.split(' ').map(word => word[0]).join('');
  };

  // Manejar expansión de mes
  const handleMonthClick = (month) => {
    if (expandedMonth?.key === month.key) {
      setExpandedMonth(null);
      onMonthSelect(null);
    } else {
      setExpandedMonth(month);
      onMonthSelect(month);
    }
  };

  // Obtener color basado en el crecimiento
  const getGrowthColor = (growth) => {
    if (growth > 0) return '#4caf50';
    if (growth < 0) return '#f44336'; 
    return '#9e9e9e';
  };

  // Variants para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const monthCardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 120,
        damping: 20
      }
    }
  };

  const expandedContentVariants = {
    hidden: { 
      height: 0,
      opacity: 0
    },
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

  if (!monthlyData.length) {
    return (
      <div className="monthly-breakdown">
        <div className="section-header">
          <h2>
            <i className="fas fa-calendar-alt"></i>
            Monthly Performance
          </h2>
        </div>
        <div className="no-data">
          <i className="fas fa-chart-bar"></i>
          <p>No monthly data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monthly-breakdown">
      <div className="section-header">
        <h2>
          <i className="fas fa-calendar-alt"></i>
          Monthly Performance
        </h2>
        <p className="section-subtitle">
          Click on any month to view detailed breakdown
        </p>
      </div>

      <motion.div 
        className="months-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {monthlyData.map((month) => {
          const isExpanded = expandedMonth?.key === month.key;
          
          return (
            <motion.div
              key={month.key}
              className={`month-card ${isExpanded ? 'expanded' : ''}`}
              variants={monthCardVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="month-header"
                onClick={() => handleMonthClick(month)}
              >
                <div className="month-info">
                  <h3 className="month-name">{month.name}</h3>
                  <div className="month-revenue">{formatCurrency(month.revenue)}</div>
                </div>

                <div className="month-indicators">
                  {month.growthPercentage !== 0 && (
                    <div 
                      className="growth-indicator"
                      style={{ color: getGrowthColor(month.growthPercentage) }}
                    >
                      <i className={`fas fa-arrow-${month.growthPercentage > 0 ? 'up' : 'down'}`}></i>
                      <span>{Math.abs(month.growthPercentage)}%</span>
                    </div>
                  )}
                  
                  <div className="expand-indicator">
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="month-details"
                    variants={expandedContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{ overflow: 'visible' }}
                  >
                    <div className="details-grid">
                      <div className="detail-item completed">
                        <div className="detail-icon">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Completed Visits</div>
                          <div className="detail-value">{month.completed}</div>
                        </div>
                      </div>

                      <div className="detail-item pending">
                        <div className="detail-icon">
                          <i className="fas fa-clock"></i>
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Pending Visits</div>
                          <div className="detail-value">{month.pending}</div>
                        </div>
                      </div>

                      <div className="detail-item total">
                        <div className="detail-icon">
                          <i className="fas fa-calendar-day"></i>
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Total Visits</div>
                          <div className="detail-value">{month.totalVisits}</div>
                        </div>
                      </div>

                      <div className="detail-item average">
                        <div className="detail-icon">
                          <i className="fas fa-calculator"></i>
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Avg per Visit</div>
                          <div className="detail-value">
                            {month.completed > 0 
                              ? formatCurrency(month.revenue / month.completed)
                              : '$0'
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    {month.growthPercentage !== 0 && (
                      <div className="comparison-section">
                        <div className="comparison-title">
                          <i className="fas fa-chart-line"></i>
                          Comparison with Previous Month
                        </div>
                        <div 
                          className={`comparison-value ${month.growthPercentage > 0 ? 'positive' : 'negative'}`}
                        >
                          {month.growthPercentage > 0 ? 'Increased' : 'Decreased'} by {Math.abs(month.growthPercentage)}%
                        </div>
                      </div>
                    )}

                    <div className="visit-types-breakdown">
                      <div className="breakdown-title">Visit Types Breakdown</div>
                      <div className="visit-types-list">
                        {Object.entries(
                          month.visits.reduce((acc, visit) => {
                            acc[visit.visit_type] = (acc[visit.visit_type] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([type, count]) => (
                          <div key={type} className="visit-type-item">
                            <span className="visit-type-name">{type}</span>
                            <span className="visit-type-count">{count}</span>
                          </div>
                        ))}
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
        .monthly-breakdown {
          margin: 3rem 0;
        }

        .section-header {
          margin-bottom: 3rem;
          text-align: center;
        }

        .section-header h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #18181b;
          margin: 0 0 0.75rem 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-header h2 i {
          color: #0ea5e9;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .section-subtitle {
          font-size: 1rem;
          color: #71717a;
          margin: 0;
          font-weight: 500;
        }

        .months-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 2rem;
          padding: 0 1rem;
        }

        .month-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12), 0 15px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: visible;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .month-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .month-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15), 0 20px 25px rgba(0, 0, 0, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .month-card:hover::before {
          opacity: 1;
        }

        .month-card.expanded {
          box-shadow: 0 35px 70px rgba(0, 0, 0, 0.18), 0 25px 30px rgba(0, 0, 0, 0.12);
          border-color: rgba(102, 126, 234, 0.3);
        }

        .month-card.expanded::before {
          opacity: 1;
        }

        .month-header {
          padding: 2rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid transparent;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .month-card.expanded .month-header {
          border-bottom-color: rgba(255, 255, 255, 0.1);
          padding-bottom: 2rem;
        }

        .month-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #27272a;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.025em;
        }

        .month-revenue {
          font-size: 2.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .month-indicators {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .growth-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 700;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .expand-indicator {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #71717a;
          transition: all 0.3s ease;
        }

        .month-card:hover .expand-indicator {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .month-card.expanded .expand-indicator {
          transform: rotate(180deg);
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
        }

        .month-details {
          overflow: visible;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 0 0 24px 24px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          padding: 2rem;
          width: 100%;
          box-sizing: border-box;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          min-width: 0;
          overflow: hidden;
        }

        .detail-item:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
        }

        .detail-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
        }

        .detail-item.completed .detail-icon { 
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }
        .detail-item.pending .detail-icon { 
          background: linear-gradient(135deg, #fcb045 0%, #fd1d1d 100%);
        }
        .detail-item.total .detail-icon { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .detail-item.average .detail-icon { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .detail-content {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }

        .detail-label {
          font-size: 0.8rem;
          color: #71717a;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .detail-value {
          font-size: 1.5rem;
          color: #18181b;
          font-weight: 800;
          line-height: 1;
          white-space: nowrap;
        }

        .comparison-section {
          padding: 2rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comparison-title {
          font-size: 0.9rem;
          color: #71717a;
          font-weight: 600;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .comparison-value {
          font-size: 1.25rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .comparison-value.positive { 
          color: #10b981;
        }
        .comparison-value.negative { 
          color: #ef4444;
        }

        .visit-types-breakdown {
          padding: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .breakdown-title {
          font-size: 1rem;
          color: #52525b;
          font-weight: 700;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .visit-types-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .visit-type-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .visit-type-item:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .visit-type-name {
          font-size: 0.875rem;
          color: #3f3f46;
          font-weight: 600;
          flex: 1;
          margin-right: 0.5rem;
        }

        .visit-type-count {
          font-size: 1.125rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .no-data {
          text-align: center;
          padding: 6rem 2rem;
          color: #a1a1aa;
        }

        .no-data i {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          opacity: 0.3;
        }

        @media (max-width: 768px) {
          .months-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .details-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1.5rem;
          }

          .month-header {
            padding: 1.5rem;
          }

          .month-revenue {
            font-size: 1.75rem;
          }

          .detail-value {
            font-size: 1.5rem;
          }

          .visit-types-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MonthlyBreakdown;