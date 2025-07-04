import React from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { styles, colors } from "../../constants/TailwindStyles";
import { Hospital } from "../../types/patient";

interface SelectedHospitalProps {
  hospital: Hospital;
  onChangeHospital: () => void;
  routeLoading?: boolean;
}

export default function SelectedHospital({
  hospital,
  onChangeHospital,
  routeLoading = false
}: SelectedHospitalProps) {
  return (
    <View style={[styles.mb6]}>
      <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween, styles.mb3]}>
        <Text style={[styles.textLg, styles.fontBold, styles.textGray800]}>
          Selected Hospital
        </Text>
        <TouchableOpacity
          style={[styles.py2, styles.px3, styles.roundedLg, styles.bgGray200]}
          onPress={onChangeHospital}
        >
          <Text style={[styles.textSm, styles.textGray700, styles.fontMedium]}>
            Change
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={[
        styles.flexRow,
        styles.bgPrimary50,
        styles.roundedLg,
        styles.p4,
        styles.border2,
        styles.borderPrimary200,
      ]}>
        <Image 
          source={{ uri: hospital.photoUrl }} 
          style={[styles.w12, styles.h12, styles.roundedFull, styles.mr3]} 
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
          {routeLoading && (
            <View style={[styles.flexRow, styles.alignCenter, styles.mt2]}>
              <ActivityIndicator size="small" color={colors.primary[600]} />
              <Text style={[styles.textXs, styles.textGray600, styles.ml2]}>
                Loading route...
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
