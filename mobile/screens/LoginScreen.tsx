import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Button } from '../components/Button';
import { theme } from '../components/theme';
import { api } from '../services/api';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('sokha.chan@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      
      // Store token
      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));
      
      // Navigate to Home
      navigation.replace('Home');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.header}>
          <Text style={theme.typography.h1}>Welcome to</Text>
          <Text style={[theme.typography.h1, { color: theme.colors.primary }]}>WeLoan365</Text>
          <Text style={styles.subtitle}>Sign in to manage your loans</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput 
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput 
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Button 
            title={loading ? 'Authenticating...' : 'Sign In'} 
            onPress={handleLogin} 
            disabled={loading}
            style={styles.loginBtn}
          />
        </View>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing.xl * 1.5,
  },
  subtitle: {
    color: 'rgba(0,0,0,0.6)',
    marginTop: theme.spacing.sm,
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.8)',
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    fontSize: 16,
  },
  loginBtn: {
    marginTop: theme.spacing.md,
  }
});
