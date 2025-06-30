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
  StyleSheet, // Ensure StyleSheet is imported here
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import FloatingInput from '../components/floatintext';
import { COLORS } from '../Color';
import axios from 'axios';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIPATH } from '../utils/apiPath';
import { useNavigation } from '@react-navigation/native';
// import { styles } from './HomepageCss'; // Removing this import as styles are defined below
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
  const [friendMenuModalVisible, setFriendMenuModalVisible] = useState(false);
  const [selectedFriendForMenu, setSelectedFriendForMenu] = useState(null);
  
  const scrollRef = useRef();
  const fetchUserDataRef = useRef(null); 
  
  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          const id = await AsyncStorage.getItem('userId');
          const Token = await AsyncStorage.getItem('Token');
          
          if (!id) {
            Alert.alert('Error', 'User ID not found in storage');
            return;
          }
          
          const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?id=${id}`, { 
            headers: {
              Authorization: `${Token}` 
            },
          });
          if (res.status === 200) {
            setUserData(res.data);
            setIsVerified(false); // Reset verification state on fresh data fetch
            setFriendsList([]); // Clear friends list until password verified again
          } else {
            Alert.alert('Error', 'Failed to fetch user data');
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
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
      const Token = await AsyncStorage.getItem('Token');
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
        setFriendsLoading(true); // Start loading for friends data
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
      console.error("Error verifying password or fetching friends:", error);
      Alert.alert('Error', error?.response?.data?.message || 'Error verifying code');
    } finally {
      setPasswordVerifying(false);
      setFriendsLoading(false); // Stop loading for friends data
    }
  };
  
  const onUserCardPress = () => {
    setPasswordModalVisible(true);
  };

  const handleRemoveFriend = (friendId) => {
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
          onPress: async () => {
            // Here you would typically make an API call to your backend
            // For now, it will only update the local state as per your original logic
            const updatedFriendsList = friendsList.filter(f => f._id !== friendId);
            setFriendsList(updatedFriendsList);
            setIsVerified(updatedFriendsList.length > 0); // Re-evaluate status based on updated list
            ToastAndroid.show('Friend removed successfully', ToastAndroid.SHORT);
            setFriendMenuModalVisible(false); // Close the menu modal
            setSelectedFriendForMenu(null);
            // Optionally re-fetch user data to ensure everything is in sync with backend
            // if (fetchUserDataRef.current) {
            //   fetchUserDataRef.current();
            // }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
          <FontAwesome name="bell" size={26} color={COLORS.darkGray} />
          {userData?.notifNo > 0 && (
            <View style={styles.notificationNumber}>
              <Text style={styles.notificationText}>{userData.notifNo}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {userData && (
        <UserCard
          username={userData.fullname}
          email={userData.email}
          gender={userData.gender}
          avatar={userData.avatar}
          status={
            !isVerified
              ? 'Status: hidden'
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

      {friendsLoading && ( // Show loader specifically for friends data
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.friendsLoader} />
      )}

      {isVerified && friendsList.length === 0 && !friendsLoading && (
        <Text style={styles.noFriendsText}>You are currently single.</Text>
      )}

      {isVerified && friendsList.length > 0 &&
        friendsList.map((friend) => (
          <UserCard
            key={friend._id}
            username={friend.name}
            email={friend.email}
            gender={friend.gender}
            avatar={friend.avatar}
            status="Status: In Relation"
            disabled={true} // Friends cards are not tappable for password modal
            onMenuPress={() => {
              setSelectedFriendForMenu(friend);
              setFriendMenuModalVisible(true);
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
      
      {/* Password Entry Modal */}
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
              secureTextEntry={true} // Use secureTextEntry for passwords
              keyboardType="numeric" // Use numeric keyboard for codes
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

      {/* Friend Menu Modal (for 3-dots) */}
      <Modal
        visible={friendMenuModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setFriendMenuModalVisible(false);
          setSelectedFriendForMenu(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Options for {selectedFriendForMenu?.name || 'Friend'}</Text>
            
            <TouchableOpacity
              onPress={() => handleRemoveFriend(selectedFriendForMenu?._id)}
              style={styles.menuOptionButton}
            >
              <Text style={styles.menuOptionText}>Remove Friend</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setFriendMenuModalVisible(false);
                setSelectedFriendForMenu(null);
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
  onMenuPress, // New prop for 3-dot menu
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
      activeOpacity={disabled ? 1 : 0.7} // Slightly more responsive feel
      onPress={disabled || status !== 'Status: hidden' ? null : onPress}
      style={[styles.userBox, style]}
    >
      {/* Conditional rendering for chat and menu buttons for friend cards */}
      {status === 'Status: In Relation' && ( // Only show for friends
        <>
          <TouchableOpacity
            onPress={onMenuPress}
            style={styles.threeDotMenuButton}
          >
            <FontAwesome name="ellipsis-v" size={22} color={COLORS.darkGray} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onChatPress}
            style={styles.chatButton}
          >
            <FontAwesome name="comments" size={26} color={COLORS.primary} />
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
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
};

// --- HomepageCss.js (or wherever your styles are defined) ---
// Please ensure this is in a separate file named HomepageCss.js
// if you are importing it as `import { styles } from './HomepageCss';`
// Otherwise, define it directly in this file if you prefer.

export const styles = StyleSheet.create({
  container: {
    paddingVertical: 30, // Adjusted padding
    alignItems: 'center',
    backgroundColor: COLORS.background, // Using COLORS.background for consistency
    paddingHorizontal: 15, // Adjusted padding
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  navItem: {
    position: 'absolute',
    top: 40, // Adjusted top
    right: 20, // Adjusted right
    zIndex: 999,
  },
  iconContainer: {
    position: 'relative',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationNumber: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'red',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userBox: {
    backgroundColor: '#fff',
    borderRadius: 15, // Slightly less rounded for modern look
    width: '95%', // Wider card
    maxWidth: 360, // Max width for larger screens
    paddingVertical: 25, // Adjusted padding
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 18, // Slightly less margin
    elevation: 8, // Stronger shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Deeper shadow
    shadowOpacity: 0.1, // Softer opacity
    shadowRadius: 10, // Wider blur
    borderWidth: 1, // Subtle border
    borderColor: '#e0e0e0',
  },
  mainUserCardCenter: {
    marginTop: "40%", // Adjusted for better centering
  },
  mainUserCardBelow: {
    marginTop: 30, // Adjusted margin
  },
  avatarContainer: {
    backgroundColor: COLORS.lightGray, // Lighter background for avatar placeholder
    borderRadius: 60, // More rounded for larger size
    padding: 15, // Adjusted padding
    marginBottom: 12, // Adjusted margin
    width: 110, // Larger avatar
    height: 110, // Larger avatar
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2, // Border around avatar
    borderColor: COLORS.primary, // Primary color border
  },
  avatarImage: {
    width: '100%', // Fit image perfectly
    height: '100%', // Fit image perfectly
    borderRadius: 55, // Match container border radius
    resizeMode: 'cover',
  },
  userText: {
    fontSize: 22, // Larger font
    color: COLORS.darkText, // Darker text for better contrast
    fontWeight: '800', // Bolder
    marginBottom: 10,
    textAlign: 'center',
  },
  infoContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: 15, // Adjusted padding
    marginBottom: 12, // Adjusted margin
  },
  infoText: {
    fontSize: 16, // Larger font
    color: COLORS.grayText, // Softer text color
    marginVertical: 2,
    fontWeight: '500',
  },
  statusContainer: {
    borderTopWidth: StyleSheet.hairlineWidth, // Thinner line
    borderTopColor: '#ccc', // Lighter color
    width: '100%',
    paddingTop: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 15,
    color: COLORS.grayText,
    fontStyle: 'italic',
    fontWeight: '600', // Slightly bolder status
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Darker overlay
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 320, // Slightly smaller modal
    borderRadius: 15, // Consistent border radius
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: COLORS.darkText,
    textAlign: 'center', // Center title
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 25, // Adjusted padding
    paddingVertical: 14, // Adjusted padding
    borderRadius: 12, // Consistent border radius
    marginTop: 20, // Adjusted margin
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Full width button
  },
  verifyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17, // Larger font
  },
  cancelButton: {
    marginTop: 15, // Adjusted margin
    paddingVertical: 10,
  },
  cancelText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  // New styles for the three-dot menu and chat button
  threeDotMenuButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 2,
    padding: 5, // Make it easier to tap
  },
  chatButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 2,
    padding: 5, // Make it easier to tap
  },
  menuOptionButton: {
    backgroundColor: COLORS.lightGray,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuOptionText: {
    fontSize: 16,
    color: COLORS.darkText,
    fontWeight: '600',
  },
  noFriendsText: {
    fontSize: 16,
    color: COLORS.grayText,
    marginTop: 20,
    textAlign: 'center',
  },
  friendsLoader: {
    marginTop: 20,
  }
});