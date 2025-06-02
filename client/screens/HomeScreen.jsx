

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

      const email = await AsyncStorage.getItem('userEmail'); // ✅ only email
      if (!email) {
        Alert.alert('Error', 'User email not found');
        return;
      }

      const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${email}`);
      if (res.status === 200 && res.data) {
        setUserData(res.data); // Full user object from backend
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
      alert('Please enter the secret code');
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
        alert('Incorrect secret code');
      }
    } catch (error) {
      alert(
        error?.response?.data?.message ||
        'Error verifying code or fetching friends'
      );
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

      {friendsList.length > 0 &&
        friendsList.map(friend => (
          <UserCard
            key={friend._id}
            username={friend.fullname}
            email={friend.email}
            gender={friend.gender}
            avatar={friend.avatar}
            status='Status: In Relation'
            disabled={true}
          />
        ))}

      {userData && (
        <UserCard
          username={userData.fullname}
          email={userData.email}
          gender={userData.gender}
          avatar={userData.avatar}
          status="Status: hide"
          onPress={onUserCardPress}
          disabled={false}
          style={
            friendsList.length > 0
              ? styles.mainUserCardBelow
              : styles.mainUserCardCenter
          }
        />
      )}

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
}) => (
  <TouchableOpacity
    activeOpacity={disabled ? 1 : 0.8}
    onPress={disabled ? null : onPress}
    style={[styles.userBox, style]}
  >
    <View style={styles.avatarContainer}>
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatarImage} />
      ) : (
        <FontAwesome name="user" size={55} color="#666" />
      )}
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
