import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../constants/TailwindStyles";

export default function NoRidesAvailable() {
  return (
    <View
      style={[
        styles.bgGray50,
        styles.roundedXl,
        styles.p6,
        styles.alignCenter,
        styles.mt4,
      ]}
    >
      <View
        style={[
          styles.w20,
          styles.h20,
          styles.bgGray200,
          styles.roundedFull,
          styles.justifyCenter,
          styles.alignCenter,
          styles.mb4,
        ]}
      >
        <Ionicons name="alert-circle-outline" size={48} color="#6B7280" />
      </View>
      <Text
        style={[
          styles.fontMedium,
          styles.textGray900,
          styles.mb2,
        ]}
      >
        No emergency calls available
      </Text>
      <Text
        style={[
          styles.textSm,
          styles.textGray500,
          styles.textCenter,
        ]}
      >
        Stay online and you will be notified when emergency calls come in
      </Text>
    </View>
  );
}
