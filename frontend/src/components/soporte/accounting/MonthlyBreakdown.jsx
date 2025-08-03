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

        .months-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .month-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
          border: 1px solid #e0e0e0;
          overflow: hidden;
          transition: all 0.25s ease-out;
        }

        .month-card:hover {
          box-shadow: 0 6px 20px rgba(33, 150, 243, 0.15);
        }

        .month-card.expanded {
          box-shadow: 0 8px 24px rgba(33, 150, 243, 0.2);
        }

        .month-header {
          padding: 24px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid transparent;
          transition: border-color 0.25s ease-out;
        }

        .month-card.expanded .month-header {
          border-bottom-color: #e0e0e0;
        }

        .month-name {
          font-size: 16px;
          font-weight: 600;
          color: #424242;
          margin: 0 0 8px 0;
        }

        .month-revenue {
          font-size: 20px;
          font-weight: 700;
          color: #2196f3;
        }

        .month-indicators {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .growth-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 600;
        }

        .expand-indicator {
          color: #9e9e9e;
          transition: transform 0.25s ease-out;
        }

        .month-card.expanded .expand-indicator {
          transform: rotate(180deg);
        }

        .month-details {
          overflow: hidden;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 24px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          background: #fafafa;
        }

        .detail-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
        }

        .detail-item.completed .detail-icon { background: #4caf50; }
        .detail-item.pending .detail-icon { background: #ff9800; }
        .detail-item.total .detail-icon { background: #2196f3; }
        .detail-item.average .detail-icon { background: #9c27b0; }

        .detail-label {
          font-size: 12px;
          color: #757575;
          font-weight: 500;
        }

        .detail-value {
          font-size: 16px;
          color: #424242;
          font-weight: 600;
        }

        .comparison-section {
          padding: 16px 24px;
          background: #f5f5f5;
          border-top: 1px solid #e0e0e0;
        }

        .comparison-title {
          font-size: 13px;
          color: #757575;
          font-weight: 500;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .comparison-value {
          font-size: 14px;
          font-weight: 600;
        }

        .comparison-value.positive { color: #4caf50; }
        .comparison-value.negative { color: #f44336; }

        .visit-types-breakdown {
          padding: 16px 24px;
          border-top: 1px solid #e0e0e0;
        }

        .breakdown-title {
          font-size: 13px;
          color: #757575;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .visit-types-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .visit-type-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }

        .visit-type-name {
          font-size: 13px;
          color: #616161;
        }

        .visit-type-count {
          font-size: 13px;
          font-weight: 600;
          color: #2196f3;
        }

        .no-data {
          text-align: center;
          padding: 64px 24px;
          color: #9e9e9e;
        }

        .no-data i {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .months-grid {
            grid-template-columns: 1fr;
          }
          
          .details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MonthlyBreakdown;