import React, { useState, useEffect } from 'react';

const EmergencyContactsComponent = ({ patient, onUpdateContacts }) => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formState, setFormState] = useState({ name: '', phone: '', relation: '' });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Simple phone formatter for display during editing only
  const formatPhoneForDisplay = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  useEffect(() => {
    if (patient?.contact_info) {
      let contacts = [];
      
      // Si es diccionario (nueva estructura)
      if (typeof patient.contact_info === 'object' && !Array.isArray(patient.contact_info)) {
        // Extraer contactos del diccionario (excluir primary# y primary)
        Object.entries(patient.contact_info).forEach(([key, value], index) => {
          if (key !== 'primary#' && key !== 'primary' && key !== 'secondary') {
            let contactData;
            
            // Verificar si el valor está codificado con formato (phone|relation) o (name|phone|relation)
            if (typeof value === 'string' && value.includes('|')) {
              const parts = value.split('|');
              
              if (parts.length === 2) {
                // Nuevo formato: phone|relation (nombre en la key)
                const [phone, relation] = parts;
                contactData = {
                  id: index + 1,
                  name: key || `Contact ${index + 1}`,
                  phone: phone,
                  relation: relation || 'Contact'
                };
              } else if (parts.length === 3) {
                // Formato anterior: name|phone|relation
                const [name, phone, relation] = parts;
                contactData = {
                  id: index + 1,
                  name: name || `Contact ${index + 1}`,
                  phone: phone,
                  relation: relation || 'Contact'
                };
              }
            } else if (typeof value === 'object' && value.phone) {
              // Compatibilidad con estructura de objeto (por si acaso)
              contactData = {
                id: index + 1,
                name: value.name || `Emergency Contact ${index + 1}`,
                phone: value.phone,
                relation: value.relationship || 'Emergency'
              };
            } else {
              // Solo teléfono
              contactData = {
                id: index + 1,
                name: `Emergency Contact ${index + 1}`,
                phone: value,
                relation: 'Emergency'
              };
            }
            contacts.push(contactData);
          }
        });
      } else {
        // Compatibilidad con estructura antigua
        try {
          const allContacts = JSON.parse(patient.contact_info);
          if (Array.isArray(allContacts)) {
            contacts = allContacts.slice(1); // Get all contacts except the first one
          }
        } catch (e) {
          console.error("Failed to parse contacts:", e);
        }
      }
      
      setEmergencyContacts(contacts);
    } else {
      setEmergencyContacts([]);
    }
  }, [patient]);

  const handlePhoneInputChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '');
    setFormState(prev => ({ ...prev, phone: cleaned.slice(0, 10) }));
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormState({ name: '', phone: '', relation: '' });
  };

  const handleEdit = (contact) => {
    setEditingId(contact.id);
    setIsAdding(false);
    // Extract raw digits from formatted phone for editing
    const rawPhone = contact.phone ? contact.phone.replace(/\D/g, '') : '';
    setFormState({ name: contact.name, phone: rawPhone, relation: contact.relation });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setError(null);
  };

  const handleSave = () => {
    if (!formState.name || !formState.phone) {
      setError('Name and phone are required.');
      return;
    }

    let updatedEmergencyContacts;
    if (isAdding) {
      updatedEmergencyContacts = [...emergencyContacts, { ...formState, id: Date.now() }];
    } else {
      updatedEmergencyContacts = emergencyContacts.map(c => c.id === editingId ? { ...formState, id: c.id } : c);
    }
    
    saveContactsToApi(updatedEmergencyContacts);
  };

  const handleDelete = (contactId) => {
    const updatedEmergencyContacts = emergencyContacts.filter(c => c.id !== contactId);
    saveContactsToApi(updatedEmergencyContacts);
  };

  const saveContactsToApi = async (updatedEmergencyContacts) => {
    setIsLoading(true);
    setError(null);
    try {
      // Crear estructura de diccionario para contactos
      let contactDict = {};
      
      // Preservar contactos principales existentes
      if (patient.contact_info && typeof patient.contact_info === 'object') {
        if (patient.contact_info['primary#']) {
          contactDict['primary#'] = patient.contact_info['primary#'];
        } else if (patient.contact_info.primary) {
          contactDict['primary#'] = patient.contact_info.primary; // Migrar formato anterior
        }
        if (patient.contact_info.secondary) {
          contactDict.secondary = patient.contact_info.secondary;
        }
      }
      
      // Agregar contactos de emergencia al diccionario (nuevo formato: nombre como key, phone|relation como value)
      // Dejar que el backend maneje el formateo del teléfono
      updatedEmergencyContacts.forEach((contact, index) => {
        const contactName = contact.name || `Emergency_${index + 1}`;
        const contactData = `${contact.phone}|${contact.relation || 'Emergency'}`;
        contactDict[contactName] = contactData;
      });

      
      const params = new URLSearchParams();
      params.append('contact_info', JSON.stringify(contactDict));
      
      const response = await fetch(`${API_BASE_URL}/patients/${patient.id}?${params.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to update contacts: ${response.status} - ${errorText}`);
      }

      setEmergencyContacts(updatedEmergencyContacts);
      if (onUpdateContacts) onUpdateContacts(contactDict);
      
      setIsAdding(false);
      setEditingId(null);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => (
    <div className="contact-form">
      <div className="form-row">
        <label htmlFor="contact-name">Name</label>
        <input id="contact-name" type="text" name="name" value={formState.name} onChange={handleInputChange} placeholder="Full Name" disabled={isLoading} />
      </div>
      <div className="form-row">
        <label htmlFor="contact-phone">Phone</label>
        <input id="contact-phone" type="tel" value={formatPhoneForDisplay(formState.phone)} onChange={handlePhoneInputChange} placeholder="(XXX) XXX-XXXX" disabled={isLoading} />
      </div>
      <div className="form-row">
        <label htmlFor="contact-relation">Relation</label>
        <select id="contact-relation" name="relation" value={formState.relation} onChange={handleInputChange} disabled={isLoading}>
          <option value="">Select Relation</option>
          <option value="Family Member">Family Member</option>
          <option value="Spouse">Spouse</option>
          <option value="Parent">Parent</option>
          <option value="Child">Child</option>
          <option value="Sibling">Sibling</option>
          <option value="Friend">Friend</option>
          <option value="Neighbor">Neighbor</option>
          <option value="Caregiver">Caregiver</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="form-actions">
        <button className="cancel-btn" onClick={handleCancel} disabled={isLoading}>Cancel</button>
        <button className="save-btn" onClick={handleSave} disabled={!formState.name || !formState.phone || isLoading}>
          {isLoading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : 'Save Contact'}
        </button>
      </div>
    </div>
  );

  const renderContactList = () => (
    <div className="contacts-list">
      {emergencyContacts.map(contact => (
        <div className="contact-item" key={contact.id}>
          <div className="contact-details">
            <div className="contact-name"><i className="fas fa-user"></i><span>{contact.name}</span></div>
            <div className="contact-info">
              <div className="contact-phone"><i className="fas fa-phone"></i><span>{formatPhoneForDisplay(contact.phone)}</span></div>
              <div className="contact-relation"><i className="fas fa-users"></i><span>{contact.relation || 'Not specified'}</span></div>
            </div>
          </div>
          <div className="contact-actions">
            <button className="edit-btn" onClick={() => handleEdit(contact)} disabled={isLoading} title="Edit contact"><i className="fas fa-edit"></i></button>
            <button className="delete-btn" onClick={() => handleDelete(contact.id)} disabled={isLoading} title="Delete contact">
              {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash"></i>}
            </button>
          </div>
        </div>
      ))}
      <button className="add-more-btn" onClick={handleAddNew} disabled={isLoading}><i className="fas fa-plus-circle"></i><span>Add Another Contact</span></button>
    </div>
  );

  return (
    <div className="emergency-contacts-card">
      <div className="card-header">
        <div className="header-title">
          <i className="fas fa-phone-alt"></i>
          <h3>Emergency Contacts</h3>
        </div>
        {!isAdding && editingId === null && (
          <button className="add-button" onClick={handleAddNew} disabled={isLoading}><i className="fas fa-plus"></i></button>
        )}
      </div>
      <div className="card-body">
        {error && <div className="error-message"><i className="fas fa-exclamation-triangle"></i><span>{error}</span><button onClick={() => setError(null)}><i className="fas fa-times"></i></button></div>}
        {isAdding || editingId !== null ? renderForm() : emergencyContacts.length > 0 ? renderContactList() : (
          <div className="no-contacts">
            <i className="fas fa-exclamation-circle"></i>
            <p>No emergency contacts available</p>
            <button className="add-contact-btn" onClick={handleAddNew} disabled={isLoading}><i className="fas fa-plus"></i><span>Add Contact</span></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyContactsComponent;