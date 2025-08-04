import { styles } from '@/constants/TailwindStyles';
import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  rating?: number;
  avatarUrl?: string;
}

interface DoctorListProps {
  doctors: Doctor[];
  onSelect: (doctor: Doctor) => void;
}

const DoctorList: React.FC<DoctorListProps> = ({ doctors, onSelect }) => {
  return (
    <FlatList
      data={doctors}
      keyExtractor={item => item._id}
      renderItem={({ item }) => (
                <TouchableOpacity style={[styles.flexRow, styles.alignCenter, styles.bgWhite, styles.roundedXl, styles.p4, styles.mb3, styles.shadowSm]} onPress={() => onSelect(item)}>
          {item.avatarUrl ? (
                        <Image source={{ uri: item.avatarUrl }} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 14 }} />
          ) : (
            <View style={[styles.w48, styles.h48, styles.roundedFull, styles.bgGray200, styles.mr3]} />
          )}
          <View style={styles.flex1}>
                <Text style={[styles.textBase, styles.fontBold, styles.textGray900]}>{item.name}</Text>
                <Text style={[styles.textSm, styles.textGray600, styles.mt1]}>{item.specialty}</Text>
                    {item.rating !== undefined && (
                    <Text style={[styles.textXs, styles.textWarning500, styles.mt1]}>
                        ⭐ {item.rating.toFixed(1)}
                    </Text>
                    )}
          </View>
        </TouchableOpacity>
      )}
      contentContainerStyle={{ paddingVertical: 8 }}
    />
  );
};


export default DoctorList;
