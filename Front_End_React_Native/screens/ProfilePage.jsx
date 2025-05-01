import React, { useContext } from 'react';
// import { AsyncStorage } from 'react-native'; // Import AsyncStorage
import { AuthContext } from '../App'; // Import the context
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const ProfilePage = () => {
  const { setIsLoggedIn } = useContext(AuthContext); // Access setIsLoggedIn from context

  const logoutHandle = async () => {
    await AsyncStorage.removeItem('token'); // Remove token from AsyncStorage
    setIsLoggedIn(false); // Update login state to false
  };

  return (
    <View style={styles.homeContainer}>
      <Text>Profile Page</Text>
      <Pressable onPress={logoutHandle} style={styles.logout}>
        <Text>Logout</Text>
      </Pressable>
    </View>
  );
};

export default ProfilePage;

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logout: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
    backgroundColor: 'rgb(253, 213, 215)',
  },
});
