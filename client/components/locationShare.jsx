// screens/LocationShare.jsx

import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, AppState, Platform, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import { COLORS } from '../Color';
import { SocketContext } from '../context/SocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to calculate distance
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const radlat1 = Math.PI * lat1 / 180;
  const radlat2 = Math.PI * lat2 / 180;
  const theta = lon1 - lon2;
  const radtheta = Math.PI * theta / 180;
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515 * 1.609344;
  return dist;
};

const LocationShare = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { friendId, friendName, friendAvatar } = route.params;

  const socket = useContext(SocketContext);
  const mapRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const locationSubscription = useRef(null);
  
  const [userId, setUserId] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [friendData, setFriendData] = useState({
    location: null,
    address: 'Location not available',
    isOnline: false,
    lastSeen: null,
  });

  // --- 1. SETUP & PERMISSIONS ---
  useEffect(() => {
    const setup = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);

      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
        return;
      }
      
      const initialLocation = await Location.getCurrentPositionAsync({});
      setMyLocation(initialLocation.coords);
    };
    setup();
  }, []);

  // --- 2. APP STATE & SOCKET LOGIC ---
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        startSharingLocation();
      } else if (nextAppState.match(/inactive|background/)) {
        stopSharingLocation();
      }
      appState.current = nextAppState;
    };
    
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    startSharingLocation();

    return () => {
      appStateSubscription.remove();
      stopSharingLocation();
    };
  }, [userId, friendId, socket]);

  useEffect(() => {
    if (!socket) return;
    
    const handleFriendLocation = async (data) => {
      const { latitude, longitude } = data;
      let address = friendData.address;

      const distanceMoved = getDistance(friendData.location?.latitude, friendData.location?.longitude, latitude, longitude);

      if (!friendData.location || distanceMoved > 0.05) {
        try {
          const addressResult = await Location.reverseGeocodeAsync({ latitude, longitude });
          address = addressResult[0] ? `${addressResult[0].name}, ${addressResult[0].city}` : 'Unknown location';
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
            address = "Could not fetch address";
        }
      }
      
      setFriendData({ location: data, address, isOnline: true, lastSeen: new Date() });
    };

    const handleFriendOffline = async ({ lastLocation, lastSeen }) => {
        let address = 'Last known location';
        if (lastLocation) {
            try {
                const addressResult = await Location.reverseGeocodeAsync(lastLocation);
                address = addressResult[0] ? `${addressResult[0].name}, ${addressResult[0].city}` : address;
            } catch (error) {
                console.error("Reverse geocoding failed for offline friend:", error);
            }
        }
        setFriendData(prev => ({...prev, isOnline: false, lastSeen, location: lastLocation, address}));
    }

    // **FIX:** New listener to instantly know when a friend comes online for location sharing
    const handleFriendStartedSharing = () => {
        setFriendData(prev => ({ ...prev, isOnline: true, lastSeen: new Date() }));
    };

    socket.on('friend-location-update', handleFriendLocation);
    socket.on('friend-went-offline', handleFriendOffline);
    socket.on('friend-started-sharing', handleFriendStartedSharing);

    return () => {
      socket.off('friend-location-update', handleFriendLocation);
      socket.off('friend-went-offline', handleFriendOffline);
      socket.off('friend-started-sharing', handleFriendStartedSharing);
    };
  }, [socket, friendData.location]);

  // --- 3. CORE FUNCTIONS ---
  const startSharingLocation = async () => {
    if (locationSubscription.current || !userId || !socket || permissionStatus !== 'granted') return;
    
    socket.emit('join-location-room', { userId, friendId });

    locationSubscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 3000, distanceInterval: 10 },
      (location) => {
        const { latitude, longitude } = location.coords;
        setMyLocation({ latitude, longitude });
        socket.emit('location-update', { userId, friendId, location: { latitude, longitude } });
      }
    );
  };
  
  const stopSharingLocation = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    if (socket && userId) {
      socket.emit('stop-sharing', { userId, friendId, lastLocation: myLocation });
    }
  };
  
  // --- 4. MAP CONTROLS ---
  const centerOnMe = () => myLocation && mapRef.current?.animateToRegion({ ...myLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
  const centerOnFriend = () => friendData.location && mapRef.current?.animateToRegion({ ...friendData.location, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
  const fitBoth = () => {
    if (myLocation && friendData.location) {
      mapRef.current?.fitToCoordinates([myLocation, friendData.location], {
        edgePadding: { top: 100, right: 50, bottom: 250, left: 50 },
        animated: true,
      });
    }
  };

  if (permissionStatus === null) {
    return <View style={styles.container}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }
  if (permissionStatus !== 'granted') {
    return <View style={styles.container}><Text style={styles.infoText}>Location permission is required.</Text></View>;
  }

  const distance = getDistance(myLocation?.latitude, myLocation?.longitude, friendData.location?.latitude, friendData.location?.longitude);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{ latitude: 28.6139, longitude: 77.2090, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }}
      >
        {myLocation && <Marker coordinate={myLocation} title="You" pinColor={COLORS.primary} />}
        {friendData.location && (
          <Marker coordinate={friendData.location} title={friendName}>
            <View style={styles.markerContainer}>
              <Image source={{ uri: friendAvatar }} style={styles.markerAvatar} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Location</Text>
      </View>

      {/* Map Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={centerOnMe}>
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={centerOnFriend}>
            <MaterialCommunityIcons name="account-search" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={fitBoth}>
            <MaterialCommunityIcons name="arrow-expand-all" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Information Panel */}
      <View style={styles.infoPanel}>
        <View style={styles.infoPanelHeader}>
            <Image source={{ uri: friendAvatar }} style={styles.panelAvatar} />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.panelName}>{friendName}</Text>
                <Text style={[styles.panelStatus, { color: friendData.isOnline ? COLORS.primary : COLORS.grayText }]}>
                    {friendData.isOnline ? '● Sharing Live' : `● Offline. Last seen ${friendData.lastSeen ? moment(friendData.lastSeen).fromNow() : 'a while ago'}`}
                </Text>
            </View>
        </View>
        <View style={styles.infoPanelBody}>
            <MaterialCommunityIcons name="map-marker-distance" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>{distance > 0 ? `${distance.toFixed(2)} km away` : 'Calculating distance...'}</Text>
        </View>
        <View style={styles.infoPanelBody}>
            <MaterialCommunityIcons name="map-marker" size={24} color={COLORS.primary} />
            <Text style={styles.infoText} numberOfLines={1}>
                {friendData.address}
            </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
          container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.lightGrayBg },
  header: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  backButton: { backgroundColor: 'rgba(255,255,255,0.8)', padding: 8, borderRadius: 20 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginRight: 44 },
  markerContainer: { padding: 3, backgroundColor: 'white', borderRadius: 23, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5 },
  markerAvatar: { width: 40, height: 40, borderRadius: 20 },
  controlsContainer: { position: 'absolute', top: 120, right: 15, alignItems: 'center' },
  controlButton: { backgroundColor: 'rgba(255,255,255,0.9)', padding: 12, borderRadius: 25, marginBottom: 15, elevation: 5 },
  infoPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  infoPanelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  panelAvatar: { width: 50, height: 50, borderRadius: 25 },
  panelName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  panelStatus: { fontSize: 14, fontWeight: '600' },
  infoPanelBody: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  infoText: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.grayText },
});

export default LocationShare;