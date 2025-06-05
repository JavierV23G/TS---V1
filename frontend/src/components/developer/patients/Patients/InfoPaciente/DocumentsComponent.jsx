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
        role: 'User'
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
    
    // Check for duplicate names
    const isDuplicate = documents.some(doc => doc.name === file.name);
    if (isDuplicate) {
      errors.push('A file with this name already exists');
    }
    
    return errors;
  }, [documents, formatFileSize]);

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
      stats.totalSize += doc.size || 0;
      
      // Recent uploads
      if (new Date(doc.uploadDate) > oneWeekAgo) {
        stats.recentUploads++;
      }
    });

    return stats;
  }, []);

  // ============================================================================
  // MOCK DATA INITIALIZATION
  // ============================================================================
  useEffect(() => {
    if (patient?.documents) {
      setDocuments(patient.documents || []);
    } else {
      // Enhanced mock data with more realistic documents
      const mockDocuments = [
        {
          id: 1,
          name: 'Initial_Evaluation_Report.pdf',
          type: 'pdf',
          size: 2456789,
          category: 'Medical Reports',
          uploadedBy: 'Dr. Michael Chen',
          uploadDate: '2025-02-15T14:30:00',
          description: 'Comprehensive initial evaluation report including patient history, current symptoms, and recommended treatment plan.',
          url: '/documents/eval-report.pdf',
          isProtected: false,
          version: '1.0',
          tags: ['evaluation', 'initial', 'therapy'],
          lastModified: '2025-02-15T14:30:00'
        },
        {
          id: 2,
          name: 'Insurance_Approval_2025.pdf',
          type: 'pdf',
          size: 1245678,
          category: 'Insurance',
          uploadedBy: 'Admin Staff',
          uploadDate: '2025-02-10T09:15:00',
          description: 'Official insurance approval documentation for therapy sessions covering the period from Feb 2025 to Aug 2025.',
          url: '/documents/insurance-approval.pdf',
          isProtected: true,
          version: '2.1',
          tags: ['insurance', 'approval', '2025'],
          lastModified: '2025-02-12T16:20:00'
        },
        {
          id: 3,
          name: 'Progress_Notes_Week_1-4.docx',
          type: 'docx',
          size: 356789,
          category: 'Progress Notes',
          uploadedBy: 'Dr. Michael Chen',
          uploadDate: '2025-02-20T16:45:00',
          description: 'Detailed weekly progress notes documenting patient improvements and therapy adjustments for the first month of treatment.',
          url: '/documents/progress-notes-w1.docx',
          isProtected: false,
          version: '1.3',
          tags: ['progress', 'weekly', 'month1'],
          lastModified: '2025-02-28T11:30:00'
        },
        {
          id: 4,
          name: 'Custom_Exercise_Program.jpg',
          type: 'jpg',
          size: 1789456,
          category: 'Therapy Plans',
          uploadedBy: 'Maria Gonzalez',
          uploadDate: '2025-02-25T10:20:00',
          description: 'Visual guide for custom exercise program designed specifically for patient\'s rehabilitation needs.',
          url: '/documents/exercise-program.jpg',
          isProtected: false,
          version: '1.0',
          tags: ['exercise', 'visual', 'custom'],
          lastModified: '2025-02-25T10:20:00'
        },
        {
          id: 5,
          name: 'Lab_Results_March_2025.pdf',
          type: 'pdf',
          size: 2134567,
          category: 'Lab Results',
          uploadedBy: 'Dr. Sarah Johnson',
          uploadDate: '2025-03-01T08:30:00',
          description: 'Latest laboratory test results including blood work, inflammatory markers, and metabolic panel.',
          url: '/documents/lab-results-march.pdf',
          isProtected: true,
          version: '1.0',
          tags: ['lab', 'blood', 'march'],
          lastModified: '2025-03-01T08:30:00'
        },
        {
          id: 6,
          name: 'MRI_Scan_Report.pdf',
          type: 'pdf',
          size: 8945678,
          category: 'Imaging',
          uploadedBy: 'Radiology Dept',
          uploadDate: '2025-01-28T14:15:00',
          description: 'Detailed MRI scan report with imaging findings and radiologist interpretations.',
          url: '/documents/mri-report.pdf',
          isProtected: true,
          version: '1.0',
          tags: ['mri', 'imaging', 'radiology'],
          lastModified: '2025-01-28T14:15:00'
        }
      ];
      
      setDocuments(mockDocuments);
    }
  }, [patient]);

  // Update stats when documents change
  useEffect(() => {
    const stats = calculateStats(documents);
    setDocumentStats(stats);
  }, [documents, calculateStats]);

  // ============================================================================
  // FILE UPLOAD HANDLERS
  // ============================================================================
  const handleFileUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

