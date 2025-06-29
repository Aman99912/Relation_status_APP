import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { APIPATH } from '../utils/apiPath';
import FloatingInput from './floatintext';
import { COLORS } from '../Color';
import BackButton from './backbtn';

export default function OtpScreen({ route }) {
  const navigation = useNavigation();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpTimer, setOtpTimer] = useState(300); // OTP valid for 5 min
  const [resendBlockTimer, setResendBlockTimer] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const email = route.params?.email;

  useEffect(() => {
    sendOtp();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (otpTimer > 0) setOtpTimer(prev => prev - 1);
      if (resendBlockTimer > 0) setResendBlockTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer, resendBlockTimer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const sendOtp = async () => {
    if (resendCount >= 4) {
      setResendBlockTimer(60); 
      return;
    }
    try {
      setResending(true);
      await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SEND_API}`, { email });
      setOtpTimer(300); 
      setResendCount(prev => prev + 1);
      // Alert.alert('OTP Sent', 'A new OTP has been sent to your email');
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return Alert.alert('Error', 'Please enter OTP');

    setLoading(true);
    try {
      const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.VERIFY_API}`, {
        email,
        otp,
      });
      Alert.alert('Success', 'OTP Verified');
      navigation.goBack();
      route.params?.onVerified && route.params.onVerified();
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton navigation={navigation} />
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subTitle}>Sent to: {email}</Text>

      <FloatingInput
        label={`Enter OTP (expires in ${formatTime(otpTimer)})`}
        value={otp}
        setValue={setOtp}
        keyboardType="numeric"
      />

      <TouchableOpacity
        onPress={handleVerifyOtp}
        style={[styles.button, (otpTimer === 0 || loading) && styles.disabled]}
        disabled={otpTimer === 0 || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={sendOtp}
        style={[styles.resendBtn, (resendBlockTimer > 0 || resending) && styles.disabled]}
        disabled={resendBlockTimer > 0 || resending}
      >
        <Text style={styles.resendText}>
          {resendBlockTimer > 0
            ? `Resend in ${formatTime(resendBlockTimer)}`
            : resending
            ? 'Resending...'
            : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  resendBtn: {
    alignItems: 'center',
  },
  resendText: {
    color: '#007bff',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
});