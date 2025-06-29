import { colors, styles } from '@/constants/TailwindStyles';
import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ActionCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  onPress,
  style,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: colors.white,
          borderRadius: 16,
          padding: 20,
          marginBottom: 12,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: 1,
          borderColor: colors.gray[200],
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween]}>
        <View style={[styles.flex1, styles.mr3]}>
          <Text
            style={[
              {
                fontSize: 16,
                fontWeight: '600',
                color: colors.gray[900],
                marginBottom: 4,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              {
                fontSize: 14,
                color: colors.gray[600],
              },
            ]}
          >
            {subtitle}
          </Text>
        </View>
        
        <View style={[
          {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.gray[100],
            justifyContent: 'center',
            alignItems: 'center',
          }
        ]}>
          <Text style={[{ fontSize: 16, color: colors.gray[600] }]}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
