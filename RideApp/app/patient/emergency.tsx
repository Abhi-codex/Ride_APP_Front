import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, styles } from '../../constants/TailwindStyles';
import { EMERGENCY_CATEGORIES, EMERGENCY_TYPES, EmergencyType, EmergencyCategory } from '../../types/emergency';

export default function EmergencySelectionScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter emergencies based on search query
  const filteredEmergencies = useMemo(() => {
    if (!searchQuery.trim()) return EMERGENCY_TYPES;
    
    const query = searchQuery.toLowerCase();
    return EMERGENCY_TYPES.filter(emergency => 
      emergency.name.toLowerCase().includes(query) ||
      emergency.description.toLowerCase().includes(query) ||
      emergency.searchKeywords.some(keyword => keyword.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Get emergencies for selected category
  const categoryEmergencies = useMemo(() => {
    if (!selectedCategory) return [];
    return EMERGENCY_TYPES.filter(emergency => emergency.category === selectedCategory);
  }, [selectedCategory]);

  const handleEmergencySelect = (emergency: EmergencyType) => {
    // Navigate to booking with emergency context
    router.push({
      pathname: '/patient/booking',
      params: {
        emergencyType: emergency.id,
        emergencyName: emergency.name,
        requiredAmbulanceTypes: JSON.stringify(emergency.requiredAmbulanceTypes),
        requiredServices: JSON.stringify(emergency.requiredHospitalServices),
        priority: emergency.priority,
      }
    });
  };

  const renderEmergencyTile = ({ item }: { item: EmergencyType }) => (
    <TouchableOpacity
      style={[
        styles.p4,
        styles.bgWhite,
        styles.roundedXl,
        styles.mb3,
        styles.shadowSm,
        styles.border4,
        { borderLeftColor: getPriorityColor(item.priority) }
      ]}
      onPress={() => handleEmergencySelect(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.flexRow, styles.alignCenter, styles.mb2]}>
        <Text style={[styles.textXl, styles.mr3]}>{item.icon}</Text>
        <View style={[styles.flex1]}>
          <Text style={[styles.textLg, styles.fontSemibold, styles.textGray800]}>
            {item.name}
          </Text>
          <Text style={[styles.textSm, styles.textGray600, styles.mt1]}>
            {item.description}
          </Text>
        </View>
        <View style={[styles.alignCenter]}>
          <View style={[
            styles.px2,
            styles.py1,
            styles.roundedFull,
            { backgroundColor: getPriorityColor(item.priority) + '20' }
          ]}>
            <Text style={[
              styles.textXs,
              styles.fontMedium,
              { color: getPriorityColor(item.priority) }
            ]}>
              {item.priority.toUpperCase()}
            </Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={colors.gray[400]} 
            style={[styles.mt1]}
          />
        </View>
      </View>
      
      <View style={[styles.flexRow, styles.flexWrap, styles.mt2]}>
        {item.requiredAmbulanceTypes.slice(0, 3).map((type, index) => (
          <View 
            key={index}
            style={[
              styles.px2,
              styles.py1,
              styles.roundedMd,
              styles.mr1,
              styles.mb1,
              { backgroundColor: colors.primary[100] }
            ]}
          >
            <Text style={[styles.textXs, { color: colors.primary[600] }]}>
              {type.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderCategoryTile = ({ item }: { item: EmergencyCategory }) => (
    <TouchableOpacity
      style={[
        styles.p4,
        styles.roundedXl,
        styles.mr3,
        styles.mb3,
        styles.alignCenter,
        styles.w32,
        { backgroundColor: item.color + '15' }
      ]}
      onPress={() => setSelectedCategory(item.id)}
      activeOpacity={0.7}
    >
      <Text style={[styles.text2xl, styles.mb2]}>{item.icon}</Text>
      <Text style={[
        styles.textSm,
        styles.fontMedium,
        styles.textCenter,
        { color: item.color }
      ]}>
        {item.name}
      </Text>
      <Text style={[styles.textXs, styles.textGray500, styles.textCenter, styles.mt1]}>
        {item.emergencies.length} types
      </Text>
    </TouchableOpacity>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={[styles.flex1, styles.mt8, styles.bgGray50]}>
      {/* Header */}
      <View style={[styles.px5, styles.py4, styles.bgWhite]}>
        <View style={[styles.flexRow, styles.alignCenter, styles.mb4]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.mr3]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.gray[600]} />
          </TouchableOpacity>
          <Text style={[styles.textXl, styles.fontBold, styles.textGray800]}>
            What's the Emergency?
          </Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.flexRow, styles.alignCenter, styles.bgGray100, styles.roundedXl, styles.px4, styles.py3]}>
          <Ionicons name="search" size={20} color={colors.gray[400]} />
          <TextInput
            style={[styles.flex1, styles.ml3, styles.textBase]}
            placeholder="Search emergency type..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={[styles.flex1]} showsVerticalScrollIndicator={false}>

        {searchQuery.trim() === '' && selectedCategory === null && (
          <>
            {/* Category Selection */}
            <View style={[styles.mt5]}>
              <Text style={[styles.textLg, styles.fontSemibold, styles.textGray800, styles.px5, styles.mb3]}>
                Browse by Category
              </Text>
              <FlatList
                horizontal
                data={EMERGENCY_CATEGORIES}
                renderItem={renderCategoryTile}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.px5]}
                nestedScrollEnabled={true}
              />
            </View>

            {/* Common Emergencies */}
            <View style={[styles.mt5, styles.px5]}>
              <Text style={[styles.textLg, styles.fontSemibold, styles.textGray800, styles.mb3]}>
                Common Emergencies
              </Text>
              {EMERGENCY_TYPES.filter(e => ['heart_attack', 'stroke', 'breathing_difficulty', 'major_trauma', 'chest_pain'].includes(e.id)).map((emergency) => (                  <TouchableOpacity
                    key={emergency.id}
                    style={[
                      styles.p4,
                      styles.bgWhite,
                      styles.roundedXl,
                      styles.mb3,
                      styles.shadowSm,
                      styles.border4,
                      { borderLeftColor: getPriorityColor(emergency.priority) }
                    ]}
                    onPress={() => handleEmergencySelect(emergency)}
                    activeOpacity={0.7}
                  >
                  <View style={[styles.flexRow, styles.alignCenter]}>
                    <Text style={[styles.textXl, styles.mr3]}>{emergency.icon}</Text>
                    <View style={[styles.flex1]}>
                      <Text style={[styles.textBase, styles.fontSemibold, styles.textGray800]}>
                        {emergency.name}
                      </Text>
                      <Text style={[styles.textSm, styles.textGray600, styles.mt1]}>
                        {emergency.description}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Category-specific emergencies */}
        {selectedCategory !== null && searchQuery.trim() === '' && (
          <View style={[styles.px5, styles.mt4]}>
            <View style={[styles.flexRow, styles.alignCenter, styles.mb4]}>
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                style={[styles.mr3]}
              >
                <Ionicons name="arrow-back" size={20} color={colors.gray[600]} />
              </TouchableOpacity>
              <Text style={[styles.textLg, styles.fontSemibold, styles.textGray800]}>
                {EMERGENCY_CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </Text>
            </View>
            <FlatList
              data={categoryEmergencies}
              renderItem={renderEmergencyTile}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            />
          </View>
        )}

        {/* Search Results */}
        {searchQuery.trim() !== '' && (
          <View style={[styles.px5, styles.mt4]}>
            <Text style={[styles.textLg, styles.fontSemibold, styles.textGray800, styles.mb3]}>
              Search Results ({filteredEmergencies.length})
            </Text>
            {filteredEmergencies.length === 0 ? (
              <View style={[styles.alignCenter, styles.py6]}>
                <Ionicons name="search" size={48} color={colors.gray[300]} />
                <Text style={[styles.textBase, styles.textGray500, styles.mt2]}>
                  No emergencies found
                </Text>
                <Text style={[styles.textSm, styles.textGray400, styles.textCenter, styles.mt1]}>
                  Try different keywords or browse categories
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredEmergencies}
                renderItem={renderEmergencyTile}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              />
            )}
          </View>
        )}

        <View style={[styles.h16]} />
      </ScrollView>
    </SafeAreaView>
  );
}
