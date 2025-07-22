import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { COLORS } from '../Color';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function NavBar() {
  const navigation = useNavigation();

  const HomeHandle = () =>navigation.navigate('MainApp', { screen: 'Home' });
  const PlusHandle = () => navigation.navigate('MainApp', { screen: 'Adduser' });
 
  const bookHandle = () => navigation.navigate('MainApp', { screen: 'diary' });
  const ProfileHandle = () => navigation.navigate('MainApp', { screen: 'Logout' });

  return (
    <View style={[navStyle.container, { backgroundColor: COLORS.cardBg }]}>
      <TouchableOpacity style={navStyle.navItem} onPress={HomeHandle}>
        <Ionicons name="home-outline" size={26} color={'black'} />
      </TouchableOpacity>

      <TouchableOpacity style={navStyle.navItem} onPress={PlusHandle}>
        <Ionicons name="person-add-outline" size={26} color={'black'} />
      </TouchableOpacity>
      <TouchableOpacity style={navStyle.navItem} onPress={bookHandle}>
        <MaterialCommunityIcons name="notebook-outline" size={26} color={'black'} />
      </TouchableOpacity>

      <TouchableOpacity style={navStyle.navItem} onPress={ProfileHandle}>
        <Ionicons name="person-circle-outline" size={26} color={'black'} />
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
