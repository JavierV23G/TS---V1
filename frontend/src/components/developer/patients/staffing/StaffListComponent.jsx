import React, { useState, useEffect } from 'react';
import '../../../../styles/developer/Patients/Staffing/StaffEditComponent.scss';

const StaffManagementSystem = ({ onBackToOptions, onAddNewStaff }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing Staff Management...');
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('all');
  const [showInactive, setShowInactive] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStaff, setEditedStaff] = useState(null);
  const [passwordResetMode, setPasswordResetMode] = useState(false);
  
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [lastActivity, setLastActivity] = useState(new Date().toLocaleString());
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('danger');
  const [staffDocuments, setStaffDocuments] = useState([]);
  const [staffPatients, setStaffPatients] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  
  // Document Management States
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentModalMode, setDocumentModalMode] = useState('add'); // 'add' or 'edit'
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documentForm, setDocumentForm] = useState({
    document_type: '',
    notes: '',
    file: null,
    fileName: ''
  });
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deletingDocument, setDeletingDocument] = useState(false);

  const roles = [
    { 
      value: 'pt', 
      label: 'Physical Therapist', 
      icon: 'fa-user-md', 
      color: '#2ECC71',
      description: 'Evaluates and treats physical mobility disorders',
      capabilities: ['Patient Evaluations', 'Treatment Plans', 'Progress Tracking', 'Exercise Prescriptions']
    },
    { 
      value: 'pta', 
      label: 'Physical Therapist Assistant', 
      icon: 'fa-user-nurse', 
      color: '#58D68D',
      description: 'Assists physical therapists in treatment delivery',
      capabilities: ['Treatment Assistance', 'Exercise Supervision', 'Progress Reports', 'Patient Communication']
    },
    { 
      value: 'ot', 
      label: 'Occupational Therapist', 
      icon: 'fa-hand-holding-medical', 
      color: '#F39C12',
      description: 'Helps patients improve daily living activities',
      capabilities: ['ADL Assessments', 'Home Modifications', 'Adaptive Equipment', 'Functional Training']
    },
    { 
      value: 'cota', 
      label: 'Occupational Therapy Assistant', 
      icon: 'fa-hand-holding', 
      color: '#F8C471',
      description: 'Assists occupational therapists with treatment',
      capabilities: ['Activity Support', 'Equipment Training', 'Progress Documentation', 'Safety Monitoring']
    },
    { 
      value: 'st', 
      label: 'Speech Therapist', 
      icon: 'fa-comment-medical', 
      color: '#3498DB',
      description: 'Evaluates and treats communication disorders',
      capabilities: ['Speech Evaluations', 'Language Therapy', 'Swallowing Assessments', 'Communication Aids']
    },
    { 
      value: 'sta', 
      label: 'Speech Therapy Assistant', 
      icon: 'fa-comment-dots', 
      color: '#85C1E9',
      description: 'Assists speech therapists with therapy sessions',
      capabilities: ['Therapy Support', 'Practice Sessions', 'Progress Monitoring', 'Resource Preparation']
    },
    { 
      value: 'administrator', 
      label: 'Administrator', 
      icon: 'fa-user-shield', 
      color: '#9B59B6',
      description: 'System administration and user management',
      capabilities: ['Staff Management', 'System Configuration', 'Reports & Analytics', 'Quality Assurance']
    },
    { 
      value: 'developer', 
      label: 'Developer', 
      icon: 'fa-laptop-code', 
      color: '#34495E',
      description: 'System development and technical support',
      capabilities: ['System Development', 'Technical Support', 'Database Management', 'Integration Services']
    },
    { 
      value: 'agency', 
      label: 'Agency', 
      icon: 'fa-hospital-alt', 
      color: '#D4AC0D',
      description: 'Healthcare provider organization',
      capabilities: ['Operations Overview', 'Staff Coordination', 'Compliance Management', 'Business Intelligence']
    }
  ];

  const mockStaffStats = {
    pt: { activePatients: 15, completedEvaluations: 8 },
    pta: { assignedPatients: 12, completedSessions: 42 },
    ot: { activePatients: 9, homeAssessments: 6 },
    cota: { supportedPatients: 8, activitiesLed: 67 },
    st: { activePatients: 7, speechEvaluations: 4 },
    sta: { supportedPatients: 5, practiceHours: 89 },
    administrator: { staffManaged: 45, reportsGenerated: 23 },
    developer: { systemModules: 12, issuesResolved: 34 },
    agency: { totalPatients: 156, activeBranches: 2 }
  };

  const agencyBranches = {
    'Supportive Home Health': [
      {
        id: 1,
        name: 'Supportive HH',
        address: '123 Healthcare Ave, Miami, FL 33101',
        phone: '(305) 555-0123',
        manager: 'Dr. Maria Rodriguez',
        services: ['Physical Therapy', 'Occupational Therapy', 'Speech Therapy'],
        activePatients: 89
      },
      {
        id: 2,
        name: 'Supportive Hospice',
        address: '456 Comfort Blvd, Miami, FL 33102',
        phone: '(305) 555-0456',
        manager: 'Dr. Carlos Martinez',
        services: ['End-of-Life Care', 'Pain Management', 'Family Support'],
        activePatients: 67
      }
    ]
  };

  const therapistDocuments = [
    { id: 'covidVaccine', name: 'Proof of COVID Vaccine', icon: 'fa-syringe', description: 'Vaccination record or certificate' },
    { id: 'tbTest', name: 'TB Test proof (PPD/X-Ray)', description: 'PPD Test (valid for 1 year) or X-Ray TB test (valid for 5 years)', icon: 'fa-lungs' },
    { id: 'physicalExam', name: 'Annual Physical Exam Proof', icon: 'fa-stethoscope', description: 'Medical clearance for healthcare duties' },
    { id: 'liabilityInsurance', name: 'Professional Liability Insurance', icon: 'fa-shield-alt', description: 'Malpractice insurance coverage document' },
    { id: 'driversLicense', name: 'Driver\'s License', icon: 'fa-id-card', description: 'Valid state-issued driver\'s license' },
    { id: 'autoInsurance', name: 'Auto Insurance', icon: 'fa-car-alt', description: 'Proof of current auto insurance coverage' },
    { id: 'cprCertification', name: 'CPR/BLS Certification', icon: 'fa-heartbeat', description: 'Current CPR or Basic Life Support certification' },
    { id: 'businessLicense', name: 'Copy of Business License or EIN', icon: 'fa-certificate', description: 'Business license or Employer Identification Number document' },
  ];

  const agencyDocuments = [
    { id: 'businessLicense', name: 'Business License', icon: 'fa-building', description: 'Valid business operation license' },
    { id: 'contractDocument', name: 'Contract with TherapySync', icon: 'fa-file-contract', description: 'Signed service agreement' },
    { id: 'liabilityInsurance', name: 'Liability Insurance', icon: 'fa-shield-alt', description: 'Organization liability coverage documentation' },
  ];

  const getDocumentsForRole = (role) => {
    switch(role) {
      case 'agency':
        return agencyDocuments;
      case 'pt':
      case 'pta':
      case 'ot':
      case 'cota':
      case 'st':
      case 'sta':
        return therapistDocuments;
      default:
        return [];
    }
  };

  const formatPhoneNumber = (value) => {
    if (!value) return '';
    const phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length >= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    } else if (phoneNumber.length >= 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return phoneNumber.length > 0 ? `(${phoneNumber}` : '';
  };

  useEffect(() => {
    setIsLoading(true);
    setLoadingMessage('Initializing...');
    
    const loadingMessages = [
      { message: 'Connecting to database...', time: 800 },
      { message: 'Verifying user permissions...', time: 500 },
      { message: 'Retrieving staff list...', time: 700 },
      { message: 'Preparing interface...', time: 1200 },
      { message: 'Optimizing performance...', time: 400 }
    ];
    
    const timeouts = [];
    
    loadingMessages.forEach((item, index) => {
      const timeout = setTimeout(() => {
        setLoadingMessage(item.message);
        if (index === loadingMessages.length - 1) {
          const finalTimeout = setTimeout(() => {
            setIsLoading(false);
            fetchStaffData();
          }, 800);
          timeouts.push(finalTimeout);
        }
      }, item.time);
      
      timeouts.push(timeout);
    });
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const fetchStaffData = async () => {
    try {
      const response = await fetch('http://localhost:8000/staff/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Error al obtener los datos del personal');
      }

      const data = await response.json();
      
      const processedData = data.map(staff => {
        const [firstName, ...rest] = staff.name?.split(' ') || [''];
        const lastName = rest.join(' ');
        const actualRole = staff.role?.toLowerCase() || 'developer';
        const roleInfo = roles.find(r => r.value === actualRole);
        
        return {
          id: staff.id,
          firstName: firstName || '',
          lastName: lastName || '',
          fullName: staff.name || '',
          email: staff.email || '',
          phone: formatPhoneNumber(staff.phone) || '',
          alternatePhone: formatPhoneNumber(staff.alt_phone) || '',
          zipCode: staff.postal_code || '',
          dob: staff.birthday || '',
          gender: staff.gender || '',
          userName: staff.username || '',
          role: actualRole,
          roleInfo: roleInfo,
          status: staff.is_active ? 'active' : 'inactive',
          stats: mockStaffStats[actualRole] || {},
          lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          performanceScore: Math.floor(Math.random() * 20) + 80,
          certificationStatus: Math.random() > 0.3 ? 'current' : 'expiring',
          nextReview: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
        };
      });

      setStaffList(processedData);
      setFilteredStaff(processedData);
      
    } catch (error) {
      console.error('Error al obtener la lista de personal:', error);
      setStaffList([]);
      setFilteredStaff([]);
    }
  };

  const fetchStaffDocuments = async (staffId) => {
    setLoadingDocuments(true);
    try {
      const response = await fetch(`http://localhost:8000/documents/?staff_id=${staffId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const documents = await response.json();
        console.log('Staff documents fetched:', documents);
        setStaffDocuments(documents);
      } else {
        console.error('Error al obtener documentos del staff');
        setStaffDocuments([]);
      }
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      setStaffDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const fetchStaffPatients = async (staffId) => {
    setLoadingPatients(true);
    try {
      const response = await fetch(`http://localhost:8000/staff-assignments/?staff_id=${staffId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const assignments = await response.json();
        setStaffPatients(assignments);
      } else {
        console.error('Error al obtener pacientes asignados');
        setStaffPatients([]);
      }
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
      setStaffPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Document Management Functions
  const handleAddDocument = (documentType = '') => {
    setDocumentModalMode('add');
    setCurrentDocument(null);
    setDocumentForm({
      document_type: documentType,
      notes: '',
      file: null,
      fileName: ''
    });
    setShowDocumentModal(true);
  };

  const handleEditDocument = (document) => {
    setDocumentModalMode('edit');
    setCurrentDocument(document);
    setDocumentForm({
      document_type: document.document_type || '',
      notes: document.notes || '',
      file: null,
      fileName: document.file_name || ''
    });
    setShowDocumentModal(true);
  };

  const handleDeleteDocument = (document) => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    setDeletingDocument(true);
    try {
      const response = await fetch(`http://localhost:8000/documents/${documentToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        // Refresh documents list
        await fetchStaffDocuments(selectedStaff.id);
        alert('✅ Document deleted successfully!');
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('❌ Error deleting document. Please try again.');
    } finally {
      setDeletingDocument(false);
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    }
  };

  const handleDocumentFormSubmit = async (e) => {
    e.preventDefault();
    if (!documentForm.file && documentModalMode === 'add') {
      alert('⚠️ Please select a file to upload');
      return;
    }

    setUploadingDocument(true);
    try {
      const formData = new FormData();
      
      if (documentForm.file) {
        formData.append('file', documentForm.file);
      }
      formData.append('staff_id', selectedStaff.id);
      formData.append('document_type', documentForm.document_type);
      formData.append('notes', documentForm.notes);

      const response = await fetch('http://localhost:8000/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // Refresh documents list
        await fetchStaffDocuments(selectedStaff.id);
        setShowDocumentModal(false);
        
        // Get document name for success message
        const docName = getDocumentsForRole(selectedStaff.role).find(doc => doc.id === documentForm.document_type)?.name || 'Document';
        alert(`✅ ${docName} uploaded successfully! The document is now ready and updated.`);
      } else {
        throw new Error(`Failed to ${documentModalMode} document`);
      }
    } catch (error) {
      console.error(`Error ${documentModalMode}ing document:`, error);
      alert(`❌ Error uploading document. Please try again.`);
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDocumentFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('File is too large. Maximum size allowed is 10MB.');
        return;
      }

      // Only PDF files are allowed according to backend
      if (file.type !== 'application/pdf') {
        alert('❌ Only PDF files are allowed. Please convert your document to PDF format.');
        return;
      }

      setDocumentForm({
        ...documentForm,
        file: file,
        fileName: file.name
      });
    }
  };

  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setCurrentDocument(null);
    setDocumentForm({
      document_type: '',
      notes: '',
      file: null,
      fileName: ''
    });
  };

  const handleDirectFileUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('❌ File is too large. Maximum size allowed is 10MB.');
      return;
    }

    // Only PDF files are allowed according to backend
    if (file.type !== 'application/pdf') {
      alert('❌ Only PDF files are allowed. Please convert your document to PDF format.');
      return;
    }

    setUploadingDocument(true);
    try {
      // Create a new file with a descriptive name that includes document type
      const fileExtension = file.name.split('.').pop();
      const cleanStaffName = selectedStaff.fullName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      
      // Use specific naming for problematic documents to ensure matching
      let cleanDocName;
      switch(documentType) {
        case 'covidVaccine':
          cleanDocName = 'Proof_of_COVID_Vaccine';
          break;
        case 'tbTest':
          cleanDocName = 'TB_Test_proof';
          break;
        case 'driversLicense':
          cleanDocName = 'Drivers_License';
          break;
        default:
          const docName = getDocumentsForRole(selectedStaff.role).find(doc => doc.id === documentType)?.name || documentType;
          cleanDocName = docName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      }
      
      const newFileName = `${cleanDocName}_${cleanStaffName}.${fileExtension}`;
      
      const renamedFile = new File([file], newFileName, { type: file.type });
      
      const formData = new FormData();
      formData.append('file', renamedFile);
      formData.append('staff_id', selectedStaff.id.toString());

      console.log('Uploading document:', {
        staff_id: selectedStaff.id,
        document_type: documentType,
        original_file_name: file.name,
        new_file_name: newFileName
      });

      const response = await fetch('http://localhost:8000/documents/upload', {
        method: 'POST',
        body: formData
      });

      const responseData = await response.json();
      console.log('Upload response:', responseData);

      if (response.ok) {
        // Refresh documents list
        await fetchStaffDocuments(selectedStaff.id);
        
        // Get document name for success message
        const docName = getDocumentsForRole(selectedStaff.role).find(doc => doc.id === documentType)?.name || 'Document';
        alert(`✅ ${docName} uploaded successfully! The document is now ready and updated.`);
      } else {
        throw new Error(responseData.detail || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(`❌ Error uploading document: ${error.message}`);
    } finally {
      setUploadingDocument(false);
      // Clear the input
      e.target.value = '';
    }
  };

  const handleViewDocument = async (document) => {
    try {
      // Open document in new tab/window
      const response = await fetch(`http://localhost:8000/documents/${document.id}/preview`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Clean up the URL after a delay
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      } else {
        alert('❌ Error opening document. The file may not exist.');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('❌ Error opening document. Please try again.');
    }
  };

  const handleReplaceDocument = async (e, currentDoc, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('❌ File is too large. Maximum size allowed is 10MB.');
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('❌ Only PDF files are allowed. Please convert your document to PDF format.');
      return;
    }

    // Confirm replacement
    const docName = getDocumentsForRole(selectedStaff.role).find(doc => doc.id === documentType)?.name || 'document';
    const confirmReplace = window.confirm(`Are you sure you want to replace the current ${docName}? This action cannot be undone.`);
    
    if (!confirmReplace) {
      e.target.value = ''; // Clear the input
      return;
    }

    setUploadingDocument(true);
    try {
      // First delete the old document
      const deleteResponse = await fetch(`http://localhost:8000/documents/${currentDoc.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete old document');
      }

      // Then upload the new document
      const fileExtension = file.name.split('.').pop();
      const cleanStaffName = selectedStaff.fullName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      
      // Use specific naming for problematic documents to ensure matching
      let cleanDocName;
      switch(documentType) {
        case 'covidVaccine':
          cleanDocName = 'Proof_of_COVID_Vaccine';
          break;
        case 'tbTest':
          cleanDocName = 'TB_Test_proof';
          break;
        case 'driversLicense':
          cleanDocName = 'Drivers_License';
          break;
        default:
          cleanDocName = docName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      }
      
      const newFileName = `${cleanDocName}_${cleanStaffName}.${fileExtension}`;
      
      const renamedFile = new File([file], newFileName, { type: file.type });
      
      const formData = new FormData();
      formData.append('file', renamedFile);
      formData.append('staff_id', selectedStaff.id.toString());

      const uploadResponse = await fetch('http://localhost:8000/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (uploadResponse.ok) {
        // Refresh documents list
        await fetchStaffDocuments(selectedStaff.id);
        alert(`✅ ${docName} replaced successfully! The new document is now ready and updated.`);
      } else {
        throw new Error('Failed to upload new document');
      }
    } catch (error) {
      console.error('Error replacing document:', error);
      alert(`❌ Error replacing document: ${error.message}`);
    } finally {
      setUploadingDocument(false);
      // Clear the input
      e.target.value = '';
    }
  };

  useEffect(() => {
    let filtered = [...staffList];
    
    if (viewMode === 'staff') {
      filtered = filtered.filter(member => member.role !== 'agency');
    } else if (viewMode === 'agencies') {
      filtered = filtered.filter(member => member.role === 'agency');
    }
    
    if (searchTerm) {
      filtered = filtered.filter(member => {
        return member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               member.phone.includes(searchTerm);
      });
    }
    
    if (filterRole !== 'all') {
      filtered = filtered.filter(member => member.role === filterRole);
    }
    
    if (!showInactive) {
      filtered = filtered.filter(member => member.status === 'active');
    }
    
    setFilteredStaff(filtered);
  }, [staffList, searchTerm, filterRole, showInactive, viewMode]);

  const handleOpenProfile = (member) => {
    setSelectedStaff(member);
    setShowProfileModal(true);
    setActiveTab('overview');
    // Cargar documentos del staff
    fetchStaffDocuments(member.id);
    // Cargar pacientes asignados para terapeutas
    if (['pt', 'pta', 'ot', 'cota', 'st', 'sta'].includes(member.role)) {
      fetchStaffPatients(member.id);
    }
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
    setSelectedStaff(null);
    setActiveTab('overview');
    setIsEditing(false);
    setEditedStaff(null);
    setShowPasswordChange(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordStrength(0);
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
    setConfirmType('danger');
    setStaffDocuments([]);
    setStaffPatients([]);
    setLoadingDocuments(false);
    setLoadingPatients(false);
    
    // Clean document management states
    setShowDocumentModal(false);
    setDocumentModalMode('add');
    setCurrentDocument(null);
    setDocumentForm({
      document_type: '',
      notes: '',
      file: null,
      fileName: ''
    });
    setUploadingDocument(false);
    setShowDeleteModal(false);
    setDocumentToDelete(null);
    setDeletingDocument(false);
  };

  const renderRoleTabs = () => {
    if (!selectedStaff) return null;
    
    const commonTabs = [
      { id: 'overview', label: 'Overview', icon: 'fa-chart-line' },
      { id: 'profile', label: 'Profile', icon: 'fa-user-circle' },
      { id: 'security', label: 'Security', icon: 'fa-shield-alt' }
    ];

    const roleSpecificTabs = {
      pt: [
        { id: 'patients', label: 'My Patients', icon: 'fa-user-injured' },
        { id: 'documents', label: 'Documents', icon: 'fa-file-medical-alt' }
      ],
      pta: [
        { id: 'assignments', label: 'Assignments', icon: 'fa-tasks' },
        { id: 'documents', label: 'Documents', icon: 'fa-file-medical-alt' }
      ],
      ot: [
        { id: 'assessments', label: 'Assessments', icon: 'fa-clipboard-check' },
        { id: 'documents', label: 'Documents', icon: 'fa-file-medical-alt' }
      ],
      cota: [
        { id: 'activities', label: 'Activities', icon: 'fa-puzzle-piece' },
        { id: 'documents', label: 'Documents', icon: 'fa-file-medical-alt' }
      ],
      st: [
        { id: 'evaluations', label: 'Evaluations', icon: 'fa-microphone' },
        { id: 'documents', label: 'Documents', icon: 'fa-file-medical-alt' }
      ],
      sta: [
        { id: 'sessions', label: 'Sessions', icon: 'fa-chalkboard-teacher' },
        { id: 'documents', label: 'Documents', icon: 'fa-file-medical-alt' }
      ],
      administrator: [{ id: 'management', label: 'Management', icon: 'fa-users-cog' }],
      developer: [{ id: 'system', label: 'System', icon: 'fa-server' }],
      agency: [
        { id: 'operations', label: 'Operations', icon: 'fa-building' },
        { id: 'documents', label: 'Documents', icon: 'fa-file-contract' }
      ]
    };

    const tabs = [...commonTabs];
    if (roleSpecificTabs[selectedStaff.role]) {
      tabs.splice(1, 0, ...roleSpecificTabs[selectedStaff.role]);
    }

    return tabs;
  };

  const renderTabContent = () => {
    if (!selectedStaff) return null;

    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'profile':
        return renderProfileTab();
      case 'patients':
      case 'assignments':
      case 'assessments':
      case 'activities':
      case 'evaluations':
      case 'sessions':
      case 'management':
        return renderRoleSpecificTab();
      case 'documents':
        return renderDocumentsTab();
      case 'system':
        return renderDeveloperSystemTab();
      case 'operations':
        return renderAgencyOperationsTab();
      case 'security':
        return renderSecurityTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => {
    if (selectedStaff.role === 'agency') {
      return (
        <div className="overview-content clinical">
          <div className="agency-summary">
            <div className="summary-card">
              <div className="card-icon">
                <i className="fas fa-users" style={{ color: selectedStaff.roleInfo?.color }}></i>
              </div>
              <div className="card-info">
                <h3>Total Patients</h3>
                <div className="stat-value">{selectedStaff.stats.totalPatients || 0}</div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">
                <i className="fas fa-building" style={{ color: selectedStaff.roleInfo?.color }}></i>
              </div>
              <div className="card-info">
                <h3>Active Branches</h3>
                <div className="stat-value">{selectedStaff.stats.activeBranches || 0}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="overview-content clinical">
        <div className="role-summary">
          <div className="summary-header">
            <div className="role-icon" style={{ backgroundColor: selectedStaff.roleInfo?.color + '15', border: `2px solid ${selectedStaff.roleInfo?.color}` }}>
              <i className={`fas ${selectedStaff.roleInfo?.icon}`} style={{ color: selectedStaff.roleInfo?.color }}></i>
            </div>
            <div className="role-info">
              <h3>{selectedStaff.roleInfo?.label}</h3>
              <p>{selectedStaff.roleInfo?.description}</p>
            </div>
          </div>
          
          <div className="stats-summary">
            {Object.entries(selectedStaff.stats).map(([key, value]) => (
              <div key={key} className="stat-item">
                <span className="stat-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                <span className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleUpdateStaff = async () => {
    try {
      const baseUrl = `http://localhost:8000/staff/${selectedStaff.id}`;
      const params = new URLSearchParams();
      
      if (editedStaff.fullName !== selectedStaff.fullName) {
        params.append('name', editedStaff.fullName);
      }
      if (editedStaff.email !== selectedStaff.email) {
        params.append('email', editedStaff.email);
      }
      if (editedStaff.phone !== selectedStaff.phone) {
        params.append('phone', editedStaff.phone?.replace(/[^\d]/g, '') || '');
      }
      if (editedStaff.alternatePhone !== selectedStaff.alternatePhone) {
        params.append('alt_phone', editedStaff.alternatePhone?.replace(/[^\d]/g, '') || '');
      }
      if (editedStaff.zipCode !== selectedStaff.zipCode) {
        params.append('postal_code', editedStaff.zipCode || '');
      }
      if (editedStaff.gender !== selectedStaff.gender) {
        params.append('gender', editedStaff.gender || '');
      }
      if (editedStaff.dob !== selectedStaff.dob) {
        params.append('birthday', editedStaff.dob || '');
      }
      if (editedStaff.role !== selectedStaff.role) {
        params.append('role', editedStaff.role);
      }

      const finalUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
      

      const response = await fetch(finalUrl, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        const updatedStaff = { 
          ...selectedStaff, 
          fullName: editedStaff.fullName,
          email: editedStaff.email,
          phone: editedStaff.phone,
          alternatePhone: editedStaff.alternatePhone,
          zipCode: editedStaff.zipCode,
          gender: editedStaff.gender,
          dob: editedStaff.dob,
          role: editedStaff.role,
          roleInfo: roles.find(r => r.value === editedStaff.role) || selectedStaff.roleInfo
        };
        
        setSelectedStaff(updatedStaff);
        setIsEditing(false);
        setEditedStaff(null);
        
        fetchStaffData();
        
        alert('✅ Información del staff actualizada exitosamente');
      } else {
        const errorText = await response.text();
        console.error('Error al actualizar staff:', response.status, errorText);
        alert(`❌ Error al actualizar: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('❌ Error de conexión al actualizar la información');
    }
  };

  const renderProfileTab = () => {
    const currentData = isEditing ? editedStaff : selectedStaff;
    
    return (
      <div className="profile-content clinical">
        <div className="profile-header">
          <h3><i className="fas fa-user-circle"></i> Personal Information</h3>
          <div className="profile-actions">
            {!isEditing ? (
              <button className="edit-btn" onClick={() => {
                setIsEditing(true);
                setEditedStaff({
                  ...selectedStaff,
                  fullName: selectedStaff.fullName,
                  email: selectedStaff.email,
                  phone: selectedStaff.phone,
                  alternatePhone: selectedStaff.alternatePhone,
                  zipCode: selectedStaff.zipCode,
                  gender: selectedStaff.gender,
                  dob: selectedStaff.dob,
                  role: selectedStaff.role
                });
              }}>
                <i className="fas fa-edit"></i> Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleUpdateStaff}>
                  <i className="fas fa-save"></i> Save
                </button>
                <button className="cancel-btn" onClick={() => {
                  setIsEditing(false);
                  setEditedStaff(null);
                }}>
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <div className="profile-grid">
              <div className="profile-field">
                <label>Full Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedStaff.fullName} 
                    onChange={(e) => setEditedStaff({...editedStaff, fullName: e.target.value})}
                    className="field-input"
                  />
                ) : (
                  <div className="field-value">{currentData.fullName}</div>
                )}
              </div>
              
              <div className="profile-field">
                <label>Email</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    value={editedStaff.email} 
                    onChange={(e) => setEditedStaff({...editedStaff, email: e.target.value})}
                    className="field-input"
                  />
                ) : (
                  <div className="field-value">{currentData.email}</div>
                )}
              </div>
              
              <div className="profile-field">
                <label>Phone</label>
                {isEditing ? (
                  <input 
                    type="tel" 
                    value={editedStaff.phone} 
                    onChange={(e) => setEditedStaff({...editedStaff, phone: formatPhoneNumber(e.target.value)})}
                    className="field-input"
                  />
                ) : (
                  <div className="field-value">{currentData.phone}</div>
                )}
              </div>
              
              <div className="profile-field">
                <label>Alternate Phone</label>
                {isEditing ? (
                  <input 
                    type="tel" 
                    value={editedStaff.alternatePhone} 
                    onChange={(e) => setEditedStaff({...editedStaff, alternatePhone: formatPhoneNumber(e.target.value)})}
                    className="field-input"
                  />
                ) : (
                  <div className="field-value">{currentData.alternatePhone || 'Not specified'}</div>
                )}
              </div>
              
              <div className="profile-field">
                <label>Zip Code</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedStaff.zipCode} 
                    onChange={(e) => setEditedStaff({...editedStaff, zipCode: e.target.value})}
                    className="field-input"
                  />
                ) : (
                  <div className="field-value">{currentData.zipCode}</div>
                )}
              </div>
              
              <div className="profile-field">
                <label>Gender</label>
                {isEditing ? (
                  <select 
                    value={editedStaff.gender || ''} 
                    onChange={(e) => setEditedStaff({...editedStaff, gender: e.target.value})}
                    className="field-select"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="field-value">{currentData.gender || 'Not specified'}</div>
                )}
              </div>
              
              <div className="profile-field">
                <label>Date of Birth</label>
                {isEditing ? (
                  <input 
                    type="date" 
                    value={editedStaff.dob} 
                    onChange={(e) => setEditedStaff({...editedStaff, dob: e.target.value})}
                    className="field-input"
                  />
                ) : (
                  <div className="field-value">{currentData.dob || 'Not specified'}</div>
                )}
              </div>
              
              {selectedStaff.role !== 'agency' && (
                <div className="profile-field">
                  <label>Role</label>
                  {isEditing ? (
                    <select 
                      value={editedStaff.role} 
                      onChange={(e) => {
                        const newRole = e.target.value;
                        const roleInfo = roles.find(r => r.value === newRole);
                        setEditedStaff({...editedStaff, role: newRole, roleInfo});
                      }}
                      className="field-select"
                    >
                      {roles.filter(role => role.value !== 'agency').map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="field-value">{currentData.roleInfo?.label}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDeveloperSystemTab = () => (
    <div className="system-content clinical">
      <div className="system-overview">
        <h3><i className="fas fa-server"></i> System Administration</h3>
        <div className="system-metrics">
          {Object.entries(selectedStaff.stats).map(([key, value]) => (
            <div key={key} className="metric-card">
              <div className="metric-info">
                <span className="metric-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                <span className="metric-value">{typeof value === 'number' ? value.toLocaleString() : value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAgencyOperationsTab = () => {
    const branches = agencyBranches[selectedStaff.fullName] || agencyBranches['Supportive Home Health'] || [];
    
    return (
      <div className="operations-content clinical">
        <div className="operations-header">
          <h3><i className="fas fa-building"></i> Agency Branches</h3>
          <p>Manage your healthcare facility locations</p>
        </div>
        
        <div className="branches-grid">
          {branches.map(branch => (
            <div key={branch.id} className="branch-card">
              <div className="branch-header">
                <div className="branch-icon">
                  <i className="fas fa-hospital-alt" style={{ color: selectedStaff.roleInfo?.color }}></i>
                </div>
                <div className="branch-info">
                  <h4>{branch.name}</h4>
                  <p className="branch-manager">Manager: {branch.manager}</p>
                </div>
              </div>
              
              <div className="branch-details">
                <div className="detail-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{branch.address}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-phone"></i>
                  <span>{branch.phone}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-users"></i>
                  <span>{branch.activePatients} Active Patients</span>
                </div>
              </div>
              
              <div className="branch-services">
                <h5>Services:</h5>
                <div className="services-list">
                  {branch.services.map((service, index) => (
                    <span key={index} className="service-tag">{service}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRoleSpecificTab = () => {
    const tabLabels = {
      patients: 'My Patients',
      assignments: 'My Assignments', 
      assessments: 'My Assessments',
      activities: 'My Activities',
      evaluations: 'My Speech Evaluations',
      sessions: 'My Sessions',
      management: 'Staff Management'
    };
    
    const currentTabLabel = tabLabels[activeTab] || 'My Patients';
    
    return (
      <div className="role-specific-content clinical">
        <div className="patients-overview">
          <div className="patients-header">
            <h3><i className={`fas ${selectedStaff.roleInfo?.icon}`} style={{ color: selectedStaff.roleInfo?.color }}></i> {currentTabLabel}</h3>
            <p>Manage assigned patients and their care plans</p>
          </div>
          
          {loadingPatients ? (
            <div className="loading-patients">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading assigned patients...</p>
            </div>
          ) : staffPatients.length > 0 ? (
            <div className="patients-grid">
              {staffPatients.map((assignment, index) => (
                <div key={index} className="patient-assignment-card">
                  <div className="patient-header">
                    <div className="patient-avatar">
                      <i className="fas fa-user-circle"></i>
                    </div>
                    <div className="patient-info">
                      <h4>{assignment.patient_name || 'Assigned Patient'}</h4>
                      <span className="assignment-discipline" style={{ color: selectedStaff.roleInfo?.color }}>
                        {assignment.discipline || selectedStaff.roleInfo?.label}
                      </span>
                    </div>
                  </div>
                  <div className="assignment-details">
                    <div className="detail-row">
                      <i className="fas fa-calendar-alt"></i>
                      <span>Assigned: {assignment.assigned_date ? new Date(assignment.assigned_date).toLocaleDateString('en-US') : 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <i className="fas fa-heartbeat"></i>
                      <span>Status: {assignment.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="patients-placeholder">
              <div className="placeholder-icon">
                <i className="fas fa-user-injured" style={{ color: selectedStaff.roleInfo?.color }}></i>
              </div>
              <h4>No Assigned Patients</h4>
              <p>Currently {selectedStaff.fullName} has no patients assigned in the system</p>
              <div className="placeholder-stats">
                <div className="stat-box">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Active Cases</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDocumentsTab = () => {
    const requiredDocs = getDocumentsForRole(selectedStaff.role);
    
    if (requiredDocs.length === 0) {
      return (
        <div className="documents-content clinical">
          <div className="no-documents-required">
            <div className="no-docs-icon">
              <i className="fas fa-file-alt" style={{ color: selectedStaff.roleInfo?.color }}></i>
            </div>
            <h4>No Required Documents</h4>
            <p>This role does not require specific documents in the system</p>
          </div>
        </div>
      );
    }

    return (
      <div className="documents-content clinical">
        <div className="documents-header">
          <h3><i className="fas fa-file-medical-alt" style={{ color: selectedStaff.roleInfo?.color }}></i> Required Documents</h3>
          <p>Status of mandatory documents for {selectedStaff.roleInfo?.label}</p>
        </div>

        {loadingDocuments ? (
          <div className="loading-documents">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading documents...</p>
          </div>
        ) : (
          <div className="documents-grid">
            {requiredDocs.map((requiredDoc) => {
              const uploadedDoc = staffDocuments.find(doc => {
                if (!doc.file_name) return false;
                
                const fileName = doc.file_name.toLowerCase();
                const docId = requiredDoc.id.toLowerCase();
                
                // Debug logging
                console.log(`Matching for ${docId}:`, {
                  fileName,
                  docId,
                  requiredDocName: requiredDoc.name
                });
                
                // Specific matching for problematic documents
                if (docId === 'covidvaccine') {
                  const matches = fileName.includes('covid') || fileName.includes('vaccine') || fileName.includes('proof_of_covid');
                  console.log(`COVID match result: ${matches}`);
                  return matches;
                }
                if (docId === 'tbtest') {
                  const matches = fileName.includes('tb_test') || fileName.includes('ppd') || fileName.includes('tb') || fileName.includes('tuberculosis');
                  console.log(`TB match result: ${matches}`);
                  return matches;
                }
                if (docId === 'driverslicense') {
                  const matches = fileName.includes('drivers_license') || fileName.includes('driver') || fileName.includes('license');
                  console.log(`Driver's License match result: ${matches}`);
                  return matches;
                }
                
                // General matching for other documents
                const generalMatch = fileName.includes(docId) || 
                       fileName.includes(requiredDoc.name.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_'));
                console.log(`General match result for ${docId}: ${generalMatch}`);
                return generalMatch;
              });
              
              const status = uploadedDoc ? 'uploaded' : 'missing';
              
              return (
                <div key={requiredDoc.id} className={`document-status-card ${status}`}>
                  <div className="doc-header">
                    <div className="doc-icon" style={{ color: selectedStaff.roleInfo?.color }}>
                      <i className={`fas ${requiredDoc.icon}`}></i>
                    </div>
                    <div className="doc-info">
                      <h4>{requiredDoc.name}</h4>
                      <p className="doc-description">{requiredDoc.description}</p>
                    </div>
                    <div className={`doc-status-badge ${status}`}>
                      {status === 'uploaded' ? (
                        <>
                          <i className="fas fa-check-circle"></i>
                          <span>Uploaded</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-exclamation-triangle"></i>
                          <span>Missing</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {uploadedDoc && (
                    <div className="uploaded-doc-details">
                      <div className="doc-detail-row">
                        <i className="fas fa-file"></i>
                        <span>{uploadedDoc.file_name}</span>
                      </div>
                      <div className="doc-detail-row">
                        <i className="fas fa-calendar"></i>
                        <span>Uploaded: {new Date(uploadedDoc.upload_date).toLocaleDateString('en-US')}</span>
                      </div>
                      {uploadedDoc.notes && (
                        <div className="doc-detail-row">
                          <i className="fas fa-sticky-note"></i>
                          <span>{uploadedDoc.notes}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="doc-actions">
                    {uploadedDoc ? (
                      <>
                        <button
                          className="doc-action-btn view"
                          onClick={() => handleViewDocument(uploadedDoc)}
                          title="View Document"
                        >
                          <i className="fas fa-eye"></i>
                          <span>View</span>
                        </button>
                        <input
                          type="file"
                          id={`file-replace-${uploadedDoc.id}`}
                          onChange={(e) => handleReplaceDocument(e, uploadedDoc, requiredDoc.id)}
                          accept=".pdf"
                          style={{ display: 'none' }}
                        />
                        <button
                          className="doc-action-btn replace"
                          onClick={() => document.getElementById(`file-replace-${uploadedDoc.id}`).click()}
                          title="Replace Document"
                        >
                          <i className="fas fa-sync-alt"></i>
                          <span>Replace</span>
                        </button>
                        <button
                          className="doc-action-btn delete"
                          onClick={() => handleDeleteDocument(uploadedDoc)}
                          title="Delete Document"
                        >
                          <i className="fas fa-trash-alt"></i>
                          <span>Delete</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="file"
                          id={`file-upload-${requiredDoc.id}`}
                          onChange={(e) => handleDirectFileUpload(e, requiredDoc.id)}
                          accept=".pdf"
                          style={{ display: 'none' }}
                        />
                        <button
                          className="doc-action-btn add"
                          onClick={() => document.getElementById(`file-upload-${requiredDoc.id}`).click()}
                          style={{ backgroundColor: selectedStaff.roleInfo?.color }}
                          disabled={uploadingDocument}
                        >
                          {uploadingDocument ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <i className="fas fa-plus"></i>
                              <span>Upload Document</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="documents-summary">
          <div className="summary-stats">
            <div className="stat-item uploaded">
              <span className="stat-number">{staffDocuments.length}</span>
              <span className="stat-label">Documents Uploaded</span>
            </div>
            <div className="stat-item required">
              <span className="stat-number">{requiredDocs.length}</span>
              <span className="stat-label">Documents Required</span>
            </div>
            <div className="stat-item missing">
              <span className="stat-number">{Math.max(0, requiredDocs.length - staffDocuments.length)}</span>
              <span className="stat-label">Documents Missing</span>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  };
  
  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    setIsUpdatingPassword(true);
    setPasswordError('');
    
    try {
      const baseUrl = `http://localhost:8000/staff/${selectedStaff.id}`;
      const params = new URLSearchParams();
      params.append('password', newPassword);
      
      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setShowPasswordChange(false);
        setNewPassword('');
        setConfirmPassword('');
        alert('Contraseña actualizada exitosamente');
      } else {
        setPasswordError('Error al actualizar la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      setPasswordError('Error de conexión al actualizar la contraseña');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleToggleUserStatus = () => {
    const newStatus = !selectedStaff.status;
    const action = newStatus ? 'activar' : 'desactivar';
    const actionUpper = newStatus ? 'Activar' : 'Desactivar';
    
    setConfirmMessage(`¿Estás seguro de que deseas ${action} la cuenta de ${selectedStaff.fullName}?`);
    setConfirmType(newStatus ? 'success' : 'danger');
    setConfirmAction(() => () => executeToggleUserStatus(newStatus, action));
    setShowConfirmModal(true);
  };
  
  const executeToggleUserStatus = async (newStatus, action) => {
    try {
      const baseUrl = `http://localhost:8000/staff/${selectedStaff.id}`;
      const params = new URLSearchParams();
      params.append('is_active', newStatus.toString());
      
      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const updatedStaff = { ...selectedStaff, status: newStatus };
        setSelectedStaff(updatedStaff);
        
        const updatedStaffList = staffList.map(staff => 
          staff.id === selectedStaff.id ? { ...staff, status: newStatus } : staff
        );
        setStaffList(updatedStaffList);
        setFilteredStaff(updatedStaffList);
        
        showSuccessMessage(`Cuenta ${action}da exitosamente`);
      } else {
        showErrorMessage(`Error al ${action} la cuenta`);
      }
    } catch (error) {
      console.error('Error:', error);
      showErrorMessage(`Error de conexión al ${action} la cuenta`);
    }
    
    setShowConfirmModal(false);
  };
  
  const showSuccessMessage = (message) => {
    alert(message);
  };
  
  const showErrorMessage = (message) => {
    alert(message);
  };

  const renderSecurityTab = () => {
    return (
      <div className="premium-security-section">
        <div className="security-container">
          <div className="security-header-premium">
            <div className="header-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="header-content">
              <h2>Seguridad de la Cuenta</h2>
              <p>Gestiona las credenciales y configuración de seguridad</p>
            </div>
          </div>
          
          <div className="security-cards-grid">
            <div className="security-card credentials-card">
              <div className="card-header">
                <i className="fas fa-user-lock"></i>
                <h3>Credenciales de Acceso</h3>
              </div>
              
              <div className="credentials-info">
                <div className="credential-item">
                  <label>Nombre de Usuario</label>
                  <div className="credential-value">
                    <input 
                      type="text" 
                      value={selectedStaff.userName} 
                      readOnly 
                      className="credential-display"
                    />
                    <button 
                      className="action-btn copy"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedStaff.userName);
                      }}
                      title="Copiar usuario"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                </div>
                
                <div className="credential-item">
                  <label>Contraseña</label>
                  <div className="credential-value">
                    <input 
                      type="password" 
                      value="••••••••" 
                      readOnly 
                      className="credential-display"
                    />
                    <button 
                      className="action-btn change"
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      title="Cambiar contraseña"
                    >
                      <i className="fas fa-key"></i>
                      {showPasswordChange ? 'Cancelar' : 'Cambiar'}
                    </button>
                  </div>
                </div>
                
                {showPasswordChange && (
                  <div className="password-change-form">
                    <div className="form-group">
                      <label>Nueva Contraseña</label>
                      <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          checkPasswordStrength(e.target.value);
                        }}
                        placeholder="Ingrese nueva contraseña"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Confirmar Contraseña</label>
                      <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme nueva contraseña"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="password-strength">
                      <label>Fortaleza de contraseña:</label>
                      <div className="strength-bars">
                        {[1, 2, 3, 4].map((level) => (
                          <div 
                            key={level}
                            className={`bar ${passwordStrength >= level ? 'active' : ''} level-${level}`}
                          />
                        ))}
                      </div>
                      <span className="strength-text">
                        {passwordStrength === 0 && 'Muy débil'}
                        {passwordStrength === 1 && 'Débil'}
                        {passwordStrength === 2 && 'Regular'}
                        {passwordStrength === 3 && 'Fuerte'}
                        {passwordStrength === 4 && 'Muy fuerte'}
                      </span>
                    </div>
                    
                    {passwordError && (
                      <div className="error-message">
                        <i className="fas fa-exclamation-triangle"></i>
                        {passwordError}
                      </div>
                    )}
                    
                    <div className="form-actions">
                      <button 
                        className="btn-save-password"
                        onClick={handlePasswordUpdate}
                        disabled={isUpdatingPassword}
                      >
                        {isUpdatingPassword ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Actualizando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save"></i>
                            Guardar Contraseña
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="security-card status-card">
              <div className="card-header">
                <i className="fas fa-shield-check"></i>
                <h3>Estado de Seguridad</h3>
              </div>
              
              <div className="security-status-info">
                <div className="status-item">
                  <div className="status-icon secure">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="status-details">
                    <h4>Nivel de Seguridad</h4>
                    <span className="status-value high">Alto</span>
                  </div>
                </div>
                
                <div className="status-item">
                  <div className="status-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="status-details">
                    <h4>Última Actividad</h4>
                    <span className="status-value">{lastActivity}</span>
                  </div>
                </div>
                
                <div className="status-item">
                  <div className="status-icon">
                    <i className="fas fa-mobile-alt"></i>
                  </div>
                  <div className="status-details">
                    <h4>Autenticación 2FA</h4>
                    <div className="toggle-2fa">
                      <label className="switch">
                        <input 
                          type="checkbox"
                          checked={twoFactorEnabled}
                          onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                      <span className="status-value">
                        {twoFactorEnabled ? 'Activado' : 'Desactivado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          
          <div className="security-actions">
            <button 
              className={`action-button ${selectedStaff.status ? 'danger' : 'success'}`}
              onClick={handleToggleUserStatus}
            >
              <i className={`fas ${selectedStaff.status ? 'fa-user-slash' : 'fa-user-check'}`}></i>
              {selectedStaff.status ? 'Desactivar Cuenta' : 'Activar Cuenta'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="wave-effect"></div>
        <div className="scan-effect"></div>
        <div className="data-lines">
          {Array.from({ length: 20 }).map((_, index) => (
            <div key={index} className="line"></div>
          ))}
        </div>
        <div className="loader-container">
          <div className="loader-hologram">
            <div className="hologram-ring"></div>
            <div className="hologram-circle"></div>
            <div className="hologram-bars">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
          </div>
          <div className="loader-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
          <div className="loader-text">{loadingMessage}</div>
          <div className="loader-status">TherapySync Pro <span className="status-dot"></span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-staff-management">
      <div className="clinical-header">
        <div className="header-navigation">
          <button className="back-button" onClick={onBackToOptions}>
            <i className="fas fa-arrow-left"></i>
            <span>Back</span>
          </button>
        </div>
        <div className="header-content">
          <div className="header-title">
            <h1>Staff Management</h1>
            <p>Healthcare Professional Directory</p>
          </div>
          <button className="add-staff-btn" onClick={onAddNewStaff}>
            <i className="fas fa-user-plus"></i>
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="premium-filters">
        <div className="view-selector">
          <button 
            className={`view-btn ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            <i className="fas fa-th-large"></i>
            <span>All Members</span>
          </button>
          <button 
            className={`view-btn ${viewMode === 'staff' ? 'active' : ''}`}
            onClick={() => setViewMode('staff')}
          >
            <i className="fas fa-user-md"></i>
            <span>Clinical Staff</span>
          </button>
          <button 
            className={`view-btn ${viewMode === 'agencies' ? 'active' : ''}`}
            onClick={() => setViewMode('agencies')}
          >
            <i className="fas fa-hospital-alt"></i>
            <span>Agencies</span>
          </button>
        </div>

        <div className="search-filters">
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search team members..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="premium-search"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <div className="role-filter">
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
              className="premium-select"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          <div className="status-toggle">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">Show Inactive</span>
            </label>
          </div>
        </div>
      </div>

      <div className="premium-staff-grid">
        {filteredStaff.length > 0 ? (
          filteredStaff.map(member => (
            <div 
              key={member.id} 
              className={`premium-staff-card ${member.status} ${member.role}`}
              onClick={() => handleOpenProfile(member)}
            >
              <div className="card-glow" style={{ background: `linear-gradient(135deg, ${member.roleInfo?.color}20, transparent)` }}></div>
              
              <div className="card-header">
                <div className="avatar-container">
                  <div 
                    className="premium-avatar"
                    style={{ 
                      backgroundColor: member.roleInfo?.color + '15',
                      border: `3px solid ${member.roleInfo?.color}`
                    }}
                  >
                    <span className="avatar-text" style={{ color: '#000000' }}>
                      {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                    </span>
                    <div className={`status-indicator ${member.status}`}></div>
                  </div>
                </div>
                
                <div className="member-info">
                  <h3 className="member-name">{member.fullName}</h3>
                  <div className="role-badge" style={{ color: member.roleInfo?.color }}>
                    <i className={`fas ${member.roleInfo?.icon}`}></i>
                    <span>{member.roleInfo?.label}</span>
                  </div>
                </div>

                <div className="status-indicator-wrapper">
                  <div className={`member-status ${member.status}`}>
                    <i className="fas fa-circle"></i>
                    <span>{member.status === 'active' ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="contact-info">
                  <div className="contact-item">
                    <i className="fas fa-envelope"></i>
                    <span>{member.email}</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-phone-alt"></i>
                    <span>{member.phone}</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>Zip: {member.zipCode}</span>
                  </div>
                </div>

                <div className="card-stats">
                  {Object.entries(member.stats).slice(0, 2).map(([key, value]) => (
                    <div key={key} className="stat-item">
                      <span className="stat-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      <span className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-footer">
                <div className="member-role">
                  <i className={`fas ${member.roleInfo?.icon}`} style={{ color: member.roleInfo?.color }}></i>
                  <span>{member.roleInfo?.label}</span>
                </div>
                <div className="view-profile">
                  <i className="fas fa-arrow-right"></i>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results-premium">
            <div className="no-results-icon">
              <i className="fas fa-user-friends"></i>
            </div>
            <h3>No team members found</h3>
            <p>Try adjusting your search criteria or filters</p>
            <button 
              className="premium-btn primary"
              onClick={() => {
                setSearchTerm('');
                setFilterRole('all');
                setViewMode('all');
                setShowInactive(true);
              }}
            >
              <i className="fas fa-refresh"></i>
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {showProfileModal && selectedStaff && (
        <div className="premium-modal-overlay" onClick={handleCloseProfile}>
          <div className="premium-modal enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-enhanced">
              <div className="staff-profile-header">
                <div 
                  className="profile-avatar-enhanced"
                  style={{ 
                    backgroundColor: selectedStaff.roleInfo?.color + '15',
                    border: `3px solid ${selectedStaff.roleInfo?.color}`,
                    boxShadow: `0 0 20px ${selectedStaff.roleInfo?.color}25`
                  }}
                >
                  <span style={{ color: '#000000' }}>{selectedStaff.firstName.charAt(0)}{selectedStaff.lastName.charAt(0)}</span>
                  <div className={`status-indicator-enhanced ${selectedStaff.status}`}></div>
                </div>
                <div className="profile-details-enhanced">
                  <h2 className="staff-name-enhanced">{selectedStaff.fullName}</h2>
                  <div className="role-badge-enhanced" style={{ 
                    backgroundColor: selectedStaff.roleInfo?.color + '20', 
                    color: selectedStaff.roleInfo?.color,
                    border: `1px solid ${selectedStaff.roleInfo?.color}30`
                  }}>
                    <i className={`fas ${selectedStaff.roleInfo?.icon}`}></i>
                    <span>{selectedStaff.roleInfo?.label}</span>
                  </div>
                  <div className="quick-stats-enhanced">
                    <span className="stat-item-mini">
                      <i className="fas fa-envelope"></i> {selectedStaff.email}
                    </span>
                    <span className="stat-item-mini">
                      <i className="fas fa-phone"></i> {selectedStaff.phone}
                    </span>
                  </div>
                </div>
              </div>
              <button className="close-modal-enhanced" onClick={handleCloseProfile}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-navigation-enhanced">
              {renderRoleTabs().map(tab => (
                <button 
                  key={tab.id}
                  className={`nav-tab-enhanced ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={activeTab === tab.id ? { 
                    borderBottomColor: selectedStaff.roleInfo?.color,
                    color: selectedStaff.roleInfo?.color,
                    backgroundColor: selectedStaff.roleInfo?.color + '10'
                  } : {}}
                >
                  <i className={`fas ${tab.icon}`}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="modal-content-enhanced">
              {renderTabContent()}
            </div>
          </div>
        </div>
      )}
      
      {showConfirmModal && (
        <div className="confirm-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`confirm-modal-header ${confirmType}`}>
              <div className="confirm-icon">
                <i className={`fas ${confirmType === 'danger' ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
              </div>
              <h3>Confirmar Acción</h3>
            </div>
            
            <div className="confirm-modal-body">
              <p>{confirmMessage}</p>
              <div className="user-info">
                <div className="user-avatar" style={{ 
                  backgroundColor: selectedStaff?.roleInfo?.color + '15',
                  border: `2px solid ${selectedStaff?.roleInfo?.color}`
                }}>
                  {selectedStaff?.firstName?.charAt(0)}{selectedStaff?.lastName?.charAt(0)}
                </div>
                <div className="user-details">
                  <span className="user-name">{selectedStaff?.fullName}</span>
                  <span className="user-role">{selectedStaff?.roleInfo?.label}</span>
                </div>
              </div>
            </div>
            
            <div className="confirm-modal-footer">
              <button 
                className="confirm-btn cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                <i className="fas fa-times"></i>
                Cancelar
              </button>
              <button 
                className={`confirm-btn ${confirmType}`}
                onClick={() => {
                  if (confirmAction) confirmAction();
                }}
              >
                <i className={`fas ${confirmType === 'danger' ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                {confirmType === 'danger' ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Document Add/Edit Modal */}
      {showDocumentModal && (
        <div className="document-modal-overlay" onClick={closeDocumentModal}>
          <div className="document-modal" onClick={(e) => e.stopPropagation()}>
            <div className="document-modal-header">
              <h3>
                <i className="fas fa-file-plus" style={{ color: selectedStaff.roleInfo?.color }}></i>
                {documentModalMode === 'add' ? 'Add New Document' : 'Edit Document'}
              </h3>
              <button className="close-modal-btn" onClick={closeDocumentModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleDocumentFormSubmit} className="document-form">
              {!documentForm.document_type && (
                <div className="form-group">
                  <label htmlFor="document_type">Document Type</label>
                  <select
                    id="document_type"
                    value={documentForm.document_type}
                    onChange={(e) => setDocumentForm({...documentForm, document_type: e.target.value})}
                    required
                    className="form-select"
                  >
                    <option value="">Select document type</option>
                    {getDocumentsForRole(selectedStaff.role).map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {documentForm.document_type && (
                <div className="document-type-display">
                  <label>Document Type</label>
                  <div className="selected-document-type">
                    <i className="fas fa-file-alt" style={{ color: selectedStaff.roleInfo?.color }}></i>
                    <span>{getDocumentsForRole(selectedStaff.role).find(doc => doc.id === documentForm.document_type)?.name}</span>
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="document_file">Document File</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="document_file"
                    onChange={handleDocumentFileChange}
                    accept=".pdf"
                    className="file-input"
                    required={documentModalMode === 'add'}
                  />
                  <div className="file-upload-label">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <span>
                      {documentForm.fileName || 'Choose file or drag & drop'}
                    </span>
                  </div>
                  <small className="file-info">
                    Supported formats: PDF only (Max 10MB)
                  </small>
                </div>
              </div>
              
              {!documentForm.document_type && (
                <div className="form-group">
                  <label htmlFor="notes">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    value={documentForm.notes}
                    onChange={(e) => setDocumentForm({...documentForm, notes: e.target.value})}
                    placeholder="Add any additional notes about this document..."
                    rows="3"
                    className="form-textarea"
                  />
                </div>
              )}
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeDocumentModal}>
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={uploadingDocument}
                  style={{ backgroundColor: selectedStaff.roleInfo?.color }}
                >
                  {uploadingDocument ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      {documentModalMode === 'add' ? 'Uploading...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      <i className={`fas ${documentModalMode === 'add' ? 'fa-plus' : 'fa-save'}`}></i>
                      {documentModalMode === 'add' ? 'Add Document' : 'Update Document'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && documentToDelete && (
        <div className="delete-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <div className="delete-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3>Delete Document</h3>
            </div>
            
            <div className="delete-modal-body">
              <p>Are you sure you want to delete this document?</p>
              <div className="document-info">
                <div className="doc-preview">
                  <i className="fas fa-file-alt"></i>
                  <div className="doc-details">
                    <span className="doc-name">{documentToDelete.file_name}</span>
                    <span className="doc-type">{documentToDelete.document_type}</span>
                  </div>
                </div>
              </div>
              <p className="warning-text">
                <i className="fas fa-warning"></i>
                This action cannot be undone. The document file will be permanently deleted.
              </p>
            </div>
            
            <div className="delete-modal-footer">
              <button 
                className="cancel-delete-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingDocument}
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={confirmDeleteDocument}
                disabled={deletingDocument}
              >
                {deletingDocument ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt"></i>
                    Delete Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementSystem;