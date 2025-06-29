import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { COLORS } from '../Color';
import { APIPATH } from '../utils/apiPath';
import FloatingInput from './floatintext';

export default function UpdateEmailScreen() {
  const navigation = useNavigation();
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      return Alert.alert('Validation Error', 'Please enter your new email address.');
    }
    if (!isValidEmail(newEmail)) {
      return Alert.alert('Validation Error', 'Please enter a valid email address.');
    }

   
    navigation.navigate('OtpScreen', {
      email: newEmail, 
      onVerified: async () => {
        UpdateEmail(newEmail); 
      },
    });
  };

  const UpdateEmail = async (emailToUpdate) => { 
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const Token = await AsyncStorage.getItem('Token');
      
      if (!userId || !Token) {
        Alert.alert('Authentication Error', 'User not authenticated. Please log in again.');
        navigation.navigate('Login');
        return;
      }

      const updateResponse = await axios.put(`${APIPATH.BASE_URL}/${APIPATH.UPDATE_USER_API}/${userId}`, {
        email: emailToUpdate,
      }, {
        headers: {
          Authorization: `${Token}`, 
        },
      });

      if (updateResponse.data.success) {
        Alert.alert('Success', updateResponse.data.message || 'Email updated successfully!');
        await AsyncStorage.setItem('userEmail', emailToUpdate); 
        navigation.goBack(); 
      } else {
        Alert.alert('Update Failed', updateResponse.data.message || 'Failed to update email.');
      }
    } catch (error) {
      console.error("Email update error:", error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'An error occurred during email update. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={26} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Update Email</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.instructionText}>
            Enter your new email address to update.
          </Text>

          <FloatingInput
            label="New Email Address"
            value={newEmail}
            setValue={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>Update Email</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  updateButton: {
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
  updateButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});