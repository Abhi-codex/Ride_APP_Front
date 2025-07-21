import { FontAwesome5, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, styles } from '../../constants/TailwindStyles';
import { getServerUrl } from '../../utils/network';

interface PatientProfile {
  name?: string;
  phone: string;
  email?: string;
  age?: string;
  gender?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  address?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        router.replace('/');
        return;
      }
      setTokenLoaded(true);
      setLoadingProfile(true);
      let phoneFromStorage = '';
      try {
        phoneFromStorage = (await AsyncStorage.getItem('phone')) || '';
        const res = await fetch(`${getServerUrl()}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data) {
          // If phone is not present in profile, use from storage
          setProfile({ ...data, phone: data.phone || phoneFromStorage });
        } else {
          setProfile({ phone: phoneFromStorage });
        }
      } catch {
        setProfile({ phone: phoneFromStorage });
      } finally {
        setLoadingProfile(false);
      }
    };
    checkAuthAndFetchProfile();
  }, []);

  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: dropdownOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    router.replace('/');
  };

  if (!tokenLoaded) return null;

  const isProfileComplete = profile && profile.name && profile.address && profile.emergencyContact;

  return (
    <View style={[styles.flex1, styles.bgGray50, styles.mt8]}>
      {/* Top Profile Bar */}
      <View style={[styles.flexRow, styles.justifyBetween, styles.alignCenter, styles.px5, styles.pt2, styles.pb3, styles.bgWhite, styles.shadowSm, { zIndex: 10 }]}> 
        <View style={[styles.flexRow, styles.alignCenter]}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={{ width: 40, height: 40, resizeMode: 'contain' }}
          />
          <Text style={[styles.text2xl, styles.mt1, styles.fontBold, styles.textEmergency500]}>InstaAid</Text>
        </View>
        <View>
          <Pressable
            style={[styles.flexRow, styles.alignCenter, styles.p2, styles.bgGray100, styles.roundedXl, styles.shadowSm]}
            onPress={() => setDropdownOpen((v) => !v)}
          >
            <FontAwesome6 name="user-injured" size={20} color={colors.black} />
            <Text style={[styles.textSm, styles.fontSemibold, styles.ml2, { minWidth: 80 }]}> 
              {loadingProfile ? <ActivityIndicator size="small" color={colors.primary[600]} /> : (profile?.phone || '---')}
            </Text>
            <MaterialIcons name={dropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} color={colors.gray[700]} />
          </Pressable>
          {/* Dropdown */}
          {dropdownOpen && (
            <Animated.View
              style={{transform: [{ scale: dropdownAnim.interpolate({ inputRange: [0, 1], outputRange: [0.90, 1] }) }],
                position: 'absolute', opacity: dropdownAnim, right: 0, top: 48, backgroundColor: colors.white,
                borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 8,
                minWidth: 180, padding: 12 }}>
              {!isProfileComplete && (
                <TouchableOpacity style={[styles.flexRow, styles.alignCenter, styles.mb3]} 
                onPress={() => { setDropdownOpen(false); router.push('/patient/profile'); }}>
                  <FontAwesome5 name="user-edit" size={18} color={colors.primary[600]} />
                  <Text style={[styles.ml2, styles.textBase, styles.textPrimary600]}>Complete Profile</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.flexRow, styles.alignCenter]} onPress={handleLogout}>
                <MaterialIcons name="logout" size={20} color={colors.danger[600]} />
                <Text style={[styles.ml2, styles.textBase, styles.textDanger600]}>Logout</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.px5, styles.mt4, styles.mb4]}>
        <View style={[styles.flexRow, styles.alignCenter, styles.bgGray100, styles.roundedXl, styles.px4, styles.py3, styles.shadowSm]}> 
          <Ionicons name="search" size={22} color={colors.gray[500]} />
          <TextInput
            style={[styles.flex1, styles.textBase, styles.ml2]}
            placeholder="Search services..."
            placeholderTextColor={colors.gray[400]}
            editable={false}
          />
        </View>
      </View>

      {/* Main Content */}
      <View style={[styles.flex1, styles.px5]}> 
        {/* Ambulance Booking Card */}
        <TouchableOpacity
          style={[styles.bgEmergency500, styles.rounded2xl, styles.p6, styles.shadow, styles.mb6, styles.alignCenter]}
          onPress={() => router.push('/patient/emergency')}
        >
          <FontAwesome5 name="ambulance" size={48} color={colors.white} />
          <Text style={[styles.text2xl, styles.fontBold, styles.textWhite, styles.mt3]}>Book Ambulance</Text>
          <Text style={[styles.textBase, styles.textWhite, styles.mt2, styles.textCenter]}>Quickly book a nearby ambulance in emergency</Text>
        </TouchableOpacity>

        {/* Tabs for Medicine and AI */}
        <View style={[styles.flexRow, styles.justifyBetween, styles.gap3]}> 
          <TouchableOpacity
            style={[styles.flex1, styles.bgMedical100, styles.roundedXl, styles.alignCenter, styles.px4, styles.py5, styles.shadowSm]}
            onPress={() => router.push('/patient/medicine')}
          >
            <FontAwesome5 name="pills" size={32} color={colors.medical[600]} />
            <Text style={[styles.textLg, styles.fontBold, styles.textMedical600, styles.mt2]}>Medicine</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.flex1, styles.bgPrimary100, styles.roundedXl, styles.alignCenter, styles.px4, styles.py5, styles.shadowSm]}
            onPress={() => router.push('/patient/ai')}
          >
            <Ionicons name="chatbubbles" size={32} color={colors.primary[600]} />
            <Text style={[styles.textLg, styles.fontBold, styles.textPrimary600, styles.mt2]}>AI Assistant</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}