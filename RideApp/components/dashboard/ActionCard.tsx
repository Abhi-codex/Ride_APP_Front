import { styles } from '@/constants/TailwindStyles';
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
        styles.bgWhite,
        styles.rounded2xl,
        styles.p5,
        styles.mb3,
        styles.shadowMd,
        styles.border,
        styles.borderSecondary200,
        disabled ? styles.opacity75 : styles.opacity100,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween]}>
        <View style={[styles.flex1, styles.mr3]}>
          <Text style={[
            styles.textBase,
            styles.fontSemibold,
            styles.textGray900,
            styles.mb1,
          ]}>
            {title}
          </Text>
          <Text style={[
            styles.textSm,
            styles.textSecondary600,
          ]}>
            {subtitle}
          </Text>
        </View>
        
        <View style={[
          styles.w8,
          styles.h8,
          styles.roundedFull,
          styles.bgSecondary100,
          styles.justifyCenter,
          styles.alignCenter,
        ]}>
          <Text style={[styles.textBase, styles.textSecondary600]}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
