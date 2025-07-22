import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Vibration,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIPATH } from '../utils/apiPath';
import { COLORS } from '../Color';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import FloatingInput from './floatintext';

function useDebounce(callback, delay) {
  const timer = useRef();
  const debouncedCallback = useCallback((...args) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);

  useEffect(() => () => clearTimeout(timer.current), []);
  return debouncedCallback;
}

export default function AddUser() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCodeArray, setInputCodeArray] = useState(Array(10).fill(''));
  const inputRefs = useRef([]);
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [myUserId, setMyUserId] = useState('');
  const [sentRequests, setSentRequests] = useState([]);
  const [sendingRequestId, setSendingRequestId] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        const Token = await AsyncStorage.getItem('Token');
      
       
        const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?id=${id}`,  {  
           headers: {
             Authorization: `${Token}` 
                   },
  });
        setMyUserId(res.data.id);
       
        
        setSentRequests(res.data.sentRequests || []);
      } catch (err) {
        console.log('Error fetching self data:', err);
      }
    };
    fetchMyData();

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(require('../assets/beep.mp3'));
    await sound.playAsync();
  };

  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      const id = await AsyncStorage.getItem('userId');
      const Token = await AsyncStorage.getItem('Token');
      const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?id=${id}`,  {  
           headers: {
             Authorization: `${Token}` 
                   },
  });
      setGeneratedCode(res.data.code);
      setIsCodeGenerated(true);
      setTimeout(() => {
        setIsCodeGenerated(false);
        setGeneratedCode('');
      }, 60000);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (code) => {
    if (code.length !== 10 || !myUserId) {
      setUserData(null);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const Token = await AsyncStorage.getItem('Token')
      const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETCODE}?code=${code}`,  {  
           headers: {
             Authorization: `${Token}` 
                   },
  });
      const user = res.data;
     
     
      const isRequestPending = user.friendRequests?.includes(myUserId);
      const isFriend = user.friends?.includes(myUserId);
      // console.log(isRequestPending);
      // console.log(user.friends);
      

      if (user.id === myUserId) {
        setUserData(null);
        return;
      }

      setUserData({ ...user, isRequestPending, isFriend });
    } catch {
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchUserData = useDebounce(fetchUserData, 500);

  const handleAddRequest = async (receiverId) => {
    setSendingRequestId(receiverId);
    try {
      const id = await AsyncStorage.getItem('userId');
      const Token = await AsyncStorage.getItem('Token');
      const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?id=${id}`,  {  
           headers: {
             Authorization: `${Token}` 
                   },
  });
      const senderId = res.data.id;
      
      await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SEND_REQ}`, { senderId, receiverId },  {  
           headers: {
             Authorization: `${Token}` 
                   },
  });
      setSentRequests([...sentRequests, receiverId]);
      await fetchUserData(inputCodeArray.join(''));
    } catch (err) {
      console.log('Send error:', err?.response?.data?.message);
    } finally {
      setSendingRequestId(null);
    }
  };

  const handleInputChange = async (text, index) => {
    const char = text.slice(-1);
    const updated = [...inputCodeArray];
    updated[index] = char;
    setInputCodeArray(updated);

    if (char) {
      Vibration.vibrate(10);
      Haptics.selectionAsync();
      await playSound();
      if (index < 9) inputRefs.current[index + 1]?.focus();
    }

    const fullCode = updated.join('');
    if (!updated.includes('') && fullCode.length === 10) {
      Keyboard.dismiss(); 
      debouncedFetchUserData(fullCode);
    }
  };

  const renderCard = (user) => {
    const isDisabled = user.id === myUserId || user.isFriend || user.isRequestPending;
    return (
      <View
        style={{
          borderRadius: 20,
          padding: 18,
          marginBottom: 18,
          minHeight: 140,
          shadowColor: COLORS.cardShadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 24,
          elevation: 10,
          borderWidth: 1.5,
          borderColor: COLORS.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          position: 'relative',
          backgroundColor: COLORS.cardBg,
        }}
      >
        {/* Accent dot */}
        <View style={{ position: 'absolute', top: 16, left: 18, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent, opacity: 0.7, zIndex: 3, borderWidth: 2, borderColor: '#fff' }} />
        {/* Avatar with premium ring */}
        <View style={{
          shadowColor: COLORS.accent,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.18,
          shadowRadius: 8,
          elevation: 6,
          borderRadius: 40,
          backgroundColor: '#fff',
          padding: 3,
          borderWidth: 2,
          borderColor: COLORS.accent,
          marginRight: 18,
        }}>
          <Image
            source={user.avatarUrl && user.avatarUrl.startsWith('http') ? { uri: user.avatarUrl } : require('../assets/male.png')}
            style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: COLORS.white }}
          />
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 4, letterSpacing: 0.2 }}>{user.fullname}</Text>
          {/* Status pill */}
          {user.id === myUserId && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 3, minWidth: 70, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: COLORS.white, fontWeight: '600', letterSpacing: 0.2 }}>You</Text>
              </View>
            </View>
          )}
          <TouchableOpacity
            style={{
              marginTop: 0,
              backgroundColor:
                user.isFriend
                  ? COLORS.addfriendbtn // dark pink for Friend
                  : user.isRequestPending
                  ? COLORS.requestedButton // light orange for Requested
                  : COLORS.accent, // accent pink for Add
              borderRadius: 16,
              paddingVertical: 7,
              paddingHorizontal: 22,
              shadowColor:
                user.isFriend
                  ? COLORS.friendButton
                  : user.isRequestPending
                  ? COLORS.requestedButton
                  : COLORS.accent,
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 2,
              alignSelf: 'flex-start',
              opacity: isDisabled ? 0.7 : 1,
            }}
            disabled={isDisabled}
            onPress={() => handleAddRequest(user.id)}
          >
            {sendingRequestId === user.id ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 14 }}>
                {user.id === myUserId ? 'You' : user.isFriend ? 'Friend' : user.isRequestPending ? 'Requested' : 'Add'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: COLORS.background }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={{ padding: 25, paddingTop: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: COLORS.cardBg,
            borderRadius: 16,
            marginBottom: 24,
            padding: 18,
            shadowColor: COLORS.cardShadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionTitle}>Follow These 3 Simple Steps:</Text>
            <Text style={styles.instructionText}>1. Tap "Generate Code" to get your unique 10-digit code.</Text>
            <Text style={styles.instructionText}>2. Enter a friend's 10-digit code below to find them.</Text>
            <Text style={styles.instructionText}>3. Send a friend request by tapping the "Add" button.</Text>
          </View>
        </View>

        <TouchableOpacity
          disabled={isCodeGenerated || loading}
          onPress={handleGenerateCode}
          activeOpacity={0.85}
        >
          <View
            style={{
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: 'center',
              marginBottom: 10,
              backgroundColor: COLORS.addfriendbtn,
              shadowColor: COLORS.addfriendbtn,
              shadowOpacity: 0.13,
              shadowRadius: 8,
              elevation: 3,
              opacity: isCodeGenerated || loading ? 0.6 : 1,
            }}
          >
            <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }}>
              {isCodeGenerated ? 'Generated Code' : loading ? 'Generating...' : 'Generate My Code'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.codeRow}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={i} style={[styles.displayBox, { borderColor: COLORS.primary, backgroundColor: COLORS.backgroundLight, borderRadius: 8 }]}>
              <Text style={styles.codeDigit}>{generatedCode[i] || ''}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.orText}>OR</Text>

        <FloatingInput
          style={[styles.inputBox, { width: 240, textAlign: 'center', letterSpacing: 2 }]}
          label="Enter 10-digit code"
          maxLength={10}
          keyboardType="numeric"
          numeric='true'
          value={inputCodeArray.join('')}
          setValue={(text) => {
            const digits = text.replace(/[^0-9]/g, '').slice(0, 10).split('');
            setInputCodeArray(Array(10).fill('').map((_, i) => digits[i] || ''));
            if (digits.length === 10) {
              Keyboard.dismiss();
              debouncedFetchUserData(digits.join(''));
            } else {
              setUserData(null);
              setHasSearched(false);
            }
          }}
        />

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : hasSearched && !userData ? (
          <Text style={styles.notFound}>User not found</Text>
        ) : userData ? (
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: 18, marginBottom: 10 }}>
            {renderCard(userData)}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, paddingTop: 60, backgroundColor: COLORS.backgroundLight },
  generateButton: {
    backgroundColor: COLORS.addfriendbtn,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: { backgroundColor: '#aaa' },
  buttonText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  orText: { textAlign: 'center', marginVertical: 18, color: COLORS.text, fontWeight: '600' },
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 15 },
  displayBox: {
    width: 32,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
  },
  codeDigit: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  inputBox: {
    width: 32,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.white,
    textAlign: 'center',
    fontSize: 18,
    color: COLORS.text,
  },
  notFound: { marginTop: 15, textAlign: 'center', color: COLORS.error },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  instructionsContainer: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#5599ff',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: COLORS.text,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 6,
    fontWeight: '600',
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  name: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.text },
  button: {
    backgroundColor: COLORS.addfriendbtn,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
});
