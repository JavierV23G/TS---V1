import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/TransfersFunctionalSection.scss';

const TransfersFunctionalSection = ({ data, onChange, sectionId, config }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  // Assistant levels for dropdown options
  const assistLevels = [
    { value: "", label: "Select an Option" },
    { value: "I", label: "I (No Assist)" },
    { value: "MI", label: "MI (Uses Assistive Device)" },
    { value: "SBA", label: "SBA (Stand By Assist)" },
    { value: "CGA", label: "CGA (Contact Guard Assist)" },
    { value: "MIN", label: "MIN (Requires 0-25% Assist)" },
    { value: "MOD", label: "MOD (Requires 26-50% Assist)" },
    { value: "MAX", label: "MAX (Requires 51-75% Assist)" },
    { value: "TOT", label: "TOT (Requires 76-99% Assist)" },
    { value: "DEP", label: "DEP (100% Assist)" },
    { value: "S", label: "S (Set up/Supervision)" }
  ];

  // 🔥 TRANSFERENCIAS ORGANIZADAS POR TIPO
  const basicTransfers = [
    { id: 'sitStand', label: 'Sit / Stand', icon: 'fas fa-chair' },
    { id: 'rollTurn', label: 'Roll / Turn', icon: 'fas fa-redo' },
    { id: 'sitSupine', label: 'Sit / Supine', icon: 'fas fa-bed' }
  ];

  const mobilityTransfers = [
    { id: 'auto', label: 'Auto', icon: 'fas fa-car' },
    { id: 'bedWheelchair', label: 'Bed / Wheelchair', icon: 'fas fa-wheelchair' },
    { id: 'scootBridge', label: 'Scoot / Bridge', icon: 'fas fa-arrows-alt-h' }
  ];

  const functionalTransfers = [
    { id: 'toilet', label: 'Toilet', icon: 'fas fa-toilet' },
    { id: 'tub', label: 'Tub', icon: 'fas fa-bath' }
  ];

  // Assistance level colors for visual feedback
  const assistLevelColors = {
    'I': '#22c55e',      // Green - Independent
    'MI': '#3b82f6',     // Blue - Minimal help
    'SBA': '#06b6d4',    // Cyan - Stand by
    'CGA': '#8b5cf6',    // Purple - Contact guard
    'MIN': '#eab308',    // Yellow - Minimal assist
    'MOD': '#f59e0b',    // Orange - Moderate assist
    'MAX': '#f97316',    // Red-orange - Max assist
    'TOT': '#ef4444',    // Red - Total assist
    'DEP': '#dc2626',    // Dark red - Dependent
    'S': '#10b981'       // Teal - Supervision
  };

  return (
    <div className="transfers-functional-section">
      <div className="form-section">
        <div className="section-title">
          <h2>
            <i className="fas fa-exchange-alt"></i>
            Transfers / Functional Independence
          </h2>
        </div>

        <div className="transfers-categories">
          {/* Basic Transfers */}
          <div className="transfer-category">
            <h4 className="category-title">
              <i className="fas fa-user"></i>
              Basic Transfers
            </h4>
            <div className="transfers-grid">
              {basicTransfers.map(transfer => (
                <div className="transfer-item" key={transfer.id}>
                  <div className="transfer-header">
                    <i className={transfer.icon}></i>
                    <label>{transfer.label}</label>
                  </div>
                  <select 
                    value={data[transfer.id] || ''}
                    onChange={(e) => handleChange(transfer.id, e.target.value)}
                    className={data[transfer.id] ? `selected level-${data[transfer.id]}` : ''}
                    style={{
                      '--level-color': data[transfer.id] ? assistLevelColors[data[transfer.id]] || '#6b7280' : '#6b7280'
                    }}
                  >
                    {assistLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Mobility Transfers */}
          <div className="transfer-category">
            <h4 className="category-title">
              <i className="fas fa-wheelchair"></i>
              Mobility Transfers
            </h4>
            <div className="transfers-grid">
              {mobilityTransfers.map(transfer => (
                <div className="transfer-item" key={transfer.id}>
                  <div className="transfer-header">
                    <i className={transfer.icon}></i>
                    <label>{transfer.label}</label>
                  </div>
                  <select 
                    value={data[transfer.id] || ''}
                    onChange={(e) => handleChange(transfer.id, e.target.value)}
                    className={data[transfer.id] ? `selected level-${data[transfer.id]}` : ''}
                    style={{
                      '--level-color': data[transfer.id] ? assistLevelColors[data[transfer.id]] || '#6b7280' : '#6b7280'
                    }}
                  >
                    {assistLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Functional Transfers */}
          <div className="transfer-category">
            <h4 className="category-title">
              <i className="fas fa-home"></i>
              Functional Transfers
            </h4>
            <div className="transfers-grid">
              {functionalTransfers.map(transfer => (
                <div className="transfer-item" key={transfer.id}>
                  <div className="transfer-header">
                    <i className={transfer.icon}></i>
                    <label>{transfer.label}</label>
                  </div>
                  <select 
                    value={data[transfer.id] || ''}
                    onChange={(e) => handleChange(transfer.id, e.target.value)}
                    className={data[transfer.id] ? `selected level-${data[transfer.id]}` : ''}
                    style={{
                      '--level-color': data[transfer.id] ? assistLevelColors[data[transfer.id]] || '#6b7280' : '#6b7280'
                    }}
                  >
                    {assistLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assistance Level Guide */}
        <div className="assistance-guide">
          <div className="guide-header">
            <i className="fas fa-info-circle"></i>
            <h4>Assistance Level Guide</h4>
          </div>
          <div className="assistance-levels">
            {Object.entries(assistLevelColors).map(([level, color]) => (
              <div className="level-badge" key={level} style={{ '--badge-color': color }}>
                <span className="level-code">{level}</span>
                <span className="level-name">
                  {assistLevels.find(l => l.value === level)?.label.split(' ')[0] || level}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-wheelchair"></i>
              Does patient have a wheelchair?
            </label>
            <select 
              value={data.hasWheelchair || ''}
              onChange={(e) => handleChange('hasWheelchair', e.target.value)}
            >
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <i className="fas fa-info-circle"></i>
              Additional Information
            </label>
            <textarea 
              value={data.transfersAdditional || ''}
              onChange={(e) => handleChange('transfersAdditional', e.target.value)}
              rows={3}
              placeholder="Additional information about transfers and functional independence..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransfersFunctionalSection;