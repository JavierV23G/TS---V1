import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../login/AuthContext';
import '../../../../../styles/developer/Patients/InfoPaciente/NotesComponent.scss';

const NotesComponent = ({ patient }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentCategory, setCommentCategory] = useState('general');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const { currentUser } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Comment categories for clinical notes
  const commentCategories = [
    { value: 'general', label: 'General Comments', color: '#3b82f6', icon: 'fa-comment' },
    { value: 'progress', label: 'Progress Notes', color: '#10b981', icon: 'fa-chart-line' },
    { value: 'concerns', label: 'Clinical Concerns', color: '#f59e0b', icon: 'fa-exclamation-circle' },
    { value: 'family', label: 'Family Communication', color: '#8b5cf6', icon: 'fa-users' },
    { value: 'medication', label: 'Medication Notes', color: '#ef4444', icon: 'fa-pills' },
    { value: 'discharge', label: 'Discharge Planning', color: '#6b7280', icon: 'fa-sign-out-alt' }
  ];

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchComments = async () => {
      if (!patient?.id) {
        setComments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock comments data - replace with actual API endpoint
        const mockComments = [
          {
            id: 1,
            content: "Patient shows significant improvement in mobility and balance. Continues to be motivated and engaged during therapy sessions.",
            category: 'progress',
            author: 'Sarah Johnson',
            userRole: 'PT',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            priority: 'normal'
          },
          {
            id: 2,
            content: "Family expressed concerns about patient's pain levels during evening hours. Recommend reviewing current pain management protocol.",
            category: 'family',
            author: 'Michael Chen',
            userRole: 'OT',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            priority: 'high'
          },
          {
            id: 3,
            content: "Patient completed all exercises today with minimal assistance. Ready to progress to next level of difficulty.",
            category: 'general',
            author: 'Lisa Rodriguez',
            userRole: 'PTA',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
            priority: 'normal'
          }
        ];
        
        setComments(mockComments);
        
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load clinical comments');
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [patient?.id, API_BASE_URL]);

  // Add new comment
  const handleAddComment = async (event) => {
    event.preventDefault();
    
    if (saving || !newComment.trim()) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCommentObj = {
        id: Date.now(), // Mock ID
        content: newComment.trim(),
        category: commentCategory,
        author: currentUser?.fullname || currentUser?.username || 'Current User',
        userRole: currentUser?.role || 'Staff',
        createdAt: new Date().toISOString(),
        priority: 'normal'
      };
      
      setComments(prevComments => [newCommentObj, ...prevComments]);
      setNewComment('');
      setCommentCategory('general');
      setShowCommentModal(false);
      
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment: ' + err.message);
    } finally {
      setSaving(false);
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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentToDelete.id));
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
  const handleReplyToComment = (comment) => {
    // Close view modal and open new comment modal with reply context
    setSelectedComment(null);
    setCommentCategory('general'); // Default for replies
    setNewComment(`@${comment.author}: `); // Pre-fill with mention
    setShowCommentModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return {
        relative: 'Today',
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        full: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
    } else if (diffDays === 1) {
      return {
        relative: 'Yesterday',
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        full: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
    } else if (diffDays <= 7) {
      return {
        relative: `${diffDays} days ago`,
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        full: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
    } else {
      return {
        relative: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        full: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
    }
  };

  // Get category info
  const getCategoryInfo = (category) => {
    return commentCategories.find(cat => cat.value === category) || commentCategories[0];
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
              <h1>Clinical Notes</h1>
              <p>Patient clinical comments and observations</p>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="comments-counter">
              <span className="number">{comments.length}</span>
              <span className="label">Comments</span>
            </div>
            <button 
              className="new-comment-btn"
              onClick={() => setShowCommentModal(true)}
            >
              <i className="fas fa-plus"></i>
              <span>Add Comment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {loading ? (
          <div className="loading">
            <div className="spinner">
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="circle"></div>
            </div>
            <p>Loading clinical comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-comment-medical"></i>
            </div>
            <h2>No comments available</h2>
            <p>Start by adding the first clinical comment for this patient</p>
            <button 
              className="first-comment-btn"
              onClick={() => setShowCommentModal(true)}
            >
              <i className="fas fa-plus"></i>
              <span>Add First Comment</span>
            </button>
          </div>
        ) : (
          <div className="comments-timeline">
            {comments.map((comment) => {
              const date = formatDate(comment.createdAt);
              const categoryInfo = getCategoryInfo(comment.category);
              const roleColor = getRoleColor(comment.userRole);
              const priorityColor = getPriorityColor(comment.priority);
              
              return (
                <div 
                  key={comment.id} 
                  className="comment-card"
                  onClick={() => setSelectedComment(comment)}
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
                            {comment.author ? comment.author.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="author-details">
                            <span className="author-name">{comment.author}</span>
                            <span className="author-role">{comment.userRole}</span>
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
                          {comment.priority === 'high' && (
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
                      <p>{comment.content}</p>
                    </div>
                    
                    <div className="comment-footer">
                      <div className="action-buttons">
                        <button 
                          className="action-btn reply-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReplyToComment(comment);
                          }}
                        >
                          <i className="fas fa-reply"></i>
                          <span>Reply</span>
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteComment(comment);
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
                <h3>Add Clinical Comment</h3>
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
                    {commentCategories.map(category => (
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
                  disabled={saving}
                >
                  <i className="fas fa-times"></i>
                  <span>Cancel</span>
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={saving || !newComment.trim()}
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus"></i>
                      <span>Add Comment</span>
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
                  <i className={`fas ${getCategoryInfo(selectedComment.category).icon}`}></i>
                </div>
                <h3>{getCategoryInfo(selectedComment.category).label}</h3>
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
                    style={{ backgroundColor: getRoleColor(selectedComment.userRole) }}
                  >
                    {selectedComment.author ? selectedComment.author.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="author-info-complete">
                    <h4>{selectedComment.author}</h4>
                    <p>{selectedComment.userRole}</p>
                    <span className="full-date">
                      {formatDate(selectedComment.createdAt).full} at {formatDate(selectedComment.createdAt).time}
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
                      style={{ color: getCategoryInfo(selectedComment.category).color }}
                    >
                      <i className={`fas ${getCategoryInfo(selectedComment.category).icon}`}></i>
                      {getCategoryInfo(selectedComment.category).label}
                    </span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Priority:</span>
                    <span 
                      className="value priority-value"
                      style={{ color: getPriorityColor(selectedComment.priority) }}
                    >
                      <i className="fas fa-flag"></i>
                      {selectedComment.priority.charAt(0).toUpperCase() + selectedComment.priority.slice(1)}
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
                        style={{ backgroundColor: getRoleColor(commentToDelete.userRole) }}
                      >
                        {commentToDelete.author ? commentToDelete.author.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="preview-details">
                        <span className="author-name">{commentToDelete.author}</span>
                        <span className="author-role">{commentToDelete.userRole}</span>
                      </div>
                    </div>
                    <div 
                      className="preview-category"
                      style={{ 
                        backgroundColor: `${getCategoryInfo(commentToDelete.category).color}20`,
                        color: getCategoryInfo(commentToDelete.category).color 
                      }}
                    >
                      <i className={`fas ${getCategoryInfo(commentToDelete.category).icon}`}></i>
                      <span>{getCategoryInfo(commentToDelete.category).label}</span>
                    </div>
                  </div>
                  <div className="preview-content">
                    <p>{commentToDelete.content}</p>
                  </div>
                  <div className="preview-date">
                    {formatDate(commentToDelete.createdAt).full}
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

export default NotesComponent;