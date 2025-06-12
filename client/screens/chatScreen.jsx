import React, { useState, useCallback, useRef } from 'react';
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
  Keyboard,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../Color'; 

const ChatScreen = () => {
  const route = useRoute();
  const { friendName, friendAvatar } = route.params;
  const Name = friendName.toUpperCase();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef(null);

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleCamera = () => {
    launchCamera({ mediaType: 'photo' }, res => {
      if (!res.didCancel && !res.errorCode) {
        const newMessage = {
          id: Date.now().toString(),
          image: res.assets[0].uri,
          sender: 'me',
        };
        setMessages(prev => [...prev, newMessage]);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    });
  };

  const handleGallery = () => {
    launchImageLibrary({ mediaType: 'photo' }, res => {
      if (!res.didCancel && !res.errorCode) {
        const newMessage = {
          id: Date.now().toString(),
          image: res.assets[0].uri,
          sender: 'me',
        };
        setMessages(prev => [...prev, newMessage]);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    });
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'me' ? styles.myMessage : styles.theirMessage,
      ]}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.chatImage} />
      ) : (
        <Text style={styles.messageText}>{item.text}</Text>
      )}
    </View>
  );

  return (
    
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={styles.header}>
        <Image source={{ uri: friendAvatar }} style={styles.avatar} />
        <Text style={styles.name}>{Name}</Text>

        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Icon name="phone" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 16 }}>
            <Icon name="video" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.chatArea}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleCamera}>
          <Icon name="camera" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleGallery}>
          <Icon name="image" size={24} color={COLORS.primary} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="sticker-emoji" size={24} color={COLORS.primary} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="microphone" size={24} color={COLORS.primary} style={styles.icon} />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Type a message"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity onPress={handleSend}>
          <Icon name="send" size={24} color={COLORS.primary} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 12,
    marginTop:1,
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
    color: '#fff',
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatArea: {
    padding: 12,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '75%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  myMessage: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#000',
  },
  chatImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
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
    paddingHorizontal: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginHorizontal: 8,
  },
});
