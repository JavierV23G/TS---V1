import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TherapistModal = ({ therapist, visits, patients, onClose, onPatientClick }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingPrices, setEditingPrices] = useState(false);
  const [customPrices, setCustomPrices] = useState({});

  const defaultVisitTypes = {
    'Initial Evaluation': { agency_pays: 130, therapist_receives: 110 },
    'Follow Up': { agency_pays: 110, therapist_receives: 55 },
    'SOC OASIS': { agency_pays: 140, therapist_receives: 120 },
    'RA': { agency_pays: 120, therapist_receives: 100 },
    'DC': { agency_pays: 100, therapist_receives: 80 },
    'Re-evaluation': { agency_pays: 125, therapist_receives: 105 },
    'Discharge': { agency_pays: 100, therapist_receives: 85 },
    'Progress Review': { agency_pays: 90, therapist_receives: 70 }
  };

  React.useEffect(() => {
    if (!Object.keys(customPrices).length) {
      setCustomPrices(defaultVisitTypes);
    }
  }, []);

  const therapistVisits = useMemo(() => {
    return visits.filter(visit => visit.staff_id === therapist.id);
  }, [visits, therapist.id]);

  const therapistStats = useMemo(() => {
    const completedVisits = therapistVisits.filter(v => v.status === 'completed');
    const pendingVisits = therapistVisits.filter(v => v.status === 'pending' || v.status === 'scheduled');
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthVisits = completedVisits.filter(visit => {
      const visitDate = new Date(visit.visit_date);
      return visitDate.getMonth() === currentMonth && visitDate.getFullYear() === currentYear;
    });

    const totalToPay = completedVisits.reduce((sum, visit) => {
      const pricing = customPrices[visit.visit_type] || defaultVisitTypes[visit.visit_type] || defaultVisitTypes['Follow Up'];
      return sum + pricing.therapist_receives;
    }, 0);

    const totalPending = pendingVisits.reduce((sum, visit) => {
      const pricing = customPrices[visit.visit_type] || defaultVisitTypes[visit.visit_type] || defaultVisitTypes['Follow Up'];
      return sum + pricing.therapist_receives;
    }, 0);

    const visitsByPatient = therapistVisits.reduce((acc, visit) => {
      const patient = patients.find(p => p.id === visit.patient_id);
      if (!patient) return acc;

      if (!acc[patient.id]) {
        acc[patient.id] = {
          patient,
          visits: [],
          completedVisits: 0,
          pendingVisits: 0,
          totalEarnings: 0
        };
      }

      acc[patient.id].visits.push(visit);
      
      if (visit.status === 'completed') {
        acc[patient.id].completedVisits++;
        const pricing = customPrices[visit.visit_type] || defaultVisitTypes[visit.visit_type] || defaultVisitTypes['Follow Up'];
        acc[patient.id].totalEarnings += pricing.therapist_receives;
      } else {
        acc[patient.id].pendingVisits++;
      }

      return acc;
    }, {});

    const currentMonthPatients = new Set(
      currentMonthVisits.map(visit => visit.patient_id)
    ).size;

    return {
      totalToPay,
      totalPending,
      totalVisits: completedVisits.length,
      pendingVisits: pendingVisits.length,
      currentMonthPatients,
      visitsByPatient: Object.values(visitsByPatient),
      currentMonthVisits: currentMonthVisits.length
    };
  }, [therapistVisits, patients, customPrices]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const handlePriceChange = (visitType, field, value) => {
    setCustomPrices(prev => ({
      ...prev,
      [visitType]: {
        ...prev[visitType],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleSavePrices = () => {
    console.log('Saving custom prices for therapist:', therapist.id, customPrices);
    setEditingPrices(false);
  };

  const getPaymentStatusColor = (isCompleted) => {
    return isCompleted ? '#4caf50' : '#ff9800';
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-chart-pie' },
    { id: 'patients', label: 'Patients', icon: 'fas fa-users' },
    { id: 'pricing', label: 'Pricing', icon: 'fas fa-dollar-sign' }
  ];

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="therapist-modal"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="therapist-info">
            <div className="therapist-avatar">
              <div className="avatar-circle">
                {therapist.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
            </div>
            <div className="therapist-details">
              <h2 className="therapist-name">{therapist.name}</h2>
              <div className="therapist-role">{therapist.role} - {therapist.email}</div>
            </div>
          </div>
          
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="modal-content">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                className="tab-content overview-tab"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="overview-grid">
                  <div className="overview-card total-pay">
                    <div className="card-icon">
                      <i className="fas fa-money-bill-wave"></i>
                    </div>
                    <div className="card-content">
                      <div className="card-title">Total to Pay</div>
                      <div className="card-value">{formatCurrency(therapistStats.totalToPay)}</div>
                      <div className="card-subtitle">For completed visits</div>
                    </div>
                  </div>

                  <div className="overview-card pending-pay">
                    <div className="card-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="card-content">
                      <div className="card-title">Pending Payment</div>
                      <div className="card-value">{formatCurrency(therapistStats.totalPending)}</div>
                      <div className="card-subtitle">{therapistStats.pendingVisits} pending visits</div>
                    </div>
                  </div>

                  <div className="overview-card total-visits">
                    <div className="card-icon">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <div className="card-content">
                      <div className="card-title">Total Visits</div>
                      <div className="card-value">{therapistStats.totalVisits}</div>
                      <div className="card-subtitle">Completed this period</div>
                    </div>
                  </div>

                  <div className="overview-card current-patients">
                    <div className="card-icon">
                      <i className="fas fa-user-injured"></i>
                    </div>
                    <div className="card-content">
                      <div className="card-title">Current Month Patients</div>
                      <div className="card-value">{therapistStats.currentMonthPatients}</div>
                      <div className="card-subtitle">{therapistStats.currentMonthVisits} visits this month</div>
                    </div>
                  </div>
                </div>

                <div className="verification-section">
                  <h3>Payment Verification</h3>
                  <div className="verification-options">
                    <button className="verify-btn completed">
                      <i className="fas fa-check-circle"></i>
                      <span>Mark as Paid</span>
                    </button>
                    <button className="verify-btn pending">
                      <i className="fas fa-clock"></i>
                      <span>Mark as Pending</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'patients' && (
              <motion.div
                key="patients"
                className="tab-content patients-tab"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="patients-header">
                  <h3>Patient List ({therapistStats.visitsByPatient.length} patients)</h3>
                </div>

                <div className="patients-list">
                  {therapistStats.visitsByPatient.map((patientData) => (
                    <div key={patientData.patient.id} className="patient-item">
                      <div className="patient-info">
                        <div className="patient-avatar">
                          <div className="avatar-circle patient">
                            {patientData.patient.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                        </div>
                        <div className="patient-details">
                          <div className="patient-name">{patientData.patient.full_name}</div>
                          <div className="patient-meta">
                            {patientData.completedVisits} completed, {patientData.pendingVisits} pending
                          </div>
                        </div>
                      </div>

                      <div className="patient-stats">
                        <div className="stat-item">
                          <div className="stat-label">Total Visits</div>
                          <div className="stat-value">{patientData.visits.length}</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-label">Earnings</div>
                          <div className="stat-value">{formatCurrency(patientData.totalEarnings)}</div>
                        </div>
                      </div>

                      <div className="patient-actions">
                        <button 
                          className="profile-btn"
                          onClick={() => onPatientClick(patientData.patient.id)}
                        >
                          <i className="fas fa-user"></i>
                          <span>View Profile</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {therapistStats.visitsByPatient.length === 0 && (
                  <div className="no-patients">
                    <i className="fas fa-user-injured"></i>
                    <p>No patients assigned to this therapist</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'pricing' && (
              <motion.div
                key="pricing"
                className="tab-content pricing-tab"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="pricing-header">
                  <h3>Visit Pricing Configuration</h3>
                  <div className="pricing-actions">
                    {editingPrices ? (
                      <>
                        <button className="save-btn" onClick={handleSavePrices}>
                          <i className="fas fa-save"></i>
                          Save Changes
                        </button>
                        <button 
                          className="cancel-btn" 
                          onClick={() => setEditingPrices(false)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button 
                        className="edit-btn" 
                        onClick={() => setEditingPrices(true)}
                      >
                        <i className="fas fa-edit"></i>
                        Edit Prices
                      </button>
                    )}
                  </div>
                </div>

                <div className="pricing-grid">
                  {Object.entries(customPrices).map(([visitType, pricing]) => (
                    <div key={visitType} className="pricing-item">
                      <div className="visit-type-name">{visitType}</div>
                      
                      <div className="pricing-fields">
                        <div className="price-field">
                          <label>Agency Pays</label>
                          <div className="price-input">
                            <span className="currency-symbol">$</span>
                            <input
                              type="number"
                              value={pricing.agency_pays}
                              onChange={(e) => handlePriceChange(visitType, 'agency_pays', e.target.value)}
                              disabled={!editingPrices}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="price-field">
                          <label>Therapist Receives</label>
                          <div className="price-input">
                            <span className="currency-symbol">$</span>
                            <input
                              type="number"
                              value={pricing.therapist_receives}
                              onChange={(e) => handlePriceChange(visitType, 'therapist_receives', e.target.value)}
                              disabled={!editingPrices}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="profit-display">
                          <span className="profit-label">Profit:</span>
                          <span className="profit-value">
                            {formatCurrency(pricing.agency_pays - pricing.therapist_receives)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pricing-notes">
                  <div className="note-item">
                    <i className="fas fa-info-circle"></i>
                    <span>Prices are per visit and can be customized for each therapist</span>
                  </div>
                  <div className="note-item">
                    <i className="fas fa-calculator"></i>
                    <span>Profit margin is automatically calculated based on the difference</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .therapist-modal {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .therapist-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .therapist-avatar .avatar-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #2196f3;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          font-weight: 600;
        }

        .therapist-name {
          font-size: 20px;
          font-weight: 600;
          color: #424242;
          margin: 0 0 4px 0;
        }

        .therapist-role {
          font-size: 14px;
          color: #757575;
        }

        .close-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: #f5f5f5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #757575;
          transition: all 0.2s ease-out;
        }

        .close-btn:hover {
          background: #e0e0e0;
          color: #424242;
        }

        .modal-tabs {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
          background: #fafafa;
        }

        .tab-btn {
          flex: 1;
          padding: 16px 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #757575;
          transition: all 0.2s ease-out;
          border-bottom: 2px solid transparent;
        }

        .tab-btn:hover {
          background: #f0f0f0;
          color: #424242;
        }

        .tab-btn.active {
          color: #2196f3;
          border-bottom-color: #2196f3;
          background: white;
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .tab-content {
          min-height: 400px;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .overview-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
        }

        .overview-card.total-pay .card-icon { background: #4caf50; }
        .overview-card.pending-pay .card-icon { background: #ff9800; }
        .overview-card.total-visits .card-icon { background: #2196f3; }
        .overview-card.current-patients .card-icon { background: #9c27b0; }

        .card-title {
          font-size: 12px;
          color: #757575;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .card-value {
          font-size: 18px;
          font-weight: 600;
          color: #424242;
          margin-bottom: 2px;
        }

        .card-subtitle {
          font-size: 11px;
          color: #9e9e9e;
        }

        .verification-section {
          border-top: 1px solid #e0e0e0;
          padding-top: 24px;
        }

        .verification-section h3 {
          font-size: 16px;
          font-weight: 600;
          color: #424242;
          margin: 0 0 16px 0;
        }

        .verification-options {
          display: flex;
          gap: 12px;
        }

        .verify-btn {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease-out;
        }

        .verify-btn.completed {
          background: #e8f5e8;
          color: #4caf50;
        }

        .verify-btn.pending {
          background: #fff3e0;
          color: #ff9800;
        }

        .verify-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .patients-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #424242;
          margin: 0 0 20px 0;
        }

        .patients-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .patient-item {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .patient-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .patient-avatar .avatar-circle.patient {
          width: 40px;
          height: 40px;
          background: #9c27b0;
          font-size: 14px;
        }

        .patient-name {
          font-size: 14px;
          font-weight: 600;
          color: #424242;
          margin-bottom: 2px;
        }

        .patient-meta {
          font-size: 12px;
          color: #757575;
        }

        .patient-stats {
          display: flex;
          gap: 20px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          font-size: 11px;
          color: #757575;
          margin-bottom: 2px;
        }

        .stat-value {
          font-size: 14px;
          font-weight: 600;
          color: #424242;
        }

        .profile-btn {
          padding: 8px 16px;
          border: 1px solid #2196f3;
          background: white;
          color: #2196f3;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease-out;
        }

        .profile-btn:hover {
          background: #2196f3;
          color: white;
        }

        .no-patients {
          text-align: center;
          padding: 60px 20px;
          color: #9e9e9e;
        }

        .no-patients i {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .pricing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .pricing-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #424242;
          margin: 0;
        }

        .pricing-actions {
          display: flex;
          gap: 8px;
        }

        .edit-btn, .save-btn, .cancel-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease-out;
        }

        .edit-btn {
          background: #2196f3;
          color: white;
        }

        .save-btn {
          background: #4caf50;
          color: white;
        }

        .cancel-btn {
          background: #f5f5f5;
          color: #757575;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .pricing-item {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
        }

        .visit-type-name {
          font-size: 14px;
          font-weight: 600;
          color: #424242;
          margin-bottom: 16px;
        }

        .pricing-fields {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .price-field label {
          font-size: 12px;
          color: #757575;
          font-weight: 500;
          margin-bottom: 4px;
          display: block;
        }

        .price-input {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-symbol {
          position: absolute;
          left: 12px;
          color: #757575;
          font-size: 14px;
          z-index: 1;
        }

        .price-input input {
          width: 100%;
          padding: 8px 12px 8px 28px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          background: white;
        }

        .price-input input:disabled {
          background: #f5f5f5;
          color: #9e9e9e;
        }

        .profit-display {
          padding: 8px 12px;
          background: #e8f5e8;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .profit-label {
          font-size: 12px;
          color: #4caf50;
          font-weight: 500;
        }

        .profit-value {
          font-size: 14px;
          color: #4caf50;
          font-weight: 600;
        }

        .pricing-notes {
          border-top: 1px solid #e0e0e0;
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .note-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #757575;
        }

        .note-item i {
          color: #2196f3;
        }

        @media (max-width: 768px) {
          .modal-backdrop {
            padding: 10px;
          }

          .therapist-modal {
            max-height: 95vh;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .patient-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .patient-stats {
            width: 100%;
            justify-content: space-around;
          }

          .pricing-grid {
            grid-template-columns: 1fr;
          }

          .pricing-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default TherapistModal;