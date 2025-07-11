import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../components/login/AuthContext';
import '../../../styles/developer/Referrals/ReferralsPage.scss';
import '../../../styles/developer/Referrals/IntegratedReferralStyles.scss';
import logoImg from '../../../assets/LogoMHC.jpeg';
import LogoutAnimation from '../../../components/LogOut/LogOut';
import CustomDatePicker from './CreateNF/DatePicker';
import DOBDatePicker from './CreateNF/DOBDatePicker';
import LoadingScreen from './CreateNF/LoadingDates';
import ReferralStats from './ReferralStats';
import { toast } from 'react-toastify';

const DevReferralsPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [selectedTherapists, setSelectedTherapists] = useState({
    PT: '', PTA: '', OT: '', COTA: '', ST: '', STA: ''
  });
  
  // State for UI controls
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuTransitioning, setMenuTransitioning] = useState(false);
  const [parallaxPosition, setParallaxPosition] = useState({ x: 0, y: 0 });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for view management
  const [currentView, setCurrentView] = useState('menu');
  const [referralFormLoading, setReferralFormLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Refs for elements
  const userMenuRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Form data state - ESTRUCTURA CORREGIDA
  const [formData, setFormData] = useState({
    // Patient personal data
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    address: '',
    city: '',
    zipCode: '',
    contactNumbers: [''],
    
    // Care Period
    payorType: '',
    certPeriodStart: '',
    certPeriodEnd: '',
    urgencyLevel: 'normal',
    
    // Medical
    physician: '',
    agencyId: '',
    agencyBranch: '',
    nurseManager: '',
    nursingDiagnosis: '',
    pmh: '',
    priorLevelOfFunction: 'To Be Obtained at Evaluation',
    wbs: '',
    
    // Homebound - Estructura correcta
    homebound: {
      na: false,
      needs_assistance: false,
      residual_weakness: false,
      requires_assistance_ambulate: false,
      confusion: false,
      safely_leave: false,
      sob: false,
      adaptive_devices: false,
      medical_restrictions: false,
      taxing_effort: false,
      bedbound: false,
      transfers: false,
      other: false,
      otherReason: ''
    },
    
    // Weight y Height
    weight: '',
    weightUnit: 'lbs', 
    height: '',
    heightUnit: 'ft',
    
    // Therapy - Estructura correcta
    reasonsForReferral: {
      strength_balance: false,
      gait: false,
      adls: false,
      orthopedic: false,
      neurological: false,
      wheelchair: false,
      additional: ''
    },
    disciplines: []
  });
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const [selectedDisciplines, setSelectedDisciplines] = useState({
    PT: false,
    PTA: false,
    OT: false,
    COTA: false,
    ST: false,
    STA: false
  });

  const [addingNewManager, setAddingNewManager] = useState(false);

  // WBS options from the dropdown
  const wbsOptions = [
    { value: '', label: '-- Select WBS --' },
    { value: 'N/A', label: 'N/A' },
    { value: 'Full weight Bearing', label: 'Full weight Bearing' },
    { value: 'Weight Bearing as Tolerated', label: 'Weight Bearing as Tolerated' },
    { value: 'Partial Weight Bearing (up to 50%)', label: 'Partial Weight Bearing (up to 50%)' },
    { value: 'Toe Touch Weight Bearing (up to 5%)', label: 'Toe Touch Weight Bearing (up to 5%)' },
    { value: 'Non-Weight Bearing (0%)', label: 'Non-Weight Bearing (0%)' },
    { value: 'Clarify w/Patient or MD', label: 'Clarify w/Patient or MD' },
  ];

  // Function to get initials from name
  function getInitials(name) {
    if (!name) return "U";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  // User data from authentication context
  const userData = {
    name: currentUser?.fullname || currentUser?.username || 'User',
    avatar: getInitials(currentUser?.fullname || currentUser?.username || 'User'),
    email: currentUser?.email || 'user@example.com',
    role: currentUser?.role || 'User',
    status: 'online',
  };
  
  //////////////////////////////////////EFECTOS DE LA PAGINA//////////////////////////////////////////

  // Para la carga del screen principal
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timeout); 
  }, []);

  // Agencias del dropdown menu - CORREGIDO
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await fetch('http://localhost:8000/staff');
        if (!response.ok) throw new Error('Failed to fetch staff');
        const data = await response.json();
        
        // Cambié 'Agency' por 'agency' para que coincida con el backend
        const agenciesOnly = data.filter(person => person.role.toLowerCase() === 'agency');
        setAgencies(agenciesOnly);
      } catch (error) {
        console.error('Error loading agencies:', error);
        toast.error('Error loading agencies');
      }
    };
    fetchAgencies();
  }, []);

  // Therapists del dropdown menu
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await fetch("http://localhost:8000/staff");
        if (!response.ok) throw new Error("Failed to fetch therapists");
        const data = await response.json();
        const therapistRoles = ['pt', 'pta', 'ot', 'cota', 'st', 'sta'];
        const filtered = data.filter(person => therapistRoles.includes(person.role.toLowerCase()));
        setTherapists(filtered);
      } catch (error) {
        console.error("Error loading therapists:", error);
        toast.error("Error loading therapists");
      }
    };
    fetchTherapists();
  }, []);

  // Effect for handling clicks outside user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Detect screen size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Effect to update certPeriodEnd based on certPeriodStart
  useEffect(() => {
    if (formData.certPeriodStart) {
      const startDate = new Date(formData.certPeriodStart);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 60);
      
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        certPeriodEnd: formattedEndDate
      }));
    }
  }, [formData.certPeriodStart]);
  
  /////////////////////////// HANDLE BUTTONS /////////////////////////////////////////////////////

  // Form submission - ACTUALIZADO CON LA ESTRUCTURA CORRECTA
