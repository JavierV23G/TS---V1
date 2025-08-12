import React, { useState, useEffect } from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/SubjectiveSection.scss';

const SubjectiveSection = ({ data, onChange, sectionId, config }) => {
  const [localData, setLocalData] = useState({
    subjective: data?.subjective || ''
  });

  // Sincronizar con datos externos
  useEffect(() => {
    if (data?.subjective !== undefined) {
      setLocalData({ subjective: data.subjective });
    }
  }, [data]);

  // Auto-guardar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChange(localData);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [localData, onChange]);

  const handleChange = (value) => {
    setLocalData({ subjective: value });
  };

  // Quick templates simples
  const insertTemplate = (template) => {
    const currentText = localData.subjective;
    const newText = currentText ? `${currentText}\n\n${template}` : template;
    handleChange(newText);
  };

  const templates = [
    {
      label: 'Chief Complaint',
      text: 'Chief Complaint: \nOnset: \nLocation: \nSeverity (1-10): \nQuality: \nAggravating factors: \nRelieving factors: '
    },
    {
      label: 'Pain Description',
      text: 'Pain Description:\n- Location: \n- Quality: \n- Intensity (0-10): \n- Frequency: \n- Associated symptoms: '
    },
    {
      label: 'Functional Status',
      text: 'Functional Status:\n- Current mobility level: \n- Activities affected: \n- Patient goals: \n- Barriers to progress: '
    }
  ];

  return (
    <div className="subjective-section">
      <div className="section-header">
        <h3>Subjective</h3>
      </div>

      <div className="quick-templates">
        <span className="templates-label">Quick Templates:</span>
        {templates.map((template, index) => (
          <button
            key={index}
            className="template-btn"
            onClick={() => insertTemplate(template.text)}
          >
            {template.label}
          </button>
        ))}
      </div>

      <div className="section-content">
        <textarea
          className="subjective-textarea"
          value={localData.subjective}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter patient's subjective complaints, symptoms, and concerns..."
          rows={12}
        />
      </div>
    </div>
  );
};

export default SubjectiveSection;