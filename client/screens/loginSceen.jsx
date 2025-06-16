


import { useRef, useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, Alert
} from 'react-native';
import { COLORS } from '../Color';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import FloatingInput from '../components/floatintext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIPATH } from '../utils/apiPath';
// import { AuthContext } from '../context/UserContext';  

export default function LoginScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // const { setIsAuthenticated } = useContext(AuthContext); 

  const [email, setEmail] = useState('');
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

  const handleforgot = async () => {
    navigation.navigate('forgot-password');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }

    const newEmail = email.toLowerCase();

    try {
      setLoading(true);

      const body = {
        email: newEmail,
        password
      };

      const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.LOGIN_API}`, body, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('Response:--------', res.data);
      
  
  // if (res.status === 200) {
//       const userEmail = res.data?.user?.email;
//       const userId = res.data?.user?.id;
//       const userToken = res.data?.user?.token;

//       if (!userEmail || !userId || !userToken) {
//         Alert.alert('Error', 'Incomplete user data received');
//         return;
//       }

      
//       // navigation.navigate('OtpScreen', {
//       //   email: userEmail,
//       //   token: userToken,
//       //   id: userId,
//       //   onVerified: async () => {
        
//         await AsyncStorage.setItem('userEmail', userEmail);
//         await AsyncStorage.setItem('Token', userToken);
//         await AsyncStorage.setItem('userId', userId.toString());
//       navigation.navigate('MainApp', { screen: 'Home' });
//         //     navigation.navigate('MainApp', { screen: 'Home' });
//           // }
//         // });

      if (res.status === 200) {
        const userEmail = res.data?.user?.email;
        const userId = res.data?.user?.id;
        const userToken = res.data?.user?.token;

        if (!userEmail || !userId || !userToken) {
          Alert.alert('Error', 'Incomplete user data received');
          return;
        }

        await AsyncStorage.setItem('userEmail', userEmail);
        await AsyncStorage.setItem('Token', userToken);
        await AsyncStorage.setItem('userId', userId.toString());

        // setIsAuthenticated(true);

       navigation.navigate('MainApp', { screen: 'Home' });
      } else {
        Alert.alert('Login Failed', res.data?.message || 'Invalid credentials');
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Something went wrong';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* <TouchableOpacity style={{ position: 'absolute', top: 50, left: 20 }} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity> */}

      <Text style={styles.heading}>Hey,{"\n"}Welcome Back</Text>

      <View style={styles.inputBox}>
        <FloatingInput label="Email" value={email} setValue={setEmail} />
        <FloatingInput label="Password" value={password} setValue={setPassword} secure={true} />
      </View>

      <TouchableOpacity onPress={handleforgot} style={styles.forgot}>
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
