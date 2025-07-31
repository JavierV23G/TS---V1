import { useState, useEffect, useCallback } from 'react';

// Hook para manejar datos de sections con autosave
const useSectionData = (initialData = {}, autoSaveConfig = {}) => {
  const [data, setData] = useState(initialData);
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
  const validateData = useCallback((dataToValidate = data) => {
    console.log('=== DEBUG: validateData called ===');
    console.log('dataToValidate:', dataToValidate);
    console.log('Type of dataToValidate:', typeof dataToValidate);
    
    const errors = {};
    const warnings = {};

    // Solo validar si tenemos sections template (objetos numéricos como "1", "2", "3")
    const templateSections = {};
    const nonTemplateSections = {};
    
    console.log('Data entries to validate:', Object.entries(dataToValidate));
    
    Object.entries(dataToValidate).forEach(([sectionId, sectionData]) => {
      console.log(`Validating section "${sectionId}":`, sectionData, 'Type:', typeof sectionData);
      
      // Solo validar sections que son strings numéricos ("1", "2", "3") - estas son las sections template
      if (/^\d+$/.test(sectionId) && sectionData && typeof sectionData === 'object') {
        templateSections[sectionId] = sectionData;
        console.log(`Section "${sectionId}" is a template section`);
      } else {
        nonTemplateSections[sectionId] = sectionData;
        console.log(`Section "${sectionId}" failed validation - not an object:`, typeof sectionData);
      }
    });

    // Solo validar las sections template
    Object.entries(templateSections).forEach(([sectionId, sectionData]) => {
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
        warnings[sectionId] = `Empty fields: ${emptyFields.join(', ')}`;
      }
    });

    console.log('=== DEBUG: Validation complete ===');
    console.log('Template sections found:', Object.keys(templateSections));
    console.log('Non-template sections (ignored):', Object.keys(nonTemplateSections));
    console.log('Errors:', errors);
    console.log('Warnings:', warnings);

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

  // Función para obtener estadísticas de completitud
  const getCompletionStats = useCallback(() => {
    const sections = Object.keys(data);
    const completedSections = sections.filter(sectionId => {
      const sectionData = data[sectionId];
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
      total: sections.length,
      completed: completedSections.length,
      percentage: sections.length > 0 ? Math.round((completedSections.length / sections.length) * 100) : 0
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