import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { styles } from './loginSignupStyle'; 

const LoginScreen = () => {
  const navigation = useNavigation();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const RegisterLink = () => {
    navigation.navigate("register");
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.206.121:8000/api/user/login', {
        login,
        password
      });

      if (response.data.success) {
        Alert.alert("Success", "Login successful");
        navigation.navigate("home"); 
        Alert.alert("Login Failed", response.data.message || "Invalid credentials");
      }

    } catch (error) {
      console.error("Login Error:", error.message);
      Alert.alert("Error", "Unable to connect to server");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.topimgContainer}>
              <Image source={require("../assets/topLogin.png")} style={styles.topimg} />
            </View>

            <View style={styles.Hello_Text_Area}>
              <Text style={styles.Hello_Text}>Login</Text>
            </View>

            <View style={styles.login_under_text_area}>
              <Text style={styles.login_under_text}>Login To Access App</Text>
            </View>

            <View style={styles.input_Container}>
              <Image source={require("../assets/favicon.png")} style={styles.inputIcon} />
              <TextInput
                placeholder='Login'
                style={styles.InputText}
                value={login}
                onChangeText={setLogin}
              />
            </View>

            <View style={styles.input_Container}>
              <Image source={require("../assets/favicon.png")} style={styles.inputIcon} />
              <TextInput
                placeholder='Password'
                secureTextEntry
                style={styles.InputText}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Text style={styles.forgotPasswordText}>Forgot Password</Text>

            <View style={styles.signInContainer}>
              <TouchableOpacity onPress={handleLogin} style={{ width: '100%', alignItems: 'center' }}>
                <LinearGradient colors={["#F97794", "#623AA2"]} style={styles.Signcontainer}>
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

export default LoginScreen;
