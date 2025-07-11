import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View, TouchableOpacity } from 'react-native';
import { colors, styles } from '../../constants/TailwindStyles';
import { PatientRideMap, TripSummary } from '../../components/patient';
import { Ionicons } from '@expo/vector-icons';
import { useRideTracking } from '../../hooks';

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
  
  // Use the real tracking hook to get all ride data from API
  const {
    ride,
    loading: rideLoading,
    error: rideError,
    rideStatus,
    driverLocation,
    refreshRideData
  } = useRideTracking(rideId);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshRideData();
    setIsRefreshing(false);
  };

  // Initialize user location and route coordinates
  useEffect(() => {
    const initializeLocationAndRoute = async () => {
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

        // Get route coordinates for the map if we have ride data
        if (ride && ride.drop) {
          const origin = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          };
          
          const destination = {
            latitude: ride.drop.latitude,
            longitude: ride.drop.longitude
          };
          
          try {
            // Get the route for display on the map
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
        }
      } catch (err) {
        console.error('Location tracking error:', err);
        Alert.alert('Location error', 'Could not get your current location.');
      } finally {
        setLocationLoading(false);
      }
    };

    initializeLocationAndRoute();
  }, [ride]);

  // Show loading state if we're loading location or ride data
  if (locationLoading || rideLoading || !userLocation || !ride) {
    return (
      <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter, styles.bgGray50]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[styles.mt3, styles.textBase, styles.textGray600]}>
          {locationLoading ? 'Getting your location...' : 'Loading ride details...'}
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

  // Get available drivers from the ride data
  const availableDrivers = [];
  
  // If we have an assigned driver, add them as the accepted driver
  if (ride.rider) {
    // Use driverLocation from the tracking hook, which has the most up-to-date location
    const driverLoc = driverLocation || {
      // Fallback to pickup location if driver location not available
      latitude: ride.pickup.latitude,
      longitude: ride.pickup.longitude
    };
    
    availableDrivers.push({
      id: ride.rider._id,
      location: driverLoc,
      isAccepted: true
    });
  }

  // API currently doesn't provide nearby drivers, but when it does,
  // we can uncomment and adapt this code
  /* 
  if (ride.nearbyDrivers && Array.isArray(ride.nearbyDrivers)) {
    ride.nearbyDrivers.forEach(driver => {
      if (driver._id !== ride.rider?._id && driver.location) {
        availableDrivers.push({
          id: driver._id,
          location: {
            latitude: driver.location.latitude,
            longitude: driver.location.longitude
          },
          isAccepted: false
        });
      }
    });
  }
  */

  // Get destination from ride data
  const destinationLocation = ride.drop ? {
    latitude: ride.drop.latitude,
    longitude: ride.drop.longitude
  } : null;

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
      <PatientRideMap
        userLocation={userLocation}
        destinationLocation={destinationLocation}
        availableDrivers={availableDrivers}
        routeCoords={routeCoords}
        acceptedRide={ride}
      />

      <View style={[
        styles.absolute,
        styles.bottom0,
        styles.wFull,
      ]}>
        <TripSummary 
          status={rideStatus}
          distance={ride.distance || 0}
          // Calculate duration based on distance if not available
          duration={ride.distance ? Math.round(ride.distance / 0.6) : 0} // ~36km/h average ambulance speed in traffic
          ambulanceType={ride.vehicle || 'bls'} 
          otp={ride.otp || ''}
          vehicleDetails={ride.rider ? `${ride.rider.vehicle.model} (${ride.rider.vehicle.plateNumber})` : undefined}
          driverName={ride.rider?.name || undefined}
        />
      </View>
    </View>
  );
}
