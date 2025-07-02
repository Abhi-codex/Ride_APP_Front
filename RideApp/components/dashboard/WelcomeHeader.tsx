import { styles } from '@/constants/TailwindStyles';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface WelcomeHeaderProps {
  driverName?: string;
  onProfilePress?: () => void;
  isOnline?: boolean;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  driverName = "Driver",
  onProfilePress,
  isOnline = false,
}) => {
  const currentHour = new Date().getHours();
  let greeting = "Good morning";
  
  if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good afternoon";
  } else if (currentHour >= 17) {
    greeting = "Good evening";
  }

  return (
    <View style={[
      styles.bgWhite,
      styles.rounded2xl,
      styles.p6,
      styles.mb4,
      styles.shadowLg,
      styles.border,
      styles.borderGray200,
    ]}>
      <View style={[styles.flexRow, styles.justifyBetween, styles.alignCenter]}>
        <View style={[styles.flex1]}>
          <Text style={[styles.textSm, styles.textMedical600, styles.mb1]}>
            {greeting}
          </Text>
          <Text style={[styles.textXl, styles.fontBold, styles.textGray900, styles.mb3]}>
            {driverName}
          </Text>
          <View style={[styles.flexRow, styles.alignCenter]}>
            <View style={[
              styles.w0Point5,
              styles.h2,
              styles.roundedFull,
              isOnline ? styles.bgMedical600 : styles.bgGray400,
              styles.mr2,
            ]} />
            <Text style={[
              styles.textSm, 
              styles.fontMedium,
              isOnline ? styles.textMedical700 : styles.textGray600
            ]}>
              {isOnline ? "Online & Available" : "Currently Offline"}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.square12,
            styles.roundedFull,
            styles.bgWarning50,
            styles.justifyCenter,
            styles.alignCenter,
            styles.border,
            styles.borderWarning200,
          ]}
          onPress={onProfilePress}
        >
          <View style={[
            styles.square6,
            styles.roundedFull,
            styles.bgWarning600,
          ]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
