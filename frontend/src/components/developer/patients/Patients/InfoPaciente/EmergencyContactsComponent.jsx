import React, { useState, useEffect } from 'react';

const EmergencyContactsComponent = ({ patient, onUpdateContacts }) => {
  const [contacts, setContacts] = useState([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relation: ''
  });

  // Initialize contacts from patient data (LOCAL ONLY)
  useEffect(() => {
    if (patient) {
      const initialContacts = [];
      
      // Try to get emergency contact from patient data
      if (patient.emergencyContact || patient.contact_info) {
        initialContacts.push({
          id: 1,
          name: patient.emergencyContact || 'Emergency Contact',
          phone: patient.emergencyPhone || patient.contact_info || '',
          relation: 'Family Member'
        });
      }
      
      setContacts(initialContacts);
    }
  }, [patient]);

  // Handle changes in input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContact(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open form to add new contact
  const handleAddContactClick = () => {
    setIsAddingContact(true);
    setIsEditingContact(null);
    setError(null);
    setNewContact({
      name: '',
      phone: '',
      relation: ''
    });
  };

  // Open form to edit existing contact
  const handleEditContactClick = (contact) => {
    setIsEditingContact(contact.id);
    setIsAddingContact(false);
    setError(null);
    setNewContact({
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation
    });
  };

  // Save contact (LOCAL ONLY - no API calls)
  const handleSaveContact = async () => {
    if (!newContact.name || !newContact.phone) {
      setError('Name and phone are required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (isEditingContact) {
        // Update existing contact in local state
        setContacts(contacts.map(contact => 
          contact.id === isEditingContact 
            ? { ...contact, ...newContact } 
            : contact
        ));
        setIsEditingContact(null);
      } else {
        // Add new contact to local state
        const newId = contacts.length > 0 
          ? Math.max(...contacts.map(c => c.id)) + 1 
          : 1;
        
        const newContactWithId = {
          id: newId,
          ...newContact
        };
        
        setContacts([...contacts, newContactWithId]);
      }
      
      // Notify parent component
      if (onUpdateContacts) {
        onUpdateContacts([...contacts]);
      }
      
      setIsAddingContact(false);
      setNewContact({
        name: '',
        phone: '',
        relation: ''
      });
      
    } catch (err) {
      setError('Error saving contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel adding/editing contact
  const handleCancelEdit = () => {
    setIsAddingContact(false);
    setIsEditingContact(null);
    setError(null);
    setNewContact({
      name: '',
      phone: '',
      relation: ''
    });
  };

  // Delete contact (LOCAL ONLY)
  const handleDeleteContact = async (contactId) => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Remove from local state
      const updatedContacts = contacts.filter(contact => contact.id !== contactId);
      setContacts(updatedContacts);

      // Close edit form if we're deleting the contact being edited
      if (isEditingContact === contactId) {
        setIsEditingContact(null);
        setIsAddingContact(false);
      }

      // Notify parent component
      if (onUpdateContacts) {
        onUpdateContacts(updatedContacts);
      }

    } catch (err) {
      setError('Error deleting contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="emergency-contacts-card">
      <div className="card-header">
        <div className="header-title">
          <i className="fas fa-phone-alt"></i>
          <h3>Emergency Contacts</h3>
        </div>
        {!isAddingContact && !isEditingContact && (
          <button 
            className="add-button" 
            onClick={handleAddContactClick}
            disabled={isLoading}
          >
            <i className="fas fa-plus"></i>
          </button>
        )}
      </div>

      <div className="card-body">
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {(isAddingContact || isEditingContact) ? (
          <div className="contact-form">
            <div className="form-row">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                type="text"
                name="name"
                value={newContact.name}
                onChange={handleInputChange}
                placeholder="Full Name"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-row">
              <label htmlFor="contact-phone">Phone</label>
              <input
                id="contact-phone"
                type="text"
                name="phone"
                value={newContact.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-row">
              <label htmlFor="contact-relation">Relation</label>
              <select
                id="contact-relation"
                name="relation"
                value={newContact.relation}
                onChange={handleInputChange}
                disabled={isLoading}
              >
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
              <button 
                className="cancel-btn" 
                onClick={handleCancelEdit}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="save-btn" 
                onClick={handleSaveContact}
                disabled={!newContact.name || !newContact.phone || isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    {isEditingContact ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  isEditingContact ? 'Update Contact' : 'Add Contact'
                )}
              </button>
            </div>
          </div>
        ) : contacts.length > 0 ? (
          <div className="contacts-list">
            {contacts.map((contact) => (
              <div className="contact-item" key={contact.id}>
                <div className="contact-details">
                  <div className="contact-name">
                    <i className="fas fa-user"></i>
                    <span>{contact.name}</span>
                  </div>
                  <div className="contact-info">
                    <div className="contact-phone">
                      <i className="fas fa-phone"></i>
                      <span>{contact.phone}</span>
                    </div>
                    <div className="contact-relation">
                      <i className="fas fa-users"></i>
                      <span>{contact.relation || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
                <div className="contact-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditContactClick(contact)}
                    disabled={isLoading}
                    title="Edit contact"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteContact(contact.id)}
                    disabled={isLoading}
                    title="Delete contact"
                  >
                    {isLoading ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-trash"></i>
                    )}
                  </button>
                </div>
              </div>
            ))}
            <button 
              className="add-more-btn"
              onClick={handleAddContactClick}
              disabled={isLoading}
            >
              <i className="fas fa-plus-circle"></i>
              <span>Add Another Contact</span>
            </button>
          </div>
        ) : (
          <div className="no-contacts">
            <i className="fas fa-exclamation-circle"></i>
            <p>No emergency contacts available</p>
            <button 
              className="add-contact-btn"
              onClick={handleAddContactClick}
              disabled={isLoading}
            >
              <i className="fas fa-plus"></i>
              <span>Add Contact</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyContactsComponent;