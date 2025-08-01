/**
 * Utilidades para impresión y roles de usuario
 * Funciones auxiliares para manejar notas imprimibles y normalización de roles
 */

/**
 * Abre una vista imprimible de una nota
 * @param {Object} noteData - Datos de la nota a imprimir
 * @param {Object} patientData - Datos del paciente
 * @param {Object} visitData - Datos de la visita
 */
export const openNotePrintableView = (noteData, patientData, visitData) => {
  // Crear una nueva ventana para la vista imprimible
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    alert('Por favor, permita las ventanas emergentes para imprimir.');
    return;
  }

  // Generar el contenido HTML para imprimir
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Nota de Visita - ${patientData?.first_name} ${patientData?.last_name}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #ccc;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .patient-info {
          margin-bottom: 20px;
        }
        .visit-details {
          margin-bottom: 20px;
        }
        .note-content {
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .signature-section {
          margin-top: 50px;
          border-top: 1px solid #ccc;
          padding-top: 20px;
        }
        .info-row {
          margin: 10px 0;
        }
        .label {
          font-weight: bold;
          display: inline-block;
          width: 150px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Therapy Suite - Nota de Visita</h1>
      </div>
      
      <div class="patient-info">
        <h2>Información del Paciente</h2>
        <div class="info-row">
          <span class="label">Nombre:</span>
          ${patientData?.first_name || ''} ${patientData?.last_name || ''}
        </div>
        <div class="info-row">
          <span class="label">ID Paciente:</span>
          ${patientData?.id || 'N/A'}
        </div>
        <div class="info-row">
          <span class="label">Fecha de Nacimiento:</span>
          ${patientData?.date_of_birth || 'N/A'}
        </div>
      </div>
      
      <div class="visit-details">
        <h2>Detalles de la Visita</h2>
        <div class="info-row">
          <span class="label">Fecha de Visita:</span>
          ${visitData?.visit_date || 'N/A'}
        </div>
        <div class="info-row">
          <span class="label">Tipo de Visita:</span>
          ${visitData?.visit_type || 'N/A'}
        </div>
        <div class="info-row">
          <span class="label">Duración:</span>
          ${visitData?.duration_minutes || 'N/A'} minutos
        </div>
      </div>
      
      <div class="note-content">
        <h2>Contenido de la Nota</h2>
        <div>${noteData?.content || noteData?.notes || 'Sin contenido'}</div>
      </div>
      
      <div class="signature-section">
        <h2>Firma del Terapeuta</h2>
        <div class="info-row">
          <span class="label">Terapeuta:</span>
          ${noteData?.therapist_name || 'N/A'}
        </div>
        <div class="info-row">
          <span class="label">Fecha:</span>
          ${new Date().toLocaleDateString('es-ES')}
        </div>
        <div style="margin-top: 30px; border-bottom: 1px solid #333; width: 300px;">
          <br>
        </div>
        <div>Firma del Terapeuta</div>
      </div>
      
      <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px;">
          Imprimir
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; margin-left: 10px;">
          Cerrar
        </button>
      </div>
    </body>
    </html>
  `;

  // Escribir el contenido en la nueva ventana
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // Enfocar la ventana nueva
  printWindow.focus();
};

/**
 * Normaliza el rol del usuario para mostrar en formatos consistentes
 * @param {string} role - Rol del usuario del sistema
 * @returns {string} Rol normalizado
 */
export const getNormalizedUserRole = (role) => {
  if (!role) return 'Usuario';
  
  const roleMap = {
    'developer': 'Desarrollador',
    'admin': 'Administrador',
    'agency': 'Agencia',
    'pt': 'Fisioterapeuta',
    'ot': 'Terapeuta Ocupacional',
    'st': 'Terapista del Habla',
    'soporte': 'Soporte Técnico'
  };
  
  return roleMap[role.toLowerCase()] || role;
};

/**
 * Formatea una fecha para mostrar en documentos imprimibles
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatPrintableDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return date.toString();
  }
};

/**
 * Genera un ID único para documentos imprimibles
 * @returns {string} ID único
 */
export const generatePrintableId = () => {
  return `print_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default {
  openNotePrintableView,
  getNormalizedUserRole,
  formatPrintableDate,
  generatePrintableId
};