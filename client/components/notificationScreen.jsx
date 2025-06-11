

// import React, { useCallback, useEffect, useState } from 'react';
// import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
// import axios from 'axios';
// import { APIPATH } from '../utils/apiPath';
// import { COLORS } from '../Color';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useFocusEffect } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';




// const NotificationScreen = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoadingId, setActionLoadingId] = useState(null);
//    const [showAlert, setShowAlert] = useState(false);

//   const fetchFriendRequests = async () => {
//     setLoading(true);
//     try {
//       const email = await AsyncStorage.getItem('userEmail');
//       if (!email) {
//         setRequests([]);
//         return;
//       }

//       const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETFRIENDNOTIF}?email=${email}`);
//       const pendingRequests = response.data.pendingRequests || [];
//       setRequests(pendingRequests);
//       console.log(pendingRequests);
      
//     } catch (error) {
//       console.error('Error fetching requests:', error);
//       Alert.alert('Error', 'Failed to fetch friend requests. Please try again.');
//       setRequests([]);
//     } finally {
//       setLoading(false);
//     }
//   };

// const respondToRequest = async (requestId, senderId, action) => {
//   setActionLoadingId(requestId);
//   try {
//     const userId = await AsyncStorage.getItem('userId');
//     if (!userId) {
//       Alert.alert('Error', 'User ID not found, please login again');
//       setActionLoadingId(null);
//       return;
//     }

//     const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SEND_RESPON}`, {
//       userId,
//       senderId,
//       action,
//     });

//     if (res.data.success) {
//       setRequests((prev) => prev.filter((req) => req._id !== requestId));
//     } else {
//       Alert.alert('Error', res.data.message || 'Something went wrong');
//     }
//   } catch (error) {
//     const serverMessage = error?.response?.data?.message;
    
//      Alert.alert('Oops', serverMessage || `Failed to add the request. You can't accept more than one request.`);
//   } finally {
//     setActionLoadingId(null);
//   }
// };


//  useFocusEffect(
//    useCallback(() => {
//     fetchFriendRequests();
//   }, []));

//   const renderCard = (item) => {
//     const isLoading = actionLoadingId === item._id;
//     const username = item.from ? item.from.name : 'Unknown User';
//     const avatarUrl = item.from && item.from.avatar ? { uri: item.from.avatar } : require('../assets/avatar.png');

//     return (
//       <>
//      <TouchableOpacity style={{ position: 'absolute', top: 30, left: 20 }} onPress={() => navigation.goBack()}>
//         <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
//       </TouchableOpacity>
//       <View style={styles.NotificationTextView}><Text style={styles.NotificationText}>Notification</Text>  </View>
//     <View style={styles.container}>
//       <View style={styles.card}>
//         <Image source={avatarUrl} style={styles.avatar} />
//         <Text style={styles.name}>{username}</Text>
//         <View style={styles.buttonsContainer}>
//           <TouchableOpacity
//             style={[styles.button, styles.acceptButton]}
//             onPress={() => respondToRequest(item._id, item.from?._id, 'accept')}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <Text style={styles.buttonText}>Accept</Text>
//             )}
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.button, styles.rejectButton]}
//             onPress={() => respondToRequest(item._id, item.from?._id, 'reject')}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <Text style={styles.buttonText}>Reject</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//       </View>
//       </>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   if (!requests || requests.length === 0) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.noRequestsText}>No friend requests found</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <FlatList
//         data={requests}
//         keyExtractor={(item) => item._id}
//         contentContainerStyle={{ padding: 16 }}
//         refreshing={loading}
//         onRefresh={fetchFriendRequests}
//         renderItem={({ item }) => renderCard(item)}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container:{
//     marginTop:50
//   },
//   NotificationTextView:{
//     display:'flex',
//     justifyContent:'center',
//     alignItems:'center',
//     top:30
//   },
//   NotificationText:{
//  fontSize:22,
//  fontWeight:'800',
//   },
//   centered: {
//     flex:1,
//         justifyContent: 'center',
//     alignItems: 'center',
//   },
//   noRequestsText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.text || '#333',
//   },
//   card: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 3,
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 12,
//   },
//   name: {
//     flex: 1,
//     fontSize: 16,
//     fontWeight: '500',
//     color: 'black',
//   },
//   buttonsContainer: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   button: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//   },
//   acceptButton: {
//     backgroundColor: COLORS.primary,
//     marginRight: 8,
//   },
//   rejectButton: {
//     backgroundColor: '#aaa',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });

// export default NotificationScreen;

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { APIPATH } from '../utils/apiPath';
import { COLORS } from '../Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment'; 

const NotificationScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const navigation = useNavigation();

  const fetchFriendRequests = async () => {
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (!email) {
        setRequests([]);
        return;
      }

      const response = await axios.get(
        `${APIPATH.BASE_URL}/${APIPATH.GETFRIENDNOTIF}?email=${email}`
      );
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
      Alert.alert('Oops', serverMessage || `Failed to add the request.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFriendRequests();
    }, [])
  );

  const renderCard = (item) => {
    const isLoading = actionLoadingId === item._id;
    const username = item.from ? item.from.name : 'Unknown User';
    const avatarUrl =
      item.from && item.from.avatar ? { uri: item.from.avatar } : require('../assets/avatar.png');
    const requestTime = item.createdAt ? moment(item.createdAt).fromNow() : '';

    return (
      <View style={styles.card}>
        <Image source={avatarUrl} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{username}</Text>
           <Text style={styles.timestamp}>
    {moment(item.createdAt).fromNow()}
  </Text>
        </View>
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>
        <Text style={styles.noRequestsText}>No friend requests found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      <View style={styles.NotificationTextView}>
        <Text style={styles.NotificationText}>Notifications</Text>
      </View>
      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingTop: 20 }}
        refreshing={loading}
        onRefresh={fetchFriendRequests}
        renderItem={({ item }) => renderCard(item)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
  },
  timestamp:{
    position:'absolute',
    bottom:-28,
    left:210,
    color:'green',
    fontSize:12
  },
  NotificationTextView: {
    marginTop: 80,
    backgroundColor:COLORS.background,
    alignItems: 'center',
  },
  NotificationText: {
    fontSize: 22,
    fontWeight: '800',
  },
  centered: {
    flex: 1,
    backgroundColor:COLORS.background,
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
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
  },
  timeText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
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
