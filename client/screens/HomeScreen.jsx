import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    ScrollView,
    Modal,
    Alert,
    ToastAndroid,
    StyleSheet,
} from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import FloatingInput from '../components/floatintext';
import { COLORS } from '../Color';
import axios from 'axios';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIPATH } from '../utils/apiPath';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
    const navigation = useNavigation();
    const NotificationHandle = () => navigation.navigate('MainApp', { screen: 'notification' });

    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [inputPassword, setInputPassword] = useState('');
    const [passwordVerifying, setPasswordVerifying] = useState(false);
    const [friendsList, setFriendsList] = useState([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [friendMenuModalVisible, setFriendMenuModalVisible] = useState(false);
    const [selectedFriendForMenu, setSelectedFriendForMenu] = useState(null);
    const [hasUnfriendRequests, setHasUnfriendRequests] = useState(false);

    const scrollRef = useRef();
    const fetchUserDataRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                try {
                    setLoading(true);
                    const id = await AsyncStorage.getItem('userId');
                    const Token = await AsyncStorage.getItem('Token');

                    if (!id) {
                        Alert.alert('Error', 'User ID not found in storage');
                        return;
                    }

                    const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}?id=${id}`, {
                        headers: {
                            Authorization: `${Token}`
                        },
                    });
                    if (res.status === 200) {
                        setUserData(res.data);
                        setIsVerified(false);
                        setFriendsList([]);
                        setHasUnfriendRequests(res.data.hasPendingUnfriendRequests || false);
                    } else {
                        Alert.alert('Error', 'Failed to fetch user data');
                    }
                } catch (err) {
                    console.error("Error fetching user data:", err);
                    Alert.alert('Error', 'Failed to load user data');
                } finally {
                    setLoading(false);
                }
            };

            fetchUserDataRef.current = fetchUserData;
            fetchUserData();
        }, [])
    );

    const verifyPasswordAndFetchFriends = async () => {
        if (!inputPassword.trim()) {
            Alert.alert('Validation', 'Please enter the secret code');
            return;
        }

        try {
            setPasswordVerifying(true);
            const Token = await AsyncStorage.getItem('Token');
            const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.VERIFY_PASS}`, {
                UserPass: inputPassword,
                email: userData.email,
            },
                {
                    headers: {
                        Authorization: `${Token}`
                    },
                });

            if (res.status === 200) {
                setFriendsLoading(true);
                const friendsRes = await axios.get(
                    `${APIPATH.BASE_URL}/${APIPATH.FRIENDDATA}?email=${userData.email}`,
                    {
                        headers: {
                            Authorization: `${Token}`
                        },
                    }
                );

                setFriendsList(friendsRes.data.friends || []);
                setPasswordModalVisible(false);
                setInputPassword('');
                setIsVerified(true);
                scrollRef.current?.scrollTo({ y: 0, animated: true });
            } else {
                Alert.alert('Error', 'Incorrect secret code');
            }
        } catch (error) {
            console.error("Error verifying password or fetching friends:", error);
            Alert.alert('Error', error?.response?.data?.message || 'Error verifying code');
        } finally {
            setPasswordVerifying(false);
            setFriendsLoading(false);
        }
    };

    const onUserCardPress = () => {
        setPasswordModalVisible(true);
    };

    const handleRemoveFriend = async (friendId) => {
        Alert.alert(
            'Confirm Unfriend',
            `Do you want to send an unfriend request to ${selectedFriendForMenu?.name}? They will need to approve it.`,
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Yes, Send Request',
                    onPress: async () => {
                        try {
                            const userId = await AsyncStorage.getItem('userId');
                            const Token = await AsyncStorage.getItem('Token');

                            if (!userId) {
                                Alert.alert('Error', 'Your user ID not found. Please log in again.');
                                return;
                            }

                            const response = await axios.post(
                                `${APIPATH.BASE_URL}/${APIPATH.SEND_UNFRIEND_REQUEST}`,
                                {
                                    senderId: userId,
                                    receiverId: friendId,
                                },
                                {
                                    headers: { Authorization: `${Token}` },
                                }
                            );

                            if (response.data.success) {
                                ToastAndroid.show('Unfriend request sent successfully!', ToastAndroid.LONG);
                            } else {
                                Alert.alert('Error', response.data.message || 'Failed to send unfriend request.');
                            }
                        } catch (error) {
                            console.error("Error sending unfriend request:", error);
                            Alert.alert(
                                'Error',
                                error?.response?.data?.message || 'Failed to send unfriend request.'
                            );
                        } finally {
                            setFriendMenuModalVisible(false);
                            setSelectedFriendForMenu(null);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleLocalHide = (friendId) => {
        Alert.alert(
            'Hide Card',
            `Are you sure you want to hide ${selectedFriendForMenu?.name}'s card locally? It will reappear after re-verification.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Hide',
                    onPress: () => {
                        const updatedFriendsList = friendsList.filter(f => f._id !== friendId);
                        setFriendsList(updatedFriendsList);
                        setIsVerified(updatedFriendsList.length > 0);
                        ToastAndroid.show(`${selectedFriendForMenu?.name}'s card hidden locally.`, ToastAndroid.SHORT);
                        setFriendMenuModalVisible(false);
                        setSelectedFriendForMenu(null);
                    },
                },
            ],
            { cancelable: true }
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
        >
            <TouchableOpacity style={styles.navItem} onPress={NotificationHandle}>
                <View style={styles.iconContainer}>
                    <FontAwesome name="bell" size={26} color={COLORS.darkGray} />
                    {(userData?.notifNo > 0 || hasUnfriendRequests) && (
                        <View style={[
                            styles.notificationNumber,
                            hasUnfriendRequests && userData?.notifNo === 0 && styles.dotIndicator
                        ]}>
                            <Text style={styles.notificationText}>
                                {userData?.notifNo > 0 ? userData.notifNo : ''}
                                {hasUnfriendRequests && userData?.notifNo === 0 ? '•' : ''}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {userData && (
                <UserCard
                    username={userData.fullname}
                    email={userData.email}
                    gender={userData.gender}
                    avatar={userData.avatar}
                    status={
                        !isVerified
                            ? 'Status: hidden'
                            : friendsList.length > 0
                                ? 'Status: In Relation'
                                : 'Status: Single'
                    }
                    onPress={onUserCardPress}
                    disabled={false}
                    style={
                        isVerified
                            ? friendsList.length > 0
                                ? styles.mainUserCardBelow
                                : styles.mainUserCardCenter
                            : styles.mainUserCardCenter
                    }
                />
            )}

            {friendsLoading && (
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.friendsLoader} />
            )}

            {isVerified && friendsList.length === 0 && !friendsLoading && (
                <Text style={styles.noFriendsText}>You are currently single.</Text>
            )}

            {isVerified && friendsList.length > 0 &&
                friendsList.map((friend) => (
                    <UserCard
                        key={friend._id}
                        username={friend.name}
                        email={friend.email}
                        gender={friend.gender}
                        avatar={friend.avatar}
                        status="Status: In Relation"
                        disabled={true}
                        onMenuPress={() => {
                            setSelectedFriendForMenu(friend);
                            setFriendMenuModalVisible(true);
                        }}
                        onChatPress={() => {
                            navigation.navigate('chats', {
                                friendId: friend._id,
                                friendName: friend.name,
                                friendAvatar: friend.avatar,
                                friendEmail: friend.email,
                            });
                        }}
                        showChatAndMenuButtons={true}
                    />
                ))}

            <Modal
                visible={passwordModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setPasswordModalVisible(false);
                    setInputPassword('');
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Enter Secret Code</Text>

                        <FloatingInput
                            label="Secret Code"
                            value={inputPassword}
                            setValue={setInputPassword}
                            secure='true'
                            keyboardType="numeric"
                        />

                        <TouchableOpacity
                            onPress={verifyPasswordAndFetchFriends}
                            style={styles.verifyButton}
                            disabled={passwordVerifying}
                        >
                            {passwordVerifying ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.verifyText}>Verify</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setPasswordModalVisible(false);
                                setInputPassword('');
                            }}
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={friendMenuModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setFriendMenuModalVisible(false);
                    setSelectedFriendForMenu(null);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Options for {selectedFriendForMenu?.name || 'Friend'}</Text>

                        <TouchableOpacity
                            onPress={() => handleRemoveFriend(selectedFriendForMenu?._id)}
                            style={[styles.menuOptionButton, styles.removeFriendButton]}
                        >
                            <Text style={styles.menuOptionText}>Send Unfriend Request</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleLocalHide(selectedFriendForMenu?._id)}
                            style={styles.menuOptionButton}
                        >
                            <Text style={styles.menuOptionText}>Hide Card Locally</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setFriendMenuModalVisible(false);
                                setSelectedFriendForMenu(null);
                            }}
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </ScrollView>
    );
}

