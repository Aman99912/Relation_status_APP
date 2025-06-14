

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  Alert,
  ToastAndroid,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import FloatingInput from '../components/floatintext';
import { COLORS } from '../Color';
import axios from 'axios';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIPATH } from '../utils/apiPath';
import { useNavigation } from '@react-navigation/native';
import { styles } from './HomepageCss';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


export default function HomeScreen() {
  const navigation = useNavigation();
  const NotificationHandle = () => navigation.navigate('MainApp', { screen: 'notification' });

  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [passwordVerifying, setPasswordVerifying] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  
  const scrollRef = useRef();
  const fetchUserDataRef = useRef(null); 
  
  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          const email = await AsyncStorage.getItem('userEmail');
          const id = await AsyncStorage.getItem('userId');
          
          
          if (!email) {
            Alert.alert('Error', 'User not found in storage');
            return;
          }
          // console.log(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?id=${id}`);
          const Token = await AsyncStorage.getItem('Token')
          
          const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?id=${id}`,  {  
           headers: {
             Authorization: `${Token}` 
                   },
  });
          if (res.status === 200) {
            setUserData(res.data);
            setIsVerified(false);
            setFriendsList([]);
          } else {
            Alert.alert('Error', 'Failed to fetch user data');
          }
        } catch (err) {
          Alert.alert('Error', 'Failed to load user data');
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserDataRef.current = fetchUserData;
      fetchUserData();
    }, [])
  );
  
  
  const verifyPasswordAndFetchFriends = async () => {
    if (!inputPassword.trim()) {
      Alert.alert('Validation', 'Please enter the secret code');
      return;
    }
    
    try {
      setPasswordVerifying(true);
      const Token = await AsyncStorage.getItem('Token')
      const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.VERIFY_PASS}`, {
        UserPass: inputPassword,
        email: userData.email,
      },
      {  
        headers: {
          Authorization: `${Token}` 
        },
      });
      
      if (res.status === 200) {
        const friendsRes = await axios.get(
          `${APIPATH.BASE_URL}/${APIPATH.FRIENDDATA}?email=${userData.email}`,
          {  
        headers: {
          Authorization: `${Token}` 
        },
      }
          
        );
        
        setFriendsList(friendsRes.data.friends || []);
        setPasswordModalVisible(false);
        setInputPassword('');
        setIsVerified(true);
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
    

     

<TouchableOpacity style={styles.navItem} onPress={NotificationHandle}>
  <View style={styles.iconContainer}>
    <FontAwesome name="bell" size={26} color="black" />
    {userData?.notifNo > 0 && (
      <View style={styles.notificationNumber}>
        <Text style={styles.notificationText}>{userData.notifNo}</Text>
      </View>
    )}
  </View>
</TouchableOpacity>


      {friendsLoading && (
        <ActivityIndicator size="large" color={COLORS.primary} />
      )}

      {userData && (
        <UserCard
          username={userData.fullname}
          email={userData.email}
          gender={userData.gender}
          avatar={userData.avatar}
          status={
            !isVerified
              ? 'Status: hide'
              : friendsList.length > 0
              ? 'Status: In Relation'
              : 'Status: Single'
          }
          onPress={onUserCardPress}
          disabled={false}
          style={
            isVerified
              ? friendsList.length > 0
                ? styles.mainUserCardBelow
                : styles.mainUserCardCenter
              : styles.mainUserCardCenter
          }
        />
      )}

      {friendsList.length > 0 &&
        friendsList.map((friend, index) => (
          <UserCard
            key={friend._id}
            username={friend.name}
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
                      fetchUserDataRef.current && fetchUserDataRef.current();
                      ToastAndroid.show('Friend removed successfully', ToastAndroid.SHORT);
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
           onChatPress={() => {
  navigation.navigate('chats', {
    friendId: friend._id,
    friendName: friend.name,
    friendAvatar: friend.avatar,
    friendEmail: friend.email,
  });
}}

          />
        ))}

     
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
              secure='true'
              numeric="true"
            
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
  onChatPress,
}) => {
  const [imageError, setImageError] = useState(false);

  const getDefaultAvatar = () => {
    return gender === 'female'
      ? require('../assets/female.webp')
      : require('../assets/male.png');
  };

  const avatarSource = !avatar || imageError ? getDefaultAvatar() : { uri: avatar };

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.8}
      onPress={disabled || status !== 'Status: hide' ? null : onPress}
      style={[styles.userBox, style]}
    >
      {showCross && (
        <>
          <TouchableOpacity
            onPress={onRemove}
            style={{ position: 'absolute', top: 5, right: 10, zIndex: 2 }}
          >
            <Text style={{ fontSize: 18, color: 'red' }}>✖</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onChatPress}
            style={{ position: 'absolute', top: 5, left: 10, zIndex: 2, padding: 4 }}
          >
            <FontAwesome name="comments" size={26} color="black" />
          </TouchableOpacity>
        </>
      )}

      <View style={styles.avatarContainer}>
        <Image
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
