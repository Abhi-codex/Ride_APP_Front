import React, { useEffect, useState, useMemo, useCallback, useRef, memo } from "react";
import { Text, View } from "react-native";
import { colors, styles } from "../../constants/TailwindStyles";
import { Ride } from "../../types/rider";
import { MapViewWrapper as MapView, MarkerWrapper as Marker, PolylineWrapper as Polyline } from "../MapView";

interface DriverMapProps {
  driverLocation: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  acceptedRide: Ride | null;
  destination: { latitude: number; longitude: number } | null;
  routeCoords: Array<{ latitude: number; longitude: number }>;
  online?: boolean;
  availableRides?: Ride[];
  isSearching?: boolean;
}

function DriverMap({
  driverLocation,
  acceptedRide,
  destination,
  routeCoords,
  online = true,
  availableRides = [],
  isSearching = false,
}: DriverMapProps) {

  // Cleanup on unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Stable memoized values to prevent re-renders
  const stableDriverLocation = useMemo(() => {
    if (!driverLocation) return null;
    return {
      latitude: Number(driverLocation.latitude.toFixed(6)),
      longitude: Number(driverLocation.longitude.toFixed(6))
    };
  }, [
    driverLocation ? Math.round(driverLocation.latitude * 1000000) : 0,
    driverLocation ? Math.round(driverLocation.longitude * 1000000) : 0
  ]);

  const stableAvailableRides = useMemo(() => {
    if (!availableRides || availableRides.length === 0) return [];
    return availableRides
      .filter(ride => ride?._id && ride?.pickup && ride?.drop)
      .map(ride => ({
        _id: ride._id,
        pickup: {
          latitude: Number(ride.pickup.latitude.toFixed(6)),
          longitude: Number(ride.pickup.longitude.toFixed(6))
        },
        drop: {
          latitude: Number(ride.drop.latitude.toFixed(6)),
          longitude: Number(ride.drop.longitude.toFixed(6))
        },
        vehicle: ride.vehicle
      }));
  }, [
    availableRides?.length || 0,
    // Create stable string dependency using JSON.stringify on IDs only
    JSON.stringify(availableRides?.map(r => r._id).sort() || [])
  ]);

  const stableAcceptedRide = useMemo(() => {
    if (!acceptedRide) return null;
    return {
      _id: acceptedRide._id,
      pickup: acceptedRide.pickup ? {
        latitude: Number(acceptedRide.pickup.latitude.toFixed(6)),
        longitude: Number(acceptedRide.pickup.longitude.toFixed(6))
      } : null,
      drop: acceptedRide.drop ? {
        latitude: Number(acceptedRide.drop.latitude.toFixed(6)),
        longitude: Number(acceptedRide.drop.longitude.toFixed(6))
      } : null
    };
  }, [
    acceptedRide?._id || '',
    acceptedRide?.pickup ? Math.round(acceptedRide.pickup.latitude * 1000000) : 0,
    acceptedRide?.pickup ? Math.round(acceptedRide.pickup.longitude * 1000000) : 0
  ]);

  // Memoized map region to prevent unnecessary re-renders
  const mapRegion = useMemo(() => {
    if (!driverLocation) return null;
    return {
      latitude: driverLocation.latitude,
      longitude: driverLocation.longitude,
      latitudeDelta: driverLocation.latitudeDelta,
      longitudeDelta: driverLocation.longitudeDelta
    };
  }, [
    driverLocation ? Math.round(driverLocation.latitude * 1000000) : 0,
    driverLocation ? Math.round(driverLocation.longitude * 1000000) : 0,
    driverLocation?.latitudeDelta || 0,
    driverLocation?.longitudeDelta || 0
  ]);

  // Don't render anything if driver location is not available
  if (!mapRegion || !stableDriverLocation) {
    return (
      <View style={[styles.flex1, styles.alignCenter, styles.justifyCenter, styles.bgGray100]}>
        <Text style={[styles.textBase, styles.textGray600]}>
          📍 Waiting for location...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.flex1]}>
      <MapView
        style={[styles.flex1]}
        region={mapRegion}
        showsUserLocation={true}
      >
        {/* Driver's current location marker */}
        {stableDriverLocation && (
          <Marker
            coordinate={stableDriverLocation}
            title="Your Location"
            pinColor={colors.primary[600]}
          />
        )}

        {/* Accepted ride markers and route */}
        {stableAcceptedRide?.pickup && stableAcceptedRide?.drop && (
          <>
            {/* Pickup location marker */}
            <Marker
              coordinate={stableAcceptedRide.pickup}
              title="Patient Pickup"
              pinColor={colors.danger[600]}
            />

            {/* Drop location marker */}
            <Marker
              coordinate={stableAcceptedRide.drop}
              title="Hospital"
              pinColor={colors.medical[600]}
            />

            {/* Route polyline */}
            {routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor={colors.primary[600]}
                strokeWidth={4}
              />
            )}
          </>
        )}

        {/* Available rides markers (when not on accepted ride) */}
        {!stableAcceptedRide && online && stableAvailableRides.map((ride, index) => (
          <Marker
            key={ride._id}
            coordinate={ride.pickup}
            title={`Emergency Request ${index + 1}`}
            pinColor={colors.danger[400]}
          />
        ))}
      </MapView>

      {/* Status overlay */}
      {isSearching && !stableAcceptedRide && (
        <View style={[
          styles.absolute,
          styles.top10,
          styles.left1,
          styles.right1,
          styles.py2,
          styles.px4,
          styles.roundedLg,
          styles.alignCenter,
          { backgroundColor: colors.primary[500] + 'E6' }
        ]}>
          <Text style={[styles.textBase, styles.fontBold, styles.textWhite]}>
            🔍 Searching for Emergency Calls...
          </Text>
        </View>
      )}
    </View>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(DriverMap);
