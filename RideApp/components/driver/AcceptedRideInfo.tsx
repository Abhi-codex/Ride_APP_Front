import React from "react";
import { Text, View } from "react-native";
import { styles } from "../../constants/TailwindStyles";
import { Ride } from "../../types/rider";

interface AcceptedRideInfoProps {
  acceptedRide: Ride | null;
}

export default function AcceptedRideInfo({
  acceptedRide,
}: AcceptedRideInfoProps) {
  if (!acceptedRide) {
    return null;
  }

  return (
    <View
      style={[
        styles.bgWhite,
        styles.roundedXl,
        styles.shadowLg,
        styles.p4,
        styles.borderL,
        styles.borderPrimary500,
        { borderLeftWidth: 4 },
      ]}
    >
      <View
        style={[
          styles.flexRow,
          styles.alignCenter,
          styles.mb3,
          styles.pb2,
          styles.borderB,
          styles.borderGray200,
        ]}
      >
        <Text style={[styles.textLg, styles.fontBold, styles.textPrimary600]}>
          Active Trip
        </Text>
      </View>

      <View style={[styles.mb3]}>
        <Text
          style={[
            styles.textSm,
            styles.textGray600,
            styles.fontMedium,
            styles.mb1,
          ]}
        >
          Patient Pickup:
        </Text>
        <Text
          style={[styles.textSm, styles.textGray800, styles.fontMedium]}
          numberOfLines={3}
        >
          {acceptedRide.pickup.address}
        </Text>
      </View>

      <View style={[styles.mb3]}>
        <Text
          style={[
            styles.textSm,
            styles.textGray600,
            styles.fontMedium,
            styles.mb1,
          ]}
        >
          Hospital Destination:
        </Text>
        <Text
          style={[styles.textSm, styles.textGray800, styles.fontMedium]}
          numberOfLines={3}
        >
          {acceptedRide.drop.address}
        </Text>
      </View>

      <View
        style={[
          styles.flexRow,
          styles.justifyBetween,
          styles.alignCenter,
          styles.mt2,
          styles.pt3,
          styles.borderT,
          styles.borderGray200,
        ]}
      >
        <Text style={[styles.textSm, styles.textGray600, styles.fontMedium]}>
          Trip Fare:
        </Text>
        <Text style={[styles.textLg, styles.fontBold, styles.textSecondary600]}>
          ₹{acceptedRide.fare}
        </Text>
      </View>

      <View
        style={[
          styles.bgSecondary50,
          styles.roundedLg,
          styles.p2,
          styles.mt3,
          styles.alignCenter,
        ]}
      >
        <Text
          style={[
            styles.textSecondary700,
            styles.textXs,
            styles.fontBold,
            styles.textCenter,
          ]}
        >
          EMERGENCY MEDICAL TRANSPORT
        </Text>
      </View>
    </View>
  );
}
