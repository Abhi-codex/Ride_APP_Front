import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles, colors } from "../../constants/TailwindStyles";
import { AmbulanceOption, AmbulanceType } from "../../types/patient";

interface AmbulanceTypeSelectorProps {
  selectedType: AmbulanceType;
  onSelectType: (type: AmbulanceType) => void;
}

const AMBULANCE_TYPES: AmbulanceOption[][] = [
  [
    { key: 'bls', label: 'BLS', desc: 'Basic Life Support' },
    { key: 'als', label: 'ALS', desc: 'Advanced Life Support' },
  ],
  [
    { key: 'ccs', label: 'CCS', desc: 'Critical Care Support' },
    { key: 'auto', label: 'Auto', desc: 'Compact Urban Unit' },
  ],
  [
    { key: 'bike', label: 'Bike', desc: 'Emergency Response Motorcycle' },
  ]
];

export default function AmbulanceTypeSelector({
  selectedType,
  onSelectType,
}: AmbulanceTypeSelectorProps) {
  return (
    <View style={[styles.mb6]}>
      <Text style={[styles.textLg, styles.fontBold, styles.mb3, styles.textGray800]}>
        Select Ambulance Type
      </Text>

      {AMBULANCE_TYPES.map((row, index) => (
        <View 
          key={`ambulance-row-${index}`} 
          style={[styles.flexRow, styles.justifyBetween, index > 0 && styles.mt3]}
        >
          {row.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.flex1,
                styles.py4,
                styles.px3,
                styles.roundedLg,
                styles.alignCenter,
                styles.mx1,
                styles.border2,
                selectedType === type.key
                  ? [{ backgroundColor: colors.primary[600] }, styles.borderPrimary600]
                  : [styles.bgGray100, styles.borderGray200],
              ]}
              onPress={() => onSelectType(type.key)}
            >
              <Text
                style={[
                  styles.textSm,
                  styles.fontBold,
                  selectedType === type.key
                    ? styles.textWhite
                    : styles.textGray700,
                ]}
              >
                {type.label}
              </Text>
              <Text
                style={[
                  styles.textXs,
                  styles.mt1,
                  styles.textCenter,
                  selectedType === type.key
                    ? styles.textWhite
                    : styles.textGray500,
                ]}
              >
                {type.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}
