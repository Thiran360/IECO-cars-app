import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView, Dimensions, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation, onLogout }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState<string>('https://i.pravatar.cc/150?img=68');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const pic = await AsyncStorage.getItem('profile_pic');
      if (pic) {
        setProfilePic(pic);
      }

      const userStr = await AsyncStorage.getItem('mock_user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      } else {
        // Fallback mock data
        setUser({
          name: 'Alex Johnson',
          email: 'alex.johnson@example.com',
          phone: '+1 234 567 8900',
          driving_license: 'DL-987654321',
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('isAdmin');
    if (onLogout) {
      onLogout();
    }
  };

  const pickProfilePic = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (uri) {
        setProfilePic(uri);
        await AsyncStorage.setItem('profile_pic', uri);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header Profile Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.imageContainer} onPress={pickProfilePic}>
          <Image source={{ uri: profilePic }} style={styles.profileImage} />
          <View style={styles.cameraIconBadge}>
            <Icon name="camera" size={14} color="#FFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
        
        <TouchableOpacity style={styles.editButton}>
          <Icon name="pencil" size={16} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <Icon name="call-outline" size={20} color="#4F46E5" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Phone Number</Text>
              <Text style={styles.detailValue}>{user?.phone || 'Not provided'}</Text>
            </View>
          </View>
          
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <View style={styles.iconBox}>
              <Icon name="card-outline" size={20} color="#10B981" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Driving License</Text>
              <Text style={styles.detailValue}>{user?.driving_license || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Settings & Preferences</Text>
        <View style={styles.detailsContainer}>
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('UserBookings')}>
            <View style={styles.actionLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                <Icon name="calendar-outline" size={20} color="#0F172A" />
              </View>
              <Text style={styles.actionText}>My Bookings</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                <Icon name="wallet-outline" size={20} color="#0F172A" />
              </View>
              <Text style={styles.actionText}>Payment Methods</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.barItem} onPress={() => navigation.navigate('Categories')}>
          <Icon name="home-outline" size={20} color="#94A3B8" />
          <Text style={styles.barText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.barItem} onPress={() => navigation.navigate('Vehicles', { categoryId: null, categoryName: 'All Cars' })}>
          <Icon name="car-sport-outline" size={20} color="#94A3B8" />
          <Text style={styles.barText}>Vehicles</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.barItem} onPress={() => {}}>
          <Icon name="person" size={20} color="#4F46E5" />
          <Text style={[styles.barText, { color: '#4F46E5', fontWeight: '700' }]}>Profile</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  
  header: { 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#FFFFFF', 
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#0F172A', 
    shadowOpacity: 0.05, 
    shadowOffset: { width: 0, height: 10 }, 
    shadowRadius: 20, 
    elevation: 5,
    marginBottom: 20,
  },
  imageContainer: { width: 70, height: 70, borderRadius: 35, marginBottom: 12, position: 'relative', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, backgroundColor: '#FFF' },
  profileImage: { width: '100%', height: '100%', borderRadius: 35 },
  cameraIconBadge: { position: 'absolute', bottom: 2, right: 2, width: 26, height: 26, borderRadius: 13, backgroundColor: '#4F46E5', borderWidth: 2, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  
  name: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  email: { fontSize: 15, color: '#64748B', marginTop: 4, fontWeight: '500', marginBottom: 20 },
  
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 100, shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 3 },
  editButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginLeft: 8 },
  
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 12, marginLeft: 4, letterSpacing: -0.5 },
  
  detailsContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 8, marginBottom: 24, shadowColor: '#94A3B8', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 3 },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  iconBox: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  detailTextContainer: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  detailValue: { fontSize: 16, color: '#1E293B', fontWeight: '700' },
  
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  actionLeft: { flexDirection: 'row', alignItems: 'center' },
  actionText: { fontSize: 16, color: '#1E293B', fontWeight: '600', marginLeft: 16 },

  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', padding: 18, borderRadius: 24, marginTop: 8 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  // Bottom Navigation
  bottomBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10,
  },
  barItem: { alignItems: 'center' },
  barText: { fontSize: 10, marginTop: 4, color: '#94A3B8', fontWeight: '600' },
});

export default ProfileScreen;
