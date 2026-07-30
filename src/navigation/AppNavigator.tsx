import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';

// Main Screens
import CategoriesScreen from '../screens/Main/CategoriesScreen';
import VehiclesScreen from '../screens/Main/VehiclesScreen';
import VehicleDetailsScreen from '../screens/Main/VehicleDetailsScreen';
import CreateBookingScreen from '../screens/Main/CreateBookingScreen';
import UserBookingsScreen from '../screens/Main/UserBookingsScreen';
import BookingDetailsScreen from '../screens/Main/BookingDetailsScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import TrackingScreen from '../screens/Main/TrackingScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const adminFlag = await AsyncStorage.getItem('isAdmin');
      setIsAuthenticated(!!token);
      setIsAdmin(adminFlag === 'true');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {(props) => <LoginScreen {...props} onLogin={(adminStatus: boolean) => { setIsAuthenticated(true); setIsAdmin(adminStatus); }} />}
            </Stack.Screen>
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          </>
        ) : isAdmin ? (
          // Admin Stack
          <>
            <Stack.Screen name="AdminDashboard" options={{ headerShown: false }}>
              {(props) => <AdminDashboardScreen {...props} onLogout={() => { setIsAuthenticated(false); setIsAdmin(false); }} />}
            </Stack.Screen>
          </>
        ) : (
          // Main Stack
          <>
            <Stack.Screen 
              name="Categories" 
              component={CategoriesScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Vehicles" 
              component={VehiclesScreen} 
              options={({ route }: any) => ({ title: route.params.categoryName || 'Vehicles' })}
            />
            <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} options={{ title: 'Vehicle Details' }} />
            <Stack.Screen name="CreateBooking" component={CreateBookingScreen} options={{ title: 'Book Vehicle' }} />
            <Stack.Screen name="UserBookings" component={UserBookingsScreen} options={{ title: 'My Bookings' }} />
            <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} options={{ title: 'Booking Details' }} />
            <Stack.Screen name="Tracking" component={TrackingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" options={{ title: 'My Profile' }}>
              {(props) => <ProfileScreen {...props} onLogout={() => { setIsAuthenticated(false); setIsAdmin(false); }} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
