import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; 
import { COLORS } from '../Color'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const PrivacyPage = () => {
  const navigation = useNavigation();

  const handlePassword = () => {
    
    navigation.navigate('MainApp', { screen: 'ChangePasswordScreen' }); 
  };

  const handleSubpassword = () => {
 
    navigation.navigate('MainApp', { screen: 'ChangeSubPasswordScreen' }); 
  };

  const handleEmail = async () => {
    
    
  
    const email = await AsyncStorage.getItem('userEmail');
  
    
    navigation.navigate('OtpScreen', {
      email,
      onVerified: async () => {
        navigation.navigate('MainApp', { screen: 'UpdateEmailScreen' });
      },
    }); 
  };
  
  const handleMobile = async() => {
    const email = await AsyncStorage.getItem('userEmail');
    
    
    navigation.navigate('OtpScreen', {
      email,
      onVerified: async () => {
        navigation.navigate('MainApp', { screen: 'UpdateMobileNum' });
      },
    }); 
  
  };

  return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.safeAreaBg }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={26} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Settings</Text>
        </View>

        {/* Account Security Section */}
        <Text style={styles.sectionTitle}>Account Security</Text>
        <View style={styles.settingCard}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handlePassword}
          >
            <Ionicons name="key-outline" size={24} color={COLORS.primary} />
            <Text style={styles.settingItemText}>Change Password</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#bbb" style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, styles.lastSettingItem]}
            onPress={handleSubpassword}
          >
            <Ionicons name="lock-closed-outline" size={24} color={COLORS.primary} />
            <Text style={styles.settingItemText}>Set/Update Sub-Password</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#bbb" style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>

        {/* Contact Information Section */}
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.settingCard}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleEmail}
          >
            <Ionicons name="mail-outline" size={24} color={COLORS.primary} />
            <Text style={styles.settingItemText}>Update Email</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#bbb" style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, styles.lastSettingItem]}
            onPress={handleMobile}
          >
            <Ionicons name="call-outline" size={24} color={COLORS.primary} />
            <Text style={styles.settingItemText}>Update Mobile Number</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#bbb" style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>

        {/* Additional Privacy Options (Placeholder) */}
        <Text style={styles.sectionTitle}>More Privacy Options</Text>
        <View style={styles.settingCard}>
          <TouchableOpacity
            style={[styles.settingItem, styles.lastSettingItem]}
            onPress={() => Alert.alert('Feature Coming Soon', 'Manage your data privacy settings here.')}
          >
            <Ionicons name="eye-off-outline" size={24} color={COLORS.primary} />
            <Text style={styles.settingItemText}>Data Privacy Settings</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#bbb" style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: COLORS.lightBorderColor,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    padding: 5,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: 25,
    marginTop: 30,
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
            borderBottomColor: COLORS.lightGrayBg,
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1, // Ensures text takes available space
  },
  arrowIcon: {
    marginLeft: 'auto', // Pushes icon to the right
  },
});

export default PrivacyPage;