// printableUtils.js - Utility functions for printable views

/**
 * Generate printable URL for a visit note
 * @param {number} patientId - Patient ID
 * @param {number} visitId - Visit ID
 * @param {string} userRole - User role (developer, administrator, pt, ot, st, etc.)
 * @returns {string} - URL for printable view
 */
export const generateNotePrintableUrl = (patientId, visitId, userRole = 'developer') => {
  const baseUrl = window.location.origin;
  const basePath = `#/${userRole}/paciente/${patientId}`;
  
  return `${baseUrl}/${basePath}?printable=true&visitId=${visitId}`;
};

/**
 * Open printable view in new window
 * @param {number} patientId - Patient ID
 * @param {number} visitId - Visit ID
 * @param {string} userRole - User role
 * @param {Object} options - Window options
 */
export const openNotePrintableView = (patientId, visitId, userRole = 'developer', options = {}) => {
  const url = generateNotePrintableUrl(patientId, visitId, userRole);
  
  const defaultOptions = {
    width: 1200,
    height: 800,
    scrollbars: 'yes',
    resizable: 'yes',
    toolbar: 'no',
    menubar: 'no',
    status: 'no'
  };
  
  const windowOptions = { ...defaultOptions, ...options };
  const optionsString = Object.entries(windowOptions)
    .map(([key, value]) => `${key}=${value}`)
    .join(',');
  
  // Open in new tab instead of popup window
  const printWindow = window.open(url, '_blank');
  
  if (printWindow) {
    printWindow.focus();
  } else {
    console.warn('Popup was blocked. Please allow popups for this site.');
  }
  
  return printWindow;
};

/**
 * Get current user role from various possible sources
 * @param {Object} user - User object from auth context
 * @returns {string} - Normalized role for URL routing
 */
export const getNormalizedUserRole = (user) => {
  if (!user || !user.role) return 'developer';
  
  const role = user.role.toLowerCase();
  
  // Map roles to route segments
  const roleMap = {
    'developer': 'developer',
    'administrator': 'administrator', 
    'pt': 'pt',
    'ot': 'ot',
    'st': 'st',
    'pta': 'pta',
    'cota': 'cota',
    'sta': 'sta',
    'supportive': 'supportive',
    'support': 'supportive',
    'agency': 'agency'
  };
  
  return roleMap[role] || 'developer';
};