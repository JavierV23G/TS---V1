import { useState, useEffect, useCallback } from 'react';

// Hook para manejar datos de sections con autosave
const useSectionData = (initialData = {}, autoSaveConfig = {}) => {
  // Asegurar que initialData siempre sea un objeto válido
  const safeInitialData = initialData && typeof initialData === 'object' ? initialData : {};
  const [data, setData] = useState(safeInitialData);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const [autoSaveMessage, setAutoSaveMessage] = useState('');

  const {
    enabled = false,
    interval = 30000, // 30 seconds
    endpoint = null,
    onSave = null
  } = autoSaveConfig;

  // Función para guardar datos
  const saveData = useCallback(async (dataToSave = data) => {
    if (!isDirty && !dataToSave) return;

    setSaving(true);
    setAutoSaveMessage('Saving...');

    try {
      let saveResult = null;

      if (endpoint) {
        // Guardar en el backend
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSave)
        });

        if (!response.ok) {
          throw new Error(`Save failed: ${response.status}`);
        }

        saveResult = await response.json();
      } else if (onSave) {
        // Usar función de callback personalizada
        saveResult = await onSave(dataToSave);
      } else {
        // Guardar en localStorage como fallback
        localStorage.setItem('templateData', JSON.stringify(dataToSave));
        saveResult = { success: true, timestamp: new Date().toISOString() };
      }

      setLastSaved(new Date());
      setIsDirty(false);
      setAutoSaveMessage('Autosaved');

      // Clear message after 3 seconds
      setTimeout(() => {
        setAutoSaveMessage('');
      }, 3000);

      return saveResult;
    } catch (error) {
      console.error('Error saving data:', error);
      setAutoSaveMessage('Save failed');
      
      setTimeout(() => {
        setAutoSaveMessage('');
      }, 5000);
      
      throw error;
    } finally {
      setSaving(false);
    }
  }, [data, isDirty, endpoint, onSave]);

  // Función para actualizar datos
  const updateData = useCallback((newData) => {
    setData(prevData => {
      const updatedData = typeof newData === 'function' ? newData(prevData) : newData;
      setIsDirty(true);
      return updatedData;
    });
  }, []);

  // Función para actualizar una sección específica
  const updateSection = useCallback((sectionId, sectionData) => {
    updateData(prevData => ({
      ...prevData,
      [sectionId]: sectionData
    }));
  }, [updateData]);

  // Función para resetear datos
  const resetData = useCallback((newInitialData = {}) => {
    setData(newInitialData);
    setIsDirty(false);
    setAutoSaveMessage('');
  }, []);

  // Función para validar datos
  const validateData = useCallback((dataToValidate = data, templateConfig = null) => {
    const errors = {};
    const warnings = {};

    console.log('=== DEBUG: validateData called ===');
    console.log('dataToValidate:', dataToValidate);
    console.log('Type of dataToValidate:', typeof dataToValidate);

    // Verificar que dataToValidate existe y es un objeto
    if (!dataToValidate || typeof dataToValidate !== 'object') {
      console.log('Data is null or not an object, returning valid');
      return { errors: {}, warnings: {}, isValid: true };
    }

    console.log('Data entries to validate:', Object.entries(dataToValidate));

    // Identificar qué campos son secciones del template vs campos de visita
    const templateSectionNames = templateConfig?.sections?.map(section => section.section_name) || [];
    console.log('Template section names:', templateSectionNames);

    // Validaciones básicas solo para secciones del template
    Object.entries(dataToValidate).forEach(([sectionKey, sectionData]) => {
      console.log(`Validating field "${sectionKey}":`, sectionData, 'Type:', typeof sectionData);
      
      // Solo validar como sección si está en la lista de secciones del template
      if (templateSectionNames.includes(sectionKey)) {
        console.log(`"${sectionKey}" is a template section - validating as object`);
        
        if (!sectionData || typeof sectionData !== 'object') {
          console.log(`Section "${sectionKey}" failed validation - not an object:`, typeof sectionData);
          errors[sectionKey] = 'Invalid section data';
          return;
        }

        // Validar campos requeridos (esto se podría hacer más específico por section)
        const emptyFields = Object.entries(sectionData)
          .filter(([key, value]) => {
            if (typeof value === 'string') return value.trim() === '';
            if (typeof value === 'number') return value === 0;
            if (Array.isArray(value)) return value.length === 0;
            return false;
          })
          .map(([key]) => key);

        if (emptyFields.length > 0) {
          warnings[sectionKey] = `Empty fields: ${emptyFields.join(', ')}`;
        }
      } else {
        console.log(`"${sectionKey}" is not a template section - skipping validation`);
      }
    });

    return { errors, warnings, isValid: Object.keys(errors).length === 0 };
  }, [data]);

  // Autosave effect
  useEffect(() => {
    if (!enabled || !isDirty) return;

    const autoSaveTimer = setTimeout(() => {
      saveData();
    }, interval);

    return () => clearTimeout(autoSaveTimer);
  }, [enabled, isDirty, interval, saveData]);

  // Cleanup effect para guardar antes de unmount
  useEffect(() => {
    return () => {
      if (enabled && isDirty) {
        // Intentar guardar de forma síncrona
        try {
          if (onSave) {
            onSave(data);
          } else {
            localStorage.setItem('templateData', JSON.stringify(data));
          }
        } catch (error) {
          console.warn('Failed to save data on unmount:', error);
        }
      }
    };
  }, [enabled, isDirty, data, onSave]);

  // Effect para actualizar datos cuando cambia initialData
  useEffect(() => {
    const safeInitialData = initialData && typeof initialData === 'object' ? initialData : {};
    
    setData(safeInitialData);
    setIsDirty(false);
  }, [initialData]);

  // Función para obtener estadísticas de completitud
  const getCompletionStats = useCallback((templateConfig = null) => {
    // Si tenemos templateConfig, usar sus secciones como referencia
    const totalSections = templateConfig?.sections?.length || 0;
    
    if (totalSections === 0) {
      return {
        total: 0,
        completed: 0,
        percentage: 0
      };
    }

    // Verificar que data existe y es un objeto
    if (!data || typeof data !== 'object') {
      return {
        total: totalSections,
        completed: 0,
        percentage: 0
      };
    }

    // Contar secciones completadas basándose en templateConfig.sections
    const completedSections = templateConfig.sections.filter(section => {
      const sectionData = data[section.section_name];
      if (!sectionData || typeof sectionData !== 'object') return false;
      
      return Object.values(sectionData).some(value => {
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'boolean') return value === true;
        if (typeof value === 'number') return value > 0;
        if (Array.isArray(value)) return value.length > 0;
        return false;
      });
    });

    return {
      total: totalSections,
      completed: completedSections.length,
      percentage: Math.round((completedSections.length / totalSections) * 100)
    };
  }, [data]);

  return {
    data,
    isDirty,
    lastSaved,
    saving,
    autoSaveMessage,
    updateData,
    updateSection,
    saveData,
    resetData,
    validateData,
    getCompletionStats
  };
};

export default useSectionData;