import { styles } from '@/constants/TailwindStyles';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface EmergencyPanelProps {
  onEmergencyPress?: () => void;
}

export const EmergencyPanel: React.FC<EmergencyPanelProps> = ({
  onEmergencyPress,
}) => {
  return (
    <View style={[
      styles.bgEmergency500,
      styles.rounded2xl,
      styles.p6,
      styles.mb4,
      styles.shadowLg,
    ]}>
      <View style={[styles.flexRow, styles.alignCenter, styles.mb4]}>
        <View style={[
          {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
          }
        ]}>
          <Text style={[{ fontSize: 20 }]}>🚨</Text>
        </View>
        
        <View style={[styles.flex1]}>
          <Text style={[styles.textLg, styles.fontBold, styles.textWhite, styles.mb1]}>
            Emergency Protocol
          </Text>
          <Text style={[styles.textSm, styles.textWhite, { opacity: 0.9, lineHeight: 18 }]}>
            Patient safety is our top priority. Follow emergency procedures at all times.
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          }
        ]}
        onPress={onEmergencyPress}
      >
        <Text style={[styles.textSm, styles.fontSemibold, styles.textWhite]}>
          📞 Emergency: 108 | Police: 100 | Fire: 101
        </Text>
      </TouchableOpacity>
    </View>
  );
};
