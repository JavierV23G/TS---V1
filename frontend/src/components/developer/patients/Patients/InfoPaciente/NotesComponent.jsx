import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../login/AuthContext';

// Note types con iconos y colores
const NOTE_TYPES = [
  { value: 'text', label: 'Text Note', icon: 'fa-file-alt', color: '#3b82f6' },
  { value: 'communication-report', label: 'Communication Report', icon: 'fa-comment-dots', color: '#8b5cf6' },
  { value: 'incident-report', label: 'Incident Report', icon: 'fa-exclamation-triangle', color: '#ef4444' },
  { value: 'therapy-order', label: 'Therapy Order', icon: 'fa-clipboard-list', color: '#10b981' },
  { value: 'face-to-face', label: 'Face to Face', icon: 'fa-users', color: '#f59e0b' },
  { value: 'case-conference', label: 'Case Conference', icon: 'fa-briefcase', color: '#6366f1' },
  { value: 'oasis-care-summary', label: 'OASIS Care Summary', icon: 'fa-heartbeat', color: '#ec4899' },
  { value: 'nomnc', label: 'NOMNC', icon: 'fa-file-contract', color: '#64748b' },
  { value: 'kaiser-form', label: 'Kaiser Form', icon: 'fa-file-medical', color: '#0ea5e9' },
  { value: 'maintenance-assessment-form', label: 'Maintenance Assessment Form', icon: 'fa-tasks', color: '#14b8a6' },
  { value: 'signature', label: 'Signature', icon: 'fa-signature', color: '#6b7280' },
  { value: 'file', label: 'File Upload', icon: 'fa-file-upload', color: '#9333ea' },
];

// Categorías con colores
const CATEGORIES = [
  { value: 'Clinical', color: 'rgb(44, 123, 229)' },
  { value: 'Follow-up', color: 'rgb(76, 175, 80)' },
  { value: 'Therapy Session', color: 'rgb(156, 39, 176)' },
  { value: 'Assessment', color: 'rgb(255, 152, 0)' },
  { value: 'Education', color: 'rgb(0, 188, 212)' },
  { value: 'Administrative', color: 'rgb(96, 125, 139)' },
  { value: 'Media', color: 'rgb(244, 67, 54)' },
];

// Colores por rol
const ROLE_COLORS = {
  PT: '#3b82f6',
  OT: '#8b5cf6',
  ST: '#ec4899',
  PTA: '#60a5fa',
  COTA: '#a78bfa',
  ADMIN: '#64748b',
};

const NotesComponent = ({ patient, onUpdateNotes }) => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [newNoteType, setNewNoteType] = useState('text');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [sortBy, setSortBy] = useState('date-desc');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { currentUser } = useAuth();
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const signatureCanvasCtx = useRef(null);
  const isDrawing = useRef(false);

  // API Configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Fetch notes from API
  useEffect(() => {
    const fetchNotes = async () => {
      if (!patient?.id) {
        setNotes([]);
        setFilteredNotes([]);
        setCategories(['all']);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/patients/${patient.id}/notes/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Agregar headers de autorización si es necesario
            // 'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch notes: ${response.status} ${response.statusText}`);
        }
        
        const notesData = await response.json();
        
        // Extraer categorías únicas
        const uniqueCategories = [...new Set(notesData.map(note => note.category || 'Clinical'))];
        setCategories(['all', ...uniqueCategories]);
        
        setNotes(notesData);
        setFilteredNotes(notesData);
        
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError(err.message);
        setNotes([]);
        setFilteredNotes([]);
        setCategories(['all']);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotes();
  }, [patient?.id, API_BASE_URL]);

  // Filter and sort notes
  useEffect(() => {
    let result = [...notes];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        note => note.title?.toLowerCase().includes(query) || 
                note.content?.toLowerCase().includes(query) ||
                note.author?.toLowerCase().includes(query) ||
                note.note_type?.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(note => note.category === selectedCategory);
    }
    
    // Sort notes
    result = sortNotes(result, sortBy);
    
    setFilteredNotes(result);
  }, [notes, searchQuery, sortBy, selectedCategory]);

  // Sort notes based on criteria
  const sortNotes = (notesToSort, sortCriteria) => {
    const sortedNotes = [...notesToSort];
    
    switch (sortCriteria) {
      case 'date-desc':
        return sortedNotes.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
      case 'date-asc':
        return sortedNotes.sort((a, b) => new Date(a.created_at || a.date) - new Date(b.created_at || b.date));
      case 'title-asc':
        return sortedNotes.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'title-desc':
        return sortedNotes.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      case 'author':
        return sortedNotes.sort((a, b) => (a.author || '').localeCompare(b.author || ''));
      case 'category':
        return sortedNotes.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
      default:
        return sortedNotes;
    }
  };

  // Create new note via API
  const createNote = async (noteData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patient.id}/notes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Agregar headers de autorización si es necesario
        },
        body: JSON.stringify(noteData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create note: ${response.status} ${response.statusText}`);
      }
      
      const newNote = await response.json();
      
      // Actualizar la lista de notas
      setNotes(prevNotes => [newNote, ...prevNotes]);
      
      return newNote;
    } catch (err) {
      console.error('Error creating note:', err);
      throw err;
    }
  };

  // Delete note via API
  const deleteNote = async (noteId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patient.id}/notes/${noteId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Agregar headers de autorización si es necesario
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete note: ${response.status} ${response.statusText}`);
      }
      
      
      // Actualizar la lista de notas
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      
    } catch (err) {
      console.error('Error deleting note:', err);
      throw err;
    }
  };

  // Update note via API
  const updateNote = async (noteId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patient.id}/notes/${noteId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Agregar headers de autorización si es necesario
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update note: ${response.status} ${response.statusText}`);
      }
      
      const updatedNote = await response.json();
      
      // Actualizar la lista de notas
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === noteId ? updatedNote : note)
      );
      
      return updatedNote;
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  };

  // Toggle note pinned status
  const togglePinNote = async (noteId) => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) return;
      
      await updateNote(noteId, { is_pinned: !note.is_pinned });
    } catch (err) {
      console.error('Error toggling pin status:', err);
      setError('Failed to update note pin status');
    }
  };

  // Handle deleting a note
  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    setShowDeleteConfirm(true);
  };

  // Confirm note deletion
  const confirmDelete = async () => {
    if (!noteToDelete) return;
    
    try {
      await deleteNote(noteToDelete.id);
      setShowDeleteConfirm(false);
      setNoteToDelete(null);
      
      if (activeNoteId === noteToDelete.id) {
        setActiveNoteId(null);
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setNoteToDelete(null);
  };

  // Initialize new note form
  const handleAddNote = (type = 'text') => {
    setNewNoteType(type);
    setIsAddingNote(true);
    setError(null);
  };

  // Show note details
  const handleViewNote = (noteId) => {
    setActiveNoteId(noteId);
  };

  // Handle saving a new note - CORREGIDO
  const handleSaveNote = async (event) => {
    // IMPORTANTE: Prevenir el comportamiento por defecto
    event.preventDefault();
    
    if (isSaving) return; // Prevenir múltiples envíos
    
    try {
      setIsSaving(true);
      setError(null);
      
      // Obtener los datos del formulario
      const formData = new FormData(event.target);
      const title = formData.get('title')?.trim();
      const category = formData.get('category') || 'Clinical';
      const tags = formData.get('tags')?.split(',').map(tag => tag.trim()).filter(Boolean) || [];
      const noteType = formData.get('noteType') || 'text';
      
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
      
      const authorName = currentUser?.fullname || currentUser?.username || 'Current User';
      const userRole = currentUser?.role || 'Staff';
      
      const noteData = {
        title,
        content,
        note_type: noteType,
        category,
        author: authorName,
        user_role: userRole,
        tags: tags.join(','), // O enviar como array dependiendo de tu API
        is_pinned: false,
        patient_id: patient.id
      };
      
      
      await createNote(noteData);
      setIsAddingNote(false);
      
      // Limpiar el formulario
      event.target.reset();
      
    } catch (err) {
      console.error('Error saving note:', err);
      setError('Failed to save note: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;
    
    const file = files[0];
    const fileType = file.type.split('/')[0];
    
    // Aquí deberías subir el archivo a tu servidor y obtener la URL
    // Por ahora, usaremos URL.createObjectURL como placeholder
    const fileUrl = URL.createObjectURL(file);
    
    const authorName = currentUser?.fullname || currentUser?.username || 'Current User';
    const userRole = currentUser?.role || 'Staff';
    
    const noteData = {
      title: file.name,
      content: fileUrl, // En producción, esta debería ser la URL del archivo subido
      note_type: 'file',
      category: 'Media',
      author: authorName,
      user_role: userRole,
      tags: fileType + ',uploaded',
      is_pinned: false,
      patient_id: patient.id,
      file_type: fileType
    };
    
    try {
      await createNote(noteData);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file');
    }
  };

  // Signature drawing functions
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

  // Clear signature canvas
  const clearSignature = () => {
    if (!signatureCanvasCtx.current || !canvasRef.current) return;
    
    const ctx = signatureCanvasCtx.current;
    const canvas = canvasRef.current;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Initialize canvas for signature
  useEffect(() => {
    if (isAddingNote && newNoteType === 'signature' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      signatureCanvasCtx.current = ctx;
      
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'black';
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [isAddingNote, newNoteType]);

  // Format date helper function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format short date helper
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
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

  // Get user role color
  const getRoleColor = (role) => {
    return ROLE_COLORS[role?.toUpperCase()] || '#64748b';
  };

  // Get category color
  const getCategoryColor = (category) => {
    const foundCategory = CATEGORIES.find(cat => 
      cat.value.toLowerCase() === category?.toLowerCase()
    );
    return foundCategory?.color || 'rgb(100, 116, 139)';
  };

  // Get note type info
  const getNoteTypeInfo = (noteType) => {
    return NOTE_TYPES.find(type => type.value === noteType) || NOTE_TYPES[0];
  };

  // Note card component
  const NoteCard = ({ note, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const dateFormatted = formatShortDate(note.created_at || note.date || new Date().toISOString());
    const noteTypeInfo = getNoteTypeInfo(note.note_type || note.noteType);
    
    return (
      <div
        className={`note-card ${note.is_pinned || note.isPinned ? 'pinned' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="note-header">
          <div className="note-category">
            <span 
              className="category-indicator" 
              style={{ backgroundColor: getCategoryColor(note.category) }}
            ></span>
            <span className="category-name">{note.category || 'Clinical'}</span>
          </div>
          <div className="note-actions">
            {isHovered && (
              <div className="action-buttons">
                <button 
                  className="action-btn view-btn" 
                  onClick={() => handleViewNote(note.id)}
                  title="View Note"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button 
                  className="action-btn pin-btn" 
                  onClick={() => togglePinNote(note.id)}
                  title={(note.is_pinned || note.isPinned) ? "Unpin Note" : "Pin Note"}
                >
                  <i className="fas fa-thumbtack"></i>
                </button>
                <button 
                  className="action-btn delete-btn" 
                  onClick={() => handleDeleteClick(note)}
                  title="Delete Note"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="note-content" onClick={() => handleViewNote(note.id)}>
          <h3 className="note-title">
            {(note.is_pinned || note.isPinned) && <i className="fas fa-thumbtack pin-icon"></i>}
            {note.title}
          </h3>
          <div className="note-type-label">
            <span className="note-type-badge" style={{backgroundColor: `${noteTypeInfo.color}20`, color: noteTypeInfo.color}}>
              <i className={`fas ${noteTypeInfo.icon}`}></i> {noteTypeInfo.label}
            </span>
          </div>
          
          <div className="note-text">
            <p>{note.content && note.content.length > 120 ? `${note.content.substring(0, 120)}...` : note.content}</p>
          </div>
        </div>
        
        <div className="note-footer">
          <div className="note-date-block">
            <div className="date-box">
              <span className="date-day">{dateFormatted.day}</span>
              <span className="date-month">{dateFormatted.month}</span>
            </div>
            <div className="date-year-time">
              <span className="date-year">{dateFormatted.year}</span>
              <span className="date-time">{dateFormatted.time}</span>
            </div>
          </div>
          
          <div className="note-meta">
            <div className="note-author">
              <div 
                className="author-icon" 
                style={{
                  backgroundColor: getRoleColor(note.user_role || note.userRole)
                }}
              >
                {note.author ? note.author.charAt(0) : 'U'}
              </div>
              <div className="author-info">
                <span className="author-name">{note.author || 'Unknown'}</span>
                <span className="author-role">{note.user_role || note.userRole || 'Staff'}</span>
              </div>
            </div>
            
            {note.tags && (
              <div className="note-tags">
                {(typeof note.tags === 'string' ? note.tags.split(',') : note.tags)
                  .slice(0, 3)
                  .map((tag, idx) => (
                    <span key={idx} className="tag">
                      {tag.trim()}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="notes-component">
      {/* Error display */}
      {error && (
        <div className="error-banner" style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '6px',
          margin: '16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="notes-header">
        <div className="header-left">
          <div className="icon-wrapper">
            <i className="fas fa-sticky-note"></i>
          </div>
          <h2>Patient Notes</h2>
          <div className="note-count">{filteredNotes.length} notes</div>
        </div>
        
        <div className="header-actions">
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          
          <div className="filter-group">
            <div className="category-filter">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sort-filter">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="author">Author</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
          
          <div className="view-actions">
            <div className="add-note-container">
              <button 
                className="add-note-btn"
                onClick={() => setShowQuickActions(!showQuickActions)}
                title="Add Note"
              >
                <i className="fas fa-plus"></i>
                <span>Add Note</span>
              </button>
              
              {showQuickActions && (
                <div className="quick-actions">
                  {NOTE_TYPES.map((type) => (
                    <button 
                      key={type.value}
                      onClick={() => {
                        if (type.value === 'file') {
                          fileInputRef.current?.click();
                        } else {
                          handleAddNote(type.value);
                        }
                        setShowQuickActions(false);
                      }}
                    >
                      <i className={`fas ${type.icon}`} style={{color: type.color}}></i>
                      <span>{type.label}</span>
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
      
      {isLoading ? (
        <div className="notes-loading">
          <div className="loading-spinner">
            <div className="spinner-icon">
              <i className="fas fa-circle-notch fa-spin"></i>
            </div>
            <div className="loading-text">
              <span>Loading notes</span>
              <div className="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {filteredNotes.length === 0 ? (
            <div className="no-notes">
              <div className="empty-state">
                <i className="fas fa-sticky-note empty-icon"></i>
                <h3>No notes found</h3>
                <p>{searchQuery ? 'Try adjusting your search criteria' : 'Start by adding your first note for this patient'}</p>
                {!searchQuery && (
                  <button className="add-first-note" onClick={() => handleAddNote()}>
                    <i className="fas fa-plus"></i>
                    Add First Note
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((note, index) => (
                <div key={note.id} className="note-wrapper">
                  <NoteCard note={note} index={index} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Add Note Modal - FORMULARIO CORREGIDO */}
      {isAddingNote && (
        <div className="modal-overlay" onClick={() => setIsAddingNote(false)}>
          <div className="note-modal add-note-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {(() => {
                  const typeInfo = getNoteTypeInfo(newNoteType);
                  return (
                    <>
                      <i className={`fas ${typeInfo.icon}`} style={{color: typeInfo.color, marginRight: '8px'}}></i>
                      Add {typeInfo.label}
                    </>
                  );
                })()}
              </h3>
              <button className="close-modal" onClick={() => setIsAddingNote(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* FORMULARIO CORREGIDO - onSubmit en lugar de button onClick */}
            <form onSubmit={handleSaveNote}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="noteType">Note Type</label>
                  <select 
                    id="noteType" 
                    name="noteType" 
                    value={newNoteType}
                    onChange={(e) => setNewNoteType(e.target.value)}
                    className="note-type-select"
                  >
                    {NOTE_TYPES.map((type) => (
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
                    required
                  />
                </div>
                
                {newNoteType !== 'signature' ? (
                  <div className="form-group">
                    <label htmlFor="content">Content</label>
                    <textarea
                      id="content"
                      name="content"
                      ref={textareaRef}
                      rows={10}
                      placeholder="Enter note content..."
                      className="custom-textarea"
                      required
                    ></textarea>
                    <div className="text-editor-toolbar">
                      <button type="button" onClick={() => {
                        if (textareaRef.current) {
                          const textarea = textareaRef.current;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const before = text.substring(0, start);
                          const after = text.substring(end);
                          textarea.value = before + '**Bold text**' + after;
                          textarea.focus();
                        }
                      }}>
                        <i className="fas fa-bold"></i>
                      </button>
                      <button type="button" onClick={() => {
                        if (textareaRef.current) {
                          const textarea = textareaRef.current;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const before = text.substring(0, start);
                          const after = text.substring(end);
                          textarea.value = before + '*Italic text*' + after;
                          textarea.focus();
                        }
                      }}>
                        <i className="fas fa-italic"></i>
                      </button>
                      <button type="button" onClick={() => {
                        if (textareaRef.current) {
                          const textarea = textareaRef.current;
                          const start = textarea.selectionStart;
                          const text = textarea.value;
                          const before = text.substring(0, start);
                          const after = text.substring(start);
                          textarea.value = before + '# Heading\n' + after;
                          textarea.focus();
                        }
                      }}>
                        <i className="fas fa-heading"></i>
                      </button>
                      <button type="button" onClick={() => {
                        if (textareaRef.current) {
                          const textarea = textareaRef.current;
                          const start = textarea.selectionStart;
                          const text = textarea.value;
                          const before = text.substring(0, start);
                          const after = text.substring(start);
                          textarea.value = before + '\n- List item\n- List item\n- List item\n' + after;
                          textarea.focus();
                        }
                      }}>
                        <i className="fas fa-list-ul"></i>
                      </button>
                      <button type="button" onClick={() => {
                        if (textareaRef.current) {
                          const textarea = textareaRef.current;
                          const start = textarea.selectionStart;
                          const text = textarea.value;
                          const before = text.substring(0, start);
                          const after = text.substring(start);
                          textarea.value = before + '\n1. Numbered item\n2. Numbered item\n3. Numbered item\n' + after;
                          textarea.focus();
                        }
                      }}>
                        <i className="fas fa-list-ol"></i>
                      </button>
                    </div>
                    <div className="textarea-note">
                      <small>Tip: You can use Markdown for formatting (*italic*, **bold**, # heading, etc.)</small>
                    </div>
                  </div>
                ) : (
                  <div className="form-group signature-group">
                    <label>Signature</label>
                    <div className="signature-container">
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
                    </div>
                    <button type="button" className="clear-signature" onClick={clearSignature}>
                      <i className="fas fa-eraser"></i> Clear
                    </button>
                    <div className="signature-instruction">
                      <small>Sign using your mouse or touchpad in the box above</small>
                    </div>
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select id="category" name="category" defaultValue="Clinical">
                      {CATEGORIES.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.value}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="tags">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      id="tags" 
                      name="tags" 
                      placeholder="e.g. important, follow-up, review"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setIsAddingNote(false)}
                  disabled={isSaving}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Save Note
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View Note Modal */}
      {activeNoteId && (
        <div className="modal-overlay" onClick={() => setActiveNoteId(null)}>
          <div className="note-modal view-note-modal" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const activeNote = notes.find(note => note.id === activeNoteId);
              if (!activeNote) return null;
              
              const dateFormatted = formatShortDate(activeNote.created_at || activeNote.date || new Date().toISOString());
              const noteTypeInfo = getNoteTypeInfo(activeNote.note_type || activeNote.noteType);
              
              return (
                <>
                  <div className="modal-header">
                    <div className="modal-title">
                      <div 
                        className="category-indicator" 
                        style={{ backgroundColor: getCategoryColor(activeNote.category) }}
                      ></div>
                      <h3>{activeNote.title}</h3>
                    </div>
                    <div className="modal-actions">
                      <button 
                        className="action-btn pin-btn" 
                        onClick={() => togglePinNote(activeNote.id)}
                        title={(activeNote.is_pinned || activeNote.isPinned) ? "Unpin Note" : "Pin Note"}
                      >
                        <i className="fas fa-thumbtack"></i>
                      </button>
                      <button className="close-modal" onClick={() => setActiveNoteId(null)}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="modal-body">
                    <div className="view-note-info">
                      <div 
                        className="view-author-avatar"
                        style={{ backgroundColor: getRoleColor(activeNote.user_role || activeNote.userRole) }}
                      >
                        {activeNote.author ? activeNote.author.charAt(0) : 'U'}
                      </div>
                      <div className="view-note-metadata">
                        <div className="view-note-author">
                          <span className="view-author-name">{activeNote.author || 'Unknown'}</span>
                          <span 
                            className="view-author-role"
                            style={{ color: getRoleColor(activeNote.user_role || activeNote.userRole) }}
                          >
                            {activeNote.user_role || activeNote.userRole || 'Staff'}
                          </span>
                        </div>
                        <div className="view-note-date">
                          <span className="date-display">
                            <i className="far fa-calendar-alt"></i>
                            {dateFormatted.month} {dateFormatted.day}, {dateFormatted.year} at {dateFormatted.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="note-type-label">
                      <span className="note-type-badge" style={{
                        backgroundColor: `${noteTypeInfo.color}20`, 
                        color: noteTypeInfo.color
                      }}>
                        <i className={`fas ${noteTypeInfo.icon}`}></i> {noteTypeInfo.label}
                      </span>
                    </div>
                    
                    {(activeNote.note_type || activeNote.noteType) === 'signature' ? (
                      <div className="note-full-signature">
                        <img src={activeNote.content} alt="Signature" style={{maxWidth: '100%', height: 'auto'}} />
                      </div>
                    ) : (
                      <div className="note-full-text">
                        <p style={{whiteSpace: 'pre-wrap'}}>{activeNote.content}</p>
                      </div>
                    )}
                    
                    {activeNote.tags && (
                      <div className="view-note-tags">
                        <div className="tags-header">
                          <i className="fas fa-tags"></i> Tags
                        </div>
                        <div className="tags-list">
                          {(typeof activeNote.tags === 'string' ? activeNote.tags.split(',') : activeNote.tags).map((tag, idx) => (
                            <span key={idx} className="tag">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="modal-footer">
                    <div className="note-details">
                      <div className="category-info">
                        <span className="category-label">Category:</span>
                        <span 
                          className="category-badge"
                          style={{ 
                            backgroundColor: getCategoryColor(activeNote.category),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          {activeNote.category || 'Clinical'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="modal-actions">
                      <button 
                        className="delete-btn" 
                        onClick={() => { 
                          handleDeleteClick(activeNote); 
                          setActiveNoteId(null); 
                        }}
                      >
                        <i className="fas fa-trash-alt"></i> Delete
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && noteToDelete && (
        <div className="modal-overlay">
          <div className="note-modal delete-confirm-modal">
            <div className="modal-header delete-header">
              <h3>Delete Note</h3>
              <button className="close-modal" onClick={cancelDelete}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body delete-body">
              <div className="delete-warning-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              
              <h4 className="delete-title">Are you sure you want to delete this note?</h4>
              
              <div className="delete-note-preview">
                <div className="preview-title">
                  <i className={`fas ${getNoteTypeInfo(noteToDelete.note_type || noteToDelete.noteType).icon}`}></i>
                  {noteToDelete.title}
                </div>
                
                <div className="preview-details">
                  <span className="preview-author">
                    <i className="fas fa-user-md"></i> {noteToDelete.author || 'Unknown'}
                  </span>
                  <span className="preview-date">
                    <i className="fas fa-calendar-alt"></i> {formatDate(noteToDelete.created_at || noteToDelete.date || new Date().toISOString())}
                  </span>
                </div>
              </div>
              
              <div className="delete-warning">
                <i className="fas fa-exclamation-circle"></i>
                <span>This action cannot be undone.</span>
              </div>
            </div>
            
            <div className="modal-footer delete-footer">
              <button className="cancel-btn" onClick={cancelDelete}>
                <i className="fas fa-times"></i> Cancel
              </button>
              <button className="delete-confirm-btn" onClick={confirmDelete}>
                <i className="fas fa-trash-alt"></i> Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Action Button */}
      <div className="floating-action-button">
        <button 
          className="fab-button"
          onClick={() => handleAddNote()}
        >
          <i className="fas fa-plus"></i>
          <span className="fab-tooltip">Add Note</span>
        </button>
      </div>
    </div>
  );
};

export default NotesComponent;