import React from "react";
import { View } from "react-native";
import { MapViewWrapper as Map, MarkerWrapper as Marker, PolylineWrapper as Polyline } from "../MapView";
import { styles, colors } from "../../constants/TailwindStyles";
import { Hospital } from "../../types/patient";

interface PatientMapProps {
  currentLocation: any;
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  routeCoords: Array<{ latitude: number; longitude: number }>;
}

export default function PatientMap({
  currentLocation,
  hospitals,
  selectedHospital,
  routeCoords,
}: PatientMapProps) {
  if (!currentLocation) {
    return null;
  }

  return (
    <View style={[styles.flex1]}>
      <Map
        style={[styles.wFull, styles.hFull]}
        showsUserLocation={true}
        region={currentLocation}
      >
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            coordinate={{
              latitude: hospital.latitude,
              longitude: hospital.longitude,
            }}
            title={hospital.name}
            pinColor={selectedHospital?.id === hospital.id ? colors.primary[600] : colors.danger[500]}
          />
        ))}
        
        {selectedHospital && (
          <Marker
            coordinate={{
              latitude: selectedHospital.latitude,
              longitude: selectedHospital.longitude,
            }}
            title={`Selected: ${selectedHospital.name}`}
            pinColor={colors.primary[600]}
          />
        )}
        
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={colors.primary[600]}
            strokeWidth={4}
          />
        )}
      </Map>
    </View>
  );
}
