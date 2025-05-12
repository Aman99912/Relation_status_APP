import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FloatingInput from './floatintext';
import { COLORS } from '../Color';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIPATH } from '../utils/apiPath';
import Backbtn from '../components/backbtn.jsx'

export default function HomeScreen() {
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [enteredOTP, setEnteredOTP] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null); // State to store user data
  const [otpLoading, setOtpLoading] = useState(false); // For OTP verification loading



 useEffect(() => {
  const fetchUserData = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (!email) return;


    const response = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDATA}/${email}`);

      setUserData(response.data);
    } catch (err) {
      console.error('Axios Error:', err.response?.data || err.message || err);
      alert('Failed to fetch user data');
    }
  };

  fetchUserData();
}, []);



  const handleStatusClick = () => {
    setShowOTPInput(true);
  };

  const handleVerify = async () => {
    try {
      setOtpLoading(true);
      const response = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.VERIFY_PASS}`, {
        Pass: enteredOTP,
        email
      });

      setOtpLoading(false);
      if (response.data.success) {
        setVerified(true);
        setShowOTPInput(false);
      } else {
        alert(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setOtpLoading(false);
      alert('Server error');
    }
  };

  const handleClose = () => {
    setVerified(false);
    setShowOTPInput(false);
    setEnteredOTP('');
  };

  return (
    <View style={styles.container}>
      {!verified && !showOTPInput && userData && (
        <UserCard
          username={userData.username}
          email={userData.email}
          gender={userData.gender}
          age={userData.age}
          status="Hidden"
          onStatusClick={handleStatusClick}
        />
      )}

      {showOTPInput && (
        
        <>
        
        <View style={styles.otpBox}>
         <FloatingInput  label={"Your Secret Pass Code"} value={enteredOTP} setValue={setEnteredOTP}  />
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerify} disabled={otpLoading}>
            {otpLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.verifyText}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>
            </>
      )}

      {verified && (
        <>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <FontAwesome name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.linkBox}>
            <FontAwesome name="link" size={26} color="#4A90E2" />
          </View>

          <UserCard username="Jane Smith" email="jane@example.com" gender="Female" age={25} status="Verified" />
        </>
      )}
    </View>
  );
}

const UserCard = ({ username, email, gender, age, status, onStatusClick }) => (
  <View style={styles.userBox}>
    <View style={styles.avatarContainer}>
      <FontAwesome name="user" size={55} color="#333" />
    </View>
    <Text style={styles.userText}>Welcome, {username}</Text>

    <View style={styles.infoContainer}>
      <Text style={styles.infoText}>Email: {email}</Text>
      <Text style={styles.infoText}>Gender: {gender}</Text>
      <Text style={styles.infoText}>Age: {age}</Text>
    </View>

    {onStatusClick && (
      <TouchableOpacity onPress={onStatusClick}>
        <Text style={styles.statusText}>Status: {status}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  userBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 320,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    position: 'relative',
  },
  avatarContainer: {
    backgroundColor: '#E0E0E0',
    borderRadius: 50,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
  },
  userText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginBottom: 10,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginVertical: 2,
  },
  statusText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#4A90E2',
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
  linkBox: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 15,
    elevation: 4,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  otpBox: {
    backgroundColor: '#fff',
    width: 300,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  verifyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 30,
    backgroundColor: '#ff4d4d',
    padding: 8,
    borderRadius: 20,
    zIndex: 99,
  },
});
