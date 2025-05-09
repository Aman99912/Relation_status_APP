// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
// import axios from 'axios';
// import { useNavigation } from '@react-navigation/native';
// import { COLORS } from '../Color';
// import FloatingInput from './floatintext';

// export default function OtpScreen({ route }) {
//   const { email } = route.params;  // Retrieve email passed from previous screen
//   const navigation = useNavigation();
//   const [otp, setOtp] = useState('');
//   const [loading, setLoading] = useState(false);

//   // useEffect(() => {
//   //   const sendOtp = async () => {
//   //     try {
//   //       await axios.post('http://192.168.65.121:8000/api/user/send-otp', { email });
//   //     } catch (error) {
//   //       console.error('Error sending OTP:', error);
//   //     }
//   //   };
//   //   sendOtp();
//   // }, [email]);
  
//   useEffect(() => {
//     let hasSent = false;
  
//     const sendOtp = async () => {
//       if (hasSent) return;
//       hasSent = true;
  
//       try {
//         await axios.post('http://192.168.65.121:8000/api/user/send-otp', { email });
//       } catch (error) {
//         console.error('Error sending OTP:', error);
//       }
//     };
  
//     sendOtp();
//   }, []);
  
//   const handleVerifyOtp = async () => {
//     if (!otp) {
//       Alert.alert('Error', 'Please enter OTP');
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await axios.post('http://192.168.65.121:8000/api/user/verify-otp', { email, otp });
      
//       if (res.status === 200) {
//         // Alert.alert('Success', 'OTP Verified!');
//         navigation.navigate('Home'); // Or redirect to the next screen
//       }
//     } catch (err) {
//       Alert.alert('Error', err.response?.data?.message || 'Invalid OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Enter OTP</Text>
//       <View style={styles.inputBox}>
//              <FloatingInput label="Enter Otp" value={otp} setValue={setOtp} /> 
//              </View>
      
//       <TouchableOpacity onPress={handleVerifyOtp} style={styles.button}>
//         <Text style={styles.buttonText}>
//           {loading ? 'Verifying...' : 'Verify OTP'}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 20,
//     backgroundColor: '#f7f7f7',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   input: {
//     height: 50,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 10,
//     marginBottom: 20,
//     paddingHorizontal: 15,
//     fontSize: 16,
//   },
//   button: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 15,
//     borderRadius: 25,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//   },
// });
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../Color';
import FloatingInput from './floatintext';

export default function OtpScreen({ route }) {
  const { email } = route.params;
  const navigation = useNavigation();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const hasSentOtp = useRef(false); // 👈 tracks if OTP is already sent

  useEffect(() => {
    const sendOtp = async () => {
      if (hasSentOtp.current) return; // 👈 Prevent duplicate
      hasSentOtp.current = true;

      try {
        await axios.post('http://192.168.65.121:8000/api/user/send-otp', { email });
      } catch (error) {
        console.error('Error sending OTP:', error);
      }
    };

    sendOtp();
  }, []); // ✅ empty array ensures it runs only once

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://192.168.65.121:8000/api/user/verify-otp', {
        email,
        otp,
      });

      if (res.status === 200) {
        navigation.navigate('MainApp');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <View style={styles.inputBox}>
        <FloatingInput label="Enter OTP" value={otp} setValue={setOtp} />
      </View>

      <TouchableOpacity onPress={handleVerifyOtp} style={styles.button}>
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f7f7f7' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputBox: { marginBottom: 20 },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 16 },
});
