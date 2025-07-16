import React, { useState, useEffect } from 'react';
import '../../../../../styles/developer/Patients/InfoPaciente/ScheduleComponent.scss';
import VisitCompletionModal from './NotesAndSign/Evaluation/VisitCompletionModal';
import SignaturePad from './SignaturePad';

const ScheduleComponent = ({ patient, onUpdateSchedule, certPeriodDates }) => {
  const [isCalendarView, setIsCalendarView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteVisitId, setDeleteVisitId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [visits, setVisits] = useState([]);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionVisitData, setCompletionVisitData] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedFile, setSelectedFile] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [signatureData, setSignatureData] = useState({
    patient: null,
    therapist: null,
    date: null,
    patientOutside: false,
    therapistOutside: false
  });
  const [missedVisitData, setMissedVisitData] = useState({
    reason: '',
    action: '',
    mdNotified: false,
    noShow: false
  });
  const [weeklyLimits, setWeeklyLimits] = useState({});
  const [hoveredDay, setHoveredDay] = useState(null);
  
  // DYNAMIC STATE
  const [therapists, setTherapists] = useState([]);
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [certPeriods, setCertPeriods] = useState([]);
  const [currentCertPeriod, setCurrentCertPeriod] = useState(null);
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(true);
  const [isLoadingCertPeriods, setIsLoadingCertPeriods] = useState(true);
  const [isLoadingVisits, setIsLoadingVisits] = useState(true);
  
  const [formData, setFormData] = useState({
    visitType: '',
    therapist: '',
    date: '',
    time: '',
    notes: '',
    status: 'Scheduled',
    missedReason: '',
    timeInHour: '01',
    timeInMinute: '00',
    timeInAmPm: 'PM',
    timeOutHour: '02',
    timeOutMinute: '00',
    timeOutAmPm: 'PM',
    gCode: '',
    physician: '',
    certPeriod: '',
    documents: []
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // VISIT TYPES CONFIGURATION
  const visitTypes = [
    'Initial Evaluation',
    'Standard',
    'Reassessment (RA)',
    'Discharge (DC)',
    'Recert-Eval'
  ];

  // DISCIPLINE MAPPING - CORREGIDO
  const disciplineMapping = {
    'PT': 'PT',
    'PTA': 'PT', // En el backend PTA también se clasifica como PT
    'OT': 'OT',
    'COTA': 'OT', // En el backend COTA también se clasifica como OT
    'ST': 'ST',
    'STA': 'ST' // En el backend STA también se clasifica como ST
  };

  // ===== API FUNCTIONS =====

  // Fetch therapists from API
  const fetchTherapists = async () => {
    try {
      setIsLoadingTherapists(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/staff/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch staff: ${response.status} ${response.statusText}`);
      }
      
      const staffData = await response.json();
      console.log('Raw staff data:', staffData);
      
      // Filter for therapy staff only - CORREGIDO: usar roles exactos
      const therapyRoles = ['PT', 'PTA', 'OT', 'COTA', 'ST', 'STA'];
      const filteredTherapists = staffData.filter(staff => 
        staff.role && therapyRoles.includes(staff.role.toUpperCase()) && staff.is_active
      );
      
      console.log('Filtered therapists:', filteredTherapists);
      setTherapists(filteredTherapists);
      
    } catch (err) {
      console.error('Error fetching therapists:', err);
      setError(`Failed to load therapists: ${err.message}`);
      setTherapists([]);
    } finally {
      setIsLoadingTherapists(false);
    }
  };

  // Fetch assigned staff for patient
  const fetchAssignedStaff = async () => {
    if (!patient?.id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patient.id}/assigned-staff`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setAssignedStaff([]);
          return;
        }
        throw new Error(`Failed to fetch assigned staff: ${response.status} ${response.statusText}`);
      }
      
      const assignedData = await response.json();
      
      // Extract staff information from assignments
      const assignedStaffList = assignedData.map(assignment => assignment.staff).filter(staff => staff);
      setAssignedStaff(assignedStaffList);
      
    } catch (err) {
      console.error('Error fetching assigned staff:', err);
      setAssignedStaff([]);
    }
  };

  // Fetch certification periods for patient
  const fetchCertificationPeriods = async () => {
    if (!patient?.id) return;
    
    try {
      setIsLoadingCertPeriods(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/patient/${patient.id}/cert-periods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch certification periods: ${response.status} ${response.statusText}`);
      }
      
      const certData = await response.json();
      console.log('Certification periods data:', certData);
      
      setCertPeriods(certData);
      
      // CORREGIDO: Determinar período activo basado en localStorage o el más reciente
      let activePeriod = null;
      
      // 1. Verificar si hay una preferencia guardada del usuario
      const savedActiveId = localStorage.getItem(`active_cert_period_${patient.id}`);
      if (savedActiveId) {
        activePeriod = certData.find(period => period.id.toString() === savedActiveId);
      }
      
      // 2. Si no hay preferencia guardada, usar el período más reciente que contenga la fecha actual
      if (!activePeriod && certData.length > 0) {
        const today = new Date();
        activePeriod = certData.find(period => {
          const startDate = new Date(period.start_date);
          const endDate = new Date(period.end_date);
          return startDate <= today && today <= endDate;
        });
        
        // 3. Si ninguno es válido para hoy, usar el más reciente
        if (!activePeriod) {
          const sortedByDate = [...certData].sort((a, b) => 
            new Date(b.start_date) - new Date(a.start_date)
          );
          activePeriod = sortedByDate[0];
        }
      }
      
      setCurrentCertPeriod(activePeriod);
      
      if (activePeriod) {
        setFormData(prev => ({ ...prev, certPeriod: activePeriod.id }));
      }
      
    } catch (err) {
      console.error('Error fetching certification periods:', err);
      setError(`Failed to load certification periods: ${err.message}`);
      setCertPeriods([]);
      setCurrentCertPeriod(null);
    } finally {
      setIsLoadingCertPeriods(false);
    }
  };

  // CORREGIDO: Función para escuchar cambios en el período de certificación activo
  const handleCertPeriodChange = (newCertPeriodData) => {
    console.log('Certificate period changed:', newCertPeriodData);
    
    // Buscar el período correspondiente en la lista
    const matchingPeriod = certPeriods.find(period => {
      const periodStart = new Date(period.start_date).toDateString();
      const newStart = new Date(newCertPeriodData.startDate).toDateString();
      return periodStart === newStart;
    });
    
    if (matchingPeriod && matchingPeriod.id !== currentCertPeriod?.id) {
      console.log('Switching to certification period:', matchingPeriod);
      setCurrentCertPeriod(matchingPeriod);
      
      // Actualizar localStorage para recordar la preferencia del usuario
      localStorage.setItem(`active_cert_period_${patient.id}`, matchingPeriod.id.toString());
      
      // Limpiar visitas actuales y cargar las del nuevo período
      setVisits([]);
      setSelectedVisit(null);
      setShowVisitModal(false);
      
      // Las visitas se cargarán automáticamente por el useEffect que observa currentCertPeriod
    }
  };

  // Fetch visits - CORREGIDO: usar endpoint correcto
  const fetchVisitsForCertPeriod = async (certPeriodId) => {
    if (!patient?.id || !certPeriodId) return;
    
    try {
      setIsLoadingVisits(true);
      setError('');
      
      console.log(`Fetching visits for cert period: ${certPeriodId}, patient: ${patient.id}`);
      
      const response = await fetch(`${API_BASE_URL}/visits/certperiod/${certPeriodId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const visitsData = await response.json();
        console.log(`Got ${visitsData.length} visits from API:`, visitsData);
        
        // Filter for current patient
        const patientVisits = visitsData.filter(visit => 
          visit.patient_id === patient.id
        );
        
        console.log(`Filtered to ${patientVisits.length} visits for patient ${patient.id} in cert period ${certPeriodId}`);
        setVisits(patientVisits);
        
      } else if (response.status === 404) {
        console.log('No visits found for this certification period');
        setVisits([]);
      } else {
        const errorText = await response.text();
        console.warn(`Failed to fetch visits: ${response.status} - ${errorText}`);
        setVisits([]);
        setError('Failed to load visits from server');
      }
      
      // Initialize weekly limits
      const initialLimits = {};
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        const weekNumber = getWeekNumber(d);
        if (!initialLimits[weekNumber]) {
          initialLimits[weekNumber] = 2;
        }
      }
      setWeeklyLimits(initialLimits);
      
    } catch (err) {
      console.error('Error fetching visits:', err);
      setError(`Failed to load visits: ${err.message}`);
      setVisits([]);
    } finally {
      setIsLoadingVisits(false);
    }
  };

  // Create visit - CORREGIDO PARA USAR EL ENDPOINT CORRECTO
  const createVisit = async (visitData) => {
    try {
      console.log('Creating visit with data:', visitData);
      
      // Prepare data according to backend schema
      const createPayload = {
        patient_id: parseInt(patient.id),
        staff_id: parseInt(visitData.therapist),
        visit_date: visitData.date,
        visit_type: visitData.visitType,
        status: visitData.status || 'Scheduled',
        scheduled_time: visitData.time || null
      };

      console.log('Create payload for backend:', createPayload);

      // CORREGIDO: usar /visits/assign en lugar de /visits/
      const response = await fetch(`${API_BASE_URL}/visits/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload),
      });

      if (response.ok) {
        const newVisit = await response.json();
        console.log('Visit created successfully:', newVisit);
        return newVisit;
      } else {
        const errorText = await response.text();
        console.error('Failed to create visit:', errorText);
        throw new Error(`Failed to create visit: ${response.status} - ${errorText}`);
      }
      
    } catch (err) {
      console.error('Error creating visit:', err);
      throw err;
    }
  };

  // Update visit - CORREGIDO COMPLETAMENTE
  const updateVisit = async (visitId, visitData) => {
    try {
      console.log(`Updating visit ${visitId} with data:`, visitData);
  
      const params = {
        patient_id: patient.id,
        staff_id: visitData.therapist,
        certification_period_id: visitData.certPeriod || currentCertPeriod?.id,
        visit_date: visitData.date,
        visit_type: visitData.visitType,
        therapy_type: getTherapyTypeFromStaff(visitData.therapist),
        status: visitData.status,
        scheduled_time: visitData.time || undefined,
      };
  
      // Filter out null or undefined values so they aren't sent as query parameters
      Object.keys(params).forEach(key => (params[key] === null || params[key] === undefined) && delete params[key]);
  
      const queryParams = new URLSearchParams(params);
  
      console.log('Update URL query params:', queryParams.toString());
  
      const response = await fetch(`${API_BASE_URL}/visits/${visitId}?${queryParams.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.ok) {
        const updatedVisit = await response.json();
        console.log('Visit updated successfully:', updatedVisit);
        return updatedVisit;
      } else {
        const errorText = await response.text();
        console.error(`Failed to update visit: ${response.status} - ${errorText}`);
        throw new Error(`Failed to update visit: ${response.status} - ${errorText}`);
      }
      
    } catch (err) {
      console.error('Error updating visit:', err);
      throw err;
    }
  };

  // Delete visit
  const deleteVisitApi = async (visitId) => {
    try {
      console.log('Deleting visit:', visitId);
      
      const response = await fetch(`${API_BASE_URL}/visits/${visitId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete visit: ${response.status} - ${errorText}`);
      }
      
      console.log('Visit deleted successfully:', visitId);
      return visitId;
      
    } catch (err) {
      console.error('Error deleting visit:', err);
      throw err;
    }
  };

  // ===== HELPER FUNCTIONS =====

  // CORREGIDO: devolver disciplinas en mayúsculas exactas
  const getTherapyTypeFromStaff = (staffId) => {
    const therapist = therapists.find(t => t.id === parseInt(staffId));
    if (!therapist) return 'Other';
    
    const role = therapist.role.toUpperCase();
    return disciplineMapping[role] || role; // Usa el rol directo si no está en el mapping
  };

  const formatDateToLocalISOString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWeekNumber = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - startOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  };

  const canScheduleVisit = (date) => {
    const visitDate = new Date(date);
    const weekNumber = getWeekNumber(visitDate);
    const weekVisits = visits.filter(
      (visit) =>
        getWeekNumber(new Date(visit.visit_date)) === weekNumber &&
        visit.status === 'Scheduled'
    ).length;
    const limit = weeklyLimits[weekNumber] || 2;
    return weekVisits < limit;
  };

  const getTherapistName = (therapistId) => {
    const therapist = therapists.find((t) => t.id === parseInt(therapistId));
    return therapist ? therapist.name : 'Unknown Therapist';
  };

  const getTherapistType = (therapistId) => {
    const therapist = therapists.find((t) => t.id === parseInt(therapistId));
    return therapist ? therapist.role.toUpperCase() : null;
  };

  const getTherapistColors = (therapistId) => {
    const therapistType = getTherapistType(therapistId);
    const colors = {
      PT: { primary: '#4f46e5', secondary: '#e0e7ff' },
      PTA: { primary: '#6366f1', secondary: '#e0e7ff' },
      OT: { primary: '#0ea5e9', secondary: '#e0f2fe' },
      COTA: { primary: '#38bdf8', secondary: '#e0f2fe' },
      ST: { primary: '#14b8a6', secondary: '#d1fae5' },
      STA: { primary: '#2dd4bf', secondary: '#d1fae5' },
    };
    return therapistType && colors[therapistType] ? colors[therapistType] : { primary: '#64748b', secondary: '#f1f5f9' };
  };

  const getStatusColor = (statusId) => {
    const colors = {
      Scheduled: '#10b981',
      Completed: '#3b82f6',
      Missed: '#ef4444',
      Pending: '#f59e0b',
      Cancelled: '#64748b',
    };
    return colors[statusId] || '#64748b';
  };

  const isWithinCertPeriod = (visitDateStr) => {
    if (!currentCertPeriod) return true;
    const visitDate = new Date(visitDateStr);
    const startDate = new Date(currentCertPeriod.start_date);
    const endDate = new Date(currentCertPeriod.end_date);
    return visitDate >= startDate && visitDate <= endDate;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Organize therapists: assigned first, then separator, then all others
  const getOrganizedTherapists = () => {
    const assignedIds = assignedStaff.map(staff => staff.id);
    const assignedTherapists = therapists.filter(therapist => assignedIds.includes(therapist.id));
    const unassignedTherapists = therapists.filter(therapist => !assignedIds.includes(therapist.id));
    
    return { assignedTherapists, unassignedTherapists };
  };

  // ===== USEEFFECTS =====

  // Initialize data loading
  useEffect(() => {
    fetchTherapists();
  }, []);

  useEffect(() => {
    if (patient?.id) {
      fetchCertificationPeriods();
      fetchAssignedStaff();
    }
  }, [patient?.id]);

  // CORREGIDO: Escuchar cambios en el período de certificación desde el componente padre
  useEffect(() => {
    if (certPeriodDates && onUpdateSchedule) {
      handleCertPeriodChange(certPeriodDates);
    }
  }, [certPeriodDates]);

  // Load visits when certification period changes
  useEffect(() => {
    if (currentCertPeriod?.id) {
      console.log('Loading visits for certification period:', currentCertPeriod);
      fetchVisitsForCertPeriod(currentCertPeriod.id);
    } else {
      console.log('No certification period selected, clearing visits');
      setVisits([]);
    }
  }, [currentCertPeriod?.id, patient?.id]);

  // Update form data when selected visit changes
  useEffect(() => {
    if (selectedVisit) {
      setFormData({
        visitType: selectedVisit.visit_type || '',
        therapist: selectedVisit.staff_id?.toString() || '',
        date: selectedVisit.visit_date || formatDateToLocalISOString(new Date()),
        time: selectedVisit.scheduled_time || '',
        notes: selectedVisit.notes || '',
        status: selectedVisit.status || 'Scheduled',
        missedReason: selectedVisit.missedReason || '',
        timeInHour: '01',
        timeInMinute: '00',
        timeInAmPm: 'PM',
        timeOutHour: '02',
        timeOutMinute: '00',
        timeOutAmPm: 'PM',
        gCode: selectedVisit.gCode || '',
        physician: selectedVisit.physician || '',
        certPeriod: selectedVisit.certification_period_id?.toString() || (currentCertPeriod?.id?.toString() || ''),
        documents: selectedVisit.documents || []
      });
      
      if (selectedVisit.rescheduledDate) setRescheduleDate(selectedVisit.rescheduledDate);
      if (selectedVisit.signatures) {
        setSignatureData({
          patient: selectedVisit.signatures.patient || null,
          therapist: selectedVisit.signatures.therapist || null,
          date: selectedVisit.signatures.date || null,
          patientOutside: selectedVisit.signatures.patientOutside || false,
          therapistOutside: selectedVisit.signatures.therapistOutside || false
        });
      }
    } else {
      setFormData({
        visitType: '',
        therapist: '',
        date: formatDateToLocalISOString(new Date()),
        time: '',
        notes: '',
        status: 'Scheduled',
        missedReason: '',
        timeInHour: '01',
        timeInMinute: '00',
        timeInAmPm: 'PM',
        timeOutHour: '02',
        timeOutMinute: '00',
        timeOutAmPm: 'PM',
        gCode: '',
        physician: '',
        certPeriod: currentCertPeriod?.id?.toString() || '',
        documents: []
      });
      setSignatureData({
        patient: null,
        therapist: null,
        date: null,
        patientOutside: false,
        therapistOutside: false
      });
      setRescheduleDate('');
    }
    setActiveTab('details');
  }, [selectedVisit, currentCertPeriod]);

  // ===== EVENT HANDLERS =====

  const handleShowCalendar = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsCalendarView(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleBackToVisits = () => {
    setIsCalendarView(false);
    setSelectedDate(null);
  };

  const handleLimitChange = (weekNumber, value) => {
    setWeeklyLimits((prev) => ({
      ...prev,
      [weekNumber]: parseInt(value) || 0,
    }));
  };

  const handleDayMouseEnter = (date) => {
    setHoveredDay(date);
  };

  const handleDayMouseLeave = () => {
    setHoveredDay(null);
  };

  const handleDateClick = (date) => {
    if (!canScheduleVisit(date)) {
      setError('Maximum number of visits for this week reached');
      return;
    }
    setSelectedDate(date);
    setSelectedVisit(null);
    setFormData({
      ...formData,
      date: formatDateToLocalISOString(date),
      time: '',
      visitType: '',
      therapist: '',
      notes: '',
      status: 'Scheduled',
      missedReason: '',
    });
    setShowVisitModal(true);
  };

  const handleOpenVisitModal = (visit = null) => {
    setSelectedVisit(visit);
    setShowVisitModal(true);
  };

  const handleInitiateDelete = (visitId, e) => {
    e.stopPropagation();
    setDeleteVisitId(visitId);
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteVisit = async () => {
    setIsDeleting(true);
    try {
      await deleteVisitApi(deleteVisitId);
      
      // CORREGIDO: actualizar estado inmediatamente
      const updatedVisits = visits.filter((visit) => visit.id !== deleteVisitId);
      setVisits(updatedVisits);
      
      if (onUpdateSchedule) {
        onUpdateSchedule(updatedVisits);
      }
      
      setError('✅ Visit deleted successfully!');
      setTimeout(() => setError(''), 3000);
      
    } catch (err) {
      setError('❌ Failed to delete visit: ' + err.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmModal(false);
      setDeleteVisitId(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const handleMissedVisitChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMissedVisitData({
      ...missedVisitData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSignatureChange = (type, data) => {
    setSignatureData({
      ...signatureData,
      [type]: data
    });
  };

  const handleSignatureCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSignatureData({
      ...signatureData,
      [name]: checked
    });
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setTimeout(() => {
      const newDocuments = [...formData.documents, {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        uploadDate: new Date().toISOString()
      }];
      setFormData({
        ...formData,
        documents: newDocuments
      });
      setSelectedFile(null);
      setIsLoading(false);
    }, 1000);
  };

  const handleRemoveDocument = (docId) => {
    const updatedDocs = formData.documents.filter(doc => doc.id !== docId);
    setFormData({
      ...formData,
      documents: updatedDocs
    });
  };

  const isTimeAvailable = (date, time, therapistId, visitId = null) => {
    const existingVisits = visits.filter(
      (visit) =>
        visit.visit_date === date &&
        visit.scheduled_time === time &&
        visit.staff_id === parseInt(therapistId) &&
        (visitId === null || visit.id !== visitId)
    );
    return existingVisits.length === 0;
  };

  // FUNCIÓN PRINCIPAL DE GUARDADO - COMPLETAMENTE CORREGIDA
  const handleSaveVisit = async () => {
    // Basic validation
    if (!formData.visitType || !formData.therapist || !formData.date) {
      setError('Please fill in all required fields (Visit Type, Therapist, and Date)');
      return;
    }

    // Time availability check
    if (formData.time && !isTimeAvailable(formData.date, formData.time, formData.therapist, selectedVisit?.id)) {
      setError('This time slot is already booked for the selected therapist');
      return;
    }

    // Weekly limit check for new visits
    if (!selectedVisit && !canScheduleVisit(formData.date)) {
      setError('Maximum number of visits for this week reached');
      return;
    }

    // Certification period validation
    if (currentCertPeriod) {
      const visitDate = new Date(formData.date);
      const startDate = new Date(currentCertPeriod.start_date);
      const endDate = new Date(currentCertPeriod.end_date);
      if (visitDate < startDate || visitDate > endDate) {
        setError('Visit date must be within the current certification period');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      let visitDataToSave = { ...formData };

      // Handle missed visit data
      if (activeTab === 'missedVisit' || formData.status === 'Missed') {
        visitDataToSave.status = 'Missed';
        if (missedVisitData.reason) {
          visitDataToSave.missedReason = missedVisitData.reason;
        }
      }

      // Handle reschedule
      if (activeTab === 'reschedule') {
        if (!rescheduleDate) {
          setError('Please select a new date for rescheduling');
          return;
        }
        visitDataToSave.date = rescheduleDate;
        visitDataToSave.status = 'Scheduled';
      }

      console.log('Saving visit data:', visitDataToSave);

      let result;

      if (selectedVisit) {
        // UPDATING EXISTING VISIT
        console.log('Updating existing visit with ID:', selectedVisit.id);
        
        result = await updateVisit(selectedVisit.id, visitDataToSave);
        console.log('Update result:', result);
        
        // CORREGIDO: actualizar estado inmediatamente y correctamente
        setVisits(prevVisits => {
          const updatedVisits = prevVisits.map(visit => 
            visit.id === selectedVisit.id ? { ...result } : visit
          );
          
          // Notify parent component
          if (onUpdateSchedule) {
            onUpdateSchedule(updatedVisits);
          }
          
          return updatedVisits;
        });
        
        console.log('Visit updated successfully in UI');
        
      } else {
        // CREATING NEW VISIT
        console.log('Creating new visit');
        
        result = await createVisit(visitDataToSave);
        console.log('Create result:', result);
        
        // CORREGIDO: actualizar estado inmediatamente
        setVisits(prevVisits => {
          const updatedVisits = [...prevVisits, result];
          
          // Notify parent component
          if (onUpdateSchedule) {
            onUpdateSchedule(updatedVisits);
          }
          
          return updatedVisits;
        });
        
        console.log('Visit created successfully');
      }

      // Handle completion modal for completed visits
      if (visitDataToSave.status === 'Completed' && 
          (!selectedVisit || selectedVisit.status !== 'Completed')) {
        setCompletionVisitData(result);
        setShowCompletionModal(true);
      }

      // Close modal and reset state
      setShowVisitModal(false);
      setSelectedVisit(null);
      setActiveTab('details');

      // Show success message
      const action = selectedVisit ? 'updated' : 'created';
      const statusMessage = visitDataToSave.status !== 'Scheduled' 
        ? ` and status changed to ${visitDataToSave.status}` 
        : '';
      
      setError(`✅ Visit ${action} successfully${statusMessage}!`);
      
      // Auto-clear success message
      setTimeout(() => {
        setError('');
      }, 4000);

    } catch (err) {
      console.error('Error saving visit:', err);
      setError(`❌ Failed to ${selectedVisit ? 'update' : 'create'} visit: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletionFormSave = async (formData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setVisits(prevVisits => {
          const updatedVisits = prevVisits.map((visit) =>
            visit.id === completionVisitData.id
              ? {
                  ...visit,
                  evaluationCompleted: true,
                  evaluationData: formData,
                }
              : visit
          );
          
          if (onUpdateSchedule) {
            onUpdateSchedule(updatedVisits);
          }
          
          return updatedVisits;
        });
        
        resolve();
      }, 2000);
    });
  };

  const getFilteredVisits = () => {
    let filtered = [...visits];
    filtered = filtered.filter((visit) => isWithinCertPeriod(visit.visit_date));
    if (activeFilter !== 'ALL') {
      filtered = filtered.filter((visit) => visit.status === activeFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((visit) => {
        const therapistName = getTherapistName(visit.staff_id).toLowerCase();
        const visitType = (visit.visit_type || '').toLowerCase();
        const notes = (visit.notes || '').toLowerCase();
        return (
          therapistName.includes(query) ||
          visitType.includes(query) ||
          notes.includes(query) ||
          visit.visit_date.includes(query)
        );
      });
    }
    return filtered;
  };

  const groupVisitsByMonth = () => {
    const filtered = getFilteredVisits();
    const grouped = {};
    filtered.forEach((visit) => {
      const date = new Date(visit.visit_date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(visit);
    });
    Object.keys(grouped).forEach((month) => {
      grouped[month].sort((a, b) => new Date(a.visit_date) - new Date(b.visit_date));
    });
    return grouped;
  };

  const getVisitsForDay = (date) => {
    const dateString = formatDateToLocalISOString(date);
    return visits.filter((visit) => visit.visit_date === dateString && isWithinCertPeriod(visit.visit_date));
  };

  // ===== RENDER FUNCTIONS =====

  const renderLoadingScreen = () => {
    return (
      <div className="loading-overlay">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-orbit"></div>
            <div className="spinner-orbit-secondary"></div>
            <svg className="spinner-circle" viewBox="0 0 50 50">
              <defs>
                <linearGradient id="gradient-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <circle
                className="path"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="4"
              />
            </svg>
            <div className="loading-particles">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="particle"></div>
              ))}
            </div>
          </div>
          <div className="loading-text">
            <span data-text="Loading">Loading</span>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteConfirmModal = () => {
    const visit = visits.find((v) => v.id === deleteVisitId);
    if (!visit) return null;
    const visitDate = new Date(visit.visit_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return (
      <div className="modal-overlay">
        <div className="modal-content delete-confirm-modal">
          <div className="modal-header delete-header">
            <h3>Delete Visit</h3>
            <button
              className="close-btn"
              onClick={() => setShowDeleteConfirmModal(false)}
              disabled={isDeleting}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body delete-body">
            <div className="delete-warning-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="delete-message">
              <h4>Are you sure you want to delete this visit?</h4>
              <p>
                <strong>{visit.visit_type}</strong> with{' '}
                {getTherapistName(visit.staff_id)} on {visitDate}
                {visit.scheduled_time ? ` at ${formatTime(visit.scheduled_time)}` : ''}
              </p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
          </div>
          <div className="modal-footer delete-footer">
            <button
              className="cancel-btn"
              onClick={() => setShowDeleteConfirmModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className="delete-confirm-btn"
              onClick={handleDeleteVisit}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="btn-loading">
                  <i className="fas fa-spinner fa-spin"></i> Deleting...
                </span>
              ) : (
                'Delete Visit'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderVisitModal = () => {
    if (!showVisitModal) return null;
    const isCompletedView = selectedVisit && selectedVisit.status === 'Completed';
    return (
      <div className="modal-overlay">
        <div className="modal-content modal-large">
          <div className="modal-header">
            <h3>
              {selectedVisit
                ? isCompletedView
                  ? 'Visit Detail'
                  : 'Edit Visit'
                : 'Schedule New Visit'}
            </h3>
            <button className="close-btn" onClick={() => setShowVisitModal(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}
            {isCompletedView ? (
              <div className="completed-visit-view">
                <div className="visit-details-column">
                  <h4>Visit Details</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        name="visitType"
                        value={formData.visitType}
                        onChange={handleInputChange}
                        className="form-input"
                      >
                        <option value="">Select Visit Type</option>
                        {visitTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>G-Code</label>
                    <input
                      type="text"
                      name="gCode"
                      value={formData.gCode}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-row time-row">
                    <div className="form-group time-group">
                      <label>Time In</label>
                      <div className="time-inputs">
                        <input
                          type="text"
                          name="timeInHour"
                          value={formData.timeInHour}
                          onChange={handleInputChange}
                        />
                        <span className="time-separator">:</span>
                        <input
                          type="text"
                          name="timeInMinute"
                          value={formData.timeInMinute}
                          onChange={handleInputChange}
                        />
                        <select
                          name="timeInAmPm"
                          value={formData.timeInAmPm}
                          onChange={handleInputChange}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group time-group">
                      <label>Time Out</label>
                      <div className="time-inputs">
                        <input
                          type="text"
                          name="timeOutHour"
                          value={formData.timeOutHour}
                          onChange={handleInputChange}
                        />
                        <span className="time-separator">:</span>
                        <input
                          type="text"
                          name="timeOutMinute"
                          value={formData.timeOutMinute}
                          onChange={handleInputChange}
                        />
                        <select
                          name="timeOutAmPm"
                          value={formData.timeOutAmPm}
                          onChange={handleInputChange}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Physician</label>
                    <input
                      type="text"
                      name="physician"
                      value={formData.physician}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Cert Period</label>
                    <select
                      name="certPeriod"
                      value={formData.certPeriod}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      {certPeriods.map((period) => (
                        <option key={period.id} value={period.id}>
                          {`${period.start_date} - ${period.end_date}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="form-input"
                      rows="5"
                    ></textarea>
                  </div>
                  <button
                    className="update-button"
                    onClick={handleSaveVisit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="btn-loading">
                        <i className="fas fa-spinner fa-spin"></i> Updating...
                      </span>
                    ) : (
                      'UPDATE'
                    )}
                  </button>
                </div>
                <div className="evaluation-column">
                  <div className="evaluation-section">
                    <div className="evaluation-header">
                      <h4>{getTherapyTypeFromStaff(formData.therapist)} EVALUATION</h4>
                      <div className="status-badge incomplete">Incomplete</div>
                    </div>
                    <div className="evaluation-info">
                      <p>Therapist: {getTherapistName(formData.therapist)}</p>
                    </div>
                    <div className="evaluation-actions">
                      <button className="edit-button">EDIT</button>
                      <button className="view-button">VIEW</button>
                    </div>
                  </div>
                  <div className="documents-section">
                    <h4>UPLOADED DOCUMENTS</h4>
                    {formData.documents.length === 0 ? (
                      <p className="no-documents">No files uploaded</p>
                    ) : (
                      <ul className="documents-list">
                        {formData.documents.map(doc => (
                          <li key={doc.id || doc} className="document-item">
                            <div className="document-icon">
                              <i className="fas fa-file-alt"></i>
                            </div>
                            <div className="document-info">
                              <span className="document-name">{typeof doc === 'string' ? doc : doc.name}</span>
                              {doc.size && (
                                <span className="document-size">{formatFileSize(doc.size)}</span>
                              )}
                            </div>
                            <button
                              className="remove-document"
                              onClick={() => handleRemoveDocument(doc.id || doc)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="upload-container">
                      <div className="file-input-container">
                        <input
                          type="file"
                          id="document-upload"
                          className="hidden-file-input"
                          onChange={handleFileSelect}
                        />
                        <label htmlFor="document-upload" className="file-label">
                          {selectedFile ? selectedFile.name : 'No file selected'}
                        </label>
                        <button className="choose-file-btn">CHOOSE FILE</button>
                      </div>
                      <button
                        className="upload-btn"
                        onClick={handleFileUpload}
                        disabled={!selectedFile || isLoading}
                      >
                        {isLoading ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          'UPLOAD'
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="forms-section">
                    <h4>OTHER FORMS</h4>
                    <div className="forms-buttons">
                      <button className="form-btn">ADD ADDENDUM</button>
                      <button className="form-btn">ADD SIGNATURES</button>
                      <button className="form-btn">ADD OQBI</button>
                      <button className="form-btn">ADD DC</button>
                      <button className="form-btn other-forms">OTHER FORMS</button>
                      <button className="form-btn sticky">ADD STICKY</button>
                      <button className="form-btn expense">ADD EXPENSE</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="visit-tabs">
                <div className="tabs-header">
                  <button
                    className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveTab('details')}
                  >
                    <i className="fas fa-info-circle"></i>
                    Details
                  </button>
                  <button
                    className={`tab-button ${activeTab === 'missedVisit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('missedVisit')}
                  >
                    <i className="fas fa-calendar-times"></i>
                    Missed Visit
                  </button>
                </div>
                <div className="tab-content">
                  {activeTab === 'details' && (
                    <div className="details-tab">
                      <div className="form-group">
                        <label>Visit Type <span className="required">*</span></label>
                        <select
                          name="visitType"
                          value={formData.visitType}
                          onChange={handleInputChange}
                          className="form-input"
                          required
                        >
                          <option value="">Select Visit Type</option>
                          {visitTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Therapist <span className="required">*</span></label>
                        {isLoadingTherapists ? (
                          <div className="loading-select">
                            <i className="fas fa-spinner fa-spin"></i>
                            Loading therapists...
                          </div>
                        ) : (
                          <select
                            name="therapist"
                            value={formData.therapist}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                          >
                            <option value="">Select Therapist</option>
                            {(() => {
                              const { assignedTherapists, unassignedTherapists } = getOrganizedTherapists();
                              return (
                                <>
                                  {assignedTherapists.length > 0 && (
                                    <optgroup label="Assigned Therapists">
                                      {assignedTherapists.map((therapist) => (
                                        <option key={`assigned-${therapist.id}`} value={therapist.id}>
                                          {therapist.name} ({therapist.role.toUpperCase()})
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                  {unassignedTherapists.length > 0 && (
                                    <optgroup label="All Available Therapists">
                                      {unassignedTherapists.map((therapist) => (
                                        <option key={`unassigned-${therapist.id}`} value={therapist.id}>
                                          {therapist.name} ({therapist.role.toUpperCase()})
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                </>
                              );
                            })()}
                          </select>
                        )}
                        {therapists.length === 0 && !isLoadingTherapists && (
                          <div className="no-therapists-message">
                            <i className="fas fa-exclamation-triangle"></i>
                            No therapists available. Please ensure therapy staff are added to the system.
                          </div>
                        )}
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Date <span className="required">*</span></label>
                          <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className="form-input"
                            min={currentCertPeriod?.start_date || undefined}
                            max={currentCertPeriod?.end_date || undefined}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Time</label>
                          <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </div>
                      </div>
                      {formData.status === 'Missed' && (
                        <div className="form-group">
                          <label>Reason for Missing</label>
                          <input
                            type="text"
                            name="missedReason"
                            value={formData.missedReason}
                            onChange={handleInputChange}
                            placeholder="Enter reason"
                            className="form-input"
                          />
                        </div>
                      )}
                      <div className="form-group">
                        <label>Comments</label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          className="form-input"
                          rows="3"
                          placeholder="Add any additional comments about this visit..."
                        ></textarea>
                      </div>
                      {currentCertPeriod && (
                        <div className="cert-period-info">
                          <div className="info-label">
                            <i className="fas fa-certificate"></i>
                            Current Certification Period
                          </div>
                          <div className="info-value">
                            {currentCertPeriod.start_date} to {currentCertPeriod.end_date}
                          </div>
                        </div>
                      )}
                     
                     
                    </div>
                  )}
                  {activeTab === 'missedVisit' && (
                    <div className="missed-visit-tab">
                      <h4>Missed Visit Report</h4>
                      <div className="form-group">
                        <label>REASON FOR MISSED VISIT:</label>
                        <input
                          type="text"
                          name="reason"
                          value={missedVisitData.reason}
                          onChange={handleMissedVisitChange}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>ACTION TAKEN:</label>
                        <textarea
                          name="action"
                          value={missedVisitData.action}
                          onChange={handleMissedVisitChange}
                          className="form-input"
                          rows="5"
                        ></textarea>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="mdNotified"
                          name="mdNotified"
                          checked={missedVisitData.mdNotified}
                          onChange={handleMissedVisitChange}
                        />
                        <label htmlFor="mdNotified">MD WAS NOTIFIED BY PHONE OF MISSED VISIT.</label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="noShow"
                          name="noShow"
                          checked={missedVisitData.noShow}
                          onChange={handleMissedVisitChange}
                        />
                        <label htmlFor="noShow">PATIENT WAS A NO-SHOW.</label>
                      </div>
                    </div>
                  )}
                  
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="cancel-btn" onClick={() => setShowVisitModal(false)}>
              Cancel
            </button>
            <button
              className="save-btn"
              onClick={handleSaveVisit}
              disabled={isLoading || !formData.visitType || !formData.therapist || !formData.date}
            >
              {isLoading ? (
                <span className="btn-loading">
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </span>
              ) : (
                activeTab === 'missedVisit' ? 'Submit Missed Visit' :
                activeTab === 'reschedule' ? 'Reschedule Visit' :
                selectedVisit ? 'Update Visit' : 'Save Visit'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysArray = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      daysArray.push(null);
    }
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      daysArray.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeksArray = [];
    let currentWeek = [];
    daysArray.forEach((day, index) => {
      currentWeek.push(day);
      if ((index + 1) % 7 === 0 || index === daysArray.length - 1) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });

    return (
      <div className="schedule-calendar">
        <div className="calendar-header">
          <button
            className="month-nav-btn"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            aria-label="Previous month"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <h3>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <button
            className="month-nav-btn"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            aria-label="Next month"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        <div className="calendar-main">
          <div className="calendar-weekdays">
            {weekDays.map((day, index) => (
              <div key={index} className="weekday">{day}</div>
            ))}
          </div>
          <div className="calendar-weeks">
            {weeksArray.map((week, weekIndex) => {
              const firstDayOfWeek = week.find((day) => day !== null);
              if (!firstDayOfWeek) return null;
              const weekNumber = getWeekNumber(firstDayOfWeek);
              const weekVisits = visits.filter(
                (v) => getWeekNumber(new Date(v.visit_date)) === weekNumber && v.status === 'Scheduled'
              ).length;
              const limit = weeklyLimits[weekNumber] || 2;
              const isOverScheduled = weekVisits >= limit;
              return (
                <div key={weekIndex} className="calendar-week-row">
                  <div className="week-limit">
                    <span>Limit:</span>
                    <input
                      type="number"
                      min="0"
                      value={limit}
                      onChange={(e) => handleLimitChange(weekNumber, e.target.value)}
                      className="limit-input"
                      style={{ width: '50px', margin: '0 5px' }}
                    />
                    <span className={isOverScheduled ? 'over-scheduled' : ''}>
                      ({weekVisits}/{limit})
                    </span>
                  </div>
                  <div className="calendar-days">
                    {week.map((day, dayIndex) => {
                      if (!day) return <div key={dayIndex} className="calendar-day empty"></div>;
                      const dayVisits = getVisitsForDay(day);
                      const today = new Date();
                      const isToday =
                        day.getDate() === today.getDate() &&
                        day.getMonth() === today.getMonth() &&
                        day.getFullYear() === today.getFullYear();
                      const isBlocked = !canScheduleVisit(day);
                      const isHovered = hoveredDay &&
                        day.getDate() === hoveredDay.getDate() &&
                        day.getMonth() === hoveredDay.getMonth() &&
                        day.getFullYear() === hoveredDay.getFullYear();
                      return (
                        <div
                          key={dayIndex}
                          className={`calendar-day ${dayVisits.length > 0 ? 'has-visits' : ''} ${isToday ? 'today' : ''} ${isBlocked ? 'blocked' : ''} ${isHovered ? 'hovered' : ''}`}
                          onClick={() => !isBlocked && handleDateClick(day)}
                          onMouseEnter={() => handleDayMouseEnter(day)}
                          onMouseLeave={handleDayMouseLeave}
                          style={{ height: dayVisits.length > 1 ? '200px' : '150px' }}
                        >
                          <div className="day-number">{day.getDate()}</div>
                          {dayVisits.length > 0 && (
                            <div className="day-visits-details">
                              {dayVisits.map((visit, vIndex) => {
                                const therapistColors = getTherapistColors(visit.staff_id);
                                const statusColor = getStatusColor(visit.status);
                                return (
                                  <div
                                    key={vIndex}
                                    className="visit-detail"
                                    style={{
                                      backgroundColor: therapistColors.secondary,
                                      borderLeft: `3px solid ${therapistColors.primary}`,
                                      padding: '10px',
                                      marginBottom: '8px',
                                      borderRadius: '6px',
                                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                                      transition: 'all 0.3s ease'
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenVisitModal(visit);
                                    }}
                                  >
                                    <div className="visit-time-container">
                                      <span className="visit-time">{visit.scheduled_time ? formatTime(visit.scheduled_time) : 'N/A'}</span>
                                      <span
                                        className="visit-status-dot"
                                        style={{
                                          backgroundColor: statusColor,
                                          display: 'inline-block',
                                          width: '8px',
                                          height: '8px',
                                          borderRadius: '50%',
                                          marginLeft: '5px',
                                          boxShadow: `0 0 4px ${statusColor}`
                                        }}
                                        title={visit.status}
                                      ></span>
                                    </div>
                                    <div className="visit-therapist-container">
                                      <span className="visit-therapist">{getTherapistName(visit.staff_id)}</span>
                                    </div>
                                    <div className="visit-purpose-container">
                                      <span className="visit-type">{visit.visit_type}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {isBlocked && <div className="blocked-overlay">Max Limit Reached</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderVisitCard = (visit) => {
    const therapistColors = getTherapistColors(visit.staff_id);
    const statusColor = getStatusColor(visit.status);
    const therapistType = getTherapistType(visit.staff_id);
    const [year, month, day] = visit.visit_date.split('-').map(Number);
    const visitDate = new Date(year, month - 1, day);

    // Unique key to force re-render when status changes
    const uniqueKey = `visit-${visit.id}-${visit.status}-${visit.visit_date}-${Date.now()}`;

    return (
      <div
        className="visit-card"
        key={uniqueKey}
        onClick={() => handleOpenVisitModal(visit)}
        style={{
          borderTopColor: therapistColors.primary,
          borderTopWidth: '4px',
        }}
      >
        <div
          className="visit-card-header"
          style={{
            backgroundColor: therapistColors.secondary,
            color: therapistColors.primary,
          }}
        >
          <div className="visit-type">{visit.visit_type}</div>
          <div
            className="visit-status"
            style={{
              backgroundColor: statusColor,
              color: 'white',
            }}
          >
            {visit.status}
          </div>
        </div>
        <div className="visit-card-body">
          <div className="visit-date-time">
            <i className="fas fa-calendar"></i>
            <div className="date-time-details">
              <span className="visit-date">
                {visitDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}
              </span>
              {visit.scheduled_time && <span className="visit-time">{formatTime(visit.scheduled_time)}</span>}
            </div>
          </div>
          <div className="visit-therapist">
            <div
              className="therapist-icon"
              style={{ backgroundColor: therapistColors.primary }}
            >
              {therapistType}
            </div>
            <span>{getTherapistName(visit.staff_id)}</span>
          </div>
          {visit.notes && (
            <div className="visit-notes">
              <i className="fas fa-sticky-note"></i>
              <span>{visit.notes}</span>
            </div>
          )}
          {visit.missedReason && (
            <div className="visit-missed-reason">
              <i className="fas fa-exclamation-circle"></i>
              <span>{visit.missedReason}</span>
            </div>
          )}
          {visit.documents && visit.documents.length > 0 && (
            <div className="visit-documents">
              <i className="fas fa-file-alt"></i>
              <span>
                {visit.documents.length} {visit.documents.length === 1 ? 'Document' : 'Documents'}
              </span>
            </div>
          )}
        </div>
        <div className="visit-card-actions">
          <button
            className="delete-btn"
            onClick={(e) => handleInitiateDelete(visit.id, e)}
            aria-label="Delete visit"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    );
  };

  const renderVisitsList = () => {
    const groupedVisits = groupVisitsByMonth();
    const sortedMonths = Object.keys(groupedVisits).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateA - dateB;
    });

    if (isLoadingVisits) {
      return (
        <div className="visits-loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Loading visits...</span>
          </div>
        </div>
      );
    }

    if (sortedMonths.length === 0) {
      return (
        <div className="empty-visits-container">
          <div className="empty-state">
            <i className="fas fa-calendar-times"></i>
            <h3>No Visits Found</h3>
            {currentCertPeriod ? (
              <p>No therapy visits have been scheduled for this certification period yet.</p>
            ) : (
              <p>Please ensure a certification period is set up before scheduling visits.</p>
            )}
            <button 
              className="add-visit-btn" 
              onClick={() => handleShowCalendar()}
              disabled={!currentCertPeriod}
            >
              <i className="fas fa-plus-circle"></i>
              <span>Schedule First Visit</span>
            </button>
            {!currentCertPeriod && (
              <div className="cert-period-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <span>A certification period must be set up before scheduling visits</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="visits-list-container">
        <div className="visits-header">
          <h3>Scheduled Therapy Visits</h3>
          {currentCertPeriod && (
            <div className="cert-period-indicator">
              <i className="fas fa-certificate"></i>
              <span>{currentCertPeriod.start_date} - {currentCertPeriod.end_date}</span>
            </div>
          )}
          <div className="header-actions">
            <button
              className="quick-add-btn"
              onClick={() => {
                setSelectedVisit(null);
                setShowVisitModal(true);
              }}
              disabled={!currentCertPeriod}
            >
              <i className="fas fa-plus"></i>
              <span>Quick Add</span>
            </button>
            <button className="view-calendar-btn" onClick={() => handleShowCalendar()}>
              <i className="fas fa-calendar-alt"></i>
              <span>View Calendar</span>
            </button>
          </div>
        </div>
        <div className="visits-filter">
          <div className="filter-pills">
            <button
              className={`filter-pill ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL')}
            >
              All
            </button>
            <button
              className={`filter-pill ${activeFilter === 'Scheduled' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Scheduled')}
            >
              Upcoming
            </button>
            <button
              className={`filter-pill ${activeFilter === 'Completed' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Completed')}
            >
              Completed
            </button>
            <button
              className={`filter-pill ${activeFilter === 'Missed' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Missed')}
            >
              Missed
            </button>
            <button
              className={`filter-pill ${activeFilter === 'Pending' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Pending')}
            >
              Pending
            </button>
          </div>
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search visits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
        <div className="visits-timeline">
          {sortedMonths.map((month) => (
            <div key={`${month}-${visits.length}`} className="month-group">
              <div className="month-header">
                <i className="fas fa-calendar-alt"></i>
                <h4>{month}</h4>
                <span className="visit-count">
                  {groupedVisits[month].length} {groupedVisits[month].length === 1 ? 'visit' : 'visits'}
                </span>
              </div>
              <div className="month-visits">
                {groupedVisits[month].map((visit) => renderVisitCard(visit))}
              </div>
            </div>
          ))}
        </div>
        <div className="add-visit-floating">
          <button
            className="add-visit-btn"
            onClick={() => {
              setSelectedVisit(null);
              setShowVisitModal(true);
            }}
            disabled={!currentCertPeriod}
            aria-label="Add new visit"
          >
            <i className="fas fa-plus"></i>
          </button>
          <div className="tooltip">Add New Visit</div>
        </div>
      </div>
    );
  };

  // Main component render
  return (
    <div className="schedule-component">
      <div className="card-header">
        <div className="header-title">
          <i className="fas fa-calendar-alt"></i>
          <h3>Patient Schedule</h3>
        </div>
        {(isLoadingTherapists || isLoadingCertPeriods || isLoadingVisits) && (
          <div className="header-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Loading...</span>
          </div>
        )}
      </div>

      <VisitCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        visitData={completionVisitData}
        onSave={handleCompletionFormSave}
      />

      <div className="card-body">
        {/* Global error display */}
        {error && (
          <div className={`error-banner ${error.includes('successfully') || error.includes('✅') ? 'success-banner' : 'error-banner'}`}>
            <i className={`fas ${error.includes('successfully') || error.includes('✅') ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
            <span>{error}</span>
            <button onClick={() => setError('')} className="close-error">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Loading screen overlay */}
        {isLoading && renderLoadingScreen()}

        {/* No certification period warning */}
        {!currentCertPeriod && !isLoadingCertPeriods && (
          <div className="no-cert-period-warning">
            <div className="warning-content">
              <i className="fas fa-exclamation-triangle"></i>
              <h4>No Active Certification Period</h4>
              <p>A certification period must be set up before scheduling visits for this patient.</p>
              <div className="warning-actions">
                <button 
                  className="setup-cert-btn"
                  onClick={() => {
                    alert('Please set up a certification period in the General Info tab first.');
                  }}
                >
                  <i className="fas fa-certificate"></i>
                  Set Up Certification Period
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        {currentCertPeriod && (
          <>
            {!isCalendarView ? (
              renderVisitsList()
            ) : (
              <div className="calendar-view">
                <div className="calendar-nav">
                  <button className="back-to-visits" onClick={handleBackToVisits}>
                    <i className="fas fa-arrow-left"></i>
                    <span>Back to Visits</span>
                  </button>
                  <button
                    className="add-visit-calendar"
                    onClick={() => {
                      setSelectedVisit(null);
                      setShowVisitModal(true);
                    }}
                  >
                    <i className="fas fa-plus"></i>
                    <span>Add Visit</span>
                  </button>
                </div>
                {renderCalendar()}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showVisitModal && renderVisitModal()}
      {showDeleteConfirmModal && renderDeleteConfirmModal()}
    </div>
  );
};

export default ScheduleComponent;