const UserCard = ({
    username,
    email,
    gender,
    avatar,
    onPress,
    status,
    disabled,
    style,
    onMenuPress,
    onChatPress,
    showChatAndMenuButtons = false,
}) => {
    const [imageError, setImageError] = useState(false);

    const getDefaultAvatar = () => {
        return gender === 'female'
            ? require('../assets/female.webp')
            : require('../assets/male.png');
    };

    const avatarSource = !avatar || imageError ? getDefaultAvatar() : { uri: avatar };

    return (
        <TouchableOpacity
            activeOpacity={disabled ? 1 : 0.7}
            onPress={disabled || status !== 'Status: hidden' ? null : onPress}
            style={[styles.userBox, style]}
        >
            {showChatAndMenuButtons && (
                <>
                    <TouchableOpacity
                        onPress={onMenuPress}
                        style={styles.threeDotMenuButton}
                    >
                        <FontAwesome name="ellipsis-v" size={22} color={COLORS.darkGray} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onChatPress}
                        style={styles.chatButton}
                    >
                        <FontAwesome name="comments" size={26} color={COLORS.primary} />
                    </TouchableOpacity>
                </>
            )}

            <View style={styles.avatarContainer}>
                <Image
                    source={avatarSource}
                    style={styles.avatarImage}
                    onError={() => setImageError(true)}
                />
            </View>
            <Text style={styles.userText}>Welcome, {username}</Text>
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Email: {email}</Text>
                <Text style={styles.infoText}>Gender: {gender}</Text>
            </View>
            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>{status}</Text>
            </View>
        </TouchableOpacity>
    );
};

export const styles = StyleSheet.create({
    container: {
        paddingVertical: 30,
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingHorizontal: 15,
        minHeight: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    navItem: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 999,
    },
    iconContainer: {
        position: 'relative',
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationNumber: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: 'red',
        borderRadius: 12,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    notificationText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    dotIndicator: {
        minWidth: 10,
        height: 10,
        borderRadius: 5,
        paddingHorizontal: 0,
    },
    userBox: {
        backgroundColor: '#fff',
        borderRadius: 15,
        width: '95%',
        maxWidth: 360,
        paddingVertical: 25,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 18,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    mainUserCardCenter: {
        marginTop: "40%",
    },
    mainUserCardBelow: {
        marginTop: 60,
    },
    avatarContainer: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 60,
        padding: 15,
        marginBottom: 12,
        width: 110,
        height: 110,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
        resizeMode: 'cover',
    },
    userText: {
        fontSize: 22,
        color: COLORS.darkText,
        fontWeight: '800',
        marginBottom: 10,
        textAlign: 'center',
    },
    infoContainer: {
        width: '100%',
        alignItems: 'flex-start',
        paddingLeft: 15,
        marginBottom: 12,
    },
    infoText: {
        fontSize: 16,
        color: COLORS.grayText,
        marginVertical: 2,
        fontWeight: '500',
    },
    statusContainer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#ccc',
        width: '100%',
        paddingTop: 10,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 15,
        color: COLORS.grayText,
        fontStyle: 'italic',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalBox: {
        backgroundColor: '#fff',
        width: '100%',
        maxWidth: 320,
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        color: COLORS.darkText,
        textAlign: 'center',
    },
    verifyButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 25,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    verifyText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 17,
    },
    cancelButton: {
        marginTop: 15,
        paddingVertical: 10,
    },
    cancelText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 16,
    },
    threeDotMenuButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 2,
        padding: 5,
    },
    chatButton: {
        position: 'absolute',
        top: 15,
        left: 15,
        zIndex: 2,
        padding: 5,
    },
    menuOptionButton: {
        backgroundColor: COLORS.lightGray,
        width: '100%',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    menuOptionText: {
        fontSize: 16,
        color: COLORS.darkText,
        fontWeight: '600',
    },
    removeFriendButton: {
        backgroundColor: COLORS.red,
        borderColor: COLORS.red,
    },
    noFriendsText: {
        fontSize: 16,
        color: COLORS.grayText,
        marginTop: 20,
        textAlign: 'center',
    },
    friendsLoader: {
        marginTop: 20,
    }
});