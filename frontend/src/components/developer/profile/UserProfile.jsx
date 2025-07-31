import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../login/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../../styles/developer/Profile/UserProfile.scss';

const DevUserProfile = () => {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // Loading Animation States
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Connecting to TherapySync Profile...');
  const [isLoading, setIsLoading] = useState(true);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  
  // Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [animatingElements, setAnimatingElements] = useState([]);
  
  // Data states
  const [locationInfo, setLocationInfo] = useState(null);
  const [hostAgency, setHostAgency] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [activityStats, setActivityStats] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form data for editing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    alt_phone: '',
    address: '',
    postal_code: '',
    birthday: '',
    gender: '',
    username: '',
    fax: '',
    branches: [],
    newPassword: '',
    confirmPassword: '',
    currentPassword: ''
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Loading sequence messages
  const loadingSequence = [
    { text: 'Connecting to TherapySync Profile...', duration: 500 },
    { text: 'Loading user data...', duration: 400 },
    { text: 'Fetching preferences...', duration: 300 },
    { text: 'Rendering premium interface...', duration: 400 }
  ];

  // Función para obtener el rol base y generar la ruta correcta
  const getRoleRoute = () => {
    if (!currentUser?.role) return 'developer';
    const role = currentUser.role.toLowerCase();
    
    // Mapear roles a rutas base
    const roleMapping = {
      'developer': 'developer',
      'administrator': 'admin', 
      'agency': 'agency',
      'pt': 'pt',
      'pta': 'pta',
      'ot': 'ot',
      'cota': 'cota',
      'st': 'st',
      'sta': 'sta'
    };
    
    return roleMapping[role] || 'developer';
  };

  // Función para construir parámetros de consulta para API
  const buildQueryParams = (params) =>
    Object.entries(params)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

  // Función para convertir el rol del backend al frontend
  const convertRoleFromBackend = (role) => {
    const roleMapping = {
      'Developer': 'developer',
      'Administrator': 'administrator', 
      'Agency': 'agency',
      'PT': 'pt',
      'PTA': 'pta',
      'OT': 'ot',
      'COTA': 'cota',
      'ST': 'st',
      'STA': 'sta'
    };
    
    return roleMapping[role] || role.toLowerCase();
  };

  // Función para convertir el rol del frontend al backend
  const convertRoleToBackend = (role) => {
    const roleMapping = {
      'developer': 'Developer',
      'administrator': 'Administrator',
      'agency': 'Agency', 
      'pt': 'PT',
      'pta': 'PTA',
      'ot': 'OT',
      'cota': 'COTA',
      'st': 'ST',
      'sta': 'STA'
    };
    
    return roleMapping[role] || role;
  };

  // Función para formatear fecha sin problemas de timezone - CORREGIDO
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Crear fecha local sin conversión de timezone
      const date = new Date(dateString + 'T00:00:00');
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Función para formatear fecha para mostrar - CORREGIDO
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Not specified';
    
    try {
      // Crear fecha local sin conversión de timezone
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date for display:', error);
      return 'Not specified';
    }
  };

  // Función para navegar hacia atrás
  const handleGoBack = () => {
    const roleRoute = getRoleRoute();
    navigate(`/${roleRoute}/homePage`);
  };

  // Loading Animation Effect
  useEffect(() => {
    let currentProgress = 0;
    let stepIndex = 0;
    
    const progressInterval = setInterval(() => {
      currentProgress += 3;
      setLoadingProgress(currentProgress);
      
      // Change text at specific progress points
      const progressThresholds = [25, 50, 75];
      if (progressThresholds.includes(currentProgress) && stepIndex < loadingSequence.length - 1) {
        stepIndex++;
        setCurrentLoadingStep(stepIndex);
        setLoadingText(loadingSequence[stepIndex].text);
      }
      
      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          setIsLoading(false);
          // Start main animations
          setTimeout(() => {
            setAnimatingElements(['header', 'avatar', 'content']);
          }, 100);
        }, 300);
      }
    }, 25);

    return () => clearInterval(progressInterval);
  }, []);

  // Función para obtener el perfil del usuario desde la API
  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/staff/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener el perfil del usuario');
      }

      const allStaff = await response.json();
      console.log('✅ All staff loaded:', allStaff);

      const userData = allStaff.find(staff => staff.id === parseInt(userId));
      
      if (!userData) {
        throw new Error('Usuario no encontrado en la base de datos');
      }

      console.log('✅ User profile found:', userData);

      const [firstName, ...rest] = userData.name?.split(' ') || [''];
      const lastName = rest.join(' ');
      
      const branches = userData.branches ? 
        (typeof userData.branches === 'string' ? JSON.parse(userData.branches) : userData.branches) : 
        [];
      
      const documents = userData.documents ? 
        (typeof userData.documents === 'string' ? JSON.parse(userData.documents) : userData.documents) : 
        {};

      const processedProfile = {
        id: userData.id,
        firstName: firstName || '',
        lastName: lastName || '', 
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        alt_phone: userData.alt_phone || '',
        address: userData.address || '',
        postal_code: userData.postal_code || '',
        birthday: userData.birthday || '',
        gender: userData.gender || '',
        username: userData.username || '',
        role: userData.role || '',
        fax: userData.fax || '',
        branches: branches,
        documents: documents,
        is_active: userData.is_active,
        created_at: userData.created_at,
        agency_id: userData.agency_id || null
      };

      setUserProfile(processedProfile);

      setFormData({
        name: processedProfile.name,
        email: processedProfile.email,
        phone: processedProfile.phone,
        alt_phone: processedProfile.alt_phone,
        address: processedProfile.address,
        postal_code: processedProfile.postal_code,
        birthday: formatDateForInput(processedProfile.birthday), // CORREGIDO
        gender: processedProfile.gender,
        username: processedProfile.username,
        fax: processedProfile.fax,
        branches: processedProfile.branches,
        newPassword: '',
        confirmPassword: '',
        currentPassword: ''
      });

      return processedProfile;

    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      showNotification(`Error loading profile data: ${error.message}`, 'error');
      return null;
    }
  };

  // Initialize profile data
  useEffect(() => {
    const initializeProfile = async () => {
      if (!currentUser || isLoading) return;

      try {
        const profileData = await fetchUserProfile(currentUser.id);
        
        if (!profileData) return;

        const promises = [];
        
        // Fetch location if ZIP code exists
        if (profileData.postal_code) {
          promises.push(fetchLocationFromZip(profileData.postal_code));
        } else {
          promises.push(Promise.resolve(null));
        }
        
        // Fetch host agency for therapists
        if (profileData.agency_id && ['PT', 'PTA', 'OT', 'COTA', 'ST', 'STA', 'Administrator'].includes(profileData.role)) {
          promises.push(fetchHostAgency(profileData.agency_id));
        } else {
          promises.push(Promise.resolve(null));
        }
        
        // Fetch documents for developers/administrators
        if (['Developer', 'Administrator'].includes(profileData.role)) {
          promises.push(fetchUserDocuments(profileData.id));
        } else {
          promises.push(Promise.resolve([]));
        }

        // Fetch activity statistics
        promises.push(fetchActivityStats(profileData.id));

        const [locationResult, agencyResult, documentsResult, statsResult] = await Promise.all(promises);
        
        setLocationInfo(locationResult);
        setHostAgency(agencyResult);
        setDocuments(documentsResult);
        setActivityStats(statsResult);

      } catch (error) {
        console.error('Error initializing profile:', error);
        showNotification('Error loading profile data. Please try again.', 'error');
      }
    };

    initializeProfile();
  }, [currentUser, isLoading]);

  // API Function - ACTUALIZADA con Zippopotam.us
  const fetchLocationFromZip = async (zipCode) => {
    if (!zipCode) return null;
    
    try {
      console.log(`🔍 Looking up ZIP code: ${zipCode}`);
      
      // Usar Zippopotam.us API - COMPLETAMENTE GRATUITA
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Zippopotam response:', data);
        
        if (data && data.places && data.places.length > 0) {
          const place = data.places[0];
          const locationData = {
            city: place['place name'],
            state: place['state'],
            stateAbbr: place['state abbreviation'],
            fullName: `${place['place name']}, ${place['state abbreviation']}`,
            coordinates: {
              lat: parseFloat(place.latitude),
              lng: parseFloat(place.longitude)
            }
          };
          
          console.log('✅ Processed location data:', locationData);
          return locationData;
        }
      } else {
        console.log(`❌ Zippopotam API error: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Location fetch error:', error);
    }
    
    return null;
  };

  const fetchHostAgency = async (agencyId) => {
    if (!agencyId) return null;
    
    try {
      const response = await fetch(`http://localhost:8000/staff/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const allStaff = await response.json();
        const agency = allStaff.find(staff => staff.id === parseInt(agencyId) && staff.role === 'Agency');
        
        if (agency) {
          return {
            id: agency.id,
            name: agency.name,
            address: agency.address,
            phone: agency.phone
          };
        }
      }
    } catch (error) {
      console.error('Agency fetch error:', error);
    }
    
    return null;
  };

  const fetchUserDocuments = async (userId) => {
    if (!['Developer', 'Administrator'].includes(userProfile?.role)) return [];
    
    try {
      const response = await fetch(`http://localhost:8000/documents/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (response.ok) {
        const docs = await response.json();
        return docs;
      }
    } catch (error) {
      console.error('Documents fetch error:', error);
    }
    
    return [];
  };

  const fetchActivityStats = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}/activity-stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (response.ok) {
        const stats = await response.json();
        return stats;
      }
    } catch (error) {
      console.error('Activity stats fetch error:', error);
    }
    
    return {
      totalSessions: 342,
      patientsHelped: 127,
      codeCommits: 247,
      issuesResolved: 43,
      usersManaged: 156,
      tasksCompleted: 89,
      patientsServed: 1247,
      therapists: 34,
      daysActive: Math.floor((new Date() - new Date(userProfile?.created_at || new Date())) / (1000 * 60 * 60 * 24)),
      lastLogin: 'Today'
    };
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (formData.phone && !/^\+?[\d\s\(\)\-]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (showPasswordChange) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save changes
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        alt_phone: formData.alt_phone,
        address: formData.address,
        postal_code: formData.postal_code,
        birthday: formData.birthday,
        gender: formData.gender,
        username: formData.username,
        role: convertRoleToBackend(userProfile.role),
        is_active: userProfile.is_active,
        fax: formData.fax
      };
      
      if (showPasswordChange && formData.newPassword) {
        updateData.password = formData.newPassword;
      }
      
      if (userProfile?.role === 'Agency' && formData.branches) {
        updateData.branches = JSON.stringify(formData.branches);
      }
      
      if (userProfile?.agency_id) {
        updateData.agency_id = userProfile.agency_id;
      }
      
      const queryString = buildQueryParams(updateData);
      
      console.log('📤 Sending profile update:', updateData);
      
      const response = await fetch(`http://localhost:8000/staff/${userProfile.id}?${queryString}`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        const error = await response.json();
        const readable = error?.detail || 'Failed to update profile';
        throw new Error(readable);
      }
      
      const data = await response.json();
      console.log("✅ Profile updated:", data);
      
      const updatedProfile = {
        ...userProfile,
        ...updateData,
        branches: formData.branches
      };
      setUserProfile(updatedProfile);
      
      if (updateUser) {
        updateUser(updatedProfile);
      }
      
      setIsEditing(false);
      setShowPasswordChange(false);
      setShowSuccessMessage(true);
      
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
        currentPassword: ''
      }));
      
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 4000);
      
      // Refresh location info if postal code changed
      if (formData.postal_code !== userProfile.postal_code) {
        const newLocationInfo = await fetchLocationFromZip(formData.postal_code);
        setLocationInfo(newLocationInfo);
      }
      
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      showNotification(`Error saving profile: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    if (!userProfile) return;
    
    setFormData({
      name: userProfile.name || '',
      email: userProfile.email || '',
      phone: userProfile.phone || '',
      alt_phone: userProfile.alt_phone || '',
      address: userProfile.address || '',
      postal_code: userProfile.postal_code || '',
      birthday: formatDateForInput(userProfile.birthday), // CORREGIDO
      gender: userProfile.gender || '',
      username: userProfile.username || '',
      fax: userProfile.fax || '',
      branches: userProfile.branches || [],
      newPassword: '',
      confirmPassword: '',
      currentPassword: ''
    });
    setErrors({});
    setIsEditing(false);
    setShowPasswordChange(false);
  };

  // Quick Actions Handlers
  const handleChangePassword = () => {
    setShowPasswordChange(true);
    setIsEditing(true);
  };

  // ACTUALIZADO - Redirige a la página de Settings correcta
  const handleSystemSettings = () => {
    const roleRoute = getRoleRoute();
    navigate(`/${roleRoute}/settings`);
  };

  const handleViewReports = () => {
    window.location.href = '/agency/reports';
  };

  const handleAddTherapist = () => {
    window.location.href = '/agency/add-therapist';
  };

  // Branch management functions
  const addBranch = () => {
    setFormData(prev => ({
      ...prev,
      branches: [...prev.branches, { name: '', address: '', phone: '' }]
    }));
  };

  const removeBranch = (index) => {
    setFormData(prev => ({
      ...prev,
      branches: prev.branches.filter((_, i) => i !== index)
    }));
  };

  const updateBranch = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      branches: prev.branches.map((branch, i) => 
        i === index ? { ...branch, [field]: value } : branch
      )
    }));
  };

  // Document upload handler - CORREGIDO COMPLETAMENTE
  const handleDocumentUpload = async (file) => {
    if (!file) {
      showNotification('Please select a file to upload.', 'error');
      return;
    }

    // Validar tamaño del archivo (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showNotification('File size must be less than 10MB.', 'error');
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      showNotification('Please upload a valid file type (PDF, DOC, DOCX, JPG, PNG).', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('user_id', userProfile.id.toString());
      formDataUpload.append('document_type', 'profile_document');

      console.log('📤 Uploading document:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        userId: userProfile.id
      });

      const response = await fetch(`http://localhost:8000/documents/upload`, {
        method: 'POST',
        body: formDataUpload
      });

      console.log('📥 Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Upload error response:', errorData);
        throw new Error(`Upload failed: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('✅ Upload successful:', result);

      // Crear objeto de documento para el estado local
      const newDocument = {
        id: result.id || Date.now(),
        name: file.name,
        type: file.type,
        size: file.size,
        upload_date: new Date().toISOString(),
        status: 'uploaded',
        url: result.url || '#'
      };

      // Actualizar estado local
      setDocuments(prev => [...prev, newDocument]);
      showNotification('Document uploaded successfully!', 'success');

    } catch (error) {
      console.error('❌ Document upload error:', error);
      showNotification(`Upload failed: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Utility functions
  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `premium-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  };

  const getAvatarInitials = () => {
    if (!userProfile) return 'TS';
    
    if (userProfile.role === 'Agency') {
      const words = (formData.name || userProfile.name || 'Agency').split(' ');
      return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
    }
    
    const name = formData.name || userProfile.name || 'User Name';
    const firstName = name.split(' ')[0] || 'User';
    const lastName = name.split(' ')[1] || '';
    return `${firstName[0]}${lastName[0] || firstName[1] || ''}`.toUpperCase();
  };

  const getRoleInfo = () => {
    if (!userProfile) return { name: 'Team Member', icon: 'fa-user', color: '#0066FF' };
    
    const roleMap = {
      'Developer': { name: 'Developer', icon: 'fa-laptop-code', color: '#0066FF' },
      'Administrator': { name: 'Administrator', icon: 'fa-user-shield', color: '#AF52DE' },
      'Agency': { name: 'Healthcare Agency', icon: 'fa-hospital-alt', color: '#FF3B30' },
      'PT': { name: 'Physical Therapist', icon: 'fa-user-md', color: '#00D4AA' },
      'PTA': { name: 'Physical Therapist Assistant', icon: 'fa-user-nurse', color: '#00D4AA' },
      'OT': { name: 'Occupational Therapist', icon: 'fa-hand-holding-medical', color: '#0066FF' },
      'COTA': { name: 'Occupational Therapy Assistant', icon: 'fa-hand-holding', color: '#0066FF' },
      'ST': { name: 'Speech Therapist', icon: 'fa-comment-medical', color: '#FF9500' },
      'STA': { name: 'Speech Therapy Assistant', icon: 'fa-comment-dots', color: '#FF9500' }
    };
    
    return roleMap[userProfile?.role] || { name: 'Team Member', icon: 'fa-user', color: '#0066FF' };
  };

  const getFormattedAddress = () => {
    if (isEditing) {
      if (formData.address) return formData.address;
      if (locationInfo) return locationInfo.fullName;
      if (formData.postal_code) return `${formData.postal_code} Area`;
      return 'Location not specified';
    }
    
    if (userProfile?.address) return userProfile.address;
    if (locationInfo) return locationInfo.fullName;
    if (userProfile?.postal_code) return `${userProfile.postal_code} Area`;
    return 'Location not specified';
  };

  // Show a simple message if no user is logged in
  if (!currentUser) {
    return (
      <div className="premium-profile-page">
        <div className="no-user-message">
          <h2>Please log in to view your profile</h2>
        </div>
      </div>
    );
  }

  // Render loading screen
  if (isLoading) {
    return (
      <div className="premium-loading-screen">
        <div className="loading-background"></div>
        <div className="loading-particles"></div>
        
        <div className="loading-content">
          <div className="loading-logo">
            <div className="logo-circle">
              <i className="fas fa-user-circle"></i>
            </div>
          </div>
          
          <div className="loading-progress-container">
            <div className="loading-progress-circle">
              <svg className="progress-ring" width="120" height="120">
                <circle
                  className="progress-ring-background"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3"
                  fill="transparent"
                  r="55"
                  cx="60"
                  cy="60"
                />
                <circle
                  className="progress-ring-progress"
                  stroke="url(#progressGradient)"
                  strokeWidth="3"
                  fill="transparent"
                  r="55"
                  cx="60"
                  cy="60"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 55}`,
                    strokeDashoffset: `${2 * Math.PI * 55 * (1 - loadingProgress / 100)}`,
                    transition: 'stroke-dashoffset 0.3s ease'
                  }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: '#0066FF'}} />
                    <stop offset="50%" style={{stopColor: '#AF52DE'}} />
                    <stop offset="100%" style={{stopColor: '#00D4AA'}} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="progress-percentage">{loadingProgress}%</div>
            </div>
          </div>
          
          <div className="loading-text">
            <h2>{loadingText}</h2>
            <div className="loading-steps">
              <div className="step-indicators">
                {['Connecting', 'Loading', 'Fetching', 'Rendering'].map((step, index) => (
                  <div 
                    key={step}
                    className={`step-indicator ${index <= 
                      currentLoadingStep ? 'active' : ''} ${index < currentLoadingStep ? 'completed' : ''}`}
                  >
                    <div className="step-icon">
                      {index < currentLoadingStep ? (
                        <i className="fas fa-check"></i>
                      ) : index === currentLoadingStep ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-circle"></i>
                      )}
                    </div>
                    <span className="step-label">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roleInfo = getRoleInfo();

  return (
    <div className="premium-profile-page">
      {/* Premium Background Effects */}
      <div className="premium-background">
        <div className="background-gradient"></div>
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="premium-notification success show">
          <div className="notification-content">
            <i className="fas fa-check-circle"></i>
            <span>Profile updated successfully!</span>
          </div>
        </div>
      )}

      {/* Premium Header con botón de regreso */}
      <header className={`premium-header ${animatingElements.includes('header') ? 'animate-in' : ''}`}>
        <div className="header-content">
          <div className="header-left">
            <div className="back-button-container">
              <button 
                className="premium-back-btn" 
                onClick={handleGoBack}
                title="Go back to home page"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Back</span>
              </button>
            </div>
            <div className="header-title">
              <h1>
                <i className="fas fa-user-circle"></i>
                My Profile
              </h1>
              <p>Manage your TherapySync profile and preferences</p>
            </div>
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar" style={{ background: roleInfo.color }}>
                <span>{getAvatarInitials()}</span>
              </div>
              <div className="user-details">
                <div className="user-name">{formData.name || userProfile?.name || 'User Name'}</div>
                <div className="user-role">{roleInfo.name}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="premium-container">
        {/* Profile Main Card */}
        <div className={`premium-card profile-main-card ${animatingElements.includes('content') ? 'animate-in' : ''}`}>
          
          {/* Avatar Section */}
          <div className={`avatar-section ${animatingElements.includes('avatar') ? 'animate-in' : ''}`}>
            <div className="avatar-container">
              <div className="avatar-rings">
                <div className="ring-outer"></div>
                <div className="ring-inner"></div>
              </div>
              <div className="avatar-main" style={{ background: roleInfo.color }}>
                <span>{getAvatarInitials()}</span>
                <div className="avatar-shine"></div>
              </div>
              <div className="status-indicator online">
                <div className="status-pulse"></div>
              </div>
            </div>
            
            <div className="user-info">
              <h2 className="user-name">{formData.name || userProfile?.name || 'User Name'}</h2>
              <div className="user-role" style={{ color: roleInfo.color }}>
                <i className={`fas ${roleInfo.icon}`}></i>
                <span>{roleInfo.name}</span>
              </div>
              
              {/* Host Agency Message */}
              {hostAgency && ['PT', 'PTA', 'OT', 'COTA', 'ST', 'STA', 'Administrator'].includes(userProfile?.role) && (
                <div className="host-agency">
                  <div className="agency-badge">
                    <i className="fas fa-hospital-user"></i>
                    <span>{hostAgency.name} is your host</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="profile-actions">
              {!isEditing ? (
                <button 
                  className="premium-btn primary"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-edit"></i>
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="premium-btn primary"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  <button 
                    className="premium-btn secondary"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <i className="fas fa-times"></i>
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Information Grid */}
          <div className="info-grid">
            {/* Personal Information */}
            <div className="info-section">
              <div className="section-header">
                <i className="fas fa-user-circle"></i>
                <h3>Personal Information</h3>
              </div>
              
              <div className="info-fields">
                {userProfile?.role !== 'Agency' ? (
                  <>
                    {/* Full Name */}
                    <div className="field">
                      <label>Full Name</label>
                      {isEditing ? (
                        <div className="field-input">
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={errors.name ? 'error' : ''}
                            placeholder="Enter your full name"
                          />
                          {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>
                      ) : (
                        <div className="field-value">{userProfile?.name || 'Not specified'}</div>
                      )}
                    </div>
                    
                    {/* Email Address */}
                    <div className="field">
                      <label>Email Address</label>
                      {isEditing ? (
                        <div className="field-input">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={errors.email ? 'error' : ''}
                            placeholder="Enter your email address"
                          />
                          {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                      ) : (
                        <div className="field-value">
                          <span>{userProfile?.email || 'Not specified'}</span>
                          <div className="verified-badge">
                            <i className="fas fa-check-circle"></i>
                            <span>Verified</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Phone Number */}
                    <div className="field">
                      <label>Phone Number</label>
                      {isEditing ? (
                        <div className="field-input">
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={errors.phone ? 'error' : ''}
                            placeholder="Enter your phone number"
                          />
                          {errors.phone && <span className="error-message">{errors.phone}</span>}
                        </div>
                      ) : (
                        <div className="field-value">{userProfile?.phone || 'Not specified'}</div>
                      )}
                    </div>
                    
                    {/* Alternative Phone */}
                    <div className="field">
                      <label>Alternative Phone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="alt_phone"
                          value={formData.alt_phone}
                          onChange={handleInputChange}
                          placeholder="Enter alternative phone number"
                          className="premium-input"
                        />
                      ) : (
                        <div className="field-value">{userProfile?.alt_phone || 'Not specified'}</div>
                      )}
                    </div>
                    
                    {/* Location/Address */}
                    <div className="field">
                      <label>Address</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Enter your address"
                          className="premium-input"
                        />
                      ) : (
                        <div className="field-value">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>{getFormattedAddress()}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* ZIP Code - CORREGIDO: Removido texto azul */}
                    <div className="field">
                      <label>ZIP Code</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="postal_code"
                          value={formData.postal_code}
                          onChange={handleInputChange}
                          placeholder="Enter ZIP code"
                          className="premium-input"
                        />
                      ) : (
                        <div className="field-value">
                          {userProfile?.postal_code || 'Not specified'}
                        </div>
                      )}
                    </div>
                    
                    {/* Date of Birth - CORREGIDO */}
                    <div className="field">
                      <label>Date of Birth</label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="birthday"
                          value={formData.birthday}
                          onChange={handleInputChange}
                          className="premium-input"
                        />
                      ) : (
                        <div className="field-value">
                          {formatDateForDisplay(userProfile?.birthday)}
                        </div>
                      )}
                    </div>
                    
                    {/* Gender */}
                    <div className="field">
                      <label>Gender</label>
                      {isEditing ? (
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="premium-select"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      ) : (
                        <div className="field-value">
                          {userProfile?.gender ? 
                            userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1).replace('_', ' ') : 
                            'Not specified'
                          }
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Agency Information */}
                    <div className="field">
                      <label>Agency Name</label>
                      {isEditing ? (
                        <div className="field-input">
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={errors.name ? 'error' : ''}
                            placeholder="Enter agency name"
                          />
                          {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>
                      ) : (
                        <div className="field-value">{userProfile?.name || 'Not specified'}</div>
                      )}
                    </div>
                    
                    <div className="field">
                      <label>Contact Email</label>
                      {isEditing ? (
                        <div className="field-input">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={errors.email ? 'error' : ''}
                            placeholder="Enter contact email"
                          />
                          {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                      ) : (
                        <div className="field-value">
                          <span>{userProfile?.email || 'Not specified'}</span>
                          <div className="verified-badge">
                            <i className="fas fa-check-circle"></i>
                            <span>Verified</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="field">
                      <label>Main Contact</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter main contact number"
                          className="premium-input"
                        />
                      ) : (
                        <div className="field-value">{userProfile?.phone || 'Not specified'}</div>
                      )}
                    </div>
                    
                    <div className="field">
                      <label>Main Address</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Enter main office address"
                          className="premium-input"
                        />
                      ) : (
                        <div className="field-value">
                          {userProfile?.address ? (
                            <>
                              <i className="fas fa-building"></i>
                              <span>{userProfile.address}</span>
                            </>
                          ) : 'Not specified'}
                        </div>
                      )}
                    </div>
                    
                    <div className="field">
                      <label>Fax Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="fax"
                          value={formData.fax}
                          onChange={handleInputChange}
                          placeholder="Enter fax number"
                          className="premium-input"
                        />
                      ) : (
                        <div className="field-value">{userProfile?.fax || 'Not specified'}</div>
                      )}
                    </div>
                    
                    {/* Branch Locations */}
                    {(formData.branches.length > 0 || isEditing) && (
                      <div className="field full-width">
                        <label>Branch Locations</label>
                        {isEditing ? (
                          <div className="branches-editor">
                            {formData.branches.map((branch, index) => (
                              <div key={index} className="branch-editor">
                                <div className="branch-header">
                                  <h4>Branch #{index + 1}</h4>
                                  {formData.branches.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => removeBranch(index)}
                                      className="remove-branch-btn"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  )}
                                </div>
                                <div className="branch-fields">
                                  <input
                                    type="text"
                                    placeholder="Branch name"
                                    value={branch.name}
                                    onChange={(e) => updateBranch(index, 'name', e.target.value)}
                                    className="premium-input"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Branch address"
                                    value={branch.address}
                                    onChange={(e) => updateBranch(index, 'address', e.target.value)}
                                    className="premium-input"
                                  />
                                  <input
                                    type="tel"
                                    placeholder="Branch phone"
                                    value={branch.phone}
                                    onChange={(e) => updateBranch(index, 'phone', e.target.value)}
                                    className="premium-input"
                                  />
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={addBranch}
                              className="add-branch-btn"
                            >
                              <i className="fas fa-plus"></i>
                              <span>Add Branch</span>
                            </button>
                          </div>
                        ) : (
                          <div className="branches-list">
                            {userProfile?.branches && userProfile.branches.map((branch, index) => (
                              <div key={index} className="branch-item">
                                <div className="branch-name">{branch.name}</div>
                                <div className="branch-details">
                                  <span><i className="fas fa-map-marker-alt"></i>{branch.address}</span>
                                  <span><i className="fas fa-phone"></i>{branch.phone}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="info-section">
              <div className="section-header">
                <i className="fas fa-cog"></i>
                <h3>Account Information</h3>
              </div>
              
              <div className="info-fields">
                <div className="field">
                  <label>Username</label>
                  {isEditing ? (
                    <div className="field-input">
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={errors.username ? 'error' : ''}
                        placeholder="Enter username"
                      />
                      {errors.username && <span className="error-message">{errors.username}</span>}
                    </div>
                  ) : (
                    <div className="field-value">{userProfile?.username || 'Not specified'}</div>
                  )}
                </div>
                
                <div className="field">
                  <label>Role</label>
                  <div className="field-value">
                    <div className="role-display" style={{ color: roleInfo.color }}>
                      <i className={`fas ${roleInfo.icon}`}></i>
                      <span>{roleInfo.name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="field">
                  <label>Account Status</label>
                  <div className="field-value">
                    <div className={`status-badge ${userProfile?.is_active ? 'active' : 'inactive'}`}>
                      <div className="status-dot"></div>
                      <span>{userProfile?.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="field">
                  <label>Member Since</label>
                  <div className="field-value">
                    {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not available'}
                  </div>
                </div>

                {/* Password Change Section */}
                {isEditing && (
                  <div className="field full-width">
                    <div className="password-section">
                      <div className="password-header">
                        <label>Password Settings</label>
                        <button
                          type="button"
                          className={`toggle-password-btn ${showPasswordChange ? 'active' : ''}`}
                          onClick={() => setShowPasswordChange(!showPasswordChange)}
                        >
                          <i className={`fas ${showPasswordChange ? 'fa-eye-slash' : 'fa-key'}`}></i>
                          <span>{showPasswordChange ? 'Cancel Password Change' : 'Change Password'}</span>
                        </button>
                      </div>
                      
                      {showPasswordChange && (
                        <div className="password-fields">
                          <div className="field-input">
                            <input
                              type="password"
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                              placeholder="Enter current password"
                              className={errors.currentPassword ? 'error' : ''}
                            />
                            {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
                          </div>
                          
                          <div className="field-input">
                            <input
                              type="password"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                              placeholder="Enter new password"
                              className={errors.newPassword ? 'error' : ''}
                            />
                            {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                          </div>
                          
                          <div className="field-input">
                            <input
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              placeholder="Confirm new password"
                              className={errors.confirmPassword ? 'error' : ''}
                            />
                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                          </div>
                          
                          <div className="password-requirements">
                            <small>Password must be at least 8 characters long</small>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Documents Section - Only for Developers/Administrators - CORREGIDO */}
            {['Developer', 'Administrator'].includes(userProfile?.role) && (
              <div className="info-section documents-section">
                <div className="section-header">
                  <i className="fas fa-file-medical-alt"></i>
                  <h3>Required Documents</h3>
                  <div className="docs-status">
                    <span>{documents.length} uploaded</span>
                  </div>
                </div>
                
                <div className="documents-grid">
                  {documents.length > 0 ? (
                    documents.map((doc, index) => (
                      <div key={index} className="document-card">
                        <div className="doc-icon">
                          <i className="fas fa-file-pdf"></i>
                        </div>
                        <div className="doc-info">
                          <div className="doc-name">{doc.name}</div>
                          <div className="doc-status verified">
                            <i className="fas fa-check-circle"></i>
                            <span>Verified</span>
                          </div>
                        </div>
                        <div className="doc-actions">
                          <button className="doc-view-btn" onClick={() => window.open(doc.url, '_blank')}>
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="doc-download-btn" onClick={() => window.open(doc.downloadUrl, '_blank')}>
                            <i className="fas fa-download"></i>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-documents">
                      <i className="fas fa-inbox"></i>
                      <span>No documents uploaded yet</span>
                    </div>
                  )}
                </div>

                {/* Document Upload Section - CORREGIDO */}
                <div className="document-upload-section">
                  <h4>Upload New Document</h4>
                  <div className="upload-area">
                    <input
                      type="file"
                      id="document-upload-new"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleDocumentUpload(e.target.files[0]);
                          e.target.value = ''; // Reset input
                        }
                      }}
                      disabled={isUploading}
                    />
                    <label 
                      htmlFor="document-upload-new" 
                      className={`upload-label ${isUploading ? 'uploading' : ''}`}
                    >
                      {isUploading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-cloud-upload-alt"></i>
                          <span>Click to upload or drag and drop</span>
                          <small>PDF, DOC, DOCX, JPG, PNG (Max 10MB)</small>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Summary - For all roles */}
            <div className="info-section activity-section">
              <div className="section-header">
                <i className="fas fa-chart-line"></i>
                <h3>Activity Summary</h3>
              </div>
              
              <div className="activity-stats">
                {userProfile?.role === 'Developer' && (
                  <>
                    <div className="activity-stat">
                      <div className="stat-icon developer">
                        <i className="fas fa-code"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{activityStats.codeCommits || 247}</div>
                        <div className="stat-label">Code Commits</div>
                      </div>
                    </div>
                    <div className="activity-stat">
                      <div className="stat-icon developer">
                        <i className="fas fa-bug"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{activityStats.issuesResolved || 43}</div>
                        <div className="stat-label">Issues Resolved</div>
                      </div>
                    </div>
                  </>
                )}

                {userProfile?.role === 'Administrator' && (
                  <>
                    <div className="activity-stat">
                      <div className="stat-icon admin">
                        <i className="fas fa-users"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{activityStats.usersManaged || 156}</div>
                        <div className="stat-label">Users Managed</div>
                      </div>
                    </div>
                    <div className="activity-stat">
                      <div className="stat-icon admin">
                        <i className="fas fa-tasks"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{activityStats.tasksCompleted || 89}</div>
                        <div className="stat-label">Tasks Completed</div>
                      </div>
                    </div>
                  </>
                )}

                {['PT', 'PTA', 'OT', 'COTA', 'ST', 'STA'].includes(userProfile?.role) && (
                  <>
                    <div className="activity-stat">
                      <div className="stat-icon therapist">
                        <i className="fas fa-user-friends"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{activityStats.totalSessions || 342}</div>
                        <div className="stat-label">Sessions Completed</div>
                      </div>
                    </div>
                    <div className="activity-stat">
                      <div className="stat-icon therapist">
                        <i className="fas fa-heart"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{activityStats.patientsHelped || 127}</div>
                        <div className="stat-label">Patients Helped</div>
                      </div>
                    </div>
                  </>
                )}

                {userProfile?.role === 'Agency' && (
                  <>
                    <div className="activity-stat">
                      <div className="stat-icon agency">
                        <i className="fas fa-hospital"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{activityStats.patientsServed || 1247}</div>
                        <div className="stat-label">Patients Served</div>
                      </div>
                    </div>
                    <div className="activity-stat">
                      <div className="stat-icon agency">
                        <i className="fas fa-user-md"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{activityStats.therapists || 34}</div>
                        <div className="stat-label">Therapists</div>
                      </div>
                    </div>
                  </>
                )}

                {/* Common stats for all roles */}
                <div className="activity-stat">
                  <div className="stat-icon common">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {activityStats.daysActive || Math.floor((new Date() - new Date(userProfile?.created_at || new Date())) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="stat-label">Days Active</div>
                  </div>
                </div>

                <div className="activity-stat">
                  <div className="stat-icon common">
                    <i className="fas fa-sign-in-alt"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{activityStats.lastLogin || 'Today'}</div>
                    <div className="stat-label">Last Login</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - Only when not editing - REMOVIDOS Export Data y Help Support */}
            {!isEditing && (
              <div className="info-section quick-actions-section">
                <div className="section-header">
                  <i className="fas fa-bolt"></i>
                  <h3>Quick Actions</h3>
                </div>
                <div className="quick-actions-grid">
                  <button className="quick-action-btn" onClick={handleChangePassword}>
                    <div className="action-icon">
                      <i className="fas fa-key"></i>
                    </div>
                    <span>Change Password</span>
                  </button>

                  {['Developer', 'Administrator'].includes(userProfile?.role) && (
                    <button className="quick-action-btn" onClick={handleSystemSettings}>
                      <div className="action-icon">
                        <i className="fas fa-cogs"></i>
                      </div>
                      <span>System Settings</span>
                    </button>
                  )}

                  {userProfile?.role === 'Agency' && (
                    <>
                      <button className="quick-action-btn" onClick={handleViewReports}>
                        <div className="action-icon">
                          <i className="fas fa-chart-bar"></i>
                        </div>
                        <span>View Reports</span>
                      </button>

                      <button className="quick-action-btn" onClick={handleAddTherapist}>
                        <div className="action-icon">
                          <i className="fas fa-user-plus"></i>
                        </div>
                        <span>Add Therapist</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Premium Footer */}
      <footer className="premium-footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="last-saved">
              <i className="fas fa-cloud-upload-alt"></i>
              <span>Auto-saved • {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="sync-status">
              <div className="sync-indicator active">
                <div className="sync-dot"></div>
              </div>
              <span>Profile synchronized</span>
            </div>
          </div>
          
          <div className="footer-right">
            <div className="footer-actions">
              {isEditing && (
                <div className="editing-indicator">
                  <i className="fas fa-edit"></i>
                  <span>Editing Profile</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DevUserProfile;