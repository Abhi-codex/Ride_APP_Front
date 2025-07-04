import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Hospital, AmbulanceType } from '../types/patient';
import { getServerUrl } from '../utils/network';

export interface RideBookingState {
  booking: boolean;
  bookRide: (
    hospital: Hospital, 
    ambulanceType: AmbulanceType, 
    pickupLocation: { latitude: number; longitude: number }
  ) => Promise<void>;
}

export function useRideBooking(): RideBookingState {
  const router = useRouter();
  const [booking, setBooking] = useState(false);
  const BACKEND_URL = `${getServerUrl()}/ride/create`;

  const bookRide = async (
    hospital: Hospital,
    ambulanceType: AmbulanceType,
    pickupLocation: { latitude: number; longitude: number }
  ) => {
    if (!hospital || !pickupLocation) {
      Alert.alert('Error', 'Please select a hospital and ensure location is available.');
      return;
    }

    setBooking(true);

    const rideData = {
      vehicle: ambulanceType,
      pickup: {
        latitude: pickupLocation.latitude,
        longitude: pickupLocation.longitude,
        address: 'Current Location',
      },
      drop: {
        latitude: hospital.latitude,
        longitude: hospital.longitude,
        address: hospital.name,
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
          pathname: "/patient/ride/[rideId]",
          params: {
            rideId: data.ride._id,
            hospitalName: data.ride.drop.address,
            rideType: ambulanceType,
            destination: data.ride.drop.address,
            fare: data.ride.fare.toString(),
            otp: data.ride.otp,
            latitude: data.ride.drop.latitude.toString(),
            longitude: data.ride.drop.longitude.toString(),
          },
        });
      } else {
        console.log('Booking failed response:', data);
        Alert.alert('Booking Failed', data.message || `Server responded with status ${response.status}. Please try again.`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        Alert.alert(
          'Connection Error', 
          'Cannot connect to server. Make sure:\n• Backend server is running\n• Using correct IP address\n• No firewall blocking connection'
        );
      } else {
        Alert.alert('Error', `Failed to book ambulance: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setBooking(false);
    }
  };

  return { booking, bookRide };
}
