// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import axios from 'axios';
// import FloatingInput from './floatintext';
// import { APIPATH } from '../utils/apiPath';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Card from '../components/card';
// import { COLORS } from '../Color';

// export default function AddUser() {
//   const [generatedCode, setGeneratedCode] = useState('');
//   const [inputCode, setInputCode] = useState('');
//   const [isCodeGenerated, setIsCodeGenerated] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [hasSearched, setHasSearched] = useState(false);
//   const [myUserId, setMyUserId] = useState('');
//   const [myFriends, setMyFriends] = useState([]);

//   useEffect(() => {
//     // Fetch my userId and friends once on mount
//     const fetchMyUserIdAndFriends = async () => {
//       try {
//         const email = await AsyncStorage.getItem('userEmail');
//         console.log('My email:', email);
//         if (!email) {
//           Alert.alert('Error', 'User email not found in storage');
//           return;
//         }

//         const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${email}`);
//         // console.log('My user data:', res.data);
//         if (res.status === 200 ) {
//           setMyUserId(res.data._id);
//           // console.log(res.data._id);
          
//           setMyFriends(res.data.friends || []);
//         }
//       } catch (err) {
//         console.error('Failed to get my user id:', err);
//       }
//     };

//     fetchMyUserIdAndFriends();
//   }, []);

//   const handleGenerateCode = async () => {
//     setLoading(true);
//     try {
//       const email = await AsyncStorage.getItem('userEmail');
//       if (!email) {
//         Alert.alert('Error', 'User email not found');
//         setLoading(false);
//         return;
//       }

//       const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${email}`);
//       if (response.status == 200) {
//         setGeneratedCode(response.data.code);
//         setIsCodeGenerated(true);

//         // Enable button again after 3 minutes
//         setTimeout(() => {
//           setIsCodeGenerated(false);
//           setGeneratedCode('');
//         }, 3 * 60 * 1000);
//       } else {
//         Alert.alert('Error', 'Code not found');
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Error', 'Server error: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//  const fetchUserData = async (code) => {
//   setLoading(true);
//   setUserData(null);
//   setHasSearched(true);
//   try {
//     const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETCODE}?code=${code}`);
    
//     console.log('Fetched user by code:', response.data);

//     if (response.status === 200 ) {
//       if (response.data._id === myUserId) {
//         Alert.alert('You cannot add yourself');
//         setUserData(null);
//       } else {
//         setUserData(response.data);
//       }
//     } else {
//       Alert.alert('User not found');
//     }
//   } catch (error) {
//     Alert.alert('Error', 'User not found or API error');
//     console.error(error);
//   } finally {
//     setLoading(false);
//   }
// };



//   const handleSearchCode = () => {
//     if (!inputCode) {
//       Alert.alert('Please enter a code');
//       return;
//     }
//     if (!myUserId) {
//       Alert.alert('Please wait a moment while we load your data');
//       console.log(`${APIPATH.BASE_URL}/${APIPATH.GETCODE}?code=${inputCode}`);
//       return;
//     }
//     fetchUserData(inputCode.trim());
//   };

//   const handleAddRequest = async () => {
//     if (!userData) return;

//     if (!myUserId) {
//       Alert.alert('Your user data is not loaded yet. Please wait.');
//       return;
//     }

//     console.log('MyUserId:', myUserId);
//     console.log('Adding friend with id:', userData.id);

//     if (myUserId.toString() === userData._id.toString()) {
//       Alert.alert("You can't add yourself");
//       return;
//     }

//     if (myFriends.includes(userData.id)) {
//       Alert.alert('User is already your friend');
//       return;
//     }

//     try {
//       const sendRes = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SEND_REQ}`, {
//         senderId: myUserId,
//         receiverId: userData._id,
//       });

//       if (sendRes.status === 200 && sendRes.data.success) {
//         Alert.alert('Request sent to ' + userData.username);
//       } else {
//         Alert.alert('Failed to send request');
//       }
//     } catch (err) {
//       console.log('Send request error:', err.response?.data || err.message);
//       Alert.alert('Error sending request', err.response?.data?.message || err.message);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Generate Code Button */}
//       <TouchableOpacity
//         style={[styles.generateButton, isCodeGenerated && styles.disabledButton]}
//         onPress={handleGenerateCode}
//         disabled={isCodeGenerated || loading}
//       >
//         <Text style={styles.buttonText}>
//           {isCodeGenerated ? 'Code Generated' : loading ? 'Generating...' : 'Generate Code'}
//         </Text>
//       </TouchableOpacity>

//       {/* Display Generated Code */}
//       <TextInput
//         style={styles.codeInput}
//         value={generatedCode}
//         editable={false}
//         placeholder="Your Generated Code"
//       />

//       {/* Divider */}
//       <Text style={styles.orText}>OR</Text>

//       {/* Search Section */}
//       <FloatingInput
//         style={styles.codeEntry}
//         label="Enter User Code"
//         value={inputCode}
//         setValue={setInputCode}
//       />

//       <TouchableOpacity style={styles.searchButton} onPress={handleSearchCode}>
//         <Text style={styles.buttonText}>Search</Text>
//       </TouchableOpacity>

