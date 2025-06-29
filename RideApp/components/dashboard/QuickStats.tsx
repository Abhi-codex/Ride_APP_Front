import { styles } from '@/constants/TailwindStyles';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface QuickStatsProps {
  todayRides: number;
  totalRides: number;
  onStatsPress?: () => void;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  todayRides,
  totalRides,
  onStatsPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onStatsPress}
      activeOpacity={0.9}
      style={[
        styles.bgWhite,
        styles.rounded2xl,
        styles.p6,
        styles.mb4,
        styles.shadowLg,
      ]}
    >
      {/* Header */}
      <View style={[styles.flexRow, styles.justifyBetween, styles.alignCenter, styles.mb4]}>
        <Text style={[styles.textLg, styles.fontSemibold, styles.textGray800]}>
          Today's Summary
        </Text>
        <View style={[styles.bgMedical100, styles.roundedFull, styles.px3, styles.py1]}>
          <Text style={[styles.textXs, styles.fontMedium, styles.textMedical600]}>
            Active
          </Text>
        </View>
      </View>

      {/* Main Stats Grid */}
      <View style={[styles.flexRow, styles.mb4]}>
        <View style={[styles.flex1, styles.alignCenter, styles.mr3]}>
          <Text style={[styles.text2xl, styles.fontBold, styles.textMedical600]}>
            {todayRides}
          </Text>
          <Text style={[styles.textSm, styles.textGray600, styles.mt1, styles.textCenter]}>
            Emergency Rides
          </Text>
        </View>
        
        <View style={[styles.flex1, styles.alignCenter]}>
          <Text style={[styles.text2xl, styles.fontBold, styles.textGray800]}>
            {totalRides}
          </Text>
          <Text style={[styles.textSm, styles.textGray600, styles.mt1, styles.textCenter]}>
            Total Rides
          </Text>
        </View>
      </View>
       
    </TouchableOpacity>
  );
};