import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import { APIPATH } from '../utils/apiPath';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart, ProgressChart } from 'react-native-chart-kit';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const DEFAULT_AVATAR = 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=User';

const CircularProgress = ({ value, maxValue, title, color }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <View style={styles.circularProgressContainer}>
      <AnimatedCircularProgress
        size={90}
        width={8}
        fill={percentage}
        tintColor={color}
        backgroundColor="#e0e0e0"
        lineCap="round"
        rotation={0}
      >
        {() => (
          <Text style={styles.circularProgressValue}>{value}</Text>
        )}
      </AnimatedCircularProgress>
      <Text style={styles.circularProgressTitle}>{title}</Text>
    </View>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('Token');

        if (!userId || !token) {
          setError("User not logged in or token missing.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${APIPATH.BASE_URL}/${APIPATH.GETDASHBOARD}?id=${userId}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        setData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError(err.response?.data?.message || "Failed to load dashboard data. Please check your network or server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Oops! Something went wrong.</Text>
        <Text style={styles.errorDetails}>Error: {error}</Text>
        <Text style={styles.errorText}>Please try again later.</Text>
      </View>
    );
  }

  const {
    profile = {},
    friends = { total: 0, streak: 0, pending: 0 },
    diary = { total: 0, lastEntry: 'N/A', streak: 0 },
    notes = { total: 0, todayNote: null, streak: 0 },
    chats = { totalMessagesToday: 0, topContact: 'N/A', media: { images: 0, audio: 0 }, lastMessage: null },
    stats = { loginStreak: 0, badges: [] }
  } = data || {};

  const pieChartData = [
    {
      name: 'Friends',
      population: friends.total || 0,
      color: '#4CAF50',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Diary Entries',
      population: diary.total || 0,
      color: '#2196F3',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Notes',
      population: notes.total || 0,
      color: '#FFC107',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  const progressChartData = {
    labels: ['Friends', 'Diary', 'Notes'],
    data: [
      friends.total > 0 ? 1 : 0.05,
      diary.total > 0 ? 1 : 0.05,
      notes.total > 0 ? 1 : 0.05,
    ],
    colors: ['#4CAF50', '#2196F3', '#FFC107'],
  };

  // Helper function to safely format message parts
  const formatMessagePart = (part) => {
    if (part === undefined || part === null || String(part).toLowerCase() === 'undefined') {
      return 'N/A';
    }
    return String(part);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.dashboardTitleContainer}>
        <Text style={styles.dashboardTitleText}>Dashboard</Text>
      </View>

      <View style={styles.headerCard}>
        <View style={styles.profileRow}>
          <Image
            source={{ uri: profile.avatar || DEFAULT_AVATAR }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile.name || 'User Name'}</Text>
            <Text style={styles.username}>@{profile.username || 'username'}</Text>
            <Text style={styles.bio}>{profile.bio || 'No bio available yet. Update your profile!'}</Text>
          </View>
        </View>
        <View style={styles.profileStats}>
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatValue}>{profile.gender || 'N/A'}</Text>
            <Text style={styles.profileStatLabel}>Gender</Text>
          </View>
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatValue}>{profile.age ? `${profile.age} yrs` : 'N/A'}</Text>
            <Text style={styles.profileStatLabel}>Age</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📊 Your Overview</Text>
        <View style={styles.overviewGrid}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{friends.total}</Text>
            <Text style={styles.overviewLabel}>Friends</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{diary.total}</Text>
            <Text style={styles.overviewLabel}>Diary Entries</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{friends.pending}</Text>
            <Text style={styles.overviewLabel}>Pending Req.</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{notes.total}</Text>
            <Text style={styles.overviewLabel}>Total Notes</Text>
          </View>
        </View>
        <View style={styles.overviewSubTextContainer}>
          <Text style={styles.subText}>Last Diary Entry: {diary.lastEntry || 'N/A'}</Text>
          <Text style={styles.subText}>Today's Note: {notes.todayNote || 'None'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>💬 Chat Activity</Text>
        <View style={styles.chatDetails}>
          <View style={styles.chatDetailRow}>
            <Text style={styles.detailLabel}>Today's Messages:</Text>
            <Text style={styles.detailValue}>{chats.totalMessagesToday}</Text>
          </View>
          <View style={styles.chatDetailRow}>
            <Text style={styles.detailLabel}>Top Contact:</Text>
            <Text style={styles.detailValue}>{chats.topContact || 'N/A'}</Text>
          </View>
          <View style={styles.chatDetailRow}>
            <Text style={styles.detailLabel}>Media Shared:</Text>
            <Text style={styles.detailValue}>{chats.media?.images || 0} Images, {chats.media?.audio || 0} Audio</Text>
          </View>
          {chats.lastMessage ? (
            <View style={styles.chatDetailRow}>
              <Text style={styles.detailLabel}>Last Message:</Text>
              <Text style={styles.detailValue}>
                {formatMessagePart(chats.lastMessage.text)}
                {chats.lastMessage.time ? ` (${formatMessagePart(chats.lastMessage.time)})` : ''}
              </Text>
            </View>
          ) : (
            <Text style={styles.textMuted}>No recent chat messages.</Text>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🏆 Your Achievements</Text>
        <View style={styles.achievementItem}>
          <Text style={styles.detailLabel}>Overall Login Streak:</Text>
          <Text style={styles.statValue}>{stats.loginStreak || 0} days</Text>
        </View>
        <Text style={styles.detailLabel}>Badges Earned:</Text>
        <View style={styles.badgeContainer}>
          {stats.badges && stats.badges.length > 0 ? stats.badges.map((badge, i) => (
            <View key={i} style={styles.badge}>
              <Text style={styles.badgeText}>🏅 {badge}</Text>
            </View>
          )) : <Text style={styles.textMuted}>No badges yet. Keep going!</Text>}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🎯 Your Streaks</Text>
        <View style={styles.circularProgressRow}>
          <CircularProgress
            value={friends.streak || 0}
            maxValue={30}
            title="Friend Streak"
            color="#4CAF50"
          />
          <CircularProgress
            value={diary.streak || 0}
            maxValue={30}
            title="Diary Streak"
            color="#2196F3"
          />
          <CircularProgress
            value={notes.streak || 0}
            maxValue={30}
            title="Note Streak"
            color="#FFC107"
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📊 Data Visuals</Text>
        <Text style={styles.chartTitle}>Overall Activity Distribution</Text>
        <PieChart
          data={pieChartData}
          width={screenWidth - 32}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForLabels: {
              fontSize: 12,
              fontWeight: 'bold',
            },
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />

        <Text style={styles.chartTitle}>Progress Towards Goals</Text>
        <ProgressChart
          data={progressChartData}
          width={screenWidth - 30}
          height={180}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForLabels: {
              fontSize: 12,
              fontWeight: 'bold',
            },
          }}
          hideLegend={false}
          style={styles.progressChartStyle}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 20,
  },
  dashboardTitleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dashboardTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderBottomWidth: 5,
    borderBottomColor: '#6200EE',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
    paddingLeft: 10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 3,
    borderColor: '#6200EE',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  bio: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  profileStatItem: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
  },
  profileStatLabel: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  overviewItem: {
    width: Dimensions.get('window').width * 0.4 - 20,
    height: Dimensions.get('window').width * 0.4 - 20,
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: (Dimensions.get('window').width * 0.4 - 20) / 2,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#28A745',
    marginBottom: 5,
  },
  overviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    textAlign: 'center',
  },
  overviewSubTextContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  subText: {
    fontSize: 13,
    color: '#777',
    marginTop: 5,
    textAlign: 'center',
  },
  circularProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 10,
  },
  circularProgressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  circularProgressTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  chatDetails: {},
  chatDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: '#E0E7FF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#C5CAE9',
  },
  badgeText: {
    fontSize: 13,
    color: '#3F51B5',
    fontWeight: '500',
  },
  textMuted: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 5,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 15,
  },
  progressChartStyle: {
    alignSelf: 'flex-end',
  },
});

export default Dashboard;