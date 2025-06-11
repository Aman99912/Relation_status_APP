import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Easing } from 'react-native';
import axios from 'axios';
import { APIPATH } from '../utils/apiPath';
import FloatingInput from './floatintext';
import { COLORS } from '../Color';
import BackButton from './backbtn';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UpdateEmailScreen = () => {
  const navigation = useNavigation();
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, []);

  const UpdateEmail = async () => {
    const newEmailId = newEmail.trim().toLowerCase();

    if (!newEmailId) {
      Alert.alert('Error', 'Please enter new email');
      return;
    }

    navigation.navigate('OtpScreen', {
      email: newEmailId,

      onVerified: async () => {
        try {
          setLoading(true);

          const id = await AsyncStorage.getItem('userId');
          const token = await AsyncStorage.getItem('Token');

          if (!id || !token) {
            Alert.alert('Error', 'User authentication data missing');
            return;
          }

          
          const res = await axios.put(
            `${APIPATH.BASE_URL}/${APIPATH.UPDATE_USER_API}/${id}`,
            { email: newEmailId },
            {
              headers: {
                Authorization: `${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (res.data.success) {
           
            await AsyncStorage.setItem('userEmail', newEmailId);

            Alert.alert('Success', 'Email updated and verified successfully');
            navigation.navigate('MainApp', { screen: 'chatPF' });
          } else {
            Alert.alert('Error', res.data.message || 'Failed to update email');
          }
        } catch (error) {
          console.log(error);
          Alert.alert('Error', 'Server error while updating email');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <BackButton navigation={navigation} />
      <Text style={styles.title}>Update Your Email</Text>

      <FloatingInput
        label="New Email"
        value={newEmail}
        setValue={setNewEmail}
        keyboardType="email-address"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={UpdateEmail}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Updating...' : 'Update Email'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default UpdateEmailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.primary,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
