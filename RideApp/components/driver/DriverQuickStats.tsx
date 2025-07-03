import React from "react";
import { Text, View } from "react-native";
import { styles } from "../../constants/TailwindStyles";

interface DriverQuickStatsProps {
  availableRidesCount: number;
  rating: string;
  todaysEarnings: string;
}

export default function DriverQuickStats({
  availableRidesCount,
  rating,
  todaysEarnings,
}: DriverQuickStatsProps) {
  return (
    <View style={[styles.flexRow, styles.justifyBetween, styles.mb6]}>
      <View style={[styles.alignCenter]}>
        <Text
          style={[
            styles.text2xl,
            styles.fontBold,
            styles.textPrimary600,
          ]}
        >
          {availableRidesCount}
        </Text>
        <Text style={[styles.textSm, styles.textGray500]}>
          Emergency Calls
        </Text>
      </View>
      <View style={[styles.alignCenter]}>
        <Text
          style={[
            styles.text2xl,
            styles.fontBold,
            styles.textSecondary600,
          ]}
        >
          {rating}
        </Text>
        <Text style={[styles.textSm, styles.textGray500]}>
          Rating
        </Text>
      </View>
      <View style={[styles.alignCenter]}>
        <Text
          style={[
            styles.text2xl,
            styles.fontBold,
            styles.textGray900,
          ]}
        >
          ₹{todaysEarnings}
        </Text>
        <Text style={[styles.textSm, styles.textGray500]}>
          Today's Earnings
        </Text>
      </View>
    </View>
  );
}
