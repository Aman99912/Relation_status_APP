
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { APIPATH } from '../utils/apiPath';
import FloatingInput from './floatintext';
import { COLORS } from '../Color';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BackButton from './backbtn';

export default function OtpScreen({ route }) {
  const navigation = useNavigation();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [hasSentOnce, setHasSentOnce] = useState(false);
  const email = route.params?.email;

  useEffect(() => {
    if (!hasSentOnce && email) {
      sendOtp(); 
    }
  }, [email]);

  const sendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Email not found');
      return;
    }

    try {
      setResending(true);
      const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SEND_API}`, { email });
      console.log('OTP sent:', res.data.message);
      setHasSentOnce(true);
      Alert.alert('OTP Sent', 'A new OTP has been sent to your email');
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.VERIFY_API}`, {
        email,
        otp,
      });

      if (res.status === 200) {
        navigation.navigate('MainApp', { screen: 'Home' });
      }
    } catch (err) {
      console.log('OTP verification error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton  navigation={navigation}/>

      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subTitle}>Sent to: {email}</Text>

      <View style={styles.inputBox}>
        <FloatingInput label="Enter OTP" value={otp} setValue={setOtp} keyboardType="numeric" />
      </View>

      <TouchableOpacity onPress={handleVerifyOtp} style={styles.button} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify OTP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={sendOtp} style={styles.resendBtn} disabled={resending}>
        <Text style={styles.resendText}>
          {resending ? 'Resending OTP...' : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  inputBox: {
    marginBottom: 20,
  },
  
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  resendBtn: {
    alignItems: 'center',
  },
  resendText: {
    color: '#007bff',
    fontSize: 14,
  },
});
