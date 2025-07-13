import React, { useState, useEffect, useRef } from 'react';
import '../../../../../styles/developer/Patients/InfoPaciente/ExercisesComponent.scss';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import gsap from 'gsap';

// Import all exercise images - TODAS LAS QUE EXISTEN REALMENTE
// Ankle exercises
import AnkleDorsiflexionBalance from '../../../../../assets/exercises/Ankle-Dorsiflexion-Balance.png';
import AnkleDorsiflexionCoordination from '../../../../../assets/exercises/Ankle-Dorsiflexion-Coordinatio.png';
import AnkleDorsiflexionStrengthening from '../../../../../assets/exercises/Ankle-Dorsiflexion-Strengthening.png';
import AnkleEversionBalance from '../../../../../assets/exercises/Ankle-Eversion-Balance.png';
import AnkleEversionCoordination from '../../../../../assets/exercises/Ankle-Eversion-Coordination.png';
import AnkleEversionFunctional from '../../../../../assets/exercises/Ankle-Eversion-Functional.png';
import AnkleEversionStretching from '../../../../../assets/exercises/Ankle-Eversion-Stretching.png';
import AnkleInversionBalance from '../../../../../assets/exercises/Ankle-Inversion-Balance.png';
import AnkleInversionCoordination from '../../../../../assets/exercises/Ankle-Inversion-Coordination.png';
import AnkleInversionStrengthening from '../../../../../assets/exercises/Ankle-Inversion-Strengthening.png';
import AnkleInversionStretching from '../../../../../assets/exercises/Ankle-Inversion-Stretching.png';
import AnklePlantarflexionCoordination from '../../../../../assets/exercises/Ankle-Plantarflexion-Coordination.png';
import AnklePlantarflexionStrengthening from '../../../../../assets/exercises/Ankle-Plantarflexion-Strengthening.png';

// Arm exercises
import ArmChairPush from '../../../../../assets/exercises/Arm-Chair-Push.png';

// Back exercises
import BackLowerBalance from '../../../../../assets/exercises/Back-Lower-Balance.png';
import BackLowerCoordination from '../../../../../assets/exercises/Back-Lower-Coordination.png';
import BackLowerStretching from '../../../../../assets/exercises/Back-Lower-Stretching.png';
import BackMiddleBalance from '../../../../../assets/exercises/Back-Middle-Balance.png';
import BackMiddleCoordination from '../../../../../assets/exercises/Back-Middle-Coordination.png';
import BackMiddleEndurance from '../../../../../assets/exercises/Back-Middle-Endurance.png';
import BackMiddleStrengthening from '../../../../../assets/exercises/Back-Middle-Strengthening.png';
import BackMiddleStretching from '../../../../../assets/exercises/Back-Middle-Stretching.png';
import BackStabilizationBalance from '../../../../../assets/exercises/Back-Stabilization-Balance.png';
import BackStabilizationCoordination from '../../../../../assets/exercises/Back-Stabilization-Coordination.png';
import BackStabilizationStrengthening from '../../../../../assets/exercises/Back-Stabilization-Strengthening.png';
import BackStabilizationStretching from '../../../../../assets/exercises/Back-Stabilization-Stretching.png';
import BackUpperBalance from '../../../../../assets/exercises/Back-Upper-Balance.png';
import BackUpperCoordination from '../../../../../assets/exercises/Back-Upper-Coordination.png';
import BackUpperStretching from '../../../../../assets/exercises/Back-Upper-Stretching.png';

// Core exercises
import CoreAbdominalBalance from '../../../../../assets/exercises/Core-Abdominal-Balance.png';
import CoreAbdominalCoordination from '../../../../../assets/exercises/Core-Abdominal-Coordination.png';
import CoreAbdominalStrengthening from '../../../../../assets/exercises/Core-Abdominal-Strengthening.png';
import CoreAbdominalStretching from '../../../../../assets/exercises/Core-Abdominal-Stretching.png';
import CoreLumbarBalance from '../../../../../assets/exercises/Core-Lumbar-Balance.png';
import CoreLumbarCoordination from '../../../../../assets/exercises/Core-Lumbar-Coordination.png';
import CoreLumbarStrengthening from '../../../../../assets/exercises/Core-Lumbar-Strengthening.png';
import CoreLumbarStretching from '../../../../../assets/exercises/Core-Lumbar-Stretching.png';
import CoreObliqueBalance from '../../../../../assets/exercises/Core-Oblique-Balance.png';
import CoreObliqueCoordination from '../../../../../assets/exercises/Core-Oblique-Coordination.png';
import CoreObliqueStrengthening from '../../../../../assets/exercises/Core-Oblique-Strengthening.png';
import CoreObliqueStretching from '../../../../../assets/exercises/Core-Oblique-Stretching.png';
import CorePelvicBalance from '../../../../../assets/exercises/Core-Pelvic-Balance.png';
import CorePelvicCoordination from '../../../../../assets/exercises/Core-Pelvic-Coordination.png';
import CorePelvicStrengthening from '../../../../../assets/exercises/Core-Pelvic-Strengthening.png';
import CorePelvicStretching from '../../../../../assets/exercises/Core-Pelvic-Stretching.png';

// Special exercises
import DeepSquat from '../../../../../assets/exercises/Deep-Squat.png';

// Elbow exercises
import ElbowExtensionBalance from '../../../../../assets/exercises/Elbow-Extension-Balance.png';
import ElbowExtensionCoordination from '../../../../../assets/exercises/Elbow-Extension-Coordination.png';
import ElbowExtensionStrengthening from '../../../../../assets/exercises/Elbow-Extension-Strengthening.png';
import ElbowExtensionStretching from '../../../../../assets/exercises/Elbow-Extension-Stretching.png';
import ElbowFlexionBalance from '../../../../../assets/exercises/Elbow-Flexion-Balance.png';
import ElbowFlexionCoordination from '../../../../../assets/exercises/Elbow-Flexion-Coordination.png';
import ElbowFlexionStrengthening from '../../../../../assets/exercises/Elbow-Flexion-Strengthening.png';
import ElbowFlexionStretching from '../../../../../assets/exercises/Elbow-Flexion-Stretching.png';
import ElbowPronationBalance from '../../../../../assets/exercises/Elbow-Pronation-Balance.png';
import ElbowPronationCoordination from '../../../../../assets/exercises/Elbow-Pronation-Coordination.png';
import ElbowPronationStrengthening from '../../../../../assets/exercises/Elbow-Pronation-Strengthening.png';
import ElbowPronationStretching from '../../../../../assets/exercises/Elbow-Pronation-Stretching.png';
import ElbowSupinationBalance from '../../../../../assets/exercises/Elbow-Supination-Balance.png';
import ElbowSupinationCoordination from '../../../../../assets/exercises/Elbow-Supination-Coordination.png';
import ElbowSupinationEndurance from '../../../../../assets/exercises/Elbow-Supination-Endurance.png';
import ElbowSupinationStretching from '../../../../../assets/exercises/Elbow-Supination-Stretching.png';

// Special exercises
import FlexionExtensionMobilization from '../../../../../assets/exercises/Flexion-Extension-Mobilization-of-Knee.png';

// Foot exercises
import FootArchBalance from '../../../../../assets/exercises/Foot-Arch-Balance.png';
import FootArchCoordination from '../../../../../assets/exercises/Foot-Arch-Coordination.png';
import FootArchFunctional from '../../../../../assets/exercises/Foot-Arch-Functional.png';
import FootArchStrengthening from '../../../../../assets/exercises/Foot-Arch-Strengthening.png';
import FootArchStretching from '../../../../../assets/exercises/Foot-Arch-Stretching.png';
import FootIntrinsicBalance from '../../../../../assets/exercises/Foot-Intrinsic-Balance.png';
import FootIntrinsicCoordination from '../../../../../assets/exercises/Foot-Intrinsic-Coordination.png';
import FootIntrinsicEndurance from '../../../../../assets/exercises/Foot-Intrinsic-Endurance.png';
import FootIntrinsicFunctional from '../../../../../assets/exercises/Foot-Intrinsic-Functional.png';
import FootIntrinsicStretching from '../../../../../assets/exercises/Foot-Intrinsic-Stretching.png';
import FootToeExtensionBalance from '../../../../../assets/exercises/Foot-Toe-Extension-Balance.png';
import FootToeExtensionCoordination from '../../../../../assets/exercises/Foot-Toe-Extension-Coordination.png';
import FootToeExtensionEndurance from '../../../../../assets/exercises/Foot-Toe-Extension-Endurance.png';
import FootToeExtensionFunctional from '../../../../../assets/exercises/Foot-Toe-Extension-Functional.png';
import FootToeExtensionStretching from '../../../../../assets/exercises/Foot-Toe-Extension-Stretching.png';
import FootToeFlexionBalance from '../../../../../assets/exercises/Foot-Toe-Flexion-Balance.png';
import FootToeFlexionCoordination from '../../../../../assets/exercises/Foot-Toe-Flexion-Coordination.png';
import FootToeFlexionStretching from '../../../../../assets/exercises/Foot-Toe-Flexion-Stretching.png';

// Special exercises
import ForwardLunge from '../../../../../assets/exercises/Forward-Lunge-in-Standing.png';

// Full Body exercises
import FullBodyCoordinationCoordination from '../../../../../assets/exercises/Full-Body-Coordination-Coordination.png';
import FullBodyFunctionalCoordination from '../../../../../assets/exercises/Full-Body-Functional-Coordination.png';

