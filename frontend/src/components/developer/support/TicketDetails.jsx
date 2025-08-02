import React, { useState } from 'react';

const TicketDetails = ({ ticket, onTicketUpdate }) => {
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [activeTab, setActiveTab] = useState('conversation');

  if (!ticket) {
    return (
      <div className="ticket-details empty">
        <div className="empty-selection">
          <div className="empty-icon">
            <i className="fas fa-mouse-pointer"></i>
          </div>
          <h3>Select a ticket</h3>
          <p>Choose a ticket from the list to view its details and respond to the user.</p>
        </div>
      </div>
    );
  }

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

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

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsReplying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newResponse = {
        id: ticket.responses.length + 1,
        author: 'Luis Nava',
        role: 'Developer',
        content: replyText,
        timestamp: new Date().toISOString(),
        type: 'staff'
      };

      const updatedResponses = [...ticket.responses, newResponse];
      
      await onTicketUpdate(ticket.id, { 
        responses: updatedResponses,
        status: ticket.status === 'new' ? 'open' : ticket.status
      });
      
      setReplyText('');
    } catch (error) {
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    onTicketUpdate(ticket.id, { status: newStatus });
  };

  const handlePriorityChange = (newPriority) => {
    onTicketUpdate(ticket.id, { priority: newPriority });
  };

  return (
    <div className="ticket-details">
      <div className="details-header">
        <div className="ticket-title">
          <h2>{ticket.subject}</h2>
          <span className="ticket-id">{ticket.id}</span>
        </div>
        
        <div className="ticket-status-badges">
          <div 
            className="status-badge"
            style={{ 
              backgroundColor: `${getStatusColor(ticket.status)}20`,
              color: getStatusColor(ticket.status),
              borderColor: `${getStatusColor(ticket.status)}40`
            }}
          >
            {ticket.status}
          </div>
          <div 
            className="priority-badge"
            style={{ 
              backgroundColor: `${getPriorityColor(ticket.priority)}20`,
              color: getPriorityColor(ticket.priority),
              borderColor: `${getPriorityColor(ticket.priority)}40`
            }}
          >
            {ticket.priority} priority
          </div>
        </div>
      </div>

      <div className="user-section">
        <div className="user-card">
          <div className="user-avatar">
            {ticket.user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="user-info">
            <h4>{ticket.user.name}</h4>
            <p>{ticket.user.role}</p>
            <span className="user-email">{ticket.user.email}</span>
          </div>
        </div>
        
        <div className="ticket-meta">
          <div className="meta-item">
            <i className="fas fa-calendar-plus"></i>
            <span>Created: {formatFullDate(ticket.createdAt)}</span>
          </div>
          <div className="meta-item">
            <i className="fas fa-clock"></i>
            <span>Updated: {formatFullDate(ticket.updatedAt)}</span>
          </div>
          <div className="meta-item">
            <i className="fas fa-tags"></i>
            <span>Category: {ticket.categoryInfo.name}</span>
          </div>
        </div>
      </div>

      <div className="details-tabs">
        <button
          className={`tab ${activeTab === 'conversation' ? 'active' : ''}`}
          onClick={() => setActiveTab('conversation')}
        >
          <i className="fas fa-comments"></i>
          Conversation
        </button>
        <button
          className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          <i className="fas fa-cogs"></i>
          Actions
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'conversation' && (
          <div className="conversation-tab">
            <div className="conversation">
              {ticket.responses.map((response, index) => (
                <div
                  key={response.id}
                  className={`message ${response.type === 'staff' ? 'staff' : 'user'}`}
                >
                  <div className="message-avatar">
                    {response.type === 'staff' ? 'LN' : response.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="author-name">{response.author}</span>
                      <span className="author-role">{response.role}</span>
                      <span className="message-time">
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

            <div className="reply-section">
              <form onSubmit={handleReplySubmit} className="reply-form">
                <div className="reply-header">
                  <h4>Reply to {ticket.user.name}</h4>
                </div>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response here..."
                  rows="4"
                  disabled={isReplying}
                  className="reply-textarea"
                />
                <div className="reply-actions">
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isReplying}
                    className="send-reply-btn"
                  >
                    {isReplying ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="actions-tab">
            <div className="action-section">
              <h4>
                <i className="fas fa-tasks"></i>
                Change Status
              </h4>
              <div className="status-actions">
                {['new', 'open', 'in-progress', 'pending', 'resolved', 'closed'].map(status => (
                  <button
                    key={status}
                    className={`status-btn ${ticket.status === status ? 'current' : ''}`}
                    onClick={() => handleStatusChange(status)}
                    disabled={ticket.status === status}
                    style={{
                      borderColor: getStatusColor(status),
                      color: ticket.status === status ? '#fff' : getStatusColor(status),
                      backgroundColor: ticket.status === status ? getStatusColor(status) : 'transparent'
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="action-section">
              <h4>
                <i className="fas fa-flag"></i>
                Change Priority
              </h4>
              <div className="priority-actions">
                {['low', 'medium', 'high', 'critical'].map(priority => (
                  <button
                    key={priority}
                    className={`priority-btn ${ticket.priority === priority ? 'current' : ''}`}
                    onClick={() => handlePriorityChange(priority)}
                    disabled={ticket.priority === priority}
                    style={{
                      borderColor: getPriorityColor(priority),
                      color: ticket.priority === priority ? '#fff' : getPriorityColor(priority),
                      backgroundColor: ticket.priority === priority ? getPriorityColor(priority) : 'transparent'
                    }}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            <div className="action-section">
              <h4>
                <i className="fas fa-user-plus"></i>
                Assignment
              </h4>
              <div className="assignment-info">
                {ticket.assignedTo ? (
                  <div className="assigned-user">
                    <div className="assigned-avatar">{ticket.assignedTo.avatar}</div>
                    <div className="assigned-details">
                      <span className="assigned-name">{ticket.assignedTo.name}</span>
                      <span className="assigned-role">{ticket.assignedTo.role}</span>
                    </div>
                    <button 
                      className="unassign-btn"
                      onClick={() => onTicketUpdate(ticket.id, { assignedTo: null })}
                    >
                      <i className="fas fa-times"></i>
                      Unassign
                    </button>
                  </div>
                ) : (
                  <div className="unassigned">
                    <span>This ticket is not assigned to anyone</span>
                    <button 
                      className="assign-btn"
                      onClick={() => onTicketUpdate(ticket.id, { 
                        assignedTo: { id: 1, name: 'Luis Nava', role: 'Developer', avatar: 'LN' }
                      })}
                    >
                      <i className="fas fa-user-plus"></i>
                      Assign to me
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="action-section">
              <h4>
                <i className="fas fa-tags"></i>
                Tags
              </h4>
              <div className="tags-section">
                {ticket.tags && ticket.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
                <button className="add-tag-btn">
                  <i className="fas fa-plus"></i>
                  Add Tag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetails;