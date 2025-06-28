import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { COLORS } from '../Color'; // Assuming COLORS is defined
import { APIPATH } from '../utils/apiPath'; // Assuming APIPATH is defined
import FloatingInput from './floatintext';

const ChangePasswordScreen = () => {

    
  const navigation = useNavigation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Validation Error', 'All fields are required.');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Validation Error', 'New password and confirm password do not match.');
    }
    if (newPassword.length < 6) { 
      return Alert.alert('Validation Error', 'New password must be at least 6 characters long.');
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const Token = await AsyncStorage.getItem('Token');

      if (!userId || !Token) {
        Alert.alert('Authentication Error', 'User not authenticated. Please log in again.');
        navigation.navigate('Login'); 
        return;
      }
    console.log(`${APIPATH.BASE_URL}/${APIPATH.CHANGE_PASS}`);
    console.log(userId ,oldPassword , newPassword);
   
    
      const response = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.CHANGE_PASS}`, {
        userId,
        oldPassword,
        newPassword,
      }, {
        headers: {
          Authorization: `${Token}`,
          
        },
      });

      if (response.data.success) {
        Alert.alert('Success', 'Password changed successfully!');
        
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        navigation.goBack();
      } else {
        Alert.alert('Change Failed', response.data.message || 'Unable to change password. Please try again.');
      }
    } catch (error) {
      console.error("Password change error:", error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'An error occurred while changing password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async() => {
      const email = await AsyncStorage.getItem('userEmail');
        navigation.navigate('OtpScreen', {
         email,
         onVerified: async () => {
         navigation.navigate('newPass',{ email });
      },
    });

   
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
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
            disabled={loading} // Disable back button while loading
          >
            <Ionicons name="arrow-back" size={26} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
        </View>

        {/* Password Change Form */}
        <View style={styles.formContainer}>
          <Text style={styles.instructionText}>Enter your old and new passwords to update.</Text>


            <FloatingInput label="Old Password" value={oldPassword} setValue={setOldPassword} />
            <FloatingInput label="New Password" value={newPassword} setValue={setNewPassword} />
            <FloatingInput label="Cofirm Password" value={confirmPassword} setValue={setConfirmPassword} />
          
         

          <TouchableOpacity
            style={styles.changePasswordButton}
            onPress={handleChangePassword}
            disabled={loading} 
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.changePasswordButtonText}>Change Password</Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotPasswordLink}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
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
    borderBottomColor: '#ebebeb',
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
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 30,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  instructionText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 18,
    color: '#333',
    backgroundColor: '#f9f9f9', // Light background for inputs
  },
  changePasswordButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  changePasswordButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  forgotPasswordLink: {
    marginTop: 20,
    alignSelf: 'center',
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default ChangePasswordScreen;