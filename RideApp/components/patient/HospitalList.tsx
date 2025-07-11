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
  emergencyContext?: {
    name: string;
    priority: string;
    requiredServices: string[];
  };
}

export default function HospitalList({
  hospitals,
  onSelectHospital,
  selectedHospital,
  isLoading = false,
  emergencyContext
}: HospitalListProps) {
  return (
    <View style={[styles.flex1]}>
      <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween, styles.mb3]}>
        <Text style={[styles.textLg, styles.fontBold, styles.textGray800]}>
          Select a Hospital
        </Text>
        {emergencyContext && (
          <View style={[
            styles.px2,
            styles.py1,
            styles.roundedMd,
            { backgroundColor: colors.primary[100] }
          ]}>
            <Text style={[styles.textXs, { color: colors.primary[600] }]}>
              For {emergencyContext.name}
            </Text>
          </View>
        )}
      </View>
      
      {emergencyContext && emergencyContext.requiredServices.length > 0 && (
        <View style={[
          styles.mb3,
          styles.p3,
          styles.roundedLg,
          { backgroundColor: colors.medical[50] },
          styles.border,
          { borderColor: colors.medical[200] }
        ]}>
          <Text style={[styles.textSm, styles.textCenter, { color: colors.medical[700] }]}>
            Showing hospitals with emergency services for {emergencyContext.name}
          </Text>
        </View>
      )}
      
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
