import React, { useState, useEffect } from 'react';

const ShortLongTermGoalsSkillsSection = ({ data = {}, onChange, sectionId, visitDate }) => {
  
  // ========================================
  // MEDICAL CSS-IN-JS STYLES - PSYCHOLOGY OF COLOR APPLIED
  // ========================================
  const medicalStyles = {
    container: {
      maxWidth: '100%',
      margin: 0,
      padding: 0,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e1e8ed 100%)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    },
    
    header: {
      background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
      color: 'white',
      padding: '24px 32px',
      position: 'relative'
    },
    
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
      zIndex: 2
    },
    
    titleGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    
    sectionTitle: {
      margin: 0,
      fontSize: '28px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      letterSpacing: '-0.5px'
    },
    
    sectionIcon: {
      fontSize: '32px',
      color: '#ffd700',
      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
    },
    
    sectionBadge: {
      background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
      animation: 'pulse 2s infinite'
    },
    
    headerStats: {
      display: 'flex',
      gap: '24px'
    },
    
    statItem: {
      textAlign: 'center',
      padding: '8px 16px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    
    statValue: {
      display: 'block',
      fontSize: '24px',
      fontWeight: 700,
      color: '#ffd700'
    },
    
    statLabel: {
      display: 'block',
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: '2px'
    },
    
    content: {
      padding: '32px',
      background: '#ffffff'
    },
    
    // Duration Section Styles
    durationSection: {
      background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '32px',
      position: 'relative'
    },
    
    durationTitle: {
      fontSize: '22px',
      fontWeight: 700,
      color: '#1a365d',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    
    durationControls: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px'
    },
    
    durationItem: {
      background: 'white',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      padding: '20px',
      transition: 'all 0.3s ease'
    },
    
    // Goals Section Styles  
    goalsSection: {
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      marginBottom: '32px',
      overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease'
    },
    
    // Section-specific header colors using medical psychology
    adlHeader: {
      background: 'linear-gradient(135deg, #38a169 0%, #48bb78 100%)', // Green = Health, Healing
      color: 'white',
      padding: '20px 28px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderLeft: '4px solid #22543d'
    },
    
    transfersHeader: {
      background: 'linear-gradient(135deg, #3182ce 0%, #4299e1 100%)', // Blue = Trust, Stability  
      color: 'white',
      padding: '20px 28px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderLeft: '4px solid #1a365d'
    },
    
    balanceHeader: {
      background: 'linear-gradient(135deg, #805ad5 0%, #9f7aea 100%)', // Purple = Balance, Coordination
      color: 'white',
      padding: '20px 28px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderLeft: '4px solid #44337a'
    },
    
    strengthHeader: {
      background: 'linear-gradient(135deg, #e53e3e 0%, #f56565 100%)', // Red = Strength, Energy
      color: 'white', 
      padding: '20px 28px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderLeft: '4px solid #742a2a'
    },
    
    painHeader: {
      background: 'linear-gradient(135deg, #d69e2e 0%, #ecc94b 100%)', // Orange/Yellow = Caution, Alert
      color: 'white',
      padding: '20px 28px',
      display: 'flex',
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderLeft: '4px solid #744210'
    },
    
    homeProgramHeader: {
      background: 'linear-gradient(135deg, #319795 0%, #4fd1c7 100%)', // Teal = Calm, Education
      color: 'white',
      padding: '20px 28px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center', 
      borderLeft: '4px solid #1d4044'
    },
    
    functionalHeader: {
      background: 'linear-gradient(135deg, #dd6b20 0%, #f6ad55 100%)', // Orange = Activity, Function
      color: 'white',
      padding: '20px 28px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderLeft: '4px solid #7b341e'
    },
    
    diseaseHeader: {
      background: 'linear-gradient(135deg, #9f7aea 0%, #b794f6 100%)', // Purple = Specialized Care
      color: 'white',
      padding: '20px 28px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderLeft: '4px solid #553c9a'
    },
    
    sectionHeaderTitle: {
      fontSize: '20px',
      fontWeight: 700,
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    
    goalsCounter: {
      background: 'rgba(255, 255, 255, 0.2)',
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '14px',
      fontWeight: 600,
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    
    goalsGrid: {
      padding: '28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    
    goalItem: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    
    goalControls: {
      display: 'flex',
      gap: '8px',
      padding: '16px 20px 0'
    },
    
    longTermButton: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      background: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)',
      color: 'white',
      fontWeight: 600,
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    
    addStgButton: {
      padding: '8px 16px',
      border: 'none', 
      borderRadius: '6px',
      background: 'linear-gradient(135deg, #38a169 0%, #48bb78 100%)',
      color: 'white',
      fontWeight: 600,
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    
    goalContent: {
      padding: '20px',
      transition: 'all 0.3s ease'
    },
    
    goalContentEnabled: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
      borderTop: '3px solid #48bb78'
    },
    
    goalContentDisabled: {
      opacity: 0.5,
      background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)'
    },
    
    goalText: {
      fontSize: '16px',
      lineHeight: 1.6,
      marginBottom: '16px',
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '8px',
      borderLeft: '4px solid #4299e1',
      color: '#1a202c'
    },
    
    goalTextStrong: {
      color: '#2b6cb0',
      fontWeight: 700
    },
    
    goalMetadata: {
      borderTop: '1px solid #e2e8f0',
      paddingTop: '12px'
    },
    
    metadataRow: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto 1fr',
      gap: '12px',
      alignItems: 'center',
      padding: '12px 0'
    },
    
    label: {
      fontWeight: 600,
      color: '#4a5568',
      fontSize: '14px'
    },
    
    input: {
      padding: '8px 12px',
      border: '2px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      background: 'white'
    },
    
    select: {
      padding: '8px 12px',
      border: '2px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      background: 'white'
    },
    
    textarea: {
      width: '100%',
      minHeight: '80px',
      padding: '12px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      lineHeight: 1.5,
      resize: 'vertical',
      transition: 'all 0.2s ease'
    },
    
    // Add Additional Styles
    addAdditionalSection: {
      marginTop: '16px',
      padding: '16px',
      background: 'linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)',
      border: '2px dashed #68d391',
      borderRadius: '8px',
      textAlign: 'center'
    },
    
    addButton: {
      background: 'linear-gradient(135deg, #38a169 0%, #48bb78 100%)',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    
    limitText: {
      marginTop: '8px',
      fontSize: '12px',
      color: '#68d391',
      fontWeight: 600
    },
    
    // Balance Grade Selector
    balanceGradeSelector: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      margin: '12px 0'
    },
    
    gradeOption: {
      padding: '6px 12px',
      background: '#f7fafc',
      border: '2px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#4a5568'
    },
    
    gradeOptionSelected: {
      background: 'linear-gradient(135deg, #4299e1 0%, #63b3ed 100%)',
      color: 'white',
      borderColor: '#3182ce'
    },
    
    // Assist Level Selector
    assistSelect: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px'
    },
    
    assistOption: {
      padding: '4px 8px',
      background: '#edf2f7',
      border: '1px solid #cbd5e0',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    
    assistOptionSelected: {
      background: '#4299e1',
      color: 'white',
      borderColor: '#3182ce'
    }
  };
  // Assist levels options - EXACT as specified
  const assistLevels = [
    { value: 'I', label: 'I (No Assist)' },
    { value: 'MI', label: 'MI (Uses Assistive Device)' },
    { value: 'S', label: 'S (Set up/Supervisión)' },
    { value: 'SBA', label: 'SBA (Stand By Assist)' },
    { value: 'MIN', label: 'MIN (Requires 0-25% Assist)' },
    { value: 'MOD', label: 'MOD (Requires 26-50% Assist)' },
    { value: 'MAX', label: 'MAX (Requires 51-75% ASSIST)' },
    { value: 'TOT', label: 'TOT (Requires 76-99% Assist)' },
    { value: 'DEP', label: 'DEP (100% Assist)' },
    { value: 'CGA', label: 'CGA (Contact Guard Assist)' }
  ];

  // Balance grades for posture and balance goals
  const balanceGrades = [
    { value: 'P', label: 'P' },
    { value: 'P+', label: 'P+' },
    { value: 'F-', label: 'F-' },
    { value: 'F', label: 'F' },
    { value: 'F+', label: 'F+' },
    { value: 'G-', label: 'G-' },
    { value: 'G', label: 'G' },
    { value: 'G+', label: 'G+' }
  ];

  // Calculate dynamic dates based on visit date
  const calculateWeekDates = (baseDate) => {
    const base = new Date(baseDate || new Date());
    const weekOptions = [];
    
    for (let i = 1; i <= 9; i++) {
      const weekDate = new Date(base);
      weekDate.setDate(base.getDate() + (i * 7));
      const formattedDate = weekDate.toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric', 
        year: 'numeric' 
      });
      weekOptions.push({
        value: i,
        label: `${i} Week${i > 1 ? 's' : ''} (Week of ${formattedDate})`,
        date: weekDate
      });
    }
    return weekOptions;
  };

  const weekOptions = calculateWeekDates(visitDate);

  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    // SECTION 1: New Goal Durations
    goalDurations: {
      stgCompletedBy: '',
      ltgCompletedBy: ''
    },

    // SECTION 2: ADL(S) - 8 predefined + additional
    adlGoals: {
      selfFeeding: {
        enabled: false,
        assistLevel: '',
        deviceOutcome: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      upperBodyDressing: {
        enabled: false,
        assistLevel: '',
        deviceOutcome: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      lowerBodyDressing: {
        enabled: false,
        assistLevel: '',
        deviceOutcome: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      grooming: {
        enabled: false,
        assistLevel: '',
        deviceOutcome: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      bathing: {
        enabled: false,
        assistLevel: '',
        deviceOutcome: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      customADLTask: {
        enabled: false,
        taskName: '',
        assistLevel: '',
        deviceOutcome: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      independenceCompliance: {
        enabled: false,
        personType: 'Patient', // Patient or Caregiver
        complianceType: 'ADL Safety & Functions', // ADL Safety & Functions, Safe Patient Positioning, Pressure Relief Measures
        assistLevel: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      additionalADLGoal: {
        enabled: false,
        goalText: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      // Additional goals array (up to 10 total)
      additionalGoals: []
    },

    // SECTION 3: TRANSFERS - 4 predefined + additional
    transferGoals: {
      bedMobility: {
        enabled: false,
        assistLevel: '',
        assistiveDevice: '',
        functionalOutcome: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      transfers: {
        enabled: false,
        transferType: 'Bed', // Bed, Chair, Wheelchair, Toilet
        assistLevel: '',
        assistiveDevice: '',
        functionalOutcome: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      tubShowerTransfers: {
        enabled: false,
        transferType: 'Tub', // Tub, Shower
        assistLevel: '',
        assistiveDevice: '',
        functionalOutcome: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      additionalTransferGoal: {
        enabled: false,
        goalText: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      // Additional goals array (up to 10 total)
      additionalGoals: []
    },

    // SECTION 4: BALANCE - 10 predefined + additional
    balanceGoals: {
      staticDynamicBalance: {
        enabled: false,
        balanceType: 'Sitting Static', // Sitting Static, Sitting Dynamic, Standing Static, Standing Dynamic
        grade: '',
        functionalOutcome: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      coordinationImprovement: {
        enabled: false,
        coordinationType: '',
        activity: '',
        outcome: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      postureImprovement: {
        enabled: false,
        grade: '',
        position: 'Standing', // Standing, Sitting
        functionalOutcome: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      tinettiScore: {
        enabled: false,
        fromScore: '',
        toScore: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      bergScore: {
        enabled: false,
        fromScore: '',
        toScore: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      tugScore: {
        enabled: false,
        fromScore: '',
        toScore: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      tugScoreDuplicate: {
        enabled: false,
        fromScore: '',
        toScore: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      functionalReachScore: {
        enabled: false,
        fromScore: '',
        toScore: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      katzScore: {
        enabled: false,
        fromScore: '',
        toScore: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      mobergScore: {
        enabled: false,
        handSide: 'Left Hand', // Left Hand, Right Hand
        fromScore: '',
        toScore: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      additionalBalanceGoal: {
        enabled: false,
        goalText: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      }
    },

    // SECTION 5: STRENGTH/ROM/ACTIVITY TOLERANCE - 5 predefined
    strengthROMActivityTolerance: {
      increaseStrength: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      improveROM: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      increaseEndurance: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      improveCoordination: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      reduceFatigue: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      }
    },

    // SECTION 6: PAIN - 2 goals
    painGoals: {
      reducePainLevel: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      improvePainManagement: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      }
    },

    // SECTION 7: HOME PROGRAM/HEP - 5 goals
    homeProgramHEP: {
      demonstrateHEPExercises: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      completeHEPIndependently: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      educationSafetyPrecautions: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      modifyHEPProgression: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      equipmentUsage: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      }
    },

    // SECTION 8: ADDITIONAL FUNCTIONAL GOALS - 1 goal
    additionalFunctional: {
      functionalImprovement: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      }
    },

    // SECTION 9: DISEASE SPECIFIC GOALS - 5 goals
    diseaseSpecific: {
      strokeRecovery: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      orthopedicRecovery: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      cardiacConditioning: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      pulmonaryImprovement: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      },
      neurologicalAdaptation: {
        enabled: false,
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      }
    }
  });

  // Cargar datos cuando cambie la prop data
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setFormData(prevData => ({
        ...prevData,
        ...data
      }));
    }
  }, [data]);

  // Manejar cambios en el formulario
  const handleChange = (section, field, value, subfield = null) => {
    let updatedData = { ...formData };
    
    if (subfield) {
      updatedData[section][field][subfield] = value;
    } else {
      if (typeof updatedData[section][field] === 'object' && !Array.isArray(updatedData[section][field])) {
        updatedData[section][field] = { ...updatedData[section][field], ...value };
      } else {
        updatedData[section][field] = value;
      }
    }
    
    setFormData(updatedData);
    if (onChange) {
      onChange(updatedData);
    }
  };

  // Update all goals with new durations
  const updateAllGoals = () => {
    const updatedData = { ...formData };
    const stgDuration = formData.goalDurations.stgCompletedBy;
    const ltgDuration = formData.goalDurations.ltgCompletedBy;
    
    // Update all goal durations across all sections
    Object.keys(updatedData).forEach(sectionKey => {
      if (sectionKey !== 'goalDurations' && typeof updatedData[sectionKey] === 'object') {
        Object.keys(updatedData[sectionKey]).forEach(goalKey => {
          if (typeof updatedData[sectionKey][goalKey] === 'object' && updatedData[sectionKey][goalKey].duration !== undefined) {
            // For this implementation, we'll use LTG duration for long term goals
            updatedData[sectionKey][goalKey].duration = ltgDuration;
          }
        });
      }
    });
    
    setFormData(updatedData);
    if (onChange) {
      onChange(updatedData);
    }
  };

  // Add additional goal to a section
  const addAdditionalGoal = (sectionKey, maxGoals = 10) => {
    const currentAdditionalGoals = formData[sectionKey].additionalGoals || [];
    if (currentAdditionalGoals.length < maxGoals) {
      const newGoal = {
        id: Date.now(),
        enabled: false,
        goalText: '',
        startingDate: visitDate || new Date().toISOString().split('T')[0],
        duration: ''
      };
      
      handleChange(sectionKey, 'additionalGoals', [...currentAdditionalGoals, newGoal]);
    }
  };

  // Remove additional goal
  const removeAdditionalGoal = (sectionKey, goalId) => {
    const currentAdditionalGoals = formData[sectionKey].additionalGoals || [];
    const filteredGoals = currentAdditionalGoals.filter(goal => goal.id !== goalId);
    handleChange(sectionKey, 'additionalGoals', filteredGoals);
  };

  // Toggle goal enabled state
  const toggleGoalEnabled = (section, goalKey) => {
    const currentValue = formData[section][goalKey].enabled;
    handleChange(section, goalKey, { enabled: !currentValue });
  };

  // Get total enabled goals count
  const getTotalEnabledGoals = () => {
    let count = 0;
    Object.keys(formData).forEach(sectionKey => {
      if (sectionKey !== 'goalDurations' && typeof formData[sectionKey] === 'object') {
        Object.keys(formData[sectionKey]).forEach(goalKey => {
          if (typeof formData[sectionKey][goalKey] === 'object' && formData[sectionKey][goalKey].enabled) {
            count++;
          }
        });
        // Count additional goals
        if (formData[sectionKey].additionalGoals) {
          count += formData[sectionKey].additionalGoals.filter(goal => goal.enabled).length;
        }
      }
    });
    return count;
  };

  return (
    <div style={medicalStyles.container}>
      {/* Header */}
      <div style={medicalStyles.header}>
        <div style={medicalStyles.headerContent}>
          <div style={medicalStyles.titleGroup}>
            <h2 style={medicalStyles.sectionTitle}>
              <i className="fas fa-target" style={medicalStyles.sectionIcon}></i>
              Short & Long Term Goals
            </h2>
            <div style={medicalStyles.sectionBadge}>Most Important Section</div>
          </div>
          
          <div style={medicalStyles.headerStats}>
            <div style={medicalStyles.statItem}>
              <span style={medicalStyles.statValue}>{getTotalEnabledGoals()}</span>
              <span style={medicalStyles.statLabel}>Total Goals Active</span>
            </div>
            <div style={medicalStyles.statItem}>
              <span style={medicalStyles.statValue}>
                STG: {formData.goalDurations.stgCompletedBy ? `${formData.goalDurations.stgCompletedBy} Week${formData.goalDurations.stgCompletedBy > 1 ? 's' : ''}` : 'Not Set'}
              </span>
              <span style={medicalStyles.statLabel}>Short Term Goals</span>
            </div>
            <div style={medicalStyles.statItem}>
              <span style={medicalStyles.statValue}>
                LTG: {formData.goalDurations.ltgCompletedBy ? `${formData.goalDurations.ltgCompletedBy} Week${formData.goalDurations.ltgCompletedBy > 1 ? 's' : ''}` : 'Not Set'}
              </span>
              <span style={medicalStyles.statLabel}>Long Term Goals</span>
            </div>
          </div>
        </div>
      </div>

      <div style={medicalStyles.content}>
        {/* SECTION 1: New Goal Durations */}
        <div style={medicalStyles.durationSection}>
          <div style={medicalStyles.durationTitle}>
            <i className="fas fa-stopwatch"></i>
            1. New Goal Durations
          </div>
          <div style={{fontSize: '16px', color: '#4a5568', marginBottom: '20px'}}>
            Set completion timeframes for Short Term Goals (STG) and Long Term Goals (LTG)
          </div>

          <div style={medicalStyles.durationControls}>
            <div style={medicalStyles.durationItem}>
              <div style={medicalStyles.label}>
                <label htmlFor="stg-duration">STG Completed by:</label>
              </div>
              <div style={{marginTop: '10px'}}>
                <select
                  id="stg-duration"
                  style={medicalStyles.select}
                  value={formData.goalDurations.stgCompletedBy}
                  onChange={(e) => handleChange('goalDurations', 'stgCompletedBy', e.target.value)}
                >
                  <option value="">Select Duration</option>
                  {weekOptions.map(option => (
                    <option key={`stg-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button 
              className="update-button"
              onClick={updateAllGoals}
              disabled={!formData.goalDurations.stgCompletedBy}
            >
              Update
            </button>
          </div>

          <div style={medicalStyles.durationControls}>
            <div style={medicalStyles.durationItem}>
              <div style={medicalStyles.label}>
                <label htmlFor="ltg-duration">LTG Completed by:</label>
              </div>
              <div style={{marginTop: '10px'}}>
                <select
                  id="ltg-duration"
                  style={medicalStyles.select}
                  value={formData.goalDurations.ltgCompletedBy}
                  onChange={(e) => handleChange('goalDurations', 'ltgCompletedBy', e.target.value)}
                >
                  <option value="">Select Duration</option>
                  {weekOptions.map(option => (
                    <option key={`ltg-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button 
              style={medicalStyles.updateButton}
              onClick={updateAllGoals}
              disabled={!formData.goalDurations.ltgCompletedBy}
            >
              Update
            </button>
          </div>

          <div style={medicalStyles.updateNote}>
            <i className="fas fa-info-circle"></i>
            <strong>NOTE:</strong> Changing the dropdown or pressing the update button will update ALL goals. Any existing goals do not update unless this is performed.
          </div>
        </div>
      </div>

        {/* SECTION 2: ADL(S) Goals */}
        <div style={medicalStyles.goalsSection}>
          <div style={medicalStyles.adlHeader}>
            <div style={medicalStyles.sectionHeaderTitle}>
              <i className="fas fa-hand-holding-heart"></i>
              2. ADL(S) Goals
            </div>
            <div style={medicalStyles.goalsCounter}>
              Activities of Daily Living goals with assist levels and functional outcomes
            </div>
          </div>

          <div style={medicalStyles.goalsGrid}>
            {/* Self-feeding Goal */}
            <div style={medicalStyles.goalItem}>
              <div style={medicalStyles.goalControls}>
                <button 
                  style={medicalStyles.longTermButton}
                  onClick={() => toggleGoalEnabled('adlGoals', 'selfFeeding')}
                >
                  Long Term
                </button>
                <button 
                  style={medicalStyles.addStgButton}
                  onClick={() => toggleGoalEnabled('adlGoals', 'selfFeeding')}
                >
                  Add STG
                </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.adlGoals.selfFeeding.enabled ? 1 : 0.6,
              background: formData.adlGoals.selfFeeding.enabled 
                ? 'linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%)' 
                : 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%)'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to perform self-feeding w/
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.adlGoals.selfFeeding.assistLevel}
                  onChange={(e) => handleChange('adlGoals', 'selfFeeding', { assistLevel: e.target.value })}
                  disabled={!formData.adlGoals.selfFeeding.enabled}
                >
                  <option value="">Select Assist Level</option>
                  {assistLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                assist
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="(assist device/functional outcome)"
                  value={formData.adlGoals.selfFeeding.deviceOutcome}
                  onChange={(e) => handleChange('adlGoals', 'selfFeeding', { deviceOutcome: e.target.value })}
                  disabled={!formData.adlGoals.selfFeeding.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.adlGoals.selfFeeding.startingDate}
                    onChange={(e) => handleChange('adlGoals', 'selfFeeding', { startingDate: e.target.value })}
                    disabled={!formData.adlGoals.selfFeeding.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.adlGoals.selfFeeding.duration}
                    onChange={(e) => handleChange('adlGoals', 'selfFeeding', { duration: e.target.value })}
                    disabled={!formData.adlGoals.selfFeeding.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Upper Body Dressing Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('adlGoals', 'upperBodyDressing')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('adlGoals', 'upperBodyDressing')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.adlGoals.upperBodyDressing.enabled ? 1 : 0.6,
              background: formData.adlGoals.upperBodyDressing.enabled 
                ? 'linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%)' 
                : 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%)'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to perform upper body dressing w/
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.adlGoals.upperBodyDressing.assistLevel}
                  onChange={(e) => handleChange('adlGoals', 'upperBodyDressing', { assistLevel: e.target.value })}
                  disabled={!formData.adlGoals.upperBodyDressing.enabled}
                >
                  <option value="">Select Assist Level</option>
                  {assistLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                assist
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="(assist device/functional outcome)"
                  value={formData.adlGoals.upperBodyDressing.deviceOutcome}
                  onChange={(e) => handleChange('adlGoals', 'upperBodyDressing', { deviceOutcome: e.target.value })}
                  disabled={!formData.adlGoals.upperBodyDressing.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.adlGoals.upperBodyDressing.startingDate}
                    onChange={(e) => handleChange('adlGoals', 'upperBodyDressing', { startingDate: e.target.value })}
                    disabled={!formData.adlGoals.upperBodyDressing.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.adlGoals.upperBodyDressing.duration}
                    onChange={(e) => handleChange('adlGoals', 'upperBodyDressing', { duration: e.target.value })}
                    disabled={!formData.adlGoals.upperBodyDressing.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Body Dressing Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('adlGoals', 'lowerBodyDressing')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('adlGoals', 'lowerBodyDressing')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.adlGoals.lowerBodyDressing.enabled ? 1 : 0.6,
              background: formData.adlGoals.lowerBodyDressing.enabled 
                ? 'linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%)' 
                : 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%)'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to perform lower body dressing w/
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.adlGoals.lowerBodyDressing.assistLevel}
                  onChange={(e) => handleChange('adlGoals', 'lowerBodyDressing', { assistLevel: e.target.value })}
                  disabled={!formData.adlGoals.lowerBodyDressing.enabled}
                >
                  <option value="">Select Assist Level</option>
                  {assistLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                assist
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="(assist device/functional outcome)"
                  value={formData.adlGoals.lowerBodyDressing.deviceOutcome}
                  onChange={(e) => handleChange('adlGoals', 'lowerBodyDressing', { deviceOutcome: e.target.value })}
                  disabled={!formData.adlGoals.lowerBodyDressing.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.adlGoals.lowerBodyDressing.startingDate}
                    onChange={(e) => handleChange('adlGoals', 'lowerBodyDressing', { startingDate: e.target.value })}
                    disabled={!formData.adlGoals.lowerBodyDressing.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.adlGoals.lowerBodyDressing.duration}
                    onChange={(e) => handleChange('adlGoals', 'lowerBodyDressing', { duration: e.target.value })}
                    disabled={!formData.adlGoals.lowerBodyDressing.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Grooming Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('adlGoals', 'grooming')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('adlGoals', 'grooming')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.adlGoals.grooming.enabled ? 1 : 0.6,
              background: formData.adlGoals.grooming.enabled 
                ? 'linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%)' 
                : 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%)'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to perform grooming w/
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.adlGoals.grooming.assistLevel}
                  onChange={(e) => handleChange('adlGoals', 'grooming', { assistLevel: e.target.value })}
                  disabled={!formData.adlGoals.grooming.enabled}
                >
                  <option value="">Select Assist Level</option>
                  {assistLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                assist
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="(assist device/functional outcome)"
                  value={formData.adlGoals.grooming.deviceOutcome}
                  onChange={(e) => handleChange('adlGoals', 'grooming', { deviceOutcome: e.target.value })}
                  disabled={!formData.adlGoals.grooming.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.adlGoals.grooming.startingDate}
                    onChange={(e) => handleChange('adlGoals', 'grooming', { startingDate: e.target.value })}
                    disabled={!formData.adlGoals.grooming.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.adlGoals.grooming.duration}
                    onChange={(e) => handleChange('adlGoals', 'grooming', { duration: e.target.value })}
                    disabled={!formData.adlGoals.grooming.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bathing Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('adlGoals', 'bathing')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('adlGoals', 'bathing')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.adlGoals.bathing.enabled ? 1 : 0.6,
              background: formData.adlGoals.bathing.enabled ? '#e8f5e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to perform bathing w/
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.adlGoals.bathing.assistLevel}
                  onChange={(e) => handleChange('adlGoals', 'bathing', { assistLevel: e.target.value })}
                  disabled={!formData.adlGoals.bathing.enabled}
                >
                  <option value="">Select Assist Level</option>
                  {assistLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                assist
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="(assist device/functional outcome)"
                  value={formData.adlGoals.bathing.deviceOutcome}
                  onChange={(e) => handleChange('adlGoals', 'bathing', { deviceOutcome: e.target.value })}
                  disabled={!formData.adlGoals.bathing.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.adlGoals.bathing.startingDate}
                    onChange={(e) => handleChange('adlGoals', 'bathing', { startingDate: e.target.value })}
                    disabled={!formData.adlGoals.bathing.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.adlGoals.bathing.duration}
                    onChange={(e) => handleChange('adlGoals', 'bathing', { duration: e.target.value })}
                    disabled={!formData.adlGoals.bathing.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Custom ADL Task Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('adlGoals', 'customADLTask')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('adlGoals', 'customADLTask')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.adlGoals.customADLTask.enabled ? 1 : 0.6,
              background: formData.adlGoals.customADLTask.enabled ? '#e8f5e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to perform
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="(ADL Task)"
                  value={formData.adlGoals.customADLTask.taskName}
                  onChange={(e) => handleChange('adlGoals', 'customADLTask', { taskName: e.target.value })}
                  disabled={!formData.adlGoals.customADLTask.enabled}
                />
                w/
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.adlGoals.customADLTask.assistLevel}
                  onChange={(e) => handleChange('adlGoals', 'customADLTask', { assistLevel: e.target.value })}
                  disabled={!formData.adlGoals.customADLTask.enabled}
                >
                  <option value="">Select Assist Level</option>
                  {assistLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                assist
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="(assist device/functional outcome)"
                  value={formData.adlGoals.customADLTask.deviceOutcome}
                  onChange={(e) => handleChange('adlGoals', 'customADLTask', { deviceOutcome: e.target.value })}
                  disabled={!formData.adlGoals.customADLTask.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.adlGoals.customADLTask.startingDate}
                    onChange={(e) => handleChange('adlGoals', 'customADLTask', { startingDate: e.target.value })}
                    disabled={!formData.adlGoals.customADLTask.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.adlGoals.customADLTask.duration}
                    onChange={(e) => handleChange('adlGoals', 'customADLTask', { duration: e.target.value })}
                    disabled={!formData.adlGoals.customADLTask.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Independence/Compliance Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('adlGoals', 'independenceCompliance')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('adlGoals', 'independenceCompliance')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.adlGoals.independenceCompliance.enabled ? 1 : 0.6,
              background: formData.adlGoals.independenceCompliance.enabled ? '#e8f5e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.adlGoals.independenceCompliance.personType}
                  onChange={(e) => handleChange('adlGoals', 'independenceCompliance', { personType: e.target.value })}
                  disabled={!formData.adlGoals.independenceCompliance.enabled}
                >
                  <option value="Patient">Patient</option>
                  <option value="Caregiver">Caregiver</option>
                </select>
                will demonstrate independence/compliance w/ the following
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.adlGoals.independenceCompliance.complianceType}
                  onChange={(e) => handleChange('adlGoals', 'independenceCompliance', { complianceType: e.target.value })}
                  disabled={!formData.adlGoals.independenceCompliance.enabled}
                >
                  <option value="ADL Safety & Functions">ADL Safety & Functions</option>
                  <option value="Safe Patient Positioning">Safe Patient Positioning</option>
                  <option value="Pressure Relief Measures">Pressure Relief Measures</option>
                </select>
                w/
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.adlGoals.independenceCompliance.assistLevel}
                  onChange={(e) => handleChange('adlGoals', 'independenceCompliance', { assistLevel: e.target.value })}
                  disabled={!formData.adlGoals.independenceCompliance.enabled}
                >
                  <option value="">Select Assist Level</option>
                  {assistLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                assist.
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.adlGoals.independenceCompliance.startingDate}
                    onChange={(e) => handleChange('adlGoals', 'independenceCompliance', { startingDate: e.target.value })}
                    disabled={!formData.adlGoals.independenceCompliance.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.adlGoals.independenceCompliance.duration}
                    onChange={(e) => handleChange('adlGoals', 'independenceCompliance', { duration: e.target.value })}
                    disabled={!formData.adlGoals.independenceCompliance.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Additional ADL Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('adlGoals', 'additionalADLGoal')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('adlGoals', 'additionalADLGoal')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.adlGoals.additionalADLGoal.enabled ? 1 : 0.6,
              background: formData.adlGoals.additionalADLGoal.enabled ? '#e8f5e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>- Additional ADL Goal -</strong>
                <textarea 
                  style={medicalStyles.goalTextarea}
                  placeholder="Enter additional ADL goal description..."
                  value={formData.adlGoals.additionalADLGoal.goalText}
                  onChange={(e) => handleChange('adlGoals', 'additionalADLGoal', { goalText: e.target.value })}
                  disabled={!formData.adlGoals.additionalADLGoal.enabled}
                  rows="3"
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.adlGoals.additionalADLGoal.startingDate}
                    onChange={(e) => handleChange('adlGoals', 'additionalADLGoal', { startingDate: e.target.value })}
                    disabled={!formData.adlGoals.additionalADLGoal.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.adlGoals.additionalADLGoal.duration}
                    onChange={(e) => handleChange('adlGoals', 'additionalADLGoal', { duration: e.target.value })}
                    disabled={!formData.adlGoals.additionalADLGoal.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Additional ADL Goals (Dynamic) */}
          {formData.adlGoals.additionalGoals && formData.adlGoals.additionalGoals.map((goal, index) => (
            <div key={goal.id} style={medicalStyles.goalItem}>
              <div style={medicalStyles.goalControls}>
                <button 
                  style={medicalStyles.longTermButton}
                  onClick={() => {
                    const updatedGoals = [...formData.adlGoals.additionalGoals];
                    updatedGoals[index].enabled = !updatedGoals[index].enabled;
                    handleChange('adlGoals', 'additionalGoals', updatedGoals);
                  }}
                >
                  Long Term
                </button>
                <button 
                  style={medicalStyles.addStgButton}
                  onClick={() => {
                    const updatedGoals = [...formData.adlGoals.additionalGoals];
                    updatedGoals[index].enabled = !updatedGoals[index].enabled;
                    handleChange('adlGoals', 'additionalGoals', updatedGoals);
                  }}
                >
                  Add STG
                </button>
                <button 
                  className="remove-goal-button"
                  onClick={() => removeAdditionalGoal('adlGoals', goal.id)}
                  title="Remove Goal"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div style={{
                ...medicalStyles.goalContent,
                opacity: goal.enabled ? 1 : 0.6,
                background: goal.enabled ? '#e8f5e8' : '#f5f5f5'
              }}>
                <div style={medicalStyles.goalText}>
                  <strong>- Additional ADL Goal -</strong>
                  <textarea 
                    style={medicalStyles.goalTextarea}
                    placeholder="Enter additional ADL goal description..."
                    value={goal.goalText}
                    onChange={(e) => {
                      const updatedGoals = [...formData.adlGoals.additionalGoals];
                      updatedGoals[index].goalText = e.target.value;
                      handleChange('adlGoals', 'additionalGoals', updatedGoals);
                    }}
                    disabled={!goal.enabled}
                    rows="3"
                  />
                </div>
                
                <div style={medicalStyles.goalMetadata}>
                  <div style={medicalStyles.metadataRow}>
                    <label>Starting:</label>
                    <input 
                      type="date"
                      value={goal.startingDate}
                      onChange={(e) => {
                        const updatedGoals = [...formData.adlGoals.additionalGoals];
                        updatedGoals[index].startingDate = e.target.value;
                        handleChange('adlGoals', 'additionalGoals', updatedGoals);
                      }}
                      disabled={!goal.enabled}
                    />
                    <label>Duration:</label>
                    <select
                      value={goal.duration}
                      onChange={(e) => {
                        const updatedGoals = [...formData.adlGoals.additionalGoals];
                        updatedGoals[index].duration = e.target.value;
                        handleChange('adlGoals', 'additionalGoals', updatedGoals);
                      }}
                      disabled={!goal.enabled}
                    >
                      <option value="">Select Duration</option>
                      {weekOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Additional Button for ADL */}
          <div className="add-additional-container">
            <button 
              className="add-additional-button"
              onClick={() => addAdditionalGoal('adlGoals', 10)}
              disabled={(formData.adlGoals.additionalGoals || []).length >= 10}
            >
              <i className="fas fa-plus"></i>
              Add Additional ADL Goal ({(formData.adlGoals.additionalGoals || []).length}/10)
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: TRANSFERS Goals */}
      <div className="goals-category">
        <div className="category-header">
          <div className="category-title">
            <i className="fas fa-exchange-alt"></i>
            <span>3. TRANSFERS Goals</span>
          </div>
          <div className="category-description">
            Transfer and mobility goals with assistive devices and functional outcomes
          </div>
        </div>

        <div className="goals-container">
          {/* Bed Mobility Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('transferGoals', 'bedMobility')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('transferGoals', 'bedMobility')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.transferGoals.bedMobility.enabled ? 1 : 0.6,
              background: formData.transferGoals.bedMobility.enabled ? '#e8f4f8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to perform all bed mobility with
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.transferGoals.bedMobility.assistLevel}
                  onChange={(e) => handleChange('transferGoals', 'bedMobility', { assistLevel: e.target.value })}
                  disabled={!formData.transferGoals.bedMobility.enabled}
                >
                  <option value="">Select Assist Level</option>
                  {assistLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                assist using
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="assistive device"
                  value={formData.transferGoals.bedMobility.assistiveDevice}
                  onChange={(e) => handleChange('transferGoals', 'bedMobility', { assistiveDevice: e.target.value })}
                  disabled={!formData.transferGoals.bedMobility.enabled}
                />
                to ensure safe and functional mobility
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="(optional functional outcome)"
                  value={formData.transferGoals.bedMobility.functionalOutcome}
                  onChange={(e) => handleChange('transferGoals', 'bedMobility', { functionalOutcome: e.target.value })}
                  disabled={!formData.transferGoals.bedMobility.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.transferGoals.bedMobility.startingDate}
                    onChange={(e) => handleChange('transferGoals', 'bedMobility', { startingDate: e.target.value })}
                    disabled={!formData.transferGoals.bedMobility.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.transferGoals.bedMobility.duration}
                    onChange={(e) => handleChange('transferGoals', 'bedMobility', { duration: e.target.value })}
                    disabled={!formData.transferGoals.bedMobility.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* General Transfers Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('transferGoals', 'transfers')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('transferGoals', 'transfers')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.transferGoals.transfers.enabled ? 1 : 0.6,
              background: formData.transferGoals.transfers.enabled ? '#e8f4f8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to perform
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.transferGoals.transfers.transferType}
                  onChange={(e) => handleChange('transferGoals', 'transfers', { transferType: e.target.value })}
                  disabled={!formData.transferGoals.transfers.enabled}
                >
                  <option value="Bed">Bed</option>
                  <option value="Chair">Chair</option>
                  <option value="Wheelchair">Wheelchair</option>
                  <option value="Toilet">Toilet</option>
                </select>
                transfer(s) w/
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.transferGoals.transfers.assistLevel}
                  onChange={(e) => handleChange('transferGoals', 'transfers', { assistLevel: e.target.value })}
                  disabled={!formData.transferGoals.transfers.enabled}
                >
                  <option value="">Select Assist Level</option>
                  {assistLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                assist using
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="assistive device"
                  value={formData.transferGoals.transfers.assistiveDevice}
                  onChange={(e) => handleChange('transferGoals', 'transfers', { assistiveDevice: e.target.value })}
                  disabled={!formData.transferGoals.transfers.enabled}
                />
                in order to ensure safe and functional transfer(s)
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="(optional functional outcome)"
                  value={formData.transferGoals.transfers.functionalOutcome}
                  onChange={(e) => handleChange('transferGoals', 'transfers', { functionalOutcome: e.target.value })}
                  disabled={!formData.transferGoals.transfers.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.transferGoals.transfers.startingDate}
                    onChange={(e) => handleChange('transferGoals', 'transfers', { startingDate: e.target.value })}
                    disabled={!formData.transferGoals.transfers.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.transferGoals.transfers.duration}
                    onChange={(e) => handleChange('transferGoals', 'transfers', { duration: e.target.value })}
                    disabled={!formData.transferGoals.transfers.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tub/Shower Transfers Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('transferGoals', 'tubShowerTransfers')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('transferGoals', 'tubShowerTransfers')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.transferGoals.tubShowerTransfers.enabled ? 1 : 0.6,
              background: formData.transferGoals.tubShowerTransfers.enabled ? '#e8f4f8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to perform
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.transferGoals.tubShowerTransfers.transferType}
                  onChange={(e) => handleChange('transferGoals', 'tubShowerTransfers', { transferType: e.target.value })}
                  disabled={!formData.transferGoals.tubShowerTransfers.enabled}
                >
                  <option value="Tub">Tub</option>
                  <option value="Shower">Shower</option>
                </select>
                transfer(s) w/
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.transferGoals.tubShowerTransfers.assistLevel}
                  onChange={(e) => handleChange('transferGoals', 'tubShowerTransfers', { assistLevel: e.target.value })}
                  disabled={!formData.transferGoals.tubShowerTransfers.enabled}
                >
                  <option value="">Select Assist Level</option>
                  {assistLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                assist using
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="assistive device"
                  value={formData.transferGoals.tubShowerTransfers.assistiveDevice}
                  onChange={(e) => handleChange('transferGoals', 'tubShowerTransfers', { assistiveDevice: e.target.value })}
                  disabled={!formData.transferGoals.tubShowerTransfers.enabled}
                />
                in order to ensure safe and functional transfer(s)
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="(optional functional outcome)"
                  value={formData.transferGoals.tubShowerTransfers.functionalOutcome}
                  onChange={(e) => handleChange('transferGoals', 'tubShowerTransfers', { functionalOutcome: e.target.value })}
                  disabled={!formData.transferGoals.tubShowerTransfers.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.transferGoals.tubShowerTransfers.startingDate}
                    onChange={(e) => handleChange('transferGoals', 'tubShowerTransfers', { startingDate: e.target.value })}
                    disabled={!formData.transferGoals.tubShowerTransfers.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.transferGoals.tubShowerTransfers.duration}
                    onChange={(e) => handleChange('transferGoals', 'tubShowerTransfers', { duration: e.target.value })}
                    disabled={!formData.transferGoals.tubShowerTransfers.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Transfer Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('transferGoals', 'additionalTransferGoal')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('transferGoals', 'additionalTransferGoal')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.transferGoals.additionalTransferGoal.enabled ? 1 : 0.6,
              background: formData.transferGoals.additionalTransferGoal.enabled ? '#e8f4f8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Additional Transfer Goal</strong>
                <textarea 
                  style={medicalStyles.goalTextarea}
                  placeholder="Enter additional transfer goal description..."
                  value={formData.transferGoals.additionalTransferGoal.goalText}
                  onChange={(e) => handleChange('transferGoals', 'additionalTransferGoal', { goalText: e.target.value })}
                  disabled={!formData.transferGoals.additionalTransferGoal.enabled}
                  rows="3"
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.transferGoals.additionalTransferGoal.startingDate}
                    onChange={(e) => handleChange('transferGoals', 'additionalTransferGoal', { startingDate: e.target.value })}
                    disabled={!formData.transferGoals.additionalTransferGoal.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.transferGoals.additionalTransferGoal.duration}
                    onChange={(e) => handleChange('transferGoals', 'additionalTransferGoal', { duration: e.target.value })}
                    disabled={!formData.transferGoals.additionalTransferGoal.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Additional Button for Transfers */}
        <div className="add-additional-container">
          <button 
            className="add-additional-button"
            onClick={() => addAdditionalGoal('transferGoals', 10)}
            disabled={(formData.transferGoals.additionalGoals || []).length >= 10}
          >
            <i className="fas fa-plus"></i>
            Add Additional Transfer Goal ({(formData.transferGoals.additionalGoals || []).length}/10)
          </button>
        </div>
      </div>

      {/* SECTION 4: BALANCE Goals */}
      <div className="goals-category">
        <div className="category-header">
          <div className="category-title">
            <i className="fas fa-balance-scale"></i>
            <span>4. Balance Goals</span>
          </div>
          <div className="category-description">
            Balance, coordination, posture and assessment score improvement goals
          </div>
        </div>

        <div className="goals-container">
          {/* Static/Dynamic Balance Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'staticDynamicBalance')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'staticDynamicBalance')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.balanceGoals.staticDynamicBalance.enabled ? 1 : 0.6,
              background: formData.balanceGoals.staticDynamicBalance.enabled ? '#f0e8f8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to increase
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.balanceGoals.staticDynamicBalance.balanceType}
                  onChange={(e) => handleChange('balanceGoals', 'staticDynamicBalance', { balanceType: e.target.value })}
                  disabled={!formData.balanceGoals.staticDynamicBalance.enabled}
                >
                  <option value="Sitting Static">Sitting Static</option>
                  <option value="Sitting Dynamic">Sitting Dynamic</option>
                  <option value="Standing Static">Standing Static</option>
                  <option value="Standing Dynamic">Standing Dynamic</option>
                </select>
                balance to
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.balanceGoals.staticDynamicBalance.grade}
                  onChange={(e) => handleChange('balanceGoals', 'staticDynamicBalance', { grade: e.target.value })}
                  disabled={!formData.balanceGoals.staticDynamicBalance.enabled}
                >
                  <option value="">Select Grade</option>
                  {balanceGrades.map(grade => (
                    <option key={grade.value} value={grade.value}>{grade.label}</option>
                  ))}
                </select>
                to ensure safe functional
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="functional outcome"
                  value={formData.balanceGoals.staticDynamicBalance.functionalOutcome}
                  onChange={(e) => handleChange('balanceGoals', 'staticDynamicBalance', { functionalOutcome: e.target.value })}
                  disabled={!formData.balanceGoals.staticDynamicBalance.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.balanceGoals.staticDynamicBalance.startingDate}
                    onChange={(e) => handleChange('balanceGoals', 'staticDynamicBalance', { startingDate: e.target.value })}
                    disabled={!formData.balanceGoals.staticDynamicBalance.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.balanceGoals.staticDynamicBalance.duration}
                    onChange={(e) => handleChange('balanceGoals', 'staticDynamicBalance', { duration: e.target.value })}
                    disabled={!formData.balanceGoals.staticDynamicBalance.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Coordination Improvement Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'coordinationImprovement')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'coordinationImprovement')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.balanceGoals.coordinationImprovement.enabled ? 1 : 0.6,
              background: formData.balanceGoals.coordinationImprovement.enabled ? '#f0e8f8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to improve
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="coordination type"
                  value={formData.balanceGoals.coordinationImprovement.coordinationType}
                  onChange={(e) => handleChange('balanceGoals', 'coordinationImprovement', { coordinationType: e.target.value })}
                  disabled={!formData.balanceGoals.coordinationImprovement.enabled}
                />
                - coordination for
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="activity"
                  value={formData.balanceGoals.coordinationImprovement.activity}
                  onChange={(e) => handleChange('balanceGoals', 'coordinationImprovement', { activity: e.target.value })}
                  disabled={!formData.balanceGoals.coordinationImprovement.enabled}
                />
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="outcome"
                  value={formData.balanceGoals.coordinationImprovement.outcome}
                  onChange={(e) => handleChange('balanceGoals', 'coordinationImprovement', { outcome: e.target.value })}
                  disabled={!formData.balanceGoals.coordinationImprovement.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.balanceGoals.coordinationImprovement.startingDate}
                    onChange={(e) => handleChange('balanceGoals', 'coordinationImprovement', { startingDate: e.target.value })}
                    disabled={!formData.balanceGoals.coordinationImprovement.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.balanceGoals.coordinationImprovement.duration}
                    onChange={(e) => handleChange('balanceGoals', 'coordinationImprovement', { duration: e.target.value })}
                    disabled={!formData.balanceGoals.coordinationImprovement.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Posture Improvement Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'postureImprovement')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'postureImprovement')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.balanceGoals.postureImprovement.enabled ? 1 : 0.6,
              background: formData.balanceGoals.postureImprovement.enabled ? '#f0e8f8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                Patient will exhibit
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.balanceGoals.postureImprovement.grade}
                  onChange={(e) => handleChange('balanceGoals', 'postureImprovement', { grade: e.target.value })}
                  disabled={!formData.balanceGoals.postureImprovement.enabled}
                >
                  <option value="">Select Grade</option>
                  {balanceGrades.map(grade => (
                    <option key={grade.value} value={grade.value}>{grade.label}</option>
                  ))}
                </select>
                posture in
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.balanceGoals.postureImprovement.position}
                  onChange={(e) => handleChange('balanceGoals', 'postureImprovement', { position: e.target.value })}
                  disabled={!formData.balanceGoals.postureImprovement.enabled}
                >
                  <option value="Standing">Standing</option>
                  <option value="Sitting">Sitting</option>
                </select>
                in order to
                <input 
                  type="text"
                  style={medicalStyles.inlineInput}
                  placeholder="(functional outcome)"
                  value={formData.balanceGoals.postureImprovement.functionalOutcome}
                  onChange={(e) => handleChange('balanceGoals', 'postureImprovement', { functionalOutcome: e.target.value })}
                  disabled={!formData.balanceGoals.postureImprovement.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.balanceGoals.postureImprovement.startingDate}
                    onChange={(e) => handleChange('balanceGoals', 'postureImprovement', { startingDate: e.target.value })}
                    disabled={!formData.balanceGoals.postureImprovement.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.balanceGoals.postureImprovement.duration}
                    onChange={(e) => handleChange('balanceGoals', 'postureImprovement', { duration: e.target.value })}
                    disabled={!formData.balanceGoals.postureImprovement.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tinetti Score Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'tinettiScore')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'tinettiScore')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.balanceGoals.tinettiScore.enabled ? 1 : 0.6,
              background: formData.balanceGoals.tinettiScore.enabled ? '#f0e8f8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to demonstrate improvement in Tinetti score: from
                <input 
                  type="text"
                  style={{...medicalStyles.inlineInput, width: '60px'}}
                  placeholder="(score)"
                  value={formData.balanceGoals.tinettiScore.fromScore}
                  onChange={(e) => handleChange('balanceGoals', 'tinettiScore', { fromScore: e.target.value })}
                  disabled={!formData.balanceGoals.tinettiScore.enabled}
                />
                to
                <input 
                  type="text"
                  style={{...medicalStyles.inlineInput, width: '60px'}}
                  placeholder="(score)"
                  value={formData.balanceGoals.tinettiScore.toScore}
                  onChange={(e) => handleChange('balanceGoals', 'tinettiScore', { toScore: e.target.value })}
                  disabled={!formData.balanceGoals.tinettiScore.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.balanceGoals.tinettiScore.startingDate}
                    onChange={(e) => handleChange('balanceGoals', 'tinettiScore', { startingDate: e.target.value })}
                    disabled={!formData.balanceGoals.tinettiScore.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.balanceGoals.tinettiScore.duration}
                    onChange={(e) => handleChange('balanceGoals', 'tinettiScore', { duration: e.target.value })}
                    disabled={!formData.balanceGoals.tinettiScore.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Berg Score Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'bergScore')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'bergScore')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.balanceGoals.bergScore.enabled ? 1 : 0.6,
              background: formData.balanceGoals.bergScore.enabled ? '#f0e8f8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to demonstrate improvement in Berg score: from
                <input 
                  type="text"
                  style={{...medicalStyles.inlineInput, width: '60px'}}
                  placeholder="(score)"
                  value={formData.balanceGoals.bergScore.fromScore}
                  onChange={(e) => handleChange('balanceGoals', 'bergScore', { fromScore: e.target.value })}
                  disabled={!formData.balanceGoals.bergScore.enabled}
                />
                to
                <input 
                  type="text"
                  style={{...medicalStyles.inlineInput, width: '60px'}}
                  placeholder="(score)"
                  value={formData.balanceGoals.bergScore.toScore}
                  onChange={(e) => handleChange('balanceGoals', 'bergScore', { toScore: e.target.value })}
                  disabled={!formData.balanceGoals.bergScore.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.balanceGoals.bergScore.startingDate}
                    onChange={(e) => handleChange('balanceGoals', 'bergScore', { startingDate: e.target.value })}
                    disabled={!formData.balanceGoals.bergScore.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.balanceGoals.bergScore.duration}
                    onChange={(e) => handleChange('balanceGoals', 'bergScore', { duration: e.target.value })}
                    disabled={!formData.balanceGoals.bergScore.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* TUG Score Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'tugScore')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'tugScore')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.balanceGoals.tugScore.enabled ? 1 : 0.6,
              background: formData.balanceGoals.tugScore.enabled ? '#f0e8f8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to demonstrate improvement in TUG score: from
                <input 
                  type="text"
                  style={{...medicalStyles.inlineInput, width: '60px'}}
                  placeholder="(score)"
                  value={formData.balanceGoals.tugScore.fromScore}
                  onChange={(e) => handleChange('balanceGoals', 'tugScore', { fromScore: e.target.value })}
                  disabled={!formData.balanceGoals.tugScore.enabled}
                />
                to
                <input 
                  type="text"
                  style={{...medicalStyles.inlineInput, width: '60px'}}
                  placeholder="(score)"
                  value={formData.balanceGoals.tugScore.toScore}
                  onChange={(e) => handleChange('balanceGoals', 'tugScore', { toScore: e.target.value })}
                  disabled={!formData.balanceGoals.tugScore.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.balanceGoals.tugScore.startingDate}
                    onChange={(e) => handleChange('balanceGoals', 'tugScore', { startingDate: e.target.value })}
                    disabled={!formData.balanceGoals.tugScore.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.balanceGoals.tugScore.duration}
                    onChange={(e) => handleChange('balanceGoals', 'tugScore', { duration: e.target.value })}
                    disabled={!formData.balanceGoals.tugScore.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Functional Reach Score Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'functionalReachScore')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'functionalReachScore')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.balanceGoals.functionalReachScore.enabled ? 1 : 0.6,
              background: formData.balanceGoals.functionalReachScore.enabled ? '#f0e8f8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to demonstrate improvement in Functional Reach score: from
                <input 
                  type="text"
                  style={{...medicalStyles.inlineInput, width: '60px'}}
                  placeholder="(score)"
                  value={formData.balanceGoals.functionalReachScore.fromScore}
                  onChange={(e) => handleChange('balanceGoals', 'functionalReachScore', { fromScore: e.target.value })}
                  disabled={!formData.balanceGoals.functionalReachScore.enabled}
                />
                to
                <input 
                  type="text"
                  style={{...medicalStyles.inlineInput, width: '60px'}}
                  placeholder="(score)"
                  value={formData.balanceGoals.functionalReachScore.toScore}
                  onChange={(e) => handleChange('balanceGoals', 'functionalReachScore', { toScore: e.target.value })}
                  disabled={!formData.balanceGoals.functionalReachScore.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.balanceGoals.functionalReachScore.startingDate}
                    onChange={(e) => handleChange('balanceGoals', 'functionalReachScore', { startingDate: e.target.value })}
                    disabled={!formData.balanceGoals.functionalReachScore.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.balanceGoals.functionalReachScore.duration}
                    onChange={(e) => handleChange('balanceGoals', 'functionalReachScore', { duration: e.target.value })}
                    disabled={!formData.balanceGoals.functionalReachScore.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Katz Score Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'katzScore')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'katzScore')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.balanceGoals.katzScore.enabled ? 1 : 0.6,
              background: formData.balanceGoals.katzScore.enabled ? '#f0e8f8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to demonstrate improvement in Katz score: from
                <input 
                  type="text"
                  style={{...medicalStyles.inlineInput, width: '60px'}}
                  placeholder="(score)"
                  value={formData.balanceGoals.katzScore.fromScore}
                  onChange={(e) => handleChange('balanceGoals', 'katzScore', { fromScore: e.target.value })}
                  disabled={!formData.balanceGoals.katzScore.enabled}
                />
                to
                <input 
                  type="text"
                  style={{...medicalStyles.inlineInput, width: '60px'}}
                  placeholder="(score)"
                  value={formData.balanceGoals.katzScore.toScore}
                  onChange={(e) => handleChange('balanceGoals', 'katzScore', { toScore: e.target.value })}
                  disabled={!formData.balanceGoals.katzScore.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.balanceGoals.katzScore.startingDate}
                    onChange={(e) => handleChange('balanceGoals', 'katzScore', { startingDate: e.target.value })}
                    disabled={!formData.balanceGoals.katzScore.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.balanceGoals.katzScore.duration}
                    onChange={(e) => handleChange('balanceGoals', 'katzScore', { duration: e.target.value })}
                    disabled={!formData.balanceGoals.katzScore.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Moberg Score Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'mobergScore')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'mobergScore')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.balanceGoals.mobergScore.enabled ? 1 : 0.6,
              background: formData.balanceGoals.mobergScore.enabled ? '#f0e8f8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                Patient to demonstrate improvement in Moberg score for
                <select 
                  style={medicalStyles.inlineSelect}
                  value={formData.balanceGoals.mobergScore.handSide}
                  onChange={(e) => handleChange('balanceGoals', 'mobergScore', { handSide: e.target.value })}
                  disabled={!formData.balanceGoals.mobergScore.enabled}
                >
                  <option value="Left Hand">Left Hand</option>
                  <option value="Right Hand">Right Hand</option>
                </select>
                : From
                <input 
                  type="text"
                  style={{...medicalStyles.inlineInput, width: '60px'}}
                  placeholder="(score)"
                  value={formData.balanceGoals.mobergScore.fromScore}
                  onChange={(e) => handleChange('balanceGoals', 'mobergScore', { fromScore: e.target.value })}
                  disabled={!formData.balanceGoals.mobergScore.enabled}
                />
                to
                <input 
                  type="text"
                  style={{...medicalStyles.inlineInput, width: '60px'}}
                  placeholder="(score)"
                  value={formData.balanceGoals.mobergScore.toScore}
                  onChange={(e) => handleChange('balanceGoals', 'mobergScore', { toScore: e.target.value })}
                  disabled={!formData.balanceGoals.mobergScore.enabled}
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.balanceGoals.mobergScore.startingDate}
                    onChange={(e) => handleChange('balanceGoals', 'mobergScore', { startingDate: e.target.value })}
                    disabled={!formData.balanceGoals.mobergScore.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.balanceGoals.mobergScore.duration}
                    onChange={(e) => handleChange('balanceGoals', 'mobergScore', { duration: e.target.value })}
                    disabled={!formData.balanceGoals.mobergScore.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Balance Goal */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'additionalBalanceGoal')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('balanceGoals', 'additionalBalanceGoal')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.balanceGoals.additionalBalanceGoal.enabled ? 1 : 0.6,
              background: formData.balanceGoals.additionalBalanceGoal.enabled ? '#f0e8f8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Additional Balance Goal</strong>
                <textarea 
                  style={medicalStyles.goalTextarea}
                  placeholder="Enter additional balance goal description..."
                  value={formData.balanceGoals.additionalBalanceGoal.goalText}
                  onChange={(e) => handleChange('balanceGoals', 'additionalBalanceGoal', { goalText: e.target.value })}
                  disabled={!formData.balanceGoals.additionalBalanceGoal.enabled}
                  rows="3"
                />
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.balanceGoals.additionalBalanceGoal.startingDate}
                    onChange={(e) => handleChange('balanceGoals', 'additionalBalanceGoal', { startingDate: e.target.value })}
                    disabled={!formData.balanceGoals.additionalBalanceGoal.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.balanceGoals.additionalBalanceGoal.duration}
                    onChange={(e) => handleChange('balanceGoals', 'additionalBalanceGoal', { duration: e.target.value })}
                    disabled={!formData.balanceGoals.additionalBalanceGoal.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECTION 5: STRENGTH/ROM/ACTIVITY TOLERANCE GOALS ==================== */}
      <div className="goals-section strength-rom-section">
        <div className="section-header-goals">
          <h3 className="section-title">
            <i className="fas fa-dumbbell"></i>
            5. STRENGTH/ROM/ACTIVITY TOLERANCE Goals
          </h3>
        </div>

        <div className="goals-grid">
          {/* Goal 1: Increase Strength */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('strengthROMActivityTolerance', 'increaseStrength')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('strengthROMActivityTolerance', 'increaseStrength')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.strengthROMActivityTolerance.increaseStrength.enabled ? 1 : 0.6,
              background: formData.strengthROMActivityTolerance.increaseStrength.enabled ? '#f8e8e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Strength Goal:</strong> Patient will increase strength in [muscle group] from [current level] to [target level] to improve functional mobility within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.strengthROMActivityTolerance.increaseStrength.startingDate}
                    onChange={(e) => handleChange('strengthROMActivityTolerance', 'increaseStrength', { startingDate: e.target.value })}
                    disabled={!formData.strengthROMActivityTolerance.increaseStrength.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.strengthROMActivityTolerance.increaseStrength.duration}
                    onChange={(e) => handleChange('strengthROMActivityTolerance', 'increaseStrength', { duration: e.target.value })}
                    disabled={!formData.strengthROMActivityTolerance.increaseStrength.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Goal 2: Improve ROM */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('strengthROMActivityTolerance', 'improveROM')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('strengthROMActivityTolerance', 'improveROM')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.strengthROMActivityTolerance.improveROM.enabled ? 1 : 0.6,
              background: formData.strengthROMActivityTolerance.improveROM.enabled ? '#f8e8e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>ROM Goal:</strong> Patient will improve range of motion in [joint] from [current ROM] to [target ROM] to enhance functional activities within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.strengthROMActivityTolerance.improveROM.startingDate}
                    onChange={(e) => handleChange('strengthROMActivityTolerance', 'improveROM', { startingDate: e.target.value })}
                    disabled={!formData.strengthROMActivityTolerance.improveROM.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.strengthROMActivityTolerance.improveROM.duration}
                    onChange={(e) => handleChange('strengthROMActivityTolerance', 'improveROM', { duration: e.target.value })}
                    disabled={!formData.strengthROMActivityTolerance.improveROM.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Goal 3: Increase Endurance */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('strengthROMActivityTolerance', 'increaseEndurance')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('strengthROMActivityTolerance', 'increaseEndurance')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.strengthROMActivityTolerance.increaseEndurance.enabled ? 1 : 0.6,
              background: formData.strengthROMActivityTolerance.increaseEndurance.enabled ? '#f8e8e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Activity Tolerance:</strong> Patient will increase activity tolerance from [current level] to [target level] to perform ADLs with [assist level] within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.strengthROMActivityTolerance.increaseEndurance.startingDate}
                    onChange={(e) => handleChange('strengthROMActivityTolerance', 'increaseEndurance', { startingDate: e.target.value })}
                    disabled={!formData.strengthROMActivityTolerance.increaseEndurance.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.strengthROMActivityTolerance.increaseEndurance.duration}
                    onChange={(e) => handleChange('strengthROMActivityTolerance', 'increaseEndurance', { duration: e.target.value })}
                    disabled={!formData.strengthROMActivityTolerance.increaseEndurance.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Goal 4: Improve Coordination */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('strengthROMActivityTolerance', 'improveCoordination')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('strengthROMActivityTolerance', 'improveCoordination')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.strengthROMActivityTolerance.improveCoordination.enabled ? 1 : 0.6,
              background: formData.strengthROMActivityTolerance.improveCoordination.enabled ? '#f8e8e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Coordination:</strong> Patient will improve fine/gross motor coordination to perform [specific task] with [assist level] within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.strengthROMActivityTolerance.improveCoordination.startingDate}
                    onChange={(e) => handleChange('strengthROMActivityTolerance', 'improveCoordination', { startingDate: e.target.value })}
                    disabled={!formData.strengthROMActivityTolerance.improveCoordination.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.strengthROMActivityTolerance.improveCoordination.duration}
                    onChange={(e) => handleChange('strengthROMActivityTolerance', 'improveCoordination', { duration: e.target.value })}
                    disabled={!formData.strengthROMActivityTolerance.improveCoordination.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Goal 5: Reduce Fatigue */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('strengthROMActivityTolerance', 'reduceFatigue')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('strengthROMActivityTolerance', 'reduceFatigue')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.strengthROMActivityTolerance.reduceFatigue.enabled ? 1 : 0.6,
              background: formData.strengthROMActivityTolerance.reduceFatigue.enabled ? '#f8e8e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Fatigue Management:</strong> Patient will demonstrate reduced fatigue during [activity] from [current duration] to [target duration] within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.strengthROMActivityTolerance.reduceFatigue.startingDate}
                    onChange={(e) => handleChange('strengthROMActivityTolerance', 'reduceFatigue', { startingDate: e.target.value })}
                    disabled={!formData.strengthROMActivityTolerance.reduceFatigue.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.strengthROMActivityTolerance.reduceFatigue.duration}
                    onChange={(e) => handleChange('strengthROMActivityTolerance', 'reduceFatigue', { duration: e.target.value })}
                    disabled={!formData.strengthROMActivityTolerance.reduceFatigue.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECTION 6: PAIN GOALS ==================== */}
      <div className="goals-section pain-section">
        <div className="section-header-goals">
          <h3 className="section-title">
            <i className="fas fa-exclamation-triangle"></i>
            6. PAIN Goals
          </h3>
        </div>

        <div className="goals-grid">
          {/* Goal 1: Reduce Pain Level */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('painGoals', 'reducePainLevel')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('painGoals', 'reducePainLevel')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.painGoals.reducePainLevel.enabled ? 1 : 0.6,
              background: formData.painGoals.reducePainLevel.enabled ? '#f8f0e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Pain Level Reduction:</strong> Patient will report pain level reduction from [current level]/10 to [target level]/10 on pain scale during [activity/rest] within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.painGoals.reducePainLevel.startingDate}
                    onChange={(e) => handleChange('painGoals', 'reducePainLevel', { startingDate: e.target.value })}
                    disabled={!formData.painGoals.reducePainLevel.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.painGoals.reducePainLevel.duration}
                    onChange={(e) => handleChange('painGoals', 'reducePainLevel', { duration: e.target.value })}
                    disabled={!formData.painGoals.reducePainLevel.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Goal 2: Improve Pain Management */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('painGoals', 'improvePainManagement')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('painGoals', 'improvePainManagement')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.painGoals.improvePainManagement.enabled ? 1 : 0.6,
              background: formData.painGoals.improvePainManagement.enabled ? '#f8f0e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Pain Management:</strong> Patient will demonstrate [number] pain management strategies to maintain pain at [target level]/10 or below during daily activities within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.painGoals.improvePainManagement.startingDate}
                    onChange={(e) => handleChange('painGoals', 'improvePainManagement', { startingDate: e.target.value })}
                    disabled={!formData.painGoals.improvePainManagement.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.painGoals.improvePainManagement.duration}
                    onChange={(e) => handleChange('painGoals', 'improvePainManagement', { duration: e.target.value })}
                    disabled={!formData.painGoals.improvePainManagement.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECTION 7: HOME PROGRAM/HEP GOALS ==================== */}
      <div className="goals-section home-program-section">
        <div className="section-header-goals">
          <h3 className="section-title">
            <i className="fas fa-home"></i>
            7. HOME PROGRAM/HEP Goals
          </h3>
        </div>

        <div className="goals-grid">
          {/* Goal 1: Demonstrate HEP Exercises */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('homeProgramHEP', 'demonstrateHEPExercises')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('homeProgramHEP', 'demonstrateHEPExercises')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.homeProgramHEP.demonstrateHEPExercises.enabled ? 1 : 0.6,
              background: formData.homeProgramHEP.demonstrateHEPExercises.enabled ? '#e8f8f4' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>HEP Exercise Demonstration:</strong> Patient/caregiver will demonstrate [number] HEP exercises with [assist level] and proper form within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.homeProgramHEP.demonstrateHEPExercises.startingDate}
                    onChange={(e) => handleChange('homeProgramHEP', 'demonstrateHEPExercises', { startingDate: e.target.value })}
                    disabled={!formData.homeProgramHEP.demonstrateHEPExercises.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.homeProgramHEP.demonstrateHEPExercises.duration}
                    onChange={(e) => handleChange('homeProgramHEP', 'demonstrateHEPExercises', { duration: e.target.value })}
                    disabled={!formData.homeProgramHEP.demonstrateHEPExercises.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Goal 2: Complete HEP Independently */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('homeProgramHEP', 'completeHEPIndependently')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('homeProgramHEP', 'completeHEPIndependently')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.homeProgramHEP.completeHEPIndependently.enabled ? 1 : 0.6,
              background: formData.homeProgramHEP.completeHEPIndependently.enabled ? '#e8f8f4' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>HEP Compliance:</strong> Patient will complete prescribed HEP independently [frequency] per [time period] with [compliance level]% compliance within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.homeProgramHEP.completeHEPIndependently.startingDate}
                    onChange={(e) => handleChange('homeProgramHEP', 'completeHEPIndependently', { startingDate: e.target.value })}
                    disabled={!formData.homeProgramHEP.completeHEPIndependently.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.homeProgramHEP.completeHEPIndependently.duration}
                    onChange={(e) => handleChange('homeProgramHEP', 'completeHEPIndependently', { duration: e.target.value })}
                    disabled={!formData.homeProgramHEP.completeHEPIndependently.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Goal 3: Education Safety Precautions */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('homeProgramHEP', 'educationSafetyPrecautions')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('homeProgramHEP', 'educationSafetyPrecautions')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.homeProgramHEP.educationSafetyPrecautions.enabled ? 1 : 0.6,
              background: formData.homeProgramHEP.educationSafetyPrecautions.enabled ? '#e8f8f4' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Safety Education:</strong> Patient/caregiver will verbalize [number] safety precautions and contraindications for HEP with [accuracy level]% accuracy within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.homeProgramHEP.educationSafetyPrecautions.startingDate}
                    onChange={(e) => handleChange('homeProgramHEP', 'educationSafetyPrecautions', { startingDate: e.target.value })}
                    disabled={!formData.homeProgramHEP.educationSafetyPrecautions.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.homeProgramHEP.educationSafetyPrecautions.duration}
                    onChange={(e) => handleChange('homeProgramHEP', 'educationSafetyPrecautions', { duration: e.target.value })}
                    disabled={!formData.homeProgramHEP.educationSafetyPrecautions.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Goal 4: Modify HEP Progression */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('homeProgramHEP', 'modifyHEPProgression')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('homeProgramHEP', 'modifyHEPProgression')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.homeProgramHEP.modifyHEPProgression.enabled ? 1 : 0.6,
              background: formData.homeProgramHEP.modifyHEPProgression.enabled ? '#e8f8f4' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>HEP Progression:</strong> Patient will demonstrate ability to progress/modify HEP exercises based on [criteria] with [assist level] within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.homeProgramHEP.modifyHEPProgression.startingDate}
                    onChange={(e) => handleChange('homeProgramHEP', 'modifyHEPProgression', { startingDate: e.target.value })}
                    disabled={!formData.homeProgramHEP.modifyHEPProgression.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.homeProgramHEP.modifyHEPProgression.duration}
                    onChange={(e) => handleChange('homeProgramHEP', 'modifyHEPProgression', { duration: e.target.value })}
                    disabled={!formData.homeProgramHEP.modifyHEPProgression.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Goal 5: Equipment Usage */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('homeProgramHEP', 'equipmentUsage')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('homeProgramHEP', 'equipmentUsage')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.homeProgramHEP.equipmentUsage.enabled ? 1 : 0.6,
              background: formData.homeProgramHEP.equipmentUsage.enabled ? '#e8f8f4' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Equipment Usage:</strong> Patient/caregiver will demonstrate proper use and care of [equipment] for HEP with [assist level] within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.homeProgramHEP.equipmentUsage.startingDate}
                    onChange={(e) => handleChange('homeProgramHEP', 'equipmentUsage', { startingDate: e.target.value })}
                    disabled={!formData.homeProgramHEP.equipmentUsage.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.homeProgramHEP.equipmentUsage.duration}
                    onChange={(e) => handleChange('homeProgramHEP', 'equipmentUsage', { duration: e.target.value })}
                    disabled={!formData.homeProgramHEP.equipmentUsage.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECTION 8: ADDITIONAL FUNCTIONAL GOALS ==================== */}
      <div className="goals-section additional-functional-section">
        <div className="section-header-goals">
          <h3 className="section-title">
            <i className="fas fa-plus-circle"></i>
            8. ADDITIONAL FUNCTIONAL Goals
          </h3>
        </div>

        <div className="goals-grid">
          {/* Goal 1: Functional Improvement */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('additionalFunctional', 'functionalImprovement')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('additionalFunctional', 'functionalImprovement')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.additionalFunctional.functionalImprovement.enabled ? 1 : 0.6,
              background: formData.additionalFunctional.functionalImprovement.enabled ? '#e8f0f8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Functional Performance:</strong> Patient will improve functional performance in [specific area] from [baseline level] to [target level] to enhance independence in [activity/environment] within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.additionalFunctional.functionalImprovement.startingDate}
                    onChange={(e) => handleChange('additionalFunctional', 'functionalImprovement', { startingDate: e.target.value })}
                    disabled={!formData.additionalFunctional.functionalImprovement.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.additionalFunctional.functionalImprovement.duration}
                    onChange={(e) => handleChange('additionalFunctional', 'functionalImprovement', { duration: e.target.value })}
                    disabled={!formData.additionalFunctional.functionalImprovement.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECTION 9: DISEASE SPECIFIC GOALS ==================== */}
      <div className="goals-section disease-specific-section">
        <div className="section-header-goals">
          <h3 className="section-title">
            <i className="fas fa-stethoscope"></i>
            9. DISEASE SPECIFIC Goals
          </h3>
        </div>

        <div className="goals-grid">
          {/* Goal 1: Stroke Recovery */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('diseaseSpecific', 'strokeRecovery')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('diseaseSpecific', 'strokeRecovery')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.diseaseSpecific.strokeRecovery.enabled ? 1 : 0.6,
              background: formData.diseaseSpecific.strokeRecovery.enabled ? '#f8f8e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Stroke Recovery:</strong> Patient will demonstrate improved [affected side] function with increased motor control and coordination to perform [specific task] with [assist level] within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.diseaseSpecific.strokeRecovery.startingDate}
                    onChange={(e) => handleChange('diseaseSpecific', 'strokeRecovery', { startingDate: e.target.value })}
                    disabled={!formData.diseaseSpecific.strokeRecovery.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.diseaseSpecific.strokeRecovery.duration}
                    onChange={(e) => handleChange('diseaseSpecific', 'strokeRecovery', { duration: e.target.value })}
                    disabled={!formData.diseaseSpecific.strokeRecovery.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Goal 2: Orthopedic Recovery */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('diseaseSpecific', 'orthopedicRecovery')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('diseaseSpecific', 'orthopedicRecovery')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.diseaseSpecific.orthopedicRecovery.enabled ? 1 : 0.6,
              background: formData.diseaseSpecific.orthopedicRecovery.enabled ? '#f8f8e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Orthopedic Recovery:</strong> Patient will achieve [percentage]% recovery of [joint/limb] function following [surgical procedure/injury] to return to [prior level of function/activity] within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.diseaseSpecific.orthopedicRecovery.startingDate}
                    onChange={(e) => handleChange('diseaseSpecific', 'orthopedicRecovery', { startingDate: e.target.value })}
                    disabled={!formData.diseaseSpecific.orthopedicRecovery.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.diseaseSpecific.orthopedicRecovery.duration}
                    onChange={(e) => handleChange('diseaseSpecific', 'orthopedicRecovery', { duration: e.target.value })}
                    disabled={!formData.diseaseSpecific.orthopedicRecovery.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Goal 3: Cardiac Conditioning */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('diseaseSpecific', 'cardiacConditioning')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('diseaseSpecific', 'cardiacConditioning')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.diseaseSpecific.cardiacConditioning.enabled ? 1 : 0.6,
              background: formData.diseaseSpecific.cardiacConditioning.enabled ? '#f8f8e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Cardiac Conditioning:</strong> Patient will improve cardiovascular endurance to tolerate [activity level] for [duration] while maintaining heart rate within target range ([range] bpm) within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.diseaseSpecific.cardiacConditioning.startingDate}
                    onChange={(e) => handleChange('diseaseSpecific', 'cardiacConditioning', { startingDate: e.target.value })}
                    disabled={!formData.diseaseSpecific.cardiacConditioning.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.diseaseSpecific.cardiacConditioning.duration}
                    onChange={(e) => handleChange('diseaseSpecific', 'cardiacConditioning', { duration: e.target.value })}
                    disabled={!formData.diseaseSpecific.cardiacConditioning.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Goal 4: Pulmonary Improvement */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('diseaseSpecific', 'pulmonaryImprovement')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('diseaseSpecific', 'pulmonaryImprovement')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.diseaseSpecific.pulmonaryImprovement.enabled ? 1 : 0.6,
              background: formData.diseaseSpecific.pulmonaryImprovement.enabled ? '#f8f8e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Pulmonary Rehabilitation:</strong> Patient will demonstrate improved respiratory function with [measurement improvement] to enhance activity tolerance for [specific activities] within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.diseaseSpecific.pulmonaryImprovement.startingDate}
                    onChange={(e) => handleChange('diseaseSpecific', 'pulmonaryImprovement', { startingDate: e.target.value })}
                    disabled={!formData.diseaseSpecific.pulmonaryImprovement.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.diseaseSpecific.pulmonaryImprovement.duration}
                    onChange={(e) => handleChange('diseaseSpecific', 'pulmonaryImprovement', { duration: e.target.value })}
                    disabled={!formData.diseaseSpecific.pulmonaryImprovement.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Goal 5: Neurological Adaptation */}
          <div style={medicalStyles.goalItem}>
            <div style={medicalStyles.goalControls}>
              <button 
                style={medicalStyles.longTermButton}
                onClick={() => toggleGoalEnabled('diseaseSpecific', 'neurologicalAdaptation')}
              >
                Long Term
              </button>
              <button 
                style={medicalStyles.addStgButton}
                onClick={() => toggleGoalEnabled('diseaseSpecific', 'neurologicalAdaptation')}
              >
                Add STG
              </button>
            </div>
            
            <div style={{
              ...medicalStyles.goalContent,
              opacity: formData.diseaseSpecific.neurologicalAdaptation.enabled ? 1 : 0.6,
              background: formData.diseaseSpecific.neurologicalAdaptation.enabled ? '#f8f8e8' : '#f5f5f5'
            }}>
              <div style={medicalStyles.goalText}>
                <strong>Neurological Adaptation:</strong> Patient will demonstrate neurological adaptation and compensation strategies to achieve [functional goal] with [assist level] despite [specific impairment] within [timeframe].
              </div>
              
              <div style={medicalStyles.goalMetadata}>
                <div style={medicalStyles.metadataRow}>
                  <label style={medicalStyles.metadataLabel}>Starting:</label>
                  <input 
                    type="date"
                    style={medicalStyles.dateInput}
                    value={formData.diseaseSpecific.neurologicalAdaptation.startingDate}
                    onChange={(e) => handleChange('diseaseSpecific', 'neurologicalAdaptation', { startingDate: e.target.value })}
                    disabled={!formData.diseaseSpecific.neurologicalAdaptation.enabled}
                  />
                  <label style={medicalStyles.metadataLabel}>Duration:</label>
                  <select
                    style={medicalStyles.select}
                    value={formData.diseaseSpecific.neurologicalAdaptation.duration}
                    onChange={(e) => handleChange('diseaseSpecific', 'neurologicalAdaptation', { duration: e.target.value })}
                    disabled={!formData.diseaseSpecific.neurologicalAdaptation.enabled}
                  >
                    <option value="">Select Duration</option>
                    {weekOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortLongTermGoalsSkillsSection;