// ✅ Final ChatScreen.js: Modern UI, All Features (Camera, Gallery, Audio, GIF, Message Types)

import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import usePermissions from '../hooks/usePermissions';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../Color';
import axios from 'axios';
import { APIPATH } from '../utils/apiPath';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { friendName, friendAvatar, friendId } = route.params;
  const Name = friendName?.toUpperCase() || 'FRIEND';

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState(null);
  const [userId, setUserId] = useState(null);
  const scrollViewRef = useRef(null);
  const permissionsGranted = usePermissions();

  useEffect(() => {
    const init = async () => {
      const Myid = await AsyncStorage.getItem('userId');
      setUserId(Myid);
    };
    init();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId || !friendId) return;
      try {
        const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.FATCHCHAT}/${userId}/${friendId}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchMessages();
  }, [userId]);

  const handleSend = async () => {
    if (!inputText.trim() || !userId) return;
    try {
      const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SENDCHAT}`, {
        senderId: userId,
        receiverId: friendId,
        text: inputText,
        messageType: 'text',
      });
      setMessages(prev => [...prev, res.data]);
      setInputText('');
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const uploadMedia = async (uri, type = 'image') => {
    if (!userId) return;
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: `media.${type === 'audio' ? 'm4a' : 'jpg'}`,
      type: type === 'audio' ? 'audio/m4a' : 'image/jpeg',
    });
    formData.append('senderId', userId);
    formData.append('receiverId', friendId);
    formData.append('messageType', type);

    const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SENDCHAT}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setMessages(prev => [...prev, res.data]);
  };

  const handleCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) await uploadMedia(result.assets[0].uri, 'image');
  };

  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) await uploadMedia(result.assets[0].uri, 'image');
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Start recording error:', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      await uploadMedia(uri, 'audio');
    } catch (err) {
      console.error('Stop recording error:', err);
    }
  };

  const playAudio = async (uri) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (err) {
      console.error('Play audio error:', err);
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = item.senderId === userId;
    return (
      <View style={[styles.messageContainer, isMine ? styles.myMessage : styles.theirMessage]}>
        {item.messageType === 'text' && <Text style={styles.messageText}>{item.text}</Text>}
        {item.messageType === 'image' && <Image source={{ uri: item.imageUrl }} style={styles.chatImage} />}
        {item.messageType === 'audio' && (
          <TouchableOpacity onPress={() => playAudio(item.audioUrl)}>
            <Text style={styles.audioText}>🎧 Play Audio</Text>
          </TouchableOpacity>
        )}
        {item.messageType === 'gif' && <Image source={{ uri: item.imageUrl }} style={styles.chatImage} />}
        <Text style={styles.timestamp}>{moment(item.createdAt).format('hh:mm A')}</Text>
      </View>
    );
  };

  if (!permissionsGranted || !userId) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <TouchableOpacity style={{ position: 'absolute', top: 40, left: 20, zIndex: 999 }} onPress={() => navigation.goBack()}>
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
        keyExtractor={item => item._id || item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatArea}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleCamera}><Icon name="camera" size={24} color="grey" /></TouchableOpacity>
        <TouchableOpacity onPress={handleGallery}><Icon name="image" size={24} color="grey" style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity onPress={async () => {
          const gifMessage = {
            senderId: userId,
            receiverId: friendId,
            messageType: 'gif',
            imageUrl: 'https://media.tenor.com/qD5zD3G4vFAAAAAC/happy-dance.gif',
            text: '',
          };
          const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SENDCHAT}`, gifMessage);
          setMessages(prev => [...prev, res.data]);
        }}>
          <Icon name="sticker-emoji" size={24} color="grey" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
          <Icon name={recording ? 'stop' : 'microphone'} size={24} color={recording ? 'red' : 'grey'} style={styles.icon} />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message"
          value={inputText}
          onChangeText={setInputText}
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
    paddingTop: 30,
    paddingBottom: 10,
    paddingLeft: 50,
    paddingRight: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  name: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
    color: 'grey',
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatArea: {
    padding: 12,
    paddingBottom: 80,
  },
  messageContainer: {
    maxWidth: '75%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  myMessage: {
    backgroundColor: '#DBE2D9',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#f7ecdc',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: 'black',
  },
  chatImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    zIndex: 999,
  },
  audioText: {
    color: 'green',
  },
  timestamp: {
    marginTop: 4,
    fontSize: 10,
    color: '#ccc',
    alignSelf: 'flex-end',
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
  },
  icon: {
    marginHorizontal: 6,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
