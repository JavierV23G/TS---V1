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
    agency: ''
  });
  
  // Estados simplificados
  const [certPeriods, setCertPeriods] = useState([]);
  const [activePeriodId, setActivePeriodId] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(true);
  const [isLoadingInsurances, setIsLoadingInsurances] = useState(true);
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  // FUNCIONES HELPER PARA FECHAS - CORREGIDAS PARA EVITAR PROBLEMAS DE TIMEZONE
  const createDateFromString = (dateString) => {
    if (!dateString) return null;
    
    // Si viene en formato YYYY-MM-DD de la API
    if (dateString.includes('-') && dateString.length === 10) {
      const [year, month, day] = dateString.split('-').map(Number);
      // Crear fecha en timezone local para evitar shifts
      return new Date(year, month - 1, day);
    }
    
    // Fallback para otros formatos
    return new Date(dateString);
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = createDateFromString(dateString);
      if (!date || isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}/${day}/${year}`;
    } catch (error) {
      console.error('Error formatting date for display:', error);
      return '';
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = createDateFromString(dateString);
      if (!date || isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  };
  
  // FUNCIONES DE API
  
  // Obtener cert periods del paciente
  const fetchCertPeriods = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/patient/${patient.id}/cert-periods`);
      if (!response.ok) {
        throw new Error(`Failed to fetch cert periods: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching cert periods:', error);
      return [];
    }
  };
  
  // Cargar agencias
  const fetchAgencies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch agencies: ${response.status}`);
      }
      
      const staff = await response.json();
      return staff.filter(s => s.role?.toLowerCase() === 'agency');
    } catch (error) {
      console.error('Error fetching agencies:', error);
      return [];
    }
  };
  
  // Cargar seguros desde la API
  const fetchInsurances = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/insurances/`);
      if (!response.ok) {
        // Si no existe el endpoint de seguros, usar lista básica
        console.warn('Insurance endpoint not available, using basic list');
        return [
          { id: 1, name: 'Medicare' },
          { id: 2, name: 'Medicaid' },
          { id: 3, name: 'Blue Cross Blue Shield' },
          { id: 4, name: 'Aetna' },
          { id: 5, name: 'Cigna' },
          { id: 6, name: 'UnitedHealth' },
          { id: 7, name: 'Humana' },
          { id: 8, name: 'Kaiser Permanente' },
          { id: 9, name: 'Anthem' },
          { id: 10, name: 'Other' }
        ];
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching insurances:', error);
      // Lista de seguros básica como fallback
      return [
        { id: 1, name: 'Medicare' },
        { id: 2, name: 'Medicaid' },
        { id: 3, name: 'Blue Cross Blue Shield' },
        { id: 4, name: 'Aetna' },
        { id: 5, name: 'Cigna' },
        { id: 6, name: 'UnitedHealth' },
        { id: 7, name: 'Humana' },
        { id: 8, name: 'Kaiser Permanente' },
        { id: 9, name: 'Anthem' },
        { id: 10, name: 'Other' }
      ];
    }
  };
  
  // Crear nuevo período de certificación
  const createCertificationPeriod = async (startDate, endDate, insurance = '', notes = '') => {
    try {
      console.log('Creating certification period with:', { startDate, endDate, insurance, notes });
      
      const response = await fetch(`${API_BASE_URL}/patients/${patient.id}/certification-period`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          insurance: insurance || null,
          notes: notes || null
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
  
  // Actualizar período de certificación
  const updateCertificationPeriod = async (certId, startDate, endDate, insurance = '', notes = '') => {
    try {
      console.log('Updating certification period:', { certId, startDate, endDate, insurance, notes });
      
      const response = await fetch(`${API_BASE_URL}/cert-periods/${certId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          insurance: insurance || null,
          notes: notes || null
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to update certification period: ${response.status} - ${errorText}`);
      }
      
      const updatedPeriod = await response.json();
      console.log('Updated certification period:', updatedPeriod);
      return updatedPeriod;
      
    } catch (err) {
      console.error('Error updating certification period:', err);
      throw err;
    }
  };
  
  // Eliminar período de certificación
  const deleteCertificationPeriod = async (certId) => {
    try {
      console.log('Deleting certification period:', certId);
      
      const response = await fetch(`${API_BASE_URL}/cert-periods/${certId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to delete certification period: ${response.status} - ${errorText}`);
      }
      
      console.log('Deleted certification period successfully');
      return true;
      
    } catch (err) {
      console.error('Error deleting certification period:', err);
      throw err;
    }
  };
  
  // INICIALIZACIÓN CON CARGA DE DATOS REALES
  useEffect(() => {
    const loadPatientData = async () => {
      if (!patient) return;

      try {
        setIsLoadingAgencies(true);
        setIsLoadingInsurances(true);
        setError(null);

        // Cargar todo en paralelo
        const [agenciesData, insurancesData, certPeriodsData] = await Promise.all([
          fetchAgencies(),
          fetchInsurances(),
          fetchCertPeriods()
        ]);

        setAgencies(agenciesData);
        setInsurances(insurancesData);

        // Obtener nombre real de la agencia
        const agency = agenciesData.find(a => a.id === patient.agency_id);
        const agencyName = agency?.name || 'Unknown Agency';

        if (certPeriodsData && certPeriodsData.length > 0) {
          // Usar datos reales de la API
          const processedPeriods = certPeriodsData.map(period => ({
            id: period.id,
            period: `${formatDateForDisplay(period.start_date)} to ${formatDateForDisplay(period.end_date)}`,
            status: period.is_active ? 'active' : 'expired',
            startDate: period.start_date,
            endDate: period.end_date,
            insurance: period.insurance || 'Not available',
            agency: agencyName,
            notes: period.notes || ''
          }));

          // Encontrar el período activo
          const activePeriod = processedPeriods.find(p => p.status === 'active') || processedPeriods[0];
          
          setCertPeriods(processedPeriods);
          setActivePeriodId(activePeriod.id);
          
          // Establecer datos de edición
          if (activePeriod) {
            setEditData({
              startDate: formatDateForInput(activePeriod.startDate),
              endDate: formatDateForInput(activePeriod.endDate),
              insurance: activePeriod.insurance,
              agency: agencyName
            });
          }
        } else {
          // Crear período básico si no hay datos en la API
          const basicCertPeriod = {
            id: 'current',
            period: patient.cert_start_date && patient.cert_end_date 
              ? `${formatDateForDisplay(patient.cert_start_date)} to ${formatDateForDisplay(patient.cert_end_date)}`
              : 'No certification period set',
            status: 'active',
            startDate: patient.cert_start_date || '',
            endDate: patient.cert_end_date || '',
            insurance: patient.insurance || 'Not available',
            agency: agencyName
          };

          setCertPeriods([basicCertPeriod]);
          setActivePeriodId(basicCertPeriod.id);
          
          if (patient.cert_start_date || patient.cert_end_date) {
            setEditData({
              startDate: formatDateForInput(basicCertPeriod.startDate),
              endDate: formatDateForInput(basicCertPeriod.endDate),
              insurance: basicCertPeriod.insurance,
              agency: agencyName
            });
          }
        }

      } catch (err) {
        console.error('Error loading patient data:', err);
        setError('Failed to load certification data');
        
        // Fallback: crear período básico
        const basicCertPeriod = {
          id: 'current',
          period: 'No certification period set',
          status: 'active',
          startDate: '',
          endDate: '',
          insurance: 'Not available',
          agency: 'Unknown Agency'
        };

        setCertPeriods([basicCertPeriod]);
        setActivePeriodId(basicCertPeriod.id);
      } finally {
        setIsLoadingAgencies(false);
        setIsLoadingInsurances(false);
      }
    };

    loadPatientData();
  }, [patient]);
  
  // Calcular días restantes y progreso
  const calculateDaysRemaining = (certPeriod) => {
    if (!certPeriod || certPeriod === 'No certification period set') {
      return { percentage: 0, daysRemaining: 0, totalDays: 0, daysElapsed: 0 };
    }
    
    try {
      const [startDateStr, endDateStr] = certPeriod.split(' to ');
      
      // Usar nuestras funciones helper para evitar problemas de timezone
      const startDate = createDateFromString(startDateStr.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2'));
      const endDate = createDateFromString(endDateStr.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2'));
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Normalizar a medianoche
      
      if (!startDate || !endDate) {
        return { percentage: 0, daysRemaining: 0, totalDays: 0, daysElapsed: 0 };
      }
      
      // Calcular duración total y días restantes
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
  
  // Manejar cambios en campos de entrada
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
    
    // Calcular automáticamente 60 días después de la fecha de inicio
    if (name === 'startDate' && value) {
      try {
        const startDate = new Date(value + 'T00:00:00'); // Forzar timezone local
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
  
  // Guardar cambios en el período de certificación
  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validaciones básicas
      if (!editData.startDate || !editData.endDate) {
        setError('Start date and end date are required');
        return;
      }
      
      // Obtener nombre real de la agencia si está disponible
      let realAgencyName = editData.agency;
      if (patient?.agency_id && agencies.length > 0) {
        const agency = agencies.find(a => a.id === patient.agency_id);
        realAgencyName = agency?.name || editData.agency;
      }
      
      if (isAddingNew) {
        // Crear nuevo período de certificación
        try {
          const apiResponse = await createCertificationPeriod(
            editData.startDate, 
            editData.endDate,
            editData.insurance,
            editData.notes || ''
          );
          
          console.log('API created period:', apiResponse);
          
          // Transformar respuesta de API a nuestro formato
          const newPeriod = {
            id: apiResponse.id,
            period: `${formatDateForDisplay(apiResponse.start_date)} to ${formatDateForDisplay(apiResponse.end_date)}`,
            status: 'active',
            startDate: apiResponse.start_date,
            endDate: apiResponse.end_date,
            insurance: apiResponse.insurance || editData.insurance,
            agency: realAgencyName,
            notes: apiResponse.notes || ''
          };
          
          // Establecer todos los otros períodos como expirados y agregar el nuevo
          const updatedPeriods = certPeriods.map(p => ({
            ...p,
            status: 'expired'
          }));
          
          const newPeriods = [...updatedPeriods, newPeriod];
          setCertPeriods(newPeriods);
          setActivePeriodId(newPeriod.id);
          
        } catch (apiError) {
          console.error('API failed:', apiError);
          setError('Failed to save to server: ' + apiError.message);
          return;
        }
      } else {
        // Actualizar período existente
        const activePeriod = certPeriods.find(p => p.id === activePeriodId);
        
        if (activePeriod && activePeriod.id !== 'current') {
          try {
            const apiResponse = await updateCertificationPeriod(
              activePeriod.id,
              editData.startDate,
              editData.endDate,
              editData.insurance,
              editData.notes || ''
            );
            
            console.log('API updated period:', apiResponse);
            
            // Actualizar período en el estado local
            const updatedPeriods = certPeriods.map(p => 
              p.id === activePeriodId
                ? { 
                    ...p, 
                    period: `${formatDateForDisplay(apiResponse.start_date)} to ${formatDateForDisplay(apiResponse.end_date)}`,
                    startDate: apiResponse.start_date,
                    endDate: apiResponse.end_date,
                    insurance: apiResponse.insurance || editData.insurance,
                    agency: realAgencyName,
                    notes: apiResponse.notes || ''
                  } 
                : p
            );
            
            setCertPeriods(updatedPeriods);
            
          } catch (apiError) {
            console.error('API update failed:', apiError);
            setError('Failed to update on server: ' + apiError.message);
            return;
          }
        } else {
          // Actualización local para períodos básicos
          const updatedPeriods = certPeriods.map(p => 
            p.id === activePeriodId
              ? { 
                  ...p, 
                  period: `${formatDateForDisplay(editData.startDate)} to ${formatDateForDisplay(editData.endDate)}`,
                  startDate: editData.startDate,
                  endDate: editData.endDate,
                  insurance: editData.insurance,
                  agency: realAgencyName
                } 
              : p
          );
          
          setCertPeriods(updatedPeriods);
        }
      }
      
      // Notificar al componente padre
      if (onUpdateCertPeriod) {
        onUpdateCertPeriod({
          certPeriod: `${formatDateForDisplay(editData.startDate)} to ${formatDateForDisplay(editData.endDate)}`,
          insurance: editData.insurance,
          agency: realAgencyName,
          startDate: editData.startDate,
          endDate: editData.endDate   
        });
      }
      
      // Resetear estados
      setIsEditing(false);
      setIsAddingNew(false);
      
      // Limpiar error después de operación exitosa
      setTimeout(() => setError(null), 3000);
      
    } catch (err) {
      console.error('Error saving certification period:', err);
      setError('Failed to save certification period: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
    // Restaurar datos originales
    const activePeriod = certPeriods.find(p => p.id === activePeriodId);
    if (activePeriod) {
      setEditData({
        startDate: formatDateForInput(activePeriod.startDate),
        endDate: formatDateForInput(activePeriod.endDate),
        insurance: activePeriod.insurance || '',
        agency: activePeriod.agency || ''
      });
    }
    
    setIsEditing(false);
    setIsAddingNew(false);
    setError(null);
  };
  
  // Iniciar agregar nuevo período
  const handleAddNewPeriod = async () => {
    setIsAddingNew(true);
    setIsEditing(false);
    setError(null);
    
    // Establecer fecha de inicio como hoy
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    
    // Calcular fecha de fin (60 días después)
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 60);
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    // Obtener nombre real de la agencia
    let realAgencyName = 'Unknown Agency';
    if (patient?.agency_id && agencies.length > 0) {
      const agency = agencies.find(a => a.id === patient.agency_id);
      realAgencyName = agency?.name || 'Unknown Agency';
    }
    
    setEditData({
      startDate: formattedToday,
      endDate: formattedEndDate,
      insurance: patient?.insurance || 'Not available',
      agency: realAgencyName
    });
  };
  
  // Cambiar a un período de certificación diferente
  const handleSelectPeriod = (periodId) => {
    const selectedPeriod = certPeriods.find(p => p.id === periodId);
    if (!selectedPeriod) return;
    
    // Actualizar estado local para mostrar este período como activo
    const updatedPeriods = certPeriods.map(p => ({
      ...p,
      status: p.id === periodId ? 'active' : 'expired'
    }));
    
    setCertPeriods(updatedPeriods);
    setActivePeriodId(periodId);
    
    // Actualizar datos de edición
    setEditData({
      startDate: formatDateForInput(selectedPeriod.startDate),
      endDate: formatDateForInput(selectedPeriod.endDate),
      insurance: selectedPeriod.insurance,
      agency: selectedPeriod.agency
    });
    
    // Notificar al componente padre
    if (onUpdateCertPeriod) {
      onUpdateCertPeriod({
        certPeriod: selectedPeriod.period,
        insurance: selectedPeriod.insurance,
        agency: selectedPeriod.agency,
        startDate: selectedPeriod.startDate,
        endDate: selectedPeriod.endDate
      });
    }
    
    setIsViewingHistory(false);
  };
  
  // Iniciar proceso de confirmación de eliminación
  const handleConfirmDelete = (periodId) => {
    setConfirmDelete(periodId);
  };
  
  // Eliminar un período de certificación
  const handleDeletePeriod = async (periodId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // No puede eliminar si es el único período
      if (certPeriods.length <= 1) {
        setConfirmDelete(null);
        return;
      }
      
      const periodToDelete = certPeriods.find(p => p.id === periodId);
      
      // Si el período tiene ID real (no es 'current'), eliminar del servidor
      if (periodToDelete && periodToDelete.id !== 'current' && typeof periodToDelete.id === 'number') {
        try {
          await deleteCertificationPeriod(periodToDelete.id);
          console.log('Period deleted from server successfully');
        } catch (apiError) {
          console.error('Failed to delete from server:', apiError);
          setError('Failed to delete from server: ' + apiError.message);
          setConfirmDelete(null);
          return;
        }
      }
      
      // Eliminar del estado local
      removeFromLocalState(periodId);
      setConfirmDelete(null);
      
    } catch (err) {
      setError(err.message);
      setConfirmDelete(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función auxiliar para eliminar período del estado local
  const removeFromLocalState = (periodId) => {
    const periodToDelete = certPeriods.find(p => p.id === periodId);
    const updatedPeriods = certPeriods.filter(p => p.id !== periodId);
    
    // Si eliminamos el período activo, establecer otro como activo
    if (periodToDelete.status === 'active' && updatedPeriods.length > 0) {
      // Establecer el período más reciente como activo
      const sortedPeriods = [...updatedPeriods].sort((a, b) => {
        const aDate = new Date(a.endDate);
        const bDate = new Date(b.endDate);
        return bDate - aDate; // Ordenar descendente (más reciente primero)
      });
      
      const newActivePeriod = sortedPeriods[0];
      updatedPeriods.forEach(p => {
        if (p.id === newActivePeriod.id) {
          p.status = 'active';
        }
      });
      
      setActivePeriodId(newActivePeriod.id);
      
      // Actualizar datos de edición
      setEditData({
        startDate: formatDateForInput(newActivePeriod.startDate),
        endDate: formatDateForInput(newActivePeriod.endDate),
        insurance: newActivePeriod.insurance,
        agency: newActivePeriod.agency
      });
      
      // Notificar al componente padre
      if (onUpdateCertPeriod) {
        onUpdateCertPeriod({
          certPeriod: newActivePeriod.period,
          insurance: newActivePeriod.insurance,
          agency: newActivePeriod.agency,
          startDate: newActivePeriod.startDate,
          endDate: newActivePeriod.endDate
        });
      }
    }
    
    setCertPeriods(updatedPeriods);
  };
  
  // Cancelar confirmación de eliminación
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };
  
  // Obtener el período de certificación activo
  const getActivePeriod = () => {
    const activePeriod = certPeriods.find(p => p.status === 'active');
    return activePeriod ? activePeriod.period : null;
  };
  
  // Iniciar edición
  const handleStartEdit = async () => {
    setIsEditing(true);
    setError(null);
  };

  const selectedPeriod = getActivePeriod();
  const selectedPeriodData = certPeriods.find(p => p.status === 'active');
  const certInfo = calculateDaysRemaining(selectedPeriod);
  
  // Determinar color de progreso basado en días restantes
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
                disabled={isLoading}
              >
                <i className="fas fa-history"></i>
              </button>
              <button 
                className="edit-button" 
                onClick={handleStartEdit}
                title="Edit current period"
                disabled={isLoading}
              >
                <i className="fas fa-edit"></i>
              </button>
              <button 
                className="add-button" 
                onClick={handleAddNewPeriod}
                title="Add new certification period"
                disabled={isLoading}
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
        
        {/* Loading state para agencias y seguros */}
        {(isLoadingAgencies || isLoadingInsurances) && (
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
            <span>Loading data...</span>
          </div>
        )}
        
        {(isEditing || isAddingNew) ? (
          // Formulario de edición/agregado
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
                  required
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
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Insurance Provider</label>
              {isLoadingInsurances ? (
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
                  <span>Loading insurances...</span>
                </div>
              ) : insurances.length > 0 ? (
                <select 
                  name="insurance"
                  value={editData.insurance} 
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="">Select Insurance Provider</option>
                  {insurances.map((insurance) => (
                    <option key={insurance.id} value={insurance.name}>
                      {insurance.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  name="insurance"
                  value={editData.insurance} 
                  onChange={handleInputChange}
                  placeholder="Insurance Provider"
                  disabled={isLoading}
                  maxLength="100"
                />
              )}
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
                  maxLength="100"
                />
              )}
            </div>
            
            
            <div className="form-actions">
              <button 
                className="cancel-btn" 
                onClick={handleCancelEdit}
                disabled={isLoading}
              >
                <i className="fas fa-times"></i>
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
                  <>
                    <i className="fas fa-save"></i>
                    {isAddingNew ? 'Add Period' : 'Save Changes'}
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            {isViewingHistory ? (
              // Vista de historial de períodos de certificación
              <div className="cert-periods-history">
                <h4>Certification Periods History</h4>
                <div className="history-list">
                  {certPeriods.map((period) => (
                    <div 
                      key={period.id} 
                      className={`history-item ${period.status}`}
                    >
                      <div className="period-info">
                        <div className="period-dates">
                          <span>{period.period}</span>
                        </div>
                        {period.insurance && period.insurance !== 'Not available' && (
                          <div className="period-insurance">
                            <i className="fas fa-id-card"></i>
                            <span>{period.insurance}</span>
                          </div>
                        )}
                        {period.notes && (
                          <div className="period-notes">
                            <i className="fas fa-sticky-note"></i>
                            <span>{period.notes}</span>
                          </div>
                        )}
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
              // Vista normal de visualización
              <>
                {selectedPeriod && selectedPeriod !== 'No certification period set' ? (
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
                      <div className="info-label">
                        <i className="fas fa-id-card"></i>
                        Insurance Provider
                      </div>
                      <div className="info-value insurance-value">
                        {isLoadingInsurances ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fas fa-spinner fa-spin"></i>
                            Loading...
                          </span>
                        ) : (
                          selectedPeriodData?.insurance || 'Not available'
                        )}
                      </div>
                    </div>
                    
                    <div className="info-row">
                      <div className="info-label">
                        <i className="fas fa-hospital"></i>
                        Healthcare Agency
                      </div>
                      <div className="info-value agency-value">
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
                    
                    {selectedPeriodData?.notes && (
                      <div className="info-row">
                        <div className="info-label">
                          <i className="fas fa-sticky-note"></i>
                          Notes
                        </div>
                        <div className="info-value notes-value">
                          {selectedPeriodData.notes}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // No hay período de certificación establecido
                  <div className="no-cert-period">
                    <div className="empty-state">
                      <i className="fas fa-certificate" style={{ fontSize: '3rem', color: '#e5e7eb', marginBottom: '1rem' }}></i>
                      <h4 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>No Certification Period Set</h4>
                      <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
                        This patient doesn't have a certification period configured yet.
                      </p>
                      <button 
                        className="setup-cert-btn"
                        onClick={handleAddNewPeriod}
                        disabled={isLoading}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '10px 20px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.9rem'
                        }}
                      >
                        <i className="fas fa-plus"></i>
                        Set Up Certification Period
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CertificationPeriodComponent;