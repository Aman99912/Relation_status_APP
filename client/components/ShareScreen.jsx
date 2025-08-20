// screens/WatchPartyScreen.jsx

import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { SocketContext } from '../context/SocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../Color';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// LinearGradient removed - using solid colors instead

// Function to extract YouTube Video ID from a URL
const getYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const WatchPartyScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { friendId, friendName, friendAvatar } = route.params;

    const [userId, setUserId] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoId, setVideoId] = useState(null);
    const [isPlaying, setPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const playerRef = useRef(null);
    const socket = useContext(SocketContext);
    const isFriendAction = useRef(false);

    useEffect(() => {
        const init = async () => {
            const id = await AsyncStorage.getItem('userId');
            setUserId(id);
        };
        init();
    }, []);

    useEffect(() => {
        if (!socket || !userId || !friendId) return;

        socket.emit('join-watch-party', { userId, friendId });

        const handleFriendControl = (control) => {
            isFriendAction.current = true;
            
            if (control.action === 'PLAY') {
                playerRef.current?.seekTo(control.time, true);
                setPlaying(true);
            } else if (control.action === 'PAUSE') {
                setPlaying(false);
            } else if (control.action === 'SEEK') {
                playerRef.current?.seekTo(control.time, true);
            } else if (control.action === 'LOAD_VIDEO') {
                setIsLoading(true);
                setVideoId(control.videoId);
            }
        };

        socket.on('friend-video-control', handleFriendControl);

        return () => {
            socket.emit('leave-watch-party', { userId, friendId });
            socket.off('friend-video-control', handleFriendControl);
        };
    }, [socket, userId, friendId]);

    const handleLoadVideo = () => {
        const id = getYoutubeVideoId(videoUrl);
        if (id) {
            setIsLoading(true);
            setVideoId(id);
            socket.emit('video-control', {
                userId,
                friendId,
                control: { action: 'LOAD_VIDEO', videoId: id }
            });
        } else {
            Alert.alert("Invalid URL", "Please paste a valid YouTube video URL.");
        }
    };

    const onStateChange = useCallback(async (state) => {
        if (isFriendAction.current) {
            isFriendAction.current = false;
            return;
        }

        const currentTime = await playerRef.current?.getCurrentTime();

        if (state === 'playing') {
            socket.emit('video-control', { userId, friendId, control: { action: 'PLAY', time: currentTime } });
        } else if (state === 'paused') {
            socket.emit('video-control', { userId, friendId, control: { action: 'PAUSE', time: currentTime } });
        }
    }, [socket, userId, friendId]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Watch Party</Text>
            </View>
            
            {!videoId ? (
                <View style={styles.inputSection}>
                    <MaterialCommunityIcons name="youtube" size={80} color={COLORS.primary} style={{ marginBottom: 20 }}/>
                    <Text style={styles.label}>Watch YouTube Together</Text>
                    <Text style={styles.subLabel}>Paste a video link below to start.</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="link" size={24} color="#888" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Paste YouTube URL here..."
                            placeholderTextColor="#888"
                            value={videoUrl}
                            onChangeText={setVideoUrl}
                        />
                    </View>
                    <TouchableOpacity style={styles.loadButton} onPress={handleLoadVideo}>
                        <Text style={styles.loadButtonText}>Load Video</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.videoSection}>
                    <View style={styles.videoContainer}>
                        {isLoading && <ActivityIndicator size="large" color={COLORS.primary} style={StyleSheet.absoluteFill} />}
                        <YoutubePlayer
                            ref={playerRef}
                            height={230}
                            play={isPlaying}
                            videoId={videoId}
                            onChangeState={onStateChange}
                            onReady={() => setIsLoading(false)}
                            onError={(e) => {
                                setIsLoading(false);
                                Alert.alert("Playback Error", "This video might be restricted from playing in embeds.");
                            }}
                        />
                    </View>
                    <View style={styles.nowPlayingCard}>
                        <Image source={{ uri: friendAvatar }} style={styles.avatar} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.nowPlayingText}>Now watching with</Text>
                            <Text style={styles.friendName}>{friendName}</Text>
                        </View>
                        <View style={styles.statusIndicator}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Synced</Text>
                        </View>
                    </View>
                     <TouchableOpacity onPress={() => setVideoId(null)} style={styles.changeVideoButton}>
                        <Text style={styles.changeVideoButtonText}>Change Video</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20, backgroundColor: COLORS.shareScreenBg },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 50 : 20, marginBottom: 30 },
    backButton: { padding: 8 },
    title: { flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 'bold', color: '#fff', marginRight: 32 },
    
    inputSection: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 50 },
    label: { color: '#fff', fontSize: 22, fontWeight: '600', marginBottom: 8 },
    subLabel: { color: '#aaa', fontSize: 14, marginBottom: 30 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', borderRadius: 12, width: '100%', marginBottom: 20 },
    inputIcon: { marginLeft: 15 },
    input: { flex: 1, color: '#fff', paddingVertical: 15, paddingHorizontal: 10, fontSize: 16 },
    loadButton: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
    loadButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    videoSection: { flex: 1 },
    videoContainer: { borderRadius: 15, overflow: 'hidden', backgroundColor: '#000', elevation: 10, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10 },
    nowPlayingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 12, marginTop: 25 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    nowPlayingText: { color: '#ccc', fontSize: 14 },
    friendName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    statusIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,255,0,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.statusDot, marginRight: 6 },
    statusText: { color: '#fff', fontSize: 12 },
    changeVideoButton: { borderColor: COLORS.primary, borderWidth: 1, paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
    changeVideoButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
});

export default WatchPartyScreen;