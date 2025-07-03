import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../constants/TailwindStyles";
import { Ride, RideStatus } from "../../types/rider";

interface DriverControlPanelProps {
  online: boolean;
  acceptedRide: Ride | null;
  tripStarted: boolean;
  onToggleOnline: () => void;
  onUpdateRideStatus: (rideId: string, status: RideStatus) => void;
}

export default function DriverControlPanel({
  online,
  acceptedRide,
  tripStarted,
  onToggleOnline,
  onUpdateRideStatus,
}: DriverControlPanelProps) {
  const handleRideAction = () => {
    if (!acceptedRide) return;

    let nextStatus: RideStatus;
    let actionText: string;

    // Determine next status based on current status
    if (acceptedRide.status === RideStatus.START || (!tripStarted && acceptedRide.status === RideStatus.SEARCHING)) {
      nextStatus = RideStatus.ARRIVED;
      actionText = "Mark as Arrived";
    } else if (acceptedRide.status === RideStatus.ARRIVED) {
      nextStatus = RideStatus.COMPLETED;
      actionText = "Complete Trip";
    } else {
      nextStatus = RideStatus.START;
      actionText = "Start Trip";
    }

    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${actionText.toLowerCase()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => onUpdateRideStatus(acceptedRide._id, nextStatus),
          style: "default",
        },
      ]
    );
  };

  return (
    <View style={[styles.bgWhite, styles.roundedXl, styles.shadowLg, styles.p4]}>
      <Text style={[styles.textLg, styles.fontBold, styles.textGray900, styles.mb3]}>
        Driver Controls
      </Text>

      <TouchableOpacity
        onPress={onToggleOnline}
        style={[
          styles.py3,
          styles.px4,
          styles.roundedLg,
          styles.alignCenter,
          styles.mb3,
          online ? styles.bgSecondary500 : styles.bgGray300,
        ]}
      >
        <Text
          style={[
            styles.fontMedium,
            online ? styles.textWhite : styles.textGray700,
          ]}
        >
          {online ? "Go Offline" : "Go Online"}
        </Text>
      </TouchableOpacity>

      {acceptedRide && (
        <TouchableOpacity
          onPress={handleRideAction}
          style={[
            styles.py3,
            styles.px4,
            styles.roundedLg,
            styles.alignCenter,
            styles.bgPrimary500,
          ]}
        >
          <Text style={[styles.fontMedium, styles.textWhite]}>
            {acceptedRide.status === RideStatus.START || (!tripStarted && acceptedRide.status === RideStatus.SEARCHING)
              ? "Mark as Arrived"
              : acceptedRide.status === RideStatus.ARRIVED
              ? "Complete Trip"
              : "Start Trip"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
