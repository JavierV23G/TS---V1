import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/TransfersFunctionalSection.scss';

const TransfersFunctionalSection = ({ data, onChange, sectionId, config }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  // Assistant levels based on JSON options
  const assistLevels = [
    { value: "", label: "Select Level" },
    { value: "Independent", label: "Independent" },
    { value: "Modified Independent", label: "Modified Independent" },
    { value: "Supervision", label: "Supervision" },
    { value: "Minimal Assist", label: "Minimal Assist" },
    { value: "Moderate Assist", label: "Moderate Assist" },
    { value: "Maximal Assist", label: "Maximal Assist" },
    { value: "Dependent", label: "Dependent" }
  ];

  // Transfer activities from JSON
  const transferActivities = [
    { id: 'sit_stand', label: 'Sit / Stand', icon: 'fas fa-chair' },
    { id: 'bed_wheelchair', label: 'Bed / Wheelchair', icon: 'fas fa-wheelchair' },
    { id: 'toilet', label: 'Toilet', icon: 'fas fa-toilet' },
    { id: 'tub', label: 'Tub', icon: 'fas fa-bath' },
    { id: 'auto', label: 'Auto', icon: 'fas fa-car' },
    { id: 'roll_turn', label: 'Roll / Turn', icon: 'fas fa-redo' },
    { id: 'sit_supine', label: 'Sit / Supine', icon: 'fas fa-bed' },
    { id: 'scoot_bridge', label: 'Scoot / Bridge', icon: 'fas fa-arrows-alt-h' }
  ];

  // Assistance level colors for visual feedback
  const getAssistLevelColor = (level) => {
    const colorMap = {
      'Independent': '#22c55e',
      'Modified Independent': '#3b82f6',
      'Supervision': '#06b6d4',
      'Minimal Assist': '#eab308',
      'Moderate Assist': '#f59e0b',
      'Maximal Assist': '#f97316',
      'Dependent': '#ef4444'
    };
    return colorMap[level] || '#64748b';
  };

  return (
    <div className="transfers-functional-section">
      <div className="section-title">
        <h2>Transfers / Functional Independence</h2>
      </div>
      
      <div className="transfers-layout">
        {/* Transfer Activities Grid */}
        <div className="transfers-grid">
          {transferActivities.map(activity => (
            <div key={activity.id} className="transfer-card">
              <div className="transfer-header">
                <i className={activity.icon}></i>
                <label>{activity.label}</label>
              </div>
              <select 
                value={data?.[activity.id] || ''}
                onChange={(e) => handleChange(activity.id, e.target.value)}
                className="transfer-select"
                style={{
                  borderColor: data?.[activity.id] ? getAssistLevelColor(data[activity.id]) : '#ddd'
                }}
              >
                {assistLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              {data?.[activity.id] && (
                <div 
                  className="level-indicator"
                  style={{ backgroundColor: getAssistLevelColor(data[activity.id]) }}
                >
                  {data[activity.id]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Wheelchair Usage */}
        <div className="form-group wheelchair-section">
          <label>
            <i className="fas fa-wheelchair"></i>
            Does patient have a wheelchair?
          </label>
          <select 
            value={data?.wheelchair_usage || ''}
            onChange={(e) => handleChange('wheelchair_usage', e.target.value)}
            className="form-select"
          >
            <option value="">Select an option</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Occasionally">Occasionally</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>

        {/* Additional Information */}
        <div className="form-group">
          <label>
            <i className="fas fa-clipboard-list"></i>
            Additional Information
          </label>
          <textarea 
            value={data?.additional_information || ''}
            onChange={(e) => handleChange('additional_information', e.target.value)}
            placeholder="Enter any additional transfer or functional information..."
            rows={4}
            className="form-textarea"
          />
        </div>

        {/* Summary Card */}
        <div className="transfers-summary">
          <div className="summary-header">
            <h4>
              <i className="fas fa-chart-pie"></i>
              Functional Independence Summary
            </h4>
          </div>
          <div className="summary-grid">
            {transferActivities.map(activity => (
              data?.[activity.id] && (
                <div key={activity.id} className="summary-item">
                  <span className="activity">{activity.label}:</span>
                  <span 
                    className="level"
                    style={{ color: getAssistLevelColor(data[activity.id]) }}
                  >
                    {data[activity.id]}
                  </span>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransfersFunctionalSection;