import React, { useState } from 'react';

const BlockUserModal = ({ username, onBlock, isBlocking }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(1);

  const blockLevels = [
    { level: 1, duration: '1 minute', description: 'Warning block', color: '#f39c12' },
    { level: 2, duration: '2 minutes', description: 'Light restriction', color: '#e67e22' },
    { level: 3, duration: '10 minutes', description: 'Moderate restriction', color: '#d35400' },
    { level: 4, duration: '30 minutes', description: 'Strong restriction', color: '#e74c3c' },
    { level: 5, duration: '1 hour', description: 'Severe restriction', color: '#c0392b' },
    { level: 6, duration: '5 hours', description: 'Critical restriction', color: '#8e44ad' },
    { level: 7, duration: 'Permanent', description: 'Permanent ban', color: '#2c3e50' }
  ];

  const handleBlock = async () => {
    await onBlock(username, selectedLevel);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className="action-button block"
        onClick={() => setIsModalOpen(true)}
        title={`Block ${username}`}
      >
        <i className="fas fa-ban"></i>
        Block User
      </button>

      {isModalOpen && (
        <div className="block-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="block-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-ban"></i>
                Block User: {username}
              </h3>
              <button 
                className="close-button"
                onClick={() => setIsModalOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <p className="warning-text">
                <i className="fas fa-exclamation-triangle"></i>
                Select the block level to apply to this user. This action will immediately prevent them from logging in.
              </p>

              <div className="block-levels">
                {blockLevels.map((level) => (
                  <label
                    key={level.level}
                    className={`block-level-option ${selectedLevel === level.level ? 'selected' : ''}`}
                    style={{ '--level-color': level.color }}
                  >
                    <input
                      type="radio"
                      name="blockLevel"
                      value={level.level}
                      checked={selectedLevel === level.level}
                      onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                    />
                    <div className="level-info">
                      <div className="level-header">
                        <span className="level-number">Level {level.level}</span>
                        <span className="level-duration">{level.duration}</span>
                      </div>
                      <div className="level-description">{level.description}</div>
                    </div>
                    <div className="level-indicator">
                      <i className="fas fa-check"></i>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setIsModalOpen(false)}
                disabled={isBlocking}
              >
                Cancel
              </button>
              <button
                className="confirm-button"
                onClick={handleBlock}
                disabled={isBlocking}
              >
                {isBlocking ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Blocking...
                  </>
                ) : (
                  <>
                    <i className="fas fa-ban"></i>
                    Block User (Level {selectedLevel})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlockUserModal;