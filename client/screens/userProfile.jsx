// import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
// import React, { useState } from 'react'
// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';
// import NavBar from '../components/Navbar';
// import { APIPATH } from '../utils/apiPath';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function HomeScreen() {
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(false);

//   const handleLogout = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.LOGOUT_API}`, {
//       });
//       if (response.status === 200) {
//         await AsyncStorage.clear()
//         // await AsyncStorage.clear();
// const checkEmail = await AsyncStorage.getItem('userEmail');
// console.log('Post-clear email:', checkEmail); // should log null

//         Alert.alert('Success', 'You have been logged out successfully!', [
//           {
//             text: 'OK',
//             onPress: () => navigation.navigate('Login'), // Navigate to Login screen
//           },
//         ]);
//       }
//     } catch (error) {
//       setLoading(false);
//       Alert.alert('Error', 'There was an issue logging out. Please try again.');
//       console.error('Logout error:', error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Logout</Text>

//       {loading ? (
//         <Text style={styles.loadingText}>Logging out...</Text>
//       ) : (
//         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>
//       )}
//       <NavBar/>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f8f8',
//     padding: 24,
//   },
//   header: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 40,
//   },
//   logoutButton: {
//     backgroundColor: '#ff6347',
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     borderRadius: 30,
//     alignItems: 'center',
//   },
//   logoutText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   loadingText: {
//     fontSize: 16,
//     color: '#777',
//   },
// });

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { COLORS } from '../Color'; // apna color file

const UserProfileScreen = ({ navigation }) => {
  const [avatar, setAvatar] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get('http://<your-server-url>/api/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = res.data.user;
      setAvatar(user.avatar);
      setEmail(user.email);
      setMobile(user.mobile);
      setUserId(user._id);
    };
    loadUser();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setAvatar(result.uri);
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `http://<your-server-url>/api/user/update/${userId}`,
        { avatar, email, mobile },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            avatar
              ? { uri: avatar }
              : require('../assets/avatar.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.changePic}>Change Profile Picture</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        value={mobile}
        onChangeText={setMobile}
        style={styles.input}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginTop: 20,
  },
  changePic: {
    color: COLORS.primary,
    marginTop: 8,
    fontWeight: 'bold',
  },
  label: {
    alignSelf: 'flex-start',
    marginTop: 30,
    marginBottom: 5,
    fontSize: 16,
    color: COLORS.textDark,
  },
  input: {
    width: '100%',
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    marginTop: 40,
    width: '100%',
    padding: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutBtn: {
    marginTop: 20,
    backgroundColor: '#eee',
    width: '100%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default UserProfileScreen;
