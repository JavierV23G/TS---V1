import React, { useState, useEffect } from 'react';
import { useAuth } from '../../login/AuthContext';
import '../../../styles/admin/support/UserTicketCenter.scss';

const UserTicketCenter = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  
  // Estados principales
  const [activeView, setActiveView] = useState('create'); // 'create', 'my-tickets'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [userTickets, setUserTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Estados del formulario
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: '',
    attachments: []
  });

  // Estados de comunicación con tickets existentes
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Categorías disponibles para tickets
  const ticketCategories = [
    { id: 'technical', name: 'Technical Issue', icon: 'cogs', description: 'System bugs, errors, or technical problems' },
    { id: 'account', name: 'Account Access', icon: 'user-shield', description: 'Login issues, password reset, permissions' },
    { id: 'billing', name: 'Billing Support', icon: 'credit-card', description: 'Payment, invoicing, or subscription questions' },
    { id: 'feature', name: 'Feature Request', icon: 'lightbulb', description: 'Suggest new features or improvements' },
    { id: 'training', name: 'Training & Support', icon: 'graduation-cap', description: 'How-to questions and usage guidance' },
    { id: 'other', name: 'Other', icon: 'question-circle', description: 'General inquiries or other issues' }
  ];

  // Prioridades disponibles
  const priorityLevels = [
    { id: 'low', name: 'Low', color: '#10B981', description: 'General questions, minor issues' },
    { id: 'medium', name: 'Medium', color: '#3B82F6', description: 'Standard support requests' },
    { id: 'high', name: 'High', color: '#F59E0B', description: 'Important issues affecting work' },
    { id: 'critical', name: 'Critical', color: '#EF4444', description: 'System down, blocking issues' }
  ];

  // Cargar tickets del usuario al abrir el modal
  useEffect(() => {
    if (isOpen && activeView === 'my-tickets') {
      loadUserTickets();
    }
  }, [isOpen, activeView]);

  if (!isOpen) return null;

  // Simular carga de tickets del usuario
  const loadUserTickets = async () => {
    setIsLoadingTickets(true);
    try {
      // Simulamos delay de API
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Tickets de ejemplo del usuario
      const mockUserTickets = [
        {
          id: 'TKT-USER-001',
          subject: 'Unable to access patient records',
          category: 'technical',
          priority: 'high',
          status: 'open',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'I am unable to access patient records in the system. The page keeps loading but never displays the information.',
          responses: [
            {
              id: 1,
              author: currentUser?.first_name + ' ' + currentUser?.last_name || 'User',
              role: currentUser?.role || 'Administrator',
              content: 'I am unable to access patient records in the system. The page keeps loading but never displays the information.',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'user'
            },
            {
              id: 2,
              author: 'Luis Nava',
              role: 'Developer',
              content: 'Thank you for reporting this issue. We are investigating the patient records loading problem. Can you please tell me which browser you are using and if you see any error messages?',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'staff'
            }
          ]
        },
        {
          id: 'TKT-USER-002',
          subject: 'Request for additional user permissions',
          category: 'account',
          priority: 'medium',
          status: 'resolved',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'I need additional permissions to manage staff assignments in the system.',
          responses: [
            {
              id: 1,
              author: currentUser?.first_name + ' ' + currentUser?.last_name || 'User',
              role: currentUser?.role || 'Administrator',
              content: 'I need additional permissions to manage staff assignments in the system.',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'user'
            },
            {
              id: 2,
              author: 'Luis Nava',
              role: 'Developer',
              content: 'I have reviewed your request and updated your permissions. You should now be able to manage staff assignments. Please try logging out and back in to refresh your session.',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'staff'
            }
          ]
        }
      ];

      setUserTickets(mockUserTickets);
    } catch (error) {
      console.error('Error loading user tickets:', error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // Manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setTicketForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Enviar nuevo ticket
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) {
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulamos el envío del ticket
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTicketId = `TKT-USER-${String(Date.now()).slice(-6)}`;
      
      // Resetear formulario
      setTicketForm({
        subject: '',
        category: '',
        priority: 'medium',
        description: '',
        attachments: []
      });
      
      setSubmitSuccess(true);
      
      // Mostrar éxito por 3 segundos y luego cambiar a vista de tickets
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveView('my-tickets');
        loadUserTickets(); // Recargar tickets para incluir el nuevo
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Error al enviar el ticket. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enviar respuesta a un ticket
  const handleSendReply = async (ticketId) => {
    if (!replyText.trim()) return;

    setIsSendingReply(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar el ticket con la nueva respuesta
      setUserTickets(prev => prev.map(ticket => {
        if (ticket.id === ticketId) {
          const newResponse = {
            id: ticket.responses.length + 1,
            author: currentUser?.first_name + ' ' + currentUser?.last_name || 'User',
            role: currentUser?.role || 'Administrator',
            content: replyText,
            timestamp: new Date().toISOString(),
            type: 'user'
          };
          
          return {
            ...ticket,
            responses: [...ticket.responses, newResponse],
            updatedAt: new Date().toISOString(),
            status: ticket.status === 'resolved' ? 'open' : ticket.status // Reabrir si estaba resuelto
          };
        }
        return ticket;
      }));
      
      // Actualizar el ticket seleccionado si es el mismo
      if (selectedTicket && selectedTicket.id === ticketId) {
        const updatedTicket = userTickets.find(t => t.id === ticketId);
        if (updatedTicket) {
          setSelectedTicket({
            ...updatedTicket,
            responses: [...updatedTicket.responses, {
              id: updatedTicket.responses.length + 1,
              author: currentUser?.first_name + ' ' + currentUser?.last_name || 'User',
              role: currentUser?.role || 'Administrator',
              content: replyText,
              timestamp: new Date().toISOString(),
              type: 'user'
            }]
          });
        }
      }
      
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsSendingReply(false);
    }
  };

  // Obtener color de estado
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

  // Obtener color de prioridad
  const getPriorityColor = (priority) => {
    const priorityObj = priorityLevels.find(p => p.id === priority);
    return priorityObj ? priorityObj.color : '#6B7280';
  };

  // Formatear fecha relativa
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
    <div className="user-ticket-modal-overlay" onClick={onClose}>
      <div className="user-ticket-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-title">
              <i className="fas fa-ticket-alt"></i>
              <h2>Support Center</h2>
            </div>
            <button className="close-button" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {/* Navigation Tabs */}
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeView === 'create' ? 'active' : ''}`}
              onClick={() => setActiveView('create')}
            >
              <i className="fas fa-plus-circle"></i>
              Create Ticket
            </button>
            <button 
              className={`nav-tab ${activeView === 'my-tickets' ? 'active' : ''}`}
              onClick={() => setActiveView('my-tickets')}
            >
              <i className="fas fa-list-alt"></i>
              My Tickets
              {userTickets.length > 0 && (
                <span className="ticket-count">{userTickets.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="modal-content">
          
          {/* Create Ticket View */}
          {activeView === 'create' && (
            <div className="create-ticket-view">
              {submitSuccess ? (
                <div className="success-state">
                  <div className="success-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h3>Ticket Created Successfully!</h3>
                  <p>Your support request has been submitted. Our team will review it and respond as soon as possible.</p>
                  <div className="success-actions">
                    <button onClick={() => setActiveView('my-tickets')}>
                      View My Tickets
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="ticket-form">
                  
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

                  {/* Category Selection */}
                  <div className="form-group">
                    <label>
                      <i className="fas fa-tags"></i>
                      Category *
                    </label>
                    <div className="category-grid">
                      {ticketCategories.map(category => (
                        <div
                          key={category.id}
                          className={`category-card ${ticketForm.category === category.id ? 'selected' : ''}`}
                          onClick={() => handleFormChange('category', category.id)}
                        >
                          <div className="category-icon">
                            <i className={`fas fa-${category.icon}`}></i>
                          </div>
                          <div className="category-info">
                            <h4>{category.name}</h4>
                            <p>{category.description}</p>
                          </div>
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
                          className={`priority-option ${ticketForm.priority === priority.id ? 'selected' : ''}`}
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
                      placeholder="Please provide detailed information about your issue, including steps to reproduce, error messages, and any other relevant details..."
                      rows="6"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="form-actions">
                    <button 
                      type="submit"
                      className="submit-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Creating Ticket...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane"></i>
                          Create Support Ticket
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* My Tickets View */}
          {activeView === 'my-tickets' && (
            <div className="my-tickets-view">
              {!selectedTicket ? (
                <>
                  <div className="tickets-header">
                    <h3>My Support Tickets</h3>
                    <button 
                      className="refresh-button"
                      onClick={loadUserTickets}
                      disabled={isLoadingTickets}
                    >
                      <i className={`fas fa-sync-alt ${isLoadingTickets ? 'fa-spin' : ''}`}></i>
                      Refresh
                    </button>
                  </div>

                  {isLoadingTickets ? (
                    <div className="loading-state">
                      <div className="loading-spinner">
                        <i className="fas fa-spinner fa-spin"></i>
                      </div>
                      <p>Loading your tickets...</p>
                    </div>
                  ) : userTickets.length > 0 ? (
                    <div className="tickets-list">
                      {userTickets.map(ticket => (
                        <div 
                          key={ticket.id}
                          className="ticket-card"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div className="ticket-header">
                            <div className="ticket-id">{ticket.id}</div>
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
                          
                          <h4 className="ticket-subject">{ticket.subject}</h4>
                          
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
                            <div className="ticket-replies">
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
                        <i className="fas fa-inbox"></i>
                      </div>
                      <h3>No Support Tickets</h3>
                      <p>You haven't created any support tickets yet.</p>
                      <button 
                        className="create-first-ticket"
                        onClick={() => setActiveView('create')}
                      >
                        <i className="fas fa-plus"></i>
                        Create Your First Ticket
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Ticket Detail View */
                <div className="ticket-detail">
                  <div className="detail-header">
                    <button 
                      className="back-button"
                      onClick={() => setSelectedTicket(null)}
                    >
                      <i className="fas fa-arrow-left"></i>
                      Back to tickets
                    </button>
                    
                    <div className="ticket-info">
                      <h3>{selectedTicket.subject}</h3>
                      <div className="ticket-badges">
                        <span 
                          className="status-badge"
                          style={{ 
                            backgroundColor: `${getStatusColor(selectedTicket.status)}20`,
                            color: getStatusColor(selectedTicket.status),
                            borderColor: `${getStatusColor(selectedTicket.status)}40`
                          }}
                        >
                          {selectedTicket.status}
                        </span>
                        <span 
                          className="priority-badge"
                          style={{ 
                            backgroundColor: `${getPriorityColor(selectedTicket.priority)}20`,
                            color: getPriorityColor(selectedTicket.priority),
                            borderColor: `${getPriorityColor(selectedTicket.priority)}40`
                          }}
                        >
                          {selectedTicket.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conversation */}
                  <div className="conversation">
                    {selectedTicket.responses.map((response, index) => (
                      <div
                        key={response.id}
                        className={`message ${response.type === 'staff' ? 'staff-message' : 'user-message'}`}
                      >
                        <div className="message-avatar">
                          {response.type === 'staff' ? 'LN' : (response.author.split(' ').map(n => n[0]).join(''))}
                        </div>
                        <div className="message-content">
                          <div className="message-header">
                            <span className="author">{response.author}</span>
                            <span className="role">{response.role}</span>
                            <span className="timestamp">
                              {new Date(response.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="message-text">
                            {response.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="reply-section">
                      <div className="reply-form">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply here..."
                          rows="4"
                        />
                        <div className="reply-actions">
                          <button
                            onClick={() => handleSendReply(selectedTicket.id)}
                            disabled={!replyText.trim() || isSendingReply}
                            className="send-reply-button"
                          >
                            {isSendingReply ? (
                              <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Sending...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-reply"></i>
                                Send Reply
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTicketCenter;