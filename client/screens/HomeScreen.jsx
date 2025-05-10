import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FloatingInput from './floatintext';
import { COLORS } from '../Color';
import axios from 'axios';

export default function HomeScreen() {
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [enteredOTP, setEnteredOTP] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusClick = () => {
    setShowOTPInput(true);
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://192.168.65.121:8000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: enteredOTP }),
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok && result.success) {
        setVerified(true);
        setShowOTPInput(false);
      } else {
        alert(result.message || 'Invalid OTP');
      }
    } catch (err) {
      setLoading(false);
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
      {!verified && !showOTPInput && (
        <UserCard
          username="John Doe"
          email="john@example.com"
          gender="Male"
          age={28}
          status="Hidden"
          onStatusClick={handleStatusClick}
        />
      )}

      {showOTPInput && (
        <View style={styles.otpBox}>
          
          <FloatingInput
         
            
            value={enteredOTP}
            label="Enter OTP"
            onChangeText={setEnteredOTP}
           
          />
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerify} disabled={loading}>
            <Text style={styles.verifyText}>{loading ? 'Verifying...' : 'Verify'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {verified && (
        <>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <FontAwesome name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.linkBox}>
            <FontAwesome name="link" size={26} color="#4A90E2" />
           
          </View>

          <UserCard
            username="Jane Smith"
            email="jane@example.com"
            gender="Female"
            age={25}
            status="Hidden"
          />
        </>
      )}
    </View>
  );
}

const UserCard = ({ username, email, gender, age, status, onStatusClick }) => (
  <View style={styles.userBox}>
    <View style={styles.avatarContainer}>
      <FontAwesome name='user' size={55} color='#333' />
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
    justifyContent:'center',
    alignItems:'center',
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
  linkText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
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
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    textAlign: 'center',
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
