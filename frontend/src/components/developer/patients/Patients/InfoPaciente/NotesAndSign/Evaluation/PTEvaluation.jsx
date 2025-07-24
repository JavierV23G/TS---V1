
import React, { useState } from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/PTEvaluation.scss';
import DynamicFormRenderer from '../../../../settings/DynamicFormRenderer';
import { 
  patientInfoTemplate, 
  vitalsTemplate, 
  painTemplate, 
  medicationTemplate, 
  standardizedTestsTemplate 
} from '../../../../settings/patientInformationTemplate';

const PTEvaluation = ({ data, onChange, onOpenTest, onOpenDiagnosisModal, autoSaveMessage }) => {
  const [activeTab, setActiveTab] = useState('patient-information');

  const renderActiveTabContent = () => {
    const props = {
      data: data,
      onChange: onChange,
      onOpenTest: onOpenTest,
      onOpenDiagnosisModal: onOpenDiagnosisModal
    };

    switch (activeTab) {
      case 'patient-information':
        return <DynamicFormRenderer template={patientInfoTemplate} {...props} />;
      case 'vitals':
        return <DynamicFormRenderer template={vitalsTemplate} {...props} />;
      case 'pain':
        return <DynamicFormRenderer template={painTemplate} {...props} />;
      case 'medication':
        return <DynamicFormRenderer template={medicationTemplate} {...props} />;
      case 'tests':
        return <DynamicFormRenderer template={standardizedTestsTemplate} {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="pt-evaluation-container">
      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === 'patient-information' ? 'active' : ''}`}
          onClick={() => setActiveTab('patient-information')}
        >
          <i className="fas fa-user-alt"></i>
          Patient Information
        </button>
        <button 
          className={`tab-button ${activeTab === 'vitals' ? 'active' : ''}`}
          onClick={() => setActiveTab('vitals')}
        >
          <i className="fas fa-heartbeat"></i>
          Vitals
        </button>
        <button 
          className={`tab-button ${activeTab === 'pain' ? 'active' : ''}`}
          onClick={() => setActiveTab('pain')}
        >
          <i className="fas fa-bolt"></i>
          Pain
        </button>
        <button 
          className={`tab-button ${activeTab === 'medication' ? 'active' : ''}`}
          onClick={() => setActiveTab('medication')}
        >
          <i className="fas fa-pills"></i>
          Medication
        </button>
        <button 
          className={`tab-button ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          <i className="fas fa-clipboard-list"></i>
          Standardized Tests
        </button>
      </div>
      
      <div className="tab-content">
        <div className="section-title">
            <h2>{activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
            <span className={`autosaved-badge ${autoSaveMessage ? 'visible' : ''}`}>
                <i className="fas fa-check-circle"></i>
                {autoSaveMessage || 'AUTOSAVED'}
            </span>
        </div>
        {renderActiveTabContent()}
      </div>
    </div>
  );
};

export default PTEvaluation;
