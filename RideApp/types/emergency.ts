import { AmbulanceType } from './patient';

export type EmergencyCategoryType = 
  | 'cardiac'
  | 'trauma'
  | 'respiratory'
  | 'neurological'
  | 'pediatric'
  | 'obstetric'
  | 'psychiatric'
  | 'burns'
  | 'poisoning'
  | 'general';

export interface EmergencyType {
  id: string;
  category: EmergencyCategoryType;
  name: string;
  description: string;
  icon: string;
  requiredAmbulanceTypes: AmbulanceType[];
  requiredHospitalServices: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  searchKeywords: string[];
}

export interface EmergencyCategory {
  id: EmergencyCategoryType;
  name: string;
  icon: string;
  color: string;
  emergencies: EmergencyType[];
}

// Common emergency types with their required services and ambulance types
export const EMERGENCY_TYPES: EmergencyType[] = [
  // Cardiac Emergencies
  {
    id: 'heart_attack',
    category: 'cardiac',
    name: 'Heart Attack',
    description: 'Chest pain, shortness of breath, suspected myocardial infarction',
    icon: '🫀',
    requiredAmbulanceTypes: ['als', 'ccs'],
    requiredHospitalServices: ['emergency_room', 'cardiology', 'cardiac_catheterization'],
    priority: 'critical',
    searchKeywords: ['heart attack', 'chest pain', 'myocardial infarction', 'cardiac arrest']
  },
  {
    id: 'cardiac_arrest',
    category: 'cardiac',
    name: 'Cardiac Arrest',
    description: 'Patient unconscious, no pulse, requires immediate CPR',
    icon: '🫀',
    requiredAmbulanceTypes: ['als', 'ccs'],
    requiredHospitalServices: ['emergency_room', 'cardiology', 'intensive_care'],
    priority: 'critical',
    searchKeywords: ['cardiac arrest', 'no pulse', 'unconscious', 'cpr']
  },
  {
    id: 'chest_pain',
    category: 'cardiac',
    name: 'Chest Pain',
    description: 'Non-specific chest pain, requires cardiac evaluation',
    icon: '🫁',
    requiredAmbulanceTypes: ['bls', 'als'],
    requiredHospitalServices: ['emergency_room', 'cardiology'],
    priority: 'high',
    searchKeywords: ['chest pain', 'heart pain', 'cardiac evaluation']
  },

  // Trauma Emergencies
  {
    id: 'major_trauma',
    category: 'trauma',
    name: 'Major Trauma',
    description: 'Severe injuries from accidents, falls, or violence',
    icon: '🩸',
    requiredAmbulanceTypes: ['als', 'ccs'],
    requiredHospitalServices: ['emergency_room', 'trauma_center', 'surgery', 'blood_bank'],
    priority: 'critical',
    searchKeywords: ['accident', 'trauma', 'severe injury', 'fracture', 'bleeding']
  },
  {
    id: 'motor_accident',
    category: 'trauma',
    name: 'Motor Vehicle Accident',
    description: 'Road traffic accident with potential injuries',
    icon: '🚗',
    requiredAmbulanceTypes: ['als', 'ccs'],
    requiredHospitalServices: ['emergency_room', 'trauma_center', 'orthopedics', 'neurology'],
    priority: 'critical',
    searchKeywords: ['car accident', 'road accident', 'vehicle crash', 'rta']
  },
  {
    id: 'burns',
    category: 'burns',
    name: 'Burn Injuries',
    description: 'Thermal, chemical, or electrical burns',
    icon: '🔥',
    requiredAmbulanceTypes: ['als', 'ccs'],
    requiredHospitalServices: ['emergency_room', 'burn_unit', 'plastic_surgery'],
    priority: 'critical',
    searchKeywords: ['burn', 'fire injury', 'thermal burn', 'chemical burn']
  },

  // Respiratory Emergencies
  {
    id: 'breathing_difficulty',
    category: 'respiratory',
    name: 'Breathing Difficulty',
    description: 'Shortness of breath, asthma attack, respiratory distress',
    icon: '🫁',
    requiredAmbulanceTypes: ['bls', 'als'],
    requiredHospitalServices: ['emergency_room', 'pulmonology'],
    priority: 'high',
    searchKeywords: ['breathing problem', 'shortness of breath', 'asthma', 'respiratory']
  },
  {
    id: 'choking',
    category: 'respiratory',
    name: 'Choking',
    description: 'Airway obstruction, unable to breathe or speak',
    icon: '🗣️',
    requiredAmbulanceTypes: ['bls', 'als'],
    requiredHospitalServices: ['emergency_room'],
    priority: 'critical',
    searchKeywords: ['choking', 'airway obstruction', 'cannot breathe']
  },

  // Neurological Emergencies
  {
    id: 'stroke',
    category: 'neurological',
    name: 'Stroke',
    description: 'Sudden weakness, speech problems, facial drooping',
    icon: '🧠',
    requiredAmbulanceTypes: ['als', 'ccs'],
    requiredHospitalServices: ['emergency_room', 'neurology', 'stroke_center', 'ct_scan'],
    priority: 'critical',
    searchKeywords: ['stroke', 'brain attack', 'paralysis', 'speech problem']
  },
  {
    id: 'seizure',
    category: 'neurological',
    name: 'Seizure',
    description: 'Epileptic seizure or convulsions',
    icon: '⚡',
    requiredAmbulanceTypes: ['bls', 'als'],
    requiredHospitalServices: ['emergency_room', 'neurology'],
    priority: 'high',
    searchKeywords: ['seizure', 'epilepsy', 'convulsions', 'fits']
  },
  {
    id: 'head_injury',
    category: 'neurological',
    name: 'Head Injury',
    description: 'Traumatic brain injury, concussion, head trauma',
    icon: '🤕',
    requiredAmbulanceTypes: ['als', 'ccs'],
    requiredHospitalServices: ['emergency_room', 'neurology', 'neurosurgery', 'ct_scan'],
    priority: 'critical',
    searchKeywords: ['head injury', 'brain injury', 'concussion', 'head trauma']
  },

  // Pediatric Emergencies
  {
    id: 'pediatric_emergency',
    category: 'pediatric',
    name: 'Child Emergency',
    description: 'Medical emergency involving children under 18',
    icon: '👶',
    requiredAmbulanceTypes: ['bls', 'als'],
    requiredHospitalServices: ['emergency_room', 'pediatrics'],
    priority: 'high',
    searchKeywords: ['child emergency', 'pediatric', 'baby', 'infant']
  },
  {
    id: 'newborn_emergency',
    category: 'pediatric',
    name: 'Newborn Emergency',
    description: 'Emergency involving newborn or infant',
    icon: '🍼',
    requiredAmbulanceTypes: ['als', 'ccs'],
    requiredHospitalServices: ['emergency_room', 'pediatrics', 'nicu'],
    priority: 'critical',
    searchKeywords: ['newborn', 'infant emergency', 'baby emergency']
  },

  // Obstetric Emergencies
  {
    id: 'pregnancy_emergency',
    category: 'obstetric',
    name: 'Pregnancy Emergency',
    description: 'Complications during pregnancy',
    icon: '🤰',
    requiredAmbulanceTypes: ['bls', 'als'],
    requiredHospitalServices: ['emergency_room', 'obstetrics', 'gynecology'],
    priority: 'high',
    searchKeywords: ['pregnancy emergency', 'obstetric', 'maternal']
  },
  {
    id: 'labor_delivery',
    category: 'obstetric',
    name: 'Emergency Delivery',
    description: 'Imminent birth or delivery complications',
    icon: '👶',
    requiredAmbulanceTypes: ['als'],
    requiredHospitalServices: ['emergency_room', 'obstetrics', 'delivery_room'],
    priority: 'critical',
    searchKeywords: ['delivery', 'labor', 'birth', 'obstetric emergency']
  },

  // Psychiatric Emergencies
  {
    id: 'mental_health_crisis',
    category: 'psychiatric',
    name: 'Mental Health Crisis',
    description: 'Suicide risk, psychotic episode, severe depression',
    icon: '🧠',
    requiredAmbulanceTypes: ['bls', 'als'],
    requiredHospitalServices: ['emergency_room', 'psychiatry', 'mental_health'],
    priority: 'high',
    searchKeywords: ['mental health', 'suicide', 'depression', 'psychiatric emergency']
  },

  // Poisoning
  {
    id: 'poisoning',
    category: 'poisoning',
    name: 'Poisoning/Overdose',
    description: 'Drug overdose, chemical poisoning, toxic ingestion',
    icon: '☠️',
    requiredAmbulanceTypes: ['als', 'ccs'],
    requiredHospitalServices: ['emergency_room', 'toxicology', 'intensive_care'],
    priority: 'critical',
    searchKeywords: ['poisoning', 'overdose', 'toxic', 'drug overdose']
  },

  // General Emergencies
  {
    id: 'general_emergency',
    category: 'general',
    name: 'General Medical Emergency',
    description: 'Other serious medical conditions requiring immediate care',
    icon: '🚨',
    requiredAmbulanceTypes: ['bls', 'als'],
    requiredHospitalServices: ['emergency_room'],
    priority: 'medium',
    searchKeywords: ['medical emergency', 'general emergency', 'urgent care']
  },
  {
    id: 'diabetic_emergency',
    category: 'general',
    name: 'Diabetic Emergency',
    description: 'Diabetic coma, hypoglycemia, hyperglycemia',
    icon: '💉',
    requiredAmbulanceTypes: ['bls', 'als'],
    requiredHospitalServices: ['emergency_room', 'endocrinology'],
    priority: 'high',
    searchKeywords: ['diabetes', 'diabetic coma', 'blood sugar', 'hypoglycemia']
  },
  {
    id: 'allergic_reaction',
    category: 'general',
    name: 'Severe Allergic Reaction',
    description: 'Anaphylaxis, severe allergic reaction',
    icon: '🤧',
    requiredAmbulanceTypes: ['bls', 'als'],
    requiredHospitalServices: ['emergency_room'],
    priority: 'critical',
    searchKeywords: ['allergy', 'anaphylaxis', 'allergic reaction', 'swelling']
  }
];

