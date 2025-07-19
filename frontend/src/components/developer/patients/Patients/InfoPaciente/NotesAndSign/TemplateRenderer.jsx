import React, { useState, useEffect, Suspense } from 'react';
import '../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/TemplateRenderer.scss';

// Import all sections
import * as Sections from './sections';

const TemplateRenderer = ({ 
  templateConfig, 
  data, 
  onChange,
  onOpenTest,
  onOpenDiagnosisModal,
  autoSaveMessage 
}) => {
  const [loadedSections, setLoadedSections] = useState({});
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load sections based on template configuration
  useEffect(() => {
    if (!templateConfig?.sections) return;

    const loadSections = async () => {
      setLoading(true);
      const sectionsMap = {};

      templateConfig.sections.forEach(sectionConfig => {
        const SectionComponent = Sections[sectionConfig.component];
        if (SectionComponent) {
          sectionsMap[sectionConfig.id] = {
            Component: SectionComponent,
            config: sectionConfig
          };
        } else {
          console.warn(`Section component ${sectionConfig.component} not found`);
        }
      });

      setLoadedSections(sectionsMap);
      
      // Set first section as active by default
      if (templateConfig.sections.length > 0) {
        setActiveSection(templateConfig.sections[0].id);
      }
      
      setLoading(false);
    };

    loadSections();
  }, [templateConfig]);

  // Handle section data changes
  const handleSectionChange = (sectionId, sectionData) => {
    const updatedData = {
      ...data,
      [sectionId]: sectionData
    };
    onChange(updatedData);
  };

  // Get section navigation
  const getSectionNavigation = () => {
    if (!templateConfig?.sections) return [];
    
    return templateConfig.sections.map(section => ({
      id: section.id,
      name: section.name || section.component.replace('Section', ''),
      icon: section.icon || 'fas fa-file-alt',
      required: section.required || false,
      completed: isDataComplete(data[section.id] || {})
    }));
  };

  // Check if section data is complete (simple validation)
  const isDataComplete = (sectionData) => {
    if (!sectionData || typeof sectionData !== 'object') return false;
    
    const values = Object.values(sectionData);
    return values.some(value => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'boolean') return value === true;
      if (typeof value === 'number') return value > 0;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => 
          (typeof v === 'string' && v.trim().length > 0) ||
          (typeof v === 'boolean' && v === true) ||
          (typeof v === 'number' && v > 0)
        );
      }
      return false;
    });
  };

  // Render section navigation
  const renderNavigation = () => {
    const navigation = getSectionNavigation();
    
    return (
      <div className="template-navigation">
        <div className="nav-header">
          <h3>
            <i className="fas fa-clipboard-list"></i>
            {templateConfig?.name || 'Template Sections'}
          </h3>
          <div className="progress-indicator">
            {navigation.filter(n => n.completed).length} / {navigation.length} completed
          </div>
        </div>
        
        <div className="nav-sections">
          {navigation.map(navItem => (
            <button
              key={navItem.id}
              className={`nav-section ${activeSection === navItem.id ? 'active' : ''} ${navItem.completed ? 'completed' : ''} ${navItem.required ? 'required' : ''}`}
              onClick={() => setActiveSection(navItem.id)}
            >
              <div className="nav-icon">
                <i className={navItem.icon}></i>
                {navItem.completed && (
                  <div className="completion-badge">
                    <i className="fas fa-check"></i>
                  </div>
                )}
              </div>
              <div className="nav-content">
                <span className="nav-name">{navItem.name}</span>
                {navItem.required && (
                  <span className="required-badge">Required</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render active section
  const renderActiveSection = () => {
    if (!activeSection || !loadedSections[activeSection]) {
      return (
        <div className="no-section">
          <div className="no-section-content">
            <i className="fas fa-file-alt"></i>
            <h3>No Section Selected</h3>
            <p>Please select a section from the navigation</p>
          </div>
        </div>
      );
    }

    const { Component, config } = loadedSections[activeSection];
    const sectionData = data[activeSection] || {};

    return (
      <div className="active-section">
        <div className="section-header">
          <div className="section-info">
            <h2>
              <i className={config.icon || 'fas fa-file-alt'}></i>
              {config.name || config.component.replace('Section', '')}
            </h2>
            {config.description && (
              <p className="section-description">{config.description}</p>
            )}
          </div>
          
          <div className="section-actions">
            {autoSaveMessage && (
              <span className="autosave-indicator">
                <i className="fas fa-check-circle"></i>
                {autoSaveMessage}
              </span>
            )}
          </div>
        </div>

        <div className="section-content">
          <Suspense fallback={<SectionSkeleton />}>
            <Component
              data={sectionData}
              onChange={(newData) => handleSectionChange(activeSection, newData)}
              sectionId={activeSection}
              config={config}
              onOpenTest={onOpenTest}
              onOpenDiagnosisModal={onOpenDiagnosisModal}
              autoSaveMessage={autoSaveMessage}
            />
          </Suspense>
        </div>
      </div>
    );
  };

  // Loading skeleton component
  const SectionSkeleton = () => (
    <div className="section-skeleton">
      <div className="skeleton-header"></div>
      <div className="skeleton-content">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="template-renderer loading">
        <div className="loading-content">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <h3>Loading Template...</h3>
          <p>Preparing sections for {templateConfig?.name}</p>
        </div>
      </div>
    );
  }

  if (!templateConfig) {
    return (
      <div className="template-renderer error">
        <div className="error-content">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>No Template Configuration</h3>
          <p>Waiting for template configuration from backend...</p>
          <small>The backend must provide the template with sections to display</small>
        </div>
      </div>
    );
  }

  return (
    <div className="template-renderer">
      <div className="renderer-layout">
        {renderNavigation()}
        <div className="renderer-content">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default TemplateRenderer;