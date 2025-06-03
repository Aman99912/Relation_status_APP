// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   Image,
//   ScrollView,
//   Modal,
//   Alert,
// } from 'react-native';
// import React, { useState, useEffect, useRef } from 'react';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import FloatingInput from './floatintext';
// import { COLORS } from '../Color';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { APIPATH } from '../utils/apiPath';
// import { useNavigation } from '@react-navigation/native';
// import { styles } from './HomepageCss';

// export default function HomeScreen() {
//   const navigation = useNavigation();

//   const [loading, setLoading] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [passwordModalVisible, setPasswordModalVisible] = useState(false);
//   const [inputPassword, setInputPassword] = useState('');
//   const [passwordVerifying, setPasswordVerifying] = useState(false);
//   const [friendsList, setFriendsList] = useState([]);
//   const [friendsLoading, setFriendsLoading] = useState(false);

//   const scrollRef = useRef();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         setLoading(true);

//         const userString = await AsyncStorage.getItem('userEmail'); // actually contains full user object
//         if (!userString) {
//           Alert.alert('Error', 'User not found in storage');
//           return;
//         }
//         const email= await AsyncStorage.getItem('userEmail')
//    console.log("email:::",email);
   

//         const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${email}`);
//         // console.log(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${email}`);
        
//         if (res.status === 200) {
//           console.log("cs",res.data);
//           setUserData(res.data);
          
//         } else {
//           Alert.alert('Error', 'Failed to fetch user data');
//         }
//       } catch (err) {
//         Alert.alert('Error', 'Failed to load user data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, []);

//   const verifyPasswordAndFetchFriends = async () => {
//     if (!inputPassword.trim()) {
//       Alert.alert('Validation', 'Please enter the secret code');
//       return;
//     }

//     try {
//       setPasswordVerifying(true);

//       const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.VERIFY_PASS}`, {
//         UserPass: inputPassword,
//         email: userData.email,
//       });
      
//       if (res.status === 200) {
//         const friendsRes = await axios.get(
//           `${APIPATH.BASE_URL}/${APIPATH.FRIENDDATA}?email=${userData.email}`
//         );

//         setFriendsList(friendsRes.data.friends || []);
//         setPasswordModalVisible(false);
//         setInputPassword('');
//         scrollRef.current?.scrollTo({ y: 0, animated: true });
//       } else {
//         Alert.alert('Error', 'Incorrect secret code');
//       }
//     } catch (error) {
//       Alert.alert('Error', error?.response?.data?.message || 'Error verifying code');
//     } finally {
//       setPasswordVerifying(false);
//     }
//   };

//   const onUserCardPress = () => {
//     setPasswordModalVisible(true);
//   };

//   if (loading) {
//     return (
//       <View style={styles.container}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return (
//     <ScrollView
//       contentContainerStyle={styles.container}
//       ref={scrollRef}
//       keyboardShouldPersistTaps="handled"
//     >
//       {friendsLoading && (
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       )}

//       {userData && (
//         <UserCard
//           username={userData.fullname}
//           email={userData.email}
//           gender={userData.gender}
//           avatar={userData.avatar}
//           status="Status: hide"
//           onPress={onUserCardPress}
//           disabled={false}
//           style={
//             friendsList.length > 0
//               ? styles.mainUserCardBelow
//               : styles.mainUserCardCenter
//           }
//         />
//       )}

//       {friendsList.length > 0 &&
//         friendsList.map(friend => (
//           <UserCard
//             key={friend._id}
//             username={friend.fullname}
//             email={friend.email}
//             gender={friend.gender}
//             avatar={friend.avatar}
//             status="Status: In Relation"
//             disabled={true}
//           />
//         ))}

//       {/* Password Modal */}
//       <Modal
//         visible={passwordModalVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => {
//           setPasswordModalVisible(false);
//           setInputPassword('');
//         }}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalBox}>
//             <Text style={styles.modalTitle}>Enter Secret Code</Text>

//             <FloatingInput
//               label="Secret Code"
//               value={inputPassword}
//               setValue={setInputPassword}
//               secureTextEntry
//             />

