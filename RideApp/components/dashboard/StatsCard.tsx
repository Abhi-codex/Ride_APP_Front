import { colors, styles } from '@/constants/TailwindStyles';
import React from 'react';
import { Text, View, ViewStyle } from 'react-native';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  style?: ViewStyle;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  style,
}) => {
  return (
    <View style={[{ backgroundColor: colors.white, borderRadius: 16, padding: 20, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: colors.gray[200] }, style]}>
      <View style={[styles.alignStart, styles.mb3]}>
        <Text style={[{ fontSize: 28, fontWeight: '700', color: colors.gray[900] }, styles.mb1]}>{value}</Text>
        <Text style={[styles.textSm, styles.fontMedium, styles.textGray600, styles.mb25]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.textXs, styles.textGray500]}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
};