// Hand exercises
import HandFingerExtensionBalance from '../../../../../assets/exercises/Hand-Finger-Extension-Balance.png';
import HandFingerExtensionCoordination from '../../../../../assets/exercises/Hand-Finger-Extension-Coordination.png';
import HandFingerExtensionEndurance from '../../../../../assets/exercises/Hand-Finger-Extension-Endurance.png';
import HandFingerExtensionStretching from '../../../../../assets/exercises/Hand-Finger-Extension-Stretching.png';
import HandGripBalance from '../../../../../assets/exercises/Hand-Grip-Balance.png';
import HandGripCoordination from '../../../../../assets/exercises/Hand-Grip-Coordination.png';
import HandGripEndurance from '../../../../../assets/exercises/Hand-Grip-Endurance.png';
import HandGripStrengthening from '../../../../../assets/exercises/Hand-Grip-Strengthening.png';
import HandGripStretching from '../../../../../assets/exercises/Hand-Grip-Stretching.png';
import HandOppositionBalance from '../../../../../assets/exercises/Hand-Opposition-Balance.png';
import HandOppositionCoordination from '../../../../../assets/exercises/Hand-Opposition-Coordination.png';
import HandOppositionStrengthening from '../../../../../assets/exercises/Hand-Opposition-Strengthening.png';
import HandPinchBalance from '../../../../../assets/exercises/Hand-Pinch-Balance.png';
import HandPinchCoordination from '../../../../../assets/exercises/Hand-Pinch-Coordination.png';
import HandPinchFunctional from '../../../../../assets/exercises/Hand-Pinch-Functional.png';
import HandPinchStretching from '../../../../../assets/exercises/Hand-Pinch-Stretching.png';

// Hip exercises
import HipAbductionBalance from '../../../../../assets/exercises/Hip-Abduction-Balance.png';
import HipAbductionCoordination from '../../../../../assets/exercises/Hip-Abduction-Coordination.png';
import HipAbductionStrengthening from '../../../../../assets/exercises/Hip-Abduction-Strengthening.png';
import HipAbductionStretching from '../../../../../assets/exercises/Hip-Abduction-Stretching.png';
import HipAdductionBalance from '../../../../../assets/exercises/Hip-Adduction-Balance.png';
import HipAdductionCoordination from '../../../../../assets/exercises/Hip-Adduction-Coordination.png';
import HipAdductionStrengthening from '../../../../../assets/exercises/Hip-Adduction-Strengthening.png';
import HipAdductionStretching from '../../../../../assets/exercises/Hip-Adduction-Stretching.png';
import HipExtensionBalance from '../../../../../assets/exercises/Hip-Extension-Balance.png';
import HipExtensionCoordination from '../../../../../assets/exercises/Hip-Extension-Coordination.png';
import HipExtensionStretching from '../../../../../assets/exercises/Hip-Extension-Stretching.png';
import HipFlexionBalance from '../../../../../assets/exercises/Hip-Flexion-Balance.png';
import HipFlexionCoordination from '../../../../../assets/exercises/Hip-Flexion-Coordination.png';
import HipFlexionFunctional from '../../../../../assets/exercises/Hip-Flexion-Functional.png';
import HipRotationBalance from '../../../../../assets/exercises/Hip-Rotation-Balance.png';
import HipRotationStrengthening from '../../../../../assets/exercises/Hip-Rotation-Strengthening.png';
import HipRotationStretching from '../../../../../assets/exercises/Hip-Rotation-Stretching.png';

// Knee exercises
import KneeExtensionBalance from '../../../../../assets/exercises/Knee-Extension-Balance.png';
import KneeExtensionCoordination from '../../../../../assets/exercises/Knee-Extension-Coordination.png';
import KneeExtensionFunctional from '../../../../../assets/exercises/Knee-Extension-Functional.png';
import KneeExtensionStretching from '../../../../../assets/exercises/Knee-Extension-Stretching.png';
import KneeFlexionBalance from '../../../../../assets/exercises/Knee-Flexion-Balance.png';
import KneeFlexionCoordination from '../../../../../assets/exercises/Knee-Flexion-Coordination.png';
import KneeFlexionFunctional from '../../../../../assets/exercises/Knee-Flexion-Functional.png';
import KneeFlexionRangeOfMotion from '../../../../../assets/exercises/Knee-Flexion-Range-of-Motion.png';
import KneeFlexionStrengthening from '../../../../../assets/exercises/Knee-Flexion-Strengthening.png';
import KneeFlexionStretching from '../../../../../assets/exercises/Knee-Flexion-Stretching.png';
import KneeStabilityBalance from '../../../../../assets/exercises/Knee-Stability-Balance.png';
import KneeStabilityCoordination from '../../../../../assets/exercises/Knee-Stability-Coordination.png';
import KneeStabilityStrengthening from '../../../../../assets/exercises/Knee-Stability-Strengthening.png';
import KneeStabilityStretching from '../../../../../assets/exercises/Knee-Stability-Stretching.png';

// Neck exercises
import NeckExtensionBalance from '../../../../../assets/exercises/Neck-Extension-Balance.png';
import NeckExtensionCoordination from '../../../../../assets/exercises/Neck-Extension-Coordination.png';
import NeckExtensionStrengthening from '../../../../../assets/exercises/Neck-Extension-Strengthening.png';
import NeckExtensionStretching from '../../../../../assets/exercises/Neck-Extension-Stretching.png';
import NeckFlexionBalance from '../../../../../assets/exercises/Neck-Flexion-Balance.png';
import NeckFlexionCoordination from '../../../../../assets/exercises/Neck-Flexion-Coordination.png';
import NeckFlexionStrengthening from '../../../../../assets/exercises/Neck-Flexion-Strengthening.png';
import NeckFlexionStretching from '../../../../../assets/exercises/Neck-Flexion-Stretching.png';
import NeckLateralFlexionBalance from '../../../../../assets/exercises/Neck-Lateral-Flexion-Balance.png';
import NeckLateralFlexionStrengthening from '../../../../../assets/exercises/Neck-Lateral-Flexion-Strengthening.png';
import NeckLateralFlexionStretching from '../../../../../assets/exercises/Neck-Lateral-Flexion-Stretching.png';
import NeckRotationBalance from '../../../../../assets/exercises/Neck-Rotation-Balance.png';
import NeckRotationCoordination from '../../../../../assets/exercises/Neck-Rotation-Coordination.png';
import NeckRotationStrengthening from '../../../../../assets/exercises/Neck-Rotation-Strengthening.png';
import NeckRotationStretching from '../../../../../assets/exercises/Neck-Rotatio-Stretching.png';

// Shoulder exercises
import ShoulderAbductionBalance from '../../../../../assets/exercises/Shoulder-Abduction-Balance.png';
import ShoulderAbductionCoordination from '../../../../../assets/exercises/Shoulder-Abduction-Coordination.png';
import ShoulderAbductionFunctional from '../../../../../assets/exercises/Shoulder-Abduction-Functional.png';
import ShoulderAbductionRangeOfMotion from '../../../../../assets/exercises/Shoulder-Abduction-Range-of-Motion.png';
import ShoulderAbductionStretching from '../../../../../assets/exercises/Shoulder-Abduction-Stretching.png';
import ShoulderAdductionCoordination from '../../../../../assets/exercises/Shoulder-Adduction-Coordination.png';
import ShoulderAdductionStrengthening from '../../../../../assets/exercises/Shoulder-Adduction-Strengthening.png';
import ShoulderAdductionStretching from '../../../../../assets/exercises/Shoulder-Adduction-Stretching.png';
import ShoulderExtensionBalance from '../../../../../assets/exercises/Shoulder-Extension-Balance.png';
import ShoulderExtensionCoordination from '../../../../../assets/exercises/Shoulder-Extension-Coordination.png';
import ShoulderExtensionEndurance from '../../../../../assets/exercises/Shoulder-Extension-Endurance.png';
import ShoulderExtensionStrengthening from '../../../../../assets/exercises/Shoulder-Extension-Strengthening.png';
import ShoulderExtensionStretching from '../../../../../assets/exercises/Shoulder-Extension-Stretching.png';
import ShoulderFlexion from '../../../../../assets/exercises/Shoulder-Flexion.png';
import ShoulderFlexionBalance from '../../../../../assets/exercises/Shoulder-Flexion-Balance.png';
import ShoulderFlexionCoordination from '../../../../../assets/exercises/Shoulder-Flexion-Coordination.png';
import ShoulderFlexionRangeOfMotion from '../../../../../assets/exercises/Shoulder-Flexion-Range-of-Motion.png';
import ShoulderFlexionStrengthening from '../../../../../assets/exercises/Shoulder-Flexion-Strengthening.png';
import ShoulderFlexionStretching from '../../../../../assets/exercises/Shoulder-Flexion-Stretching.png';
import ShoulderRotationBalance from '../../../../../assets/exercises/Shoulder-Rotation-Balance.png';
import ShoulderRotationCoordination from '../../../../../assets/exercises/Shoulder-Rotation-Coordination.png';
import ShoulderRotationEndurance from '../../../../../assets/exercises/Shoulder-Rotation-Endurance.png';
import ShoulderRotationStrengthening from '../../../../../assets/exercises/Shoulder-Rotation-Strengthening.png';
import ShoulderRotationStretching from '../../../../../assets/exercises/Shoulder-Rotation-Stretching.png';

