// Utilities para parsear y validar configuración de templates

/**
 * Parsea configuración JSON del backend y la valida
 */
export const parseTemplateConfig = (rawConfig) => {
  try {
    const config = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
    
    if (!isValidTemplateConfig(config)) {
      throw new Error('Invalid template configuration');
    }

    return {
      ...config,
      sections: config.sections
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(section => ({
          ...section,
          id: section.id || generateSectionId(section.component),
          name: section.name || section.component.replace('Section', ''),
          icon: section.icon || 'fas fa-file-alt',
          required: Boolean(section.required),
          order: section.order || 0
        }))
    };
  } catch (error) {
    console.error('Error parsing template config:', error);
    throw new Error(`Template parsing failed: ${error.message}`);
  }
};

/**
 * Valida si una configuración de template es válida
 */
export const isValidTemplateConfig = (config) => {
  if (!config || typeof config !== 'object') return false;
  if (!config.templateId || typeof config.templateId !== 'string') return false;
  if (!config.sections || !Array.isArray(config.sections)) return false;
  if (config.sections.length === 0) return false;

  return config.sections.every(section => 
    section.component &&
    typeof section.component === 'string' &&
    (section.id || section.component) &&
    typeof section.order === 'number'
  );
};

/**
 * Genera un ID único para una sección basado en su componente
 */
export const generateSectionId = (componentName) => {
  return componentName
    .replace('Section', '')
    .replace(/([A-Z])/g, (match, letter, index) => 
      index > 0 ? `-${letter.toLowerCase()}` : letter.toLowerCase()
    );
};

/**
 * Filtra secciones por criterio
 */
export const filterSections = (sections, criteria) => {
  if (!sections || !Array.isArray(sections)) return [];

  return sections.filter(section => {
    if (criteria.required !== undefined && section.required !== criteria.required) {
      return false;
    }
    
    if (criteria.category && section.category !== criteria.category) {
      return false;
    }
    
    if (criteria.search) {
      const searchTerm = criteria.search.toLowerCase();
      return (
        (section.name && section.name.toLowerCase().includes(searchTerm)) ||
        (section.description && section.description.toLowerCase().includes(searchTerm)) ||
        (section.component && section.component.toLowerCase().includes(searchTerm))
      );
    }

    return true;
  });
};

/**
 * Agrupa secciones por categoría
 */
export const groupSectionsByCategory = (sections) => {
  if (!sections || !Array.isArray(sections)) return {};

  return sections.reduce((groups, section) => {
    const category = section.category || 'general';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(section);
    return groups;
  }, {});
};

/**
 * Valida datos de sección contra su configuración
 */
export const validateSectionData = (sectionData, sectionConfig) => {
  const errors = [];
  const warnings = [];

  if (!sectionData || typeof sectionData !== 'object') {
    errors.push('Section data is missing or invalid');
    return { errors, warnings, isValid: false };
  }

  // Validar campos requeridos si están definidos en la configuración
  if (sectionConfig.requiredFields && Array.isArray(sectionConfig.requiredFields)) {
    sectionConfig.requiredFields.forEach(fieldName => {
      const value = sectionData[fieldName];
      
      if (value === undefined || value === null || value === '') {
        errors.push(`Required field '${fieldName}' is missing`);
      }
    });
  }

  // Validar tipos de datos si están definidos
  if (sectionConfig.fieldTypes && typeof sectionConfig.fieldTypes === 'object') {
    Object.entries(sectionConfig.fieldTypes).forEach(([fieldName, expectedType]) => {
      const value = sectionData[fieldName];
      
      if (value !== undefined && value !== null) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        
        if (actualType !== expectedType) {
          warnings.push(`Field '${fieldName}' expected ${expectedType} but got ${actualType}`);
        }
      }
    });
  }

  return {
    errors,
    warnings,
    isValid: errors.length === 0
  };
};

/**
 * Genera configuración por defecto para una disciplina y tipo de nota
 */
export const generateDefaultConfig = (disciplina, tipoNota) => {
  const baseConfig = {
    templateId: `${disciplina.toLowerCase()}_${tipoNota.toLowerCase()}`,
    name: `${disciplina} ${tipoNota}`,
    description: `${disciplina} ${tipoNota} template`,
    version: '1.0.0',
    navigation: {
      allowSkip: true,
      showProgress: true,
      autoSave: true,
      autoSaveInterval: 30000
    }
  };

  // Configuraciones específicas por disciplina
  switch (disciplina.toUpperCase()) {
    case 'PT':
      return {
        ...baseConfig,
        sections: [
          { id: 'subjective', component: 'SubjectiveSection', name: 'Subjective', order: 1, required: true },
          { id: 'vitals', component: 'VitalsSection', name: 'Vitals', order: 2, required: false },
          { id: 'pain', component: 'PainSection', name: 'Pain Assessment', order: 3, required: false },
          { id: 'cognitive', component: 'CognitiveStatusSection', name: 'Cognitive Status', order: 4, required: false },
          { id: 'living', component: 'LivingArrangementsSection', name: 'Living Arrangements', order: 5, required: false },
          { id: 'mobility', component: 'GaitMobilitySection', name: 'Gait / Mobility', order: 6, required: false },
          { id: 'muscle', component: 'MuscleStrengthSection', name: 'Muscle Strength/ROM', order: 7, required: false },
          { id: 'balance', component: 'BalanceSection', name: 'Balance', order: 8, required: false }
        ]
      };

    case 'OT':
      return {
        ...baseConfig,
        sections: [
          { id: 'subjective', component: 'SubjectiveSection', name: 'Subjective', order: 1, required: true },
          { id: 'cognitive', component: 'CognitiveStatusSection', name: 'Cognitive Status', order: 2, required: true },
          { id: 'adl', component: 'ADLSelfCareSection', name: 'ADL / Self Care', order: 3, required: true }
        ]
      };

    case 'ST':
      return {
        ...baseConfig,
        sections: [
          { id: 'subjective', component: 'SubjectiveSection', name: 'Subjective', order: 1, required: true },
          { id: 'cognitive', component: 'CognitiveStatusSection', name: 'Cognitive Status', order: 2, required: true }
        ]
      };

    default:
      return {
        ...baseConfig,
        sections: [
          { id: 'subjective', component: 'SubjectiveSection', name: 'Subjective', order: 1, required: true }
        ]
      };
  }
};

/**
 * Mergea configuración personalizada con configuración por defecto
 */
export const mergeTemplateConfig = (defaultConfig, customConfig) => {
  if (!customConfig) return defaultConfig;

  return {
    ...defaultConfig,
    ...customConfig,
    sections: [
      ...(defaultConfig.sections || []),
      ...(customConfig.sections || [])
    ].sort((a, b) => (a.order || 0) - (b.order || 0)),
    navigation: {
      ...defaultConfig.navigation,
      ...customConfig.navigation
    }
  };
};