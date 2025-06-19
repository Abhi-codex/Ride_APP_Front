import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'rider'>('customer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!phone || !role) {
      Alert.alert('Validation Error', 'Please enter your phone number and select a role.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://192.168.0.113:3000/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role }),
      });

      const data = await response.json();
      console.log('Login response:', data); // Debug log

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
          router.push('/homerider');
        } else {
          Alert.alert('Unknown role', 'Could not determine user role.');
        }
      } else {
        Alert.alert('Login Failed', data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Network request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

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
          style={[styles.roleButton, role === 'rider' && styles.selectedRole]}
        >
          <Text style={styles.roleText}>Rider</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Continue" onPress={handleSubmit} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
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
  },
  selectedRole: { backgroundColor: 'lightblue' },
  roleText: { fontWeight: 'bold' },
});