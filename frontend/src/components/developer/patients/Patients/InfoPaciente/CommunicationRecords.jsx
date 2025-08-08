import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../login/AuthContext';
import '../../../../../styles/developer/Patients/InfoPaciente/CommunicationRecords.scss';

// Communication types with icons and colors
const COMMUNICATION_TYPES = [
  { value: 'therapy-order', label: 'Therapy Order', icon: 'fa-clipboard-list', color: '#10b981' },
  { value: 'nomnc', label: 'NOMNC', icon: 'fa-file-contract', color: '#64748b' },
  { value: 'communication-report', label: 'Communication Report', icon: 'fa-comment-dots', color: '#8b5cf6' },
];

const CommunicationRecords = ({ patient, currentCertPeriod }) => {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedType, setSelectedType] = useState('therapy-order');
  
  // Local state for certification periods (similar to ScheduleComponent)
  const [certPeriods, setCertPeriods] = useState([]);
  const [localCurrentCertPeriod, setLocalCurrentCertPeriod] = useState(null);
  const [isLoadingCertPeriods, setIsLoadingCertPeriods] = useState(true);
  
  const { currentUser } = useAuth();
  
  // API Configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Fetch certification periods for patient (similar to ScheduleComponent)
  const fetchCertificationPeriods = async () => {
    if (!patient?.id) return;
    
    try {
      setIsLoadingCertPeriods(true);
      
      const response = await fetch(`${API_BASE_URL}/patient/${patient.id}/cert-periods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch certification periods: ${response.status} ${response.statusText}`);
      }
      
      const certData = await response.json();
      setCertPeriods(certData);
      
      // Determine active period - use currentCertPeriod from props if available, otherwise find active one
      let activePeriod = null;
      
      if (currentCertPeriod?.id) {
        activePeriod = certData.find(period => period.id === currentCertPeriod.id);
      }
      
      if (!activePeriod && certData.length > 0) {
        // Find the active certification period
        activePeriod = certData.find(period => period.is_active);
        
        // If no active period found, find the most current one
        if (!activePeriod) {
          const today = new Date();
          activePeriod = certData
            .filter(period => new Date(period.end_date) >= today)
            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0];
        }
      }
      
      setLocalCurrentCertPeriod(activePeriod);
      
    } catch (err) {
      console.error('Error fetching certification periods:', err);
      setCertPeriods([]);
      setLocalCurrentCertPeriod(null);
    } finally {
      setIsLoadingCertPeriods(false);
    }
  };

  // Load certification periods when patient changes
  useEffect(() => {
    if (patient?.id) {
      fetchCertificationPeriods();
    }
  }, [patient?.id]);

  // Use local cert period or fallback to prop
  const effectiveCertPeriod = localCurrentCertPeriod || currentCertPeriod;

  // Fetch communication records from API
  useEffect(() => {
    const fetchRecords = async () => {
      const certPeriodId = effectiveCertPeriod?.id;
      
      if (!certPeriodId) {
        setRecords([]);
        setFilteredRecords([]);
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
            // Authorization será agregado cuando se implemente el sistema de tokens
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch communication records: ${response.status} ${response.statusText}`);
        }
        
        const recordsData = await response.json();
        setRecords(recordsData);
        setFilteredRecords(recordsData);
        
      } catch (err) {
        console.error('Error fetching records:', err);
        setError(err.message);
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecords();
  }, [effectiveCertPeriod?.id, API_BASE_URL, isLoadingCertPeriods]);

  // Filter and sort records
  useEffect(() => {
    let result = [...records];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        record => record.title?.toLowerCase().includes(query) || 
                record.content?.toLowerCase().includes(query) ||
                record.staff_name?.toLowerCase().includes(query)
      );
    }
    
    // Sort records
    result = sortRecords(result, sortBy);
    
    setFilteredRecords(result);
  }, [records, searchQuery, sortBy]);

  // Sort records based on criteria
  const sortRecords = (recordsToSort, sortCriteria) => {
    const sortedRecords = [...recordsToSort];
    
    switch (sortCriteria) {
      case 'date-desc':
        return sortedRecords.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'date-asc':
        return sortedRecords.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'title-asc':
        return sortedRecords.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'title-desc':
        return sortedRecords.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      case 'author':
        return sortedRecords.sort((a, b) => (a.staff_name || '').localeCompare(b.staff_name || ''));
      default:
        return sortedRecords;
    }
  };

  // Create new record via API
  const createRecord = async (recordData) => {
    try {
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
      setRecords(prevRecords => [newRecord, ...prevRecords]);
      
      return newRecord;
    } catch (err) {
      console.error('Error creating record:', err);
      throw err;
    }
  };

  // Update record via API
  const updateRecord = async (recordId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/communication-records/${recordId}`, {
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
      setRecords(prevRecords => 
        prevRecords.map(record => record.id === recordId ? updatedRecord : record)
      );
      
      return updatedRecord;
    } catch (err) {
      console.error('Error updating record:', err);
      throw err;
    }
  };

  // Delete record via API
  const deleteRecord = async (recordId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/communication-records/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete record: ${response.status} ${response.statusText}`);
      }
      
      setRecords(prevRecords => prevRecords.filter(record => record.id !== recordId));
      
    } catch (err) {
      console.error('Error deleting record:', err);
      throw err;
    }
  };

  // Handle saving a new record
  const handleSaveRecord = async (event) => {
    event.preventDefault();
    
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      const formData = new FormData(event.target);
      const type = formData.get('type') || selectedType;
      const content = formData.get('content')?.trim();
      
      if (!content) {
        setError('Please provide content for the record.');
        return;
      }

      // Get the label from the selected type
      const selectedTypeInfo = COMMUNICATION_TYPES.find(t => t.value === type);
      const title = selectedTypeInfo ? selectedTypeInfo.label : 'Communication Record';
      
      // Try to find certification period ID
      const certPeriodId = effectiveCertPeriod?.id;
      
      if (!certPeriodId) {
        setError('No active certification period found. Please ensure the patient has an active certification period.');
        return;
      }

      const recordData = {
        certification_period_id: certPeriodId,
        title,
        content
      };
      
      if (editingRecord) {
        await updateRecord(editingRecord.id, { title, content });
        setEditingRecord(null);
      } else {
        await createRecord(recordData);
      }
      
      setIsAddingRecord(false);
      event.target.reset();
      
    } catch (err) {
      console.error('Error saving record:', err);
      setError('Failed to save record: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle editing a record
  const handleEditRecord = (record) => {
    setEditingRecord(record);
    // Find the type based on the record title
    const typeInfo = COMMUNICATION_TYPES.find(t => t.label === record.title);
    setSelectedType(typeInfo ? typeInfo.value : 'therapy-order');
    setIsAddingRecord(true);
  };

  // Handle deleting a record
  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }
    
    try {
      await deleteRecord(recordId);
      if (activeRecordId === recordId) {
        setActiveRecordId(null);
      }
    } catch (err) {
      setError('Failed to delete record: ' + err.message);
    }
  };

  // Show record details
  const handleViewRecord = (recordId) => {
    setActiveRecordId(recordId);
  };

  // Format date helper function
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get communication type info
  const getTypeInfo = (title) => {
    return COMMUNICATION_TYPES.find(type => type.label === title) || COMMUNICATION_TYPES[0];
  };

  // Communication Record Card Component
  const RecordCard = ({ record }) => {
    const typeInfo = getTypeInfo(record.title);
    
    return (
      <div className="communication-record-card">
        <div className="record-header">
          <div className="record-title-section">
            <div className="type-indicator">
              <i className={`fas ${typeInfo.icon}`} style={{color: typeInfo.color}}></i>
            </div>
            <h3 className="record-title">{record.title}</h3>
          </div>
          <div className="record-actions">
            <button 
              className="action-btn view-btn" 
              onClick={() => handleViewRecord(record.id)}
              title="View Record"
            >
              <i className="fas fa-eye"></i>
            </button>
            <button 
              className="action-btn edit-btn" 
              onClick={() => handleEditRecord(record)}
              title="Edit Record"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button 
              className="action-btn delete-btn" 
              onClick={() => handleDeleteRecord(record.id)}
              title="Delete Record"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        
        <div className="record-content" onClick={() => handleViewRecord(record.id)}>
          <p>{record.content.length > 120 ? `${record.content.substring(0, 120)}...` : record.content}</p>
        </div>
        
        <div className="record-footer">
          <div className="record-author">
            <div className="author-icon">
              {record.staff_name ? record.staff_name.charAt(0) : 'U'}
            </div>
            <div className="author-info">
              <span className="author-name">{record.staff_name || 'Unknown'}</span>
              <span className="created-date">{formatDate(record.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="communication-records-component">
      {/* Error display */}
      {error && (
        <div className="error-banner">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="records-header">
        <div className="header-left">
          <div className="icon-wrapper">
            <i className="fas fa-comments"></i>
          </div>
          <h2>Communication Records</h2>
          <div className="record-count">{filteredRecords.length} records</div>
        </div>
        
        <div className="header-actions">
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search records..." 
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
              </select>
            </div>
          </div>
          
          <div className="view-actions">
            <button 
              className="add-record-btn"
              onClick={() => {
                setEditingRecord(null);
                setSelectedType('therapy-order');
                setIsAddingRecord(true);
              }}
              disabled={!effectiveCertPeriod?.id}
              title={!effectiveCertPeriod?.id ? "No active certification period available" : "Add Communication Record"}
            >
              <i className="fas fa-plus"></i>
              <span>Add Record</span>
            </button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="records-loading">
          <div className="loading-spinner">
            <div className="spinner-icon">
              <i className="fas fa-circle-notch fa-spin"></i>
            </div>
            <div className="loading-text">
              <span>Loading records</span>
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
          {!effectiveCertPeriod?.id ? (
            <div className="no-records">
              <div className="empty-state">
                <i className="fas fa-exclamation-triangle empty-icon"></i>
                <h3>No Active Certification Period</h3>
                <p>This patient needs an active certification period before communication records can be created.</p>
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="no-records">
              <div className="empty-state">
                <i className="fas fa-comments empty-icon"></i>
                <h3>No communication records found</h3>
                <p>{searchQuery ? 'Try adjusting your search criteria' : 'Start by adding your first communication record for this patient'}</p>
                {!searchQuery && (
                  <button className="add-first-record" onClick={() => {
                    setEditingRecord(null);
                    setSelectedType('therapy-order');
                    setIsAddingRecord(true);
                  }}>
                    <i className="fas fa-plus"></i>
                    Add First Record
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="records-list">
              {filteredRecords.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Add/Edit Record Modal */}
      {isAddingRecord && (
        <div className="modal-overlay" onClick={() => setIsAddingRecord(false)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-comments"></i>
                {editingRecord ? 'Edit Record' : 'Add Communication Record'}
              </h3>
              <button className="close-modal" onClick={() => setIsAddingRecord(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSaveRecord}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="type">Communication Type</label>
                  <select 
                    id="type" 
                    name="type" 
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="type-select"
                  >
                    {COMMUNICATION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="content">Content</label>
                  <textarea
                    id="content"
                    name="content"
                    rows={10}
                    placeholder="Enter record content..."
                    className="custom-textarea"
                    defaultValue={editingRecord?.content || ''}
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setIsAddingRecord(false)}
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
                      <i className="fas fa-save"></i> {editingRecord ? 'Update' : 'Save'} Record
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View Record Modal */}
      {activeRecordId && (
        <div className="modal-overlay" onClick={() => setActiveRecordId(null)}>
          <div className="record-modal view-record-modal" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const activeRecord = records.find(record => record.id === activeRecordId);
              if (!activeRecord) return null;
              
              return (
                <>
                  <div className="modal-header">
                    <div className="modal-title">
                      <div className="type-indicator">
                        <i className={`fas ${getTypeInfo(activeRecord.title).icon}`} style={{color: getTypeInfo(activeRecord.title).color}}></i>
                      </div>
                      <h3>{activeRecord.title}</h3>
                    </div>
                    <div className="modal-actions">
                      <button className="close-modal" onClick={() => setActiveRecordId(null)}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="modal-body">
                    <div className="view-record-info">
                      <div className="view-author-avatar">
                        {activeRecord.staff_name ? activeRecord.staff_name.charAt(0) : 'U'}
                      </div>
                      <div className="view-record-metadata">
                        <div className="view-record-author">
                          <span className="view-author-name">{activeRecord.staff_name || 'Unknown'}</span>
                        </div>
                        <div className="view-record-date">
                          <span className="date-display">
                            <i className="far fa-calendar-alt"></i>
                            {formatDate(activeRecord.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="record-full-text">
                      <p style={{whiteSpace: 'pre-wrap'}}>{activeRecord.content}</p>
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <div className="modal-actions">
                      <button 
                        className="edit-btn" 
                        onClick={() => { 
                          handleEditRecord(activeRecord); 
                          setActiveRecordId(null); 
                        }}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => { 
                          handleDeleteRecord(activeRecord.id); 
                          setActiveRecordId(null); 
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
      
      {/* Floating Action Button */}
      {effectiveCertPeriod?.id && (
        <div className="floating-action-button">
          <button 
            className="fab-button"
            onClick={() => {
              setEditingRecord(null);
              setSelectedType('therapy-order');
              setIsAddingRecord(true);
            }}
          >
            <i className="fas fa-plus"></i>
            <span className="fab-tooltip">Add Record</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CommunicationRecords;