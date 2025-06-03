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
import Card from '../components/card';
import { COLORS } from '../Color';

function useDebounce(callback, delay) {
  const timer = useRef();
  const debouncedCallback = useCallback((...args) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

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
    const fetchMyUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${email}`);
        setMyUserId(res.data.id);
        setMyFriends(res.data.friends || []);

        const reqRes = await axios.get(`${APIPATH.BASE_URL}/friendRequests/sent?userId=${res.data.id}`);
        setSentRequests(reqRes.data.requests || []);
      } catch (err) {
        console.log('Failed to get user data:', err);
      }
    };

    fetchMyUserData();
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

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETCODE}?code=${code}`);
      if (response.data.id === myUserId) {
        setUserData(null);
        return;
      }
      setUserData(response.data);
    } catch (error) {
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchUserData = useDebounce(fetchUserData, 500);

  const handleInputChange = (text) => {
    setInputCode(text);
    if (text.trim().length === 10 && myUserId) {
      debouncedFetchUserData(text.trim());
    } else {
      setUserData(null);
      setHasSearched(false);
    }
  };

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
    } catch (err) {
      console.log('Send request error:', err?.response?.data?.message);
    } finally {
      setSendingRequestId(null);
    }
  };

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
        setValue={handleInputChange}
      />

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : hasSearched && !userData ? (
        <Text style={styles.notFoundText}>User not found</Text>
      ) : userData ? (
        <Card
          username={userData.fullname}
          avatarUrl={userData.avatarUrl || require('../assets/avatar.png')}
          mode="addUser"
          isAdded={isUserAddedOrRequested(userData.id)}
          isLoading={sendingRequestId === userData.id}
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
});
