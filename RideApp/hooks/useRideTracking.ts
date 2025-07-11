import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getServerUrl } from '../utils/network';
import { Ride, RideStatus } from '../types/rider';

interface TrackingState {
  ride: Ride | null;
  loading: boolean;
  error: string | null;
  rideStatus: RideStatus;
  driverLocation: { latitude: number; longitude: number } | null;
  refreshRideData: () => Promise<void>;
}

export function useRideTracking(rideId: string): TrackingState {
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<RideStatus>(RideStatus.SEARCHING);
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const fetchRideDetails = async () => {
    if (!rideId) {
      setError('No ride ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Fetch current ride details
      const response = await fetch(`${getServerUrl()}/ride/rides?id=${rideId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch ride details: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      if (data && data.rides && data.rides.length > 0) {
        const currentRide = data.rides[0];
        setRide(currentRide);
        setRideStatus(currentRide.status);
        
        // If ride has been accepted, get driver's current location
        if (currentRide.rider && 
            (currentRide.status === RideStatus.START || 
             currentRide.status === RideStatus.ARRIVED)) {
          try {
            // This would be an API endpoint that returns the driver's current location
            // For now, we'll use the pickup location as a fallback
            setDriverLocation({
              latitude: currentRide.rider.location?.latitude || currentRide.pickup.latitude,
              longitude: currentRide.rider.location?.longitude || currentRide.pickup.longitude,
            });
          } catch (locationError) {
            console.warn('Error getting driver location:', locationError);
            // Fallback to pickup location if driver location not available
            setDriverLocation({
              latitude: currentRide.pickup.latitude,
              longitude: currentRide.pickup.longitude,
            });
          }
        }
      } else {
        setError('Ride not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching ride details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRideDetails();
    
    // Set up polling for ride status updates
    const intervalId = setInterval(() => {
      fetchRideDetails();
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [rideId]);

  return {
    ride,
    loading,
    error,
    rideStatus,
    driverLocation,
    refreshRideData: fetchRideDetails
  };
}
