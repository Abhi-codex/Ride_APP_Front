import React, { useState, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  PatientMap, 
  HospitalList, 
  SelectedHospital,
  AmbulanceTypeSelector,
  BookRideButton
} from '../../components/patient';
import { colors, styles } from '../../constants/TailwindStyles';
import { AmbulanceType, Hospital } from '../../types/patient';
import { 
  useHospitalSelection,
  useLocationAndHospitals,
  useRideBooking
} from '../../hooks';
import { 
  getAvailableAmbulanceTypes, 
  filterHospitalsByEmergency, 
  getEmergencyById,
  getSuggestedAmbulanceType,
  getEmergencyPriorityColor
} from '../../utils/emergencyUtils';

export default function RideScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Emergency context from previous screen
  const emergencyId = params.emergencyType as string;
  const emergencyName = params.emergencyName as string;
  const requiredAmbulanceTypes = params.requiredAmbulanceTypes ? 
    JSON.parse(params.requiredAmbulanceTypes as string) : [];
  const requiredServices = params.requiredServices ? 
    JSON.parse(params.requiredServices as string) : [];
  const priority = params.priority as string;

  // Get emergency details
  const emergency = emergencyId ? getEmergencyById(emergencyId) : null;
  
  // State for ambulance type selection - use suggested type based on emergency
  const [ambulanceType, setAmbulanceType] = useState<AmbulanceType>(
    emergencyId ? getSuggestedAmbulanceType(emergencyId) : 'bls'
  );
  
  // Use hooks for location management
  const { 
    currentLocation: initialLocation, 
    originalLocation, 
    hospitals: allHospitals, 
    loading,
    fetchHospitalsByEmergency
  } = useLocationAndHospitals();

  // Effect to fetch emergency-specific hospitals when emergency is selected
  useEffect(() => {
    if (emergencyId && originalLocation && !loading) {
      console.log('useEffect: Fetching hospitals for emergency:', emergencyId);
      console.log('useEffect: originalLocation available:', !!originalLocation);
      console.log('useEffect: loading state:', loading);
      fetchHospitalsByEmergency(emergencyId);
    } else {
      console.log('useEffect: Conditions not met for hospital fetch');
      console.log('- emergencyId:', emergencyId);
      console.log('- originalLocation:', !!originalLocation);
      console.log('- loading:', loading);
    }
  }, [emergencyId, originalLocation, loading]); // Removed fetchHospitalsByEmergency from dependencies
  
  // Filter hospitals based on emergency requirements (fallback for frontend filtering)
  const hospitals = useMemo(() => {
    console.log('Filtering hospitals. Emergency ID:', emergencyId);
    console.log('All hospitals count:', allHospitals.length);
    
    if (!emergencyId) return allHospitals;
    
    const filtered = filterHospitalsByEmergency(allHospitals, emergencyId);
    console.log('Filtered hospitals count:', filtered.length);
    console.log('Emergency requirements:', emergency?.requiredHospitalServices);
    
    // Log first few hospitals to see their services
    filtered.slice(0, 3).forEach((hospital, index) => {
      console.log(`Hospital ${index + 1}: ${hospital.name}`);
      console.log('Services:', hospital.emergencyServices);
    });
    
    return filtered;
  }, [allHospitals, emergencyId, emergency]);
  
  // Get available ambulance types for this emergency
  const availableAmbulanceTypes = useMemo(() => {
    if (!emergencyId) return ['bls', 'als', 'ccs', 'auto', 'bike'] as AmbulanceType[];
    return getAvailableAmbulanceTypes(emergencyId);
  }, [emergencyId]);
  
  // Use hooks for hospital and route management
  const { 
    selectedHospital, 
    routeCoords, 
    routeLoading, 
    selectHospital, 
    clearSelectedHospital,
    getOptimalMapRegion
  } = useHospitalSelection();
  
  // Use hook for ride booking
  const { booking, bookRide } = useRideBooking();
  
  // State to manage map region
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  
  // Update local state when initial location is available
  useEffect(() => {
    if (initialLocation && !currentLocation) {
      setCurrentLocation(initialLocation);
    }
  }, [initialLocation]);
  
  // Update map region when hospital is selected
  useEffect(() => {
    if (selectedHospital && originalLocation) {
      const optimalRegion = getOptimalMapRegion(selectedHospital, originalLocation);
      if (optimalRegion) {
        setCurrentLocation(optimalRegion);
      }
    }
  }, [selectedHospital, routeCoords, originalLocation]);

  // Handler for hospital selection
  const handleSelectHospital = async (hospital: Hospital) => {
    if (originalLocation) {
      await selectHospital(hospital, originalLocation);
    }
  };

  // Handler for booking a ride
  const handleBookRide = () => {
    if (selectedHospital && originalLocation) {
      const emergencyContext = emergency ? {
        emergencyType: emergencyId,
        emergencyName: emergencyName,
        priority: priority
      } : undefined;
      
      console.log('Booking ride with:');
      console.log('- Hospital:', selectedHospital.name);
      console.log('- Ambulance type:', ambulanceType);
      console.log('- Original location:', originalLocation);
      console.log('- Emergency context:', JSON.stringify(emergencyContext, null, 2));
      
      bookRide(selectedHospital, ambulanceType, originalLocation, emergencyContext);
    } else {
      console.log('Cannot book ride:');
      console.log('- Selected hospital:', !!selectedHospital);
      console.log('- Original location:', !!originalLocation);
    }
  };

  // Handler for changing the selected hospital
  const handleChangeHospital = () => {
    clearSelectedHospital(originalLocation);
    // Reset map to original location when deselecting hospital
    if (originalLocation) {
      setCurrentLocation(originalLocation);
    }
  };

  if (loading) {
    return (
      <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter, styles.bgGray50]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[styles.mt4, styles.textBase, styles.textGray600]}>
          Getting your location...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.flex1, styles.mt8]}>
      {/* Emergency Header */}
      {emergency && (
        <View style={[
          styles.px3,
          styles.py2,
          styles.bgGray100,
          styles.shadowSm,
          styles.borderB,
          { borderBottomColor: colors.gray[200] }
        ]}>
          <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween]}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.flexRow, styles.alignCenter]}
            >
              <Ionicons name="arrow-back" size={20} color={colors.gray[600]} />
              <Text style={[styles.ml2, styles.textSm, styles.textGray600]}>
                Change Emergency
              </Text>
            </TouchableOpacity>
            
            <View style={[
              styles.px2,
              styles.py1,
              styles.roundedFull,
              { backgroundColor: getEmergencyPriorityColor(priority) + '20' }
            ]}>
              <Text style={[
                styles.textXs,
                styles.fontMedium,
                { color: getEmergencyPriorityColor(priority) }
              ]}>
                {priority?.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={[styles.flexRow, styles.alignCenter, styles.mt1]}>
            <Text style={[styles.textLg, styles.mr2]}>
              {emergency.icon}
            </Text>
            <View style={[styles.flex1]}>
              <Text style={[styles.textLg, styles.fontSemibold, styles.textGray800]}>
                {emergencyName}
              </Text>
              <Text style={[styles.textSm, styles.textGray600]}>
                {emergency.description}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={[styles.flex1]}>
        <PatientMap
          currentLocation={currentLocation}
          hospitals={hospitals}
          selectedHospital={selectedHospital}
          routeCoords={routeCoords}
        />
      </View>


      <View style={[styles.bgGray100, styles.borderT, styles.borderGray200, styles.px3, styles.pt4, styles.pb4,
        { height: !selectedHospital 
            ? Dimensions.get('window').height * 0.60
            : Dimensions.get('window').height * 0.63
        }
      ]}>
        {!selectedHospital ? (
          <HospitalList
            hospitals={hospitals}
            onSelectHospital={handleSelectHospital}
            selectedHospital={selectedHospital}
            isLoading={hospitals.length === 0 && !loading}
            emergencyContext={emergency ? {
              name: emergencyName,
              priority: priority,
              requiredServices: requiredServices,
              emergencyType: emergencyId
            } : undefined}
            searchCriteria={emergencyId ? {
              emergencyType: emergencyId,
              minimumEmergencyScore: emergency?.priority === 'critical' ? 70 : 
                                   emergency?.priority === 'high' ? 50 : 30
            } : undefined}
          />
        ) : (
          <ScrollView 
            style={[styles.flex1]} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.pb4]}
          >
            <SelectedHospital
              hospital={selectedHospital}
              onChangeHospital={handleChangeHospital}
              routeLoading={routeLoading}
              emergencyType={emergencyId}
            />

            <AmbulanceTypeSelector
              selectedType={ambulanceType}
              onSelectType={(type) => setAmbulanceType(type)}
              availableTypes={availableAmbulanceTypes}
              emergencyContext={emergency ? {
                name: emergencyName,
                priority: priority
              } : undefined}
            />

            <BookRideButton
              onPress={handleBookRide}
              isLoading={booking}
              selectedHospital={selectedHospital}
            />
          </ScrollView>
        )}
      </View>
    </View>
  );
}