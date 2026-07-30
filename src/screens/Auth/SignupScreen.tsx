import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView, Image } from 'react-native';


const SignupScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    pancard: '',
    driving_license: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async () => {
    // Basic validation
    for (const [key, value] of Object.entries(formData)) {
      if (!value) {
        Alert.alert('Error', `Please enter your ${key.replace('_', ' ')}`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch('https://primary-sculpture-empathy.ngrok-free.dev/carapp/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      Alert.alert('Success', 'Account created successfully! Please login.');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.title}>Create Account</Text>
        
        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#888" value={formData.name} onChangeText={(val) => handleChange('name', val)} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888" value={formData.email} onChangeText={(val) => handleChange('email', val)} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#888" value={formData.phone} onChangeText={(val) => handleChange('phone', val)} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Address" placeholderTextColor="#888" value={formData.address} onChangeText={(val) => handleChange('address', val)} multiline />
        <TextInput style={styles.input} placeholder="PAN Card Number" placeholderTextColor="#888" value={formData.pancard} onChangeText={(val) => handleChange('pancard', val)} autoCapitalize="characters" />
        <TextInput style={styles.input} placeholder="Driving License" placeholderTextColor="#888" value={formData.driving_license} onChangeText={(val) => handleChange('driving_license', val)} autoCapitalize="characters" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888" value={formData.password} onChangeText={(val) => handleChange('password', val)} secureTextEntry />

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Sign Up'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 24, flexGrow: 1, justifyContent: 'center', paddingVertical: 40 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
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

export default SignupScreen;
