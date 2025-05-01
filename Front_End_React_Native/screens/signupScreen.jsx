import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './loginSignupStyle';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const RegisterScreen = () => {
  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const RegisterLink = () => {
    navigation.navigate('login');
  };

  const handleRegister = async () => {
    if (!username || !email || !mobile || !password) {
      Alert.alert('All fields are required!');
      return;
    }

    try {
      const response = await axios.post('http://192.168.206.121:8000/api/user/send-otp', { email });

      if (response.status === 200) {
        Alert.alert('OTP sent to your email');

        setShowOtpInput(true);
      } else {
        Alert.alert('Error sending OTP');
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      Alert.alert('Error', 'Could not send OTP. Try again.');
    }
  };

  const verifyOtpAndRegister = async () => {
    if (!otp) {
      Alert.alert('Please enter the OTP sent to your email.');
      return;
    }

    try {
      const verifyRes = await axios.post('http://192.168.206.121:8000/api/user/verify-otp', {
        email,
        otp,
      });

      if (verifyRes.status === 200) {
        // OTP is correct, now register the user
        const finalRes = await axios.post('http://192.168.206.121:8000/api/user/finalize-register', {
          username,
          email,
          mobile,
          password,
        });

        if (finalRes.status === 200) {
          Alert.alert('Registration successful!');
          navigation.navigate('home');
        } else {
          Alert.alert('Registration failed', finalRes.data.message || 'Try again.');
        }
      } else {
        Alert.alert('Invalid OTP');
      }
    } catch (err) {
      console.error('Verification Error:', err);
      Alert.alert('Verification failed', 'Please check OTP or try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.topimgContainer}>
            <Image source={require('../assets/topLogin.png')} style={styles.topimg} />
          </View>

          <View style={styles.Hello_Text_Area}>
            <Text style={styles.Hello_Text}>Register</Text>
          </View>

          <View style={styles.login_under_text_area}>
            <Text style={styles.login_under_text}>Register here to Enroll!</Text>
          </View>

          {/* Username */}
          <View style={styles.input_Container}>
            <Image source={require('../assets/favicon.png')} style={styles.inputIcon} />
            <TextInput placeholder="Username" style={styles.InputText} value={username} onChangeText={setUsername} />
          </View>

          {/* Email */}
          <View style={styles.input_Container}>
            <Image source={require('../assets/favicon.png')} style={styles.inputIcon} />
            <TextInput
              placeholder="Email"
              style={styles.InputText}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Mobile */}
          <View style={styles.input_Container}>
            <Image source={require('../assets/favicon.png')} style={styles.inputIcon} />
            <TextInput
              placeholder="Mobile No."
              style={styles.InputText}
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
            />
          </View>

          {/* Password */}
          <View style={styles.input_Container}>
            <Image source={require('../assets/favicon.png')} style={styles.inputIcon} />
            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.InputText}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Register or OTP Button */}
          {!showOtpInput && (
            <View style={styles.signInContainer}>
              <TouchableOpacity onPress={handleRegister} style={{ width: '100%', alignItems: 'center' }}>
                <LinearGradient colors={['#F97794', '#623AA2']} style={styles.Signcontainer}>
                  <Text style={styles.signIn}>Send OTP</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* OTP Input */}
          {showOtpInput && (
            <>
              <View style={styles.input_Container}>
                <Image source={require('../assets/favicon.png')} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter OTP"
                  style={styles.InputText}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.signInContainer}>
                <TouchableOpacity onPress={verifyOtpAndRegister} style={{ width: '100%', alignItems: 'center' }}>
                  <LinearGradient colors={['#F97794', '#623AA2']} style={styles.Signcontainer}>
                    <Text style={styles.signIn}>Verify OTP & Register</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Navigate to Login */}
          <TouchableOpacity onPress={RegisterLink} style={styles.signup_btn}>
            <Text>
              Already have an account? <Text style={styles.signup_text}>Login</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
