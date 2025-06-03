import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../Color';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function Card({
  username,
  avatarUrl,
  mode,
  isAdded,
  isLoading,          // 👈 New prop to show loading spinner
  onAddPress,
  onAcceptPress,
  onRejectPress,
}) {
  return (
    <View style={styles.card}>
      {typeof avatarUrl === 'string' ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <Image source={avatarUrl} style={styles.avatar} />
      )}

      <Text style={styles.username}>{username}</Text>

      {mode === 'addUser' && (
        isAdded ? (
          <View style={styles.addedButton}>
            <Text style={styles.addedText}>sending</Text>
          </View>
        ) : isLoading ? (
          <ActivityIndicator size="small" color="#4CAF50" />
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={onAddPress} activeOpacity={0.7}>
            <FontAwesome name="plus" size={28} color="#4CAF50" />
          </TouchableOpacity>
        )
      )}

      {mode === 'notification' && (
        <View style={styles.notificationButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={onAcceptPress}
            activeOpacity={0.7}
          >
            <Text style={styles.actionText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={onRejectPress}
            activeOpacity={0.7}
          >
            <Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
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
  addedButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 25,
    backgroundColor: '#d3f9d8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addedText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notificationButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
