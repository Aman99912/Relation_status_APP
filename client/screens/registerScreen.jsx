import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { COLORS } from '../Color';
import { useNavigation } from '@react-navigation/native';
import FloatingInput from './floatintext';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [name, setname] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [mobile, setmobile] = React.useState('');
  const [password, setPassword] = React.useState('');

// Add at the top
const BACKEND_URL = 'http://192.168.65.121:8000/api/user/finalize-register'; // replace with your actual backend URL

const handleSignup = async () => {
  if (!name || !email || !mobile || !password) {
    alert('Please fill all fields');
    return;
  }

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        mobile,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Signup successful!');
      navigation.navigate('Login');
    } else {
      alert(data.message || 'Signup failed');
    }
  } catch (error) {
    console.error('Signup error:', error);
    alert(`An error occure ${error}`);
  }
};



  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      <Text style={styles.heading}>Let's get{'\n'}started</Text>

      <View style={styles.inputBox}>
        <FloatingInput label="Full Name" value={name} setValue={setname} />
        <FloatingInput label="Email" value={email} setValue={setEmail}  />
        <FloatingInput label="mobile Number" value={mobile} setValue={setmobile}  />
        <FloatingInput label="Password" value={password} setValue={setPassword} secure />
      </View>

    <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
  <Text style={styles.signupText}>Sign up</Text>
</TouchableOpacity>

      <Text style={styles.orText}>or continue with</Text>

      <TouchableOpacity style={styles.googleBtn}>
        <Text style={styles.googleText}>🔍 Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.bottomText} onPress={() => navigation.navigate('Login')}>
        <Text>
          Already have an account? <Text style={styles.loginLink}>Login</Text>
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  backText: {
    fontSize: 22,
    color: COLORS.primary,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 40,
  },
  inputBox: {
    marginBottom: 25,
    borderColor: COLORS.inputBorder,
    position: 'relative',
  },
  signupBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  orText: {
    textAlign: 'center',
    color: COLORS.gray,
    marginBottom: 10,
  },
  googleBtn: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  googleText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  bottomText: {
    alignSelf: 'center',
  },
  loginLink: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
