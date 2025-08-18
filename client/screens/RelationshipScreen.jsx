// RelationshipScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../Color'; // Assuming your COLORS file is here

// A reusable card for the features
const FeatureCard = ({ icon, title, description, onPress }) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress}>
    <FontAwesome name={icon} size={32} color={COLORS.primary} />
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </TouchableOpacity>
);

export default function RelationshipScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { friend } = route.params; // Get the friend data passed from HomeScreen

  // Default avatar logic
  const getDefaultAvatar = (gender) => {
    return gender === 'female'
      ? require('../assets/female.webp')
      : require('../assets/male.png');
  };

  const avatarSource = friend.avatar ? { uri: friend.avatar } : getDefaultAvatar(friend.gender);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* --- Header with Back Button --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={22} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Dashboard</Text>
      </View>

      {/* --- Friend Info Card --- */}
      <View style={styles.friendCard}>
        <Image source={avatarSource} style={styles.avatarImage} />
        <Text style={styles.friendName}>{friend.name}</Text>
        <Text style={styles.friendEmail}>{friend.email}</Text>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => navigation.navigate('chats', {
            friendId: friend._id,
            friendName: friend.name,
            friendAvatar: friend.avatar,
            friendEmail: friend.email,
          })}
        >
          <FontAwesome name="comments" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.chatButtonText}>Start Chatting</Text>
        </TouchableOpacity>
      </View>
      
      {/* --- Activities Section --- */}
      <Text style={styles.sectionTitle}>Shared Activities</Text>
      <View style={styles.featuresContainer}>
        <FeatureCard
          icon="map-marker"
          title="Live Location"
          description="Share your live location and see where they are."
          
    onPress={() => {
  navigation.navigate('MainApp', { 
    screen: 'LocationShare',           
    params: {                          
      friendId: friend._id,
      friendName: friend.name,
      friendAvatar: friend.avatar,
    },
  });
}}
           
        />
        <FeatureCard
          icon="gamepad"
          title="Play Games"
          description="Challenge each other in fun mini-games."
          onPress={() => alert('Games feature coming soon!')}
        />
        <FeatureCard
          icon="film"
          title="Watch Movies"
          description="Watch your favorite movies together in real-time."
          onPress={() => alert('Movies feature coming soon!')}
        />
        <FeatureCard
          icon="calendar"
          title="Shared Events"
          description="Plan your dates and never forget important days."
          onPress={() => alert('Shared Events feature coming soon!')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  friendCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginBottom: 15,
  },
  friendName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.darkText,
  },
  friendEmail: {
    fontSize: 16,
    color: COLORS.grayText,
    marginBottom: 20,
  },
  chatButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 4,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '48%', // Two cards per row
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginTop: 12,
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 12,
    color: COLORS.grayText,
    textAlign: 'center',
  },
});