// Wrist exercises
import WristExtensionBalance from '../../../../../assets/exercises/Wrist-Extension-Balance.png';
import WristExtensionCoordination from '../../../../../assets/exercises/Wrist-Extension-Coordination.png';
import WristExtensionStrengthening from '../../../../../assets/exercises/Wrist-Extension-Strengthening.png';
import WristExtensionStretching from '../../../../../assets/exercises/Wrist-Extension-Stretching.png';
import WristFlexionBalance from '../../../../../assets/exercises/Wrist-Flexion-Balance.png';
import WristFlexionCoordination from '../../../../../assets/exercises/Wrist-Flexion-Coordination.png';
import WristFlexionStrengthening from '../../../../../assets/exercises/Wrist-Flexion-Strengthening.png';
import WristFlexionStretching from '../../../../../assets/exercises/Wrist-Flexion-Stretching.png';
import WristRadialDeviationBalance from '../../../../../assets/exercises/Wrist-Radial-Deviation-Balance.png';
import WristRadialDeviationCoordination from '../../../../../assets/exercises/Wrist-Radial-Deviation-Coordination.png';
import WristRadialDeviationEndurance from '../../../../../assets/exercises/Wrist-Radial-Deviation-Endurance.png';
import WristRadialDeviationStretching from '../../../../../assets/exercises/Wrist-Radial-Deviation-Stretching.png';
import WristUlnarDeviationBalance from '../../../../../assets/exercises/Wrist-Ulnar-Deviation-Balance.png';
import WristUlnarDeviationCoordination from '../../../../../assets/exercises/Wrist-Ulnar-Deviation-Coordination.png';
import WristUlnarDeviationEndurance from '../../../../../assets/exercises/Wrist-Ulnar-Deviation-Endurance.png';
import WristUlnarDeviationStrengthening from '../../../../../assets/exercises/Wrist-Ulnar-Deviation-Strengthening.png';
import WristUlnarDeviationStretching from '../../../../../assets/exercises/Wrist-Ulnar-Deviation-Stretching.png';

