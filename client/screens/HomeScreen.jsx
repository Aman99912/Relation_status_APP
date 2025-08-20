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
// LinearGradient removed - using solid colors instead
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

    const scrollRef = useRef();

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
                
                // --- NEW REDIRECTION LOGIC ---
                const friends = friendsRes.data.friends || [];
             if (friends.length > 0) {
    navigation.navigate('MainApp', {
        screen: 'RelationshipScreen',
        params: { friend: friends[0] }, // 'friend' object ko 'params' ke andar rakhein
    });
    setPasswordModalVisible(false);
    setInputPassword('');

                } else {
                    setFriendsList([]);
                    setPasswordModalVisible(false);
                    setInputPassword('');
                    setIsVerified(true);
                    scrollRef.current?.scrollTo({ y: 0, animated: true });
                }
            } else {
                showCustomAlert('Error', 'Incorrect secret code', 'error');
            }
        } catch (error) {
            console.error("Error verifying password or fetching friends:", error);
            showCustomAlert('Error', error?.response?.data?.message || 'Error verifying code', 'error');
        } finally {
            setPasswordVerifying(false);
            setFriendsLoading(false);
        }
    };

    const onUserCardPress = () => {
        if (!isVerified) {
            setPasswordModalVisible(true);
        }
    };
    
    // Other functions like handleRemoveFriend, handleLocalHide can be here if needed

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <>
            <View
                style={[styles.header, { backgroundColor: COLORS.primary }]}
            >
                <View style={styles.headerContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={userData?.avatar ? { uri: userData.avatar } : require('../assets/avatar.png')}
                            style={styles.headerAvatar}
                        />
                        <View>
                            <Text style={styles.headerGreeting}>Hi, {userData?.fullname?.split(' ')[0] || 'User'} 👋</Text>
                            <Text style={styles.headerEmail}>{userData?.email || ''}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={NotificationHandle} style={{ position: 'relative' }}>
                        <FontAwesome name="bell" size={26} color={COLORS.white} />
                        {(userData?.notifNo > 0 || hasUnfriendRequests) && (
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationText}>{userData?.notifNo > 0 ? userData.notifNo : '!'}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                ref={scrollRef}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {userData && (
                    <View
                        style={[styles.mainCard, { backgroundColor: COLORS.homeGradient1 }]}
                    >
                        <View style={styles.accentDot} />
                        <View style={styles.cardAvatarRing}>
                            <Image
                                source={userData?.avatar ? { uri: userData.avatar } : require('../assets/avatar.png')}
                                style={styles.cardAvatar}
                            />
                        </View>
                        <Text style={styles.cardName}>{userData.fullname || 'User Name'}</Text>
                        <Text style={styles.cardEmail}>{userData.email || ''}</Text>

                        <View style={[styles.statusPill, {backgroundColor: isVerified && friendsList.length > 0 ? COLORS.accent : COLORS.gray}]}>
                             <MaterialCommunityIcons name="heart" size={14} color={'#fff'} style={{ marginRight: 5 }} />
                            <Text style={styles.statusPillText}>
                                {isVerified ? (friendsList.length > 0 ? 'In Relation' : 'Single') : 'Hidden'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.verifyButton}
                            onPress={onUserCardPress}
                            disabled={isVerified}
                        >
                            <Text style={styles.verifyButtonText}>{isVerified ? 'Verified' : 'Verify Secret Code'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
                
                {/* Note: The friends list part is removed from here as the logic now navigates to a new screen */}
                 {isVerified && friendsList.length === 0 && (
                     <Text style={styles.noFriendsText}>You are currently single.</Text>
                 )}


            </ScrollView>
            
            {/* Password Modal */}
            <Modal
                visible={passwordModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPasswordModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <MaterialCommunityIcons name="lock-question" size={38} color={COLORS.primary} style={{ marginBottom: 10 }} />
                        <Text style={styles.modalTitle}>Enter Secret Code</Text>
                        <Text style={styles.modalSubtitle}>To unlock your status, please enter the code.</Text>
                        <FloatingInput
                            label="Secret Code"
                            value={inputPassword}
                            setValue={setInputPassword}
                            secureTextEntry={true} 
                            keyboardType="numeric"
                        />
                        <TouchableOpacity
                            onPress={verifyPasswordAndFetchFriends}
                            style={styles.modalVerifyButton}
                            disabled={passwordVerifying}
                        >
                            {passwordVerifying ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.modalButtonText}>Verify</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setPasswordModalVisible(false)} style={styles.modalCancelButton}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
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
        </>
    );
}

// Styles
const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 8 },
    headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: COLORS.white, marginRight: 16 },
    headerGreeting: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
    headerEmail: { color: COLORS.white, fontSize: 14, opacity: 0.85 },
    notificationBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: COLORS.badge, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.white },
    notificationText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
    scrollContainer: { padding: 20, paddingTop: 16, flexGrow: 1, backgroundColor: COLORS.background },
    mainCard: { borderRadius: 20, padding: 24, alignItems: 'center', elevation: 16, shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.5)' },
    accentDot: { position: 'absolute', top: 16, left: 16, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
    cardAvatarRing: { borderRadius: 40, padding: 4, backgroundColor: COLORS.white, marginBottom: 12, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    cardAvatar: { width: 68, height: 68, borderRadius: 34 },
    cardName: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
    cardEmail: { fontSize: 15, color: COLORS.gray, marginBottom: 16 },
    statusPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 15, marginBottom: 16 },
    statusPillText: { fontSize: 13, color: '#fff', fontWeight: '600' },
    verifyButton: { backgroundColor: COLORS.primary, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 24, elevation: 4, shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 8 },
    verifyButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalBox: { width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
    modalSubtitle: { fontSize: 15, color: COLORS.gray, marginBottom: 20, textAlign: 'center' },
    modalVerifyButton: { marginTop: 16, backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 12, width: '100%', alignItems: 'center' },
    modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    modalCancelButton: { marginTop: 12, padding: 8 },
    modalCancelText: { color: COLORS.gray, fontWeight: '600', fontSize: 15 },
    noFriendsText: {textAlign: 'center', marginTop: 30, fontSize: 16, color: COLORS.grayText}
});