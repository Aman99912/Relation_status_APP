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
      <TouchableOpacity style={styles.addButton} onPress={onAddPress} activeOpacity={0.7}>
        <FontAwesome name="plus" size={28} color="#4CAF50" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background || '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
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
    backgroundColor: COLORS.primary || '#4e73df',
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
    color: COLORS.text || '#333',
  },
  addButton: {
    padding: 8,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
