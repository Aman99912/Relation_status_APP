import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://192.168.65.121:8000/api/user/logout', {
      });
      if (response.status === 200) {
        Alert.alert('Success', 'You have been logged out successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'), // Navigate to Login screen
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
    <View style={styles.container}>
      <Text style={styles.header}>Logout</Text>

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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
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