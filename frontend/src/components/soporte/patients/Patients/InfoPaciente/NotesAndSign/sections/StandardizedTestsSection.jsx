import React from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/sections/StandardizedTestsSection.scss';

const StandardizedTestsSection = ({ data, onChange, sectionId, config, onOpenTest }) => {
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    onChange(updatedData);
  };

  // Verificar si un test está completo
  const isTestComplete = (testName) => {
    return data?.standardizedTests?.[testName]?.isComplete || false;
  };

  // Obtener la puntuación de un test
  const getTestScore = (testName) => {
    return data?.standardizedTests?.[testName]?.score || null;
  };

  // Standardized Test Component
  const StandardizedTest = ({ 
    title, 
    description, 
    isComplete, 
    score, 
    onOpen, 
    icon = "fas fa-clipboard-list",
    status 
  }) => (
    <div className={`standardized-test ${isComplete ? 'completed' : ''} ${status ? 'status-override' : ''}`}>
      <div className="test-header">
        <div className="test-icon">
          <i className={icon}></i>
        </div>
        <div className="test-info">
          <h4>{title}</h4>
          {description && <p>{description}</p>}
        </div>
        <div className="test-status">
          {status ? (
            <span className="status-badge">{status}</span>
          ) : isComplete ? (
            <div className="completed-badge">
              <i className="fas fa-check-circle"></i>
              <span>Complete</span>
            </div>
          ) : (
            <div className="pending-badge">
              <i className="fas fa-clock"></i>
              <span>Pending</span>
            </div>
          )}
        </div>
      </div>
      
      {score !== null && score !== undefined && (
        <div className="test-score">
          <span className="score-label">Score:</span>
          <span className="score-value">{score}</span>
        </div>
      )}
      
      <button 
        className="test-action-btn"
        onClick={onOpen}
        disabled={!!status}
      >
        <i className={`fas ${isComplete ? 'fa-edit' : 'fa-play'}`}></i>
        <span>{isComplete ? 'Review Test' : 'Start Test'}</span>
      </button>
    </div>
  );

  return (
    <div className="standardized-tests-section">
      <div className="form-section">
        <div className="section-title">
          <h2>
            <i className="fas fa-clipboard-list"></i>
            Standardized Tests
          </h2>
        </div>
        
        <div className="tests-grid">
          <StandardizedTest 
            title="ACE III" 
            description="Addenbrooke's Cognitive Examination"
            isComplete={isTestComplete('ACE III')}
            score={getTestScore('ACE III')}
            onOpen={() => onOpenTest && onOpenTest('ACE III')}
            icon="fas fa-brain"
          />
          
          <StandardizedTest 
            title="Tinetti" 
            description="Balance and Gait Assessment"
            isComplete={isTestComplete('Tinetti')}
            score={getTestScore('Tinetti')}
            onOpen={() => onOpenTest && onOpenTest('Tinetti')}
            icon="fas fa-walking"
          />
          
          <StandardizedTest 
            title="Timed Up And Go" 
            description="Mobility and Fall Risk"
            isComplete={isTestComplete('Timed Up And Go')}
            score={getTestScore('Timed Up And Go')}
            onOpen={() => onOpenTest && onOpenTest('Timed Up And Go')}
            icon="fas fa-stopwatch"
          />
          
          <StandardizedTest 
            title="Functional Reach" 
            description="Balance Assessment"
            isComplete={isTestComplete('Functional Reach')}
            score={getTestScore('Functional Reach')}
            onOpen={() => onOpenTest && onOpenTest('Functional Reach')}
            icon="fas fa-hand-paper"
          />
          
          <StandardizedTest 
            title="BERG" 
            description="Balance Scale"
            isComplete={isTestComplete('BERG')}
            score={getTestScore('BERG')}
            onOpen={() => onOpenTest && onOpenTest('BERG')}
            icon="fas fa-balance-scale"
          />
          
          <StandardizedTest 
            title="Fall Risk Assessment" 
            description="Fall Risk Evaluation"
            isComplete={isTestComplete('Fall Risk Assessment')}
            score={getTestScore('Fall Risk Assessment')}
            onOpen={() => onOpenTest && onOpenTest('Fall Risk Assessment')}
            icon="fas fa-exclamation-triangle"
          />
          
          <StandardizedTest 
            title="Advanced Balance" 
            description="Advanced Balance Testing"
            isComplete={isTestComplete('Advanced Balance')}
            score={getTestScore('Advanced Balance')}
            onOpen={() => onOpenTest && onOpenTest('Advanced Balance')}
            icon="fas fa-balance-scale-right"
          />
          
          <StandardizedTest 
            title="MAHC10" 
            description="Motor Assessment of the Hand"
            isComplete={isTestComplete('MAHC10')}
            score={getTestScore('MAHC10')}
            onOpen={() => onOpenTest && onOpenTest('MAHC10')}
            icon="fas fa-hand-rock"
          />
          
          <StandardizedTest 
            title="Barthel Index" 
            description="Activities of Daily Living"
            isComplete={isTestComplete('Barthel Index')}
            score={getTestScore('Barthel Index')}
            onOpen={() => onOpenTest && onOpenTest('Barthel Index')}
            icon="fas fa-tasks"
          />
          
          <StandardizedTest 
            title="Short Physical Performance Battery" 
            description="Physical Performance Assessment"
            isComplete={isTestComplete('Short Physical Performance Battery')}
            score={getTestScore('Short Physical Performance Battery')}
            onOpen={() => onOpenTest && onOpenTest('Short Physical Performance Battery')}
            icon="fas fa-dumbbell"
          />
          
          <StandardizedTest 
            title="Nutritional Status Assessment" 
            description="Nutritional Evaluation"
            isComplete={isTestComplete('Nutritional Status Assessment')}
            score={getTestScore('Nutritional Status Assessment')}
            onOpen={() => onOpenTest && onOpenTest('Nutritional Status Assessment')}
            icon="fas fa-apple-alt"
          />
          
          <StandardizedTest 
            title="Diabetic Foot Exam" 
            description="Diabetic Foot Assessment"
            isComplete={isTestComplete('Diabetic Foot Exam')}
            score={getTestScore('Diabetic Foot Exam')}
            onOpen={() => onOpenTest && onOpenTest('Diabetic Foot Exam')}
            icon="fas fa-foot-print"
          />
          
          <StandardizedTest 
            title="Katz Index" 
            description="Activities of Daily Living Scale"
            isComplete={isTestComplete('Katz')}
            score={getTestScore('Katz')}
            onOpen={() => onOpenTest && onOpenTest('Katz')}
            icon="fas fa-user-check"
          />
          
          <StandardizedTest 
            title="Wound Assessment" 
            description="Wound Evaluation"
            isComplete={isTestComplete('Wound Assessment')}
            score={getTestScore('Wound Assessment')}
            onOpen={() => onOpenTest && onOpenTest('Wound Assessment')}
            icon="fas fa-band-aid"
          />
          
          <StandardizedTest 
            title="Braden Scale" 
            description="Pressure Ulcer Risk"
            isComplete={isTestComplete('Braden Scale')}
            score={getTestScore('Braden Scale')}
            onOpen={() => onOpenTest && onOpenTest('Braden Scale')}
            icon="fas fa-bed"
          />
          
          <StandardizedTest 
            title="Moberg Hand Function Test" 
            description="Hand Function Assessment"
            isComplete={isTestComplete('Moberg Hand Function Test')}
            score={getTestScore('Moberg Hand Function Test')}
            onOpen={() => onOpenTest && onOpenTest('Moberg Hand Function Test')}
            icon="fas fa-hand-scissors"
          />
          
          <StandardizedTest 
            title="SLUMS Examination" 
            description="Cognitive Assessment"
            isComplete={isTestComplete('SLUMS Examination')}
            score={getTestScore('SLUMS Examination')}
            onOpen={() => onOpenTest && onOpenTest('SLUMS Examination')}
            icon="fas fa-brain"
          />
          
          <StandardizedTest 
            title="Four Stage Balance Test" 
            description="Static Balance Assessment"
            isComplete={isTestComplete('Four Stage Balance Test')}
            score={getTestScore('Four Stage Balance Test')}
            onOpen={() => onOpenTest && onOpenTest('Four Stage Balance Test')}
            icon="fas fa-male"
          />
          
          <StandardizedTest 
            title="Medication List" 
            description="Medication Review"
            isComplete={isTestComplete('Medication List')}
            score={getTestScore('Medication List')}
            onOpen={() => onOpenTest && onOpenTest('Medication List')}
            icon="fas fa-pills"
          />
        </div>

        <div className="tests-summary">
          <div className="summary-header">
            <h3>
              <i className="fas fa-chart-bar"></i>
              Test Completion Summary
            </h3>
          </div>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total Tests:</span>
              <span className="stat-value">19</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed:</span>
              <span className="stat-value completed">
                {Object.values(data?.standardizedTests || {}).filter(test => test?.isComplete).length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending:</span>
              <span className="stat-value pending">
                {19 - Object.values(data?.standardizedTests || {}).filter(test => test?.isComplete).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardizedTestsSection;