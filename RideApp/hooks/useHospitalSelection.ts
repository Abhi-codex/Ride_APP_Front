import { useState } from 'react';
import { Alert } from 'react-native';
import { Hospital } from '../types/patient';

interface LocationRegion {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
}

export interface HospitalSelectionState {
  selectedHospital: Hospital | null;
  routeCoords: Array<{ latitude: number; longitude: number }>;
  routeLoading: boolean;
  selectHospital: (hospital: Hospital, originalLocation: LocationRegion) => Promise<void>;
  clearSelectedHospital: (originalLocation: LocationRegion | null) => void;
  getOptimalMapRegion: (hospital: Hospital, originalLocation: LocationRegion) => LocationRegion | null;
}

export function useHospitalSelection(): HospitalSelectionState {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [routeLoading, setRouteLoading] = useState(false);

  const decodePolyline = (t: string) => {
    let points = [], index = 0, lat = 0, lng = 0;
    while (index < t.length) {
      let b, shift = 0, result = 0;
      do { b = t.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; }
      while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = result = 0;
      do { b = t.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; }
      while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  const selectHospital = async (hospital: Hospital, originalLocation: LocationRegion) => {
    setSelectedHospital(hospital);
    setRouteLoading(true);
    
    if (originalLocation) {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        Alert.alert('Error', 'Google Maps API key not configured');
        setRouteLoading(false);
        return;
      }
      
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originalLocation.latitude},${originalLocation.longitude}&destination=${hospital.latitude},${hospital.longitude}&key=${apiKey}`;
      
      try {
        const response = await fetch(directionsUrl);
        const data = await response.json();
        
        if (data.routes.length > 0) {
          const points = decodePolyline(data.routes[0].overview_polyline.points);
          setRouteCoords(points);
        } else {
          // Fallback to simple straight line route
          const route = [
            { latitude: originalLocation.latitude, longitude: originalLocation.longitude },
            { latitude: hospital.latitude, longitude: hospital.longitude },
          ];
          setRouteCoords(route);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        // Fallback to simple straight line route
        const route = [
          { latitude: originalLocation.latitude, longitude: originalLocation.longitude },
          { latitude: hospital.latitude, longitude: hospital.longitude },
        ];
        setRouteCoords(route);
      } finally {
        setRouteLoading(false);
      }
    }
  };

  const clearSelectedHospital = (originalLocation: LocationRegion | null) => {
    setSelectedHospital(null);
    setRouteCoords([]);
  };

  const getOptimalMapRegion = (hospital: Hospital, originalLocation: LocationRegion): LocationRegion | null => {
    if (!hospital || !originalLocation) return null;

    // Calculate optimal region to show both user location and hospital
    const minLat = Math.min(originalLocation.latitude, hospital.latitude);
    const maxLat = Math.max(originalLocation.latitude, hospital.latitude);
    const minLng = Math.min(originalLocation.longitude, hospital.longitude);
    const maxLng = Math.max(originalLocation.longitude, hospital.longitude);
    
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const deltaLat = Math.abs(maxLat - minLat) * 1.5; // Add some padding
    const deltaLng = Math.abs(maxLng - minLng) * 1.5;
    
    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(deltaLat, 0.01), // Minimum zoom level
      longitudeDelta: Math.max(deltaLng, 0.01),
    };
  };

  return {
    selectedHospital,
    routeCoords,
    routeLoading,
    selectHospital,
    clearSelectedHospital,
    getOptimalMapRegion
  };
}