// CAMBIAR TODA ESTA FUNCIÓN:
const handleFileSelected = useCallback((e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;
  
  const file = files[0];
  const validationErrors = validateFile(file);
  
  if (validationErrors.length > 0) {
    alert(`Upload failed:\n${validationErrors.join('\n')}`);
    return;
  }
  
  // DIRECTAMENTE INICIAR UPLOAD SIN MODAL
  handleDirectUpload(file);
  
  // Clear the input
  e.target.value = null;
}, [validateFile]);

const handleDirectUpload = useCallback(async (file) => {
  setIsUploading(true);
  setUploadProgress(0);
  setUploadingFileName(file.name);
  
  try {
    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return Math.min(prev + Math.random() * 15, 95);
      });
    }, 150);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    clearInterval(uploadInterval);
    setUploadProgress(100);
    
    // Create new document with default category
    const currentUserInfo = getCurrentUser();
    const newDocument = {
      id: Date.now(),
      name: file.name,
      type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
      size: file.size,
      category: 'Other', // Categoría por defecto
      uploadedBy: currentUserInfo.fullname || currentUserInfo.name || currentUserInfo.username || 'Current User',
      uploadDate: new Date().toISOString(),
      description: `Uploaded document: ${file.name}`,
      url: URL.createObjectURL(file),
      isProtected: false,
      version: '1.0',
      tags: ['uploaded'],
      lastModified: new Date().toISOString()
    };
    
    // Update documents
    const updatedDocs = [newDocument, ...documents];
    setDocuments(updatedDocs);
    
    // Notify parent
    if (onUpdateDocuments) {
      onUpdateDocuments(updatedDocs);
    }
    
    // Show success
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      setUploadingFileName('');
    }, 500);
    
  } catch (error) {
    console.error('Upload failed:', error);
    setIsUploading(false);
    alert('Upload failed. Please try again.');
  }
}, [documents, getCurrentUser, onUpdateDocuments]);


  // ============================================================================
  // DRAG AND DROP HANDLERS
  // ============================================================================
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    const file = files[0];
    const validationErrors = validateFile(file);
    
    if (validationErrors.length > 0) {
      alert(`Upload failed:\n${validationErrors.join('\n')}`);
      return;
    }
    
    handleDirectUpload(file);

  }, [validateFile]);

  // ============================================================================
  // DOCUMENT ACTIONS
  // ============================================================================
  const handleViewDocument = useCallback((document) => {
    // Open in new tab with document viewer
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${document.name} - Document Viewer</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #f8fafc;
              color: #1e293b;
              height: 100vh;
              overflow: hidden;
            }
            
            .document-viewer {
              height: 100vh;
              display: flex;
              flex-direction: column;
            }
            
            .viewer-header {
              background: #ffffff;
              border-bottom: 1px solid #e2e8f0;
              padding: 1rem 2rem;
              display: flex;
              align-items: center;
              justify-content: space-between;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              z-index: 10;
            }
            
            .document-info {
              display: flex;
              align-items: center;
              gap: 1rem;
            }
            
            .document-icon {
              width: 40px;
              height: 40px;
              border-radius: 8px;
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 1.2rem;
            }
            
            .document-details h1 {
              font-size: 1.25rem;
              font-weight: 600;
              margin-bottom: 0.25rem;
              color: #1e293b;
            }
            
            .document-meta {
              font-size: 0.875rem;
              color: #64748b;
              display: flex;
              gap: 1rem;
            }
            
            .viewer-actions {
              display: flex;
              gap: 0.75rem;
            }
            
            .action-btn {
              padding: 0.625rem 1rem;
              border: 1px solid #e2e8f0;
              background: white;
              color: #374151;
              border-radius: 8px;
              cursor: pointer;
              font-size: 0.875rem;
              font-weight: 500;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            
            .action-btn:hover {
              background: #f8fafc;
              border-color: #cbd5e1;
              transform: translateY(-1px);
            }
            
            .action-btn.primary {
              background: #3b82f6;
              color: white;
              border-color: #3b82f6;
            }
            
            .action-btn.primary:hover {
              background: #2563eb;
            }
            
            .viewer-content {
              flex: 1;
              position: relative;
              background: #ffffff;
            }
            
            .document-frame {
              width: 100%;
              height: 100%;
              border: none;
              background: white;
            }
            
            .document-preview {
              width: 100%;
              height: 100%;
              object-fit: contain;
              background: white;
            }
            
            .no-preview {
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              padding: 2rem;
            }
            
            .no-preview-icon {
              font-size: 4rem;
              color: #cbd5e1;
              margin-bottom: 1rem;
            }
            
            .no-preview h2 {
              font-size: 1.5rem;
              margin-bottom: 0.5rem;
              color: #374151;
            }
            
            .no-preview p {
              color: #6b7280;
              margin-bottom: 2rem;
              max-width: 400px;
            }
            
            .loading {
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.125rem;
              color: #6b7280;
            }
            
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            
            .spinner {
              animation: spin 1s linear infinite;
              margin-right: 0.5rem;
            }
          </style>
        </head>
        <body>
          <div class="document-viewer">
            <div class="viewer-header">
              <div class="document-info">
                <div class="document-icon">📄</div>
                <div class="document-details">
                  <h1>${document.name}</h1>
                  <div class="document-meta">
                    <span>Size: ${formatFileSize(document.size)}</span>
                    <span>Category: ${document.category}</span>
                    <span>Uploaded: ${formatDate(document.uploadDate)}</span>
                    <span>By: ${document.uploadedBy}</span>
                  </div>
                </div>
              </div>
              <div class="viewer-actions">
                <button class="action-btn" onclick="window.print()">
                  🖨️ Print
                </button>
                <button class="action-btn primary" onclick="downloadFile()">
                  ⬇️ Download
                </button>
                <button class="action-btn" onclick="window.close()">
                  ✕ Close
                </button>
              </div>
            </div>
            <div class="viewer-content">
              <div id="loading" class="loading">
                <span class="spinner">⏳</span>
                Loading document...
              </div>
              <div id="content" style="display: none; height: 100%;">
                ${document.type === 'pdf' ? `
                  <iframe class="document-frame" src="${document.url}" title="${document.name}"></iframe>
                ` : document.type.match(/jpe?g|png|gif/i) ? `
                  <img class="document-preview" src="${document.url}" alt="${document.name}" />
                ` : `
                  <div class="no-preview">
                    <div class="no-preview-icon">📄</div>
                    <h2>Preview Not Available</h2>
                    <p>This file type cannot be previewed in the browser. Click download to view the file.</p>
                    <button class="action-btn primary" onclick="downloadFile()">
                      ⬇️ Download File
                    </button>
                  </div>
                `}
              </div>
            </div>
          </div>
          
          <script>
            function downloadFile() {
              const link = document.createElement('a');
              link.href = '${document.url}';
              link.download = '${document.name}';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
            
            // Show content after short delay
            setTimeout(() => {
              document.getElementById('loading').style.display = 'none';
              document.getElementById('content').style.display = 'block';
            }, 800);
            
            // Handle keyboard shortcuts
            document.addEventListener('keydown', function(e) {if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                  case 'p':
                    e.preventDefault();
                    window.print();
                    break;
                  case 's':
                    e.preventDefault();
                    downloadFile();
                    break;
                  case 'w':
                    e.preventDefault();
                    window.close();
                    break;
                }
              }
              if (e.key === 'Escape') {
                window.close();
              }
            });
          </script>
        </body>
        </html>
      `);
      newWindow.document.close();
    }
  }, [formatFileSize, formatDate]);

  const handleDownload = useCallback((document) => {
    try {
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.name;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(document.url, '_blank');
    }
  }, []);

  const handleDeleteClick = useCallback((document) => {
    setSelectedDocument(document);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!selectedDocument) return;
    
    // Verificar checkbox de confirmación
    const checkbox = document.getElementById('confirmDelete');
    if (!checkbox?.checked) {
      alert('Please confirm that you understand this action cannot be undone.');
      return;
    }
    
    setIsProcessing(true);
    
    // Animación más elaborada
    setTimeout(() => {
      const updatedDocuments = documents.filter(doc => doc.id !== selectedDocument.id);
      setDocuments(updatedDocuments);
      setIsDeleteModalOpen(false);
      setDeleteSuccess(true);
      setIsProcessing(false);
      
      if (onUpdateDocuments) {
        onUpdateDocuments(updatedDocuments);
      }
      
      setSelectedDocument(null);
    }, 2000); // Más tiempo para mostrar procesamiento
  }, [selectedDocument, documents, onUpdateDocuments]);

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

  const handleBulkDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete ${selectedDocuments.size} documents? This action cannot be undone.`)) {
      const updatedDocuments = documents.filter(doc => !selectedDocuments.has(doc.id));
      setDocuments(updatedDocuments);
      setSelectedDocuments(new Set());
      setShowBulkActions(false);
      setDeleteSuccess(true);
      
      if (onUpdateDocuments) {
        onUpdateDocuments(updatedDocuments);
      }
    }
  }, [selectedDocuments, documents, onUpdateDocuments]);

  // ============================================================================
  // FILTERING AND SORTING
  // ============================================================================
  const filterDocuments = useCallback(() => {
    let filteredDocs = [...documents];
    
    // Solo aplicar filtro de categoría
    if (selectedCategory !== 'All') {
      filteredDocs = filteredDocs.filter(doc => doc.category === selectedCategory);
    }
    
    // Ordenar por fecha (más recientes primero)
    filteredDocs.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    
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

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  const renderDocumentCard = useCallback((document, index) => {
    const fileIconInfo = getFileIcon(document.type);
    const categoryInfo = getCategoryInfo(document.category);
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
        {/* Selection Checkbox */}
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

        {/* Document Icon with Enhanced Styling */}
        <div className="document-icon-container">
          <div 
            className="document-icon"
            style={{ background: fileIconInfo.gradient }}
          >
            <FontAwesomeIcon icon={fileIconInfo.icon} />
          </div>
          {document.isProtected && (
            <div className="protection-badge">
              <FontAwesomeIcon icon={faLock} />
            </div>
          )}
          <div className="file-type-badge">{document.type.toUpperCase()}</div>
        </div>

        {/* Document Details */}
        <div className="document-details">
          <div className="document-name-row">
            <div className="document-name" title={document.name}>
              {document.name}
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
              {document.category}
            </div>
          </div>

          <div className="document-meta-grid">
            <div className="meta-item">
              <span className="meta-label">Uploaded by:</span>
              <span className="meta-value">{document.uploadedBy}</span>
            </div>
            <div className="meta-item">
              <FontAwesomeIcon icon={faCalendarAlt} className="meta-icon" />
              <span className="meta-label">Date:</span>
              <span className="meta-value">{formatDate(document.uploadDate)}</span>
            </div>
            <div className="meta-item">
              <FontAwesomeIcon icon={faFile} className="meta-icon" />
              <span className="meta-label">Size:</span>
              <span className="meta-value">{formatFileSize(document.size)}</span>
            </div>
            {document.version && (
              <div className="meta-item">
                <FontAwesomeIcon icon={faTag} className="meta-icon" />
                <span className="meta-label">Version:</span>
                <span className="meta-value">v{document.version}</span>
              </div>
            )}
          </div>

          {document.description && (
            <div className="document-description">
              <p>{document.description}</p>
            </div>
          )}

          {document.tags && document.tags.length > 0 && (
            <div className="document-tags">
              {document.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="tag">
                  #{tag}
                </span>
              ))}
              {document.tags.length > 3 && (
                <span className="tag-more">+{document.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Action Buttons */}
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
            {document.isProtected && (
              <span className="status-indicator protected" title="Protected Document">
                <FontAwesomeIcon icon={faShieldAlt} />
              </span>
            )}
            <span className="status-indicator recent" title="Recently Modified">
              <FontAwesomeIcon icon={faClock} />
            </span>
          </div>
        </div>

        {/* Hover Overlay Effect */}
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
  }, [selectedCategory, handleFileUploadClick]);

  // ============================================================================
  // MAIN COMPONENT RENDER
  // ============================================================================
  const filteredDocuments = filterDocuments();

  return (
    <div 
      className="documents-component premium-enhanced"
      ref={dropZoneRef}
      onDragOver={dragActive ? undefined : handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
            disabled={isUploading}
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
          {/* View Mode Toggle */}
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

      </div>

      {/* ======================== BULK ACTIONS BAR ======================== */}
      {showBulkActions && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>{selectedDocuments.size} document{selectedDocuments.size !== 1 ? 's' : ''} selected</span>
          </div>
          <div className="bulk-actions">
            <button className="bulk-btn download" onClick={handleBulkDownload}>
              <FontAwesomeIcon icon={faDownload} />
              Download All
            </button>
            <button className="bulk-btn delete" onClick={handleBulkDelete}>
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
      {dragActive && (
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

      {/* ======================== CATEGORY SELECTION MODAL ======================== */}

{/* ======================== DELETE CONFIRMATION MODAL ======================== */}
      {isDeleteModalOpen && selectedDocument && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-backdrop" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="delete-modal-container">
            {/* Warning Icon */}
            <div className="delete-modal-icon">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>

            {/* Title */}
            <h2 className="delete-modal-title">Delete Document</h2>

            {/* Subtitle */}
            <p className="delete-modal-subtitle">
              This action cannot be undone
            </p>

            {/* File Info */}
            <div className="delete-file-info">
              <div className="file-preview-icon">
                <FontAwesomeIcon icon={getFileIcon(selectedDocument.type).icon} />
              </div>
              <div className="file-preview-details">
                <div className="file-name">{selectedDocument.name}</div>
                <div className="file-meta">
                  <span>Size: {formatFileSize(selectedDocument.size)}</span>
                  <span>•</span>
                  <span>Category: {selectedDocument.category}</span>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="delete-warning-message">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>You are about to permanently delete this document. This action cannot be undone and the file will be lost forever.</span>
            </div>

            {/* Confirmation Checkbox */}
            <div className="delete-confirmation">
              <label className="delete-checkbox-container">
                <input type="checkbox" id="confirmDelete" />
                <span className="delete-checkmark">
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                <span className="delete-checkbox-text">
                  I understand this action is permanent and cannot be undone
                </span>
              </label>
            </div>

            {/* Actions */}
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
    </div>
  );
};

export default DocumentsComponent;