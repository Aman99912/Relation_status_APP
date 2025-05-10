import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { COLORS } from '../Color';
import { useNavigation } from '@react-navigation/native';
import FloatingInput from './floatintext';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function SignupScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [name, setname] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [mobile, setmobile] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [gender, setGender] = React.useState('');

  // Add at the top
  const BACKEND_URL = 'http://192.168.65.121:8000/api/user/finalize-register'; // replace with your actual backend URL

  const handleDobChange = (text) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');

    let formatted = cleaned;
    if (cleaned.length > 2 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }

    setDob(formatted);
  };

  const handleSignup = async () => {
    console.log("Clicked");
    
    if (!name || !email || !mobile || !password || !Dob) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await axios.post("http://192.168.65.121:8000/api/user/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          mobile,
          password,
          dob,
          gender
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Signup successful!');
        navigation.navigate('Login');
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert(`An error occure ${error}`);
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      <Text style={styles.heading}>Let's get{'\n'}started</Text>

      <View style={styles.inputBox}>
        <FloatingInput label="Full Name" value={name} setValue={setname} />
        <FloatingInput label="Email" value={email} setValue={setEmail} />
        <FloatingInput label="mobile Number" value={mobile} setValue={setmobile} />
        <FloatingInput label="Password" value={password} setValue={setPassword} secure />
        <FloatingInput label="Date Of Birth (DD/MM/YYYY)" value={dob} setValue={handleDobChange} />
        <View style={styles.genderContainer}>
          <Text style={styles.genderLabel}>Gender</Text>
          <View style={styles.radioGroup}>
            {['Male', 'Female'].map((option) => (
              <TouchableOpacity key={option} style={styles.radioButton} onPress={() => setGender(option.toLowerCase())}>
                <View style={[styles.radioOuter, gender === option.toLowerCase() && styles.radioOuterSelected]}>
                  {gender === option.toLowerCase() && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
        <Text style={styles.signupText} >Sign up</Text>
      </TouchableOpacity>

      <Text style={styles.orText}> Or </Text>

      <TouchableOpacity style={styles.bottomText} onPress={() => navigation.navigate('Login')}>
        <Text>
          Already have an account? <Text style={styles.loginLink}>Login</Text>
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  backText: {
    fontSize: 22,
    color: COLORS.primary,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 40,
  },
  inputBox: {
    marginBottom: 25,
    borderColor: COLORS.inputBorder,
    position: 'relative',
  },
  signupBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  orText: {
    textAlign: 'center',
    color: COLORS.gray,
    marginBottom: 10,
  },
  googleBtn: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  googleText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  bottomText: {
    alignSelf: 'center',
  },
  loginLink: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  genderContainer: {
    marginBottom: 20,
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: "#ccc",
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    
    justifyContent: 'space-around',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterSelected: {
    // borderColor: COLORS.text,
    color:"#ccc",
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: COLORS.text,
  },
  radioText: {
    fontSize: 16,
    color:"#ccc",
    
  },
});