// Form submission - CORREGIDO PARA ENVIAR TEXTO LEGIBLE
const handleSubmit = async (e) => {
  e.preventDefault();
  if (isLoggingOut) return;

  try {
    setFormSubmitting(true);

    // Validar que al menos una disciplina esté seleccionada
    if (formData.disciplines.length === 0) {
      toast.error('Please select at least one discipline');
      return;
    }

    // Validar que cada disciplina seleccionada tenga un terapeuta asignado
    const missingTherapists = formData.disciplines.filter(discipline => !selectedTherapists[discipline]);
    if (missingTherapists.length > 0) {
      toast.error(`Please assign therapists for: ${missingTherapists.join(', ')}`);
      return;
    }

    // ✅ FUNCIÓN PARA CONVERTIR HOMEBOUND A TEXTO LEGIBLE
    const convertHomeboundToText = (homeboundData) => {
      const selectedOptions = [];
      
      // Mapeo de IDs a texto legible
      const homeboundLabels = {
        na: 'N/A',
        needs_assistance: 'Needs assistance for all activities',
        residual_weakness: 'Residual weakness',
        requires_assistance_ambulate: 'Requires assistance to ambulate',
        confusion: 'Confusion, unable to go out of home alone',
        safely_leave: 'Unable to safely leave home unassisted',
        sob: 'Severe SOB, SOB upon exertion',
        adaptive_devices: 'Dependent upon adaptive device(s)',
        medical_restrictions: 'Medical restrictions',
        taxing_effort: 'Requires taxing effort to leave home',
        bedbound: 'Bedbound',
        transfers: 'Requires assistance with transfers',
        other: 'Other'
      };

      // Recopilar opciones seleccionadas
      Object.keys(homeboundData).forEach(key => {
        if (key === 'otherReason') return; // Skip otherReason field
        
        if (homeboundData[key] === true && homeboundLabels[key]) {
          selectedOptions.push(homeboundLabels[key]);
        }
      });

      // Si "Other" está seleccionado y hay una razón específica
      if (homeboundData.other && homeboundData.otherReason) {
        const otherIndex = selectedOptions.findIndex(option => option === 'Other');
        if (otherIndex !== -1) {
          selectedOptions[otherIndex] = `Other: ${homeboundData.otherReason}`;
        }
      }

      // Retornar texto legible o un valor por defecto
      return selectedOptions.length > 0 ? selectedOptions.join('; ') : 'Not specified';
    };

    // ✅ FUNCIÓN PARA CONVERTIR REASONS FOR REFERRAL A TEXTO LEGIBLE
    const convertReasonsToText = (reasonsData) => {
      const selectedReasons = [];
      
      // Mapeo de IDs a texto legible
      const reasonLabels = {
        strength_balance: 'Decreased Strength / Balance',
        gait: 'Decreased Gait Ability',
        adls: 'ADLs',
        orthopedic: 'Orthopedic Operation',
        neurological: 'Neurological / Cognitive',
        wheelchair: 'Wheelchair Evaluation'
      };

      // Recopilar razones seleccionadas
      Object.keys(reasonsData).forEach(key => {
        if (key === 'additional') return; // Skip additional field
        
        if (reasonsData[key] === true && reasonLabels[key]) {
          selectedReasons.push(reasonLabels[key]);
        }
      });

      // Agregar razones adicionales si existen
      if (reasonsData.additional && reasonsData.additional.trim()) {
        selectedReasons.push(`Additional: ${reasonsData.additional.trim()}`);
      }

      // Retornar texto legible o un valor por defecto
      return selectedReasons.length > 0 ? selectedReasons.join('; ') : 'Not specified';
    };

    // Paso 1: Crear paciente con datos LEGIBLES
    const patientPayload = {
      full_name: `${formData.firstName} ${formData.lastName}`,
      birthday: formData.dob,
      gender: formData.gender,
      address: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
      contact_info: JSON.stringify(formData.contactNumbers), // Este sí puede ir como JSON
      payor_type: formData.payorType,
      physician: formData.physician,
      agency_id: parseInt(formData.agencyId),
      nursing_diagnosis: formData.nursingDiagnosis,
      urgency_level: formData.urgencyLevel,
      prior_level_of_function: formData.priorLevelOfFunction,
      
      // ✅ CORREGIDO: Enviar como texto legible en lugar de JSON
      homebound_status: convertHomeboundToText(formData.homebound),
      referral_reason: convertReasonsToText(formData.reasonsForReferral),
      
      weight_bearing_status: formData.wbs,
      weight: formData.weight ? `${formData.weight} ${formData.weightUnit}` : '',
      height: formData.height ? `${formData.height} ${formData.heightUnit}` : '',
      past_medical_history: formData.pmh,
      initial_cert_start_date: formData.certPeriodStart,
      required_disciplines: JSON.stringify(formData.disciplines) // Este sí puede ir como JSON
    };

    console.log('Sending patient data with readable homebound:', {
      homebound_status: patientPayload.homebound_status,
      referral_reason: patientPayload.referral_reason
    });

    const createRes = await fetch('http://localhost:8000/patients/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientPayload),
    });

    if (!createRes.ok) {
      const errorData = await createRes.text();
      console.error('Error creating patient:', errorData);
      throw new Error('Failed to create patient');
    }

    const createdPatient = await createRes.json();
    const patientId = createdPatient.id;

    // Paso 2: Asignar terapeutas (sin cambios)
    const assignPromises = Object.entries(selectedTherapists).map(([discipline, staffId]) => {
      if (staffId && formData.disciplines.includes(discipline)) {
        return fetch(`http://localhost:8000/assign-staff?patient_id=${patientId}&staff_id=${parseInt(staffId)}`, {
          method: 'POST'
        });
      }
      return null;
    });

    const assignmentResults = await Promise.all(assignPromises.filter(Boolean));
    const failedAssignments = assignmentResults.filter(r => !r.ok);
    if (failedAssignments.length > 0) {
      console.error('Some therapist assignments failed');
      toast.warning('Patient created but some therapist assignments may have failed');
    }

    // Paso 3: Subir documentos (sin cambios)
    for (let file of uploadedFiles) {
      const formDataDoc = new FormData();
      formDataDoc.append('file', file);
      formDataDoc.append('patient_id', patientId);

      const uploadRes = await fetch('http://localhost:8000/documents/upload', {
        method: 'POST',
        body: formDataDoc
      });

      if (!uploadRes.ok) {
        console.error('Document upload failed:', await uploadRes.text());
        toast.warning('Patient created but document upload failed');
      }
    }

    toast.success("Patient created successfully with readable homebound status");
    resetForm();
    setCurrentView("menu");
  } catch (error) {
    console.error('Error in form submission:', error);
    toast.error("Error creating patient: " + error.message);
  } finally {
    setFormSubmitting(false);
  }
};

  // Handle logout with animation
  const handleLogout = () => {
    setIsLoggingOut(true);
    setShowUserMenu(false);
    document.body.classList.add('logging-out');
  };
  
  // Callback for when the logout animation completes
  const handleLogoutAnimationComplete = () => {
    logout();
    navigate('/');
  };
  
  // Handle navigation to main menu
  const handleMainMenuTransition = () => {
    if (isLoggingOut) return;
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    navigate(`/${baseRole}/homePage`);
  };

  // Handle starting create new referral process
  const handleStartCreateReferral = () => {
    if (isLoggingOut) return;
    setReferralFormLoading(true);
    setTimeout(() => {
      setCurrentView('createReferral');
      setReferralFormLoading(false);
    }, 1500);
  };

  // Handle navigation to referral stats
  const handleReferralStats = () => {
    if (isLoggingOut) return;
    setCurrentView('stats');
  };
  
  // Handle click on PDF upload area
  const handlePdfAreaClick = () => {
    if (isLoggingOut) return;
    fileInputRef.current.click();
  };
  
  // Handle file upload
  const handleFileUpload = (e) => {
    if (isLoggingOut) return;
    const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
    if (files.length === 0) {
      toast.error('Please upload only PDF files.');
      return;
    }
    setUploadedFiles(files);
  };
  
  // Handle form input changes - MEJORADO
