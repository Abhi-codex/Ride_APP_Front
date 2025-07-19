import { MaterialCommunityIcons, MaterialIcons, Octicons } from "@expo/vector-icons";
import React, { memo, useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { colors, styles } from "../../constants/TailwindStyles";
import { EMERGENCY_TYPES } from "../../types/emergency";
import { Ride } from "../../types/rider";

interface AvailableRidesListProps {
  online: boolean;
  acceptedRide: Ride | null;
  availableRides: Ride[];
  driverLocation: { latitude: number; longitude: number };
  onAcceptRide: (rideId: string) => void;
  onRejectRide: (rideId: string) => void;
}

// Utility function to calculate relative time
const getRelativeTime = (createdAt: string | Date): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  
  // Handle invalid dates or future dates
  if (isNaN(diffMs) || diffMs < 0) return "Just now";
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 30) return "Just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes === 1) return "1 min ago";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours === 1) return "1 hr ago";
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};

// Get priority color
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return colors.emergency[500];
    case 'high': return colors.warning[500];
    case 'medium': return colors.primary[500];
    case 'low': return colors.medical[500];
    default: return colors.gray[500];
  }
};

// Get ambulance type details
const getAmbulanceTypeDetails = (type: string) => {
  const types = {
    'bls': { name: 'Basic Life Support', icon: 'medical-bag', desc: 'Standard Emergency' },
    'als': { name: 'Advanced Life Support', icon: 'heart-pulse', desc: 'Critical Care' },
    'ccs': { name: 'Critical Care Support', icon: 'hospital', desc: 'Intensive Unit' },
    'auto': { name: 'Auto Ambulance', icon: 'car-emergency', desc: 'Compact Unit' },
    'bike': { name: 'Bike Emergency Unit', icon: 'motorbike', desc: 'Rapid Response' },
  };
  return types[type as keyof typeof types] || { name: type, icon: 'ambulance', desc: 'Emergency' };
};

