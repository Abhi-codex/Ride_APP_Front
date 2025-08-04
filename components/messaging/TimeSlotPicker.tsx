import React from 'react';
import { FlatList, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../constants/TailwindStyles';

export interface TimeSlot {
  _id: string;
  start: string; // ISO string
  end: string;   // ISO string
  available: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlotId?: string;
  onSelect: (slot: TimeSlot) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ slots, selectedSlotId, onSelect }) => {
  return (
    <FlatList
      data={slots}
      keyExtractor={item => item._id}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.px4, styles.py2, styles.roundedXl, styles.mx2, styles.mb2,
            item.available ? styles.bgPrimary100 : styles.bgGray200,
            selectedSlotId === item._id && styles.bgPrimary500
          ]}
          onPress={() => item.available && onSelect(item)}
          disabled={!item.available}
        >
          <Text style={[
            styles.textBase,
            selectedSlotId === item._id ? styles.textWhite : styles.textPrimary700,
            !item.available && styles.textGray400
          ]}>
            {new Date(item.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={[styles.py2, styles.px2]}
    />
  );
};

export default TimeSlotPicker;
