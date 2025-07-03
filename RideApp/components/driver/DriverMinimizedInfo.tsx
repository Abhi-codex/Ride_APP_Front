import React from "react";
import { Text, View } from "react-native";
import { styles } from "../../constants/TailwindStyles";

interface DriverMinimizedInfoProps {
  availableRidesCount: number;
}

export default function DriverMinimizedInfo({
  availableRidesCount,
}: DriverMinimizedInfoProps) {
  return (
    <View style={[styles.px4, styles.py2]}>
      <View style={[styles.flexCol, styles.justifyCenter, styles.alignCenter]}>
        <Text style={[styles.fontSemibold, styles.textGray900]}>
          {availableRidesCount} emergency call
          {availableRidesCount !== 1 ? "s" : ""} available
        </Text>
        <Text style={[styles.textSm, styles.textGray500]}>
          Swipe up for more details
        </Text>
      </View>
    </View>
  );
}
