import { styles } from '@/constants/TailwindStyles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface ChatHeaderProps {
  name: string;
  specialty?: string;
  avatarUrl?: string;
  onBack?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ name, specialty, avatarUrl, onBack }) => {
  return (
    <View style={[styles.flexRow, styles.justifyCenter, styles.p4, styles.bgWhite, styles.borderB, styles.borderGray200]}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.mr4}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
      )}
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={[styles.w40, styles.h40, styles.roundedFull]} />
      ) : (
        <Ionicons name="person-circle" size={40} color="#aaa" style={[styles.w40, styles.h40, styles.roundedFull]} />
      )}
      <View style={styles.flex1}>
        <Text style={[styles.textLg, styles.fontBold, styles.fontBlack]}>{name}</Text>
        {specialty && <Text style={[styles.textSm, styles.textGray600, styles.mt1]}>{specialty}</Text>}
      </View>
    </View>
  );
};

export default ChatHeader;
