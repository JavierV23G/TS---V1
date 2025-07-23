// StandardizedTest.jsx
import React from 'react';
import '../../../../../../styles/admin/Patients/InfoPaciente/NotesAndSign/StandardizedTest.scss';

const StandardizedTest = ({ title, isComplete, score, onOpen }) => {
  // Determinar qué icono mostrar según el tipo de prueba
  const getTestIcon = () => {
    switch (title) {
      case 'ACE III':
      case 'SLUMS Examination':
        return 'fas fa-brain';
      case 'Tinetti':
      case 'Timed Up And Go':
      case 'Functional Reach':
      case 'BERG':
      case 'Fall Risk Assessment':
      case 'Advanced Balance':
      case 'Four Stage Balance Test':
        return 'fas fa-walking';
      case 'MAHC10':
        return 'fas fa-home';
      case 'Barthel Index':
      case 'Katz':
        return 'fas fa-tasks';
      case 'Short Physical Performance Battery':
        return 'fas fa-running';
      case 'Nutritional Status Assessment':
        return 'fas fa-apple-alt';
      case 'Diabetic Foot Exam':
        return 'fas fa-socks';
      case 'Wound Assessment':
        return 'fas fa-band-aid';
      case 'Braden Scale':
        return 'fas fa-bed';
      case 'Medication List':
        return 'fas fa-pills';
      case 'Moberg':
        return 'fas fa-hand-paper';
      default:
        return 'fas fa-clipboard-check';
    }
  };

  // Determinar el color del estado
  const getStatusColor = () => {
    if (isComplete && score !== null && score !== undefined) {
      return '#28a745'; // Verde si está completo y tiene puntaje
    } else if (isComplete) {
      return '#007bff'; // Azul si está completo pero sin puntaje
    } else {
      return '#6c757d'; // Gris si no está completo
    }
  };

  return (
    <div className="standardized-test-item" onClick={onOpen}>
      <div className="test-icon">
        <i className={getTestIcon()} style={{ color: getStatusColor() }}></i>
      </div>
      <div className="test-content">
        <div className="test-title">{title}</div>
        <div className="test-status">
          {isComplete ? (
            score !== null && score !== undefined ? (
              <span className="completed-with-score">
                Completed - Score: {score}
              </span>
            ) : (
              <span className="completed">Completed</span>
            )
          ) : (
            <span className="pending">Pending</span>
          )}
        </div>
      </div>
      <div className="test-action">
        <i className="fas fa-chevron-right"></i>
      </div>
    </div>
  );
};

export default StandardizedTest;