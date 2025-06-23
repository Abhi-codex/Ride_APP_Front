import React from "react";
import { Text, View } from "react-native";
import { styles } from "../../constants/TailwindStyles";

interface RiderMinimizedInfoProps {
  availableRidesCount: number;
  online: boolean;
  todaysEarnings: string;
}

export default function RiderMinimizedInfo({
  availableRidesCount,
  online,
  todaysEarnings,
}: RiderMinimizedInfoProps) {
  return (
    <View style={[styles.px4, styles.py2]}>
      <View style={[styles.flexRow, styles.justifyBetween, styles.alignCenter]}>
        <View>
          <Text style={[styles.fontSemibold, styles.textGray900]}>
            {availableRidesCount} ride{availableRidesCount !== 1 ? 's' : ''} available
          </Text>
          <Text style={[styles.textSm, styles.textGray500]}>
            Swipe up for more details
          </Text>
        </View>
        <View style={[styles.alignCenter]}>
          <Text style={[styles.textLg, styles.fontBold, styles.textPrimary600]}>
            ₹{online ? todaysEarnings : '0'}
          </Text>
          <Text style={[styles.textXs, styles.textGray500]}>
            Today
          </Text>
        </View>
      </View>
    </View>
  );
}
