import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Replace with your actual backend URL
  const BACKEND_URL = 'http://192.168.0.113:3000/ride/create';

  // Replace with your Google API key
  const GOOGLE_API_KEY = 'AIzaSyAxMrcHw-SUkg1aFwG56qnSPQwlpfE2bX0';

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required.');
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
      setLoading(false);
    })();
  }, []);

  const fetchHospitals = async (lat: number, lon: number) => {
    const radius = 5000;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=hospital&key=${GOOGLE_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        Alert.alert('Error', 'Unable to fetch hospitals');
        return;
      }

      const fetchedHospitals = data.results.slice(0, 5).map((place: any) => {
        const distance = getDistance(lat, lon, place.geometry.location.lat, place.geometry.location.lng);
        const photoRef = place.photos?.[0]?.photo_reference;
        return {
          id: place.place_id,
          name: place.name,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          distance,
          rating: place.rating,
          photoUrl: photoRef
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`
            : undefined,
        };
      });

      setHospitals(fetchedHospitals);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch hospital data.');
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleHospitalSelect = async (hospital: Hospital) => {
    setSelectedHospital(hospital);
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${hospital.latitude},${hospital.longitude}&key=${GOOGLE_API_KEY}`;
    const res = await fetch(directionsUrl);
    const data = await res.json();
    if (data.routes.length) {
      const points = decodePolyline(data.routes[0].overview_polyline.points);
      setRouteCoords(points);
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

  const handleBookRide = async () => {
    if (!selectedHospital) {
      Alert.alert('Please select a hospital first');
      return;
    }

    setBooking(true);

    try {
      // Construct request payload
      const body = {
        vehicle: "cabEconomy",
        pickup: {
          address: 'Current Location',
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        drop: {
          address: selectedHospital.name,
          latitude: selectedHospital.latitude,
          longitude: selectedHospital.longitude,
        },
      };

      console.log(body);
      const token = await AsyncStorage.getItem("access_token");
      console.log(token)

      // Call your backend createRide API
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        Alert.alert('Booking Failed', data.message || 'Unable to book ride');
        setBooking(false);
        return;
      }

      Alert.alert('Success', 'Ambulance booked successfully!');
      // Optionally navigate to ride details page or reset selection
      router.push({
        pathname: "/ride/[rideId]",
        params: {
          rideId: data.ride._id,
          hospitalName: data.ride.drop.address,
          rideType: "Emergency",
          destination: data.ride.drop.address,
          fare: data.ride.fare.toString(),
          otp: data.ride.otp,
          latitude: selectedHospital.latitude,
          longitude: selectedHospital.longitude,
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Something went wrong booking the ride.');
      console.error(error);
    } finally {
      setBooking(false);
    }
  };

  if (loading || !currentLocation) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={currentLocation} showsUserLocation>
        {selectedHospital && (
          <>
            <Marker
              coordinate={{
                latitude: selectedHospital.latitude,
                longitude: selectedHospital.longitude,
              }}
              title={selectedHospital.name}
              pinColor="red"
            />
            {routeCoords.length > 0 && (
              <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
            )}
          </>
        )}
      </MapView>

      <ScrollView style={styles.hospitalList} horizontal showsHorizontalScrollIndicator={false}>
        {hospitals.map((hospital) => (
          <TouchableOpacity
            key={hospital.id}
            style={[
              styles.hospitalCard,
              selectedHospital?.id === hospital.id && styles.selectedHospitalCard,
            ]}
            onPress={() => handleHospitalSelect(hospital)}
          >
            {hospital.photoUrl ? (
              <Image source={{ uri: hospital.photoUrl }} style={styles.hospitalImage} />
            ) : (
              <View style={[styles.hospitalImage, styles.placeholderImage]}>
                <Text>No Image</Text>
              </View>
            )}
            <Text style={styles.hospitalName}>{hospital.name}</Text>
            <Text>{hospital.distance.toFixed(2)} km away</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookRide}
          disabled={booking}
        >
          {booking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>Book Ambulance</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height: height * 0.6,
  },
  hospitalList: {
    maxHeight: 240,
    backgroundColor: '#f7f7f7',
  },
  hospitalCard: {
    width: 160,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
    alignItems: 'center',
    elevation: 2,
  },
  selectedHospitalCard: {
    borderColor: 'blue',
    borderWidth: 2,
  },
  hospitalImage: {
    width: 120,
    height: 70,
    borderRadius: 6,
    marginBottom: 5,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
  },
  hospitalName: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 50,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});