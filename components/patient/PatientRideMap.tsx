import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { MapViewWrapper as Map, MarkerWrapper as Marker, PolylineWrapper as Polyline } from "../MapView";
import { styles, colors } from "../../constants/TailwindStyles";
import { LatLng } from "../../utils/directions";
import { Ride } from "../../types/rider";

interface PatientRideMapProps {
  userLocation: LatLng & { latitudeDelta: number; longitudeDelta: number };
  destinationLocation: LatLng;
  availableDrivers?: Array<{ id: string; location: LatLng; isAccepted?: boolean }>;
  acceptedRide?: Ride | null;
  routeCoords?: Array<LatLng>;
  onRegionChange?: (region: any) => void;
}

export default function PatientRideMap({
  userLocation,
  destinationLocation,
  availableDrivers = [],
  acceptedRide = null,
  routeCoords = [],
  onRegionChange
}: PatientRideMapProps) {
  // Center map on both points - user and destination or driver if available
  const [mapRegion, setMapRegion] = useState<any>(userLocation);
  
  // Update map region to fit all important points
  useEffect(() => {
    if (!userLocation || !destinationLocation) return;
    
    const acceptedDriver = availableDrivers.find(driver => driver.isAccepted);
    const points = [
      { lat: userLocation.latitude, lng: userLocation.longitude },
      { lat: destinationLocation.latitude, lng: destinationLocation.longitude },
    ];
    
    if (acceptedDriver) {
      points.push({ 
        lat: acceptedDriver.location.latitude, 
        lng: acceptedDriver.location.longitude 
      });
    }
    
    // Calculate bounds to fit all points
    const latitudes = points.map(p => p.lat);
    const longitudes = points.map(p => p.lng);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    // Add padding
    const latPadding = (maxLat - minLat) * 0.3;
    const lngPadding = (maxLng - minLng) * 0.3;
    
    const region = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.05, (maxLat - minLat) + latPadding),
      longitudeDelta: Math.max(0.05, (maxLng - minLng) + lngPadding),
    };
    
    setMapRegion(region);
  }, [userLocation, destinationLocation, availableDrivers]);

  return (
    <View style={[styles.flex1]}>
      <Map
        style={[styles.flex1]}
        region={mapRegion}
      >
        {/* User location marker */}
        <Marker
          coordinate={userLocation}
          title="Your Location"
          pinColor={colors.primary[600]}
        />
        
        {/* Destination marker */}
        <Marker
          coordinate={destinationLocation}
          title="Hospital"
          pinColor={colors.danger[500]}
        />
        
        {/* Available drivers markers */}
        {availableDrivers.map((driver) => (
          <Marker
            key={driver.id}
            coordinate={driver.location}
            title={driver.isAccepted ? "Your Ambulance" : "Available Ambulance"}
            pinColor={driver.isAccepted ? colors.emergency[500] : colors.warning[400]}
          />
        ))}
        
        {/* Route polyline */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={colors.emergency[500]}
            strokeWidth={4}
          />
        )}
      </Map>
    </View>
  );
}