// Handle form input changes - ACTUALIZADO PARA WEIGHT/HEIGHT
const handleInputChange = (e) => {
  if (isLoggingOut) return;
  
  const { name, value, type, checked } = e.target;
  
  // Manejo especial para campos numéricos weight y height
  if (name === 'weight') {
    // Validar peso: permitir decimales, rango 0-1000
    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 1000)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    return;
  }
  
  if (name === 'height') {
    // Validar altura según la unidad seleccionada
    const maxValue = formData.heightUnit === 'ft' ? 10 : 300;
    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= maxValue)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    return;
  }
  
  // Manejo para weightUnit y heightUnit
  if (name === 'weightUnit') {
    setFormData(prev => ({
      ...prev,
      weightUnit: value
    }));
    return;
  }
  
  if (name === 'heightUnit') {
    // Convertir altura automáticamente cuando cambia la unidad
    let newHeight = formData.height;
    if (formData.height && !isNaN(parseFloat(formData.height))) {
      const currentValue = parseFloat(formData.height);
      if (formData.heightUnit === 'ft' && value === 'cm') {
        // Convertir de pies a centímetros
        newHeight = (currentValue * 30.48).toFixed(1);
      } else if (formData.heightUnit === 'cm' && value === 'ft') {
        // Convertir de centímetros a pies
        newHeight = (currentValue / 30.48).toFixed(1);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      heightUnit: value,
      height: newHeight
    }));
    return;
  }
  
  // Manejo normal para otros campos
  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};

// Función específica para manejar cambios en weight (para el input large)
const handleWeightChange = (e) => {
  if (isLoggingOut) return;
  
  const value = e.target.value;
  
  // Permitir números decimales y validar rango 0-1000
  if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 1000 && !isNaN(parseFloat(value)))) {
    setFormData(prev => ({
      ...prev,
      weight: value
    }));
  }
};

// Función específica para manejar cambios en height (para el input large)
const handleHeightChange = (e) => {
  if (isLoggingOut) return;
  
  const value = e.target.value;
  
  // Validar según la unidad seleccionada
  const maxValue = formData.heightUnit === 'ft' ? 10 : 300;
  
  if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= maxValue && !isNaN(parseFloat(value)))) {
    setFormData(prev => ({
      ...prev,
      height: value
    }));
  }
};

// Función para manejar cambios en weightUnit (para el select large)
const handleWeightUnitChange = (e) => {
  if (isLoggingOut) return;
  
  setFormData(prev => ({
    ...prev,
    weightUnit: e.target.value
  }));
};

// Función para manejar cambios en heightUnit con conversión automática (para el select large)
const handleHeightUnitChange = (e) => {
  if (isLoggingOut) return;
  
  const newUnit = e.target.value;
  let newHeight = formData.height;
  
  // Convertir altura si hay un valor válido
  if (formData.height && !isNaN(parseFloat(formData.height))) {
    const currentValue = parseFloat(formData.height);
    
    if (formData.heightUnit === 'ft' && newUnit === 'cm') {
      // Convertir de pies a centímetros (1 ft = 30.48 cm)
      newHeight = (currentValue * 30.48).toFixed(1);
    } else if (formData.heightUnit === 'cm' && newUnit === 'ft') {
      // Convertir de centímetros a pies (1 cm = 0.0328084 ft)
      newHeight = (currentValue / 30.48).toFixed(1);
    }
  }
  
  setFormData(prev => ({
    ...prev,
    heightUnit: newUnit,
    height: newHeight
  }));
};

// Función de validación para números
const validateNumericInput = (value, min = 0, max = Infinity) => {
  if (value === '') return true;
  const numValue = parseFloat(value);
  return !isNaN(numValue) && numValue >= min && numValue <= max;
};

