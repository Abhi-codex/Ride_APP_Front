import { Platform } from 'react-native';

export const getServerUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  } 
  else if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return 'http://192.168.173.247:3000'; 
  } 
  else {
    return 'http://localhost:3000';
  }
};

export const makeRequest = async (url: string, options: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    console.log('Making request to:', url);
    console.log('Request options:', JSON.stringify(options, null, 2));
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    
    // Handle different response types
    if (response.status >= 400) {
      const errorText = await response.text();
      console.log('Error response body:', errorText);
      throw new Error(`Server error ${response.status}: ${errorText.substring(0, 200)}...`);
    }
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { response, data };
    } else {
      const textResponse = await response.text();
      console.log('Non-JSON response received:', textResponse.substring(0, 500));
      throw new Error(`Server returned non-JSON response. Status: ${response.status}. Response: ${textResponse.substring(0, 200)}...`);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out (15 seconds)');
      } else if (error.message.includes('Network request failed')) {
        throw new Error('Network request failed. Please check your connection and server.');
      } else if (error.message.includes('fetch')) {
        throw new Error('Failed to connect to server. Check if server is running and accessible.');
      }
    }
    
    throw error;
  }
};
