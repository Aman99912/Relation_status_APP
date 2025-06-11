import { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, Alert
} from 'react-native';
import { COLORS } from '../Color.js';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import FloatingInput from './floatintext.jsx';
import { APIPATH } from '../utils/apiPath.jsx';

export default function ForgotPass() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, []);

 const handleSendLink = async () => {
  if (!email) {
    Alert.alert('Error', 'Please enter your email');
    return;
  }

  try {
    setLoading(true);
    const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.PF_API}`, 
      { email },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    console.log('OTP response:', res.data); 
    
    Alert.alert('Success', 'OTP sent to your email');
    setShowOtp(true); 
  } catch (err) {
    console.log('Error 2:', `${APIPATH.BASE_URL}/${APIPATH.PF_API}`);
    console.log('Error:', err);
    const errorMessage = err?.response?.data?.message || 'Something went wrong';
    Alert.alert('Error', errorMessage);
  } finally {
    setLoading(false);
  }
};


  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${APIPATH.BASE_URL}/${APIPATH.VERIFY_OTP_PASS}`, // Changed to specific verify OTP endpoint
        { email, otp },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (res.status === 200 && res.data?.success) {
        // Navigate to New Password screen with email
        navigation.navigate('newPass', { email });
      } else {
        Alert.alert('Invalid OTP', res.data?.message || 'OTP verification failed');
      }
    } catch (err) {
      // console.log('Error:', err);
      const errorMessage = err?.response?.data?.message || 'Something went wrong';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      <View style={styles.inputBox}>
        <FloatingInput label={"Email "} value={email} setValue={setEmail} />
        {showOtp && (
          <FloatingInput label="Enter OTP" value={otp} setValue={setOtp} numeric='true'/>
        )}
      </View>

      {!showOtp ? (
        <TouchableOpacity style={styles.loginBtn} onPress={handleSendLink} disabled={loading}>
          <Text style={styles.loginText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.loginBtn} onPress={handleVerifyOtp}>
          <Text style={styles.loginText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20 },
  inputBox: { marginBottom: 20 },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});
