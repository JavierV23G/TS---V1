import React, { useState, useEffect } from 'react';
import { useAuth } from '../../login/AuthContext';
import CompanyManagementCenter from './Companies/CompanyManagementCenter';
import PatientsPageOriginal from './PatientsPageOriginal';
import '../../../styles/developer/Patients/PatientsPageContainer.scss';

const PatientsPageContainer = () => {
  const { currentUser } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanySelection, setShowCompanySelection] = useState(true);

  // Función para manejar la selección de una compañía
  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setShowCompanySelection(false);
  };

  // Función para volver al selector de compañías
  const handleBackToCompanies = () => {
    setSelectedCompany(null);
    setShowCompanySelection(true);
  };

  // Si no hay compañía seleccionada, mostrar el Company Management Center
  if (showCompanySelection) {
    return (
      <CompanyManagementCenter 
        onSelectCompany={handleCompanySelect}
      />
    );
  }

  // Si hay una compañía seleccionada, mostrar el Patient Management Center
  return (
    <PatientsPageOriginal 
      selectedCompany={selectedCompany}
      onBackToCompanies={handleBackToCompanies}
    />
  );
};

export default PatientsPageContainer;