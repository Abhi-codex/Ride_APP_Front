import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getServerUrl, makeRequest } from '../utils/network';

export default function AuthScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'rider'>('customer');
  const [loading, setLoading] = useState(false);
  const [serverUrl] = useState(getServerUrl());

  const handleSubmit = async () => {
    if (!phone || !role) {
      Alert.alert('Validation Error', 'Please enter your phone number and select a role.');
      return;
    }

    setLoading(true);

    try {
      console.log(`Attempting to connect to: ${serverUrl}`);
      
      const { response, data } = await makeRequest(`${serverUrl}/auth/signin`, {
        method: 'POST',
        body: JSON.stringify({ phone, role }),
      });

      if (response.ok) {
        const userRole = data.user?.role;

        if (!userRole) {
          Alert.alert('Error', 'Role not found in response.');
          setLoading(false);
          return;
        }

        await AsyncStorage.setItem('access_token', data.access_token);
        await AsyncStorage.setItem('refresh_token', data.refresh_token);
        await AsyncStorage.setItem('role', userRole);

        if (userRole === 'customer') {
          router.push('/home');
        } else if (userRole === 'rider') {
          router.push('/dashboard');
        } else {
          Alert.alert('Unknown role', 'Could not determine user role.');
        }
      } else {
        Alert.alert('Login Failed', data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      
      let errorMessage = 'Connection failed. ';
      
      if (error instanceof Error) {
        errorMessage += error.message;
      }
      
      if (Platform.OS !== 'web') {
        errorMessage += `\n\nTroubleshooting for mobile:\n`;
        errorMessage += `1. Make sure your phone and computer are on the same WiFi network\n`;
        errorMessage += `2. Check if your computer's IP is correct: ${serverUrl}\n`;
        errorMessage += `3. Try disabling your computer's firewall temporarily\n`;
        errorMessage += `4. Make sure your server is running and accessible\n`;
        errorMessage += `5. Your computer's IP might have changed`;
      }
      
      Alert.alert('Connection Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        placeholder="Phone Number"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <View style={styles.roleContainer}>
        <TouchableOpacity
          onPress={() => setRole('customer')}
          style={[styles.roleButton, role === 'customer' && styles.selectedRole]}
        >
          <Text style={styles.roleText}>Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setRole('rider')}
          style={[styles.roleButton, role === 'rider' && styles.selectedRole]}        >
          <Text style={styles.roleText}>Rider</Text>
        </TouchableOpacity>
      </View>      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button 
          title="Sign In" 
          onPress={handleSubmit} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  serverIndicator: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    alignItems: 'center',
  },  serverText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  serverUrl: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
  },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  roleButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#888',
    width: '40%',
    alignItems: 'center',
  },  selectedRole: { backgroundColor: 'lightblue' },
  roleText: { fontWeight: 'bold' },
});