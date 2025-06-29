import { colors, styles } from '@/constants/TailwindStyles';
import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  backgroundColor: string;
  textColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  backgroundColor,
  textColor = colors.white,
  style,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: disabled ? colors.gray[300] : backgroundColor,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 6,
          transform: [{ scale: disabled ? 0.98 : 1 }],
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={[styles.flexRow, styles.alignCenter]}>
        <View style={[
          {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
          }
        ]}>
          <Text style={[{ fontSize: 28 }]}>{icon}</Text>
        </View>
        
        <View style={[styles.flex1]}>
          <Text style={[
            styles.textLg,
            styles.fontBold,
            styles.mb1,
            {
              color: disabled ? colors.gray[500] : textColor,
            }
          ]}>
            {title}
          </Text>
          <Text style={[
            styles.textSm,
            {
              color: disabled ? colors.gray[400] : textColor,
              opacity: 0.9,
              lineHeight: 20,
            }
          ]}>
            {subtitle}
          </Text>
        </View>
        
        <View style={[
          {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }
        ]}>
          <Text style={[{ fontSize: 16, color: textColor }]}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
