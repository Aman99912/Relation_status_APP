import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../Color';
import { APIPATH } from '../utils/apiPath';
import Icon from 'react-native-vector-icons/Feather';
import Logout from './logout';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const storedEmail = await AsyncStorage.getItem('userEmail');
    if (!storedEmail) return Alert.alert('Error', 'User email not found');

    try {
      const res = await axios.get(`${APIPATH.BASE_URL}/api/user/email?email=${storedEmail}`);
      const data = res.data;
      setUser(data);
      setUsername(data.username || '');
    
      setAvatar(data.avatar || '');
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Profile</Text>
      </View>

      <View style={styles.profileContainer}>
        <Image
          source={avatar ? { uri: avatar } : require('../assets/avatar.png')}
          style={styles.profileImage}
        />
        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>{user?.fullname || 'Unknown'}</Text>

          <TouchableOpacity
            style={styles.editToggleButton}
            onPress={() => {
             navigation.navigate("/logout")
            }}
            
            >
              <Text style={{fontSize:15}}>
  View 
              </Text>
          
          </TouchableOpacity>
        </View>
      </View>

      

    

      

      <Logout />
    </ScrollView>
  );
};



const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9f9f9',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 22,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.7,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 20,
  },
  profileName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#222',
    marginBottom: 12,
  },
  editToggleButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 36,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
 
 
});

export default ProfileScreen;
