import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

import { APIPATH } from '../utils/apiPath';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Logout() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.LOGOUT_API}`, {
      });
      if (response.status === 200) {
        await AsyncStorage.clear()
        // await AsyncStorage.clear();
const checkEmail = await AsyncStorage.getItem('userEmail');
console.log('Post-clear email:', checkEmail); 

        Alert.alert('Success', 'You have been logged out successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'), 
          },
        ]);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'There was an issue logging out. Please try again.');
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.LogoutContainer}>
    

      {loading ? (
        <Text style={styles.loadingText}>Logging out...</Text>
      ) : (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      )}
    
    </View>
  );
};

const styles = StyleSheet.create({
  LogoutContainer: {
    position:'absolute',
    right:'40%',
    bottom:70,
    
    alignItems: 'center',
    backgroundColor: 'transparent',
   
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 13,
    paddingHorizontal: 34,
    borderRadius: 30,
    width:"120%",
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: '#777',
  },
});
