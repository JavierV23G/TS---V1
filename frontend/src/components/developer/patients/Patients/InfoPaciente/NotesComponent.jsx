import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../login/AuthContext';
import '../../../../../styles/developer/Patients/InfoPaciente/NotesComponent.scss';

// Clinical note types with premium icons and colors
const CLINICAL_NOTE_TYPES = [
  { 
    value: 'visit_note', 
    label: 'Visit Note', 
    icon: 'fa-file-medical-alt', 
    color: '#2563eb',
    description: 'Therapy session documentation'
  },
  { 
    value: 'assessment', 
    label: 'Assessment', 
    icon: 'fa-stethoscope', 
    color: '#10b981',
    description: 'Initial or follow-up evaluation'
  },
  { 
    value: 'progress_note', 
    label: 'Progress Note', 
    icon: 'fa-chart-line', 
    color: '#f59e0b',
    description: 'Patient progress documentation'
  },
  { 
    value: 'discharge_summary', 
    label: 'Discharge Summary', 
    icon: 'fa-file-export', 
    color: '#8b5cf6',
    description: 'Treatment completion documentation'
  },
  { 
    value: 'incident_report', 
    label: 'Incident Report', 
    icon: 'fa-exclamation-triangle', 
    color: '#ef4444',
    description: 'Adverse event documentation'
  },
  { 
    value: 'communication', 
    label: 'Communication', 
    icon: 'fa-comment-medical', 
    color: '#06b6d4',
    description: 'Patient or family communication'
  },
  { 
    value: 'signature', 
    label: 'Digital Signature', 
    icon: 'fa-signature', 
    color: '#64748b',
    description: 'Digital signature for documents'
  },
  { 
    value: 'file', 
    label: 'File Attachment', 
    icon: 'fa-file-upload', 
    color: '#9333ea',
    description: 'Document or file upload'
  }
];

// Clinical categories with medical psychology colors
const CLINICAL_CATEGORIES = [
  { value: 'Clinical', color: '#2563eb', description: 'General clinical documentation' },
  { value: 'Assessment', color: '#10b981', description: 'Evaluations and assessments' },
  { value: 'Progress', color: '#f59e0b', description: 'Progress monitoring' },
  { value: 'Therapy', color: '#8b5cf6', description: 'Therapy sessions' },
  { value: 'Communication', color: '#06b6d4', description: 'Interdisciplinary communication' },
  { value: 'Administrative', color: '#64748b', description: 'Administrative documentation' },
  { value: 'Emergency', color: '#ef4444', description: 'Emergency situations' }
];

// Colors by clinical staff role
const STAFF_ROLE_COLORS = {
  PT: '#2563eb',      // Clinical blue for physical therapists
  PTA: '#3b82f6',     // Azul medio para asistentes de PT
  OT: '#8b5cf6',      // Purple for occupational therapists
  COTA: '#a78bfa',    // Light purple for OT assistants
  ST: '#ec4899',      // Pink for speech pathologists
  STA: '#f472b6',     // Rosa claro para asistentes de ST
  ADMIN: '#64748b',   // Gris para administrativos
  DEVELOPER: '#10b981' // Verde para desarrolladores
};

