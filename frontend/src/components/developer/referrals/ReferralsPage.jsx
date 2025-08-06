import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../components/login/AuthContext';
import '../../../styles/developer/Referrals/ReferralsPage.scss';
import '../../../styles/developer/Referrals/ClinicalLoading.scss';
import '../../../styles/developer/Referrals/ClinicalReferralForm.scss';
import logoImg from '../../../assets/LogoMHC.jpeg';
import LogoutAnimation from '../../../components/LogOut/LogOut';
import ReferralStats from './ReferralStats';

const ReferralsPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const [currentView, setCurrentView] = useState('menu');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  
  // Form data state - matching exactly admin version
  const [formData, setFormData] = useState({
    // Patient personal data
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    address: '',
    city: '',
    zipCode: '',
    
    // Contact information structure  
    primaryPhone: '',
    secondaryPhone: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
      address: ''
    },
    
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
    homebound: {},
    wbs: '',
    weight: '',
    weightUnit: 'lbs', 
    height: '',
    heightUnit: 'ft', 
    
    // Therapy
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Form state management
  const [agencies, setAgencies] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [selectedTherapists, setSelectedTherapists] = useState({
    PT: '', PTA: '', OT: '', COTA: '', ST: '', STA: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState({
    PT: false, PTA: false, OT: false, COTA: false, ST: false, STA: false
  });
  const [addingNewManager, setAddingNewManager] = useState(false);
  const fileInputRef = useRef(null);

  // Clinical Loading System - Medical Professional
  const clinicalStages = [
    {
      id: 1,
      title: "Connecting to Medical Database",
      subtitle: "Establishing secure connection...",
      progressRange: [0, 30],
      duration: 450,
      icon: "fas fa-database",
      color: "#2563EB",
      glowColor: "rgba(37, 99, 235, 0.3)"
    },
    {
      id: 2,
      title: "Verifying HIPAA Compliance",
      subtitle: "Ensuring patient data security...",
      progressRange: [30, 60],
      duration: 450,
      icon: "fas fa-shield-check",
      color: "#0891B2",
      glowColor: "rgba(8, 145, 178, 0.3)"
    },
    {
      id: 3,
      title: "Loading Patient Records",
      subtitle: "Accessing clinical information...",
      progressRange: [60, 85],
      duration: 375,
      icon: "fas fa-file-medical",
      color: "#059669",
      glowColor: "rgba(5, 150, 105, 0.3)"
    },
    {
      id: 4,
      title: "Initializing Clinical Interface",
      subtitle: "Preparing therapeutic workspace...",
      progressRange: [85, 100],
      duration: 225,
      icon: "fas fa-stethoscope",
      color: "#7C3AED",
      glowColor: "rgba(124, 58, 237, 0.3)"
    }
  ];

  const [currentStage, setCurrentStage] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);

  // Options arrays - exact same as admin version
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

  const referralOptions = [
    { id: 'strength_balance', label: 'Decreased Strength / Balance' },
    { id: 'gait', label: 'Decreased Gait Ability' },
    { id: 'adls', label: 'ADLs' },
    { id: 'orthopedic', label: 'Orthopedic Operation' },
    { id: 'neurological', label: 'Neurological / Cognitive' },
    { id: 'wheelchair', label: 'Wheelchair Evaluation' }
  ];

  useEffect(() => {
    if (!isInitialLoading) return;

    let globalTime = 0;
    let currentStageIndex = 0;
    let stageStartTime = 0;

    const interval = setInterval(() => {
      globalTime += 50;
      
      // Determine current stage based on total time
      let accumulatedTime = 0;
      let newStageIndex = 0;
      
      for (let i = 0; i < clinicalStages.length; i++) {
        if (globalTime <= accumulatedTime + clinicalStages[i].duration) {
          newStageIndex = i;
          break;
        }
        accumulatedTime += clinicalStages[i].duration;
      }

      // Update stage if changed
      if (newStageIndex !== currentStageIndex) {
        currentStageIndex = newStageIndex;
        setCurrentStage(currentStageIndex);
        stageStartTime = globalTime - accumulatedTime;
      }

      // Calculate progress within current stage
      const currentStageData = clinicalStages[currentStageIndex];
      const stageElapsed = globalTime - accumulatedTime;
      const stageProgressPercent = Math.min(100, (stageElapsed / currentStageData.duration) * 100);
      
      // Map stage progress to global progress range
      const [rangeStart, rangeEnd] = currentStageData.progressRange;
      const globalProgress = rangeStart + ((rangeEnd - rangeStart) * stageProgressPercent / 100);
      
      setLoadingProgress(Math.min(100, globalProgress));
      setStageProgress(stageProgressPercent);

      // Complete loading
      if (globalProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 800);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isInitialLoading]);

  // Load agencies from backend
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await fetch('http://localhost:8000/staff');
        if (!response.ok) throw new Error('Failed to fetch staff');
        const data = await response.json();
        console.log('Staff data loaded:', data);
        
        // Debug: let's see all roles
        console.log('All roles found:', data.map(person => ({ name: person.name, role: person.role })));
        
        // Filter for agencies - looking for names that might be agencies
        const agenciesOnly = data.filter(person => {
          const name = person.name?.toLowerCase() || '';
          const role = person.role?.toLowerCase() || '';
          
          return role === 'agency' || 
                 role === 'organization' ||
                 name.includes('agency') ||
                 name.includes('home') ||
                 name.includes('health') ||
                 name.includes('supportive') ||
                 name.includes('clear') ||
                 name.includes('hh') ||
                 name.includes('care') ||
                 name.includes('medical') ||
                 name.includes('clinic');
        });
        console.log('Agencies found:', agenciesOnly);
        setAgencies(agenciesOnly);
      } catch (error) {
        console.error('Error loading agencies:', error);
      }
    };
  
    fetchAgencies();
  }, []);

  // Load therapists from backend
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
      }
    };
  
    fetchTherapists();
  }, []);

  // Auto-calculate cert period end date
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

  function getInitials(name) {
    if (!name) return "U";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoggingOut) return;

    // Validation check
    console.log('🔍 Form validation check...');
    
    // Validate date of birth format and range
    if (formData.dob) {
      const dobDate = new Date(formData.dob);
      const currentYear = new Date().getFullYear();
      const dobYear = dobDate.getFullYear();
      
      if (isNaN(dobDate.getTime())) {
        console.error('❌ Invalid date format:', formData.dob);
        alert('Please enter a valid date of birth');
        setFormSubmitting(false);
        return;
      }
      
      if (dobYear < 1900 || dobYear > currentYear) {
        console.error('❌ Invalid birth year:', dobYear);
        alert(`Please enter a valid birth year between 1900 and ${currentYear}`);
        setFormSubmitting(false);
        return;
      }
      
      if (dobDate > new Date()) {
        console.error('❌ Future birth date:', formData.dob);
        alert('Birth date cannot be in the future');
        setFormSubmitting(false);
        return;
      }
    }
    
    // Check required fields
    const requiredFields = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dob: formData.dob,
      gender: formData.gender,
      address: formData.address,
      city: formData.city,
      zipCode: formData.zipCode,
      primaryPhone: formData.primaryPhone,
      emergencyContactName: formData.emergencyContact.name,
      emergencyContactPhone: formData.emergencyContact.phone,
      emergencyContactRelationship: formData.emergencyContact.relationship,
      payorType: formData.payorType,
      certPeriodStart: formData.certPeriodStart,
      physician: formData.physician,
      agencyId: formData.agencyId,
      nursingDiagnosis: formData.nursingDiagnosis
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || value === '')
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      setFormSubmitting(false);
      return;
    }
    
    // Check if at least one discipline is selected
    const selectedDisciplinesList = Object.keys(selectedDisciplines).filter(key => selectedDisciplines[key]);
    if (selectedDisciplinesList.length === 0) {
      console.error('❌ No disciplines selected');
      alert('Please select at least one therapeutic discipline (PT, PTA, OT, COTA, ST, or STA)');
      setFormSubmitting(false);
      return;
    }
    
    // Check if therapists are assigned for selected disciplines
    const missingTherapists = selectedDisciplinesList.filter(discipline => !selectedTherapists[discipline]);
    if (missingTherapists.length > 0) {
      console.error('❌ Missing therapists for:', missingTherapists);
      alert(`Please select therapists for the following disciplines: ${missingTherapists.join(', ')}`);
      setFormSubmitting(false);
      return;
    }
    
    console.log('✅ All validations passed, proceeding with submission...');

    // Function to convert homebound object to simple string
    const formatHomeboundForBackend = (homeboundObj) => {
      if (!homeboundObj || Object.keys(homeboundObj).length === 0) return '';
      
      const trueReasons = [];
      if (homeboundObj.na) trueReasons.push('N/A');
      if (homeboundObj.needs_assistance) trueReasons.push('Needs assistance for all activities');
      if (homeboundObj.residual_weakness) trueReasons.push('Residual Weakness');
      if (homeboundObj.requires_assistance_ambulate) trueReasons.push('Requires assistance to ambulate');
      if (homeboundObj.confusion) trueReasons.push('Confusion, unable to go out of home alone');
      if (homeboundObj.safely_leave) trueReasons.push('Unable to safely leave home unassisted');
      if (homeboundObj.sob) trueReasons.push('Severe SOB, SOB upon exertion');
      if (homeboundObj.adaptive_devices) trueReasons.push('Dependent upon adaptive device(s)');
      if (homeboundObj.medical_restrictions) trueReasons.push('Medical restrictions');
      if (homeboundObj.taxing_effort) trueReasons.push('Requires taxing effort to leave home');
      if (homeboundObj.bedbound) trueReasons.push('Bedbound');
      if (homeboundObj.transfers) trueReasons.push('Requires assistance with transfers');
      if (homeboundObj.other) trueReasons.push('Other (Explain)');
      
      return trueReasons.length > 0 ? trueReasons.join(', ') : '';
    };

    try {
      setFormSubmitting(true);

      // Step 1: Create patient - Debug and validate payload
      const patientPayload = {
        full_name: `${formData.firstName} ${formData.lastName}`,
        birthday: formData.dob,
        gender: formData.gender,
        address: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
        contact_info: {
          'primary#': formData.primaryPhone,
          ...(formData.secondaryPhone ? { 'secondary': formData.secondaryPhone } : {}),
          // Convertir emergency contact al formato esperado por EmergencyContactsComponent
          [formData.emergencyContact.name || 'Emergency_Contact']: `${formData.emergencyContact.phone}|${formData.emergencyContact.relationship || 'Emergency'}`
        },
        // También enviar primary_phone para compatibilidad con PatientInfoPage
        primary_phone: formData.primaryPhone,
        insurance: formData.payorType || '',
        physician: formData.physician,
        nurse: formData.nurseManager,
        agency_id: parseInt(formData.agencyId),
        nursing_diagnosis: formData.nursingDiagnosis,
        urgency_level: formData.urgencyLevel,
        prior_level_of_function: formData.priorLevelOfFunction,
        homebound_status: formatHomeboundForBackend(formData.homebound),
        weight_bearing_status: formData.wbs,
        referral_reason: JSON.stringify(formData.reasonsForReferral),
        weight: formData.weight ? `${formData.weight} ${formData.weightUnit}` : '',
        height: formData.height ? `${formData.height} ${formData.heightUnit}` : '',
        past_medical_history: formData.pmh,
        initial_cert_start_date: formData.certPeriodStart
      };

      console.log('🔍 Payload being sent to backend:', patientPayload);
      console.log('📋 Required fields check:');
      console.log('  - full_name:', patientPayload.full_name);
      console.log('  - birthday:', patientPayload.birthday);
      console.log('  - gender:', patientPayload.gender);
      console.log('  - address:', patientPayload.address);
      console.log('  - agency_id:', patientPayload.agency_id);
      console.log('  - insurance (payor type):', patientPayload.insurance);
      console.log('  - homebound_status:', patientPayload.homebound_status);
      console.log('📋 Form data payor type check:', formData.payorType);
      console.log('📋 Form data homebound check:', formData.homebound);
      console.log('📋 Homebound formatted:', formatHomeboundForBackend(formData.homebound));
      console.log('📋 Form data nurse check:', formData.nurseManager);

      const createRes = await fetch('http://localhost:8000/patients/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientPayload),
      });

      console.log('📡 Response status:', createRes.status);
      console.log('📡 Response ok:', createRes.ok);
      
      if (!createRes.ok) {
        const errorText = await createRes.text();
        console.error('❌ Backend error response:', errorText);
        throw new Error(`Failed to create patient: ${createRes.status} - ${errorText}`);
      }

      const createdPatient = await createRes.json();
      const patientId = createdPatient.id;

      // Step 2: Assign therapists
      console.log('👩‍⚕️ Assigning therapists:', selectedTherapists);
      
      for (const [discipline, staffId] of Object.entries(selectedTherapists)) {
        if (staffId && selectedDisciplines[discipline]) {
          console.log(`🔗 Assigning ${discipline} therapist (ID: ${staffId}) to patient ${patientId}`);
          
          const assignRes = await fetch(`http://localhost:8000/assign-staff?patient_id=${patientId}&staff_id=${parseInt(staffId)}`, {
            method: 'POST'
          });
          
          if (!assignRes.ok) {
            const assignError = await assignRes.text();
            console.error(`❌ Error assigning ${discipline} therapist:`, assignError);
            throw new Error(`Error assigning ${discipline} therapist: ${assignRes.status}`);
          }
          
          console.log(`✅ Successfully assigned ${discipline} therapist`);
        }
      }

      // Step 3: Upload documents
      if (uploadedFiles.length > 0) {
        console.log(`📄 Uploading ${uploadedFiles.length} document(s)...`);
        
        for (let file of uploadedFiles) {
          console.log(`📁 Uploading file: ${file.name}`);
          
          const formDataDoc = new FormData();
          formDataDoc.append('file', file);
          formDataDoc.append('patient_id', patientId);

          const uploadRes = await fetch('http://localhost:8000/documents/upload', {
            method: 'POST',
            body: formDataDoc
          });

          if (!uploadRes.ok) {
            const uploadError = await uploadRes.text();
            console.error(`❌ Error uploading ${file.name}:`, uploadError);
            throw new Error(`Error uploading document ${file.name}: ${uploadRes.status}`);
          }
          
          console.log(`✅ Successfully uploaded ${file.name}`);
        }
      } else {
        console.log('📄 No documents to upload');
      }

      console.log("✅ 🎉 Patient created successfully!");
      console.log(`🆙 Patient ID: ${patientId}`);
      
      // Show success message
      alert(`Patient ${formData.firstName} ${formData.lastName} has been successfully created with ID: ${patientId}`);
      
      resetForm();
      setCurrentView("menu");
    } catch (error) {
      console.error('❌ 😱 Submission failed:', error);
      alert(`Error creating patient: ${error.message}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Form input change handler
  const handleInputChange = (e) => {
    if (isLoggingOut) return;
    
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Phone number formatting function
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Apply (123) 456-7890 format
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  // Contact handlers - improved system
  const handlePrimaryPhoneChange = (value) => {
    if (isLoggingOut) return;
    const formattedValue = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, primaryPhone: formattedValue }));
  };

  const handleSecondaryPhoneChange = (value) => {
    if (isLoggingOut) return;
    const formattedValue = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, secondaryPhone: formattedValue }));
  };

  const handleEmergencyContactChange = (field, value) => {
    if (isLoggingOut) return;
    
    let formattedValue = value;
    if (field === 'phone') {
      formattedValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: formattedValue
      }
    }));
  };

  // Agency selection handler
  const handleAgencyChange = (e) => {
    if (isLoggingOut) return;
    
    const agencyId = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      agencyId,
      agencyBranch: '',
      nurseManager: ''
    }));
    
    setAddingNewManager(false);
  };

  // Homebound options handler
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

  // Referral reasons handler
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

  // Discipline selection handler
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
  };

  // Therapist selection handler
  const handleTherapistSelection = (discipline, therapistId) => {
    if (isLoggingOut) return;

    setSelectedTherapists(prev => ({
      ...prev,
      [discipline]: therapistId
    }));
  };

  // File upload handlers
  const handleFileUpload = (e) => {
    if (isLoggingOut) return;
    
    const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
    
    if (files.length === 0) {
      console.log('Please upload only PDF files.');
      return;
    }
    
    setUploadedFiles(files);
  };

  // File upload area click handler
  const handlePdfAreaClick = () => {
    if (isLoggingOut) return;
    fileInputRef.current?.click();
  };

  // Reset form handler
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      address: '',
      city: '',
      zipCode: '',
      primaryPhone: '',
      secondaryPhone: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: '',
        address: ''
      },
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
      homebound: {},
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
      PT: false, PTA: false, OT: false, COTA: false, ST: false, STA: false
    });
    
    setSelectedTherapists({
      PT: '', PTA: '', OT: '', COTA: '', ST: '', STA: ''
    });
    
    setUploadedFiles([]);
    setAddingNewManager(false);
  };
  
  const userData = {
    name: currentUser?.fullname || currentUser?.username || 'User',
    avatar: getInitials(currentUser?.fullname || currentUser?.username || 'User'),
    email: currentUser?.email || 'user@example.com',
    role: currentUser?.role || 'User',
    status: 'online',
  };

  const handleMainMenuTransition = () => {
    if (isLoggingOut) return;
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    navigate(`/${baseRole}/homePage`);
  };

  const handleCreateReferral = () => {
    if (isLoggingOut) return;
    setCurrentView('createReferral');
  };

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

  const handleReferralStats = () => {
    if (isLoggingOut) return;
    setCurrentView('stats');
  };

  const handleBackToMenu = () => {
    if (isLoggingOut) return;
    handleCancelCreateReferral();
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setShowUserMenu(false);
    document.body.classList.add('logging-out');
  };
  
  const handleLogoutAnimationComplete = () => {
    logout();
    navigate('/');
  };

  // CLINICAL LOADING INTERFACE
  if (isInitialLoading) {
    const activeStage = clinicalStages[currentStage] || clinicalStages[0];
    
    return (
      <div className="clinical-loading-medical">
        {/* Neural Network Background */}
        <div className="neural-background">
          <div className="neural-grid"></div>
          <div className="data-streams">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`data-stream stream-${i}`}></div>
            ))}
          </div>
          <div className="medical-particles">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="medical-particle"
                style={{ 
                  '--particle-color': activeStage.color,
                  '--glow-color': activeStage.glowColor,
                  animationDelay: `${i * 0.15}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Main Loading Interface */}
        <div className="loading-interface">
          {/* Header System */}
          <div className="system-header">
            <div className="brand-container">
              <div className="logo-hologram">
                <img src={logoImg} alt="TheraSoft" className="logo-image" />
                <div className="hologram-effect"></div>
              </div>
              <div className="brand-text">
                <h1 className="brand-title">TheraSoft</h1>
                <p className="brand-subtitle">Professional Clinical Management</p>
              </div>
            </div>
          </div>

          {/* Current Stage Display */}
          <div className="stage-display">
            <div className="stage-icon-container">
              <div 
                className="stage-icon-bg"
                style={{ 
                  backgroundColor: activeStage.glowColor,
                  boxShadow: `0 0 50px ${activeStage.glowColor}`
                }}
              >
                <i 
                  className={activeStage.icon}
                  style={{ color: activeStage.color }}
                ></i>
              </div>
              <div className="stage-pulse" style={{ borderColor: activeStage.color }}></div>
            </div>
            
            <div className="stage-info">
              <h2 className="stage-title" style={{ color: activeStage.color }}>
                {activeStage.title}
              </h2>
              <p className="stage-subtitle">{activeStage.subtitle}</p>
            </div>
          </div>

          {/* Progress System */}
          <div className="progress-system">
            {/* Global Progress Bar */}
            <div className="global-progress">
              <div className="progress-labels">
                <span className="progress-label">SYSTEM INITIALIZATION</span>
                <span className="progress-value">{Math.round(loadingProgress)}%</span>
              </div>
              <div className="progress-container">
                <div className="progress-track">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${loadingProgress}%`,
                      backgroundColor: activeStage.color,
                      boxShadow: `0 0 20px ${activeStage.glowColor}`
                    }}
                  >
                    <div className="progress-glow"></div>
                    <div className="progress-scanner"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Progress Indicators */}
            <div className="stage-indicators">
              {clinicalStages.map((stage, index) => (
                <div 
                  key={stage.id} 
                  className={`stage-indicator ${index <= currentStage ? 'active' : ''} ${index < currentStage ? 'completed' : ''}`}
                >
                  <div 
                    className="indicator-dot"
                    style={{ 
                      backgroundColor: index <= currentStage ? stage.color : '#374151',
                      boxShadow: index === currentStage ? `0 0 15px ${stage.color}` : 'none'
                    }}
                  >
                    {index < currentStage && <i className="fas fa-check"></i>}
                    {index === currentStage && (
                      <div className="scanning-ring" style={{ borderColor: stage.color }}></div>
                    )}
                  </div>
                  <span className="indicator-label">{stage.progressRange[1]}%</span>
                </div>
              ))}
            </div>

            {/* Stage Progress Detail */}
            <div className="stage-progress-detail">
              <div className="detail-label">
                STAGE {currentStage + 1} OF {clinicalStages.length} • {activeStage.progressRange[0]}% - {activeStage.progressRange[1]}%
              </div>
              <div className="detail-bar">
                <div 
                  className="detail-fill"
                  style={{ 
                    width: `${stageProgress}%`,
                    backgroundColor: activeStage.color
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Neural Activity Monitor */}
          <div className="neural-monitor">
            <div className="monitor-header">
              <span className="monitor-label">NEURAL ACTIVITY</span>
              <span className="monitor-status">ACTIVE</span>
            </div>
            <div className="neural-waves">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="neural-wave"
                  style={{ 
                    animationDelay: `${i * 0.3}s`,
                    backgroundColor: activeStage.color
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="system-status">
            <div className="status-grid">
              <div className="status-item">
                <i className="fas fa-shield-check"></i>
                <span>HIPAA SECURE</span>
              </div>
              <div className="status-item">
                <i className="fas fa-lock"></i>
                <span>ENCRYPTED</span>
              </div>
              <div className="status-item">
                <i className="fas fa-wifi"></i>
                <span>CONNECTED</span>
              </div>
              <div className="status-item">
                <i className="fas fa-microchip"></i>
                <span>AI READY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Effect */}
        {loadingProgress >= 98 && (
          <div className="completion-animation">
            <div className="success-burst">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`burst-ray ray-${i}`}></div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`premium-referral-dashboard ${isLoggingOut ? 'logging-out' : ''}`}>
      {isLoggingOut && (
        <LogoutAnimation 
          isMobile={window.innerWidth < 768} 
          onAnimationComplete={handleLogoutAnimationComplete} 
        />
      )}

      {/* Header siguiendo Header.jsx exacto pero sin ruleta */}
      <header className={`main-header ${isLoggingOut ? 'logging-out' : ''}`}>
        <div className="header-container">
          <div className="logo-container">
            <div className="logo-glow"></div>
            <img src={logoImg} alt="TherapySync Logo" className="logo" onClick={() => !isLoggingOut && handleMainMenuTransition()} />
            
            <div className="menu-navigation">
              <button 
                className="nav-button main-menu" 
                onClick={handleMainMenuTransition}
                title="Volver al menú principal"
                disabled={isLoggingOut}
              >
                <i className="fas fa-th-large"></i>
                <span>Main Menu</span>
              </button>
              
              <button 
                className="nav-button referrals-menu active" 
                title="Menú de Referrals"
                disabled={isLoggingOut}
              >
                <i className="fas fa-file-medical"></i>
                <span>Referrals</span>
              </button>
            </div>
          </div>
          
          <div className="support-user-profile" ref={userMenuRef => userMenuRef}>
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
                    <div 
                      className="support-menu-item"
                      onClick={() => {
                        const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
                        navigate(`/${baseRole}/profile`);
                      }}
                    >
                      <i className="fas fa-user-circle"></i>
                      <span>My Profile</span>
                    </div>
                    <div 
                      className="support-menu-item"
                      onClick={() => {
                        const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
                        navigate(`/${baseRole}/settings`);
                      }}
                    >
                      <i className="fas fa-cog"></i>
                      <span>Settings</span>
                    </div>
                  </div>
                </div>
                
                <div className="support-menu-footer">
                  <div className="support-menu-item logout" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Log Out</span>
                  </div>
                  <div className="version-info">
                    <span>TherapySync™</span>
                    <span>v2.7.0</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Premium Main Content */}
      <main className="premium-main-content">
        {currentView === 'menu' && (
          <div className="premium-menu-container">
            {/* Hero Section */}
            <div className="hero-section">
              <div className="hero-content">
                <div className="hero-icon">
                  <i className="fas fa-file-medical-alt"></i>
                  <div className="icon-pulse"></div>
                </div>
                <h1 className="hero-title">Referral Management</h1>
                <p className="hero-subtitle">Streamlined clinical referral processing and management system</p>
              </div>
            </div>

            {/* Ultra Modern Executive Options Grid - Responsive y Clínico */}
            <div className="ultra-modern-options-grid">
              <div className="dynamic-molecular-network">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`branching-molecule molecule-${i}`}>
                    <div className="main-branch"></div>
                    <div className="branch-1"></div>
                    <div className="branch-2"></div>
                    <div className="sub-branch-1"></div>
                    <div className="sub-branch-2"></div>
                    <div className="sub-branch-3"></div>
                    <div className="micro-branch-1"></div>
                    <div className="micro-branch-2"></div>
                  </div>
                ))}
              </div>
              {/* Executive Create Referral Card */}
              <div className="executive-option-card create-executive-card" onClick={handleCreateReferral}>
                <div className="card-3d-depth"></div>
                <div className="card-shadow-layer"></div>
                <div className="holographic-overlay create-holo"></div>
                <div className="card-inner-light"></div>
                
                <div className="executive-card-header">
                  <div className="premium-3d-icon-system create-system">
                    <div className="icon-depth-layers">
                      <div className="depth-layer layer-1"></div>
                      <div className="depth-layer layer-2"></div>
                      <div className="depth-layer layer-3"></div>
                    </div>
                    <div className="main-icon-container">
                      <i className="fas fa-plus-circle premium-icon"></i>
                      <div className="icon-energy-rings">
                        <div className="energy-ring ring-1"></div>
                        <div className="energy-ring ring-2"></div>
                      </div>
                    </div>
                    <div className="floating-micro-particles">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className={`micro-particle mp-${i}`}></div>
                      ))}
                    </div>
                  </div>
                  <div className="executive-title-system">
                    <h2 className="premium-card-title">Create New Referral</h2>
                    <div className="title-accent-line"></div>
                  </div>
                </div>
                
                <div className="executive-card-content">
                  <p className="premium-description">
                    Initialize comprehensive patient referral workflow with advanced 
                    clinical intelligence and automated documentation protocols.
                  </p>
                  
                  <div className="premium-features-grid">
                    <div className="feature-item-premium">
                      <div className="feature-icon-wrap">
                        <i className="fas fa-user-md"></i>
                      </div>
                      <span>Advanced Patient Profiling</span>
                    </div>
                    <div className="feature-item-premium">
                      <div className="feature-icon-wrap">
                        <i className="fas fa-file-medical-alt"></i>
                      </div>
                      <span>Clinical Documentation AI</span>
                    </div>
                    <div className="feature-item-premium">
                      <div className="feature-icon-wrap">
                        <i className="fas fa-network-wired"></i>
                      </div>
                      <span>Intelligent Assignment</span>
                    </div>
                  </div>

                  <div className="card-metrics-display">
                    <div className="metric-item">
                      <span className="metric-value">98%</span>
                      <span className="metric-label">Accuracy</span>
                    </div>
                    <div className="metric-divider"></div>
                    <div className="metric-item">
                      <span className="metric-value">2.5s</span>
                      <span className="metric-label">Processing</span>
                    </div>
                  </div>
                </div>
                
                <div className="executive-card-footer">
                  <button className="ultra-premium-action-btn create-action">
                    <div className="btn-energy-field"></div>
                    <span className="btn-text">Initialize Referral</span>
                    <div className="btn-arrow-system">
                      <i className="fas fa-arrow-right"></i>
                      <div className="arrow-trail"></div>
                    </div>
                  </button>
                </div>
                
                <div className="card-status-indicator">
                  <div className="status-pulse active"></div>
                  <span>Ready</span>
                </div>
              </div>

              {/* Executive Statistics Card */}
              <div className="executive-option-card stats-executive-card" onClick={handleReferralStats}>
                <div className="card-3d-depth stats-depth"></div>
                <div className="card-shadow-layer"></div>
                <div className="holographic-overlay stats-holo"></div>
                <div className="card-inner-light"></div>
                
                <div className="executive-card-header">
                  <div className="premium-3d-icon-system stats-system">
                    <div className="icon-depth-layers stats-layers">
                      <div className="depth-layer layer-1"></div>
                      <div className="depth-layer layer-2"></div>
                      <div className="depth-layer layer-3"></div>
                    </div>
                    <div className="main-icon-container stats-container">
                      <i className="fas fa-chart-line premium-icon"></i>
                      <div className="live-chart-animation">
                        <div className="chart-line line-1"></div>
                        <div className="chart-line line-2"></div>
                        <div className="chart-line line-3"></div>
                        <div className="chart-dots">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`chart-dot dot-${i}`}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="floating-data-points">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className={`data-point dp-${i}`}></div>
                      ))}
                    </div>
                  </div>
                  <div className="executive-title-system">
                    <h2 className="premium-card-title">Analytics Dashboard</h2>
                    <div className="title-accent-line stats-accent"></div>
                  </div>
                </div>
                
                <div className="executive-card-content">
                  <p className="premium-description">
                    Executive-level analytics with real-time insights, predictive 
                    modeling, and comprehensive performance intelligence.
                  </p>
                  
                  <div className="premium-features-grid">
                    <div className="feature-item-premium">
                      <div className="feature-icon-wrap stats-icon">
                        <i className="fas fa-brain"></i>
                      </div>
                      <span>Predictive Analytics</span>
                    </div>
                    <div className="feature-item-premium">
                      <div className="feature-icon-wrap stats-icon">
                        <i className="fas fa-tachometer-alt"></i>
                      </div>
                      <span>Real-time Monitoring</span>
                    </div>
                    <div className="feature-item-premium">
                      <div className="feature-icon-wrap stats-icon">
                        <i className="fas fa-chart-pie"></i>
                      </div>
                      <span>Executive Reporting</span>
                    </div>
                  </div>

                  <div className="card-metrics-display stats-metrics">
                    <div className="metric-item">
                      <span className="metric-value">1,247</span>
                      <span className="metric-label">Referrals</span>
                    </div>
                    <div className="metric-divider"></div>
                    <div className="metric-item">
                      <span className="metric-value trending-up">↑24%</span>
                      <span className="metric-label">Growth</span>
                    </div>
                  </div>
                </div>
                
                <div className="executive-card-footer">
                  <button className="ultra-premium-action-btn stats-action">
                    <div className="btn-energy-field stats-field"></div>
                    <span className="btn-text">Access Dashboard</span>
                    <div className="btn-arrow-system">
                      <i className="fas fa-arrow-right"></i>
                      <div className="arrow-trail"></div>
                    </div>
                  </button>
                </div>
                
                <div className="card-status-indicator stats-status">
                  <div className="status-pulse active"></div>
                  <span>Live</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'createReferral' && (
          <div className="clinical-referral-form-container">
            <div className="clinical-form-header">
              <div className="header-content">
                <div className="header-icon-system">
                  <div className="icon-rings">
                    <div className="ring ring-1"></div>
                    <div className="ring ring-2"></div>
                  </div>
                  <div className="main-icon">
                    <i className="fas fa-file-medical-alt"></i>
                  </div>
                </div>
                <div className="header-text">
                  <h1 className="form-title">New Patient Referral</h1>
                  <p className="form-subtitle">Complete clinical information and therapeutic assessment</p>
                </div>
              </div>
              <button 
                className="clinical-back-btn" 
                onClick={handleBackToMenu}
                disabled={isLoggingOut}
              >
                <div className="btn-icon">
                  <i className="fas fa-arrow-left"></i>
                </div>
                <span>Back to Menu</span>
              </button>
            </div>
            
            <form className="clinical-referral-form" onSubmit={handleSubmit}>
              {/* Patient Information Section */}
              <div className="clinical-form-section patient-info">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-user-injured"></i>
                  </div>
                  <div className="section-title">
                    <h2>Patient Information</h2>
                    <p>Basic demographic and contact details</p>
                  </div>
                </div>
                
                <div className="clinical-form-grid">
                  <div className="form-field">
                    <label className="field-label" htmlFor="firstName">
                      <i className="fas fa-user"></i>
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="clinical-input primary"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter patient's first name"
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label" htmlFor="lastName">
                      <i className="fas fa-user"></i>
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="clinical-input primary"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter patient's last name"
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label" htmlFor="dob">
                      <i className="fas fa-calendar-alt"></i>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      className="clinical-input date-picker"
                      value={formData.dob}
                      onChange={handleInputChange}
                      min="1900-01-01"
                      max={new Date().toISOString().split('T')[0]}
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label" htmlFor="gender">
                      <i className="fas fa-venus-mars"></i>
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="clinical-select"
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
                  
                  <div className="form-field full-width">
                    <label className="field-label" htmlFor="address">
                      <i className="fas fa-home"></i>
                      Full Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className="clinical-input address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address, city, state, zip code"
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label" htmlFor="city">
                      <i className="fas fa-map-marker-alt"></i>
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className="clinical-input"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City name"
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label" htmlFor="zipCode">
                      <i className="fas fa-mail-bulk"></i>
                      Zip Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      className="clinical-input postal"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="Postal code"
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label" htmlFor="primaryPhone">
                      <i className="fas fa-phone"></i>
                      Primary Phone Number
                    </label>
                    <input
                      type="tel"
                      id="primaryPhone"
                      name="primaryPhone"
                      className="clinical-input phone primary-phone"
                      value={formData.primaryPhone}
                      onChange={(e) => handlePrimaryPhoneChange(e.target.value)}
                      placeholder="(123) 456-7890"
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label" htmlFor="secondaryPhone">
                      <i className="fas fa-phone-alt"></i>
                      Secondary Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      id="secondaryPhone"
                      name="secondaryPhone"
                      className="clinical-input phone secondary-phone"
                      value={formData.secondaryPhone}
                      onChange={(e) => handleSecondaryPhoneChange(e.target.value)}
                      placeholder="(123) 456-7890"
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  
                  <div className="form-field full-width emergency-contact-section">
                    <label className="field-label emergency-header">
                      <i className="fas fa-user-shield"></i>
                      Emergency Contact Information
                    </label>
                    <div className="emergency-contact-grid">
                      <div className="emergency-field">
                        <label className="emergency-label" htmlFor="emergencyName">
                          <i className="fas fa-user"></i>
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="emergencyName"
                          className="clinical-input emergency-input"
                          value={formData.emergencyContact.name}
                          onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                          placeholder="Emergency contact full name"
                          required
                          disabled={isLoggingOut}
                        />
                      </div>
                      
                      <div className="emergency-field">
                        <label className="emergency-label" htmlFor="emergencyPhone">
                          <i className="fas fa-phone"></i>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="emergencyPhone"
                          className="clinical-input emergency-input phone"
                          value={formData.emergencyContact.phone}
                          onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                          placeholder="(123) 456-7890"
                          required
                          disabled={isLoggingOut}
                        />
                      </div>
                      
                      <div className="emergency-field">
                        <label className="emergency-label" htmlFor="emergencyRelationship">
                          <i className="fas fa-heart"></i>
                          Relationship
                        </label>
                        <select
                          id="emergencyRelationship"
                          className="clinical-select emergency-select"
                          value={formData.emergencyContact.relationship}
                          onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                          required
                          disabled={isLoggingOut}
                        >
                          <option value="">Select Relationship</option>
                          <option value="spouse">Spouse</option>
                          <option value="parent">Parent</option>
                          <option value="child">Adult Child</option>
                          <option value="sibling">Sibling</option>
                          <option value="friend">Friend</option>
                          <option value="caregiver">Caregiver</option>
                          <option value="guardian">Legal Guardian</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div className="emergency-field full-width">
                        <label className="emergency-label" htmlFor="emergencyAddress">
                          <i className="fas fa-map-marker-alt"></i>
                          Address (Optional)
                        </label>
                        <input
                          type="text"
                          id="emergencyAddress"
                          className="clinical-input emergency-input address"
                          value={formData.emergencyContact.address}
                          onChange={(e) => handleEmergencyContactChange('address', e.target.value)}
                          placeholder="Emergency contact address"
                          disabled={isLoggingOut}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Care Period Section */}
              <div className="clinical-form-section care-period">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <div className="section-title">
                    <h2>Care Period Information</h2>
                    <p>Insurance and certification period details</p>
                  </div>
                </div>
                
                <div className="clinical-form-grid care-period-grid">
                  <div className="form-field full-width">
                    <label className="field-label" htmlFor="payorType">
                      <i className="fas fa-credit-card"></i>
                      Payor Type
                    </label>
                    <select
                      id="payorType"
                      name="payorType"
                      className="clinical-select insurance"
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
                  
                  <div className="form-field full-width cert-period-field">
                    <label className="field-label">
                      <i className="fas fa-calendar-week"></i>
                      Certification Period
                    </label>
                    <div className="cert-period-container">
                      <div className="date-range-inputs">
                        <div className="date-input-wrapper">
                          <label className="date-label">Start Date</label>
                          <input
                            type="date"
                            name="certPeriodStart"
                            className="clinical-input date-picker start"
                            value={formData.certPeriodStart}
                            onChange={handleInputChange}
                            required
                            disabled={isLoggingOut}
                          />
                        </div>
                        <div className="date-separator">
                          <span>-</span>
                        </div>
                        <div className="date-input-wrapper">
                          <label className="date-label">End Date</label>
                          <input
                            type="date"
                            name="certPeriodEnd"
                            className="clinical-input date-picker end"
                            value={formData.certPeriodEnd}
                            onChange={handleInputChange}
                            required
                            disabled={isLoggingOut}
                          />
                        </div>
                      </div>
                      <div className="period-note">
                        <i className="fas fa-info-circle"></i>
                        <span>End date automatically calculated as SOC + 60 days, but can be modified if needed</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-field full-width">
                    <label className="field-label" htmlFor="urgencyLevel">
                      <i className="fas fa-exclamation-triangle"></i>
                      Urgency Level
                    </label>
                    <select
                      id="urgencyLevel"
                      name="urgencyLevel"
                      className="clinical-select urgency"
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
              <div className="clinical-form-section medical-info">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-stethoscope"></i>
                  </div>
                  <div className="section-title">
                    <h2>Medical Information</h2>
                    <p>Clinical details and healthcare providers</p>
                  </div>
                </div>
                
                <div className="clinical-form-grid">
                  <div className="form-field">
                    <label className="field-label" htmlFor="physician">
                      <i className="fas fa-user-md"></i>
                      Physician
                    </label>
                    <input
                      type="text"
                      id="physician"
                      name="physician"
                      className="clinical-input physician"
                      value={formData.physician}
                      onChange={handleInputChange}
                      placeholder="Enter referring physician name"
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label" htmlFor="agencyId">
                      <i className="fas fa-hospital"></i>
                      Agency
                    </label>
                    <select 
                      id="agencyId"
                      name="agencyId" 
                      className="clinical-select agency"
                      value={formData.agencyId} 
                      onChange={handleAgencyChange} 
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
                      <div className="form-field">
                        <label className="field-label" htmlFor="agencyBranch">
                          <i className="fas fa-building"></i>
                          Agency Branch
                        </label>
                        <select 
                          id="agencyBranch" 
                          name="agencyBranch" 
                          className="clinical-select branch"
                          value={formData.agencyBranch} 
                          onChange={handleInputChange} 
                          disabled={isLoggingOut} 
                        > 
                          <option value="">Select Branch</option> 
                          <option value="main">Main Branch</option>
                          <option value="secondary">Secondary Branch</option>
                        </select>
                      </div>
                      
                      <div className="form-field">
                        <label className="field-label" htmlFor="nurseManager">
                          <i className="fas fa-user-nurse"></i>
                          Nurse Manager
                        </label>
                        <input
                          type="text"
                          id="nurseManager"
                          name="nurseManager"
                          className="clinical-input nurse"
                          value={formData.nurseManager}
                          onChange={handleInputChange}
                          placeholder="Enter nurse manager name"
                          required
                          disabled={isLoggingOut}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="form-field full-width">
                    <label className="field-label" htmlFor="nursingDiagnosis">
                      <i className="fas fa-diagnoses"></i>
                      Nursing Diagnosis
                    </label>
                    <textarea
                      id="nursingDiagnosis"
                      name="nursingDiagnosis"
                      className="clinical-textarea diagnosis"
                      value={formData.nursingDiagnosis}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Enter complete nursing diagnosis"
                      required
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-field full-width">
                    <label className="field-label" htmlFor="pmh">
                      <i className="fas fa-file-medical"></i>
                      Past Medical History (PMH)
                    </label>
                    <textarea
                      id="pmh"
                      name="pmh"
                      className="clinical-textarea medical-history"
                      value={formData.pmh}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Enter patient's relevant past medical history"
                      disabled={isLoggingOut}
                    />
                  </div>
                  
                  <div className="form-field full-width">
                    <label className="field-label" htmlFor="priorLevelOfFunction">
                      <i className="fas fa-chart-line"></i>
                      Prior Level of Function
                    </label>
                    <select
                      id="priorLevelOfFunction"
                      name="priorLevelOfFunction"
                      className="clinical-select function-level"
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
                  
                  <div className="form-field full-width homebound-section">
                    <label className="field-label">
                      <i className="fas fa-home-heart"></i>
                      Homebound Status
                    </label>
                    <div className="homebound-options-grid">
                      {homeboundOptions.map(option => (
                        <div key={option.id} className="homebound-option">
                          <label className="clinical-checkbox">
                            <input
                              type="checkbox"
                              checked={!!formData.homebound[option.id]}
                              onChange={(e) => handleHomeboundChange(option.id, e.target.checked)}
                              disabled={isLoggingOut}
                            />
                            <span className="checkbox-mark">
                              <i className="fas fa-check"></i>
                            </span>
                            <div className="checkbox-content">
                              <i className={`option-icon fas ${option.icon}`}></i>
                              <span className="option-text">{option.label}</span>
                            </div>
                          </label>
                          
                          {option.id === 'other' && formData.homebound['other'] && (
                            <div className="other-explanation">
                              <input
                                type="text"
                                className="clinical-input other-reason"
                                placeholder="Please explain other homebound reason..."
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
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label" htmlFor="wbs">
                      <i className="fas fa-weight"></i>
                      Weight Bearing Status (WBS)
                    </label>
                    <select
                      id="wbs"
                      name="wbs"
                      className="clinical-select wbs"
                      value={formData.wbs}
                      onChange={handleInputChange}
                      disabled={isLoggingOut}
                    >
                      {wbsOptions.map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-field measurement-field">
                    <label className="field-label" htmlFor="weight">
                      <i className="fas fa-weight-hanging"></i>
                      Weight
                    </label>
                    <div className="measurement-input">
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        className="clinical-input measurement"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="Enter weight"
                        min="0"
                        step="0.1"
                        disabled={isLoggingOut}
                      />
                      <select
                        name="weightUnit"
                        className="clinical-select unit"
                        value={formData.weightUnit}
                        onChange={handleInputChange}
                        disabled={isLoggingOut}
                      >
                        <option value="lbs">lbs</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-field measurement-field">
                    <label className="field-label" htmlFor="height">
                      <i className="fas fa-ruler-vertical"></i>
                      Height
                    </label>
                    <div className="measurement-input">
                      <input
                        type="number"
                        id="height"
                        name="height"
                        className="clinical-input measurement"
                        value={formData.height}
                        onChange={handleInputChange}
                        placeholder="Enter height"
                        min="0"
                        step="0.1"
                        disabled={isLoggingOut}
                      />
                      <select
                        name="heightUnit"
                        className="clinical-select unit"
                        value={formData.heightUnit}
                        onChange={handleInputChange}
                        disabled={isLoggingOut}
                      >
                        <option value="ft">ft</option>
                        <option value="cm">cm</option>
                      </select>
                    </div>
                    {formData.heightUnit === 'ft' && (
                      <div className="field-note">
                        <i className="fas fa-info-circle"></i>
                        <span>Enter height in feet (e.g., 5.5 for 5 feet 6 inches)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Therapy Information Section */}
              <div className="clinical-form-section therapy-info">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-heartbeat"></i>
                  </div>
                  <div className="section-title">
                    <h2>Therapy Information</h2>
                    <p>Treatment requirements and therapeutic disciplines</p>
                  </div>
                </div>
                
                <div className="clinical-form-grid">
                  <div className="form-field full-width referral-reasons-section">
                    <label className="field-label">
                      <i className="fas fa-clipboard-list"></i>
                      Reasons for Referral
                    </label>
                    <div className="referral-reasons-grid">
                      {referralOptions.map(reason => (
                        <div key={reason.id} className="reason-option">
                          <label className="clinical-checkbox reason-checkbox">
                            <input
                              type="checkbox"
                              checked={!!formData.reasonsForReferral[reason.id]}
                              onChange={(e) => handleReasonChange(reason.id, e.target.checked)}
                              disabled={isLoggingOut}
                            />
                            <span className="checkbox-mark">
                              <i className="fas fa-check"></i>
                            </span>
                            <div className="checkbox-content">
                              <span className="reason-text">{reason.label}</span>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="additional-reasons">
                      <label className="field-label additional-label">
                        <i className="fas fa-plus-square"></i>
                        Additional Reasons
                      </label>
                      <textarea
                        name="additionalReasons"
                        className="clinical-textarea additional-reasons-text"
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
                        placeholder="Specify any additional reasons for referral..."
                        disabled={isLoggingOut}
                      />
                    </div>
                  </div>
                  
                  <div className="form-field full-width disciplines-section">
                    <label className="field-label">
                      <i className="fas fa-user-friends"></i>
                      Therapeutic Disciplines Required
                    </label>
                    <p className="disciplines-note">
                      Select required disciplines and assign specific therapists
                    </p>
                    
                    <div className="disciplines-container">
                      {/* PT & PTA Pair */}
                      <div className="discipline-pair pt-pair">
                        <div className="pair-header">
                          <h3>Physical Therapy</h3>
                        </div>
                        <div className="discipline-checkboxes">
                          <label className={`clinical-checkbox discipline-checkbox ${selectedDisciplines.PT ? 'selected' : ''}`}>
                            <input
                              type="checkbox"
                              checked={selectedDisciplines.PT}
                              onChange={() => handleDisciplineChange('PT')}
                              disabled={isLoggingOut}
                            />
                            <span className="checkbox-mark">
                              <i className="fas fa-check"></i>
                            </span>
                            <div className="checkbox-content">
                              <span className="discipline-name">PT</span>
                              <span className="discipline-desc">Physical Therapist</span>
                            </div>
                          </label>
                          
                          <label className={`clinical-checkbox discipline-checkbox ${selectedDisciplines.PTA ? 'selected' : ''}`}>
                            <input
                              type="checkbox"
                              checked={selectedDisciplines.PTA}
                              onChange={() => handleDisciplineChange('PTA')}
                              disabled={isLoggingOut}
                            />
                            <span className="checkbox-mark">
                              <i className="fas fa-check"></i>
                            </span>
                            <div className="checkbox-content">
                              <span className="discipline-name">PTA</span>
                              <span className="discipline-desc">Physical Therapist Assistant</span>
                            </div>
                          </label>
                        </div>
                        
                        {selectedDisciplines.PT && (
                          <div className="therapist-selection">
                            <label className="field-label" htmlFor="pt-therapist">
                              <i className="fas fa-user-md"></i>
                              Select PT Therapist
                            </label>
                            <select 
                              id="pt-therapist" 
                              className="clinical-select therapist-select"
                              value={selectedTherapists.PT || ''} 
                              onChange={(e) => handleTherapistSelection('PT', e.target.value)}
                              required
                              disabled={isLoggingOut}
                            >
                              <option value="">Choose PT Therapist</option>
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
                        
                        {selectedDisciplines.PTA && (
                          <div className="therapist-selection">
                            <label className="field-label" htmlFor="pta-therapist">
                              <i className="fas fa-user-md"></i>
                              Select PTA Therapist
                            </label>
                            <select 
                              id="pta-therapist" 
                              className="clinical-select therapist-select"
                              value={selectedTherapists.PTA || ''} 
                              onChange={(e) => handleTherapistSelection('PTA', e.target.value)}
                              required
                              disabled={isLoggingOut}
                            >
                              <option value="">Choose PTA Therapist</option>
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
                      
                      {/* OT & COTA Pair */}
                      <div className="discipline-pair ot-pair">
                        <div className="pair-header">
                          <h3>Occupational Therapy</h3>
                        </div>
                        <div className="discipline-checkboxes">
                          <label className={`clinical-checkbox discipline-checkbox ${selectedDisciplines.OT ? 'selected' : ''}`}>
                            <input
                              type="checkbox"
                              checked={selectedDisciplines.OT}
                              onChange={() => handleDisciplineChange('OT')}
                              disabled={isLoggingOut}
                            />
                            <span className="checkbox-mark">
                              <i className="fas fa-check"></i>
                            </span>
                            <div className="checkbox-content">
                              <span className="discipline-name">OT</span>
                              <span className="discipline-desc">Occupational Therapist</span>
                            </div>
                          </label>
                          
                          <label className={`clinical-checkbox discipline-checkbox ${selectedDisciplines.COTA ? 'selected' : ''}`}>
                            <input
                              type="checkbox"
                              checked={selectedDisciplines.COTA}
                              onChange={() => handleDisciplineChange('COTA')}
                              disabled={isLoggingOut}
                            />
                            <span className="checkbox-mark">
                              <i className="fas fa-check"></i>
                            </span>
                            <div className="checkbox-content">
                              <span className="discipline-name">COTA</span>
                              <span className="discipline-desc">Certified Occupational Therapy Assistant</span>
                            </div>
                          </label>
                        </div>
                        
                        {selectedDisciplines.OT && (
                          <div className="therapist-selection">
                            <label className="field-label" htmlFor="ot-therapist">
                              <i className="fas fa-user-md"></i>
                              Select OT Therapist
                            </label>
                            <select 
                              id="ot-therapist" 
                              className="clinical-select therapist-select"
                              value={selectedTherapists.OT || ''} 
                              onChange={(e) => handleTherapistSelection('OT', e.target.value)}
                              required
                              disabled={isLoggingOut}
                            >
                              <option value="">Choose OT Therapist</option>
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
                        
                        {selectedDisciplines.COTA && (
                          <div className="therapist-selection">
                            <label className="field-label" htmlFor="cota-therapist">
                              <i className="fas fa-user-md"></i>
                              Select COTA Therapist
                            </label>
                            <select 
                              id="cota-therapist" 
                              className="clinical-select therapist-select"
                              value={selectedTherapists.COTA || ''} 
                              onChange={(e) => handleTherapistSelection('COTA', e.target.value)}
                              required
                              disabled={isLoggingOut}
                            >
                              <option value="">Choose COTA Therapist</option>
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
                      
                      {/* ST & STA Pair */}
                      <div className="discipline-pair st-pair">
                        <div className="pair-header">
                          <h3>Speech Therapy</h3>
                        </div>
                        <div className="discipline-checkboxes">
                          <label className={`clinical-checkbox discipline-checkbox ${selectedDisciplines.ST ? 'selected' : ''}`}>
                            <input
                              type="checkbox"
                              checked={selectedDisciplines.ST}
                              onChange={() => handleDisciplineChange('ST')}
                              disabled={isLoggingOut}
                            />
                            <span className="checkbox-mark">
                              <i className="fas fa-check"></i>
                            </span>
                            <div className="checkbox-content">
                              <span className="discipline-name">ST</span>
                              <span className="discipline-desc">Speech Therapist</span>
                            </div>
                          </label>
                          
                          <label className={`clinical-checkbox discipline-checkbox ${selectedDisciplines.STA ? 'selected' : ''}`}>
                            <input
                              type="checkbox"
                              checked={selectedDisciplines.STA}
                              onChange={() => handleDisciplineChange('STA')}
                              disabled={isLoggingOut}
                            />
                            <span className="checkbox-mark">
                              <i className="fas fa-check"></i>
                            </span>
                            <div className="checkbox-content">
                              <span className="discipline-name">STA</span>
                              <span className="discipline-desc">Speech Therapist Assistant</span>
                            </div>
                          </label>
                        </div>
                        
                        {selectedDisciplines.ST && (
                          <div className="therapist-selection">
                            <label className="field-label" htmlFor="st-therapist">
                              <i className="fas fa-user-md"></i>
                              Select ST Therapist
                            </label>
                            <select 
                              id="st-therapist" 
                              className="clinical-select therapist-select"
                              value={selectedTherapists.ST || ''} 
                              onChange={(e) => handleTherapistSelection('ST', e.target.value)}
                              required
                              disabled={isLoggingOut}
                            >
                              <option value="">Choose ST Therapist</option>
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
                        
                        {selectedDisciplines.STA && (
                          <div className="therapist-selection">
                            <label className="field-label" htmlFor="sta-therapist">
                              <i className="fas fa-user-md"></i>
                              Select STA Therapist
                            </label>
                            <select 
                              id="sta-therapist" 
                              className="clinical-select therapist-select"
                              value={selectedTherapists.STA || ''} 
                              onChange={(e) => handleTherapistSelection('STA', e.target.value)}
                              required
                              disabled={isLoggingOut}
                            >
                              <option value="">Choose STA Therapist</option>
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
                      
                      <div className="disciplines-requirement-note">
                        <div className="requirement-icon">
                          <i className="fas fa-info-circle"></i>
                        </div>
                        <p>At least one therapeutic discipline must be selected (PT, PTA, OT, COTA, ST, or STA)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Documents Upload Section */}
              <div className="clinical-form-section documents-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-file-upload"></i>
                  </div>
                  <div className="section-title">
                    <h2>Supporting Documents</h2>
                    <p>Upload relevant medical and administrative documents</p>
                  </div>
                </div>
                
                <div className="documents-upload-container">
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
                    className={`clinical-upload-zone ${uploadedFiles.length > 0 ? 'has-files' : ''}`} 
                    onClick={handlePdfAreaClick}
                  >
                    {uploadedFiles.length === 0 ? (
                      <div className="upload-prompt">
                        <div className="upload-icon-container">
                          <div className="upload-icon-bg">
                            <i className="fas fa-cloud-upload-alt"></i>
                          </div>
                          <div className="upload-pulse"></div>
                        </div>
                        <h3>Upload Medical Documents</h3>
                        <p>Click to select PDF files or drag and drop here</p>
                        <button type="button" className="clinical-btn upload-btn">
                          <i className="fas fa-folder-open"></i>
                          <span>Browse Files</span>
                        </button>
                        <div className="upload-requirements">
                          <div className="requirement-item">
                            <i className="fas fa-file-pdf"></i>
                            <span>PDF files only</span>
                          </div>
                          <div className="requirement-item">
                            <i className="fas fa-weight-hanging"></i>
                            <span>Max 10MB per file</span>
                          </div>
                          <div className="requirement-item">
                            <i className="fas fa-shield-alt"></i>
                            <span>HIPAA compliant</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="uploaded-files-display">
                        <div className="files-header">
                          <div className="files-icon-container">
                            <div className="files-icon">
                              <i className="fas fa-file-pdf"></i>
                            </div>
                            <div className="files-count-badge">
                              {uploadedFiles.length}
                            </div>
                          </div>
                          <div className="files-info">
                            <h3>{uploadedFiles.length} {uploadedFiles.length === 1 ? 'Document' : 'Documents'} Selected</h3>
                            <p>Ready for secure upload</p>
                          </div>
                        </div>
                        
                        <div className="files-list">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="file-item">
                              <div className="file-icon">
                                <i className="fas fa-file-pdf"></i>
                              </div>
                              <div className="file-details">
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                              </div>
                              <div className="file-status">
                                <i className="fas fa-check-circle"></i>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="upload-actions">
                          <button 
                            type="button" 
                            className="clinical-btn secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current.click();
                            }}
                          >
                            <i className="fas fa-exchange-alt"></i>
                            <span>Change Files</span>
                          </button>
                          <button 
                            type="button" 
                            className="clinical-btn danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedFiles([]);
                            }}
                          >
                            <i className="fas fa-trash-alt"></i>
                            <span>Clear All</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Form Submission Section */}
              <div className="clinical-form-section submit-section">
                <div className="submit-container">
                  <div className="submit-actions">
                    <button 
                      type="button" 
                      className="clinical-btn secondary cancel-btn"
                      onClick={handleCancelCreateReferral}
                      disabled={isLoggingOut || formSubmitting}
                    >
                      <i className="fas fa-times"></i>
                      <span>Cancel & Discard</span>
                    </button>
                    
                    <button 
                      type="submit" 
                      className="clinical-btn primary submit-btn"
                      disabled={isLoggingOut || formSubmitting}
                    >
                      {formSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Creating Patient...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          <span>Create Patient Referral</span>
                        </>
                      )}
                      <div className="btn-shine"></div>
                    </button>
                  </div>
                  
                  <div className="submit-security-notice">
                    <div className="security-icon">
                      <i className="fas fa-shield-check"></i>
                    </div>
                    <div className="security-text">
                      <p>All patient information is encrypted and HIPAA compliant</p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {currentView === 'stats' && (
          <div className="premium-content-view">
            <div className="content-header">
              <div className="header-info">
                <h2>
                  <i className="fas fa-chart-line"></i>
                  Referral Statistics
                </h2>
                <p>Comprehensive analytics and patient referral history</p>
              </div>
              <button 
                className="premium-back-btn" 
                onClick={handleBackToMenu}
                disabled={isLoggingOut}
              >
                <i className="fas fa-arrow-left"></i>
                <span>Back to Menu</span>
              </button>
            </div>
            
            <div className="content-body">
              <ReferralStats />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReferralsPage;