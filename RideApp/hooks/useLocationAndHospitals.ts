import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { Hospital } from '../types/patient';

interface LocationRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface LocationState {
  currentLocation: LocationRegion | null;
  originalLocation: LocationRegion | null;
  hospitals: Hospital[];
  loading: boolean;
}

export function useLocationAndHospitals(): LocationState {
  const [currentLocation, setCurrentLocation] = useState<LocationRegion | null>(null);
  const [originalLocation, setOriginalLocation] = useState<LocationRegion | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location permission is required.');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        const region = {
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        };
        setCurrentLocation(region);
        setOriginalLocation(region);
        await fetchHospitals(latitude, longitude);
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Unable to get current location.');
      } finally {
        setLoading(false);
      }
    };

    getCurrentLocation();
  }, []);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const fetchHospitals = async (lat: number, lon: number) => {
    const radius = 10000; // 10km radius
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      Alert.alert('Error', 'Google Maps API key not configured');
      return;
    }
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=hospital&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        Alert.alert('Error', 'Unable to fetch hospitals');
        return;
      }

      const fetchedHospitals = data.results.slice(0, 20).map((place: any) => {
        const distance = getDistance(lat, lon, place.geometry.location.lat, place.geometry.location.lng);
        const photoRef = place.photos?.[0]?.photo_reference;
        return {
          id: place.place_id,
          name: place.name,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
          rating: place.rating,
          photoUrl: photoRef
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${apiKey}`
            : 'https://via.placeholder.com/80x80?text=H',
        };
      });

      setHospitals(fetchedHospitals);
    } catch (err) {
      console.error('Failed to fetch hospital data:', err);
      Alert.alert('Error', 'Failed to fetch hospital data.');
    }
  };

  return {
    currentLocation,
    originalLocation,
    hospitals,
    loading
  };
}
