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