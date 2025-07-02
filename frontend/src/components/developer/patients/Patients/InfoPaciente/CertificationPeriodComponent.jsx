import React, { useState, useEffect } from 'react';
import '../../../../../styles/developer/Patients/InfoPaciente/CertificationPeriodComponent.scss';

const CertificationPeriodComponent = ({ patient, onUpdateCertPeriod }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editData, setEditData] = useState({
    startDate: '',
    endDate: '',
    insurance: '',
    policyNumber: '',
    agency: ''
  });
  const [certPeriods, setCertPeriods] = useState([]);
  const [activePeriodId, setActivePeriodId] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(true);
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  // Fetch agencies from API (same logic as DevPatientsPage)
  const fetchAgenciesData = async () => {
    try {
      setIsLoadingAgencies(true);
      
      const response = await fetch(`${API_BASE_URL}/staff/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch staff: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received staff data for agencies:', data);
      
      // Filter only agencies (same logic as DevPatientsPage)
      const agenciesOnly = data.filter(person => {
        const role = person.role?.toLowerCase();
        return role === 'agency';
      });
      
      console.log('Filtered agencies:', agenciesOnly);
      setAgencies(agenciesOnly);
      return agenciesOnly;
      
    } catch (err) {
      console.error('Error fetching agencies:', err);
      setAgencies([]);
      return [];
    } finally {
      setIsLoadingAgencies(false);
    }
  };
  
  // Get agency name by ID (same logic as DevPatientsPage)
  const getAgencyNameById = (agencyId) => {
    if (!agencyId || agencies.length === 0) {
      return 'Not available';
    }
    
    const agency = agencies.find(a => a.id === agencyId);
    return agency ? agency.name : 'Unknown Agency';
  };
  
  // Initialize with patient data
  useEffect(() => {
    if (patient) {
      // First fetch agencies
      fetchAgenciesData().then((agenciesData) => {
        // Get the real agency name
        const realAgencyName = patient.agency_id ? 
          (agenciesData.find(a => a.id === patient.agency_id)?.name || 'Unknown Agency') : 
          'Not available';
        
        console.log('Patient agency data:', {
          patient_id: patient.id,
          agency_id: patient.agency_id,
          found_agency: agenciesData.find(a => a.id === patient.agency_id),
          final_agency_name: realAgencyName
        });
        
        // Initialize from patient data
        let startDate, endDate;
        
        if (patient.initial_cert_start_date) {
          startDate = patient.initial_cert_start_date;
          const startDateObj = new Date(startDate);
          const endDateObj = new Date(startDateObj);
          endDateObj.setDate(startDateObj.getDate() + 60);
          endDate = endDateObj.toISOString().split('T')[0];
        }
        
        if (startDate && endDate) {
          const initialPeriod = {
            id: 'temp_1',
            period: `${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}`,
            status: 'active',
            startDate: startDate,
            endDate: endDate,
            insurance: patient.insurance || 'Not available',
            policyNumber: patient.policyNumber || 'Not available',
            agency: realAgencyName // Use real agency name
          };
          
          setCertPeriods([initialPeriod]);
          setActivePeriodId('temp_1');
          
          setEditData({
            startDate: startDate,
            endDate: endDate,
            insurance: patient.insurance || 'Not available',
            policyNumber: patient.policyNumber || 'Not available',
            agency: realAgencyName // Use real agency name
          });
        }
        
        // Try to fetch real certification periods from API
        fetchCertificationPeriods(realAgencyName);
      });
    }
  }, [patient]);
  
  // Fetch certification periods from API using the CORRECT endpoint
  const fetchCertificationPeriods = async (agencyName = null) => {
    if (!patient?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // ENDPOINT CORRECTO basado en tu FastAPI docs
      const response = await fetch(`${API_BASE_URL}/patient/${patient.id}/cert-periods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('No certification periods found for patient, using fallback data');
          return;
        }
        throw new Error(`Failed to fetch certification periods: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received cert periods data:', data);
      
      if (data && data.length > 0) {
        // Use the real agency name we got from the agencies fetch
        const realAgencyName = agencyName || getAgencyNameById(patient.agency_id);
        
        // Transform API data to component format
        const transformedPeriods = data.map(period => ({
          id: period.id,
          period: `${formatDateForDisplay(period.start_date)} to ${formatDateForDisplay(period.end_date)}`,
          status: period.is_active ? 'active' : 'expired',
          startDate: period.start_date,
          endDate: period.end_date,
          insurance: patient.insurance || 'Not available',
          policyNumber: patient.policyNumber || 'Not available',
          agency: realAgencyName // Use real agency name
        }));
        
        setCertPeriods(transformedPeriods);
        
        // Set active period
        const activePeriod = transformedPeriods.find(p => p.status === 'active');
        if (activePeriod) {
          setActivePeriodId(activePeriod.id);
          setEditData({
            startDate: activePeriod.startDate,
            endDate: activePeriod.endDate,
            insurance: activePeriod.insurance,
            policyNumber: activePeriod.policyNumber,
            agency: activePeriod.agency
          });
        }
      }
      
    } catch (err) {
      console.error('Error fetching certification periods:', err);
      // Don't show error to user, just use fallback data
      console.log('Using fallback certification data due to API error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create new certification period using CORRECT endpoint
  const createCertificationPeriod = async (startDate, endDate) => {
    try {
      console.log('Creating certification period with:', { startDate, endDate });
      
      // ENDPOINT CORRECTO basado en tu FastAPI docs
      const response = await fetch(`${API_BASE_URL}/patients/${patient.id}/certification-period`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to create certification period: ${response.status} - ${errorText}`);
      }
      
      const newPeriod = await response.json();
      console.log('Created certification period:', newPeriod);
      return newPeriod;
      
    } catch (err) {
      console.error('Error creating certification period:', err);
      throw err;
    }
  };
  
  // Calculate days remaining and progress
  const calculateDaysRemaining = (certPeriod) => {
    if (!certPeriod) return { percentage: 0, daysRemaining: 0, totalDays: 0, daysElapsed: 0 };
    
    try {
      const [startDateStr, endDateStr] = certPeriod.split(' to ');
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      const currentDate = new Date();
      
      // Calculate total duration and days remaining
      const totalDuration = endDate - startDate;
      const daysTotal = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));
      
      if (currentDate > endDate) {
        return { percentage: 100, daysRemaining: 0, totalDays: daysTotal, daysElapsed: daysTotal };
      }
      
      if (currentDate < startDate) {
        return { percentage: 0, daysRemaining: daysTotal, totalDays: daysTotal, daysElapsed: 0 };
      }
      
      const remainingDuration = endDate - currentDate;
      const daysRemaining = Math.ceil(remainingDuration / (1000 * 60 * 60 * 24));
      const daysElapsed = daysTotal - daysRemaining;
      
      const percentage = Math.round((daysElapsed / daysTotal) * 100);
      
      return { percentage, daysRemaining, totalDays: daysTotal, daysElapsed };
    } catch (error) {
      console.error('Error calculating certification progress:', error);
      return { percentage: 0, daysRemaining: 0, totalDays: 0, daysElapsed: 0 };
    }
  };
  
  // Format date for display (MM-DD-YYYY)
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    } catch (error) {
      console.error('Error formatting date for display:', error);
      return dateStr;
    }
  };
  
  // Format date for input fields (YYYY-MM-DD)
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    try {
      let date;
      if (dateStr.includes('-') && dateStr.length === 10) {
        if (dateStr.substring(4, 5) === '-') {
          // Already in YYYY-MM-DD format
          date = new Date(dateStr);
        } else {
          // MM-DD-YYYY format
          const [month, day, year] = dateStr.split('-').map(Number);
          date = new Date(year, month - 1, day);
        }
      } else {
        date = new Date(dateStr);
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  };
  
  // Handle changes in input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
    
    // Automatically calculate 60 days after start date
    if (name === 'startDate' && value) {
      try {
        const startDate = new Date(value);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 60);
        
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        setEditData(prev => ({
          ...prev,
          endDate: formattedEndDate
        }));
      } catch (error) {
        console.error('Error calculating end date:', error);
      }
    }
  };
  
  // Save changes to certification period
  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the real agency name
      const realAgencyName = getAgencyNameById(patient.agency_id);
      
      if (isAddingNew) {
        // Create new certification period via API
        try {
          const apiResponse = await createCertificationPeriod(editData.startDate, editData.endDate);
          console.log('API created period:', apiResponse);
          
          // Transform API response to our format
          const newPeriod = {
            id: apiResponse.id,
            period: `${formatDateForDisplay(apiResponse.start_date)} to ${formatDateForDisplay(apiResponse.end_date)}`,
            status: 'active',
            startDate: apiResponse.start_date,
            endDate: apiResponse.end_date,
            insurance: editData.insurance,
            policyNumber: editData.policyNumber,
            agency: realAgencyName // Use real agency name
          };
          
          // Set all other periods to expired and add new one
          const updatedPeriods = certPeriods.map(p => ({
            ...p,
            status: 'expired'
          }));
          
          const newPeriods = [...updatedPeriods, newPeriod];
          setCertPeriods(newPeriods);
          setActivePeriodId(newPeriod.id);
          
        } catch (apiError) {
          console.error('API failed, creating local period:', apiError);
          setError('Failed to save to server, but created locally: ' + apiError.message);
          
          // Fallback: Add to local state if API fails
          const newPeriod = {
            id: `temp_${Date.now()}`,
            period: `${formatDateForDisplay(editData.startDate)} to ${formatDateForDisplay(editData.endDate)}`,
            status: 'active',
            startDate: editData.startDate,
            endDate: editData.endDate,
            insurance: editData.insurance,
            policyNumber: editData.policyNumber,
            agency: realAgencyName // Use real agency name
          };
          
          // Set all other periods to expired
          const updatedPeriods = certPeriods.map(p => ({
            ...p,
            status: 'expired'
          }));
          
          const newPeriods = [...updatedPeriods, newPeriod];
          setCertPeriods(newPeriods);
          setActivePeriodId(newPeriod.id);
        }
      } else {
        // Update existing period (local only for now)
        const updatedPeriods = certPeriods.map(p => 
          p.id === activePeriodId
            ? { 
                ...p, 
                period: `${formatDateForDisplay(editData.startDate)} to ${formatDateForDisplay(editData.endDate)}`,
                startDate: editData.startDate,
                endDate: editData.endDate,
                insurance: editData.insurance,
                policyNumber: editData.policyNumber,
                agency: realAgencyName // Use real agency name
              } 
            : p
        );
        
        setCertPeriods(updatedPeriods);
      }
      
      // Notify parent component
      if (onUpdateCertPeriod) {
        onUpdateCertPeriod({
          certPeriod: `${formatDateForDisplay(editData.startDate)} to ${formatDateForDisplay(editData.endDate)}`,
          insurance: editData.insurance,
          policyNumber: editData.policyNumber,
          agency: realAgencyName, // Use real agency name
          startDate: editData.startDate,
          endDate: editData.endDate   
        });
      }
      
      // Reset states
      setIsEditing(false);
      setIsAddingNew(false);
      
      // Clear error after successful operation
      setTimeout(() => setError(null), 3000);
      
    } catch (err) {
      console.error('Error saving certification period:', err);
      setError('Failed to save certification period: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    // Restore original data
    const activePeriod = certPeriods.find(p => p.id === activePeriodId);
    if (activePeriod) {
      setEditData({
        startDate: activePeriod.startDate,
        endDate: activePeriod.endDate,
        insurance: activePeriod.insurance || '',
        policyNumber: activePeriod.policyNumber || '',
        agency: activePeriod.agency || ''
      });
    }
    
    setIsEditing(false);
    setIsAddingNew(false);
    setError(null);
  };
  
  // Start adding a new period
  const handleAddNewPeriod = () => {
    setIsAddingNew(true);
    setIsEditing(false);
    setError(null);
    
    // Set start date to today
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    
    // Calculate end date (60 days later)
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 60);
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    // Get real agency name
    const realAgencyName = getAgencyNameById(patient.agency_id);
    
    setEditData({
      startDate: formattedToday,
      endDate: formattedEndDate,
      insurance: patient?.insurance || 'Not available',
      policyNumber: patient?.policyNumber || 'Not available',
      agency: realAgencyName // Use real agency name
    });
  };
  
  // Switch to a different certification period
  const handleSelectPeriod = (periodId) => {
    const selectedPeriod = certPeriods.find(p => p.id === periodId);
    if (!selectedPeriod) return;
    
    // Update local state to show this period as active
    const updatedPeriods = certPeriods.map(p => ({
      ...p,
      status: p.id === periodId ? 'active' : 'expired'
    }));
    
    setCertPeriods(updatedPeriods);
    setActivePeriodId(periodId);
    
    // Update edit data
    setEditData({
      startDate: selectedPeriod.startDate,
      endDate: selectedPeriod.endDate,
      insurance: selectedPeriod.insurance,
      policyNumber: selectedPeriod.policyNumber,
      agency: selectedPeriod.agency
    });
    
    // Notify parent component
    if (onUpdateCertPeriod) {
      onUpdateCertPeriod({
        certPeriod: selectedPeriod.period,
        insurance: selectedPeriod.insurance,
        policyNumber: selectedPeriod.policyNumber,
        agency: selectedPeriod.agency,
        startDate: selectedPeriod.startDate,
        endDate: selectedPeriod.endDate
      });
    }
    
    setIsViewingHistory(false);
  };
  
  // Start delete confirmation process
  const handleConfirmDelete = (periodId) => {
    setConfirmDelete(periodId);
  };
  
  // Delete a certification period
  const handleDeletePeriod = async (periodId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Cannot delete if it's the only period
      if (certPeriods.length <= 1) {
        setConfirmDelete(null);
        return;
      }
      
      // Remove from local state (API delete not implemented yet)
      removeFromLocalState(periodId);
      setConfirmDelete(null);
      
    } catch (err) {
      setError(err.message);
      setConfirmDelete(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to remove period from local state
  const removeFromLocalState = (periodId) => {
    const periodToDelete = certPeriods.find(p => p.id === periodId);
    const updatedPeriods = certPeriods.filter(p => p.id !== periodId);
    
    // If we're deleting the active period, set another one as active
    if (periodToDelete.status === 'active' && updatedPeriods.length > 0) {
      // Set the most recent period as active
      const sortedPeriods = [...updatedPeriods].sort((a, b) => {
        const aDate = new Date(a.endDate);
        const bDate = new Date(b.endDate);
        return bDate - aDate; // Sort descending (most recent first)
      });
      
      const newActivePeriod = sortedPeriods[0];
      updatedPeriods.forEach(p => {
        if (p.id === newActivePeriod.id) {
          p.status = 'active';
        }
      });
      
      setActivePeriodId(newActivePeriod.id);
      
      // Update edit data
      setEditData({
        startDate: newActivePeriod.startDate,
        endDate: newActivePeriod.endDate,
        insurance: newActivePeriod.insurance,
        policyNumber: newActivePeriod.policyNumber,
        agency: newActivePeriod.agency
      });
      
      // Notify parent component
      if (onUpdateCertPeriod) {
        onUpdateCertPeriod({
          certPeriod: newActivePeriod.period,
          insurance: newActivePeriod.insurance,
          policyNumber: newActivePeriod.policyNumber,
          agency: newActivePeriod.agency,
          startDate: newActivePeriod.startDate,
          endDate: newActivePeriod.endDate
        });
      }
    }
    
    setCertPeriods(updatedPeriods);
  };
  
  // Cancel delete confirmation
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };
  
  // Get the active certification period
  const getActivePeriod = () => {
    const activePeriod = certPeriods.find(p => p.status === 'active');
    return activePeriod ? activePeriod.period : null;
  };
  
  const selectedPeriod = getActivePeriod();
  const selectedPeriodData = certPeriods.find(p => p.status === 'active');
  const certInfo = calculateDaysRemaining(selectedPeriod);
  
  // Determine progress color based on days remaining
  const progressColor = 
    certInfo.daysRemaining < 12 ? '#ef4444' : 
    certInfo.daysRemaining < 30 ? '#f59e0b' : 
    '#10b981';
  
  return (
    <div className="certification-period-component">
      <div className="card-header">
        <div className="header-title">
          <i className="fas fa-certificate"></i>
          <h3>Certification Period</h3>
        </div>
        <div className="header-actions">
          {!isEditing && !isAddingNew && (
            <>
              <button 
                className="refresh-button" 
                onClick={() => setIsViewingHistory(!isViewingHistory)}
                title="View certification history"
                disabled={isLoading || isLoadingAgencies}
              >
                <i className="fas fa-history"></i>
              </button>
              <button 
                className="edit-button" 
                onClick={() => setIsEditing(true)}
                title="Edit current period"
                disabled={isLoading || isLoadingAgencies}
              >
                <i className="fas fa-edit"></i>
              </button>
              <button 
                className="add-button" 
                onClick={handleAddNewPeriod}
                title="Add new certification period"
                disabled={isLoading || isLoadingAgencies}
              >
                <i className="fas fa-plus"></i>
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="card-body">
        {error && (
          <div className="error-message" style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fas fa-exclamation-triangle"></i>
            <span style={{ flex: 1 }}>{error}</span>
            <button 
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
        
        {/* Loading state for agencies */}
        {isLoadingAgencies && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            marginBottom: '15px',
            color: '#6b7280'
          }}>
            <i className="fas fa-spinner fa-spin"></i>
            <span>Loading healthcare agencies...</span>
          </div>
        )}
        
        {(isEditing || isAddingNew) ? (
          // Edit/Add form
          <div className="edit-form">
            <h4>{isAddingNew ? 'Add New Certification Period' : 'Edit Certification Period'}</h4>
            
            <div className="date-range-edit">
              <div className="form-group">
                <label>Start Date</label>
                <input 
                  type="date" 
                  name="startDate"
                  value={editData.startDate} 
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="date-separator">
                <i className="fas fa-arrow-right"></i>
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input 
                  type="date" 
                  name="endDate"
                  value={editData.endDate} 
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Insurance</label>
              <input 
                type="text" 
                name="insurance"
                value={editData.insurance} 
                onChange={handleInputChange}
                placeholder="Insurance Provider"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label>Policy Number</label>
              <input 
                type="text" 
                name="policyNumber"
                value={editData.policyNumber} 
                onChange={handleInputChange}
                placeholder="Policy Number"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label>Healthcare Agency</label>
              {isLoadingAgencies ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db'
                }}>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Loading agencies...</span>
                </div>
              ) : agencies.length > 0 ? (
                <select 
                  name="agency"
                  value={editData.agency} 
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="">Select Healthcare Agency</option>
                  {agencies.map((agency) => (
                    <option key={agency.id} value={agency.name}>
                      {agency.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  name="agency"
                  value={editData.agency} 
                  onChange={handleInputChange}
                  placeholder="Healthcare Agency"
                  disabled={isLoading}
                />
              )}
            </div>
            
            <div className="form-actions">
              <button 
                className="cancel-btn" 
                onClick={handleCancelEdit}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="save-btn" 
                onClick={handleSaveChanges}
                disabled={!editData.startDate || !editData.endDate || isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    {isAddingNew ? 'Adding...' : 'Saving...'}
                  </>
                ) : (
                  isAddingNew ? 'Add Period' : 'Save Changes'
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            {isViewingHistory ? (
              // Certification periods history view
              <div className="cert-periods-history">
                <h4>Certification Periods History</h4>
                <div className="history-list">
                  {certPeriods.map((period) => (
                    <div 
                      key={period.id} 
                      className={`history-item ${period.status}`}
                    >
                      <div className="period-dates">
                        <span>{period.period}</span>
                      </div>
                      <div className="period-actions">
                        <div className="status-badge">
                          {period.status === 'active' ? 'Current' : 'Expired'}
                        </div>
                        
                        {period.status !== 'active' && (
                          <button
                            className="select-btn"
                            onClick={() => handleSelectPeriod(period.id)}
                            title="Use this period"
                            disabled={isLoading}
                          >
                            <i className="fas fa-check-circle"></i>
                          </button>
                        )}
                        
                        {confirmDelete === period.id ? (
                          <div className="delete-confirmation">
                            <span>Delete?</span>
                            <button 
                              className="confirm-btn"
                              onClick={() => handleDeletePeriod(period.id)}
                              disabled={isLoading}
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button 
                              className="cancel-btn"
                              onClick={handleCancelDelete}
                              disabled={isLoading}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="delete-btn"
                            onClick={() => handleConfirmDelete(period.id)}
                            disabled={certPeriods.length <= 1 || isLoading}
                            title={
                              certPeriods.length <= 1 
                                ? "Cannot delete the only period" 
                                : "Delete this period"
                            }
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  className="back-btn"
                  onClick={() => setIsViewingHistory(false)}
                  disabled={isLoading}
                >
                  <i className="fas fa-arrow-left"></i>
                  Back to Current Period
                </button>
              </div>
            ) : (
              // Normal display view
              <>
                <div className="date-range">
                  <div className="date-block">
                    <label>Start Date</label>
                    <div className="date-value">
                      {selectedPeriod?.split(' to ')[0] || '00/00/0000'}
                    </div>
                  </div>
                  <div className="progress-separator">
                    <div className="line"></div>
                  </div>
                  <div className="date-block">
                    <label>End Date</label>
                    <div className="date-value">
                      {selectedPeriod?.split(' to ')[1] || '00/00/0000'}
                    </div>
                  </div>
                </div>
                
                <div className="cert-progress-container">
                  <div className="cert-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${certInfo.percentage}%`, 
                          background: `linear-gradient(to right, ${progressColor}, ${progressColor}CC)` 
                        }}
                      >
                        <span className="progress-text">{certInfo.percentage}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="cert-details">
                    <div className="cert-detail-item">
                      <div className="detail-label">Days Elapsed</div>
                      <div className="detail-value">{certInfo.daysElapsed}</div>
                    </div>
                    <div className="cert-detail-item remaining">
                      <div className="detail-label">Days Remaining</div>
                      <div className="detail-value" style={{ color: progressColor }}>
                        {certInfo.daysRemaining}
                        <i className="fas fa-clock" style={{ color: progressColor }}></i>
                      </div>
                    </div>
                    <div className="cert-detail-item">
                      <div className="detail-label">Total Days</div>
                      <div className="detail-value">{certInfo.totalDays}</div>
                    </div>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-label">Insurance</div>
                  <div className="info-value insurance-value">
                    <i className="fas fa-id-card"></i>
                    {selectedPeriodData?.insurance || 'Not available'}
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-label">Policy Number</div>
                  <div className="info-value">
                    <span className="policy-number">{selectedPeriodData?.policyNumber || 'Not available'}</span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-label">Healthcare Agency</div>
                  <div className="info-value agency-value">
                    <i className="fas fa-hospital"></i>
                    {isLoadingAgencies ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-spinner fa-spin"></i>
                        Loading...
                      </span>
                    ) : (
                      selectedPeriodData?.agency || 'Not available'
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CertificationPeriodComponent;