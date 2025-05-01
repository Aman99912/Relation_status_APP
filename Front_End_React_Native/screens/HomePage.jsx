import { View, Text, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function HomePage() {
  const navigation = useNavigation();

  const logoutHandle = async () => {
    try {
      await AsyncStorage.removeItem("token");  
      navigation.replace("login");             
    } catch (error) {
      console.log("Logout error:", error.message);
    }
  };

  return (
    <View style={homeStyle.homeContainer}>
      <Text>Homepage</Text>
      <Pressable onPress={logoutHandle}>
        <Text>Logout</Text>
      </Pressable>
    </View>
  );
}

export const homeStyle = StyleSheet.create({
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
