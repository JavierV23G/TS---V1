import React, { useState, useEffect } from 'react';
import { useAuth } from '../../login/AuthContext';
// COMENTADO TEMPORALMENTE - Host Company Management Center
// import CompanyManagementCenter from './Companies/CompanyManagementCenter';
import PatientsPageOriginal from './PatientsPageOriginal';
import '../../../styles/developer/Patients/PatientsPageContainer.scss';

const PatientsPageContainer = () => {
  const { currentUser } = useAuth();
  
  // COMENTADO TEMPORALMENTE - Company Selection Logic
  // const [selectedCompany, setSelectedCompany] = useState(null);
  // const [showCompanySelection, setShowCompanySelection] = useState(true);

  // COMENTADO TEMPORALMENTE - Company Selection Functions
  // // Función para manejar la selección de una compañía
  // const handleCompanySelect = (company) => {
  //   setSelectedCompany(company);
  //   setShowCompanySelection(false);
  // };

  // // Función para volver al selector de compañías
  // const handleBackToCompanies = () => {
  //   setSelectedCompany(null);
  //   setShowCompanySelection(true);
  // };

  // COMENTADO TEMPORALMENTE - Company Management Center
  // // Si no hay compañía seleccionada, mostrar el Company Management Center
  // if (showCompanySelection) {
  //   return (
  //     <CompanyManagementCenter 
  //       onSelectCompany={handleCompanySelect}
  //     />
  //   );
  // }

  // CAMBIO: Ir directo a mostrar pacientes como en admin
  // Si hay una compañía seleccionada, mostrar el Patient Management Center
  return (
    <PatientsPageOriginal 
      // COMENTADO TEMPORALMENTE - selectedCompany={selectedCompany}
      // COMENTADO TEMPORALMENTE - onBackToCompanies={handleBackToCompanies}
    />
  );
};

export default PatientsPageContainer;