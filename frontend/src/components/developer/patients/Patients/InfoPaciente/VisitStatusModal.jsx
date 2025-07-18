// VisitStatusModal.jsx - Compact Horizontal Visit Status Modal
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../login/AuthContext';
import '../../../../../styles/developer/Patients/InfoPaciente/VisitStatusModal.scss';

const VisitStatusModal = ({ 
  isOpen, 
  onClose, 
  visitData, 
  onStatusChange,
  onCompleteVisit,
  onVisitUpdate // Callback to notify parent for immediate UI refresh
}) => {
  const { currentUser } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState(visitData?.status || 'Scheduled');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [physicianData, setPhysicianData] = useState(null);
  const [assignedTherapist, setAssignedTherapist] = useState(null);
  const [availableTherapists, setAvailableTherapists] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState(visitData?.staff_id || null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Editable form fields
  const [visitDate, setVisitDate] = useState(visitData?.visit_date || '');
  const [visitTime, setVisitTime] = useState(visitData?.scheduled_time || '');
  const [visitType, setVisitType] = useState(visitData?.visit_type || 'Initial');
  const [comments, setComments] = useState(visitData?.comments || '');

  // Check if user can edit therapist (only Developer, Administrator, Agency)
  const canEditTherapist = () => {
    if (!currentUser?.role) return false;
    const adminRoles = ['Developer', 'Administrator', 'Agency'];
    return adminRoles.includes(currentUser.role);
  };

  // Visit status configurations with original colors
  const visitStatuses = [
    {
      id: 'Scheduled',
      label: 'Scheduled',
      icon: 'fas fa-calendar-plus',
      color: '#3b82f6'
    },
    {
      id: 'Completed',
      label: 'Completed',
      icon: 'fas fa-clipboard-check',
      color: '#10b981',
      special: true
    },
    {
      id: 'Pending',
      label: 'Pending',
      icon: 'fas fa-clock',
      color: '#f59e0b'
    },
    {
      id: 'Missed',
      label: 'Missed',
      icon: 'fas fa-user-times',
      color: '#ef4444'
    },
    {
      id: 'Cancelled',
      label: 'Cancelled',
      icon: 'fas fa-ban',
      color: '#6b7280'
    }
  ];

  // Initialize data when modal opens
  useEffect(() => {
    if (isOpen && visitData) {
      // Set form fields from visitData
      setVisitDate(visitData.visit_date || '');
      setVisitTime(visitData.scheduled_time || '');
      setVisitType(visitData.visit_type || 'Initial');
      setComments(visitData.comments || '');
      setSelectedStatus(visitData.status || 'Scheduled');
      setSelectedTherapist(visitData.staff_id || null);
      
      // Fetch related data
      fetchPatientData();
      fetchAssignedTherapist();
      
      // Only fetch available therapists if user can edit
      if (canEditTherapist()) {
        fetchAvailableTherapists();
      }
    }
  }, [isOpen, visitData]);

  // Fetch patient data
  const fetchPatientData = async () => {
    try {
      if (visitData?.patient_id) {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_BASE_URL}/patients/${visitData.patient_id}`, {
          method: 'GET',  
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Patient data received:', data);
          setPatientData({
            first_name: data.full_name ? data.full_name.split(' ')[0] : 'Unknown',
            last_name: data.full_name ? data.full_name.split(' ').slice(1).join(' ') : 'Patient',
            physician: data.physician || 'Not assigned'
          });
        } else {
          console.error('Failed to fetch patient:', response.status, response.statusText);
          setPatientData({ first_name: 'Unknown', last_name: 'Patient', physician: 'Not assigned' });
        }
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setPatientData({ first_name: 'Unknown', last_name: 'Patient', physician: 'Not assigned' });
    }
  };

  // Fetch assigned therapist data
  const fetchAssignedTherapist = async () => {
    try {
      if (visitData?.staff_id) {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_BASE_URL}/staff/${visitData.staff_id}`, {
          method: 'GET',  
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Assigned therapist data received:', data);
          setAssignedTherapist(data);
        } else {
          console.error('Failed to fetch assigned therapist:', response.status, response.statusText);
        }
      }
    } catch (error) {
      console.error('Error fetching assigned therapist data:', error);
    }
  };

  // Fetch available therapists for selection (only for admin roles)
  const fetchAvailableTherapists = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/staff/`, {
        method: 'GET',  
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Available therapists received:', data);
        // Filter only therapy roles (PT, OT, ST, PTA, COTA, STA)
        const therapyRoles = ['PT', 'OT', 'ST', 'PTA', 'COTA', 'STA'];
        const therapists = data.filter(staff => therapyRoles.includes(staff.role) && staff.is_active);
        setAvailableTherapists(therapists);
      } else {
        console.error('Failed to fetch available therapists:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching available therapists:', error);
    }
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    // Trigger immediate UI update to show status change
    forceUpdate();
  };

  // Force update hook for immediate UI refresh
  const [, forceUpdate] = useState({});
  const triggerUpdate = () => forceUpdate({});

  // Check for changes and update UI
  useEffect(() => {
    const hasAnyChanges = 
      visitDate !== visitData?.visit_date ||
      visitTime !== visitData?.scheduled_time ||
      visitType !== visitData?.visit_type ||
      selectedStatus !== visitData?.status ||
      selectedTherapist !== visitData?.staff_id ||
      comments !== (visitData?.comments || '');
    
    setHasChanges(hasAnyChanges);
    triggerUpdate();
  }, [visitDate, visitTime, visitType, selectedStatus, selectedTherapist, comments, visitData]);

  const handleSave = async () => {
    try {
      // Use query parameters instead of body (based on backend analysis)
      const params = new URLSearchParams();
      
      if (visitDate !== visitData.visit_date) params.append('visit_date', visitDate);
      if (visitTime !== visitData.scheduled_time) params.append('scheduled_time', visitTime);
      if (visitType !== visitData.visit_type) params.append('visit_type', visitType);
      if (selectedStatus !== visitData.status) params.append('status', selectedStatus);
      if (selectedTherapist !== visitData.staff_id) params.append('staff_id', selectedTherapist);

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      // Update visit via API using query parameters
      const response = await fetch(`${API_BASE_URL}/visits/${visitData.id}?${params.toString()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const updatedVisit = await response.json();
        
        // Prepare updated visit data for parent components using the actual response data
        const updatedVisitData = {
          ...visitData,
          ...updatedVisit, // Use the actual backend response
          visit_date: visitDate,
          scheduled_time: visitTime,
          visit_type: visitType,
          status: selectedStatus,
          staff_id: selectedTherapist
        };

        console.log('Updating visit data:', updatedVisitData);

        // Notify parent component about the update for immediate UI refresh
        if (typeof onVisitUpdate === 'function') {
          onVisitUpdate(updatedVisitData);
        }

        // Call appropriate handler based on status (but don't update again to avoid conflicts)
        if (selectedStatus === 'Completed') {
          onCompleteVisit(updatedVisitData);
        }
        
        onClose();
      } else {
        const errorText = await response.text();
        console.error('Failed to update visit:', response.status, errorText);
        alert('Failed to update visit. Please try again.');
      }
    } catch (error) {
      console.error('Error updating visit:', error);
      alert('Error updating visit. Please try again.');
    }
  };

  // Handle comments update (if needed)
  const handleCommentsUpdate = async (visitData) => {
    try {
      if (visitData.note_id && comments.trim()) {
        // Update existing note
        await fetch(`http://localhost:5000/visit-notes/${visitData.note_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            updated_sections: [{
              section_id: 'comments',
              content: { comments: comments }
            }]
          })
        });
      }
      // Note: Creating new notes might require more complex logic
      // depending on your backend implementation
    } catch (error) {
      console.error('Error updating comments:', error);
    }
  };

  const handleClose = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const getStatusInfo = (statusId) => {
    return visitStatuses.find(status => status.id === statusId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };
  
  // Modal animation effects
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsModalVisible(true), 10);
    } else {
      setIsModalVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`visit-status-modal-overlay ${isModalVisible ? 'visible' : ''}`}>
      <div className={`visit-status-modal-expanded ${isModalVisible ? 'visible' : ''}`}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <h2 className="modal-title">Visit Details</h2>
            <div className="visit-datetime">
              {visitDate ? formatDate(visitDate) : 'No date'} | {visitTime ? formatTime(visitTime) : 'No time'}
            </div>
            <div className="patient-info">
              Patient: {patientData ? `${patientData.first_name} ${patientData.last_name}` : 'Loading...'}
            </div>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Main Content */}
        <div className="modal-content">
          
          {/* Left Column - Visit Details Form */}
          <div className="visit-details-section">
            <div className="form-group">
              <label htmlFor="visit-date">Visit Date</label>
              <input
                id="visit-date"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="visit-time">Visit Time</label>
              <input
                id="visit-time"
                type="time"
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="visit-type">Visit Type</label>
              <select
                id="visit-type"
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                className="form-select"
              >
                <option value="Initial">Initial</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Re-evaluation">Re-evaluation</option>
                <option value="Discharge">Discharge</option>
                <option value="Assessment">Assessment</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assigned-therapist">Assigned Therapist</label>
              {canEditTherapist() ? (
                <select
                  id="assigned-therapist"
                  value={selectedTherapist || ''}
                  onChange={(e) => setSelectedTherapist(parseInt(e.target.value))}
                  className="form-select"
                >
                  <option value="">Select Therapist</option>
                  {availableTherapists.map((therapist) => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name} ({therapist.role})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="therapist-display">
                  <div className="staff-item">
                    <div className="staff-icon therapist">
                      <i className="fas fa-user-md"></i>
                    </div>
                    <div className="staff-details">
                      <span className="staff-label">Current Therapist</span>
                      <span className="staff-name">
                        {assignedTherapist ? `${assignedTherapist.name} (${assignedTherapist.role})` : 'Not assigned'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="comments">Comments (Optional)</label>
              <textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any additional notes or comments..."
                className="form-textarea"
                rows={3}
              />
            </div>

            {/* Medical Staff Info - Only Physician */}
            <div className="medical-staff-info">
              <h4>Medical Staff</h4>
              <div className="staff-grid">
                <div className="staff-item">
                  <div className="staff-icon physician">
                    <i className="fas fa-user-md"></i>
                  </div>
                  <div className="staff-details">
                    <span className="staff-label">Physician (MD)</span>
                    <span className="staff-name">
                      {patientData?.physician || 'Not assigned'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status Selection */}
          <div className="status-management-section">
            <h4>Visit Status</h4>
            <div className="status-options-container">
              {visitStatuses.map((status) => (
                <div
                  key={status.id}
                  className={`status-option-card ${selectedStatus === status.id ? 'selected' : ''}`}
                  onClick={() => handleStatusSelect(status.id)}
                >
                  <div className="option-icon" style={{ color: status.color }}>
                    <i className={status.icon}></i>
                  </div>
                  <div className="option-content">
                    <span className="option-text">{status.label}</span>
                    {status.special && (
                      <div className="special-badge">
                        <i className="fas fa-stethoscope"></i>
                      </div>
                    )}
                  </div>
                  {selectedStatus === status.id && (
                    <div className="selected-indicator">
                      <i className="fas fa-check-circle"></i>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="cancel-btn" onClick={handleClose}>
            <i className="fas fa-times"></i>
            Cancel
          </button>
          <button 
            className={`save-btn ${hasChanges ? 'has-changes' : ''}`} 
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <i className="fas fa-save"></i>
            {hasChanges ? 'Save Changes' : 'No Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitStatusModal;