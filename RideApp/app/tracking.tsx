import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, View } from 'react-native';
import { MapViewWrapper as Map, PolylineWrapper as MapPolyline, MarkerWrapper as Marker } from '../components/MapView';
import { haversineDistance } from '../utils/distance';

const { height } = Dimensions.get('window');

function getFirstParam(param: string | string[] | undefined): string {
  if (!param) return '';
  return Array.isArray(param) ? param[0] : param;
}

export default function TrackingScreen() {
  const params = useLocalSearchParams();
  const latitudeStr = getFirstParam(params.latitude);
  const longitudeStr = getFirstParam(params.longitude);
  const latitudeNum = parseFloat(latitudeStr);
  const longitudeNum = parseFloat(longitudeStr);

  const isValidCoords =
    !isNaN(latitudeNum) && latitudeNum >= -90 && latitudeNum <= 90 &&
    !isNaN(longitudeNum) && longitudeNum >= -180 && longitudeNum <= 180;

  const [riderLocation, setRiderLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isValidCoords) {
      Alert.alert('Invalid coordinates', 'Please check the destination coordinates.');
      setLoading(false);
      return;
    }

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to track.');
        setLoading(false);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        const origin = `${location.coords.longitude},${location.coords.latitude}`;
        const destination = `${longitudeNum},${latitudeNum}`;
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setRiderLocation(region);
        setLoading(false);

        const url = `https://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=full&geometries=geojson`;
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
        Alert.alert('Routing error', 'Could not fetch route information.');
        setLoading(false);
      }

      setTimeout(() => setAccepted(true), 3000);
    })();
  }, []);

  if (loading || !riderLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={{ marginTop: 10 }}>Getting rider location...</Text>
      </View>
    );
  }

  const distanceMeters = haversineDistance(
    riderLocation.latitude,
    riderLocation.longitude,
    latitudeNum,
    longitudeNum
  );

  const speedMetersPerSecond = 11.11;
  const etaSeconds = Math.round(distanceMeters / speedMetersPerSecond);
  const etaMinutes = Math.ceil(etaSeconds / 60);
  const distanceKm = distanceMeters / 1000;
  const farePerKm = 15; // adjust as needed
  const estimatedFare = Math.ceil(distanceKm * farePerKm);

  return (
    <View style={styles.container}>      <Map style={styles.map} region={riderLocation}>
        <Marker coordinate={riderLocation} pinColor="blue" title="Ambulance" />
        <Marker coordinate={{ latitude: latitudeNum, longitude: longitudeNum }} pinColor="red" title="Hospital" />
        {routeCoords.length > 0 && (
          <MapPolyline coordinates={routeCoords} strokeColor="#1E90FF" strokeWidth={5} />
        )}
      </Map>

      <View style={styles.bottomPanel}>
        <Text style={styles.panelHeader}>🚑 Trip Summary</Text>
        <View style={styles.infoRow}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.infoText}>
            Status: 
          </Text>
          <Text style={[styles.infoText, { fontWeight: 'bold' }]}>
            {accepted ? 'Accepted' : 'Waiting...'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color="#000" />
          <Text style={styles.infoText}>
            ETA: 
          </Text>
          <Text style={[styles.infoText, styles.bold]}>
            {etaMinutes} min
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="map-outline" size={20} color="#000" />
          <Text style={styles.infoText}>
            Distance: 
          </Text>
          <Text style={[styles.infoText, styles.bold]}>
            {distanceKm.toFixed(2)} km
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={20} color="#000" />
          <Text style={styles.infoText}>
            Estimated Fare: 
          </Text>
          <Text style={[styles.infoText, styles.bold]}>
            ₹{estimatedFare}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  panelHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
    color: '#1E90FF',
  },
});