// Función para formatear números (opcional)
const formatNumber = (value, decimals = 1) => {
  if (!value || isNaN(parseFloat(value))) return '';
  return parseFloat(value).toFixed(decimals);
};

  // Función para formatear número de teléfono
  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length < 4) return phoneNumber;
    if (phoneNumber.length < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  // Handle contact number changes
  const handleContactNumberChange = (index, value) => {
    if (isLoggingOut) return;
    const formattedNumber = formatPhoneNumber(value);
    const updatedNumbers = [...formData.contactNumbers];
    updatedNumbers[index] = formattedNumber;
    setFormData(prev => ({ ...prev, contactNumbers: updatedNumbers }));
  };
  
  // Add a new contact number
  const addContactNumber = () => {
    if (isLoggingOut) return;
    setFormData(prev => ({
      ...prev,
      contactNumbers: [...prev.contactNumbers, '']
    }));
  };
  
  // Remove a contact number
  const removeContactNumber = (index) => {
    if (isLoggingOut) return;
    if (formData.contactNumbers.length > 1) {
      const updatedNumbers = [...formData.contactNumbers];
      updatedNumbers.splice(index, 1);
      setFormData(prev => ({ ...prev, contactNumbers: updatedNumbers }));
    }
  };
  
  // Handle agency selection
  const handleAgencyChange = (e) => {
    if (isLoggingOut) return;
    const agencyId = e.target.value;
    setFormData(prev => ({
      ...prev,
      agencyId,
      agencyBranch: '',
      nurseManager: '',
      newNurseManager: ''
    }));
    setAddingNewManager(false);
  };
  
  // Handle homebound option changes - CORREGIDO
  const handleHomeboundChange = (optionId, isChecked) => {
    if (isLoggingOut) return;
    setFormData(prev => ({
      ...prev,
      homebound: {
        ...prev.homebound,
        [optionId]: isChecked
      }
    }));
  };
  
  // Handle reasons for referral changes - CORREGIDO
  const handleReasonChange = (reasonId, isChecked) => {
    if (isLoggingOut) return;
    setFormData(prev => ({
      ...prev,
      reasonsForReferral: {
        ...prev.reasonsForReferral,
        [reasonId]: isChecked
      }
    }));
  };

  // Handle discipline selection - MEJORADO
  const handleDisciplineChange = (discipline) => {
    if (isLoggingOut) return;
    
    const updatedDisciplines = {
      ...selectedDisciplines,
      [discipline]: !selectedDisciplines[discipline]
    };
    
    setSelectedDisciplines(updatedDisciplines);
    
    const selectedDisciplinesList = Object.keys(updatedDisciplines).filter(key => updatedDisciplines[key]);
    
    setFormData(prev => ({
      ...prev,
      disciplines: selectedDisciplinesList
    }));

    // Si se deselecciona una disciplina, limpiar su terapeuta asignado
    if (!updatedDisciplines[discipline]) {
      setSelectedTherapists(prev => ({
        ...prev,
        [discipline]: ''
      }));
    }
  };
  
  // Handle therapist selection
  const handleTherapistSelection = (discipline, therapistId) => {
    if (isLoggingOut) return;
    setSelectedTherapists(prev => ({
      ...prev,
      [discipline]: therapistId
    }));
  };
  
  // Reset form to initial state - CORREGIDO
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      address: '',
      city: '',
      zipCode: '',
      contactNumbers: [''],
      payorType: '',
      certPeriodStart: '',
      certPeriodEnd: '',
      urgencyLevel: 'normal',
      physician: '',
      agencyId: '',
      agencyBranch: '',
      nurseManager: '',
      nursingDiagnosis: '',
      pmh: '',
      priorLevelOfFunction: 'To Be Obtained at Evaluation',
      homebound: {
        na: false,
        needs_assistance: false,
        residual_weakness: false,
        requires_assistance_ambulate: false,
        confusion: false,
        safely_leave: false,
        sob: false,
        adaptive_devices: false,
        medical_restrictions: false,
        taxing_effort: false,
        bedbound: false,
        transfers: false,
        other: false,
        otherReason: ''
      },
      wbs: '',
      weight: '',
      weightUnit: 'lbs',
      height: '',
      heightUnit: 'ft',
      reasonsForReferral: {
        strength_balance: false,
        gait: false,
        adls: false,
        orthopedic: false,
        neurological: false,
        wheelchair: false,
        additional: ''
      },
      disciplines: []
    });
    
    setSelectedDisciplines({
      PT: false,
      PTA: false,
      OT: false,
      COTA: false,
      ST: false,
      STA: false
    });
    
    setSelectedTherapists({
      PT: '',
      PTA: '',
      OT: '',
      COTA: '',
      ST: '',
      STA: ''
    });
    
    setUploadedFiles([]);
    setAddingNewManager(false);
    console.log('Form has been reset completely');
  };

  // Cancel creating referral and go back to menu
  const handleCancelCreateReferral = () => {
    if (isLoggingOut) return;
    
    const hasFormData = Object.values(formData).some(value => {
      if (typeof value === 'string') return value !== '';
      if (Array.isArray(value)) return value.length > 0 && value[0] !== '';
      if (typeof value === 'object') return Object.values(value).some(v => v !== false && v !== '');
      return false;
    });
    
    if (hasFormData && !window.confirm('Are you sure you want to cancel? All entered data will be lost.')) {
      return;
    }
    
    setCurrentView('menu');
    resetForm();
  };

  ////////////////////////////////HTML DE LA PAGINA////////////////////////////////////////////////

  // Homebound options - ACTUALIZADO
  const homeboundOptions = [
    { id: 'na', label: 'N/A', icon: 'fa-times-circle' },
    { id: 'needs_assistance', label: 'Needs assistance for all activities', icon: 'fa-hands-helping' },
    { id: 'residual_weakness', label: 'Residual Weakness', icon: 'fa-battery-quarter' },
    { id: 'requires_assistance_ambulate', label: 'Requires assistance to ambulate', icon: 'fa-walking' },
    { id: 'confusion', label: 'Confusion, unable to go out of home alone', icon: 'fa-brain' },
    { id: 'safely_leave', label: 'Unable to safely leave home unassisted', icon: 'fa-door-open' },
    { id: 'sob', label: 'Severe SOB, SOB upon exertion', icon: 'fa-lungs' },
    { id: 'adaptive_devices', label: 'Dependent upon adaptive device(s)', icon: 'fa-wheelchair' },
    { id: 'medical_restrictions', label: 'Medical restrictions', icon: 'fa-ban' },
    { id: 'taxing_effort', label: 'Requires taxing effort to leave home', icon: 'fa-dumbbell' },
    { id: 'bedbound', label: 'Bedbound', icon: 'fa-bed' },
    { id: 'transfers', label: 'Requires assistance with transfers', icon: 'fa-exchange-alt' },
    { id: 'other', label: 'Other (Explain)', icon: 'fa-plus-circle' }
  ];

  // Prior Level of Function options
  const priorLevelOptions = [
    'To Be Obtained at Evaluation',
    'I (No Assist)',
    'MI (Uses Assistive Device)',
    'S (Set up/Supervision)',
    'SBA (Stand By Assist)',
    'MIN (Requires 0-25% Assist)',
    'MOD (Requires 26-50% Assist)',
    'MAX (Requires 51-75% Assist)',
    'TOT (Requires 76-99% Assist)',
    'DEP (100% Assist)'
  ];

  // Reasons for Referral options - ACTUALIZADO
  const referralOptions = [
    { id: 'strength_balance', label: 'Decreased Strength / Balance' },
    { id: 'gait', label: 'Decreased Gait Ability' },
    { id: 'adls', label: 'ADLs' },
    { id: 'orthopedic', label: 'Orthopedic Operation' },
    { id: 'neurological', label: 'Neurological / Cognitive' },
    { id: 'wheelchair', label: 'Wheelchair Evaluation' }
  ];

  return (
    <div 
      className={`referrals-dashboard ${menuTransitioning ? 'transitioning' : ''} 
                  ${isLoggingOut ? 'logging-out' : ''} 
                  ${currentView === 'createReferral' ? 'form-active' : ''}`}
      ref={containerRef}
    >
      {/* Logout animation */}
      {isLoggingOut && (
        <LogoutAnimation 
          isMobile={isMobile} 
          onAnimationComplete={handleLogoutAnimationComplete} 
        />
      )}
      
      {/* Form submission loading screen */}
      {formSubmitting && (
        <LoadingScreen isLoading={true} onComplete={() => setFormSubmitting(false)} />
      )}
      
      {/* Parallax background */}
      <div 
        className="parallax-background"
        style={{ 
          transform: `scale(1.1) translate(${parallaxPosition.x}px, ${parallaxPosition.y}px)` 
        }}
      >
        <div className="gradient-overlay"></div>
      </div>
      
      {/* Header with logo and profile */}
      <header className={`main-header ${isLoggingOut ? 'logging-out' : ''}`}>
        <div className="header-container">
          {/* Logo with neon effect */}
          <div className="logo-container">
            <div className="logo-glow"></div>
            <img src={logoImg} alt="TherapySync Logo" className="logo" />
          </div>
          
          {/* Main navigation buttons */}
          <div className="menu-navigation">
            <button 
              className="nav-button main-menu" 
              onClick={handleMainMenuTransition}
              title="Back to main menu"
              disabled={isLoggingOut}
            >
              <i className="fas fa-th-large"></i>
              <span>Main Menu</span>
            </button>
            
            <button 
              className="nav-button referrals-menu active" 
              title="Referrals Menu"
              disabled={isLoggingOut}
            >
              <i className="fas fa-file-medical"></i>
              <span>Referrals</span>
            </button>
          </div>

          {/* Enhanced user profile with responsive layout */}
          <div className="support-user-profile" ref={userMenuRef}>
            <div 
              className={`support-profile-button ${showUserMenu ? 'active' : ''}`} 
              onClick={() => !isLoggingOut && setShowUserMenu(!showUserMenu)}
              data-tooltip="Your profile and settings"
            >
              <div className="support-avatar">
                <div className="support-avatar-text">{userData.avatar}</div>
                <div className={`support-avatar-status ${userData.status}`}></div>
              </div>
              
              <div className="support-profile-info">
                <span className="support-user-name">{userData.name}</span>
                <span className="support-user-role">{userData.role}</span>
              </div>
              
              <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'}`}></i>
            </div>
            
            {/* User dropdown menu */}
            {showUserMenu && !isLoggingOut && (
              <div className="support-user-menu">
                <div className="support-menu-header">
                  <div className="support-user-info">
                    <div className="support-user-avatar">
                      <span>{userData.avatar}</span>
                      <div className={`avatar-status ${userData.status}`}></div>
                    </div>
                    <div className="support-user-details">
                      <h4>{userData.name}</h4>
                      <span className="support-user-email">{userData.email}</span>
                      <span className={`support-user-status ${userData.status}`}>
                        <i className="fas fa-circle"></i> 
                        {userData.status.charAt(0).toUpperCase() + userData.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="support-menu-section">
                  <div className="section-title">Account</div>
                  <div className="support-menu-items">
                    <div className="support-menu-item">
                      <i className="fas fa-user-circle"></i>
                      <span>My Profile</span>
                    </div>
                    <div className="support-menu-item">
                      <i className="fas fa-cog"></i>
                      <span>Settings</span>
                    </div>
                    <div className="support-menu-item">
                      <i className="fas fa-calendar-alt"></i>
                      <span>My Schedule</span>
                    </div>
                  </div>
                </div>
                
                <div className="support-menu-section">
                  <div className="section-title">Preferences</div>
                  <div className="support-menu-items">
                    <div className="support-menu-item">
                      <i className="fas fa-bell"></i>
                      <span>Notifications</span>
                      <div className="support-notification-badge">{notificationCount}</div>
                    </div>
                    <div className="support-menu-item toggle-item">
                      <div className="toggle-item-content">
                        <i className="fas fa-moon"></i>
                        <span>Dark Mode</span>
                      </div>
                      <div className="toggle-switch">
                        <div className="toggle-handle active"></div>
                      </div>
                    </div>
                    <div className="support-menu-item toggle-item">
                      <div className="toggle-item-content">
                        <i className="fas fa-volume-up"></i>
                        <span>Sound Alerts</span>
                      </div>
                      <div className="toggle-switch">
                        <div className="toggle-handle"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="support-menu-section">
                  <div className="section-title">Support</div>
                  <div className="support-menu-items">
                    <div className="support-menu-item">
                      <i className="fas fa-headset"></i>
                      <span>Contact Support</span>
                    </div>
                    <div className="support-menu-item">
                      <i className="fas fa-bug"></i>
                      <span>Report Issue</span>
                    </div>
                  </div>
                </div>
                
                <div className="support-menu-footer">
                  <div className="support-menu-item logout" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Log Out</span>
                  </div>
                  <div className="version-info">
                    <span>TherapySync™ Support</span>
                    <span>v2.7.0</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className={`main-content ${isLoggingOut ? 'fade-out' : ''}`}>
        {/* Referral Form Loading Animation */}
        {referralFormLoading && (
          <div className="referral-form-loading">
            <div className="loading-container">
              <div className="loader-wrapper">
                <div className="loader-ring"></div>
                <div className="loader-pulse"></div>
                <div className="loader-icon">
                  <i className="fas fa-file-medical"></i>
                </div>
              </div>
              <p>Preparing referral form<span className="dots"><span>.</span><span>.</span><span>.</span></span></p>
            </div>
          </div>
        )}
        
        {/* Main Referrals Menu */}
        {currentView === 'menu' && !referralFormLoading && (
          <div className="referrals-container menu-container">
            <h1 className="referrals-title">Referral Management</h1>
            <p className="referrals-subtitle">Select an option from the menu below to manage referrals</p>
            
            {isLoading ? (
              <div className="loading-container">
                <div className="loader-wrapper">
                  <div className="loader-ring"></div>
                  <div className="loader-pulse"></div>
                  <div className="loader-icon">
                    <i className="fas fa-file-medical"></i>
                  </div>
                </div>
                <p>Loading referral options<span className="dots"><span>.</span><span>.</span><span>.</span></span></p>
              </div>
            ) : (
              <div className="options-container">
                <div className="option-card" onClick={handleStartCreateReferral}>
                  <div className="card-glow"></div>
                  <div className="option-icon-container">
                    <div className="icon-pulse"></div>
                    <i className="fas fa-file-medical"></i>
                    <div className="icon-badge">
                      <i className="fas fa-plus"></i>
                    </div>
                  </div>
                  <h2>Create New Referral</h2>
                  <div className="title-underline"></div>
                  <p>Create and submit a new patient referral form</p>
                  <div className="option-footer">
                    <button className="action-button">
                      <span>Get Started</span>
                      <div className="button-icon">
                        <i className="fas fa-arrow-right"></i>
                      </div>
                    </button>
                  </div>
                </div>
                
                <div className="option-card" onClick={handleReferralStats}>
                  <div className="card-glow stats-glow"></div>
                  <div className="option-icon-container stats">
                    <div className="icon-pulse stats-pulse"></div>
                    <i className="fas fa-chart-bar"></i>
                    <div className="mini-charts">
                      <div className="mini-chart"></div>
                      <div className="mini-chart"></div>
                      <div className="mini-chart"></div>
                    </div>
                  </div>
                  <h2>Referral Stats</h2>
                  <div className="title-underline stats-underline"></div>
                  <p>View statistics and history of all referrals</p>
                  <div className="option-footer">
                    <button className="action-button stats-button">
                      <span>View Stats</span>
                      <div className="button-icon">
                        <i className="fas fa-arrow-right"></i>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Create Referral Form */}
        {currentView === 'createReferral' && !referralFormLoading && (
          <div className="create-referral-container">
            <div className="form-header">
              <div className="title-section">
                <h2>
                  <i className="fas fa-plus-circle"></i>
                  New Referral Information
                </h2>
                <p>Complete the form below to create a new patient referral</p>
              </div>
              <button 
                className="cancel-button" 
                onClick={handleCancelCreateReferral} 
                disabled={isLoggingOut}
              >
                <i className="fas fa-times"></i>
                <span>Cancel</span>
              </button>
            </div>
            
            {/* Formulario para crear paciente */}
            <form className="patient-referral-form" onSubmit={handleSubmit}>
              {/* Patient Information Section */}
              <div className="form-section">
                <div className="section-header">
                  <i className="fas fa-user-injured"></i>
                  <h3>Patient Information</h3>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="dob">Date of Birth</label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      disabled={isLoggingOut}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="zipCode">Zip Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Contact Numbers</label>
                    <div className="contact-numbers">
                      {formData.contactNumbers.map((number, index) => (
                        <div key={index} className="contact-number-row">
                          <input
                            type="tel"
                            value={number}
                            onChange={(e) => handleContactNumberChange(index, e.target.value)}
                            placeholder="(___) ___-____"
                            maxLength="14"
                            disabled={isLoggingOut}
                          />
                          
                          <div className="contact-actions">
                            {index === formData.contactNumbers.length - 1 && (
                              <button
                                type="button"
                                className="add-contact"
                                onClick={addContactNumber}
                                disabled={isLoggingOut}
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            )}
                            
                            {formData.contactNumbers.length > 1 && (
                              <button
                                type="button"
                                className="remove-contact"
                                onClick={() => removeContactNumber(index)}
                                disabled={isLoggingOut}
                              >
                                <i className="fas fa-minus"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Care Period Section */}
              <div className="form-section">
                <div className="section-header">
                  <i className="fas fa-calendar-alt"></i>
                  <h3>Care Period</h3>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="payorType">Payor Type</label>
                    <select
                      id="payorType"
                      name="payorType"
                      value={formData.payorType}
                      onChange={handleInputChange}
                      required
                      disabled={isLoggingOut}
                    >
                      <option value="">Select Payor Type</option>
                      <option value="medicare">Medicare</option>
                      <option value="medicaid">Medicaid</option>
                      <option value="private">Private Insurance</option>
                      <option value="self">Self Pay</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Cert Period</label>
                    <div className="cert-period-container">
                      <div className="date-inputs">
                        <div className="date-input start-date">
                          <CustomDatePicker
                            selectedDate={formData.certPeriodStart}
                            onChange={(date) => {
                              if (isLoggingOut) return;
                              setFormData(prev => ({
                                ...prev,
                                certPeriodStart: date
                              }));
                            }}
                            name="certPeriodStart"
                            required={true}
                            disabled={isLoggingOut}
                          />
                        </div>
                        <span className="date-separator">-</span>
                        <div className="date-input end-date">
                          <CustomDatePicker
                            selectedDate={formData.certPeriodEnd}
                            onChange={(date) => {
                              if (isLoggingOut) return;
                              setFormData(prev => ({
                                ...prev,
                                certPeriodEnd: date
                              }));
                            }}
                            name="certPeriodEnd"
                            required={true}
                            disabled={isLoggingOut}
                          />
                        </div>
                      </div>
                      <small className="form-text text-muted">
                        End date is automatically calculated as SOC + 60 days, but can be modified if needed
                      </small>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="urgencyLevel">Urgency Level</label>
                    <select
                      id="urgencyLevel"
                      name="urgencyLevel"
                      value={formData.urgencyLevel}
                      onChange={handleInputChange}
                      disabled={isLoggingOut}
                    >
                      <option value="low">Low Priority</option>
                      <option value="normal">Normal</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Medical Information Section */}
              <div className="form-section">
                <div className="section-header">
                  <i className="fas fa-stethoscope"></i>
                  <h3>Medical Information</h3>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="physician">Physician</label>
                    <input
                      type="text"
                      name="physician"
                      value={formData.physician || ''}
                      onChange={handleInputChange}
                      placeholder="Enter physician name"
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="agencyId">Agency</label>
                    <select 
                      name="agencyId" 
                      value={formData.agencyId} 
                      onChange={handleAgencyChange} 
                      className="form-select"
                      required
                      disabled={isLoggingOut}
                    >
                      <option value="">Select Agency</option>
                      {agencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {formData.agencyId && (
                    <>
                      <div className="form-group">
                        <label htmlFor="agencyBranch">Agency Branch</label>
                        <select 
                          id="agencyBranch" 
                          name="agencyBranch" 
                          value={formData.agencyBranch} 
                          onChange={handleInputChange} 
                          disabled={isLoggingOut} 
                        > 
                          <option value="">Select Branch</option> 
                          <option value="main">Main Branch</option>
                          <option value="north">North Branch</option>
                          <option value="south">South Branch</option>
                          <option value="east">East Branch</option>
                          <option value="west">West Branch</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="nurseManager">Nurse Manager</label>
                        <input
                          type="text"
                          id="nurseManager"
                          name="nurseManager"
                          value={formData.nurseManager || ''}
                          onChange={handleInputChange}
                          placeholder="Enter nurse manager name"
                          required
                          disabled={isLoggingOut}
                        />
                      </div>
                      
                      {addingNewManager && (
                        <div className="form-group">
                          <label htmlFor="newNurseManager">New Nurse Manager Name</label>
                          <input
                            type="text"
                            id="newNurseManager"
                            name="newNurseManager"
                            value={formData.newNurseManager || ''}
                            onChange={handleInputChange}
                            required
                            disabled={isLoggingOut}
                          />
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="form-group full-width">
                    <label htmlFor="nursingDiagnosis">Nursing Diagnosis</label>
                    <textarea
                      id="nursingDiagnosis"
                      name="nursingDiagnosis"
                      value={formData.nursingDiagnosis}
                      onChange={handleInputChange}
                      rows="3"
                      required
                      disabled={isLoggingOut}
                      placeholder="Enter nursing diagnosis..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="pmh">PMH (Past Medical History)</label>
                    <textarea
                      id="pmh"
                      name="pmh"
                      value={formData.pmh}
                      onChange={handleInputChange}
                      rows="3"
                      disabled={isLoggingOut}
                      placeholder="Enter past medical history..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="priorLevelOfFunction">Prior Level of Function</label>
                    <select
                      id="priorLevelOfFunction"
                      name="priorLevelOfFunction"
                      value={formData.priorLevelOfFunction}
                      onChange={handleInputChange}
                      disabled={isLoggingOut}
                    >
                      {priorLevelOptions.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Homebound Section - ESTRUCTURA CORREGIDA */}
                  <div className="form-group full-width">
                    <label>Homebound</label>
                    <div className="homebound-options">
                      {homeboundOptions.map(option => (
                        <div key={option.id} className="option-item">
                          <label className="checkbox-container">
                            <input
                              type="checkbox"
                              checked={formData.homebound[option.id] || false}
                              onChange={(e) => handleHomeboundChange(option.id, e.target.checked)}
                              disabled={isLoggingOut}
                            />
                            <span className="checkmark"></span>
                            <span className="checkbox-label">{option.label}</span>
                          </label>
                          
                          {option.id === 'other' && formData.homebound.other && (
                            <input
                              type="text"
                              className="other-reason-input"
                              placeholder="Explain other reason"
                              value={formData.homebound.otherReason || ''}
                              onChange={(e) => {
                                if (isLoggingOut) return;
                                setFormData(prev => ({
                                  ...prev,
                                  homebound: {
                                    ...prev.homebound,
                                    otherReason: e.target.value
                                  }
                                }));
                              }}
                              disabled={isLoggingOut}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="wbs">WBS (Weight Bearing Status)</label>
                    <select
                      id="wbs"
                      name="wbs"
                      value={formData.wbs}
                      onChange={handleInputChange}
                      disabled={isLoggingOut}
                      className="wbs-select"
                    >
                      {wbsOptions.map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Weight field with unit selection - MEJORADO */}
{/* Weight field con diseño large */}
<div className="form-group">
  <label htmlFor="weight">Weight</label>
  <div className="premium-measurement-container">
    <div className="measurement-input-wrapper">
      <input
        type="number"
        id="weight"
        name="weight"
        value={formData.weight}
        onChange={handleWeightChange}
        onBlur={(e) => {
          const value = parseFloat(e.target.value);
          if (!isNaN(value)) {
            setFormData(prev => ({
              ...prev,
              weight: value.toString()
            }));
          }
        }}
        placeholder="Enter weight"
        min="0"
        max="1000"
        step="0.1"
        disabled={isLoggingOut}
        className="premium-number-field"
      />
    </div>
    <div className="measurement-unit-wrapper">
      <select
        name="weightUnit"
        value={formData.weightUnit}
        onChange={handleWeightUnitChange}
        disabled={isLoggingOut}
        className="premium-unit-selector"
      >
        <option value="lbs">lbs</option>
        <option value="kg">kg</option>
      </select>
    </div>
  </div>
  {formData.weightUnit === 'kg' && (
    <small className="form-text text-muted">
      Enter weight in kilograms
    </small>
  )}
</div>

{/* Height field con nuevo diseño premium */}
<div className="form-group">
  <label htmlFor="height">Height</label>
  <div className="premium-measurement-container">
    <div className="measurement-input-wrapper">
      <input
        type="number"
        id="height"
        name="height"
        value={formData.height}
        onChange={handleHeightChange}
        onBlur={(e) => {
          const value = parseFloat(e.target.value);
          if (!isNaN(value)) {
            setFormData(prev => ({
              ...prev,
              height: value.toString()
            }));
          }
        }}
        placeholder="Enter height"
        min="0"
        max={formData.heightUnit === 'ft' ? "10" : "300"}
        step="0.1"
        disabled={isLoggingOut}
        className="premium-number-field"
      />
    </div>
    <div className="measurement-unit-wrapper">
      <select
        name="heightUnit"
        value={formData.heightUnit}
        onChange={handleHeightUnitChange}
        disabled={isLoggingOut}
        className="premium-unit-selector"
      >
        <option value="ft">ft</option>
        <option value="cm">cm</option>
      </select>
    </div>
  </div>
  {formData.heightUnit === 'ft' && (
    <small className="form-text text-muted">
      Enter height in feet (e.g., 5.5 for 5 feet 6 inches)
    </small>
  )}
  {formData.heightUnit === 'cm' && (
    <small className="form-text text-muted">
      Enter height in centimeters
    </small>
  )}
</div>
                </div>
              </div>
              
              {/* Therapy Information Section */}
              <div className="form-section">
                <div className="section-header">
                  <i className="fas fa-heartbeat"></i>
                  <h3>Therapy Information</h3>
                </div>
                
                <div className="form-grid">
                  {/* Reasons for Referral - ESTRUCTURA CORREGIDA */}
                  <div className="form-group full-width">
                    <label>Reasons for Referral</label>
                    <div className="reason-options">
                      {referralOptions.map(reason => (
                        <div key={reason.id} className="option-item">
                          <label className="checkbox-container">
                            <input
                              type="checkbox"
                              checked={formData.reasonsForReferral[reason.id] || false}
                              onChange={(e) => handleReasonChange(reason.id, e.target.checked)}
                              disabled={isLoggingOut}
                            />
                            <span className="checkmark"></span>
                            <span className="checkbox-label">{reason.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="additional-reasons">
                      <label htmlFor="additionalReasons">Additional Reasons:</label>
                      <textarea
                        id="additionalReasons"
                        name="additionalReasons"
                        value={formData.reasonsForReferral.additional || ''}
                        onChange={(e) => {
                          if (isLoggingOut) return;
                          setFormData(prev => ({
                            ...prev,
                            reasonsForReferral: {
                              ...prev.reasonsForReferral,
                              additional: e.target.value
                            }
                          }));
                        }}
                        rows="3"
                        placeholder="Enter any additional reasons for referral..."
                        disabled={isLoggingOut}
                      />
                    </div>
                  </div>
                  
                  {/* Disciplines Section - MEJORADO */}
                  <div className="form-group full-width">
                    <label>Disciplines Needed</label>
                    <div className="disciplines-container">
                      <div className="disciplines-pairs">
                        {/* PT & PTA */}
                        <div className="discipline-pair">
                          <div className="discipline-checkboxes">
                            <label className={`discipline-checkbox ${selectedDisciplines.PT ? 'selected' : ''}`}>
                              <input
                                type="checkbox"
                                checked={selectedDisciplines.PT}
                                onChange={() => handleDisciplineChange('PT')}
                                disabled={isLoggingOut}
                              />
                              <span>PT</span>
                            </label>
                            <label className={`discipline-checkbox ${selectedDisciplines.PTA ? 'selected' : ''}`}>
                              <input
                                type="checkbox"
                                checked={selectedDisciplines.PTA}
                                onChange={() => handleDisciplineChange('PTA')}
                                disabled={isLoggingOut}
                              />
                              <span>PTA</span>
                            </label>
                          </div>

                          {/* PT Therapist selection */}
                          {selectedDisciplines.PT && (
                            <div className="therapist-select">
                              <label htmlFor="pt-therapist">PT Therapist</label>
                              <select 
                                id="pt-therapist" 
                                className="therapist-selector" 
                                value={selectedTherapists.PT || ''} 
                                onChange={(e) => handleTherapistSelection('PT', e.target.value)}
                                required
                                disabled={isLoggingOut}
                              >
                                <option value="">Select PT Therapist</option>
                                {therapists
                                  .filter(t => t.role.toLowerCase() === 'pt')
                                  .map(t => (
                                    <option key={t.id} value={t.id}>
                                      {t.name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}

                          {/* PTA Therapist selection */}
                          {selectedDisciplines.PTA && (
                            <div className="therapist-select">
                              <label htmlFor="pta-therapist">PTA Therapist</label>
                              <select 
                                id="pta-therapist" 
                                className="therapist-selector" 
                                value={selectedTherapists.PTA || ''} 
                                onChange={(e) => handleTherapistSelection('PTA', e.target.value)}
                                required
                                disabled={isLoggingOut}
                              >
                                <option value="">Select PTA Therapist</option>
                                {therapists
                                  .filter(t => t.role.toLowerCase() === 'pta')
                                  .map(t => (
                                    <option key={t.id} value={t.id}>
                                      {t.name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                        </div>

                        {/* OT & COTA */}
                        <div className="discipline-pair">
                          <div className="discipline-checkboxes">
                            <label className={`discipline-checkbox ${selectedDisciplines.OT ? 'selected' : ''}`}>
                              <input
                                type="checkbox"
                                checked={selectedDisciplines.OT}
                                onChange={() => handleDisciplineChange('OT')}
                                disabled={isLoggingOut}
                              />
                              <span>OT</span>
                            </label>
                            <label className={`discipline-checkbox ${selectedDisciplines.COTA ? 'selected' : ''}`}>
                            <input
                                type="checkbox"
                                checked={selectedDisciplines.COTA}
                                onChange={() => handleDisciplineChange('COTA')}
                                disabled={isLoggingOut}
                              />
                              <span>COTA</span>
                            </label>
                          </div>

                          {/* OT Therapist selection */}
                          {selectedDisciplines.OT && (
                            <div className="therapist-select">
                              <label htmlFor="ot-therapist">OT Therapist</label>
                              <select 
                                id="ot-therapist" 
                                className="therapist-selector" 
                                value={selectedTherapists.OT || ''} 
                                onChange={(e) => handleTherapistSelection('OT', e.target.value)}
                                required
                                disabled={isLoggingOut}
                              >
                                <option value="">Select OT Therapist</option>
                                {therapists
                                  .filter(t => t.role.toLowerCase() === 'ot')
                                  .map(t => (
                                    <option key={t.id} value={t.id}>
                                      {t.name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}

                          {/* COTA Therapist selection */}
                          {selectedDisciplines.COTA && (
                            <div className="therapist-select">
                              <label htmlFor="cota-therapist">COTA Therapist</label>
                              <select 
                                id="cota-therapist" 
                                className="therapist-selector" 
                                value={selectedTherapists.COTA || ''} 
                                onChange={(e) => handleTherapistSelection('COTA', e.target.value)}
                                required
                                disabled={isLoggingOut}
                              >
                                <option value="">Select COTA Therapist</option>
                                {therapists
                                  .filter(t => t.role.toLowerCase() === 'cota')
                                  .map(t => (
                                    <option key={t.id} value={t.id}>
                                      {t.name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                        </div>

                        {/* ST & STA */}
                        <div className="discipline-pair">
                          <div className="discipline-checkboxes">
                            <label className={`discipline-checkbox ${selectedDisciplines.ST ? 'selected' : ''}`}>
                              <input
                                type="checkbox"
                                checked={selectedDisciplines.ST}
                                onChange={() => handleDisciplineChange('ST')}
                                disabled={isLoggingOut}
                              />
                              <span>ST</span>
                            </label>
                            <label className={`discipline-checkbox ${selectedDisciplines.STA ? 'selected' : ''}`}>
                              <input
                                type="checkbox"
                                checked={selectedDisciplines.STA}
                                onChange={() => handleDisciplineChange('STA')}
                                disabled={isLoggingOut}
                              />
                              <span>STA</span>
                            </label>
                          </div>

                          {/* ST Therapist selection */}
                          {selectedDisciplines.ST && (
                            <div className="therapist-select">
                              <label htmlFor="st-therapist">ST Therapist</label>
                              <select 
                                id="st-therapist" 
                                className="therapist-selector" 
                                value={selectedTherapists.ST || ''} 
                                onChange={(e) => handleTherapistSelection('ST', e.target.value)}
                                required
                                disabled={isLoggingOut}
                              >
                                <option value="">Select ST Therapist</option>
                                {therapists
                                  .filter(t => t.role.toLowerCase() === 'st')
                                  .map(t => (
                                    <option key={t.id} value={t.id}>
                                      {t.name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}

                          {/* STA Therapist selection */}
                          {selectedDisciplines.STA && (
                            <div className="therapist-select">
                              <label htmlFor="sta-therapist">STA Therapist</label>
                              <select 
                                id="sta-therapist" 
                                className="therapist-selector" 
                                value={selectedTherapists.STA || ''} 
                                onChange={(e) => handleTherapistSelection('STA', e.target.value)}
                                required
                                disabled={isLoggingOut}
                              >
                                <option value="">Select STA Therapist</option>
                                {therapists
                                  .filter(t => t.role.toLowerCase() === 'sta')
                                  .map(t => (
                                    <option key={t.id} value={t.id}>
                                      {t.name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="discipline-note">
                        <p><i className="fas fa-info-circle"></i> At least one discipline must be selected (PT, PTA, OT, COTA, ST, or STA)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Documents Upload Section */}
              <div className="form-section">
                <div className="section-header">
                  <i className="fas fa-file-pdf"></i>
                  <h3>Supporting Documents</h3>
                </div>

                <div className="document-upload-area">
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isLoggingOut}
                  />
                  
                  <div 
                    className={`upload-zone ${uploadedFiles.length > 0 ? 'has-files' : ''}`} 
                    onClick={handlePdfAreaClick}
                  >
                    {uploadedFiles.length === 0 ? (
                      <>
                        <div className="upload-icon">
                          <i className="fas fa-cloud-upload-alt"></i>
                        </div>
                        <h4>Upload Patient Documents</h4>
                        <p>Click to upload or drag PDF files here</p>
                        <button type="button" className="browse-btn">
                          <i className="fas fa-folder-open"></i> Browse Files
                        </button>
                      </>
                    ) : (
                      <div className="uploaded-files">
                        <div className="files-header">
                          <div className="files-icon">
                            <i className="fas fa-file-pdf"></i>
                            <div className="files-count">{uploadedFiles.length}</div>
                          </div>
                          <h4>{uploadedFiles.length} {uploadedFiles.length === 1 ? 'File' : 'Files'} Selected</h4>
                        </div>
                        
                        <div className="file-list">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="file-item">
                              <i className="fas fa-file-pdf"></i>
                              <span className="file-name">{file.name}</span>
                              <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="upload-actions">
                          <button 
                            type="button" 
                            className="change-files-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current.click();
                            }}
                            disabled={isLoggingOut}
                          >
                            <i className="fas fa-exchange-alt"></i> Change Files
                          </button>
                          <button 
                            type="button" 
                            className="clear-files-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedFiles([]);
                            }}
                            disabled={isLoggingOut}
                          >
                            <i className="fas fa-trash-alt"></i> Clear Files
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="upload-guidelines">
                      <p><i className="fas fa-info-circle"></i> Supported formats: PDF only. Max file size: 10MB per file</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Submit Section */}
              <div className="form-section submit-section">
                <div className="form-group full-width submit-group">
                  <button 
                    type="submit" 
                    className="save-referral-btn"
                    disabled={isLoggingOut || formSubmitting}
                  >
                    {formSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Save Patient Referral
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
        
        {/* Referral Stats */}
        {currentView === 'stats' && !referralFormLoading && (
          <div className="referrals-container stats-container">
            <div className="form-header">
              <div className="title-section">
                <h2>
                  <i className="fas fa-chart-bar"></i>
                  Referral Statistics
                </h2>
                <p>View and manage patient referrals and their change history</p>
              </div>
              <button 
                className="cancel-button" 
                onClick={() => setCurrentView('menu')} 
                disabled={isLoggingOut}
              >
                <i className="fas fa-times"></i>
                <span>Back to Menu</span>
              </button>
            </div>
            <ReferralStats />
          </div>
        )}
      </main>
    </div>
  );
};

export default DevReferralsPage;