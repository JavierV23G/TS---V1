import { useState, useEffect } from 'react';

// Map backend section names to frontend components
const mapSectionNameToComponent = (sectionName) => {
  const sectionMap = {
    // Secciones existentes del backend
    'Transfers / Functional Independence': 'TransfersFunctionalSection',
    // Nuevas secciones - con componentes mejorados
    'ADL / Self Care Skills': 'ADLSelfCareSkillsSection',
    'Assessment / Justification': 'AssessmentJustificationSkillsSection',
    'Balance': 'BalanceSkillsSection',
    'Vitals': 'VitalsSkillsSection',
    'Pain': 'PainSkillsSection',
    'Living Arrangements': 'LivingArrangementsSkillsSection',
    'Cognitive Status / Comprehension': 'CognitiveStatusSkillsSection',
    'Sensory': 'SensorySkillsSection',
    'Equipment': 'EquipmentSkillsSection',
    'Gait / Mobility Training (Eval)': 'GaitMobilityTrainingSkillsSection',
    'Muscle Strength/ROM': 'MuscleStrengthROMSkillsSection',
    'Transfers / Functional Independence': 'TransfersFunctionalIndependenceSkillsSection',
    'Prosthetic And Orthotic': 'ProstheticOrthoticSkillsSection',
    'Patient / Caregiver Education': 'PatientCaregiverEducationSkillsSection',
    ' Patient / Caregiver Education  ': 'PatientCaregiverEducationSkillsSection',
    'Skilled Care Provided This Visit': 'SkilledCareProvidedThisVisitSkillsSection',
    'Problem List / Functional Limitations': 'ProblemListFunctionalLimitationsSkillsSection',
    'Rehab Potential': 'RehabPotentialSkillsSection',
    'Treatment as Tolerated/Basic POC': 'TreatmentAsToleratedBasicPOCSkillsSection',
    'Short & Long Term Goals': 'ShortLongTermGoalsSkillsSection',
    // Mapeo temporal para Initial Evaluation (usar SubjectiveSection como fallback)
    'Initial Evaluation': 'SubjectiveSection',
    // Sección Subjective agregada
    'Subjective': 'SubjectiveSection',
  };
  
  console.log('🗺️ useTemplateConfig - Mapping section:', sectionName, '-> Component:', sectionMap[sectionName]);
  console.log('🔍 Debug - Available section keys:', Object.keys(sectionMap));
  console.log('🔍 Debug - Looking for exact match:', JSON.stringify(sectionName));
  console.log('🔍 Debug - Available exact keys:', Object.keys(sectionMap).map(k => JSON.stringify(k)));
  return sectionMap[sectionName] || null;
};

