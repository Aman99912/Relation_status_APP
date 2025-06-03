
// import React from 'react';
// import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
// import { COLORS } from '../Color';

// const NotificationCard = ({ username, avatarUrl, onAccept, onReject }) => {
//   return (
//     <View style={styles.card}>
//       <Image
//         source={
//           avatarUrl
//             ? { uri: avatarUrl }
//             : require('../assets/avatar.png') // fallback avatar
//         }
//         style={styles.avatar}
//       />
//       <View style={styles.info}>
//         <Text style={styles.username}>{username}</Text>
//         <View style={styles.buttons}>
//           <TouchableOpacity style={styles.accept} onPress={onAccept}>
//             <Text style={styles.buttonText}>Accept</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.reject} onPress={onReject}>
//             <Text style={styles.buttonText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 12,
//     marginVertical: 8,
//     elevation: 2,
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   info: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   username: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 6,
//   },
//   buttons: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   accept: {
//     backgroundColor: COLORS.primary || 'green',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//   },
//   reject: {
//     backgroundColor: '#e74c3c',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
// });

// export default NotificationCard;
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import NotificationCard from '../components/card.jsx';
import axios from 'axios';
import { APIPATH } from '../utils/apiPath';
import { COLORS } from '../Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
const NotificationScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFriendRequests = async () => {
    try {
     const email= await AsyncStorage.getItem("userEmail");
    //  console.log(email);
     
      const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETFRIENDNOTIF}?email=${email}`);
      console.log(`${APIPATH.BASE_URL}/${APIPATH.GETFRIENDNOTIF}?email=${email}`);
      console.log(response.data);
       
      
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (requestId) => {
    // Add accept logic here (API call)
    setRequests((prev) => prev.filter((req) => req._id !== requestId));
  };

  const handleReject = (requestId) => {
    // Add reject logic here (API call)
    setRequests((prev) => prev.filter((req) => req._id !== requestId));
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

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
    <FlatList
      data={requests}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <NotificationCard
          username={item.senderName}
          avatarUrl={item.avatar}
          onAccept={() => handleAccept(item._id)}
          onReject={() => handleReject(item._id)}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRequestsText: {
    fontSize: 16,
    color: "black",
  },
});

export default NotificationScreen;
