// import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
// import React, { useState, useEffect } from 'react';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import FloatingInput from './floatintext';
// import { COLORS } from '../Color';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { APIPATH } from '../utils/apiPath';
// import BackButton from '../components/backbtn.jsx'
// import { useNavigation } from '@react-navigation/native';
// export default function HomeScreen() {
//   const navigation = useNavigation(); // ✅ FIXED: useNavigation at top level
//   const [showOTPInput, setShowOTPInput] = useState(false);
//   const [enteredOTP, setEnteredOTP] = useState('');
//   const [verified, setVerified] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [otpLoading, setOtpLoading] = useState(false);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const email = await AsyncStorage.getItem('userEmail');
//         if (!email) return;

//         const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}/${email}`);
//         setUserData(response.data);
//       } catch (err) {
//         console.error('Axios Error:', err.response?.data || err.message || err);
//         alert('Failed to fetch user data');
//       }
//     };

//     fetchUserData();
//   }, []);

//   const handleVerify = async () => {
//     try {
//       setOtpLoading(true);
//       const response = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.VERIFY_PASS}`, {
//         Pass: enteredOTP,
//         email: userData?.email // ✅ FIXED: pass correct email
//       });

//       setOtpLoading(false);
//       if (response.data.success) {
//         setVerified(true);
//         setShowOTPInput(false);
//         navigation.navigate('MainApp', { screen: 'Home' }); // ✅ Should go here only on success
//       } else {
//         alert(response.data.message || 'Invalid OTP');
//       }
//     } catch (err) {
//       setOtpLoading(false);
//       alert('Server error');
//     }
//   };
// }

// const UserCard = ({ username, email, gender, age, status, onStatusClick }) => (
//   <View style={styles.userBox}>
//     <View style={styles.avatarContainer}>
//       <FontAwesome name="user" size={55} color="#333" />
//     </View>
//     <Text style={styles.userText}>Welcome, {username}</Text>

//     <View style={styles.infoContainer}>
//       <Text style={styles.infoText}>Email: {email}</Text>
//       <Text style={styles.infoText}>Gender: {gender}</Text>
//       <Text style={styles.infoText}>Age: {age}</Text>
//     </View>

//     {onStatusClick && (
//       <TouchableOpacity onPress={onStatusClick}>
//         <Text style={styles.statusText}>Status: {status}</Text>
//       </TouchableOpacity>
//     )}
//   </View>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F7FA',
//     padding: 20,
//   },
//   userBox: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     width: 320,
//     paddingVertical: 30,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//     marginBottom: 30,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     position: 'relative',
//   },
//   avatarContainer: {
//     backgroundColor: '#E0E0E0',
//     borderRadius: 50,
//     padding: 15,
//     marginBottom: 10,
//     elevation: 3,
//   },
//   userText: {
//     fontSize: 18,
//     color: '#333',
//     fontWeight: '600',
//     marginBottom: 10,
//   },
//   infoContainer: {
//     width: '100%',
//     alignItems: 'flex-start',
//     paddingLeft: 10,
//     marginBottom: 20,
//   },
//   infoText: {
//     fontSize: 14,
//     color: '#555',
//     marginVertical: 2,
//   },
//   statusText: {
//     textAlign: 'center',
//     fontSize: 13,
//     color: '#4A90E2',
//     fontStyle: 'italic',
//     textDecorationLine: 'underline',
//   },
//   linkBox: {
//     backgroundColor: '#fff',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 15,
//     paddingHorizontal: 25,
//     borderRadius: 15,
//     elevation: 4,
//     marginBottom: 30,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//   },
//   otpBox: {
//     backgroundColor: '#fff',
//     width: 300,
//     padding: 20,
//     borderRadius: 15,
//     alignItems: 'center',
//     marginBottom: 20,
//     elevation: 3,
//   },
//   verifyButton: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 10,
//   },
//   verifyText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   closeBtn: {
//     position: 'absolute',
//     top: 50,
//     right: 30,
//     backgroundColor: '#ff4d4d',
//     padding: 8,
//     borderRadius: 20,
//     zIndex: 99,
//   },
// });
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FloatingInput from './floatintext'; // Adjust according to your component
import { COLORS } from '../Color'; // Adjust according to your color file
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIPATH } from '../utils/apiPath';
import BackButton from '../components/backbtn.jsx';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation(); // useNavigation at top level
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [Pass, setPass] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (!email) return;

        console.log('Fetching data for email:', email);

        const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}/${email}`);
        console.log('User Data:', response.data); // Debugging the response

        setUserData(response.data); // Storing user data in state
      } catch (err) {
        console.error('Axios Error:', err.response?.data || err.message || err);
        alert('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, []);

  const handleVerify = async () => {
    try {
      setOtpLoading(true);
      const response = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.VERIFY_PASS}`, {
        Pass: Pass,
        email: userData?.email, 
      });

      setOtpLoading(false);
      if (response.data.success) {
        setVerified(true);
        setShowOTPInput(false);
        navigation.navigate('MainApp', { screen: 'Home' }); 
      } else {
        alert(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setOtpLoading(false);
      alert('Server error');
    }
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color={COLORS.primary} />}
      
      {userData ? (
        <UserCard
          username={userData.username}
          email={userData.email}
          gender={userData.gender}
          age={userData.age}
          status={userData.status}
        />
      ) : (
        <Text>Loading...</Text>
      )}

      {/* OTP Verification Section */}
      {showOTPInput && (
        <View style={styles.otpBox}>
          <FloatingInput
            label="Enter Secret Code"
            value={Pass}
            onChangeText={setPass}
          />
          <TouchableOpacity onPress={handleVerify} style={styles.verifyButton}>
            {otpLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.verifyText}>Verify OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// User Card to Display User Info
const UserCard = ({ username, email, gender, age, status }) => (
  <View style={styles.userBox}>
    <View style={styles.avatarContainer}>
      <FontAwesome name="user" size={55} color="#333" />
    </View>
    <Text style={styles.userText}>Welcome, {username}</Text>

    <View style={styles.infoContainer}>
      <Text style={styles.infoText}>Email: {email}</Text>
      <Text style={styles.infoText}>Gender: {gender}</Text>
      <Text style={styles.infoText}>Age: {age}</Text>
    </View>

    {status && (
      <TouchableOpacity>
        <Text style={styles.statusText}>Status: {status}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  userBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 320,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  avatarContainer: {
    backgroundColor: '#E0E0E0',
    borderRadius: 50,
    padding: 15,
    marginBottom: 10,
  },
  userText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginBottom: 10,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginVertical: 2,
  },
  statusText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#4A90E2',
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
  otpBox: {
    backgroundColor: '#fff',
    width: 300,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  verifyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
