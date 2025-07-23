import { useState, useEffect } from 'react';

// Hook para manejar configuración de templates - 100% dependiente del backend
const useTemplateConfig = (disciplina, tipoNota) => {
  const [templateConfig, setTemplateConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para fetch template config del backend
  const fetchTemplateConfig = async (disciplina, tipoNota) => {
    if (!disciplina || !tipoNota) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/templates/${disciplina}/${tipoNota}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.status} - ${response.statusText}`);
      }

      const config = await response.json();
      
      // Validar que el template tenga la estructura esperada
      if (!validateTemplateStructure(config)) {
        throw new Error('Invalid template structure received from backend');
      }
      
      setTemplateConfig(config);
    } catch (err) {
      console.error('Error fetching template config:', err);
      setError(err.message);
      setTemplateConfig(null); // No fallback - el backend DEBE responder
    } finally {
      setLoading(false);
    }
  };

  // Validar estructura del template recibido del backend
  const validateTemplateStructure = (config) => {
    if (!config || typeof config !== 'object') {
      console.error('Template config is not an object');
      return false;
    }

    // Validar campos requeridos
    const requiredFields = ['templateId', 'name', 'sections'];
    for (const field of requiredFields) {
      if (!config[field]) {
        console.error(`Template missing required field: ${field}`);
        return false;
      }
    }

    // Validar que sections sea un array
    if (!Array.isArray(config.sections)) {
      console.error('Template sections must be an array');
      return false;
    }

    // Validar cada section
    for (const section of config.sections) {
      if (!section.id || !section.component) {
        console.error('Each section must have id and component', section);
        return false;
      }

      // Verificar que el component existe en nuestras sections disponibles
      if (!isValidSectionComponent(section.component)) {
        console.error(`Unknown section component: ${section.component}`);
        return false;
      }
    }

    return true;
  };

  // Validar que el component existe en nuestras 18 sections disponibles
  const isValidSectionComponent = (componentName) => {
    const validComponents = [
      'SubjectiveSection',
      'VitalsSection', 
      'PainSection',
      'MedicationSection',
      'LivingArrangementsSection',
      'GaitMobilitySection',
      'MuscleStrengthSection',
      'BalanceSection',
      'TransfersFunctionalSection',
      'ADLSelfCareSection',
      'StandardizedTestsSection',
      'ProblemListSection',
      'AssessmentJustificationSection',
      'RehabPotentialSection',
      'TreatmentInterventionsSection',
      'SkilledCareSection',
      'GoalsSection',
      'SignatureSection'
    ];

    return validComponents.includes(componentName);
  };

  // Effect para cargar configuración cuando cambian los parámetros
  useEffect(() => {
    fetchTemplateConfig(disciplina, tipoNota);
  }, [disciplina, tipoNota]);

  // Función para refrescar configuración
  const refreshConfig = () => {
    fetchTemplateConfig(disciplina, tipoNota);
  };

  return {
    templateConfig,
    loading,
    error,
    refreshConfig,
    isValid: templateConfig ? validateTemplateStructure(templateConfig) : false,
    availableComponents: [
      'SubjectiveSection', 'VitalsSection', 'PainSection', 'MedicationSection',
      'LivingArrangementsSection', 'GaitMobilitySection', 'MuscleStrengthSection',
      'BalanceSection', 'TransfersFunctionalSection', 'ADLSelfCareSection',
      'StandardizedTestsSection', 'ProblemListSection', 'AssessmentJustificationSection',
      'RehabPotentialSection', 'TreatmentInterventionsSection', 'SkilledCareSection',
      'GoalsSection', 'SignatureSection'
    ]
  };
};

export default useTemplateConfig;