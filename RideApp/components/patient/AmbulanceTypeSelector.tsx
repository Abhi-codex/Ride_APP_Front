import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles, colors } from "../../constants/TailwindStyles";
import { AmbulanceOption, AmbulanceType } from "../../types/patient";

interface AmbulanceTypeSelectorProps {
  selectedType: AmbulanceType;
  onSelectType: (type: AmbulanceType) => void;
  availableTypes?: AmbulanceType[];
  emergencyContext?: {
    name: string;
    priority: string;
  };
}

const ALL_AMBULANCE_TYPES: AmbulanceOption[] = [
  { key: 'bls', label: 'BLS', desc: 'Basic Life Support - Oxygen, CPR, First Aid' },
  { key: 'als', label: 'ALS', desc: 'Advanced Life Support - Cardiac Monitor, Defibrillator' },
  { key: 'ccs', label: 'CCS', desc: 'Critical Care Support - Ventilator, Advanced Monitoring' },
  { key: 'auto', label: 'Auto', desc: 'Compact Urban Unit - Quick Response in Traffic' },
  { key: 'bike', label: 'Bike', desc: 'Emergency Response Motorcycle - Fastest Access' },
];

export default function AmbulanceTypeSelector({
  selectedType,
  onSelectType,
  availableTypes,
  emergencyContext,
}: AmbulanceTypeSelectorProps) {
  
  // Filter ambulance types based on available types
  const filteredTypes = useMemo(() => {
    if (!availableTypes) return ALL_AMBULANCE_TYPES;
    return ALL_AMBULANCE_TYPES.filter(type => availableTypes.includes(type.key));
  }, [availableTypes]);

  // Organize types into rows for better layout
  const organizedTypes = useMemo(() => {
    const rows: AmbulanceOption[][] = [];
    for (let i = 0; i < filteredTypes.length; i += 2) {
      rows.push(filteredTypes.slice(i, i + 2));
    }
    return rows;
  }, [filteredTypes]);

  return (
    <View style={[styles.mb6]}>
      <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween, styles.mb3]}>
        <Text style={[styles.textLg, styles.fontBold, styles.textGray800]}>
          Select Ambulance Type
        </Text>
        {emergencyContext && (
          <View style={[
            styles.px2,
            styles.py1,
            styles.roundedMd,
            { backgroundColor: colors.primary[100] }
          ]}>
            <Text style={[styles.textXs, { color: colors.primary[600] }]}>
              For {emergencyContext.name}
            </Text>
          </View>
        )}
      </View>

      {organizedTypes.map((row: AmbulanceOption[], index: number) => (
        <View 
          key={`ambulance-row-${index}`} 
          style={[styles.flexRow, styles.justifyBetween, index > 0 && styles.mt3]}
        >
          {row.map((type: AmbulanceOption) => (
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
                  styles.textCenter,
                  styles.mt1,
                  selectedType === type.key
                    ? { color: colors.gray[200] }
                    : styles.textGray500,
                ]}
              >
                {type.desc}
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Add empty space if row has only one item */}
          {row.length === 1 && (
            <View style={[styles.flex1, styles.mx1]} />
          )}
        </View>
      ))}
      
      {availableTypes && availableTypes.length < ALL_AMBULANCE_TYPES.length && (
        <View style={[
          styles.mt3,
          styles.p3,
          styles.roundedLg,
          { backgroundColor: colors.warning[50] },
          styles.border,
          { borderColor: colors.warning[200] }
        ]}>
          <Text style={[styles.textSm, styles.textCenter, { color: colors.warning[700] }]}>
            Only suitable ambulance types are shown for this emergency
          </Text>
        </View>
      )}
    </View>
  );
}
