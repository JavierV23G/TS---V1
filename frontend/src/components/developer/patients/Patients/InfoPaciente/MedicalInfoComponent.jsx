import React, { useState, useEffect } from 'react';
import '../../../../../styles/developer/Patients/InfoPaciente/MedicalInfoComponent.scss';

const MedicalInfoComponent = ({ patient, certPeriodId, onUpdateMedicalInfo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Para forzar re-render
  
  // Estados para información médica
  const [medicalData, setMedicalData] = useState({
    weight: '',
    height: '',
    feet: '',
    inches: '',
    nursing_diagnosis: '',
    past_medical_history: '',
    weight_bearing_status: '',
    clinical_grouping: '',
    homebound_status: '',
    physician: '',
    nurse: '',
    urgency_level: '',
    prior_level_of_function: '',
    insurance: '',
    referral_reason: ''
  });
  
  // Estado para mantener una copia de los datos originales
  const [originalData, setOriginalData] = useState({});
  
  // Estados para visitas aprobadas
  const [approvedVisits, setApprovedVisits] = useState({
    pt: 0,
    ot: 0,
    st: 0
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Estado para controlar si hemos actualizado los datos localmente
  const [hasLocalUpdates, setHasLocalUpdates] = useState(false);

  // Cargar datos médicos del paciente SOLO si no tenemos actualizaciones locales
  useEffect(() => {
    if (patient && !hasLocalUpdates) {
      // Convertir altura total a pies y pulgadas para display
      const totalInches = patient.height ? parseFloat(patient.height) : 0;
      const feet = totalInches > 0 ? Math.floor(totalInches / 12) : '';
      const inches = totalInches > 0 ? Math.round((totalInches % 12) * 10) / 10 : '';
      
      const patientData = {
        weight: patient.weight || '',
        height: totalInches.toString() || '',
        feet: feet,
        inches: inches,
        nursing_diagnosis: patient.nursing_diagnosis || '',
        past_medical_history: patient.past_medical_history || '',
        weight_bearing_status: patient.weight_bearing_status || '',
        clinical_grouping: patient.clinical_grouping || '',
        homebound_status: patient.homebound_status || '',
        physician: patient.physician || '',
        nurse: patient.nurse || '',
        urgency_level: patient.urgency_level || '',
        prior_level_of_function: patient.prior_level_of_function || '',
        insurance: patient.insurance || '',
        referral_reason: patient.referral_reason || ''
      };
      
      setMedicalData(patientData);
      setOriginalData(patientData); // Guardar copia de los datos originales
    }
  }, [patient, hasLocalUpdates]);

  // Cargar approved visits del certification period
  useEffect(() => {
    if (certPeriodId) {
      fetchApprovedVisits();
    }
  }, [certPeriodId]);

  const fetchApprovedVisits = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cert-periods/${certPeriodId}`);
      if (response.ok) {
        const certData = await response.json();
        setApprovedVisits({
          pt: certData.pt_approved_visits || 0,
          ot: certData.ot_approved_visits || 0,
          st: certData.st_approved_visits || 0
        });
      }
    } catch (error) {
      console.error('Error fetching approved visits:', error);
    }
  };

  // Actualizar información médica del paciente
  const saveMedicalInfo = async () => {
    setLoading(true);
    setError('');
    setSaveSuccess(false);
    
    try {
      // Calcular altura total en pulgadas
      const heightInInches = medicalData.feet && medicalData.inches 
        ? (parseInt(medicalData.feet) * 12) + parseFloat(medicalData.inches)
        : parseFloat(medicalData.height) || 0;

      // Preparar parámetros para la URL
      const params = new URLSearchParams();
      
      if (medicalData.weight) params.append('weight', medicalData.weight);
      if (heightInInches > 0) params.append('height', heightInInches.toString());
      if (medicalData.nursing_diagnosis) params.append('nursing_diagnosis', medicalData.nursing_diagnosis);
      if (medicalData.past_medical_history) params.append('past_medical_history', medicalData.past_medical_history);
      if (medicalData.weight_bearing_status) params.append('weight_bearing_status', medicalData.weight_bearing_status);
      if (medicalData.clinical_grouping) params.append('clinical_grouping', medicalData.clinical_grouping);
      if (medicalData.homebound_status) params.append('homebound_status', medicalData.homebound_status);
      if (medicalData.physician) params.append('physician', medicalData.physician);
      if (medicalData.nurse) params.append('nurse', medicalData.nurse);
      if (medicalData.urgency_level) params.append('urgency_level', medicalData.urgency_level);
      if (medicalData.prior_level_of_function) params.append('prior_level_of_function', medicalData.prior_level_of_function);
      if (medicalData.insurance) params.append('insurance', medicalData.insurance);
      if (medicalData.referral_reason) params.append('referral_reason', medicalData.referral_reason);

      const response = await fetch(`${API_BASE_URL}/patients/${patient.id}?${params.toString()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Marcar que tenemos actualizaciones locales para prevenir que useEffect sobreescriba
        setHasLocalUpdates(true);
        
        // Los datos ya están en medicalData desde el formulario, 
        // solo necesitamos actualizar el estado original y cambiar a modo vista
        setOriginalData({...medicalData});
        
        // Cambiar a modo vista inmediatamente para mostrar los cambios
        setIsEditing(false);
        setSaveSuccess(true);
        
        // Forzar re-renderización del componente completo
        setRefreshKey(prev => prev + 1);
        
        // Forzar re-renderización del componente padre si existe la función
        if (onUpdateMedicalInfo) {
          onUpdateMedicalInfo();
        }
        
        // Auto-hide success message
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error(`Failed to update medical info: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating medical info:', error);
      setError('Error saving medical information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar visitas aprobadas
  const updateApprovedVisits = async (discipline, value) => {
    try {
      const field = `${discipline}_approved_visits`;
      const parsedValue = parseInt(value) || 0;
      
      // Actualizar el estado local inmediatamente para una respuesta instantánea
      setApprovedVisits(prev => ({
        ...prev,
        [discipline]: parsedValue
      }));
      
      const response = await fetch(`${API_BASE_URL}/cert-periods/${certPeriodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: parsedValue
        })
      });

      if (!response.ok) {
        // Si falla la actualización, revertir el cambio local
        const certResponse = await fetch(`${API_BASE_URL}/cert-periods/${certPeriodId}`);
        if (certResponse.ok) {
          const certData = await certResponse.json();
          setApprovedVisits({
            pt: certData.pt_approved_visits || 0,
            ot: certData.ot_approved_visits || 0,
            st: certData.st_approved_visits || 0
          });
        }
        throw new Error(`Failed to update approved visits: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating approved visits:', error);
      // Mostrar mensaje de error opcional
      setError('Error updating approved visits. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMedicalData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on input change
  };

  const formatHeight = (totalInches) => {
    if (!totalInches || totalInches === 0) return 'Not recorded';
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round((totalInches % 12) * 10) / 10;
    return `${feet}' ${inches}"`;
  };

  const getUrgencyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getUrgencyBgColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return '#fef2f2';
      case 'high': return '#fff7ed';
      case 'medium': return '#fefce8';
      case 'low': return '#f0f9ff';
      default: return '#f9fafb';
    }
  };

  // Función para formatear homebound status de JSON a texto
  const formatHomeboundStatus = (homeboundStatus) => {
    if (!homeboundStatus) return 'Not specified';
    
    // Si es JSON string, parsearlo
    let homeboundData;
    try {
      homeboundData = typeof homeboundStatus === 'string' 
        ? JSON.parse(homeboundStatus) 
        : homeboundStatus;
    } catch (error) {
      // Si no es JSON válido, retornar tal como está
      return homeboundStatus;
    }

    // Si es objeto con propiedades booleanas, formatear
    if (typeof homeboundData === 'object') {
      const trueReasons = [];
      
      if (homeboundData.na) trueReasons.push('N/A');
      if (homeboundData.needs_assistance) trueReasons.push('Needs assistance for all activities');
      if (homeboundData.residual_weakness) trueReasons.push('Residual Weakness');
      if (homeboundData.requires_assistance_ambulate) trueReasons.push('Requires assistance to ambulate');
      if (homeboundData.confusion) trueReasons.push('Confusion, unable to go out of home alone');
      if (homeboundData.safely_leave) trueReasons.push('Unable to safely leave home unassisted');
      if (homeboundData.sob) trueReasons.push('Severe SOB, SOB upon exertion');
      if (homeboundData.adaptive_devices) trueReasons.push('Dependent upon adaptive device(s)');
      if (homeboundData.medical_restrictions) trueReasons.push('Medical restrictions');
      if (homeboundData.taxing_effort) trueReasons.push('Requires taxing effort to leave home');
      if (homeboundData.bedbound) trueReasons.push('Bedbound');
      if (homeboundData.transfers) trueReasons.push('Requires assistance with transfers');
      if (homeboundData.other) trueReasons.push('Other (Explain)');
      
      return trueReasons.length > 0 ? trueReasons.join(', ') : 'Not homebound';
    }

    // Si no es objeto, retornar tal como está
    return homeboundStatus;
  };

  // Función para formatear referral reason de JSON a texto
  const formatReferralReason = (referralReason) => {
    if (!referralReason) return 'Not specified';
    
    // Si es JSON string, parsearlo
    let referralData;
    try {
      referralData = typeof referralReason === 'string' 
        ? JSON.parse(referralReason) 
        : referralReason;
    } catch (error) {
      // Si no es JSON válido, retornar tal como está
      return referralReason;
    }

    // Si es objeto con propiedades booleanas, formatear
    if (typeof referralData === 'object') {
      const trueReasons = [];
      
      if (referralData.strength_balance) trueReasons.push('Strength & Balance');
      if (referralData.gait) trueReasons.push('Gait Training');
      if (referralData.adls) trueReasons.push('ADLs');
      if (referralData.orthopedic) trueReasons.push('Orthopedic');
      if (referralData.neurological) trueReasons.push('Neurological');
      if (referralData.wheelchair) trueReasons.push('Wheelchair');
      if (referralData.additional) trueReasons.push(`Additional: ${referralData.additional}`);
      
      return trueReasons.length > 0 ? trueReasons.join(', ') : 'Not specified';
    }

    // Si no es objeto, retornar tal como está
    return referralReason;
  };

  return (
    <div className="medical-info-component" key={refreshKey}>
      {/* Header Section */}
      <div className="medical-header">
        <div className="header-content">
          <div className="title-section">
            <div className="medical-icon">
              <i className="fas fa-heartbeat"></i>
            </div>
            <div className="title-text">
              <h2>Medical Information</h2>
              <p>Clinical data and patient status</p>
            </div>
          </div>
          
          <div className="header-actions">
            {saveSuccess && (
              <div className="success-indicator">
                <i className="fas fa-check-circle"></i>
                <span>Successfully saved</span>
              </div>
            )}
            
            <button 
              className={`edit-toggle-btn ${isEditing ? 'cancel' : 'edit'}`}
              onClick={() => {
                if (isEditing) {
                  // Restaurar datos originales al cancelar
                  setMedicalData(originalData);
                  console.log('Cancelled editing, restored original data:', originalData);
                }
                setIsEditing(!isEditing);
                setError('');
              }}
              disabled={loading}
            >
              <i className={isEditing ? 'fas fa-times' : 'fas fa-edit'}></i>
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="medical-content">
        {isEditing ? (
          /* EDIT MODE */
          <div className="edit-mode">
            {loading && (
              <div className="loading-overlay">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Saving medical information...</p>
                </div>
              </div>
            )}
            
            {/* Physical Information Section */}
            <div className="medical-section">
              <div className="section-header">
                <h3>
                  <i className="fas fa-user-injured"></i>
                  Physical Information
                </h3>
              </div>
              
              <div className="form-grid">
                {/* Weight */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-balance-scale"></i>
                    Weight
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="weight"
                      value={medicalData.weight}
                      onChange={handleInputChange}
                      placeholder="e.g. 150"
                      className="medical-input"
                    />
                    <span className="input-unit">lbs</span>
                  </div>
                </div>
                
                {/* Height */}
                <div className="form-group height-group">
                  <label>
                    <i className="fas fa-ruler-vertical"></i>
                    Height
                  </label>
                  <div className="height-inputs">
                    <div className="input-wrapper">
                      <input
                        type="number"
                        name="feet"
                        value={medicalData.feet}
                        onChange={handleInputChange}
                        placeholder="5"
                        className="medical-input height-input"
                        min="0"
                        max="8"
                      />
                      <span className="input-unit">ft</span>
                    </div>
                    <div className="input-wrapper">
                      <input
                        type="number"
                        name="inches"
                        value={medicalData.inches}
                        onChange={handleInputChange}
                        placeholder="8"
                        className="medical-input height-input"
                        min="0"
                        max="11"
                        step="0.1"
                      />
                      <span className="input-unit">in</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Information Section */}
            <div className="medical-section">
              <div className="section-header">
                <h3>
                  <i className="fas fa-clinic-medical"></i>
                  Clinical Information
                </h3>
              </div>
              
              <div className="form-grid">
                {/* Physician */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-user-doctor"></i>
                    Physician
                  </label>
                  <input
                    type="text"
                    name="physician"
                    value={medicalData.physician}
                    onChange={handleInputChange}
                    placeholder="Physician name"
                    className="medical-input"
                  />
                </div>
                
                {/* Nurse */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-user-nurse"></i>
                    Nurse
                  </label>
                  <input
                    type="text"
                    name="nurse"
                    value={medicalData.nurse}
                    onChange={handleInputChange}
                    placeholder="Nurse name"
                    className="medical-input"
                  />
                </div>
                
                {/* Urgency Level */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-bell"></i>
                    Urgency Level
                  </label>
                  <select
                    name="urgency_level"
                    value={medicalData.urgency_level}
                    onChange={handleInputChange}
                    className="medical-select"
                  >
                    <option value="">Select level</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                
                {/* Clinical Grouping */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-layer-group"></i>
                    Clinical Grouping
                  </label>
                  <input
                    type="text"
                    name="clinical_grouping"
                    value={medicalData.clinical_grouping}
                    onChange={handleInputChange}
                    placeholder="Clinical grouping"
                    className="medical-input"
                  />
                </div>
              </div>
            </div>

            {/* Medical History Section */}
            <div className="medical-section">
              <div className="section-header">
                <h3>
                  <i className="fas fa-file-medical-alt"></i>
                  Medical History
                </h3>
              </div>
              
              <div className="form-grid full-width">
                {/* Nursing Diagnosis */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-diagnoses"></i>
                    Nursing Diagnosis
                  </label>
                  <textarea
                    name="nursing_diagnosis"
                    value={medicalData.nursing_diagnosis}
                    onChange={handleInputChange}
                    placeholder="Detailed nursing diagnosis..."
                    className="medical-textarea"
                    rows="3"
                  />
                </div>
                
                {/* Past Medical History */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-file-medical"></i>
                    Past Medical History
                  </label>
                  <textarea
                    name="past_medical_history"
                    value={medicalData.past_medical_history}
                    onChange={handleInputChange}
                    placeholder="Patient's past medical history..."
                    className="medical-textarea"
                    rows="3"
                  />
                </div>
                
                {/* Prior Level of Function */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-chart-area"></i>
                    Prior Level of Function
                  </label>
                  <textarea
                    name="prior_level_of_function"
                    value={medicalData.prior_level_of_function}
                    onChange={handleInputChange}
                    placeholder="Description of previous functional level..."
                    className="medical-textarea"
                    rows="2"
                  />
                </div>
                
                {/* Referral Reason */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-share-alt"></i>
                    Referral Reasons
                  </label>
                  <textarea
                    name="referral_reason"
                    value={formatReferralReason(medicalData.referral_reason)}
                    onChange={(e) => {
                      // Al editar, mantener como texto plano
                      setMedicalData(prev => ({
                        ...prev,
                        referral_reason: e.target.value
                      }));
                    }}
                    placeholder="Reasons for referral..."
                    className="medical-textarea"
                    rows="2"
                  />
                </div>
                
              </div>
            </div>

            {/* Status Information Section */}
            <div className="medical-section">
              <div className="section-header">
                <h3>
                  <i className="fas fa-procedures"></i>
                  Patient Status
                </h3>
              </div>
              
              <div className="form-grid">
                {/* Weight Bearing Status */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-crutch"></i>
                    Weight Bearing Status
                  </label>
                  <input
                    type="text"
                    name="weight_bearing_status"
                    value={medicalData.weight_bearing_status}
                    onChange={handleInputChange}
                    placeholder="e.g. Full weight bearing"
                    className="medical-input"
                  />
                </div>
                
                {/* Homebound Status */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-house-user"></i>
                    Homebound Status
                  </label>
                  <input
                    type="text"
                    name="homebound_status"
                    value={medicalData.homebound_status}
                    onChange={handleInputChange}
                    placeholder="Homebound status"
                    className="medical-input"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  // Restaurar datos originales al cancelar
                  setMedicalData(originalData);
                  console.log('Cancelled editing from form actions, restored original data:', originalData);
                  setIsEditing(false);
                  setError('');
                }}
                disabled={loading}
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>
              
              <button 
                className="save-btn"
                onClick={saveMedicalInfo}
                disabled={loading}
              >
                <i className={loading ? 'fas fa-spinner fa-spin' : 'fas fa-save'}></i>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div className="view-mode">
            {/* Physical Information Display */}
            <div className="medical-section">
              <div className="section-header">
                <h3>
                  <i className="fas fa-user-injured"></i>
                  Physical Information
                </h3>
              </div>
              
              <div className="info-grid">
                <div className="info-card">
                  <div className="info-icon icon-weight">
                    <i className="fas fa-weight-scale"></i>
                  </div>
                  <div className="info-content">
                    <span className="info-label">Weight</span>
                    <span className="info-value">
                      {medicalData.weight ? `${medicalData.weight} lbs` : 'Not recorded'}
                    </span>
                  </div>
                </div>
                
                <div className="info-card">
                  <div className="info-icon icon-height">
                    <i className="fas fa-ruler-vertical"></i>
                  </div>
                  <div className="info-content">
                    <span className="info-label">Height</span>
                    <span className="info-value">
                      {formatHeight(parseFloat(medicalData.height))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Information Display */}
            <div className="medical-section">
              <div className="section-header">
                <h3>
                  <i className="fas fa-clinic-medical"></i>
                  Clinical Information
                </h3>
              </div>
              
              <div className="info-grid">
                <div className="info-card">
                  <div className="info-icon icon-physician">
                    <i className="fas fa-user-doctor"></i>
                  </div>
                  <div className="info-content">
                    <span className="info-label">Physician</span>
                    <span className="info-value">
                      {medicalData.physician || 'Not assigned'}
                    </span>
                  </div>
                </div>
                
                <div className="info-card">
                  <div className="info-icon icon-nurse">
                    <i className="fas fa-user-nurse"></i>
                  </div>
                  <div className="info-content">
                    <span className="info-label">Nurse</span>
                    <span className="info-value">
                      {medicalData.nurse || 'Not assigned'}
                    </span>
                  </div>
                </div>
                
                <div className="info-card">
                  <div className="info-icon icon-clinical">
                    <i className="fas fa-layer-group"></i>
                  </div>
                  <div className="info-content">
                    <span className="info-label">Clinical Grouping</span>
                    <span className="info-value">
                      {medicalData.clinical_grouping || 'Not specified'}
                    </span>
                  </div>
                </div>
                
                <div className="info-card urgency-card">
                  <div className="info-icon icon-urgency">
                    <i className="fas fa-bell"></i>
                  </div>
                  <div className="info-content">
                    <span className="info-label">Urgency Level</span>
                    <span className="info-value">
                      {medicalData.urgency_level ? (
                        <span 
                          className="urgency-badge"
                          style={{
                            backgroundColor: getUrgencyBgColor(medicalData.urgency_level),
                            color: getUrgencyColor(medicalData.urgency_level)
                          }}
                        >
                          {medicalData.urgency_level}
                        </span>
                      ) : (
                        'Not specified'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical History Display */}
            <div className="medical-section">
              <div className="section-header">
                <h3>
                  <i className="fas fa-file-medical-alt"></i>
                  Medical History
                </h3>
              </div>
              
              <div className="text-info-grid">
                <div className="text-info-card">
                  <div className="text-info-header">
                    <i className="fas fa-stethoscope"></i>
                    <span>Nursing Diagnosis</span>
                  </div>
                  <div className="text-info-content">
                    {medicalData.nursing_diagnosis || 'Not recorded'}
                  </div>
                </div>
                
                <div className="text-info-card">
                  <div className="text-info-header">
                    <i className="fas fa-history"></i>
                    <span>Past Medical History</span>
                  </div>
                  <div className="text-info-content">
                    {medicalData.past_medical_history || 'Not recorded'}
                  </div>
                </div>
                
                <div className="text-info-card">
                  <div className="text-info-header">
                    <i className="fas fa-chart-area"></i>
                    <span>Prior Level of Function</span>
                  </div>
                  <div className="text-info-content">
                    {medicalData.prior_level_of_function || 'Not recorded'}
                  </div>
                </div>
                
                <div className="text-info-card">
                  <div className="text-info-header">
                    <i className="fas fa-clipboard-list"></i>
                    <span>Referral Reasons</span>
                  </div>
                  <div className="text-info-content">
                    {formatReferralReason(medicalData.referral_reason)}
                  </div>
                </div>
                
              </div>
            </div>

            {/* Status Information Display */}
            <div className="medical-section">
              <div className="section-header">
                <h3>
                  <i className="fas fa-procedures"></i>
                  Patient Status
                </h3>
              </div>
              
              <div className="info-grid">
                <div className="info-card">
                  <div className="info-icon icon-weight-bearing">
                    <i className="fas fa-crutch"></i>
                  </div>
                  <div className="info-content">
                    <span className="info-label">Weight Bearing</span>
                    <span className="info-value">
                      {medicalData.weight_bearing_status || 'Not specified'}
                    </span>
                  </div>
                </div>
                
                <div className="info-card">
                  <div className="info-icon icon-homebound">
                    <i className="fas fa-house-user"></i>
                  </div>
                  <div className="info-content">
                    <span className="info-label">Homebound Status</span>
                    <span className="info-value">
                      {formatHomeboundStatus(medicalData.homebound_status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approved Visits Section */}
        <div className="approved-visits-section">
          <div className="section-header">
            <h3>
              <i className="fas fa-calendar-alt"></i>
              Approved Visits (Discipline Limits)
            </h3>
          </div>
          
          <div className="visits-grid">
            {[
              { 
                key: 'pt', 
                name: 'Physical Therapy', 
                icon: 'fas fa-dumbbell', 
                color: '#60a5fa',
                bgColor: '#dbeafe',
                shadowColor: 'rgba(96, 165, 250, 0.3)' 
              },
              { 
                key: 'ot', 
                name: 'Occupational Therapy', 
                icon: 'fas fa-hands-helping', 
                color: '#a78bfa',
                bgColor: '#e9d5ff',
                shadowColor: 'rgba(167, 139, 250, 0.3)' 
              },
              { 
                key: 'st', 
                name: 'Speech Therapy', 
                icon: 'fas fa-microphone-alt', 
                color: '#34d399',
                bgColor: '#d1fae5',
                shadowColor: 'rgba(52, 211, 153, 0.3)' 
              }
            ].map(discipline => (
              <div 
                key={discipline.key} 
                className="visit-card"
                style={{ backgroundColor: discipline.bgColor }}
              >
                <div className="visit-header">
                  <div 
                    className="discipline-icon"
                    style={{ color: discipline.color }}
                  >
                    <i className={discipline.icon}></i>
                  </div>
                  <div className="discipline-info">
                    <h4>{discipline.name}</h4>
                    <span className="discipline-code">
                      {discipline.key.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="visit-input-section">
                  <label>Approved Visits</label>
                  <div className="visit-input-wrapper">
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={approvedVisits[discipline.key]}
                      onChange={(e) => updateApprovedVisits(discipline.key, e.target.value)}
                      className="visit-input"
                      style={{ borderColor: discipline.color }}
                    />
                    <span className="visit-unit">visits</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="visits-note">
            <i className="fas fa-info-circle"></i>
            <p>
              These limits control the maximum number of visits that can be 
              scheduled for each discipline during the certification period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalInfoComponent;