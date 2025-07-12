import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, Octicons } from '@expo/vector-icons';
import { styles, colors } from '../../constants/TailwindStyles';
import { formatDuration, formatDistance } from '../../utils/directions';
import { RideStatus } from '../../types/rider';

const statusMap = {
  [RideStatus.SEARCHING]: { text: 'Finding Driver', color: colors.warning[500], icon: 'search' },
  [RideStatus.START]: { text: 'En Route', color: colors.emergency[500], icon: 'rocket' },
  [RideStatus.ARRIVED]: { text: 'Arrived', color: colors.primary[600], icon: 'verified' },
  [RideStatus.COMPLETED]: { text: 'Completed', color: colors.medical[500], icon: 'check' },
};

const calculateFare = (ambulanceType: string, distanceKm: number): number => {
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
  emergencyType?: string;
  emergencyName?: string;
  priority?: string;
}

export default function TripSummary({
  status = RideStatus.SEARCHING,
  distance = 0,
  duration = 0,
  ambulanceType = 'bls',
  driverName = '',
  vehicleDetails = '',
  otp = '',
  emergencyType,
  emergencyName,
  priority,
}: TripSummaryProps) {
  const statusInfo = statusMap[status] || statusMap[RideStatus.SEARCHING];
  const estimatedFare = calculateFare(ambulanceType, distance);

  // Get emergency details if available
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return colors.emergency[500];
      case 'high': return colors.warning[500];
      case 'medium': return colors.primary[500];
      case 'low': return colors.medical[500];
      default: return colors.gray[500];
    }
  };

  return (
    <View style={[
      styles.bgGray100, 
      styles.py2, 
      styles.roundedLg, 
      styles.px3, 
      styles.shadowSm,
    ]}>
      <Text style={[styles.textLg, styles.fontBold, styles.mb3, styles.textCenter, styles.textGray800]}>
        Trip Summary
      </Text>
      
      {/* Emergency Information */}
      {emergencyName && (
        <View style={[styles.mb2]}>
          <View style={[styles.flexRow, styles.py1, styles.px2, styles.rounded3xl, styles.border,
            styles.alignCenter, styles.borderGray200, styles.mt1]}>
            <MaterialCommunityIcons name="alert-circle" size={14} color={colors.gray[600]} style={[styles.mr2]} />
            <Text style={[styles.textXs, styles.textGray600]}>
              Emergency: {emergencyName}
            </Text>
            {priority && (
              <View style={[
                styles.px2,
                styles.py1,
                styles.roundedMd,
                styles.ml2,
                { backgroundColor: getPriorityColor(priority) + '20' }
              ]}>
                <Text style={[
                  styles.textXs,
                  styles.fontMedium,
                  { color: getPriorityColor(priority) }
                ]}>
                  {priority.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
      
      <View style={[styles.flexRow, styles.py1, styles.px2, styles.rounded3xl, styles.border,
        styles.alignCenter, styles.borderGray200, styles.mt1]}>
        <Octicons name={statusInfo.icon as any} size={14} color={statusInfo.color} style={[styles.mr2]} />
        <Text style={[styles.textXs, styles.textGray600]}>
          Status: {statusInfo.text}
        </Text>
      </View>
      
      {driverName && (
        <View style={[styles.flexRow, styles.py1, styles.px2, styles.rounded3xl, styles.border,
          styles.alignCenter, styles.borderGray200, styles.mt1]}>
          <Octicons name="person" size={14} color={colors.gray[600]} style={[styles.mr2]} />
          <Text style={[styles.textXs, styles.textGray600]}>
            Driver: {driverName}
          </Text>
        </View>
      )}
      
      {vehicleDetails && (
        <View style={[styles.flexRow, styles.py1, styles.px2, styles.rounded3xl, styles.border,
          styles.alignCenter, styles.borderGray200, styles.mt1]}>
          <MaterialCommunityIcons name="car-emergency" size={14} color={colors.gray[600]} style={[styles.mr2]} />
          <Text style={[styles.textXs, styles.textGray600]}>
            Vehicle: {vehicleDetails}
          </Text>
        </View>
      )}
      
      {otp && (
        <View style={[styles.flexRow, styles.py1, styles.px2, styles.rounded3xl, styles.border,
          styles.alignCenter, styles.borderGray200, styles.mt1]}>
          <MaterialIcons name="vpn-key" size={14} color={colors.warning[500]} style={[styles.mr2]} />
          <Text style={[styles.textXs, styles.textGray600]}>
            OTP: <Text style={[styles.fontBold, { color: colors.warning[500] }]}>{otp}</Text>
          </Text>
        </View>
      )}
      
      <View style={[styles.flexRow, styles.py1, styles.px2, styles.rounded3xl, styles.border,
        styles.alignCenter, styles.borderGray200, styles.mt1]}>
        <Octicons name="clock" size={14} color={colors.gray[600]} style={[styles.mr2]} />
        <Text style={[styles.textXs, styles.textGray600]}>
          ETA: {formatDuration(duration)}
        </Text>
      </View>
      
      <View style={[styles.flexRow, styles.py1, styles.px2, styles.rounded3xl, styles.border,
        styles.alignCenter, styles.borderGray200, styles.mt1]}>
        <Octicons name="location" size={14} color={colors.gray[600]} style={[styles.mr2]} />
        <Text style={[styles.textXs, styles.textGray600]}>
          Distance: {formatDistance(distance)}
        </Text>
      </View>
      
      <View style={[styles.flexRow, styles.py1, styles.px2, styles.rounded3xl, styles.border,
        styles.alignCenter, styles.borderGray200, styles.mt1]}>
        <MaterialIcons name="attach-money" size={14} color={colors.gray[600]} style={[styles.mr2]} />
        <Text style={[styles.textXs, styles.textGray600]}>
          Estimated Fare: ₹{estimatedFare}
        </Text>
      </View>
    </View>
  );
}
