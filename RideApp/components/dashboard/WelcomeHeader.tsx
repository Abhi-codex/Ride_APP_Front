import { colors, styles } from '@/constants/TailwindStyles';
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
      {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.gray[200],
      }
    ]}>
      <View style={[styles.flexRow, styles.justifyBetween, styles.alignCenter]}>
        <View style={[styles.flex1]}>
          <Text style={[styles.textSm, styles.textGray500, styles.mb1]}>
            {greeting}
          </Text>
          <Text style={[styles.textXl, styles.fontBold, styles.textGray900, styles.mb3]}>
            {driverName}
          </Text>
          <View style={[styles.flexRow, styles.alignCenter]}>
            <View style={[
              {
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isOnline ? colors.gray[900] : colors.gray[400],
                marginRight: 8,
              }
            ]} />
            <Text style={[styles.textSm, styles.textGray600, styles.fontMedium]}>
              {isOnline ? "Online & Available" : "Currently Offline"}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            {
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.gray[100],
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.gray[200],
            }
          ]}
          onPress={onProfilePress}
        >
          <View style={[
            {
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: colors.gray[600],
            }
          ]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
