import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  KeyboardAvoidingView, 
  TouchableWithoutFeedback, 
  Keyboard,
  Platform,
  Alert
} from 'react-native';
import { styles } from './loginSignupStyle';
import { SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';



const LoginScreen = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const RegisterLink=()=>{
    Alert.alert("Register")
  }
  
  const handleLogin=()=>{
   Alert.alert("Login")
  
 }
     
  return (
    <SafeAreaView style={{flex:1, backgroundColor:"#fff"}}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex:1}}
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

            <TouchableOpacity
              onPress={RegisterLink}
              style={styles.signup_btn}
            >
              <Text>
                Don't have an account? <Text style={styles.signup_text}>Sign-Up</Text>
              </Text>
            </TouchableOpacity>


          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default LoginScreen;



// const styles = StyleSheet.create({
 
//   container: {
//     backgroundColor: "#fff",
//     fontFamily: "poppins",
//     flex: 2,
    
//     position: 'relative'
//   },
//   Signcontainer: {
//     height: 44,
//     width: "80%",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 17,
//   },
//   topimgContainer: {
//     height: 70,
//   },
//   topimg: {
//     width: "100%",
//     height: 160,
//   },
//   Hello_Text_Area: {
//     paddingTop: 80,
//   },
//   Hello_Text: {
//     textAlign: "center",
//     fontSize: 50,
//     fontWeight: "bold"
//   },
//   login_under_text: {
//     textAlign: "center",
//     padding: 20,
//     fontWeight: "bold"
//   },
//   input_Container: {
//     backgroundColor: "#FFFFFF",
//     flexDirection: "row",
//     borderRadius: 12,
//     marginHorizontal: 40,
//     elevation: 10,
//     marginVertical: 15,
//     alignItems: "center"
//   },
//   inputIcon: {
//     height: 25,
//     width: 25,
//     marginLeft: 20,
//     marginRight: 10,
//   },
//   InputText: {
//     flex: 1,
//     fontSize: 20,
//     padding:12,
//   },
//   forgotPasswordText: {
//     color: "#BEBEBE",
//     textAlign: "right",
//     fontSize: 15,
//     width: "90%",
//   },
//   signInContainer: {
//     flexDirection: "row",
//     width: "100%",
//     marginTop: 40,
//     justifyContent: "center",
//   },
//   signIn: {
//     color: "#fff",
//     fontSize: 25,
//     fontWeight: "bold",
//   },
//   signup_btn: {
//     marginTop: 100,
//     alignItems: 'center',
//   },
//   signup_text: {
//     color: 'red',
//     textDecorationLine: 'none',
//     fontSize: 16,
//     fontWeight: "bold"
//   },
//   backgroundColorImgContainer: {
//     position: "absolute",
//     left: 0,
//     bottom: 0,
//   },
//   backgroundColorImg: {
//     height: 260,
//     width: 150,
//   }
// });