const NotesComponent = ({ patient, onUpdateNotes }) => {
  // Estados principales
  const [visitNotes, setVisitNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [newNoteType, setNewNoteType] = useState('visit_note');
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availableCategories, setAvailableCategories] = useState(['all']);
  
  // Estados de UI
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Referencias
  const { currentUser } = useAuth();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const signatureCanvasCtx = useRef(null);
  const isDrawing = useRef(false);

  // API configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Obtener notas del backend usando la estructura real del backend
  useEffect(() => {
    const fetchVisitNotes = async () => {
      if (!patient?.id) {
        setVisitNotes([]);
        setFilteredNotes([]);
        setAvailableCategories(['all']);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Primero obtenemos las visitas del paciente
        // Get certification periods first to get visits by cert period
        const certPeriodsResponse = await fetch(`${API_BASE_URL}/patient/${patient.id}/cert-periods`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!certPeriodsResponse.ok) {
          throw new Error(`Error getting certification periods: ${certPeriodsResponse.status}`);
        }
        
        const certPeriods = await certPeriodsResponse.json();
        const activeCertPeriod = certPeriods.find(cp => cp.is_active) || certPeriods[0];
        
        if (!activeCertPeriod) {
          setVisitNotes([]);
          setIsLoading(false);
          return;
        }
        
        // Get visits for the certification period
        const visitsResponse = await fetch(`${API_BASE_URL}/visits/certperiod/${activeCertPeriod.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!visitsResponse.ok) {
          throw new Error(`Error getting visits: ${visitsResponse.status} ${visitsResponse.statusText}`);
        }
        
        const visits = await visitsResponse.json();
        
        // Luego obtenemos las notas para cada visita
        const allNotes = [];
        for (const visit of visits) {
          try {
            const noteResponse = await fetch(`${API_BASE_URL}/visit-notes/${visit.id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (noteResponse.ok) {
              const note = await noteResponse.json();
              // Enrich the note with visit information
              const enrichedNote = {
                id: note.id,
                visit_id: note.visit_id,
                title: `Visit Note - ${visit.visit_type || 'Session'}`,
                visitId: visit.id,
                content: note.sections_data ? JSON.stringify(note.sections_data, null, 2) : 'Sin contenido',
                note_type: 'visit_note',
                category: 'Clinical',
                author: note.therapist_name || 'Desconocido',
                user_role: visit.staff?.role || 'Staff',
                status: note.status,
                created_at: note.created_at || visit.visit_date,
                tags: visit.therapy_type || '',
                is_pinned: false,
                patient_id: patient.id,
                visit_info: {
                  visit_type: visit.visit_type,
                  therapy_type: visit.therapy_type,
                  visit_date: visit.visit_date,
                  duration: visit.duration_minutes
                }
              };
              allNotes.push(enrichedNote);
            }
          } catch (noteError) {
            console.warn(`Error al obtener nota para visita ${visit.id}:`, noteError);
          }
        }
        
        // Extract unique categories
        const uniqueCategories = [...new Set(allNotes.map(note => note.category || 'Clinical'))];
        setAvailableCategories(['all', ...uniqueCategories]);
        
        setVisitNotes(allNotes);
        setFilteredNotes(allNotes);
        
      } catch (err) {
        console.error('Error al obtener notas de visitas:', err);
        setError(err.message);
        setVisitNotes([]);
        setFilteredNotes([]);
        setAvailableCategories(['all']);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVisitNotes();
  }, [patient?.id, API_BASE_URL]);

  // Filtrar y ordenar notas
  useEffect(() => {
    let result = [...visitNotes];
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        note => note.title?.toLowerCase().includes(query) || 
                note.content?.toLowerCase().includes(query) ||
                note.author?.toLowerCase().includes(query) ||
                note.note_type?.toLowerCase().includes(query) ||
                note.status?.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(note => note.category === selectedCategory);
    }
    
    // Ordenamiento
    result = sortNotes(result, sortBy);
    
    setFilteredNotes(result);
  }, [visitNotes, searchQuery, sortBy, selectedCategory]);

  // Sorting function
  const sortNotes = (notesToSort, sortCriteria) => {
    const sortedNotes = [...notesToSort];
    
    switch (sortCriteria) {
      case 'date-desc':
        return sortedNotes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'date-asc':
        return sortedNotes.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'title-asc':
        return sortedNotes.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'title-desc':
        return sortedNotes.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      case 'author':
        return sortedNotes.sort((a, b) => (a.author || '').localeCompare(b.author || ''));
      case 'status':
        return sortedNotes.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
      default:
        return sortedNotes;
    }
  };

  // Crear nueva nota de visita usando la API del backend
  const createVisitNote = async (noteData) => {
    try {
      // Get patient's active certification period first
      const certPeriodsResponse = await fetch(`${API_BASE_URL}/patient/${patient.id}/cert-periods`);
      if (!certPeriodsResponse.ok) {
        throw new Error('No certification periods found for this patient');
      }
      
      const certPeriods = await certPeriodsResponse.json();
      const activeCertPeriod = certPeriods.find(cp => cp.is_active) || certPeriods[0];
      
      if (!activeCertPeriod) {
        throw new Error('No active certification period found. Please ensure the patient has an active certification period.');
      }

      // Check if we have required user data
      if (!currentUser || !currentUser.id) {
        throw new Error('User authentication required. Please log in again.');
      }

      // Para crear una nota de visita, necesitamos primero una visita
      const visitData = {
        patient_id: patient.id,
        staff_id: currentUser.id,
        visit_date: new Date().toISOString().split('T')[0],
        visit_type: noteData.visit_type || 'therapy_session',
        status: 'Scheduled',
        scheduled_time: '10:00'
      };

      console.log('Creating visit with data:', visitData);

      // Create visit first
      const visitResponse = await fetch(`${API_BASE_URL}/visits/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData),
      });
      
      if (!visitResponse.ok) {
        const errorText = await visitResponse.text();
        console.error('Visit creation error:', errorText);
        throw new Error(`Error creating visit: ${visitResponse.status} ${visitResponse.statusText}`);
      }
      
      const newVisit = await visitResponse.json();
      
      // Ahora crear la nota de visita
      const visitNoteData = {
        visit_id: newVisit.id,
        sections_data: {
          'Clinical Assessment': {
            title: noteData.title,
            content: noteData.content,
            category: noteData.category,
            note_type: noteData.note_type,
            tags: noteData.tags || [],
            timestamp: new Date().toISOString()
          }
        }
      };
      
      console.log('Creating note with data:', visitNoteData);
      
      const noteResponse = await fetch(`${API_BASE_URL}/visit-notes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitNoteData),
      });
      
      if (!noteResponse.ok) {
        const errorText = await noteResponse.text();
        console.error('Note creation error:', errorText);
        throw new Error(`Error creating note: ${noteResponse.status} ${noteResponse.statusText}. Details: ${errorText}`);
      }
      
      const newNote = await noteResponse.json();
      
      // Crear la estructura enriquecida para el frontend
      const enrichedNote = {
        id: newNote.id,
        visit_id: newNote.visit_id,
        title: noteData.title,
        content: noteData.content,
        note_type: noteData.note_type,
        category: noteData.category,
        author: currentUser?.fullname || currentUser?.username || 'Usuario Actual',
        user_role: currentUser?.role || 'Staff',
        status: newNote.status,
        created_at: new Date().toISOString(),
        tags: noteData.tags,
        is_pinned: false,
        patient_id: patient.id,
        visit_info: {
          visit_type: visitData.visit_type,
          therapy_type: visitData.therapy_type,
          visit_date: visitData.visit_date,
          duration: visitData.duration_minutes
        }
      };
      
      // Actualizar la lista local
      setVisitNotes(prevNotes => [enrichedNote, ...prevNotes]);
      
      return enrichedNote;
    } catch (err) {
      console.error('Error al crear nota de visita:', err);
      throw err;
    }
  };

  // Delete visit note
  const deleteVisitNote = async (noteId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visit-notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting note: ${response.status} ${response.statusText}`);
      }
      
      // Actualizar la lista local
      setVisitNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      
    } catch (err) {
      console.error('Error al eliminar nota:', err);
      throw err;
    }
  };

  // Alternar estado de pin de nota
  const togglePinNote = async (noteId) => {
    try {
      const note = visitNotes.find(n => n.id === noteId);
      if (!note) return;
      
      // Actualizar localmente (el backend no tiene soporte para pins)
      setVisitNotes(prevNotes =>
        prevNotes.map(n => 
          n.id === noteId ? { ...n, is_pinned: !n.is_pinned } : n
        )
      );
    } catch (err) {
      console.error('Error al alternar pin:', err);
      setError('Error al actualizar el estado de la nota');
    }
  };

  // Handle note deletion
  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    setShowDeleteConfirm(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!noteToDelete) return;
    
    try {
      await deleteVisitNote(noteToDelete.id);
      setShowDeleteConfirm(false);
      setNoteToDelete(null);
      
      if (activeNoteId === noteToDelete.id) {
        setActiveNoteId(null);
      }
    } catch (err) {
      console.error('Error al eliminar nota:', err);
      setError('Error al eliminar la nota');
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setNoteToDelete(null);
  };

  // Inicializar formulario de nueva nota
  const handleAddNote = (type = 'visit_note') => {
    setNewNoteType(type);
    setIsAddingNote(true);
    setError(null);
  };

  // Ver detalles de nota
  const handleViewNote = (noteId) => {
    setActiveNoteId(noteId);
  };

  // Guardar nueva nota
  const handleSaveNote = async (event) => {
    event.preventDefault();
    
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      const formData = new FormData(event.target);
      const title = formData.get('title')?.trim();
      const category = formData.get('category') || 'Clinical';
      const tags = formData.get('tags')?.split(',').map(tag => tag.trim()).filter(Boolean).join(',') || '';
      const noteType = formData.get('noteType') || 'visit_note';
      const visitType = formData.get('visitType') || 'Therapy Session';
      const therapyType = formData.get('therapyType') || 'General';
      
      let content = '';
      
      if (noteType === 'signature') {
        if (canvasRef.current) {
          content = canvasRef.current.toDataURL();
        }
      } else {
        content = formData.get('content')?.trim();
      }
      
      if (!title || !content) {
        setError('Please provide both a title and content for the note.');
        return;
      }
      
      const noteData = {
        title,
        content,
        note_type: noteType,
        category,
        tags,
        visit_type: visitType,
        therapy_type: therapyType
      };
      
      await createVisitNote(noteData);
      setIsAddingNote(false);
      
      // Clear the form
      event.target.reset();
      
    } catch (err) {
      console.error('Error saving note:', err);
      setError('Error saving note: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Subir archivo
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;
    
    const file = files[0];
    const fileType = file.type.split('/')[0];
    
    // Por ahora usamos URL.createObjectURL como placeholder
    const fileUrl = URL.createObjectURL(file);
    
    const noteData = {
      title: `Archivo: ${file.name}`,
      content: `Attached file: ${file.name}\nType: ${file.type}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
      note_type: 'file',
      category: 'Administrative',
      tags: `${fileType},archivo`,
      visit_type: 'File Upload',
      therapy_type: 'Administrative'
    };
    
    try {
      await createVisitNote(noteData);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error al subir archivo:', err);
      setError('Error al subir el archivo');
    }
  };

  // Funciones de firma digital
  const startDrawing = (e) => {
    if (!signatureCanvasCtx.current) return;
    
    isDrawing.current = true;
    const ctx = signatureCanvasCtx.current;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const draw = (e) => {
    if (!isDrawing.current || !signatureCanvasCtx.current) return;
    
    const ctx = signatureCanvasCtx.current;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearSignature = () => {
    if (!signatureCanvasCtx.current || !canvasRef.current) return;
    
    const ctx = signatureCanvasCtx.current;
    const canvas = canvasRef.current;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Inicializar canvas para firma
  useEffect(() => {
    if (isAddingNote && newNoteType === 'signature' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      signatureCanvasCtx.current = ctx;
      
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#2563eb';
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [isAddingNote, newNoteType]);

  // Helpers para formato de fecha
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    
    const day = date.getDate();
    const month = date.toLocaleString('es-ES', { month: 'short' });
    const year = date.getFullYear();
    
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    const hours12 = hours % 12 || 12;
    
    return {
      day,
      month,
      year,
      time: `${hours12}:${minutes} ${ampm}`
    };
  };

  // Obtener color por rol
  const getRoleColor = (role) => {
    return STAFF_ROLE_COLORS[role?.toUpperCase()] || '#64748b';
  };

  // Get color by category
  const getCategoryColor = (category) => {
    const foundCategory = CLINICAL_CATEGORIES.find(cat => 
      cat.value.toLowerCase() === category?.toLowerCase()
    );
    return foundCategory?.color || '#64748b';
  };

  // Get note type information
  const getNoteTypeInfo = (noteType) => {
    return CLINICAL_NOTE_TYPES.find(type => type.value === noteType) || CLINICAL_NOTE_TYPES[0];
  };

  // Obtener clase CSS por estado
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'scheduled':
        return 'status-scheduled';
      default:
        return '';
    }
  };

  // Componente de tarjeta de nota premium
  const ClinicalNoteCard = ({ note, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const dateFormatted = formatShortDate(note.created_at);
    const noteTypeInfo = getNoteTypeInfo(note.note_type);
    const statusClass = getStatusClass(note.status);
    
    return (
      <div
        className={`clinical-note-card ${statusClass} ${note.is_pinned ? 'pinned' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => handleViewNote(note.id)}
      >
        <div className="note-header">
          <div className="note-category">
            <span 
              className="category-indicator" 
              style={{ backgroundColor: getCategoryColor(note.category) }}
            ></span>
            <span className="category-name">{note.category || 'Clinical'}</span>
          </div>
          <div className="note-actions" onClick={(e) => e.stopPropagation()}>
            {isHovered && (
              <div className="action-buttons">
                <button 
                  className="clinical-action-btn view-btn" 
                  onClick={() => handleViewNote(note.id)}
                  title="Ver Nota"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button 
                  className={`clinical-action-btn pin-btn ${note.is_pinned ? 'pin-active' : ''}`}
                  onClick={() => togglePinNote(note.id)}
                  title={note.is_pinned ? "Desfijar Nota" : "Fijar Nota"}
                >
                  <i className="fas fa-thumbtack"></i>
                </button>
                <button 
                  className="clinical-action-btn delete-btn" 
                  onClick={() => handleDeleteClick(note)}
                  title="Delete Note"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="note-content">
          <h3 className="note-title">
            {note.is_pinned && <i className="fas fa-thumbtack pin-icon"></i>}
            {note.title}
          </h3>
          <div className="note-type-badge" style={{
            backgroundColor: `${noteTypeInfo.color}20`, 
            color: noteTypeInfo.color
          }}>
            <i className={`fas ${noteTypeInfo.icon}`}></i>
            <span>{noteTypeInfo.label}</span>
          </div>
          
          <div className="note-preview">
            <p>{note.content && note.content.length > 120 
              ? `${note.content.substring(0, 120)}...` 
              : note.content
            }</p>
          </div>
        </div>
        
        <div className="note-footer">
          <div className="note-date-info">
            <div className="date-block">
              <span className="date-day">{dateFormatted.day}</span>
              <span className="date-month">{dateFormatted.month}</span>
            </div>
            <div className="date-details">
              <span className="date-year">{dateFormatted.year}</span>
              <span className="date-time">{dateFormatted.time}</span>
            </div>
          </div>
          
          <div className="note-author">
            <div 
              className="author-avatar" 
              style={{
                backgroundColor: getRoleColor(note.user_role)
              }}
            >
              {note.author ? note.author.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="author-info">
              <span className="author-name">{note.author || 'Desconocido'}</span>
              <span className="author-role">{note.user_role || 'Staff'}</span>
            </div>
          </div>
          
          {note.tags && (
            <div className="note-tags">
              {note.tags.split(',').slice(0, 2).map((tag, idx) => (
                <span key={idx} className="tag">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="notes-component">
      {/* Banner de error */}
      {error && (
        <div className="clinical-error-banner">
          <i className="fas fa-exclamation-triangle error-icon"></i>
          <span className="error-message">{error}</span>
          <button 
            className="error-dismiss"
            onClick={() => setError(null)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Header premium */}
      <div className="notes-header">
        <div className="header-content">
          <div className="header-left">
            <div className="clinical-icon-wrapper">
              <i className="fas fa-file-medical-alt"></i>
            </div>
            <div className="header-text">
              <h1 className="clinical-title">Clinical Notes</h1>
              <div className="clinical-subtitle">
                <span>Patient medical documentation</span>
                <div className="note-count">{filteredNotes.length} notas</div>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="clinical-search-container">
              <i className="fas fa-search search-icon"></i>
              <input 
                type="text" 
                placeholder="Search clinical notes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="clinical-search-input"
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
            
            <div className="clinical-filters">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="clinical-select"
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="clinical-select"
              >
                <option value="date-desc">Most Recent</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="author">Author</option>
                <option value="status">Status</option>
              </select>
            </div>
            
            <div className="clinical-add-note-container">
              <button 
                className="clinical-add-btn"
                onClick={() => setShowQuickActions(!showQuickActions)}
              >
                <i className="fas fa-plus"></i>
                <span>New Note</span>
              </button>
              
              {showQuickActions && (
                <div className="clinical-quick-actions">
                  {CLINICAL_NOTE_TYPES.map((type) => (
                    <button 
                      key={type.value}
                      className="quick-action-item"
                      onClick={() => {
                        if (type.value === 'file') {
                          fileInputRef.current?.click();
                        } else {
                          handleAddNote(type.value);
                        }
                        setShowQuickActions(false);
                      }}
                    >
                      <div 
                        className="quick-action-icon"
                        style={{ backgroundColor: `${type.color}20`, color: type.color }}
                      >
                        <i className={`fas ${type.icon}`}></i>
                      </div>
                      <div className="quick-action-text">
                        <strong>{type.label}</strong>
                        <small>{type.description}</small>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <input 
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenido principal */}
      {isLoading ? (
        <div className="clinical-loading">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-pulse"></div>
          </div>
          <div className="loading-text">
            <span>Loading clinical notes</span>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {filteredNotes.length === 0 ? (
            <div className="clinical-empty-state">
              <div className="empty-icon">
                <i className="fas fa-file-medical-alt"></i>
              </div>
              <h2 className="empty-title">No notes found</h2>
              <p className="empty-description">
                {searchQuery 
                  ? 'Try adjusting your search criteria' 
                  : 'Start by creating the first clinical note for this patient'
                }
              </p>
              {!searchQuery && (
                <button 
                  className="clinical-empty-action"
                  onClick={() => handleAddNote()}
                >
                  <i className="fas fa-plus"></i>
                  <span>Create First Note</span>
                </button>
              )}
            </div>
          ) : (
            <div className="clinical-notes-grid">
              {filteredNotes.map((note, index) => (
                <ClinicalNoteCard key={note.id} note={note} index={index} />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Add note modal */}
      {isAddingNote && (
        <div className="clinical-modal-overlay" onClick={() => setIsAddingNote(false)}>
          <div className="clinical-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div 
                  className="modal-icon"
                  style={{ backgroundColor: getNoteTypeInfo(newNoteType).color }}
                >
                  <i className={`fas ${getNoteTypeInfo(newNoteType).icon}`}></i>
                </div>
                <h3>Create {getNoteTypeInfo(newNoteType).label}</h3>
              </div>
              <button className="modal-close" onClick={() => setIsAddingNote(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSaveNote} className="clinical-form">
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="noteType">Note Type</label>
                  <select 
                    id="noteType" 
                    name="noteType" 
                    value={newNoteType}
                    onChange={(e) => setNewNoteType(e.target.value)}
                    className="clinical-select"
                  >
                    {CLINICAL_NOTE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input 
                    type="text" 
                    id="title" 
                    name="title" 
                    placeholder="Enter note title"
                    className="clinical-input"
                    required
                  />
                </div>
                
                {newNoteType !== 'signature' ? (
                  <div className="form-group">
                    <label htmlFor="content">Content</label>
                    <div className="clinical-text-editor">
                      <div className="editor-toolbar">
                        <button type="button" className="editor-btn" title="Bold">
                          <i className="fas fa-bold"></i>
                        </button>
                        <button type="button" className="editor-btn" title="Italic">
                          <i className="fas fa-italic"></i>
                        </button>
                        <button type="button" className="editor-btn" title="List">
                          <i className="fas fa-list-ul"></i>
                        </button>
                      </div>
                      <textarea
                        id="content"
                        name="content"
                        ref={textareaRef}
                        rows={8}
                        placeholder="Enter clinical note content..."
                        className="clinical-textarea"
                        required
                      ></textarea>
                      <div className="editor-hint">
                        <small>You can use Markdown format for rich text</small>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Digital Signature</label>
                    <div className="clinical-signature-container">
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={200}
                        className="signature-canvas"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                      />
                      <div className="signature-actions">
                        <button 
                          type="button" 
                          className="clinical-btn-secondary"
                          onClick={clearSignature}
                        >
                          <i className="fas fa-eraser"></i>
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>
                    <small>Sign with mouse or trackpad in the area above</small>
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select 
                      id="category" 
                      name="category" 
                      defaultValue="Clinical"
                      className="clinical-select"
                    >
                      {CLINICAL_CATEGORIES.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.value}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="tags">Tags</label>
                    <input 
                      type="text" 
                      id="tags" 
                      name="tags" 
                      placeholder="e.g. assessment, progress, follow-up"
                      className="clinical-input"
                    />
                  </div>
                </div>

                {newNoteType === 'visit_note' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="visitType">Visit Type</label>
                      <select 
                        id="visitType" 
                        name="visitType" 
                        className="clinical-select"
                      >
                        <option value="Therapy Session">Therapy Session</option>
                        <option value="Initial Assessment">Initial Assessment</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Discharge">Discharge</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="therapyType">Therapy Type</label>
                      <select 
                        id="therapyType" 
                        name="therapyType" 
                        className="clinical-select"
                      >
                        <option value="Physical Therapy">Physical Therapy</option>
                        <option value="Occupational Therapy">Occupational Therapy</option>
                        <option value="Speech Therapy">Speech Therapy</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="clinical-btn secondary" 
                  onClick={() => setIsAddingNote(false)}
                  disabled={isSaving}
                >
                  <i className="fas fa-times"></i>
                  <span>Cancel</span>
                </button>
                <button 
                  type="submit" 
                  className="clinical-btn primary"
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
                      <span>Save Note</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View note modal */}
      {activeNoteId && (
        <div className="clinical-modal-overlay" onClick={() => setActiveNoteId(null)}>
          <div className="clinical-modal" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const activeNote = visitNotes.find(note => note.id === activeNoteId);
              if (!activeNote) return null;
              
              const dateFormatted = formatDate(activeNote.created_at);
              const noteTypeInfo = getNoteTypeInfo(activeNote.note_type);
              
              return (
                <>
                  <div className="modal-header">
                    <div className="modal-title">
                      <div 
                        className="modal-icon"
                        style={{ backgroundColor: noteTypeInfo.color }}
                      >
                        <i className={`fas ${noteTypeInfo.icon}`}></i>
                      </div>
                      <h3>{activeNote.title}</h3>
                    </div>
                    <button className="modal-close" onClick={() => setActiveNoteId(null)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <div className="modal-body">
                    <div className="clinical-note-details">
                      <div className="note-meta-header">
                        <div 
                          className="author-avatar"
                          style={{ backgroundColor: getRoleColor(activeNote.user_role) }}
                        >
                          {activeNote.author ? activeNote.author.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="note-meta-info">
                          <div className="author-details">
                            <span className="author-name">{activeNote.author}</span>
                            <span 
                              className="author-role"
                              style={{ color: getRoleColor(activeNote.user_role) }}
                            >
                              {activeNote.user_role}
                            </span>
                          </div>
                          <div className="note-date">
                            <i className="far fa-calendar-alt"></i>
                            <span>{dateFormatted}</span>
                          </div>
                        </div>
                        <div 
                          className="status-badge"
                          style={{ 
                            backgroundColor: activeNote.status === 'Completed' ? '#10b981' : '#f59e0b',
                            color: 'white'
                          }}
                        >
                          {activeNote.status}
                        </div>
                      </div>
                      
                      <div className="note-type-info">
                        <div 
                          className="note-type-badge"
                          style={{
                            backgroundColor: `${noteTypeInfo.color}20`, 
                            color: noteTypeInfo.color
                          }}
                        >
                          <i className={`fas ${noteTypeInfo.icon}`}></i>
                          <span>{noteTypeInfo.label}</span>
                        </div>
                      </div>
                      
                      <div className="note-content-full">
                        {activeNote.note_type === 'signature' ? (
                          <div className="signature-display">
                            <img 
                              src={activeNote.content} 
                              alt="Firma digital" 
                              style={{ maxWidth: '100%', height: 'auto' }} 
                            />
                          </div>
                        ) : (
                          <div className="text-content">
                            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                              {activeNote.content}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {activeNote.visit_info && (
                        <div className="visit-info">
                          <h4>Visit Information</h4>
                          <div className="visit-details">
                            <div className="visit-detail">
                              <span className="detail-label">Tipo de Visita:</span>
                              <span className="detail-value">{activeNote.visit_info.visit_type}</span>
                            </div>
                            <div className="visit-detail">
                              <span className="detail-label">Tipo de Terapia:</span>
                              <span className="detail-value">{activeNote.visit_info.therapy_type}</span>
                            </div>
                            <div className="visit-detail">
                              <span className="detail-label">Duration:</span>
                              <span className="detail-value">{activeNote.visit_info.duration} minutos</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {activeNote.tags && (
                        <div className="note-tags-section">
                          <h4>Etiquetas</h4>
                          <div className="tags-display">
                            {activeNote.tags.split(',').map((tag, idx) => (
                              <span key={idx} className="tag-item">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <div className="note-actions-footer">
                      <div 
                        className="category-display"
                        style={{ 
                          backgroundColor: getCategoryColor(activeNote.category),
                          color: 'white'
                        }}
                      >
                        {activeNote.category}
                      </div>
                    </div>
                    
                    <div className="modal-actions">
                      <button 
                        className="clinical-btn secondary"
                        onClick={() => togglePinNote(activeNote.id)}
                      >
                        <i className="fas fa-thumbtack"></i>
                        <span>{activeNote.is_pinned ? 'Desfijar' : 'Fijar'}</span>
                      </button>
                      <button 
                        className="clinical-btn danger" 
                        onClick={() => { 
                          handleDeleteClick(activeNote); 
                          setActiveNoteId(null); 
                        }}
                      >
                        <i className="fas fa-trash-alt"></i>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && noteToDelete && (
        <div className="clinical-modal-overlay">
          <div className="clinical-modal clinical-delete-modal">
            <div className="modal-header delete-header">
              <h3>Delete Clinical Note</h3>
              <button className="modal-close" onClick={cancelDelete}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body delete-body">
              <div className="delete-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              
              <h4 className="delete-title">
                Are you sure you want to delete this note?
              </h4>
              
              <div className="delete-preview">
                <div className="preview-title">
                  <i className={`fas ${getNoteTypeInfo(noteToDelete.note_type).icon}`}></i>
                  <span>{noteToDelete.title}</span>
                </div>
                
                <div className="preview-meta">
                  <span className="preview-author">
                    <i className="fas fa-user-md"></i>
                    {noteToDelete.author}
                  </span>
                  <span className="preview-date">
                    <i className="fas fa-calendar-alt"></i>
                    {formatDate(noteToDelete.created_at)}
                  </span>
                </div>
              </div>
              
              <div className="delete-warning">
                <i className="fas fa-exclamation-circle"></i>
                <span>This action cannot be undone. The note will be permanently deleted.</span>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="clinical-btn secondary" onClick={cancelDelete}>
                <i className="fas fa-times"></i>
                <span>Cancel</span>
              </button>
              <button className="clinical-btn danger" onClick={confirmDelete}>
                <i className="fas fa-trash-alt"></i>
                <span>Delete Note</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating action button */}
      <div className="clinical-fab" onClick={() => handleAddNote()}>
        <i className="fas fa-plus"></i>
        <div className="fab-tooltip">New Clinical Note</div>
      </div>
    </div>
  );
};

export default NotesComponent;