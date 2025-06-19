import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MapView, { Marker, Polyline as MapPolyline } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

enum RideStatus {
  SEARCHING = "SEARCHING_FOR_RIDER",
  STARTED = "START",
  COMPLETED = "COMPLETED"
}

type Ride = {
  _id: string;
  pickup: { address: string; latitude: number; longitude: number };
  drop: { address: string; latitude: number; longitude: number };
  fare: number;
  status: string;
};

export default function DriverScreen() {
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tripStarted, setTripStarted] = useState(false);
  const [online, setOnline] = useState(false);

  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [acceptedRide, setAcceptedRide] = useState<Ride | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setDriverLocation(region);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!online) return;
    fetchAvailableRides();
  }, [online]);

  const fetchAvailableRides = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch("http://192.168.0.113:3000/ride/driverrides", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const searchingRides = data.rides.filter((ride: Ride) => ride.status === RideStatus.SEARCHING);
      setAvailableRides(searchingRides);
    } catch (error) {
      console.error("Error fetching rides:", error);
    }
  };

  const fetchRoute = async (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.routes?.[0]?.geometry?.coordinates) {
        const coords = json.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => ({
          latitude: lat,
          longitude: lng
        }));
        setRouteCoords(coords);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not fetch route.');
    }
  };

  const handleAcceptRide = async (rideId: string) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(`http://192.168.0.113:3000/ride/accept/${rideId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      const ride = data.ride;
      Alert.alert("Ride accepted!");

      setAcceptedRide(ride);
      setAvailableRides([]);
      setTripStarted(false);
      const dropLocation = {
        latitude: ride.drop.latitude,
        longitude: ride.drop.longitude,
      };
      setDestination(dropLocation);
      if (driverLocation) {
        fetchRoute(driverLocation, dropLocation);
      }
    } catch (error) {
      Alert.alert("Failed to accept ride");
      console.error(error);
    }
  };

  const updateRideStatus = async (rideId: string, status: RideStatus) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(`http://192.168.0.113:3000/ride/update/${rideId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update ride status");
      }

      Alert.alert("Success", `Ride status updated to ${status}`);
      setAcceptedRide(data.ride);

      if (status === RideStatus.COMPLETED) {
        setAcceptedRide(null);
        setDestination(null);
        setRouteCoords([]);
        setTripStarted(false);
        fetchAvailableRides();
      }
    } catch (error) {
      console.error("Error updating ride status:", error);
      Alert.alert("Error", "Could not update ride status");
    }
  };

  const handleRejectRide = (rideId: string) => {
    setAvailableRides(prev => prev.filter(r => r._id !== rideId));
    fetchAvailableRides();
  };

  const distanceKm = (driverLocation && destination)
    ? (haversineDistance(driverLocation.latitude, driverLocation.longitude, destination.latitude, destination.longitude) / 1000).toFixed(2)
    : '0';

  const etaMinutes = driverLocation ? Math.ceil(parseFloat(distanceKm) / 0.666) : 0;
  const fare = Math.ceil(parseFloat(distanceKm) * 15);

  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371e3;
    const φ1 = toRad(lat1), φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1), Δλ = toRad(lon2 - lon1);
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  if (loading || !driverLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading driver map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={driverLocation}>
        <Marker coordinate={driverLocation} title="Your Location" pinColor="blue" />
        {acceptedRide && (
          <Marker coordinate={acceptedRide.pickup} title="Pickup Point" pinColor="orange" />
        )}
        {destination && (
          <>
            <Marker coordinate={destination} title="Destination" pinColor="red" />
            <MapPolyline coordinates={routeCoords} strokeColor="#1E90FF" strokeWidth={4} />
          </>
        )}
      </MapView>

      <View style={styles.panel}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: online ? 'green' : 'gray' }]}
          onPress={() => setOnline(!online)}
        >
          <Text style={styles.buttonText}>{online ? 'Go Offline' : 'Go Online'}</Text>
        </TouchableOpacity>

        <Text style={styles.panelTitle}>🚑 Ambulance Ride Details</Text>
        <Text>Distance: {distanceKm} km</Text>
        <Text>ETA: {etaMinutes} min</Text>
        <Text>Fare: ₹{fare}</Text>

        {acceptedRide && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (!acceptedRide) return;
              const nextStatus = tripStarted ? RideStatus.COMPLETED : RideStatus.STARTED;
              updateRideStatus(acceptedRide._id, nextStatus);
              if (!tripStarted) setTripStarted(true);
            }}
          >
            <Text style={styles.buttonText}>{tripStarted ? 'Complete Ride' : 'Start Ride'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {online && !acceptedRide && availableRides.length > 0 && (
        <ScrollView style={styles.rideList}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Available Rides:</Text>
          {availableRides.map((ride) => (
            <View key={ride._id} style={styles.rideCard}>
              <Text>From: {ride.pickup.address}</Text>
              <Text>To: {ride.drop.address}</Text>
              <Text>Fare: ₹{ride.fare}</Text>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <TouchableOpacity
                  style={[styles.button, { marginRight: 8 }]}
                  onPress={() => handleAcceptRide(ride._id)}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "red" }]}
                  onPress={() => handleRejectRide(ride._id)}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {online && !acceptedRide && availableRides.length === 0 && (
        <View style={styles.rideList}>
          <Text>No rides available at the moment.</Text>
        </View>
      )}

      {acceptedRide && (
        <View style={styles.rideList}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Accepted Ride:</Text>
          <View style={styles.rideCard}>
            <Text>From: {acceptedRide.pickup.address}</Text>
            <Text>To: {acceptedRide.drop.address}</Text>
            <Text>Fare: ₹{acceptedRide.fare}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 5,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rideList: {
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    maxHeight: 200,
  },
  rideCard: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
});