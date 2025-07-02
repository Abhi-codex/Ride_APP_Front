import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Ride, RideStatus } from '../types/rider';
import { getServerUrl } from '../utils/network';

export const useRiderLogic = () => {
  const [routeCoords, setRouteCoords] = useState([]);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [tripStarted, setTripStarted] = useState(false);
  const [online, setOnline] = useState(false);
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [acceptedRide, setAcceptedRide] = useState<Ride | null>(null);

  useEffect(() => {
    if (!online) return;
    fetchAvailableRides();
  }, [online]);
  const fetchAvailableRides = async () => {
    try {
      console.log('Fetching rides from:', getServerUrl());
      const token = await AsyncStorage.getItem("access_token");
      console.log('Token found:', !!token);
      
      if (!token) {
        console.error('No access token found');
        Alert.alert('Authentication Error', 'Please login first');
        return;
      }

      const url = `${getServerUrl()}/ride/driverrides`;
      console.log('Making request to:', url);
        const res = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log('Fetched rides data:', data);
      
      if (data.rides && Array.isArray(data.rides)) {
        const searchingRides = data.rides.filter((ride: Ride) => ride.status === RideStatus.SEARCHING);
        console.log('Available rides found:', searchingRides.length);
        setAvailableRides(searchingRides);
      } else {
        console.log('No rides array in response');
        setAvailableRides([]);
      }
    } catch (error) {
      console.error("Error fetching rides:", error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        Alert.alert(
          'Connection Error', 
          'Cannot connect to server. Make sure:\n• Backend server is running\n• Using correct IP address\n• No firewall blocking connection'
        );
      } else {
        Alert.alert('Error', 'Failed to fetch available rides');
      }
    }
  };

  const fetchRoute = async (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.routes?.[0]?.geometry?.coordinates) {
        const coords = json.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => ({
          latitude: lat,
          longitude: lng
        }));
        setRouteCoords(coords);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not fetch route.');
    }
  };

  const handleAcceptRide = async (rideId: string, driverLocation: any) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(`${getServerUrl()}/ride/accept/${rideId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      const ride = data.ride;
      Alert.alert("Ride accepted!");

      setAcceptedRide(ride);
      setAvailableRides([]);
      setTripStarted(false);
      const dropLocation = {
        latitude: ride.drop.latitude,
        longitude: ride.drop.longitude,
      };
      setDestination(dropLocation);
      if (driverLocation) {
        fetchRoute(driverLocation, dropLocation);
      }
    } catch (error) {
      Alert.alert("Failed to accept ride");
      console.error(error);
    }
  };

  const updateRideStatus = async (rideId: string, status: RideStatus) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(`${getServerUrl()}/ride/update/${rideId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update ride status");
      }

      Alert.alert("Success", `Ride status updated to ${status}`);
      setAcceptedRide(data.ride);

      if (status === RideStatus.COMPLETED) {
        setAcceptedRide(null);
        setDestination(null);
        setRouteCoords([]);
        setTripStarted(false);
        fetchAvailableRides();
      } else if (status === RideStatus.STARTED) {
        setTripStarted(true);
      }
    } catch (error) {
      console.error("Error updating ride status:", error);
      Alert.alert("Error", "Could not update ride status");
    }
  };

  const handleRejectRide = (rideId: string) => {
    setAvailableRides(prev => prev.filter(r => r._id !== rideId));
    fetchAvailableRides();
  };
  const toggleOnline = () => {
    setOnline(!online);
    if (!online) {
      checkAuthState();
    }
  };

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      console.log('🔐 Auth Debug:');
      console.log('- Token exists:', !!token);
      console.log('- Token length:', token ? token.length : 0);
      console.log('- Server URL:', getServerUrl());
      
      if (token) {
        // Test token validity
        const res = await fetch(`${getServerUrl()}/ride/driverrides`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('- Token test status:', res.status);
        
        if (res.status === 401) {
          console.log('⚠️  Token expired or invalid');
          Alert.alert('Authentication Error', 'Please login again');
        }
      } else {
        Alert.alert('Not Logged In', 'Please login first to see available rides');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };
  return {
    routeCoords,
    destination,
    tripStarted,
    online,
    availableRides,
    acceptedRide,
    handleAcceptRide,
    updateRideStatus,
    handleRejectRide,
    toggleOnline,
    checkAuthState, // Export for debugging
  };
};
