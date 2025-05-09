
import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, Alert
} from 'react-native';
import { COLORS } from '../Color';

import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import FloatingInput from './floatintext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [login, setLogin] = useState('');  // Can be email, mobile, or username
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, []);
  const handleLogin = async () => {
    if (!login || !password) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }
  
    try {
      setLoading(true);
      const res = await axios.post(`http://192.168.65.121:8000/api/user/login`, {
        login,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      if (res.data?.token) {
       
        navigation.navigate('OtpScreen', { email: res.data?.user?.email });  // Only navigate
      } else {
        Alert.alert('Login Failed', res.data?.message || 'Invalid credentials');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      <Text style={styles.heading}>Hey,{"\n"}Welcome Back</Text>

      <View style={styles.inputBox}>
        <FloatingInput label="Email, Mobile, or Username" value={login} setValue={setLogin} />
        <FloatingInput label="Password" value={password} setValue={setPassword} secure />
      </View>

      <TouchableOpacity style={styles.forgot}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>or continue with</Text>

      <TouchableOpacity style={styles.googleBtn}>
        <Text style={styles.googleText}><FontAwesome name='google' size={18} /> Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.bottomText} onPress={() => navigation.navigate('Signup')}>
        <Text>
          Don't have an account?{' '}
          <Text style={styles.signUpLink}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20 },
  heading: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 40 },
  inputBox: { marginBottom: 20 },
  forgot: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 14, color: COLORS.gray },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  orText: { textAlign: 'center', color: COLORS.gray, marginBottom: 10 },
  googleBtn: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  googleText: { fontSize: 16, color: COLORS.primary },
  bottomText: { alignSelf: 'center' },
  signUpLink: { fontWeight: 'bold', color: COLORS.primary },
});
