import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function RideScreenID() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const handleConfirm = () => {
    Alert.alert(
      'Confirm Ride',
      'Do you want to confirm this ambulance booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            router.push({
              pathname: '/tracking',
              params,
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🚑 Ambulance Ride Summary</Text>

      <View style={styles.card}>
        <Detail label="Ride ID" value={Array.isArray(params.rideId) ? params.rideId.join(', ') : params.rideId ?? ''} />
        <Detail label="Hospital" value={Array.isArray(params.hospitalName) ? params.hospitalName.join(', ') : params.hospitalName ?? ''} />
        <Detail label="Specialties" value={Array.isArray(params.specialties) ? params.specialties.join(', ') : params.specialties ?? ''} />
        <Detail label="Ride Type" value={Array.isArray(params.rideType) ? params.rideType.join(', ') : params.rideType ?? ''} />
        <Detail label="Destination" value={Array.isArray(params.destination) ? params.destination.join(', ') : params.destination ?? ''} />
        <Detail
          label="Estimated Fare"
          value={`₹${
            Array.isArray(params.fare)
              ? parseFloat(params.fare[0]).toFixed(2)
              : parseFloat(params.fare ?? '0').toFixed(2)
          }`}
        />
        <Detail label="OTP" value={`${Array.isArray(params.otp) ? params.otp.join(', ') : params.otp ?? ''}`} />
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirm Ride</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const  Detail: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f2f2f2',
    flexGrow: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    color: '#444',
    marginRight: 6,
  },
  value: {
    fontSize: 16,
    color: '#222',
    flexShrink: 1,
  },
  confirmButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
