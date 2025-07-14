import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../../login/AuthContext';
import gsap from 'gsap';
import '../../../../../styles/developer/Patients/InfoPaciente/ExercisesComponent.scss';

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

const ExercisesComponent = () => {
  const { patientId } = useParams();
  const { currentUser } = useAuth();
  
  // States
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Nueva confirmación de borrado
  const [exerciseToDelete, setExerciseToDelete] = useState(null); // Ejercicio a borrar
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBodyPart, setActiveBodyPart] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [notification, setNotification] = useState(null);
  
  // Refs
  const exercisesGridRef = useRef(null);
  const libraryRef = useRef(null);
  const modalRef = useRef(null);

  // Exercise images mapping
  const exerciseImages = {
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
    'Arm-Chair-Push': ArmChairPush,
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
    'Deep-Squat': DeepSquat,
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
    'Flexion-Extension-Mobilization-of-Knee': FlexionExtensionMobilization,
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
    'Forward-Lunge-in-Standing': ForwardLunge,
    'Full-Body-Coordination-Coordination': FullBodyCoordinationCoordination,
    'Full-Body-Functional-Coordination': FullBodyFunctionalCoordination,
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

  // Generate exercise library from images
  const generateExerciseLibrary = () => {
    const exercises = [];
    let id = 1;
    
    Object.keys(exerciseImages).forEach(imageKey => {
      const parts = imageKey.split('-');
      const bodyPart = parts[0];
      const movement = parts.slice(1, -1).join(' ');
      const category = parts[parts.length - 1];
      
      // Map categories
      const categoryMap = {
        'Balance': 'Balance',
        'Coordination': 'Coordination',
        'Strengthening': 'Strengthening',
        'Stretching': 'Stretching',
        'Endurance': 'Endurance',
        'Functional': 'Functional',
        'Range-of-Motion': 'Range of Motion'
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
      
      // Determine discipline based on body part and category
      let discipline;
      if (['Hand', 'Wrist', 'Elbow'].includes(mappedBodyPart) || 
          ['Functional', 'Coordination'].includes(mappedCategory)) {
        discipline = 'OT';
      } else if (['Neck'].includes(mappedBodyPart)) {
        discipline = 'ST';
      } else {
        discipline = 'PT';
      }
      
      const exerciseName = imageKey.replace(/-/g, ' ');
      
      exercises.push({
        id: id++,
        name: exerciseName,
        description: `${mappedCategory} exercise for ${movement.toLowerCase()} of the ${mappedBodyPart.toLowerCase()}.`,
        bodyPart: mappedBodyPart,
        category: mappedCategory,
        discipline: discipline,
        imageUrl: exerciseImages[imageKey],
        imageKey: imageKey,
        defaultSets: Math.floor(Math.random() * 3) + 2,
        defaultReps: Math.floor(Math.random() * 10) + 10,
        defaultSessions: Math.floor(Math.random() * 2) + 1
      });
    });
    
    return exercises;
  };

  // Filter options
  const bodyParts = ['All', 'Shoulder', 'Elbow', 'Wrist', 'Hand', 'Hip', 'Knee', 'Ankle', 'Foot', 'Neck', 'Back', 'Core', 'Full Body'];
  const categories = ['All', 'Strengthening', 'Stretching', 'Balance', 'Coordination', 'Endurance', 'Functional', 'Range of Motion'];

  // Get user's allowed disciplines based on role
  const getUserDisciplines = () => {
    if (!currentUser || !currentUser.role) return ['PT', 'OT', 'ST'];
    
    const role = currentUser.role.toUpperCase();
    
    // DEVELOPER, ADMINISTRATOR, AGENCY can see all exercises
    if (['DEVELOPER', 'ADMINISTRATOR', 'AGENCY'].includes(role)) {
      return ['PT', 'OT', 'ST'];
    } 
    // PT and PTA can only see PT exercises
    else if (['PT', 'PTA'].includes(role)) {
      return ['PT'];
    } 
    // OT and COTA can only see OT exercises
    else if (['OT', 'COTA'].includes(role)) {
      return ['OT'];
    } 
    // ST and STA can only see ST exercises
    else if (['ST', 'STA'].includes(role)) {
      return ['ST'];
    }
    
    // Default fallback
    return ['PT', 'OT', 'ST'];
  };

  // Load exercises from localStorage (simulating API)
  useEffect(() => {
    loadExercises();
  }, [patientId]);

  const loadExercises = () => {
    try {
      setLoading(true);
      
      // Get patient exercises from localStorage
      const storedExercises = localStorage.getItem(`patient_exercises_${patientId}`);
      if (storedExercises) {
        const parsedExercises = JSON.parse(storedExercises);
        setExercises(parsedExercises);
      } else {
        setExercises([]);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      setExercises([]);
      showNotification('Error loading exercises', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter exercises for library based on user role
  const getFilteredLibraryExercises = () => {
    const allExercises = generateExerciseLibrary();
    const userDisciplines = getUserDisciplines();
    
    return allExercises.filter(exercise => {
      // Filter by user's allowed disciplines
      if (!userDisciplines.includes(exercise.discipline)) return false;
      
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by body part
      const matchesBodyPart = activeBodyPart === 'All' || exercise.bodyPart === activeBodyPart;
      
      // Filter by category
      const matchesCategory = activeCategory === 'All' || exercise.category === activeCategory;
      
      return matchesSearch && matchesBodyPart && matchesCategory;
    });
  };

  // Add exercise to patient
  const handleAddExercise = (libraryExercise) => {
    setSelectedExercise({
      ...libraryExercise,
      sets: libraryExercise.defaultSets,
      reps: libraryExercise.defaultReps,
      sessions: libraryExercise.defaultSessions,
      isHEP: true,
      patientId: patientId,
      notes: ''
    });
    setShowLibrary(false);
    setShowEditModal(true);
  };

  // Save exercise to localStorage
  const handleSaveExercise = () => {
    try {
      const exerciseData = {
        id: Date.now(), // Simple ID generation
        name: selectedExercise.name,
        description: selectedExercise.description,
        bodyPart: selectedExercise.bodyPart,
        category: selectedExercise.category,
        discipline: selectedExercise.discipline,
        imageKey: selectedExercise.imageKey,
        sets: selectedExercise.sets,
        reps: selectedExercise.reps,
        sessions: selectedExercise.sessions,
        isHEP: selectedExercise.isHEP,
        notes: selectedExercise.notes || '',
        patientId: patientId,
        createdAt: new Date().toISOString()
      };

      const updatedExercises = [...exercises, exerciseData];
      setExercises(updatedExercises);
      
      // Save to localStorage
      localStorage.setItem(`patient_exercises_${patientId}`, JSON.stringify(updatedExercises));
      
      setShowEditModal(false);
      setSelectedExercise(null);
      setShowConfirmModal(true);
      showNotification('Exercise added successfully!', 'success');
    } catch (error) {
      console.error('Error saving exercise:', error);
      showNotification('Error saving exercise', 'error');
    }
  };

  // Update exercise in localStorage
  const handleUpdateExercise = () => {
    try {
      const updatedExercises = exercises.map(ex => 
        ex.id === editingExercise.id ? { 
          ...editingExercise, 
          updatedAt: new Date().toISOString()
        } : ex
      );
      
      setExercises(updatedExercises);
      
      // Save to localStorage
      localStorage.setItem(`patient_exercises_${patientId}`, JSON.stringify(updatedExercises));
      
      setShowEditModal(false);
      setEditingExercise(null);
      showNotification('Exercise updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating exercise:', error);
      showNotification('Error updating exercise', 'error');
    }
  };

  // Mostrar modal de confirmación para borrar
  const handleDeleteConfirmation = (exerciseId) => {
    setExerciseToDelete(exerciseId);
    setShowDeleteModal(true);
  };

  // Delete exercise from localStorage (después de confirmación)
  const handleDeleteExercise = () => {
    try {
      const updatedExercises = exercises.filter(ex => ex.id !== exerciseToDelete);
      setExercises(updatedExercises);
      
      // Save to localStorage
      localStorage.setItem(`patient_exercises_${patientId}`, JSON.stringify(updatedExercises));
      
      setShowDeleteModal(false);
      setExerciseToDelete(null);
      showNotification('Exercise deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      showNotification('Error deleting exercise', 'error');
    }
  };

  // Cancelar borrado
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setExerciseToDelete(null);
  };

  // Edit exercise
  const handleEditExercise = (exercise) => {
    setEditingExercise({ ...exercise });
    setShowEditModal(true);
  };

  // Print exercises
  const handlePrintExercises = () => {
    const hepExercises = exercises.filter(ex => ex.isHEP);
    if (hepExercises.length === 0) {
      showNotification('No exercises marked for HEP to print', 'warning');
      return;
    }
    
    // Crear el contenido HTML para imprimir
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent(hepExercises);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Generar contenido HTML para imprimir
  const generatePrintContent = (hepExercises) => {
    // Obtener datos del paciente (simulado)
    const patientData = {
      name: 'John Doe',
      dateOfBirth: '01/15/1980',
      diagnosis: 'Lower back pain, muscle weakness',
      therapist: currentUser?.name || 'Physical Therapist',
      clinic: 'Physical Therapy Clinic',
      date: new Date().toLocaleDateString()
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Home Exercise Program - ${patientData.name}</title>
      <style>
        @page {
          margin: 0.75in;
          size: letter;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.4;
          color: #333;
          background: white;
        }
        
        .header {
          border-bottom: 3px solid #4f46e5;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .clinic-info {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .clinic-name {
          font-size: 24px;
          font-weight: bold;
          color: #4f46e5;
          margin-bottom: 5px;
        }
        
        .clinic-subtitle {
          font-size: 16px;
          color: #666;
          margin-bottom: 15px;
        }
        
        .document-title {
          text-align: center;
          font-size: 22px;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 25px;
          padding: 10px;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          border: 1px solid #cbd5e1;
          border-radius: 8px;
        }
        
        .patient-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .patient-info h3 {
          color: #4f46e5;
          font-size: 18px;
          margin-bottom: 15px;
          border-bottom: 2px solid #4f46e5;
          padding-bottom: 5px;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 8px;
        }
        
        .info-label {
          font-weight: 600;
          min-width: 100px;
          color: #64748b;
        }
        
        .info-value {
          color: #1e293b;
        }
        
        .instructions {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 25px;
        }
        
        .instructions h3 {
          color: #92400e;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .instructions ul {
          margin-left: 20px;
          color: #92400e;
        }
        
        .instructions li {
          margin-bottom: 5px;
        }
        
        .exercises-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }
        
        .exercise-card {
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .exercise-header {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          padding: 15px;
          text-align: center;
        }
        
        .exercise-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .exercise-category {
          font-size: 12px;
          opacity: 0.9;
          background: rgba(255,255,255,0.2);
          padding: 4px 8px;
          border-radius: 12px;
          display: inline-block;
        }
        
        .exercise-image {
          height: 180px;
          overflow: hidden;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .exercise-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .exercise-placeholder {
          color: #94a3b8;
          font-size: 14px;
          text-align: center;
        }
        
        .exercise-details {
          padding: 15px;
        }
        
        .parameters {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .parameter {
          text-align: center;
          padding: 8px;
          background: #f1f5f9;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }
        
        .parameter-label {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 2px;
          font-weight: 600;
        }
        
        .parameter-value {
          font-size: 16px;
          font-weight: bold;
          color: #1e293b;
        }
        
        .exercise-notes {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 6px;
          padding: 10px;
          margin-top: 10px;
        }
        
        .notes-label {
          font-size: 12px;
          font-weight: 600;
          color: #0369a1;
          margin-bottom: 5px;
        }
        
        .notes-content {
          font-size: 13px;
          color: #1e40af;
          line-height: 1.4;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
          font-size: 12px;
          color: #64748b;
        }
        
        .footer-info {
          margin-bottom: 10px;
        }
        
        .contact-info {
          font-weight: 600;
          color: #4f46e5;
        }
        
        /* Single column for smaller exercises */
        @media print {
          .exercises-grid {
            grid-template-columns: 1fr 1fr;
          }
          
          .exercise-card {
            margin-bottom: 20px;
          }
        }
        
        /* If many exercises, use single column */
        ${hepExercises.length > 6 ? `
          .exercises-grid {
            grid-template-columns: 1fr;
          }
          
          .exercise-card {
            max-width: 600px;
            margin: 0 auto 20px auto;
          }
          
          .exercise-image {
            height: 140px;
          }
        ` : ''}
      </style>
    </head>
    <body>
      <div class="header">
        <div class="clinic-info">
          <div class="clinic-name">${patientData.clinic}</div>
          <div class="clinic-subtitle">Physical Therapy & Rehabilitation Services</div>
        </div>
        
        <div class="document-title">
          Home Exercise Program (HEP)
        </div>
        
        <div class="patient-info">
          <div>
            <h3>Patient Information</h3>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${patientData.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">DOB:</span>
              <span class="info-value">${patientData.dateOfBirth}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Diagnosis:</span>
              <span class="info-value">${patientData.diagnosis}</span>
            </div>
          </div>
          <div>
            <h3>Program Details</h3>
            <div class="info-row">
              <span class="info-label">Therapist:</span>
              <span class="info-value">${patientData.therapist}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${patientData.date}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Exercises:</span>
              <span class="info-value">${hepExercises.length} prescribed</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="instructions">
        <h3>Important Instructions</h3>
        <ul>
          <li>Perform exercises as prescribed by your therapist</li>
          <li>Stop if you experience increased pain or discomfort</li>
          <li>Maintain proper form and breathing throughout each exercise</li>
          <li>Progress gradually and listen to your body</li>
          <li>Contact your therapist if you have any questions or concerns</li>
        </ul>
      </div>
      
      <div class="exercises-grid">
        ${hepExercises.map(exercise => `
          <div class="exercise-card">
            <div class="exercise-header">
              <div class="exercise-name">${exercise.name}</div>
              <div class="exercise-category">${exercise.category} • ${exercise.bodyPart}</div>
            </div>
            
            <div class="exercise-image">
              ${exercise.imageKey && exerciseImages[exercise.imageKey] ? 
                `<img src="${exerciseImages[exercise.imageKey]}" alt="${exercise.name}" />` :
                `<div class="exercise-placeholder">Exercise Illustration</div>`
              }
            </div>
            
            <div class="exercise-details">
              <div class="parameters">
                <div class="parameter">
                  <div class="parameter-label">SETS</div>
                  <div class="parameter-value">${exercise.sets}</div>
                </div>
                <div class="parameter">
                  <div class="parameter-label">REPS</div>
                  <div class="parameter-value">${exercise.reps}</div>
                </div>
                <div class="parameter">
                  <div class="parameter-label">DAILY</div>
                  <div class="parameter-value">${exercise.sessions}x</div>
                </div>
              </div>
              
              ${exercise.notes ? `
                <div class="exercise-notes">
                  <div class="notes-label">Special Instructions:</div>
                  <div class="notes-content">${exercise.notes}</div>
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="footer">
        <div class="footer-info">
          This exercise program has been specifically designed for you by your physical therapist.
        </div>
        <div class="contact-info">
          Questions? Contact us at: (555) 123-4567 | info@ptclinic.com
        </div>
      </div>
    </body>
    </html>
    `;
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // GSAP Animations
  useEffect(() => {
    if (exercisesGridRef.current) {
      gsap.fromTo(exercisesGridRef.current.children, 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }
      );
    }
  }, [exercises]);

  useEffect(() => {
    if (showLibrary && libraryRef.current) {
      gsap.fromTo(libraryRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [showLibrary]);

  useEffect(() => {
    if (showEditModal && modalRef.current) {
      gsap.fromTo(modalRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [showEditModal]);

  if (loading) {
    return (
      <div className="exercises-component">
        <div className="card-header">
          <div className="header-title">
            <i className="fas fa-dumbbell"></i>
            <h3>Patient Exercises</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading exercises...</p>
          </div>
        </div>
      </div>
    );
  }

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
        {exercises.length === 0 ? (
          // Empty state
          <div className="empty-state-container">
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-dumbbell"></i>
              </div>
              <h3>No Exercises Assigned</h3>
              <p>This patient doesn't have any exercises assigned yet.</p>
              <button 
                className="add-exercise-btn primary"
                onClick={() => setShowLibrary(true)}
              >
                <i className="fas fa-plus-circle"></i>
                <span>Add Exercises</span>
              </button>
            </div>
          </div>
        ) : (
          // Exercises list
          <div className="exercises-container">
            <div className="exercises-header">
              <div className="header-info">
                <h3>Assigned Exercises</h3>
                <span className="exercise-count">{exercises.length} exercises</span>
              </div>
              <div className="header-actions">
                <button 
                  className="add-exercise-btn"
                  onClick={() => setShowLibrary(true)}
                >
                  <i className="fas fa-plus"></i>
                  <span>Add Exercise</span>
                </button>
                <button 
                  className="print-btn"
                  onClick={handlePrintExercises}
                  disabled={exercises.filter(ex => ex.isHEP).length === 0}
                >
                  <i className="fas fa-print"></i>
                  <span>Print HEP</span>
                </button>
              </div>
            </div>

            <div className="exercises-grid" ref={exercisesGridRef}>
              {exercises.map((exercise) => (
                <div key={exercise.id} className="exercise-card">
                  <div className="exercise-header">
                    <h4>{exercise.name}</h4>
                    <div className="exercise-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditExercise(exercise)}
                        title="Edit exercise"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteConfirmation(exercise.id)}
                        title="Delete exercise"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div className="exercise-image">
                    <img 
                      src={exerciseImages[exercise.imageKey]} 
                      alt={exercise.name}
                      onError={(e) => {
                        e.target.src = '/assets/exercises/default-exercise.png';
                      }}
                    />
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
                          {exercise.isHEP ? (
                            <span className="hep-indicator yes">
                              <i className="fas fa-check"></i> Yes
                            </span>
                          ) : (
                            <span className="hep-indicator no">
                              <i className="fas fa-times"></i> No
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {exercise.notes && (
                      <div className="exercise-notes">
                        <div className="notes-label">
                          <i className="fas fa-sticky-note"></i>
                          <span>Notes:</span>
                        </div>
                        <div className="notes-content">{exercise.notes}</div>
                      </div>
                    )}
                  </div>

                  <div className="exercise-footer">
                    <div className={`discipline-badge ${exercise.discipline.toLowerCase()}`}>
                      {exercise.discipline}
                    </div>
                    <div className="category-badge">
                      {exercise.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exercise Library Modal */}
      {showLibrary && (
        <div className="modal-overlay" onClick={() => setShowLibrary(false)}>
          <div className="exercise-library-modal" ref={libraryRef} onClick={(e) => e.stopPropagation()}>
            <div className="library-header">
              <h3>Exercise Library</h3>
              <div className="library-subtitle">
                {/* Show role-based access info */}
                {getUserDisciplines().length < 3 && (
                  <span className="role-info">
                    Showing {getUserDisciplines().join(', ')} exercises only
                  </span>
                )}
              </div>
              <button 
                className="close-btn"
                onClick={() => setShowLibrary(false)}
              >
                <i className="fas fa-times"></i>
              </button>
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
              </div>
            </div>

            <div className="library-results">
              <div className="results-header">
                <span className="results-count">
                  {getFilteredLibraryExercises().length} exercises found
                </span>
                <div className="discipline-filters">
                  {getUserDisciplines().map(discipline => (
                    <span key={discipline} className={`discipline-indicator ${discipline.toLowerCase()}`}>
                      {discipline}
                    </span>
                  ))}
                </div>
              </div>

              <div className="results-grid">
                {getFilteredLibraryExercises().map((exercise) => (
                  <div key={exercise.id} className="library-exercise-card">
                    <div className="exercise-image">
                      <img src={exercise.imageUrl} alt={exercise.name} />
                      <div className={`discipline-badge ${exercise.discipline.toLowerCase()}`}>
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
                      disabled={exercises.some(ex => ex.name === exercise.name)}
                    >
                      {exercises.some(ex => ex.name === exercise.name) ? (
                        <>
                          <i className="fas fa-check"></i>
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus"></i>
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}

                {getFilteredLibraryExercises().length === 0 && (
                  <div className="no-results">
                    <div className="no-results-icon">
                      <i className="fas fa-search"></i>
                    </div>
                    <h3>No exercises found</h3>
                    <p>Try adjusting your filters or search query.</p>
                    {getUserDisciplines().length < 3 && (
                      <p className="role-restriction">
                        Note: You only have access to {getUserDisciplines().join(', ')} exercises.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (selectedExercise || editingExercise) && (
        <div className="modal-overlay" onClick={() => {
          setShowEditModal(false);
          setSelectedExercise(null);
          setEditingExercise(null);
        }}>
          <div className="edit-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingExercise ? 'Edit Exercise' : 'Configure Exercise'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedExercise(null);
                  setEditingExercise(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              {(() => {
                const exercise = editingExercise || selectedExercise;
                return (
                  <>
                    <div className="exercise-preview">
                      <div className="exercise-image">
                        <img 
                          src={exercise.imageUrl || exerciseImages[exercise.imageKey]} 
                          alt={exercise.name}
                        />
                        <div className={`discipline-badge ${exercise.discipline.toLowerCase()}`}>
                          {exercise.discipline}
                        </div>
                      </div>
                      <div className="exercise-info">
                        <h4>{exercise.name}</h4>
                        <p>{exercise.description}</p>
                        <div className="tags">
                          <span className="body-part-tag">{exercise.bodyPart}</span>
                          <span className="category-tag">{exercise.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="exercise-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>
                            <i className="fas fa-layer-group"></i>
                            <span>Sets</span>
                          </label>
                          <div className="number-input">
                            <button 
                              type="button"
                              onClick={() => {
                                const newValue = Math.max(1, exercise.sets - 1);
                                if (editingExercise) {
                                  setEditingExercise(prev => ({ ...prev, sets: newValue }));
                                } else {
                                  setSelectedExercise(prev => ({ ...prev, sets: newValue }));
                                }
                              }}
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={exercise.sets}
                              onChange={(e) => {
                                const newValue = parseInt(e.target.value) || 1;
                                if (editingExercise) {
                                  setEditingExercise(prev => ({ ...prev, sets: newValue }));
                                } else {
                                  setSelectedExercise(prev => ({ ...prev, sets: newValue }));
                                }
                              }}
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                const newValue = Math.min(10, exercise.sets + 1);
                                if (editingExercise) {
                                  setEditingExercise(prev => ({ ...prev, sets: newValue }));
                                } else {
                                  setSelectedExercise(prev => ({ ...prev, sets: newValue }));
                                }
                              }}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>
                            <i className="fas fa-redo"></i>
                            <span>Repetitions</span>
                          </label>
                          <div className="number-input">
                            <button 
                              type="button"
                              onClick={() => {
                                const newValue = Math.max(1, exercise.reps - 1);
                                if (editingExercise) {
                                  setEditingExercise(prev => ({ ...prev, reps: newValue }));
                                } else {
                                  setSelectedExercise(prev => ({ ...prev, reps: newValue }));
                                }
                              }}
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={exercise.reps}
                              onChange={(e) => {
                                const newValue = parseInt(e.target.value) || 1;
                                if (editingExercise) {
                                  setEditingExercise(prev => ({ ...prev, reps: newValue }));
                                } else {
                                  setSelectedExercise(prev => ({ ...prev, reps: newValue }));
                                }
                              }}
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                const newValue = Math.min(100, exercise.reps + 1);
                                if (editingExercise) {
                                  setEditingExercise(prev => ({ ...prev, reps: newValue }));
                                } else {
                                  setSelectedExercise(prev => ({ ...prev, reps: newValue }));
                                }
                              }}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>
                            <i className="fas fa-calendar-day"></i>
                            <span>Sessions per day</span>
                          </label>
                          <div className="number-input">
                            <button 
                              type="button"
                              onClick={() => {
                                const newValue = Math.max(1, exercise.sessions - 1);
                                if (editingExercise) {
                                  setEditingExercise(prev => ({ ...prev, sessions: newValue }));
                                } else {
                                  setSelectedExercise(prev => ({ ...prev, sessions: newValue }));
                                }
                              }}
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={exercise.sessions}
                              onChange={(e) => {
                                const newValue = parseInt(e.target.value) || 1;
                                if (editingExercise) {
                                  setEditingExercise(prev => ({ ...prev, sessions: newValue }));
                                } else {
                                  setSelectedExercise(prev => ({ ...prev, sessions: newValue }));
                                }
                              }}
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                const newValue = Math.min(10, exercise.sessions + 1);
                                if (editingExercise) {
                                  setEditingExercise(prev => ({ ...prev, sessions: newValue }));
                                } else {
                                  setSelectedExercise(prev => ({ ...prev, sessions: newValue }));
                                }
                              }}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
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
                              id="hep-toggle"
                              checked={exercise.isHEP}
                              onChange={(e) => {
                                if (editingExercise) {
                                  setEditingExercise(prev => ({ ...prev, isHEP: e.target.checked }));
                                } else {
                                  setSelectedExercise(prev => ({ ...prev, isHEP: e.target.checked }));
                                }
                              }}
                            />
                            <label htmlFor="hep-toggle" className="toggle-label">
                              <span className="toggle-indicator"></span>
                              <span className="toggle-text">
                                {exercise.isHEP ? 'Yes' : 'No'}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="form-row full-width">
                        <div className="form-group">
                          <label>
                            <i className="fas fa-clipboard-list"></i>
                            <span>Special Instructions</span>
                          </label>
                          <textarea
                            placeholder="Add any special instructions or notes for this exercise..."
                            rows={3}
                            value={exercise.notes || ''}
                            onChange={(e) => {
                              if (editingExercise) {
                                setEditingExercise(prev => ({ ...prev, notes: e.target.value }));
                              } else {
                                setSelectedExercise(prev => ({ ...prev, notes: e.target.value }));
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedExercise(null);
                  setEditingExercise(null);
                }}
              >
                <i className="fas fa-times"></i>
                <span>Cancel</span>
              </button>
              <button 
                className="save-btn"
                onClick={editingExercise ? handleUpdateExercise : handleSaveExercise}
              >
                <i className="fas fa-check"></i>
                <span>{editingExercise ? 'Update Exercise' : 'Save Exercise'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="warning-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3>Delete Exercise</h3>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to delete this exercise?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={handleCancelDelete}
              >
                <i className="fas fa-times"></i>
                <span>Cancel</span>
              </button>
              <button 
                className="delete-btn"
                onClick={handleDeleteExercise}
              >
                <i className="fas fa-trash"></i>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Exercise Added Successfully!</h3>
            </div>
            <div className="modal-body">
              <div className="success-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <p>The exercise has been added to the patient's program.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="secondary-btn"
                onClick={() => {
                  setShowConfirmModal(false);
                  setShowLibrary(true);
                }}
              >
                <i className="fas fa-plus"></i>
                <span>Add Another Exercise</span>
              </button>
              <button 
                className="primary-btn"
                onClick={() => setShowConfirmModal(false)}
              >
                <i className="fas fa-check"></i>
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-icon">
            {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
            {notification.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
            {notification.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
          </div>
          <div className="notification-content">
            <span>{notification.message}</span>
          </div>
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExercisesComponent;