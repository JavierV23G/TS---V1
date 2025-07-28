import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * CLINICAL METRICS COMPONENT
 * Muestra las 4 métricas principales del sistema financiero:
 * - Total Facturado (suma de visitas completadas) 
 * - Pagos Pendientes (dinero que debemos a terapeutas)
 * - Pagos Completados (dinero ya pagado a terapeutas)
 * - Ganancias (diferencia entre lo que cobran agencias y lo que pagamos)
 */
const ClinicalMetrics = ({ metrics, isLoading, showProfits = true, isTherapistView = false }) => {
  const [animatedValues, setAnimatedValues] = useState({
    totalBilled: 0,
    pendingPayments: 0,
    completedPayments: 0,
    profits: 0
  });

  // Animar números cuando cambien las métricas
  useEffect(() => {
    if (metrics && !isLoading) {
      const duration = 1500;
      const steps = 60;
      const stepTime = duration / steps;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        
        // Función de easing suave
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        setAnimatedValues({
          totalBilled: Math.round(easedProgress * metrics.totalBilled * 100) / 100,
          pendingPayments: Math.round(easedProgress * metrics.pendingPayments * 100) / 100,
          completedPayments: Math.round(easedProgress * metrics.completedPayments * 100) / 100,
          profits: Math.round(easedProgress * metrics.profits * 100) / 100
        });

        if (step >= steps) {
          clearInterval(interval);
        }
      }, stepTime);

      return () => clearInterval(interval);
    }
  }, [metrics, isLoading]);

  // Formatear currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  // Calcular tendencias (simulado por ahora)
  const calculateTrend = (current, type) => {
    // Simulamos tendencias basadas en el tipo de métrica
    const trends = {
      totalBilled: { value: 8.5, direction: 'positive' },
      pendingPayments: { value: -2.3, direction: 'negative' },
      completedPayments: { value: 12.1, direction: 'positive' },
      profits: { value: 15.7, direction: 'positive' }
    };
    
    return trends[type] || { value: 0, direction: 'neutral' };
  };

  // Obtener icono por tipo de métrica
  const getMetricIcon = (type) => {
    const icons = {
      totalBilled: 'fas fa-file-invoice-dollar',
      pendingPayments: 'fas fa-clock',
      completedPayments: 'fas fa-check-circle',
      profits: 'fas fa-chart-line'
    };
    return icons[type];
  };

  // Payment metrics data
  const metricsData = [
    {
      key: 'totalBilled',
      title: isTherapistView ? 'Total Earned' : 'Total Billed',
      value: animatedValues.totalBilled,
      description: isTherapistView ? 'All-time earnings from visits' : 'Revenue from completed visits',
      className: 'total-billed'
    },
    {
      key: 'pendingPayments', 
      title: 'Pending Payments',
      value: animatedValues.pendingPayments,
      description: isTherapistView ? 'Earnings from scheduled visits' : 'Money owed to therapists',
      className: 'pending-payments'
    },
    {
      key: 'completedPayments',
      title: isTherapistView ? 'Completed Payments' : 'Completed Payments', 
      value: animatedValues.completedPayments,
      description: isTherapistView ? 'Earnings this month' : 'Money already paid to therapists',
      className: 'completed-payments'
    },
    ...(showProfits ? [{
      key: 'profits',
      title: 'Profits',
      value: animatedValues.profits,
      description: 'Difference between revenue and payments',
      className: 'profits'
    }] : [])
  ];

  // Variants para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (isLoading || !metrics) {
    const loadingCount = showProfits ? 4 : 3;
    return (
      <div className="clinical-metrics">
        {Array.from({length: loadingCount}, (_, i) => i + 1).map(i => (
          <div key={i} className="metric-card loading">
            <div className="metric-header">
              <div className="metric-icon loading-placeholder"></div>
              <div className="metric-info">
                <div className="metric-title loading-placeholder"></div>
                <div className="metric-value loading-placeholder"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      className="clinical-metrics"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {metricsData.map((metric) => {
        const trend = calculateTrend(metric.value, metric.key);
        
        return (
          <motion.div 
            key={metric.key}
            className={`metric-card ${metric.className}`}
            variants={cardVariants}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <div className="metric-header">
              <div className={`metric-icon ${metric.className}`}>
                <i className={getMetricIcon(metric.key)}></i>
              </div>
              
              <div className="metric-info">
                <h3 className="metric-title">{metric.title}</h3>
                <motion.div 
                  className="metric-value"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 200,
                    delay: 0.5
                  }}
                >
                  {formatCurrency(metric.value)}
                </motion.div>
              </div>
            </div>

            <div className="metric-details">
              <span className="metric-description">{metric.description}</span>
              
              <div className={`metric-trend ${trend.direction}`}>
                <i className={`fas fa-arrow-${
                  trend.direction === 'positive' ? 'up' : 
                  trend.direction === 'negative' ? 'down' : 'right'
                }`}></i>
                <span>{Math.abs(trend.value)}%</span>
                <span className="trend-label">vs last period</span>
              </div>
            </div>

            {/* Additional metric-specific information */}
            {metric.key === 'totalBilled' && metrics.completedVisitsCount && (
              <div className="metric-extra">
                <i className="fas fa-calendar-check"></i>
                <span>{metrics.completedVisitsCount} completed visits</span>
              </div>
            )}

            {metric.key === 'pendingPayments' && metrics.pendingVisitsCount && (
              <div className="metric-extra">
                <i className="fas fa-clock"></i>
                <span>{metrics.pendingVisitsCount} pending visits</span>
              </div>
            )}

            {metric.key === 'profits' && (
              <div className="metric-extra">
                <i className="fas fa-percentage"></i>
                <span>
                  {metrics.totalBilled > 0 
                    ? Math.round((metric.value / metrics.totalBilled) * 100)
                    : 0
                  }% profit margin
                </span>
              </div>
            )}
          </motion.div>
        );
      })}

      <style jsx>{`
        .metric-card.loading {
          pointer-events: none;
        }

        .loading-placeholder {
          background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
          background-size: 200% 100%;
          animation: loading-shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .metric-icon.loading-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 12px;
        }

        .metric-title.loading-placeholder {
          width: 120px;
          height: 14px;
          margin-bottom: 8px;
        }

        .metric-value.loading-placeholder {
          width: 100px;
          height: 24px;
        }

        .metric-extra {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #757575;
        }

        .metric-extra i {
          color: #9e9e9e;
        }

        @keyframes loading-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </motion.div>
  );
};

export default ClinicalMetrics;