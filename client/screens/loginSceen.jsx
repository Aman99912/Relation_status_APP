import { useRef, useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing
} from 'react-native';
import { COLORS } from '../Color';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import FloatingInput from '../components/floatintext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIPATH } from '../utils/apiPath';
import { responsiveWidth, responsiveHeight, responsiveFontSize } from '../utils/responsive';
import Loader from '../components/Loader';
import CustomAlert from '../components/alert';
// import { AuthContext } from '../context/UserContext';  

export default function LoginScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // const { setIsAuthenticated } = useContext(AuthContext); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info');

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
      setAlertTitle('Error');
      setAlertMessage('Please fill in both fields');
      setAlertType('error');
      setShowAlert(true);
      return;
    }
    const newEmail = email.toLowerCase();
    try {
      setLoading(true);
      const body = { email: newEmail, password };
      const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.LOGIN_API}`, body, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.status === 200) {
        const userEmail = res.data?.user?.email;
        const userId = res.data?.user?.id;
        const userToken = res.data?.user?.token;
        if (!userEmail || !userId || !userToken) {
          setAlertTitle('Error');
          setAlertMessage('Incomplete user data received');
          setAlertType('error');
          setShowAlert(true);
          return;
        }
        await AsyncStorage.setItem('userEmail', userEmail);
        await AsyncStorage.setItem('Token', userToken);
        await AsyncStorage.setItem('userId', userId.toString());
        navigation.navigate('MainApp', { screen: 'Home' });
      } else {
        setAlertTitle('Login Failed');
        setAlertMessage(res.data?.message || 'Invalid credentials');
        setAlertType('error');
        setShowAlert(true);
      }
    } catch (err) {
      let errorMessage = 'Something went wrong';
      if (err.response?.data?.message) errorMessage = err.response.data.message;
      else if (err.message) errorMessage = err.message;
      setAlertTitle('Error');
      setAlertMessage(errorMessage);
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>  
      <Loader visible={loading} />
      <Text style={styles.heading}>{`Hey,\nWelcome Back`}</Text>
      <View style={styles.inputBox}>
        <FloatingInput label="Email" value={email} setValue={setEmail} />
        <FloatingInput label="Password" value={password} setValue={setPassword} secure={true} />
      </View>
      <TouchableOpacity onPress={handleforgot} style={styles.forgot}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
        <Text style={styles.loginText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
      <Text style={styles.orText}>or</Text>
      <TouchableOpacity style={styles.bottomText} onPress={() => navigation.navigate('Signup')}>
        <Text>
          Don't have an account? <Text style={styles.signUpLink}>Sign up</Text>
        </Text>
      </TouchableOpacity>
      <CustomAlert
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setShowAlert(false)}
        onConfirm={() => setShowAlert(false)}
        showCancel={false}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: responsiveWidth(6),
    justifyContent: 'center',
  },
  heading: {
    fontSize: responsiveFontSize(3.5),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: responsiveHeight(5),
    textAlign: 'center',
  },
  inputBox: { marginBottom: responsiveHeight(2.5) },
  forgot: { alignSelf: 'flex-end', marginBottom: responsiveHeight(2.5) },
  forgotText: { fontSize: responsiveFontSize(1.7), color: COLORS.gray },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: responsiveHeight(2),
    borderRadius: responsiveWidth(7),
    alignItems: 'center',
    marginBottom: responsiveHeight(2.5),
  },
  loginText: { color: '#fff', fontSize: responsiveFontSize(2), fontWeight: '500' },
  orText: { textAlign: 'center', color: COLORS.gray, marginBottom: responsiveHeight(1.5) },
  bottomText: { alignSelf: 'center' },
  signUpLink: { fontWeight: 'bold', color: COLORS.primary },
});
