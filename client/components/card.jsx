// /frontend/components/Card.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../Color';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


export default function Card({ username, avatarUrl, onAddPress }) {
  return (
    <View style={styles.card}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{username?.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <Text style={styles.username}>{username}</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
       
          <FontAwesome name="plus" size={36} color="green" /> 
          
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background || '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.text || "green",
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  username: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 25,
  }
});
