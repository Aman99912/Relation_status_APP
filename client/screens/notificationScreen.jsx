
// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
// import NotificationCard from '../components/card.jsx';
// import axios from 'axios';
// import { APIPATH } from '../utils/apiPath';
// import { COLORS } from '../Color';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const NotificationScreen = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchFriendRequests = async () => {
//     try {
//       const email = await AsyncStorage.getItem("userEmail");
//       const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETFRIENDNOTIF}?email=${email}`);

//       // Use the correct field from response
//       setRequests(response.data.pendingRequests || []);
//     } catch (error) {
//       console.error('Error fetching requests:', error);
//       setRequests([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAccept = (requestId) => {
//     // TODO: Add API call to accept friend request here

//     // Optimistically remove request from the list
//     setRequests((prev) => prev.filter((req) => req._id !== requestId));
//   };

//   const handleReject = (requestId) => {
//     // TODO: Add API call to reject friend request here

//     // Optimistically remove request from the list
//     setRequests((prev) => prev.filter((req) => req._id !== requestId));
//   };

//   useEffect(() => {
//     fetchFriendRequests();
//   }, []);

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
//     <FlatList
//       data={requests}
//       keyExtractor={(item) => item._id}
//       contentContainerStyle={{ padding: 16 }}
//       renderItem={({ item }) => (
//         <NotificationCard
//           username={item.from.name}
//           avatarUrl={item.from.avatar}
//           onAccept={() => handleAccept(item._id)}
//           onReject={() => handleReject(item._id)}
//         />
//       )}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   noRequestsText: {
//     fontSize: 16,
//     color: "black",
//   },
// });

// export default NotificationScreen;
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import Card from '../components/card';  // updated import for your unified Card component
import axios from 'axios';
import { APIPATH } from '../utils/apiPath';
import { COLORS } from '../Color';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFriendRequests = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETFRIENDNOTIF}?email=${email}`);

      setRequests(response.data.pendingRequests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      // Call API to accept friend request
      await axios.post(`${APIPATH.BASE_URL}/acceptFriendRequest`, { requestId });

      // Remove accepted request from list
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      // Call API to reject friend request
      await axios.post(`${APIPATH.BASE_URL}/rejectFriendRequest`, { requestId });

      // Remove rejected request from list
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
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
        <Card
          username={item.from.name}
          avatarUrl={item.from.avatar}
          mode="notification"
          onAcceptPress={() => handleAccept(item._id)}
          onRejectPress={() => handleReject(item._id)}
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
