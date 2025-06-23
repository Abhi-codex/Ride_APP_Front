import React from "react";
import { Platform, Text, View } from "react-native";
import { colors, styles } from "../../constants/TailwindStyles";
import { Ride } from "../../types/rider";
import {
  MapViewWrapper as MapView,
  MarkerWrapper as Marker,
  PolylineWrapper as Polyline,
} from "../MapView";

interface RiderMapProps {
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

export default function RiderMap({
  driverLocation,
  acceptedRide,
  destination,
  routeCoords,
  online = true,
  availableRides = [],
  isSearching = false,
}: RiderMapProps) {
  console.log('RiderMap - driverLocation:', driverLocation);
  console.log('RiderMap - Platform.OS:', Platform.OS);
  
  return (
    <View style={[styles.flex2]}>
      <MapView style={[styles.flex1]} region={driverLocation}>
        <Marker
          coordinate={driverLocation}
          title="Your Location"
          pinColor={colors.primary[600]}
        />

        {acceptedRide && (
          <Marker
            coordinate={acceptedRide.pickup}
            title="Pickup Point"
            pinColor={colors.warning[500]}
          />
        )}

        {destination && (
          <Marker
            coordinate={destination}
            title="Hospital Destination"
            pinColor={colors.danger[500]}
          />
        )}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={colors.primary[600]}
            strokeWidth={4}
          />
        )}
      </MapView>      
      
      {online && (
        <View
          style={[
            styles.absolute,
            styles.top10,
            styles.left5,
            styles.bgWhite,
            styles.roundedXl,
            styles.px3,
            styles.py2,
            styles.shadowMd,
            styles.flexRow,
            styles.alignCenter,
          ]}
        >
          <View
            style={[
              {
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: acceptedRide
                  ? colors.secondary[500]
                  : availableRides.length > 0
                  ? colors.warning[500]
                  : isSearching
                  ? colors.primary[500]
                  : colors.gray[400],
              },
              styles.mr2,
            ]}
          />
          <Text
            style={[
              styles.textSm,
              styles.fontMedium,
              { 
                color: acceptedRide
                  ? colors.secondary[700]
                  : availableRides.length > 0
                  ? colors.warning[700]
                  : isSearching
                  ? colors.primary[700]
                  : colors.gray[600]
              },
            ]}
          >
            {acceptedRide 
              ? "On Trip" 
              : availableRides.length > 0
              ? `${availableRides.length} Ride${availableRides.length > 1 ? 's' : ''} Found`
              : isSearching
              ? "Searching..."
              : "Paused"
            }
          </Text>
        </View>
      )}
    </View>
  );
}
