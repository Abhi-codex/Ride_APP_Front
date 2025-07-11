import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles, colors } from '../../constants/TailwindStyles';
import { formatDuration, formatDistance } from '../../utils/directions';
import { RideStatus } from '../../types/rider';

// Mapping of status codes to user-friendly text and colors
const statusMap = {
  [RideStatus.SEARCHING]: { text: 'Finding Driver', color: colors.warning[500], icon: 'search-outline' },
  [RideStatus.START]: { text: 'En Route', color: colors.emergency[500], icon: 'car-outline' },
  [RideStatus.ARRIVED]: { text: 'Arrived', color: colors.primary[600], icon: 'checkmark-circle-outline' },
  [RideStatus.COMPLETED]: { text: 'Completed', color: colors.medical[500], icon: 'flag-outline' },
};

// Calculate fare based on ambulance type and distance
const calculateFare = (ambulanceType: string, distanceKm: number): number => {
  // Base rates per km for different ambulance types (new system)
  const ratePerKm = {
    bls: 15,    // Basic Life Support
    als: 20,    // Advanced Life Support
    ccs: 30,    // Critical Care Support
    auto: 12,   // Auto Ambulance (compact)
    bike: 10,   // Bike Safety Unit
  };

  const baseRate = {
    bls: 50,     // Basic Life Support
    als: 80,     // Advanced Life Support
    ccs: 120,    // Critical Care Support
    auto: 40,    // Auto Ambulance (compact)
    bike: 30,    // Bike Safety Unit
  };

  // Get rate based on ambulance type, default to bls if type not found
  const rate = ratePerKm[ambulanceType as keyof typeof ratePerKm] || ratePerKm.bls;
  const base = baseRate[ambulanceType as keyof typeof baseRate] || baseRate.bls;
  
  // Calculate fare: base rate + distance * rate, rounded to nearest 5
  return Math.round((base + (distanceKm * rate)) / 5) * 5;
};

interface TripSummaryProps {
  status: RideStatus;
  distance: number;
  duration: number;
  ambulanceType: string;
  driverName?: string;
  vehicleDetails?: string;
  otp?: string;
}

export default function TripSummary({
  status = RideStatus.SEARCHING,
  distance = 0,
  duration = 0,
  ambulanceType = 'bls',
  driverName = '',
  vehicleDetails = '',
  otp = '',
}: TripSummaryProps) {
  const statusInfo = statusMap[status] || statusMap[RideStatus.SEARCHING];
  const estimatedFare = calculateFare(ambulanceType, distance);

  return (
    <View style={[
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
        <Ionicons name={statusInfo.icon as any} size={20} color={statusInfo.color} />
        <Text style={[styles.ml3, styles.textBase, styles.textGray700]}>
          Status: 
        </Text>
        <Text style={[styles.textBase, styles.fontBold, { color: statusInfo.color }]}>
          {statusInfo.text}
        </Text>
      </View>
      
      {driverName && (
        <View style={[styles.flexRow, styles.alignCenter, styles.my2]}>
          <Ionicons name="person" size={20} color={colors.gray[600]} />
          <Text style={[styles.ml3, styles.textBase, styles.textGray700]}>
            Driver: 
          </Text>
          <Text style={[styles.textBase, styles.fontBold, styles.textGray800]}>
            {driverName}
          </Text>
        </View>
      )}
      
      {vehicleDetails && (
        <View style={[styles.flexRow, styles.alignCenter, styles.my2]}>
          <Ionicons name="car" size={20} color={colors.gray[600]} />
          <Text style={[styles.ml3, styles.textBase, styles.textGray700]}>
            Vehicle: 
          </Text>
          <Text style={[styles.textBase, styles.fontBold, styles.textGray800]}>
            {vehicleDetails}
          </Text>
        </View>
      )}
      
      {otp && (
        <View style={[styles.flexRow, styles.alignCenter, styles.my2]}>
          <Ionicons name="key" size={20} color={colors.warning[500]} />
          <Text style={[styles.ml3, styles.textBase, styles.textGray700]}>
            OTP: 
          </Text>
          <Text style={[styles.textBase, styles.fontBold, styles.textEmergency500]}>
            {otp}
          </Text>
        </View>
      )}
      
      <View style={[styles.flexRow, styles.alignCenter, styles.my2]}>
        <Ionicons name="time-outline" size={20} color={colors.gray[600]} />
        <Text style={[styles.ml3, styles.textBase, styles.textGray700]}>
          ETA: 
        </Text>
        <Text style={[styles.textBase, styles.fontBold, styles.textPrimary600]}>
          {formatDuration(duration)}
        </Text>
      </View>
      
      <View style={[styles.flexRow, styles.alignCenter, styles.my2]}>
        <Ionicons name="map-outline" size={20} color={colors.gray[600]} />
        <Text style={[styles.ml3, styles.textBase, styles.textGray700]}>
          Distance: 
        </Text>
        <Text style={[styles.textBase, styles.fontBold, styles.textPrimary600]}>
          {formatDistance(distance)}
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
  );
}
