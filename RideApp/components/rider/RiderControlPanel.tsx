import { styles } from "@/constants/TailwindStyles";
import { Ride, RideStatus } from "@/types/rider";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

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
    const actionText = tripStarted ? "Complete Ride" : "Start Ride";

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

  return (
    <View
      style={[
        styles.absolute,
        styles.bottom0,
        styles.left0,
        styles.right0,
        styles.bgWhite,
        styles.roundedT2xl,
        styles.shadowXl,
        styles.p4,
        styles.p5,
      ]}
    >
      {/* Header with Online Status */}
      <View
        style={[
          styles.flexRow,
          styles.justifyBetween,
          styles.alignCenter,
          styles.mb4,
        ]}
      >
        <View>
          <Text style={[styles.textXl, styles.fontBold, styles.textGray800]}>
            🚑 Ambulance Control
          </Text>
          <Text
            style={[
              styles.textSm,
              styles.fontMedium,
              online ? styles.textSecondary600 : styles.textGray500,
            ]}
          >
            {online ? "🟢 Online & Available" : "🔴 Offline"}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.px4,
            styles.py3,
            styles.roundedFull,
            styles.border2,
            online ? styles.bgSecondary500 : styles.bgGray400,
            online ? styles.borderSecondary200 : styles.borderGray500,
            styles.shadowMd,
          ]}
          onPress={onToggleOnline}
          activeOpacity={0.8}
        >
          <Text style={[styles.fontBold, styles.textBase, styles.textWhite]}>
            {online ? "Go Offline" : "Go Online"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trip Information */}
      {acceptedRide && (
        <View
          style={[
            styles.bgPrimary50,
            styles.roundedXl,
            styles.p4,
            styles.mb4,
            styles.border,
            styles.borderPrimary500,
          ]}
        >
          <Text
            style={[
              styles.textLg,
              styles.fontBold,
              styles.textPrimary700,
              styles.mb3,
              styles.textCenter,
            ]}
          >
            🏥 Active Emergency Trip
          </Text>

          <View style={[styles.flexRow, styles.justifyBetween, styles.mb2]}>
            <View style={[styles.flex1, styles.mr2]}>
              <Text
                style={[styles.textSm, styles.textGray600, styles.fontMedium]}
              >
                Distance
              </Text>
              <Text
                style={[styles.textLg, styles.fontBold, styles.textPrimary600]}
              >
                {distanceKm} km
              </Text>
            </View>

            <View style={[styles.flex1, styles.mr2]}>
              <Text
                style={[styles.textSm, styles.textGray600, styles.fontMedium]}
              >
                ETA
              </Text>
              <Text
                style={[
                  styles.textLg,
                  styles.fontBold,
                  styles.textSecondary600,
                ]}
              >
                {etaMinutes} min
              </Text>
            </View>

            <View style={[styles.flex1]}>
              <Text
                style={[styles.textSm, styles.textGray600, styles.fontMedium]}
              >
                Fare
              </Text>
              <Text
                style={[styles.textLg, styles.fontBold, styles.textWarning500]}
              >
                ₹{fare}
              </Text>
            </View>
          </View>

          {/* Trip Status and Action Button */}
          <View
            style={[
              styles.mt3,
              styles.pt3,
              styles.borderT,
              styles.borderGray200,
            ]}
          >
            <Text
              style={[
                styles.textCenter,
                styles.textSm,
                styles.fontMedium,
                styles.textGray600,
                styles.mb3,
              ]}
            >
              Status:{" "}
              {tripStarted ? "🚗 Trip in Progress" : "⏳ Ready to Start"}
            </Text>

            <TouchableOpacity
              style={[
                styles.bgPrimary600,
                styles.py4,
                styles.roundedXl,
                styles.shadowMd,
                styles.alignCenter,
              ]}
              onPress={handleRideAction}
              activeOpacity={0.8}
            >
              <Text style={[styles.textWhite, styles.fontBold, styles.textLg]}>
                {tripStarted ? "✅ Complete Trip" : "🚀 Start Trip"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* No Active Ride State */}
      {!acceptedRide && online && (
        <View
          style={[
            styles.bgSecondary50,
            styles.roundedXl,
            styles.p4,
            styles.border,
            styles.borderSecondary200,
            styles.alignCenter,
          ]}
        >
          <Text style={[styles.text2xl, styles.mb2]}>🔍</Text>
          <Text
            style={[
              styles.textSecondary700,
              styles.fontBold,
              styles.textLg,
              styles.textCenter,
              styles.mb2,
            ]}
          >
            Searching for Emergency Requests
          </Text>
          <Text
            style={[styles.textSecondary600, styles.textSm, styles.textCenter]}
          >
            Stay alert for incoming ambulance requests from patients in need
          </Text>
        </View>
      )}

      {/* Offline State */}
      {!online && (
        <View
          style={[
            styles.bgGray100,
            styles.roundedXl,
            styles.p4,
            styles.border,
            styles.borderGray300,
            styles.alignCenter,
          ]}
        >
          <Text style={[styles.text2xl, styles.mb2]}>😴</Text>
          <Text
            style={[
              styles.textGray700,
              styles.fontBold,
              styles.textLg,
              styles.textCenter,
              styles.mb2,
            ]}
          >
            Currently Offline
          </Text>
          <Text style={[styles.textGray600, styles.textSm, styles.textCenter]}>
            Go online to start receiving emergency ride requests
          </Text>
        </View>
      )}
    </View>
  );
}
