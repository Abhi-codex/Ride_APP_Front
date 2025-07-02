import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Text, View } from 'react-native';
import { MapViewWrapper as Map, PolylineWrapper as MapPolyline, MarkerWrapper as Marker } from '../../components/MapView';
import { colors, styles } from '../../constants/TailwindStyles';
import { haversineDistance } from '../../utils/distance';

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
      <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter, styles.bgGray50]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[styles.mt3, styles.textBase, styles.textGray600]}>
          Getting rider location...
        </Text>
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
    <View style={[styles.flex1]}>
      <Map style={[styles.flex1]}>
        <Marker coordinate={riderLocation} pinColor="blue" title="Ambulance" />
        <Marker coordinate={{ latitude: latitudeNum, longitude: longitudeNum }} pinColor="red" title="Hospital" />
        {routeCoords.length > 0 && (
          <MapPolyline coordinates={routeCoords} strokeColor={colors.primary[600]} strokeWidth={5} />
        )}
      </Map>

      <View style={[
        styles.absolute,
        styles.bottom0,
        styles.wFull,
        styles.p5,
        styles.bgWhite,
        styles.roundedTl3xl,
        styles.roundedTr3xl,
        styles.shadowXl,
      ]}>
        <Text style={[styles.textLg, styles.fontBold, styles.mb3, styles.textCenter, styles.textGray800]}>
          🚑 Trip Summary
        </Text>
        
        <View style={[styles.flexRow, styles.alignCenter, styles.my2]}>
          <Ionicons name="checkmark-circle" size={20} color={colors.medical[500]} />
          <Text style={[styles.ml3, styles.textBase, styles.textGray700]}>
            Status: 
          </Text>
          <Text style={[styles.textBase, styles.fontBold, styles.textGray800]}>
            {accepted ? 'Accepted' : 'Waiting...'}
          </Text>
        </View>
        
        <View style={[styles.flexRow, styles.alignCenter, styles.my2]}>
          <Ionicons name="time-outline" size={20} color={colors.gray[600]} />
          <Text style={[styles.ml3, styles.textBase, styles.textGray700]}>
            ETA: 
          </Text>
          <Text style={[styles.textBase, styles.fontBold, styles.textPrimary600]}>
            {etaMinutes} min
          </Text>
        </View>
        
        <View style={[styles.flexRow, styles.alignCenter, styles.my2]}>
          <Ionicons name="map-outline" size={20} color={colors.gray[600]} />
          <Text style={[styles.ml3, styles.textBase, styles.textGray700]}>
            Distance: 
          </Text>
          <Text style={[styles.textBase, styles.fontBold, styles.textPrimary600]}>
            {distanceKm.toFixed(2)} km
          </Text>
        </View>
        
        <View style={[styles.flexRow, styles.alignCenter, styles.my2]}>
          <Ionicons name="cash-outline" size={20} color={colors.gray[600]} />
          <Text style={[styles.ml3, styles.textBase, styles.textGray700]}>
            Estimated Fare: 
          </Text>
          <Text style={[styles.textBase, styles.fontBold, styles.textPrimary600]}>
            ₹{estimatedFare}
          </Text>
        </View>
      </View>
    </View>
  );
}