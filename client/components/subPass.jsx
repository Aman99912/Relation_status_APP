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

const ChangeSubPasswordScreen = () => {
  const navigation = useNavigation();
  const [currentSubPassword, setCurrentSubPassword] = useState('');
  const [newSubPassword, setNewSubPassword] = useState('');
  const [confirmSubPassword, setConfirmSubPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChangeSubPassword = async () => {
    if (!newSubPassword || !confirmSubPassword) {
      return Alert.alert('Validation Error', 'All fields are required.');
    }
    if (newSubPassword !== confirmSubPassword) {
      return Alert.alert('Validation Error', 'Codes do not match.');
    }
    if (newSubPassword.length !== 4) {
      return Alert.alert('Validation Error', 'Code must be exactly 4 digits.');
    }

    setLoading(true); 
    try {
      const userId = await AsyncStorage.getItem('userId');
      const Token = await AsyncStorage.getItem('Token');

      if (!userId || !Token) {
        Alert.alert('Auth Error', 'Please log in again.');
        navigation.navigate('Login');
        return;
      }

      const response = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.CHANGE_SUB_PASS}`, {
        userId,
        currentSubPassword,
        newSubPassword,
      }, {
        headers: {
          Authorization: `${Token}`,
        },
      });

      if (response.data.success) {
        Alert.alert('Success', response.data.message);
        setCurrentSubPassword('');
        setNewSubPassword('');
        setConfirmSubPassword('');
        navigation.goBack();
      } else {
        Alert.alert('Failed', response.data.message);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewCode = async () => {
    setSending(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const Token = await AsyncStorage.getItem('Token');

      if (!userId || !Token) {
        Alert.alert('Auth Error', 'Please log in again.');
        navigation.navigate('Login');
        return;
      }

      const response = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.GEN_SUB_PASS}`, {
        userId,
      }, {
        headers: {
          Authorization: `${Token}`,
        },
      });

      if (response.data.success) {
        Alert.alert('Code Sent', 'A new code has been sent to your email.');
      } else {
        Alert.alert('Failed', response.data.message);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Could not send code.');
    } finally {
      setSending(false);
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
          <Text style={styles.headerTitle}>Set/Change Sub-Password</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.instructionText}>
            You can set a new 4-digit code. If already set, enter your current one.
          </Text>

          <FloatingInput
            label="Current Code"
            value={currentSubPassword}
            setValue={setCurrentSubPassword}
            secureTextEntry={true}
            keyboardType="numeric"
          />
          <FloatingInput
            label="New Code"
            value={newSubPassword}
            setValue={setNewSubPassword}
            secureTextEntry={true}
            keyboardType="numeric"
          />
          <FloatingInput
            label="Confirm New Code"
            value={confirmSubPassword}
            setValue={setConfirmSubPassword}
            secureTextEntry={true}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={styles.changePasswordButton}
            onPress={handleChangeSubPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.changePasswordButtonText}>Update Code</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={handleGenerateNewCode}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.forgotText}>Create New Code</Text>
            )}
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
    elevation: 8,
  },
  instructionText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  changePasswordButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    elevation: 6,
  },
  changePasswordButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  forgotButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ChangeSubPasswordScreen;
