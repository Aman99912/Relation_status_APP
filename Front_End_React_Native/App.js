import React, { useState, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import HomePage from './screens/HomePage.jsx';
import ProfilePage from './screens/ProfilePage.jsx';
import NotificationPage from './screens/notificationPage.jsx';
import AddUser from './screens/addUser.jsx';
import Registerpage from './screens/signupScreen.jsx';
import LoginPage from './screens/loginScreen.jsx';
import Navbar from './components/Navbar.jsx';
import ForgotPasswordPage from './screens/forgotPass.jsx';


// Create the AuthContext
export const AuthContext = createContext();

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

function AuthNavigator({ setIsLoggedIn }) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="LoginPage">
        {(props) => <LoginPage {...props} setIsLoggedIn={setIsLoggedIn} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Registerpage" component={Registerpage} />
      <AuthStack.Screen name="ForgotPasswordPage" component={ForgotPasswordPage} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <>
      <MainStack.Navigator screenOptions={{ headerShown: false }}>
        <MainStack.Screen name="HomePage" component={HomePage} />
        <MainStack.Screen name="ProfilePage" component={ProfilePage} />
        <MainStack.Screen name="NotificationPage" component={NotificationPage} />
        <MainStack.Screen name="AddUser" component={AddUser} />
      </MainStack.Navigator>
      <Navbar />
    </>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        {isLoggedIn ? <MainNavigator /> : <AuthNavigator setIsLoggedIn={setIsLoggedIn} />}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
