export type Hospital = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  rating?: number;
  photoUrl?: string;
  emergencyServices?: string[];
  placeId?: string;
  specialties?: string[];
  // Enhanced emergency capability fields
  emergencyCapabilityScore?: number;
  emergencyFeatures?: string[];
  isEmergencyVerified?: boolean;
  recommendation?: string;
  address?: string;
  isOpen?: boolean;
  priceLevel?: number;
};

export type AmbulanceType = 'bls' | 'als' | 'ccs' | 'auto' | 'bike';

export interface AmbulanceOption {
  key: AmbulanceType;
  label: string;
  desc: string;
}
