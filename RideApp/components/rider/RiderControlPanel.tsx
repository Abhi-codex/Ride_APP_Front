import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../constants/TailwindStyles";
import { Ride, RideStatus } from "../../types/rider";

interface RiderControlPanelProps {
  online: boolean;
  distanceKm: string;
  etaMinutes: number;
  fare: number;
  acceptedRide: Ride | null;
  tripStarted: boolean;
  onToggleOnline: () => void;
  onUpdateRideStatus: (rideId: string, status: RideStatus) => void;
}

export default function RiderControlPanel({
  online,
  distanceKm,
  etaMinutes,
  fare,
  acceptedRide,
  tripStarted,
  onToggleOnline,
  onUpdateRideStatus,
}: RiderControlPanelProps) {
  const handleRideAction = () => {
    if (!acceptedRide) return;

    const nextStatus = tripStarted ? RideStatus.COMPLETED : RideStatus.STARTED;
    const actionText = tripStarted ? "Complete Trip" : "Start Trip";

    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${actionText.toLowerCase()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: actionText,
          onPress: () => onUpdateRideStatus(acceptedRide._id, nextStatus),
          style: tripStarted ? "default" : "default",
        },
      ]
    );
  };

  if (!acceptedRide) {
    return null;
  }

  return (
    <View style={[styles.mt4]}>
      <View
        style={[
          styles.bgWhite,
          styles.roundedXl,
          styles.p4,
          styles.border,
          styles.borderGray200,
          styles.shadowMd,
        ]}
      >
        <Text
          style={[
            styles.textLg,
            styles.fontBold,
            styles.textGray900,
            styles.mb4,
            styles.textCenter,
          ]}
        >
          🚑 Active Emergency Trip
        </Text>

        <View style={[styles.flexRow, styles.justifyBetween, styles.mb4]}>
          <View style={[styles.alignCenter, styles.flex1]}>
            <Text style={[styles.textSm, styles.textGray500]}>Distance</Text>
            <Text style={[styles.textLg, styles.fontBold, styles.textPrimary600]}>
              {distanceKm} km
            </Text>
          </View>
          <View style={[styles.alignCenter, styles.flex1]}>
            <Text style={[styles.textSm, styles.textGray500]}>ETA</Text>
            <Text style={[styles.textLg, styles.fontBold, styles.textSecondary600]}>
              {etaMinutes} min
            </Text>
          </View>
          <View style={[styles.alignCenter, styles.flex1]}>
            <Text style={[styles.textSm, styles.textGray500]}>Fare</Text>
            <Text style={[styles.textLg, styles.fontBold, styles.textGray900]}>
              ${fare}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.bgGray50,
            styles.roundedLg,
            styles.p3,
            styles.mb4,
            styles.alignCenter,
          ]}
        >
          <Text style={[styles.textSm, styles.fontMedium, styles.textGray600]}>
            {tripStarted ? "Trip in Progress" : "Ready to Start Trip"}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            tripStarted ? styles.bgSecondary500 : styles.bgPrimary500,
            styles.py4,
            styles.roundedXl,
            styles.alignCenter,
            styles.shadowMd,
          ]}
          onPress={handleRideAction}
          activeOpacity={0.8}
        >
          <Text style={[styles.textWhite, styles.fontBold, styles.textBase]}>
            {tripStarted ? "Complete Trip" : "Start Trip"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
