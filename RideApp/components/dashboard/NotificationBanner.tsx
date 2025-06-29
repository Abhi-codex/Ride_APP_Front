import { colors, styles } from '@/constants/TailwindStyles';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface NotificationBannerProps {
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  onClose?: () => void;
  actionText?: string;
  onActionPress?: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message,
  type,
  onClose,
  actionText,
  onActionPress,
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.secondary[500],
          icon: '✅',
        };
      case 'warning':
        return {
          backgroundColor: colors.warning[500],
          icon: '⚠️',
        };
      case 'error':
        return {
          backgroundColor: colors.danger[500],
          icon: '❌',
        };
      default:
        return {
          backgroundColor: colors.primary[500],
          icon: 'ℹ️',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <View
      style={{
        backgroundColor: config.backgroundColor,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Text style={{ fontSize: 20, marginRight: 12 }}>{config.icon}</Text>
      
      <View style={[styles.flex1]}>
        <Text
          style={{
            color: colors.white,
            fontSize: 14,
            fontWeight: '500',
            lineHeight: 20,
          }}
        >
          {message}
        </Text>
      </View>
      
      {actionText && onActionPress && (
        <TouchableOpacity
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 6,
            marginLeft: 8,
          }}
          onPress={onActionPress}
        >
          <Text
            style={{
              color: colors.white,
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
      
      {onClose && (
        <TouchableOpacity
          style={{
            padding: 4,
            marginLeft: 8,
          }}
          onPress={onClose}
        >
          <Text style={{ color: colors.white, fontSize: 16 }}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
