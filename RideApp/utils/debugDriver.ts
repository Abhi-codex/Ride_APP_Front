import AsyncStorage from '@react-native-async-storage/async-storage';
import { getServerUrl } from './network';

export const debugDriverEndpoints = async () => {
  console.log('=== DRIVER ENDPOINTS DEBUG ===');
  
  try {
    const token = await AsyncStorage.getItem('access_token');
    console.log('Auth Token Available:', !!token);
    console.log('Server URL:', getServerUrl());
    
    if (!token) {
      console.log('❌ No authentication token found');
      return;
    }
    
    // Test 1: Driver Profile
    try {
      console.log('Testing /driver/profile...');
      const profileResponse = await fetch(`${getServerUrl()}/driver/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Profile Response Status:', profileResponse.status);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Profile data:', {
          id: profileData.data?._id,
          name: profileData.data?.name,
          isOnline: profileData.data?.isOnline,
          hasVehicle: !!profileData.data?.vehicle
        });
      } else {
        const errorText = await profileResponse.text();
        console.log('❌ Profile error:', errorText);
      }
    } catch (error) {
      console.log('❌ Profile request failed:', error);
    }
    
    // Test 2: Available Rides
    try {
      console.log('Testing /ride/driverrides...');
      const ridesResponse = await fetch(`${getServerUrl()}/ride/driverrides`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Rides Response Status:', ridesResponse.status);
      if (ridesResponse.ok) {
        const ridesData = await ridesResponse.json();
        console.log('✅ Available rides:', {
          count: ridesData.rides?.length || 0,
          rides: ridesData.rides?.map((r: any) => ({
            id: r._id,
            status: r.status,
            hasPickup: !!r.pickup,
            hasDrop: !!r.drop
          })) || []
        });
      } else {
        const errorText = await ridesResponse.text();
        console.log('❌ Rides error:', errorText);
      }
    } catch (error) {
      console.log('❌ Rides request failed:', error);
    }
    
    // Test 3: Server Health
    try {
      console.log('Testing server health...');
      const healthResponse = await fetch(`${getServerUrl()}/health`);
      console.log('Health Response Status:', healthResponse.status);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ Server health:', healthData);
      }
    } catch (error) {
      console.log('❌ Server health check failed:', error);
    }
    
  } catch (error) {
    console.log('❌ Debug failed:', error);
  }
  
  console.log('=== DEBUG COMPLETE ===');
};

export const testRideAcceptance = async (rideId: string) => {
  console.log('=== TESTING RIDE ACCEPTANCE ===');
  console.log('Ride ID:', rideId);
  
  try {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      console.log('❌ No auth token');
      return;
    }
    
    const response = await fetch(`${getServerUrl()}/ride/accept/${rideId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Accept Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Ride accepted successfully:', {
        rideId: data.ride?._id,
        status: data.ride?.status,
        hasPickup: !!data.ride?.pickup,
        hasDrop: !!data.ride?.drop,
        hasCustomer: !!data.ride?.customer
      });
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ Accept failed:', errorText);
      return null;
    }
  } catch (error) {
    console.log('❌ Accept request failed:', error);
    return null;
  }
};
