import React from "react";
import { Platform, Text, View } from "react-native";
import { colors, styles } from "../../constants/TailwindStyles";
import { Ride } from "../../types/rider";
import {
  MapViewWrapper as MapView,
  MarkerWrapper as Marker,
  PolylineWrapper as Polyline,
} from "../MapView";

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

export default function DriverMap({
  driverLocation,
  acceptedRide,
  destination,
  routeCoords,
  online = true,
  availableRides = [],
  isSearching = false,
}: DriverMapProps) {
  if (!driverLocation) {
    return (
      <View style={[styles.flex2, styles.justifyCenter, styles.alignCenter]}>
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.flex2]}>
      <MapView style={[styles.flex1]} region={driverLocation}>
        {/* Driver's current location */}
        <Marker
          coordinate={{
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
          }}
          title="Your Location"
          pinColor={colors.emergency[500]}
        />

        {/* Display the accepted ride's pickup and drop locations */}
        {acceptedRide && (
          <>
            <Marker
              coordinate={acceptedRide.pickup}
              title="Patient Pickup"
              pinColor={colors.primary[500]}
            />
            <Marker
              coordinate={acceptedRide.drop}
              title="Hospital"
              pinColor={colors.secondary[500]}
            />
          </>
        )}

        {/* Display route from driver to destination */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={colors.primary[500]}
            strokeWidth={4}
          />
        )}

        {/* Display available rides on the map */}
        {online &&
          !acceptedRide &&
          availableRides.map((ride) => (            
          <Marker
            key={ride._id}
            coordinate={ride.pickup}
            title="Emergency Call"
            pinColor={colors.emergency[500]}
          />
          ))}
      </MapView>
    </View>
  );
}
