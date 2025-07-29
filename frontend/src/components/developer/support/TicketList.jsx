import React from 'react';

const TicketList = ({ tickets, selectedTicket, onTicketSelect, onTicketUpdate, isLoading }) => {
  
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHour < 24) {
      return `${diffHour}h ago`;
    } else if (diffDay < 30) {
      return `${diffDay}d ago`;
    } else {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
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

  const getCategoryIcon = (categoryId) => {
    switch (categoryId) {
      case 'technical': return 'cogs';
      case 'account': return 'user-shield';
      case 'billing': return 'credit-card';
      case 'feature': return 'lightbulb';
      case 'bug': return 'bug';
      default: return 'question-circle';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return 'exclamation-triangle';
      case 'high': return 'chevron-up';
      case 'medium': return 'minus';
      case 'low': return 'chevron-down';
      default: return 'question';
    }
  };

  const handleQuickStatusChange = (ticket, newStatus) => {
    onTicketUpdate(ticket.id, { status: newStatus });
  };

  const handleAssignTicket = (ticket) => {
    const assignedTo = {
      id: 1,
      name: 'Luis Nava',
      role: 'Developer',
      avatar: 'LN'
    };
    onTicketUpdate(ticket.id, { assignedTo, status: 'in-progress' });
  };

  if (isLoading) {
    return (
      <div className="ticket-list loading">
        <div className="clinical-loading">
          <div className="loading-pulse">
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
          </div>
          <p>Loading support tickets...</p>
        </div>
      </div>
    );
  }

  if (!tickets.length) {
    return (
      <div className="ticket-list empty">
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <h3>No tickets found</h3>
          <p>No tickets match your current filters. Try adjusting your search criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-list">
      <div className="list-header">
        <h3>Support Tickets</h3>
        <span className="ticket-count">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="tickets-container">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`ticket-card ${selectedTicket?.id === ticket.id ? 'selected' : ''}`}
            onClick={() => onTicketSelect(ticket)}
          >
            <div className="ticket-header">
              <div className="ticket-meta">
                <span className="ticket-id">{ticket.id}</span>
                <div className="ticket-time">
                  <i className="fas fa-clock"></i>
                  {formatRelativeTime(ticket.createdAt)}
                </div>
              </div>
              
              <div className="ticket-actions">
                {ticket.status === 'new' && (
                  <button
                    className="quick-action assign"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssignTicket(ticket);
                    }}
                    title="Assign to me"
                  >
                    <i className="fas fa-user-plus"></i>
                  </button>
                )}
                
                {ticket.status === 'open' && (
                  <button
                    className="quick-action progress"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickStatusChange(ticket, 'in-progress');
                    }}
                    title="Start working"
                  >
                    <i className="fas fa-play"></i>
                  </button>
                )}
                
                {ticket.status === 'in-progress' && (
                  <button
                    className="quick-action resolve"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickStatusChange(ticket, 'resolved');
                    }}
                    title="Mark as resolved"
                  >
                    <i className="fas fa-check"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="ticket-content">
              <h4 className="ticket-subject">{ticket.subject}</h4>
              <p className="ticket-description">{ticket.description}</p>
              
              <div className="ticket-user">
                <div className="user-avatar">
                  {ticket.user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="user-info">
                  <span className="user-name">{ticket.user.name}</span>
                  <span className="user-role">{ticket.user.role}</span>
                </div>
              </div>
            </div>

            <div className="ticket-footer">
              <div className="ticket-badges">
                <div className="badge category">
                  <i className={`fas fa-${getCategoryIcon(ticket.category)}`}></i>
                  <span>{ticket.categoryInfo.name}</span>
                </div>
                
                <div 
                  className="badge priority"
                  style={{ 
                    backgroundColor: `${getPriorityColor(ticket.priority)}15`,
                    color: getPriorityColor(ticket.priority),
                    borderColor: `${getPriorityColor(ticket.priority)}30`
                  }}
                >
                  <i className={`fas fa-${getPriorityIcon(ticket.priority)}`}></i>
                  <span>{ticket.priority}</span>
                </div>
                
                <div 
                  className="badge status"
                  style={{ 
                    backgroundColor: `${getStatusColor(ticket.status)}15`,
                    color: getStatusColor(ticket.status),
                    borderColor: `${getStatusColor(ticket.status)}30`
                  }}
                >
                  <span>{ticket.status}</span>
                </div>
              </div>

              {ticket.assignedTo && (
                <div className="assigned-to">
                  <div className="assigned-avatar">
                    {ticket.assignedTo.avatar}
                  </div>
                  <span className="assigned-name">{ticket.assignedTo.name}</span>
                </div>
              )}
            </div>

            {ticket.responses.length > 1 && (
              <div className="response-indicator">
                <i className="fas fa-comments"></i>
                <span>{ticket.responses.length - 1} response{ticket.responses.length - 1 !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketList;