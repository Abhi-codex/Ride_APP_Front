import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { styles } from '../../../constants/TailwindStyles';

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
              pathname: '/user/tracking',
              params,
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={[styles.flexGrow, styles.p5, styles.bgGray50]}>
      <Text style={[styles.text2xl, styles.fontBold, styles.textCenter, styles.mb5, styles.textGray800]}>
        🚑 Ambulance Ride Summary
      </Text>

      <View style={[styles.cardDefault, styles.mb5]}>
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
        <Detail label="OTP" value={Array.isArray(params.otp) ? params.otp.join(', ') : params.otp ?? ''} />
        <Detail label="Latitude" value={Array.isArray(params.latitude) ? params.latitude.join(', ') : params.latitude ?? ''} />
        <Detail label="Longitude" value={Array.isArray(params.longitude) ? params.longitude.join(', ') : params.longitude ?? ''} />
      </View>

      <TouchableOpacity 
        style={[styles.bgEmergency500, styles.roundedLg, styles.py4, styles.alignCenter, styles.mb3, styles.shadowMd]}
        onPress={handleConfirm}
      >
        <Text style={[styles.textWhite, styles.textLg, styles.fontBold]}>
          Confirm Booking
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.bgGray500, styles.roundedLg, styles.py4, styles.alignCenter]}
        onPress={() => router.back()}
      >
        <Text style={[styles.textWhite, styles.textBase, styles.fontSemibold]}>
          Back to Ride Selection
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={[styles.flexRow, styles.mb3]}>
      <Text style={[styles.fontBold, styles.textGray800, styles.w32]}>
        {label}:
      </Text>
      <Text style={[styles.textGray600, styles.flex1]}>
        {value}
      </Text>
    </View>
  );
}
