import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APIPATH } from '../utils/apiPath';

const audioRecorderPlayer = new AudioRecorderPlayer();
const MESSAGE_STATUSES = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
};

export default function ChatScreen({ route, navigation }) {
const {
  friendId: chatWithUserId = '',
  friendName: chatWithUserName = 'User',
  friendAvatar: chatWithUserAvatar = '',
} = route.params || {};

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [recordTime, setRecordTime] = useState('00:00');
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  const flatListRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      title: chatWithUserName,
      headerTitleAlign: 'center',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
          <Icon name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
      ),
      headerRight: () =>
        chatWithUserAvatar ? (
          <Image source={{ uri: chatWithUserAvatar }} style={styles.avatar} />
        ) : null,
    });

    (async () => {
      const id = await AsyncStorage.getItem('userId');
      const tk = await AsyncStorage.getItem('Token');
      setUserId(id);
      setToken(tk);
    })();
  }, []);

  useEffect(() => {
    if (userId && token) fetchMessages();
    return () => {
      clearTimeout(typingTimeout.current);
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, [userId, token]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `https://your-api.com/messages?user1=${userId}&user2=${chatWithUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(res.data || []);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const onChangeText = (text) => {
    setInputText(text);
    setIsTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setIsTyping(false), 1500);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    setSending(true);
    const newMsg = {
      _id: Date.now().toString(),
      text: inputText.trim(),
      senderId: userId,
      receiverId: chatWithUserId,
      createdAt: new Date().toISOString(),
      status: MESSAGE_STATUSES.SENT,
      type: 'text',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    scrollToBottom();

    try {
      await axios.post(`${APIPATH.BASE_URL}/api/chat/`, newMsg, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === newMsg._id ? { ...msg, status: MESSAGE_STATUSES.DELIVERED } : msg
        )
      );
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  };

  const pickImage = () => {
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', quality: 0.7 },
      async (response) => {
        if (response.didCancel || response.errorMessage) return;
        const uri = response.assets?.[0]?.uri;
        if (uri) sendMediaMessage(uri, 'image');
      }
    );
  };

  const sendMediaMessage = async (uri, type) => {
    setSending(true);
    const newMsg = {
      _id: Date.now().toString(),
      senderId: userId,
      receiverId: chatWithUserId,
      createdAt: new Date().toISOString(),
      type,
      status: MESSAGE_STATUSES.SENT,
      [`${type}Url`]: uri,
    };

    setMessages((prev) => [...prev, newMsg]);
    scrollToBottom();

    try {
      await axios.post(`${APIPATH.BASE_URL}/api/chats/send`, newMsg, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === newMsg._id ? { ...msg, status: MESSAGE_STATUSES.DELIVERED } : msg
        )
      );
    } catch (err) {
      console.error(`Send ${type} failed:`, err);
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    setRecording(true);
    await audioRecorderPlayer.startRecorder();
    audioRecorderPlayer.addRecordBackListener((e) => {
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.current_position)));
      return;
    });
  };

  const stopRecording = async () => {
    const uri = await audioRecorderPlayer.stopRecorder();
    setRecording(false);
    audioRecorderPlayer.removeRecordBackListener();
    sendMediaMessage(uri, 'audio');
  };

  const playAudio = async (uri, id) => {
    if (playingId === id) {
      await audioRecorderPlayer.stopPlayer();
      setPlayingId(null);
    } else {
      setPlayingId(id);
      await audioRecorderPlayer.startPlayer(uri);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.current_position >= e.duration) {
          setPlayingId(null);
          audioRecorderPlayer.stopPlayer();
        }
      });
    }
  };

  const renderItem = ({ item }) => {
    const isMe = item.senderId === userId;
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        {item.type === 'text' && (
          <Text style={[styles.messageText, isMe && { color: '#fff' }]}>
            {item.text}
          </Text>
        )}
        {item.type === 'image' && (
          <Image source={{ uri: item.imageUrl }} style={styles.imageMessage} />
        )}
        {item.type === 'audio' && (
          <TouchableOpacity
            style={[styles.audioMessage, isMe ? styles.audioRight : styles.audioLeft]}
            onPress={() => playAudio(item.audioUrl, item._id)}
          >
            <Icon
              name={playingId === item._id ? 'pause-circle' : 'play-circle'}
              size={32}
              color={isMe ? '#fff' : '#333'}
            />
            <Text style={[styles.audioDuration, isMe && { color: '#fff' }]}>
              {recordTime}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f9fc' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContainer}
          onLayout={scrollToBottom}
        />

        {isTyping && (
          <Text style={styles.typingText}>{chatWithUserName} is typing...</Text>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
            <Icon name="image-outline" size={28} color="#4a90e2" />
          </TouchableOpacity>
          <TextInput
            value={inputText}
            onChangeText={onChangeText}
            placeholder="Type message"
            multiline
            style={styles.textInput}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            onPress={recording ? stopRecording : startRecording}
            style={[styles.iconButton, recording && { backgroundColor: '#f44336' }]}
          >
            <Icon
              name={recording ? 'microphone-off' : 'microphone'}
              size={28}
              color={recording ? '#fff' : '#4a90e2'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={sendMessage}
            disabled={sending || !inputText.trim()}
            style={[styles.sendButton, (sending || !inputText.trim()) && { opacity: 0.5 }]}
          >
            {sending ? <ActivityIndicator color="#fff" /> : <Icon name="send" size={28} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  flatListContainer: {
    padding: 12,
    paddingBottom: 10,
  },
  messageContainer: {
    maxWidth: '75%',
    marginVertical: 6,
    borderRadius: 16,
    padding: 12,
    position: 'relative',
  },
  myMessage: {
    backgroundColor: '#4a90e2',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  theirMessage: {
    backgroundColor: '#e4e6eb',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#222',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    paddingHorizontal: 14,
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f1f3f6',
    fontSize: 16,
    color: '#222',
  },
  iconButton: {
    padding: 8,
    marginHorizontal: 6,
    backgroundColor: '#e1e6ef',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 30,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  typingText: {
    fontStyle: 'italic',
    color: '#888',
    marginLeft: 16,
    marginBottom: 6,
  },
  imageMessage: {
    width: 200,
    height: 150,
    borderRadius: 14,
  },
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 14,
  },
  audioLeft: {
    backgroundColor: '#e4e6eb',
  },
  audioRight: {
    backgroundColor: '#4a90e2',
  },
  audioDuration: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  statusIcon: {
    position: 'absolute',
    bottom: 4,
    right: 6,
  },
});
