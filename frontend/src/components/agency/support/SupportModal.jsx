import React from 'react';
import UserTicketCenter from './UserTicketCenter';

const SupportModal = ({ isOpen, onClose, userRole }) => {
  return (
    <UserTicketCenter 
      isOpen={isOpen} 
      onClose={onClose}
      userRole={userRole}
    />
  );
};

export default SupportModal;