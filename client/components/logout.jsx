// import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
// import React, { useState } from 'react'
// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';

// import { APIPATH } from '../utils/apiPath';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function Logout() {
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//       const init = async () => {
//         try {
//           const Token = await AsyncStorage.getItem('Token');
          
//           if(!Token){
//        navigation.navigate('logout')
//           }
//         } catch (e) {
//           console.error('Failed to load Token from AsyncStorage:', e);
//         }
//       };
//       init();
//     }, []);
  

//   const handleLogout = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.LOGOUT_API}`, {
//       });
//       if (response.status === 200) {
//         await AsyncStorage.clear()
//         // await AsyncStorage.clear();
// const checkEmail = await AsyncStorage.getItem('userEmail');
// console.log('Post-clear email:', checkEmail); 

//         Alert.alert('Success', 'You have been logged out successfully!', [
//           {
//             text: 'OK',
//             onPress: () => navigation.navigate('Login'), 
//           },
//         ]);
//       }
//     } catch (error) {
//       setLoading(false);
//       Alert.alert('Error', 'There was an issue logging out. Please try again.');
//       console.error('Logout error:', error);
//     }
//   };

//   return (
//     <View style={styles.LogoutContainer}>
    

//       {loading ? (
//         <Text style={styles.loadingText}>Logging out...</Text>
//       ) : (
//         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>
//       )}
    
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   LogoutContainer: {
//     position:'absolute',
//     right:'40%',
//     bottom:70,
    
//     alignItems: 'center',
//     backgroundColor: 'transparent',
   
//   },
//   header: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 40,
//   },
//   logoutButton: {
//     backgroundColor: '#ff6347',
//     paddingVertical: 13,
//     paddingHorizontal: 34,
//     borderRadius: 30,
//     width:"120%",
//     alignItems: 'center',
//   },
//   logoutText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   loadingText: {
//     fontSize: 16,
//     color: '#777',
//   },
// });

import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

import { APIPATH } from '../utils/apiPath';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../Color';

export default function Logout() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkTokenAndNavigate = async () => {
      try {
        const token = await AsyncStorage.getItem('Token');
        if (!token) {
          console.log('No token found, navigating to Login.');
          navigation.navigate('Login');
        }
      } catch (e) {
        console.error('Failed to load Token from AsyncStorage during initial check:', e);
      }
    };
    checkTokenAndNavigate();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${APIPATH.BASE_URL}/${APIPATH.LOGOUT_API}`,
        {}
      );

      if (response.status === 200) {
        try {
          await AsyncStorage.clear();
          console.log('AsyncStorage cleared.');

          const checkEmail = await AsyncStorage.getItem('userEmail');
          console.log('Post-clear userEmail:', checkEmail);

          Alert.alert('Success', 'You have been logged out successfully!', [
            {
              text: 'OK',
              onPress: () => {
                navigation.replace('Login');
              },
            },
          ]);
        } catch (clearError) {
          console.error('Error clearing AsyncStorage:', clearError);
          Alert.alert('Error', 'Logged out from server, but failed to clear local data. Please restart app.');
          navigation.replace('Login');
        }
      } else {
        Alert.alert('Logout Failed', response.data?.message || 'Server did not confirm logout.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
      Alert.alert('Error', `There was an issue logging out: ${errorMessage}`);
      console.error('Logout error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.LogoutContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#e75480" />
      ) : (
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: COLORS.addfriendbtn }]} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  LogoutContainer: {
    position:'relative',
    right: '-20%',
    bottom: -10,
    zIndex:100,
    width:'60%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom:40,
  },
  logoutButton: {
    backgroundColor: COLORS.addfriendbtn,
    paddingVertical: 13,
    paddingHorizontal: 34,
    borderRadius: 30,
    width: "120%",
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
});