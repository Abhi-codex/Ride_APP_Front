import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { 
  Ride, 
  RideStatus, 
  Driver, 
  DriverStats, 
  ApiResponse, 
  RideResponse 
} from '../types/rider';
import { getServerUrl } from '../utils/network';

export const useRiderLogic = () => {
  const [routeCoords, setRouteCoords] = useState([]);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [tripStarted, setTripStarted] = useState(false);
  const [online, setOnline] = useState(false);
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [acceptedRide, setAcceptedRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Driver statistics and profile data with proper types
  const [driverStats, setDriverStats] = useState<DriverStats>({
    totalRides: 0,
    todayRides: 0,
    todayEarnings: 0,
    weeklyRides: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    rating: 0
  });
  const [driverProfile, setDriverProfile] = useState<Driver | null>(null);

  // Auto-refresh intervals
  const [refreshInterval, setRefreshInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchDriverProfile();
    fetchDriverStats();
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (online && !acceptedRide) {
      fetchAvailableRides();
      updateOnlineStatus(true);
      
      const interval = setInterval(() => {
        if (online && !acceptedRide) {
          fetchAvailableRides();
        }
      }, 30000);   //auto refresh every 30 seconds
      
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (!online) {
      updateOnlineStatus(false);
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [online, acceptedRide]);

  const handleApiError = useCallback((error: any, context: string) => {
    console.error(`${context} error:`, error);
    
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      setError('Connection failed. Check your network and server.');
      Alert.alert(
        'Connection Error', 
        'Cannot connect to server. Make sure:\n• Backend server is running\n• Using correct IP address\n• No firewall blocking connection'
      );
    } else if (error.message?.includes('401')) {
      setError('Authentication failed. Please login again.');
      Alert.alert('Authentication Error', 'Please login again');
    } else {
      setError(`${context} failed`);
      Alert.alert('Error', `${context} failed. Please try again.`);
    }
  }, []);

  const makeAuthenticatedRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await AsyncStorage.getItem("access_token");
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        await refreshAuthToken();
        throw new Error('Authentication failed');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, []);

  const refreshAuthToken = useCallback(async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refresh_token");
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await fetch(`${getServerUrl()}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem("access_token", data.access_token);
        await AsyncStorage.setItem("refresh_token", data.refresh_token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      Alert.alert('Session Expired', 'Please login again');
    }
    return false;
  }, []);

  const updateOnlineStatus = useCallback(async (isOnline: boolean) => {
    try {
      await makeAuthenticatedRequest(`${getServerUrl()}/driver/online-status`, {
        method: 'PUT',
        body: JSON.stringify({ isOnline }),
      });
      
      // Update local profile state
      if (driverProfile) {
        setDriverProfile({ ...driverProfile, isOnline });
      }
    } catch (error) {
      handleApiError(error, 'Update online status');
    }
  }, [driverProfile, makeAuthenticatedRequest, handleApiError]);

  const fetchAvailableRides = useCallback(async () => {
    if (loading) return; // Prevent multiple simultaneous requests
    
    try {
      setLoading(true);
      setError(null);
      
      const data: RideResponse = await makeAuthenticatedRequest(`${getServerUrl()}/ride/driverrides`);
      
      if (data.rides && Array.isArray(data.rides)) {
        const searchingRides = data.rides.filter((ride: Ride) => ride.status === RideStatus.SEARCHING);
        setAvailableRides(searchingRides);
      } else {
        setAvailableRides([]);
      }
    } catch (error) {
      handleApiError(error, 'Fetch available rides');
      setAvailableRides([]);
    } finally {
      setLoading(false);
    }
  }, [loading, makeAuthenticatedRequest, handleApiError]);

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
      console.error('Route fetch error:', error);
      Alert.alert('Navigation Error', 'Could not fetch route. Using direct path.');
    }
  };

  const fetchDriverStats = useCallback(async () => {
    try {
      setError(null);
      const data: ApiResponse<DriverStats> = await makeAuthenticatedRequest(`${getServerUrl()}/driver/stats`);
      
      if (data.data) {
        setDriverStats(data.data);
      }
    } catch (error) {
      handleApiError(error, 'Fetch driver statistics');
    }
  }, [makeAuthenticatedRequest, handleApiError]);

  const fetchDriverProfile = useCallback(async () => {
    try {
      setError(null);
      const data: ApiResponse<Driver> = await makeAuthenticatedRequest(`${getServerUrl()}/driver/profile`);
      
      if (data.data) {
        setDriverProfile(data.data);
        setOnline(data.data.isOnline); // Sync online state with backend
      }
    } catch (error) {
      handleApiError(error, 'Fetch driver profile');
    }
  }, [makeAuthenticatedRequest, handleApiError]);

  const handleAcceptRide = useCallback(async (rideId: string, driverLocation: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const data: RideResponse = await makeAuthenticatedRequest(`${getServerUrl()}/ride/accept/${rideId}`, {
        method: 'PATCH',
      });
      
      if (data.ride) {
        Alert.alert("Success", "Emergency call accepted successfully!");
        setAcceptedRide(data.ride);
        setAvailableRides([]);
        setTripStarted(false);
        
        const dropLocation = {
          latitude: data.ride.drop.latitude,
          longitude: data.ride.drop.longitude,
        };
        setDestination(dropLocation);
        
        if (driverLocation) {
          await fetchRoute(driverLocation, dropLocation);
        }
        
        // Refresh stats after accepting a ride
        fetchDriverStats();
      }
    } catch (error) {
      handleApiError(error, 'Accept ride');
    } finally {
      setLoading(false);
    }
  }, [makeAuthenticatedRequest, handleApiError, fetchDriverStats]);

  const updateRideStatus = useCallback(async (rideId: string, status: RideStatus) => {
    try {
      setLoading(true);
      setError(null);
      
      const data: RideResponse = await makeAuthenticatedRequest(`${getServerUrl()}/ride/update/${rideId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      if (data.ride) {
        Alert.alert("Success", `Ride status updated to ${status}`);
        setAcceptedRide(data.ride);

        if (status === RideStatus.COMPLETED) {
          setAcceptedRide(null);
          setDestination(null);
          setRouteCoords([]);
          setTripStarted(false);
          
          // Refresh everything after completion
          fetchAvailableRides();
          fetchDriverStats();
        } else if (status === RideStatus.START) {
          setTripStarted(true);
        } else if (status === RideStatus.ARRIVED) {
          setTripStarted(true);
        }
      }
    } catch (error) {
      handleApiError(error, 'Update ride status');
    } finally {
      setLoading(false);
    }
  }, [makeAuthenticatedRequest, handleApiError, fetchAvailableRides, fetchDriverStats]);

  const handleRejectRide = useCallback((rideId: string) => {
    setAvailableRides(prev => prev.filter(r => r._id !== rideId));
    // Optionally, you could call an API endpoint to notify backend about rejection
  }, []);

  const toggleOnline = useCallback(() => {
    const newOnlineState = !online;
    setOnline(newOnlineState);
    
    if (newOnlineState) {
      checkAuthState();
    }
  }, [online]);

  const checkAuthState = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      
      if (token) {
        // Test token validity with a simple request
        await makeAuthenticatedRequest(`${getServerUrl()}/driver/profile`);
      } else {
        Alert.alert('Not Logged In', 'Please login first to see available rides');
        setOnline(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setOnline(false);
    }
  }, [makeAuthenticatedRequest]);

  // Add method to get driver's ride history
  const fetchDriverRideHistory = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await makeAuthenticatedRequest(
        `${getServerUrl()}/driver/rides?page=${page}&limit=${limit}`
      );
      
      return data;
    } catch (error) {
      handleApiError(error, 'Fetch ride history');
      return null;
    } finally {
      setLoading(false);
    }
  }, [makeAuthenticatedRequest, handleApiError]);

  // Add method to update vehicle information
  const updateVehicleInfo = useCallback(async (vehicleData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const data: ApiResponse<{ vehicle: any }> = await makeAuthenticatedRequest(
        `${getServerUrl()}/driver/vehicle`, 
        {
          method: 'PUT',
          body: JSON.stringify(vehicleData),
        }
      );
      
      if (data.data && driverProfile) {
        setDriverProfile({
          ...driverProfile,
          vehicle: data.data.vehicle
        });
        Alert.alert('Success', 'Vehicle information updated successfully');
      }
    } catch (error) {
      handleApiError(error, 'Update vehicle information');
    } finally {
      setLoading(false);
    }
  }, [makeAuthenticatedRequest, handleApiError, driverProfile]);

  return {
    // State
    routeCoords,
    destination,
    tripStarted,
    online,
    availableRides,
    acceptedRide,
    driverStats,
    driverProfile,
    loading,
    error,
    
    // Actions
    handleAcceptRide,
    updateRideStatus,
    handleRejectRide,
    toggleOnline,
    checkAuthState,
    fetchDriverStats,
    fetchDriverProfile,
    fetchDriverRideHistory,
    updateVehicleInfo,
    
    // Utilities
    clearError: () => setError(null),
    refreshData: () => {
      fetchDriverProfile();
      fetchDriverStats();
      if (online && !acceptedRide) {
        fetchAvailableRides();
      }
    }
  };
};
