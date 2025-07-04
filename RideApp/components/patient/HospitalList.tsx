import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { styles, colors } from "../../constants/TailwindStyles";
import { Hospital } from "../../types/patient";
import HospitalCard from "./HospitalCard";

interface HospitalListProps {
  hospitals: Hospital[];
  onSelectHospital: (hospital: Hospital) => void;
  selectedHospital: Hospital | null;
  isLoading?: boolean;
}

export default function HospitalList({
  hospitals,
  onSelectHospital,
  selectedHospital,
  isLoading = false
}: HospitalListProps) {
  return (
    <View style={[styles.flex1]}>
      <Text style={[styles.textLg, styles.fontBold, styles.mb3, styles.textGray800]}>
        Select a Hospital
      </Text>
      <ScrollView
        style={[styles.flex1]}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={[styles.pb4]}
      >
        {isLoading || hospitals.length === 0 ? (
          <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter, styles.py6]}>
            <Text style={[styles.textBase, styles.textGray600, styles.textCenter]}>
              {isLoading ? "Getting nearby hospitals..." : "No hospitals found nearby"}
            </Text>
            {isLoading && (
              <ActivityIndicator size="large" color={colors.primary[600]} style={[styles.mt4]} />
            )}
          </View>
        ) : (
          hospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              onSelect={onSelectHospital}
              isSelected={selectedHospital?.id === hospital.id}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
