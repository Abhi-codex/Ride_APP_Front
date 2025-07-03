import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors, styles } from '../../constants/TailwindStyles';
import { getServerUrl } from '../../utils/network';

type VehicleType = 'basicAmbulance' | 'advancedAmbulance' | 'icuAmbulance' | 'airAmbulance';
type CertificationLevel = 'EMT-Basic' | 'EMT-Intermediate' | 'EMT-Paramedic' | 'Critical Care';

interface DriverProfile {
  name: string;
  email: string;
  vehicleType: VehicleType | '';
  plateNumber: string;
  model: string;
  licenseNumber: string;
  certificationLevel: CertificationLevel | '';
}

export default function DriverProfileSetupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DriverProfile>({
    name: '',
    email: '',
    vehicleType: '',
    plateNumber: '',
    model: '',
    licenseNumber: '',
    certificationLevel: '',
  });

  useEffect(() => {
    // Check if user is authenticated
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const token = await AsyncStorage.getItem('access_token');
    const role = await AsyncStorage.getItem('role');
    
    if (!token || role !== 'driver') {
      router.replace('/driver/login');
    }
  };

  const vehicleTypes = [
    { label: 'Select Ambulance Type', value: '' },
    { label: 'Basic Ambulance (₹50 base + ₹15/km)', value: 'basicAmbulance' },
    { label: 'Advanced Life Support (₹80 base + ₹20/km)', value: 'advancedAmbulance' },
    { label: 'ICU Ambulance (₹120 base + ₹30/km)', value: 'icuAmbulance' },
    { label: 'Air Ambulance (₹500 base + ₹100/km)', value: 'airAmbulance' },
  ];

  const certificationLevels = [
    { label: 'Select Certification Level', value: '' },
    { label: 'EMT-Basic', value: 'EMT-Basic' },
    { label: 'EMT-Intermediate', value: 'EMT-Intermediate' },
    { label: 'EMT-Paramedic', value: 'EMT-Paramedic' },
    { label: 'Critical Care', value: 'Critical Care' },
  ];

  const validateForm = (): boolean => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      Alert.alert('Validation Error', 'Please enter a valid name (minimum 2 characters)');
      return false;
    }

    if (formData.email && !validateEmail(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    if (!formData.vehicleType) {
      Alert.alert('Validation Error', 'Please select an ambulance type');
      return false;
    }

    if (!validatePlateNumber(formData.plateNumber)) {
      Alert.alert('Validation Error', 'Please enter a valid license plate number (3-15 characters)');
      return false;
    }

    if (!formData.model.trim()) {
      Alert.alert('Validation Error', 'Please enter the vehicle model');
      return false;
    }

    if (!formData.licenseNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter your EMT license number');
      return false;
    }

    if (!formData.certificationLevel) {
      Alert.alert('Validation Error', 'Please select your certification level');
      return false;
    }

    return true;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePlateNumber = (plate: string): boolean => {
    return typeof plate === 'string' && plate.length >= 3 && plate.length <= 15;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        router.replace('/driver/login');
        return;
      }

      const profileData = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        vehicle: {
          type: formData.vehicleType,
          plateNumber: formData.plateNumber.trim().toUpperCase(),
          model: formData.model.trim(),
          licenseNumber: formData.licenseNumber.trim(),
          certificationLevel: formData.certificationLevel,
        },
      };

      console.log('Submitting profile data:', profileData);

      const response = await fetch(`${getServerUrl()}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      console.log('Profile update response:', data);

      if (response.ok) {
        Alert.alert(
          'Success!',
          'Your driver profile has been completed successfully. You can now start accepting emergency calls.',
          [
            {
              text: 'Go to Dashboard',
              onPress: () => router.replace('/driver/dashboard'),
            },
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof DriverProfile, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.flex1]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={[styles.flex1, { backgroundColor: colors.gray[50] }]}
        contentContainerStyle={styles.flexGrow}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.px5, styles.py6]}>
          {/* Header */}
          <View style={[styles.alignCenter, styles.mb6]}>
            <View
              style={{
                backgroundColor: colors.emergency[500],
                width: 60,
                height: 60,
                borderRadius: 30,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 30, color: colors.white }}>👨‍⚕️</Text>
            </View>
            <Text style={[styles.text2xl, styles.fontBold, styles.textGray900, styles.textCenter]}>
              Complete Your Driver Profile
            </Text>
            <Text style={[styles.textSm, styles.textGray600, styles.textCenter, styles.mt2]}>
              Provide your details to start accepting emergency calls
            </Text>
          </View>

          {/* Personal Information Section */}
          <View style={[styles.mb6]}>
            <Text style={[styles.textLg, styles.fontBold, styles.textGray900, styles.mb3]}>
              Personal Information
            </Text>

            {/* Name Input */}
            <View style={[styles.mb4]}>
              <Text style={[styles.textSm, styles.fontMedium, styles.textGray700, styles.mb2]}>
                Full Name *
              </Text>
              <TextInput
                style={[
                  styles.wFull,
                  styles.px4,
                  styles.py3,
                  styles.borderGray300,
                  styles.roundedLg,
                  styles.textBase,
                  styles.bgWhite,
                  { borderWidth: 1 },
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.gray[400]}
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                editable={!loading}
              />
            </View>

            {/* Email Input */}
            <View style={[styles.mb4]}>
              <Text style={[styles.textSm, styles.fontMedium, styles.textGray700, styles.mb2]}>
                Email Address (Optional)
              </Text>
              <TextInput
                style={[
                  styles.wFull,
                  styles.px4,
                  styles.py3,
                  styles.borderGray300,
                  styles.roundedLg,
                  styles.textBase,
                  styles.bgWhite,
                  { borderWidth: 1 },
                ]}
                placeholder="Enter your email address"
                placeholderTextColor={colors.gray[400]}
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          {/* Vehicle Information Section */}
          <View style={[styles.mb6]}>
            <Text style={[styles.textLg, styles.fontBold, styles.textGray900, styles.mb3]}>
              Ambulance Information
            </Text>

            {/* Vehicle Type Picker */}
            <View style={[styles.mb4]}>
              <Text style={[styles.textSm, styles.fontMedium, styles.textGray700, styles.mb2]}>
                Ambulance Type *
              </Text>
              <View
                style={[
                  styles.borderGray300,
                  styles.roundedLg,
                  styles.bgWhite,
                  { borderWidth: 1, overflow: 'hidden' },
                ]}
              >
                <Picker
                  selectedValue={formData.vehicleType}
                  onValueChange={(value) => updateFormData('vehicleType', value)}
                  enabled={!loading}
                  style={{ height: 50 }}
                >
                  {vehicleTypes.map((type) => (
                    <Picker.Item key={type.value} label={type.label} value={type.value} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Plate Number Input */}
            <View style={[styles.mb4]}>
              <Text style={[styles.textSm, styles.fontMedium, styles.textGray700, styles.mb2]}>
                License Plate Number *
              </Text>
              <TextInput
                style={[
                  styles.wFull,
                  styles.px4,
                  styles.py3,
                  styles.borderGray300,
                  styles.roundedLg,
                  styles.textBase,
                  styles.bgWhite,
                  { borderWidth: 1 },
                ]}
                placeholder="e.g., AMB1234"
                placeholderTextColor={colors.gray[400]}
                value={formData.plateNumber}
                onChangeText={(value) => updateFormData('plateNumber', value)}
                autoCapitalize="characters"
                editable={!loading}
              />
            </View>

            {/* Vehicle Model Input */}
            <View style={[styles.mb4]}>
              <Text style={[styles.textSm, styles.fontMedium, styles.textGray700, styles.mb2]}>
                Vehicle Model *
              </Text>
              <TextInput
                style={[
                  styles.wFull,
                  styles.px4,
                  styles.py3,
                  styles.borderGray300,
                  styles.roundedLg,
                  styles.textBase,
                  styles.bgWhite,
                  { borderWidth: 1 },
                ]}
                placeholder="e.g., Mercedes Sprinter"
                placeholderTextColor={colors.gray[400]}
                value={formData.model}
                onChangeText={(value) => updateFormData('model', value)}
                editable={!loading}
              />
            </View>
          </View>

          {/* Certification Section */}
          <View style={[styles.mb6]}>
            <Text style={[styles.textLg, styles.fontBold, styles.textGray900, styles.mb3]}>
              EMT Certification
            </Text>

            {/* License Number Input */}
            <View style={[styles.mb4]}>
              <Text style={[styles.textSm, styles.fontMedium, styles.textGray700, styles.mb2]}>
                EMT License Number *
              </Text>
              <TextInput
                style={[
                  styles.wFull,
                  styles.px4,
                  styles.py3,
                  styles.borderGray300,
                  styles.roundedLg,
                  styles.textBase,
                  styles.bgWhite,
                  { borderWidth: 1 },
                ]}
                placeholder="Enter your EMT license number"
                placeholderTextColor={colors.gray[400]}
                value={formData.licenseNumber}
                onChangeText={(value) => updateFormData('licenseNumber', value)}
                editable={!loading}
              />
            </View>

            {/* Certification Level Picker */}
            <View style={[styles.mb4]}>
              <Text style={[styles.textSm, styles.fontMedium, styles.textGray700, styles.mb2]}>
                Certification Level *
              </Text>
              <View
                style={[
                  styles.borderGray300,
                  styles.roundedLg,
                  styles.bgWhite,
                  { borderWidth: 1, overflow: 'hidden' },
                ]}
              >
                <Picker
                  selectedValue={formData.certificationLevel}
                  onValueChange={(value) => updateFormData('certificationLevel', value)}
                  enabled={!loading}
                  style={{ height: 50 }}
                >
                  {certificationLevels.map((level) => (
                    <Picker.Item key={level.value} label={level.label} value={level.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.wFull,
              styles.py4,
              styles.alignCenter,
              styles.roundedLg,
              styles.mb4,
              {
                backgroundColor: loading ? colors.gray[300] : colors.emergency[500],
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={[styles.textWhite, styles.textLg, styles.fontBold]}>
                Complete Profile
              </Text>
            )}
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            style={[styles.alignCenter, styles.py2]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={[styles.textSm, styles.textGray600]}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
