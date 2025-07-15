import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, Alert, Text, View, TouchableOpacity } from 'react-native';
import { colors, styles } from '../../constants/TailwindStyles';
import { PatientRideMap, TripSummary } from '../../components/patient';
import { Ionicons } from '@expo/vector-icons';
import { useRideTracking } from '../../hooks';
import { RideStatus } from '../../types/rider';

function getFirstParam(param: string | string[] | undefined): string {
  if (!param) return '';
  return Array.isArray(param) ? param[0] : param;
}

export default function TrackingScreen() {
  const params = useLocalSearchParams();
  const rideId = getFirstParam(params.rideId);
  
  // Get user's current location
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  
  const [routeCoords, setRouteCoords] = useState<Array<any>>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  
  const {
    ride,
    loading: rideLoading,
    error: rideError,
    rideStatus,
    driverLocation,
    refreshRideData
  } = useRideTracking(rideId);

  const availableDrivers = useMemo(() => {
    const drivers = [];
    
    if (ride?.rider) {
      const driverLoc = driverLocation || {
        latitude: ride.pickup.latitude,
        longitude: ride.pickup.longitude
      };
      
      drivers.push({
        id: ride.rider._id,
        location: driverLoc,
        isAccepted: true
      });
    }
    
    return drivers;
  }, [ride?.rider?._id, driverLocation, ride?.pickup]);

  const destinationLocation = useMemo(() => {
    return ride?.drop ? {
      latitude: ride.drop.latitude,
      longitude: ride.drop.longitude
    } : null;
  }, [ride?.drop?.latitude, ride?.drop?.longitude]);

  // Get user-friendly status message
  const getStatusMessage = (status: RideStatus) => {
    switch (status) {
      case RideStatus.SEARCHING:
        return 'Searching for nearby ambulance drivers...';
      case RideStatus.START:
        return 'Ambulance is on the way to pick you up';
      case RideStatus.ARRIVED:
        return 'Ambulance has arrived at your location';
      case RideStatus.COMPLETED:
        return 'Ride completed successfully';
      default:
        return 'Processing your emergency request...';
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshRideData();
    setIsRefreshing(false);
  };

  // Initialize user location once on mount
  useEffect(() => {
    const initializeLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to track your ride.');
        setLocationLoading(false);
        return;
      }

      try {
        // Get user's current location
        const location = await Location.getCurrentPositionAsync({});
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setUserLocation(region);
      } catch (err) {
        console.error('Location error:', err);
        Alert.alert('Location error', 'Could not get your current location.');
      } finally {
        setLocationLoading(false);
      }
    };

    initializeLocation();
  }, []); // Only run once on mount

  // Separate effect to update route when ride data is available
  useEffect(() => {
    const updateRoute = async () => {
      if (!ride || !ride.drop || !userLocation) return;

      try {
        const origin = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        };
        
        const destination = {
          latitude: ride.drop.latitude,
          longitude: ride.drop.longitude
        };
        
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.routes?.length > 0) {
          const coords = json.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => ({ latitude: lat, longitude: lng })
          );
          setRouteCoords(coords);
        }
      } catch (err) {
        console.error('Route error:', err);
      }
    };

    updateRoute();
  }, [ride?.drop?.latitude, ride?.drop?.longitude, userLocation?.latitude, userLocation?.longitude]); // Only when specific location data changes

  // Show loading state if we're loading location or ride data
  if (locationLoading || rideLoading) {
    return (
      <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter, styles.bgGray50]}>
        <ActivityIndicator size="large" color={colors.emergency[600]} />
        <Text style={[styles.mt3, styles.textBase, styles.textGray600]}>
          {locationLoading ? 'Getting your location...' : 'Loading ride details...'}
        </Text>
        {rideLoading && (
          <Text style={[styles.mt1, styles.textSm, styles.textGray500]}>
            Connecting to emergency services...
          </Text>
        )}
      </View>
    );
  }

  // Show message if no userLocation or ride data yet
  if (!userLocation || !ride) {
    return (
      <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter, styles.bgGray50]}>
        <Ionicons name="location-outline" size={48} color={colors.gray[400]} />
        <Text style={[styles.mt3, styles.textLg, styles.fontBold, styles.textGray700]}>
          Setting up tracking...
        </Text>
        <Text style={[styles.mt1, styles.textBase, styles.textGray600, styles.textCenter, styles.mx4]}>
          {!userLocation ? 'Waiting for location access' : 'Initializing emergency services'}
        </Text>
      </View>
    );
  }

  // Show error if there's an issue with fetching ride data
  if (rideError) {
    return (
      <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter, styles.bgGray50]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger[500]} />
        <Text style={[styles.mt3, styles.textLg, styles.fontBold, styles.textDanger700]}>
          Error Loading Ride
        </Text>
        <Text style={[styles.mt1, styles.textBase, styles.textGray600, styles.textCenter, styles.mx4]}>
          {rideError}
        </Text>
        <TouchableOpacity
          style={[styles.mt4, styles.bgPrimary600, styles.roundedLg, styles.py2, styles.px4]}
          onPress={handleRefresh}
        >
          <Text style={[styles.textBase, styles.textWhite, styles.fontBold]}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!destinationLocation) {
    return (
      <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter, styles.bgGray50]}>
        <Text style={[styles.textBase, styles.textDanger600]}>
          Destination information not available
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.flex1]}>
      {/* Status Header */}
      <View style={[
        styles.bgEmergency500, 
        styles.py3, 
        styles.px4, 
        styles.shadowSm,
        styles.mt8,
        { backgroundColor: rideStatus === RideStatus.SEARCHING ? colors.warning[400] : 
                           rideStatus === RideStatus.COMPLETED ? colors.medical[500] : 
                           colors.emergency[500] }
      ]}>
        <View style={[styles.flexRow, styles.alignCenter, styles.justifyCenter]}>
          <Ionicons 
            name={rideStatus === RideStatus.SEARCHING ? "search" : 
                  rideStatus === RideStatus.ARRIVED ? "checkmark-circle" :
                  rideStatus === RideStatus.COMPLETED ? "checkmark-done-circle" : "car"} 
            size={20} 
            color="white" 
            style={[styles.mr2]} 
          />
          <Text style={[styles.textWhite, styles.textBase, styles.fontBold]}>
            {getStatusMessage(rideStatus)}
          </Text>
        </View>
      </View>

      <PatientRideMap
        userLocation={userLocation}
        destinationLocation={destinationLocation}
        availableDrivers={availableDrivers}
        routeCoords={routeCoords}
        acceptedRide={ride}
      />

      <TripSummary 
        status={rideStatus}
        distance={ride.distance || 0}
        // Calculate duration based on distance if not available
        duration={ride.distance ? Math.round(ride.distance / 0.6) : 0} // ~36km/h average ambulance speed in traffic
        ambulanceType={ride.vehicle || 'bls'} 
        otp={ride.otp || ''}
        vehicleDetails={ride.rider ? `${ride.rider.vehicle.model} (${ride.rider.vehicle.plateNumber})` : undefined}
        driverName={ride.rider?.name || undefined}
        emergencyType={getFirstParam(params.emergencyType)}
        emergencyName={getFirstParam(params.emergencyName)}
        priority={getFirstParam(params.priority)}
      />
    </View>
  );
}
