import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../constants/TailwindStyles";
import { Ionicons } from '@expo/vector-icons';

interface DriverFloatingToggleProps {
  online: boolean;
  onToggle: () => void;
}

export default function DriverFloatingToggle({
  online,
  onToggle,
}: DriverFloatingToggleProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        styles.absolute,
        styles.top40,
        styles.right2,
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
      <View style={styles.ml2}>
        <Ionicons 
          name={online ? "radio" : "radio-outline"} 
          size={16} 
          color="white" 
        />
      </View>
    </TouchableOpacity>
  );
}
