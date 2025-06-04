
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingInput from './floatintext';
import { APIPATH } from '../utils/apiPath';
import { COLORS } from '../Color';
import { Ionicons } from '@expo/vector-icons';

function useDebounce(callback, delay) {
  const timer = useRef();
  const debouncedCallback = useCallback(
    (...args) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  return debouncedCallback;
}

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
  const [sendingRequestId, setSendingRequestId] = useState(null);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${email}`);
        setMyUserId(res.data.id);
        setMyFriends(res.data.friends || []);
        setSentRequests(res.data.sentRequests || []);
      } catch (err) {
        console.log('Failed to get user data:', err);
      }
    };
    fetchMyData();
  }, []);

  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${email}`);
      setGeneratedCode(response.data.code);
      setIsCodeGenerated(true);
      setTimeout(() => {
        setIsCodeGenerated(false);
        setGeneratedCode('');
      }, 30000);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (code) => {
    if (code.length !== 10) {
      setUserData(null);
      setHasSearched(false);
      return;
    }

    if (!myUserId) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETCODE}?code=${code}`);

      const targetUser = response.data;

      if (targetUser.id === myUserId) {
        setUserData(null);
        return;
      }

      const isFriend = targetUser.friends.includes(myUserId);
      const isRequestPending = targetUser.friendRequests.includes(myUserId);

      setUserData({
        ...targetUser,
        isFriend,
        isRequestPending,
      });
    } catch (error) {
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchUserData = useDebounce(fetchUserData, 500);

  const handleInputChange = (text) => {
    setInputCode(text);
    if (text.trim().length === 10) {
      debouncedFetchUserData(text.trim());
    } else {
      setUserData(null);
      setHasSearched(false);
    }
  };

  // const handleAddRequest = async (receiverId) => {
  //   setSendingRequestId(receiverId);
  //   try {
  //     const senderEmail = await AsyncStorage.getItem('userEmail');
  //     const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${senderEmail}`);
  //     const senderId = res.data.id;

  //     await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SEND_REQ}`, {
  //       senderId,
  //       receiverId,
  //     });

  //     setSentRequests((prev) => [...prev, receiverId]);
  //   } catch (err) {
  //     console.log('Send request error:', err?.response?.data?.message);
  //   } finally {
  //     setSendingRequestId(null);
  //   }
  // };

  const handleAddRequest = async (receiverId) => {
  setSendingRequestId(receiverId);
  try {
    const senderEmail = await AsyncStorage.getItem('userEmail');
    const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${senderEmail}`);
    const senderId = res.data.id;

    await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SEND_REQ}`, {
      senderId,
      receiverId,
    });

    setSentRequests((prev) => [...prev, receiverId]);

    // 🔁 Refresh user data after sending request
    await fetchUserData(inputCode);

  } catch (err) {
    console.log('Send request error:', err?.response?.data?.message);
  } finally {
    setSendingRequestId(null);
  }
};

  const renderCard = (user) => {
    const isFriend = user.isFriend;
    const isRequestPending = user.isRequestPending;
    const isMyself = user.id === myUserId;
    const isDisabled = isFriend || isRequestPending || isMyself;
    const isLoading = sendingRequestId === user.id;

    const getButtonContent = () => {
      if (isLoading) return <ActivityIndicator color="#fff" />;
      if (isMyself) return <Text style={styles.disabledText}>You</Text>;
      if (isFriend) return <Text style={styles.disabledText}>Friend</Text>;
      if (isRequestPending) return <Text style={styles.disabledText}>Requested</Text>;
      return <Ionicons name="person-add" size={20} color="#fff" />;
    };

    return (
      <View style={styles.card}>
        <Image
          source={
            typeof user.avatarUrl === 'string'
              ? { uri: user.avatarUrl }
              : require('../assets/avatar.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.fullname}</Text>

        <TouchableOpacity
          style={[styles.button, isDisabled && styles.disabledButton]}
          onPress={!isDisabled && !isLoading ? () => handleAddRequest(user.id) : null}
          activeOpacity={isDisabled ? 1 : 0.7}
          disabled={isDisabled || isLoading}
        >
          {getButtonContent()}
        </TouchableOpacity>
      </View>
    );
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
        setValue={handleInputChange}
      />

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : hasSearched && !userData ? (
        <Text style={styles.notFoundText}>User not found</Text>
      ) : userData ? (
        renderCard(userData)
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
  buttonText: {
    color: COLORS.background || '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  codeEntry: {
    marginBottom: 10,
  },
  notFoundText: {
    marginTop: 15,
    color: 'red',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  disabledText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
