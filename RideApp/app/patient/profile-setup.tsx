import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
type Gender = 'male' | 'female' | 'other';

interface PatientProfile {
  name: string;
  email: string;
  age: string;
  gender: Gender | '';
  bloodGroup: BloodGroup | '';
  emergencyContact: string;
  medicalConditions: string;
  allergies: string;
  address: string;
}


export default function PatientProfileSetupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PatientProfile>({
    name: '',
    email: '',
    age: '',
    gender: '',
    bloodGroup: '',
    emergencyContact: '',
    medicalConditions: '',
    allergies: '',
    address: '',
  });

  const bloodGroups = [
    { label: 'Select Blood Group', value: '' },
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
  ];

  const genders = [
    { label: 'Select Gender', value: '' },
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
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

    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age) || age < 1 || age > 120) {
      Alert.alert('Validation Error', 'Please enter a valid age (1-120)');
      return false;
    }

    if (!formData.gender) {
      Alert.alert('Validation Error', 'Please select your gender');
      return false;
    }

    if (!formData.bloodGroup) {
      Alert.alert('Validation Error', 'Please select your blood group');
      return false;
    }

    if (!validatePhone(formData.emergencyContact)) {
      Alert.alert('Validation Error', 'Please enter a valid emergency contact number');
      return false;
    }

    if (!formData.address.trim()) {
      Alert.alert('Validation Error', 'Please enter your address');
      return false;
    }

    return true;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
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
        router.replace('/patient/login');
        return;
      }

      const profileData = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        age: parseInt(formData.age),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        emergencyContact: formData.emergencyContact.trim(),
        medicalConditions: formData.medicalConditions.trim() || undefined,
        allergies: formData.allergies.trim() || undefined,
        address: formData.address.trim(),
      };

      console.log('Submitting patient profile data:', profileData);

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
          'Your profile has been updated successfully.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/patient/book-ride'),
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

  const updateFormData = (field: keyof PatientProfile, value: string) => {
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
                backgroundColor: colors.primary[600],
                width: 60,
                height: 60,
                borderRadius: 30,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 30, color: colors.white }}>🧑🏻‍🦰</Text>
            </View>
            <Text style={[styles.text2xl, styles.fontBold, styles.textGray900, styles.textCenter]}>
              Complete Your Profile
            </Text>
            <Text style={[styles.textSm, styles.textGray600, styles.textCenter, styles.mt2]}>
              Help us provide better emergency care by completing your profile
            </Text>
          </View>

          {/* Personal Information */}
          <View style={[styles.mb6]}>
            <Text style={[styles.textLg, styles.fontBold, styles.textGray900, styles.mb3]}>
              Personal Information
            </Text>

            {/* Name */}
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

            {/* Email */}
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
                placeholder="Enter your email"
                placeholderTextColor={colors.gray[400]}
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Age and Gender Row */}
            <View style={[styles.flexRow, { gap: 12 }, styles.mb4]}>
              <View style={[styles.flex1]}>
                <Text style={[styles.textSm, styles.fontMedium, styles.textGray700, styles.mb2]}>
                  Age *
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
                  placeholder="Age"
                  placeholderTextColor={colors.gray[400]}
                  value={formData.age}
                  onChangeText={(value) => updateFormData('age', value)}
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>

              <View style={[styles.flex1]}>
                <Text style={[styles.textSm, styles.fontMedium, styles.textGray700, styles.mb2]}>
                  Gender *
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
                    selectedValue={formData.gender}
                    onValueChange={(value) => updateFormData('gender', value)}
                    enabled={!loading}
                    style={{ height: 50 }}
                  >
                    {genders.map((gender) => (
                      <Picker.Item key={gender.value} label={gender.label} value={gender.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            {/* Blood Group */}
            <View style={[styles.mb4]}>
              <Text style={[styles.textSm, styles.fontMedium, styles.textGray700, styles.mb2]}>
                Blood Group *
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
                  selectedValue={formData.bloodGroup}
                  onValueChange={(value) => updateFormData('bloodGroup', value)}
                  enabled={!loading}
                  style={{ height: 50 }}
                >
                  {bloodGroups.map((group) => (
                    <Picker.Item key={group.value} label={group.label} value={group.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Emergency Information */}
          <View style={[styles.mb6]}>
            <Text style={[styles.textLg, styles.fontBold, styles.textGray900, styles.mb3]}>
              Emergency Information
            </Text>

            {/* Emergency Contact */}
            <View style={[styles.mb4]}>
              <Text style={[styles.textSm, styles.fontMedium, styles.textGray700, styles.mb2]}>
                Emergency Contact Number *
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
                placeholder="Emergency contact number"
                placeholderTextColor={colors.gray[400]}
                value={formData.emergencyContact}
                onChangeText={(value) => updateFormData('emergencyContact', value)}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            {/* Medical Conditions */}
            <View style={[styles.mb4]}>
              <Text style={[styles.textSm, styles.fontMedium, styles.textGray700, styles.mb2]}>
                Medical Conditions (Optional)
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
                  { borderWidth: 1, minHeight: 80 },
                ]}
                placeholder="Any chronic conditions, medications, etc."
                placeholderTextColor={colors.gray[400]}
                value={formData.medicalConditions}
                onChangeText={(value) => updateFormData('medicalConditions', value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>

            {/* Allergies */}
            <View style={[styles.mb4]}>
              <Text style={[styles.textSm, styles.fontMedium, styles.textGray700, styles.mb2]}>
                Allergies (Optional)
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
                placeholder="Drug allergies, food allergies, etc."
                placeholderTextColor={colors.gray[400]}
                value={formData.allergies}
                onChangeText={(value) => updateFormData('allergies', value)}
                editable={!loading}
              />
            </View>

            {/* Address */}
            <View style={[styles.mb4]}>
              <Text style={[styles.textSm, styles.fontMedium, styles.textGray700, styles.mb2]}>
                Address *
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
                  { borderWidth: 1, minHeight: 80 },
                ]}
                placeholder="Complete address for emergency services"
                placeholderTextColor={colors.gray[400]}
                value={formData.address}
                onChangeText={(value) => updateFormData('address', value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!loading}
              />
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
                backgroundColor: loading ? colors.gray[300] : colors.primary[600],
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
                Save Profile
              </Text>
            )}
          </TouchableOpacity>

          {/* Skip Button */}
          <TouchableOpacity
            style={[styles.alignCenter, styles.py2]}
            onPress={() => router.replace('/patient/book-ride')}
            disabled={loading}
          >
            <Text style={[styles.textSm, styles.textGray600]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
