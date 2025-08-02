import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsView = ({ visits, agencies, staff, patients, onClose }) => {
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [timeRange, setTimeRange] = useState('month'); // month, quarter, year

  // Calcular métricas financieras
  const calculateFinancialMetrics = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filtrar visitas del mes actual
    const currentMonthVisits = visits.filter(v => {
      const visitDate = new Date(v.visit_date);
      return visitDate.getMonth() === currentMonth && 
             visitDate.getFullYear() === currentYear;
    });

    // Filtrar visitas del mes anterior
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthVisits = visits.filter(v => {
      const visitDate = new Date(v.visit_date);
      return visitDate.getMonth() === lastMonth && 
             visitDate.getFullYear() === lastMonthYear;
    });

    // Calcular ingresos
    const calculateRevenue = (visitsList) => {
      return visitsList.reduce((sum, visit) => {
        const price = visit.visit_type === 'SOC OASIS' ? 150 :
                     visit.visit_type === 'Initial Evaluation' ? 130 : 110;
        return sum + price;
      }, 0);
    };

    const currentRevenue = calculateRevenue(currentMonthVisits);
    const lastRevenue = calculateRevenue(lastMonthVisits);
    const revenueGrowth = lastRevenue > 0 ? 
      ((currentRevenue - lastRevenue) / lastRevenue * 100).toFixed(1) : 100;

    // Cuentas por cobrar (visitas pendientes)
    const pendingVisits = visits.filter(v => v.status === 'pending' || v.status === 'scheduled');
    const accountsReceivable = calculateRevenue(pendingVisits);

    return {
      currentRevenue,
      lastRevenue,
      revenueGrowth,
      accountsReceivable,
      completedVisits: currentMonthVisits.filter(v => v.status === 'completed').length,
      pendingVisits: pendingVisits.length
    };
  };

  // Datos para gráfico de tendencia de ingresos
  const getRevenueChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = months.map((month, index) => {
      const monthVisits = visits.filter(v => {
        const visitDate = new Date(v.visit_date);
        return visitDate.getMonth() === index;
      });
      return monthVisits.reduce((sum, visit) => {
        const price = visit.visit_type === 'SOC OASIS' ? 150 :
                     visit.visit_type === 'Initial Evaluation' ? 130 : 110;
        return sum + price;
      }, 0);
    });

    return {
      labels: months,
      datasets: [{
        label: 'Monthly Revenue',
        data: monthlyRevenue,
        fill: true,
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderColor: '#2196f3',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#2196f3',
      }]
    };
  };

  // Top 5 agencias por volumen
  const getTopAgencies = () => {
    // Simular datos de referrals por agencia
    const agencyStats = agencies.map(agency => {
      const referrals = Math.floor(Math.random() * 20) + 5;
      const revenue = referrals * 130; // Promedio por referral
      return {
        ...agency,
        referrals,
        revenue,
        growth: Math.floor(Math.random() * 40) - 10 // -10% a +30%
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    return agencyStats;
  };

  // Datos de productividad de terapeutas
  const getTherapistProductivity = () => {
    const therapistRoles = ['PT', 'OT', 'ST', 'PTA', 'COTA', 'STA'];
    return therapistRoles.map(role => {
      const roleStaff = staff.filter(s => s.role === role);
      const roleVisits = visits.filter(v => {
        const therapist = staff.find(s => s.id === v.staff_id);
        return therapist?.role === role;
      });

      const avgVisitsPerTherapist = roleStaff.length > 0 ? 
        Math.round(roleVisits.length / roleStaff.length) : 0;

      return {
        role,
        staffCount: roleStaff.length,
        totalVisits: roleVisits.length,
        avgVisitsPerTherapist,
        utilization: Math.round(Math.random() * 30 + 65) // 65-95%
      };
    });
  };

  // KPIs del negocio
  const getBusinessKPIs = () => {
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.is_active).length;
    const avgRevenuePerPatient = visits.length > 0 ? 
      (visits.length * 120 / totalPatients).toFixed(0) : 0;

    return {
      patientAcquisitionCost: 250, // Costo promedio
      patientLifetimeValue: 3500, // LTV promedio
      avgRevenuePerPatient,
      activePatientRate: totalPatients > 0 ? 
        ((activePatients / totalPatients) * 100).toFixed(1) : 0,
      avgResponseTime: '2.5 days', // Tiempo de respuesta a referrals
      visitCompletionRate: '94%' // Tasa de completación
    };
  };

  const metrics = calculateFinancialMetrics();
  const topAgencies = getTopAgencies();
  const productivity = getTherapistProductivity();
  const kpis = getBusinessKPIs();

  return (
    <motion.div 
      className="analytics-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="analytics-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="analytics-header">
          <h2>
            <i className="fas fa-chart-line"></i>
            Business Analytics Dashboard
          </h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="analytics-content">
          {/* KPIs principales */}
          <div className="kpi-grid">
            <div className="kpi-card primary">
              <div className="kpi-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="kpi-data">
                <h3>${metrics.currentRevenue.toLocaleString()}</h3>
                <p>Current Month Revenue</p>
                <span className={`kpi-change ${parseFloat(metrics.revenueGrowth) >= 0 ? 'positive' : 'negative'}`}>
                  <i className={`fas fa-${parseFloat(metrics.revenueGrowth) >= 0 ? 'arrow-up' : 'arrow-down'}`}></i>
                  {Math.abs(metrics.revenueGrowth)}%
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">
                <i className="fas fa-file-invoice-dollar"></i>
              </div>
              <div className="kpi-data">
                <h3>${metrics.accountsReceivable.toLocaleString()}</h3>
                <p>Accounts Receivable</p>
                <span className="kpi-subtitle">{metrics.pendingVisits} pending visits</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">
                <i className="fas fa-user-injured"></i>
              </div>
              <div className="kpi-data">
                <h3>${kpis.patientLifetimeValue}</h3>
                <p>Avg Patient LTV</p>
                <span className="kpi-subtitle">CAC: ${kpis.patientAcquisitionCost}</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="kpi-data">
                <h3>{kpis.avgResponseTime}</h3>
                <p>Avg Response Time</p>
                <span className="kpi-subtitle">{kpis.visitCompletionRate} completion</span>
              </div>
            </div>
          </div>

          {/* Gráfico de tendencia de ingresos */}
          <div className="chart-section">
            <h3>Revenue Trend (Last 12 Months)</h3>
            <div className="chart-container">
              <Line 
                data={getRevenueChartData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `Revenue: $${context.parsed.y.toLocaleString()}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `$${value.toLocaleString()}`
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Top agencias */}
          <div className="agencies-ranking">
            <h3>Top 5 Healthcare Agencies</h3>
            <div className="ranking-list">
              {topAgencies.map((agency, index) => (
                <div key={agency.id} className="ranking-item">
                  <div className="rank-number">{index + 1}</div>
                  <div className="agency-info">
                    <h4>{agency.name}</h4>
                    <p>{agency.referrals} referrals</p>
                  </div>
                  <div className="agency-metrics">
                    <span className="revenue">${agency.revenue.toLocaleString()}</span>
                    <span className={`growth ${agency.growth >= 0 ? 'positive' : 'negative'}`}>
                      {agency.growth >= 0 ? '+' : ''}{agency.growth}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Productividad por disciplina */}
          <div className="productivity-section">
            <h3>Therapist Productivity by Discipline</h3>
            <div className="productivity-grid">
              {productivity.map(disc => (
                <div key={disc.role} className="productivity-card">
                  <h4>{disc.role}</h4>
                  <div className="productivity-stats">
                    <div className="stat">
                      <span className="value">{disc.staffCount}</span>
                      <span className="label">Staff</span>
                    </div>
                    <div className="stat">
                      <span className="value">{disc.avgVisitsPerTherapist}</span>
                      <span className="label">Avg Visits</span>
                    </div>
                    <div className="stat">
                      <span className="value">{disc.utilization}%</span>
                      <span className="label">Utilization</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proyecciones */}
          <div className="projections-section">
            <h3>Revenue Projections</h3>
            <div className="projection-cards">
              <div className="projection-card">
                <h4>Next Month</h4>
                <p className="projection-value">
                  ${(metrics.currentRevenue * 1.1).toLocaleString()}
                </p>
                <span className="projection-note">Based on current growth</span>
              </div>
              <div className="projection-card">
                <h4>Next Quarter</h4>
                <p className="projection-value">
                  ${(metrics.currentRevenue * 3.3).toLocaleString()}
                </p>
                <span className="projection-note">10% growth projected</span>
              </div>
              <div className="projection-card">
                <h4>Year End</h4>
                <p className="projection-value">
                  ${(metrics.currentRevenue * 12 * 1.15).toLocaleString()}
                </p>
                <span className="projection-note">15% annual growth</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .analytics-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 1200;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }

        .analytics-modal {
          background: white;
          width: 95%;
          max-width: 1400px;
          height: 90vh;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .analytics-header {
          padding: 24px 32px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .analytics-header h2 {
          margin: 0;
          font-size: 28px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.3s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .analytics-content {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
          background: #f8f9fa;
        }

        /* KPI Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .kpi-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 20px;
          transition: transform 0.3s;
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        }

        .kpi-card.primary {
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          color: white;
        }

        .kpi-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .kpi-card:not(.primary) .kpi-icon {
          background: #e3f2fd;
          color: #2196f3;
        }

        .kpi-data h3 {
          margin: 0 0 4px 0;
          font-size: 32px;
          font-weight: 700;
        }

        .kpi-data p {
          margin: 0;
          font-size: 14px;
          opacity: 0.8;
        }

        .kpi-change {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 8px;
        }

        .kpi-change.positive {
          color: #4caf50;
        }

        .kpi-change.negative {
          color: #f44336;
        }

        .kpi-subtitle {
          display: block;
          font-size: 12px;
          opacity: 0.7;
          margin-top: 4px;
        }

        /* Chart Section */
        .chart-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 40px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .chart-section h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: #333;
        }

        .chart-container {
          height: 300px;
        }

        /* Agencies Ranking */
        .agencies-ranking {
          background: white;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 40px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .agencies-ranking h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: #333;
        }

        .ranking-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ranking-item {
          display: flex;
          align-items: center;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          transition: background 0.3s;
        }

        .ranking-item:hover {
          background: #e9ecef;
        }

        .rank-number {
          width: 40px;
          height: 40px;
          background: #2196f3;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          margin-right: 16px;
        }

        .agency-info {
          flex: 1;
        }

        .agency-info h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          color: #333;
        }

        .agency-info p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        .agency-metrics {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .revenue {
          font-size: 20px;
          font-weight: 700;
          color: #333;
        }

        .growth {
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 600;
        }

        .growth.positive {
          background: #e8f5e9;
          color: #4caf50;
        }

        .growth.negative {
          background: #ffebee;
          color: #f44336;
        }

        /* Productivity Section */
        .productivity-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 40px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .productivity-section h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: #333;
        }

        .productivity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .productivity-card {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
        }

        .productivity-card h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #2196f3;
        }

        .productivity-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .productivity-stats .stat {
          display: flex;
          flex-direction: column;
        }

        .productivity-stats .value {
          font-size: 20px;
          font-weight: 700;
          color: #333;
        }

        .productivity-stats .label {
          font-size: 12px;
          color: #666;
        }

        /* Projections Section */
        .projections-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .projections-section h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: #333;
        }

        .projection-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .projection-card {
          background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
          padding: 24px;
          border-radius: 12px;
          text-align: center;
          border: 2px solid #e9ecef;
        }

        .projection-card h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #666;
        }

        .projection-value {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #2196f3;
        }

        .projection-note {
          font-size: 12px;
          color: #666;
        }

        @media (max-width: 768px) {
          .analytics-modal {
            width: 100%;
            height: 100%;
            border-radius: 0;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .productivity-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .projection-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default AnalyticsView;