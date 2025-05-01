// LoginScreen.js
import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, Alert, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { AuthContext } from '../App'; // Import the context
import { styles } from './loginSignupStyle';
import { Ionicons } from '@expo/vector-icons';

const LoginPage = ({ navigation }) => {
  const { setIsLoggedIn } = useContext(AuthContext); // Access setIsLoggedIn from context
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
  const RegisterLink = () => {
    navigation.navigate('Registerpage');
  };

  const handleLogin = async () => {
    if (!login || !password) {
      Alert.alert('Error', 'Please enter both login and password.');
      return;
    }

    try {
      const response = await axios.post('http://192.168.206.121:8000/api/user/login', {
        login,
        password
      });

      if (response.status === 200) {
        setIsLoggedIn(true); // Update login state
        Alert.alert('Success', 'Login successful');
        navigation.navigate('HomePage'); // Navigate to home after successful login
      } else {
        Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login Error:', error.message);
      const errorMessage = error.response ? error.response.data.message : 'Unable to connect to server';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.topimgContainer}>
              <Image source={require('../assets/topLogin.png')} style={styles.topimg} />
            </View>

            <View style={styles.Hello_Text_Area}>
              <Text style={styles.Hello_Text}>Login</Text>
            </View>

            <View style={styles.login_under_text_area}>
              <Text style={styles.login_under_text}>Login To Access App</Text>
            </View>

            <View style={styles.input_Container}>
              <Image source={require('../assets/favicon.png')} style={styles.inputIcon} />
              <TextInput
                placeholder='E-mail'
                style={styles.InputText}
                value={login}
                onChangeText={setLogin}
              />
            </View>

           <View style={styles.input_Container}>
                      <Image source={require('../assets/favicon.png')} style={styles.inputIcon} />
                      <TextInput
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        style={[styles.InputText, { flex: 1 }]}
                        value={password}
                        onChangeText={setPassword}
                      /> 
                       <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                      name={showPassword ? 'eye' : 'eye-off'}
                                      size={20}
                                      color="gray"
                                      style={{ marginRight: 10 }}
                                    />
                                  </TouchableOpacity>
            </View>

            <Text style={styles.forgotPasswordText}>Forgot Password</Text>

            <View style={styles.signInContainer}>
              <TouchableOpacity onPress={handleLogin} style={{ width: '100%', alignItems: 'center' }}>
                <LinearGradient colors={['#F97794', '#623AA2']} style={styles.Signcontainer}>
                  <Text style={styles.signIn}>Login</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={RegisterLink} style={styles.signup_btn}>
              <Text>
                Don't have an account? <Text style={styles.signup_text}>Sign-Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginPage;
