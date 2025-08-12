// Index file for all sections - EXACT 18 sections for dynamic template system
// Ready for backend template integration

// ============== THE EXACT 18 SECTIONS ==============

// 1. SubjectiveSection (de ObjectiveSection)
export { default as SubjectiveSection } from './SubjectiveSection';

// 2. VitalsSection (de PTEvaluation)
export { default as VitalsSection } from './VitalsSection';

// 3. PainSection (de PTEvaluation)
export { default as PainSection } from './PainSection';

// 4. MedicationSection (de PTEvaluation)
export { default as MedicationSection } from './MedicationSection';

// 5. LivingArrangementsSection (de ObjectiveSection)
export { default as LivingArrangementsSection } from './LivingArrangementsSection';

// 6. GaitMobilitySection (de ObjectiveSection)
export { default as GaitMobilitySection } from './GaitMobilitySection';

// 7. MuscleStrengthSection (de ObjectiveSection)
// 8. BalanceSection (de ObjectiveSection)
export {
  MuscleStrengthSection,
  BalanceSection
} from './MuscleBalanceSections';

// 9. TransfersFunctionalSection (de TransfersSection)
export { default as TransfersFunctionalSection } from './TransfersFunctionalSection';

// 10. ADLSelfCareSection (de TransfersSection)
export { default as ADLSelfCareSection } from './ADLSelfCareSection';

// 10b. ADLSelfCareSkillsSection (Nueva sección completa)
export { default as ADLSelfCareSkillsSection } from './ADLSelfCareSkillsSection';

// 10c. AssessmentJustificationSkillsSection (Nueva sección Assessment/Justification)
export { default as AssessmentJustificationSkillsSection } from './AssessmentJustificationSkillsSection';

// 10d. BalanceSkillsSection (Nueva sección Balance)
export { default as BalanceSkillsSection } from './BalanceSkillsSection';

// 10e. VitalsSkillsSection (Nueva sección Vitals)
export { default as VitalsSkillsSection } from './VitalsSkillsSection';

// 10f. PainSkillsSection (Nueva sección Pain)
export { default as PainSkillsSection } from './PainSkillsSection';

// 10g. LivingArrangementsSkillsSection (Nueva sección Living Arrangements)
export { default as LivingArrangementsSkillsSection } from './LivingArrangementsSkillsSection';

// 10h. CognitiveStatusSkillsSection (Nueva sección Cognitive Status / Comprehension)
export { default as CognitiveStatusSkillsSection } from './CognitiveStatusSkillsSection';

// 10i. SensorySkillsSection (Nueva sección Sensory)
export { default as SensorySkillsSection } from './SensorySkillsSection';

// 10j. EquipmentSkillsSection (Nueva sección Equipment)
export { default as EquipmentSkillsSection } from './EquipmentSkillsSection';

// 10k. GaitMobilityTrainingSkillsSection (Nueva sección Gait / Mobility Training)
export { default as GaitMobilityTrainingSkillsSection } from './GaitMobilityTrainingSkillsSection';

// 10l. MuscleStrengthROMSkillsSection (Nueva sección Muscle Strength/ROM)
export { default as MuscleStrengthROMSkillsSection } from './MuscleStrengthROMSkillsSection';

// 10m. TransfersFunctionalIndependenceSkillsSection (Nueva sección mejorada Transfers / Functional Independence)
export { default as TransfersFunctionalIndependenceSkillsSection } from './TransfersFunctionalIndependenceSkillsSection';

// 10n. ProstheticOrthoticSkillsSection (Nueva sección Prosthetic And Orthotic)
export { default as ProstheticOrthoticSkillsSection } from './ProstheticOrthoticSkillsSection';

// 10o. PatientCaregiverEducationSkillsSection (Nueva sección Patient / Caregiver Education)
export { default as PatientCaregiverEducationSkillsSection } from './PatientCaregiverEducationSkillsSection';

// 10p. SkilledCareProvidedThisVisitSkillsSection (Nueva sección Skilled Care Provided This Visit)
export { default as SkilledCareProvidedThisVisitSkillsSection } from './SkilledCareProvidedThisVisitSkillsSection';

// 10q. ProblemListFunctionalLimitationsSkillsSection (Nueva sección Problem List / Functional Limitations)
export { default as ProblemListFunctionalLimitationsSkillsSection } from './ProblemListFunctionalLimitationsSkillsSection';

// 10r. RehabPotentialSkillsSection (Nueva sección Rehab Potential)
export { default as RehabPotentialSkillsSection } from './RehabPotentialSkillsSection';

// 10s. TreatmentAsToleratedBasicPOCSkillsSection (Nueva sección Treatment as Tolerated/Basic POC)
export { default as TreatmentAsToleratedBasicPOCSkillsSection } from './TreatmentAsToleratedBasicPOCSkillsSection';

// 10t. ShortLongTermGoalsSkillsSection (Nueva sección Short & Long Term Goals - LA MÁS IMPORTANTE)
export { default as ShortLongTermGoalsSkillsSection } from './ShortLongTermGoalsSkillsSection';

// 11. StandardizedTestsSection (múltiples ubicaciones)
export { default as StandardizedTestsSection } from './StandardizedTestsSection';

// 12. ProblemListSection (de AssessmentSection)
// 13. AssessmentJustificationSection (de AssessmentSection)
// 14. RehabPotentialSection (de AssessmentSection)
// 16. SkilledCareSection (de AssessmentSection)
export { 
  ProblemListSection,
  AssessmentJustificationSection,
  RehabPotentialSection,
  SkilledCareSection
} from './AssessmentSections';

// 15. TreatmentInterventionsSection (de AssessmentSection) - SEPARADA
export { default as TreatmentInterventionsSection } from './TreatmentInterventionsSection';

// 17. GoalsSection (de PlanSection)
export { default as GoalsSection } from './GoalsSection';

// 18. SignaturesSection (SignaturePad.jsx - ya modular)
export { default as SignatureSection } from './SignatureSection';