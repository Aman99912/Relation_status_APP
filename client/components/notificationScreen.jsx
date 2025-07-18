import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Alert,
    Image,
    TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { APIPATH } from '../utils/apiPath';
import { COLORS } from '../Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import socket from '../utils/socket';

const NotificationScreen = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const navigation = useNavigation();
    const [userId, setUserId] = useState(null);

    // Register userId with socket on mount
    useEffect(() => {
        (async () => {
            const id = await AsyncStorage.getItem('userId');
            setUserId(id);
            if (id) {
                socket.emit('register', id);
            }
        })();
    }, []);

    // Socket event listeners for real-time notifications
    useEffect(() => {
        if (!userId) return;
        // New friend request
        const handleNewFriendRequest = async ({ from }) => {
            // Refetch notifications from API for consistency
            await fetchFriendRequests();
        };
        // Friend request accepted/rejected
        const handleFriendRequestUpdate = async ({ from, action }) => {
            // Refetch notifications from API for consistency
            await fetchFriendRequests();
        };
        // New unfriend request
        const handleNewUnfriendRequest = async ({ from }) => {
            await fetchFriendRequests();
        };
        // Unfriend request agree/cancel
        const handleUnfriendRequestUpdate = async ({ from, action }) => {
            await fetchFriendRequests();
        };
        socket.on('notification:new_friend_request', handleNewFriendRequest);
        socket.on('notification:friend_request_update', handleFriendRequestUpdate);
        socket.on('notification:new_unfriend_request', handleNewUnfriendRequest);
        socket.on('notification:unfriend_request_update', handleUnfriendRequestUpdate);
        return () => {
            socket.off('notification:new_friend_request', handleNewFriendRequest);
            socket.off('notification:friend_request_update', handleFriendRequestUpdate);
            socket.off('notification:new_unfriend_request', handleNewUnfriendRequest);
            socket.off('notification:unfriend_request_update', handleUnfriendRequestUpdate);
        };
    }, [userId]);

    const fetchFriendRequests = async () => {
        setLoading(true);
        try {
            const email = await AsyncStorage.getItem('userEmail');
            if (!email) {
                setRequests([]);
                return;
            }
            const Token = await AsyncStorage.getItem('Token');

            const response = await axios.get(
                `${APIPATH.BASE_URL}/${APIPATH.GETFRIENDNOTIF}?email=${email}`, {
                headers: { Authorization: `${Token}` },
            }
            );

            const friendRequests = response.data.friendRequests || [];
            const unfriendRequests = response.data.unfriendRequests || [];

            const combinedRequests = [
                ...friendRequests.map(req => ({ ...req, type: 'friend_request' })),
                ...unfriendRequests.map(req => ({ ...req, type: 'unfriend_request' })),
            ];

            setRequests(combinedRequests);

        } catch (error) {
            console.error('Error fetching requests:', error);
            Alert.alert('Error', 'Failed to fetch notifications. Please try again.');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const respondToFriendRequest = async (requestId, senderId, action) => {
        setActionLoadingId(requestId);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const Token = await AsyncStorage.getItem('Token');
            if (!userId) {
                Alert.alert('Error', 'User ID not found, please login again');
                setActionLoadingId(null);
                return;
            }

            const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.SEND_RESPON}`, {
                userId,
                senderId,
                action,
            },
                {
                    headers: { Authorization: `${Token}` },
                });

            if (res.data.success) {
                setRequests((prev) => prev.filter((req) => req._id !== requestId));
                Alert.alert('Success', res.data.message);
            } else {
                Alert.alert('Error', res.data.message || 'Something went wrong');
            }
        } catch (error) {
            const serverMessage = error?.response?.data?.message;
            Alert.alert('Oops', serverMessage || `Failed to process the request.`);
        } finally {
            setActionLoadingId(null);
        }
    };

    const respondToUnfriendRequest = async (requestId, senderId, action) => {
        setActionLoadingId(requestId);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const Token = await AsyncStorage.getItem('Token');
            if (!userId) {
                Alert.alert('Error', 'User ID not found, please login again');
                setActionLoadingId(null);
                return;
            }

            const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.UNFRIEND_REQ}`, {
                userId,
                senderId,
                action,
            },
                {
                    headers: { Authorization: `${Token}` },
                });

            if (res.data.success) {
                setRequests((prev) => prev.filter((req) => req._id !== requestId));
                Alert.alert('Success', res.data.message);
            } else {
                Alert.alert('Error', res.data.message || 'Something went wrong');
            }
        } catch (error) {
            const serverMessage = error?.response?.data?.message;
            Alert.alert('Oops', serverMessage || `Failed to process unfriend request.`);
        } finally {
            setActionLoadingId(null);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchFriendRequests();
        }, [])
    );

    const renderCard = ({ item }) => {
        const isLoading = actionLoadingId === item._id;
        // Ensure username is always a string. Check for 'from' and 'name' properties.
        const username = item.from && typeof item.from.name === 'string' ? item.from.name : 'Unknown User';
        // Ensure avatar URL is valid, otherwise use default
        const avatarSource = item.from && item.from.avatar ? { uri: item.from.avatar } : require('../assets/avatar.png');
        // Ensure requestTime is always a string.
        const requestTime = item.createdAt ? moment(item.createdAt).fromNow() : '';

        return (
            <View style={styles.card}>
                <Image source={avatarSource} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{username}</Text>
                    {item.type === 'friend_request' && (
                        <Text style={styles.messageText}>sent you a friend request</Text>
                    )}
                    {item.type === 'unfriend_request' && (
                        <Text style={styles.messageText}>wants to unfriend you</Text>
                    )}
                    <Text style={styles.timestamp}>
                        {requestTime}
                    </Text>
                </View>
                <View style={styles.buttonsContainer}>
                    {item.type === 'friend_request' ? (
                        <>
                            <TouchableOpacity
                                style={[styles.button, styles.acceptButton]}
                                onPress={() => respondToFriendRequest(item._id, item.from?._id, 'accept')}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Accept</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.rejectButton]}
                                onPress={() => respondToFriendRequest(item._id, item.from?._id, 'reject')}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Reject</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.button, styles.agreeButton]}
                                onPress={() => respondToUnfriendRequest(item._id, item.from?._id, 'agree')}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Agree to Unfriend</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelUnfriendButton]}
                                onPress={() => respondToUnfriendRequest(item._id, item.from?._id, 'cancel')}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Cancel</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!requests || requests.length === 0) {
        return (
            <View style={styles.centered}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.noRequestsText}>No new notifications</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}>
                <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.NotificationTextView}>
                <Text style={styles.NotificationText}>Notifications</Text>
            </View>
            <FlatList
                data={requests}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ padding: 16, paddingTop: 20 }}
                refreshing={loading}
                onRefresh={fetchFriendRequests}
                renderItem={renderCard}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 50,
        left: 16,
        zIndex: 10,
    },
    timestamp: {
        color: 'green',
        fontSize: 12,
        marginTop: 4,
    },
    NotificationTextView: {
        marginTop: 80,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        marginBottom: 20,
    },
    NotificationText: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.darkText,
    },
    centered: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noRequestsText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.grayText,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
        borderLeftWidth: 5,
        borderColor: COLORS.primaryLight,
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        marginRight: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    name: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.darkText,
    },
    messageText: {
        fontSize: 14,
        color: COLORS.grayText,
        marginTop: 2,
    },
    buttonsContainer: {
        flexDirection: 'column',
        gap: 8,
        marginLeft: 10,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
    },
    acceptButton: {
        backgroundColor: COLORS.primary,
    },
    rejectButton: {
        backgroundColor: COLORS.gray,
    },
    agreeButton: {
        backgroundColor: 'red',
    },
    cancelUnfriendButton: {
        backgroundColor: COLORS.gray,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default NotificationScreen;