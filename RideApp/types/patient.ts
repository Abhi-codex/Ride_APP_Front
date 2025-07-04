export type Hospital = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  rating?: number;
  photoUrl?: string;
};

export type AmbulanceType = 'basicAmbulance' | 'advancedAmbulance' | 'icuAmbulance' | 'airAmbulance';

export interface AmbulanceOption {
  key: AmbulanceType;
  label: string;
  desc: string;
}