// Hook para manejar configuración de templates - 100% dependiente del backend
const useTemplateConfig = (disciplina, tipoNota, isEnabled = true) => {
  const [templateConfig, setTemplateConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para fetch template config del backend
  const fetchTemplateConfig = async (disciplina, tipoNota) => {
    if (!disciplina || !tipoNota) return;

    setLoading(true);
    setError(null);

    try {
      const templateUrl = `http://localhost:8000/templates/${disciplina}/${tipoNota}`;
      const response = await fetch(templateUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.status} - ${response.statusText}`);
      }

      const config = await response.json();
      
      // Transform backend response to expected frontend format
      const transformedConfig = {
        templateId: config.id,
        name: `${config.discipline} ${config.note_type}`,
        sections: config.sections.map(section => {
          const component = mapSectionNameToComponent(section.section_name);
          return {
            id: section.id,
            section_name: section.section_name,
            component: component,
            is_required: section.is_required,
            description: section.description,
            form_schema: section.form_schema
          };
        }),
        discipline: config.discipline,
        note_type: config.note_type,
        is_active: config.is_active
      };
      
      // Validar que el template tenga la estructura esperada
      if (!validateTemplateStructure(transformedConfig)) {
        throw new Error('Invalid template structure received from backend');
      }
      
      setTemplateConfig(transformedConfig);
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

    // Validar cada section con más información
    const missingComponents = [];
    const invalidComponents = [];
    
    for (const section of config.sections) {
      if (!section.id) {
        console.error('Section missing id:', section);
        return false;
      }
      
      if (!section.component) {
        console.error('Section missing component:', section.section_name, section);
        missingComponents.push(section.section_name);
        continue; // Skip this section but continue checking others
      }

      // Verificar que el component existe en nuestras sections disponibles
      if (!isValidSectionComponent(section.component)) {
        console.error(`Unknown section component: ${section.component} for section: ${section.section_name}`);
        invalidComponents.push({section: section.section_name, component: section.component});
        continue; // Skip this section but continue checking others
      }
    }
    
    if (missingComponents.length > 0) {
      console.warn('⚠️ Sections without components (will be skipped):', missingComponents);
    }
    
    if (invalidComponents.length > 0) {
      console.warn('⚠️ Sections with invalid components (will be skipped):', invalidComponents);
    }
    
    // Si todas las secciones fallan, entonces es inválido
    const validSections = config.sections.filter(s => s.component && isValidSectionComponent(s.component));
    if (validSections.length === 0) {
      console.error('❌ No valid sections found in template');
      return false;
    }
    
    console.log('✅ Template validation passed with', validSections.length, 'valid sections out of', config.sections.length);

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
      'ADLSelfCareSkillsSection', // Nueva sección ADL / Self Care Skills
      'AssessmentJustificationSkillsSection', // Nueva sección Assessment / Justification
      'BalanceSkillsSection', // Nueva sección Balance
      'VitalsSkillsSection', // Nueva sección Vitals
      'PainSkillsSection', // Nueva sección Pain
      'LivingArrangementsSkillsSection', // Nueva sección Living Arrangements
      'CognitiveStatusSkillsSection', // Nueva sección Cognitive Status / Comprehension
      'SensorySkillsSection', // Nueva sección Sensory
      'EquipmentSkillsSection', // Nueva sección Equipment
      'GaitMobilityTrainingSkillsSection', // Nueva sección Gait / Mobility Training
      'MuscleStrengthROMSkillsSection', // Nueva sección Muscle Strength/ROM
      'TransfersFunctionalIndependenceSkillsSection', // Nueva sección Transfers / Functional Independence
      'ProstheticOrthoticSkillsSection', // Nueva sección Prosthetic And Orthotic
      'PatientCaregiverEducationSkillsSection', // Nueva sección Patient / Caregiver Education
      'SkilledCareProvidedThisVisitSkillsSection', // Nueva sección Skilled Care Provided This Visit
      'ProblemListFunctionalLimitationsSkillsSection', // Nueva sección Problem List / Functional Limitations
      'RehabPotentialSkillsSection', // Nueva sección Rehab Potential
      'TreatmentAsToleratedBasicPOCSkillsSection', // Nueva sección Treatment as Tolerated/Basic POC
      'ShortLongTermGoalsSkillsSection', // Nueva sección Short & Long Term Goals - LA MÁS IMPORTANTE
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
    if (isEnabled) {
      fetchTemplateConfig(disciplina, tipoNota);
    }
  }, [disciplina, tipoNota, isEnabled]);

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
      'ADLSelfCareSkillsSection', 'AssessmentJustificationSkillsSection', 'BalanceSkillsSection', 'VitalsSkillsSection', 'PainSkillsSection', 'LivingArrangementsSkillsSection', 'CognitiveStatusSkillsSection', 'SensorySkillsSection', 'EquipmentSkillsSection', 'GaitMobilityTrainingSkillsSection', 'MuscleStrengthROMSkillsSection', 'TransfersFunctionalIndependenceSkillsSection', 'ProstheticOrthoticSkillsSection', 'PatientCaregiverEducationSkillsSection', 'SkilledCareProvidedThisVisitSkillsSection', 'ProblemListFunctionalLimitationsSkillsSection', 'RehabPotentialSkillsSection', 'TreatmentAsToleratedBasicPOCSkillsSection', 'ShortLongTermGoalsSkillsSection', 'StandardizedTestsSection', 
      'ProblemListSection', 'AssessmentJustificationSection', 'RehabPotentialSection', 
      'TreatmentInterventionsSection', 'SkilledCareSection', 'GoalsSection', 'SignatureSection'
    ]
  };
};

export default useTemplateConfig;