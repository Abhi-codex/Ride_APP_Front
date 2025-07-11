export type Hospital = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  rating?: number;
  photoUrl?: string;
};

export type AmbulanceType = 'bls' | 'als' | 'ccs' | 'auto' | 'bike';

export interface AmbulanceOption {
  key: AmbulanceType;
  label: string;
  desc: string;
}
