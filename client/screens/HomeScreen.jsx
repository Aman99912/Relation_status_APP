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
    Animated,
    Easing,
} from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import FloatingInput from '../components/floatintext';
import { COLORS } from '../Color';
import axios from 'axios';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIPATH } from '../utils/apiPath';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Loader from '../components/Loader';
import { LinearGradient } from 'expo-linear-gradient';
import CustomAlert from '../components/alert';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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
    const [showAlert, setShowAlert] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('info');
    const [alertOnConfirm, setAlertOnConfirm] = useState(null);
    const [alertShowCancel, setAlertShowCancel] = useState(false);

    // Animation state for celebratory effect
    const [petalAnims] = useState([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]);

    const scrollRef = useRef();
    const fetchUserDataRef = useRef(null);

    useEffect(() => {
        if (isVerified && friendsList.length > 0) {
            petalAnims.forEach((anim, i) => {
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 3200 + i * 400,
                            easing: Easing.inOut(Easing.quad),
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ]),
                ).start();
            });
        } else {
            petalAnims.forEach(anim => anim.setValue(0));
        }
    }, [isVerified, friendsList.length]);

    const showCustomAlert = (title, message, type = 'info', onConfirm = null, showCancel = false) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertType(type);
        setAlertOnConfirm(() => onConfirm);
        setAlertShowCancel(showCancel);
        setShowAlert(true);
    };

    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                try {
                    setLoading(true);
                    const id = await AsyncStorage.getItem('userId');
                    const Token = await AsyncStorage.getItem('Token');

                    if (!id) {
                        showCustomAlert('Error', 'User ID not found in storage', 'error');
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
                        showCustomAlert('Error', 'Failed to fetch user data', 'error');
                    }
                } catch (err) {
                    console.error("Error fetching user data:", err);
                    showCustomAlert('Error', 'Failed to load user data', 'error');
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
            showCustomAlert('Validation', 'Please enter the secret code', 'warning');
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
        setAlertTitle('Unfriend');
        setAlertMessage(`Do you want to send an unfriend request to ${selectedFriendForMenu?.name}? They will need to approve it.`);
        setAlertType('warning');
        setAlertShowCancel(true);
        setAlertOnConfirm(() => async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                const Token = await AsyncStorage.getItem('Token');

                if (!userId) {
                    showCustomAlert('Error', 'Your user ID not found. Please log in again.', 'error');
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
                    showCustomAlert('Success', 'Unfriend request sent successfully!', 'success');
                } else {
                    showCustomAlert('Error', response.data.message || 'Failed to send unfriend request.', 'error');
                }
            } catch (error) {
                console.error("Error sending unfriend request:", error);
                showCustomAlert('Error', error?.response?.data?.message || 'Failed to send unfriend request.', 'error');
            } finally {
                setFriendMenuModalVisible(false);
                setSelectedFriendForMenu(null);
            }
        });
        setShowAlert(true);
    };

    const handleLocalHide = (friendId) => {
        setAlertTitle('Hide Card');
        setAlertMessage(`Are you sure you want to hide ${selectedFriendForMenu?.name}'s card locally? It will reappear after re-verification.`);
        setAlertType('warning');
        setAlertShowCancel(true);
        setAlertOnConfirm(() => () => {
            const updatedFriendsList = friendsList.filter(f => f._id !== friendId);
            setFriendsList(updatedFriendsList);
            setIsVerified(updatedFriendsList.length > 0);
            ToastAndroid.show(`${selectedFriendForMenu?.name}'s card hidden locally.`, ToastAndroid.SHORT);
            setFriendMenuModalVisible(false);
            setSelectedFriendForMenu(null);
        });
        setShowAlert(true);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <>
            {/* Modern gradient header with avatar and greeting */}
            <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                style={{ paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 8 }}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={userData?.avatar ? { uri: userData.avatar } : require('../assets/avatar.png')}
                            style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: COLORS.white, marginRight: 18, backgroundColor: COLORS.white }}
                        />
                        <View>
                            <Text style={{ color: COLORS.white, fontSize: 22, fontWeight: 'bold', marginBottom: 2 }}>Hi, {userData?.fullname?.split(' ')[0] || 'User'} 👋</Text>
                            <Text style={{ color: COLORS.white, fontSize: 14, opacity: 0.85 }}>{userData?.email || ''}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={NotificationHandle} style={{ position: 'relative' }}>
                        <FontAwesome name="bell" size={30} color={COLORS.white} />
                        {(userData?.notifNo > 0 || hasUnfriendRequests) && (
                            <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.badge, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 }}>
                                <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: 'bold' }}>{userData?.notifNo > 0 ? userData.notifNo : ''}{hasUnfriendRequests && userData?.notifNo === 0 ? '•' : ''}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={{ padding: 20, paddingTop: 0, flexGrow: 1 }}
                ref={scrollRef}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* User Card - modern card with shadow and background */}
                {userData && (
                    <LinearGradient
                        colors={['#f8e1f4', '#e0e7ff', '#f7f7fa']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={{
                            borderRadius: 20,
                            padding: 18,
                            marginTop: 16,
                            marginBottom: 24,
                            minHeight: 180,
                            shadowColor: COLORS.cardShadow,
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.18,
                            shadowRadius: 24,
                            elevation: 16,
                            borderWidth: 1.5,
                            borderColor: COLORS.border,
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                        }}
                    >
                        {/* Accent dot */}
                        <View style={{ position: 'absolute', top: 16, left: 18, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent, opacity: 0.7, zIndex: 3, borderWidth: 2, borderColor: '#fff' }} />
                        {/* Avatar with premium ring */}
                        <View style={{
                            shadowColor: COLORS.accent,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.18,
                            shadowRadius: 8,
                            elevation: 6,
                            borderRadius: 40,
                            marginBottom: 10,
                            backgroundColor: '#fff',
                            padding: 3,
                            borderWidth: 2,
                            borderColor: COLORS.accent,
                        }}>
                            <Image
                                source={userData?.avatar ? { uri: userData.avatar } : require('../assets/avatar.png')}
                                style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: COLORS.white }}
                            />
                        </View>
                        <Text style={{ fontSize: 21, fontWeight: 'bold', color: COLORS.text, marginBottom: 2, letterSpacing: 0.2 }}>{userData.fullname || 'User Name'}</Text>
                        <Text style={{ fontSize: 14, color: COLORS.gray, marginBottom: 8 }}>{userData.email || ''}</Text>
                        {/* Status pill */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <MaterialCommunityIcons name="heart" size={18} color={isVerified && friendsList.length > 0 ? COLORS.accent : COLORS.gray} style={{ marginRight: 5 }} />
                            <View style={{ backgroundColor: isVerified && friendsList.length > 0 ? COLORS.accent : COLORS.gray, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 3, marginLeft: 2, minWidth: 70, alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, color: '#fff', fontWeight: '600', letterSpacing: 0.2 }}>
                                    {isVerified ? (friendsList.length > 0 ? 'In Relation' : 'Single') : 'Hidden'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={{ marginTop: 8, backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 7, paddingHorizontal: 22, shadowColor: COLORS.primary, shadowOpacity: 0.12, shadowRadius: 8, elevation: 2 }}
                            onPress={onUserCardPress}
                            disabled={isVerified}
                        >
                            <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 14 }}>{isVerified ? 'Verified' : 'Verify Secret Code'}</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                )}

                {/* Centered red heart between cards */}
                {isVerified && friendsList.length > 0 && (
                    <>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 0, marginTop: -18, marginBottom: 2 }}>
                            <MaterialCommunityIcons name="heart" size={32} color="#FF3B3B" />
                        </View>
                        {friendsList.map((friend) => (
                            <LinearGradient
                                key={friend._id}
                                colors={['#f8e1f4', '#e0e7ff', '#f7f7fa']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={{
                                    borderRadius: 20,
                                    padding: 18,
                                    minHeight: 180,
                                    marginBottom: 18,
                                    shadowColor: COLORS.cardShadow,
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.18,
                                    shadowRadius: 24,
                                    elevation: 16,
                                    borderWidth: 1.5,
                                    borderColor: COLORS.border,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                }}
                            >
                                {/* Accent dot */}
                                <View style={{ position: 'absolute', top: 16, left: 18, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent, opacity: 0.7, zIndex: 3, borderWidth: 2, borderColor: '#fff' }} />
                                {/* Avatar with premium ring */}
                                <View style={{
                                    shadowColor: COLORS.accent,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.18,
                                    shadowRadius: 8,
                                    elevation: 6,
                                    borderRadius: 30,
                                    marginBottom: 8,
                                    backgroundColor: '#fff',
                                    padding: 2,
                                    borderWidth: 2,
                                    borderColor: COLORS.accent,
                                }}>
                                    <Image
                                        source={friend.avatar ? { uri: friend.avatar } : require('../assets/avatar.png')}
                                        style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.white }}
                                    />
                                </View>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 2, letterSpacing: 0.2 }}>{friend.name}</Text>
                                <Text style={{ fontSize: 13, color: COLORS.gray, marginBottom: 8 }}>{friend.email}</Text>
                                {/* Status pill */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <MaterialCommunityIcons name="heart" size={14} color={COLORS.accent} style={{ marginRight: 4 }} />
                                    <View style={{ backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 3, marginLeft: 2, minWidth: 70, alignItems: 'center' }}>
                                        <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600', letterSpacing: 0.2 }}>In Relation</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 6 }}>
                                    <TouchableOpacity onPress={() => navigation.navigate('chats', {
                                        friendId: friend._id,
                                        friendName: friend.name,
                                        friendAvatar: friend.avatar,
                                        friendEmail: friend.email,
                                    })} style={{ marginRight: 10 }} activeOpacity={0.7}>
                                        <FontAwesome name="comments" size={20} color={COLORS.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        setSelectedFriendForMenu(friend);
                                        setFriendMenuModalVisible(true);
                                    }} activeOpacity={0.7}>
                                        <FontAwesome name="ellipsis-v" size={18} color={COLORS.gray} />
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        ))}
                    </>
                )}

            <Modal
                visible={passwordModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setPasswordModalVisible(false);
                    setInputPassword('');
                }}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center' }}>
                    {/* Modern, beautiful modal container (neutral, no pink border/shadow) */}
                    <View style={{
                        width: '88%',
                        backgroundColor: '#fff',
                        borderRadius: 28,
                        padding: 32,
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.13,
                        shadowRadius: 24,
                        elevation: 18,
                        borderTopWidth: 4,
                        borderTopColor: '#e0e0e0',
                    }}>
                        <MaterialCommunityIcons name="lock-question" size={38} color={COLORS.primary} style={{ marginBottom: 10 }} />
                        <Text style={{ fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8, textAlign: 'center' }}>Enter Secret Code</Text>
                        <Text style={{ fontSize: 15, color: '#444', marginBottom: 18, textAlign: 'center' }}>To unlock your relationship status, please enter your secret code.</Text>
                        <FloatingInput
                            label="Secret Code"
                            value={inputPassword}
                            setValue={setInputPassword}
                            secure={true}
                            numeric={true}
                        />
                        <TouchableOpacity
                            onPress={verifyPasswordAndFetchFriends}
                            style={{ marginTop: 8, backgroundColor: COLORS.accent, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 38, alignItems: 'center', elevation: 2 }}
                            disabled={passwordVerifying}
                            activeOpacity={0.8}
                        >
                            {passwordVerifying ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Verify</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setPasswordModalVisible(false);
                                setInputPassword('');
                            }}
                            style={{ marginTop: 12, paddingVertical: 10 }}
                        >
                            <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 16 }}>Cancel</Text>
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

            <CustomAlert
                visible={showAlert}
                title={alertTitle}
                message={alertMessage}
                type={alertType}
                onClose={() => setShowAlert(false)}
                onConfirm={() => {
                    setShowAlert(false);
                    if (alertOnConfirm) alertOnConfirm();
                }}
                showCancel={alertShowCancel}
            />

        </ScrollView>
        </>
    );
}

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