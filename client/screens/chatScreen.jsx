import React, { useState, useRef, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import usePermissions from '../hooks/usePermissions'; // Ensure this hook is correctly implemented
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../Color'; // Ensure COLORS is correctly defined
import axios from 'axios';
import { APIPATH } from '../utils/apiPath'; // Ensure APIPATH is correctly defined
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

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

  useEffect(() => {
    const init = async () => {
      try {
        const Myid = await AsyncStorage.getItem('userId');
        setUserId(Myid);
        console.log('Current User ID from AsyncStorage:', Myid); // Debugging
      } catch (e) {
        console.error('Failed to load userId from AsyncStorage:', e);
      }
    };
    init();
  }, []);

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
    useCallback(() => {
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
        console.log('Editing message:', editingMessage._id, 'with text:', inputText);
        await axios.put(`${APIPATH.BASE_URL}/${APIPATH.EDITCHAT}/${editingMessage._id}`, {
          text: inputText,
        });
        setMessages(prev =>
          prev.map(msg => (msg._id === editingMessage._id ? { ...msg, text: inputText } : msg))
        );
        setIsEditing(false);
        setEditingMessage(null);
      } else {
        console.log('Sending new text message:', inputText);
        const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SENDCHAT}`, {
          senderId: userId,
          receiverId: friendId,
          text: inputText,
          messageType: 'text',
        });
        console.log('New Text Message Response:', JSON.stringify(res.data, null, 2)); // Detailed log
        setMessages(prev => [...prev, res.data]);
      }
      setInputText('');
    } catch (err) {
      console.error('Send/Edit error:', err.response ? err.response.data : err.message);
      Alert.alert('Error', 'Failed to send message. Please try again.');
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
    } catch (err) {
      console.error('Upload media error:', err.response ? err.response.data : err.message);
      Alert.alert('Error', 'Failed to upload media. Please try again.');
    }
  };

  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadMedia(result.assets[0].uri, 'image');
      }
    } catch (error) {
      console.error('Error launching camera:', error);
      Alert.alert('Error', 'Could not open camera. Please check permissions or try again.');
    }
  };

  const handleGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Media library permission is required to pick photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images from gallery
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadMedia(result.assets[0].uri, 'image');
      }
    } catch (error) {
      console.error('Error launching image library:', error);
      Alert.alert('Error', 'Could not open gallery. Please check permissions or try again.');
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Microphone permission is required for audio recording.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.InterruptionModeAndroid.DuckOthers,
        interruptionModeIOS: Audio.InterruptionModeIOS.DuckOthers,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      Alert.alert('Recording Started', 'Tap microphone again to stop.');
    } catch (err) {
      console.error('Start recording error:', err);
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions and try again.');
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
    const isAudio = item.messageType === 'audio';

   
    return (
      <TouchableOpacity onLongPress={() => handleLongPress(item)}>
        <View style={[styles.messageContainer, isMine ? styles.myMessage : styles.theirMessage]}>
          {item.messageType === 'text' && <Text style={styles.messageText}>{item.text}</Text>}

          {/* Conditional rendering for Image/GIF */}
          {isImageOrGif && item.imageUrl ? ( // Ensure imageUrl exists
            <View>
              {imageLoading[item._id] && <ActivityIndicator size="small" color={COLORS.primary} style={styles.imageLoadingIndicator} />}
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.chatImage}
                onLoadStart={() => {
                    // console.log('Image Load Start:', item.imageUrl);
                    setImageLoading(prev => ({ ...prev, [item._id]: true }))
                }}
                onLoadEnd={() => {
                    // console.log('Image Load End:', item.imageUrl);
                    setImageLoading(prev => ({ ...prev, [item._id]: false }))
                }}
                onError={(e) => {
                  console.error(`Image Load Error for message ID ${item._id} (URL: ${item.imageUrl}):`, e.nativeEvent.error);
                  setImageLoading(prev => ({ ...prev, [item._id]: false }));
                  // You might want to display a broken image icon or text here instead
                }}
              />
              {item.text && item.text.trim() !== '' && <Text style={styles.imageCaptionText}>{item.text}</Text>}
            </View>
          ) : isImageOrGif && !item.imageUrl ? (
            // Fallback for image/gif if imageUrl is missing
            <Text style={styles.messageText}>Image/GIF unavailable. Missing URL.</Text>
          ) : null}

          {/* Conditional rendering for Audio */}
          {isAudio && item.audioUrl ? ( // Ensure audioUrl exists
            <TouchableOpacity onPress={() => playAudio(item.audioUrl)}>
              <Text style={styles.audioText}>
                <Icon name="play-circle" size={20} color="green" /> Play Audio
              </Text>
            </TouchableOpacity>
          ) : isAudio && !item.audioUrl ? (
            // Fallback for audio if audioUrl is missing
            <Text style={styles.messageText}>Audio unavailable. Missing URL.</Text>
          ) : null}

          <Text style={[styles.timestamp, isMine ? styles.myTimestamp : styles.theirTimestamp]}>
            {moment(item.createdAt).format('hh:mm A')}
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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={"black"} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Image source={{ uri: friendAvatar }} style={styles.avatar} />
        <Text style={styles.name}>{Name}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity><Icon name="phone" size={24} color="black" /></TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 26 }}><Icon name="video" size={24} color="black" /></TouchableOpacity>
        </View>
      </View>

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
          <Icon name="camera" size={24} color="grey" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleGallery}>
          <Icon name="image" size={24} color="grey" style={styles.icon} />
        </TouchableOpacity>
        {/* Removed the GIF sticker emoji button as per previous request */}
        <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
          <Icon name={recording ? 'stop' : 'microphone'} size={24} color={recording ? 'red' : 'grey'} style={styles.icon} />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity onPress={handleSend}>
          <Icon name="send" size={24} color="grey" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
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
    backgroundColor: '#DBE2D9', // A slightly muted green/grey
    alignSelf: 'flex-end',
    marginRight: 5, // Small margin to prevent sticking to edge
  },
  theirMessage: {
    backgroundColor: '#f7ecdc', // A light peach/cream
    alignSelf: 'flex-start',
    marginLeft: 5, // Small margin
  },
  messageText: {
    color: 'black',
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
    backgroundColor: "#FFF5F9",
    borderTopColor: '#ddd',
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