function AvailableRidesList({
  online,
  acceptedRide,
  availableRides,
  driverLocation,
  onAcceptRide,
  onRejectRide,
}: AvailableRidesListProps) {
  if (!online || acceptedRide) {
    return null;
  }
  if (availableRides.length === 0) {
    return null;
  }

  const handleAcceptRide = (rideId: string) => {
    Alert.alert(
      "Accept Emergency Request",
      "Are you ready to respond to this emergency ambulance request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => onAcceptRide(rideId),
          style: "default",
        },
      ]
    );
  };

  const handleRejectRide = (rideId: string) => {
    Alert.alert(
      "Reject Request",
      "Are you sure you want to reject this ambulance request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          onPress: () => onRejectRide(rideId),
          style: "destructive",
        },
      ]
    );
  };

  const RideItem = ({ 
    ride, 
    index 
  }: { 
    ride: Ride; 
    index: number; 
  }) => {
    const [relativeTime, setRelativeTime] = useState(getRelativeTime(ride.createdAt));

    // Update relative time every 30 seconds
    useEffect(() => {
      const updateTime = () => setRelativeTime(getRelativeTime(ride.createdAt));
      updateTime();
      
      const interval = setInterval(updateTime, 30000);
      return () => clearInterval(interval);
    }, [ride.createdAt]);

    const formatFare = (fare: number): number => {
      return Math.round(fare / 5) * 5;
    };

    let emergencyId = (ride as any).emergencyType || (ride as any).emergency?.type || (ride as any).emergency_id || (ride as any).emergencyId;
    // Fallback: try ride.emergency?.id
    if (!emergencyId && (ride as any).emergency && (ride as any).emergency.id) emergencyId = (ride as any).emergency.id;
    const emergencyDetails = emergencyId ? EMERGENCY_TYPES.find(e => e.id === emergencyId) : undefined;
    const priority = emergencyDetails?.priority || (ride as any).priority || 'unknown';
    const category = emergencyDetails?.category || (ride as any).category || 'unknown';
    const priorityColor = getPriorityColor(priority);
    const ambulanceDetails = getAmbulanceTypeDetails(ride.vehicle);

    return (
      <View style={[styles.bgGray100, styles.py2, styles.roundedLg, styles.px3, styles.shadowSm, 
        styles.mb3, { backgroundColor: colors.emergency[50], borderColor: colors.emergency[200] },
        styles.border]}>
        {/* Header Row with Emergency Type and Priority */}
        <View style={[styles.flexRow, styles.alignStart, styles.justifyBetween, styles.mb2]}>
          <View style={[styles.flex1, styles.mr2]}>
            <View style={[styles.flexRow, styles.alignCenter, styles.mb1]}>
              <MaterialCommunityIcons name="ambulance" size={16} color={colors.emergency[600]} style={[styles.mr2]} />
              <Text style={[styles.textBase, styles.fontBold, styles.textGray800]}>
                Emergency Request: {index + 1}
              </Text>
            </View>
            <Text style={[styles.textXs, styles.textPrimary600, styles.fontMedium, styles.mt1]}>
              {ambulanceDetails.name} • {ambulanceDetails.desc}
            </Text>
          </View>
          
          {/* Priority & Category Badge */}
          <View style={[styles.flexRow, styles.alignCenter, styles.py1, styles.gap2]}>
            <View style={[styles.px2, styles.py1, styles.roundedFull, { backgroundColor: priorityColor + '20' }]}> 
              <Text style={[styles.textXs, styles.fontBold, { color: priorityColor }]}> 
                {priority.toUpperCase()} PRIORITY
              </Text>
            </View>
            <View style={[styles.px2, styles.py1, styles.roundedFull, { backgroundColor: colors.primary[100] }]}> 
              <Text style={[styles.textXs, styles.fontMedium, { color: colors.primary[700] }]}> 
                {category.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Patient Details Row */}
        <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween, styles.mb3]}>
          <View style={[styles.w12, styles.h12, styles.roundedLg, styles.mr3, styles.alignCenter, styles.justifyCenter, { backgroundColor: colors.emergency[100] }]}>
            <MaterialCommunityIcons
              name={ambulanceDetails.icon as any} 
              size={24} 
              color={colors.emergency[600]} 
            />
          </View>
          
          <View style={[styles.flex1]}>
            <View style={[styles.flexRow, styles.py1, styles.px2, styles.rounded3xl, styles.border,
              styles.alignCenter, styles.borderGray200, styles.mb1]}>
              <Octicons name="clock" size={12} color={colors.gray[600]} style={[styles.mr2]} />
              <Text style={[styles.textXs, styles.textGray600]}>
                {relativeTime}
              </Text>
            </View>
            
            <View style={[styles.flexRow, styles.py1, styles.px2, styles.rounded3xl, styles.border,
              styles.alignCenter, styles.borderGray200]}>
              <MaterialIcons name="attach-money" size={12} color={colors.warning[600]} style={[styles.mr2]} />
              <Text style={[styles.textXs, styles.textGray600]}>
                ₹{formatFare(ride.fare)} estimated
              </Text>
            </View>
          </View>
        </View>

        {/* Location Details */}
        <View style={[styles.mb3]}>
          {/* Pickup Location */}
          <View style={[styles.flexRow, styles.py1, styles.px2, styles.rounded3xl, styles.border,
            styles.alignCenter, styles.borderGray200, styles.mb1]}>
            <MaterialCommunityIcons name="map-marker" size={12} color={colors.primary[600]} style={[styles.mr2]} />
            <Text style={[styles.textXs, styles.textGray600, styles.flex1]} numberOfLines={1}>
              Pickup: {ride.pickup.address}
            </Text>
          </View>
          
          {/* Drop Location */}
          <View style={[styles.flexRow, styles.py1, styles.px2, styles.rounded3xl, styles.border,
            styles.alignCenter, styles.borderGray200, styles.mb1]}>
            <MaterialCommunityIcons name="hospital-building" size={12} color={colors.medical[600]} style={[styles.mr2]} />
            <Text style={[styles.textXs, styles.textGray600, styles.flex1]} numberOfLines={1}>
              Hospital: {ride.drop.address}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.flexRow, styles.gap2]}>
          <TouchableOpacity 
            style={[styles.flex1, styles.py2, styles.px3, styles.roundedLg, styles.alignCenter,
              styles.border, styles.borderGray300, { backgroundColor: colors.gray[50] }]}
            onPress={() => handleRejectRide(ride._id)} activeOpacity={0.7}>
            <View style={[styles.flexRow, styles.alignCenter]}>
              <Octicons name="x" size={14} color={colors.gray[600]} style={[styles.mr1]} />
              <Text style={[styles.textSm, styles.fontMedium, styles.textGray700]}>
                Pass
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.flex2, styles.py2, styles.px3, styles.roundedLg, 
              styles.alignCenter, styles.shadowMd, { backgroundColor: colors.emergency[500] }]}
            onPress={() => handleAcceptRide(ride._id)} activeOpacity={0.8}>
            <View style={[styles.flexRow, styles.alignCenter]}>
              <MaterialCommunityIcons name="ambulance" size={16} color="white" style={[styles.mr2]} />
              <Text style={[styles.textSm, styles.fontBold, styles.textWhite]}>
                Accept Emergency
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return (
    <ScrollView style={[styles.flex1]} showsVerticalScrollIndicator={false}>
      {availableRides.map((ride, index) => (
        <RideItem key={ride._id} ride={ride} index={index} />
      ))}
      
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

export default memo(AvailableRidesList);
