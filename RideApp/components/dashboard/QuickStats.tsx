import { colors, styles } from '@/constants/TailwindStyles';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface QuickStatsProps {
  todayRides: number;
  totalRides: number;
  rating: number;
  todayEarnings: number;
  onStatsPress?: () => void;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  todayRides,
  totalRides,
  rating,
  todayEarnings,
  onStatsPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onStatsPress}
      activeOpacity={0.9}
      style={[
        {
          backgroundColor: colors.white,
          borderRadius: 16,
          padding: 24,
          marginBottom: 16,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: 1,
          borderColor: colors.gray[200],
        }
      ]}
    >
      <View style={[styles.flexRow, styles.justifyBetween, styles.alignCenter, styles.mb4]}>
        <Text style={[styles.textLg, styles.fontSemibold, styles.textGray800]}>
          Today's Overview
        </Text>
        <View style={[
          {
            backgroundColor: colors.gray[100],
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
          }
        ]}>
          <Text style={[styles.textXs, styles.fontMedium, styles.textGray700]}>
            Live
          </Text>
        </View>
      </View>

      <View style={[styles.flexRow]}>
        <View style={[styles.flex1, styles.alignCenter, styles.mr3]}>
          <Text style={[styles.text2xl, styles.fontBold, styles.textGray900]}>
            {todayRides}
          </Text>
          <Text style={[styles.textSm, styles.textGray600, styles.mt1, styles.textCenter]}>
            Rides
          </Text>
        </View>
        
        <View style={[
          {
            width: 1,
            backgroundColor: colors.gray[200],
            marginHorizontal: 16,
          }
        ]} />
        
        <View style={[styles.flex1, styles.alignCenter, styles.ml3]}>
          <Text style={[styles.text2xl, styles.fontBold, styles.textGray900]}>
            ₹{todayEarnings}
          </Text>
          <Text style={[styles.textSm, styles.textGray600, styles.mt1, styles.textCenter]}>
            Earnings
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
