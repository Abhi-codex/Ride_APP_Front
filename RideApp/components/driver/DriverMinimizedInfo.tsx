import React from "react";
import { Text, View } from "react-native";
import { styles } from "../../constants/TailwindStyles";
import { Ride } from "../../types/rider";

interface DriverMinimizedInfoProps {
  availableRidesCount: number;
  online: boolean;
  todaysEarnings: string;
  ongoingRide?: Ride;
}

export default function DriverMinimizedInfo({
  availableRidesCount,
  ongoingRide,
}: DriverMinimizedInfoProps) {
  if (ongoingRide) {
    return (
      <View style={[styles.px4, styles.py2]}>
        <View style={[styles.flexCol, styles.justifyCenter, styles.alignCenter]}>
          <Text style={[styles.fontSemibold, styles.textGray900]}>
            Ongoing: {ongoingRide.pickup.address} → {ongoingRide.drop.address}
          </Text>
          <Text style={[styles.textSm, styles.textGray500]}>
            Status: {ongoingRide.status}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.px4, styles.py2]}>
      <View style={[styles.flexCol, styles.justifyCenter, styles.alignCenter]}>
        <Text style={[styles.fontSemibold, styles.textGray900]}>
          {`${availableRidesCount} emergency call${
            availableRidesCount !== 1 ? "s" : ""
          } available`}
        </Text>
        <Text style={[styles.textSm, styles.textGray500]}>
          Swipe up for more details
        </Text>
      </View>
    </View>
  );
}
