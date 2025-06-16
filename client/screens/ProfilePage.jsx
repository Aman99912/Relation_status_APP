import React, { useCallback, useEffect, useState } from 'react';
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS } from '../Color';
import { APIPATH } from '../utils/apiPath';
import Logout from '../components/logout';
import { Ionicons } from '@expo/vector-icons';


const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');

useFocusEffect(
  useCallback(() => {
    fetchUserData();
  }, [])
);


  const fetchUserData = async () => {
    const id = await AsyncStorage.getItem('userId');
    const Token = await AsyncStorage.getItem('Token');
    if (!id) return Alert.alert('Error', 'User Id not found');

    try {
      const res = await axios.get(`${APIPATH.BASE_URL}/api/user/id?id=${id}`,  {  
           headers: {
             Authorization: `${Token}` 
                   },
  });
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
        <Image source={avatar ? { uri: avatar } : require('../assets/avatar.png')} style={styles.profileImage} />
        <View style={styles.profileDetails}>
         
          <Text style={styles.profileName}> @{user?.fullname || 'Unknown'}</Text>

          <TouchableOpacity
            style={styles.buttonPoint2 }
            onPress={() => {
             navigation.navigate('MainApp', { screen: 'chatPF' })
            }}
          >
            <Text style={styles.textPoint}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
   <View style={styles.settingList}>
      <TouchableOpacity style={styles.buttonPoint}  onPress={() => {
             navigation.navigate('MainApp', { screen: 'Dashboard' })
            }}>
        <Text style={styles.textPoint}> Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonPoint}>
        <Text style={styles.textPoint}>Privacy and Security </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonPoint}>
        <Text style={styles.textPoint}>Gift Shop</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonPoint}>
        <Text style={styles.textPoint}>Map</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonPoint}>
        <Text style={styles.textPoint}>Help</Text>
      </TouchableOpacity>
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
    width: 80,
    height: 80,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 20,
  },
  profileName: {
    fontSize: 24,
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
 settingList: {
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  buttonPoint: {
    backgroundColor: '#f4f4f4',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1.6,
  },
  buttonPoint2: {
    backgroundColor: '#f4f4f4',
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    borderRadius: 32,
    paddingVertical: 10,
    width:100,
    paddingHorizontal: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  textPoint: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});

export default ProfileScreen;