export const EMERGENCY_CATEGORIES: EmergencyCategory[] = [
  {
    id: 'cardiac',
    name: 'Heart & Circulation',
    icon: '💓',
    color: '#ef4444',
    emergencies: EMERGENCY_TYPES.filter(e => e.category === 'cardiac')
  },
  {
    id: 'trauma',
    name: 'Trauma & Injuries',
    icon: '🩸',
    color: '#dc2626',
    emergencies: EMERGENCY_TYPES.filter(e => e.category === 'trauma')
  },
  {
    id: 'respiratory',
    name: 'Breathing Problems',
    icon: '🫁',
    color: '#2563eb',
    emergencies: EMERGENCY_TYPES.filter(e => e.category === 'respiratory')
  },
  {
    id: 'neurological',
    name: 'Brain & Nervous System',
    icon: '🧠',
    color: '#7c3aed',
    emergencies: EMERGENCY_TYPES.filter(e => e.category === 'neurological')
  },
  {
    id: 'pediatric',
    name: 'Child Emergencies',
    icon: '👶',
    color: '#059669',
    emergencies: EMERGENCY_TYPES.filter(e => e.category === 'pediatric')
  },
  {
    id: 'obstetric',
    name: 'Pregnancy & Delivery',
    icon: '🤰',
    color: '#db2777',
    emergencies: EMERGENCY_TYPES.filter(e => e.category === 'obstetric')
  },
  {
    id: 'psychiatric',
    name: 'Mental Health',
    icon: '🧠',
    color: '#0891b2',
    emergencies: EMERGENCY_TYPES.filter(e => e.category === 'psychiatric')
  },
  {
    id: 'burns',
    name: 'Burns',
    icon: '🔥',
    color: '#ea580c',
    emergencies: EMERGENCY_TYPES.filter(e => e.category === 'burns')
  },
  {
    id: 'poisoning',
    name: 'Poisoning & Overdose',
    icon: '☠️',
    color: '#374151',
    emergencies: EMERGENCY_TYPES.filter(e => e.category === 'poisoning')
  },
  {
    id: 'general',
    name: 'General Medical',
    icon: '🚨',
    color: '#6b7280',
    emergencies: EMERGENCY_TYPES.filter(e => e.category === 'general')
  }
];
