import React, { useState, useEffect } from 'react';
import { useAuth } from '../../login/AuthContext';
import '../../../styles/admin/support/PremiumUserSupportCenter.scss';

const PremiumUserSupportCenter = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  
  // Main states
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'create', 'tickets', 'knowledge'
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: '2 hours'
  });

  // Form states
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: '',
    attachments: []
  });

  // UI states
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Categories for tickets
  const ticketCategories = [
    { id: 'technical', name: 'Technical Issue', icon: 'cogs', color: '#EF4444' },
    { id: 'account', name: 'Account Access', icon: 'user-shield', color: '#3B82F6' },
    { id: 'billing', name: 'Billing Support', icon: 'credit-card', color: '#10B981' },
    { id: 'feature', name: 'Feature Request', icon: 'lightbulb', color: '#F59E0B' },
    { id: 'training', name: 'Training & Support', icon: 'graduation-cap', color: '#8B5CF6' },
    { id: 'other', name: 'Other', icon: 'question-circle', color: '#6B7280' }
  ];

  // Priority levels
  const priorityLevels = [
    { id: 'low', name: 'Low', color: '#10B981' },
    { id: 'medium', name: 'Medium', color: '#3B82F6' },
    { id: 'high', name: 'High', color: '#F59E0B' },
    { id: 'critical', name: 'Critical', color: '#EF4444' }
  ];

  // Knowledge base articles
  const knowledgeBase = [
    {
      id: 1,
      title: 'Getting Started with Patient Management',
      category: 'basics',
      content: 'Learn how to add, edit, and manage patient records effectively...',
      views: 1234,
      helpful: 89
    },
    {
      id: 2,
      title: 'Understanding Billing and Payments',
      category: 'billing',
      content: 'Complete guide to processing payments and managing billing...',
      views: 987,
      helpful: 76
    },
    {
      id: 3,
      title: 'Troubleshooting Common Issues',
      category: 'technical',
      content: 'Solutions to frequently encountered technical problems...',
      views: 2156,
      helpful: 94
    }
  ];

  // Load tickets when component mounts or when tickets view is selected
  useEffect(() => {
    if (isOpen && activeView === 'tickets') {
      loadTickets();
    }
  }, [isOpen, activeView]);

  // Load user stats
  useEffect(() => {
    if (isOpen && activeView === 'dashboard') {
      loadStats();
    }
  }, [isOpen, activeView]);

  if (!isOpen) return null;

  // Simulate loading tickets
  const loadTickets = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockTickets = [
        {
          id: 'TKT-001',
          subject: 'Unable to access patient records',
          category: 'technical',
          priority: 'high',
          status: 'open',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          responses: [
            {
              id: 1,
              author: currentUser?.first_name + ' ' + currentUser?.last_name || 'User',
              role: currentUser?.role || 'Administrator',
              content: 'I am unable to access patient records. The page keeps loading.',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'user'
            },
            {
              id: 2,
              author: 'Support Team',
              role: 'Support Agent',
              content: 'We are investigating this issue. Can you provide your browser information?',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'staff'
            }
          ]
        },
        {
          id: 'TKT-002',
          subject: 'Request for additional permissions',
          category: 'account',
          priority: 'medium',
          status: 'resolved',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          responses: [
            {
              id: 1,
              author: currentUser?.first_name + ' ' + currentUser?.last_name || 'User',
              role: currentUser?.role || 'Administrator',
              content: 'I need additional permissions to manage staff assignments.',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'user'
            },
            {
              id: 2,
              author: 'Admin Team',
              role: 'System Administrator',
              content: 'Your permissions have been updated. Please log out and back in.',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'staff'
            }
          ]
        }
      ];

      setTickets(mockTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load dashboard stats
  const loadStats = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStats({
        totalTickets: 12,
        openTickets: 3,
        resolvedTickets: 9,
        avgResponseTime: '1.5 hours'
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Handle form changes
  const handleFormChange = (field, value) => {
    setTicketForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit new ticket
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) {
      alert('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setTicketForm({
        subject: '',
        category: '',
        priority: 'medium',
        description: '',
        attachments: []
      });
      
      setSubmitSuccess(true);
      
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveView('tickets');
        loadTickets();
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Error submitting ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#8B5CF6';
      case 'open': return '#3B82F6';
      case 'in-progress': return '#F59E0B';
      case 'pending': return '#EC4899';
      case 'resolved': return '#10B981';
      case 'closed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const priorityObj = priorityLevels.find(p => p.id === priority);
    return priorityObj ? priorityObj.color : '#6B7280';
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="premium-support-modal-overlay" onClick={onClose}>
      <div className="premium-support-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="premium-modal-header">
          <div className="header-content">
            <div className="header-title">
              <div className="premium-icon">
                <i className="fas fa-crown"></i>
              </div>
              <div className="title-text">
                <h2>Premium Support Center</h2>
                <p>Priority assistance for premium users</p>
              </div>
            </div>
            <button className="close-button" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {/* Navigation */}
          <div className="premium-nav">
            <button 
              className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </button>
            <button 
              className={`nav-item ${activeView === 'create' ? 'active' : ''}`}
              onClick={() => setActiveView('create')}
            >
              <i className="fas fa-plus-circle"></i>
              <span>New Ticket</span>
            </button>
            <button 
              className={`nav-item ${activeView === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveView('tickets')}
            >
              <i className="fas fa-ticket-alt"></i>
              <span>My Tickets</span>
              {tickets.length > 0 && (
                <span className="nav-badge">{tickets.length}</span>
              )}
            </button>
            <button 
              className={`nav-item ${activeView === 'knowledge' ? 'active' : ''}`}
              onClick={() => setActiveView('knowledge')}
            >
              <i className="fas fa-book"></i>
              <span>Knowledge Base</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="premium-modal-content">
          
          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <div className="dashboard-view">
              <div className="welcome-section">
                <h3>Welcome back, {currentUser?.first_name || 'User'}!</h3>
                <p>Your premium support dashboard with priority assistance.</p>
              </div>
              
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon total">
                    <i className="fas fa-ticket-alt"></i>
                  </div>
                  <div className="stat-info">
                    <h4>Total Tickets</h4>
                    <span className="stat-number">{stats.totalTickets}</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon open">
                    <i className="fas fa-folder-open"></i>
                  </div>
                  <div className="stat-info">
                    <h4>Open Tickets</h4>
                    <span className="stat-number">{stats.openTickets}</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon resolved">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="stat-info">
                    <h4>Resolved</h4>
                    <span className="stat-number">{stats.resolvedTickets}</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon response">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="stat-info">
                    <h4>Avg Response</h4>
                    <span className="stat-number">{stats.avgResponseTime}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h4>Quick Actions</h4>
                <div className="action-buttons">
                  <button 
                    className="action-btn primary"
                    onClick={() => setActiveView('create')}
                  >
                    <i className="fas fa-plus"></i>
                    Create New Ticket
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => setActiveView('tickets')}
                  >
                    <i className="fas fa-list"></i>
                    View My Tickets
                  </button>
                  <button 
                    className="action-btn tertiary"
                    onClick={() => setActiveView('knowledge')}
                  >
                    <i className="fas fa-search"></i>
                    Browse Help Articles
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Ticket View */}
          {activeView === 'create' && (
            <div className="create-view">
              {submitSuccess ? (
                <div className="success-state">
                  <div className="success-animation">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h3>Ticket Created Successfully!</h3>
                  <p>Your premium support request has been submitted with high priority. Our team will respond within 1 hour.</p>
                  <div className="success-actions">
                    <button onClick={() => setActiveView('tickets')}>
                      View My Tickets
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="premium-ticket-form">
                  <div className="form-header">
                    <h3>Create Premium Support Ticket</h3>
                    <p>Get priority assistance from our expert support team</p>
                  </div>
                  
                  {/* Subject */}
                  <div className="form-group">
                    <label htmlFor="subject">
                      <i className="fas fa-edit"></i>
                      Subject *
                    </label>
                    <input
                      id="subject"
                      type="text"
                      value={ticketForm.subject}
                      onChange={(e) => handleFormChange('subject', e.target.value)}
                      placeholder="Brief description of your issue..."
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="form-group">
                    <label>
                      <i className="fas fa-tags"></i>
                      Category *
                    </label>
                    <div className="category-grid">
                      {ticketCategories.map(category => (
                        <div
                          key={category.id}
                          className={`category-option ${ticketForm.category === category.id ? 'selected' : ''}`}
                          onClick={() => handleFormChange('category', category.id)}
                          style={{ borderColor: ticketForm.category === category.id ? category.color : '#E2E8F0' }}
                        >
                          <div className="category-icon" style={{ color: category.color }}>
                            <i className={`fas fa-${category.icon}`}></i>
                          </div>
                          <span>{category.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="form-group">
                    <label>
                      <i className="fas fa-flag"></i>
                      Priority
                    </label>
                    <div className="priority-selector">
                      {priorityLevels.map(priority => (
                        <button
                          key={priority.id}
                          type="button"
                          className={`priority-btn ${ticketForm.priority === priority.id ? 'selected' : ''}`}
                          onClick={() => handleFormChange('priority', priority.id)}
                          style={{
                            borderColor: ticketForm.priority === priority.id ? priority.color : '#E2E8F0',
                            backgroundColor: ticketForm.priority === priority.id ? `${priority.color}20` : 'transparent'
                          }}
                        >
                          <span 
                            className="priority-dot" 
                            style={{ backgroundColor: priority.color }}
                          ></span>
                          {priority.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label htmlFor="description">
                      <i className="fas fa-align-left"></i>
                      Description *
                    </label>
                    <textarea
                      id="description"
                      value={ticketForm.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Please provide detailed information about your issue..."
                      rows="6"
                      required
                    />
                  </div>

                  {/* Submit */}
                  <div className="form-actions">
                    <button 
                      type="submit"
                      className="submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Creating Ticket...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-crown"></i>
                          Create Premium Ticket
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Tickets View */}
          {activeView === 'tickets' && (
            <div className="tickets-view">
              <div className="tickets-header">
                <h3>My Support Tickets</h3>
                <button 
                  className="refresh-btn"
                  onClick={loadTickets}
                  disabled={isLoading}
                >
                  <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
                  Refresh
                </button>
              </div>

              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-animation">
                    <i className="fas fa-spinner fa-spin"></i>
                  </div>
                  <p>Loading your tickets...</p>
                </div>
              ) : tickets.length > 0 ? (
                <div className="tickets-list">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="ticket-item">
                      <div className="ticket-header">
                        <div className="ticket-id">
                          <i className="fas fa-hashtag"></i>
                          {ticket.id}
                        </div>
                        <div className="ticket-status">
                          <span 
                            className="status-badge"
                            style={{ 
                              backgroundColor: `${getStatusColor(ticket.status)}20`,
                              color: getStatusColor(ticket.status),
                              borderColor: `${getStatusColor(ticket.status)}40`
                            }}
                          >
                            {ticket.status}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="ticket-title">{ticket.subject}</h4>
                      
                      <div className="ticket-meta">
                        <div className="meta-item">
                          <i className="fas fa-tags"></i>
                          <span>{ticketCategories.find(c => c.id === ticket.category)?.name}</span>
                        </div>
                        <div className="meta-item">
                          <i className="fas fa-flag"></i>
                          <span style={{ color: getPriorityColor(ticket.priority) }}>
                            {ticket.priority}
                          </span>
                        </div>
                        <div className="meta-item">
                          <i className="fas fa-clock"></i>
                          <span>{formatRelativeTime(ticket.updatedAt)}</span>
                        </div>
                      </div>
                      
                      {ticket.responses.length > 1 && (
                        <div className="ticket-activity">
                          <i className="fas fa-comments"></i>
                          <span>{ticket.responses.length - 1} replies</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-ticket-alt"></i>
                  </div>
                  <h3>No Tickets Yet</h3>
                  <p>You don't have any support tickets. Create one to get started!</p>
                  <button 
                    className="create-ticket-btn"
                    onClick={() => setActiveView('create')}
                  >
                    <i className="fas fa-plus"></i>
                    Create First Ticket
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Knowledge Base View */}
          {activeView === 'knowledge' && (
            <div className="knowledge-view">
              <div className="knowledge-header">
                <h3>Knowledge Base</h3>
                <p>Find answers to common questions and learn about features</p>
              </div>
              
              <div className="knowledge-search">
                <div className="search-input">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Search for help articles..."
                  />
                </div>
              </div>

              <div className="knowledge-grid">
                {knowledgeBase.map(article => (
                  <div key={article.id} className="knowledge-card">
                    <div className="article-header">
                      <h4>{article.title}</h4>
                      <span className="article-category">{article.category}</span>
                    </div>
                    <p className="article-preview">{article.content}</p>
                    <div className="article-stats">
                      <div className="stat">
                        <i className="fas fa-eye"></i>
                        <span>{article.views} views</span>
                      </div>
                      <div className="stat">
                        <i className="fas fa-thumbs-up"></i>
                        <span>{article.helpful}% helpful</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumUserSupportCenter;