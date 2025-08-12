import React, { useState } from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/EquipmentSkillsSection.scss';

const EquipmentSkillsSection = ({ data, onChange, sectionId, config }) => {
  const [activeTab, setActiveTab] = useState('gaitMobility');

  // Equipment categories organized with icons and descriptions
  const equipmentCategories = [
    {
      id: 'gaitMobility',
      label: 'Gait & Mobility',
      icon: 'fas fa-walking',
      color: '#3b82f6',
      description: 'Walking aids and mobility devices',
      items: [
        { key: 'rollingWalker', label: 'Rolling Walker' },
        { key: 'rollator', label: 'Rollator' },
        { key: 'singlePointCane', label: 'Single Point Cane' },
        { key: 'standardWalker', label: 'Standard Walker' },
        { key: 'standardWheelchair', label: 'Standard Wheelchair' },
        { key: 'quadCane', label: 'Quad Cane' },
        { key: 'axillaryCrutches', label: 'Axillary Crutches' },
        { key: 'hemiWalker', label: 'Hemi Walker' },
        { key: 'lofstrandCrutches', label: 'Lofstrand Crutches' },
        { key: 'oneArmDriveWheelchair', label: 'One Arm Drive Wheelchair' },
        { key: 'platformWalker', label: 'Platform Walker' },
        { key: 'powerChair', label: 'Power Chair' }
      ]
    },
    {
      id: 'transfers',
      label: 'Transfers',
      icon: 'fas fa-exchange-alt',
      color: '#10b981',
      description: 'Transfer assistance equipment',
      items: [
        { key: 'grabBars', label: 'Grab Bars' },
        { key: 'liftChair', label: 'Lift Chair' },
        { key: 'showerChair', label: 'Shower Chair' },
        { key: 'slidingBoard', label: 'Sliding Board' },
        { key: 'stairLift', label: 'Stair Lift' },
        { key: 'stander', label: 'Stander' },
        { key: 'tubTransferBench', label: 'Tub Transfer Bench' }
      ]
    },
    {
      id: 'toileting',
      label: 'Toileting',
      icon: 'fas fa-restroom',
      color: '#8b5cf6',
      description: 'Bathroom and toileting aids',
      items: [
        { key: 'threeInOne', label: '3-in-1' },
        { key: 'bedsideCommode', label: 'Bedside Commode' },
        { key: 'raisedToiletSeat', label: 'Raised Toilet Seat' }
      ]
    },
    {
      id: 'bathing',
      label: 'Bathing',
      icon: 'fas fa-shower',
      color: '#06b6d4',
      description: 'Bathing and hygiene equipment',
      items: [
        { key: 'bathMitt', label: 'Bath Mitt' },
        { key: 'handHeldShowerHead', label: 'Hand-held Shower Head' },
        { key: 'longHandleSponge', label: 'Long Handle Sponge' },
        { key: 'rubberMatForTub', label: 'Rubber Mat for Tub' },
        { key: 'suctionBrush', label: 'Suction Brush' }
      ]
    },
    {
      id: 'bedMobility',
      label: 'Bed Mobility',
      icon: 'fas fa-bed',
      color: '#f59e0b',
      description: 'Bedroom and bed mobility aids',
      items: [
        { key: 'armRests', label: 'Arm Rests' },
        { key: 'bedBar', label: 'Bed Bar' },
        { key: 'bedRails', label: 'Bed Rails' },
        { key: 'hospitalBed', label: 'Hospital Bed' },
        { key: 'hoyerLift', label: 'Hoyer Lift' },
        { key: 'trapeze', label: 'Trapeze' }
      ]
    },
    {
      id: 'dressing',
      label: 'Dressing',
      icon: 'fas fa-tshirt',
      color: '#ec4899',
      description: 'Dressing and clothing aids',
      items: [
        { key: 'buttonHook', label: 'Button Hook' },
        { key: 'dressingStick', label: 'Dressing Stick' },
        { key: 'elasticShoeLaces', label: 'Elastic Shoe Laces' },
        { key: 'longHandleShoeHorn', label: 'Long Handle Shoe Horn' },
        { key: 'sockAide', label: 'Sock Aide' }
      ]
    },
    {
      id: 'other',
      label: 'Other Equipment',
      icon: 'fas fa-tools',
      color: '#6366f1',
      description: 'Additional therapeutic equipment',
      items: [
        { key: 'armSling', label: 'Arm Sling' },
        { key: 'eatingUtensils', label: 'Eating Utensils' },
        { key: 'reacher', label: 'Reacher' },
        { key: 'stairRails', label: 'Stair Rails' },
        { key: 'tensUnit', label: 'TENS Unit' },
        { key: 'ueSplints', label: 'UE Splints' }
      ]
    }
  ];

  // Handle equipment selection changes
  const handleEquipmentChange = (categoryId, itemKey, checked) => {
    const updatedData = {
      ...data,
      [categoryId]: {
        ...data?.[categoryId],
        [itemKey]: checked
      }
    };
    onChange(updatedData);
  };

  // Handle comments change
  const handleCommentsChange = (value) => {
    const updatedData = {
      ...data,
      comments: value
    };
    onChange(updatedData);
  };

  // Get selected count for a category
  const getSelectedCount = (categoryId) => {
    const categoryData = data?.[categoryId] || {};
    return Object.values(categoryData).filter(Boolean).length;
  };

  // Get total selected count
  const getTotalSelected = () => {
    return equipmentCategories.reduce((total, category) => {
      return total + getSelectedCount(category.id);
    }, 0);
  };

  return (
    <div className="equipment-skills-section">
      <div className="section-header">
        <div className="section-title">
          <i className="fas fa-cog"></i>
          <h3>Equipment Assessment</h3>
        </div>
        <p className="section-description">
          Comprehensive evaluation of adaptive equipment and assistive devices for functional independence
        </p>
        <div className="selection-summary">
          <div className="total-count">
            <i className="fas fa-check-circle"></i>
            <span>{getTotalSelected()} items selected</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="equipment-tabs">
        <div className="tabs-header">
          {equipmentCategories.map((category) => (
            <button
              key={category.id}
              className={`tab-button ${activeTab === category.id ? 'active' : ''}`}
              onClick={() => setActiveTab(category.id)}
              style={{ '--category-color': category.color }}
            >
              <i className={category.icon}></i>
              <span className="tab-label">{category.label}</span>
              {getSelectedCount(category.id) > 0 && (
                <span className="selection-badge">{getSelectedCount(category.id)}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tabs-content">
          {equipmentCategories.map((category) => (
            <div
              key={category.id}
              className={`tab-panel ${activeTab === category.id ? 'active' : ''}`}
              style={{ '--category-color': category.color }}
            >
              <div className="category-header">
                <div className="category-info">
                  <div className="category-title">
                    <i className={category.icon}></i>
                    <h4>{category.label}</h4>
                  </div>
                  <p className="category-description">{category.description}</p>
                </div>
                <div className="category-stats">
                  <div className="selected-count">
                    {getSelectedCount(category.id)} of {category.items.length} selected
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(getSelectedCount(category.id) / category.items.length) * 100}%`,
                        backgroundColor: category.color 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="equipment-grid">
                {category.items.map((item) => (
                  <label key={item.key} className="equipment-item">
                    <input
                      type="checkbox"
                      checked={data?.[category.id]?.[item.key] || false}
                      onChange={(e) => handleEquipmentChange(category.id, item.key, e.target.checked)}
                    />
                    <span className="equipment-checkbox"></span>
                    <span className="equipment-label">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h4 className="comments-title">
          <i className="fas fa-comment-medical"></i>
          Additional Equipment Notes & Observations
        </h4>
        <div className="comments-container">
          <textarea
            value={data?.comments || ''}
            onChange={(e) => handleCommentsChange(e.target.value)}
            placeholder="Enter additional notes about equipment recommendations, patient tolerance, training needs, safety considerations, or any other relevant observations..."
            rows={5}
            className="comments-textarea"
            maxLength={2000}
          />
          <div className="character-count">
            {(data?.comments || '').length} / 2000 characters
          </div>
        </div>
      </div>

      {/* Equipment Summary */}
      {getTotalSelected() > 0 && (
        <div className="equipment-summary">
          <h4 className="summary-title">
            <i className="fas fa-list-check"></i>
            Selected Equipment Summary
          </h4>
          <div className="summary-grid">
            {equipmentCategories.map((category) => {
              const selectedItems = category.items.filter(item => 
                data?.[category.id]?.[item.key]
              );
              
              if (selectedItems.length === 0) return null;

              return (
                <div key={category.id} className="summary-category">
                  <div className="summary-header">
                    <i className={category.icon} style={{ color: category.color }}></i>
                    <span className="summary-category-name">{category.label}</span>
                    <span className="summary-count">({selectedItems.length})</span>
                  </div>
                  <div className="summary-items">
                    {selectedItems.map((item) => (
                      <span key={item.key} className="summary-item">
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentSkillsSection;