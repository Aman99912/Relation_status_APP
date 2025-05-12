
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import axios from 'axios';
import { APIPATH } from '../utils/apiPath';
import FloatingInput from './floatintext';
import { COLORS } from '../Color';
import BackButton from '../components/backbtn';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handlePasswordReset = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.REST_API}`, {
        email,
        newPassword,
      });

      if (res.data.success) {
        Alert.alert('Success', 'Password updated successfully');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', res.data.message || 'Password update failed');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Server error while resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <BackButton navigation={navigation} />
      <Text style={styles.title}>Reset Your Password</Text>

      <FloatingInput
        label={'New Password'}
        secureTextEntry
        value={newPassword}
        setValue={setNewPassword}
      />

      <FloatingInput
        label={'Confirm Password'}
        secureTextEntry
        value={confirmPassword}
        setValue={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handlePasswordReset} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Updating...' : 'Update Password'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ResetPasswordScreen;

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