//             <TouchableOpacity
//               onPress={verifyPasswordAndFetchFriends}
//               style={styles.verifyButton}
//               disabled={passwordVerifying}
//             >
//               {passwordVerifying ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <Text style={styles.verifyText}>Verify</Text>
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={() => {
//                 setPasswordModalVisible(false);
//                 setInputPassword('');
//               }}
//               style={styles.cancelButton}
//             >
//               <Text style={styles.cancelText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// }

// const UserCard = ({
//   username,
//   email,
//   gender,
//   avatar,
//   onPress,
//   status,
//   disabled,
//   style,
// }) => (
//   <TouchableOpacity
//     activeOpacity={disabled ? 1 : 0.8}
//     onPress={disabled ? null : onPress}
//     style={[styles.userBox, style]}
//   >
//     <View style={styles.avatarContainer}>
//       {avatar ? (
//         <Image source={{ uri: avatar }} style={styles.avatarImage} />
//       ) : (
//         <FontAwesome name="user" size={55} color="#666" />
//       )}
//     </View>
//     <Text style={styles.userText}>Welcome, {username}</Text>
//     <View style={styles.infoContainer}>
//       <Text style={styles.infoText}>Email: {email}</Text>
//       <Text style={styles.infoText}>Gender: {gender}</Text>
//     </View>
//     <View style={styles.statusContainer}>
//       <Text style={styles.statusText}>{status || 'Status: hide'}</Text>
//     </View>
//   </TouchableOpacity>
// );

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FloatingInput from './floatintext';
import { COLORS } from '../Color';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIPATH } from '../utils/apiPath';
import { useNavigation } from '@react-navigation/native';
import { styles } from './HomepageCss';

export default function HomeScreen() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [passwordVerifying, setPasswordVerifying] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

  const scrollRef = useRef();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const email = await AsyncStorage.getItem('userEmail');

        if (!email) {
          Alert.alert('Error', 'User not found in storage');
          return;
        }

        const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${email}`);
        if (res.status === 200) {
          setUserData(res.data);
        } else {
          Alert.alert('Error', 'Failed to fetch user data');
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const verifyPasswordAndFetchFriends = async () => {
    if (!inputPassword.trim()) {
      Alert.alert('Validation', 'Please enter the secret code');
      return;
    }

    try {
      setPasswordVerifying(true);

      const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.VERIFY_PASS}`, {
        UserPass: inputPassword,
        email: userData.email,
      });

      if (res.status === 200) {
        const friendsRes = await axios.get(
          `${APIPATH.BASE_URL}/${APIPATH.FRIENDDATA}?email=${userData.email}`
        );

        setFriendsList(friendsRes.data.friends || []);
        setPasswordModalVisible(false);
        setInputPassword('');
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        Alert.alert('Error', 'Incorrect secret code');
      }
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Error verifying code');
    } finally {
      setPasswordVerifying(false);
    }
  };

  const onUserCardPress = () => {
    setPasswordModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      ref={scrollRef}
      keyboardShouldPersistTaps="handled"
    >
      {friendsLoading && (
        <ActivityIndicator size="large" color={COLORS.primary} />
      )}

      {userData && (
        <UserCard
          username={userData.fullname}
          email={userData.email}
          gender={userData.gender}
          avatar={userData.avatar}
          status={friendsList.length > 0 ? 'Status: In Relation' : 'Status: Single'}
          onPress={onUserCardPress}
          disabled={false}
          style={
            friendsList.length > 0
              ? styles.mainUserCardBelow
              : styles.mainUserCardCenter
          }
        />
      )}

      {friendsList.length > 0 &&
        friendsList.map((friend, index) => (
          <UserCard
            key={friend._id}
            username={friend.fullname}
            email={friend.email}
            gender={friend.gender}
            avatar={friend.avatar}
            status="Status: In Relation"
            disabled={true}
            showCross={true}
            onRemove={() => {
              Alert.alert(
                'Confirm',
                'Do you want to remove this friend?',
                [
                  {
                    text: 'No',
                    style: 'cancel',
                  },
                  {
                    text: 'Yes',
                    onPress: () => {
                      const newList = [...friendsList];
                      newList.splice(index, 1);
                      setFriendsList(newList);
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
          />
        ))}

      {/* Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setPasswordModalVisible(false);
          setInputPassword('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter Secret Code</Text>

            <FloatingInput
              label="Secret Code"
              value={inputPassword}
              setValue={setInputPassword}
              secureTextEntry
            />

            <TouchableOpacity
              onPress={verifyPasswordAndFetchFriends}
              style={styles.verifyButton}
              disabled={passwordVerifying}
            >
              {passwordVerifying ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.verifyText}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setPasswordModalVisible(false);
                setInputPassword('');
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const UserCard = ({
  username,
  email,
  gender,
  avatar,
  onPress,
  status,
  disabled,
  style,
  showCross,
  onRemove,
}) => {
  const [imageError, setImageError] = useState(false);

  const getDefaultAvatar = () => {
    if (gender === 'female') {
      return 'https://static.vecteezy.com/system/resources/previews/028/597/534/original/young-cartoon-female-avatar-student-character-wearing-eyeglasses-file-no-background-ai-generated-png.png';
    } else {
      return 'https://png.pngtree.com/png-clipart/20231015/original/pngtree-man-avatar-clipart-illustration-png-image_13302499.png';
    }
  };

  const avatarSource = !avatar || imageError ? { uri: getDefaultAvatar() } : { uri: avatar };
  

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.8}
      onPress={disabled ? null : onPress}
      style={[styles.userBox, style]}
    >
      {showCross && (
        <TouchableOpacity
          onPress={onRemove}
          style={{ position: 'absolute', top: 5, right: 10, zIndex: 1 }}
        >
          <Text style={{ fontSize: 18, color: 'red' }}>✖</Text>
        </TouchableOpacity>
      )}

      <View style={styles.avatarContainer}>
        <Image
          // source={avatarSource}
          source={avatarSource}
          style={styles.avatarImage}
          onError={() => setImageError(true)}
        />
      </View>
      <Text style={styles.userText}>Welcome, {username}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Email: {email}</Text>
        <Text style={styles.infoText}>Gender: {gender}</Text>
      </View>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{status || 'Status: hide'}</Text>
      </View>
    </TouchableOpacity>
  );
};
