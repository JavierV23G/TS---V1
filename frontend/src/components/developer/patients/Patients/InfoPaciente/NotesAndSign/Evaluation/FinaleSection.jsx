// 🔥 ULTRA PREMIUM FinaleSection.jsx - ABSOLUTE BEAST MODE 🔥
import React, { useState, useEffect } from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/FinaleSection.scss';
import SignaturePad from './SignaturePad';

const FinaleSection = ({ data, onChange, autoSaveMessage }) => {
  const [activeSection, setActiveSection] = useState('signatures');
  const [compiledContent, setCompiledContent] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // 🚀 SISTEMA MEJORADO DE DETECCIÓN DE CONTENIDO
  const hasContent = (value) => {
    if (!value) return false;
    
    if (typeof value === 'string') {
      const trimmed = value.trim();
      const emptyValues = [
        '', 'not provided', 'n/a', 'select an option', 
        'none', 'null', 'undefined', '0', 'no'
      ];
      return trimmed.length > 0 && !emptyValues.includes(trimmed.toLowerCase());
    }
    
    if (typeof value === 'number') return value > 0;
    if (typeof value === 'boolean') return value === true;
    
    if (Array.isArray(value)) {
      return value.length > 0 && value.some(item => hasContent(item));
    }
    
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).length > 0 && 
             Object.values(value).some(val => hasContent(val));
    }
    
    return false;
  };

  // 🎯 FUNCIÓN PRINCIPAL PARA DETECTAR CONTENIDO DEL PLAN SECTION
  const detectPlanContent = (planData) => {
    const content = {};
    if (!planData) return content;

    const generateDurationOptions = () => {
      const options = [];
      for (let i = 1; i <= 8; i++) {
        const startDate = new Date(planData.evaluationDate || '2024-12-10');
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + (i * 7));
        const weekLabel = `Week of ${targetDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}`;
        options.push({
          value: i.toString(),
          label: `${i} ${i === 1 ? 'Week' : 'Weeks'} (${weekLabel})`
        });
      }
      return options;
    };
    
    const durationOptions = generateDurationOptions();

    // 🎯 ADL GOALS SECTION
    const adlGoals = [];
    
    if (planData.adlLongTerm1 && (hasContent(planData.adlSelfFeedingAssistLevel) || hasContent(planData.adlSelfFeedingOutcome))) {
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

    if (planData.adlLongTerm2 && (hasContent(planData.adlUpperDressingAssistLevel) || hasContent(planData.adlUpperDressingOutcome))) {
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

    if (planData.adlLongTerm3 && (hasContent(planData.adlLowerDressingAssistLevel) || hasContent(planData.adlLowerDressingOutcome))) {
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

    if (planData.adlLongTerm4 && (hasContent(planData.adlGroomingAssistLevel) || hasContent(planData.adlGroomingOutcome))) {
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

    if (planData.adlLongTerm5 && (hasContent(planData.adlBathingAssistLevel) || hasContent(planData.adlBathingOutcome))) {
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

    if (planData.adlLongTerm6 && (hasContent(planData.adlCustomTask) || hasContent(planData.adlCustomTaskAssistLevel) || hasContent(planData.adlCustomTaskOutcome))) {
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

    if (planData.adlLongTerm7 && (hasContent(planData.adlSafetyPerson) || hasContent(planData.adlSafetyFunction) || hasContent(planData.adlSafetyAssistLevel))) {
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

    // 🎯 TRANSFERS GOALS
    const transferGoals = [];

    if (planData.transferLongTerm1 && (hasContent(planData.transferBedMobilityAssistLevel) || hasContent(planData.transferBedMobilityDevice) || hasContent(planData.transferBedMobilityOutcome))) {
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

    if (planData.transferLongTerm2 && (hasContent(planData.transferType1) || hasContent(planData.transferType1AssistLevel) || hasContent(planData.transferType1Device))) {
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

    if (planData.transferLongTerm3 && (hasContent(planData.transferType2) || hasContent(planData.transferType2AssistLevel) || hasContent(planData.transferType2Device))) {
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

    // 🎯 BALANCE GOALS
    const balanceGoals = [];

    if (planData.balanceLongTerm1 && (hasContent(planData.balanceType1) || hasContent(planData.balanceGrade1) || hasContent(planData.balanceOutcome1))) {
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

    if (planData.balanceLongTerm2 && (hasContent(planData.balanceImproveActivity) || hasContent(planData.balanceImproveFor) || hasContent(planData.balanceImproveOutcome))) {
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

    if (planData.balanceLongTerm3 && (hasContent(planData.balancePostureGrade) || hasContent(planData.balancePosturePosition) || hasContent(planData.balancePostureOutcome))) {
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

    const scoreGoals = [
      { condition: planData.balanceLongTerm4, from: planData.tinettiScoreFrom, to: planData.tinettiScoreTo, duration: planData.tinettiScoreDuration, name: "Tinetti" },
      { condition: planData.balanceLongTerm5, from: planData.bergScoreFrom, to: planData.bergScoreTo, duration: planData.bergScoreDuration, name: "Berg" },
      { condition: planData.balanceLongTerm6, from: planData.tugScoreFrom, to: planData.tugScoreTo, duration: planData.tugScoreDuration, name: "Tug" },
      { condition: planData.balanceLongTerm7, from: planData.functionalReachScoreFrom, to: planData.functionalReachScoreTo, duration: planData.functionalReachScoreDuration, name: "Functional Reach" },
      { condition: planData.balanceLongTerm8, from: planData.katzScoreFrom, to: planData.katzScoreTo, duration: planData.katzScoreDuration, name: "Katz" }
    ];

    scoreGoals.forEach(goal => {
      if (goal.condition && (hasContent(goal.from) || hasContent(goal.to))) {
        let goalText = `Patient to demonstrate improvement in ${goal.name} score: from`;
        if (hasContent(goal.from)) {
          goalText += ` ${goal.from} (score) to`;
        }
        if (hasContent(goal.to)) {
          goalText += ` ${goal.to} (score)`;
        }
        if (hasContent(goal.duration)) {
          const durationOption = durationOptions.find(opt => opt.value === goal.duration);
          goalText += ` (Duration: ${durationOption ? durationOption.label : goal.duration})`;
        }
        balanceGoals.push(goalText);
      }
    });

    if (planData.balanceLongTerm9 && (hasContent(planData.mobergScoreHand) || hasContent(planData.mobergScoreFrom) || hasContent(planData.mobergScoreTo))) {
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

    // 🎯 STRENGTH/ROM/ACTIVITY TOLERANCE GOALS
    const strengthGoals = [];

    if (planData.strengthLongTerm1 && (hasContent(planData.cardioEvidenceBy) || hasContent(planData.cardioOutcome))) {
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

    if (planData.strengthLongTerm2 && (hasContent(planData.romType) || hasContent(planData.romBodyArea) || hasContent(planData.romDegreesTo) || hasContent(planData.romOutcome))) {
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

    if (planData.strengthLongTerm3 && (hasContent(planData.strengthBodyArea) || hasContent(planData.strengthGrade) || hasContent(planData.strengthAssistLevel) || hasContent(planData.strengthWith) || hasContent(planData.strengthOutcome))) {
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

    if (planData.strengthLongTerm4 && hasContent(planData.fineMotorEvidenceBy)) {
      let goalText = `Patient will demonstrate improved fine motor skills as evidenced by ${planData.fineMotorEvidenceBy}`;
      if (hasContent(planData.fineMotorDuration)) {
        const durationOption = durationOptions.find(opt => opt.value === planData.fineMotorDuration);
        goalText += ` (Duration: ${durationOption ? durationOption.label : planData.fineMotorDuration})`;
      }
      strengthGoals.push(goalText);
    }

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

    // 🎯 PAIN GOALS
    const painGoals = [];

    if (planData.painLongTerm1 && (hasContent(planData.painPoints) || hasContent(planData.painOutcome))) {
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

    // 🎯 HOME PROGRAM/HEP GOALS
    const homeProgramGoals = [];

    if (planData.homeProgramLongTerm1 && (hasContent(planData.homeProgramProgressPerson) || hasContent(planData.homeProgramProgressOptional))) {
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

    if (planData.homeProgramLongTerm2 && (hasContent(planData.homeProgramRecallPerson) || hasContent(planData.homeProgramRecallPercent) || hasContent(planData.homeProgramRecallOf) || hasContent(planData.homeProgramRecallOutcome))) {
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

    if (planData.homeProgramLongTerm3 && (hasContent(planData.homeProgramEnergyPerson) || hasContent(planData.homeProgramEnergyOutcome))) {
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

    if (planData.homeProgramLongTerm4 && (hasContent(planData.homeProgramDemoPerson) || hasContent(planData.homeProgramDemoType) || hasContent(planData.homeProgramDemoAssistLevel))) {
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

    // 🎯 ADDITIONAL FUNCTIONAL GOALS
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

    // 🎯 DISEASE SPECIFIC GOALS
    const diseaseGoals = [];

    if (planData.diseaseGoalsLongTerm1 && (hasContent(planData.diseaseGoalsPerson1) || hasContent(planData.diseaseGoalsActivity) || hasContent(planData.diseaseGoalsOutcome))) {
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

    if (planData.diseaseGoalsLongTerm2 && (hasContent(planData.diseaseGoalsPerson2) || hasContent(planData.diseaseGoalsPhysicianContact))) {
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

    // 🎯 GLOBAL PLAN SETTINGS
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

  // 🚀 FUNCIÓN PRINCIPAL PARA COMPILAR CONTENIDO DINÁMICO
  const compileContent = () => {
    const content = {};
    
    const patientData = data.patientInfo || {};
    const objectiveData = data.objective || {};
    const assessmentData = data.assessment || {};
    const planData = data.plan || {};
    const transfersData = data.transfers || {};
    const finaleData = data.finale || {};

    // 🎯 NUEVA SECCIÓN: Plan Goals (desde Plan Section)
    const planContent = detectPlanContent(planData);
    Object.entries(planContent).forEach(([sectionName, sectionData]) => {
      content[sectionName] = sectionData;
    });

    // 🎯 SECCIÓN: Patient Information
    const patientInfo = {};
    
    if (hasContent(patientData.pastMedicalHistory)) {
      patientInfo['Past Medical History'] = patientData.pastMedicalHistory;
    }
    if (hasContent(patientData.pastTherapyHistory)) {
      patientInfo['Past Therapy History'] = patientData.pastTherapyHistory;
    }
    
    if (hasContent(patientData.heightFt) || hasContent(patientData.heightIn)) {
      const ft = patientData.heightFt || 0;
      const inches = patientData.heightIn || 0;
      if (ft > 0 || inches > 0) {
        patientInfo['Height'] = `${ft}'${inches}"`;
      }
    }
    if (hasContent(patientData.weight)) {
      patientInfo['Weight'] = `${patientData.weight} lbs`;
    }
    
    if (hasContent(patientData.weightBearingStatus)) {
      patientInfo['Weight Bearing Status'] = patientData.weightBearingStatus;
    }
    if (hasContent(patientData.nursingDiagnosis) && patientData.nursingDiagnosis !== 'see attached document') {
      patientInfo['Nursing Diagnosis'] = patientData.nursingDiagnosis;
    }
    if (hasContent(patientData.referralReasons)) {
      patientInfo['Reasons for Referral'] = patientData.referralReasons;
    }
    if (hasContent(patientData.therapyDiagnosis)) {
      patientInfo['Therapy Diagnosis'] = patientData.therapyDiagnosis;
    }
    if (hasContent(patientData.additionalDisciplines) && patientData.additionalDisciplines !== 'N/A') {
      patientInfo['Additional Disciplines'] = patientData.additionalDisciplines;
    }
    if (hasContent(patientData.expectations)) {
      patientInfo['Patient/Caregiver Expectations'] = patientData.expectations;
    }
    if (hasContent(patientData.homeboundStatus)) {
      patientInfo['Homebound Status'] = patientData.homeboundStatus;
    }
    if (hasContent(patientData.priorLevelOfFunction)) {
      patientInfo['Prior Level of Function'] = patientData.priorLevelOfFunction;
    }
    if (hasContent(patientData.surgicalProcedures)) {
      patientInfo['Surgical Procedures'] = patientData.surgicalProcedures;
    }
    if (hasContent(patientData.hospitalizationDates)) {
      patientInfo['Hospitalization Dates'] = patientData.hospitalizationDates;
    }

    if (Object.keys(patientInfo).length > 0) {
      content['Patient Information'] = patientInfo;
    }

    // 🎯 SECCIÓN: Vitals
    const vitals = {};
    
    if (hasContent(patientData.restHeartRate)) {
      vitals['Heart Rate (Rest)'] = `${patientData.restHeartRate} bpm`;
    }
    if (hasContent(patientData.exertionHeartRate)) {
      vitals['Heart Rate (After Exertion)'] = `${patientData.exertionHeartRate} bpm`;
    }
    
    if (hasContent(patientData.restSystolic) && hasContent(patientData.restDiastolic)) {
      vitals['Blood Pressure (Rest)'] = `${patientData.restSystolic}/${patientData.restDiastolic} mmHg`;
    }
    if (hasContent(patientData.exertionSystolic) && hasContent(patientData.exertionDiastolic)) {
      vitals['Blood Pressure (After Exertion)'] = `${patientData.exertionSystolic}/${patientData.exertionDiastolic} mmHg`;
    }
    
    if (hasContent(patientData.restRespirations)) {
      vitals['Respirations (Rest)'] = `${patientData.restRespirations} breaths/min`;
    }
    if (hasContent(patientData.exertionRespirations)) {
      vitals['Respirations (After Exertion)'] = `${patientData.exertionRespirations} breaths/min`;
    }
    
    if (hasContent(patientData.restO2Saturation)) {
      vitals['O2 Saturation (Rest)'] = `${patientData.restO2Saturation}%`;
    }
    if (hasContent(patientData.exertionO2Saturation)) {
      vitals['O2 Saturation (After Exertion)'] = `${patientData.exertionO2Saturation}%`;
    }
    
    if (hasContent(patientData.temperature)) {
      vitals['Temperature'] = `${patientData.temperature}°F`;
    }
    
    if (patientData.vitalsOutOfParameters) {
      vitals['Status'] = 'Vitals Out of Parameters';
    }
    if (hasContent(patientData.vitalsAdditional)) {
      vitals['Additional Notes'] = patientData.vitalsAdditional;
    }

    if (Object.keys(vitals).length > 0) {
      content['Vitals'] = vitals;
    }

    // 🎯 SECCIÓN: Pain Assessment
    const pain = {};
    
    if (patientData.experiencingPain === 'Yes') {
      pain['Experiencing Pain'] = 'Yes';
      
      if (hasContent(patientData.painLocation)) {
        pain['Location'] = patientData.painLocation;
      }
      if (hasContent(patientData.painIntensity) || patientData.painIntensity === 0) {
        pain['Intensity'] = `${patientData.painIntensity}/10`;
      }
      
      const painTypes = [];
      ['Sharp', 'Dull', 'Aching', 'Throbbing', 'Burning', 'Stabbing', 'Tingling', 'Numbness'].forEach(type => {
        if (patientData[`pain${type}`]) {
          painTypes.push(type);
        }
      });
      if (painTypes.length > 0) {
        pain['Description'] = painTypes.join(', ');
      }
      
      if (hasContent(patientData.painSeverity)) {
        pain['Severity'] = patientData.painSeverity;
      }
      if (hasContent(patientData.painEffect)) {
        pain['Effect on Function'] = patientData.painEffect;
      }
    } else if (patientData.experiencingPain === 'No') {
      pain['Experiencing Pain'] = 'No';
    }
    
    if (Object.keys(pain).length > 0) {
      content['Pain Assessment'] = pain;
    }

    // 🎯 SECCIÓN: Medication
    const medication = {};
    
    if (hasContent(patientData.medicationChanged)) {
      medication['Medication Changed'] = patientData.medicationChanged;
      
      if (hasContent(patientData.medicationAdditional)) {
        medication['Additional Information'] = patientData.medicationAdditional;
      }
    }
    
    if (Object.keys(medication).length > 0) {
      content['Medication'] = medication;
    }

    // 🎯 SECCIÓN: Objective Data
    const objective = {};
    
    if (hasContent(objectiveData.subjective)) {
      objective['Subjective'] = objectiveData.subjective;
    }

    // 🎯 COGNITIVE STATUS SECTION
    const cognitiveData = objectiveData.cognitive || {};
    const cognitiveInfo = {};

    if (cognitiveData.orientation) {
      const orientationItems = [];
      if (cognitiveData.orientation.person) orientationItems.push('Person');
      if (cognitiveData.orientation.place) orientationItems.push('Place');
      if (cognitiveData.orientation.time) orientationItems.push('Time');
      
      if (orientationItems.length > 0) {
        cognitiveInfo['Orientation'] = `Oriented to: ${orientationItems.join(', ')}`;
      }
    }

    if (hasContent(cognitiveData.reasonForTherapy)) {
      cognitiveInfo['Reason for Therapy'] = cognitiveData.reasonForTherapy;
    }

    if (hasContent(cognitiveData.shortTermMemory)) {
      cognitiveInfo['Short Term Memory'] = cognitiveData.shortTermMemory;
    }
    if (hasContent(cognitiveData.longTermMemory)) {
      cognitiveInfo['Long Term Memory'] = cognitiveData.longTermMemory;
    }

    if (hasContent(cognitiveData.attention)) {
      cognitiveInfo['Attention/Concentration'] = cognitiveData.attention;
    }
    if (hasContent(cognitiveData.sequencing)) {
      cognitiveInfo['Sequencing'] = cognitiveData.sequencing;
    }

    if (hasContent(cognitiveData.auditoryComprehension)) {
      cognitiveInfo['Auditory Comprehension'] = cognitiveData.auditoryComprehension;
    }
    if (hasContent(cognitiveData.visualComprehension)) {
      cognitiveInfo['Visual Comprehension'] = cognitiveData.visualComprehension;
    }
    if (hasContent(cognitiveData.selfControl)) {
      cognitiveInfo['Self-Control'] = cognitiveData.selfControl;
    }

    if (hasContent(cognitiveData.problemSolving)) {
      cognitiveInfo['Problem Solving'] = cognitiveData.problemSolving;
    }
    if (hasContent(cognitiveData.copingSkills)) {
      cognitiveInfo['Coping Skills'] = cognitiveData.copingSkills;
    }
    if (hasContent(cognitiveData.expressNeeds)) {
      cognitiveInfo['Ability to Express Needs'] = cognitiveData.expressNeeds;
    }

    if (hasContent(cognitiveData.safetyJudgement)) {
      cognitiveInfo['Safety/Judgement'] = cognitiveData.safetyJudgement;
    }
    if (hasContent(cognitiveData.initiationOfActivity)) {
      cognitiveInfo['Initiation of Activity'] = cognitiveData.initiationOfActivity;
    }
    if (hasContent(cognitiveData.hardOfHearing)) {
      cognitiveInfo['Hard of Hearing'] = cognitiveData.hardOfHearing;
    }

    if (hasContent(cognitiveData.additionalInformation)) {
      cognitiveInfo['Additional Cognitive Information'] = cognitiveData.additionalInformation;
    }

    // 🎯 PATIENT/CAREGIVER EDUCATION SECTION
    const educationData = objectiveData.patientEducation || {};
    const educationInfo = {};

    if (educationData.education && typeof educationData.education === 'object') {
      const selectedEducationItems = [];
      
      const educationCategories = {
        'woundCare': 'Wound Care',
        'insulinAdministration': 'Insulin Administration',
        'medicationsAdministration': 'Oral/Injected/Infused/Inhaled medication(s) Administration',
        'nutritionalManagement': 'Nutritional Management',
        'painManagement': 'Pain Management',
        'diabeticFootExam': 'Diabetic Foot Exam/Care',
        'glucometerUse': 'Glucometer Use',
        'useOfMedicalDevices': 'Use of Medical Devices',
        'oxygenUse': 'Oxygen Use',
        'ostomyCare': 'Ostomy Care',
        'trachCare': 'Trach Care',
        'caregiverPresent': 'Caregiver Present at time of visit',
        'otherCares': 'Other Care(s)',
        'satisfactoryReturnDemo': 'Satisfactory Return Demo'
      };
      
      Object.entries(educationData.education).forEach(([itemKey, isSelected]) => {
        if (isSelected && educationCategories[itemKey]) {
          selectedEducationItems.push(educationCategories[itemKey]);
        }
      });
      
      if (selectedEducationItems.length > 0) {
        educationInfo['Patient/Caregiver Independent With'] = selectedEducationItems.join(', ');
      }
    }

    if (hasContent(educationData.hasActionPlan)) {
      educationInfo['Emergency Action Plan'] = educationData.hasActionPlan;
    }

    if (hasContent(educationData.understandsInformation)) {
      educationInfo['Information Comprehension'] = educationData.understandsInformation;
    }

    if (hasContent(educationData.additionalInformation)) {
      educationInfo['Additional Education Information'] = educationData.additionalInformation;
    }

    if (Object.keys(educationInfo).length > 0) {
      content['Patient/Caregiver Education'] = educationInfo;
    }

    if (Object.keys(cognitiveInfo).length > 0) {
      content['Cognitive Status'] = cognitiveInfo;
    }

    // 🎯 PROSTHETIC/ORTHOTIC SECTION
    const prostheticOrthoticData = objectiveData.prostheticOrthotic || {};
    const prostheticOrthoticInfo = {};

    if (prostheticOrthoticData.prosthetics && prostheticOrthoticData.prosthetics.length > 0) {
      const prostheticItems = prostheticOrthoticData.prosthetics.map(item => 
        `${item.type} (${item.usage})`
      );
      prostheticOrthoticInfo['Prosthetics'] = prostheticItems.join(', ');
    }

    if (prostheticOrthoticData.orthotics && prostheticOrthoticData.orthotics.length > 0) {
      const orthoticItems = prostheticOrthoticData.orthotics.map(item => 
        `${item.type} (${item.usage})`
      );
      prostheticOrthoticInfo['Orthotics'] = orthoticItems.join(', ');
    }

    if (hasContent(prostheticOrthoticData.additionalInformation)) {
      prostheticOrthoticInfo['Additional Prosthetic/Orthotic Information'] = prostheticOrthoticData.additionalInformation;
    }

    if (Object.keys(prostheticOrthoticInfo).length > 0) {
      content['Prosthetic & Orthotic'] = prostheticOrthoticInfo;
    }

    // 🎯 SENSORY SECTION
    const sensoryData = objectiveData.sensory || {};
    const sensoryInfo = {};

    const sensoryFields = {
      'Skin': 'skin',
      'Edema': 'edema',
      'Vision': 'vision',
      'Sensation': 'sensation',
      'Communication': 'communication',
      'Hearing': 'hearing',
      'Posture': 'posture',
      'Activity Tolerance': 'activityTolerance',
      'Hand Dominance': 'handDominance'
    };

    Object.entries(sensoryFields).forEach(([displayName, fieldName]) => {
      if (hasContent(sensoryData[fieldName])) {
        sensoryInfo[displayName] = sensoryData[fieldName];
      }
    });

    if (sensoryData.cognition) {
      const cognitionItems = [];
      if (sensoryData.cognition.oriented) cognitionItems.push('Oriented');
      if (sensoryData.cognition.disoriented) cognitionItems.push('Disoriented');
      if (sensoryData.cognition.confused) cognitionItems.push('Confused');
      if (sensoryData.cognition.forgetful) cognitionItems.push('Forgetful');
      if (sensoryData.cognition.depressed) cognitionItems.push('Depressed');
      if (sensoryData.cognition.safetyJudgement) cognitionItems.push('Safety Judgement');
      
      if (cognitionItems.length > 0) {
        sensoryInfo['Cognition'] = cognitionItems.join(', ');
      }
    }

    if (sensoryData.behavior) {
      const behaviorItems = [];
      if (sensoryData.behavior.alert) behaviorItems.push('Alert');
      if (sensoryData.behavior.oriented) behaviorItems.push('Oriented');
      if (sensoryData.behavior.cooperative) behaviorItems.push('Cooperative');
      if (sensoryData.behavior.confused) behaviorItems.push('Confused');
      if (sensoryData.behavior.impairedJudgement) behaviorItems.push('Impaired Judgement');
      if (sensoryData.behavior.stmDeficits) behaviorItems.push('STM Deficits');
      if (sensoryData.behavior.ltmDeficits) behaviorItems.push('LTM Deficits');
      
      if (behaviorItems.length > 0) {
        sensoryInfo['Behavior/Mental Status'] = behaviorItems.join(', ');
      }
    }

    if (hasContent(sensoryData.additionalInformation)) {
      sensoryInfo['Additional Sensory Information'] = sensoryData.additionalInformation;
    }

    if (Object.keys(sensoryInfo).length > 0) {
      content['Sensory Assessment'] = sensoryInfo;
    }

    // 🎯 WOUND CARE SECTION
    const woundCareData = objectiveData.woundCare || {};
    const woundCareInfo = {};

    if (hasContent(woundCareData.woundDescription)) {
      woundCareInfo['Wound Description'] = woundCareData.woundDescription;
    }

    if (woundCareData.standardizedTests) {
      const woundTests = [];
      
      if (woundCareData.standardizedTests['Braden Scale']?.isComplete) {
        let testResult = 'Braden Scale: Completed';
        if (woundCareData.standardizedTests['Braden Scale'].score !== null && 
            woundCareData.standardizedTests['Braden Scale'].score !== undefined) {
          testResult = `Braden Scale: Score ${woundCareData.standardizedTests['Braden Scale'].score}`;
        }
        woundTests.push(testResult);
      }
      
      if (woundCareData.standardizedTests['Wound Assessment']?.isComplete) {
        let testResult = 'Wound Assessment: Completed';
        if (woundCareData.standardizedTests['Wound Assessment'].score !== null && 
            woundCareData.standardizedTests['Wound Assessment'].score !== undefined) {
          testResult = `Wound Assessment: Score ${woundCareData.standardizedTests['Wound Assessment'].score}`;
        }
        woundTests.push(testResult);
      }
      
      if (woundTests.length > 0) {
        woundCareInfo['Wound Care Tests'] = woundTests.join(', ');
      }
    }

    if (Object.keys(woundCareInfo).length > 0) {
      content['Wound Care'] = woundCareInfo;
    }

    // 🎯 MEDICATION TAB SECTION
    const medicationTabData = patientData.medicationTab || {};
    const medicationTabInfo = {};

    if (hasContent(medicationTabData.medicationChanged)) {
      medicationTabInfo['Medication Changed Since Last Visit'] = medicationTabData.medicationChanged;
    }

    if (medicationTabData.standardizedTests?.['Medication List']?.medications?.length > 0) {
      const medications = medicationTabData.standardizedTests['Medication List'].medications;
      const medicationNames = medications.map(med => med.name || med).filter(Boolean);
      if (medicationNames.length > 0) {
        medicationTabInfo['Current Medications'] = medicationNames.join(', ');
      }
    }

    if (hasContent(medicationTabData.medicationAdditional)) {
      medicationTabInfo['Medication Additional Information'] = medicationTabData.medicationAdditional;
    }

    if (Object.keys(medicationTabInfo).length > 0) {
      content['Detailed Medication Information'] = medicationTabInfo;
    }

    // 🎯 EQUIPMENT SECTION
    const equipmentData = objectiveData.equipment || {};
    const equipmentInfo = {};

    const equipmentGroups = {
      'Gait & Mobility': equipmentData.gaitMobility,
      'Transfers': equipmentData.transfers,
      'Toileting': equipmentData.toileting,
      'Bathing': equipmentData.bathing,
      'Bed Mobility': equipmentData.bedMobility,
      'Dressing': equipmentData.dressing,
      'Other Equipment': equipmentData.other
    };

    Object.entries(equipmentGroups).forEach(([groupName, groupData]) => {
      if (groupData && typeof groupData === 'object') {
        const selectedItems = [];
        Object.entries(groupData).forEach(([itemKey, isSelected]) => {
          if (isSelected) {
            const displayName = itemKey.replace(/([A-Z])/g, ' $1')
                                       .replace(/^./, str => str.toUpperCase());
            selectedItems.push(displayName);
          }
        });
        
        if (selectedItems.length > 0) {
          equipmentInfo[groupName] = selectedItems.join(', ');
        }
      }
    });

    if (hasContent(equipmentData.additionalInformation)) {
      equipmentInfo['Additional Equipment Information'] = equipmentData.additionalInformation;
    }

    if (Object.keys(equipmentInfo).length > 0) {
      content['Equipment'] =equipmentInfo;
    }

    // Living Arrangements
    const livingArrangements = [];
    const livingOptions = [
      'clutter', 'throwRugs', 'steps', 'stairs', 'railing', 
      'house', 'apartment', 'mobileHome', 'assistedLiving', 
      'governmentHousing', 'nursingHome'
    ];
    
    livingOptions.forEach(option => {
      if (objectiveData[option]) {
        livingArrangements.push(option.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
      }
    });
    
    if (livingArrangements.length > 0) {
      objective['Living Arrangements'] = livingArrangements.join(', ');
    }
    if (hasContent(objectiveData.livingAdditional)) {
      objective['Living Arrangements Additional'] = objectiveData.livingAdditional;
    }
    
    // Mobility/Gait
    if (objectiveData.mobilityNotApplicable) {
      objective['Gait/Mobility'] = 'Not Applicable';
    } else {
      const mobilityFeatures = [];
      if (objectiveData.levelSurface) mobilityFeatures.push('Level Surface');
      if (objectiveData.unlevelSurface) mobilityFeatures.push('Unlevel Surface');
      if (objectiveData.carpetedSurface) mobilityFeatures.push('Carpeted Surface');
      
      if (mobilityFeatures.length > 0) {
        objective['Surface Types'] = mobilityFeatures.join(', ');
      }
      if (hasContent(objectiveData.gaitQualities)) {
        objective['Gait Qualities'] = objectiveData.gaitQualities;
      }
      if (hasContent(objectiveData.stairsCurb)) {
        objective['Stairs/Curb'] = objectiveData.stairsCurb;
      }
      if (hasContent(objectiveData.sixMinuteWalk)) {
        objective['Six Minute Walk'] = `${objectiveData.sixMinuteWalk} feet`;
      }
    }
    
    // Muscle Strength/ROM
    if (hasContent(objectiveData.upperExtremities)) {
      objective['Upper Extremities'] = objectiveData.upperExtremities;
    }
    if (hasContent(objectiveData.lowerExtremities)) {
      objective['Lower Extremities'] = objectiveData.lowerExtremities;
    }
    if (hasContent(objectiveData.muscleAdditional)) {
      objective['Muscle Strength Additional'] = objectiveData.muscleAdditional;
    }
    
    // Balance
    const balanceScores = [];
    if (hasContent(objectiveData.sittingStatic)) {
      balanceScores.push(`Sitting Static: ${objectiveData.sittingStatic}`);
    }
    if (hasContent(objectiveData.sittingDynamic)) {
      balanceScores.push(`Sitting Dynamic: ${objectiveData.sittingDynamic}`);
    }
    if (hasContent(objectiveData.standingStatic)) {
      balanceScores.push(`Standing Static: ${objectiveData.standingStatic}`);
    }
    if (hasContent(objectiveData.standingDynamic)) {
      balanceScores.push(`Standing Dynamic: ${objectiveData.standingDynamic}`);
    }
    if (balanceScores.length > 0) {
      objective['Balance Scores'] = balanceScores.join(', ');
    }
    if (hasContent(objectiveData.balanceAdditional)) {
      objective['Balance Additional'] = objectiveData.balanceAdditional;
    }
    
    if (Object.keys(objective).length > 0) {
      content['Objective Assessment'] = objective;
    }

    // 🎯 SECCIÓN: Assessment
    const assessment = {};

    if (hasContent(assessmentData.rehabPotential)) {
      assessment['Rehab Potential'] = assessmentData.rehabPotential;
    }

    const problemList = [];
    const problems = [
      'decreasedROM', 'dysfunctionalPosture', 'impairedFunctionalMobility', 
      'dysfunctionalGait', 'impairedTransfers',
      'impairedFunctionalStrength', 'impairedBalance', 'impairedCoordination', 'fallRisk',
      'impairedFunctionalActivityTolerance', 'painRestrictingFunction', 'urinaryIncontinence',
      'impairedSafetyAwareness',
      'softTissueDysfunction', 'jointHypoHypermobility'
    ];

    problems.forEach(problem => {
      if (assessmentData[problem]) {
        const displayName = problem.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        problemList.push(displayName);
      }
    });

    if (problemList.length > 0) {
      assessment['Problem List'] = problemList.join(', ');
    }

    if (hasContent(assessmentData.assessmentJustification)) {
      const justificationMap = {
        'tolerated': 'Patient tolerated treatment and is benefiting from skilled PT',
        'couldNotTolerate': 'Patient could not tolerate the following treatments'
      };
      assessment['Assessment/Justification'] = justificationMap[assessmentData.assessmentJustification] || assessmentData.assessmentJustification;
    }

    const treatments = [];
    const treatmentOptions = [
      'treatmentEvaluation', 'therapeuticExercise', 'stretchingFlexibility', 'manualTherapy',
      'gaitTraining', 'transferTraining', 'balance', 'neuromuscularReeducation',
      'safetyTraining', 'establishHomeProgram', 'selfCareManagement', 'voiceTrainingEducation',
      'painModalities', 'woundCare', 'chestPhysicalTherapy', 'prostheticTherapy', 'fallRiskTreatment'
    ];

    treatmentOptions.forEach(treatment => {
      if (assessmentData[treatment]) {
        const displayName = treatment.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        treatments.push(displayName);
      }
    });

    if (treatments.length > 0) {
      assessment['Treatment Interventions'] = treatments.join(', ');
    }

    if (assessmentData.ptcgInvolvedInGoals) {
      assessment['PT & CG Agreement'] = 'PT and CG involved in development of goals and in agreement with POC';
    }

    if (hasContent(assessmentData.skilledCareProvided)) {
      assessment['Skilled Care Provided'] = assessmentData.skilledCareProvided;
    }

    if (hasContent(assessmentData.problemListAdditional)) {
      assessment['Problem List Additional Info'] = assessmentData.problemListAdditional;
    }

    if (hasContent(assessmentData.assessmentJustificationAdditional)) {
      assessment['Assessment Justification Additional Info'] = assessmentData.assessmentJustificationAdditional;
    }

    if (hasContent(assessmentData.rehabPotentialAdditional)) {
      assessment['Rehab Potential Additional Info'] = assessmentData.rehabPotentialAdditional;
    }

    if (hasContent(assessmentData.treatmentToleratedAdditional)) {
      assessment['Treatment Additional Info'] = assessmentData.treatmentToleratedAdditional;
    }

    if (Object.keys(assessment).length > 0) {
      content['Assessment'] = assessment;
    }

    // 🎯 SECCIÓN: Transfers/ADL
    const transfers = {};
    
    const transferTypes = ['sitStand', 'auto', 'bedWheelchair', 'rollTurn', 'toilet', 'sitSupine', 'tub', 'scootBridge'];
    const completedTransfers = [];
    
    transferTypes.forEach(transfer => {
      if (hasContent(transfersData[transfer])) {
        const displayName = transfer.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        completedTransfers.push(`${displayName}: ${transfersData[transfer]}`);
      }
    });
    
    if (completedTransfers.length > 0) {
      transfers['Transfers/Functional Independence'] = completedTransfers.join(', ');
    }
    
    if (hasContent(transfersData.assistanceLevel)) {
      transfers['Assistance Level'] = transfersData.assistanceLevel;
    }
    
    if (hasContent(transfersData.wheelchairInfo)) {
      transfers['Wheelchair Information'] = transfersData.wheelchairInfo;
    }
    
    const adlCategories = ['grooming', 'toileting', 'functionalMobility', 'telephoneUse', 'mealPreparation', 'medicationManagement'];
    const completedADL = [];
    
    adlCategories.forEach(adl => {
      if (hasContent(transfersData[adl])) {
        const displayName = adl.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        completedADL.push(`${displayName}: ${transfersData[adl]}`);
      }
    });
    
    if (completedADL.length > 0) {
      transfers['Activities of Daily Living'] = completedADL.join(', ');
    }
    
    if (hasContent(transfersData.additionalInformation)) {
      transfers['Additional ADL Information'] = transfersData.additionalInformation;
    }
    
    if (Object.keys(transfers).length > 0) {
      content['Transfers & ADL'] = transfers;
    }

    // 🎯 SECCIÓN: Standardized Tests
    const allTests = {
      ...patientData.standardizedTests,
      ...objectiveData.standardizedTests
    };
    
    if (allTests && Object.keys(allTests).length > 0) {
      const tests = {};
      Object.entries(allTests).forEach(([testName, testData]) => {
        if (testData?.isComplete) {
          let testResult = 'Completed';
          if (testData.score !== null && testData.score !== undefined) {
            testResult = `Score: ${testData.score}`;
          }
          if (testData.riskLevel) {
            testResult += ` (${testData.riskLevel})`;
          }
          tests[testName] = testResult;
        }
      });
      
      if (Object.keys(tests).length > 0) {
        content['Standardized Tests'] = tests;
      }
    }

    return content;
  };

  // Compilar contenido cuando cambie la data
  useEffect(() => {
    if (activeSection === 'finalize') {
      setIsLoading(true);
      setTimeout(() => {
        const compiled = compileContent();
        setCompiledContent(compiled);
        setAnimationKey(prev => prev + 1);
        setIsLoading(false);
      }, 300);
    }
  }, [data, activeSection]);

  const handleChange = (field, value) => {
  const updatedData = {
    ...data,
    [field]: value  // O la estructura que estés usando
  };
  
  onChange(updatedData);
};

  // 🎯 Time calculation utilities
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const [units, setUnits] = useState('(4) - 53-67 minutes');

  useEffect(() => {
    if (data.finale?.timeInHour && data.finale?.timeInMinute && data.finale?.timeOutHour && 
        data.finale?.timeOutMinute && data.finale?.timeInAmPm && data.finale?.timeOutAmPm) {
      const timeInMinutes = calculateTotalMinutes(data.finale.timeInHour, data.finale.timeInMinute, data.finale.timeInAmPm);
      const timeOutMinutes = calculateTotalMinutes(data.finale.timeOutHour, data.finale.timeOutMinute, data.finale.timeOutAmPm);
      let diffMinutes = timeOutMinutes - timeInMinutes;
      if (diffMinutes < 0) diffMinutes += 24 * 60;

      let unitValue = '(0) - 0 minutes';
      if (diffMinutes >= 8 && diffMinutes <= 22) unitValue = '(1) - 8-22 minutes';
      else if (diffMinutes >= 23 && diffMinutes <= 37) unitValue = '(2) - 23-37 minutes';
      else if (diffMinutes >= 38 && diffMinutes <= 52) unitValue = '(3) - 38-52 minutes';
      else if (diffMinutes >= 53 && diffMinutes <= 67) unitValue = '(4) - 53-67 minutes';
      else if (diffMinutes >= 68 && diffMinutes <= 82) unitValue = '(5) - 68-82 minutes';
      else if (diffMinutes >= 83) unitValue = '(6+) - 83+ minutes';

      setUnits(unitValue);
    }
  }, [data.finale?.timeInHour, data.finale?.timeInMinute, data.finale?.timeOutHour, data.finale?.timeOutMinute, data.finale?.timeInAmPm, data.finale?.timeOutAmPm]);

  const calculateTotalMinutes = (hour, minute, ampm) => {
    let h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (ampm === 'PM' && h !== 12) h += 12;
    else if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  // 🎯 Signature handlers
  const handlePatientSignatureChange = (signatureData) => {
    handleChange('patientSignature', signatureData);
  };

  const handleTherapistSignatureChange = (signatureData) => {
    handleChange('therapistSignature', signatureData);
  };

  const handleDateSignatureChange = (signatureData) => {
    handleChange('dateSignature', signatureData);
  };

  const handleMoveSignatureToPatient = () => {
    if (data.finale?.therapistSignature) {
      handleChange('patientSignature', data.finale.therapistSignature);
      handleChange('therapistSignature', null);
    }
  };

  const handleMoveDateToPatient = () => {
    if (data.finale?.dateSignature) {
      handleChange('patientSignature', data.finale.dateSignature);
      handleChange('dateSignature', null);
    }
  };

  // 🎯 Render dynamic content with ULTRA PREMIUM styling
  const renderDynamicContent = () => {
    if (Object.keys(compiledContent).length === 0) {
      return (
        <div className="empty-state-container">
          <div className="empty-state-animation">
            <div className="floating-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <div className="pulse-rings">
              <div className="pulse-ring ring-1"></div>
              <div className="pulse-ring ring-2"></div>
              <div className="pulse-ring ring-3"></div>
            </div>
          </div>
          <div className="empty-state-content">
            <h3>Awaiting Content Generation</h3>
            <p>Complete the evaluation forms to see your content automatically compiled here.</p>
            <div className="getting-started-tips">
              <h4>Quick Start Guide:</h4>
              <div className="tips-grid">
                <div className="tip-card">
                  <i className="fas fa-user-md"></i>
                  <span>Patient Information</span>
                </div>
                <div className="tip-card">
                  <i className="fas fa-heartbeat"></i>
                  <span>Vital Signs</span>
                </div>
                <div className="tip-card">
                  <i className="fas fa-bolt"></i>
                  <span>Pain Assessment</span>
                </div>
                <div className="tip-card">
                  <i className="fas fa-target"></i>
                  <span>Set Goals in Plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="dynamic-content-grid" key={animationKey}>
        {Object.entries(compiledContent).map(([sectionName, sectionData], index) => (
          <div 
            key={sectionName} 
            className="content-card"
            style={{ '--delay': `${index * 0.1}s` }}
          >
            <div className="card-header-premium">
              <div className="header-icon">
                <i className={`fas ${getSectionIcon(sectionName)}`}></i>
              </div>
              <div className="header-content">
                <h3>{sectionName}</h3>
                <span className="item-count">
                  {Array.isArray(sectionData) ? sectionData.length : Object.keys(sectionData).length} items
                </span>
              </div>
              <div className="header-decoration"></div>
            </div>
            
            <div className="card-body-premium">
              {Array.isArray(sectionData) ? (
                <div className="goals-container">
                  {sectionData.map((goal, goalIndex) => (
                    <div key={goalIndex} className="goal-item-premium">
                      <div className="goal-marker"></div>
                      <div className="goal-content">{goal}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="data-container">
                  {Object.entries(sectionData).map(([fieldName, fieldValue]) => (
                    <div key={fieldName} className="data-row-premium">
                      <div className="data-label">{fieldName}</div>
                      <div className="data-value">{fieldValue}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 🎯 Get section icons
  const getSectionIcon = (sectionName) => {
    const icons = {
      'Patient Information': 'fa-user-alt',
      'Vitals': 'fa-heartbeat',
      'Pain Assessment': 'fa-bolt',
      'Medication': 'fa-pills',
      'Objective Assessment': 'fa-microscope',
      'Assessment': 'fa-clipboard-check',
      'Transfers & ADL': 'fa-exchange-alt',
      'Standardized Tests': 'fa-clipboard-list',
      'Cognitive Status': 'fa-brain',
      'ADL Goals': 'fa-utensils',
      'Equipment': 'fa-wheelchair',
      'Transfer Goals': 'fa-bed',
      'Patient/Caregiver Education': 'fa-chalkboard-teacher',
      'Balance Goals': 'fa-balance-scale',
      'Sensory Assessment': 'fa-eye',
      'Strength/ROM/Activity Tolerance Goals': 'fa-dumbbell',
      'Pain Goals': 'fa-hand-holding-medical',
      'Home Program/HEP Goals': 'fa-home',
      'Additional Functional Goals': 'fa-plus-circle',
      'Disease Specific Goals': 'fa-stethoscope',
      'Plan Settings': 'fa-cogs',
      'Prosthetic & Orthotic': 'fa-prosthetic',
      'Wound Care': 'fa-band-aid',
      'Detailed Medication Information': 'fa-prescription-bottle-alt'
    };
    return icons[sectionName] || 'fa-info-circle';
  };

  return (
    <div className="finale-section-ultra-premium">
      {/* 🚀 ULTRA PREMIUM NAVIGATION */}
      <div className="navigation-container">
        <div className="nav-header">
          <div className="nav-title">
            <i className="fas fa-flag-checkered"></i>
            <h2>Document Finalization</h2>
          </div>
          <div className="nav-badge">
            <span className={`status-indicator ${autoSaveMessage ? 'saved' : 'pending'}`}>
              <i className={`fas ${autoSaveMessage ? 'fa-check-circle' : 'fa-sync-alt'}`}></i>
              {autoSaveMessage || 'Auto-saving...'}
            </span>
          </div>
        </div>
        
        <div className="nav-tabs-premium">
          <button 
            className={`nav-tab ${activeSection === 'signatures' ? 'active' : ''}`}
            onClick={() => setActiveSection('signatures')}
          >
            <div className="tab-icon">
              <i className="fas fa-signature"></i>
            </div>
            <div className="tab-content-F">
              <span className="tab-title">Signatures & Forms</span>
              <span className="tab-subtitle">Complete documentation</span>
            </div>
          </button>
          
          <button 
            className={`nav-tab ${activeSection === 'finalize' ? 'active' : ''}`}
            onClick={() => setActiveSection('finalize')}
          >
            <div className="tab-icon">
              <i className="fas fa-eye"></i>
            </div>
            <div className="tab-content-F">
              <span className="tab-title">Review & Finalize</span>
              <span className="tab-subtitle">Content overview</span>
            </div>
          </button>
        </div>
      </div>

      {/* 🎯 CONTENT SECTIONS */}
      <div className="content-container">
        {activeSection === 'signatures' && (
          <div className="signatures-section">
            <div className="section-grid">
              
              {/* 🔥 ADDITIONAL FORMS */}
              <div className="form-card">
                <div className="form-header">
                  <div className="header-icon">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <div className="header-content">
                    <h3>Additional Forms</h3>
                    <p>Select required documentation forms</p>
                  </div>
                </div>
                
                <div className="form-body">
                  <div className="forms-reference-mini">
                    <div className="reference-grid">
                      <div className="ref-item">
                        <span className="code">NOMNC</span>
                        <span className="desc">Notice of Medicare Non-Coverage</span>
                      </div>
                      <div className="ref-item">
                        <span className="code">ABN</span>
                        <span className="desc">Advance Beneficiary Notice</span>
                      </div>
                      <div className="ref-item">
                        <span className="code">HHCCN</span>
                        <span className="desc">Home Health Change Notice</span>
                      </div>
                      <div className="ref-item">
                        <span className="code">PRN</span>
                        <span className="desc">Patient's Rights</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="checkbox-grid-premium">
                    <label className="checkbox-card">
                      <input 
                        type="checkbox" 
                        checked={data.finale?.nomnc || false}
                        onChange={(e) => handleChange('nomnc', e.target.checked)}
                      />
                      <div className="checkbox-content">
                        <div className="checkbox-icon">
                          <i className="fas fa-file-medical"></i>
                        </div>
                        <span>NOMNC</span>
                      </div>
                      <div className="checkbox-indicator"></div>
                    </label>
                    
                    <label className="checkbox-card">
                      <input 
                        type="checkbox" 
                        checked={data.finale?.abn || false}
                        onChange={(e) => handleChange('abn', e.target.checked)}
                      />
                      <div className="checkbox-content">
                        <div className="checkbox-icon">
                          <i className="fas fa-file-invoice-dollar"></i>
                        </div>
                        <span>ABN</span>
                      </div>
                      <div className="checkbox-indicator"></div>
                    </label>
                    
                    <label className="checkbox-card">
                      <input 
                        type="checkbox" 
                        checked={data.finale?.hhccn || false}
                        onChange={(e) => handleChange('hhccn', e.target.checked)}
                      />
                      <div className="checkbox-content">
                        <div className="checkbox-icon">
                          <i className="fas fa-file-medical-alt"></i>
                        </div>
                        <span>HHCCN</span>
                      </div>
                      <div className="checkbox-indicator"></div>
                    </label>
                    
                    <label className="checkbox-card">
                      <input 
                        type="checkbox" 
                        checked={data.finale?.patientsRights || false}
                        onChange={(e) => handleChange('patientsRights', e.target.checked)}
                      />
                      <div className="checkbox-content">
                        <div className="checkbox-icon">
                          <i className="fas fa-user-shield"></i>
                        </div>
                        <span>Patient Rights</span>
                      </div>
                      <div className="checkbox-indicator"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 🔥 PATIENT SIGNATURE */}
              <div className="form-card">
                <div className="form-header">
                  <div className="header-icon">
                    <i className="fas fa-user-edit"></i>
                  </div>
                  <div className="header-content">
                    <h3>Patient Signature</h3>
                    <p>Capture patient authorization</p>
                  </div>
                </div>
                
                <div className="form-body">
                  <div className="external-capture-option">
                    <label className="external-toggle">
                      <input 
                        type="checkbox" 
                        checked={data.finale?.capturedSignatureOutside || false}
                        onChange={(e) => handleChange('capturedSignatureOutside', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">Signature captured externally</span>
                    </label>
                  </div>
                  
                  <div className="signature-wrapper">
                    <SignaturePad 
                      label="PATIENT SIGNATURE" 
                      onSignatureChange={handlePatientSignatureChange}
                      initialSignature={data.finale?.patientSignature}
                      disabled={data.finale?.capturedSignatureOutside}
                    />
                  </div>
                </div>
              </div>

              {/* 🔥 THERAPIST SIGNATURE */}
              <div className="form-card">
                <div className="form-header">
                  <div className="header-icon">
                    <i className="fas fa-user-md"></i>
                  </div>
                  <div className="header-content">
                    <h3>Therapist Signature</h3>
                    <p>Professional authorization</p>
                  </div>
                </div>
                
                <div className="form-body">
                  <div className="external-capture-option">
                    <label className="external-toggle">
                      <input 
                        type="checkbox" 
                        checked={data.finale?.therapistSignatureOutside || false}
                        onChange={(e) => handleChange('therapistSignatureOutside', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">Signature captured externally</span>
                    </label>
                  </div>
                  
                  {data.finale?.therapistSignature && (
                    <div className="signature-control">
                      <button 
                        className="move-signature-btn"
                        onClick={handleMoveSignatureToPatient}
                      >
                        <i className="fas fa-exchange-alt"></i>
                        Move to Patient Section
                      </button>
                    </div>
                  )}
                  
                  <div className="signature-wrapper">
                    <SignaturePad 
                      label="THERAPIST SIGNATURE" 
                      onSignatureChange={handleTherapistSignatureChange}
                      initialSignature={data.finale?.therapistSignature}
                      disabled={data.finale?.therapistSignatureOutside}
                    />
                  </div>
                </div>
              </div>

              {/* 🔥 DATE SIGNATURE */}
              <div className="form-card">
                <div className="form-header">
                  <div className="header-icon">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <div className="header-content">
                    <h3>Date Signature</h3>
                    <p>Timestamp documentation</p>
                  </div>
                </div>
                
                <div className="form-body">
                  {data.finale?.dateSignature && (
                    <div className="signature-control">
                      <button 
                        className="move-signature-btn"
                        onClick={handleMoveDateToPatient}
                      >
                        <i className="fas fa-exchange-alt"></i>
                        Move to Patient Section
                      </button>
                    </div>
                  )}
                  
                  <div className="signature-wrapper">
                    <SignaturePad 
                      label="DATE SIGNATURE" 
                      onSignatureChange={handleDateSignatureChange}
                      initialSignature={data.finale?.dateSignature}
                    />
                  </div>
                </div>
              </div>

              {/* 🔥 TIME IN/OUT */}
              <div className="form-card time-card">
                <div className="form-header">
                  <div className="header-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="header-content">
                    <h3>Time Tracking</h3>
                    <p>Session duration management</p>
                  </div>
                </div>
                
                <div className="form-body">
                  <div className="time-tracking-container">
                    <div className="time-input-groups">
                      <div className="time-group">
                        <div className="time-label">
                          <i className="fas fa-sign-in-alt"></i>
                          <span>Time In</span>
                        </div>
                        <div className="time-selectors">
                          <select 
                            value={data.finale?.timeInHour || '05'}
                            onChange={(e) => handleChange('timeInHour', e.target.value)}
                            className="time-select"
                          >
                            {hours.map(hour => (
                              <option key={`in-hour-${hour}`} value={hour}>{hour}</option>
                            ))}
                          </select>
                          <span className="time-separator">:</span>
                          <select 
                            value={data.finale?.timeInMinute || '15'}
                            onChange={(e) => handleChange('timeInMinute', e.target.value)}
                            className="time-select"
                          >
                            {minutes.map(minute => (
                              <option key={`in-min-${minute}`} value={minute}>{minute}</option>
                            ))}
                          </select>
                          <select 
                            value={data.finale?.timeInAmPm || 'AM'}
                            onChange={(e) => handleChange('timeInAmPm', e.target.value)}
                            className="time-select ampm"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="time-group">
                        <div className="time-label">
                          <i className="fas fa-sign-out-alt"></i>
                          <span>Time Out</span>
                        </div>
                        <div className="time-selectors">
                          <select 
                            value={data.finale?.timeOutHour || '06'}
                            onChange={(e) => handleChange('timeOutHour', e.target.value)}
                            className="time-select"
                          >
                            {hours.map(hour => (
                              <option key={`out-hour-${hour}`} value={hour}>{hour}</option>
                            ))}
                          </select>
                          <span className="time-separator">:</span>
                          <select 
                            value={data.finale?.timeOutMinute || '09'}
                            onChange={(e) => handleChange('timeOutMinute', e.target.value)}
                            className="time-select"
                          >
                            {minutes.map(minute => (
                              <option key={`out-min-${minute}`} value={minute}>{minute}</option>
                            ))}
                          </select>
                          <select 
                            value={data.finale?.timeOutAmPm || 'AM'}
                            onChange={(e) => handleChange('timeOutAmPm', e.target.value)}
                            className="time-select ampm"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="time-group drive-time">
                        <div className="time-label">
                          <i className="fas fa-car"></i>
                          <span>Drive Time</span>
                        </div>
                        <div className="time-selectors">
                          <select 
                            value={data.finale?.driveTimeHour || '0'}
                            onChange={(e) => handleChange('driveTimeHour', e.target.value)}
                            className="time-select"
                          >
                            {Array.from({ length: 5 }, (_, i) => String(i)).map(hour => (
                              <option key={`drive-hour-${hour}`} value={hour}>{hour}</option>
                            ))}
                          </select>
                          <span className="time-separator">:</span>
                          <select 
                            value={data.finale?.driveTimeMinute || '00'}
                            onChange={(e) => handleChange('driveTimeMinute', e.target.value)}
                            className="time-select"
                          >
                            {minutes.map(minute => (
                              <option key={`drive-min-${minute}`} value={minute}>{minute}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="units-display-premium">
                      <div className="units-card">
                        <div className="units-icon">
                          <i className="fas fa-calculator"></i>
                        </div>
                        <div className="units-content">
                          <span className="units-label">Calculated Units</span>
                          <span className="units-value">{units}</span>
                        </div>
                        <div className="units-decoration"></div>
                      </div>
                    </div>
                    
                    <div className="time-notice">
                      <div className="notice-icon">
                        <i className="fas fa-info-circle"></i>
                      </div>
                      <div className="notice-text">
                        <p>System defaults to current time as Time In and suggests units (4) for Time Out. 
                        Adjust as needed for accurate billing. Leave drive time at 0 for first visit of the day.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'finalize' && (
          <div className="finalize-section">
            <div className="finalize-header">
              <div className="header-content">
                <h2>
                  <i className="fas fa-magic"></i>
                  Evaluation Content Overview
                </h2>
                <div className="content-stats">
                  <div className="stat-item">
                    <span className="stat-number">{Object.keys(compiledContent).length}</span>
                    <span className="stat-label">Sections</span>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <span className="stat-number">
                      {Object.values(compiledContent).reduce((total, section) => {
                        return total + (Array.isArray(section) ? section.length : Object.keys(section).length);
                      }, 0)}
                    </span>
                    <span className="stat-label">Data Points</span>
                  </div>
                </div>
              </div>
              
              {isLoading && (
                <div className="loading-indicator">
                  <div className="loading-spinner"></div>
                  <span>Compiling content...</span>
                </div>
              )}
            </div>
            
            <div className="dynamic-content-section">
              {renderDynamicContent()}
            </div>
            
            {/* 🎯 VISIT SUMMARY PREMIUM */}
            <div className="visit-summary-premium">
              <div className="summary-header">
                <h3>
                  <i className="fas fa-clipboard-check"></i>
                  Visit Summary
                </h3>
              </div>
              
              <div className="summary-grid">
                <div className="summary-card facility-card">
                  <div className="card-header">
                    <i className="fas fa-hospital-alt"></i>
                    <h4>Facility Information</h4>
                  </div>
                  <div className="card-content">
                    <div className="facility-address">
                      <p>14445 Avenida Colonia<br />
                         Moorpark, CA 93021<br />
                         (805) 223-4094</p>
                    </div>
                    <div className="patient-details-grid">
                      <div className="detail-row">
                        <span className="label">DOB:</span>
                        <span className="value">{data.dob || 'Not provided'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Frequency:</span>
                        <span className="value">{data.frequency || 'Not provided'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Cert Period:</span>
                        <span className="value">{data.certPeriod || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="summary-card visit-card">
                  <div className="card-header">
                    <i className="fas fa-calendar-alt"></i>
                    <h4>Visit Details</h4>
                  </div>
                  <div className="card-content">
                    <div className="visit-details-grid">
                      <div className="detail-row">
                        <span className="label">Physician:</span>
                        <span className="value">{data.physician || 'Not provided'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Agency:</span>
                        <span className="value">{data.agency || 'Not provided'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Visit Date:</span>
                        <span className="value">{data.visitDate || 'Not provided'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Time In:</span>
                        <span className="value">
                          {data.finale?.timeInHour || 'Not set'}:{data.finale?.timeInMinute || 'Not set'} {data.finale?.timeInAmPm || 'Not set'} PST
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Time Out:</span>
                        <span className="value">
                          {data.finale?.timeOutHour || 'Not set'}:{data.finale?.timeOutMinute || 'Not set'} {data.finale?.timeOutAmPm || 'Not set'} PST
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Supervisor:</span>
                        <span className="value">{data.supervisor || 'Not provided'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Therapist:</span>
                        <span className="value">{data.therapist || 'Not provided'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Company:</span>
                        <span className="value">{data.company || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 🎯 DIGITAL SIGNATURES PREMIUM */}
              <div className="signatures-summary-premium">
                <div className="signatures-header">
                  <h4>
                    <i className="fas fa-signature"></i>
                    Digital Signatures
                  </h4>
                  <div className="digital-badge">
                    <i className="fas fa-shield-alt"></i>
                    <span>Digitally Approved</span>
                  </div>
                </div>
                
                <div className="signatures-grid">
                  <div className="signature-display">
                    <div className="signature-label">Patient (HATCHER, LEONARD)</div>
                    <div className="signature-preview">
                      {data.finale?.patientSignature ? (
                        <img src={data.finale.patientSignature} alt="Patient Signature" />
                      ) : (
                        <div className="no-signature-state">
                          <i className="fas fa-signature"></i>
                          <span>No signature captured</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="signature-display">
                    <div className="signature-label">Therapist (Weiss, Barry, PT)</div>
                    <div className="signature-preview">
                      {data.finale?.therapistSignature ? (
                        <img src={data.finale.therapistSignature} alt="Therapist Signature" />
                      ) : (
                        <div className="no-signature-state">
                          <i className="fas fa-signature"></i>
                          <span>No signature captured</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="signature-display">
                    <div className="signature-label">Date</div>
                    <div className="signature-preview">
                      {data.finale?.dateSignature ? (
                        <img src={data.finale.dateSignature} alt="Date Signature" />
                      ) : (
                        <div className="no-signature-state">
                          <i className="fas fa-calendar-day"></i>
                          <span>No date captured</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="compliance-note">
                  <i className="fas fa-info-circle"></i>
                  <p>Digital signatures are approved by Home Health Care Governing Bodies and Federal Guidelines.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinaleSection;