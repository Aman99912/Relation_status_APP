import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const HomePage = () => {
  return (
    <View style={Homestyles.wrapper}>
      <Pressable style={Homestyles.card}>
        <FontAwesome name="user" size={65} color="black" />
        {/* You can add additional text or actions inside the Pressable component */}
      </Pressable>
    </View>
  );
};

const Homestyles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  card: {
    width: '90%',
    height: '40%',
    margin: 20,
    backgroundColor: 'rgba(217, 217, 217, 0.58)',
    borderColor: 'white',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 12, height: 17 },
    shadowOpacity: 0.22,
    shadowRadius: 51,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'black',
    overflow: 'hidden',
  },
});

export default HomePage;
