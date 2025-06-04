import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { COLORS } from '../Color';

export default function NavBar() {
  const navigation = useNavigation();

  const HomeHandle = () =>navigation.navigate('MainApp', { screen: 'Home' });
  const PlusHandle = () => navigation.navigate('MainApp', { screen: 'Adduser' });
  const chatsHandle = () => navigation.navigate('MainApp', { screen: 'chats' });
  const ProfileHandle = () => navigation.navigate('MainApp', { screen: 'Logout' });

  return (
    <View style={navStyle.container}>
      <TouchableOpacity style={navStyle.navItem} onPress={HomeHandle}>
        <FontAwesome name="home" size={22} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={navStyle.navItem} onPress={PlusHandle}>
        <FontAwesome name="plus" size={22} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={navStyle.navItem} onPress={PlusHandle}>
        <FontAwesome name="book" size={22} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={navStyle.navItem} onPress={chatsHandle}>
        <FontAwesome name="comments" size={22} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={navStyle.navItem} onPress={ProfileHandle}>
        <FontAwesome name="user" size={22} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const navStyle = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    padding:10,
  },
});
