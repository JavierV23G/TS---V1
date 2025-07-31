import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../../../styles/developer/Settings/NotesConfiguration.scss';

const NotesModule = () => {
  // States for sections
  const [sections, setSections] = useState([]);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  
  // Section form state
  const [sectionForm, setSectionForm] = useState({
    section_name: '',
    description: '',
    is_required: false,
    has_static_image: false,
    static_image_url: '',
    form_schema: {}
  });
  
  // Separate state for JSON text to allow free editing
  const [jsonText, setJsonText] = useState('{}');

  // States for templates
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [selectedVisitType, setSelectedVisitType] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Constants
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const disciplines = ['PT', 'OT', 'ST'];
  const visitTypes = ['Initial Evaluation', 'Standard', 'Reassessment (RA)', 'Discharge (DC)', 'Recert-Eval'];

  // Load sections and templates on mount
  useEffect(() => {
    fetchSections();
    fetchTemplates();
  }, []);

  // Update selected sections when discipline/type changes
  useEffect(() => {
    if (selectedDiscipline && selectedVisitType) {
      fetchSpecificTemplate(selectedDiscipline, selectedVisitType);
    } else {
      setSelectedSections([]);
    }
  }, [selectedDiscipline, selectedVisitType]);

  // Fetch sections
  const fetchSections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/note-sections`);
      if (!response.ok) throw new Error('Failed to fetch sections');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/note-templates/full`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  // Fetch specific template to get selected sections
  const fetchSpecificTemplate = async (discipline, visitType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${discipline}/${visitType}`);
      if (response.ok) {
        const template = await response.json();
        setSelectedSections(template.sections.map(s => s.id));
      } else {
        // Template doesn't exist, clear selections
        setSelectedSections([]);
      }
    } catch (error) {
      console.error('Error fetching specific template:', error);
      setSelectedSections([]);
    }
  };

  // Reset section form
  const resetSectionForm = () => {
    setSectionForm({
      section_name: '',
      description: '',
      is_required: false,
      has_static_image: false,
      static_image_url: '',
      form_schema: {}
    });
    setJsonText('{}');
    setEditingSection(null);
    setShowSectionForm(false);
    // Re-enable body scroll
    document.body.style.overflow = 'unset';
  };

  // Handle modal backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      resetSectionForm();
    }
  };

  // Effect to handle body scroll and footer when modal is open
  useEffect(() => {
    const footer = document.querySelector('.premium-footer');
    
    if (showSectionForm) {
      // Disable body scroll and hide footer when modal is open
      document.body.style.overflow = 'hidden';
      if (footer) footer.style.display = 'none';
    } else {
      // Re-enable body scroll and show footer when modal is closed
      document.body.style.overflow = 'unset';
      if (footer) footer.style.display = 'block';
    }
    
    // Cleanup function to restore scroll and footer on unmount
    return () => {
      document.body.style.overflow = 'unset';
      if (footer) footer.style.display = 'block';
    };
  }, [showSectionForm]);

  // Handle section form submit
  const handleSectionFormSubmit = async (e) => {
    e.preventDefault();
    if (!sectionForm.section_name.trim()) return;

    setIsCreatingSection(true);
    try {
      // Parse JSON before submitting
      let parsedSchema = {};
      try {
        parsedSchema = JSON.parse(jsonText);
      } catch (error) {
        console.error('Invalid JSON schema:', error);
        // Use empty object if JSON is invalid
        parsedSchema = {};
      }

      const endpoint = editingSection 
        ? `${API_BASE_URL}/note-sections/${editingSection.id}`
        : `${API_BASE_URL}/note-sections`;
      
      const method = editingSection ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sectionForm,
          form_schema: parsedSchema
        })
      });

      if (!response.ok) throw new Error(`Failed to ${editingSection ? 'update' : 'create'} section`);
      
      await fetchSections();
      resetSectionForm();
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'success-notification';
      notification.textContent = `Section ${editingSection ? 'updated' : 'created'} successfully!`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);

    } catch (error) {
      console.error(`Error ${editingSection ? 'updating' : 'creating'} section:`, error);
    } finally {
      setIsCreatingSection(false);
    }
  };

  // Handle edit section
  const handleEditSection = (section) => {
    setSectionForm({
      section_name: section.section_name,
      description: section.description || '',
      is_required: section.is_required || false,
      has_static_image: section.has_static_image || false,
      static_image_url: section.static_image_url || '',
      form_schema: section.form_schema || {}
    });
    setJsonText(JSON.stringify(section.form_schema || {}, null, 2));
    setEditingSection(section);
    setShowSectionForm(true);
  };

  // Handle delete section
  const handleDeleteSection = async (section) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the section "${section.section_name}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/note-sections/${section.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete section: ${response.status} ${response.statusText}`);
      }
      
      await fetchSections();
      await fetchTemplates(); // Refresh templates in case the deleted section was used
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'success-notification';
      notification.textContent = 'Section deleted successfully!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);

    } catch (error) {
      console.error('Error deleting section:', error);
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.textContent = 'Error deleting section. Please try again.';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  };

  // Handle section form change
  const handleSectionFormChange = (field, value) => {
    setSectionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save template
  const handleSaveTemplate = async () => {
    if (!selectedDiscipline || !selectedVisitType) return;

    setIsSavingTemplate(true);
    try {
      // Check if template exists using the specific endpoint
      let existingTemplate = null;
      try {
        const checkResponse = await fetch(`${API_BASE_URL}/templates/${selectedDiscipline}/${selectedVisitType}`);
        if (checkResponse.ok) {
          existingTemplate = await checkResponse.json();
        }
      } catch (error) {
        // Template doesn't exist, will create new one
        console.log('Template does not exist, will create new one');
      }

      if (existingTemplate) {
        // UPDATE existing template using query parameters
        const params = new URLSearchParams({
          discipline: selectedDiscipline,
          note_type: selectedVisitType,
          is_active: 'true'
        });
        
        // Add replace_section_ids as individual parameters
        selectedSections.forEach(sectionId => {
          params.append('replace_section_ids', sectionId.toString());
        });
        
        const endpoint = `${API_BASE_URL}/note-templates/${existingTemplate.id}?${params.toString()}`;
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to update template: ${errorData.detail || response.statusText}`);
        }
      } else {
        // CREATE new template
        const endpoint = `${API_BASE_URL}/note-templates`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            discipline: selectedDiscipline,
            note_type: selectedVisitType,
            is_active: true,
            section_ids: selectedSections
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to create template: ${errorData.detail || response.statusText}`);
        }
      }
      
      await fetchTemplates();
      // Refresh the specific template data to update the selected sections
      await fetchSpecificTemplate(selectedDiscipline, selectedVisitType);

      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'success-notification';
      notification.textContent = `Template ${existingTemplate ? 'updated' : 'created'} successfully!`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);

    } catch (error) {
      console.error('Error saving template:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.textContent = error.message || 'Error saving template. Please try again.';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Toggle section in template
  const handleSectionToggle = (sectionId) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="settings-module-content">
      <div className="module-header">
        <h2>
          <i className="fas fa-sticky-note"></i>
          Notes Configuration Center
        </h2>
        <p>Configure sections and templates for clinical documentation</p>
      </div>

      {/* Template Management */}
      <div className="template-editor card">
        <h3>Template Configuration</h3>
        
        {/* Discipline and Visit Type Selectors */}
        <div className="selectors">
          <div className="select-group">
            <label>Discipline:</label>
            <select 
              value={selectedDiscipline} 
              onChange={(e) => setSelectedDiscipline(e.target.value)}
            >
              <option value="">Select Discipline</option>
              {disciplines.map(discipline => (
                <option key={discipline} value={discipline}>{discipline}</option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <label>Visit Type:</label>
            <select 
              value={selectedVisitType}
              onChange={(e) => setSelectedVisitType(e.target.value)}
              disabled={!selectedDiscipline}
            >
              <option value="">Select Visit Type</option>
              {visitTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sections List */}
        {selectedDiscipline && selectedVisitType && (
          <div className="sections-list">
            <h4>Available Sections</h4>
            <div className="sections-grid">
              {sections.map(section => (
                <div 
                  key={section.id} 
                  className={`section-item ${selectedSections.includes(section.id) ? 'selected' : ''}`}
                >
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section.id)}
                      onChange={() => handleSectionToggle(section.id)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="section-name">{section.section_name}</span>
                  </label>
                </div>
              ))}
            </div>

            <button 
              className="save-template-btn"
              onClick={handleSaveTemplate}
              disabled={isSavingTemplate}
            >
              {isSavingTemplate ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-save"></i>
              )}
              Save Template
            </button>
          </div>
        )}
      </div>

      {/* Sections Management */}
      <div className="sections-management card">
        <div className="sections-header">
          <h3>Sections Management</h3>
          <button 
            className="create-section-btn"
            onClick={() => setShowSectionForm(true)}
          >
            <i className="fas fa-plus"></i>
            Create Section
          </button>
        </div>

        {/* Existing Sections List */}
        <div className="existing-sections">
          <h4>Existing Sections</h4>
          <div className="sections-grid">
            {sections.map(section => (
              <div key={section.id} className="section-card">
                <div className="section-info">
                  <div className="section-name">{section.section_name}</div>
                  <div className="section-meta">
                    {section.is_required && <span className="required-badge">Required</span>}
                    {section.has_static_image && <span className="image-badge">Has Image</span>}
                  </div>
                </div>
                <div className="section-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditSection(section)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteSection(section)}
                    style={{ marginLeft: '24px' }}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal Portal */}
      {showSectionForm && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)'
          }}
          onClick={handleBackdropClick}
        >
          <div 
            style={{
              backgroundColor: '#2C3E50',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>
                {editingSection ? 'Edit Section' : 'Create Section'}
              </h3>
              <button onClick={resetSectionForm} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSectionFormSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '6px' }}>Section Name *</label>
                <input
                  type="text"
                  value={sectionForm.section_name}
                  onChange={(e) => handleSectionFormChange('section_name', e.target.value)}
                  placeholder="Enter section name..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '6px' }}>Description</label>
                <textarea
                  value={sectionForm.description}
                  onChange={(e) => handleSectionFormChange('description', e.target.value)}
                  placeholder="Enter description..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={sectionForm.is_required}
                    onChange={(e) => handleSectionFormChange('is_required', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Required
                </label>
                <label style={{ display: 'flex', alignItems: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={sectionForm.has_static_image}
                    onChange={(e) => handleSectionFormChange('has_static_image', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Has Image
                </label>
              </div>

              {sectionForm.has_static_image && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '6px' }}>Image URL</label>
                  <input
                    type="url"
                    value={sectionForm.static_image_url}
                    onChange={(e) => handleSectionFormChange('static_image_url', e.target.value)}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '16px'
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '6px' }}>Form Schema (JSON)</label>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder='{"fields": []}'
                  rows="5"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                />
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
                  Define the form structure for this section in JSON format
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={resetSectionForm}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'transparent',
                    color: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isCreatingSection || !sectionForm.section_name.trim()}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    opacity: (isCreatingSection || !sectionForm.section_name.trim()) ? 0.6 : 1
                  }}
                >
                  {isCreatingSection ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-save"></i>
                  )}
                  {editingSection ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotesModule;