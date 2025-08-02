import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AgencyModal = ({ agency, visits, patients, staff, onClose, onPatientClick }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingPrices, setEditingPrices] = useState(false);
  const [customPrices, setCustomPrices] = useState({});

  const defaultAgencyPrices = {
    'Initial Evaluation': 130,
    'Follow Up': 110,
    'SOC OASIS': 140,
    'RA': 120,
    'DC': 100,
    'Re-evaluation': 125,
    'Discharge': 100,
    'Progress Review': 90
  };

  React.useEffect(() => {
    if (!Object.keys(customPrices).length) {
      setCustomPrices(defaultAgencyPrices);
    }
  }, [customPrices]);

  const agencyPatients = useMemo(() => {
    return patients.filter(patient => patient.agency_id === agency.id);
  }, [patients, agency.id]);

  const agencyVisits = useMemo(() => {
    const patientIds = agencyPatients.map(p => p.id);
    return visits.filter(visit => patientIds.includes(visit.patient_id));
  }, [visits, agencyPatients]);

  const agencyStats = useMemo(() => {
    const completedVisits = agencyVisits.filter(v => v.status === 'completed');
    const pendingVisits = agencyVisits.filter(v => v.status === 'pending' || v.status === 'scheduled');
    
    const totalOwed = completedVisits.reduce((sum, visit) => {
      const price = customPrices[visit.visit_type] || defaultAgencyPrices[visit.visit_type] || 110;
      return sum + price;
    }, 0);

    const totalPending = pendingVisits.reduce((sum, visit) => {
      const price = customPrices[visit.visit_type] || defaultAgencyPrices[visit.visit_type] || 110;
      return sum + price;
    }, 0);

    const visitsByTherapist = agencyVisits.reduce((acc, visit) => {
      const therapist = staff.find(s => s.id === visit.staff_id);
      if (!therapist) return acc;

      if (!acc[therapist.id]) {
        acc[therapist.id] = {
          therapist,
          visits: [],
          completedVisits: 0,
          pendingVisits: 0,
          totalRevenue: 0
        };
      }

      acc[therapist.id].visits.push(visit);
      
      if (visit.status === 'completed') {
        acc[therapist.id].completedVisits++;
        const price = customPrices[visit.visit_type] || defaultAgencyPrices[visit.visit_type] || 110;
        acc[therapist.id].totalRevenue += price;
      } else {
        acc[therapist.id].pendingVisits++;
      }

      return acc;
    }, {});

    const visitsByPatient = agencyVisits.reduce((acc, visit) => {
      const patient = agencyPatients.find(p => p.id === visit.patient_id);
      if (!patient) return acc;

      if (!acc[patient.id]) {
        acc[patient.id] = {
          patient,
          visits: [],
          completedVisits: 0,
          pendingVisits: 0,
          totalBilled: 0
        };
      }

      acc[patient.id].visits.push(visit);
      
      if (visit.status === 'completed') {
        acc[patient.id].completedVisits++;
        const price = customPrices[visit.visit_type] || defaultAgencyPrices[visit.visit_type] || 110;
        acc[patient.id].totalBilled += price;
      } else {
        acc[patient.id].pendingVisits++;
      }

      return acc;
    }, {});

    return {
      totalOwed,
      totalPending,
      completedVisits: completedVisits.length,
      pendingVisits: pendingVisits.length,
      totalPatients: agencyPatients.length,
      visitsByTherapist: Object.values(visitsByTherapist),
      visitsByPatient: Object.values(visitsByPatient),
      uniqueTherapists: Object.keys(visitsByTherapist).length
    };
  }, [agencyVisits, agencyPatients, staff, customPrices]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const handlePriceChange = (visitType, value) => {
    setCustomPrices(prev => ({
      ...prev,
      [visitType]: parseFloat(value) || 0
    }));
  };

  const handleSavePrices = () => {
    setEditingPrices(false);
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
    { id: 'patients', label: 'Patients', icon: 'fas fa-user-injured' },
    { id: 'therapists', label: 'Therapists', icon: 'fas fa-user-md' },
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
        className="agency-modal"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="agency-info">
            <div className="agency-avatar">
              <div className="avatar-circle agency">
                <i className="fas fa-building"></i>
              </div>
            </div>
            <div className="agency-details">
              <h2 className="agency-name">{agency.name}</h2>
              <div className="agency-contact">{agency.email}</div>
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
                  <div className="overview-card total-owed">
                    <div className="card-icon">
                      <i className="fas fa-file-invoice-dollar"></i>
                    </div>
                    <div className="card-content">
                      <div className="card-title">Amount Owed</div>
                      <div className="card-value">{formatCurrency(agencyStats.totalOwed)}</div>
                      <div className="card-subtitle">For completed visits</div>
                    </div>
                  </div>

                  <div className="overview-card pending-billing">
                    <div className="card-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="card-content">
                      <div className="card-title">Pending Billing</div>
                      <div className="card-value">{formatCurrency(agencyStats.totalPending)}</div>
                      <div className="card-subtitle">{agencyStats.pendingVisits} pending visits</div>
                    </div>
                  </div>

                  <div className="overview-card total-visits">
                    <div className="card-icon">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <div className="card-content">
                      <div className="card-title">Total Visits</div>
                      <div className="card-value">{agencyStats.completedVisits}</div>
                      <div className="card-subtitle">Completed visits</div>
                    </div>
                  </div>

                  <div className="overview-card total-patients">
                    <div className="card-icon">
                      <i className="fas fa-users"></i>
                    </div>
                    <div className="card-content">
                      <div className="card-title">Active Patients</div>
                      <div className="card-value">{agencyStats.totalPatients}</div>
                      <div className="card-subtitle">{agencyStats.uniqueTherapists} therapists involved</div>
                    </div>
                  </div>
                </div>

                <div className="verification-section">
                  <h3>Payment Verification</h3>
                  <div className="verification-options">
                    <button className="verify-btn received">
                      <i className="fas fa-check-circle"></i>
                      <span>Mark as Received</span>
                    </button>
                    <button className="verify-btn pending">
                      <i className="fas fa-clock"></i>
                      <span>Mark as Pending</span>
                    </button>
                    <button className="verify-btn invoice">
                      <i className="fas fa-file-invoice"></i>
                      <span>Generate Invoice</span>
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
                  <h3>Agency Patients ({agencyStats.totalPatients} patients)</h3>
                </div>

                <div className="patients-list">
                  {agencyStats.visitsByPatient.map((patientData) => (
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
                          <div className="stat-label">Billed Amount</div>
                          <div className="stat-value">{formatCurrency(patientData.totalBilled)}</div>
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

                {agencyStats.visitsByPatient.length === 0 && (
                  <div className="no-patients">
                    <i className="fas fa-user-injured"></i>
                    <p>No patients from this agency</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'therapists' && (
              <motion.div
                key="therapists"
                className="tab-content therapists-tab"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="therapists-header">
                  <h3>Therapists Working with Agency ({agencyStats.uniqueTherapists} therapists)</h3>
                </div>

                <div className="therapists-list">
                  {agencyStats.visitsByTherapist.map((therapistData) => (
                    <div key={therapistData.therapist.id} className="therapist-item">
                      <div className="therapist-info">
                        <div className="therapist-avatar">
                          <div className="avatar-circle therapist">
                            {therapistData.therapist.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div className="role-badge">{therapistData.therapist.role}</div>
                        </div>
                        <div className="therapist-details">
                          <div className="therapist-name">{therapistData.therapist.name}</div>
                          <div className="therapist-meta">
                            {therapistData.completedVisits} completed, {therapistData.pendingVisits} pending
                          </div>
                        </div>
                      </div>

                      <div className="therapist-stats">
                        <div className="stat-item">
                          <div className="stat-label">Total Visits</div>
                          <div className="stat-value">{therapistData.visits.length}</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-label">Revenue Generated</div>
                          <div className="stat-value">{formatCurrency(therapistData.totalRevenue)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {agencyStats.visitsByTherapist.length === 0 && (
                  <div className="no-therapists">
                    <i className="fas fa-user-md"></i>
                    <p>No therapists have worked with this agency's patients</p>
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
                  <h3>Agency Pricing Configuration</h3>
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
                  {Object.entries(customPrices).map(([visitType, price]) => (
                    <div key={visitType} className="pricing-item">
                      <div className="visit-type-name">{visitType}</div>
                      
                      <div className="pricing-field">
                        <label>Agency Pays</label>
                        <div className="price-input">
                          <span className="currency-symbol">$</span>
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => handlePriceChange(visitType, e.target.value)}
                            disabled={!editingPrices}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pricing-notes">
                  <div className="note-item">
                    <i className="fas fa-info-circle"></i>
                    <span>These are the rates this agency pays for each type of visit</span>
                  </div>
                  <div className="note-item">
                    <i className="fas fa-calculator"></i>
                    <span>Custom rates can be set per agency based on contracts</span>
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

        .agency-modal {
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

        .agency-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .agency-avatar .avatar-circle.agency {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #9c27b0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
        }

        .agency-name {
          font-size: 20px;
          font-weight: 600;
          color: #424242;
          margin: 0 0 4px 0;
        }

        .agency-contact {
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
          color: #9c27b0;
          border-bottom-color: #9c27b0;
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

        .overview-card.total-owed .card-icon { background: #9c27b0; }
        .overview-card.pending-billing .card-icon { background: #ff9800; }
        .overview-card.total-visits .card-icon { background: #2196f3; }
        .overview-card.total-patients .card-icon { background: #4caf50; }

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
          flex-wrap: wrap;
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

        .verify-btn.received {
          background: #e8f5e8;
          color: #4caf50;
        }

        .verify-btn.pending {
          background: #fff3e0;
          color: #ff9800;
        }

        .verify-btn.invoice {
          background: #f3e5f5;
          color: #9c27b0;
        }

        .verify-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .patients-header h3, .therapists-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #424242;
          margin: 0 0 20px 0;
        }

        .patients-list, .therapists-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .patient-item, .therapist-item {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .patient-info, .therapist-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .patient-avatar .avatar-circle.patient {
          width: 40px;
          height: 40px;
          background: #4caf50;
          font-size: 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
        }

        .therapist-avatar {
          position: relative;
        }

        .therapist-avatar .avatar-circle.therapist {
          width: 40px;
          height: 40px;
          background: #2196f3;
          font-size: 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
        }

        .role-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          background: #9c27b0;
          color: white;
          font-size: 8px;
          padding: 2px 4px;
          border-radius: 4px;
          font-weight: 600;
        }

        .patient-name, .therapist-name {
          font-size: 14px;
          font-weight: 600;
          color: #424242;
          margin-bottom: 2px;
        }

        .patient-meta, .therapist-meta {
          font-size: 12px;
          color: #757575;
        }

        .patient-stats, .therapist-stats {
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
          border: 1px solid #9c27b0;
          background: white;
          color: #9c27b0;
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
          background: #9c27b0;
          color: white;
        }

        .no-patients, .no-therapists {
          text-align: center;
          padding: 60px 20px;
          color: #9e9e9e;
        }

        .no-patients i, .no-therapists i {
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
          background: #9c27b0;
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
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
          margin-bottom: 12px;
        }

        .pricing-field label {
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
          color: #9c27b0;
        }

        @media (max-width: 768px) {
          .modal-backdrop {
            padding: 10px;
          }

          .agency-modal {
            max-height: 95vh;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .patient-item, .therapist-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .patient-stats, .therapist-stats {
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

          .verification-options {
            flex-direction: column;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default AgencyModal;