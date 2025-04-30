import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './loginSignupStyle';
import { useNavigation } from '@react-navigation/native';


const RegisterScreen = () => {

const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  const RegisterLink = () => {
   navigation.navigate('login')
  }

  const handleRegister =  () => {
   navigation.navigate('home')
    
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.topimgContainer}>
              <Image source={require("../assets/topLogin.png")} style={styles.topimg} />
          </View>

          <View style={styles.Hello_Text_Area}>
            <Text style={styles.Hello_Text}>Register</Text>
          </View>

          <View style={styles.login_under_text_area}>
            <Text style={styles.login_under_text}>Register here to Enroll!</Text>
          </View>

          {/* Username */}
          <View style={styles.input_Container}>
          <Image source={require("../assets/favicon.png")} style={styles.inputIcon} />
          <TextInput
              placeholder='Username'
              style={styles.InputText}
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Email */}
          <View style={styles.input_Container}>
            <Image source={require("../assets/favicon.png")} style={styles.inputIcon} />
            <TextInput
              placeholder='Email'
              style={styles.InputText}
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize="none"
            />
          </View>

          {/* Mobile */}
          <View style={styles.input_Container}>
          <Image source={require("../assets/favicon.png")} style={styles.inputIcon} />
          <TextInput
              placeholder='Mobile No.'
              style={styles.InputText}
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
            />
          </View>

          {/* Password */}
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

          {/* Register Button */}
          <View style={styles.signInContainer}>
            <TouchableOpacity onPress={handleRegister} style={{ width: '100%', alignItems: 'center' }}>
              <LinearGradient colors={["#F97794", "#623AA2"]} style={styles.Signcontainer}>
                <Text style={styles.signIn}>Register</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Navigate to Login */}
          <TouchableOpacity onPress={RegisterLink} style={styles.signup_btn}>
            <Text>
              Already have an account? <Text style={styles.signup_text}>Login</Text>
            </Text>
          </TouchableOpacity>

         
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default RegisterScreen;

