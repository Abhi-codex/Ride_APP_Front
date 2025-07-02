import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MapViewWrapper as Map, MarkerWrapper as Marker, PolylineWrapper as Polyline } from '../../components/MapView';
import { colors, styles } from '../../constants/TailwindStyles';
import { getServerUrl } from '../../utils/network';

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
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setCurrentLocation(region);
        await fetchNearbyHospitals(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Unable to get current location.');
      } finally {
        setLoading(false);
      }
    };

    getCurrentLocation();
  }, []);

  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    const mockHospitals: Hospital[] = [
      {
        id: '1',
        name: 'Apollo Hospital',
        latitude: lat + 0.005,
        longitude: lng + 0.005,
        distance: 0.8,
        rating: 4.8,
        photoUrl: 'https://via.placeholder.com/80x80?text=H1',
      },
      {
        id: '2',
        name: 'Max Hospital',
        latitude: lat - 0.007,
        longitude: lng + 0.008,
        distance: 1.2,
        rating: 4.6,
        photoUrl: 'https://via.placeholder.com/80x80?text=H2',
      },
      {
        id: '3',
        name: 'AIIMS',
        latitude: lat + 0.010,
        longitude: lng - 0.005,
        distance: 1.5,
        rating: 4.9,
        photoUrl: 'https://via.placeholder.com/80x80?text=H3',
      },
    ];

    setHospitals(mockHospitals);
  };

  const handleBookRide = async () => {
    if (!selectedHospital || !currentLocation) {
      Alert.alert('Error', 'Please select a hospital and ensure location is available.');
      return;
    }

    setBooking(true);

    const rideData = {
      rideType,
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

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(rideData),
      });

      const data = await response.json();

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

  const handleSelectHospital = async (hospital: Hospital) => {
    setSelectedHospital(hospital);
    if (currentLocation) {
      const route = [
        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
        { latitude: hospital.latitude, longitude: hospital.longitude },
      ];
      setRouteCoords(route);
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
            {routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor={colors.emergency[500]}
                strokeWidth={3}
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
                    ⭐ {hospital.rating}
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