import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  ActivityIndicator,
  Modal,
  BackHandler,
  Linking,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import usePermissions from '../hooks/usePermissions'; // Ensure this hook is correctly implemented
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../Color'; // Ensure COLORS is correctly defined
import axios from 'axios';
import { APIPATH } from '../utils/apiPath'; // Ensure APIPATH is correctly defined
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { SocketContext } from '../context/SocketContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  // Ensure friendName, friendAvatar, friendId are passed correctly via route.params
  const { friendName, friendAvatar, friendId } = route.params || {}; // Add fallback empty object
  const Name = friendName?.toUpperCase() || 'FRIEND';

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [imageLoading, setImageLoading] = useState({}); // State to track individual image loading
  const scrollViewRef = useRef(null);
  const permissionsGranted = usePermissions(); // Custom hook for permissions
  const soundObjectRef = useRef(new Audio.Sound());
  const socket = useContext(SocketContext);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [deliveredIds, setDeliveredIds] = useState([]);
  const [seenIds, setSeenIds] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [mediaModal, setMediaModal] = useState({ visible: false, uri: null, type: null, group: [], index: 0 });
  const [audioState, setAudioState] = useState({
    playingId: null,
    isPlaying: false,
    position: 0,
    duration: 1,
  });

  // Helper to format time
  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Play/Pause/Seek logic
  const playPauseAudio = async (uri, id) => {
    try {
      if (audioState.playingId === id && audioState.isPlaying) {
        await soundObjectRef.current.pauseAsync();
        setAudioState((s) => ({ ...s, isPlaying: false }));
        return;
      }
      if (audioState.playingId === id && !audioState.isPlaying) {
        await soundObjectRef.current.playAsync();
        setAudioState((s) => ({ ...s, isPlaying: true }));
        return;
      }
      if (soundObjectRef.current && soundObjectRef.current._loaded) {
        await soundObjectRef.current.unloadAsync();
      }
      const { sound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (playbackStatus) => {
          if (!playbackStatus.isLoaded) return;
          setAudioState((s) => ({
            ...s,
            position: playbackStatus.positionMillis,
            duration: playbackStatus.durationMillis || 1,
            isPlaying: playbackStatus.isPlaying,
          }));
          if (playbackStatus.didJustFinish) {
            setAudioState({ playingId: null, isPlaying: false, position: 0, duration: 1 });
          }
        }
      );
      soundObjectRef.current = sound;
      setAudioState({ playingId: id, isPlaying: true, position: 0, duration: status.durationMillis || 1 });
    } catch (err) {
      Alert.alert('Error', 'Could not play audio.');
    }
  };

  const seekAudio = async (value) => {
    if (soundObjectRef.current && audioState.playingId) {
      await soundObjectRef.current.setPositionAsync(value);
      setAudioState((s) => ({ ...s, position: value }));
    }
  };

  useEffect(() => {
    if (mediaModal.visible) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        setMediaModal({ visible: false, uri: null, type: null, group: [], index: 0 });
        return true;
      });
      return () => backHandler.remove();
    }
  }, [mediaModal.visible]);

  useEffect(() => {
    const init = async () => {
      try {
        const Myid = await AsyncStorage.getItem('userId');
        setUserId(Myid);
        if (socket && Myid) {
          socket.emit('register', Myid);
        }
        console.log('Current User ID from AsyncStorage:', Myid); // Debugging
      } catch (e) {
        console.error('Failed to load userId from AsyncStorage:', e);
      }
    };
    init();
    // Listen for incoming messages
    if (socket) {
      socket.on('receive_message', (msg) => {
        // Only add if for this chat
        if (
          (msg.senderId === userId && msg.receiverId === friendId) ||
          (msg.senderId === friendId && msg.receiverId === userId)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      });
    }
    // On mount, emit seen for all messages
    if (socket && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.receiverId === userId) {
        socket.emit('seen', { messageId: lastMsg._id, userId, friendId });
      }
    }
    // Cleanup
    return () => {
      if (socket) {
        socket.off('receive_message');
      }
    };
  }, [socket, userId, friendId, messages]);

  useEffect(() => {
    if (socket) {
      setSocketConnected(socket.connected);
      socket.on('connect', () => setSocketConnected(true));
      socket.on('disconnect', () => setSocketConnected(false));
      socket.on('user_online', ({ userId }) => {
        if (userId === friendId) setIsOnline(true);
      });
      socket.on('user_offline', ({ userId }) => {
        if (userId === friendId) setIsOnline(false);
      });
      socket.on('typing', ({ senderId }) => {
        if (senderId === friendId) {
          setTypingUser(friendId);
          setTimeout(() => setTypingUser(null), 2000);
        }
      });
      socket.on('delivered', ({ messageId, receiverId }) => {
        if (receiverId === friendId) setDeliveredIds((prev) => [...prev, messageId]);
      });
      socket.on('seen', ({ messageId, userId }) => {
        if (userId === friendId) setSeenIds((prev) => [...prev, messageId]);
      });
    }
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('user_online');
        socket.off('user_offline');
        socket.off('typing');
        socket.off('delivered');
        socket.off('seen');
      }
    };
  }, [socket, friendId, userId, messages]);

  const fetchMessages = async () => {
    if (!userId || !friendId) {
      console.log('Skipping fetch messages: userId or friendId is missing', { userId, friendId });
      return;
    }
    try {
      console.log(`Attempting to fetch messages from: ${APIPATH.BASE_URL}/${APIPATH.FATCHCHAT}/${userId}/${friendId}`);
      const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.FATCHCHAT}/${userId}/${friendId}`);
      console.log('Fetched Messages Data (Check imageUrls here):', JSON.stringify(res.data, null, 2)); // Detailed log
      setMessages(res.data);
    } catch (err) {
      console.error('Fetch messages error:', err.response ? err.response.data : err.message);
      Alert.alert('Error', 'Failed to fetch messages. Please try again.');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Only fetch messages if userId and friendId are available
      if (userId && friendId) {
        fetchMessages();
      } else {
        console.log('Not fetching messages yet, missing userId or friendId in useFocusEffect', { userId, friendId });
      }

      // Cleanup function for audio player when leaving screen
      return () => {
        if (soundObjectRef.current && soundObjectRef.current._loaded) {
          soundObjectRef.current.unloadAsync();
        }
      };
    }, [userId, friendId]) // Added friendId to dependencies for re-fetching when friend changes
  );

  const handleSend = async () => {
    if (!inputText.trim() || !userId) {
      console.log('Cannot send: input empty or userId missing', { inputText, userId });
      return;
    }
    try {
      if (isEditing && editingMessage) {
        // Keep REST for editing
        await axios.put(`${APIPATH.BASE_URL}/${APIPATH.EDITCHAT}/${editingMessage._id}`, {
          text: inputText,
        });
        setMessages(prev =>
          prev.map(msg => (msg._id === editingMessage._id ? { ...msg, text: inputText } : msg))
        );
        setIsEditing(false);
        setEditingMessage(null);
      } else {
        // Use socket for sending
        if (socket) {
          socket.emit('send_message', {
            senderId: userId,
            receiverId: friendId,
            text: inputText,
            messageType: 'text',
          });
        }
        // Optionally, keep REST for persistence (optional, can remove)
        // const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SENDCHAT}`, {
        //   senderId: userId,
        //   receiverId: friendId,
        //   text: inputText,
        //   messageType: 'text',
        // });
        // setMessages(prev => [...prev, res.data]);
      }
      setInputText('');
    } catch (err) {
      console.error('Send/Edit error:', err.response ? err.response.data : err.message);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleInputChange = (text) => {
    setInputText(text);
    if (socket && userId && friendId) {
      socket.emit('typing', { senderId: userId, receiverId: friendId });
    }
  };

  const uploadMedia = async (uri, type = 'image') => {
    if (!userId) {
      Alert.alert('Error', 'User ID not available. Cannot upload media.');
      return;
    }
    if (!friendId) {
      Alert.alert('Error', 'Friend ID not available. Cannot upload media.');
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri,
      
      name: `media-${Date.now()}.${type === 'audio' ? 'm4a' : (type === 'image' ? 'jpg' : 'gif')}`,
      type: type === 'audio' ? 'audio/m4a' : (type === 'image' ? 'image/jpeg' : 'image/gif'),
    });
    formData.append('senderId', userId);
    formData.append('receiverId', friendId);
    formData.append('messageType', type);

    try {
      console.log(`Attempting to upload media (${type}) with URI:`, uri);
      const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SENDCHAT}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // IMPORTANT: Check this log for the 'imageUrl' or 'audioUrl' returned by your backend!
      console.log('Upload Media Response Data (Check imageUrl/audioUrl here):', JSON.stringify(res.data, null, 2));
      setMessages(prev => [...prev, res.data]);
      // Emit socket event for real-time delivery
      if (socket) {
        socket.emit('send_message', res.data);
      }
    } catch (err) {
      console.error('Upload media error:', err.response ? err.response.data : err.message);
      Alert.alert('Error', 'Failed to upload media. Please try again.');
    }
  };

  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        // Re-request permission popup
        await ImagePicker.requestCameraPermissionsAsync();
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadMedia(result.assets[0].uri, 'image');
      }
    } catch (error) {
      console.error('Error launching camera:', error);
      // Do not show error, just return
      return;
    }
  };

  const handleGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        // Re-request permission popup
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images from gallery
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadMedia(result.assets[0].uri, 'image');
      }
    } catch (error) {
      console.error('Error launching image library:', error);
      // Do not show error, just return
      return;
    }
  };

  const startRecording = async () => {
    // Ensure any previous recording is fully cleaned up
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {
        // Ignore errors
      }
      setRecording(null);
    }
    try {
      const DuckOthers = Audio?.InterruptionModeAndroid?.DuckOthers ?? 1;
      const DuckOthersIOS = Audio?.InterruptionModeIOS?.DuckOthers ?? 1;
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        // Re-request permission popup
        const { status: retryStatus } = await Audio.requestPermissionsAsync();
        if (retryStatus !== 'granted') {
          Alert.alert(
            'Microphone Permission Needed',
            'Microphone permission is denied. Please enable it in your device settings.',
            [
              {
                text: 'Open Settings',
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                }
              },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: DuckOthers,
        interruptionModeIOS: DuckOthersIOS,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(newRecording);
      Alert.alert('Recording Started', 'Tap microphone again to stop.');
    } catch (err) {
      console.error('Start recording error:', err);
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions and try again.');
      setRecording(null);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (uri) {
        await uploadMedia(uri, 'audio');
      } else {
        Alert.alert('Error', 'Recording URI is null after stopping.');
      }
    } catch (err) {
      console.error('Stop recording error:', err);
      Alert.alert('Error', 'Failed to stop recording or upload audio. Try again.');
      setRecording(null);
    }
  };

  const playAudio = async (uri) => {
    try {
      if (!uri) {
        Alert.alert('Error', 'Audio URL is missing.');
        return;
      }
      if (soundObjectRef.current && soundObjectRef.current._loaded) {
        await soundObjectRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri });
      soundObjectRef.current = sound;
      await sound.playAsync();
      console.log('Playing audio from:', uri);
    } catch (err) {
      console.error('Play audio error for URL:', uri, 'Error:', err);
      Alert.alert('Error', 'Could not play audio. Please ensure the URL is valid and the file exists. ' + err.message);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      console.log('Deleting message:', messageId);
      await axios.delete(`${APIPATH.BASE_URL}/${APIPATH.DELETECHAT}/${messageId}`);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      Alert.alert('Success', 'Message deleted.');
    } catch (err) {
      console.error('Delete error:', err.response ? err.response.data : err.message);
      Alert.alert('Error', 'Could not delete message. Please try again.');
    }
  };

  const handleLongPress = (item) => {
    
    if (item.senderId !== userId) {
      Alert.alert('Message Options', 'You can only interact with your own messages.', [{ text: 'OK' }]);
      return;
    }

    const options = [];

    if (item.messageType === 'text') {
      options.push({ text: 'Edit', onPress: () => handleEdit(item) });
    }

    options.push({ text: 'Delete', onPress: () => handleDelete(item._id) });
    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Message Options', '', options, { cancelable: true });
  };

  const handleEdit = (message) => {
    setIsEditing(true);
    setEditingMessage(message);
    setInputText(message.text);
  };

  const renderMessage = ({ item }) => {
    const isMine = item.senderId === userId;
    const isImageOrGif = item.messageType === 'image' || item.messageType === 'gif';
    const isVideo = item.messageType === 'video';
    const isAudio = item.messageType === 'audio';
    const delivered = deliveredIds.includes(item._id);
    const seen = seenIds.includes(item._id);

    // Grouped images logic (if item.images is an array of image URLs)
    const images = Array.isArray(item.images) && item.images.length > 0 ? item.images : item.imageUrl ? [item.imageUrl] : [];
    const showGroup = images.length >= 4;

    return (
      <TouchableOpacity onLongPress={() => handleLongPress(item)} activeOpacity={1}>
        <View style={[
          styles.messageContainer,
          isMine ? styles.myMessage : styles.theirMessage,
          { flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', padding: isImageOrGif || isVideo ? 0 : 10, minWidth: isImageOrGif || isVideo ? 90 : undefined }
        ]}>
          {/* Text message */}
          {item.messageType === 'text' && (
            <Text style={styles.messageText}>{item.text}</Text>
          )}

          {/* Grouped images (4+) */}
          {showGroup && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
              {images.slice(0, 4).map((img, idx) => (
                <TouchableOpacity
                  key={img + idx}
                  activeOpacity={0.85}
                  onPress={() => setMediaModal({ visible: true, uri: img, type: 'image', group: images, index: idx })}
                  style={{
                    marginLeft: idx === 0 ? 0 : -18,
                    zIndex: 10 - idx,
                    borderRadius: 8,
                    overflow: 'hidden',
                    borderWidth: 0.5,
                    borderColor: '#bbb',
                    backgroundColor: '#f0f0f0',
                  }}
                >
                  <Image
                    source={{ uri: img }}
                    style={{ width: width * 0.3, height: width * 0.3, borderRadius: 8 }}
                  />
                  <View style={{ position: 'absolute', bottom: 6, right: 8, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: '#fff', fontSize: 11 }}>{moment(item.createdAt).format('hh:mm A')}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {images.length > 4 && (
                <View style={{ marginLeft: -18, zIndex: 1, borderRadius: 8, backgroundColor: '#e75480', width: width * 0.3, height: width * 0.3, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>+{images.length - 4}</Text>
                </View>
              )}
            </View>
          )}

          {/* Single image (or <4 images) */}
          {!showGroup && isImageOrGif && images.length === 1 && images[0] && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setMediaModal({ visible: true, uri: images[0], type: 'image', group: images, index: 0 })}
              style={{ alignItems: isMine ? 'flex-end' : 'flex-start', width: width * 0.3 }}
            >
              {imageLoading[item._id] && <ActivityIndicator size="small" color={COLORS.primary} style={styles.imageLoadingIndicator} />}
              <Image
                source={{ uri: images[0] }}
                style={{ width: '100%', aspectRatio: 1, borderRadius: 8, marginTop: 2, marginBottom: 2, backgroundColor: '#f0f0f0', borderWidth: 0.5, borderColor: '#bbb' }}
                onLoadStart={() => setImageLoading(prev => ({ ...prev, [item._id]: true }))}
                onLoadEnd={() => setImageLoading(prev => ({ ...prev, [item._id]: false }))}
                onError={(e) => {
                  setImageLoading(prev => ({ ...prev, [item._id]: false }));
                }}
              />
              <View style={{ position: 'absolute', bottom: 6, right: 8, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: '#fff', fontSize: 11 }}>{moment(item.createdAt).format('hh:mm A')}</Text>
              </View>
              {item.text && item.text.trim() !== '' && (
                <Text style={{ fontSize: 14, color: '#232323', marginTop: 4, marginBottom: 2, textAlign: isMine ? 'right' : 'left', backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignSelf: isMine ? 'flex-end' : 'flex-start' }}>{item.text}</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Video message (same as before, can add grouping if needed) */}
          {isVideo && item.videoUrl ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setMediaModal({ visible: true, uri: item.videoUrl, type: 'video', group: [item.videoUrl], index: 0 })}
              style={{ alignItems: isMine ? 'flex-end' : 'flex-start', width: width * 0.3 }}
            >
              <View style={{ width: '100%', aspectRatio: 1, borderRadius: 8, marginTop: 2, marginBottom: 2, backgroundColor: '#000', borderWidth: 2, borderColor: '#e75480', justifyContent: 'center', alignItems: 'center' }}>
                <Icon name="play-circle" size={32} color="#fff" />
              </View>
            </TouchableOpacity>
          ) : isVideo && !item.videoUrl ? (
            <Text style={styles.messageText}>Video unavailable. Missing URL.</Text>
          ) : null}

          {/* Audio message */}
          {isAudio && item.audioUrl ? (
            <View style={{ backgroundColor: '#f0f0f0', borderRadius: 8, padding: 8, marginTop: 2, marginBottom: 2, width: width * 0.6 }}>
              <TouchableOpacity onPress={() => playPauseAudio(item.audioUrl, item._id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={audioState.playingId === item._id && audioState.isPlaying ? 'pause-circle' : 'play-circle'} size={28} color="#e75480" style={{ marginRight: 8 }} />
                <Text style={{ color: '#232323', fontWeight: '500' }}>{audioState.playingId === item._id && audioState.isPlaying ? 'Pause' : 'Play'} Audio</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={{ fontSize: 11, color: '#888', width: 38 }}>{formatTime(audioState.playingId === item._id ? audioState.position : 0)}</Text>
                <View style={{ flex: 1, height: 4, backgroundColor: '#eee', borderRadius: 2, marginHorizontal: 6, overflow: 'hidden' }}>
                  <View style={{ width: `${((audioState.playingId === item._id ? audioState.position : 0) / (audioState.playingId === item._id ? audioState.duration : 1)) * 100}%`, height: 4, backgroundColor: '#e75480' }} />
                </View>
                <Text style={{ fontSize: 11, color: '#888', width: 38, textAlign: 'right' }}>{formatTime(audioState.playingId === item._id ? audioState.duration : 0)}</Text>
              </View>
            </View>
          ) : isAudio && !item.audioUrl ? (
            <Text style={styles.messageText}>Audio unavailable. Missing URL.</Text>
          ) : null}

          <Text style={[styles.timestamp, isMine ? styles.myTimestamp : styles.theirTimestamp]}>
            {moment(item.createdAt).format('hh:mm A')}
            {isMine && delivered && ' ✓'}
            {isMine && seen && ' ✓✓'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!permissionsGranted || userId === null || friendId === undefined) { // Check friendId as well
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10 }}>Loading chat and permissions...</Text>
        {userId === null && <Text>User not logged in or ID not loaded.</Text>}
        {friendId === undefined && <Text>Friend information not loaded.</Text>}
        {!permissionsGranted && <Text>Permissions not granted.</Text>}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      {/* Remove old connection and online status bar */}
      {/* Connection and online status */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
        <Text style={{ color: socketConnected ? 'green' : 'red', marginRight: 8 }}>
          {socketConnected ? 'Connected' : 'Disconnected'}
        </Text>
        <Text style={{ color: isOnline ? 'green' : 'gray' }}>
          {isOnline ? 'Friend Online' : 'Friend Offline'}
        </Text>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color="#232323" />
      </TouchableOpacity>

      <View style={[styles.header, { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', borderRadius: 0, marginHorizontal: 0, marginTop: 0, elevation: 0, shadowColor: 'transparent' }]}> 
        <Image source={{ uri: friendAvatar }} style={styles.avatar} />
        <View style={{ flex: 1, marginLeft: 15, justifyContent: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#232323', letterSpacing: 0.2, textAlign: 'left' }}>{Name}</Text>
          {/* Online/offline status below name */}
          <Text style={{ fontSize: 13, color: isOnline ? '#10B981' : '#bbb', fontStyle: 'italic', marginTop: 2, textAlign: 'left' }}>
            {isOnline ? 'Active now' : 'Offline'}
          </Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity><Icon name="phone" size={24} color="#232323" /></TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 26 }}><Icon name="video" size={24} color="#232323" /></TouchableOpacity>
        </View>
      </View>
      {/* Typing indicator */}
      {typingUser && (
        <Text style={{ marginLeft: 20, color: 'gray', fontStyle: 'italic' }}>Typing...</Text>
      )}

      <FlatList
        ref={scrollViewRef}
        data={messages}
        keyExtractor={item => item._id || item.id || `msg-${Math.random().toString()}`} // More robust key
        renderItem={renderMessage}
        contentContainerStyle={styles.chatArea}
        // These ensure scrolling to bottom on new messages or keyboard open
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        {isEditing && (
          <View style={styles.editingBanner}>
            <Text style={{ color: 'grey' }}>Editing message...</Text>
            <TouchableOpacity onPress={() => {
              setIsEditing(false);
              setEditingMessage(null);
              setInputText('');
            }}>
              <Icon name="close-circle" size={20} color="grey" />
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity onPress={handleCamera}>
          <Ionicons name="camera-outline" size={24} color="#232323" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleGallery}>
          <Ionicons name="image-outline" size={24} color="#232323" style={styles.icon} />
        </TouchableOpacity>
        {/* Removed the GIF sticker emoji button as per previous request */}
        <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
          <MaterialCommunityIcons name={recording ? 'stop-circle-outline' : 'microphone-outline'} size={24} color={recording ? '#e75480' : '#bbb'} style={styles.icon} />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message"
          value={inputText}
          onChangeText={handleInputChange}
          multiline
        />
        <TouchableOpacity onPress={handleSend}>
          <Ionicons name="send" size={26} color="#e75480" style={styles.icon} />
        </TouchableOpacity>
      </View>
      {/* Media Modal for viewing images/videos fullscreen */}
      <Modal visible={mediaModal.visible} transparent animationType="fade" onRequestClose={() => setMediaModal({ visible: false, uri: null, type: null, group: [], index: 0 })}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
          {mediaModal.type === 'image' && mediaModal.group.length > 1 ? (
            <FlatList
              data={mediaModal.group}
              horizontal
              pagingEnabled
              initialScrollIndex={mediaModal.index}
              getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
              renderItem={({ item: img }) => (
                <Image source={{ uri: img }} style={{ width: width, height: height * 0.7, resizeMode: 'contain' }} />
              )}
              keyExtractor={(img, idx) => img + idx}
              showsHorizontalScrollIndicator={false}
            />
          ) : mediaModal.type === 'image' ? (
            <Image source={{ uri: mediaModal.uri }} style={{ width: width, height: height * 0.7, resizeMode: 'contain' }} />
          ) : null}
          {mediaModal.type === 'video' && (
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Video player coming soon</Text>
            // You can use expo-av or react-native-video for actual video playback
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F9',
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Adjust for iOS status bar
    paddingBottom: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20, // Adjust top for iOS status bar
    left: 15,
    zIndex: 999,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 30, // Adjusted to make space for the back button
  },
  name: {
    flex: 1,
    marginLeft: 15,
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatArea: {
    padding: 12,
    paddingBottom: 80, // Ensure enough padding at the bottom for the input
  },
  messageContainer: {
    maxWidth: '75%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  myMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-end',
    marginRight: 5, // Small margin to prevent sticking to edge
  },
  theirMessage: {
    backgroundColor: '#f9f9f9',
    alignSelf: 'flex-start',
    marginLeft: 5, // Small margin
  },
  messageText: {
    color: '#232323',
  },
  chatImage: {
    width: width * 0.65, // Make image width responsive, max 65% of screen width
    aspectRatio: 1, // Maintain aspect ratio (1:1 for square, adjust as needed)
    borderRadius: 8,
    resizeMode: 'cover',
    marginTop: 5,
    marginBottom: 5,
  },
  imageLoadingIndicator: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    zIndex: 1,
    transform: [{ translateX: -12 }, { translateY: -12 }], // Center the indicator
  },
  imageCaptionText: {
    marginTop: 5,
    fontSize: 14,
    color: '#333',
  },
  audioText: {
    color: 'green',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  timestamp: {
    marginTop: 4,
    fontSize: 10,
    color: '#666', // Changed color for better readability
  },
  myTimestamp: {
    alignSelf: 'flex-end',
  },
  theirTimestamp: {
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopColor: '#eee',
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    minHeight: 60,
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8, // Add padding for iPhone X/newer models' safe area
  },
  icon: {
    marginHorizontal: 6,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginHorizontal: 8,
    maxHeight: 120, // To prevent the input from growing too large
    minHeight: 40, // Minimum height for single line
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
  },
  editingBanner: {
    position: 'absolute',
    top: -35,
    left: 0,
    right: 0,
    backgroundColor: '#ffebcd',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 8,
    borderColor: '#ffc87c',
    borderWidth: 1,
    zIndex: 10, // Ensure it's above the input bar
  },
});