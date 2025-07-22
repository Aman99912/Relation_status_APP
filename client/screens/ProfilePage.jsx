
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
import { LinearGradient } from 'expo-linear-gradient';


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
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
       
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { fontWeight: '700', color: '#444', letterSpacing: 0.2 }]}>My Profile</Text>
        </View>

        <LinearGradient
          colors={['#f8e1f4', '#e0e7ff', '#f7f7fa']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 25,
            padding: 24,
            marginHorizontal: 20,
            marginBottom: 10,
            marginTop: 10,
            shadowColor: COLORS.cardShadow,
            shadowOpacity: 0.08,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: 6,
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Accent dot */}
          <View style={{ position: 'absolute', top: 18, left: 22, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.accent, opacity: 0.7, zIndex: 3, borderWidth: 2, borderColor: '#fff' }} />
          {/* Avatar with premium ring */}
          <View style={{
            shadowColor: COLORS.accent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 8,
            elevation: 6,
            borderRadius: 70,
            backgroundColor: '#fff',
            padding: 5,
            borderWidth: 2,
            borderColor: COLORS.accent,
            marginBottom: 18,
          }}>
            <Image
              source={user?.avatar ? { uri: user.avatar } : require('../assets/avatar.png')}
              style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: COLORS.white }}
            />
          </View>
          <Text style={{ fontSize: 26, fontWeight: '700', color: COLORS.text, marginBottom: 4, letterSpacing: 0.2 }}>{user?.fullname || 'Guest User'}</Text>
          <Text style={{ fontSize: 16, color: COLORS.gray, marginBottom: 16 }}>@{user?.username || 'unknown'}</Text>
          <TouchableOpacity
            style={{ backgroundColor: COLORS.primary, borderRadius: 22, paddingVertical: 10, paddingHorizontal: 32, marginTop: 5, shadowColor: COLORS.primary, shadowOpacity: 0.10, shadowRadius: 8, elevation: 2 }}
            onPress={() => navigation.navigate('MainApp', { screen: 'chatPF' })}
            activeOpacity={0.85}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Settings Sections */}
        <Text style={[styles.settingsSectionTitle, { fontWeight: '500', color: '#888', fontSize: 16 }]}>Account</Text>
        <LinearGradient
          colors={['#f8e1f4', '#e0e7ff', '#f7f7fa']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.settingCard, { borderWidth: 1.5, borderColor: '#e75480', shadowColor: '#e75480', shadowOpacity: 0.08, shadowRadius: 10, elevation: 6 }]}
        >
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
        </LinearGradient>

        <Text style={[styles.settingsSectionTitle, { fontWeight: '500', color: '#888', fontSize: 16 }]}>General</Text>
        <LinearGradient
          colors={['#f8e1f4', '#e0e7ff', '#f7f7fa']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.settingCard, { borderWidth: 1.5, borderColor: '#e75480', shadowColor: '#e75480', shadowOpacity: 0.08, shadowRadius: 10, elevation: 6 }]}
        >
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
        </LinearGradient>

       
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
    color: COLORS.gray,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: COLORS.cardBg,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.inputBorder,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
  },

  profileCard: {
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 25,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
    shadowColor: COLORS.cardShadow,
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
    borderColor: COLORS.gradientEnd,
    marginBottom: 20,
  },
  profileName: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  profileUsername: {
    fontSize: 19,
    color: COLORS.gray,
    marginBottom: 20,
  },
  viewProfileButton: {
    backgroundColor: COLORS.background,
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
    color: COLORS.gray,
    marginHorizontal: 25,
    marginTop: 25,
    marginBottom: 10,
  },
  settingCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    marginHorizontal: 20,
    paddingVertical: 5,
    marginBottom: 20,
    shadowColor: COLORS.cardShadow,
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
    borderBottomColor: COLORS.inputBorder,
  },
  lastSettingItem: {
    borderBottomWidth: 0, // No border for the last item in a card
  },
  settingItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  arrowIcon: {
    marginLeft: 'auto',
  },
});

export default ProfileScreen;