//       {/* Result */}
//       {loading ? (
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       ) : hasSearched && !userData ? (
//         <Text style={{ marginTop: 15, color: 'red', textAlign: 'center' }}>
//           User not found
//         </Text>
//       ) : userData ? (
//         <Card
//           username={userData.username}
//           avatarUrl={userData.avatarUrl}
//           onAddPress={handleAddRequest}
//         />
//       ) : null}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 25,
//     paddingTop: 250,
//     backgroundColor: '#f4f8ff',
//     flex: 1,
//   },
//   generateButton: {
//     backgroundColor: COLORS.primary || '#4a90e2',
//     paddingVertical: 14,
//     borderRadius: 30,
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   disabledButton: {
//     backgroundColor: '#a0a0a0',
//   },
//   codeInput: {
//     borderWidth: 1.5,
//     borderColor: '#ccc',
//     borderRadius: 12,
//     padding: 12,
//     marginTop: 10,
//     backgroundColor: '#e6f0ff',
//     color: '#333',
//   },
//   orText: {
//     marginVertical: 20,
//     textAlign: 'center',
//     color: '#999',
//     fontWeight: 'bold',
//   },
//   searchButton: {
//     backgroundColor: COLORS.primary || '#4a90e2',
//     paddingVertical: 14,
//     borderRadius: 30,
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   buttonText: {
//     color: COLORS.background || '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   codeEntry: {
//     marginBottom: 10,
//   },
// });

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import FloatingInput from './floatintext';
import { APIPATH } from '../utils/apiPath';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '../components/card';
import { COLORS } from '../Color';

export default function AddUser() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [myUserId, setMyUserId] = useState('');
  const [myFriends, setMyFriends] = useState([]);

  useEffect(() => {
    const fetchMyUserIdAndFriends = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (!email) {
          Alert.alert('Error', 'User email not found in storage');
          return;
        }

        const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${email}`);
        console.log("Sending Request");
        
        if (res.status === 200) {
          setMyUserId(res.data._id);
          setMyFriends(res.data.friends || []);
        }
      } catch (err) {
        console.error('Failed to get my user id:', err);
      }
    };

    fetchMyUserIdAndFriends();
  }, []);

  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (!email) {
        Alert.alert('Error', 'User email not found');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${email}`);
      if (response.status === 200) {
        setGeneratedCode(response.data.code);
        setIsCodeGenerated(true);

        setTimeout(() => {
          setIsCodeGenerated(false);
          setGeneratedCode('');
        }, 3 * 60 * 1000);
      } else {
        Alert.alert('Error', 'Code not found');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Server error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (code) => {
    setLoading(true);
    setUserData(null);
    setHasSearched(true);
    try {
      const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETCODE}?code=${code}`);
      if (response.status === 200) {
        if (response.data._id === myUserId) {
          Alert.alert('You cannot add yourself');
          setUserData(null);
        } else {
          setUserData(response.data);
        }
      } else {
        Alert.alert('User not found');
      }
    } catch (error) {
      Alert.alert('Error', 'User not found or API error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCode = () => {
    if (!inputCode) {
      Alert.alert('Please enter a code');
      return;
    }
    if (!myUserId) {
      Alert.alert('Please wait a moment while we load your data');
      return;
    }
    fetchUserData(inputCode.trim());
  };

  const handleAddRequest = async () => {
    if (!userData || !userData._id) return;

    if (!myUserId) {
      Alert.alert('Your user data is not loaded yet. Please wait.');
      return;
    }

    if (myUserId.toString() === userData._id.toString()) {
      Alert.alert("You can't add yourself");
      return;
    }

    if (myFriends.includes(userData._id)) {
      Alert.alert('User is already your friend');
      return;
    }

    try {
      const sendRes = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SEND_REQ}`, {
        senderId: myUserId,
        receiverId: userData._id,
      });

      if (sendRes.status === 200 && sendRes.data.success) {
        Alert.alert('Request sent to ' + userData.username);
      } else if (sendRes.status === 409) {
        Alert.alert(sendRes.data.message || 'Request already sent or already friend');
      } else {
        Alert.alert('Failed to send request');
      }
    } catch (err) {
      console.log('Send request error:', err.response?.data || err.message);
      Alert.alert('Error sending request', err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.generateButton, isCodeGenerated && styles.disabledButton]}
        onPress={handleGenerateCode}
        disabled={isCodeGenerated || loading}
      >
        <Text style={styles.buttonText}>
          {isCodeGenerated ? 'Code Generated' : loading ? 'Generating...' : 'Generate Code'}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.codeInput}
        value={generatedCode}
        editable={false}
        placeholder="Your Generated Code"
      />

      <Text style={styles.orText}>OR</Text>

      <FloatingInput
        style={styles.codeEntry}
        label="Enter User Code"
        value={inputCode}
        setValue={setInputCode}
      />

      <TouchableOpacity style={styles.searchButton} onPress={handleSearchCode}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : hasSearched && !userData ? (
        <Text style={{ marginTop: 15, color: 'red', textAlign: 'center' }}>
          User not found
        </Text>
      ) : userData ? (
        <Card
          username={userData.username}
          avatarUrl={userData.avatarUrl}
          onAddPress={handleAddRequest}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    paddingTop: 250,
    backgroundColor: '#f4f8ff',
    flex: 1,
  },
  generateButton: {
    backgroundColor: COLORS.primary || '#4a90e2',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  codeInput: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    backgroundColor: '#e6f0ff',
    color: '#333',
  },
  orText: {
    marginVertical: 20,
    textAlign: 'center',
    color: '#999',
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: COLORS.primary || '#4a90e2',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: COLORS.background || '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  codeEntry: {
    marginBottom: 10,
  },
});
