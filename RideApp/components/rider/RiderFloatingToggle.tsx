import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../constants/TailwindStyles";

interface RiderFloatingToggleProps {
  online: boolean;
  onToggle: () => void;
}

export default function RiderFloatingToggle({
  online,
  onToggle,
}: RiderFloatingToggleProps) {  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        styles.absolute,
        styles.top10,
        styles.right5,
        styles.z1000,
        styles.px4,
        styles.py2,
        styles.roundedXl,
        online ? styles.bgSecondary500 : styles.bgGray400,
        styles.flexRow,
        styles.alignCenter,
        styles.shadowLg,
      ]}
    >
      <View
        style={[
          styles.w3,
          styles.h3,
          styles.roundedFull,
          styles.mr2,
          online ? styles.bgWhite : styles.bgGray600,
        ]}
      />
      <Text
        style={[
          styles.fontMedium,
          styles.textSm,
          styles.textWhite,
        ]}
      >
        {online ? "Online" : "Offline"}
      </Text>
    </TouchableOpacity>
  );
}
