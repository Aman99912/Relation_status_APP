
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS } from '../Color';
import { APIPATH } from '../utils/apiPath';
import Logout from '../components/logout';
import { Ionicons } from '@expo/vector-icons';


const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    const id = await AsyncStorage.getItem('userId');
    const Token = await AsyncStorage.getItem('Token');
    if (!id) {
      setLoading(false);
      return Alert.alert('Error', 'User ID not found. Please log in again.');
    }

    try {
      const res = await axios.get(`${APIPATH.BASE_URL}/api/user/id?id=${id}`, {
        headers: {
          Authorization: `${Token}`
        },
      });
      const data = res.data;
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      Alert.alert('Error', 'Failed to fetch user data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
       
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

       
        <View style={styles.profileCard}>
          <Image
            source={user?.avatar ? { uri: user.avatar } : require('../assets/avatar.png')}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{user?.fullname || 'Guest User'}</Text>
          <Text style={styles.profileUsername}>@{user?.username || 'unknown'}</Text>

          <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={() => {
              navigation.navigate('MainApp', { screen: 'chatPF' })
            }}
          >
            <Text style={styles.viewProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
        <Text style={styles.settingsSectionTitle}>Account</Text>
        <View style={styles.settingCard}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('MainApp', { screen: 'Dashboard' })}
           
          >
            <Ionicons name="grid-outline" size={24} color={COLORS.primary} />
            <Text style={styles.settingItemText}>Dashboard</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#bbb" style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} 
           onPress={() => navigation.navigate('MainApp', { screen: 'PrivacyPage' })} >
            <Ionicons name="lock-closed-outline" size={24} color={COLORS.primary} />
            <Text style={styles.settingItemText}>Privacy and Security</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#bbb" style={styles.arrowIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingItem, styles.lastSettingItem]}>
            <Ionicons name="gift-outline" size={24} color={COLORS.primary} />
            <Text style={styles.settingItemText}>Gift Shop</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#bbb" style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>

        <Text style={styles.settingsSectionTitle}>General</Text>
        <View style={styles.settingCard}>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="map-outline" size={24} color={COLORS.primary} />
            <Text style={styles.settingItemText}>Map</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#bbb" style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, styles.lastSettingItem]}>
            <Ionicons name="help-circle-outline" size={24} color={COLORS.primary} />
            <Text style={styles.settingItemText}>Help & Support</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#bbb" style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>

       
        <Logout  />
       

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },

  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ebebeb',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },

  profileCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: COLORS.background || '#8a2be2', 
    marginBottom: 20,
  },
  profileName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#222',
    marginBottom: 8,
  },
  profileUsername: {
    fontSize: 19,
    color: '#777',
    marginBottom: 20,
  },
  viewProfileButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 15,
  },
  viewProfileButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
  },

  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginHorizontal: 25,
    marginTop: 25,
    marginBottom: 10,
  },
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    paddingVertical: 5,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  lastSettingItem: {
    borderBottomWidth: 0, // No border for the last item in a card
  },
  settingItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
    flex: 1,
  },
  arrowIcon: {
    marginLeft: 'auto',
  },
});

export default ProfileScreen;