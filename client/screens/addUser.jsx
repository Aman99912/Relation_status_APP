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
//     const fetchMyUserIdAndFriends = async () => {
//       try {
//         const email = await AsyncStorage.getItem('userEmail');
//         if (!email) {
//           Alert.alert('Error', 'User email not found in storage');
//           return;
//         }

//         const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${email}`);
//         if (res.status === 200) {
//           setMyUserId(res.data.id);
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
//       if (response.status === 200) {
//         setGeneratedCode(response.data.code);
//         setIsCodeGenerated(true);

//         setTimeout(() => {
//           setIsCodeGenerated(false);
//           setGeneratedCode('');
//         }, 30 * 1000); // 30 seconds
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

//   const fetchUserData = async (code) => {
//     setLoading(true);
//     setUserData(null);
//     setHasSearched(true);
//     try {
//       const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETCODE}?code=${code}`);
      
      
//       if (response.status === 200) {
//         if (response.data.id === myUserId) {
//           Alert.alert('You cannot add yourself');
//           setUserData(null);
//         } else {
//           setUserData(response.data);
//         }
//       } else {
//         Alert.alert('User not found');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'User not found or API error');
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearchCode = () => {
//     if (!inputCode) {
//       Alert.alert('Please enter a code');
//       return;
//     }
//     if (!myUserId) {
//       Alert.alert('Please wait a moment while we load your data');
//       return;
//     }
//     fetchUserData(inputCode.trim());
//   };

// const handleAddRequest = async (receiverId) => {
//   console.log('Sending request to receiverId:', receiverId);

//   try {
//     const senderEmail = await AsyncStorage.getItem('userEmail');
//     if (!senderEmail) return Alert.alert('Error', 'Sender email not found');

//     const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${senderEmail}`);
    
//    console.log("SenderId",res.data.id );
//    console.log("Receiver Id : ",receiverId);
   
    
    
    
    
//     if (res.status === 200) { 
//       const senderId = res.data.id;

//       const sendRes = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SEND_REQ}`, {
//         senderId,
//         receiverId,
//       });

//       if (sendRes.status === 200) {
//         Alert.alert('Success', 'Friend request sent');
//       } else {
//         Alert.alert('Error', sendRes.data.message || 'Failed to send request');
//       }
//     } else {
//       Alert.alert('Error', 'Failed to fetch sender ID');
//     }
//   } catch (err) {
//     console.log(err);
//     Alert.alert('Error', 'Something went wrong');
//   }
// };


//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={[styles.generateButton, isCodeGenerated && styles.disabledButton]}
//         onPress={handleGenerateCode}
//         disabled={isCodeGenerated || loading}
//       >
//         <Text style={styles.buttonText}>
//           {isCodeGenerated ? 'Code Generated' : loading ? 'Generating...' : 'Generate Code'}
//         </Text>
//       </TouchableOpacity>

//       <TextInput
//         style={styles.codeInput}
//         value={generatedCode}
//         editable={false}
//         placeholder="Your Generated Code"
//       />

//       <Text style={styles.orText}>OR</Text>

//       <FloatingInput
//         style={styles.codeEntry}
//         label="Enter User Code"
//         value={inputCode}
//         setValue={setInputCode}
//       />

//       <TouchableOpacity style={styles.searchButton} onPress={handleSearchCode}>
//         <Text style={styles.buttonText}>Search</Text>
//       </TouchableOpacity>

//       {loading ? (
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       ) : hasSearched && !userData ? (
//         <Text style={{ marginTop: 15, color: 'red', textAlign: 'center' }}>
//           User not found
//         </Text>
//       ) : userData ? (
       
//         <Card
//   key={userData.id}
//   username={userData.fullname}
//   avatarUrl={userData.avatarUrl}
//   mode="addUser"
//   isAdded={myFriends.includes(userData.id)}  // or your logic to check
//   onAddPress={() => handleAddRequest(userData.id)}
// />

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
  const [sentRequests, setSentRequests] = useState([]);

  useEffect(() => {
    const fetchMyUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (!email) {
          Alert.alert('Error', 'User email not found in storage');
          return;
        }

        // Fetch user data (id, friends)
        const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${email}`);
        if (res.status === 200) {
          setMyUserId(res.data.id);
          setMyFriends(res.data.friends || []);

          // Fetch sent friend requests - UPDATE this URL to your actual API
          const reqRes = await axios.get(`${APIPATH.BASE_URL}/friendRequests/sent?userId=${res.data.id}`);
          if (reqRes.status === 200) {
            // Assuming reqRes.data.requests is array of user IDs you sent requests to
            setSentRequests(reqRes.data.requests || []);
          }
        }
      } catch (err) {
        console.error('Failed to get user data:', err);
      }
    };

    fetchMyUserData();
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
        }, 30 * 1000); // 30 seconds
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
        if (response.data.id === myUserId) {
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

 const handleAddRequest = async (receiverId) => {
  try {
    const senderEmail = await AsyncStorage.getItem('userEmail');
    if (!senderEmail) return Alert.alert('Error', 'Sender email not found');

    const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${senderEmail}`);

    if (res.status === 200) {
      const senderId = res.data.id;

      const sendRes = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SEND_REQ}`, {
        senderId,
        receiverId,
      });

      if (sendRes.status === 200) {
        Alert.alert('Success', 'Friend request sent');
        setSentRequests(prev => [...prev, receiverId]);
      }
    }
  } catch (err) {
    if (err.response) {
      if (err.response.status === 409) {
        Alert.alert('Oops', err.response.data.message || 'Request already sent or user already friend');
      } else if (err.response.status === 400) {
        Alert.alert('Error', err.response.data.message || 'Invalid request');
      } else if (err.response.status === 404) {
        Alert.alert('Error', err.response.data.message || 'User not found');
      } else {
        Alert.alert('Error', 'Server error: ' + err.message);
      }
    } else {
      Alert.alert('Error', 'Network error or server not reachable');
    }
  }
};


  // Helper to check if user is already friend or request sent
  const isUserAddedOrRequested = (userId) => {
    return myFriends.includes(userId) || sentRequests.includes(userId);
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
  username={userData.fullname}
  avatarUrl={userData.avatarUrl}
  mode="addUser"
  isAdded={isUserAddedOrRequested(userData.id)}
  onAddPress={() => handleAddRequest(userData.id)}
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
