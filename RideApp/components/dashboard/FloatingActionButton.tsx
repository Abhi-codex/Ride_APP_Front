import { colors, styles } from '@/constants/TailwindStyles';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface FloatingActionButtonProps {
  onPress: () => void;
  isOnline: boolean;
  disabled?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  isOnline,
  disabled = false,
}) => {
  return (
    <View style={[
      styles.absolute,
      styles.bottom0,
      { right: 20, left: 20, bottom: 30, zIndex: 1000 }
    ]}>
      <TouchableOpacity
        style={[
          {
            backgroundColor: isOnline ? colors.emergency[500] : colors.medical[600],
            borderRadius: 28,
            paddingVertical: 20,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
            opacity: disabled ? 0.7 : 1,
          }
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View style={[
          {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
          }
        ]}>
          <Text style={[{ fontSize: 24 }]}>
            {isOnline ? '🛑' : '🚑'}
          </Text>
        </View>
        
        <View style={[styles.flex1]}>
          <Text style={[styles.textLg, styles.fontBold, styles.textWhite, styles.mb1]}>
            {isOnline ? 'Go Offline' : 'Go Online'}
          </Text>
          <Text style={[styles.textSm, styles.textWhite, { opacity: 0.9 }]}>
            {isOnline ? 'Stop accepting emergency calls' : 'Start accepting emergency calls'}
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
          <Text style={[{ fontSize: 16, color: colors.white }]}>
            {isOnline ? '⏹️' : '▶️'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
