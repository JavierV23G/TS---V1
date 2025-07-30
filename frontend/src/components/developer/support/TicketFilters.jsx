import React from 'react';

const TicketFilters = ({ filters, onFilterChange, isLoading }) => {
  
  const handleInputChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      assignedTo: 'all'
    });
  };

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: 'list' },
    { value: 'new', label: 'New', icon: 'plus-circle' },
    { value: 'open', label: 'Open', icon: 'folder-open' },
    { value: 'in-progress', label: 'In Progress', icon: 'clock' },
    { value: 'pending', label: 'Pending', icon: 'pause-circle' },
    { value: 'resolved', label: 'Resolved', icon: 'check-circle' },
    { value: 'closed', label: 'Closed', icon: 'lock' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities', icon: 'bars' },
    { value: 'low', label: 'Low', icon: 'arrow-down', color: '#10B981' },
    { value: 'medium', label: 'Medium', icon: 'minus', color: '#3B82F6' },
    { value: 'high', label: 'High', icon: 'arrow-up', color: '#F59E0B' },
    { value: 'critical', label: 'Critical', icon: 'exclamation-triangle', color: '#EF4444' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories', icon: 'th-large' },
    { value: 'technical', label: 'Technical Issue', icon: 'cogs' },
    { value: 'account', label: 'Account Access', icon: 'user-shield' },
    { value: 'billing', label: 'Billing Support', icon: 'credit-card' },
    { value: 'feature', label: 'Feature Request', icon: 'lightbulb' },
    { value: 'bug', label: 'Bug Report', icon: 'bug' }
  ];

  return (
    <div className="ticket-filters">
      <div className="search-section">
        <div className="search-box">
          <div className="search-icon">
            <i className="fas fa-search"></i>
          </div>
          <input
            type="text"
            placeholder="Search tickets by ID, subject, or user..."
            value={filters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
            disabled={isLoading}
            className="search-input"
          />
          {filters.search && (
            <button
              className="clear-search"
              onClick={() => handleInputChange('search', '')}
              disabled={isLoading}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      <div className="filter-sections">
        
        <div className="filter-group">
          <label className="filter-label">
            <i className="fas fa-tasks"></i>
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            disabled={isLoading}
            className="filter-select"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <i className="fas fa-flag"></i>
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            disabled={isLoading}
            className="filter-select"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <i className="fas fa-tags"></i>
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            disabled={isLoading}
            className="filter-select"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          <button
            className="clear-filters-btn"
            onClick={clearFilters}
            disabled={isLoading}
          >
            <i className="fas fa-eraser"></i>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="active-filters">
        {filters.search && (
          <div className="filter-chip">
            <i className="fas fa-search"></i>
            <span>"{filters.search}"</span>
            <button onClick={() => handleInputChange('search', '')}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
        
        {filters.status !== 'all' && (
          <div className="filter-chip">
            <i className="fas fa-tasks"></i>
            <span>{statusOptions.find(o => o.value === filters.status)?.label}</span>
            <button onClick={() => handleInputChange('status', 'all')}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
        
        {filters.priority !== 'all' && (
          <div className="filter-chip">
            <i className="fas fa-flag"></i>
            <span>{priorityOptions.find(o => o.value === filters.priority)?.label}</span>
            <button onClick={() => handleInputChange('priority', 'all')}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
        
        {filters.category !== 'all' && (
          <div className="filter-chip">
            <i className="fas fa-tags"></i>
            <span>{categoryOptions.find(o => o.value === filters.category)?.label}</span>
            <button onClick={() => handleInputChange('category', 'all')}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketFilters;