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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocketContext } from '../context/SocketContext';
import { APIPATH } from '../utils/apiPath';
import { COLORS } from '../Color';

const { width, height } = Dimensions.get('window');

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { friendName, friendAvatar, friendId } = route.params || {};
  const Name = friendName?.toUpperCase() || 'FRIEND';

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [imageLoading, setImageLoading] = useState({});
  const [isOnline, setIsOnline] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [deliveredIds, setDeliveredIds] = useState(new Set());
  const [seenIds, setSeenIds] = useState(new Set());
  const [mediaModal, setMediaModal] = useState({ visible: false, uri: null, type: null, group: [], index: 0 });
  const [audioState, setAudioState] = useState({ playingId: null, isPlaying: false, position: 0, duration: 1 });

  const flatListRef = useRef(null);
  const soundObjectRef = useRef(new Audio.Sound());
  const socket = useContext(SocketContext);

  // --- 1. SETUP AND FETCHING LOGIC ---

  // Fetch UserId on component mount
  useEffect(() => {
    const init = async () => {
      try {
        const myId = await AsyncStorage.getItem('userId');
        setUserId(myId);
        if (socket && myId) {
          socket.emit('register', myId);
        }
      } catch (e) {
        console.error('Failed to load userId from AsyncStorage:', e);
      }
    };
    init();
  }, [socket]);
  
  // Fetch messages when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchMessages = async () => {
        if (!userId || !friendId) return;
        try {
          const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.FATCHCHAT}/${userId}/${friendId}`);
          setMessages(res.data);
          // Mark messages as seen when chat is opened
          if (socket && res.data.length > 0) {
              const messageIdsToMarkSeen = res.data
                  .filter(msg => msg.receiverId === userId && !seenIds.has(msg._id))
                  .map(msg => msg._id);
              if (messageIdsToMarkSeen.length > 0) {
                  socket.emit('mark_as_seen', { messageIds: messageIdsToMarkSeen, userId, friendId });
              }
          }
        } catch (err) {
          console.error('Fetch messages error:', err.response ? err.response.data : err.message);
        }
      };

      fetchMessages();
      
      // Cleanup audio on screen blur
      return () => {
        if (soundObjectRef.current._loaded) {
          soundObjectRef.current.unloadAsync();
        }
      };
    }, [userId, friendId, socket])
  );

  // --- 2. SOCKET.IO EVENT LISTENERS ---

  useEffect(() => {
    if (!socket || !userId) return;

    // Listener for new incoming messages
    const handleReceiveMessage = (newMessage) => {
      // Add message only if it belongs to this chat
      if (
        (newMessage.senderId === userId && newMessage.receiverId === friendId) ||
        (newMessage.senderId === friendId && newMessage.receiverId === userId)
      ) {
        setMessages((prevMessages) => {
          // Prevent duplicates by checking if message already exists
          if (prevMessages.some(msg => msg._id === newMessage._id)) {
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });
        // If the received message is not from me, mark it as seen
        if (newMessage.receiverId === userId) {
            socket.emit('mark_as_seen', { messageIds: [newMessage._id], userId, friendId });
        }
      }
    };

    // Other listeners
    const handleUserOnline = ({ userId: onlineUserId }) => { if (onlineUserId === friendId) setIsOnline(true); };
    const handleUserOffline = ({ userId: offlineUserId }) => { if (offlineUserId === friendId) setIsOnline(false); };
    const handleTyping = ({ senderId }) => {
      if (senderId === friendId) {
        setTypingUser(friendId);
        setTimeout(() => setTypingUser(null), 2500);
      }
    };
    const handleDelivered = ({ messageIds }) => setDeliveredIds(prev => new Set([...prev, ...messageIds]));
    const handleSeen = ({ messageIds }) => setSeenIds(prev => new Set([...prev, ...messageIds]));

    // Register listeners
    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('typing', handleTyping);
    socket.on('delivered', handleDelivered);
    socket.on('seen', handleSeen);

    // Check friend's initial online status
    socket.emit('check_online_status', { friendId });

    // Cleanup: remove listeners when component unmounts or dependencies change
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('typing', handleTyping);
      socket.off('delivered', handleDelivered);
      socket.off('seen', handleSeen);
    };
  }, [socket, userId, friendId]);
  
   // --- 3. MESSAGE SENDING AND ACTIONS ---

  const handleSend = async () => {
    if (!inputText.trim() || !userId || !friendId) return;

    if (isEditing && editingMessage) {
      // Edit logic remains RESTful for simplicity
      try {
        await axios.put(`${APIPATH.BASE_URL}/${APIPATH.EDITCHAT}/${editingMessage._id}`, { text: inputText });
        setMessages(prev => prev.map(msg => msg._id === editingMessage._id ? { ...msg, text: inputText } : msg));
        setIsEditing(false);
        setEditingMessage(null);
        setInputText('');
      } catch (err) {
        Alert.alert('Error', 'Failed to edit message.');
      }
    } else {
      // Send new message via Socket.io
      const tempId = `temp_${Date.now()}`; // Temporary ID for optimistic UI
      const newMessage = {
        _id: tempId,
        senderId: userId,
        receiverId: friendId,
        text: inputText,
        messageType: 'text',
        createdAt: new Date().toISOString(),
      };
      
      // Optimistic update
      setMessages(prev => [...prev, newMessage]);
      setInputText('');

      // Emit to server
      socket.emit('send_message', { ...newMessage, tempId }); // Send tempId to map later
    }
  };

  const uploadMedia = async (uri, type = 'image') => {
    if (!userId || !friendId) return;

    const formData = new FormData();
    formData.append('file', {
      uri,
      name: `media-${Date.now()}.${type === 'audio' ? 'm4a' : 'jpg'}`,
      type: type === 'audio' ? 'audio/m4a' : 'image/jpeg',
    });
    formData.append('senderId', userId);
    formData.append('receiverId', friendId);
    formData.append('messageType', type);

    try {
      // The backend should handle saving and then broadcasting via socket.
      // We are NOT adding the message to state here. We wait for the 'receive_message' event.
      await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SENDCHAT}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      console.error('Upload media error:', err.response ? err.response.data : err.message);
      Alert.alert('Error', 'Failed to upload media.');
    }
  };
  
  const handleDelete = async (messageId) => {
    try {
      await axios.delete(`${APIPATH.BASE_URL}/${APIPATH.DELETECHAT}/${messageId}`);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (err) {
      Alert.alert('Error', 'Could not delete message.');
    }
  };

  const handleLongPress = (item) => {
    if (item.senderId !== userId) return;
    const options = [];
    if (item.messageType === 'text') {
      options.push({ text: 'Edit', onPress: () => {
        setIsEditing(true);
        setEditingMessage(item);
        setInputText(item.text);
      }});
    }
    options.push({ text: 'Delete', onPress: () => handleDelete(item._id) });
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Message Options', '', options, { cancelable: true });
  };
  
  // --- 4. MEDIA HANDLERS (CAMERA, GALLERY, AUDIO) ---
  
  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets) {
      await uploadMedia(result.assets[0].uri, 'image');
    }
  };
  
  const handleGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled && result.assets) {
      await uploadMedia(result.assets[0].uri, 'image');
    }
  };
  
  const startRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Microphone permission is required.');
      return;
    }
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    if (uri) await uploadMedia(uri, 'audio');
  };

  // --- 5. RENDER LOGIC ---

  const renderMessageStatus = (item) => {
    if (item.senderId !== userId) return null;
    
    // Check if the ID is in the Set of seen/delivered messages
    const isSeen = seenIds.has(item._id);
    const isDelivered = deliveredIds.has(item._id);

    if (isSeen) {
      return <Text style={styles.statusIconSeen}>✓✓</Text>; // Double blue check for seen
    }
    if (isDelivered) {
      return <Text style={styles.statusIcon}>✓✓</Text>; // Double grey check for delivered
    }
    return <Text style={styles.statusIcon}>✓</Text>; // Single check for sent
  };

  const renderMessage = ({ item }) => {
    const isMine = item.senderId === userId;
    const isMedia = item.messageType === 'image' || item.messageType === 'gif';
    const isAudio = item.messageType === 'audio';
    
    // Ensure we have a valid URL
    const imageUrl = item.imageUrl && item.imageUrl.length > 0 ? item.imageUrl[0] : null;

    return (
      <TouchableOpacity onLongPress={() => handleLongPress(item)} activeOpacity={0.9}>
        <View style={[styles.messageContainer, isMine ? styles.myMessage : styles.theirMessage]}>
          {isMedia && imageUrl ? (
            <TouchableOpacity onPress={() => setMediaModal({ visible: true, uri: imageUrl, type: 'image' })}>
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.chatImage} 
                onLoadStart={() => setImageLoading(prev => ({ ...prev, [item._id]: true }))}
                onLoadEnd={() => setImageLoading(prev => ({ ...prev, [item._id]: false }))}
              />
              {imageLoading[item._id] && <ActivityIndicator style={StyleSheet.absoluteFill} color={COLORS.primary} />}
            </TouchableOpacity>
          ) : isAudio && item.audioUrl ? (
            <View>
              <Text style={styles.audioText}>Audio Message 🎤</Text>
            </View>
          ) : (
            <Text style={styles.messageText}>{item.text}</Text>
          )}
          <View style={styles.timestampContainer}>
            <Text style={styles.timestamp}>{moment(item.createdAt).format('hh:mm A')}</Text>
            {renderMessageStatus(item)}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  if (!userId || !friendId) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10 }}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={COLORS.headerText} />
        </TouchableOpacity>
        <Image source={{ uri: friendAvatar }} style={styles.avatar} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerName}>{Name}</Text>
          <Text style={styles.headerStatus}>
            {typingUser ? 'Typing...' : isOnline ? 'Active now' : 'Offline'}
          </Text>
        </View>
        <View style={styles.headerIcons}>
                  <TouchableOpacity><Icon name="phone" size={24} color={COLORS.headerText} /></TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 26 }}><Icon name="video" size={24} color={COLORS.headerText} /></TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id} // Use the unique _id from MongoDB
        renderItem={renderMessage}
        contentContainerStyle={styles.chatArea}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      
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

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleCamera}>
          <Ionicons name="camera-outline" size={24} color="#555" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleGallery}>
          <Ionicons name="image-outline" size={24} color="#555" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
          <MaterialCommunityIcons name="microphone-outline" size={24} color={recording ? COLORS.primary : '#555'} style={styles.icon} />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={(text) => {
            setInputText(text);
            socket.emit('typing', { senderId: userId, receiverId: friendId });
          }}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <Modal visible={mediaModal.visible} transparent animationType="fade" onRequestClose={() => setMediaModal({ visible: false, uri: null, type: null })}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
              <Image source={{ uri: mediaModal.uri }} style={{ width: width, height: height * 0.7, resizeMode: 'contain' }} />
          </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', backgroundColor: '#fff', paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 15, paddingHorizontal: 15, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.messageBorder },
  backButton: { padding: 5, marginRight: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  headerTextContainer: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  headerName: { fontSize: 18, fontWeight: '700', color: COLORS.headerText },
  headerStatus: { fontSize: 13, color: COLORS.statusText, fontStyle: 'italic', marginTop: 2 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  chatArea: { paddingHorizontal: 12, paddingBottom: 10 },
  messageContainer: { maxWidth: '80%', marginVertical: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 1 },
  myMessage: { backgroundColor: COLORS.myMessageBg, alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  theirMessage: { backgroundColor: COLORS.theirMessageBg, alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
  messageText: { color: COLORS.messageText, fontSize: 15 },
  chatImage: { width: width * 0.65, aspectRatio: 1, borderRadius: 8, resizeMode: 'cover' },
  audioText: { color: COLORS.audioText, fontStyle: 'italic' },
  timestampContainer: { flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', marginTop: 4 },
  timestamp: { fontSize: 10, color: '#666' },
  statusIcon: { fontSize: 14, color: '#666', marginLeft: 4 },
  statusIconSeen: { fontSize: 14, color: COLORS.seenStatus, marginLeft: 4 }, // Blue color for seen status
  inputContainer: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, alignItems: 'center', backgroundColor: '#fff', borderTopColor: '#eee', borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 25 : 8 },
  icon: { marginHorizontal: 6 },
  textInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.textInputBg, borderRadius: 20, marginHorizontal: 5, maxHeight: 120, fontSize: 15 },
  sendButton: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 25, marginLeft: 5 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.permissionBg },
  editingBanner: { backgroundColor: COLORS.editingBanner, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});