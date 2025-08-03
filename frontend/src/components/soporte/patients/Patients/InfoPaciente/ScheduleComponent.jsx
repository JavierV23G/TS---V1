import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../login/AuthContext';
import '../../../../../styles/developer/Patients/InfoPaciente/ScheduleComponent.scss';
import NoteTemplateModal from './NotesAndSign/NoteTemplateModal';
import VisitStatusModal from './VisitStatusModal';
import VisitModalComponent from './VisitModalComponent';
import SignaturePad from './SignaturePad';

const ScheduleComponent = ({ 
  patient, 
  onUpdateSchedule, 
  certPeriodDates,
  // NUEVOS PROPS PARA SINCRONIZACIÓN
  approvedVisits = null,      // Datos de medical info
  disciplines = null,         // Datos de disciplinas con frecuencias
  onSyncScheduleData          // Callback para sincronizar cambios
}) => {
  const { user } = useAuth(); // Get current logged user
  const [isCalendarView, setIsCalendarView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showVisitStatusModal, setShowVisitStatusModal] = useState(false);
  const [statusChangeVisit, setStatusChangeVisit] = useState(null);
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
  const [disciplineFilter, setDisciplineFilter] = useState('ALL'); // New filter for disciplines
  const [showDisciplineFilter, setShowDisciplineFilter] = useState(false); // Show/hide discipline filter
  // Completion modal state
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
  const [weeklyLimits, setWeeklyLimits] = useState({
    PT: {},  // Weekly limits for PT/PTA
    OT: {},  // Weekly limits for OT/COTA
    ST: {}   // Weekly limits for ST/STA
  });
  const [hoveredDay, setHoveredDay] = useState(null);
  const [showCompletedVisitModal, setShowCompletedVisitModal] = useState(false);
  const [completedVisitModalData, setCompletedVisitModalData] = useState(null);
  
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

  // ===== FUNCIONES DE SINCRONIZACIÓN =====
  
  // Sincronizar datos con otros componentes
  const syncWithOtherComponents = (syncData) => {
    if (onSyncScheduleData && typeof onSyncScheduleData === 'function') {
      onSyncScheduleData(syncData);
    }
  };

  // Obtener límite de visitas aprobadas para una disciplina
  const getApprovedVisitsLimit = (discipline) => {
    if (!approvedVisits) return null;
    
    const disciplineMap = {
      'PT': 'pt',
      'OT': 'ot',
      'ST': 'st'
    };
    
    const disciplineKey = disciplineMap[discipline];
    const approved = approvedVisits[disciplineKey]?.approved;
    
    return approved ? parseInt(approved) : null;
  };

  // Obtener visitas usadas para una disciplina
  const getUsedVisitsCount = (discipline) => {
    const disciplineRoles = {
      'PT': ['PT', 'PTA'],
      'OT': ['OT', 'COTA'],
      'ST': ['ST', 'STA']
    };
    
    const relevantRoles = disciplineRoles[discipline] || [];
    
    return visits.filter(visit => {
      const therapyType = visit.therapy_type?.toUpperCase();
      const status = visit.status?.toLowerCase();
      const validStatuses = ['completed', 'scheduled', 'in_progress'];
      return relevantRoles.includes(therapyType) && validStatuses.includes(status);
    }).length;
  };

  // Calcular weekly limits basado en approved visits y frecuencias
  const calculateWeeklyLimitsFromData = () => {
    if (!approvedVisits || !disciplines) return weeklyLimits;
    
    const newLimits = { PT: {}, OT: {}, ST: {} };
    
    Object.keys(newLimits).forEach(discipline => {
      const approved = getApprovedVisitsLimit(discipline);
      const frequency = disciplines[discipline]?.frequency;
      
      if (approved && frequency) {
        // Parsear frecuencia (ej: "2w1" = 2 visitas por 1 semana)
        const frequencyMatch = frequency.match(/(\d+)w(\d+)/);
        if (frequencyMatch) {
          const visitsPerPeriod = parseInt(frequencyMatch[1]);
          const weeksInPeriod = parseInt(frequencyMatch[2]);
          const visitsPerWeek = Math.ceil(visitsPerPeriod / weeksInPeriod);
          
          // Aplicar límite a todas las semanas del período de certificación
          if (currentCertPeriod) {
            const startDate = new Date(currentCertPeriod.start_date);
            const endDate = new Date(currentCertPeriod.end_date);
            const totalWeeks = Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));
            
            for (let week = 1; week <= totalWeeks; week++) {
              newLimits[discipline][week] = Math.min(visitsPerWeek, approved);
            }
          }
        }
      }
    });
    
    return newLimits;
  };

  // VISIT TYPES CONFIGURATION
  const visitTypes = [
    'Initial Evaluation',
    'Standard',
    'Reassessment (RA)',
    'Discharge (DC)',
    'Recert-Eval',
    'Regular therapy session',
    'Post-Hospital Eval',
    'SOC OASIS',
    'ROC OASIS',
    'ReCert OASIS',
    'Follow-Up OASIS',
    'DC OASIS',
    'Supervision Assessment'
  ];

  // DISCIPLINE MAPPING
  const disciplineMapping = {
    'PT': 'PT',
    'PTA': 'PT',
    'OT': 'OT',
    'COTA': 'OT',
    'ST': 'ST',
    'STA': 'ST'
  };

  // Check if current user is a therapist
  const isTherapistUser = () => {
    const therapistRoles = ['PT', 'PTA', 'OT', 'COTA', 'ST', 'STA'];
    return user && therapistRoles.includes(user.role?.toUpperCase());
  };

  // Check if current user can see all therapists
  const canSelectAllTherapists = () => {
    if (!user || !user.role) return false;
    
    // Normalize role to uppercase and handle different formats
    const normalizedRole = user.role.toString().toUpperCase().trim();
    const adminRoles = ['DEVELOPER', 'ADMIN', 'AGENCY', 'ADMINISTRATOR'];
    
    // Check if the role includes any admin role (in case format is like "Developer - Main")
    const canSeeAll = adminRoles.some(role => normalizedRole.includes(role));
    
    console.log('User role:', user.role, 'Normalized:', normalizedRole, 'Can see all therapists:', canSeeAll);
    return canSeeAll;
  };

  // Get therapist ID for current user if they are a therapist
  const getCurrentUserTherapistId = () => {
    if (!isTherapistUser()) return null;
    
    // Find therapist record that matches current user
    const userTherapist = therapists.find(therapist => 
      therapist.email === user.email || 
      therapist.user_id === user.id ||
      (therapist.name && user.name && therapist.name.toLowerCase() === user.name.toLowerCase())
    );
    
    return userTherapist?.id || null;
  };

  // Get the discipline of the current user
  const getCurrentUserDiscipline = () => {
    if (!user) return null;
    const role = user.role?.toUpperCase();
    return disciplineMapping[role] || null;
  };

  // Check if a therapist belongs to the same discipline as current user
  const isSameDiscipline = (therapistId) => {
    const currentUserDiscipline = getCurrentUserDiscipline();
    if (!currentUserDiscipline) return true; // Non-therapist users see all
    
    const therapistType = getTherapistType(therapistId);
    const therapistDiscipline = disciplineMapping[therapistType];
    
    return therapistDiscipline === currentUserDiscipline;
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
      
      // Filter for therapy staff only
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
      
      // Determine active period
      let activePeriod = null;
      
      const savedActiveId = localStorage.getItem(`active_cert_period_${patient.id}`);
      if (savedActiveId) {
        activePeriod = certData.find(period => period.id.toString() === savedActiveId);
      }
      
      if (!activePeriod && certData.length > 0) {
        const today = new Date();
        activePeriod = certData.find(period => {
          const startDate = new Date(period.start_date);
          const endDate = new Date(period.end_date);
          return startDate <= today && today <= endDate;
        });
        
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

  // Handle cert period change
  const handleCertPeriodChange = (newCertPeriodData) => {
    console.log('Certificate period changed:', newCertPeriodData);
    
    const matchingPeriod = certPeriods.find(period => {
      const periodStart = new Date(period.start_date).toDateString();
      const newStart = new Date(newCertPeriodData.startDate).toDateString();
      return periodStart === newStart;
    });
    
    if (matchingPeriod && matchingPeriod.id !== currentCertPeriod?.id) {
      console.log('Switching to certification period:', matchingPeriod);
      setCurrentCertPeriod(matchingPeriod);
      
      localStorage.setItem(`active_cert_period_${patient.id}`, matchingPeriod.id.toString());
      
      setVisits([]);
      setSelectedVisit(null);
      setShowVisitModal(false);
    }
  };

  // Fetch visits for certification period
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
      
      // Initialize weekly limits for each discipline
      const initialLimits = {
        PT: {},
        OT: {},
        ST: {}
      };
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        const weekNumber = getWeekNumber(d);
        if (!initialLimits.PT[weekNumber]) {
          initialLimits.PT[weekNumber] = 2; // Default 2 visits per week for PT
          initialLimits.OT[weekNumber] = 3; // Default 3 visits per week for OT
          initialLimits.ST[weekNumber] = 2; // Default 2 visits per week for ST
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

  // Create visit
  const createVisit = async (visitData) => {
    try {
      console.log('Creating visit with data:', visitData);
      
      const createPayload = {
        patient_id: parseInt(patient.id),
        staff_id: parseInt(visitData.therapist),
        visit_date: visitData.date,
        visit_type: visitData.visitType,
        status: visitData.status || 'Scheduled',
        scheduled_time: visitData.time || null
      };

      console.log('Create payload for backend:', createPayload);

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

  // Update visit
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
        
        // Check if the error is due to visit having notes
        if (response.status === 400 && (errorText.includes('note') || errorText.includes('Note'))) {
          throw new Error('Cannot delete visit: This visit has associated notes. The visit has been deactivated instead of deleted to preserve the note data.');
        }
        
        throw new Error(`Failed to delete visit: ${response.status} - ${errorText}`);
      }
      
      console.log('✅ Visit deleted successfully:', visitId);
      return visitId;
      
    } catch (err) {
      console.error('Error deleting visit:', err);
      throw err;
    }
  };

  // ===== HELPER FUNCTIONS =====

  const getTherapyTypeFromStaff = (staffId) => {
    const therapist = therapists.find(t => t.id === parseInt(staffId));
    if (!therapist) return 'Other';
    
    const role = therapist.role.toUpperCase();
    return disciplineMapping[role] || role;
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

  const canScheduleVisit = (date, discipline = null) => {
    const visitDate = new Date(date);
    const weekNumber = getWeekNumber(visitDate);
    
    // If discipline is provided, check limit for that discipline
    if (discipline) {
      const weekVisits = visits.filter(
        (visit) => {
          const visitWeek = getWeekNumber(new Date(visit.visit_date));
          const therapistType = getTherapistType(visit.staff_id);
          const therapistDiscipline = disciplineMapping[therapistType];
          return visitWeek === weekNumber && 
                 visit.status === 'Scheduled' && 
                 therapistDiscipline === discipline;
        }
      ).length;
      const limit = weeklyLimits[discipline]?.[weekNumber] || 2;
      return weekVisits < limit;
    }
    
    // If no discipline specified, check based on current filter
    const activeDiscipline = disciplineFilter !== 'ALL' ? disciplineFilter : null;
    if (activeDiscipline) {
      return canScheduleVisit(date, activeDiscipline);
    }
    
    // Default behavior - check all visits
    const weekVisits = visits.filter(
      (visit) =>
        getWeekNumber(new Date(visit.visit_date)) === weekNumber &&
        visit.status === 'Scheduled'
    ).length;
    const totalLimit = Object.values(weeklyLimits).reduce((sum, disciplineLimits) => {
      return sum + (disciplineLimits[weekNumber] || 2);
    }, 0) || 6; // Default total limit if no discipline limits set
    return weekVisits < totalLimit;
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
      // PT Team - Blue (matching DisciplinesComponent)
      PT: { primary: '#3b82f6', secondary: 'rgba(59, 130, 246, 0.1)' },
      PTA: { primary: '#3b82f6', secondary: 'rgba(59, 130, 246, 0.1)' },
      // OT Team - Purple (matching DisciplinesComponent)
      OT: { primary: '#8b5cf6', secondary: 'rgba(139, 92, 246, 0.1)' },
      COTA: { primary: '#8b5cf6', secondary: 'rgba(139, 92, 246, 0.1)' },
      // ST Team - Green (matching DisciplinesComponent)
      ST: { primary: '#10b981', secondary: 'rgba(16, 185, 129, 0.1)' },
      STA: { primary: '#10b981', secondary: 'rgba(16, 185, 129, 0.1)' },
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

  // Helper function to check if current user is a therapist
  const isCurrentUserTherapist = () => {
    const therapistRoles = ['PT', 'PTA', 'OT', 'COTA', 'ST', 'STA'];
    return user && therapistRoles.includes(user.role?.toUpperCase());
  };

  // Helper function to get current user's therapist data
  const getCurrentUserTherapistData = () => {
    if (!isCurrentUserTherapist()) return null;
    return therapists.find(therapist => therapist.user_id === user.id || therapist.email === user.email);
  };

  // Organize therapists: assigned first, then separator, then all others
  const getOrganizedTherapists = () => {
    // If current user is a therapist, only show therapists from their discipline
    if (isCurrentUserTherapist()) {
      const currentUserDiscipline = getCurrentUserDiscipline();
      const sameDiscTherapists = therapists.filter(therapist => {
        const therapistDiscipline = disciplineMapping[therapist.role.toUpperCase()];
        return therapistDiscipline === currentUserDiscipline;
      });
      
      const assignedIds = assignedStaff.map(staff => staff.id);
      const assignedTherapists = sameDiscTherapists.filter(therapist => assignedIds.includes(therapist.id));
      const unassignedTherapists = sameDiscTherapists.filter(therapist => !assignedIds.includes(therapist.id));
      
      return { assignedTherapists, unassignedTherapists };
    }
    
    // For admins, developers, and agencies, show all therapists organized
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

  // Listen for cert period changes
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

  // Update form data when selected visit changes or when therapists load
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
      // Auto-select therapist if current user is a therapist
      const currentTherapist = getCurrentUserTherapistData();
      
      setFormData({
        visitType: '',
        therapist: currentTherapist ? currentTherapist.id.toString() : '',
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
  }, [selectedVisit, currentCertPeriod, therapists, user]);

  // NUEVO: Sincronización automática con datos externos
  useEffect(() => {
    if ((approvedVisits || disciplines) && currentCertPeriod) {
      console.log('🔄 Schedule: Syncing with external data');
      
      // Actualizar weekly limits basado en approved visits y frecuencias
      const newLimits = calculateWeeklyLimitsFromData();
      
      setWeeklyLimits(prevLimits => {
        const hasChanges = JSON.stringify(prevLimits) !== JSON.stringify(newLimits);
        
        if (hasChanges) {
          console.log('📊 Schedule: Updated weekly limits:', newLimits);
          
          // Sincronizar cambios con otros componentes
          syncWithOtherComponents({
            type: 'weekly_limits_updated',
            weeklyLimits: newLimits,
            visits: visits
          });
        }
        
        return hasChanges ? newLimits : prevLimits;
      });
    }
  }, [approvedVisits, disciplines, currentCertPeriod]); // Se ejecuta cuando cambian los datos externos

  // NUEVO: Sincronización cuando cambian las visitas
  useEffect(() => {
    if (visits.length >= 0) {
      console.log('🔄 Schedule: Visits changed, syncing with other components');
      
      // Sincronizar visitas con otros componentes
      syncWithOtherComponents({
        type: 'visits_updated',
        visits: visits,
        weeklyLimits: weeklyLimits
      });
    }
  }, [visits]); // Se ejecuta cuando cambian las visitas

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

  const handleLimitChange = (weekNumber, value, discipline = null) => {
    const activeDiscipline = discipline || (disciplineFilter !== 'ALL' ? disciplineFilter : 'PT');
    
    setWeeklyLimits((prev) => ({
      ...prev,
      [activeDiscipline]: {
        ...prev[activeDiscipline],
        [weekNumber]: parseInt(value) || 0,
      }
    }));
  };

  const handleDayMouseEnter = (date) => {
    setHoveredDay(date);
  };

  const handleDayMouseLeave = () => {
    setHoveredDay(null);
  };

  const handleDateClick = (date) => {
    // Check if date is within certification period
    if (!currentCertPeriod) {
      setError('No certification period active. Please set up a certification period first.');
      return;
    }
    
    const checkDate = new Date(date);
    const startDate = new Date(currentCertPeriod.start_date);
    const endDate = new Date(currentCertPeriod.end_date);
    checkDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    if (checkDate < startDate || checkDate > endDate) {
      setError(`Visit date must be within the certification period (${currentCertPeriod.start_date} to ${currentCertPeriod.end_date})`);
      return;
    }
    
    if (!canScheduleVisit(date)) {
      setError('Maximum number of visits for this week reached');
      return;
    }
    setSelectedDate(date);
    setSelectedVisit(null);
    
    // Auto-select therapist if current user is a therapist
    const currentUserTherapistId = getCurrentUserTherapistId();
    
    setFormData(prev => ({
      ...prev,
      date: formatDateToLocalISOString(date),
      time: '',
      visitType: '',
      therapist: currentUserTherapistId?.toString() || '',
      notes: '',
      status: 'Scheduled',
      missedReason: '',
    }));
    setShowVisitModal(true);
  };

  const handleOpenVisitModal = (visit = null) => {
    if (visit) {
      console.log('Opening modal for visit:', visit);
      console.log('Visit status:', visit.status);
      console.log('Has note saved:', visit.hasNoteSaved);
      console.log('Is pending changes:', visit.isPendingChanges);
      
      // Check if visit is completed OR is pending (returned for changes)
      if (visit.status === 'Completed' || visit.status?.toLowerCase() === 'completed' || visit.status === 'Pending') {
        console.log('Opening details modal for completed visit or pending changes');
        // Always open details modal for completed visits or pending changes
        setShowCompletedVisitModal(true);
        setCompletedVisitModalData({
          ...visit,
          visitType: visit.visit_type,
          therapist: visit.staff_id,
          date: visit.visit_date,
          time: visit.scheduled_time,
          status: visit.status.toUpperCase(),
          gCode: visit.gCode || '',
          physician: patient?.physician || 'Not assigned',
          certPeriod: visit.certification_period_id || currentCertPeriod?.id,
          certPeriodDisplay: currentCertPeriod ? `${currentCertPeriod.start_date} - ${currentCertPeriod.end_date}` : 'Not available',
          notes: visit.notes || '',
          documents: visit.documents || [],
          evaluationData: visit.evaluationData || null,
          isPendingChanges: visit.status === 'Pending'
        });
      } else {
        console.log('Opening status modal for regular visit');
        // For existing visits that are not completed, show status modal
        setStatusChangeVisit(visit);
        setShowVisitStatusModal(true);
      }
    } else {
      // For new visits, show creation modal
      setSelectedVisit(null);
      setShowVisitModal(true);
    }
  };

  const handleStatusChange = async (visitId, newStatus, updatedVisitData = null) => {
    try {
      setIsLoading(true);
      
      // Find the visit to update
      const visitToUpdate = visits.find(v => v.id === visitId);
      if (!visitToUpdate) {
        throw new Error('Visit not found');
      }

      // Use provided updated data or create basic status update
      const updateData = updatedVisitData || {
        ...visitToUpdate,
        status: newStatus
      };

      // Call the existing updateVisit function
      const updatedVisit = await updateVisit(visitId, updateData);
      
      // Update local state with all the changed fields
      setVisits(prevVisits => {
        const updatedVisits = prevVisits.map(visit => 
          visit.id === visitId ? { ...visit, ...updateData } : visit
        );
        
        if (onUpdateSchedule) {
          onUpdateSchedule(updatedVisits);
        }
        
        return updatedVisits;
      });

      setError(`✅ Visit updated successfully!`);
      setTimeout(() => setError(''), 3000);
      
    } catch (err) {
      console.error('Error updating visit:', err);
      setError(`❌ Failed to update visit: ${err.message}`);
    } finally {
      setIsLoading(false);
      setShowVisitStatusModal(false);
      setStatusChangeVisit(null);
    }
  };

  // Handle immediate visit updates from modal
  const handleVisitUpdate = (updatedVisitData) => {
    console.log('handleVisitUpdate called with:', updatedVisitData);
    
    // Update local state immediately for instant UI refresh
    setVisits(prevVisits => {
      console.log('Previous visits:', prevVisits);
      
      const updatedVisits = prevVisits.map(visit => 
        visit.id === updatedVisitData.id ? { ...visit, ...updatedVisitData } : visit
      );
      
      console.log('Updated visits:', updatedVisits);
      
      if (onUpdateSchedule) {
        onUpdateSchedule(updatedVisits);
      }
      
      return updatedVisits;
    });
    
    // Force a re-render by updating any dependent state
    setActiveFilter(prevFilter => prevFilter); // Trigger re-render
  };

  const handleCompleteVisit = (visitData) => {
    // Close status modal
    setShowVisitStatusModal(false);
    setStatusChangeVisit(null);
    
    // Get therapist discipline for proper template loading
    const therapist = therapists.find(t => t.id === visitData.staff_id);
    const therapistRole = therapist?.role?.toUpperCase() || 'PT';
    
    // Map therapist role to discipline
    const disciplineMapping = {
      'PT': 'PT',
      'PTA': 'PT', 
      'OT': 'OT',
      'COTA': 'OT',
      'ST': 'ST',
      'STA': 'ST'
    };
    
    const discipline = disciplineMapping[therapistRole] || 'PT';
    
    // Prepare visit data with discipline information
    const enrichedVisitData = {
      ...visitData,
      discipline: discipline,
      therapist_role: therapistRole,
      patientId: patient?.id,
      patientName: patient?.full_name || `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim()
    };
    
    // Open note completion modal instead of directly changing status
    console.log('Opening completion modal for visit:', enrichedVisitData);
    setCompletionVisitData(enrichedVisitData);
    setShowCompletionModal(true);
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
      
      // Refresh visits list to get updated data (including any deactivated visits)
      if (currentCertPeriod?.id) {
        await fetchVisitsForCertPeriod(currentCertPeriod.id);
      }
      
      setError('✅ Visit deleted successfully!');
      setTimeout(() => setError(''), 3000);
      
    } catch (err) {
      console.error('Delete visit error:', err);
      
      // Show specific error message based on type
      if (err.message.includes('associated notes')) {
        setError('⚠️ ' + err.message);
        // Refresh the list since the visit might have been deactivated
        if (currentCertPeriod?.id) {
          await fetchVisitsForCertPeriod(currentCertPeriod.id);
        }
      } else {
        setError('❌ Failed to delete visit: ' + err.message);
      }
      
      setTimeout(() => setError(''), 5000);
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



  // MAIN SAVE FUNCTION - Only for creating/editing basic visit details
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
      
      console.log('Saving visit data:', visitDataToSave);

      let result;

      if (selectedVisit) {
        // UPDATING EXISTING VISIT
        console.log('Updating existing visit with ID:', selectedVisit.id);
        
        result = await updateVisit(selectedVisit.id, visitDataToSave);
        console.log('Update result:', result);
        
        setVisits(prevVisits => {
          const updatedVisits = prevVisits.map(visit => 
            visit.id === selectedVisit.id ? { ...result } : visit
          );
          
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
        
        setVisits(prevVisits => {
          const updatedVisits = [...prevVisits, result];
          
          if (onUpdateSchedule) {
            onUpdateSchedule(updatedVisits);
          }
          
          return updatedVisits;
        });
        
        console.log('Visit created successfully');
      }

      // Close modal and reset state
      setShowVisitModal(false);
      setSelectedVisit(null);
      setActiveTab('details');

      // Show success message
      const action = selectedVisit ? 'updated' : 'created';
      
      setError(`✅ Visit ${action} successfully!`);
      
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

  const handleCompletionFormSave = async (formData, options = {}) => {
    console.log('Saving completion form data:', formData);
    
    try {
      // Get the note for this visit
      const noteResponse = await fetch(`http://localhost:8000/visit-notes/${completionVisitData.id}`);
      if (!noteResponse.ok) {
        throw new Error('Failed to fetch note');
      }
      const noteData = await noteResponse.json();
      
      // Update the note with new data and completed status
      const updateResponse = await fetch(`http://localhost:8000/visit-notes/${noteData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: options.isCompleted ? "Completed" : "Pending",
          sections_data: formData,
          therapist_signature: formData.therapist_signature,
          patient_signature: formData.patient_signature,
          visit_date_signature: formData.visit_date_signature
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update note');
      }
      
      const updatedNote = await updateResponse.json();
      
      // Refresh visits list to show updated status
      if (currentCertPeriod?.id) {
        await fetchVisitsForCertPeriod(currentCertPeriod.id);
      }
      
      // Close modal and show success message
      setShowCompletionModal(false);
      setCompletionVisitData(null);
      setError('✅ Note saved successfully!');
      setTimeout(() => setError(''), 3000);
      
      return updatedNote;
    } catch (error) {
      console.error('Error saving completion form:', error);
      setError('❌ Failed to save note. Please try again.');
      setTimeout(() => setError(''), 5000);
      throw error;
    }
  };

  const getFilteredVisits = () => {
    let filtered = [...visits];
    filtered = filtered.filter((visit) => isWithinCertPeriod(visit.visit_date));
    
    // Filter by discipline
    if (disciplineFilter !== 'ALL') {
      filtered = filtered.filter((visit) => {
        const therapistType = getTherapistType(visit.staff_id);
        const therapistDiscipline = disciplineMapping[therapistType];
        return therapistDiscipline === disciplineFilter;
      });
    }
    
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
    let dayVisits = visits.filter((visit) => visit.visit_date === dateString && isWithinCertPeriod(visit.visit_date));
    
    // Apply discipline filter if active
    if (disciplineFilter !== 'ALL') {
      dayVisits = dayVisits.filter((visit) => {
        const therapistType = getTherapistType(visit.staff_id);
        const therapistDiscipline = disciplineMapping[therapistType];
        return therapistDiscipline === disciplineFilter;
      });
    }
    
    return dayVisits;
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
    return (
      <div className="modal-overlay">
        <div className="modal-content modal-large">
          <div className="modal-header">
            <h3>
              {selectedVisit ? 'Edit Visit Details' : 'Schedule New Visit'}
            </h3>
            <button className="close-btn" onClick={() => setShowVisitModal(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}
            
            {/* Only show details tab for creating/editing basic visit info */}
            <div className="visit-details-form">
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
                    disabled={isCurrentUserTherapist()}
                  >
                    <option value="">Select Therapist</option>
                    {!isCurrentUserTherapist() ? (
                      // Show all therapists for admin users
                      (() => {
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
                      })()
                    ) : (
                      // Show only current user if they are a therapist
                      (() => {
                        const currentTherapist = getCurrentUserTherapistData();
                        return currentTherapist ? (
                          <option key={currentTherapist.id} value={currentTherapist.id}>
                            {currentTherapist.name} ({currentTherapist.role.toUpperCase()})
                          </option>
                        ) : null;
                      })()
                    )}
                  </select>
                )}
                {isCurrentUserTherapist() && (
                  <div className="therapist-info">
                    <i className="fas fa-info-circle"></i>
                    <span>As a therapist, you can only schedule visits for yourself</span>
                  </div>
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
                selectedVisit ? 'Update Visit' : 'Schedule Visit'
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

    // Helper function to check if a date is within the cert period
    const isDateWithinCertPeriod = (date) => {
      if (!date || !currentCertPeriod) return false;
      const checkDate = new Date(date);
      const startDate = new Date(currentCertPeriod.start_date);
      const endDate = new Date(currentCertPeriod.end_date);
      // Reset hours to compare only dates
      checkDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      return checkDate >= startDate && checkDate <= endDate;
    };

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
              // Filter visits for the current discipline and week
              const activeDiscipline = disciplineFilter !== 'ALL' ? disciplineFilter : 'ALL';
              let weekVisits, limit;
              
              if (activeDiscipline === 'ALL') {
                // Show all visits when no filter is active
                weekVisits = visits.filter(
                  (v) => getWeekNumber(new Date(v.visit_date)) === weekNumber && v.status === 'Scheduled'
                ).length;
                limit = Object.values(weeklyLimits).reduce((sum, disciplineLimits) => {
                  return sum + (disciplineLimits[weekNumber] || 2);
                }, 0) || 6;
              } else {
                // Show only visits for the filtered discipline
                weekVisits = visits.filter(
                  (v) => {
                    const visitWeek = getWeekNumber(new Date(v.visit_date));
                    const therapistType = getTherapistType(v.staff_id);
                    const therapistDiscipline = disciplineMapping[therapistType];
                    return visitWeek === weekNumber && 
                           v.status === 'Scheduled' && 
                           therapistDiscipline === activeDiscipline;
                  }
                ).length;
                limit = weeklyLimits[activeDiscipline]?.[weekNumber] || 2;
              }
              
              const isOverScheduled = weekVisits >= limit;
              return (
                <div key={weekIndex} className="calendar-week-row">
                  <div className="week-limit">
                    <span>{activeDiscipline !== 'ALL' ? `${activeDiscipline} Limit:` : 'Total Limit:'}</span>
                    <input
                      type="number"
                      min="0"
                      value={limit}
                      onChange={(e) => handleLimitChange(weekNumber, e.target.value, activeDiscipline !== 'ALL' ? activeDiscipline : null)}
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
                      const isWithinCertPeriod = isDateWithinCertPeriod(day);
                      const isBlocked = !canScheduleVisit(day) || !isWithinCertPeriod;
                      const isOutsideCertPeriod = !isWithinCertPeriod;
                      const isHovered = hoveredDay &&
                        day.getDate() === hoveredDay.getDate() &&
                        day.getMonth() === hoveredDay.getMonth() &&
                        day.getFullYear() === hoveredDay.getFullYear();
                      return (
                        <div
                          key={dayIndex}
                          className={`calendar-day ${dayVisits.length > 0 ? 'has-visits' : ''} ${isToday ? 'today' : ''} ${isBlocked ? 'blocked' : ''} ${isOutsideCertPeriod ? 'outside-cert-period' : ''} ${isHovered ? 'hovered' : ''}`}
                          onClick={() => !isBlocked && handleDateClick(day)}
                          onMouseEnter={() => isWithinCertPeriod && handleDayMouseEnter(day)}
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
                                    {visit.hasNoteSaved && (
                                      <div className="calendar-note-saved" style={{
                                        fontSize: '0.75rem',
                                        color: '#10b981',
                                        fontWeight: '600',
                                        marginTop: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}>
                                        <i className="fas fa-check-circle" style={{fontSize: '0.7rem'}}></i>
                                        <span>Note Saved</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {isBlocked && (
                            <div className="blocked-overlay">
                              {isOutsideCertPeriod ? 'Outside Cert Period' : 'Max Limit Reached'}
                            </div>
                          )}
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
    
    // Create date without timezone issues
    const visitDateString = visit.visit_date;
    const [year, month, day] = visitDateString.split('-').map(Number);
    const visitDate = new Date(year, month - 1, day);

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
                {(() => {
                  // Manual date formatting to avoid timezone issues
                  const [year, month, day] = visitDateString.split('-');
                  return `${month}/${day}/${year}`;
                })()}
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
          {/* Note status indicators */}
          {(visit.status === 'Completed' || visit.status?.toLowerCase() === 'completed') && visit.hasNoteSaved && (
            <div className="note-status-container">
              <div className="note-saved-indicator">
                <i className="fas fa-check-circle"></i>
                <span>Saved</span>
              </div>
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
              onClick={() => handleOpenVisitModal()}
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
              className="discipline-filter-btn"
              onClick={() => setShowDisciplineFilter(!showDisciplineFilter)}
            >
              <i className="fas fa-filter"></i>
              <span>Filter</span>
              {disciplineFilter !== 'ALL' && (
                <span className="filter-badge">{disciplineFilter}</span>
              )}
            </button>
            <button
              className="quick-add-btn"
              onClick={() => handleOpenVisitModal()}
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
        {/* Discipline filter dropdown - only show when button is clicked */}
        {showDisciplineFilter && (
          <div className="discipline-filter-panel">
            <div className="discipline-filter">
              <label className="filter-label">Select Discipline:</label>
              <div className="discipline-pills">
                <button
                  className={`discipline-pill all ${disciplineFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => {
                    setDisciplineFilter('ALL');
                    setShowDisciplineFilter(false);
                  }}
                >
                  All Disciplines
                </button>
                <button
                  className={`discipline-pill pt ${disciplineFilter === 'PT' ? 'active' : ''}`}
                  onClick={() => {
                    setDisciplineFilter('PT');
                    setShowDisciplineFilter(false);
                  }}
                >
                  PT/PTA
                </button>
                <button
                  className={`discipline-pill ot ${disciplineFilter === 'OT' ? 'active' : ''}`}
                  onClick={() => {
                    setDisciplineFilter('OT');
                    setShowDisciplineFilter(false);
                  }}
                >
                  OT/COTA
                </button>
                <button
                  className={`discipline-pill st ${disciplineFilter === 'ST' ? 'active' : ''}`}
                  onClick={() => {
                    setDisciplineFilter('ST');
                    setShowDisciplineFilter(false);
                  }}
                >
                  ST/STA
                </button>
              </div>
            </div>
          </div>
        )}
        
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
            onClick={() => handleOpenVisitModal()}
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
          {user && (
            <div className="user-info">
              <span className="user-role">{user.role}</span>
              <span className="user-name">{user.name}</span>
            </div>
          )}
        </div>
        {(isLoadingTherapists || isLoadingCertPeriods || isLoadingVisits) && (
          <div className="header-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Loading...</span>
          </div>
        )}
      </div>

      <NoteTemplateModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        patientData={{
          firstName: patient?.first_name || '',
          lastName: patient?.last_name || '',
          id: patient?.id,
          full_name: patient?.full_name || `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim()
        }}
        disciplina={completionVisitData?.discipline || 'PT'}
        tipoNota="Initial Evaluation"
        initialData={completionVisitData || {}}
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
                  <div className="calendar-nav-right">
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                      <button
                        onClick={() => setDisciplineFilter('PT')}
                        style={{
                          padding: '8px 16px',
                          border: disciplineFilter === 'PT' ? '2px solid #3b82f6' : '2px solid #3b82f6',
                          borderRadius: '20px',
                          background: disciplineFilter === 'PT' ? '#3b82f6' : 'white',
                          color: disciplineFilter === 'PT' ? 'white' : '#3b82f6',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.3s ease',
                          outline: 'none',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        PT
                        {approvedVisits && (
                          <span style={{
                            fontSize: '10px',
                            background: disciplineFilter === 'PT' ? 'rgba(255,255,255,0.3)' : 'rgba(59, 130, 246, 0.1)',
                            padding: '2px 4px',
                            borderRadius: '8px',
                            fontWeight: 'bold'
                          }}>
                            {getUsedVisitsCount('PT')}/{getApprovedVisitsLimit('PT') || '?'}
                          </span>
                        )}
                        {disciplines?.PT?.frequency && (
                          <span style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#10b981',
                            color: 'white',
                            fontSize: '8px',
                            padding: '1px 3px',
                            borderRadius: '6px',
                            fontWeight: 'bold'
                          }}>
                            🔗
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setDisciplineFilter('OT')}
                        style={{
                          padding: '8px 16px',
                          border: disciplineFilter === 'OT' ? '2px solid #8b5cf6' : '2px solid #8b5cf6',
                          borderRadius: '20px',
                          background: disciplineFilter === 'OT' ? '#8b5cf6' : 'white',
                          color: disciplineFilter === 'OT' ? 'white' : '#8b5cf6',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.3s ease',
                          outline: 'none',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        OT
                        {approvedVisits && (
                          <span style={{
                            fontSize: '10px',
                            background: disciplineFilter === 'OT' ? 'rgba(255,255,255,0.3)' : 'rgba(139, 92, 246, 0.1)',
                            padding: '2px 4px',
                            borderRadius: '8px',
                            fontWeight: 'bold'
                          }}>
                            {getUsedVisitsCount('OT')}/{getApprovedVisitsLimit('OT') || '?'}
                          </span>
                        )}
                        {disciplines?.OT?.frequency && (
                          <span style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#10b981',
                            color: 'white',
                            fontSize: '8px',
                            padding: '1px 3px',
                            borderRadius: '6px',
                            fontWeight: 'bold'
                          }}>
                            🔗
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setDisciplineFilter('ST')}
                        style={{
                          padding: '8px 16px',
                          border: disciplineFilter === 'ST' ? '2px solid #10b981' : '2px solid #10b981',
                          borderRadius: '20px',
                          background: disciplineFilter === 'ST' ? '#10b981' : 'white',
                          color: disciplineFilter === 'ST' ? 'white' : '#10b981',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.3s ease',
                          outline: 'none',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        ST
                        {approvedVisits && (
                          <span style={{
                            fontSize: '10px',
                            background: disciplineFilter === 'ST' ? 'rgba(255,255,255,0.3)' : 'rgba(16, 185, 129, 0.1)',
                            padding: '2px 4px',
                            borderRadius: '8px',
                            fontWeight: 'bold'
                          }}>
                            {getUsedVisitsCount('ST')}/{getApprovedVisitsLimit('ST') || '?'}
                          </span>
                        )}
                        {disciplines?.ST?.frequency && (
                          <span style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#10b981',
                            color: 'white',
                            fontSize: '8px',
                            padding: '1px 3px',
                            borderRadius: '6px',
                            fontWeight: 'bold'
                          }}>
                            🔗
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setDisciplineFilter('ALL')}
                        style={{
                          padding: '8px 16px',
                          border: disciplineFilter === 'ALL' ? '2px solid #6b7280' : '2px solid #6b7280',
                          borderRadius: '20px',
                          background: disciplineFilter === 'ALL' ? '#6b7280' : 'white',
                          color: disciplineFilter === 'ALL' ? 'white' : '#6b7280',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.3s ease',
                          outline: 'none'
                        }}
                      >
                        ALL
                      </button>
                    </div>
                    <button
                      className="add-visit-calendar"
                      onClick={() => handleOpenVisitModal()}
                    >
                      <i className="fas fa-plus"></i>
                      <span>Add Visit</span>
                    </button>
                  </div>
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
      
      {/* Completed Visit Details Modal */}
      <VisitModalComponent
        isOpen={showCompletedVisitModal}
        onClose={() => {
          setShowCompletedVisitModal(false);
          setCompletedVisitModalData(null);
        }}
        visitData={completedVisitModalData}
        onSave={async (updatedData) => {
          // Handle any updates to the completed visit
          console.log('Updated visit data:', updatedData);
          
          try {
            // Always update visit in database with all changes
            const updatePayload = {
              visitType: updatedData.visit_type,
              therapist: updatedData.staff_id,
              date: updatedData.visit_date,
              time: updatedData.scheduled_time,
              certPeriod: updatedData.certPeriod || completedVisitModalData.certPeriod,
              status: completedVisitModalData.status // Keep current status by default
            };
            
            // Only update status if it actually changed (for Return to Therapist)
            if (updatedData.status && updatedData.status !== completedVisitModalData.status) {
              updatePayload.status = updatedData.status;
            }
            
            // Send update to database
            await updateVisit(completedVisitModalData.id, updatePayload);
            
            // Update the visit in the visits list
            setVisits(prevVisits => {
              const updatedVisits = prevVisits.map(visit => 
                visit.id === completedVisitModalData.id ? { ...visit, ...updatedData } : visit
              );
              
              if (onUpdateSchedule) {
                onUpdateSchedule(updatedVisits);
              }
              
              return updatedVisits;
            });
            
            setShowCompletedVisitModal(false);
            setCompletedVisitModalData(null);
          } catch (error) {
            console.error('Error updating visit:', error);
            setError('Failed to update visit status');
          }
        }}
        certPeriodDates={certPeriodDates}
        patientInfo={patient}
        visitStatus="COMPLETED"
      />
      
      {/* Visit Status Modal */}
      <VisitStatusModal
        isOpen={showVisitStatusModal}
        onClose={() => {
          setShowVisitStatusModal(false);
          setStatusChangeVisit(null);
        }}
        visitData={statusChangeVisit}
        onStatusChange={handleStatusChange}
        onCompleteVisit={handleCompleteVisit}
        onVisitUpdate={handleVisitUpdate}
      />
    </div>
  );
};

export default ScheduleComponent;