import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function Navbar() {
  const navigation = useNavigation();

  const HomeHandle = () => navigation.navigate('HomePage');
  const PlusHandle = () => navigation.navigate('AddUser');
  const NotificationHandle = () => navigation.navigate('NotificationPage');
  const ProfileHandle = () => navigation.navigate('ProfilePage');

  return (
    <View style={navStyle.container}>
      <TouchableOpacity style={navStyle.navItem} onPress={HomeHandle}>
        <FontAwesome name="home" size={22} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={navStyle.navItem} onPress={PlusHandle}>
        <FontAwesome name="plus" size={22} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={navStyle.navItem} onPress={NotificationHandle}>
        <FontAwesome name="bell" size={22} color="white" />
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
    backgroundColor: 'pink',
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
