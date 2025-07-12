import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles, colors } from "../../constants/TailwindStyles";
import { Hospital } from "../../types/patient";

interface HospitalCardProps {
  hospital: Hospital;
  onSelect: (hospital: Hospital) => void;
  isSelected?: boolean;
  emergencyType?: string;
}

export default function HospitalCard({ 
  hospital, 
  onSelect, 
  isSelected,
  emergencyType 
}: HospitalCardProps) {
  
  // Emergency verification status
  const getVerificationStatus = () => {
    if (hospital.isEmergencyVerified) {
      return { 
        icon: "checkmark-circle", 
        text: "Verified", 
        color: colors.medical[600],
        iconColor: colors.medical[600]
      };
    } 
    else if (hospital.emergencyCapabilityScore && hospital.emergencyCapabilityScore >= 30) {
      return { 
        icon: "warning", 
        text: "Likely", 
        color: colors.warning[600],
        iconColor: colors.warning[600]
      };
    }
    return { 
      icon: "close-circle", 
      text: "Uncertain", 
      color: colors.danger[600],
      iconColor: colors.danger[600]
    };
  };

  // Capability score color
  const getScoreColor = (score?: number) => {
    if (!score) return colors.gray[400];
    if (score >= 70) return colors.medical[500];
    if (score >= 50) return colors.warning[500];
    if (score >= 30) return colors.warning[600];
    return colors.danger[500];
  };

  const verificationStatus = getVerificationStatus();
  const scoreColor = getScoreColor(hospital.emergencyCapabilityScore);

  return (
    <TouchableOpacity
      style={[
        styles.bgGray100,
        styles.roundedLg,
        styles.p4,
        styles.mb3,
        styles.border2,
        styles.borderGray200,
        styles.shadowSm,
        isSelected && [styles.borderPrimary600, { backgroundColor: colors.primary[50] }],
        hospital.isEmergencyVerified && !isSelected && [styles.borderPrimary200, { backgroundColor: colors.medical[50] }]
      ]}
      onPress={() => onSelect(hospital)}
    >
      {/* Header Row with Name and Verification */}
      <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween, styles.mb2]}>
        <View style={[styles.flex1, styles.mr2]}>
          <Text style={[styles.textBase, styles.fontBold, styles.textGray800]} numberOfLines={2}>
            {hospital.name}
          </Text>
          {hospital.recommendation && (
            <Text style={[styles.textXs, styles.textPrimary600, styles.fontMedium, styles.mt1]}>
              {hospital.recommendation}
            </Text>
          )}
        </View>
        
        {/* Verification Badge */}
        <View style={[
          styles.flexRow, 
          styles.alignCenter, 
          styles.px2, 
          styles.py1, 
          styles.roundedMd,
          { backgroundColor: colors.gray[100] }
        ]}>
          <Ionicons 
            name={verificationStatus.icon as any} 
            size={12} 
            color={verificationStatus.iconColor} 
            style={[styles.mr1]} 
          />
          <Text style={[styles.textXs, styles.fontMedium, { color: verificationStatus.color }]}>
            {verificationStatus.text}
          </Text>
        </View>
      </View>

      {/* Hospital Details Row */}
      <View style={[styles.flexRow, styles.alignCenter, styles.mb2]}>
        <Image 
          source={{ uri: hospital.photoUrl }} 
          style={[styles.w12, styles.h12, styles.roundedFull, styles.mr3]} 
        />
        <View style={[styles.flex1]}>
          <View style={[styles.flexRow, styles.alignCenter]}>
            <Ionicons name="location-outline" size={14} color={colors.gray[600]} style={[styles.mr1]} />
            <Text style={[styles.textSm, styles.textGray600]}>
              {hospital.distance.toFixed(1)} km away
            </Text>
          </View>
          {hospital.rating && (
            <View style={[styles.flexRow, styles.alignCenter, styles.mt1]}>
              <Ionicons name="star" size={14} color={colors.warning[500]} style={[styles.mr1]} />
              <Text style={[styles.textSm, styles.textWarning500]}>
                {hospital.rating}/5
              </Text>
            </View>
          )}
          {hospital.isOpen !== undefined && (
            <View style={[styles.flexRow, styles.alignCenter, styles.mt1]}>
              <Ionicons 
                name={hospital.isOpen ? "checkmark-circle" : "close-circle"} 
                size={12} 
                color={hospital.isOpen ? colors.medical[600] : colors.danger[600]} 
                style={[styles.mr1]} 
              />
              <Text style={[
                styles.textXs, 
                { color: hospital.isOpen ? colors.medical[600] : colors.danger[600] }
              ]}>
                {hospital.isOpen ? "Open" : "Closed"}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Emergency Capability Score */}
      {hospital.emergencyCapabilityScore !== undefined && (
        <View style={[styles.mb2]}>
          <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween, styles.mb1]}>
            <Text style={[styles.textXs, styles.textGray600]}>Emergency Capability</Text>
            <Text style={[styles.textXs, styles.fontBold, { color: scoreColor }]}>
              {hospital.emergencyCapabilityScore}/100
            </Text>
          </View>
          {/* Progress Bar */}
          <View style={[
            styles.h1, 
            styles.bgGray200, 
            styles.roundedFull, 
            styles.overflowHidden
          ]}>
            <View style={[
              styles.h1,
              styles.roundedFull,
              {
                backgroundColor: scoreColor,
                width: `${hospital.emergencyCapabilityScore}%`
              }
            ]} />
          </View>
        </View>
      )}

      {/* Emergency Features */}
      {hospital.emergencyFeatures && hospital.emergencyFeatures.length > 0 && (
        <View style={[styles.mb2]}>
          <Text style={[styles.textXs, styles.textGray600, styles.mb1]}>Emergency Features:</Text>
          <View style={[styles.flexRow, styles.flexWrap]}>
            {hospital.emergencyFeatures.slice(0, 3).map((feature, index) => (
              <View
                key={index}
                style={[
                  styles.px2,
                  styles.py1,
                  styles.mr1,
                  styles.mb1,
                  styles.roundedMd,
                  { backgroundColor: colors.secondary[100] }
                ]}
              >
                <Text style={[styles.textXs, { color: colors.secondary[700] }]}>
                  {feature}
                </Text>
              </View>
            ))}
            {hospital.emergencyFeatures.length > 3 && (
              <Text style={[styles.textXs, styles.textGray500, styles.mt1]}>
                +{hospital.emergencyFeatures.length - 3} more
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Emergency Services for Current Emergency */}
      {emergencyType && hospital.emergencyServices && hospital.emergencyServices.length > 0 && (
        <View style={[styles.mb2]}>
          <Text style={[styles.textXs, styles.textGray600, styles.mb1]}>Available Services:</Text>
          <View style={[styles.flexRow, styles.flexWrap]}>
            {hospital.emergencyServices.slice(0, 4).map((service, index) => (
              <View
                key={index}
                style={[
                  styles.px2,
                  styles.py1,
                  styles.mr1,
                  styles.mb1,
                  styles.roundedMd,
                  { backgroundColor: colors.medical[100] }
                ]}
              >
                <Text style={[styles.textXs, { color: colors.medical[700] }]}>
                  {service.replace(/_/g, ' ')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Selection Button */}
      <View style={[styles.alignCenter, styles.justifyCenter, styles.mt2]}>
        <View style={[
          styles.px4,
          styles.py2,
          styles.roundedMd,
          styles.flexRow,
          styles.alignCenter,
          isSelected 
            ? { backgroundColor: colors.primary[600] }
            : { backgroundColor: colors.primary[100] }
        ]}>
          {isSelected && (
            <Ionicons 
              name="checkmark" 
              size={16} 
              color={colors.white} 
              style={[styles.mr1]} 
            />
          )}
          <Text style={[
            styles.fontMedium, 
            styles.textSm,
            { color: isSelected ? colors.white : colors.primary[600] }
          ]}>
            {isSelected ? "Selected" : "Select Hospital"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
