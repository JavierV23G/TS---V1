import React, { useState, useEffect } from 'react';
import '../../../../../styles/developer/Patients/InfoPaciente/MedicalInfoComponent.scss';

const MedicalInfoComponent = ({ 
  patient, 
  onUpdateMedicalInfo,
  // NUEVOS PROPS PARA SINCRONIZACIÓN
  scheduledVisits = [], // Visitas del calendario
  disciplines = null,   // Datos de disciplinas con frecuencias
  onSyncVisitsData      // Callback para sincronizar cambios
}) => {
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [medicalData, setMedicalData] = useState({
    weight: '',
    height: '',
    feet: '',
    inches: '',
    nursingDiagnosis: '',
    pmh: '',
    wbs: '',
    clinicalGrouping: '',
    homebound: '',
    physician: '',
    nurse: '',
    urgencyLevel: '',
    approvedVisits: {
      pt: { approved: '', used: '', status: 'waiting' },
      ot: { approved: '', used: '', status: 'waiting' },
      st: { approved: '', used: '', status: 'waiting' }
    }
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // ===== FUNCIONES DE ALMACENAMIENTO LOCAL =====
  
  // Guardar approved visits en localStorage
  const saveApprovedVisitsToLocal = (approvedVisitsData) => {
    if (patient?.id) {
      const key = `approvedVisits_${patient.id}`;
      localStorage.setItem(key, JSON.stringify(approvedVisitsData));
    }
  };

  // Cargar approved visits desde localStorage
  const loadApprovedVisitsFromLocal = () => {
    if (patient?.id) {
      const key = `approvedVisits_${patient.id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed;
        } catch (e) {
          console.warn('Error parsing stored approved visits:', e);
        }
      }
    }
    return null;
  };

  // ===== FUNCIONES DE SINCRONIZACIÓN =====
  
  // Calcular visitas usadas basado en visitas del calendario
  const calculateUsedVisits = (disciplineKey, visits = scheduledVisits) => {
    const disciplineMapping = {
      'pt': ['PT', 'PTA'],
      'ot': ['OT', 'COTA'],  
      'st': ['ST', 'STA']
    };
    
    const relevantRoles = disciplineMapping[disciplineKey] || [];
    
    // Filtrar visitas completadas y programadas para esta disciplina
    const disciplineVisits = visits.filter(visit => {
      const therapyType = visit.therapy_type?.toUpperCase();
      const status = visit.status?.toLowerCase();
      
      // Contar visitas que están completadas o programadas (no canceladas)
      const validStatuses = ['completed', 'scheduled', 'in_progress'];
      return relevantRoles.includes(therapyType) && validStatuses.includes(status);
    });
    
    return disciplineVisits.length;
  };

  // Sincronizar datos con otros componentes
  const syncWithOtherComponents = (updatedVisitsData) => {
    if (onSyncVisitsData && typeof onSyncVisitsData === 'function') {
      onSyncVisitsData(updatedVisitsData);
    }
  };

  // Obtener frecuencia de una disciplina desde el componente de disciplinas
  const getDisciplineFrequency = (disciplineKey) => {
    if (!disciplines) return null;
    
    const disciplineMap = {
      'pt': 'PT',
      'ot': 'OT', 
      'st': 'ST'
    };
    
    const disciplineType = disciplineMap[disciplineKey];
    return disciplines[disciplineType]?.frequency || null;
  };
  
  // Initialize with patient data
  useEffect(() => {
    if (patient && patient.id) {
      
      const totalInches = patient.height ? parseFloat(patient.height) : 0;
      const feet = totalInches > 0 ? Math.floor(totalInches / 12) : '';
      const inches = totalInches > 0 ? Math.round((totalInches % 12) * 10) / 10 : '';
      
      // Cargar approved visits desde localStorage primero, luego desde patient data
      let approvedVisitsData = {
        pt: { approved: '', used: '', status: 'waiting' },
        ot: { approved: '', used: '', status: 'waiting' },
        st: { approved: '', used: '', status: 'waiting' }
      };

      // Prioridad 1: localStorage
      const localData = loadApprovedVisitsFromLocal();
      if (localData) {
        approvedVisitsData = { ...approvedVisitsData, ...localData };
      }
      // Prioridad 2: patient data (como fallback)
      else if (patient.approved_visits) {
        try {
          const parsedVisits = typeof patient.approved_visits === 'string' 
            ? JSON.parse(patient.approved_visits) 
            : patient.approved_visits;
          approvedVisitsData = { ...approvedVisitsData, ...parsedVisits };
        } catch (e) {
          console.warn('Error parsing approved_visits:', e);
        }
      }
      
      setMedicalData({
        weight: patient.weight || '',
        height: totalInches.toString() || '',
        feet: feet,
        inches: inches,
        nursingDiagnosis: patient.nursing_diagnosis || '',
        pmh: patient.past_medical_history || '',
        wbs: patient.weight_bearing_status || '',
        clinicalGrouping: patient.clinical_grouping || '',
        homebound: patient.homebound_status || '',
        physician: patient.physician || '',
        nurse: patient.nurse || '',
        urgencyLevel: patient.urgency_level || '',
        approvedVisits: approvedVisitsData
      });
    }
  }, [patient]);

  // NUEVO: Sincronización automática con datos externos
  useEffect(() => {
    if (scheduledVisits.length >= 0) { // >= 0 para permitir arrays vacíos
      
      setMedicalData(prev => {
        const newApprovedVisits = { ...prev.approvedVisits };
        
        // Calcular visitas usadas para cada disciplina
        Object.keys(newApprovedVisits).forEach(discipline => {
          const usedCount = calculateUsedVisits(discipline, scheduledVisits);
          const currentApproved = parseInt(newApprovedVisits[discipline].approved) || 0;
          
          // Actualizar visitas usadas
          newApprovedVisits[discipline] = {
            ...newApprovedVisits[discipline],
            used: usedCount.toString()
          };
          
          // Actualizar status automáticamente
          if (currentApproved === 0) {
            newApprovedVisits[discipline].status = 'waiting';
          } else if (usedCount >= currentApproved && currentApproved > 0) {
            newApprovedVisits[discipline].status = 'no_more';
          } else if (currentApproved > 0 && usedCount < currentApproved) {
            newApprovedVisits[discipline].status = 'active';
          }
          
        });
        
        return {
          ...prev,
          approvedVisits: newApprovedVisits
        };
      });
    }
  }, [scheduledVisits]); // Se ejecuta cuando cambian las visitas del calendario

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMedicalData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle weight input specifically
  const handleWeightChange = (e) => {
    const value = e.target.value;
    setMedicalData(prev => ({
      ...prev,
      weight: value
    }));
  };
  
  // Handle feet input for height
  const handleFeetChange = (e) => {
    const feetValue = e.target.value ? parseInt(e.target.value) : '';
    const inchesValue = medicalData.inches ? parseFloat(medicalData.inches) : 0;
    const totalInches = feetValue ? (feetValue * 12) + inchesValue : inchesValue;
    
    setMedicalData(prev => ({
      ...prev,
      feet: feetValue,
      height: totalInches
    }));
  };
  
  // Handle inches input for height
  const handleInchesChange = (e) => {
    const inchesValue = e.target.value ? parseFloat(e.target.value) : '';
    const feetValue = medicalData.feet ? parseInt(medicalData.feet) : 0;
    const totalInches = feetValue ? (feetValue * 12) + inchesValue : inchesValue;
    
    setMedicalData(prev => ({
      ...prev,
      inches: inchesValue,
      height: totalInches
    }));
  };

  // Handle visits input changes - MEJORADO CON SINCRONIZACIÓN
  const handleVisitsChange = (discipline, field, value) => {
    const processedValue = value === '' ? '' : (parseInt(value) || 0);
    
    // Si estamos cambiando 'used' manualmente, bloquear auto-sync temporalmente
    const isManualUsedChange = field === 'used';
    
    const newApprovedVisits = {
      ...medicalData.approvedVisits,
      [discipline]: {
        ...medicalData.approvedVisits[discipline],
        [field]: processedValue
      }
    };

    // Auto-update status based on visits
    const disciplineData = newApprovedVisits[discipline];
    const approvedNum = parseInt(disciplineData.approved) || 0;
    const usedNum = isManualUsedChange ? processedValue : 
      parseInt(disciplineData.used) || calculateUsedVisits(discipline);
    
    // Actualizar used si no es cambio manual
    if (!isManualUsedChange) {
      disciplineData.used = usedNum;
    }
    
    if (approvedNum === 0) {
      disciplineData.status = 'waiting';
    } else if (usedNum >= approvedNum && approvedNum > 0) {
      disciplineData.status = 'no_more';
    } else if (approvedNum > 0 && usedNum < approvedNum) {
      disciplineData.status = 'active';
    }

    setMedicalData(prev => ({
      ...prev,
      approvedVisits: newApprovedVisits
    }));
    
    // NUEVO: Guardar automáticamente en localStorage
    saveApprovedVisitsToLocal(newApprovedVisits);

    // NUEVO: Sincronizar cambios con otros componentes
    if (field === 'approved') {
      syncWithOtherComponents({
        type: 'approved_visits_changed',
        discipline: discipline,
        field: field,
        value: processedValue,
        allVisits: newApprovedVisits
      });
    }
  };

  // Handle status change
  const handleStatusChange = (discipline, status) => {
    setMedicalData(prev => ({
      ...prev,
      approvedVisits: {
        ...prev.approvedVisits,
        [discipline]: {
          ...prev.approvedVisits[discipline],
          status: status
        }
      }
    }));
  };
  
  // Validate data before saving
  const validateMedicalData = () => {
    const errors = [];
    
    // Validate weight (should be a valid number string)
    if (medicalData.weight && (isNaN(medicalData.weight) || parseFloat(medicalData.weight) < 0)) {
      errors.push('Weight must be a valid positive number');
    }
    
    // Validate height (should be a valid number string) 
    if (medicalData.height && (isNaN(medicalData.height) || parseFloat(medicalData.height) < 0)) {
      errors.push('Height must be a valid positive number');
    }
    
    // Validate feet and inches inputs
    if (medicalData.feet && (isNaN(medicalData.feet) || parseInt(medicalData.feet) < 0)) {
      errors.push('Feet must be a valid positive number');
    }
    
    if (medicalData.inches && (isNaN(medicalData.inches) || parseFloat(medicalData.inches) < 0 || parseFloat(medicalData.inches) >= 12)) {
      errors.push('Inches must be between 0 and 11.9');
    }
    
    // Validate visits
    Object.entries(medicalData.approvedVisits).forEach(([discipline, data]) => {
      const disciplineInfo = getDisciplineDetails(discipline);
      
      if (data.approved && (isNaN(data.approved) || parseInt(data.approved) < 0)) {
        errors.push(`${disciplineInfo.shortName} approved visits must be a positive number`);
      }
      
      if (data.used && (isNaN(data.used) || parseInt(data.used) < 0)) {
        errors.push(`${disciplineInfo.shortName} used visits must be a positive number`);
      }
      
      const approvedNum = parseInt(data.approved) || 0;
      const usedNum = parseInt(data.used) || 0;
      
      if (usedNum > approvedNum && approvedNum > 0) {
        errors.push(`${disciplineInfo.shortName} used visits cannot exceed approved visits`);
      }
    });
    
    return errors;
  };

  // Save changes with improved error handling and validation
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // Validation
      if (!patient?.id) {
        throw new Error('Patient ID not available');
      }
      
      const validationErrors = validateMedicalData();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('; '));
      }
      
      // Prepare only medical data to save (no patient basic info)
      const medicalDataToSave = {
        weight: medicalData.weight ? medicalData.weight.toString() : '',
        height: medicalData.height ? medicalData.height.toString() : '',
        nursing_diagnosis: medicalData.nursingDiagnosis ? medicalData.nursingDiagnosis.trim() : '',
        past_medical_history: medicalData.pmh ? medicalData.pmh.trim() : '',
        weight_bearing_status: medicalData.wbs ? medicalData.wbs.trim() : '',
        clinical_grouping: medicalData.clinicalGrouping ? medicalData.clinicalGrouping.trim() : '',
        homebound_status: medicalData.homebound ? medicalData.homebound.trim() : '',
        physician: medicalData.physician ? medicalData.physician.trim() : '',
        nurse: medicalData.nurse ? medicalData.nurse.trim() : '',
        urgency_level: medicalData.urgencyLevel ? medicalData.urgencyLevel.trim() : '',
      };
      
      
      // Create URL parameters for only the medical fields that have values
      const params = new URLSearchParams();
      Object.entries(medicalDataToSave).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          params.append(key, value);
        }
      });
      
      // Make API call
      const response = await fetch(`${API_BASE_URL}/patients/${patient.id}?${params.toString()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Parsed error JSON:', errorJson);
          
          // Handle different error formats
          if (errorJson.detail) {
            if (Array.isArray(errorJson.detail)) {
              // FastAPI validation errors
              errorMessage = errorJson.detail.map(err => {
                const location = err.loc ? err.loc.join('.') : 'unknown';
                return `${location}: ${err.msg}`;
              }).join('; ');
            } else if (typeof errorJson.detail === 'string') {
              errorMessage = errorJson.detail;
            } else {
              errorMessage = JSON.stringify(errorJson.detail);
            }
          } else if (errorJson.message) {
            errorMessage = errorJson.message;
          } else if (errorJson.error) {
            errorMessage = errorJson.error;
          } else {
            errorMessage = JSON.stringify(errorJson);
          }
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          errorMessage = errorText || `HTTP ${response.status} error`;
        }
        
        throw new Error(`Failed to update patient medical info (${response.status}): ${errorMessage}`);
      }
      
      const responseData = await response.json();
      
      // Validate response
      if (!responseData || !responseData.patient_id) {
        throw new Error('Invalid response format from server');
      }
      
      // Update local state with API response
      const updatedPatient = {
        id: responseData.patient_id,
        full_name: responseData.full_name || patient.full_name,
        birthday: responseData.birthday || patient.birthday,
        gender: responseData.gender || patient.gender,
        address: responseData.address || patient.address,
        contact_info: responseData.contact_info || patient.contact_info,
        weight: responseData.weight || null,
        height: responseData.height || null,
        nursing_diagnosis: responseData.nursing_diagnosis || '',
        past_medical_history: responseData.past_medical_history || '',
        weight_bearing_status: responseData.weight_bearing_status || '',
        clinical_grouping: responseData.clinical_grouping || '',
        homebound_status: responseData.homebound_status || '',
        insurance: responseData.insurance || patient.insurance,
        physician: responseData.physician || patient.physician,
        agency_id: responseData.agency_id || patient.agency_id,
        urgency_level: responseData.urgency_level || patient.urgency_level,
        prior_level_of_function: responseData.prior_level_of_function || patient.prior_level_of_function,
        referral_reason: responseData.referral_reason || patient.referral_reason,
        required_disciplines: responseData.required_disciplines || patient.required_disciplines,
        is_active: responseData.is_active !== undefined ? responseData.is_active : patient.is_active
      };
      
      // Update local medical data
      const totalInches = updatedPatient.height ? parseFloat(updatedPatient.height) : 0;
      const feet = totalInches > 0 ? Math.floor(totalInches / 12) : '';
      const inches = totalInches > 0 ? Math.round((totalInches % 12) * 10) / 10 : '';
      
      setMedicalData(prev => ({
        ...prev,
        weight: updatedPatient.weight || '',
        height: totalInches.toString() || '',
        feet: feet,
        inches: inches,
        nursingDiagnosis: updatedPatient.nursing_diagnosis || '',
        pmh: updatedPatient.past_medical_history || '',
        wbs: updatedPatient.weight_bearing_status || '',
        clinicalGrouping: updatedPatient.clinical_grouping || '',
        homebound: updatedPatient.homebound_status || '',
        physician: updatedPatient.physician || '',
        nurse: updatedPatient.nurse || '',
        urgencyLevel: updatedPatient.urgency_level || ''
      }));
      
      // Notify parent component
      if (onUpdateMedicalInfo && typeof onUpdateMedicalInfo === 'function') {
        onUpdateMedicalInfo(updatedPatient);
      }
      
      // Success feedback
      setIsEditing(false);
      setSuccessMessage('Medical information updated successfully!');
      
    } catch (err) {
      console.error('Error saving medical data:', err);
      setError(err.message || 'Failed to save medical information');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    if (patient) {
      const totalInches = patient.height ? parseFloat(patient.height) : 0;
      const feet = totalInches > 0 ? Math.floor(totalInches / 12) : '';
      const inches = totalInches > 0 ? Math.round((totalInches % 12) * 10) / 10 : '';
      
      setMedicalData({
        weight: patient.weight || '',
        height: totalInches.toString() || '',
        feet: feet,
        inches: inches,
        nursingDiagnosis: patient.nursing_diagnosis || '',
        pmh: patient.past_medical_history || '',
        wbs: patient.weight_bearing_status || '',
        clinicalGrouping: patient.clinical_grouping || '',
        homebound: patient.homebound_status || '',
        physician: patient.physician || '',
        nurse: patient.nurse || '',
        urgencyLevel: patient.urgency_level || '',
        approvedVisits: {
          pt: { approved: '', used: '', status: 'waiting' },
          ot: { approved: '', used: '', status: 'waiting' },
          st: { approved: '', used: '', status: 'waiting' }
        }
      });
    }
    
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
  };

  // Format height for display in view mode
  const formatHeight = (totalInches) => {
    if (!totalInches || totalInches <= 0) return null;
    
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round((totalInches % 12) * 10) / 10;
    
    return { feet, inches };
  };

  // Get icon for clinical grouping
  const getClinicalGroupingIcon = (grouping) => {
    if (!grouping) return 'fas fa-layer-group';
    
    if (grouping.includes('Cardiac') || grouping.includes('Circulatory')) 
      return 'fas fa-heartbeat';
    if (grouping.includes('Respiratory')) 
      return 'fas fa-lungs';
    if (grouping.includes('Neuro')) 
      return 'fas fa-brain';
    if (grouping.includes('Wound')) 
      return 'fas fa-band-aid';
    if (grouping.includes('Musculoskeletal')) 
      return 'fas fa-bone';
    if (grouping.includes('Behavioral')) 
      return 'fas fa-brain';
    if (grouping.includes('Endocrine')) 
      return 'fas fa-pills';
    
    return 'fas fa-layer-group';
  };
  
  // Get color for clinical grouping
  const getClinicalGroupingColor = (grouping) => {
    if (!grouping) return '#64748b';
    
    if (grouping.includes('Cardiac') || grouping.includes('Circulatory')) 
      return '#ef4444';
    if (grouping.includes('Respiratory')) 
      return '#3b82f6';
    if (grouping.includes('Neuro')) 
      return '#8b5cf6';
    if (grouping.includes('Wound')) 
      return '#f97316';
    if (grouping.includes('Musculoskeletal')) 
      return '#14b8a6';
    if (grouping.includes('Behavioral')) 
      return '#a855f7';
    if (grouping.includes('Endocrine')) 
      return '#eab308';
    
    return '#64748b';
  };

  // Get discipline details
  const getDisciplineDetails = (discipline) => {
    const details = {
      pt: {
        name: 'Physical Therapy',
        shortName: 'PT',
        icon: 'fas fa-walking',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)'
      },
      ot: {
        name: 'Occupational Therapy',
        shortName: 'OT',
        icon: 'fas fa-hands',
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
      },
      st: {
        name: 'Speech Therapy',
        shortName: 'ST',
        icon: 'fas fa-comment-medical',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #059669)'
      }
    };
    return details[discipline];
  };

  // Get status details
  const getStatusDetails = (status) => {
    const statusDetails = {
      waiting: {
        text: 'Waiting for more visits',
        icon: 'fas fa-clock',
        color: '#64748b',
        bgColor: '#f1f5f9'
      },
      active: {
        text: 'Visits available',
        icon: 'fas fa-check-circle',
        color: '#10b981',
        bgColor: '#ecfdf5'
      },
      no_more: {
        text: 'No more visits approved',
        icon: 'fas fa-times-circle',
        color: '#ef4444',
        bgColor: '#fef2f2'
      }
    };
    return statusDetails[status];
  };

  // Get icon for urgency level
  const getUrgencyLevelIcon = (urgencyLevel) => {
    if (!urgencyLevel) return 'fas fa-exclamation-triangle';
    
    const level = urgencyLevel.toLowerCase();
    if (level.includes('high') || level.includes('urgent') || level.includes('critical')) 
      return 'fas fa-exclamation-triangle';
    if (level.includes('medium') || level.includes('moderate')) 
      return 'fas fa-exclamation-circle';
    if (level.includes('low') || level.includes('normal') || level.includes('routine')) 
      return 'fas fa-info-circle';
    
    return 'fas fa-exclamation-triangle';
  };
  
  // Get color for urgency level
  const getUrgencyLevelColor = (urgencyLevel) => {
    if (!urgencyLevel) return '#64748b';
    
    const level = urgencyLevel.toLowerCase();
    if (level.includes('high') || level.includes('urgent') || level.includes('critical')) 
      return '#ef4444';
    if (level.includes('medium') || level.includes('moderate')) 
      return '#f59e0b';
    if (level.includes('low') || level.includes('normal') || level.includes('routine')) 
      return '#10b981';
    
    return '#64748b';
  };

  // Helper para mostrar valores o "Not provided yet"
  const displayValue = (value, type = 'text') => {
    if (!value || value === '' || value === 0) {
      return <span className="no-data">Not provided yet</span>;
    }
    
    if (type === 'weight') {
      return (
        <div className="data-display">
          <span className="primary-data">{value}</span>
          <span className="secondary-data">lbs</span>
        </div>
      );
    }
    
    if (type === 'height') {
      const heightValue = parseFloat(value);
      const heightData = formatHeight(heightValue);
      if (!heightData || heightValue <= 0) return <span className="no-data">Not provided yet</span>;
      
      return (
        <div className="data-display">
          <span className="primary-data">
            {heightData.feet}' {heightData.inches}"
          </span>
          <span className="secondary-data">({heightValue} in)</span>
        </div>
      );
    }
    
    if (type === 'physician') {
      return <div className="data-box physician-data">{value}</div>;
    }
    
    if (type === 'nurse') {
      return <div className="data-box nurse-data">{value}</div>;
    }
    
    if (type === 'nursing-diagnosis') {
      return <div className="data-box nursing-diagnosis">{value}</div>;
    }
    
    if (type === 'pmh') {
      return <div className="data-box pmh-data">{value}</div>;
    }
    
    if (type === 'wbs') {
      return <div className="data-box wbs-data">{value}</div>;
    }
    
    if (type === 'homebound') {
      return <div className="data-box homebound-data">{value}</div>;
    }
    
    return <div className="data-box">{value}</div>;
  };

  // Show loading if no patient data
  if (!patient || !patient.id) {
    return (
      <div className="medical-info-component">
        <div className="card-header">
          <div className="header-title">
            <i className="fas fa-notes-medical"></i>
            <h3>Medical Information</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="loading-state">
            <i className="fas fa-notes-medical fa-2x" style={{ color: '#e5e7eb', marginBottom: '10px' }}></i>
            <span>Loading medical information...</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="medical-info-component">
      <div className="card-header">
        <div className="header-title">
          <i className="fas fa-notes-medical"></i>
          <h3>Medical Information</h3>
        </div>
        <div className="header-actions">
          {!isEditing && (
            <button 
              className="edit-button" 
              onClick={() => setIsEditing(true)}
              title="Edit medical information"
              disabled={isSaving}
            >
              <i className="fas fa-edit"></i>
            </button>
          )}
        </div>
      </div>
      
      <div className="card-body">
        {/* Success message */}
        {successMessage && (
          <div className="success-message" style={{
            marginBottom: '15px',
            padding: '12px',
            backgroundColor: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '500'
          }}>
            <i className="fas fa-check-circle"></i>
            <span style={{ flex: 1 }}>{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#166534',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="error-message" style={{
            marginBottom: '15px',
            padding: '12px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '500'
          }}>
            <i className="fas fa-exclamation-triangle"></i>
            <span style={{ flex: 1 }}>{error}</span>
            <button 
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {isEditing ? (
          // Edit form
          <div className="edit-form">
            <h4>
              <i className="fas fa-pen-fancy"></i>
              Edit Medical Information
            </h4>
            
            {isSaving && (
              <div className="saving-overlay">
                <div className="saving-animation">
                  <div className="loader">
                    <svg className="circular" viewBox="25 25 50 50">
                      <circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="3" strokeMiterlimit="10"/>
                    </svg>
                  </div>
                  <div className="saving-text">
                    <span>Saving</span>
                    <span className="dots"><span>.</span><span>.</span><span>.</span></span>
                  </div>
                </div>
                <div className="backdrop-blur"></div>
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group weight-input">
                <label>
                  <i className="fas fa-weight"></i>
                  Weight (lbs)
                </label>
                <div className="input-with-icon">
                  <input 
                    type="number" 
                    name="weight"
                    value={medicalData.weight} 
                    onChange={handleWeightChange}
                    min="0"
                    step="0.1"
                    placeholder="Enter weight"
                  />
                  <span className="unit-indicator">lbs</span>
                </div>
              </div>
              
              <div className="form-group height-input">
                <label>
                  <i className="fas fa-ruler-vertical"></i>
                  Height
                </label>
                <div className="height-inputs-container">
                  <div className="input-with-icon ft-input">
                    <input 
                      type="number" 
                      name="feet"
                      value={medicalData.feet} 
                      onChange={handleFeetChange}
                      min="0"
                      step="1"
                      placeholder="Feet"
                    />
                    <span className="unit-indicator">ft</span>
                  </div>
                  <div className="input-with-icon in-input">
                    <input 
                      type="number" 
                      name="inches"
                      value={medicalData.inches} 
                      onChange={handleInchesChange}
                      min="0"
                      max="11.9"
                      step="0.1"
                      placeholder="Inches"
                    />
                    <span className="unit-indicator">in</span>
                  </div>
                </div>
              </div>
              
              <div className="form-group clinical-group-select">
                <label>
                  <i className="fas fa-layer-group"></i>
                  Clinical Grouping
                </label>
                <select 
                  name="clinicalGrouping"
                  value={medicalData.clinicalGrouping} 
                  onChange={handleInputChange}
                >
                  <option value="">Select Clinical Grouping</option>
                  <option value="No wounds present">No wounds present</option>
                  <option value="Wound healing well, no signs of infection">Wound healing well, no signs of infection</option>
                  <option value="Clean wound, granulating tissue present">Clean wound, granulating tissue present</option>
                  <option value="Red, inflamed wound edges">Red, inflamed wound edges</option>
                  <option value="Wound with serous drainage">Wound with serous drainage</option>
                  <option value="Wound with purulent drainage">Wound with purulent drainage</option>
                  <option value="Wound with necrotic tissue">Wound with necrotic tissue</option>
                  <option value="Pressure ulcer, Stage 1">Pressure ulcer, Stage 1</option>
                  <option value="Pressure ulcer, Stage 2">Pressure ulcer, Stage 2</option>
                  <option value="Pressure ulcer, Stage 3">Pressure ulcer, Stage 3</option>
                  <option value="Pressure ulcer, Stage 4">Pressure ulcer, Stage 4</option>
                  <option value="Unstageable pressure ulcer">Unstageable pressure ulcer</option>
                  <option value="Deep tissue pressure injury">Deep tissue pressure injury</option>
                  <option value="Venous ulcer">Venous ulcer</option>
                  <option value="Arterial ulcer">Arterial ulcer</option>
                  <option value="Diabetic ulcer">Diabetic ulcer</option>
                  <option value="Surgical wound, well-healing">Surgical wound, well-healing</option>
                  <option value="Surgical wound, dehiscence present">Surgical wound, dehiscence present</option>
                  <option value="Abrasion/Skin tear">Abrasion/Skin tear</option>
                  <option value="To be assessed">To be assessed</option>
                  <option value="TBD">TBD</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>
                <i className="fas fa-heartbeat"></i>
                Nursing Diagnosis
              </label>
              <textarea 
                name="nursingDiagnosis"
                value={medicalData.nursingDiagnosis} 
                onChange={handleInputChange}
                placeholder="Enter nursing diagnosis"
                rows="2"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>
                <i className="fas fa-history"></i>
                PMH (Past Medical History)
              </label>
              <textarea 
                name="pmh"
                value={medicalData.pmh} 
                onChange={handleInputChange}
                placeholder="Enter past medical history"
                rows="3"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>
                <i className="fas fa-band-aid"></i>
                WBS (Weight Bearing Status)
              </label>
              <textarea 
                name="wbs"
                value={medicalData.wbs} 
                onChange={handleInputChange}
                placeholder="Enter weight bearing status"
                rows="2"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>
                <i className="fas fa-home"></i>
                Homebound Status
              </label>
              <textarea 
                name="homebound"
                value={medicalData.homebound} 
                onChange={handleInputChange}
                placeholder="Enter homebound status reason"
                rows="2"
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group physician-input">
                <label>
                  <i className="fas fa-user-md"></i>
                  Physician (MD)
                </label>
                <input 
                  type="text" 
                  name="physician"
                  value={medicalData.physician} 
                  onChange={handleInputChange}
                  placeholder="Enter physician name"
                />
              </div>
              
              <div className="form-group nurse-input">
                <label>
                  <i className="fas fa-plus-square"></i>
                  Nurse
                </label>
                <input 
                  type="text" 
                  name="nurse"
                  value={medicalData.nurse} 
                  onChange={handleInputChange}
                  placeholder="Enter nurse name"
                />
              </div>
            </div>
            
            <div className="form-group urgency-level-select">
              <label>
                <i className="fas fa-exclamation-triangle"></i>
                Urgency Level
              </label>
              <select 
                name="urgencyLevel"
                value={medicalData.urgencyLevel} 
                onChange={handleInputChange}
              >
                <option value="">Select Urgency Level</option>
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Approved Visits Section - EDIT MODE */}
            <div style={{ marginTop: '32px', paddingTop: '28px', borderTop: '2px solid #e2e8f0' }}>
              <h5 style={{ 
                margin: '0 0 24px 0', 
                fontSize: '16px', 
                color: '#0f172a', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="fas fa-calendar-check" style={{ 
                  color: '#3b82f6',
                  fontSize: '18px',
                  background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px'
                }}></i>
                Approved Visits Management
              </h5>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '20px' 
              }}>
                {Object.entries(medicalData.approvedVisits).map(([discipline, data]) => {
                  const disciplineInfo = getDisciplineDetails(discipline);
                  return (
                    <div key={discipline} style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '20px',
                      border: '2px solid #e5e7eb',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '14px', 
                        marginBottom: '20px' 
                      }}>
                        <div style={{ 
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          backgroundColor: `${disciplineInfo.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          color: disciplineInfo.color
                        }}>
                          <i className={disciplineInfo.icon}></i>
                        </div>
                        <div>
                          <h6 style={{ 
                            margin: '0 0 4px 0', 
                            fontSize: '15px', 
                            fontWeight: '600', 
                            color: '#1e293b' 
                          }}>
                            {disciplineInfo.name}
                          </h6>
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#64748b', 
                            fontWeight: '500', 
                            background: '#f1f5f9', 
                            padding: '2px 8px', 
                            borderRadius: '20px' 
                          }}>
                            {disciplineInfo.shortName}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ flex: '1' }}>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '11px', 
                              color: '#64748b', 
                              fontWeight: '700', 
                              marginBottom: '8px', 
                              textTransform: 'uppercase', 
                              letterSpacing: '1px' 
                            }}>
                              APPROVED
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={data.approved}
                              onChange={(e) => handleVisitsChange(discipline, 'approved', e.target.value)}
                              placeholder="0"
                              style={{
                                width: '100%',
                                height: '45px',
                                padding: '12px 16px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                textAlign: 'center',
                                background: '#ffffff',
                                color: '#1e293b',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                          <div style={{ flex: '1' }}>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '11px', 
                              color: '#64748b', 
                              fontWeight: '700', 
                              marginBottom: '8px', 
                              textTransform: 'uppercase', 
                              letterSpacing: '1px' 
                            }}>
                              USED {scheduledVisits.length > 0 && '(Auto-sync)'}
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={data.used}
                              onChange={(e) => handleVisitsChange(discipline, 'used', e.target.value)}
                              placeholder="0"
                              style={{
                                width: '100%',
                                height: '45px',
                                padding: '12px 16px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                textAlign: 'center',
                                background: '#ffffff',
                                color: '#1e293b',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        </div>
                        
                        <div style={{ marginTop: '16px' }}>
                          <label style={{ 
                            display: 'block', 
                            fontSize: '11px', 
                            color: '#64748b', 
                            fontWeight: '700', 
                            marginBottom: '8px', 
                            textTransform: 'uppercase', 
                            letterSpacing: '1px' 
                          }}>
                            STATUS
                          </label>
                          <select
                            value={data.status}
                            onChange={(e) => handleStatusChange(discipline, e.target.value)}
                            style={{
                              width: '100%',
                              height: '45px',
                              padding: '12px 16px',
                              border: '2px solid #e2e8f0',
                              borderRadius: '12px',
                              fontSize: '14px',
                              fontWeight: '500',
                              background: '#ffffff',
                              color: '#1e293b',
                              outline: 'none',
                              cursor: 'pointer',
                              boxSizing: 'border-box'
                            }}
                          >
                            <option value="waiting">Waiting for more visits</option>
                            <option value="active">Visits available</option>
                            <option value="no_more">No more visits approved</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Información de sincronización */}
              {(scheduledVisits.length > 0 || disciplines) && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                  border: '1px solid #0ea5e9',
                  borderRadius: '12px',
                  fontSize: '13px',
                  color: '#0c4a6e'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <i className="fas fa-sync-alt" style={{ color: '#0ea5e9' }}></i>
                    <strong>Synchronization Active</strong>
                  </div>
                  <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.5' }}>
                    {scheduledVisits.length > 0 && (
                      <li>✅ <strong>Used visits</strong> auto-calculate from {scheduledVisits.length} calendar visits</li>
                    )}
                    {disciplines && (
                      <li>✅ <strong>Frequencies</strong> sync with Disciplines component</li>
                    )}
                    <li>✅ Changes here <strong>sync instantly</strong> with Calendar and Disciplines</li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button className="cancel-btn" onClick={handleCancelEdit} disabled={isSaving}>
                <i className="fas fa-times"></i>
                Cancel
              </button>
              <button 
                className="save-btn" 
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // View mode
          <div className="medical-info-display">
            <div className="info-section weight-section">
              <div className="info-icon">
                <i className="fas fa-weight"></i>
              </div>
              <div className="info-content">
                <div className="info-label">Weight</div>
                <div className="info-value weight-value">
                  {displayValue(medicalData.weight, 'weight')}
                </div>
              </div>
            </div>
            
            <div className="info-section height-section">
              <div className="info-icon">
                <i className="fas fa-ruler-vertical"></i>
              </div>
              <div className="info-content">
                <div className="info-label">Height</div>
                <div className="info-value height-value">
                  {displayValue(medicalData.height, 'height')}
                </div>
              </div>
            </div>

            {/* Approved Visits Section - VIEW MODE */}
            <div className="info-section approved-visits-section-view">
              <div className="info-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="info-content">
                <div className="info-label">Approved Visits</div>
                <div className="info-value">
                  <div className="visits-grid-view">
                    {Object.entries(medicalData.approvedVisits).map(([discipline, data]) => {
                      const disciplineInfo = getDisciplineDetails(discipline);
                      const statusInfo = getStatusDetails(data.status);
                      
                      // Calcular valores, tratando campos vacíos como 0 para display
                      const approvedNum = data.approved === '' || data.approved === null ? 0 : parseInt(data.approved) || 0;
                      const usedNum = data.used === '' || data.used === null ? 0 : parseInt(data.used) || 0;
                      const remaining = Math.max(0, approvedNum - usedNum);
                      const progressPercentage = approvedNum > 0 ? (usedNum / approvedNum) * 100 : 0;
                      
                      // Determinar si mostrar "Not set up yet" o los valores
                      const isNotSetUp = approvedNum === 0 && usedNum === 0;
                      
                      // NUEVO: Obtener frecuencia desde disciplines
                      const frequency = getDisciplineFrequency(discipline);
                      const hasFrequency = frequency && frequency !== '';
                      
                      return (
                        <div key={discipline} className="visit-card-view">
                          <div className="visit-card-header">
                            <div className="discipline-badge" style={{ background: disciplineInfo.gradient }}>
                              <i className={disciplineInfo.icon}></i>
                              <span>{disciplineInfo.shortName}</span>
                              {hasFrequency && (
                                <span className="frequency-indicator" style={{
                                  fontSize: '10px',
                                  background: 'rgba(255,255,255,0.3)',
                                  padding: '2px 6px',
                                  borderRadius: '10px',
                                  marginLeft: '6px'
                                }}>
                                  {frequency}
                                </span>
                              )}
                            </div>
                            {isNotSetUp ? (
                              <div className="status-badge not-set" style={{ 
                                color: '#64748b', 
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0'
                              }}>
                                <i className="fas fa-clock"></i>
                                <span>Not set up yet</span>
                              </div>
                            ) : (
                              <div className="status-badge" style={{ 
                                color: statusInfo.color, 
                                backgroundColor: statusInfo.bgColor 
                              }}>
                                <i className={statusInfo.icon}></i>
                                <span>{statusInfo.text}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="visit-stats">
                            {isNotSetUp ? (
                              <div className="not-configured">
                                <i className="fas fa-plus-circle" style={{ 
                                  fontSize: '24px', 
                                  color: '#94a3b8', 
                                  marginBottom: '8px' 
                                }}></i>
                                <p style={{ 
                                  color: '#64748b', 
                                  fontSize: '14px', 
                                  margin: 0,
                                  textAlign: 'center'
                                }}>
                                  Visits not configured yet
                                </p>
                                <p style={{ 
                                  color: '#94a3b8', 
                                  fontSize: '12px', 
                                  margin: '4px 0 0 0',
                                  textAlign: 'center'
                                }}>
                                  Click edit to set up
                                </p>
                              </div>
                            ) : (
                              <>
                                <div className="stats-row">
                                  <div className="stat">
                                    <span className="stat-label">Approved</span>
                                    <span className="stat-value" style={{ color: disciplineInfo.color }}>
                                      {approvedNum}
                                    </span>
                                  </div>
                                  <div className="stat">
                                    <span className="stat-label">Used</span>
                                    <span className="stat-value">{usedNum}</span>
                                  </div>
                                  <div className="stat">
                                    <span className="stat-label">Remaining</span>
                                    <span className="stat-value remaining" style={{ 
                                      color: remaining > 0 ? disciplineInfo.color : '#ef4444' 
                                    }}>
                                      {remaining}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="progress-container">
                                  <div className="progress-bar">
                                    <div 
                                      className="progress-fill" 
                                      style={{ 
                                        width: `${progressPercentage}%`,
                                        background: progressPercentage >= 100 ? '#ef4444' : disciplineInfo.gradient
                                      }}
                                    ></div>
                                  </div>
                                  <span className="progress-text">
                                    {Math.round(progressPercentage)}% used
                                    {hasFrequency && (
                                      <span style={{ 
                                        fontSize: '11px', 
                                        color: '#64748b', 
                                        marginLeft: '8px' 
                                      }}>
                                        • Freq: {frequency}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          <div className="discipline-name">{disciplineInfo.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <div className="info-icon">
                <i className="fas fa-heartbeat"></i>
              </div>
              <div className="info-content">
                <div className="info-label">Nursing Diagnosis</div>
                <div className="info-value">
                  {displayValue(medicalData.nursingDiagnosis, 'nursing-diagnosis')}
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <div className="info-icon">
                <i className="fas fa-history"></i>
              </div>
              <div className="info-content">
                <div className="info-label">PMH (Past Medical History)</div>
                <div className="info-value">
                  {displayValue(medicalData.pmh, 'pmh')}
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <div className="info-icon">
                <i className="fas fa-band-aid"></i>
              </div>
              <div className="info-content">
                <div className="info-label">WBS (Weight Bearing Status)</div>
                <div className="info-value">
                  {displayValue(medicalData.wbs, 'wbs')}
                </div>
              </div>
            </div>
            
            <div className="info-section clinical-section">
              <div className="info-icon" style={{ 
                color: getClinicalGroupingColor(medicalData.clinicalGrouping),
                background: `${getClinicalGroupingColor(medicalData.clinicalGrouping)}15` 
              }}>
                <i className={getClinicalGroupingIcon(medicalData.clinicalGrouping)}></i>
              </div>
              <div className="info-content">
                <div className="info-label">Clinical Grouping</div>
                <div className="info-value">
                  {medicalData.clinicalGrouping ? (
                    <div className="clinical-grouping-badge" style={{ 
                      color: getClinicalGroupingColor(medicalData.clinicalGrouping),
                      borderColor: `${getClinicalGroupingColor(medicalData.clinicalGrouping)}50`,
                      background: `${getClinicalGroupingColor(medicalData.clinicalGrouping)}10`
                    }}>
                      <i className={getClinicalGroupingIcon(medicalData.clinicalGrouping)}></i>
                      <span>{medicalData.clinicalGrouping}</span>
                    </div>
                  ) : (
                    <span className="no-data">Not provided yet</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <div className="info-icon">
                <i className="fas fa-home"></i>
              </div>
              <div className="info-content">
                <div className="info-label">Homebound Status</div>
                <div className="info-value">
                  {displayValue(medicalData.homebound, 'homebound')}
                </div>
              </div>
            </div>
            
            <div className="info-section physician-section">
              <div className="info-icon">
                <i className="fas fa-user-md"></i>
              </div>
              <div className="info-content">
                <div className="info-label">Physician (MD)</div>
                <div className="info-value">
                  {displayValue(medicalData.physician, 'physician')}
                </div>
              </div>
            </div>
            
            <div className="info-section nurse-section">
              <div className="info-icon">
                <i className="fas fa-user-md"></i>
              </div>
              <div className="info-content">
                <div className="info-label">Nurse</div>
                <div className="info-value">
                  {displayValue(medicalData.nurse, 'nurse')}
                </div>
              </div>
            </div>
            
            <div className="info-section urgency-section">
              <div className="info-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="info-content">
                <div className="info-label">Urgency Level</div>
                <div className="info-value">
                  {medicalData.urgencyLevel ? (
                    <div className="urgency-level-badge" style={{ 
                      color: getUrgencyLevelColor(medicalData.urgencyLevel),
                      borderColor: `${getUrgencyLevelColor(medicalData.urgencyLevel)}50`,
                      background: `${getUrgencyLevelColor(medicalData.urgencyLevel)}10`
                    }}>
                      <i className={getUrgencyLevelIcon(medicalData.urgencyLevel)}></i>
                      <span>{medicalData.urgencyLevel}</span>
                    </div>
                  ) : (
                    <span className="no-data">Not provided yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalInfoComponent;