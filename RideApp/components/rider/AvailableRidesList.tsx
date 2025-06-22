import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../constants/TailwindStyles";
import { Ride } from "../../types/rider";

interface AvailableRidesListProps {
  online: boolean;
  acceptedRide: Ride | null;
  availableRides: Ride[];
  onAcceptRide: (rideId: string) => void;
  onRejectRide: (rideId: string) => void;
}

export default function AvailableRidesList({
  online,
  acceptedRide,
  availableRides,
  onAcceptRide,
  onRejectRide,
}: AvailableRidesListProps) {
  // Don't show if offline or already have an accepted ride
  if (!online || acceptedRide) {
    return null;
  }

  // Don't show if no available rides
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

  return (
    <View
      style={[
        styles.absolute,
        styles.top10,
        styles.left25,
        styles.right25,
        styles.bgWhite,
        styles.roundedXl,
        styles.shadowLg,
        styles.p4,
        { maxHeight: 300 },
      ]}
    >
      <View
        style={[
          styles.flexRow,
          styles.alignCenter,
          styles.justifyBetween,
          styles.mb3,
          styles.pb3,
          styles.borderB,
          styles.borderGray200,
        ]}
      >
        <Text style={[styles.textLg, styles.fontBold, styles.textDanger500]}>
          🚨 Emergency Requests
        </Text>
        <View
          style={[
            styles.bgDanger500,
            styles.roundedFull,
            styles.px2,
            styles.py1,
          ]}
        >
          <Text style={[styles.textWhite, styles.textSm, styles.fontBold]}>
            {availableRides.length}
          </Text>
        </View>
      </View>

      <ScrollView
        style={[{ maxHeight: 200 }]}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {availableRides.map((ride) => (
          <View
            key={ride._id}
            style={[
              styles.bgGray50,
              styles.roundedLg,
              styles.p3,
              styles.mb3,
              styles.border,
              styles.borderGray300,
            ]}
          >
            {/* Ride Information */}
            <View style={[styles.mb3]}>
              <View style={[styles.flexRow, styles.alignCenter, styles.mb2]}>
                <Text
                  style={[styles.textBase, styles.fontBold, styles.textGray800]}
                >
                  📍 Emergency Transport
                </Text>
              </View>

              <View style={[styles.mb2]}>
                <Text
                  style={[styles.textSm, styles.textGray600, styles.fontMedium]}
                >
                  From:
                </Text>
                <Text
                  style={[styles.textSm, styles.textGray800]}
                  numberOfLines={2}
                >
                  {ride.pickup.address}
                </Text>
              </View>

              <View style={[styles.mb2]}>
                <Text
                  style={[styles.textSm, styles.textGray600, styles.fontMedium]}
                >
                  To:
                </Text>
                <Text
                  style={[styles.textSm, styles.textGray800]}
                  numberOfLines={2}
                >
                  {ride.drop.address}
                </Text>
              </View>

              <View
                style={[
                  styles.flexRow,
                  styles.justifyBetween,
                  styles.alignCenter,
                  styles.mt2,
                  styles.pt2,
                  styles.borderT,
                  styles.borderGray200,
                ]}
              >
                <View style={[styles.flexRow, styles.alignCenter]}>
                  <Text style={[styles.textSm, styles.textGray600]}>
                    💰 Fare:
                  </Text>
                  <Text
                    style={[
                      styles.textBase,
                      styles.fontBold,
                      styles.textSecondary600,
                      styles.ml1,
                    ]}
                  >
                    ₹{ride.fare}
                  </Text>
                </View>

                <View
                  style={[
                    styles.bgDanger500,
                    styles.roundedFull,
                    styles.px2,
                    styles.py1,
                  ]}
                >
                  <Text
                    style={[styles.textWhite, styles.textXs, styles.fontBold]}
                  >
                    URGENT
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={[styles.flexRow, styles.justifyBetween]}>
              <TouchableOpacity
                style={[
                  styles.flex1,
                  styles.bgSecondary500,
                  styles.py3,
                  styles.px4,
                  styles.roundedLg,
                  styles.mr2,
                  styles.shadowMd,
                  styles.alignCenter,
                ]}
                onPress={() => handleAcceptRide(ride._id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.textWhite, styles.fontBold, styles.textBase]}
                >
                  ✅ Accept
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.flex1,
                  styles.bgGray400,
                  styles.py3,
                  styles.px4,
                  styles.roundedLg,
                  styles.shadowMd,
                  styles.alignCenter,
                ]}
                onPress={() => handleRejectRide(ride._id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.textWhite, styles.fontBold, styles.textBase]}
                >
                  ❌ Pass
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
