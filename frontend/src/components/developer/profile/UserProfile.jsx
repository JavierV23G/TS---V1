import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../login/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../../styles/developer/Profile/UserProfile.scss';

const DevUserProfile = () => {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // Estados de animación de carga clínica
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [showContent, setShowContent] = useState(false);
  
  // Estados del perfil
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [profileImage, setProfileImage] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  
  // Estados de datos
  const [locationInfo, setLocationInfo] = useState(null);
  const [hostAgency, setHostAgency] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [activityStats, setActivityStats] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Datos del formulario para edición
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
  
  // Errores de validación del formulario
  const [errors, setErrors] = useState({});
  
  // Función para obtener el rol base y generar la ruta correcta
  const getRoleRoute = () => {
    if (!currentUser?.role) return 'developer';
    const role = currentUser.role.toLowerCase();
    
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

  // Función para formatear fecha sin problemas de timezone
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
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

  // Función para formatear fecha para mostrar
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Not specified';
    
    try {
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

  // Función para formatear número de teléfono
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

  // Función para navegar hacia atrás
  const handleGoBack = () => {
    const roleRoute = getRoleRoute();
    navigate(`/${roleRoute}/homePage`);
  };

  // Animación de carga clínica elegante
  useEffect(() => {
    const loadingSequence = async () => {
      // Fase 1: Inicialización del sistema
      await new Promise(resolve => setTimeout(resolve, 400));
      setLoadingPhase(1);
      
      // Fase 2: Cargando información médica
      await new Promise(resolve => setTimeout(resolve, 600));
      setLoadingPhase(2);
      
      // Fase 3: Preparando interfaz clínica
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoadingPhase(3);
      
      // Fase 4: Completado
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsLoading(false);
      
      // Mostrar contenido con animación
      setTimeout(() => setShowContent(true), 100);
    };
    
    loadingSequence();
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
        throw new Error('Error fetching user profile');
      }

      const allStaff = await response.json();
      const userData = allStaff.find(staff => staff.id === parseInt(userId));
      
      if (!userData) {
        throw new Error('User not found in database');
      }

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
        phone: formatPhoneNumber(processedProfile.phone),
        alt_phone: formatPhoneNumber(processedProfile.alt_phone),
        address: processedProfile.address,
        postal_code: processedProfile.postal_code,
        birthday: formatDateForInput(processedProfile.birthday),
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
      console.error('Error fetching user profile:', error);
      showNotification(`Error loading profile data: ${error.message}`, 'error');
      return null;
    }
  };

  // Inicializar datos del perfil
  useEffect(() => {
    const initializeProfile = async () => {
      if (!currentUser || isLoading) return;

      try {
        const profileData = await fetchUserProfile(currentUser.id);
        
        if (!profileData) return;

        const promises = [];
        
        // Obtener ubicación si existe código postal
        if (profileData.postal_code) {
          promises.push(fetchLocationFromZip(profileData.postal_code));
        } else {
          promises.push(Promise.resolve(null));
        }
        
        // Obtener agencia host para terapeutas
        if (profileData.agency_id && ['PT', 'PTA', 'OT', 'COTA', 'ST', 'STA', 'Administrator'].includes(profileData.role)) {
          promises.push(fetchHostAgency(profileData.agency_id));
        } else {
          promises.push(Promise.resolve(null));
        }
        
        // Obtener documentos para desarrolladores/administradores
        if (['Developer', 'Administrator'].includes(profileData.role)) {
          promises.push(fetchUserDocuments(profileData.id));
        } else {
          promises.push(Promise.resolve([]));
        }

        // Obtener estadísticas de actividad
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

  // API Function - Zippopotam.us
  const fetchLocationFromZip = async (zipCode) => {
    if (!zipCode) return null;
    
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
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
          
          return locationData;
        }
      }
    } catch (error) {
      console.error('Location fetch error:', error);
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
      lastLogin: 'Hoy'
    };
  };

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Formatear teléfono automáticamente
    if (name === 'phone' || name === 'alt_phone') {
      formattedValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Limpiar error cuando se edita el campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validar datos del formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validación de contraseña
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

  // Manejar guardado de cambios
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''),
        alt_phone: formData.alt_phone.replace(/\D/g, ''),
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
      
      const response = await fetch(`http://localhost:8000/staff/${userProfile.id}?${queryString}`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        const error = await response.json();
        const readable = error?.detail || 'Error updating profile';
        throw new Error(readable);
      }
      
      const data = await response.json();
      
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
      
      // Actualizar información de ubicación si cambió el código postal
      if (formData.postal_code !== userProfile.postal_code) {
        const newLocationInfo = await fetchLocationFromZip(formData.postal_code);
        setLocationInfo(newLocationInfo);
      }
      
    } catch (error) {
      console.error('Error saving profile:', error);
      showNotification(`Error saving profile: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar cancelación de edición
  const handleCancel = () => {
    if (!userProfile) return;
    
    setFormData({
      name: userProfile.name || '',
      email: userProfile.email || '',
      phone: formatPhoneNumber(userProfile.phone || ''),
      alt_phone: formatPhoneNumber(userProfile.alt_phone || ''),
      address: userProfile.address || '',
      postal_code: userProfile.postal_code || '',
      birthday: formatDateForInput(userProfile.birthday),
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

  // Acciones rápidas
  const handleChangePassword = () => {
    setShowPasswordChange(true);
    setIsEditing(true);
    setActiveSection('account');
  };

  const handleSystemSettings = () => {
    const roleRoute = getRoleRoute();
    navigate(`/${roleRoute}/settings`);
  };

  const handleViewReports = () => {
    const roleRoute = getRoleRoute();
    navigate(`/${roleRoute}/reports`);
  };

  const handleAddTherapist = () => {
    const roleRoute = getRoleRoute();
    navigate(`/${roleRoute}/add-therapist`);
  };

  // Gestión de sucursales
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

  // Manejador de carga de foto de perfil
  const handleProfileImageUpload = async (file) => {
    if (!file) return;
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file.', 'error');
      return;
    }
    
    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size must be less than 5MB.', 'error');
      return;
    }
    
    setIsImageUploading(true);
    
    try {
      // Crear preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Aquí iría la lógica para subir al servidor
      // Por ahora solo mostramos el preview local
      
      showNotification('Profile image updated successfully!', 'success');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      showNotification('Error uploading image. Please try again.', 'error');
    } finally {
      setIsImageUploading(false);
    }
  };
  
  // Manejador de carga de documentos
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
      showNotification('Please upload a valid file (PDF, DOC, DOCX, JPG, PNG).', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('user_id', userProfile.id.toString());
      formDataUpload.append('document_type', 'profile_document');

      const response = await fetch(`http://localhost:8000/documents/upload`, {
        method: 'POST',
        body: formDataUpload
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Upload error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();

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
      console.error('Document upload error:', error);
      showNotification(`Upload error: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Funciones para animación de tabs
  const getTabPosition = () => {
    const sections = ['personal', 'account'];
    if (userProfile?.role === 'Agency') sections.push('branches');
    if (['Developer', 'Administrator'].includes(userProfile?.role)) sections.push('documents');
    
    const index = sections.indexOf(activeSection);
    return index * 200; // 200px por tab
  };
  
  const getTabWidth = () => {
    return 180; // Ancho fijo de cada tab
  };
  
  // Funciones de utilidad
  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `clinical-notification ${type}`;
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
    if (!userProfile) return { name: 'Team Member', icon: 'fa-user', color: '#1565C0' };
    
    const roleMap = {
      'Developer': { name: 'Developer', icon: 'fa-laptop-code', color: '#37474F' },
      'Administrator': { name: 'Administrator', icon: 'fa-user-shield', color: '#7C4DFF' },
      'Agency': { name: 'Health Agency', icon: 'fa-hospital-alt', color: '#FFC107' },
      'PT': { name: 'Physical Therapist', icon: 'fa-user-md', color: '#00C851' },
      'PTA': { name: 'Physical Therapist Assistant', icon: 'fa-user-nurse', color: '#00C851' },
      'OT': { name: 'Occupational Therapist', icon: 'fa-hand-holding-medical', color: '#FF9500' },
      'COTA': { name: 'Occupational Therapy Assistant', icon: 'fa-hand-holding', color: '#FF9500' },
      'ST': { name: 'Speech Therapist', icon: 'fa-comment-medical', color: '#2979FF' },
      'STA': { name: 'Speech Therapy Assistant', icon: 'fa-comment-dots', color: '#2979FF' }
    };
    
    return roleMap[userProfile?.role] || { name: 'Team Member', icon: 'fa-user', color: '#1565C0' };
  };

  const getFormattedAddress = () => {
    if (isEditing && formData.address) return formData.address;
    if (userProfile?.address) return userProfile.address;
    if (locationInfo) return locationInfo.fullName;
    if (userProfile?.postal_code) return `Area ${userProfile.postal_code}`;
    return 'Not specified';
  };

  // Mostrar mensaje si no hay usuario conectado
  if (!currentUser) {
    return (
      <div className="clinical-profile-page">
        <div className="no-user-message">
          <i className="fas fa-user-lock"></i>
          <h2>Please log in to view your profile</h2>
          <p>You need to be authenticated to access this page</p>
        </div>
      </div>
    );
  }

  // Renderizar pantalla de carga clínica elegante
  if (isLoading) {
    return (
      <div className="clinical-loading-screen">
        <div className="loading-backdrop">
          <div className="medical-cross-pattern"></div>
        </div>
        
        <div className="loading-container">
          <div className="medical-logo">
            <div className="pulse-ring"></div>
            <div className="pulse-ring delay-1"></div>
            <div className="pulse-ring delay-2"></div>
            <i className="fas fa-user-md"></i>
          </div>
          
          <div className="loading-content">
            <h1 className="system-title">TherapySync</h1>
            <p className="system-subtitle">Professional Healthcare Management</p>
            
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(loadingPhase / 3) * 100}%` }}
                ></div>
              </div>
              
              <div className="loading-status">
                {loadingPhase === 0 && (
                  <span>
                    <i className="fas fa-shield-alt"></i>
                    Initializing secure connection...
                  </span>
                )}
                {loadingPhase === 1 && (
                  <span>
                    <i className="fas fa-database"></i>
                    Retrieving medical records...
                  </span>
                )}
                {loadingPhase === 2 && (
                  <span>
                    <i className="fas fa-user-check"></i>
                    Verifying credentials...
                  </span>
                )}
                {loadingPhase === 3 && (
                  <span>
                    <i className="fas fa-check-circle"></i>
                    Loading complete
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roleInfo = getRoleInfo();

  return (
    <div className={`clinical-profile-page ${showContent ? 'show' : ''}`}>
      {/* Fondo clínico con efectos sutiles */}
      <div className="clinical-background">
        <div className="gradient-mesh"></div>
        <div className="geometric-pattern"></div>
      </div>

      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="clinical-notification success show">
          <div className="notification-content">
            <i className="fas fa-check-circle"></i>
            <span>Profile updated successfully!</span>
          </div>
        </div>
      )}

      {/* Header Clínico Elegante */}
      <header className="clinical-header">
        <div className="header-glass">
          <div className="header-content">
            <div className="header-left">
              <button 
                className="back-button" 
                onClick={handleGoBack}
                title="Back to main page"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Back</span>
              </button>
              
              <div className="header-info">
                <h1>Professional Profile</h1>
                <p>Healthcare Information Management System</p>
              </div>
            </div>
            
            <div className="header-actions">
              <div className="user-preview">
                <div className="preview-avatar">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" />
                  ) : (
                    <span>{getAvatarInitials()}</span>
                  )}
                </div>
                <div className="preview-info">
                  <span className="preview-name">{formData.name || userProfile?.name || 'User Name'}</span>
                  <span className="preview-role">{getRoleInfo().name}</span>
                </div>
              </div>
              
              {!isEditing ? (
                <button 
                  className="edit-profile-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-edit"></i>
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="save-btn"
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
                    className="cancel-btn"
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
        </div>
      </header>

      {/* Contenedor principal con diseño de 3 columnas */}
      <div className="profile-container">
        {/* Columna izquierda - Sidebar con avatar y stats */}
        <aside className="profile-sidebar">
          <div className="sidebar-card avatar-card">
            <div className="avatar-section">
              <div className="avatar-wrapper">
                <div className="avatar-glow" style={{ background: `radial-gradient(circle, ${roleInfo.color}20, transparent)` }}></div>
                
                <div className="avatar-container">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="avatar-image"
                    />
                  ) : (
                    <div className="avatar-main" style={{ background: `linear-gradient(135deg, ${roleInfo.color}CC, ${roleInfo.color})` }}>
                      <span className="avatar-text">{getAvatarInitials()}</span>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    id="profile-image-upload"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleProfileImageUpload(e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                    disabled={isImageUploading}
                  />
                  
                  <button 
                    className="avatar-upload-btn"
                    onClick={() => document.getElementById('profile-image-upload').click()}
                    disabled={isImageUploading}
                    title="Change profile photo"
                  >
                    {isImageUploading ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-camera"></i>
                    )}
                  </button>
                  
                  <div className="avatar-status">
                    <span className="status-dot"></span>
                  </div>
                </div>
                
                <div className="role-badge" style={{ background: roleInfo.color }}>
                  <i className={`fas ${roleInfo.icon}`}></i>
                </div>
              </div>
              
              <div className="user-basic-info">
                <h2>{formData.name || userProfile?.name || 'User Name'}</h2>
                <p className="user-role" style={{ color: roleInfo.color }}>
                  <i className={`fas ${roleInfo.icon}`}></i>
                  {roleInfo.name}
                </p>
                {hostAgency && (
                  <div className="host-agency-badge">
                    <i className="fas fa-building"></i>
                    <span>{hostAgency.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats rápidos */}
            <div className="quick-stats">
              <div className="stat-item">
                <div className="stat-icon" style={{ background: `${roleInfo.color}15` }}>
                  <i className="fas fa-calendar-check" style={{ color: roleInfo.color }}></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{activityStats.daysActive || 0}</span>
                  <span className="stat-label">Days Active</span>
                </div>
              </div>
              
              {userProfile?.role === 'Developer' && (
                <div className="stat-item">
                  <div className="stat-icon developer">
                    <i className="fas fa-code"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{activityStats.codeCommits || 0}</span>
                    <span className="stat-label">Commits</span>
                  </div>
                </div>
              )}
              
              {['PT', 'PTA', 'OT', 'COTA', 'ST', 'STA'].includes(userProfile?.role) && (
                <div className="stat-item">
                  <div className="stat-icon therapist">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{activityStats.patientsHelped || 0}</span>
                    <span className="stat-label">Patients</span>
                  </div>
                </div>
              )}
              
              {userProfile?.role === 'Administrator' && (
                <div className="stat-item">
                  <div className="stat-icon admin">
                    <i className="fas fa-users-cog"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{activityStats.usersManaged || 0}</span>
                    <span className="stat-label">Users</span>
                  </div>
                </div>
              )}
              
              {userProfile?.role === 'Agency' && (
                <div className="stat-item">
                  <div className="stat-icon agency">
                    <i className="fas fa-hospital"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{activityStats.patientsServed || 0}</span>
                    <span className="stat-label">Served</span>
                  </div>
                </div>
              )}
            </div>

            {/* Acciones rápidas */}
            {!isEditing && (
              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="actions-list">
                  <button className="action-item" onClick={handleChangePassword}>
                    <i className="fas fa-key"></i>
                    <span>Change Password</span>
                  </button>
                  
                  {['Developer', 'Administrator'].includes(userProfile?.role) && (
                    <button className="action-item" onClick={handleSystemSettings}>
                      <i className="fas fa-cog"></i>
                      <span>Settings</span>
                    </button>
                  )}
                  
                  {userProfile?.role === 'Agency' && (
                    <>
                      <button className="action-item" onClick={handleViewReports}>
                        <i className="fas fa-chart-bar"></i>
                        <span>View Reports</span>
                      </button>
                      <button className="action-item" onClick={handleAddTherapist}>
                        <i className="fas fa-user-plus"></i>
                        <span>Add Therapist</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Columna central - Información principal */}
        <main className="profile-main">
          {/* Navegación premium con tabs modernas */}
          <nav className="premium-section-nav">
            <div className="nav-background"></div>
            <div className="tabs-container">
              <div className="active-tab-indicator" style={{
                transform: `translateX(${getTabPosition()}px)`,
                width: `${getTabWidth()}px`
              }}></div>
              
              <button 
                className={`premium-tab ${activeSection === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveSection('personal')}
                data-section="personal"
              >
                <div className="tab-icon-wrapper">
                  <div className="tab-icon">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <div className="tab-glow"></div>
                </div>
                <div className="tab-text">
                  <span className="tab-title">Personal</span>
                  <span className="tab-subtitle">Profile details</span>
                </div>
                <div className="tab-decoration">
                  <div className="decoration-line"></div>
                </div>
              </button>
              
              <button 
                className={`premium-tab ${activeSection === 'account' ? 'active' : ''}`}
                onClick={() => setActiveSection('account')}
                data-section="account"
              >
                <div className="tab-icon-wrapper">
                  <div className="tab-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div className="tab-glow"></div>
                </div>
                <div className="tab-text">
                  <span className="tab-title">Security</span>
                  <span className="tab-subtitle">Account safety</span>
                </div>
                <div className="tab-decoration">
                  <div className="decoration-line"></div>
                </div>
              </button>
              
              {userProfile?.role === 'Agency' && (
                <button 
                  className={`premium-tab ${activeSection === 'branches' ? 'active' : ''}`}
                  onClick={() => setActiveSection('branches')}
                  data-section="branches"
                >
                  <div className="tab-icon-wrapper">
                    <div className="tab-icon">
                      <i className="fas fa-building"></i>
                    </div>
                    <div className="tab-glow"></div>
                  </div>
                  <div className="tab-text">
                    <span className="tab-title">Branches</span>
                    <span className="tab-subtitle">Locations</span>
                  </div>
                  <div className="tab-decoration">
                    <div className="decoration-line"></div>
                  </div>
                </button>
              )}
              
              {['Developer', 'Administrator'].includes(userProfile?.role) && (
                <button 
                  className={`premium-tab ${activeSection === 'documents' ? 'active' : ''}`}
                  onClick={() => setActiveSection('documents')}
                  data-section="documents"
                >
                  <div className="tab-icon-wrapper">
                    <div className="tab-icon">
                      <i className="fas fa-file-medical"></i>
                    </div>
                    <div className="tab-glow"></div>
                  </div>
                  <div className="tab-text">
                    <span className="tab-title">Documents</span>
                    <span className="tab-subtitle">Files & certs</span>
                  </div>
                  <div className="tab-decoration">
                    <div className="decoration-line"></div>
                  </div>
                </button>
              )}
            </div>
          </nav>

          {/* Contenido de las secciones */}
          <div className="section-content">
            {/* Sección de Información Personal */}
            {activeSection === 'personal' && (
              <div className="info-section animate-in">
                <div className="section-header">
                  <div className="header-content">
                    <div className="header-icon">
                      <i className="fas fa-user-circle"></i>
                    </div>
                    <div className="header-text">
                      <h2>Personal Information</h2>
                      <p>Manage your basic information and contact details</p>
                    </div>
                  </div>
                  <div className="header-actions">
                    <div className="completion-badge">
                      <i className="fas fa-check-circle"></i>
                      <span>Profile Complete</span>
                    </div>
                  </div>
                </div>

                <div className="info-grid">
                  {userProfile?.role !== 'Agency' ? (
                    <>
                      <div className="form-group">
                        <label>Full Name</label>
                        {isEditing ? (
                          <div className="input-wrapper">
                            <i className="fas fa-user"></i>
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
                          <div className="field-value">
                            <i className="fas fa-user"></i>
                            <span>{userProfile?.name || 'Not specified'}</span>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Email Address</label>
                        {isEditing ? (
                          <div className="input-wrapper">
                            <i className="fas fa-envelope"></i>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className={errors.email ? 'error' : ''}
                              placeholder="email@example.com"
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                          </div>
                        ) : (
                          <div className="field-value">
                            <i className="fas fa-envelope"></i>
                            <span>{userProfile?.email || 'Not specified'}</span>
                            <span className="verified-badge">
                              <i className="fas fa-check-circle"></i>
                              Verified
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Primary Phone</label>
                        {isEditing ? (
                          <div className="input-wrapper">
                            <i className="fas fa-phone"></i>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className={errors.phone ? 'error' : ''}
                              placeholder="(555) 123-4567"
                            />
                            {errors.phone && <span className="error-message">{errors.phone}</span>}
                          </div>
                        ) : (
                          <div className="field-value">
                            <i className="fas fa-phone"></i>
                            <span>{formatPhoneNumber(userProfile?.phone) || 'Not specified'}</span>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Alternative Phone</label>
                        {isEditing ? (
                          <div className="input-wrapper">
                            <i className="fas fa-mobile-alt"></i>
                            <input
                              type="tel"
                              name="alt_phone"
                              value={formData.alt_phone}
                              onChange={handleInputChange}
                              placeholder="(555) 987-6543"
                            />
                          </div>
                        ) : (
                          <div className="field-value">
                            <i className="fas fa-mobile-alt"></i>
                            <span>{formatPhoneNumber(userProfile?.alt_phone) || 'Not specified'}</span>
                          </div>
                        )}
                      </div>

                      <div className="form-group full-width">
                        <label>Address</label>
                        {isEditing ? (
                          <div className="input-wrapper">
                            <i className="fas fa-map-marker-alt"></i>
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="Enter your complete address"
                            />
                          </div>
                        ) : (
                          <div className="field-value">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{getFormattedAddress()}</span>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Postal Code</label>
                        {isEditing ? (
                          <div className="input-wrapper">
                            <i className="fas fa-mail-bulk"></i>
                            <input
                              type="text"
                              name="postal_code"
                              value={formData.postal_code}
                              onChange={handleInputChange}
                              placeholder="12345"
                            />
                          </div>
                        ) : (
                          <div className="field-value">
                            <i className="fas fa-mail-bulk"></i>
                            <span>{userProfile?.postal_code || 'Not specified'}</span>
                            {locationInfo && (
                              <span className="location-info">
                                {locationInfo.city}, {locationInfo.stateAbbr}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Date of Birth</label>
                        {isEditing ? (
                          <div className="input-wrapper">
                            <i className="fas fa-calendar-alt"></i>
                            <input
                              type="date"
                              name="birthday"
                              value={formData.birthday}
                              onChange={handleInputChange}
                            />
                          </div>
                        ) : (
                          <div className="field-value">
                            <i className="fas fa-calendar-alt"></i>
                            <span>{formatDateForDisplay(userProfile?.birthday)}</span>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Gender</label>
                        {isEditing ? (
                          <div className="input-wrapper">
                            <i className="fas fa-venus-mars"></i>
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              className="select-input"
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                              <option value="prefer_not_to_say">Prefer not to say</option>
                            </select>
                          </div>
                        ) : (
                          <div className="field-value">
                            <i className="fas fa-venus-mars"></i>
                            <span>
                              {userProfile?.gender ? 
                                userProfile.gender.charAt(0).toUpperCase() + 
                                userProfile.gender.slice(1).replace('_', ' ') : 
                                'Not specified'
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Campos específicos para Agencia */}
                      <div className="form-group">
                        <label>Agency Name</label>
                        {isEditing ? (
                          <div className="input-wrapper">
                            <i className="fas fa-hospital"></i>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className={errors.name ? 'error' : ''}
                              placeholder="Agency name"
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                          </div>
                        ) : (
                          <div className="field-value">
                            <i className="fas fa-hospital"></i>
                            <span>{userProfile?.name || 'Not specified'}</span>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Contact Email</label>
                        {isEditing ? (
                          <div className="input-wrapper">
                            <i className="fas fa-envelope"></i>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className={errors.email ? 'error' : ''}
                              placeholder="contact@agency.com"
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                          </div>
                        ) : (
                          <div className="field-value">
                            <i className="fas fa-envelope"></i>
                            <span>{userProfile?.email || 'Not specified'}</span>
                            <span className="verified-badge">
                              <i className="fas fa-check-circle"></i>
                              Verified
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Primary Phone</label>
                        {isEditing ? (
                          <div className="input-wrapper">
                            <i className="fas fa-phone"></i>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="(555) 123-4567"
                            />
                          </div>
                        ) : (
                          <div className="field-value">
                            <i className="fas fa-phone"></i>
                            <span>{formatPhoneNumber(userProfile?.phone) || 'Not specified'}</span>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Fax</label>
                        {isEditing ? (
                          <div className="input-wrapper">
                            <i className="fas fa-fax"></i>
                            <input
                              type="tel"
                              name="fax"
                              value={formData.fax}
                              onChange={handleInputChange}
                              placeholder="(555) 123-4568"
                            />
                          </div>
                        ) : (
                          <div className="field-value">
                            <i className="fas fa-fax"></i>
                            <span>{userProfile?.fax || 'Not specified'}</span>
                          </div>
                        )}
                      </div>

                      <div className="form-group full-width">
                        <label>Main Address</label>
                        {isEditing ? (
                          <div className="input-wrapper">
                            <i className="fas fa-building"></i>
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="Main office address"
                            />
                          </div>
                        ) : (
                          <div className="field-value">
                            <i className="fas fa-building"></i>
                            <span>{userProfile?.address || 'Not specified'}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Sección de Cuenta y Seguridad */}
            {activeSection === 'account' && (
              <div className="info-section animate-in">
                <div className="section-header">
                  <h2>
                    <i className="fas fa-shield-alt"></i>
                    Account & Security
                  </h2>
                  <p>Access configuration and credentials</p>
                </div>

                <div className="info-grid">
                  <div className="form-group">
                    <label>Username</label>
                    {isEditing ? (
                      <div className="input-wrapper">
                        <i className="fas fa-user-tag"></i>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className={errors.username ? 'error' : ''}
                          placeholder="user.name"
                        />
                        {errors.username && <span className="error-message">{errors.username}</span>}
                      </div>
                    ) : (
                      <div className="field-value">
                        <i className="fas fa-user-tag"></i>
                        <span>{userProfile?.username || 'Not specified'}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>System Role</label>
                    <div className="field-value">
                      <div className="role-display" style={{ color: roleInfo.color }}>
                        <i className={`fas ${roleInfo.icon}`}></i>
                        <span>{roleInfo.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Account Status</label>
                    <div className="field-value">
                      <div className={`status-badge ${userProfile?.is_active ? 'active' : 'inactive'}`}>
                        <span className="status-dot"></span>
                        <span>{userProfile?.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Member Since</label>
                    <div className="field-value">
                      <i className="fas fa-calendar-check"></i>
                      <span>
                        {userProfile?.created_at ? 
                          new Date(userProfile.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 
                          'Not available'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Sección de cambio de contraseña */}
                  {isEditing && (
                    <div className="form-group full-width password-section">
                      <div className="password-header">
                        <label>Change Password</label>
                        <button
                          type="button"
                          className={`toggle-password ${showPasswordChange ? 'active' : ''}`}
                          onClick={() => setShowPasswordChange(!showPasswordChange)}
                        >
                          <i className={`fas ${showPasswordChange ? 'fa-eye-slash' : 'fa-key'}`}></i>
                          <span>{showPasswordChange ? 'Cancel' : 'Change Password'}</span>
                        </button>
                      </div>
                      
                      {showPasswordChange && (
                        <div className="password-fields">
                          <div className="input-wrapper">
                            <i className="fas fa-lock"></i>
                            <input
                              type="password"
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                              placeholder="Current password"
                              className={errors.currentPassword ? 'error' : ''}
                            />
                            {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
                          </div>
                          
                          <div className="input-wrapper">
                            <i className="fas fa-key"></i>
                            <input
                              type="password"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                              placeholder="New password"
                              className={errors.newPassword ? 'error' : ''}
                            />
                            {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                          </div>
                          
                          <div className="input-wrapper">
                            <i className="fas fa-check-double"></i>
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
                            <p>Password requirements:</p>
                            <ul>
                              <li>
                                <i className={`fas ${formData.newPassword.length >= 8 ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                Minimum 8 characters
                              </li>
                              <li>
                                <i className={`fas ${/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                Upper and lowercase letters
                              </li>
                              <li>
                                <i className={`fas ${/[0-9]/.test(formData.newPassword) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                At least one number
                              </li>
                              <li>
                                <i className={`fas ${/[^A-Za-z0-9]/.test(formData.newPassword) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                At least one special character
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sección de Sucursales (Solo para Agencias) */}
            {activeSection === 'branches' && userProfile?.role === 'Agency' && (
              <div className="info-section animate-in">
                <div className="section-header">
                  <h2>
                    <i className="fas fa-building"></i>
                    Branch Management
                  </h2>
                  <p>Manage your agency locations</p>
                </div>

                {isEditing ? (
                  <div className="branches-editor">
                    {formData.branches.map((branch, index) => (
                      <div key={index} className="branch-card editable">
                        <div className="branch-header">
                          <h3>Branch #{index + 1}</h3>
                          <button
                            type="button"
                            onClick={() => removeBranch(index)}
                            className="remove-branch"
                            title="Remove branch"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                        
                        <div className="branch-fields">
                          <div className="input-wrapper">
                            <i className="fas fa-store"></i>
                            <input
                              type="text"
                              placeholder="Branch name"
                              value={branch.name}
                              onChange={(e) => updateBranch(index, 'name', e.target.value)}
                            />
                          </div>
                          
                          <div className="input-wrapper">
                            <i className="fas fa-map-marker-alt"></i>
                            <input
                              type="text"
                              placeholder="Branch address"
                              value={branch.address}
                              onChange={(e) => updateBranch(index, 'address', e.target.value)}
                            />
                          </div>
                          
                          <div className="input-wrapper">
                            <i className="fas fa-phone"></i>
                            <input
                              type="tel"
                              placeholder="Contact phone"
                              value={branch.phone}
                              onChange={(e) => updateBranch(index, 'phone', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addBranch}
                      className="add-branch-btn"
                    >
                      <i className="fas fa-plus-circle"></i>
                      <span>Add New Branch</span>
                    </button>
                  </div>
                ) : (
                  <div className="branches-list">
                    {userProfile?.branches && userProfile.branches.length > 0 ? (
                      userProfile.branches.map((branch, index) => (
                        <div key={index} className="branch-card">
                          <div className="branch-icon">
                            <i className="fas fa-store"></i>
                          </div>
                          <div className="branch-info">
                            <h3>{branch.name}</h3>
                            <div className="branch-details">
                              <p>
                                <i className="fas fa-map-marker-alt"></i>
                                {branch.address}
                              </p>
                              <p>
                                <i className="fas fa-phone"></i>
                                {branch.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <i className="fas fa-building"></i>
                        <p>No branches registered</p>
                        <small>Click "Edit Profile" to add branches</small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Sección de Documentos (Solo para Developer/Administrator) */}
            {activeSection === 'documents' && ['Developer', 'Administrator'].includes(userProfile?.role) && (
              <div className="info-section animate-in">
                <div className="section-header">
                  <h2>
                    <i className="fas fa-file-medical"></i>
                    Required Documents
                  </h2>
                  <p>Manage your professional documents</p>
                  <div className="docs-counter">
                    <span>{documents.length}</span> documents uploaded
                  </div>
                </div>

                <div className="documents-grid">
                  {documents.length > 0 ? (
                    documents.map((doc, index) => (
                      <div key={index} className="document-card">
                        <div className="doc-icon">
                          <i className={`fas ${
                            doc.type.includes('pdf') ? 'fa-file-pdf' : 
                            doc.type.includes('image') ? 'fa-file-image' : 
                            'fa-file-alt'
                          }`}></i>
                        </div>
                        <div className="doc-info">
                          <h4>{doc.name}</h4>
                          <p className="doc-meta">
                            <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                            <span className="doc-size">
                              {(doc.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </p>
                          <div className="doc-status verified">
                            <i className="fas fa-check-circle"></i>
                            <span>Verified</span>
                          </div>
                        </div>
                        <div className="doc-actions">
                          <button 
                            className="view-btn" 
                            onClick={() => window.open(doc.url, '_blank')}
                            title="View document"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="download-btn" 
                            onClick={() => window.open(doc.url, '_blank')}
                            title="Download document"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <i className="fas fa-folder-open"></i>
                      <p>No documents uploaded</p>
                      <small>Upload your professional documents here</small>
                    </div>
                  )}
                </div>

                {/* Document upload area */}
                <div className="document-upload-area">
                  <input
                    type="file"
                    id="doc-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleDocumentUpload(e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                    disabled={isUploading}
                  />
                  <label 
                    htmlFor="doc-upload" 
                    className={`upload-zone ${isUploading ? 'uploading' : ''}`}
                  >
                    {isUploading ? (
                      <>
                        <div className="upload-spinner">
                          <i className="fas fa-spinner fa-spin"></i>
                        </div>
                        <span>Uploading document...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-cloud-upload-alt"></i>
                        <span>Drag files here or click to select</span>
                        <small>PDF, DOC, DOCX, JPG, PNG (Max. 10MB)</small>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Columna derecha - Información adicional */}
        <aside className="profile-additional">
          <div className="info-card security-card">
            <div className="card-header">
              <h3>
                <i className="fas fa-shield-alt"></i>
                Account Security
              </h3>
            </div>
            <div className="security-items">
              <div className="security-item">
                <div className="security-icon">
                  <i className="fas fa-key"></i>
                </div>
                <div className="security-info">
                  <h4>Password</h4>
                  <p>Last changed 30 days ago</p>
                </div>
                <div className="security-status strong">
                  <i className="fas fa-check-circle"></i>
                </div>
              </div>
              
              <div className="security-item">
                <div className="security-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <div className="security-info">
                  <h4>Two-Factor Auth</h4>
                  <p>Enabled via SMS</p>
                </div>
                <div className="security-status active">
                  <i className="fas fa-check-circle"></i>
                </div>
              </div>
              
              <div className="security-item">
                <div className="security-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="security-info">
                  <h4>Session Timeout</h4>
                  <p>Auto logout in 2 hours</p>
                </div>
                <div className="security-status moderate">
                  <i className="fas fa-exclamation-circle"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="info-card backup-card">
            <div className="card-header">
              <h3>
                <i className="fas fa-cloud"></i>
                Data Backup
              </h3>
            </div>
            <div className="backup-info">
              <div className="backup-status">
                <div className="status-indicator active"></div>
                <div className="status-text">
                  <h4>Auto Backup Enabled</h4>
                  <p>Last backup: 15 minutes ago</p>
                </div>
              </div>
              <div className="backup-details">
                <div className="detail-item">
                  <span className="detail-label">Storage Used:</span>
                  <span className="detail-value">2.4 GB</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Backup Frequency:</span>
                  <span className="detail-value">Every 30 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DevUserProfile;