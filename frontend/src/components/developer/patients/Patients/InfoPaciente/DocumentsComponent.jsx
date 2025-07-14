import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../../login/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFile, faFileAlt, faFilePdf, faFileImage, faFileArchive, 
  faFileExcel, faFilePowerpoint, faFileWord, faFileCode, faFileVideo,
  faDownload, faTrashAlt, faEye, faPlus, faUpload,
  faTimes, faCheck, faInfoCircle, faSpinner,
  faFolder, faFolderOpen, faCloudUploadAlt, faFileMedical, faCalendarAlt, faClock, faFileSignature, faShieldAlt,
  faExclamationTriangle, faCheckCircle, faTimesCircle, faArrowRight,
  faExpand, faCompress, faTag, faStar,
  faLock, faUnlock
} from '@fortawesome/free-solid-svg-icons';
import '../../../../../styles/developer/Patients/InfoPaciente/DocumentsComponent.scss';

const DocumentsComponent = ({ patient, onUpdateDocuments }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [hoveredDocument, setHoveredDocument] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentStats, setDocumentStats] = useState({
    total: 0,
    byCategory: {},
    totalSize: 0,
    recentUploads: 0
  });
  
  // Refs
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  
  // API Configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  // ============================================================================
  // CONSTANTS AND CONFIGURATION
  // ============================================================================
  const categories = [
    { id: 'All', name: 'All Documents', icon: faFolder, color: '#6366f1' },
    { id: 'Medical Reports', name: 'Medical Reports', icon: faFileMedical, color: '#ef4444' },
    { id: 'Assessments', name: 'Assessments', icon: faFileSignature, color: '#f59e0b' },
    { id: 'Progress Notes', name: 'Progress Notes', icon: faFileAlt, color: '#10b981' },
    { id: 'Insurance', name: 'Insurance', icon: faShieldAlt, color: '#3b82f6' },
    { id: 'Prescriptions', name: 'Prescriptions', icon: faFileMedical, color: '#8b5cf6' },
    { id: 'Discharge Forms', name: 'Discharge Forms', icon: faFileSignature, color: '#06b6d4' },
    { id: 'Lab Results', name: 'Lab Results', icon: faFile, color: '#f97316' },
    { id: 'Imaging', name: 'Imaging', icon: faFileImage, color: '#ec4899' },
    { id: 'Therapy Plans', name: 'Therapy Plans', icon: faFileAlt, color: '#84cc16' },
    { id: 'Other', name: 'Other', icon: faFile, color: '#6b7280' }
  ];

  // Tipos de archivo permitidos - ACTUALIZADO SEGÚN TU API
  const allowedFileTypes = {
    // Imágenes
    'image/jpeg': { ext: 'jpg', maxSize: 50 * 1024 * 1024 },
    'image/jpg': { ext: 'jpg', maxSize: 50 * 1024 * 1024 },
    'image/png': { ext: 'png', maxSize: 50 * 1024 * 1024 },
    'image/gif': { ext: 'gif', maxSize: 50 * 1024 * 1024 },
    'image/webp': { ext: 'webp', maxSize: 50 * 1024 * 1024 },
    
    // PDFs
    'application/pdf': { ext: 'pdf', maxSize: 50 * 1024 * 1024 },
    
    // Documentos de Office
    'application/msword': { ext: 'doc', maxSize: 50 * 1024 * 1024 },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', maxSize: 50 * 1024 * 1024 },
    'application/vnd.ms-excel': { ext: 'xls', maxSize: 50 * 1024 * 1024 },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: 'xlsx', maxSize: 50 * 1024 * 1024 },
    'application/vnd.ms-powerpoint': { ext: 'ppt', maxSize: 50 * 1024 * 1024 },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: 'pptx', maxSize: 50 * 1024 * 1024 },
    
    // Archivos de texto
    'text/plain': { ext: 'txt', maxSize: 50 * 1024 * 1024 },
    'text/csv': { ext: 'csv', maxSize: 50 * 1024 * 1024 },
    
    // Videos (si los soporta tu API)
    'video/mp4': { ext: 'mp4', maxSize: 50 * 1024 * 1024 },
    'video/quicktime': { ext: 'mov', maxSize: 50 * 1024 * 1024 },
    
    // Audio (si los soporta tu API)
    'audio/mpeg': { ext: 'mp3', maxSize: 50 * 1024 * 1024 },
    'audio/wav': { ext: 'wav', maxSize: 50 * 1024 * 1024 }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  const getCurrentUser = useCallback(() => {
    if (!currentUser) {
      return {
        name: 'Unknown User',
        fullname: 'Unknown User',
        username: 'unknown',
        role: 'User',
        id: 1
      };
    }
    return currentUser;
  }, [currentUser]);

  const getFileIcon = useCallback((fileType) => {
    const type = fileType?.toLowerCase() || '';
    
    const iconMap = {
      'pdf': { icon: faFilePdf, color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
      'jpg': { icon: faFileImage, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
      'jpeg': { icon: faFileImage, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
      'png': { icon: faFileImage, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
      'gif': { icon: faFileImage, color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
      'doc': { icon: faFileWord, color: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
      'docx': { icon: faFileWord, color: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
      'xls': { icon: faFileExcel, color: '#059669', gradient: 'linear-gradient(135deg, #059669, #047857)' },
      'xlsx': { icon: faFileExcel, color: '#059669', gradient: 'linear-gradient(135deg, #059669, #047857)' },
      'ppt': { icon: faFilePowerpoint, color: '#ea580c', gradient: 'linear-gradient(135deg, #ea580c, #c2410c)' },
      'pptx': { icon: faFilePowerpoint, color: '#ea580c', gradient: 'linear-gradient(135deg, #ea580c, #c2410c)' },
      'zip': { icon: faFileArchive, color: '#7c2d12', gradient: 'linear-gradient(135deg, #7c2d12, #6b1f0f)' },
      'rar': { icon: faFileArchive, color: '#7c2d12', gradient: 'linear-gradient(135deg, #7c2d12, #6b1f0f)' },
      'txt': { icon: faFileAlt, color: '#6b7280', gradient: 'linear-gradient(135deg, #6b7280, #4b5563)' },
      'mp4': { icon: faFileVideo, color: '#dc2626', gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
      'mov': { icon: faFileVideo, color: '#dc2626', gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
      'mp3': { icon: faFileVideo, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
      'wav': { icon: faFileVideo, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
      'js': { icon: faFileCode, color: '#fbbf24', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
      'html': { icon: faFileCode, color: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
      'css': { icon: faFileCode, color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
      'json': { icon: faFileCode, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' }
    };

    return iconMap[type] || { icon: faFileAlt, color: '#6b7280', gradient: 'linear-gradient(135deg, #6b7280, #4b5563)' };
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${size} ${sizes[i]}`;
  }, []);

  const formatDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.abs(now - date) / 36e5;
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60);
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      } else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  }, []);

  const validateFile = useCallback((file) => {
    const errors = [];
    
    console.log('Validating file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeFormatted: formatFileSize(file.size)
    });
    
    // Check file type
    if (!allowedFileTypes[file.type]) {
      errors.push(`File type "${file.type}" is not supported.\nSupported types: PDF, Images (JPG, PNG, GIF, WEBP), Documents (DOC, DOCX, XLS, XLSX, PPT, PPTX), Text files (TXT, CSV), Videos (MP4, MOV), Audio (MP3, WAV).`);
    } else {
      // Check file size - 50MB limit for all files
      const maxSize = allowedFileTypes[file.type].maxSize;
      if (file.size > maxSize) {
        errors.push(`File size (${formatFileSize(file.size)}) exceeds the ${formatFileSize(maxSize)} limit.`);
      }
    }
    
    // Check file name
    if (file.name.length > 255) {
      errors.push('File name is too long (max 255 characters)');
    }
    
    // Check for empty files
    if (file.size === 0) {
      errors.push('File is empty');
    }

    // Check for special characters in filename that might cause issues
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(file.name)) {
      errors.push('File name contains invalid characters. Please rename the file.');
    }
    
    return errors;
  }, [formatFileSize]);

  const getCategoryInfo = useCallback((categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories[categories.length - 1];
  }, []);

  const getCategoryFromFileName = useCallback((fileName) => {
    if (!fileName) return 'Other';
    
    const name = fileName.toLowerCase();
    
    if (name.includes('medical') || name.includes('report')) return 'Medical Reports';
    if (name.includes('assessment')) return 'Assessments';
    if (name.includes('progress') || name.includes('note')) return 'Progress Notes';
    if (name.includes('insurance')) return 'Insurance';
    if (name.includes('prescription') || name.includes('medication')) return 'Prescriptions';
    if (name.includes('discharge')) return 'Discharge Forms';
    if (name.includes('lab') || name.includes('test')) return 'Lab Results';
    if (name.includes('image') || name.includes('scan') || name.includes('xray')) return 'Imaging';
    if (name.includes('therapy') || name.includes('plan')) return 'Therapy Plans';
    
    return 'Other';
  }, []);

  const calculateStats = useCallback((docs) => {
    const stats = {
      total: docs.length,
      byCategory: {},
      totalSize: 0,
      recentUploads: 0
    };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    docs.forEach(doc => {
      // Category count
      const category = getCategoryFromFileName(doc.file_name) || 'Other';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      
      // Total size - placeholder since API doesn't return file size
      stats.totalSize += 1024 * 1024; // 1MB placeholder per file
      
      // Recent uploads
      if (new Date(doc.uploaded_at) > oneWeekAgo) {
        stats.recentUploads++;
      }
    });

    return stats;
  }, [getCategoryFromFileName]);

  // ============================================================================
  // API FUNCTIONS - CORREGIDAS PARA MANEJAR ERRORES 400
  // ============================================================================
  
  // Fetch documents from API - CORREGIDO PARA USAR QUERY PARAMETERS
  const fetchDocuments = useCallback(async () => {
    if (!patient?.id) {
      console.log('No patient ID available, showing empty state');
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // USAR QUERY PARAMETERS en lugar de endpoint sin filtros
      const url = `${API_BASE_URL}/documents/?patient_id=${patient.id}`;
      console.log(`Fetching documents for patient ${patient.id} from: ${url}`);
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        });
        
        console.log('Documents fetch response:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (response.ok) {
          const documentsData = await response.json();
          console.log('Raw documents data received:', documentsData);
          
          // Validar que sea un array
          if (!Array.isArray(documentsData)) {
            console.warn('Documents data is not an array:', typeof documentsData, documentsData);
            setDocuments([]);
            return;
          }
          
          // Como ya filtramos por patient_id en la URL, no necesitamos filtrar aquí
          console.log(`Found ${documentsData.length} documents for patient ${patient.id}`);
          setDocuments(documentsData);
          
        } else if (response.status === 404) {
          console.log('Documents endpoint not found (404) - showing empty state');
          setDocuments([]);
        } else if (response.status === 400) {
          // Handle 400 Bad Request - puede ser que el endpoint no soporte query params
          console.log('400 Bad Request - trying alternative endpoint approach');
          
          try {
            // Intentar sin query parameters y filtrar en el frontend
            const fallbackResponse = await fetch(`${API_BASE_URL}/documents/`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
            });
            
            if (fallbackResponse.ok) {
              const allDocuments = await fallbackResponse.json();
              if (Array.isArray(allDocuments)) {
                const patientDocuments = allDocuments.filter(doc => doc.patient_id === patient.id);
                console.log(`Fallback: Found ${patientDocuments.length} documents for patient ${patient.id}`);
                setDocuments(patientDocuments);
              } else {
                console.log('Fallback also failed, showing empty state');
                setDocuments([]);
              }
            } else {
              console.log('Fallback endpoint also failed, showing empty state');
              setDocuments([]);
            }
          } catch (fallbackError) {
            console.log('Fallback request failed, showing empty state:', fallbackError);
            setDocuments([]);
          }
        } else {
          // Otros errores HTTP
          let errorDetail = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.message || errorDetail;
            console.error('Fetch error details:', errorData);
          } catch (e) {
            errorDetail = `${response.status} ${response.statusText}`;
          }
          throw new Error(errorDetail);
        }
        
      } catch (fetchError) {
        if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
          console.log('Network error - API might not be running, showing empty state');
          setDocuments([]);
        } else {
          throw fetchError;
        }
      }
      
    } catch (err) {
      console.error('Error in fetchDocuments:', err);
      // No mostrar error para problemas de fetch, solo mostrar empty state
      console.log('Fetch failed, showing empty state instead of error');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [patient?.id, API_BASE_URL]);

  // Upload document to API - CORREGIDO PARA MULTIPART/FORM-DATA
  const uploadDocumentToAPI = useCallback(async (file) => {
    if (!patient?.id) {
      throw new Error('Patient ID is required');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', patient.id.toString());

    console.log('Uploading document with data:', {
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      fileType: file.type,
      patientId: patient.id,
      endpoint: `${API_BASE_URL}/documents/upload`
    });

    // Debug FormData content
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
        // IMPORTANTE: NO establecer Content-Type para FormData
        // El browser establece automáticamente multipart/form-data con boundary
      });

      console.log('Upload response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        let errorMessage = `Upload failed (HTTP ${response.status})`;
        try {
          const errorData = await response.json();
          console.error('Upload error details:', errorData);
          
          // Mostrar errores específicos de validación
          if (errorData.detail && Array.isArray(errorData.detail)) {
            const validationErrors = errorData.detail.map(err => 
              `${err.loc?.join('.')} - ${err.msg}`
            ).join('\n');
            errorMessage = `Validation errors:\n${validationErrors}`;
          } else {
            errorMessage = errorData.detail || errorData.message || errorMessage;
          }
        } catch (e) {
          try {
            const errorText = await response.text();
            console.error('Upload error text:', errorText);
            errorMessage = errorText || errorMessage;
          } catch (e2) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Upload successful, received:', result);
      return result;
      
    } catch (error) {
      console.error('Upload request failed:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }, [patient?.id, API_BASE_URL, formatFileSize]);

  // Delete document from API - MEJORADO
  const deleteDocumentFromAPI = useCallback(async (documentId) => {
    try {
      console.log(`Attempting to delete document ${documentId} from: ${API_BASE_URL}/documents/${documentId}`);
      
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      console.log('Delete response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        let errorMessage = `Delete failed (HTTP ${response.status})`;
        try {
          const errorData = await response.json();
          console.error('Delete error details:', errorData);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      console.log('Document deleted successfully');
      return true;
    } catch (error) {
      console.error('Delete request failed:', error);
      throw error;
    }
  }, [API_BASE_URL]);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    const stats = calculateStats(documents);
    setDocumentStats(stats);
  }, [documents, calculateStats]);

  // ============================================================================
  // SUCCESS NOTIFICATION CLEANUP
  // ============================================================================
  useEffect(() => {
    let timer;
    if (uploadSuccess) {
      timer = setTimeout(() => setUploadSuccess(false), 4000);
    }
    return () => clearTimeout(timer);
  }, [uploadSuccess]);

  useEffect(() => {
    let timer;
    if (deleteSuccess) {
      timer = setTimeout(() => setDeleteSuccess(false), 4000);
    }
    return () => clearTimeout(timer);
  }, [deleteSuccess]);

  useEffect(() => {
    let timer;
    if (error) {
      timer = setTimeout(() => setError(null), 10000); // 10 segundos para errores
    }
    return () => clearTimeout(timer);
  }, [error]);

  // ============================================================================
  // FILE UPLOAD HANDLERS
  // ============================================================================
  const handleFileUploadClick = useCallback(() => {
    if (!patient?.id) {
      setError('Patient information is required to upload documents.');
      return;
    }
    fileInputRef.current?.click();
  }, [patient?.id]);

  const handleFileSelected = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const file = files[0];
    const validationErrors = validateFile(file);
    
    if (validationErrors.length > 0) {
      setError(`Upload validation failed:\n${validationErrors.join('\n')}`);
      return;
    }
    
    handleDirectUpload(file);
    e.target.value = null;
  }, [validateFile]);

  const handleDirectUpload = useCallback(async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadingFileName(file.name);
    setError(null);
    
    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return Math.min(prev + Math.random() * 15, 90);
        });
      }, 300);
      
      // Make the actual upload
      const uploadResult = await uploadDocumentToAPI(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Show completion
      setTimeout(async () => {
        setIsUploading(false);
        setUploadSuccess(true);
        setUploadingFileName('');
        setUploadProgress(0);
        
        console.log('Upload completed, refreshing documents list...');
        
        // Refresh documents list - con delay para que la DB se actualice
        setTimeout(async () => {
          await fetchDocuments();
          
          if (onUpdateDocuments) {
            onUpdateDocuments();
          }
        }, 500); // Esperar 500ms antes de refrescar
        
      }, 800);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadingFileName('');
      setError(error.message);
    }
  }, [uploadDocumentToAPI, fetchDocuments, onUpdateDocuments]);

  // ============================================================================
  // DRAG AND DROP HANDLERS
  // ============================================================================
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (patient?.id && !isUploading) {
      setDragActive(true);
    }
  }, [patient?.id, isUploading]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropZoneRef.current?.contains(e.relatedTarget)) {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (!patient?.id) {
      setError('Patient information is required to upload documents.');
      return;
    }
    
    if (isUploading) {
      setError('Please wait for the current upload to complete.');
      return;
    }
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    const file = files[0];
    const validationErrors = validateFile(file);
    
    if (validationErrors.length > 0) {
      setError(`Upload validation failed:\n${validationErrors.join('\n')}`);
      return;
    }
    
    handleDirectUpload(file);
  }, [validateFile, handleDirectUpload, patient?.id, isUploading]);

  // ============================================================================
  // DOCUMENT ACTIONS
  // ============================================================================
  const handleViewDocument = useCallback((document) => {
    try {
      const fileUrl = `${API_BASE_URL}${document.file_path}`;
      console.log('Opening document:', fileUrl);
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error opening document:', error);
      setError('Failed to open document');
    }
  }, [API_BASE_URL]);

  const handleDownload = useCallback((document) => {
    try {
      const fileUrl = `${API_BASE_URL}${document.file_path}`;
      console.log('Downloading document:', fileUrl);
      
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = document.file_name || 'download';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab
      const fileUrl = `${API_BASE_URL}${document.file_path}`;
      window.open(fileUrl, '_blank');
    }
  }, [API_BASE_URL]);

  const handleDeleteClick = useCallback((document) => {
    setSelectedDocument(document);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedDocument) return;
    
    const checkbox = document.getElementById('confirmDelete');
    if (!checkbox?.checked) {
      setError('Please confirm that you understand this action cannot be undone.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      await deleteDocumentFromAPI(selectedDocument.id);
      
      setIsDeleteModalOpen(false);
      setDeleteSuccess(true);
      setIsProcessing(false);
      setSelectedDocument(null);
      
      // Refresh documents list
      await fetchDocuments();
      
      if (onUpdateDocuments) {
        onUpdateDocuments();
      }
      
    } catch (error) {
      console.error('Delete failed:', error);
      setIsProcessing(false);
      setError(error.message);
    }
  }, [selectedDocument, deleteDocumentFromAPI, fetchDocuments, onUpdateDocuments]);

  // ============================================================================
  // BULK ACTIONS
  // ============================================================================
  const handleSelectDocument = useCallback((documentId, isSelected) => {
    const newSelected = new Set(selectedDocuments);
    if (isSelected) {
      newSelected.add(documentId);
    } else {
      newSelected.delete(documentId);
    }
    setSelectedDocuments(newSelected);
    setShowBulkActions(newSelected.size > 0);
  }, [selectedDocuments]);

  const handleSelectAll = useCallback(() => {
    const filteredDocs = filterDocuments();
    const allSelected = filteredDocs.every(doc => selectedDocuments.has(doc.id));
    
    if (allSelected) {
      setSelectedDocuments(new Set());
      setShowBulkActions(false);
    } else {
      const newSelected = new Set(filteredDocs.map(doc => doc.id));
      setSelectedDocuments(newSelected);
      setShowBulkActions(true);
    }
  }, [selectedDocuments]);

  const handleBulkDownload = useCallback(() => {
    const selectedDocs = documents.filter(doc => selectedDocuments.has(doc.id));
    selectedDocs.forEach((doc, index) => {
      setTimeout(() => handleDownload(doc), index * 100);
    });
    setSelectedDocuments(new Set());
    setShowBulkActions(false);
  }, [selectedDocuments, documents, handleDownload]);

  const handleBulkDelete = useCallback(async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedDocuments.size} documents? This action cannot be undone.`)) {
      setIsProcessing(true);
      setError(null);
      
      try {
        const selectedDocs = documents.filter(doc => selectedDocuments.has(doc.id));
        
        for (const doc of selectedDocs) {
          await deleteDocumentFromAPI(doc.id);
        }
        
        setSelectedDocuments(new Set());
        setShowBulkActions(false);
        setDeleteSuccess(true);
        setIsProcessing(false);
        
        await fetchDocuments();
        
        if (onUpdateDocuments) {
          onUpdateDocuments();
        }
        
      } catch (error) {
        console.error('Bulk delete failed:', error);
        setIsProcessing(false);
        setError(`Failed to delete some documents: ${error.message}`);
      }
    }
  }, [selectedDocuments, documents, deleteDocumentFromAPI, fetchDocuments, onUpdateDocuments]);

  // ============================================================================
  // FILTERING AND SORTING
  // ============================================================================
  const filterDocuments = useCallback(() => {
    let filteredDocs = [...documents];
    
    if (selectedCategory !== 'All') {
      filteredDocs = filteredDocs.filter(doc => {
        const category = getCategoryFromFileName(doc.file_name);
        return category === selectedCategory;
      });
    }
    
    // Sort by upload date (newest first)
    filteredDocs.sort((a, b) => {
      const dateA = new Date(a.uploaded_at);
      const dateB = new Date(b.uploaded_at);
      return dateB - dateA;
    });
    
    return filteredDocs;
  }, [documents, selectedCategory, getCategoryFromFileName]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  const renderDocumentCard = useCallback((document, index) => {
    const fileName = document.file_name || 'Unknown File';
    const uploadDate = document.uploaded_at || new Date();
    const fileType = document.file_name ? 
      document.file_name.split('.').pop()?.toLowerCase() || 'unknown' : 
      'unknown';
    const category = getCategoryFromFileName(document.file_name);
    const uploadedBy = getCurrentUser().name; // Desde el contexto actual
    
    const fileIconInfo = getFileIcon(fileType);
    const categoryInfo = getCategoryInfo(category);
    const isSelected = selectedDocuments.has(document.id);
    const isHovered = hoveredDocument === document.id;

    return (
      <div 
        key={document.id}
        className={`document-card ${viewMode} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
        style={{ 
          animationDelay: `${index * 0.05}s`,
          '--category-color': categoryInfo.color
        }}
        onMouseEnter={() => setHoveredDocument(document.id)}
        onMouseLeave={() => setHoveredDocument(null)}
      >
        <div className="document-selector">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleSelectDocument(document.id, e.target.checked)}
            />
            <span className="checkmark">
              <FontAwesomeIcon icon={faCheck} />
            </span>
          </label>
        </div>

        <div className="document-icon-container">
          <div 
            className="document-icon"
            style={{ background: fileIconInfo.gradient }}
          >
            <FontAwesomeIcon icon={fileIconInfo.icon} />
          </div>
          <div className="file-type-badge">{fileType.toUpperCase()}</div>
        </div>

        <div className="document-details">
          <div className="document-name-row">
            <div className="document-name" title={fileName}>
              {fileName}
            </div>
            <div 
              className="document-category"
              style={{ 
                background: `${categoryInfo.color}15`,
                color: categoryInfo.color,
                borderColor: `${categoryInfo.color}30`
              }}
            >
              <FontAwesomeIcon icon={categoryInfo.icon} />
              {category}
            </div>
          </div>

          <div className="document-meta-grid">
            <div className="meta-item">
              <span className="meta-label">Uploaded by:</span>
              <span className="meta-value">{uploadedBy}</span>
            </div>
            <div className="meta-item">
              <FontAwesomeIcon icon={faCalendarAlt} className="meta-icon" />
              <span className="meta-label">Date:</span>
              <span className="meta-value">{formatDate(uploadDate)}</span>
            </div>
            <div className="meta-item">
              <FontAwesomeIcon icon={faFile} className="meta-icon" />
              <span className="meta-label">Document ID:</span>
              <span className="meta-value">#{document.id}</span>
            </div>
            {document.patient_id && (
              <div className="meta-item">
                <FontAwesomeIcon icon={faTag} className="meta-icon" />
                <span className="meta-label">Patient ID:</span>
                <span className="meta-value">{document.patient_id}</span>
              </div>
            )}
          </div>
        </div>

        <div className="document-actions">
          <div className="action-buttons-row">
            <button 
              className="action-btn view-btn" 
              onClick={() => handleViewDocument(document)}
              title="View Document"
            >
              <FontAwesomeIcon icon={faEye} />
              <span className="action-label">View</span>
              <div className="btn-shine"></div>
            </button>
            
            <button 
              className="action-btn download-btn" 
              onClick={() => handleDownload(document)}
              title="Download Document"
            >
              <FontAwesomeIcon icon={faDownload} />
              <span className="action-label">Download</span>
              <div className="btn-shine"></div>
            </button>
            
            <button 
              className="action-btn delete-btn" 
              onClick={() => handleDeleteClick(document)}
              title="Delete Document"
            >
              <FontAwesomeIcon icon={faTrashAlt} />
              <span className="action-label">Delete</span>
              <div className="btn-shine"></div>
            </button>
          </div>
          
          <div className="document-status-indicators">
            <span className="status-indicator recent" title="Recently Modified">
              <FontAwesomeIcon icon={faClock} />
            </span>
          </div>
        </div>

        <div className="card-overlay"></div>
      </div>
    );
  }, [
    viewMode, selectedDocuments, hoveredDocument, getFileIcon, getCategoryInfo,
    handleSelectDocument, handleViewDocument, handleDownload, handleDeleteClick,
    formatDate, getCategoryFromFileName, getCurrentUser
  ]);

  const renderEmptyState = useCallback(() => {
    const hasSearchOrFilter = selectedCategory !== 'All';
    
    return (
      <div className={`empty-state ${hasSearchOrFilter ? 'filtered' : 'initial'}`}>
        <div className="empty-state-content">
          <div className="empty-icon-container">
            <div className="empty-icon">
              <FontAwesomeIcon 
                icon={hasSearchOrFilter ? faFolder : faCloudUploadAlt} 
                className="main-icon"
              />
              {!hasSearchOrFilter && (
                <>
                  <div className="floating-icon icon-1">
                    <FontAwesomeIcon icon={faFilePdf} />
                  </div>
                  <div className="floating-icon icon-2">
                    <FontAwesomeIcon icon={faFileImage} />
                  </div>
                  <div className="floating-icon icon-3">
                    <FontAwesomeIcon icon={faFileWord} />
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="empty-text">
            <h3>
              {hasSearchOrFilter 
                ? 'No documents found' 
                : 'No documents uploaded yet'
              }
            </h3>
            <p>
              {hasSearchOrFilter 
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'Upload your first document to get started. Drag and drop files here or click the upload button.'
              }
            </p>
          </div>
          
          <div className="empty-actions">
            {hasSearchOrFilter ? (
              <button 
                className="secondary-btn"
                onClick={() => {
                  setSelectedCategory('All');
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
                Clear Filters
              </button>
            ) : (
              <button 
                className="primary-btn upload-btn"
                onClick={handleFileUploadClick}
                disabled={!patient?.id || isUploading}
              >
                <FontAwesomeIcon icon={isUploading ? faSpinner : faCloudUploadAlt} 
                  className={isUploading ? 'fa-spin' : ''} />
                {isUploading ? 'Uploading...' : 'Upload Document'}
              </button>
            )}
          </div>
          
          {!hasSearchOrFilter && (
            <div className="upload-hints">
              <div className="hint">
                <span>Drag & drop files anywhere</span>
              </div>
              <div className="hint">
                <FontAwesomeIcon icon={faShieldAlt} />
                <span>Secure encrypted storage</span>
              </div>
              <div className="hint">
                <FontAwesomeIcon icon={faCheck} />
                <span>Up to 50MB per file</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }, [selectedCategory, handleFileUploadClick, patient?.id, isUploading]);

  // ============================================================================
  // MAIN COMPONENT RENDER
  // ============================================================================
  const filteredDocuments = filterDocuments();

  if (isLoading) {
    return (
      <div className="documents-component loading-state">
        <div className="documents-header">
          <div className="header-content">
            <div className="header-left">
              <div className="header-icon-container">
                <div className="header-icon">
                  <FontAwesomeIcon icon={faFile} />
                </div>
              </div>
              <div className="header-text">
                <h2 className="header-title">Patient Documents</h2>
                <p className="header-subtitle">Loading documents...</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="loading-container">
          <div className="loading-spinner">
            <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
          </div>
          <p>Loading patient documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="documents-component premium-enhanced"
      ref={dropZoneRef}
      onDragOver={dragActive ? undefined : handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ======================== ERROR NOTIFICATION ======================== */}
      {error && (
        <div className="notification-container error enhanced">
          <div className="notification-icon-container">
            <div className="notification-icon">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
          </div>
          <div className="notification-content">
            <div className="notification-title">Error</div>
            <div className="notification-description" style={{ whiteSpace: 'pre-line' }}>
              {error}
            </div>
          </div>
          <button 
            className="notification-close" 
            onClick={() => setError(null)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      {/* ======================== MAIN HEADER ======================== */}
      <div className="documents-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon-container">
              <div className="header-icon">
                <FontAwesomeIcon icon={faFile} />
                <div className="icon-pulse"></div>
              </div>
              <div className="header-badge">
                {documentStats.total}
              </div>
            </div>
            <div className="header-text">
              <h2 className="header-title">Patient Documents</h2>
              <p className="header-subtitle">
                Manage and organize all patient-related documentation
                {patient?.full_name && ` for ${patient.full_name}`}
              </p>
            </div>
          </div>
          
          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-value">{documentStats.total}</div>
              <div className="stat-label">Total Files</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{formatFileSize(documentStats.totalSize)}</div>
              <div className="stat-label">Storage Used</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{documentStats.recentUploads}</div>
              <div className="stat-label">This Week</div>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="action-button upload-btn premium"
            onClick={handleFileUploadClick}
            disabled={isUploading || !patient?.id}
            title={!patient?.id ? 'Patient ID required to upload documents' : 'Upload new document'}
          >
            <div className="btn-icon">
              <FontAwesomeIcon icon={isUploading ? faSpinner : faCloudUploadAlt} 
                className={isUploading ? 'fa-spin' : ''} />
            </div>
            <span className="btn-text">
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </span>
            <div className="btn-gradient"></div>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileSelected}
            accept={Object.keys(allowedFileTypes).join(',')}
          />
        </div>
      </div>

      {/* ======================== TOOLBAR ======================== */}
      <div className="documents-toolbar enhanced">
        <div className="toolbar-left">
          <div className="view-mode-container">
            <button 
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <i className="fas fa-th"></i>
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <div className="category-filter">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} 
                  {category.id !== 'All' && documentStats.byCategory[category.id] ? 
                    ` (${documentStats.byCategory[category.id]})` : 
                    ''
                  }
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ======================== BULK ACTIONS BAR ======================== */}
      {showBulkActions && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>{selectedDocuments.size} document{selectedDocuments.size !== 1 ? 's' : ''} selected</span>
          </div>
          <div className="bulk-actions">
            <button 
              className="bulk-btn download" 
              onClick={handleBulkDownload}
              disabled={isProcessing}
            >
              <FontAwesomeIcon icon={faDownload} />
              Download All
            </button>
            <button 
              className="bulk-btn delete" 
              onClick={handleBulkDelete}
              disabled={isProcessing}
            >
              <FontAwesomeIcon icon={isProcessing ? faSpinner : faTrashAlt} 
                className={isProcessing ? 'fa-spin' : ''} />
              {isProcessing ? 'Deleting...' : 'Delete Selected'}
            </button>
            <button 
              className="bulk-btn cancel" 
              onClick={() => {
                setSelectedDocuments(new Set());
                setShowBulkActions(false);
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ======================== UPLOAD PROGRESS ======================== */}
      {isUploading && (
        <div className="upload-progress-container enhanced">
          <div className="upload-progress-card">
            <div className="upload-icon-container">
              <div className="upload-icon-bg">
                <FontAwesomeIcon icon={faCloudUploadAlt} className="upload-icon" />
              </div>
              <div className="upload-spinner">
                <div className="spinner-ring"></div>
              </div>
            </div>
            
            <div className="upload-details">
              <div className="upload-header">
                <h4>Uploading Document</h4>
                <span className="upload-percentage">{Math.round(uploadProgress)}%</span>
              </div>
              
              <div className="upload-file-info">
                <div className="file-name">{uploadingFileName}</div>
                <div className="upload-status">
                  {uploadProgress < 100 ? 'Uploading to server...' : 'Processing...'}
                </div>
              </div>
              
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    <div className="progress-shine"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================== SUCCESS NOTIFICATIONS ======================== */}
      {uploadSuccess && (
        <div className="notification-container success enhanced">
          <div className="notification-icon-container">
            <div className="notification-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className="success-ripple"></div>
          </div>
          <div className="notification-content">
            <div className="notification-title">Upload Successful!</div>
            <div className="notification-description">
              Your document has been securely uploaded and is now available.
            </div>
          </div>
          <button 
            className="notification-close" 
            onClick={() => setUploadSuccess(false)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
      
      {deleteSuccess && (
        <div className="notification-container delete enhanced">
          <div className="notification-icon-container">
            <div className="notification-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className="delete-ripple"></div>
          </div>
          <div className="notification-content">
            <div className="notification-title">Document Deleted</div>
            <div className="notification-description">
              The document has been permanently removed from the system.
            </div>
          </div>
          <button 
            className="notification-close" 
            onClick={() => setDeleteSuccess(false)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      {/* ======================== DRAG AND DROP OVERLAY ======================== */}
      {dragActive && patient?.id && !isUploading && (
        <div className="drag-drop-overlay">
          <div className="drag-drop-content">
            <div className="drag-icon">
              <FontAwesomeIcon icon={faCloudUploadAlt} />
            </div>
            <h3>Drop your files here</h3>
            <p>Release to upload instantly</p>
            <div className="supported-formats">
              <span>Supported: PDF, Images, Documents, Videos (up to 50MB)</span>
            </div>
            <div className="drag-animation">
              <div className="drag-circle"></div>
              <div className="drag-circle"></div>
              <div className="drag-circle"></div>
            </div>
          </div>
        </div>
      )}

      {/* ======================== DOCUMENTS LIST/GRID ======================== */}
      <div className="documents-content-container">
        <div className="documents-list-header">
          <div className="list-controls">
            {filteredDocuments.length > 0 && (
              <div className="select-all-container">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={filteredDocuments.length > 0 && filteredDocuments.every(doc => selectedDocuments.has(doc.id))}
                    onChange={handleSelectAll}
                  />
                  <span className="checkmark">
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                </label>
                <span className="select-all-label">
                  Select All ({filteredDocuments.length})
                </span>
              </div>
            )}
          </div>
          
          <div className="results-info">
            {selectedCategory !== 'All' ? (
              <span className="filter-results">
                Showing {filteredDocuments.length} of {documents.length} documents
              </span>
            ) : (
              <span className="total-results">
                {documents.length} document{documents.length !== 1 ? 's' : ''} total
              </span>
            )}
          </div>
        </div>

        <div className={`documents-list ${viewMode}-view enhanced`}>
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((document, index) => renderDocumentCard(document, index))
          ) : (
            renderEmptyState()
          )}
        </div>
      </div>

      {/* ======================== DELETE CONFIRMATION MODAL ======================== */}
      {isDeleteModalOpen && selectedDocument && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-backdrop" onClick={() => !isProcessing && setIsDeleteModalOpen(false)} />
          <div className="delete-modal-container">
            <div className="delete-modal-icon">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>

            <h2 className="delete-modal-title">Delete Document</h2>
            <p className="delete-modal-subtitle">This action cannot be undone</p>

            <div className="delete-file-info">
              <div className="file-preview-icon">
                <FontAwesomeIcon icon={getFileIcon(
                  selectedDocument.file_name ? 
                    selectedDocument.file_name.split('.').pop()?.toLowerCase() : 
                    'unknown'
                ).icon} />
              </div>
              <div className="file-preview-details">
                <div className="file-name">{selectedDocument.file_name}</div>
                <div className="file-meta">
                  <span>Document ID: #{selectedDocument.id}</span>
                  <span>•</span>
                  <span>Patient: {selectedDocument.patient_id || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="delete-warning-message">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>You are about to permanently delete this document. This action cannot be undone and the file will be lost forever.</span>
            </div>

            <div className="delete-confirmation">
              <label className="delete-checkbox-container">
                <input type="checkbox" id="confirmDelete" disabled={isProcessing} />
                <span className="delete-checkmark">
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                <span className="delete-checkbox-text">
                  I understand this action is permanent and cannot be undone
                </span>
              </label>
            </div>

            <div className="delete-modal-actions">
              <button 
                className="delete-btn-cancel"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className="delete-btn-confirm"
                onClick={handleConfirmDelete}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrashAlt} />
                    Delete Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================== FLOATING ACTION BUTTON ======================== */}
      {!isUploading && patient?.id && filteredDocuments.length > 0 && (
        <div className="floating-action-container">
          <button 
            className="floating-action-btn"
            onClick={handleFileUploadClick}
            title="Quick Upload"
          >
            <FontAwesomeIcon icon={faPlus} />
            <div className="fab-ripple"></div>
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentsComponent;