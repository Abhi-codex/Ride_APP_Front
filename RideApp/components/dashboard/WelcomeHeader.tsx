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
      styles.shadowLg,
    ]}>
      <View style={[styles.flexRow, styles.justifyBetween, styles.alignCenter]}>
        <View style={[styles.flex1]}>
          <Text style={[styles.textBase, styles.textGray600, styles.mb1]}>
            {greeting}
          </Text>
          <Text style={[styles.text2xl, styles.fontBold, styles.textGray900, styles.mb3]}>
            {driverName}
          </Text>
          <View style={[styles.flexRow, styles.alignCenter]}>
            <View style={[
              {
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isOnline ? colors.medical[500] : colors.gray[400],
                marginRight: 8,
              }
            ]} />
            <Text style={[styles.textSm, styles.textGray600, styles.fontMedium]}>
              {isOnline ? "Online & Ready for Emergency Calls" : "Currently Offline"}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            {
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.medical[50],
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: colors.medical[100],
            }
          ]}
          onPress={onProfilePress}
        >
          <Text style={[{ fontSize: 24 }]}>�‍⚕️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
