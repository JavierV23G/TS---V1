// Enhanced PlanSection.jsx with Dynamic Content Detection for Finale
import React, { useState, useEffect } from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/PlanSection.scss';
import StandardizedTest from './StandardizedTest';

const PlanSection = ({ data, onChange }) => {
  // Estado local para manejar qué acordeón está expandido
  const [expandedSection, setExpandedSection] = useState('gait');
  
  // Estado para mantener valores globales de STG y LTG
  const [globalStgDuration, setGlobalStgDuration] = useState(data.stgDuration || '1');
  const [globalLtgDuration, setGlobalLtgDuration] = useState(data.ltgDuration || '3');
  
  // Opciones de asistencia consistentes para todos los dropdowns
  const assistLevelOptions = [
    { value: "I", label: "I (No Assist)" },
    { value: "MI", label: "MI (Uses Assistive Device)" },
    { value: "S", label: "S (Set up/Supervision)" },
    { value: "SBA", label: "SBA (Stand By Assist)" },
    { value: "MIN", label: "MIN (Requires 0-25% Assist)" },
    { value: "MOD", label: "MOD (Requires 26-50% Assist)" },
    { value: "MAX", label: "MAX (Requires 51-75% Assist)" },
    { value: "TOT", label: "TOT (Requires 76-99% Assist)" },
    { value: "DEP", label: "DEP (Requires 100% Assist)" },
    { value: "CGA", label: "CGA (Contact Guard Assist)" }
  ];
  
  // Opciones para Patient/Caregiver
  const personOptions = [
    { value: "Patient", label: "Patient" },
    { value: "Caregiver", label: "Caregiver" }
  ];
  
  // Formatear fechas para mostrar en las duraciones (ej: Week of MM/DD/YYYY)
  const formatWeekDate = (weeksToAdd) => {
    const startDate = new Date(data.evaluationDate || '2024-12-10'); // Usa fecha de evaluación o default
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + (weeksToAdd * 7));
    return `Week of ${targetDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}`;
  };
  
  // Generar opciones de duración basadas en la fecha de evaluación
  const generateDurationOptions = () => {
    const options = [];
    for (let i = 1; i <= 8; i++) {
      options.push({
        value: i.toString(),
        label: `${i} ${i === 1 ? 'Week' : 'Weeks'} (${formatWeekDate(i)})`
      });
    }
    return options;
  };
  
  const durationOptions = generateDurationOptions();
  
  // 🔥 FUNCIÓN PRINCIPAL PARA DETECTAR CONTENIDO Y ENVIAR A FINALE
  const detectAndSendContent = (updatedData) => {
    // Llamar al onChange original para mantener la funcionalidad
    onChange(updatedData);
    
    // Detectar contenido completado para Finale
    const detectedContent = detectPlanContent(updatedData);
    
    // Si hay contenido, enviarlo a la sección finale
    if (Object.keys(detectedContent).length > 0) {
      // El padre (VisitCompletionModal) se encargará de pasar esto a finale
      if (updatedData.onFinaleUpdate) {
        updatedData.onFinaleUpdate('plan', detectedContent);
      }
    }
  };

  // 🔥 FUNCIÓN PARA DETECTAR CONTENIDO COMPLETADO EN PLAN
  const detectPlanContent = (planData) => {
    const content = {};
    
    // Función helper para verificar si un valor tiene contenido
    const hasContent = (value) => {
      if (!value) return false;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        const emptyValues = ['', 'not provided', 'n/a', 'select an option', 'none', 'null', 'undefined', '0', 'no'];
        return trimmed.length > 0 && !emptyValues.includes(trimmed.toLowerCase());
      }
      if (typeof value === 'number') return value > 0;
      if (typeof value === 'boolean') return value === true;
      return false;
    };

    // 🔥 GOALS SECTION - ADL Goals
    const adlGoals = [];
    
    // Self-feeding goal
    if (planData.adlLongTerm1 && (
      hasContent(planData.adlSelfFeedingAssistLevel) || 
      hasContent(planData.adlSelfFeedingOutcome)
    )) {
      let goalText = "Patient to perform self-feeding";
      if (hasContent(planData.adlSelfFeedingAssistLevel)) {
        goalText += ` w/ ${planData.adlSelfFeedingAssistLevel} assist`;
      }
      if (hasContent(planData.adlSelfFeedingOutcome)) {
        goalText += ` ${planData.adlSelfFeedingOutcome}`;
      }
      if (hasContent(planData.adlSelfFeedingDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.adlSelfFeedingDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.adlSelfFeedingDuration})`;
      }
      adlGoals.push(goalText);
    }

    // Upper body dressing goal
    if (planData.adlLongTerm2 && (
      hasContent(planData.adlUpperDressingAssistLevel) || 
      hasContent(planData.adlUpperDressingOutcome)
    )) {
      let goalText = "Patient to perform upper body dressing";
      if (hasContent(planData.adlUpperDressingAssistLevel)) {
        goalText += ` w/ ${planData.adlUpperDressingAssistLevel} assist`;
      }
      if (hasContent(planData.adlUpperDressingOutcome)) {
        goalText += ` ${planData.adlUpperDressingOutcome}`;
      }
      if (hasContent(planData.adlUpperDressingDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.adlUpperDressingDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.adlUpperDressingDuration})`;
      }
      adlGoals.push(goalText);
    }

    // Lower body dressing goal
    if (planData.adlLongTerm3 && (
      hasContent(planData.adlLowerDressingAssistLevel) || 
      hasContent(planData.adlLowerDressingOutcome)
    )) {
      let goalText = "Patient to perform lower body dressing";
      if (hasContent(planData.adlLowerDressingAssistLevel)) {
        goalText += ` w/ ${planData.adlLowerDressingAssistLevel} assist`;
      }
      if (hasContent(planData.adlLowerDressingOutcome)) {
        goalText += ` ${planData.adlLowerDressingOutcome}`;
      }
      if (hasContent(planData.adlLowerDressingDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.adlLowerDressingDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.adlLowerDressingDuration})`;
      }
      adlGoals.push(goalText);
    }

    // Grooming goal
    if (planData.adlLongTerm4 && (
      hasContent(planData.adlGroomingAssistLevel) || 
      hasContent(planData.adlGroomingOutcome)
    )) {
      let goalText = "Patient to perform grooming";
      if (hasContent(planData.adlGroomingAssistLevel)) {
        goalText += ` w/ ${planData.adlGroomingAssistLevel} assist`;
      }
      if (hasContent(planData.adlGroomingOutcome)) {
        goalText += ` ${planData.adlGroomingOutcome}`;
      }
      if (hasContent(planData.adlGroomingDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.adlGroomingDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.adlGroomingDuration})`;
      }
      adlGoals.push(goalText);
    }

    // Bathing goal
    if (planData.adlLongTerm5 && (
      hasContent(planData.adlBathingAssistLevel) || 
      hasContent(planData.adlBathingOutcome)
    )) {
      let goalText = "Patient to perform bathing";
      if (hasContent(planData.adlBathingAssistLevel)) {
        goalText += ` w/ ${planData.adlBathingAssistLevel} assist`;
      }
      if (hasContent(planData.adlBathingOutcome)) {
        goalText += ` ${planData.adlBathingOutcome}`;
      }
      if (hasContent(planData.adlBathingDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.adlBathingDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.adlBathingDuration})`;
      }
      adlGoals.push(goalText);
    }

    // Custom ADL Task goal
    if (planData.adlLongTerm6 && (
      hasContent(planData.adlCustomTask) || 
      hasContent(planData.adlCustomTaskAssistLevel) || 
      hasContent(planData.adlCustomTaskOutcome)
    )) {
      let goalText = "Patient to perform";
      if (hasContent(planData.adlCustomTask)) {
        goalText += ` ${planData.adlCustomTask}`;
      } else {
        goalText += " ADL task";
      }
      if (hasContent(planData.adlCustomTaskAssistLevel)) {
        goalText += ` w/ ${planData.adlCustomTaskAssistLevel} assist`;
      }
      if (hasContent(planData.adlCustomTaskOutcome)) {
        goalText += ` ${planData.adlCustomTaskOutcome}`;
      }
      if (hasContent(planData.adlCustomTaskDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.adlCustomTaskDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.adlCustomTaskDuration})`;
      }
      adlGoals.push(goalText);
    }

    // ADL Safety goal
    if (planData.adlLongTerm7 && (
      hasContent(planData.adlSafetyPerson) || 
      hasContent(planData.adlSafetyFunction) || 
      hasContent(planData.adlSafetyAssistLevel)
    )) {
      let goalText = "";
      const person = planData.adlSafetyPerson || "Patient";
      goalText += `${person} will demonstrate independence/compliance w/ the following: `;
      const safetyFunction = planData.adlSafetyFunction || "ADL Safety & Functions";
      goalText += `${safetyFunction}`;
      if (hasContent(planData.adlSafetyAssistLevel)) {
        goalText += ` w/ ${planData.adlSafetyAssistLevel} assist`;
      }
      if (hasContent(planData.adlSafetyDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.adlSafetyDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.adlSafetyDuration})`;
      }
      adlGoals.push(goalText);
    }

    // Additional ADL Goal
    if (planData.adlLongTerm8 && hasContent(planData.additionalAdlGoalText)) {
      let goalText = planData.additionalAdlGoalText;
      if (hasContent(planData.additionalAdlGoalDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.additionalAdlGoalDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.additionalAdlGoalDuration})`;
      }
      adlGoals.push(goalText);
    }

    if (adlGoals.length > 0) {
      content['ADL Goals'] = adlGoals;
    }

    // 🔥 TRANSFERS GOALS
    const transferGoals = [];

    // Bed mobility goal
    if (planData.transferLongTerm1 && (
      hasContent(planData.transferBedMobilityAssistLevel) || 
      hasContent(planData.transferBedMobilityDevice) || 
      hasContent(planData.transferBedMobilityOutcome)
    )) {
      let goalText = "Patient to perform all bed mobility";
      if (hasContent(planData.transferBedMobilityAssistLevel)) {
        goalText += ` with ${planData.transferBedMobilityAssistLevel} assist`;
      }
      if (hasContent(planData.transferBedMobilityDevice)) {
        goalText += ` using ${planData.transferBedMobilityDevice} assistive device`;
      }
      goalText += " to ensure safe and functional mobility";
      if (hasContent(planData.transferBedMobilityOutcome)) {
        goalText += ` ${planData.transferBedMobilityOutcome}`;
      }
      if (hasContent(planData.transferBedMobilityDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.transferBedMobilityDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.transferBedMobilityDuration})`;
      }
      transferGoals.push(goalText);
    }

    // Transfer Type 1 goal
    if (planData.transferLongTerm2 && (
      hasContent(planData.transferType1) || 
      hasContent(planData.transferType1AssistLevel) || 
      hasContent(planData.transferType1Device)
    )) {
      let goalText = `Patient to perform ${planData.transferType1 || 'Bed'} transfer(s)`;
      if (hasContent(planData.transferType1AssistLevel)) {
        goalText += ` w/ ${planData.transferType1AssistLevel} assist`;
      }
      if (hasContent(planData.transferType1Device)) {
        goalText += ` using ${planData.transferType1Device} assistive device`;
      }
      goalText += " in order to ensure safe and functional transfer(s)";
      if (hasContent(planData.transferType1Outcome)) {
        goalText += ` ${planData.transferType1Outcome}`;
      }
      if (hasContent(planData.transferType1Duration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.transferType1Duration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.transferType1Duration})`;
      }
      transferGoals.push(goalText);
    }

    // Transfer Type 2 goal
    if (planData.transferLongTerm3 && (
      hasContent(planData.transferType2) || 
      hasContent(planData.transferType2AssistLevel) || 
      hasContent(planData.transferType2Device)
    )) {
      let goalText = `Patient to perform ${planData.transferType2 || 'Tub'} transfer(s)`;
      if (hasContent(planData.transferType2AssistLevel)) {
        goalText += ` w/ ${planData.transferType2AssistLevel} assist`;
      }
      if (hasContent(planData.transferType2Device)) {
        goalText += ` using ${planData.transferType2Device} assistive device`;
      }
      goalText += " in order to ensure safe functional transfer(s)";
      if (hasContent(planData.transferType2Outcome)) {
        goalText += ` ${planData.transferType2Outcome}`;
      }
      if (hasContent(planData.transferType2Duration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.transferType2Duration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.transferType2Duration})`;
      }
      transferGoals.push(goalText);
    }

    // Additional Transfer Goal
    if (planData.transferLongTerm4 && hasContent(planData.additionalTransferGoalText)) {
      let goalText = planData.additionalTransferGoalText;
      if (hasContent(planData.additionalTransferGoalDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.additionalTransferGoalDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.additionalTransferGoalDuration})`;
      }
      transferGoals.push(goalText);
    }

    if (transferGoals.length > 0) {
      content['Transfer Goals'] = transferGoals;
    }

    // 🔥 BALANCE GOALS
    const balanceGoals = [];

    // Balance Type 1 goal
    if (planData.balanceLongTerm1 && (
      hasContent(planData.balanceType1) || 
      hasContent(planData.balanceGrade1) || 
      hasContent(planData.balanceOutcome1)
    )) {
      let goalText = `Patient to increase ${planData.balanceType1 || 'Sitting Static'} balance`;
      if (hasContent(planData.balanceGrade1)) {
        goalText += ` to ${planData.balanceGrade1}`;
      }
      goalText += " to ensure safe functional";
      if (hasContent(planData.balanceOutcome1)) {
        goalText += ` ${planData.balanceOutcome1}`;
      }
      if (hasContent(planData.balanceDuration1)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.balanceDuration1);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.balanceDuration1})`;
      }
      balanceGoals.push(goalText);
    }

    // Balance improvement goal
    if (planData.balanceLongTerm2 && (
      hasContent(planData.balanceImproveActivity) || 
      hasContent(planData.balanceImproveFor) || 
      hasContent(planData.balanceImproveOutcome)
    )) {
      let goalText = "Patient to improve";
      if (hasContent(planData.balanceImproveActivity)) {
        goalText += ` ${planData.balanceImproveActivity}`;
      }
      goalText += " coordination for";
      if (hasContent(planData.balanceImproveFor)) {
        goalText += ` ${planData.balanceImproveFor}`;
      }
      goalText += " (activity)";
      if (hasContent(planData.balanceImproveOutcome)) {
        goalText += ` ${planData.balanceImproveOutcome}`;
      }
      if (hasContent(planData.balanceImproveDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.balanceImproveDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.balanceImproveDuration})`;
      }
      balanceGoals.push(goalText);
    }

    // Balance posture goal
    if (planData.balanceLongTerm3 && (
      hasContent(planData.balancePostureGrade) || 
      hasContent(planData.balancePosturePosition) || 
      hasContent(planData.balancePostureOutcome)
    )) {
      let goalText = `Patient will exhibit ${planData.balancePostureGrade || 'P-'} posture in ${planData.balancePosturePosition || 'Standing'} in order to`;
      if (hasContent(planData.balancePostureOutcome)) {
        goalText += ` ${planData.balancePostureOutcome}`;
      }
      goalText += " (functional outcome)";
      if (hasContent(planData.balancePostureDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.balancePostureDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.balancePostureDuration})`;
      }
      balanceGoals.push(goalText);
    }

    // Tinetti Score goal
    if (planData.balanceLongTerm4 && (
      hasContent(planData.tinettiScoreFrom) || 
      hasContent(planData.tinettiScoreTo)
    )) {
      let goalText = "Patient to demonstrate improvement in Tinetti score: from";
      if (hasContent(planData.tinettiScoreFrom)) {
        goalText += ` ${planData.tinettiScoreFrom} (score) to`;
      }
      if (hasContent(planData.tinettiScoreTo)) {
        goalText += ` ${planData.tinettiScoreTo} (score)`;
      }
      if (hasContent(planData.tinettiScoreDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.tinettiScoreDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.tinettiScoreDuration})`;
      }
      balanceGoals.push(goalText);
    }

    // Berg Score goal
    if (planData.balanceLongTerm5 && (
      hasContent(planData.bergScoreFrom) || 
      hasContent(planData.bergScoreTo)
    )) {
      let goalText = "Patient to demonstrate improvement in Berg score: from";
      if (hasContent(planData.bergScoreFrom)) {
        goalText += ` ${planData.bergScoreFrom} (score) to`;
      }
      if (hasContent(planData.bergScoreTo)) {
        goalText += ` ${planData.bergScoreTo} (score)`;
      }
      if (hasContent(planData.bergScoreDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.bergScoreDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.bergScoreDuration})`;
      }
      balanceGoals.push(goalText);
    }

    // TUG Score goal
    if (planData.balanceLongTerm6 && (
      hasContent(planData.tugScoreFrom) || 
      hasContent(planData.tugScoreTo)
    )) {
      let goalText = "Patient to demonstrate improvement in Tug score: from";
      if (hasContent(planData.tugScoreFrom)) {
        goalText += ` ${planData.tugScoreFrom} (score) to`;
      }
      if (hasContent(planData.tugScoreTo)) {
        goalText += ` ${planData.tugScoreTo} (score)`;
      }
      if (hasContent(planData.tugScoreDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.tugScoreDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.tugScoreDuration})`;
      }
      balanceGoals.push(goalText);
    }

    // Functional Reach Score goal
    if (planData.balanceLongTerm7 && (
      hasContent(planData.functionalReachScoreFrom) || 
      hasContent(planData.functionalReachScoreTo)
    )) {
      let goalText = "Patient to demonstrate improvement in Functional Reach score: from";
      if (hasContent(planData.functionalReachScoreFrom)) {
        goalText += ` ${planData.functionalReachScoreFrom} (score) to`;
      }
      if (hasContent(planData.functionalReachScoreTo)) {
        goalText += ` ${planData.functionalReachScoreTo} (score)`;
      }
      if (hasContent(planData.functionalReachScoreDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.functionalReachScoreDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.functionalReachScoreDuration})`;
      }
      balanceGoals.push(goalText);
    }

    // Katz Score goal
    if (planData.balanceLongTerm8 && (
      hasContent(planData.katzScoreFrom) || 
      hasContent(planData.katzScoreTo)
    )) {
      let goalText = "Patient to demonstrate improvement in Katz score: from";
      if (hasContent(planData.katzScoreFrom)) {
        goalText += ` ${planData.katzScoreFrom} (score) to`;
      }
      if (hasContent(planData.katzScoreTo)) {
        goalText += ` ${planData.katzScoreTo} (score)`;
      }
      if (hasContent(planData.katzScoreDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.katzScoreDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.katzScoreDuration})`;
      }
      balanceGoals.push(goalText);
    }

    // Moberg Score goal
    if (planData.balanceLongTerm9 && (
      hasContent(planData.mobergScoreHand) || 
      hasContent(planData.mobergScoreFrom) || 
      hasContent(planData.mobergScoreTo)
    )) {
      let goalText = `Patient to demonstrate improvement in Moberg score for ${planData.mobergScoreHand || 'Left Hand'}: from`;
      if (hasContent(planData.mobergScoreFrom)) {
        goalText += ` ${planData.mobergScoreFrom} (score) to`;
      }
      if (hasContent(planData.mobergScoreTo)) {
        goalText += ` ${planData.mobergScoreTo} (score)`;
      }
      if (hasContent(planData.mobergScoreDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.mobergScoreDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.mobergScoreDuration})`;
      }
      balanceGoals.push(goalText);
    }

    // Additional Balance Goal
    if (planData.balanceLongTerm10 && hasContent(planData.additionalBalanceGoalText)) {
      let goalText = planData.additionalBalanceGoalText;
      if (hasContent(planData.additionalBalanceGoalDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.additionalBalanceGoalDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.additionalBalanceGoalDuration})`;
      }
      balanceGoals.push(goalText);
    }

    if (balanceGoals.length > 0) {
      content['Balance Goals'] = balanceGoals;
    }

    // 🔥 STRENGTH/ROM/ACTIVITY TOLERANCE GOALS
    const strengthGoals = [];

    // Cardiopulmonary goal
    if (planData.strengthLongTerm1 && (
      hasContent(planData.cardioEvidenceBy) || 
      hasContent(planData.cardioOutcome)
    )) {
      let goalText = "Patient's cardiopulmonary status will improve as evidenced by";
      if (hasContent(planData.cardioEvidenceBy)) {
        goalText += ` ${planData.cardioEvidenceBy}`;
      }
      goalText += " in order to";
      if (hasContent(planData.cardioOutcome)) {
        goalText += ` ${planData.cardioOutcome}`;
      }
      goalText += " (functional outcome)";
      if (hasContent(planData.cardioDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.cardioDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.cardioDuration})`;
      }
      strengthGoals.push(goalText);
    }

    // ROM goal
    if (planData.strengthLongTerm2 && (
      hasContent(planData.romType) || 
      hasContent(planData.romBodyArea) || 
      hasContent(planData.romDegreesTo) || 
      hasContent(planData.romOutcome)
    )) {
      let goalText = `Patient to increase ${planData.romType || 'AROM'} of`;
      if (hasContent(planData.romBodyArea)) {
        goalText += ` ${planData.romBodyArea}`;
      }
      goalText += " (body area) to";
      if (hasContent(planData.romDegreesTo)) {
        goalText += ` ${planData.romDegreesTo}`;
      }
      goalText += " (degrees) to achieve";
      if (hasContent(planData.romOutcome)) {
        goalText += ` ${planData.romOutcome}`;
        }
      goalText += " (functional outcome)";
      if (hasContent(planData.romDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.romDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.romDuration})`;
      }
      strengthGoals.push(goalText);
    }

    // Strength goal
    if (planData.strengthLongTerm3 && (
      hasContent(planData.strengthBodyArea) || 
      hasContent(planData.strengthGrade) || 
      hasContent(planData.strengthAssistLevel) || 
      hasContent(planData.strengthWith) || 
      hasContent(planData.strengthOutcome)
    )) {
      let goalText = "Patient to increase strength of";
      if (hasContent(planData.strengthBodyArea)) {
        goalText += ` ${planData.strengthBodyArea}`;
      }
      goalText += " (body area) to/by";
      if (hasContent(planData.strengthGrade)) {
        goalText += ` ${planData.strengthGrade}`;
      }
      goalText += " (grade) in order to be";
      if (hasContent(planData.strengthAssistLevel)) {
        goalText += ` ${planData.strengthAssistLevel}`;
      }
      goalText += " assist";
      if (hasContent(planData.strengthWith)) {
        goalText += ` ${planData.strengthWith}`;
      }
      goalText += " to achieve";
      if (hasContent(planData.strengthOutcome)) {
        goalText += ` ${planData.strengthOutcome}`;
      }
      goalText += " (functional outcome)";
      if (hasContent(planData.strengthDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.strengthDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.strengthDuration})`;
      }
      strengthGoals.push(goalText);
    }

    // Fine motor skills goal
    if (planData.strengthLongTerm4 && hasContent(planData.fineMotorEvidenceBy)) {
      let goalText = `Patient will demonstrate improved fine motor skills as evidenced by ${planData.fineMotorEvidenceBy}`;
      if (hasContent(planData.fineMotorDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.fineMotorDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.fineMotorDuration})`;
      }
      strengthGoals.push(goalText);
    }

    // Additional Strength Goal
    if (planData.strengthLongTerm5 && hasContent(planData.additionalStrengthGoalText)) {
      let goalText = planData.additionalStrengthGoalText;
      if (hasContent(planData.additionalStrengthGoalDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.additionalStrengthGoalDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.additionalStrengthGoalDuration})`;
      }
      strengthGoals.push(goalText);
    }

    if (strengthGoals.length > 0) {
      content['Strength/ROM/Activity Tolerance Goals'] = strengthGoals;
    }

    // 🔥 PAIN GOALS
    const painGoals = [];

    // Pain scale goal
    if (planData.painLongTerm1 && (
      hasContent(planData.painPoints) || 
      hasContent(planData.painOutcome)
    )) {
      let goalText = "Patient's pain will decrease to";
      if (hasContent(planData.painPoints)) {
        goalText += ` ${planData.painPoints}`;
      }
      goalText += " points on the pain scale to achieve";
      if (hasContent(planData.painOutcome)) {
        goalText += ` ${planData.painOutcome}`;
      }
      goalText += " (functional outcome)";
      if (hasContent(planData.painDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.painDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.painDuration})`;
      }
      painGoals.push(goalText);
    }

    // Additional Pain Goals
    [1, 2, 3].forEach(num => {
      if (planData[`painLongTerm${num + 1}`] && hasContent(planData[`additionalPainGoalText${num}`])) {
        let goalText = planData[`additionalPainGoalText${num}`];
        if (hasContent(planData[`additionalPainGoalDuration${num}`])) {
          const durationOption = durationOptions.find(opt => opt.value === planData[`additionalPainGoalDuration${num}`]);
          goalText += ` (Duration: ${durationOption ? durationOption.label : planData[`additionalPainGoalDuration${num}`]})`;
        }
        painGoals.push(goalText);
      }
    });

    if (painGoals.length > 0) {
      content['Pain Goals'] = painGoals;
    }

    // 🔥 HOME PROGRAM/HEP GOALS
    const homeProgramGoals = [];

    // HEP Progress goal
    if (planData.homeProgramLongTerm1 && (
      hasContent(planData.homeProgramProgressPerson) || 
      hasContent(planData.homeProgramProgressOptional)
    )) {
      const person = planData.homeProgramProgressPerson || "Patient";
      let goalText = `${person} will progress HEP`;
      if (hasContent(planData.homeProgramProgressOptional)) {
        goalText += ` ${planData.homeProgramProgressOptional}`;
      }
      goalText += " (optional) at each visit in order to be independent w/ home exercise program at discharge";
      if (hasContent(planData.homeProgramProgressDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.homeProgramProgressDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.homeProgramProgressDuration})`;
      }
      homeProgramGoals.push(goalText);
    }

    // HEP Recall goal
    if (planData.homeProgramLongTerm2 && (
      hasContent(planData.homeProgramRecallPerson) || 
      hasContent(planData.homeProgramRecallPercent) || 
      hasContent(planData.homeProgramRecallOf) || 
      hasContent(planData.homeProgramRecallOutcome)
    )) {
      const person = planData.homeProgramRecallPerson || "Patient";
      let goalText = `${person} will recall`;
      if (hasContent(planData.homeProgramRecallPercent)) {
        goalText += ` ${planData.homeProgramRecallPercent}%`;
      }
      goalText += " of";
      if (hasContent(planData.homeProgramRecallOf)) {
        goalText += ` ${planData.homeProgramRecallOf}`;
      }
      goalText += " to achieve";
      if (hasContent(planData.homeProgramRecallOutcome)) {
        goalText += ` ${planData.homeProgramRecallOutcome}`;
      }
      goalText += " (functional outcome)";
      if (hasContent(planData.homeProgramRecallDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.homeProgramRecallDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.homeProgramRecallDuration})`;
      }
      homeProgramGoals.push(goalText);
    }

    // Energy conservation goal
    if (planData.homeProgramLongTerm3 && (
      hasContent(planData.homeProgramEnergyPerson) || 
      hasContent(planData.homeProgramEnergyOutcome)
    )) {
      const person = planData.homeProgramEnergyPerson || "Patient";
      let goalText = `${person} will demonstrate home program for energy conservation/relaxation techniques to reduce SOB as evidenced by`;
      if (hasContent(planData.homeProgramEnergyOutcome)) {
        goalText += ` ${planData.homeProgramEnergyOutcome}`;
      }
      goalText += " (functional outcome)";
      if (hasContent(planData.homeProgramEnergyDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.homeProgramEnergyDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.homeProgramEnergyDuration})`;
      }
      homeProgramGoals.push(goalText);
    }

    // Demonstration goal
    if (planData.homeProgramLongTerm4 && (
      hasContent(planData.homeProgramDemoPerson) || 
      hasContent(planData.homeProgramDemoType) || 
      hasContent(planData.homeProgramDemoAssistLevel)
    )) {
      const person = planData.homeProgramDemoPerson || "Patient";
      let goalText = `${person} will demo`;
      const demoType = planData.homeProgramDemoType || "Home Safety Precautions";
      goalText += ` ${demoType}`;
      if (hasContent(planData.homeProgramDemoAssistLevel)) {
        goalText += ` w/ ${planData.homeProgramDemoAssistLevel}`;
      }
      goalText += " assist";
      if (hasContent(planData.homeProgramDemoDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.homeProgramDemoDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.homeProgramDemoDuration})`;
      }
      homeProgramGoals.push(goalText);
    }

    // Additional Home Program Goal
    if (planData.homeProgramLongTerm5 && hasContent(planData.additionalHomeProgramGoalText)) {
      let goalText = planData.additionalHomeProgramGoalText;
      if (hasContent(planData.additionalHomeProgramGoalDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.additionalHomeProgramGoalDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.additionalHomeProgramGoalDuration})`;
      }
      homeProgramGoals.push(goalText);
    }

    if (homeProgramGoals.length > 0) {
      content['Home Program/HEP Goals'] = homeProgramGoals;
    }

    // 🔥 ADDITIONAL FUNCTIONAL GOALS
    const additionalFunctionalGoals = [];

    if (planData.additionalGoalsLongTerm1 && hasContent(planData.additionalFunctionalGoalText)) {
      let goalText = planData.additionalFunctionalGoalText;
      if (hasContent(planData.additionalFunctionalGoalDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.additionalFunctionalGoalDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.additionalFunctionalGoalDuration})`;
      }
      additionalFunctionalGoals.push(goalText);
    }

    if (additionalFunctionalGoals.length > 0) {
      content['Additional Functional Goals'] = additionalFunctionalGoals;
    }

    // 🔥 DISEASE SPECIFIC GOALS
    const diseaseGoals = [];

    // Disease specific goal 1
    if (planData.diseaseGoalsLongTerm1 && (
      hasContent(planData.diseaseGoalsPerson1) || 
      hasContent(planData.diseaseGoalsActivity) || 
      hasContent(planData.diseaseGoalsOutcome)
    )) {
      const person = planData.diseaseGoalsPerson1 || "Patient";
      let goalText = `${person} to be independent with`;
      const activity = planData.diseaseGoalsActivity || "diabetic foot exam";
      goalText += ` ${activity} in order to`;
      if (hasContent(planData.diseaseGoalsOutcome)) {
        goalText += ` ${planData.diseaseGoalsOutcome}`;
      }
      if (hasContent(planData.diseaseGoalsDuration1)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.diseaseGoalsDuration1);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.diseaseGoalsDuration1})`;
      }
      diseaseGoals.push(goalText);
    }

    // Disease specific goal 2
    if (planData.diseaseGoalsLongTerm2 && (
      hasContent(planData.diseaseGoalsPerson2) || 
      hasContent(planData.diseaseGoalsPhysicianContact)
    )) {
      const person = planData.diseaseGoalsPerson2 || "Patient";
      let goalText = `${person} to demonstrate understanding of abnormal signs and symptoms of diabetic condition and determine when it is appropriate to contact physician regarding`;
      if (hasContent(planData.diseaseGoalsPhysicianContact)) {
        goalText += ` ${planData.diseaseGoalsPhysicianContact}`;
      }
      if (hasContent(planData.diseaseGoalsDuration2)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.diseaseGoalsDuration2);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.diseaseGoalsDuration2})`;
      }
      diseaseGoals.push(goalText);
    }

    // Additional Disease Goal
    if (planData.diseaseGoalsLongTerm3 && hasContent(planData.additionalDiseaseGoalText)) {
      let goalText = planData.additionalDiseaseGoalText;
      if (hasContent(planData.additionalDiseaseGoalDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.additionalDiseaseGoalDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.additionalDiseaseGoalDuration})`;
      }
      diseaseGoals.push(goalText);
    }

    if (diseaseGoals.length > 0) {
      content['Disease Specific Goals'] = diseaseGoals;
    }

    // 🔥 GLOBAL PLAN SETTINGS
    const planSettings = {};

    if (hasContent(planData.stgDuration)) {
      const durationOption = durationOptions.find(opt => opt.value === planData.stgDuration);
      planSettings['STG Duration'] = durationOption ? durationOption.label : planData.stgDuration;
    }

    if (hasContent(planData.ltgDuration)) {
      const durationOption = durationOptions.find(opt => opt.value === planData.ltgDuration);
      planSettings['LTG Duration'] = durationOption ? durationOption.label : planData.ltgDuration;
    }

    if (Object.keys(planSettings).length > 0) {
      content['Plan Settings'] = planSettings;
    }

    return content;
  };

  // Manejador para los cambios en los campos
  const handleChange = (field, value) => {
    const updatedData = { ...data, [field]: value };
    // 🔥 Usar la nueva función que detecta contenido y envía a Finale
    detectAndSendContent(updatedData);
  };
  
  // Manejador para cambiar STG global
  const handleStgUpdate = () => {
    // Crear nuevo objeto de datos con todas las duraciones STG actualizadas
    const updatedData = { ...data, stgDuration: globalStgDuration };
    
    // Actualizar todas las duraciones STG
    Object.keys(data).forEach(key => {
      if (key.endsWith('StgDuration')) {
        updatedData[key] = globalStgDuration;
      }
    });
    
    // 🔥 Usar la nueva función que detecta contenido y envía a Finale
    detectAndSendContent(updatedData);
  };
  
  // Manejador para cambiar LTG global
  const handleLtgUpdate = () => {
    // Crear nuevo objeto de datos con todas las duraciones LTG actualizadas
    const updatedData = { ...data, ltgDuration: globalLtgDuration };
    
    // Actualizar todas las duraciones LTG (que no sean STG)
    Object.keys(data).forEach(key => {
      if (key.endsWith('Duration') && !key.endsWith('StgDuration') && key !== 'stgDuration' && key !== 'ltgDuration') {
        updatedData[key] = globalLtgDuration;
      }
    });
    
    // 🔥 Usar la nueva función que detecta contenido y envía a Finale
    detectAndSendContent(updatedData);
  };
  
  // Cambiar la sección expandida
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  // Renderiza los dropdowns de nivel de asistencia de manera consistente
  const renderAssistLevelSelect = (fieldName, value, onChange) => {
    return (
      <select 
        className="inline-select"
        value={value || ''}
        onChange={onChange}
      >
        <option value="">Select assist level</option>
        {assistLevelOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    );
  };
  
  // Renderiza los dropdowns de persona (Patient/Caregiver) de manera consistente
  const renderPersonSelect = (fieldName, value, onChange) => {
    return (
      <select 
        className="inline-select"
        value={value || 'Patient'}
        onChange={onChange}
      >
        {personOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    );
  };
  
  // Renderiza los dropdowns de duración de manera consistente
  const renderDurationSelect = (fieldName, value, onChange) => {
    return (
      <select 
        value={value || globalLtgDuration}
        onChange={onChange}
      >
        {durationOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    );
  };

  return (
    <div className="plan-section-container">
      <div className="form-section goal-plan-section">
        <h2>Short & Long Term Goals</h2>
        
        <div className="goal-duration-section">
          <h3>NEW GOAL DURATIONS</h3>
          
          <div className="duration-controls">
            <div className="duration-control">
              <label>STG COMPLETED BY:</label>
              <div className="select-with-button">
                <select 
                  value={globalStgDuration}
                  onChange={(e) => setGlobalStgDuration(e.target.value)}
                >
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button className="update-btn" onClick={handleStgUpdate}>UPDATE</button>
              </div>
            </div>
            
            <div className="duration-control">
              <label>LTG COMPLETED BY:</label>
              <div className="select-with-button">
                <select 
                  value={globalLtgDuration}
                  onChange={(e) => setGlobalLtgDuration(e.target.value)}
                >
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button className="update-btn" onClick={handleLtgUpdate}>UPDATE</button>
              </div>
            </div>
          </div>
          
          <div className="duration-note">
            <p>NOTE: Changing the drop down or pressing the update button will update ALL goals. Any existing goals do not update unless this is performed.</p>
          </div>
        </div>
        
        <div className="goals-accordion">
          {/* ADL(S) Section */}
          <div className={`accordion-section ${expandedSection === 'adl' ? 'expanded' : ''}`}>
            <div className="accordion-header" onClick={() => toggleSection('adl')}>
              <i className={`fas fa-chevron-${expandedSection === 'adl' ? 'down' : 'right'}`}></i>
              <h3>ADL(S)</h3>
              <div className="goal-counters">
                <span className="goal-counter">LTG: {data.adlLtgCount || 0}</span>
                <span className="goal-counter">STG: {data.adlStgCount || 0}</span>
              </div>
            </div>
            
            {expandedSection === 'adl' && (
              <div className="accordion-content">
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="adlLongTerm1" 
                        checked={data.adlLongTerm1 || false}
                        onChange={(e) => handleChange('adlLongTerm1', e.target.checked)}
                      />
                      <label htmlFor="adlLongTerm1">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to perform self-feeding w/ 
                      {renderAssistLevelSelect(
                        'adlSelfFeedingAssistLevel', 
                        data.adlSelfFeedingAssistLevel, 
                        (e) => handleChange('adlSelfFeedingAssistLevel', e.target.value)
                      )} 
                      assist 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.adlSelfFeedingOutcome || ''}
                        onChange={(e) => handleChange('adlSelfFeedingOutcome', e.target.value)}
                        placeholder="(assist device/functional outcome)"
                      />
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.adlSelfFeedingStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('adlSelfFeedingStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'adlSelfFeedingDuration', 
                        data.adlSelfFeedingDuration,
                        (e) => handleChange('adlSelfFeedingDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="adlLongTerm2" 
                        checked={data.adlLongTerm2 || false}
                        onChange={(e) => handleChange('adlLongTerm2', e.target.checked)}
                      />
                      <label htmlFor="adlLongTerm2">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to perform upper body dressing w/ 
                      {renderAssistLevelSelect(
                        'adlUpperDressingAssistLevel', 
                        data.adlUpperDressingAssistLevel, 
                        (e) => handleChange('adlUpperDressingAssistLevel', e.target.value)
                      )} 
                      assist 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.adlUpperDressingOutcome || ''}
                        onChange={(e) => handleChange('adlUpperDressingOutcome', e.target.value)}
                        placeholder="(assist device/functional outcome)"
                      />
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.adlUpperDressingStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('adlUpperDressingStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'adlUpperDressingDuration', 
                        data.adlUpperDressingDuration,
                        (e) => handleChange('adlUpperDressingDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="adlLongTerm3" 
                        checked={data.adlLongTerm3 || false}
                        onChange={(e) => handleChange('adlLongTerm3', e.target.checked)}
                      />
                      <label htmlFor="adlLongTerm3">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to perform lower body dressing w/ 
                      {renderAssistLevelSelect(
                        'adlLowerDressingAssistLevel', 
                        data.adlLowerDressingAssistLevel, 
                        (e) => handleChange('adlLowerDressingAssistLevel', e.target.value)
                      )} 
                      assist 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.adlLowerDressingOutcome || ''}
                        onChange={(e) => handleChange('adlLowerDressingOutcome', e.target.value)}
                        placeholder="(assist device/functional outcome)"
                      />
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.adlLowerDressingStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('adlLowerDressingStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'adlLowerDressingDuration', 
                        data.adlLowerDressingDuration,
                        (e) => handleChange('adlLowerDressingDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="adlLongTerm4" 
                        checked={data.adlLongTerm4 || false}
                        onChange={(e) => handleChange('adlLongTerm4', e.target.checked)}
                      />
                      <label htmlFor="adlLongTerm4">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to perform grooming w/ 
                      {renderAssistLevelSelect(
                        'adlGroomingAssistLevel', 
                        data.adlGroomingAssistLevel, 
                        (e) => handleChange('adlGroomingAssistLevel', e.target.value)
                      )} 
                      assist 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.adlGroomingOutcome || ''}
                        onChange={(e) => handleChange('adlGroomingOutcome', e.target.value)}
                        placeholder="(assist device/functional outcome)"
                      />
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.adlGroomingStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('adlGroomingStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'adlGroomingDuration', 
                        data.adlGroomingDuration,
                        (e) => handleChange('adlGroomingDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="adlLongTerm5" 
                        checked={data.adlLongTerm5 || false}
                        onChange={(e) => handleChange('adlLongTerm5', e.target.checked)}
                      />
                      <label htmlFor="adlLongTerm5">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to perform bathing w/ 
                      {renderAssistLevelSelect(
                        'adlBathingAssistLevel', 
                        data.adlBathingAssistLevel, 
                        (e) => handleChange('adlBathingAssistLevel', e.target.value)
                      )} 
                      assist 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.adlBathingOutcome || ''}
                        onChange={(e) => handleChange('adlBathingOutcome', e.target.value)}
                        placeholder="(assist device/functional outcome)"
                      />
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.adlBathingStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('adlBathingStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'adlBathingDuration', 
                        data.adlBathingDuration,
                        (e) => handleChange('adlBathingDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="adlLongTerm6" 
                        checked={data.adlLongTerm6 || false}
                        onChange={(e) => handleChange('adlLongTerm6', e.target.checked)}
                      />
                      <label htmlFor="adlLongTerm6">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to perform 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.adlCustomTask || ''}
                        onChange={(e) => handleChange('adlCustomTask', e.target.value)}
                        placeholder="(ADL Task)"
                      /> 
                      w/ 
                      {renderAssistLevelSelect(
                        'adlCustomTaskAssistLevel', 
                        data.adlCustomTaskAssistLevel, 
                        (e) => handleChange('adlCustomTaskAssistLevel', e.target.value)
                      )} 
                      assist 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.adlCustomTaskOutcome || ''}
                        onChange={(e) => handleChange('adlCustomTaskOutcome', e.target.value)}
                        placeholder="(assist device/functional outcome)"
                      />
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.adlCustomTaskStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('adlCustomTaskStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'adlCustomTaskDuration', 
                        data.adlCustomTaskDuration,
                        (e) => handleChange('adlCustomTaskDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="adlLongTerm7" 
                        checked={data.adlLongTerm7 || false}
                        onChange={(e) => handleChange('adlLongTerm7', e.target.checked)}
                      />
                      <label htmlFor="adlLongTerm7">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      {renderPersonSelect(
                        'adlSafetyPerson',
                        data.adlSafetyPerson,
                        (e) => handleChange('adlSafetyPerson', e.target.value)
                      )} 
                      will demonstrate independence/compliance w/ the following: 
                      <select 
                        className="inline-select"
                        value={data.adlSafetyFunction || 'ADL Safety & Functions'}
                        onChange={(e) => handleChange('adlSafetyFunction', e.target.value)}
                      >
                        <option value="ADL Safety & Functions">ADL Safety & Functions</option>
                        <option value="Safe Patient Positioning">Safe Patient Positioning</option>
                        <option value="Pressure Relief Measures">Pressure Relief Measures</option>
                      </select> 
                      w/ 
                      {renderAssistLevelSelect(
                        'adlSafetyAssistLevel', 
                        data.adlSafetyAssistLevel, 
                        (e) => handleChange('adlSafetyAssistLevel', e.target.value)
                      )} 
                      assist.
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.adlSafetyStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('adlSafetyStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'adlSafetyDuration', 
                        data.adlSafetyDuration,
                        (e) => handleChange('adlSafetyDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="adlLongTerm8" 
                        checked={data.adlLongTerm8 || false}
                        onChange={(e) => handleChange('adlLongTerm8', e.target.checked)}
                      />
                      <label htmlFor="adlLongTerm8">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <textarea 
                      className="additional-goal-textarea" 
                      placeholder="Additional ADL(s) Goal"
                      value={data.additionalAdlGoalText || ''}
                      onChange={(e) => handleChange('additionalAdlGoalText', e.target.value)}
                      rows={4}
                    ></textarea>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.additionalAdlGoalStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('additionalAdlGoalStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'additionalAdlGoalDuration', 
                        data.additionalAdlGoalDuration,
                        (e) => handleChange('additionalAdlGoalDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <button className="add-additional-btn">ADD ADDITIONAL</button>
              </div>
            )}
          </div>
          
          {/* Transfers Section */}
          <div className={`accordion-section ${expandedSection === 'transfers' ? 'expanded' : ''}`}>
            <div className="accordion-header" onClick={() => toggleSection('transfers')}>
              <i className={`fas fa-chevron-${expandedSection === 'transfers' ? 'down' : 'right'}`}></i>
              <h3>TRANSFERS</h3>
              <div className="goal-counters">
                <span className="goal-counter">LTG: {data.transfersLtgCount || 0}</span>
                <span className="goal-counter">STG: {data.transfersStgCount || 0}</span>
              </div>
            </div>
            
            {expandedSection === 'transfers' && (
              <div className="accordion-content">
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="transferLongTerm1" 
                        checked={data.transferLongTerm1 || false}
                        onChange={(e) => handleChange('transferLongTerm1', e.target.checked)}
                      />
                      <label htmlFor="transferLongTerm1">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to perform all bed mobility with 
                      {renderAssistLevelSelect(
                        'transferBedMobilityAssistLevel', 
                        data.transferBedMobilityAssistLevel, 
                        (e) => handleChange('transferBedMobilityAssistLevel', e.target.value)
                      )} 
                      assist using 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.transferBedMobilityDevice || ''}
                        onChange={(e) => handleChange('transferBedMobilityDevice', e.target.value)}
                        placeholder=""
                      /> 
                      assistive device to ensure safe and functional mobility 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.transferBedMobilityOutcome || ''}
                        onChange={(e) => handleChange('transferBedMobilityOutcome', e.target.value)}
                        placeholder="(optional functional outcome)"
                      />
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.transferBedMobilityStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('transferBedMobilityStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'transferBedMobilityDuration', 
                        data.transferBedMobilityDuration,
                        (e) => handleChange('transferBedMobilityDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="transferLongTerm2" 
                        checked={data.transferLongTerm2 || false}
                        onChange={(e) => handleChange('transferLongTerm2', e.target.checked)}
                      />
                      <label htmlFor="transferLongTerm2">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to perform 
                      <select 
                        className="inline-select"
                        value={data.transferType1 || 'Bed'}
                        onChange={(e) => handleChange('transferType1', e.target.value)}
                      >
                        <option value="Bed">Bed</option>
                        <option value="Chair">Chair</option>
                        <option value="Wheelchair">Wheelchair</option>
                        <option value="Toilet">Toilet</option>
                      </select> 
                      transfer(s) w/ 
                      {renderAssistLevelSelect(
                        'transferType1AssistLevel', 
                        data.transferType1AssistLevel, 
                        (e) => handleChange('transferType1AssistLevel', e.target.value)
                      )} 
                      assist using 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.transferType1Device || ''}
                        onChange={(e) => handleChange('transferType1Device', e.target.value)}
                        placeholder=""
                      /> 
                      assistive device in order to ensure safe and functional transfer(s) 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.transferType1Outcome || ''}
                        onChange={(e) => handleChange('transferType1Outcome', e.target.value)}
                        placeholder="(optional functional outcome)"
                      />
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.transferType1StartDate || '2024-12-10'}
                        onChange={(e) => handleChange('transferType1StartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'transferType1Duration', 
                        data.transferType1Duration,
                        (e) => handleChange('transferType1Duration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="transferLongTerm3" 
                        checked={data.transferLongTerm3 || false}
                        onChange={(e) => handleChange('transferLongTerm3', e.target.checked)}
                      />
                      <label htmlFor="transferLongTerm3">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to perform 
                      <select 
                        className="inline-select"
                        value={data.transferType2 || 'Tub'}
                        onChange={(e) => handleChange('transferType2', e.target.value)}
                      >
                        <option value="Tub">Tub</option>
                        <option value="Shower">Shower</option>
                      </select> 
                      transfer(s) w/ 
                      {renderAssistLevelSelect(
                        'transferType2AssistLevel', 
                        data.transferType2AssistLevel, 
                        (e) => handleChange('transferType2AssistLevel', e.target.value)
                      )} 
                      assist using 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.transferType2Device || ''}
                        onChange={(e) => handleChange('transferType2Device', e.target.value)}
                        placeholder=""
                      /> 
                      assistive device in order to ensure safe functional transfer(s) 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.transferType2Outcome || ''}
                        onChange={(e) => handleChange('transferType2Outcome', e.target.value)}
                        placeholder="(optional functional outcome)"
                      />
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.transferType2StartDate || '2024-12-10'}
                        onChange={(e) => handleChange('transferType2StartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'transferType2Duration', 
                        data.transferType2Duration,
                        (e) => handleChange('transferType2Duration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="transferLongTerm4" 
                        checked={data.transferLongTerm4 || false}
                        onChange={(e) => handleChange('transferLongTerm4', e.target.checked)}
                      />
                      <label htmlFor="transferLongTerm4">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <textarea 
                      className="additional-goal-textarea" 
                      placeholder="Additional Transfer Goal"
                      value={data.additionalTransferGoalText || ''}
                      onChange={(e) => handleChange('additionalTransferGoalText', e.target.value)}
                      rows={4}
                    ></textarea>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.additionalTransferGoalStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('additionalTransferGoalStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'additionalTransferGoalDuration', 
                        data.additionalTransferGoalDuration,
                        (e) => handleChange('additionalTransferGoalDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <button className="add-additional-btn">ADD ADDITIONAL</button>
              </div>
            )}
          </div>
          
          {/* Balance Section */}
          <div className={`accordion-section ${expandedSection === 'balance' ? 'expanded' : ''}`}>
            <div className="accordion-header" onClick={() => toggleSection('balance')}>
              <i className={`fas fa-chevron-${expandedSection === 'balance' ? 'down' : 'right'}`}></i>
              <h3>BALANCE</h3>
              <div className="goal-counters">
                <span className="goal-counter">LTG: {data.balanceLtgCount || 0}</span>
                <span className="goal-counter">STG: {data.balanceStgCount || 0}</span>
              </div>
            </div>
            
            {expandedSection === 'balance' && (
              <div className="accordion-content">
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="balanceLongTerm1" 
                        checked={data.balanceLongTerm1 || false}
                        onChange={(e) => handleChange('balanceLongTerm1', e.target.checked)}
                      />
                      <label htmlFor="balanceLongTerm1">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to increase 
                      <select 
                        className="inline-select"
                        value={data.balanceType1 || 'Sitting Static'}
                        onChange={(e) => handleChange('balanceType1', e.target.value)}
                      >
                        <option value="Sitting Static">Sitting Static</option>
                        <option value="Sitting Dynamic">Sitting Dynamic</option>
                        <option value="Standing Static">Standing Static</option>
                        <option value="Standing Dynamic">Standing Dynamic</option>
                      </select> 
                      balance to 
                      <select 
                        className="inline-select"
                        value={data.balanceGrade1 || 'P-'}
                        onChange={(e) => handleChange('balanceGrade1', e.target.value)}
                      >
                        <option value="P-">P-</option>
                        <option value="P">P</option>
                        <option value="P+">P+</option>
                        <option value="F-">F-</option>
                        <option value="F">F</option>
                        <option value="F+">F+</option>
                        <option value="G-">G-</option>
                        <option value="G">G</option>
                        <option value="G+">G+</option>
                      </select> 
                      to ensure safe functional 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.balanceOutcome1 || ''}
                        onChange={(e) => handleChange('balanceOutcome1', e.target.value)}
                        placeholder=""
                      />
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.balanceStartDate1 || '2024-12-10'}
                        onChange={(e) => handleChange('balanceStartDate1', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'balanceDuration1', 
                        data.balanceDuration1,
                        (e) => handleChange('balanceDuration1', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="balanceLongTerm2" 
                        checked={data.balanceLongTerm2 || false}
                        onChange={(e) => handleChange('balanceLongTerm2', e.target.checked)}
                      />
                      <label htmlFor="balanceLongTerm2">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to improve 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.balanceImproveActivity || ''}
                        onChange={(e) => handleChange('balanceImproveActivity', e.target.value)}
                        placeholder=""
                      /> 
                      coordination for 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.balanceImproveFor || ''}
                        onChange={(e) => handleChange('balanceImproveFor', e.target.value)}
                        placeholder=""
                      /> (activity) 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.balanceImproveOutcome || ''}
                        onChange={(e) => handleChange('balanceImproveOutcome', e.target.value)}
                        placeholder=""
                      />
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.balanceImproveStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('balanceImproveStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'balanceImproveDuration', 
                        data.balanceImproveDuration,
                        (e) => handleChange('balanceImproveDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="balanceLongTerm3" 
                        checked={data.balanceLongTerm3 || false}
                        onChange={(e) => handleChange('balanceLongTerm3', e.target.checked)}
                      />
                      <label htmlFor="balanceLongTerm3">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient will exhibit 
                      <select 
                        className="inline-select"
                        value={data.balancePostureGrade || 'P-'}
                        onChange={(e) => handleChange('balancePostureGrade', e.target.value)}
                      >
                        <option value="P-">P-</option>
                        <option value="P">P</option>
                        <option value="P+">P+</option>
                        <option value="F-">F-</option>
                        <option value="F">F</option>
                        <option value="F+">F+</option>
                        <option value="G-">G-</option>
                        <option value="G">G</option>
                        <option value="G+">G+</option>
                      </select> 
                      posture in 
                      <select 
                        className="inline-select"
                        value={data.balancePosturePosition || 'Standing'}
                        onChange={(e) => handleChange('balancePosturePosition', e.target.value)}
                      >
                        <option value="Standing">Standing</option>
                        <option value="Sitting">Sitting</option>
                      </select> 
                      in order to 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.balancePostureOutcome || ''}
                        onChange={(e) => handleChange('balancePostureOutcome', e.target.value)}
                        placeholder=""
                      /> (functional outcome)
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.balancePostureStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('balancePostureStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'balancePostureDuration', 
                        data.balancePostureDuration,
                        (e) => handleChange('balancePostureDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="balanceLongTerm4" 
                        checked={data.balanceLongTerm4 || false}
                        onChange={(e) => handleChange('balanceLongTerm4', e.target.checked)}
                      />
                      <label htmlFor="balanceLongTerm4">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to demonstrate improvement in Tinetti score: from 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.tinettiScoreFrom || ''}
                        onChange={(e) => handleChange('tinettiScoreFrom', e.target.value)}
                        placeholder=""
                      /> (score) to 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.tinettiScoreTo || ''}
                        onChange={(e) => handleChange('tinettiScoreTo', e.target.value)}
                        placeholder=""
                      /> (score)
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.tinettiScoreStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('tinettiScoreStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'tinettiScoreDuration', 
                        data.tinettiScoreDuration,
                        (e) => handleChange('tinettiScoreDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="balanceLongTerm5" 
                        checked={data.balanceLongTerm5 || false}
                        onChange={(e) => handleChange('balanceLongTerm5', e.target.checked)}
                      />
                      <label htmlFor="balanceLongTerm5">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to demonstrate improvement in Berg score: from 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.bergScoreFrom || ''}
                        onChange={(e) => handleChange('bergScoreFrom', e.target.value)}
                        placeholder=""
                      /> (score) to 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.bergScoreTo || ''}
                        onChange={(e) => handleChange('bergScoreTo', e.target.value)}
                        placeholder=""
                      /> (score)
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.bergScoreStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('bergScoreStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'bergScoreDuration', 
                        data.bergScoreDuration,
                        (e) => handleChange('bergScoreDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="balanceLongTerm6" 
                        checked={data.balanceLongTerm6 || false}
                        onChange={(e) => handleChange('balanceLongTerm6', e.target.checked)}
                      />
                      <label htmlFor="balanceLongTerm6">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to demonstrate improvement in Tug score: from 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.tugScoreFrom || ''}
                        onChange={(e) => handleChange('tugScoreFrom', e.target.value)}
                        placeholder=""
                      /> (score) to 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.tugScoreTo || ''}
                        onChange={(e) => handleChange('tugScoreTo', e.target.value)}
                        placeholder=""
                      /> (score)
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.tugScoreStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('tugScoreStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'tugScoreDuration', 
                        data.tugScoreDuration,
                        (e) => handleChange('tugScoreDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="balanceLongTerm7" 
                        checked={data.balanceLongTerm7 || false}
                        onChange={(e) => handleChange('balanceLongTerm7', e.target.checked)}
                      />
                      <label htmlFor="balanceLongTerm7">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to demonstrate improvement in Functional Reach score: from 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.functionalReachScoreFrom || ''}
                        onChange={(e) => handleChange('functionalReachScoreFrom', e.target.value)}
                        placeholder=""
                      /> (score) to 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.functionalReachScoreTo || ''}
                        onChange={(e) => handleChange('functionalReachScoreTo', e.target.value)}
                        placeholder=""
                      /> (score)
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.functionalReachScoreStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('functionalReachScoreStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'functionalReachScoreDuration', 
                        data.functionalReachScoreDuration,
                        (e) => handleChange('functionalReachScoreDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="balanceLongTerm8" 
                        checked={data.balanceLongTerm8 || false}
                        onChange={(e) => handleChange('balanceLongTerm8', e.target.checked)}
                      />
                      <label htmlFor="balanceLongTerm8">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to demonstrate improvement in Katz score: from 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.katzScoreFrom || ''}
                        onChange={(e) => handleChange('katzScoreFrom', e.target.value)}
                        placeholder=""
                      /> (score) to 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.katzScoreTo || ''}
                        onChange={(e) => handleChange('katzScoreTo', e.target.value)}
                        placeholder=""
                      /> (score)
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.katzScoreStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('katzScoreStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'katzScoreDuration', 
                        data.katzScoreDuration,
                        (e) => handleChange('katzScoreDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="balanceLongTerm9" 
                        checked={data.balanceLongTerm9 || false}
                        onChange={(e) => handleChange('balanceLongTerm9', e.target.checked)}
                      />
                      <label htmlFor="balanceLongTerm9">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to demonstrate improvement in Moberg score for 
                      <select 
                        className="inline-select"
                        value={data.mobergScoreHand || 'Left Hand'}
                        onChange={(e) => handleChange('mobergScoreHand', e.target.value)}
                      >
                        <option value="Left Hand">Left Hand</option>
                        <option value="Right Hand">Right Hand</option>
                      </select> 
                      : from 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.mobergScoreFrom || ''}
                        onChange={(e) => handleChange('mobergScoreFrom', e.target.value)}
                        placeholder=""
                      /> (score) to 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.mobergScoreTo || ''}
                        onChange={(e) => handleChange('mobergScoreTo', e.target.value)}
                        placeholder=""
                      /> (score)
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.mobergScoreStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('mobergScoreStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'mobergScoreDuration', 
                        data.mobergScoreDuration,
                        (e) => handleChange('mobergScoreDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="balanceLongTerm10" 
                        checked={data.balanceLongTerm10 || false}
                        onChange={(e) => handleChange('balanceLongTerm10', e.target.checked)}
                      />
                      <label htmlFor="balanceLongTerm10">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <textarea 
                      className="additional-goal-textarea" 
                      placeholder="Additional Balance Goal"
                      value={data.additionalBalanceGoalText || ''}
                      onChange={(e) => handleChange('additionalBalanceGoalText', e.target.value)}
                      rows={4}
                    ></textarea>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.additionalBalanceGoalStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('additionalBalanceGoalStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'additionalBalanceGoalDuration', 
                        data.additionalBalanceGoalDuration,
                        (e) => handleChange('additionalBalanceGoalDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <button className="add-additional-btn">ADD ADDITIONAL</button>
              </div>
            )}
          </div>
          
          {/* Strength/ROM/Activity Tolerance Section */}
          <div className={`accordion-section ${expandedSection === 'strength' ? 'expanded' : ''}`}>
            <div className="accordion-header" onClick={() => toggleSection('strength')}>
              <i className={`fas fa-chevron-${expandedSection === 'strength' ? 'down' : 'right'}`}></i>
              <h3>STRENGTH/ROM/ACTIVITY TOLERANCE</h3>
              <div className="goal-counters">
                <span className="goal-counter">LTG: {data.strengthLtgCount || 0}</span>
                <span className="goal-counter">STG: {data.strengthStgCount || 0}</span>
              </div>
            </div>
            
            {expandedSection === 'strength' && (
              <div className="accordion-content">
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="strengthLongTerm1" 
                        checked={data.strengthLongTerm1 || false}
                        onChange={(e) => handleChange('strengthLongTerm1', e.target.checked)}
                      />
                      <label htmlFor="strengthLongTerm1">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient's cardiopulmonary status will improve as evidenced by 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.cardioEvidenceBy || ''}
                        onChange={(e) => handleChange('cardioEvidenceBy', e.target.value)}
                        placeholder=""
                      /> 
                      in order to 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.cardioOutcome || ''}
                        onChange={(e) => handleChange('cardioOutcome', e.target.value)}
                        placeholder=""
                      /> (functional outcome)
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.cardioStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('cardioStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'cardioDuration', 
                        data.cardioDuration,
                        (e) => handleChange('cardioDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="strengthLongTerm2" 
                        checked={data.strengthLongTerm2 || false}
                        onChange={(e) => handleChange('strengthLongTerm2', e.target.checked)}
                      />
                      <label htmlFor="strengthLongTerm2">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to increase 
                      <select 
                        className="inline-select"
                        value={data.romType || 'AROM'}
                        onChange={(e) => handleChange('romType', e.target.value)}
                      >
                        <option value="AROM">AROM</option>
                        <option value="AAROM">AAROM</option>
                        <option value="PROM">PROM</option>
                      </select> 
                      of 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.romBodyArea || ''}
                        onChange={(e) => handleChange('romBodyArea', e.target.value)}
                        placeholder=""
                      /> (body area) to 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.romDegreesTo || ''}
                        onChange={(e) => handleChange('romDegreesTo', e.target.value)}
                        placeholder=""
                      /> (degrees) to achieve 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.romOutcome || ''}
                        onChange={(e) => handleChange('romOutcome', e.target.value)}
                        placeholder=""
                      /> (functional outcome)
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.romStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('romStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'romDuration', 
                        data.romDuration,
                        (e) => handleChange('romDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="strengthLongTerm3" 
                        checked={data.strengthLongTerm3 || false}
                        onChange={(e) => handleChange('strengthLongTerm3', e.target.checked)}
                      />
                      <label htmlFor="strengthLongTerm3">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient to increase strength of 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.strengthBodyArea || ''}
                        onChange={(e) => handleChange('strengthBodyArea', e.target.value)}
                        placeholder=""
                      /> (body area) to/by 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.strengthGrade || ''}
                        onChange={(e) => handleChange('strengthGrade', e.target.value)}
                        placeholder=""
                      /> (grade) in order to be 
                      {renderAssistLevelSelect(
                        'strengthAssistLevel', 
                        data.strengthAssistLevel, 
                        (e) => handleChange('strengthAssistLevel', e.target.value)
                      )} 
                      assist 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.strengthWith || ''}
                        onChange={(e) => handleChange('strengthWith', e.target.value)}
                        placeholder=""
                      /> to achieve 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.strengthOutcome || ''}
                        onChange={(e) => handleChange('strengthOutcome', e.target.value)}
                        placeholder=""
                      /> (functional outcome)
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.strengthStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('strengthStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'strengthDuration', 
                        data.strengthDuration,
                        (e) => handleChange('strengthDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="strengthLongTerm4" 
                        checked={data.strengthLongTerm4 || false}
                        onChange={(e) => handleChange('strengthLongTerm4', e.target.checked)}
                      />
                      <label htmlFor="strengthLongTerm4">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient will demonstrate improved fine motor skills as evidenced by 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.fineMotorEvidenceBy || ''}
                        onChange={(e) => handleChange('fineMotorEvidenceBy', e.target.value)}
                        placeholder=""
                      />
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.fineMotorStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('fineMotorStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'fineMotorDuration', 
                        data.fineMotorDuration,
                        (e) => handleChange('fineMotorDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="strengthLongTerm5" 
                        checked={data.strengthLongTerm5 || false}
                        onChange={(e) => handleChange('strengthLongTerm5', e.target.checked)}
                      />
                      <label htmlFor="strengthLongTerm5">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <textarea 
                      className="additional-goal-textarea" 
                      placeholder="Additional Activity Tolerance/Strength Goal"
                      value={data.additionalStrengthGoalText || ''}
                      onChange={(e) => handleChange('additionalStrengthGoalText', e.target.value)}
                      rows={4}
                    ></textarea>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.additionalStrengthGoalStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('additionalStrengthGoalStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'additionalStrengthGoalDuration', 
                        data.additionalStrengthGoalDuration,
                        (e) => handleChange('additionalStrengthGoalDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <button className="add-additional-btn">ADD ADDITIONAL</button>
              </div>
            )}
          </div>

          {/* Pain Section */}
          <div className={`accordion-section ${expandedSection === 'pain' ? 'expanded' : ''}`}>
            <div className="accordion-header" onClick={() => toggleSection('pain')}>
              <i className={`fas fa-chevron-${expandedSection === 'pain' ? 'down' : 'right'}`}></i>
              <h3>PAIN</h3>
              <div className="goal-counters">
                <span className="goal-counter">LTG: {data.painLtgCount || 0}</span>
                <span className="goal-counter">STG: {data.painStgCount || 0}</span>
              </div>
            </div>
            
            {expandedSection === 'pain' && (
              <div className="accordion-content">
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="painLongTerm1" 
                        checked={data.painLongTerm1 || false}
                        onChange={(e) => handleChange('painLongTerm1', e.target.checked)}
                      />
                      <label htmlFor="painLongTerm1">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      Patient's pain will decrease to 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.painPoints || ''}
                        onChange={(e) => handleChange('painPoints', e.target.value)}
                        placeholder=""
                      /> 
                      points on the pain scale to achieve 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.painOutcome || ''}
                        onChange={(e) => handleChange('painOutcome', e.target.value)}
                        placeholder=""
                      /> (functional outcome)
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.painStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('painStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'painDuration', 
                        data.painDuration,
                        (e) => handleChange('painDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                    <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="painLongTerm2" 
                        checked={data.painLongTerm2 || false}
                        onChange={(e) => handleChange('painLongTerm2', e.target.checked)}
                      />
                      <label htmlFor="painLongTerm2">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <textarea 
                      className="additional-goal-textarea" 
                      placeholder="Additional Pain Goal"
                      value={data.additionalPainGoalText1 || ''}
                      onChange={(e) => handleChange('additionalPainGoalText1', e.target.value)}
                      rows={4}
                    ></textarea>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.additionalPainGoalStartDate1 || '2024-12-10'}
                        onChange={(e) => handleChange('additionalPainGoalStartDate1', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'additionalPainGoalDuration1', 
                        data.additionalPainGoalDuration1,
                        (e) => handleChange('additionalPainGoalDuration1', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="painLongTerm3" 
                        checked={data.painLongTerm3 || false}
                        onChange={(e) => handleChange('painLongTerm3', e.target.checked)}
                      />
                      <label htmlFor="painLongTerm3">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <textarea 
                      className="additional-goal-textarea" 
                      placeholder="Additional Pain Goal"
                      value={data.additionalPainGoalText2 || ''}
                      onChange={(e) => handleChange('additionalPainGoalText2', e.target.value)}
                      rows={4}
                    ></textarea>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.additionalPainGoalStartDate2 || '2024-12-10'}
                        onChange={(e) => handleChange('additionalPainGoalStartDate2', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'additionalPainGoalDuration2', 
                        data.additionalPainGoalDuration2,
                        (e) => handleChange('additionalPainGoalDuration2', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="painLongTerm4" 
                        checked={data.painLongTerm4 || false}
                        onChange={(e) => handleChange('painLongTerm4', e.target.checked)}
                      />
                      <label htmlFor="painLongTerm4">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <textarea 
                      className="additional-goal-textarea" 
                      placeholder="Additional Pain Goal"
                      value={data.additionalPainGoalText3 || ''}
                      onChange={(e) => handleChange('additionalPainGoalText3', e.target.value)}
                      rows={4}
                    ></textarea>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.additionalPainGoalStartDate3 || '2024-12-10'}
                        onChange={(e) => handleChange('additionalPainGoalStartDate3', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'additionalPainGoalDuration3', 
                        data.additionalPainGoalDuration3,
                        (e) => handleChange('additionalPainGoalDuration3', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <button className="add-additional-btn">ADD ADDITIONAL</button>
              </div>
            )}
          </div>
          
          {/* Home Program/HEP Section */}
          <div className={`accordion-section ${expandedSection === 'homeProgram' ? 'expanded' : ''}`}>
            <div className="accordion-header" onClick={() => toggleSection('homeProgram')}>
              <i className={`fas fa-chevron-${expandedSection === 'homeProgram' ? 'down' : 'right'}`}></i>
              <h3>HOME PROGRAM/HEP</h3>
              <div className="goal-counters">
                <span className="goal-counter">LTG: {data.homeProgramLtgCount || 0}</span>
                <span className="goal-counter">STG: {data.homeProgramStgCount || 0}</span>
              </div>
            </div>
            
            {expandedSection === 'homeProgram' && (
              <div className="accordion-content">
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="homeProgramLongTerm1" 
                        checked={data.homeProgramLongTerm1 || false}
                        onChange={(e) => handleChange('homeProgramLongTerm1', e.target.checked)}
                      />
                      <label htmlFor="homeProgramLongTerm1">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      {renderPersonSelect(
                        'homeProgramProgressPerson',
                        data.homeProgramProgressPerson,
                        (e) => handleChange('homeProgramProgressPerson', e.target.value)
                      )} 
                      will progress HEP 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.homeProgramProgressOptional || ''}
                        onChange={(e) => handleChange('homeProgramProgressOptional', e.target.value)}
                        placeholder=""
                      /> (optional) at each visit in order to be independent w/ home exercise program at discharge
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.homeProgramProgressStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('homeProgramProgressStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'homeProgramProgressDuration', 
                        data.homeProgramProgressDuration,
                        (e) => handleChange('homeProgramProgressDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="homeProgramLongTerm2" 
                        checked={data.homeProgramLongTerm2 || false}
                        onChange={(e) => handleChange('homeProgramLongTerm2', e.target.checked)}
                      />
                      <label htmlFor="homeProgramLongTerm2">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      {renderPersonSelect(
                        'homeProgramRecallPerson',
                        data.homeProgramRecallPerson,
                        (e) => handleChange('homeProgramRecallPerson', e.target.value)
                      )} 
                      will recall 
                      <input 
                        type="text" 
                        className="small-input" 
                        value={data.homeProgramRecallPercent || ''}
                        onChange={(e) => handleChange('homeProgramRecallPercent', e.target.value)}
                        placeholder=""
                      />% 
                      of 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.homeProgramRecallOf || ''}
                        onChange={(e) => handleChange('homeProgramRecallOf', e.target.value)}
                        placeholder=""
                      /> 
                      to achieve 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.homeProgramRecallOutcome || ''}
                        onChange={(e) => handleChange('homeProgramRecallOutcome', e.target.value)}
                        placeholder=""
                      /> (functional outcome)
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.homeProgramRecallStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('homeProgramRecallStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'homeProgramRecallDuration', 
                        data.homeProgramRecallDuration,
                        (e) => handleChange('homeProgramRecallDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="homeProgramLongTerm3" 
                        checked={data.homeProgramLongTerm3 || false}
                        onChange={(e) => handleChange('homeProgramLongTerm3', e.target.checked)}
                      />
                      <label htmlFor="homeProgramLongTerm3">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      {renderPersonSelect(
                        'homeProgramEnergyPerson',
                        data.homeProgramEnergyPerson,
                        (e) => handleChange('homeProgramEnergyPerson', e.target.value)
                      )} 
                      will demonstrate home program for energy conservation/relaxation techniques to reduce SOB as evidenced by 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.homeProgramEnergyOutcome || ''}
                        onChange={(e) => handleChange('homeProgramEnergyOutcome', e.target.value)}
                        placeholder=""
                      /> (functional outcome)
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.homeProgramEnergyStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('homeProgramEnergyStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'homeProgramEnergyDuration', 
                        data.homeProgramEnergyDuration,
                        (e) => handleChange('homeProgramEnergyDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="homeProgramLongTerm4" 
                        checked={data.homeProgramLongTerm4 || false}
                        onChange={(e) => handleChange('homeProgramLongTerm4', e.target.checked)}
                      />
                      <label htmlFor="homeProgramLongTerm4">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      {renderPersonSelect(
                        'homeProgramDemoPerson',
                        data.homeProgramDemoPerson,
                        (e) => handleChange('homeProgramDemoPerson', e.target.value)
                      )} 
                      will demo 
                      <select 
                        className="inline-select"
                        value={data.homeProgramDemoType || 'Home Safety Precautions'}
                        onChange={(e) => handleChange('homeProgramDemoType', e.target.value)}
                      >
                        <option value="Home Safety Precautions">Home Safety Precautions</option>
                        <option value="Safe Patient Positioning">Safe Patient Positioning</option>
                        <option value="Pressure Relief Measures">Pressure Relief Measures</option>
                        <option value="Breathing Techniques">Breathing Techniques</option>
                      </select> 
                      w/ 
                      {renderAssistLevelSelect(
                        'homeProgramDemoAssistLevel', 
                        data.homeProgramDemoAssistLevel, 
                        (e) => handleChange('homeProgramDemoAssistLevel', e.target.value)
                      )} 
                      assist
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.homeProgramDemoStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('homeProgramDemoStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'homeProgramDemoDuration', 
                        data.homeProgramDemoDuration,
                        (e) => handleChange('homeProgramDemoDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="homeProgramLongTerm5" 
                        checked={data.homeProgramLongTerm5 || false}
                        onChange={(e) => handleChange('homeProgramLongTerm5', e.target.checked)}
                      />
                      <label htmlFor="homeProgramLongTerm5">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <textarea 
                      className="additional-goal-textarea" 
                      placeholder="Additional Home Program/HEP Goal"
                      value={data.additionalHomeProgramGoalText || ''}
                      onChange={(e) => handleChange('additionalHomeProgramGoalText', e.target.value)}
                      rows={4}
                    ></textarea>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.additionalHomeProgramGoalStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('additionalHomeProgramGoalStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'additionalHomeProgramGoalDuration', 
                        data.additionalHomeProgramGoalDuration,
                        (e) => handleChange('additionalHomeProgramGoalDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <button className="add-additional-btn">ADD ADDITIONAL</button>
              </div>
            )}
          </div>
          
          {/* Additional Functional Goals Section */}
          <div className={`accordion-section ${expandedSection === 'additionalGoals' ? 'expanded' : ''}`}>
            <div className="accordion-header" onClick={() => toggleSection('additionalGoals')}>
              <i className={`fas fa-chevron-${expandedSection === 'additionalGoals' ? 'down' : 'right'}`}></i>
              <h3>ADDITIONAL FUNCTIONAL GOALS</h3>
              <div className="goal-counters">
                <span className="goal-counter">LTG: {data.additionalGoalsLtgCount || 0}</span>
                <span className="goal-counter">STG: {data.additionalGoalsStgCount || 0}</span>
              </div>
            </div>
            
            {expandedSection === 'additionalGoals' && (
              <div className="accordion-content">
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="additionalGoalsLongTerm1" 
                        checked={data.additionalGoalsLongTerm1 || false}
                        onChange={(e) => handleChange('additionalGoalsLongTerm1', e.target.checked)}
                      />
                      <label htmlFor="additionalGoalsLongTerm1">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <textarea 
                      className="additional-goal-textarea" 
                      placeholder="Additional Functional Goal"
                      value={data.additionalFunctionalGoalText || ''}
                      onChange={(e) => handleChange('additionalFunctionalGoalText', e.target.value)}
                      rows={4}
                    ></textarea>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.additionalFunctionalGoalStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('additionalFunctionalGoalStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'additionalFunctionalGoalDuration', 
                        data.additionalFunctionalGoalDuration,
                        (e) => handleChange('additionalFunctionalGoalDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <button className="add-additional-btn">ADD ADDITIONAL</button>
              </div>
            )}
          </div>
          
          {/* Disease Specific Goals Section */}
          <div className={`accordion-section ${expandedSection === 'diseaseGoals' ? 'expanded' : ''}`}>
            <div className="accordion-header" onClick={() => toggleSection('diseaseGoals')}>
              <i className={`fas fa-chevron-${expandedSection === 'diseaseGoals' ? 'down' : 'right'}`}></i>
              <h3>DISEASE SPECIFIC GOALS</h3>
              <div className="goal-counters">
                <span className="goal-counter">LTG: {data.diseaseGoalsLtgCount || 0}</span>
                <span className="goal-counter">STG: {data.diseaseGoalsStgCount || 0}</span>
              </div>
            </div>
            
            {expandedSection === 'diseaseGoals' && (
              <div className="accordion-content">
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="diseaseGoalsLongTerm1" 
                        checked={data.diseaseGoalsLongTerm1 || false}
                        onChange={(e) => handleChange('diseaseGoalsLongTerm1', e.target.checked)}
                      />
                      <label htmlFor="diseaseGoalsLongTerm1">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      {renderPersonSelect(
                        'diseaseGoalsPerson1',
                        data.diseaseGoalsPerson1,
                        (e) => handleChange('diseaseGoalsPerson1', e.target.value)
                      )} 
                      to be independent with 
                      <select 
                        className="inline-select"
                        value={data.diseaseGoalsActivity || 'diabetic foot exam'}
                        onChange={(e) => handleChange('diseaseGoalsActivity', e.target.value)}
                      >
                        <option value="diabetic foot exam">diabetic foot exam</option>
                        <option value="Foot Care">Foot Care</option>
                        <option value="monitoring glucose levels">monitoring glucose levels</option>
                        <option value="medication/insulin administration">medication/insulin administration</option>
                      </select> 
                      in order to 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.diseaseGoalsOutcome || ''}
                        onChange={(e) => handleChange('diseaseGoalsOutcome', e.target.value)}
                        placeholder=""
                      />
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.diseaseGoalsStartDate1 || '2024-12-10'}
                        onChange={(e) => handleChange('diseaseGoalsStartDate1', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'diseaseGoalsDuration1', 
                        data.diseaseGoalsDuration1,
                        (e) => handleChange('diseaseGoalsDuration1', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="diseaseGoalsLongTerm2" 
                        checked={data.diseaseGoalsLongTerm2 || false}
                        onChange={(e) => handleChange('diseaseGoalsLongTerm2', e.target.checked)}
                      />
                      <label htmlFor="diseaseGoalsLongTerm2">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <p>
                      {renderPersonSelect(
                        'diseaseGoalsPerson2',
                        data.diseaseGoalsPerson2,
                        (e) => handleChange('diseaseGoalsPerson2', e.target.value)
                      )} 
                      to demonstrate understanding of abnormal signs and symptoms of diabetic condition and determine when it is appropriate to contact physician regarding 
                      <input 
                        type="text" 
                        className="medium-input" 
                        value={data.diseaseGoalsPhysicianContact || ''}
                        onChange={(e) => handleChange('diseaseGoalsPhysicianContact', e.target.value)}
                        placeholder=""
                      />
                    </p>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.diseaseGoalsStartDate2 || '2024-12-10'}
                        onChange={(e) => handleChange('diseaseGoalsStartDate2', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'diseaseGoalsDuration2', 
                        data.diseaseGoalsDuration2,
                        (e) => handleChange('diseaseGoalsDuration2', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="checkbox-item">
                      <input 
                        type="checkbox" 
                        id="diseaseGoalsLongTerm3" 
                        checked={data.diseaseGoalsLongTerm3 || false}
                        onChange={(e) => handleChange('diseaseGoalsLongTerm3', e.target.checked)}
                      />
                      <label htmlFor="diseaseGoalsLongTerm3">Long Term</label>
                    </div>
                    <button className="add-stg-btn">Add STG</button>
                  </div>
                  
                  <div className="goal-template">
                    <textarea 
                      className="additional-goal-textarea" 
                      placeholder="Additional Disease Specific Goal"
                      value={data.additionalDiseaseGoalText || ''}
                      onChange={(e) => handleChange('additionalDiseaseGoalText', e.target.value)}
                      rows={4}
                    ></textarea>
                  </div>
                  
                  <div className="goal-dates">
                    <div className="date-field">
                      <label>Starting</label>
                      <input 
                        type="date" 
                        value={data.additionalDiseaseGoalStartDate || '2024-12-10'}
                        onChange={(e) => handleChange('additionalDiseaseGoalStartDate', e.target.value)}
                      />
                    </div>
                    <div className="date-field">
                      <label>Duration</label>
                      {renderDurationSelect(
                        'additionalDiseaseGoalDuration', 
                        data.additionalDiseaseGoalDuration,
                        (e) => handleChange('additionalDiseaseGoalDuration', e.target.value)
                      )}
                    </div>
                  </div>
                </div>
                
                <button className="add-additional-btn">ADD ADDITIONAL</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSection;