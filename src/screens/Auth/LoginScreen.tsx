import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const LoginScreen = ({ navigation, onLogin }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      // Hardcoded Admin Bypass for UI Development
      if (email.toLowerCase() === 'admin@eco.com') {
        const isAdmin = true;
        await AsyncStorage.setItem('userToken', 'admin_dummy_token');
        await AsyncStorage.setItem('isAdmin', 'true');
        setLoading(false);
        if (onLogin) onLogin(isAdmin);
        return;
      }

      const response = await fetch('https://primary-sculpture-empathy.ngrok-free.dev/carapp/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      const token = data.token || data.access || data.access_token || 'dummy_token';
      const isAdmin = email.toLowerCase() === 'admin@eco.com';
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('isAdmin', isAdmin.toString());
      if (onLogin) onLogin(isAdmin);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.linkContainer}>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  logoImage: { width: 180, height: 180, borderRadius: 90 },
  logoTextWrapper: { marginLeft: 10, justifyContent: 'center' },
  logoTextMain: { fontSize: 22, fontWeight: '800', color: '#1E3A8A', fontStyle: 'italic', lineHeight: 24 },
  logoTextHighlight: { color: '#2563EB' },
  logoTextSub: { fontSize: 14, fontWeight: '700', color: '#1E3A8A', letterSpacing: 1, marginTop: 0 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 30, textAlign: 'center', color: '#1E293B', letterSpacing: -0.5 },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    color: '#000',
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
  linkContainer: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#2563EB', fontSize: 15, fontWeight: '600' },
});

export default LoginScreen;
