import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../login/AuthContext';
import SignaturePad from './SignaturePad';
import NoteTemplateModal from './NotesAndSign/NoteTemplateModal';
import { openNotePrintableView, getNormalizedUserRole } from '../../../../../utils/printableUtils';
import '../../../../../styles/developer/Patients/InfoPaciente/VisitModalComponent.scss';

/**
 * VisitModalComponent - Modal para gestionar detalles de visitas completadas
 * 
 * Reglas de estados:
 * 1. Save Changes: Mantiene el estado "Completed" sin cambios
 * 2. Return to Therapist: Cambia de "Completed" a "Pending"
 * 3. Save nota (después de edit): Cambia de "Pending" a "Completed" con indicador "Saved"
 */
const VisitModalComponent = ({ 
  isOpen, 
  onClose, 
  visitData, 
  onSave, 
  certPeriodDates, 
  patientInfo,
  visitStatus
}) => {
  // ===== STATES =====
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    visitType: '',
    therapist: '',
    date: '',
    time: '',
    notes: '',
    status: 'Completed',
    physician: '',
    timeInHour: '',
    timeInMinute: '',
    timeInAmPm: 'AM',
    timeOutHour: '',
    timeOutMinute: '',
    timeOutAmPm: 'AM',
    gCode: '',
    certPeriod: '',
    noteHeaderFrequency: '1w1',
    telehealth: false,
    documents: [],
    existingNoteId: null,
    existingNoteData: {}
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  
  // ===== CONSTANTS =====
  
  // Therapist data - same as VisitStatusModal
  const [assignedTherapist, setAssignedTherapist] = useState(null);
  const [availableTherapists, setAvailableTherapists] = useState([]);

  // Visit types - Exact 5 types as requested
  const visitTypes = [
    'Initial Evaluation',
    'Regular therapy session',
    'Reassessment (RA)',
    'Discharge (DC)',
    'Recert-Eval',
    'Post-Hospital Eval',
    'SOC OASIS',
    'ROC OASIS',
    'ReCert OASIS',
    'Follow-Up OASIS',
    'DC OASIS',
    'Supervision Assessment'
  ];

  // Time options
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  // ===== UTILITY FUNCTIONS =====
  
  /**
   * Get therapist discipline for evaluation title
   */
  const getTherapistDiscipline = (therapistId) => {
    // Use assignedTherapist if it matches, otherwise look in availableTherapists
    let therapist = null;
    if (assignedTherapist && (assignedTherapist.id === therapistId || assignedTherapist.id === String(therapistId))) {
      therapist = assignedTherapist;
    } else {
      therapist = availableTherapists.find(t => t.id === therapistId || t.id === String(therapistId));
    }
    
    if (!therapist) return 'PT';
    
    const role = therapist.role?.toUpperCase();
    
    if (['OT', 'COTA'].includes(role)) return 'OT';
    if (['ST', 'STA'].includes(role)) return 'ST';
    return 'PT'; // Default to PT
  };

  /**
   * Get therapist name with role
   */
  const getTherapistName = (therapistId) => {
    // Use assignedTherapist if it matches, otherwise look in availableTherapists
    let therapist = null;
    if (assignedTherapist && (assignedTherapist.id === therapistId || assignedTherapist.id === String(therapistId))) {
      therapist = assignedTherapist;
    } else {
      therapist = availableTherapists.find(t => t.id === therapistId || t.id === String(therapistId));
    }
    
    return therapist ? `${therapist.name} (${therapist.role})` : `Therapist ID: ${therapistId || 'Not assigned'}`;
  };

  /**
   * Convert 24-hour time to 12-hour format components
   */
  const convertTimeToComponents = (timeString) => {
    if (!timeString) return { hour: '', minute: '', ampm: 'AM' };
    
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const minute = minutes || '00';
    
    let hour12, ampm;
    
    if (hour24 === 0) {
      hour12 = '12';
      ampm = 'AM';
    } else if (hour24 < 12) {
      hour12 = String(hour24).padStart(2, '0');
      ampm = 'AM';
    } else if (hour24 === 12) {
      hour12 = '12';
      ampm = 'PM';
    } else {
      hour12 = String(hour24 - 12).padStart(2, '0');
      ampm = 'PM';
    }
    
    return { hour: hour12, minute, ampm };
  };

  /**
   * Format date to local ISO string without timezone issues
   */
  const formatDateToLocalISOString = (date) => {
    if (typeof date === 'string') return date;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Format visit date without timezone offset
   */
  const formatVisitDate = (dateString) => {
    if (!dateString) return '';
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
    return dateString;
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // ===== API FUNCTIONS (copied from VisitStatusModal) =====
  
  // Fetch assigned therapist data
  const fetchAssignedTherapist = async () => {
    try {
      if (visitData?.staff_id) {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_BASE_URL}/staff/${visitData.staff_id}`, {
          method: 'GET',  
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setAssignedTherapist(data);
        } else {
          console.error('Failed to fetch assigned therapist:', response.status, response.statusText);
        }
      }
    } catch (error) {
      console.error('Error fetching assigned therapist data:', error);
    }
  };

  // Fetch available therapists for selection
  const fetchAvailableTherapists = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/staff/`, {
        method: 'GET',  
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter only therapy roles (PT, OT, ST, PTA, COTA, STA)
        const therapyRoles = ['PT', 'OT', 'ST', 'PTA', 'COTA', 'STA'];
        const therapists = data.filter(staff => therapyRoles.includes(staff.role) && staff.is_active);
        setAvailableTherapists(therapists);
      } else {
        console.error('Failed to fetch available therapists:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching available therapists:', error);
    }
  };

  // ===== EFFECTS =====
  
  // Load therapist data when modal opens (copied from VisitStatusModal)
  useEffect(() => {
    if (isOpen && visitData) {
      fetchAssignedTherapist();
      fetchAvailableTherapists();
    }
  }, [isOpen, visitData]);
  
  /**
   * Initialize form data when visit data changes
   */
  useEffect(() => {
    if (visitData) {
      const timeInComponents = convertTimeToComponents(visitData.time || visitData.scheduled_time);
      
      setFormData({
        visitType: visitData.visitType || visitData.visit_type || 'Initial Evaluation',
        therapist: visitData.therapist || visitData.staff_id || '',
        date: formatVisitDate(visitData.date || visitData.visit_date) || formatDateToLocalISOString(new Date()),
        time: visitData.time || visitData.scheduled_time || '',
        notes: visitData.notes || '',
        status: visitData.status || 'Completed',
        physician: patientInfo?.physician || visitData.physician || 'Not assigned',
        timeInHour: visitData.timeInHour || timeInComponents.hour || '',
        timeInMinute: visitData.timeInMinute || timeInComponents.minute || '',
        timeInAmPm: visitData.timeInAmPm || timeInComponents.ampm || 'AM',
        timeOutHour: visitData.timeOutHour || '',
        timeOutMinute: visitData.timeOutMinute || '',
        timeOutAmPm: visitData.timeOutAmPm || 'AM',
        gCode: visitData.gCode || '',
        certPeriod: visitData.certPeriod || '',
        noteHeaderFrequency: visitData.noteHeaderFrequency || '1w1',
        telehealth: visitData.telehealth || false,
        documents: visitData.documents || []
      });
      
      setError('');
    }
  }, [visitData, patientInfo]);

  // ===== EVENT HANDLERS =====
  
  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let updatedFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };
    
    // Auto-calculate time out when time in changes
    if (name === 'timeInHour' || name === 'timeInMinute' || name === 'timeInAmPm') {
      const hour = name === 'timeInHour' ? value : formData.timeInHour;
      const minute = name === 'timeInMinute' ? value : formData.timeInMinute;
      const ampm = name === 'timeInAmPm' ? value : formData.timeInAmPm;
      
      // Only calculate if both hour and minute are selected
      if (hour && minute && !isNaN(parseInt(hour)) && !isNaN(parseInt(minute))) {
        const hour24Int = parseInt(hour);
        const minuteInt = parseInt(minute);
        
        // Convert to 24-hour format
        let hour24 = hour24Int;
        if (ampm === 'PM' && hour24Int !== 12) hour24 += 12;
        if (ampm === 'AM' && hour24Int === 12) hour24 = 0;
        
        // Add 1 hour
        let outHour24 = hour24 + 1;
        let outAmPm = ampm;
        
        if (outHour24 >= 24) {
          outHour24 -= 24;
        }
        
        // Convert back to 12-hour format
        let outHour12 = outHour24;
        if (outHour24 === 0) {
          outHour12 = 12;
          outAmPm = 'AM';
        } else if (outHour24 > 12) {
          outHour12 = outHour24 - 12;
          outAmPm = 'PM';
        } else if (outHour24 === 12) {
          outAmPm = 'PM';
        } else {
          outAmPm = 'AM';
        }
        
        updatedFormData = {
          ...updatedFormData,
          timeOutHour: String(outHour12).padStart(2, '0'),
          timeOutMinute: String(minuteInt).padStart(2, '0'),
          timeOutAmPm: outAmPm
        };
      } else {
        // Clear time out if time in is incomplete
        updatedFormData = {
          ...updatedFormData,
          timeOutHour: '',
          timeOutMinute: '',
          timeOutAmPm: 'AM'
        };
      }
    }
    
    setFormData(updatedFormData);
    setError('');
  };

  /**
   * Handle save changes - REGLA: Mantiene el estado "Completed" sin cambios
   */
  const handleSaveChanges = async () => {
    if (!formData.visitType || !formData.date) {
      setError('Please fill in visit type and date');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Prepare data for backend update
      const updateData = {
        ...visitData,
        visit_type: formData.visitType,
        staff_id: formData.therapist,
        visit_date: formData.date,
        scheduled_time: formData.time,
        status: visitData.status, // CRITICAL: Keep original status "Completed"
        notes: formData.notes,
        g_code: formData.gCode,
        time_in_hour: formData.timeInHour,
        time_in_minute: formData.timeInMinute,
        time_in_ampm: formData.timeInAmPm,
        time_out_hour: formData.timeOutHour,
        time_out_minute: formData.timeOutMinute,
        time_out_ampm: formData.timeOutAmPm,
        note_header_frequency: formData.noteHeaderFrequency,
        telehealth: formData.telehealth,
        documents: formData.documents
      };

      // Update via backend API
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const params = new URLSearchParams();
      
      if (formData.visitType !== visitData.visit_type) params.append('visit_type', formData.visitType);
      if (formData.therapist !== visitData.staff_id) params.append('staff_id', formData.therapist);
      if (formData.date !== visitData.visit_date) params.append('visit_date', formData.date);
      if (formData.time !== visitData.scheduled_time) params.append('scheduled_time', formData.time);
      if (formData.notes !== visitData.notes) params.append('notes', formData.notes);
      
      const response = await fetch(`${API_BASE_URL}/visits/${visitData.id}?${params.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update visit: ${response.status} - ${errorText}`);
      }

      const updatedVisit = await response.json();
      
      // Notify parent with updated data - status remains "Completed"
      if (onSave) {
        onSave({
          ...updateData,
          ...updatedVisit
        });
      }
      
      onClose();
      
    } catch (err) {
      console.error('Error saving changes:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle return to therapist - REGLA: Cambia de "Completed" a "Pending"
   */
  const handleReturnToTherapist = async () => {
    setIsProcessing(true);
    
    try {
      // Update status to Pending via backend
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/visits/${visitData.id}?status=Pending`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      const updatedVisit = await response.json();
      
      // Notify parent with status change and remove saved indicator
      if (onSave) {
        onSave({
          ...visitData,
          ...updatedVisit,
          status: 'Pending',
          hasNoteSaved: false // Remove saved indicator
        });
      }
      
      onClose();
      
    } catch (err) {
      console.error('Error returning to therapist:', err);
      setError('Failed to return to therapist. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle edit evaluation - Load existing note for editing
   */
  const handleEditEvaluation = async () => {
    setIsLoading(true);
    
    try {
      // Load existing note for editing
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/visit-notes/${visitData.id}`);
      
      if (response.ok) {
        const existingNote = await response.json();
        console.log('Loading existing note for editing:', existingNote);
        
        // Extract sections_data and handle both corrupted (nested) and clean structures
        let sectionsData = existingNote.sections_data || {};
        
        // Handle corrupted nested structure from old notes
        if (sectionsData.sections_data) {
          console.log('🔧 Fixing corrupted nested sections_data structure');
          sectionsData = sectionsData.sections_data;
        }
        
        console.log('Extracted sections data:', sectionsData);
        
        setFormData(prev => {
          const updatedFormData = {
            ...prev,
            existingNoteId: existingNote.id,
            existingNoteData: sectionsData  // This will be spread into initialData
          };
          console.log('Updated formData for editing:', updatedFormData);
          return updatedFormData;
        });
        
        setShowEvaluationModal(true);
      } else {
        throw new Error(`Failed to load existing note: ${response.status}`);
      }
    } catch (err) {
      console.error('Error loading existing note:', err);
      setError('Failed to load note for editing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle view note - Open printable view in new window
   */
  const handleViewNote = () => {
    console.log('🔍 handleViewNote called');
    console.log('🔍 visitData:', visitData);
    console.log('🔍 visitData.hasNoteSaved:', visitData?.hasNoteSaved);
    console.log('🔍 visitData.status:', visitData?.status);
    console.log('🔍 patientInfo:', patientInfo);
    
    if (!visitData || !patientInfo) {
      setError('Missing visit or patient information');
      return;
    }

    // For now, let's allow viewing regardless of note status for testing
    // Later we can add back the validation
    
    try {
      const userRole = getNormalizedUserRole(user);
      console.log('🔍 userRole:', userRole);
      
      // Open printable view with visit data
      openNotePrintableView(patientInfo.id, visitData.id, userRole, {
        width: 1400,
        height: 900
      });
      
    } catch (err) {
      console.error('Error opening printable view:', err);
      setError('Failed to open printable view');
    }
  };

  /**
   * Handle evaluation modal save - For editing existing notes, use PUT
   */
  const handleEvaluationSave = async (evaluationData) => {
    try {
      setIsLoading(true);
      
      // Get therapist name from visit data
      const therapistName = getTherapistName(formData.therapist || visitData.therapist || visitData.staff_id);
      
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      if (formData.existingNoteId) {
        // UPDATE existing note using PUT
        console.log('Updating existing note:', formData.existingNoteId);
        console.log('Evaluation data from modal:', evaluationData);
        
        // Use evaluation data directly - no conversion needed
        const updateData = {
          status: "Completed",
          sections_data: evaluationData,
          therapist_name: therapistName
        };
        
        const response = await fetch(`${API_BASE_URL}/visit-notes/${formData.existingNoteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to update note: ${response.status} - ${errorData}`);
        }
        
        const savedNote = await response.json();
        console.log('Note updated successfully:', savedNote);
        
        // Update visit status to Completed with saved indicator
        const updatedVisitData = {
          ...visitData,
          status: 'Completed',
          hasNoteSaved: true, // Show "Saved" indicator
          evaluationData,
          noteId: savedNote.id
        };
        
        if (onSave) {
          onSave(updatedVisitData);
        }
        
        setShowEvaluationModal(false);
        
      } else {
        // This shouldn't happen for Edit button, but fallback to CREATE
        console.log('No existing note ID found, creating new note for visit:', visitData.id);
        
        const noteData = {
          visit_id: visitData.id,
          status: "Completed",
          sections_data: evaluationData,
          therapist_name: therapistName
        };
        
        const response = await fetch(`${API_BASE_URL}/visit-notes/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(noteData)
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to create note: ${response.status} - ${errorData}`);
        }
        
        const savedNote = await response.json();
        console.log('Note created successfully:', savedNote);
        
        // Update visit status to Completed with saved indicator
        const updatedVisitData = {
          ...visitData,
          status: 'Completed',
          hasNoteSaved: true, // Show "Saved" indicator
          evaluationData,
          noteId: savedNote.id
        };
        
        if (onSave) {
          onSave(updatedVisitData);
        }
        
        setShowEvaluationModal(false);
      }
      
    } catch (err) {
      console.error('Error saving evaluation:', err);
      setError(`Failed to save evaluation: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle file upload
   */
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = () => {
    if (!selectedFile) return;

    setIsLoading(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newDocument = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        uploadDate: new Date().toISOString()
      };
      
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, newDocument]
      }));
      
      setSelectedFile(null);
      setIsLoading(false);
    }, 1000);
  };

  const handleRemoveDocument = (docId) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== docId)
    }));
  };

  // ===== RENDER FUNCTIONS =====
  
  /**
   * Render the main visit details form
   */
  const renderVisitDetails = () => {
    const discipline = getTherapistDiscipline(formData.therapist);
    const therapistName = getTherapistName(formData.therapist);

    return (
      <div className="visit-details-container">
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        <div className="details-section">
          <h3>Visit Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select
                name="visitType"
                value={formData.visitType}
                onChange={handleInputChange}
                className="form-input"
              >
                {visitTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Therapist</label>
            <select
              name="therapist"
              value={formData.therapist || ''}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select Therapist</option>
              {availableTherapists.map((therapist) => (
                <option key={therapist.id} value={therapist.id}>
                  {therapist.name} ({therapist.role})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>G-Code</label>
            <input
              type="text"
              name="gCode"
              value={formData.gCode}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-row time-row">
            <div className="form-group time-group">
              <label>Time In</label>
              <div className="time-selectors modern-time">
                <div className="time-input-group">
                  <select 
                    name="timeInHour"
                    value={formData.timeInHour}
                    onChange={handleInputChange}
                    className="hour-select"
                  >
                    <option value="">--</option>
                    {hours.map(hour => (
                      <option key={`in-hour-${hour}`} value={hour}>{hour}</option>
                    ))}
                  </select>
                  <span className="time-separator">:</span>
                  <select 
                    name="timeInMinute"
                    value={formData.timeInMinute}
                    onChange={handleInputChange}
                    className="minute-select"
                  >
                    <option value="">--</option>
                    {minutes.map(minute => (
                      <option key={`in-min-${minute}`} value={minute}>{minute}</option>
                    ))}
                  </select>
                  <select 
                    name="timeInAmPm"
                    value={formData.timeInAmPm}
                    onChange={handleInputChange}
                    className="ampm-select"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group time-group">
              <label>Time Out</label>
              <div className="time-selectors modern-time">
                <div className="time-input-group">
                  <select 
                    name="timeOutHour"
                    value={formData.timeOutHour}
                    onChange={handleInputChange}
                    className="hour-select"
                  >
                    <option value="">--</option>
                    {hours.map(hour => (
                      <option key={`out-hour-${hour}`} value={hour}>{hour}</option>
                    ))}
                  </select>
                  <span className="time-separator">:</span>
                  <select 
                    name="timeOutMinute"
                    value={formData.timeOutMinute}
                    onChange={handleInputChange}
                    className="minute-select"
                  >
                    <option value="">--</option>
                    {minutes.map(minute => (
                      <option key={`out-min-${minute}`} value={minute}>{minute}</option>
                    ))}
                  </select>
                  <select 
                    name="timeOutAmPm"
                    value={formData.timeOutAmPm}
                    onChange={handleInputChange}
                    className="ampm-select"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                <div className="auto-calculated-indicator">
                  <i className="fas fa-magic"></i>
                  <span>Auto-calculated</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>MD Asignado</label>
            <input
              type="text"
              name="physician"
              value={formData.physician}
              onChange={handleInputChange}
              className="form-input physician-field"
              readOnly
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Note Header Frequency</label>
              <input
                type="text"
                name="noteHeaderFrequency"
                value={formData.noteHeaderFrequency}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 1w1"
              />
            </div>
            <div className="form-group checkbox-group telehealth-toggle">
              <label htmlFor="telehealth">Telehealth</label>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="telehealth"
                  checked={formData.telehealth}
                  onChange={handleInputChange}
                  id="telehealth"
                />
                <label htmlFor="telehealth" className="checkbox-label"></label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Cert Period</label>
            <div className="cert-period-display">
              <input
                type="text"
                value={visitData?.certPeriodDisplay || (certPeriodDates ? `${certPeriodDates.startDate} - ${certPeriodDates.endDate}` : 'Not available')}
                className="form-input cert-period-field"
                readOnly
              />
            </div>
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="form-input"
              rows="5"
            ></textarea>
          </div>
        </div>

        <div className="evaluation-section">
          <div className="evaluation-header">
            <h3>{discipline} EVALUATION</h3>
          </div>

          <div className="evaluation-info">
            <div className="eval-row">
              <button 
                className="edit-button" 
                onClick={handleEditEvaluation}
                disabled={isProcessing}
              >
                EDIT
              </button>
              <button 
                className="view-button"
                onClick={handleViewNote}
                disabled={false}
                title="View printable note"
              >
                <i className="fas fa-eye"></i>
                VIEW
              </button>
            </div>
            
            <div className="eval-details">
              <p>Therapist: {therapistName}</p>
              <p>Status: {visitData?.status === 'Pending' ? 'Pending' : (visitData?.status || visitStatus || 'Complete')}</p>
              
              {/* Show Saved indicator when note is saved */}
              {visitData?.hasNoteSaved && visitData?.status === 'Completed' && (
                <div className="note-saved-indicator">
                  <i className="fas fa-check-circle"></i>
                  <span>Saved</span>
                </div>
              )}
            </div>

            {/* Return to Therapist Button - Always visible for completed visits */}
            {(visitData?.status === 'Completed' || visitStatus === 'COMPLETED') && (
              <div className="return-action-section">
                <button 
                  className="return-to-therapist-btn" 
                  onClick={handleReturnToTherapist}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-undo"></i>
                      Return To Therapist
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="documents-section">
            <h3>UPLOADED DOCUMENTS</h3>
            
            {formData.documents.length === 0 ? (
              <div className="no-documents">
                <p>No Files Uploaded</p>
              </div>
            ) : (
              <div className="documents-list">
                {formData.documents.map(doc => (
                  <div key={doc.id} className="document-item">
                    <div className="document-icon">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div className="document-info">
                      <span className="document-name">{doc.name}</span>
                      <span className="document-details">
                        {formatFileSize(doc.size)} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                    <button 
                      className="document-remove"
                      onClick={() => handleRemoveDocument(doc.id)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="file-upload">
              <div className="file-select">
                <input
                  type="file"
                  id="fileUpload"
                  className="file-input"
                  onChange={handleFileSelect}
                />
                <label htmlFor="fileUpload" className="choose-file-btn">
                  CHOOSE FILE
                </label>
                <span className="file-name">
                  {selectedFile ? selectedFile.name : 'No file selected'}
                </span>
              </div>
              <button 
                className="upload-btn"
                onClick={handleFileUpload}
                disabled={!selectedFile || isLoading}
              >
                {isLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  'UPLOAD'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  // ===== MAIN RENDER =====
  return (
    <>
      <div className="visit-modal-overlay">
        <div className="visit-modal">
          <div className="modal-header">
            <h2>Visit Detail</h2>
            <button className="close-button" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="modal-body">
            {renderVisitDetails()}
          </div>
          
          <div className="modal-footer">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="save-button" 
              onClick={handleSaveChanges}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-indicator">
                  <i className="fas fa-spinner fa-spin"></i> Processing...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Evaluation Modal */}
      {showEvaluationModal && (() => {
        const initialDataForModal = {
          // Pass metadata
          patientName: patientInfo?.full_name || 'Unknown',
          date: formData.date,
          therapistName: getTherapistName(formData.therapist || visitData.therapist || visitData.staff_id),
          visitId: visitData?.id,
          // Include existing note data for editing (merge with metadata)
          ...formData.existingNoteData,
          // Ensure these fields always take precedences
          id: visitData?.id,
          staff_id: formData.therapist || visitData.therapist || visitData.staff_id,
          therapist_name: getTherapistName(formData.therapist || visitData.therapist || visitData.staff_id)
        };
        
        console.log('Passing initialData to NoteTemplateModal:', initialDataForModal);
        console.log('formData.existingNoteData:', formData.existingNoteData);
        console.log('🔍 VisitModalComponent: Passing existingNoteId:', formData.existingNoteId);
        
        // Debug: Log section data summary
        console.log('Sections found:', Object.keys(formData.existingNoteData));
        
        return (
          <NoteTemplateModal
            isOpen={showEvaluationModal}
            onClose={() => setShowEvaluationModal(false)}
            patientData={patientInfo}
            disciplina={getTherapistDiscipline(formData.therapist || visitData.therapist || visitData.staff_id)}
            tipoNota={formData.visitType || visitData.visit_type || visitData.visitType}
            initialData={initialDataForModal}
            existingNoteId={formData.existingNoteId}
            onSave={handleEvaluationSave}
          />
        );
      })()}
    </>
  );
};

export default VisitModalComponent;