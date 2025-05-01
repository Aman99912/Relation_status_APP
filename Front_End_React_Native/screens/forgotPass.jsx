import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const ForgotPasswordPage = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);



  const baseUrl = 'http://192.168.206.121:8000/api/user'; // ✅ Replace with your backend URL

  const handleSendOtp = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email');
    setLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/send-otp`, { email });
      Alert.alert('Success', res.data.message || 'OTP sent to your email');
      setStep(2);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };
//   const handleVerifyOtp = async () => {
//     if (otp.length !== 6) return Alert.alert('Error', 'Enter a valid 6-digit OTP');
//     try {
//       const response = await axios.post('http://192.168.206.121:8000/api/user/verify-otp', {
//         email,
//         otp,
//       });
  
//       if (response.status === 200) {
//         Alert.alert('Success', 'OTP verified successfully');
        
//       }
//     } catch (error) {
//       console.error('Verification Error:', error.message);
//       const errorMessage = error.response ? error.response.data.message : 'Unable to connect to server';
//       Alert.alert('Error', errorMessage);
//     }
//   };
  
const handleVerifyOtp = async () => {
    if (otp.length !== 6) return Alert.alert('Error', 'Enter a valid 6-digit OTP');
    setLoading(true);
    try {
      const response = await axios.post('http://192.168.206.121:8000/api/user/verify-otp', {
        email,
        otp,
      });
  
      if (response.status === 200) {
        Alert.alert('Success', 'OTP verified successfully');
        setStep(3); // Change step to 3 to move to the password reset screen
      }
    } catch (error) {
      console.error('Verification Error:', error.message);
      const errorMessage = error.response ? error.response.data.message : 'Unable to connect to server';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) return Alert.alert('Error', 'Please fill all fields');
    if (newPassword !== confirmPassword) return Alert.alert('Error', 'Passwords do not match');

    setLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });
      Alert.alert('Success', res.data.message || 'Password reset successfully');
      navigation.navigate('Login'); // Optional: redirect to Login
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const renderButton = (label, onPress) => (
    <TouchableOpacity onPress={onPress} disabled={loading} style={{ width: '100%', alignItems: 'center' }}>
      <LinearGradient colors={['#F97794', '#623AA2']} style={styles.button}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{label}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topimgContainer}>
        <Image source={require('../assets/topLogin.png')} style={styles.topimg} />
      </View>
      <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.heading}>Forgot Password</Text>

      {step === 1 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
          />
          {renderButton('Send OTP', handleSendOtp)}
        </>
      )}

      {step === 2 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            keyboardType="numeric"
            maxLength={6}
            onChangeText={setOtp}
            value={otp}
          />
          {renderButton('Verify OTP', handleVerifyOtp)}
        </>
      )}

      {step === 3 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
            onChangeText={setNewPassword}
            value={newPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            onChangeText={setConfirmPassword}
            value={confirmPassword}
          />
          {renderButton('Reset Password', handleResetPassword)}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topimgContainer: {
    height: 70,
  },
  topimg: {
    width: '100%',
    height: 160,
  },

  container: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },

  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 250,
    marginBlock: 40,
    textAlign: 'center',
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 26,
    margin: 'auto',
    fontSize: 16,
    width: '70%',
    alignItems: 'center',
  },
  button: {
    width: '70%',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
  },
  backIcon: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
});

export default ForgotPasswordPage;
