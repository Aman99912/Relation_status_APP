

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { APIPATH } from '../utils/apiPath';
import { COLORS } from '../Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/alert';



const NotificationScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
   const [showAlert, setShowAlert] = useState(false);

  const fetchFriendRequests = async () => {
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (!email) {
        // <MyAlert 
        //  visible={showAlert}
        // message="'Error', 'User email not found, please login again'"
        // onClose={() => setShowAlert(false)}
        // />
        setRequests([]);
        return;
      }

      const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETFRIENDNOTIF}?email=${email}`);
      const pendingRequests = response.data.pendingRequests || [];
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to fetch friend requests. Please try again.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

const respondToRequest = async (requestId, senderId, action) => {
  setActionLoadingId(requestId);
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      Alert.alert('Error', 'User ID not found, please login again');
      setActionLoadingId(null);
      return;
    }

    const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SEND_RESPON}`, {
      userId,
      senderId,
      action,
    });

    if (res.data.success) {
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } else {
      Alert.alert('Error', res.data.message || 'Something went wrong');
    }
  } catch (error) {
    const serverMessage = error?.response?.data?.message;
    
     Alert.alert('Oops', serverMessage || `Failed to add the request. You can't accept more than one request.`);
  } finally {
    setActionLoadingId(null);
  }
};


  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const renderCard = (item) => {
    const isLoading = actionLoadingId === item._id;
    const username = item.from ? item.from.name : 'Unknown User';
    const avatarUrl = item.from && item.from.avatar ? { uri: item.from.avatar } : require('../assets/avatar.png');

    return (
      <View style={styles.card}>
        <Image source={avatarUrl} style={styles.avatar} />
        <Text style={styles.name}>{username}</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={() => respondToRequest(item._id, item.from?._id, 'accept')}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Accept</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => respondToRequest(item._id, item.from?._id, 'reject')}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Reject</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noRequestsText}>No friend requests found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshing={loading}
        onRefresh={fetchFriendRequests}
        renderItem={({ item }) => renderCard(item)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRequestsText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text || '#333',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NotificationScreen;
