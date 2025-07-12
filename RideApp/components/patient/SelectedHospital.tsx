import React from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { styles, colors } from "../../constants/TailwindStyles";
import { Hospital } from "../../types/patient";

interface SelectedHospitalProps {
  hospital: Hospital;
  onChangeHospital: () => void;
  routeLoading?: boolean;
  emergencyType?: string;
}

export default function SelectedHospital({
  hospital,
  onChangeHospital,
  routeLoading = false,
  emergencyType
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
          <View style={[styles.flexRow, styles.alignCenter, styles.mb1]}>
            <Text style={[styles.textBase, styles.fontBold, styles.textGray800, styles.flex1]} numberOfLines={2}>
              {hospital.name}
            </Text>
            {hospital.isEmergencyVerified && (
              <View style={[
                styles.px2,
                styles.py1,
                styles.roundedMd,
                { backgroundColor: colors.medical[100] }
              ]}>
                <Text style={[styles.textXs, styles.fontMedium, { color: colors.medical[600] }]}>
                  ✓ VERIFIED
                </Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.textSm, styles.textGray600]}>
            📍 {hospital.distance} km away
          </Text>
          
          <View style={[styles.flexRow, styles.alignCenter, styles.mt1]}>
            {hospital.rating && (
              <Text style={[styles.textSm, styles.textWarning500, styles.mr3]}>
                ⭐ {hospital.rating}/5
              </Text>
            )}
            {hospital.emergencyCapabilityScore !== undefined && (
              <Text style={[styles.textSm, { color: colors.medical[600] }]}>
                🚑 {hospital.emergencyCapabilityScore}% Emergency Ready
              </Text>
            )}
          </View>
          
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
      
      {/* Emergency Features Display */}
      {hospital.emergencyFeatures && hospital.emergencyFeatures.length > 0 && (
        <View style={[
          styles.mt3,
          styles.p3,
          styles.roundedLg,
          { backgroundColor: colors.medical[50] },
          styles.border,
          { borderColor: colors.medical[200] }
        ]}>
          <Text style={[styles.textSm, styles.fontMedium, { color: colors.medical[700] }, styles.mb2]}>
            Available Emergency Features:
          </Text>
          <View style={[styles.flexRow, styles.flexWrap]}>
            {hospital.emergencyFeatures.slice(0, 4).map((feature, index) => (
              <View 
                key={index}
                style={[
                  styles.px2,
                  styles.py1,
                  styles.mr2,
                  styles.mb1,
                  styles.roundedMd,
                  { backgroundColor: colors.medical[100] }
                ]}
              >
                <Text style={[styles.textXs, { color: colors.medical[600] }]}>
                  {feature}
                </Text>
              </View>
            ))}
            {hospital.emergencyFeatures.length > 4 && (
              <Text style={[styles.textXs, styles.textGray500, styles.py1]}>
                +{hospital.emergencyFeatures.length - 4} more
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
