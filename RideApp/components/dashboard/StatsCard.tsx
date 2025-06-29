import { colors, styles } from '@/constants/TailwindStyles';
import React from 'react';
import { Text, View, ViewStyle } from 'react-native';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  gradient?: boolean;
  style?: ViewStyle;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  gradient = false,
  style,
}) => {
  return (
    <View
      style={[
        {
          backgroundColor: gradient ? color : colors.white,
          borderRadius: 16,
          padding: 20,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          borderLeftWidth: 4,
          borderLeftColor: color,
        },
        style,
      ]}
    >
      <View style={[styles.flexRow, styles.justifyBetween, styles.alignCenter, { marginBottom: 8 }]}>
        <Text
          style={[
            {
              fontSize: 32,
              opacity: 0.8,
            },
          ]}
        >
          {icon}
        </Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={[
              {
                fontSize: 24,
                fontWeight: '700',
                color: gradient ? colors.white : colors.gray[800],
              },
            ]}
          >
            {value}
          </Text>
        </View>
      </View>
      
      <Text
        style={[
          {
            fontSize: 14,
            fontWeight: '500',
            color: gradient ? colors.white : colors.gray[600],
            marginBottom: 4,
          },
        ]}
      >
        {title}
      </Text>
      
      {subtitle && (
        <Text
          style={[
            {
              fontSize: 12,
              color: gradient ? colors.white : colors.gray[500],
              opacity: 0.8,
            },
          ]}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};