const ExercisesComponent = ({ patient, onUpdateExercises }) => {
  // States for interface control and data
  const [isLoading, setIsLoading] = useState(false);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBodyPart, setActiveBodyPart] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDiscipline, setActiveDiscipline] = useState('All');
  const [changesUnsaved, setChangesUnsaved] = useState(false);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [printMode, setPrintMode] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [loadingAnimation, setLoadingAnimation] = useState(null);
  const [showAddAnimation, setShowAddAnimation] = useState(false);
  const [animatedExerciseId, setAnimatedExerciseId] = useState(null);
  const [modalTransition, setModalTransition] = useState('');
  
  // Refs for animations and interactions
  const loadingIntervalRef = useRef(null);
  const successTimeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const modalRef = useRef(null);
  const addButtonRef = useRef(null);
  const libraryRef = useRef(null);
  const exercisesGridRef = useRef(null);
  const saveButtonRef = useRef(null);
  
  // Filter options
  const bodyParts = ['All', 'Shoulder', 'Elbow', 'Wrist', 'Hand', 'Hip', 'Knee', 'Ankle', 'Foot', 'Neck', 'Back', 'Core', 'Full Body'];
  const categories = ['All', 'Strengthening', 'Stretching', 'Balance', 'Coordination', 'Endurance', 'Functional'];
  const disciplines = ['All', 'PT', 'OT', 'ST'];
  
  // Exercise images mapping - TODAS LAS IMÁGENES CORRECTAS
  const exerciseImages = {
    // Ankle exercises
    'Ankle-Dorsiflexion-Balance': AnkleDorsiflexionBalance,
    'Ankle-Dorsiflexion-Coordination': AnkleDorsiflexionCoordination,
    'Ankle-Dorsiflexion-Strengthening': AnkleDorsiflexionStrengthening,
    'Ankle-Eversion-Balance': AnkleEversionBalance,
    'Ankle-Eversion-Coordination': AnkleEversionCoordination,
    'Ankle-Eversion-Functional': AnkleEversionFunctional,
    'Ankle-Eversion-Stretching': AnkleEversionStretching,
    'Ankle-Inversion-Balance': AnkleInversionBalance,
    'Ankle-Inversion-Coordination': AnkleInversionCoordination,
    'Ankle-Inversion-Strengthening': AnkleInversionStrengthening,
    'Ankle-Inversion-Stretching': AnkleInversionStretching,
    'Ankle-Plantarflexion-Coordination': AnklePlantarflexionCoordination,
    'Ankle-Plantarflexion-Strengthening': AnklePlantarflexionStrengthening,
    
    // Arm exercises
    'Arm-Chair-Push': ArmChairPush,
    
    // Back exercises
    'Back-Lower-Balance': BackLowerBalance,
    'Back-Lower-Coordination': BackLowerCoordination,
    'Back-Lower-Stretching': BackLowerStretching,
    'Back-Middle-Balance': BackMiddleBalance,
    'Back-Middle-Coordination': BackMiddleCoordination,
    'Back-Middle-Endurance': BackMiddleEndurance,
    'Back-Middle-Strengthening': BackMiddleStrengthening,
    'Back-Middle-Stretching': BackMiddleStretching,
    'Back-Stabilization-Balance': BackStabilizationBalance,
    'Back-Stabilization-Coordination': BackStabilizationCoordination,
    'Back-Stabilization-Strengthening': BackStabilizationStrengthening,
    'Back-Stabilization-Stretching': BackStabilizationStretching,
    'Back-Upper-Balance': BackUpperBalance,
    'Back-Upper-Coordination': BackUpperCoordination,
    'Back-Upper-Stretching': BackUpperStretching,
    
    // Core exercises
    'Core-Abdominal-Balance': CoreAbdominalBalance,
    'Core-Abdominal-Coordination': CoreAbdominalCoordination,
    'Core-Abdominal-Strengthening': CoreAbdominalStrengthening,
    'Core-Abdominal-Stretching': CoreAbdominalStretching,
    'Core-Lumbar-Balance': CoreLumbarBalance,
    'Core-Lumbar-Coordination': CoreLumbarCoordination,
    'Core-Lumbar-Strengthening': CoreLumbarStrengthening,
    'Core-Lumbar-Stretching': CoreLumbarStretching,
    'Core-Oblique-Balance': CoreObliqueBalance,
    'Core-Oblique-Coordination': CoreObliqueCoordination,
    'Core-Oblique-Strengthening': CoreObliqueStrengthening,
    'Core-Oblique-Stretching': CoreObliqueStretching,
    'Core-Pelvic-Balance': CorePelvicBalance,
    'Core-Pelvic-Coordination': CorePelvicCoordination,
    'Core-Pelvic-Strengthening': CorePelvicStrengthening,
    'Core-Pelvic-Stretching': CorePelvicStretching,
    
    // Special exercises
    'Deep-Squat': DeepSquat,
    
    // Elbow exercises
    'Elbow-Extension-Balance': ElbowExtensionBalance,
    'Elbow-Extension-Coordination': ElbowExtensionCoordination,
    'Elbow-Extension-Strengthening': ElbowExtensionStrengthening,
    'Elbow-Extension-Stretching': ElbowExtensionStretching,
    'Elbow-Flexion-Balance': ElbowFlexionBalance,
    'Elbow-Flexion-Coordination': ElbowFlexionCoordination,
    'Elbow-Flexion-Strengthening': ElbowFlexionStrengthening,
    'Elbow-Flexion-Stretching': ElbowFlexionStretching,
    'Elbow-Pronation-Balance': ElbowPronationBalance,
    'Elbow-Pronation-Coordination': ElbowPronationCoordination,
    'Elbow-Pronation-Strengthening': ElbowPronationStrengthening,
    'Elbow-Pronation-Stretching': ElbowPronationStretching,
    'Elbow-Supination-Balance': ElbowSupinationBalance,
    'Elbow-Supination-Coordination': ElbowSupinationCoordination,
    'Elbow-Supination-Endurance': ElbowSupinationEndurance,
    'Elbow-Supination-Stretching': ElbowSupinationStretching,
    
    // Special exercises
    'Flexion-Extension-Mobilization-of-Knee': FlexionExtensionMobilization,
    
    // Foot exercises
    'Foot-Arch-Balance': FootArchBalance,
    'Foot-Arch-Coordination': FootArchCoordination,
    'Foot-Arch-Functional': FootArchFunctional,
    'Foot-Arch-Strengthening': FootArchStrengthening,
    'Foot-Arch-Stretching': FootArchStretching,
    'Foot-Intrinsic-Balance': FootIntrinsicBalance,
    'Foot-Intrinsic-Coordination': FootIntrinsicCoordination,
    'Foot-Intrinsic-Endurance': FootIntrinsicEndurance,
    'Foot-Intrinsic-Functional': FootIntrinsicFunctional,
    'Foot-Intrinsic-Stretching': FootIntrinsicStretching,
    'Foot-Toe-Extension-Balance': FootToeExtensionBalance,
    'Foot-Toe-Extension-Coordination': FootToeExtensionCoordination,
    'Foot-Toe-Extension-Endurance': FootToeExtensionEndurance,
    'Foot-Toe-Extension-Functional': FootToeExtensionFunctional,
  'Foot-Toe-Extension-Stretching': FootToeExtensionStretching,
    'Foot-Toe-Flexion-Balance': FootToeFlexionBalance,
    'Foot-Toe-Flexion-Coordination': FootToeFlexionCoordination,
    'Foot-Toe-Flexion-Stretching': FootToeFlexionStretching,
    
    // Special exercises
    'Forward-Lunge-in-Standing': ForwardLunge,
    
    // Full Body exercises
    'Full-Body-Coordination-Coordination': FullBodyCoordinationCoordination,
    'Full-Body-Functional-Coordination': FullBodyFunctionalCoordination,
    
    // Hand exercises
    'Hand-Finger-Extension-Balance': HandFingerExtensionBalance,
    'Hand-Finger-Extension-Coordination': HandFingerExtensionCoordination,
    'Hand-Finger-Extension-Endurance': HandFingerExtensionEndurance,
    'Hand-Finger-Extension-Stretching': HandFingerExtensionStretching,
    'Hand-Grip-Balance': HandGripBalance,
    'Hand-Grip-Coordination': HandGripCoordination,
    'Hand-Grip-Endurance': HandGripEndurance,
    'Hand-Grip-Strengthening': HandGripStrengthening,
    'Hand-Grip-Stretching': HandGripStretching,
    'Hand-Opposition-Balance': HandOppositionBalance,
    'Hand-Opposition-Coordination': HandOppositionCoordination,
    'Hand-Opposition-Strengthening': HandOppositionStrengthening,
    'Hand-Pinch-Balance': HandPinchBalance,
    'Hand-Pinch-Coordination': HandPinchCoordination,
    'Hand-Pinch-Functional': HandPinchFunctional,
    'Hand-Pinch-Stretching': HandPinchStretching,
    
    // Hip exercises
    'Hip-Abduction-Balance': HipAbductionBalance,
    'Hip-Abduction-Coordination': HipAbductionCoordination,
    'Hip-Abduction-Strengthening': HipAbductionStrengthening,
    'Hip-Abduction-Stretching': HipAbductionStretching,
    'Hip-Adduction-Balance': HipAdductionBalance,
    'Hip-Adduction-Coordination': HipAdductionCoordination,
    'Hip-Adduction-Strengthening': HipAdductionStrengthening,
    'Hip-Adduction-Stretching': HipAdductionStretching,
    'Hip-Extension-Balance': HipExtensionBalance,
    'Hip-Extension-Coordination': HipExtensionCoordination,
    'Hip-Extension-Stretching': HipExtensionStretching,
    'Hip-Flexion-Balance': HipFlexionBalance,
    'Hip-Flexion-Coordination': HipFlexionCoordination,
    'Hip-Flexion-Functional': HipFlexionFunctional,
    'Hip-Rotation-Balance': HipRotationBalance,
    'Hip-Rotation-Strengthening': HipRotationStrengthening,
    'Hip-Rotation-Stretching': HipRotationStretching,
    
    // Knee exercises
    'Knee-Extension-Balance': KneeExtensionBalance,
    'Knee-Extension-Coordination': KneeExtensionCoordination,
    'Knee-Extension-Functional': KneeExtensionFunctional,
    'Knee-Extension-Stretching': KneeExtensionStretching,
    'Knee-Flexion-Balance': KneeFlexionBalance,
    'Knee-Flexion-Coordination': KneeFlexionCoordination,
    'Knee-Flexion-Functional': KneeFlexionFunctional,
    'Knee-Flexion-Range-of-Motion': KneeFlexionRangeOfMotion,
    'Knee-Flexion-Strengthening': KneeFlexionStrengthening,
    'Knee-Flexion-Stretching': KneeFlexionStretching,
    'Knee-Stability-Balance': KneeStabilityBalance,
    'Knee-Stability-Coordination': KneeStabilityCoordination,
    'Knee-Stability-Strengthening': KneeStabilityStrengthening,
    'Knee-Stability-Stretching': KneeStabilityStretching,
    
    // Neck exercises
    'Neck-Extension-Balance': NeckExtensionBalance,
    'Neck-Extension-Coordination': NeckExtensionCoordination,
    'Neck-Extension-Strengthening': NeckExtensionStrengthening,
    'Neck-Extension-Stretching': NeckExtensionStretching,
    'Neck-Flexion-Balance': NeckFlexionBalance,
    'Neck-Flexion-Coordination': NeckFlexionCoordination,
    'Neck-Flexion-Strengthening': NeckFlexionStrengthening,
    'Neck-Flexion-Stretching': NeckFlexionStretching,
    'Neck-Lateral-Flexion-Balance': NeckLateralFlexionBalance,
    'Neck-Lateral-Flexion-Strengthening': NeckLateralFlexionStrengthening,
    'Neck-Lateral-Flexion-Stretching': NeckLateralFlexionStretching,
    'Neck-Rotation-Balance': NeckRotationBalance,
    'Neck-Rotation-Coordination': NeckRotationCoordination,
    'Neck-Rotation-Strengthening': NeckRotationStrengthening,
    'Neck-Rotation-Stretching': NeckRotationStretching,
    
    // Shoulder exercises
    'Shoulder-Abduction-Balance': ShoulderAbductionBalance,
    'Shoulder-Abduction-Coordination': ShoulderAbductionCoordination,
    'Shoulder-Abduction-Functional': ShoulderAbductionFunctional,
    'Shoulder-Abduction-Range-of-Motion': ShoulderAbductionRangeOfMotion,
    'Shoulder-Abduction-Stretching': ShoulderAbductionStretching,
    'Shoulder-Adduction-Coordination': ShoulderAdductionCoordination,
    'Shoulder-Adduction-Strengthening': ShoulderAdductionStrengthening,
    'Shoulder-Adduction-Stretching': ShoulderAdductionStretching,
    'Shoulder-Extension-Balance': ShoulderExtensionBalance,
    'Shoulder-Extension-Coordination': ShoulderExtensionCoordination,
    'Shoulder-Extension-Endurance': ShoulderExtensionEndurance,
    'Shoulder-Extension-Strengthening': ShoulderExtensionStrengthening,
    'Shoulder-Extension-Stretching': ShoulderExtensionStretching,
    'Shoulder-Flexion': ShoulderFlexion,
    'Shoulder-Flexion-Balance': ShoulderFlexionBalance,
    'Shoulder-Flexion-Coordination': ShoulderFlexionCoordination,
    'Shoulder-Flexion-Range-of-Motion': ShoulderFlexionRangeOfMotion,
    'Shoulder-Flexion-Strengthening': ShoulderFlexionStrengthening,
    'Shoulder-Flexion-Stretching': ShoulderFlexionStretching,
    'Shoulder-Rotation-Balance': ShoulderRotationBalance,
    'Shoulder-Rotation-Coordination': ShoulderRotationCoordination,
    'Shoulder-Rotation-Endurance': ShoulderRotationEndurance,
    'Shoulder-Rotation-Strengthening': ShoulderRotationStrengthening,
    'Shoulder-Rotation-Stretching': ShoulderRotationStretching,
    
    // Wrist exercises
    'Wrist-Extension-Balance': WristExtensionBalance,
    'Wrist-Extension-Coordination': WristExtensionCoordination,
    'Wrist-Extension-Strengthening': WristExtensionStrengthening,
    'Wrist-Extension-Stretching': WristExtensionStretching,
    'Wrist-Flexion-Balance': WristFlexionBalance,
    'Wrist-Flexion-Coordination': WristFlexionCoordination,
    'Wrist-Flexion-Strengthening': WristFlexionStrengthening,
    'Wrist-Flexion-Stretching': WristFlexionStretching,
    'Wrist-Radial-Deviation-Balance': WristRadialDeviationBalance,
    'Wrist-Radial-Deviation-Coordination': WristRadialDeviationCoordination,
    'Wrist-Radial-Deviation-Endurance': WristRadialDeviationEndurance,
    'Wrist-Radial-Deviation-Stretching': WristRadialDeviationStretching,
    'Wrist-Ulnar-Deviation-Balance': WristUlnarDeviationBalance,
    'Wrist-Ulnar-Deviation-Coordination': WristUlnarDeviationCoordination,
    'Wrist-Ulnar-Deviation-Endurance': WristUlnarDeviationEndurance,
    'Wrist-Ulnar-Deviation-Strengthening': WristUlnarDeviationStrengthening,
    'Wrist-Ulnar-Deviation-Stretching': WristUlnarDeviationStretching,
  };

  // Function to get exercise image
  const getExerciseImage = (exerciseName, bodyPart, category) => {
    // Try to find exact match first
    const exactKey = exerciseName.replace(/\s+/g, '-');
    if (exerciseImages[exactKey]) {
      return exerciseImages[exactKey];
    }
    
    // Try to construct key from bodyPart and category
    const constructedKey = `${bodyPart}-${category}`.replace(/\s+/g, '-');
    if (exerciseImages[constructedKey]) {
      return exerciseImages[constructedKey];
    }
    
    // Try variations for special exercises
    if (exerciseName.includes('Forward Lunge')) {
      return exerciseImages['Forward-Lunge-in-Standing'];
    }
    if (exerciseName.includes('Arm Chair Push')) {
      return exerciseImages['Arm-Chair-Push'];
    }
    if (exerciseName.includes('Deep Squat')) {
      return exerciseImages['Deep-Squat'];
    }
    if (exerciseName.includes('Flexion-Extension Mobilization')) {
      return exerciseImages['Flexion-Extension-Mobilization-of-Knee'];
    }
    
    // Default fallback - try to match by body part and movement
    const bodyPartKey = bodyPart.replace(/\s+/g, '-');
    const categoryKey = category.replace(/\s+/g, '-');
    const fallbackKey = `${bodyPartKey}-${categoryKey}`;
    
    if (exerciseImages[fallbackKey]) {
      return exerciseImages[fallbackKey];
    }
    
    // Last resort - return a default placeholder or first available image
    return Object.values(exerciseImages)[0] || '/exercise-images/default.jpg';
  };
  
  // Initialize with patient data
  useEffect(() => {
    if (patient?.exercises) {
      setSelectedExercises(patient.exercises);
    }
    
    // Advanced loading animation for library
    setIsLoading(true);
    setLoadingText('Loading exercise library...');
    setLoadingAnimation('library');
    
    // Simulating API call with progress tracking
    let progress = 0;
    loadingIntervalRef.current = setInterval(() => {
      progress += (Math.random() * 4) + 1.6;
      setLoadingProgress(Math.min(progress, 99));
      
      if (progress >= 99) {
        clearInterval(loadingIntervalRef.current);
        
        // Simulate network delay
        setTimeout(() => {
          const mockExercises = generateMockExercises();
          
          // Simulate processing of data
          setLoadingText('Processing exercise data...');
          setTimeout(() => {
            setExerciseLibrary(mockExercises);
            setLoadingProgress(100);
            
            // Completion animation
            setTimeout(() => {
              setIsLoading(false);
              setLoadingProgress(0);
              setLoadingAnimation(null);
            }, 200);
          }, 500);
        }, 500);
      }
    }, 50);
    
    // GSAP animations for page elements
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    timeline.fromTo(".card-header", 
      { y: -20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6 }
    );
    
    // Clean up intervals and timeouts when component unmounts
    return () => {
      clearInterval(loadingIntervalRef.current);
      clearTimeout(successTimeoutRef.current);
      clearTimeout(errorTimeoutRef.current);
    };
  }, [patient]);

  // Effect for animating modal appearance
  useEffect(() => {
    if (showEditModal || showDeleteModal || showExerciseLibrary) {
      // NO bloquear el scroll del body, solo del modal principal
      const mainContent = document.querySelector('.exercises-component');
      if (mainContent) {
        mainContent.style.overflow = 'hidden';
      }
      
      setModalTransition('opening');
      
      if (modalRef.current) {
        const modal = modalRef.current;
        
        gsap.fromTo(modal, 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.4)" }
        );
        
        setTimeout(() => {
          setModalTransition('');
        }, 400);
      }
    } else {
      // Restaurar el scroll cuando se cierre
      const mainContent = document.querySelector('.exercises-component');
      if (mainContent) {
        mainContent.style.overflow = '';
      }
      
      if (modalTransition !== 'closing') {
        setModalTransition('');
      }
    }
  }, [showEditModal, showDeleteModal, showExerciseLibrary]);

  // Effect for animating notifications
  useEffect(() => {
    if (saveSuccess || saveError) {
      const notificationElement = document.querySelector(saveSuccess ? '.success-notification' : '.error-notification');
      
      if (notificationElement) {
        gsap.fromTo(notificationElement,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
        );
      }
    }
  }, [saveSuccess, saveError]);
  
  // Effect for animating added exercises
  useEffect(() => {
    if (animatedExerciseId !== null) {
      const exerciseElement = document.querySelector(`[data-exercise-id="${animatedExerciseId}"]`);
      
      if (exerciseElement) {
        gsap.fromTo(exerciseElement,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: "elastic.out(1.2, 0.5)" }
        );
        
        setTimeout(() => {
          setAnimatedExerciseId(null);
        }, 600);
      }
    }
  }, [animatedExerciseId]);

  // Generate mock exercises for the library
  const generateMockExercises = () => {
    const exercises = [];
    let id = 1;
    
    // Generate exercises based on available images
    Object.keys(exerciseImages).forEach(imageKey => {
      const parts = imageKey.split('-');
      const bodyPart = parts[0];
      const movement = parts.slice(1, -1).join(' ');
      const category = parts[parts.length - 1];
      
      // Map category names
      const categoryMap = {
        'Balance': 'Balance',
        'Coordination': 'Coordination',
        'Strengthening': 'Strengthening',
        'Stretching': 'Stretching',
        'Endurance': 'Endurance',
        'Functional': 'Functional',
      };
      
      const mappedCategory = categoryMap[category] || 'Strengthening';
      
      // Map body parts
      const bodyPartMap = {
        'Ankle': 'Ankle',
        'Arm': 'Shoulder',
        'Back': 'Back',
        'Core': 'Core',
        'Deep': 'Full Body',
        'Elbow': 'Elbow',
        'Flexion': 'Knee',
        'Foot': 'Foot',
        'Forward': 'Hip',
        'Full': 'Full Body',
        'Hand': 'Hand',
        'Hip': 'Hip',
        'Knee': 'Knee',
        'Neck': 'Neck',
        'Shoulder': 'Shoulder',
        'Wrist': 'Wrist'
      };
      
      const mappedBodyPart = bodyPartMap[bodyPart] || bodyPart;
      
      const exerciseName = imageKey.replace(/-/g, ' ');
      
      exercises.push({
        id: id++,
        name: exerciseName,
        description: `${mappedCategory} exercise for ${movement.toLowerCase()} of the ${mappedBodyPart.toLowerCase()}.`,
        bodyPart: mappedBodyPart,
        category: mappedCategory,
        subCategory: mappedCategory,
        discipline: ['PT', 'OT', 'ST'][Math.floor(Math.random() * 3)],
        imageUrl: exerciseImages[imageKey],
        defaultSets: Math.floor(Math.random() * 3) + 2,
        defaultReps: Math.floor(Math.random() * 10) + 10,
        defaultSessions: Math.floor(Math.random() * 2) + 1
      });
    });
    
    return exercises;
  };
  
  // Filter exercises for the library view
  const getFilteredExercises = () => {
    return exerciseLibrary.filter(exercise => {
      // Filter by text search
      const matchesSearch = searchQuery === '' || 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by body part
      const matchesBodyPart = activeBodyPart === 'All' || exercise.bodyPart === activeBodyPart;
      
      // Filter by category
      const matchesCategory = activeCategory === 'All' || exercise.category === activeCategory;
      
      // Filter by discipline
      const matchesDiscipline = activeDiscipline === 'All' || exercise.discipline === activeDiscipline;
      
      return matchesSearch && matchesBodyPart && matchesCategory && matchesDiscipline;
    });
  };
  
  // Handle adding an exercise to the selected list
  const handleAddExercise = (exercise) => {
    // Check if the exercise is already in the list
    if (selectedExercises.find(e => e.id === exercise.id)) {
      return;
    }
    
    // Show loading animation
    setIsLoading(true);
    setLoadingText('Adding exercise...');
    setLoadingAnimation('adding');
    setShowAddAnimation(true);
    
    // Get position of the add button for animation
    const addButtonElement = document.querySelector(`[data-add-id="${exercise.id}"]`);
    const initialPosition = addButtonElement ? addButtonElement.getBoundingClientRect() : null;
    
    if (initialPosition && addButtonRef.current) {
      // Store initial position for animation
      addButtonRef.current.style.top = `${initialPosition.top}px`;
      addButtonRef.current.style.left = `${initialPosition.left}px`;
    }
    
    // Simulate loading progress
    let progress = 0;
    loadingIntervalRef.current = setInterval(() => {
      progress += 5;
      setLoadingProgress(progress);
      
      if (progress >= 100) {
        clearInterval(loadingIntervalRef.current);
        
        // Add the exercise with default values
        const newExercise = {
          ...exercise,
          sets: exercise.defaultSets,
          reps: exercise.defaultReps,
          sessions: exercise.defaultSessions,
          isHEP: true
        };
        
        // Animated addition
        setTimeout(() => {
          const updatedExercises = [...selectedExercises, newExercise];
          setSelectedExercises(updatedExercises);
          setChangesUnsaved(true);
          setShowAddAnimation(false);
          
          // Hide loading screen
          setIsLoading(false);
          setLoadingProgress(0);
          
          // Set the ID for the newly added exercise for animation
          setAnimatedExerciseId(newExercise.id);
          
          // Show success message
          setSaveSuccess(true);
          successTimeoutRef.current = setTimeout(() => {
            setSaveSuccess(false);
          }, 3000);
        }, 400);
      }
    }, 30);
  };
  
  // Handle initiating the edit process
  const handleEditExercise = (exercise) => {
    // Clone the exercise to avoid direct state modification
    setSelectedExercise({...exercise});
    setShowEditModal(true);
  };
  
  // Handle saving edited exercise
  const handleSaveEdit = () => {
    // Show loading animation
    setIsLoading(true);
    setLoadingText('Updating exercise...');
    setLoadingAnimation('updating');
    
    // Simulate loading progress
    let progress = 0;
    loadingIntervalRef.current = setInterval(() => {
      progress += 4;
      setLoadingProgress(progress);
      
      if (progress >= 100) {
        clearInterval(loadingIntervalRef.current);
        
        setTimeout(() => {
          // Close modal
          handleCloseModal('edit', () => {
            // Update the exercise in the list
            const updatedExercises = selectedExercises.map(ex => 
              ex.id === selectedExercise.id ? selectedExercise : ex
            );
            
            setSelectedExercises(updatedExercises);
            setChangesUnsaved(true);
            setSelectedExercise(null);
            
            // Hide loading and show success message
            setIsLoading(false);
            setLoadingProgress(0);
            
            setSaveSuccess(true);
            successTimeoutRef.current = setTimeout(() => {
              setSaveSuccess(false);
            }, 3000);
            
            // Animate the updated exercise
            setAnimatedExerciseId(selectedExercise.id);
          });
        }, 500);
      }
    }, 40);
  };

  // Handle closing modals with animations
  const handleCloseModal = (modalType, callback) => {
    setModalTransition('closing');
    
    if (modalRef.current) {
      const modal = modalRef.current;
      
      gsap.to(modal, {
        y: 20, 
        opacity: 0, 
        duration: 0.3, 
        ease: "power2.in",
        onComplete: () => {
          // Restaurar scroll antes de cerrar
          const mainContent = document.querySelector('.exercises-component');
          if (mainContent) {
            mainContent.style.overflow = '';
          }
          
          // Reset the modal state after animation
          if (modalType === 'edit') {
            setShowEditModal(false);
          } else if (modalType === 'delete') {
            setShowDeleteModal(false);
            setExerciseToDelete(null);
          } else if (modalType === 'library') {
            setShowExerciseLibrary(false);
          }
          
          // Execute callback if provided
          if (callback) callback();
          
          setTimeout(() => {
            setModalTransition('');
          }, 300);
        }
      });
    } else {
      // Fallback if ref is not available
      const mainContent = document.querySelector('.exercises-component');
      if (mainContent) {
        mainContent.style.overflow = '';
      }
      
      if (modalType === 'edit') {
        setShowEditModal(false);
      } else if (modalType === 'delete') {
        setShowDeleteModal(false);
        setExerciseToDelete(null);
      } else if (modalType === 'library') {
        setShowExerciseLibrary(false);
      }
      
      if (callback) callback();
    }
  };

  // Handle initiating the delete process
  const handleInitiateDelete = (exercise) => {
    setExerciseToDelete(exercise);
    setShowDeleteModal(true);
  };
  
  // Handle confirming exercise deletion
  const handleConfirmDelete = () => {
    // Show loading animation
    setIsLoading(true);
    setLoadingText('Removing exercise...');
    setLoadingAnimation('deleting');
    
    // Animate the exercise being deleted
    const exerciseElement = document.querySelector(`[data-exercise-id="${exerciseToDelete.id}"]`);
    
    if (exerciseElement) {
      gsap.to(exerciseElement, {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        ease: "power3.out"
      });
    }
    
    // Simulate loading progress
    let progress = 0;
    loadingIntervalRef.current = setInterval(() => {
      progress += 5;
      setLoadingProgress(progress);
      
      if (progress >= 100) {
        clearInterval(loadingIntervalRef.current);
        
        setTimeout(() => {
          // Close modal
          handleCloseModal('delete', () => {
            // Remove the exercise from the list
            const updatedExercises = selectedExercises.filter(
              ex => ex.id !== exerciseToDelete.id
            );
            
            setSelectedExercises(updatedExercises);
            setChangesUnsaved(true);
            
            // Hide loading
            setIsLoading(false);
            setLoadingProgress(0);
            
            // Show success notification
            setSaveSuccess(true);
            successTimeoutRef.current = setTimeout(() => {
              setSaveSuccess(false);
            }, 3000);
          });
        }, 500);
      }
    }, 40);
  };
  
  // Handle input changes in the edit form
  const handleEditInputChange = (field, value) => {
    setSelectedExercise(prev => ({
      ...prev,
      [field]: field === 'isHEP' ? value : (parseInt(value, 10) || 0)
    }));
  };
  
  // Handle saving all changes
  const handleSaveChanges = () => {
    // Show loading animation
    setIsLoading(true);
    setLoadingText('Saving changes...');
    setLoadingAnimation('saving');
    
    // Animate save button
    if (saveButtonRef.current) {
      gsap.to(saveButtonRef.current, {
        scale: 0.95,
        duration: 0.2,
        yoyo: true,
        repeat: 1
      });
    }
    
    // Simulate loading progress
    let progress = 0;
    loadingIntervalRef.current = setInterval(() => {
      progress += 2;
      setLoadingProgress(progress);
      
      if (progress >= 100) {
        clearInterval(loadingIntervalRef.current);
        
        // Small delay for final transition
        setTimeout(() => {
          try {
            // Notify parent component
            if (onUpdateExercises) {
              onUpdateExercises(selectedExercises);
            }
            
            setChangesUnsaved(false);
            
            // Hide loading with delay for better UX
            setTimeout(() => {
              setIsLoading(false);
              setLoadingProgress(0);
              
              // Show success message
              setSaveSuccess(true);
              successTimeoutRef.current = setTimeout(() => {
                setSaveSuccess(false);
              }, 3000);
              
              // Animate the exercises grid to show changes are applied
              if (exercisesGridRef.current) {
                gsap.fromTo(exercisesGridRef.current.children,
                  { y: 5, opacity: 0.8 },
                  { 
                    y: 0, 
                    opacity: 1, 
                    stagger: 0.05, 
                    duration: 0.4, 
                    ease: "power2.out"
                  }
                );
              }
            }, 200);
            
          } catch (error) {
            console.error('Error saving exercises:', error);
            setIsLoading(false);
            setLoadingProgress(0);
            
            // Show error message
            setSaveError(true);
            errorTimeoutRef.current = setTimeout(() => {
              setSaveError(false);
            }, 3000);
          }
        }, 300);
      }
    }, 40);
  };
  
  // Handle printing the Home Exercise Program
  const handlePrintHEP = () => {
    setPrintMode(true);
    
    // Allow DOM to update before printing
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 200);
  };
  
  // Render the print view for the HEP
  const renderPrintView = () => {
    const hepExercises = selectedExercises.filter(exercise => exercise.isHEP);
    
    if (hepExercises.length === 0) {
      return (
        <div className="print-empty-state">
          <div className="print-empty-icon">
            <i className="fas fa-file-medical-alt"></i>
          </div>
          <h3>No exercises selected for Home Exercise Program</h3>
          <p>Please select at least one exercise for the HEP before printing.</p>
        </div>
      );
    }
    
    return (
      <div className="print-container">
        <div className="print-header">
          <div className="print-logo">
            <i className="fas fa-hospital"></i>
            <span>Health Rehabilitation Center</span>
          </div>
          <h1>Home Exercise Program</h1>
          <div className="patient-info">
            <h2>{patient?.name || 'Patient Name'}</h2>
            <p>Date: {new Date().toLocaleDateString()}</p>
            <p>Provider: Dr. {patient?.provider || 'Michael Chen'}</p>
          </div>
        </div>
        
        <div className="print-exercises">
          {hepExercises.map(exercise => (
            <div key={exercise.id} className="print-exercise-card">
              <div className="print-exercise-header">
                <h3>{exercise.name}</h3>
                <div className="print-discipline-badge" data-discipline={exercise.discipline}>
                  {exercise.discipline}
                </div>
              </div>
              <div className="print-exercise-content">
                <div className="print-exercise-image">
                  <img src={exercise.imageUrl} alt={exercise.name} />
                </div>
                <div className="print-exercise-instructions">
                  <p className="exercise-description">{exercise.description}</p>
                  <div className="print-exercise-parameters">
                    <div className="parameter sets">
                      <div className="parameter-icon">
                        <i className="fas fa-layer-group"></i>
                      </div>
                      <div className="parameter-details">
                        <span className="parameter-label">Sets</span>
                        <span className="parameter-value">{exercise.sets}</span>
                      </div>
                    </div>
                    <div className="parameter reps">
                      <div className="parameter-icon">
                        <i className="fas fa-redo"></i>
                      </div>
                      <div className="parameter-details">
                        <span className="parameter-label">Repetitions</span>
                        <span className="parameter-value">{exercise.reps}</span>
                      </div>
                    </div>
                    <div className="parameter sessions">
                      <div className="parameter-icon">
                        <i className="fas fa-calendar-day"></i>
                      </div>
                      <div className="parameter-details">
                        <span className="parameter-label">Sessions</span>
                        <span className="parameter-value">{exercise.sessions}/day</span>
                      </div>
                    </div>
                  </div>
                  <div className="print-exercise-notes">
                    <div className="notes-header">
                      <i className="fas fa-clipboard-list"></i>
                      <span>Instructions</span>
                    </div>
                    <ul>
                      <li>Perform this exercise in a controlled manner</li>
                      <li>Rest for 30-60 seconds between sets</li>
                      <li>Stop if you experience severe pain or discomfort</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="print-footer">
          <div className="footer-instructions">
            <h4>General Guidelines</h4>
            <ul>
              <li>Warm up before starting your exercises</li>
              <li>Perform each exercise with proper form</li>
              <li>Breathe normally throughout each exercise</li>
              <li>Stop any exercise that causes sharp or increased pain</li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Contact Information</h4>
            <p><i className="fas fa-phone"></i> (555) 123-4567</p>
            <p><i className="fas fa-envelope"></i> care@healthrehab.example</p>
          </div>
          <div className="footer-disclaimer">
            <p>For questions or concerns, please contact your therapist. These exercises are prescribed specifically for you based on your individual assessment.</p>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the list of selected exercises
  const renderSelectedExercises = () => {
    if (selectedExercises.length === 0) {
      return (
        <div className="empty-exercises-container">
          <div className="empty-state">
            <div className="empty-icon-container">
              <i className="fas fa-dumbbell"></i>
              <div className="pulse-ring"></div>
            </div>
            <h3>No Exercises Assigned</h3>
            <p>This patient doesn't have any exercises assigned yet.</p>
            <button 
              className="add-exercise-btn" 
              onClick={() => setShowExerciseLibrary(true)}
              ref={addButtonRef}
            >
              <i className="fas fa-plus-circle"></i>
              <span>Add Exercises</span>
              <div className="btn-shine"></div>
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="selected-exercises-container">
        <div className="exercises-header">
          <div className="header-title">
            <h3>Assigned Exercises</h3>
            <span className="exercise-count">{selectedExercises.length} exercises</span>
          </div>
          
          <div className="header-actions">
            <button 
              className="add-exercise-btn"
              onClick={() => setShowExerciseLibrary(true)}
              ref={addButtonRef}
            >
              <i className="fas fa-plus"></i>
              <span>Add Exercise</span>
              <div className="btn-shine"></div>
            </button>
          </div>
        </div>
        
        <div className="exercises-grid" ref={exercisesGridRef}>
          <TransitionGroup component={null}>
            {selectedExercises.map((exercise, index) => (
              <CSSTransition
                key={exercise.id}
                timeout={500}
                classNames="exercise-item"
              >
                <div 
                  className="exercise-card"
                  style={{animationDelay: `${index * 0.05}s`}}
                  data-exercise-id={exercise.id}
                >
                  <div className="exercise-header">
                    <h4>{exercise.name}</h4>
                  </div>
                  
                  <div className="exercise-image">
                    <img src={exercise.imageUrl} alt={exercise.name} />
                    <div className="exercise-controls">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditExercise(exercise)}
                        title="Edit exercise"
                      >
                        <i className="fas fa-edit"></i>
                        <span>Edit</span>
                        <div className="btn-glow"></div>
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => handleInitiateDelete(exercise)}
                        title="Remove exercise"
                      >
                        <i className="fas fa-trash"></i>
                        <span>Remove</span>
                        <div className="btn-glow"></div>
                      </button>
                    </div>
                  </div>
                  
                  <div className="exercise-content">
                    <div className="exercise-details">
                      <div className="detail-row">
                        <div className="detail-label">
                          <i className="fas fa-layer-group"></i>
                          <span>Sets:</span>
                        </div>
                        <div className="detail-value">{exercise.sets}</div>
                      </div>
                      <div className="detail-row">
                        <div className="detail-label">
                          <i className="fas fa-redo"></i>
                          <span>Reps:</span>
                        </div>
                        <div className="detail-value">{exercise.reps}</div>
                      </div>
                      <div className="detail-row">
                        <div className="detail-label">
                          <i className="fas fa-calendar-day"></i>
                          <span>Sessions:</span>
                        </div>
                        <div className="detail-value">{exercise.sessions}/day</div>
                      </div>
                      <div className="detail-row">
                        <div className="detail-label">
                          <i className="fas fa-home"></i>
                          <span>HEP:</span>
                        </div>
                        <div className="detail-value">
                          {exercise.isHEP ? 
                            <span className="hep-indicator yes"><i className="fas fa-check"></i> Yes</span> : 
                            <span className="hep-indicator no"><i className="fas fa-times"></i> No</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="exercise-footer">
                    <div className="discipline-badge" data-discipline={exercise.discipline}>
                      {exercise.discipline}
                    </div>
                    <div className="category-badge">
                      {exercise.category}
                    </div>
                  </div>
                </div>
              </CSSTransition>
            ))}
          </TransitionGroup>
        </div>
        
        <div className="exercises-footer">
          {changesUnsaved && (
            <div className="unsaved-changes-alert">
              <i className="fas fa-exclamation-circle"></i>
              <span>You have unsaved changes</span>
              <span className="pulse-dot"></span>
            </div>
          )}
          
          <div className="footer-actions">
            <button 
              className="apply-changes-btn"
              onClick={handleSaveChanges}
              disabled={!changesUnsaved || isLoading}
              ref={saveButtonRef}
            >
              {isLoading && loadingAnimation === 'saving' ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  <span>Apply Changes</span>
                  <div className="btn-shine"></div>
                </>
              )}
            </button>
            
            <button 
              className="print-hep-btn"
              onClick={handlePrintHEP}
              disabled={selectedExercises.filter(e => e.isHEP).length === 0}
            >
              <i className="fas fa-print"></i>
              <span>Print HEP</span>
              <div className="btn-shine"></div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render the exercise library modal
  const renderExerciseLibrary = () => {
    const filteredExercises = getFilteredExercises();
    
    return (
      <div className={`exercise-library-overlay ${modalTransition}`}>
        <div className="exercise-library-modal" ref={modalRef}>
          <div className="library-header">
            <h3>Exercise Library</h3>
            <div className="library-header-actions">
              <button 
                className="close-library-btn"
                onClick={() => handleCloseModal('library')}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div className="library-filters">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchQuery('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            
            <div className="filter-groups">
              <div className="filter-group">
                <label>Body Part</label>
                <div className="filter-options">
                  {bodyParts.map(part => (
                    <button
                      key={part}
                      className={`filter-option ${activeBodyPart === part ? 'active' : ''}`}
                      onClick={() => setActiveBodyPart(part)}
                    >
                      {part}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-group">
                <label>Category</label>
                <div className="filter-options">
                  {categories.map(category => (
                    <button
                      key={category}
                      className={`filter-option ${activeCategory === category ? 'active' : ''}`}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-group">
                <label>Discipline</label>
                <div className="filter-options">
                  {disciplines.map(discipline => (
                    <button
                      key={discipline}
                      className={`filter-option ${activeDiscipline === discipline ? 'active' : ''}`}
                      onClick={() => setActiveDiscipline(discipline)}
                    >
                      {discipline}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="library-results" style={{ overflowY: 'auto', flex: 1 }}>
            <div className="results-header">
              <span className="results-count">{filteredExercises.length} exercises found</span>
              <div className="results-actions">
                <button className="results-view-btn active" title="Grid view">
                  <i className="fas fa-th-large"></i>
                </button>
                <button className="results-view-btn" title="List view">
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>
            
            <div className="results-grid">
              <TransitionGroup component={null}>
                {filteredExercises.map((exercise, index) => (
                  <CSSTransition
                    key={exercise.id}
                    timeout={400}
                    classNames="library-item"
                  >
                    <div 
                      className="library-exercise-card"
                      style={{animationDelay: `${index * 0.03}s`}}
                    >
                      <div className="exercise-image">
                        <img src={exercise.imageUrl} alt={exercise.name} />
                        <div className="exercise-discipline" data-discipline={exercise.discipline}>
                          {exercise.discipline}
                        </div>
                      </div>
                      
                      <div className="exercise-details">
                        <h4 className="exercise-name">{exercise.name}</h4>
                        <div className="exercise-categories">
                          <span className="body-part">{exercise.bodyPart}</span>
                          <span className="category">{exercise.category}</span>
                        </div>
                        <p className="exercise-description">{exercise.description}</p>
                      </div>
                      
                      <button 
                        className="add-btn"
                        onClick={() => handleAddExercise(exercise)}
                        disabled={selectedExercises.some(e => e.id === exercise.id)}
                        data-add-id={exercise.id}
                      >
                        {selectedExercises.some(e => e.id === exercise.id) ? (
                          <>
                            <i className="fas fa-check"></i>
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <span className="btn-icon">
                              <i className="fas fa-plus"></i>
                            </span>
                            <span className="btn-text">Add</span>
                            <div className="btn-glow"></div>
                          </>
                        )}
                      </button>
                      
                      <button className="preview-btn" title="Preview">
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  </CSSTransition>
                ))}
              </TransitionGroup>
              
              {filteredExercises.length === 0 && (
                <div className="no-results">
                  <div className="no-results-icon">
                    <i className="fas fa-search"></i>
                  </div>
                  <h3>No exercises found</h3>
                  <p>Try adjusting your filters or search query.</p>
                  <button 
                    className="reset-filters-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveBodyPart('All');
                      setActiveCategory('All');
                      setActiveDiscipline('All');
                    }}
                  >
                    <i className="fas fa-undo"></i>
                    <span>Reset Filters</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the edit modal
  const renderEditModal = () => {
    if (!selectedExercise) return null;
    
    return (
      <div className={`modal-overlay ${modalTransition}`}>
        <div className="edit-modal" ref={modalRef}>
          <div className="modal-header">
            <h3>Edit Exercise</h3>
            <button 
              className="close-modal-btn"
              onClick={() => handleCloseModal('edit')}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="modal-body">
            <div className="exercise-preview">
              <div className="exercise-image">
                <img src={selectedExercise.imageUrl} alt={selectedExercise.name} />
                <div className="image-overlay">
                  <div className="discipline-indicator" data-discipline={selectedExercise.discipline}>
                    {selectedExercise.discipline}
                  </div>
                </div>
              </div>
              
              <div className="exercise-basic-info">
                <h4>{selectedExercise.name}</h4>
                <p>{selectedExercise.description}</p>
                <div className="tag-list">
                  <span className="discipline-tag" data-discipline={selectedExercise.discipline}>
                    {selectedExercise.discipline}
                  </span>
                  <span className="category-tag">{selectedExercise.category}</span>
                  <span className="body-part-tag">{selectedExercise.bodyPart}</span>
                </div>
              </div>
            </div>
            
            <div className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-sets">
                    <i className="fas fa-layer-group"></i>
                    <span>Sets</span>
                  </label>
                  <div className="number-input">
                    <button 
                      type="button" 
                      className="decrement-btn"
                      onClick={() => handleEditInputChange('sets', Math.max(1, selectedExercise.sets - 1))}
                      disabled={selectedExercise.sets <= 1}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <input
                      id="edit-sets"
                      type="number"
                      min="1"
                      max="10"
                      value={selectedExercise.sets}
                      onChange={(e) => handleEditInputChange('sets', e.target.value)}
                    />
                    <button 
                      type="button"
                      className="increment-btn"
                      onClick={() => handleEditInputChange('sets', selectedExercise.sets + 1)}
                      disabled={selectedExercise.sets >= 10}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                    <div className="input-tooltip">Number of sets to perform</div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-reps">
                    <i className="fas fa-redo"></i>
                    <span>Repetitions</span>
                  </label>
                  <div className="number-input">
                    <button 
                      type="button"
                      className="decrement-btn"
                      onClick={() => handleEditInputChange('reps', Math.max(1, selectedExercise.reps - 1))}
                      disabled={selectedExercise.reps <= 1}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <input
                      id="edit-reps"
                      type="number"
                      min="1"
                      max="100"
                      value={selectedExercise.reps}
                      onChange={(e) => handleEditInputChange('reps', e.target.value)}
                    />
                    <button 
                      type="button"
                      className="increment-btn"
                      onClick={() => handleEditInputChange('reps', selectedExercise.reps + 1)}
                      disabled={selectedExercise.reps >= 100}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                    <div className="input-tooltip">Number of repetitions per set</div>
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-sessions">
                    <i className="fas fa-calendar-day"></i>
                    <span>Sessions per day</span>
                  </label>
                  <div className="number-input">
                    <button 
                      type="button"
                      className="decrement-btn"
                      onClick={() => handleEditInputChange('sessions', Math.max(1, selectedExercise.sessions - 1))}
                      disabled={selectedExercise.sessions <= 1}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <input
                      id="edit-sessions"
                      type="number"
                      min="1"
                      max="10"
                      value={selectedExercise.sessions}
                      onChange={(e) => handleEditInputChange('sessions', e.target.value)}
                    />
                    <button 
                      type="button"
                      className="increment-btn"
                      onClick={() => handleEditInputChange('sessions', selectedExercise.sessions + 1)}
                      disabled={selectedExercise.sessions >= 10}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                    <div className="input-tooltip">How many times per day to perform this exercise</div>
                  </div>
                </div>
                
                <div className="form-group hep-toggle">
                  <label>
                    <i className="fas fa-home"></i>
                    <span>Include in Home Exercise Program</span>
                  </label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="edit-hep"
                      checked={selectedExercise.isHEP}
                      onChange={(e) => handleEditInputChange('isHEP', e.target.checked)}
                    />
                    <label htmlFor="edit-hep">
                      <span className="toggle-indicator"></span>
                      <span className="toggle-label">{selectedExercise.isHEP ? 'Yes' : 'No'}</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="form-row instructions">
                <div className="form-group notes-group">
                  <label>
                    <i className="fas fa-clipboard-list"></i>
                    <span>Special Instructions</span>
                  </label>
                  <textarea
                    placeholder="Add any special instructions or notes for this exercise..."
                    rows={3}
                    value={selectedExercise.notes || ''}
                    onChange={(e) => handleEditInputChange('notes', e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              className="cancel-btn"
              onClick={() => handleCloseModal('edit')}
            >
              <i className="fas fa-times"></i>
              <span>Cancel</span>
            </button>
            <button 
              className="save-btn"
              onClick={handleSaveEdit}
            >
              <i className="fas fa-check"></i>
              <span>Save Changes</span>
              <div className="btn-shine"></div>
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the delete confirmation modal
  const renderDeleteModal = () => {
    if (!exerciseToDelete) return null;
    
    return (
      <div className={`modal-overlay ${modalTransition}`}>
        <div className="delete-modal" ref={modalRef}>
          <div className="modal-header">
            <h3>Delete Exercise</h3>
            <button 
              className="close-modal-btn"
              onClick={() => handleCloseModal('delete')}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="modal-body">
            <div className="delete-warning-icon">
              <i className="fas fa-exclamation-triangle"></i>
              <div className="warning-pulse"></div>
            </div>
            
            <h4>Are you sure you want to delete this exercise?</h4>
            
            <div className="exercise-summary">
              <div className="exercise-image">
                <img src={exerciseToDelete.imageUrl} alt={exerciseToDelete.name} />
              </div>
              <div className="exercise-info">
                <p className="exercise-name">{exerciseToDelete.name}</p>
                <div className="exercise-meta">
                  <span className="body-part">{exerciseToDelete.bodyPart}</span>
                  <span className="category">{exerciseToDelete.category}</span>
                  <span className="discipline" data-discipline={exerciseToDelete.discipline}>
                    {exerciseToDelete.discipline}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="warning-message">
              <i className="fas fa-info-circle"></i>
              <span>This action cannot be undone.</span>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              className="cancel-btn"
              onClick={() => handleCloseModal('delete')}
            >
              <span>Cancel</span>
            </button>
            <button 
              className="delete-btn"
              onClick={handleConfirmDelete}
            >
              <i className="fas fa-trash"></i>
              <span>Delete Exercise</span>
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render advanced loading screen with animations
  const renderLoadingScreen = () => {
    return (
      <div className="advanced-loading-overlay">
        <div className="loading-container">
          <div className="loading-card">
            <div className="loading-progress">
              <svg className="progress-ring" width="120" height="120">
                <circle
                  className="progress-ring-circle-bg"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  fill="transparent"
                  r="50"
                  cx="60"
                  cy="60"
                />
                <circle
                  className="progress-ring-circle"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  r="50"
                  cx="60"
                  cy="60"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 50}`,
                    strokeDashoffset: `${2 * Math.PI * 50 * (1 - loadingProgress / 100)}`
                  }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="progress-percentage">
                <span>{Math.round(loadingProgress)}%</span>
              </div>
            </div>
            
            <div className="loading-text">
              <span>{loadingText}</span>
              <div className="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
            
            <div className="loading-animation">
              {loadingAnimation === 'library' && (
                <div className="loading-library-animation">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="loading-exercise-card" style={{ animationDelay: `${i * 0.2}s` }}>
                      <div className="loading-image"></div>
                      <div className="loading-content">
                        <div className="loading-title"></div>
                        <div className="loading-text-line"></div>
                        <div className="loading-text-line short"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {loadingAnimation === 'adding' && (
                <div className="loading-add-animation">
                  <i className="fas fa-dumbbell"></i>
                  <div className="add-effect"></div>
                </div>
              )}
              
              {loadingAnimation === 'updating' && (
                <div className="loading-update-animation">
                  <i className="fas fa-sync"></i>
                  <div className="update-effect"></div>
                </div>
              )}
              
              {loadingAnimation === 'deleting' && (
                <div className="loading-delete-animation">
                  <i className="fas fa-trash"></i>
                  <div className="delete-effect"></div>
                </div>
              )}
              
              {loadingAnimation === 'saving' && (
                <div className="loading-save-animation">
                  <i className="fas fa-save"></i>
                  <div className="save-effect"></div>
                </div>
              )}
              
              <div className="loading-pulse"></div>
              <div className="loading-particles">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="particle"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render success and error notifications
  const renderNotifications = () => {
    return (
      <>
        {saveSuccess && (
          <div className="notification success-notification">
            <div className="notification-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="notification-content">
              <h4>Success!</h4>
              <p>Changes have been saved successfully.</p>
            </div>
            <button 
              className="close-notification"
              onClick={() => setSaveSuccess(false)}
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="notification-progress-bar">
              <div className="progress-indicator"></div>
            </div>
          </div>
        )}
        
        {saveError && (
          <div className="notification error-notification">
            <div className="notification-icon">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <div className="notification-content">
              <h4>Error!</h4>
              <p>There was a problem saving the changes. Please try again.</p>
            </div>
            <button 
              className="close-notification"
              onClick={() => setSaveError(false)}
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="notification-progress-bar">
              <div className="progress-indicator"></div>
            </div>
          </div>
        )}
      </>
    );
  };
  
  // Render add animation overlay
  const renderAddAnimation = () => {
    if (!showAddAnimation) return null;
    
    return (
      <div className="add-animation-overlay">
        <div className="floating-exercise" ref={addButtonRef}>
          <i className="fas fa-dumbbell"></i>
          <div className="floating-trail"></div>
        </div>
      </div>
    );
  };
  
  // Main component render
  return (
    <div className="exercises-component">
      <div className="card-header">
        <div className="header-title">
          <i className="fas fa-dumbbell"></i>
          <h3>Patient Exercises</h3>
        </div>
        <div className="header-actions">
          <button className="help-button" title="Help">
            <i className="fas fa-question-circle"></i>
          </button>
        </div>
      </div>
      
      <div className="card-body">
        {isLoading ? renderLoadingScreen() : (
          printMode ? renderPrintView() : renderSelectedExercises()
        )}
      </div>
      
      {showExerciseLibrary && renderExerciseLibrary()}
      {showEditModal && renderEditModal()}
      {showDeleteModal && renderDeleteModal()}
      {renderNotifications()}
      {renderAddAnimation()}
    </div>
  );
};

export default ExercisesComponent;