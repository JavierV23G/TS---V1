import React, { useState, useEffect } from 'react';
import '../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/NoteTemplateModal.scss';
import TemplateRenderer from './TemplateRenderer';
import useTemplateConfig from './hooks/useTemplateConfig';
import useSectionData from './hooks/useSectionData';

const NoteTemplateModal = ({ 
  isOpen, 
  onClose, 
  patientData, 
  disciplina = 'PT', 
  tipoNota = 'Initial Evaluation',
  initialData = {},
  existingNoteId = null,
  onSave 
}) => {
  const [currentStep, setCurrentStep] = useState('template');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load template configuration - hooks must be called unconditionally
  const { 
    templateConfig, 
    loading: configLoading, 
    error: configError,
    refreshConfig 
  } = useTemplateConfig(disciplina, tipoNota, isOpen);


  // Manage section data with autosave
  const {
    data,
    isDirty,
    saving,
    autoSaveMessage,
    updateData,
    updateSection,
    saveData,
    validateData,
    getCompletionStats
  } = useSectionData(initialData, {
    enabled: templateConfig?.navigation?.autoSave || false,
    interval: templateConfig?.navigation?.autoSaveInterval || 30000,
    onSave: onSave
  });



  // Early return if modal is not open - after hooks
  if (!isOpen) {
    return null;
  }

  // Handle modal close
  const handleClose = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmed) return;
    }
    onClose();
  };

  // Handle final save/submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      console.log('=== DEBUG: handleSubmit called ===');
      console.log('Current data state:', data);
      console.log('Data keys:', Object.keys(data));
      console.log('Template config:', templateConfig);
      console.log('Template sections:', templateConfig?.sections);
      console.log('Initial data received:', initialData);
      console.log('Initial data keys:', Object.keys(initialData));
      
      const validation = validateData(data, templateConfig);
      console.log('Validation result:', validation);
      
      if (!validation.isValid) {
        console.log('Validation failed with errors:', validation.errors);
        alert(`Please fix the following errors:\n${Object.values(validation.errors).join('\n')}`);
        return;
      }

      // Preparar datos para crear la nota en el formato VisitNoteCreate
      const templateSectionNames = templateConfig?.sections?.map(section => section.section_name) || [];
      console.log('Template section names:', templateSectionNames);
      
      // Extraer solo las secciones del template para sections_data
      const sectionsData = {};
      Object.entries(data).forEach(([key, value]) => {
        if (templateSectionNames.includes(key)) {
          sectionsData[key] = value;
        }
      });
      
      console.log('Extracted sections data for save:', sectionsData);
      console.log('Template section names:', templateSectionNames);
      console.log('All data keys:', Object.keys(data));
      console.log('Visit ID from data:', data.visit_id || data.id);
      console.log('Staff ID from data:', data.staff_id);
      
      // El backend obtiene automáticamente el therapist_name del staff de la visita
      // No necesitamos enviarlo desde el frontend
      
      // Llamar al endpoint apropiado según si es edición o creación
      try {
        let response, result;
        
        if (existingNoteId) {
          // UPDATE existing note using PUT
          console.log('Updating existing note:', existingNoteId);
          
          const updateData = {
            sections_data: sectionsData,
            therapist_name: "Auto-calculated by backend"
          };
          
          console.log('Update data to send:', updateData);
          
          response = await fetch(`http://localhost:8000/visit-notes/${existingNoteId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to update note: ${response.status} - ${JSON.stringify(errorData)}`);
          }
          
          result = await response.json();
          console.log('Note updated successfully:', result);
        } else {
          // CREATE new note using POST
          console.log('Creating new note for visit:', data.id);
          
          const noteData = {
            visit_id: data.visit_id || data.id,
            sections_data: sectionsData,
            therapist_name: "Auto-calculated by backend"
          };
          
          
          response = await fetch('http://localhost:8000/visit-notes/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to create note: ${response.status} - ${JSON.stringify(errorData)}`);
          }
          
          result = await response.json();
          console.log('Note created successfully:', result);
        }
        
        // Llamar onSave si existe
        if (onSave) {
          await onSave(result, { 
            templateConfig, 
            validation,
            completionStats: getCompletionStats(templateConfig),
            isCompleted: true
          });
        }
      } catch (backendError) {
        console.error('Backend operation failed:', backendError);
        throw new Error(`Failed to save note: ${backendError.message}`);
      }

      onClose();
    } catch (error) {
      console.error('Error submitting template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle test opening (placeholder)
  const handleOpenTest = (testName) => {
    // TODO: Implement test modal opening logic
  };

  // Handle diagnosis modal opening (placeholder)
  const handleOpenDiagnosisModal = () => {
    // TODO: Implement diagnosis modal opening logic
  };

  // Render loading state
  if (configLoading) {
    return (
      <div className={`note-template-modal ${isOpen ? 'open' : ''}`}>
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content loading-content" onClick={(e) => e.stopPropagation()}>
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <h3>Loading Template from Backend...</h3>
            <p>Fetching {disciplina} {tipoNota} template configuration and sections</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (configError) {
    return (
      <div className={`note-template-modal ${isOpen ? 'open' : ''}`}>
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content error-content" onClick={(e) => e.stopPropagation()}>
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Backend Template Required</h3>
            <p>Failed to load template from backend: {configError}</p>
            <small>The system requires a template configuration from the backend to determine which sections to display.</small>
            <div className="error-actions">
              <button className="retry-btn" onClick={refreshConfig}>
                <i className="fas fa-redo"></i>
                Retry
              </button>
              <button className="close-btn" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completionStats = getCompletionStats(templateConfig);

  return (
    <div className="note-template-modal open">
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="modal-header">
            <div className="header-left">
              <div className="template-info">
                <h2>
                  <i className="fas fa-file-medical"></i>
                  {templateConfig?.name || 'Template'}
                </h2>
                <div className="template-meta">
                  <span className="patient-name">
                    {patientData?.firstName} {patientData?.lastName}
                  </span>
                  <span className="completion-status">
                    <i className="fas fa-chart-pie"></i>
                    {completionStats.percentage}% Complete ({completionStats.completed}/{completionStats.total})
                  </span>
                </div>
              </div>
            </div>

            <div className="header-right">
              <div className="header-actions">
                {autoSaveMessage && (
                  <span className="autosave-status">
                    <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-check-circle'}`}></i>
                    {autoSaveMessage}
                  </span>
                )}
                
                <button 
                  className="save-btn"
                  onClick={() => saveData()}
                  disabled={saving || !isDirty}
                >
                  <i className="fas fa-save"></i>
                  Save Draft
                </button>

                <button className="close-btn" onClick={handleClose}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            <TemplateRenderer
              templateConfig={templateConfig}
              data={data}
              onChange={updateData}
              onOpenTest={handleOpenTest}
              onOpenDiagnosisModal={handleOpenDiagnosisModal}
              autoSaveMessage={autoSaveMessage}
            />
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <div className="footer-left">
              <div className="progress-indicator">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${completionStats.percentage}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {completionStats.completed} of {completionStats.total} sections completed
                </span>
              </div>
            </div>

            <div className="footer-right">
              <div className="footer-actions">
                <button 
                  className="cancel-btn" 
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                
                <button 
                  className="submit-btn" 
                  onClick={handleSubmit}
                  disabled={isSubmitting || saving}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      Complete & Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteTemplateModal;