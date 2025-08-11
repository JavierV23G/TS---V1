import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../login/AuthContext';
import '../../../../../styles/developer/Patients/InfoPaciente/CommunicationRecords.scss';

const CommunicationRecords = ({ patient, currentCertPeriod }) => {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentCategory, setCommentCategory] = useState('therapy-order');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [disciplineFilter, setDisciplineFilter] = useState('all');
  const [filteredRecords, setFilteredRecords] = useState([]);
  
  const { currentUser } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Local state for certification periods
  const [localCurrentCertPeriod, setLocalCurrentCertPeriod] = useState(null);
  const [isLoadingCertPeriods, setIsLoadingCertPeriods] = useState(false);

  // Fetch certification periods if not provided in props
  useEffect(() => {
    const fetchCertificationPeriods = async () => {
      if (currentCertPeriod?.id || !patient?.id) {
        setLocalCurrentCertPeriod(currentCertPeriod);
        return;
      }
      
      try {
        setIsLoadingCertPeriods(true);
        
        const response = await fetch(`${API_BASE_URL}/patient/${patient.id}/cert-periods`);
        if (response.ok) {
          const certData = await response.json();
          const activePeriod = certData.find(period => period.is_active) || certData[0];
          setLocalCurrentCertPeriod(activePeriod);
        }
      } catch (err) {
        console.error('Error fetching certification periods:', err);
      } finally {
        setIsLoadingCertPeriods(false);
      }
    };

    fetchCertificationPeriods();
  }, [patient?.id, currentCertPeriod, API_BASE_URL]);

  // Use local cert period or fallback to prop
  const effectiveCertPeriod = localCurrentCertPeriod || currentCertPeriod;

  // Communication types for clinical notes  
  const COMMUNICATION_TYPES = [
    { value: 'therapy-order', label: 'Therapy Order', icon: 'fa-clipboard-list', color: '#10b981' },
    { value: 'nomnc', label: 'NOMNC', icon: 'fa-file-contract', color: '#64748b' },
    { value: 'communication-note', label: 'Communication Note', icon: 'fa-comment-dots', color: '#8b5cf6' }
  ];

  // Fetch communication records from API
  useEffect(() => {
    const fetchComments = async () => {
      const certPeriodId = effectiveCertPeriod?.id;
      
      if (!certPeriodId) {
        setRecords([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/communication-records/cert-period/${certPeriodId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch communication records: ${response.status} ${response.statusText}`);
        }
        
        const recordsData = await response.json();
        setRecords(recordsData);
        
      } catch (err) {
        console.error('Error fetching records:', err);
        setError(err.message);
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [effectiveCertPeriod?.id, API_BASE_URL, isLoadingCertPeriods]);

  // Filter records by discipline
  useEffect(() => {
    let result = [...records];
    
    // Filter by discipline
    if (disciplineFilter !== 'all') {
      result = result.filter(record => {
        const userRole = record.staff_role?.toLowerCase();
        return userRole === disciplineFilter.toLowerCase();
      });
    }
    
    setFilteredRecords(result);
  }, [records, disciplineFilter]);

  // Add new comment
  const handleAddComment = async (event) => {
    event.preventDefault();
    
    if (isSaving || !newComment.trim()) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      // Try to find certification period ID
      const certPeriodId = effectiveCertPeriod?.id;
      
      if (!certPeriodId) {
        setError('No active certification period found. Please ensure the patient has an active certification period.');
        return;
      }

      // Get the label from the selected category
      const selectedCategoryInfo = COMMUNICATION_TYPES.find(c => c.value === commentCategory);
      const title = selectedCategoryInfo ? selectedCategoryInfo.label : 'Clinical Comment';

      if (editingComment) {
        // Update existing comment
        const updateData = {
          title,
          content: newComment.trim()
        };
        
        await updateComment(editingComment.id, updateData);
        setEditingComment(null);
      } else {
        // Create new comment
        const recordData = {
          certification_period_id: certPeriodId,
          title,
          content: newComment.trim(),
          created_by: currentUser?.id || 1 // Fallback to ID 1 if no current user
        };
        
        const response = await fetch(`${API_BASE_URL}/communication-records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recordData),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create record: ${response.status} ${response.statusText}`);
        }
        
        const newRecord = await response.json();
        
        // Use the new record directly from API response
        setRecords(prevRecords => [newRecord, ...prevRecords]);
      }
      
      setNewComment('');
      setCommentCategory('therapy-order');
      setShowCommentModal(false);
      
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete comment - show confirmation modal
  const handleDeleteComment = (comment) => {
    setCommentToDelete(comment);
    setShowDeleteModal(true);
  };

  // Confirm delete comment
  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      setDeleting(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/communication-records/${commentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete record: ${response.status} ${response.statusText}`);
      }
      
      setRecords(prevRecords => prevRecords.filter(record => record.id !== commentToDelete.id));
      setSelectedComment(null); // Close view modal if open
      setShowDeleteModal(false);
      setCommentToDelete(null);
      
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCommentToDelete(null);
  };

  // Handle reply to comment
  const handleReplyToComment = (record) => {
    // Close view modal and open new comment modal with reply context
    setSelectedComment(null);
    setCommentCategory('communication-note'); // Default for replies
    setNewComment(`@${record.staff_name || 'Staff'}: `); // Pre-fill with mention
    setShowCommentModal(true);
  };

  // Handle edit comment
  const handleEditComment = (record) => {
    setEditingComment(record);
    setNewComment(record.content);
    // Find the category based on the record title
    const typeInfo = COMMUNICATION_TYPES.find(t => t.label === record.title);
    setCommentCategory(typeInfo ? typeInfo.value : 'therapy-order');
    setSelectedComment(null); // Close view modal
    setShowCommentModal(true);
  };

  // Update comment via API
  const updateComment = async (commentId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/communication-records/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update record: ${response.status} ${response.statusText}`);
      }
      
      const updatedRecord = await response.json();
      
      // Use the updated record directly from API response
      setRecords(prevRecords => 
        prevRecords.map(record => record.id === commentId ? updatedRecord : record)
      );
      
      return updatedRecord;
    } catch (err) {
      console.error('Error updating record:', err);
      throw err;
    }
  };

  // Format date for display - Using local timezone only
  const formatDate = (dateString) => {
    // Simple date parsing - treat everything as local time
    const date = new Date(dateString);
    
    // Verify date is valid
    if (isNaN(date.getTime())) {
      return {
        relative: 'Invalid date',
        time: '--:--',
        full: 'Invalid date'
      };
    }
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Simple time formatting - local timezone
    const timeOptions = { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true
    };
    
    const fullDateOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    };
    
    if (diffDays === 0) {
      return {
        relative: 'Today',
        time: date.toLocaleTimeString('en-US', timeOptions),
        full: date.toLocaleDateString('en-US', fullDateOptions)
      };
    } else if (diffDays === 1) {
      return {
        relative: 'Yesterday',
        time: date.toLocaleTimeString('en-US', timeOptions),
        full: date.toLocaleDateString('en-US', fullDateOptions)
      };
    } else if (diffDays <= 7) {
      return {
        relative: `${diffDays} days ago`,
        time: date.toLocaleTimeString('en-US', timeOptions),
        full: date.toLocaleDateString('en-US', fullDateOptions)
      };
    } else {
      return {
        relative: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: date.toLocaleTimeString('en-US', timeOptions),
        full: date.toLocaleDateString('en-US', fullDateOptions)
      };
    }
  };

  // Get category info using the backup's approach
  const getCategoryInfo = (title) => {
    return COMMUNICATION_TYPES.find(type => type.label === title) || COMMUNICATION_TYPES[0];
  };

  // Get role color
  const getRoleColor = (role) => {
    const colors = {
      PT: '#3b82f6',
      PTA: '#60a5fa',
      OT: '#8b5cf6',
      COTA: '#a78bfa',
      ST: '#ec4899',
      STA: '#f472b6',
      ADMIN: '#6b7280',
      DEVELOPER: '#10b981'
    };
    return colors[role?.toUpperCase()] || '#6b7280';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ef4444',
      normal: '#10b981',
      low: '#6b7280'
    };
    return colors[priority] || colors.normal;
  };

  return (
    <div className="clinical-comments">
      {/* Error banner */}
      {error && (
        <div className="error-banner">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="comments-header">
        <div className="header-content">
          <div className="title-info">
            <div className="clinical-icon">
              <i className="fas fa-comments"></i>
            </div>
            <div className="title-text">
              <h1>Communication Records</h1>
              <p>Patient communication records and clinical notes</p>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="comments-counter">
              <span className="number">{filteredRecords.length}</span>
              <span className="label">Records</span>
            </div>
            
            <div className="filter-group">
              <div className="discipline-filter">
                <div className="filter-label">
                  <i className="fas fa-filter"></i>
                  <span>Filter by:</span>
                </div>
                <div className="select-wrapper">
                  <select 
                    value={disciplineFilter}
                    onChange={(e) => setDisciplineFilter(e.target.value)}
                    className="discipline-select"
                  >
                    <option value="all">🏥 All Disciplines</option>
                    <option value="pt">🏃 Physical Therapy (PT)</option>
                    <option value="ot">🖐️ Occupational Therapy (OT)</option>
                    <option value="st">🗣️ Speech Therapy (ST)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <button 
              className="new-comment-btn"
              onClick={() => setShowCommentModal(true)}
            >
              <i className="fas fa-plus"></i>
              <span>Add Record</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {isLoading ? (
          <div className="loading">
            <div className="spinner">
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="circle"></div>
            </div>
            <p>Loading clinical records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-comment-medical"></i>
            </div>
            <h2>{disciplineFilter === 'all' ? 'No records available' : `No records from ${disciplineFilter.toUpperCase()}`}</h2>
            <p>{disciplineFilter === 'all' ? 'Start by adding the first clinical record for this patient' : `No records found from ${disciplineFilter.toUpperCase()} discipline. Try changing the filter or add a new record.`}</p>
            <button 
              className="first-comment-btn"
              onClick={() => setShowCommentModal(true)}
            >
              <i className="fas fa-plus"></i>
              <span>Add First Record</span>
            </button>
          </div>
        ) : (
          <div className="comments-timeline">
            {filteredRecords.map((record) => {
              const date = formatDate(record.created_at);
              const categoryInfo = getCategoryInfo(record.title);
              const roleColor = getRoleColor(record.staff_role);
              const priorityColor = getPriorityColor('normal');
              
              return (
                <div 
                  key={record.id} 
                  className="comment-card"
                  onClick={() => setSelectedComment(record)}
                >
                  {/* Timeline connector */}
                  <div className="timeline-connector">
                    <div 
                      className="timeline-dot"
                      style={{ backgroundColor: categoryInfo.color }}
                    >
                      <i className={`fas ${categoryInfo.icon}`}></i>
                    </div>
                    <div className="timeline-line"></div>
                  </div>
                  
                  {/* Comment content */}
                  <div className="comment-content">
                    <div className="comment-header">
                      <div className="comment-meta">
                        <div className="author-info">
                          <div 
                            className="author-avatar"
                            style={{ backgroundColor: roleColor }}
                          >
                            {record.staff_name ? record.staff_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="author-details">
                            <span className="author-name">{record.staff_name || 'Unknown'}</span>
                            <span className="author-role">{record.staff_role || 'Staff'}</span>
                          </div>
                        </div>
                        
                        <div className="comment-badges">
                          <div 
                            className="category-badge"
                            style={{ 
                              backgroundColor: `${categoryInfo.color}20`,
                              color: categoryInfo.color 
                            }}
                          >
                            <i className={`fas ${categoryInfo.icon}`}></i>
                            <span>{categoryInfo.label}</span>
                          </div>
                          {false && (
                            <div 
                              className="priority-badge"
                              style={{ 
                                backgroundColor: `${priorityColor}20`,
                                color: priorityColor 
                              }}
                            >
                              <i className="fas fa-exclamation"></i>
                              <span>High Priority</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="comment-date">
                        <span className="relative-date">{date.relative}</span>
                        <span className="exact-time">{date.time}</span>
                      </div>
                    </div>
                    
                    <div className="comment-body">
                      <p>{record.content}</p>
                    </div>
                    
                    <div className="comment-footer">
                      <div className="action-buttons">
                        <button 
                          className="action-btn reply-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReplyToComment(record);
                          }}
                        >
                          <i className="fas fa-reply"></i>
                          <span>Reply</span>
                        </button>
                        <button 
                          className="action-btn edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditComment(record);
                          }}
                        >
                          <i className="fas fa-edit"></i>
                          <span>Edit</span>
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteComment(record);
                          }}
                        >
                          <i className="fas fa-trash-alt"></i>
                          <span>Delete</span>
                        </button>
                      </div>
                      <span className="comment-timestamp">{date.full}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add comment modal */}
      {showCommentModal && (
        <div className="modal-overlay" onClick={() => setShowCommentModal(false)}>
          <div className="clinical-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-icon">
                  <i className="fas fa-comment-plus"></i>
                </div>
                <h3>{editingComment ? 'Edit Clinical Comment' : 'Add Clinical Comment'}</h3>
              </div>
              <button 
                className="close-btn"
                onClick={() => setShowCommentModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleAddComment} className="comment-form">
              <div className="modal-body">
                <div className="field-group">
                  <label htmlFor="category">Comment Category</label>
                  <select 
                    id="category" 
                    value={commentCategory}
                    onChange={(e) => setCommentCategory(e.target.value)}
                    className="clinical-select"
                  >
                    {COMMUNICATION_TYPES.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="field-group">
                  <label htmlFor="comment">Clinical Comment</label>
                  <textarea
                    id="comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={6}
                    placeholder="Enter your clinical observation, progress note, or comment here..."
                    className="clinical-textarea"
                    required
                  ></textarea>
                  <div className="character-count">
                    {newComment.length}/500 characters
                  </div>
                </div>

                <div className="comment-preview">
                  <h4>Preview</h4>
                  <div className="preview-card">
                    <div className="preview-meta">
                      <div className="preview-author">
                        <div 
                          className="preview-avatar"
                          style={{ backgroundColor: getRoleColor(currentUser?.role) }}
                        >
                          {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="preview-details">
                          <span>{currentUser?.fullname || currentUser?.username || 'Current User'}</span>
                          <span>{currentUser?.role || 'Staff'}</span>
                        </div>
                      </div>
                      <div 
                        className="preview-category"
                        style={{ 
                          backgroundColor: `${getCategoryInfo(commentCategory).color}20`,
                          color: getCategoryInfo(commentCategory).color 
                        }}
                      >
                        <i className={`fas ${getCategoryInfo(commentCategory).icon}`}></i>
                        <span>{getCategoryInfo(commentCategory).label}</span>
                      </div>
                    </div>
                    <div className="preview-content">
                      {newComment || 'Your comment will appear here...'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setShowCommentModal(false)}
                  disabled={isSaving}
                >
                  <i className="fas fa-times"></i>
                  <span>Cancel</span>
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isSaving || !newComment.trim()}
                >
                  {isSaving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>{editingComment ? 'Updating...' : 'Adding...'}</span>
                    </>
                  ) : (
                    <>
                      <i className={`fas ${editingComment ? 'fa-save' : 'fa-plus'}`}></i>
                      <span>{editingComment ? 'Update Comment' : 'Add Comment'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View comment modal */}
      {selectedComment && (
        <div className="modal-overlay" onClick={() => setSelectedComment(null)}>
          <div className="clinical-modal view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-icon">
                  <i className={`fas ${getCategoryInfo(selectedComment.title).icon}`}></i>
                </div>
                <h3>{getCategoryInfo(selectedComment.title).label}</h3>
              </div>
              <button 
                className="close-btn"
                onClick={() => setSelectedComment(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="comment-details">
                <div className="comment-author-full">
                  <div 
                    className="large-avatar"
                    style={{ backgroundColor: getRoleColor(selectedComment.staff_role) }}
                  >
                    {selectedComment.staff_name ? selectedComment.staff_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="author-info-complete">
                    <h4>{selectedComment.staff_name || 'Unknown'}</h4>
                    <p>{selectedComment.staff_role || 'Staff'}</p>
                    <span className="full-date">
                      {formatDate(selectedComment.created_at).full} at {formatDate(selectedComment.created_at).time}
                    </span>
                  </div>
                </div>
                
                <div className="comment-content-full">
                  <h4>Comment</h4>
                  <div className="comment-text">
                    <p>{selectedComment.content}</p>
                  </div>
                </div>
                
                <div className="comment-metadata">
                  <div className="metadata-item">
                    <span className="label">Category:</span>
                    <span 
                      className="value category-value"
                      style={{ color: getCategoryInfo(selectedComment.title).color }}
                    >
                      <i className={`fas ${getCategoryInfo(selectedComment.title).icon}`}></i>
                      {getCategoryInfo(selectedComment.title).label}
                    </span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Priority:</span>
                    <span 
                      className="value priority-value"
                      style={{ color: getPriorityColor('normal') }}
                    >
                      <i className="fas fa-flag"></i>
                      Normal
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="action-btn-modal reply-btn-modal"
                onClick={() => handleReplyToComment(selectedComment)}
              >
                <i className="fas fa-reply"></i>
                <span>Reply</span>
              </button>
              <button 
                className="action-btn-modal edit-btn-modal"
                onClick={() => handleEditComment(selectedComment)}
              >
                <i className="fas fa-edit"></i>
                <span>Edit</span>
              </button>
              <button 
                className="action-btn-modal delete-btn-modal"
                onClick={() => handleDeleteComment(selectedComment)}
              >
                <i className="fas fa-trash-alt"></i>
                <span>Delete</span>
              </button>
              <button 
                className="close-modal-btn"
                onClick={() => setSelectedComment(null)}
              >
                <i className="fas fa-check"></i>
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && commentToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="clinical-modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-icon delete-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Confirm Delete</h3>
              </div>
              <button className="close-btn" onClick={cancelDelete}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="delete-confirmation">
                <p className="warning-text">
                  Are you sure you want to delete this clinical comment? This action cannot be undone.
                </p>
                
                <div className="comment-preview-delete">
                  <div className="preview-header">
                    <div className="preview-author">
                      <div 
                        className="preview-avatar"
                        style={{ backgroundColor: getRoleColor(commentToDelete.staff_role) }}
                      >
                        {commentToDelete.staff_name ? commentToDelete.staff_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="preview-details">
                        <span className="author-name">{commentToDelete.staff_name || 'Unknown'}</span>
                        <span className="author-role">{commentToDelete.staff_role || 'Staff'}</span>
                      </div>
                    </div>
                    <div 
                      className="preview-category"
                      style={{ 
                        backgroundColor: `${getCategoryInfo(commentToDelete.title).color}20`,
                        color: getCategoryInfo(commentToDelete.title).color 
                      }}
                    >
                      <i className={`fas ${getCategoryInfo(commentToDelete.title).icon}`}></i>
                      <span>{getCategoryInfo(commentToDelete.title).label}</span>
                    </div>
                  </div>
                  <div className="preview-content">
                    <p>{commentToDelete.content}</p>
                  </div>
                  <div className="preview-date">
                    {formatDate(commentToDelete.created_at).full}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={cancelDelete}
                disabled={deleting}
              >
                <i className="fas fa-times"></i>
                <span>Cancel</span>
              </button>
              <button 
                className="delete-confirm-btn" 
                onClick={confirmDeleteComment}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt"></i>
                    <span>Delete Comment</span>
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

export default CommunicationRecords;