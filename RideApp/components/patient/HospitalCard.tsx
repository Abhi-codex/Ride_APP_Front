import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { styles, colors } from "../../constants/TailwindStyles";
import { Hospital } from "../../types/patient";

interface HospitalCardProps {
  hospital: Hospital;
  onSelect: (hospital: Hospital) => void;
  isSelected?: boolean;
}

export default function HospitalCard({ 
  hospital, 
  onSelect, 
  isSelected 
}: HospitalCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.flexRow,
        styles.bgGray100,
        styles.roundedLg,
        styles.p4,
        styles.mb3,
        styles.border2,
        styles.borderGray200,
        styles.shadowSm,
        isSelected && [styles.borderPrimary600, { backgroundColor: colors.primary[50] }]
      ]}
      onPress={() => onSelect(hospital)}
    >
      <Image 
        source={{ uri: hospital.photoUrl }} 
        style={[styles.w14, styles.h14, styles.roundedFull, styles.mr4]} 
      />
      <View style={[styles.flex1, styles.justifyCenter]}>
        <Text style={[styles.textBase, styles.fontBold, styles.textGray800]} numberOfLines={2}>
          {hospital.name}
        </Text>
        <Text style={[styles.textSm, styles.textGray600, styles.mt1]}>
          📍 {hospital.distance} km away
        </Text>
        {hospital.rating && (
          <Text style={[styles.textSm, styles.textWarning500, styles.mt1]}>
            ⭐ {hospital.rating}/5
          </Text>
        )}
      </View>
      <View style={[styles.alignCenter, styles.justifyCenter]}>
        <Text style={[styles.textPrimary600, styles.fontMedium, styles.textSm]}>
          {isSelected ? "Selected" : "Select"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
