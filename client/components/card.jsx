import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../Color';
import { Ionicons } from '@expo/vector-icons';

export default function Card({
  username,
  avatarUrl,
  onAddPress,
  isFriend,
  isRequestPending,
  isMyself,
  isLoading,
}) {
  // Ensure all props are boolean and compute disabled state
  const isDisabled = !!isMyself || !!isFriend || !!isRequestPending || !!isLoading;

  const renderButtonContent = () => {
    if (isLoading) {
      return <ActivityIndicator color="#fff" />;
    }
    if (isMyself) {
      return <Text style={styles.disabledText}>You</Text>;
    }
    if (isFriend) {
      return <Text style={styles.disabledText}>Friend</Text>;
    }
    if (isRequestPending) {
      return <Text style={styles.disabledText}>Requested</Text>;
    }
    return <Ionicons name="person-add" size={20} color="#fff" />;
  };

  return (
    <View style={styles.card}>
      <Image
        source={typeof avatarUrl === 'string' ? { uri: avatarUrl } : avatarUrl}
        style={styles.avatar}
        defaultSource={require('../assets/avatar.png')}
      />
      <Text style={styles.name}>{username}</Text>

      <TouchableOpacity
        style={[styles.button, isDisabled && styles.disabledButton]}
        onPress={() => {
          if (!isDisabled && onAddPress) {
            onAddPress();
          }
        }}
        activeOpacity={isDisabled ? 1 : 0.7}
        disabled={isDisabled}
      >
        {renderButtonContent()}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  disabledText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
