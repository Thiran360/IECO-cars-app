import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, StatusBar, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const TrackingScreen = ({ navigation, route }: any) => {
  const [eta, setEta] = useState(15);
  const [pulseAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Simulated ETA countdown
    const timer = setInterval(() => {
      setEta((prev) => (prev > 0 ? prev - 1 : 0));
    }, 60000);

    // Pulse animation for the car marker
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    return () => clearInterval(timer);
  }, []);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5]
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0]
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Simulated Map Background */}
      <View style={styles.mapContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200' }} 
          style={styles.mapImage}
        />
        <View style={styles.mapOverlay} />
      </View>

      {/* Custom Header Overlay */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Driver En Route</Text>
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <Icon name="help-buoy-outline" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Simulated Car Marker on Map */}
      <View style={styles.carMarkerContainer}>
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]} />
        <View style={styles.carMarker}>
          <Icon name="car" size={24} color="#FFFFFF" />
        </View>
      </View>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab}>
          <Icon name="compass-outline" size={24} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab}>
          <Icon name="locate" size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Dashboard */}
      <View style={styles.bottomSheet}>
        {/* Drag Indicator */}
        <View style={styles.dragIndicator} />

        {/* ETA Section */}
        <View style={styles.etaContainer}>
          <Text style={styles.etaTitle}>Arriving in</Text>
          <Text style={styles.etaTime}>{eta} <Text style={styles.etaUnit}>mins</Text></Text>
          <Text style={styles.distanceText}>2.4 km away • Smooth traffic</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '40%' }]} />
        </View>

        {/* Driver & Vehicle Info */}
        <View style={styles.driverSection}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.driverImage} />
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>Michael R.</Text>
            <View style={styles.ratingRow}>
              <Icon name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>4.9 (120 trips)</Text>
            </View>
          </View>
          <View style={styles.vehicleBadge}>
            <Text style={styles.plateText}>TN 01 EV 9999</Text>
            <Text style={styles.carModelText}>White Innova</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionBtnSecondary}>
            <Icon name="close" size={20} color="#EF4444" />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.primaryActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Icon name="chatbubble-ellipses" size={22} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.callBtn}>
              <Icon name="call" size={20} color="#FFFFFF" />
              <Text style={styles.callText}>Call Driver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    height: height * 0.75, // Covers top 75% of screen
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    zIndex: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  helpButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },

  // Map Marker
  carMarkerContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
  },
  carMarker: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },

  // Floating Action Buttons
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: height * 0.45,
    gap: 16,
  },
  fab: {
    width: 52,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -10 },
    shadowRadius: 20,
    elevation: 20,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  etaContainer: {
    marginBottom: 20,
  },
  etaTitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  etaTime: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0F172A',
  },
  etaUnit: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '600',
  },
  distanceText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
  },
  driverImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  driverDetails: {
    flex: 1,
    marginLeft: 16,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 4,
  },
  vehicleBadge: {
    alignItems: 'flex-end',
  },
  plateText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  carModelText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  cancelText: {
    color: '#EF4444',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 15,
  },
  primaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 52,
    height: 52,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
  },
  callText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 15,
  },
});

export default TrackingScreen;
