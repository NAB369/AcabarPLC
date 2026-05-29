import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000/api/v1' : 'http://localhost:4000/api/v1';

const getHeaders = async () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting token from SecureStore:', error);
  }
  
  return headers;
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    // In a real app, you would dispatch an action to clear state and navigate to Login
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    throw new Error('Unauthorized');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || 'API request failed');
  }

  return data;
};

export const api = {
  async post(endpoint: string, data: any) {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async get(endpoint: string) {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    return handleResponse(response);
  }
};
