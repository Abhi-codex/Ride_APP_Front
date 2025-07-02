import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MapViewWrapper as Map, MarkerWrapper as Marker, PolylineWrapper as Polyline } from '../../components/MapView';
import { colors, styles } from '../../constants/TailwindStyles';
import { getServerUrl } from '../../utils/network';
import { config } from '../../config';

type Hospital = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  rating?: number;
  photoUrl?: string;
};

export default function RideScreen() {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [rideType, setRideType] = useState('Emergency');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);

  const BACKEND_URL = `${getServerUrl()}/ride/create`;

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location permission is required.');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        const region = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setCurrentLocation(region);
        await fetchHospitals(latitude, longitude);
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Unable to get current location.');
      } finally {
        setLoading(false);
      }
    };

    getCurrentLocation();
  }, []);

  const fetchHospitals = async (lat: number, lon: number) => {
    const radius = config.PLACES_API.RADIUS;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=hospital&key=${config.GOOGLE_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        Alert.alert('Error', 'Unable to fetch hospitals');
        return;
      }

      const fetchedHospitals = data.results.slice(0, config.PLACES_API.MAX_RESULTS).map((place: any) => {
        const distance = getDistance(lat, lon, place.geometry.location.lat, place.geometry.location.lng);
        const photoRef = place.photos?.[0]?.photo_reference;
        return {
          id: place.place_id,
          name: place.name,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
          rating: place.rating,
          photoUrl: photoRef
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${config.GOOGLE_API_KEY}`
            : 'https://via.placeholder.com/80x80?text=H',
        };
      });

      setHospitals(fetchedHospitals);
    } catch (err) {
      console.error('Failed to fetch hospital data:', err);
      Alert.alert('Error', 'Failed to fetch hospital data.');
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleBookRide = async () => {
    if (!selectedHospital || !currentLocation) {
      Alert.alert('Error', 'Please select a hospital and ensure location is available.');
      return;
    }

    setBooking(true);

    const rideData = {
      vehicle: "cabEconomy",
      pickup: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: 'Current Location',
      },
      drop: {
        latitude: selectedHospital.latitude,
        longitude: selectedHospital.longitude,
        address: selectedHospital.name,
      },
    };

    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please log in again.');
        router.replace('/');
        return;
      }

      console.log('Booking ride with data:', rideData);
      console.log('Using token:', token);

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(rideData),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        Alert.alert('Success', 'Ambulance booked successfully!');
        router.push({
          pathname: "/user/ride/[rideId]",
          params: {
            rideId: data.ride._id,
            hospitalName: data.ride.drop.address,
            rideType: "Emergency",
            destination: data.ride.drop.address,
            fare: data.ride.fare.toString(),
            otp: data.ride.otp,
            latitude: data.ride.drop.latitude.toString(),
            longitude: data.ride.drop.longitude.toString(),
          },
        });
      } else {
        Alert.alert('Booking Failed', data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Failed to book ambulance. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const decodePolyline = (t: string) => {
    let points = [], index = 0, lat = 0, lng = 0;
    while (index < t.length) {
      let b, shift = 0, result = 0;
      do { b = t.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; }
      while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = result = 0;
      do { b = t.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; }
      while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  const handleSelectHospital = async (hospital: Hospital) => {
    setSelectedHospital(hospital);
    if (currentLocation) {
      // Fetch route using Google Directions API
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${hospital.latitude},${hospital.longitude}&key=${config.GOOGLE_API_KEY}`;
      
      try {
        const response = await fetch(directionsUrl);
        const data = await response.json();
        
        if (data.routes.length > 0) {
          const points = decodePolyline(data.routes[0].overview_polyline.points);
          setRouteCoords(points);
        } else {
          // Fallback to simple straight line route
          const route = [
            { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
            { latitude: hospital.latitude, longitude: hospital.longitude },
          ];
          setRouteCoords(route);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        // Fallback to simple straight line route
        const route = [
          { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
          { latitude: hospital.latitude, longitude: hospital.longitude },
        ];
        setRouteCoords(route);
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter, styles.bgGray50]}>
        <ActivityIndicator size="large" color={colors.emergency[500]} />
        <Text style={[styles.mt4, styles.textBase, styles.textGray600]}>
          Getting your location...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.flex1, styles.bgGray50]}>
      <View style={[styles.flex1]}>
        {currentLocation && (
          <Map
            style={[styles.wFull, styles.hFull]}
            showsUserLocation={true}
          >
            {hospitals.map((hospital) => (
              <Marker
                key={hospital.id}
                coordinate={{
                  latitude: hospital.latitude,
                  longitude: hospital.longitude,
                }}
                title={hospital.name}
              />
            ))}
            {selectedHospital && (
              <Marker
                coordinate={{
                  latitude: selectedHospital.latitude,
                  longitude: selectedHospital.longitude,
                }}
                title={selectedHospital.name}
              />
            )}
            {routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor={colors.emergency[500]}
                strokeWidth={4}
              />
            )}
          </Map>
        )}
      </View>

      <View style={[
        styles.bgWhite,
        styles.roundedTl3xl,
        styles.roundedTr3xl,
        styles.px5,
        styles.pt4,
        { height: Dimensions.get('window').height * 0.4 }
      ]}>
        <ScrollView style={[styles.maxH40]}>
          <Text style={[styles.textLg, styles.fontBold, styles.mb3, styles.textGray800]}>
            Nearby Hospitals
          </Text>
          {hospitals.map((hospital) => (
            <TouchableOpacity
              key={hospital.id}
              style={[
                styles.flexRow,
                styles.bgGray100,
                styles.roundedLg,
                styles.p3,
                styles.mb2,
                styles.border2,
                selectedHospital?.id === hospital.id
                  ? [styles.borderEmergency500, styles.bgDanger50]
                  : styles.borderGray200,
              ]}
              onPress={() => handleSelectHospital(hospital)}
            >
              <Image 
                source={{ uri: hospital.photoUrl }} 
                style={[styles.w12, styles.h12, styles.roundedFull, styles.mr3]} 
              />
              <View style={[styles.flex1, styles.justifyCenter]}>
                <Text style={[styles.textBase, styles.fontBold, styles.textGray800]}>
                  {hospital.name}
                </Text>
                <Text style={[styles.textSm, styles.textGray600, styles.mt1]}>
                  {hospital.distance} km away
                </Text>
                {hospital.rating && (
                  <Text style={[styles.textSm, styles.textWarning500, styles.mt1]}>
                    🌟 {hospital.rating}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.mt5]}>
          <Text style={[styles.textLg, styles.fontBold, styles.mb3, styles.textGray800]}>
            Ride Type
          </Text>
          <View style={[styles.flexRow, styles.justifyBetween]}>
            {['Emergency', 'Scheduled', 'Transfer'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.flex1,
                  styles.py3,
                  styles.px4,
                  styles.roundedLg,
                  styles.alignCenter,
                  styles.mx1,
                  rideType === type
                    ? [styles.bgEmergency500]
                    : [styles.bgGray200],
                ]}
                onPress={() => setRideType(type)}
              >
                <Text
                  style={[
                    styles.textSm,
                    styles.fontSemibold,
                    rideType === type
                      ? styles.textWhite
                      : styles.textGray600,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.mt5,
            styles.mb3,
            styles.py4,
            styles.alignCenter,
            styles.roundedLg,
            selectedHospital
              ? [styles.bgEmergency500, styles.shadowMd]
              : [styles.bgGray300],
          ]}
          onPress={handleBookRide}
          disabled={!selectedHospital || booking}
        >
          {booking ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={[styles.textWhite, styles.textLg, styles.fontBold]}>
              Book Ambulance {selectedHospital ? `to ${selectedHospital.name}` : ''}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}