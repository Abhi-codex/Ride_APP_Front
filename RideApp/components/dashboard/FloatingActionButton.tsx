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
            backgroundColor: isOnline ? colors.gray[800] : colors.gray[900],
            borderRadius: 16,
            paddingVertical: 18,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
            opacity: disabled ? 0.7 : 1,
            borderWidth: 1,
            borderColor: colors.gray[700],
          }
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View style={[
          {
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: isOnline ? colors.gray[400] : colors.white,
            marginRight: 12,
          }
        ]} />
        
        <View style={[styles.flex1]}>
          <Text style={[styles.textLg, styles.fontBold, styles.textWhite]}>
            {isOnline ? 'Go Offline' : 'Go Online'}
          </Text>
        </View>
        
        <View style={[
          {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.gray[700],
            justifyContent: 'center',
            alignItems: 'center',
          }
        ]}>
          <View style={[
            {
              width: 8,
              height: 8,
              backgroundColor: colors.white,
              borderRadius: isOnline ? 2 : 4,
            }
          ]} />
        </View>
      </TouchableOpacity>
    </View>
  );
};
