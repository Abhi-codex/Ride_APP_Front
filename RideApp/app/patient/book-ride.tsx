import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  View,
  Text,
  ScrollView,
} from 'react-native';
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

export default function RideScreen() {
  // State for ambulance type selection
  const [ambulanceType, setAmbulanceType] = useState<AmbulanceType>('basicAmbulance');
  
  // Use hooks for location management
  const { 
    currentLocation: initialLocation, 
    originalLocation, 
    hospitals, 
    loading
  } = useLocationAndHospitals();
  
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
      bookRide(selectedHospital, ambulanceType, originalLocation);
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
    <View style={[styles.flex1, styles.bgGray50]}>
      <View style={[styles.flex1]}>
        <PatientMap
          currentLocation={currentLocation}
          hospitals={hospitals}
          selectedHospital={selectedHospital}
          routeCoords={routeCoords}
        />
      </View>

      <View style={[
        styles.bgWhite,
        styles.roundedTl3xl,
        styles.roundedTr3xl,
        styles.px5,
        styles.pt4,
        styles.pb4,
        { 
          height: !selectedHospital 
            ? Dimensions.get('window').height * 0.6 
            : Dimensions.get('window').height * 0.65 
        }
      ]}>
        {!selectedHospital ? (
          <HospitalList
            hospitals={hospitals}
            onSelectHospital={handleSelectHospital}
            selectedHospital={selectedHospital}
            isLoading={hospitals.length === 0 && !loading}
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
            />

            <AmbulanceTypeSelector
              selectedType={ambulanceType}
              onSelectType={(type) => setAmbulanceType(type)}
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