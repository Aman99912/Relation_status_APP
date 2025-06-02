
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationCard from '../components/card.jsx';
import { APIPATH } from '../utils/apiPath';
import { COLORS } from '../Color';

export default function NotificationsScreen() {
  const [userId, setUserId] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch logged-in user id from AsyncStorage on mount
  useEffect(() => {
    const getUserId = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (!email) {
          Alert.alert('Error', 'User email not found');
          return;
        }
        const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?email=${email}`);
        if (res.status === 200 && res.data._id) {
          setUserId(res.data._id);
        } else {
          Alert.alert('Error', 'Failed to fetch user data');
        }
      } catch (err) {
        Alert.alert('Error fetching user data');
      }
    };
    getUserId();
  }, []);

  // Fetch friend requests when userId is available
  useEffect(() => {
    if (!userId) return;
    fetchRequests();
  }, [userId]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GET_FRIEND_REQUESTS}/${userId}`);
      if (res.status === 200) {
        setRequests(res.data.requests || []);
      } else {
        Alert.alert('Error fetching requests');
      }
    } catch (err) {
      Alert.alert('Error fetching requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (senderId, action) => {
    try {
      const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.RESPOND_REQUEST}`, {
        userId,
        senderId,
        action,
      });
      if (res.status === 200 && res.data.success) {
        Alert.alert('Success', `Request ${action}ed`);
        // Refresh requests to get latest data
        fetchRequests();
      } else {
        Alert.alert('Failed to respond to request');
      }
    } catch (err) {
      Alert.alert('Error responding to request');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18, color: '#666' }}>No friend requests</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.from._id}
        renderItem={({ item }) => (
          <NotificationCard
            username={item.from.username}
            avatarUrl={item.from.avatarUrl} 
            onAccept={() => handleRespond(item.from._id, 'accept')}
            onReject={() => handleRespond(item.from._id, 'reject')}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f8ff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
