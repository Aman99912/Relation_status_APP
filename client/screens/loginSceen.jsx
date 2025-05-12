import { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, Alert
} from 'react-native';
import { COLORS } from '../Color';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import FloatingInput from './floatintext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIPATH } from '../utils/apiPath';

export default function LoginScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [login, setLogin] = useState('');
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
const handleforgot = async ()=>{
  navigation.navigate('forgot-password')
}

  const handleLogin = async () => {
    console.log("login button clicked");
    
  if (!login || !password) {
    Alert.alert('Error', 'Please fill in both fields');
    return;
  }

  try {
    setLoading(true);  
    console.log('Sending login request...', login, password);
    console.log(APIPATH.LOGIN_API);
    const body = {
      login,
      password
    }

    const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.LOGIN_API}`,body,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('Response:--------', res.data);

    if (res.data?.token) {
      const userEmail = res.data?.user?.email;
      await AsyncStorage.setItem('userEmail', userEmail);
      // navigation.navigate('OtpScreen', { email :userEmail });
     navigation.navigate('MainApp', { screen: 'Home' });
    } else {
      Alert.alert('Login Failed', res.data?.message || 'Invalid credentials');
    }
  } catch (err) {
    console.log(err);
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

      <Text style={styles.heading}>Hey,{"\n"}Welcome Back</Text>

      <View style={styles.inputBox}>
        <FloatingInput label="Email, Mobile, or Username" value={login} setValue={setLogin} />
        <FloatingInput label="Password" value={password} setValue={setPassword} secure />
      </View>

      <TouchableOpacity  onPress={handleforgot} style={styles.forgot}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>or</Text>

      <TouchableOpacity style={styles.bottomText} onPress={() => navigation.navigate('Signup')}>
        <Text>
          Don't have an account? <Text style={styles.signUpLink}>Sign up</Text>
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
  bottomText: { alignSelf: 'center' },
  signUpLink: { fontWeight: 'bold', color: COLORS.primary },
});
