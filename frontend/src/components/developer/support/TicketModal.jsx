import React, { useState } from 'react';

const TicketModal = ({ ticket, isOpen, onClose, onTicketUpdate }) => {
  const [activeTab, setActiveTab] = useState('user-chat');
  const [userReplyText, setUserReplyText] = useState('');
  const [staffChatText, setStaffChatText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isSendingStaffMessage, setIsSendingStaffMessage] = useState(false);

  if (!isOpen || !ticket) return null;

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

  const handleUserReplySubmit = async (e) => {
    e.preventDefault();
    if (!userReplyText.trim()) return;

    setIsReplying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newResponse = {
        id: ticket.responses.length + 1,
        author: 'Luis Nava',
        role: 'Developer',
        content: userReplyText,
        timestamp: new Date().toISOString(),
        type: 'staff'
      };

      const updatedResponses = [...ticket.responses, newResponse];
      
      await onTicketUpdate(ticket.id, { 
        responses: updatedResponses,
        status: ticket.status === 'new' ? 'open' : ticket.status
      });
      
      setUserReplyText('');
    } catch (error) {
    } finally {
      setIsReplying(false);
    }
  };

  const handleStaffChatSubmit = async (e) => {
    e.preventDefault();
    if (!staffChatText.trim()) return;

    setIsSendingStaffMessage(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newStaffMessage = {
        id: (ticket.staffChat?.length || 0) + 1,
        author: 'Luis Nava',
        role: 'Developer',
        content: staffChatText,
        timestamp: new Date().toISOString()
      };

      const updatedStaffChat = [...(ticket.staffChat || []), newStaffMessage];
      
      await onTicketUpdate(ticket.id, { 
        staffChat: updatedStaffChat
      });
      
      setStaffChatText('');
    } catch (error) {
    } finally {
      setIsSendingStaffMessage(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    onTicketUpdate(ticket.id, { status: newStatus });
  };

  const handlePriorityChange = (newPriority) => {
    onTicketUpdate(ticket.id, { priority: newPriority });
  };

  return (
    <div className="ticket-modal-overlay" onClick={onClose}>
      <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{ticket.subject}</h2>
            <span className="ticket-id">#{ticket.id}</span>
          </div>
          
          <div className="modal-badges">
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
          
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-user-info">
          <div className="user-card">
            <div className="user-avatar">
              {ticket.user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="user-details">
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

        <div className="modal-tabs">
          <button
            className={`tab ${activeTab === 'user-chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('user-chat')}
          >
            <i className="fas fa-user-comments"></i>
            User Conversation
            {ticket.responses.length > 1 && (
              <span className="tab-count">{ticket.responses.length - 1}</span>
            )}
          </button>
          <button
            className={`tab ${activeTab === 'staff-chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff-chat')}
          >
            <i className="fas fa-users-cog"></i>
            Internal Staff Chat
            {ticket.staffChat && ticket.staffChat.length > 0 && (
              <span className="tab-count">{ticket.staffChat.length}</span>
            )}
          </button>
          <button
            className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
            onClick={() => setActiveTab('actions')}
          >
            <i className="fas fa-cogs"></i>
            Actions & Settings
          </button>
        </div>

        <div className="modal-content">
          
          {activeTab === 'user-chat' && (
            <div className="user-chat-tab">
              <div className="chat-container">
                <div className="conversation-header">
                  <h4>Conversation with {ticket.user.name}</h4>
                  <span className="conversation-count">{ticket.responses.length} message{ticket.responses.length !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="messages-area">
                  {ticket.responses.map((response, index) => (
                    <div
                      key={response.id}
                      className={`message ${response.type === 'staff' ? 'staff-message' : 'user-message'}`}
                    >
                      <div className="message-avatar">
                        {response.type === 'staff' ? 'LN' : response.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="message-bubble">
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

                <form onSubmit={handleUserReplySubmit} className="reply-form">
                  <div className="reply-header">
                    <h5>Reply to {ticket.user.name}</h5>
                  </div>
                  <div className="reply-input-area">
                    <textarea
                      value={userReplyText}
                      onChange={(e) => setUserReplyText(e.target.value)}
                      placeholder="Type your response to the user here..."
                      rows="4"
                      disabled={isReplying}
                      className="reply-textarea"
                    />
                    <button
                      type="submit"
                      disabled={!userReplyText.trim() || isReplying}
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

          {activeTab === 'staff-chat' && (
            <div className="staff-chat-tab">
              <div className="chat-container">
                <div className="conversation-header">
                  <h4>Internal Staff Communication</h4>
                  <span className="conversation-count">
                    {ticket.staffChat ? ticket.staffChat.length : 0} internal message{(ticket.staffChat?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="messages-area">
                  {ticket.staffChat && ticket.staffChat.length > 0 ? (
                    ticket.staffChat.map((message, index) => (
                      <div key={message.id} className="message staff-internal-message">
                        <div className="message-avatar">
                          {message.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="message-bubble">
                          <div className="message-header">
                            <span className="author-name">{message.author}</span>
                            <span className="author-role">{message.role}</span>
                            <span className="message-time">
                              {new Date(message.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="message-text">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-chat">
                      <div className="empty-icon">
                        <i className="fas fa-comments"></i>
                      </div>
                      <h4>No internal messages yet</h4>
                      <p>Start a conversation with your team about this ticket</p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleStaffChatSubmit} className="reply-form">
                  <div className="reply-header">
                    <h5>Internal Team Communication</h5>
                    <span className="privacy-note">
                      <i className="fas fa-lock"></i>
                      This conversation is private to staff only
                    </span>
                  </div>
                  <div className="reply-input-area">
                    <textarea
                      value={staffChatText}
                      onChange={(e) => setStaffChatText(e.target.value)}
                      placeholder="Share notes, discuss solutions, coordinate with your team..."
                      rows="4"
                      disabled={isSendingStaffMessage}
                      className="reply-textarea"
                    />
                    <button
                      type="submit"
                      disabled={!staffChatText.trim() || isSendingStaffMessage}
                      className="send-staff-message-btn"
                    >
                      {isSendingStaffMessage ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-share"></i>
                          Send Internal Message
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
    </div>
  );
};

export default TicketModal;