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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [hoveredDocument, setHoveredDocument] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
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

  const allowedFileTypes = {
    'application/pdf': { ext: 'pdf', maxSize: 50 * 1024 * 1024 }, // 50MB
    'image/jpeg': { ext: 'jpg', maxSize: 25 * 1024 * 1024 }, // 25MB
    'image/png': { ext: 'png', maxSize: 25 * 1024 * 1024 },
    'image/gif': { ext: 'gif', maxSize: 10 * 1024 * 1024 },
    'application/msword': { ext: 'doc', maxSize: 25 * 1024 * 1024 },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', maxSize: 25 * 1024 * 1024 },
    'application/vnd.ms-excel': { ext: 'xls', maxSize: 25 * 1024 * 1024 },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: 'xlsx', maxSize: 25 * 1024 * 1024 },
    'text/plain': { ext: 'txt', maxSize: 5 * 1024 * 1024 },
    'video/mp4': { ext: 'mp4', maxSize: 100 * 1024 * 1024 },
    'video/quicktime': { ext: 'mov', maxSize: 100 * 1024 * 1024 }
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
    
    // Check file type
    if (!allowedFileTypes[file.type]) {
      errors.push(`File type "${file.type}" is not supported`);
    } else {
      // Check file size
      const maxSize = allowedFileTypes[file.type].maxSize;
      if (file.size > maxSize) {
        errors.push(`File size exceeds ${formatFileSize(maxSize)} limit`);
      }
    }
    
    // Check file name
    if (file.name.length > 255) {
      errors.push('File name is too long (max 255 characters)');
    }
    
    return errors;
  }, [formatFileSize]);

  const getCategoryInfo = useCallback((categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories[categories.length - 1];
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
      stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
      
      // Total size
      stats.totalSize += doc.file_size || doc.size || 0;
      
      // Recent uploads
      if (new Date(doc.upload_date || doc.uploadDate) > oneWeekAgo) {
        stats.recentUploads++;
      }
    });

    return stats;
  }, []);

  // ============================================================================
  // API FUNCTIONS - FIXED FOR PATIENT DOCUMENTS
  // ============================================================================
  
  // Fetch documents from API
  const fetchDocuments = useCallback(async () => {
    if (!patient?.id) {
      console.log('No patient ID available');
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Fetching documents for patient ${patient.id}`);
      
      try {
        const response = await fetch(`${API_BASE_URL}/documents/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const documentsData = await response.json();
          console.log('Received documents data:', documentsData);
          
          // Filter documents by patient_id
          const patientDocuments = Array.isArray(documentsData) ? 
            documentsData.filter(doc => doc.patient_id === patient.id) : 
            [];
          
          setDocuments(patientDocuments);
        } else {
          console.log('Documents endpoint not available yet, showing empty state');
          setDocuments([]);
        }
      } catch (fetchError) {
        console.log('Could not fetch documents (endpoint may not exist yet):', fetchError.message);
        setDocuments([]);
      }
      
    } catch (err) {
      console.error('Error in fetchDocuments:', err);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [patient?.id, API_BASE_URL]);

  // Upload document to API - FIXED: Only send patient_id
  const uploadDocumentToAPI = useCallback(async (file) => {
    if (!patient?.id) {
      throw new Error('Patient ID is required');
    }

    const formData = new FormData();
    formData.append('file', file);
    // SOLO enviar patient_id, NO staff_id ya que estamos en el perfil del paciente
    formData.append('patient_id', patient.id.toString());

    console.log('Uploading document for PATIENT with FormData:');
    console.log('- File name:', file.name);
    console.log('- File size:', file.size);
    console.log('- File type:', file.type);
    console.log('- Patient ID:', patient.id);
    console.log('- NO staff_id (patient document upload)');

    try {
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary for FormData
      });

      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('Upload error details:', errorData);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          try {
            const errorText = await response.text();
            console.error('Upload error text:', errorText);
            errorMessage = errorText || errorMessage;
          } catch (e2) {
            errorMessage = `${response.status} ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      return result;
      
    } catch (error) {
      console.error('Upload request failed:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }, [patient?.id, API_BASE_URL]);

  // Delete document from API
  const deleteDocumentFromAPI = useCallback(async (documentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }

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
  // FILE UPLOAD HANDLERS
  // ============================================================================
  const handleFileUploadClick = useCallback(() => {
    if (!patient?.id) {
      alert('Patient ID is required to upload documents.');
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
      alert(`Upload validation failed:\n${validationErrors.join('\n')}`);
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
            return prev;
          }
          return Math.min(prev + Math.random() * 10, 90);
        });
      }, 200);
      
      // Make the actual upload
      const uploadResult = await uploadDocumentToAPI(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Show completion
      setTimeout(async () => {
        setIsUploading(false);
        setUploadSuccess(true);
        setUploadingFileName('');
        
        // Refresh documents list
        await fetchDocuments();
        
        if (onUpdateDocuments) {
          onUpdateDocuments();
        }
      }, 500);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadingFileName('');
      setError(`Upload failed: ${error.message}`);
    }
  }, [uploadDocumentToAPI, fetchDocuments, onUpdateDocuments]);

  // ============================================================================
  // DRAG AND DROP HANDLERS
  // ============================================================================
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (patient?.id) {
      setDragActive(true);
    }
  }, [patient?.id]);

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
      alert('Patient ID is required to upload documents.');
      return;
    }
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    const file = files[0];
    const validationErrors = validateFile(file);
    
    if (validationErrors.length > 0) {
      alert(`Upload validation failed:\n${validationErrors.join('\n')}`);
      return;
    }
    
    handleDirectUpload(file);
  }, [validateFile, handleDirectUpload, patient?.id]);

  // ============================================================================
  // DOCUMENT ACTIONS
  // ============================================================================
  const handleViewDocument = useCallback((document) => {
    const fileUrl = document.file_path ? 
      `${API_BASE_URL}${document.file_path}` : 
      document.url || '#';
    
    window.open(fileUrl, '_blank');
  }, [API_BASE_URL]);

  const handleDownload = useCallback((document) => {
    try {
      const fileUrl = document.file_path ? 
        `${API_BASE_URL}${document.file_path}` : 
        document.url || '#';
      
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = document.file_name || document.name || 'download';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download failed:', error);
      const fileUrl = document.file_path ? 
        `${API_BASE_URL}${document.file_path}` : 
        document.url || '#';
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
      alert('Please confirm that you understand this action cannot be undone.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await deleteDocumentFromAPI(selectedDocument.id);
      
      setTimeout(async () => {
        setIsDeleteModalOpen(false);
        setDeleteSuccess(true);
        setIsProcessing(false);
        setSelectedDocument(null);
        
        await fetchDocuments();
        
        if (onUpdateDocuments) {
          onUpdateDocuments();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Delete failed:', error);
      setIsProcessing(false);
      setError(`Delete failed: ${error.message}`);
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
      filteredDocs = filteredDocs.filter(doc => 
        (doc.category === selectedCategory) || 
        (doc.document_type === selectedCategory) ||
        (!doc.category && !doc.document_type && selectedCategory === 'Other')
      );
    }
    
    filteredDocs.sort((a, b) => {
      const dateA = new Date(a.upload_date || a.uploadDate || 0);
      const dateB = new Date(b.upload_date || b.uploadDate || 0);
      return dateB - dateA;
    });
    
    return filteredDocs;
  }, [documents, selectedCategory]);

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
      timer = setTimeout(() => setError(null), 8000);
    }
    return () => clearTimeout(timer);
  }, [error]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  const renderDocumentCard = useCallback((document, index) => {
    const fileName = document.file_name || document.name || 'Unknown';
    const fileSize = document.file_size || document.size || 0;
    const uploadDate = document.upload_date || document.uploadDate || new Date();
    const fileType = document.file_type || document.type || fileName.split('.').pop()?.toLowerCase() || 'unknown';
    const category = document.category || document.document_type || 'Other';
    const uploadedBy = document.uploaded_by || document.uploadedBy || 'Unknown';
    
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
          {document.is_protected && (
            <div className="protection-badge">
              <FontAwesomeIcon icon={faLock} />
            </div>
          )}
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
              <span className="meta-label">Size:</span>
              <span className="meta-value">{formatFileSize(fileSize)}</span>
            </div>
            {document.patient_id && (
              <div className="meta-item">
                <FontAwesomeIcon icon={faTag} className="meta-icon" />
                <span className="meta-label">Patient ID:</span>
                <span className="meta-value">{document.patient_id}</span>
              </div>
            )}
          </div>

          {document.description && (
            <div className="document-description">
              <p>{document.description}</p>
            </div>
          )}
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
            {document.is_protected && (
              <span className="status-indicator protected" title="Protected Document">
                <FontAwesomeIcon icon={faShieldAlt} />
              </span>
            )}
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
    formatDate, formatFileSize
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
                disabled={!patient?.id}
              >
                <FontAwesomeIcon icon={faCloudUploadAlt} />
                Upload Document
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
                <span>Auto-categorization</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }, [selectedCategory, handleFileUploadClick, patient?.id]);

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
            <div className="notification-description">{error}</div>
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
              <FontAwesomeIcon icon={faTrashAlt} />
              Delete Selected
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
                <span className="upload-percentage">{uploadProgress}%</span>
              </div>
              
              <div className="upload-file-info">
                <div className="file-name">{uploadingFileName}</div>
                <div className="upload-status">
                  {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
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
      {dragActive && patient?.id && (
        <div className="drag-drop-overlay">
          <div className="drag-drop-content">
            <div className="drag-icon">
              <FontAwesomeIcon icon={faCloudUploadAlt} />
            </div>
            <h3>Drop your files here</h3>
            <p>Release to upload instantly</p>
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
                <FontAwesomeIcon icon={getFileIcon(selectedDocument.file_type || selectedDocument.type).icon} />
              </div>
              <div className="file-preview-details">
                <div className="file-name">{selectedDocument.file_name || selectedDocument.name}</div>
                <div className="file-meta">
                  <span>Size: {formatFileSize(selectedDocument.file_size || selectedDocument.size || 0)}</span>
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
      {!isUploading && patient?.id && (
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