import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Easing, Alert, Image
} from 'react-native';
import { COLORS } from '../Color';
import { useNavigation } from '@react-navigation/native';
import FloatingInput from '../components/floatintext';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { APIPATH } from '../utils/apiPath';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function SignupScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [avatar, setAvatar] = useState(null);

  const handleDobChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
    setDob(formatted);
  };

  const validateDob = (dob) => {
    const regex = /^(0[1-9]|1[0-9]|2[0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(dob);
  };

  const validateMobile = (mobile) => {
    const regex = /^\d{10}$/;
    return regex.test(mobile);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Camera roll access is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaType.Images,  
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !mobile || !password || !dob || !gender) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!validateDob(dob)) {
      Alert.alert('Error', 'Please enter a valid date (DD/MM/YYYY)');
      return;
    }

    if (!validateMobile(mobile)) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }

    try {
      setLoading(true);

      let avatarBase64 = null;
      if (avatar) {
        const base64 = await FileSystem.readAsStringAsync(avatar, {
          encoding: FileSystem.EncodingType.Base64,
        });
        avatarBase64 = `data:image/jpeg;base64,${base64}`;
      }

      const response = await axios.post(`${APIPATH.BASE_URL}/${APIPATH.REGISTER_API}`, {
          name: name.trim().replace(/\s+/g, ' '),                    // Remove extra spaces between words
          email: email.trim().toLowerCase(),                         // Trim and lowercase
           mobile: mobile.trim(),                                     // Remove leading/trailing spaces
           password: password.trim(),                                 // Trim password
           dob: dob.trim(),                                           // Ensure proper formatting
           gender: gender.trim().toLowerCase(),                       // Trim and lowercase gender
           avatar: avatarBase64,
});

     

      const data = response.data;

      if (response.status === 200) {
        Alert.alert('Signup successful!');
        navigation.navigate('Login');
      } else {
        Alert.alert(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert(`Server Error`);
    } finally {
      setLoading(false);
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
        <FloatingInput label="Full Name" value={name} setValue={setName} />
        <FloatingInput label="Email" value={email} setValue={setEmail} />
        <FloatingInput label="Mobile Number" value={mobile} setValue={setMobile} />
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

      <TouchableOpacity
        style={[styles.signupBtn, loading && { backgroundColor: COLORS.gray }]}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.signupText}>{loading ? 'Signing Up......' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>Or</Text>

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
    top: 40,
    left: 20,
  },
  heading: {
    fontSize: 28,
    marginTop:60,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
    marginLeft:20,
  },
  inputBox: {
    marginBottom: 25,
    borderColor: COLORS.inputBorder,
    position: 'relative',
  },
  signupBtn: {
    backgroundColor: COLORS.addfriendbtn,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  orText: {
    textAlign: 'center',
    color: COLORS.gray,
    marginBottom: 10,
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
    color: COLORS.gray,
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
  radioOuterSelected: {},
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: COLORS.text,
  },
  radioText: {
    fontSize: 16,
    color: COLORS.gray,
  },
});
