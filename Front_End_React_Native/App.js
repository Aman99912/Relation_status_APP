import React, { useState, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import HomePage from './screens/HomePage';
import ProfilePage from './screens/ProfilePage';
import NotificationPage from './screens/notificationPage';
import AddUser from './screens/addUser';
import Registerpage from './screens/signupScreen';
import LoginPage from './screens/loginScreen.jsx';
import Navbar from './components/Navbar.jsx';


// Create the AuthContext
export const AuthContext = createContext();

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

function AuthNavigator({ setIsLoggedIn }) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="login">
        {(props) => <LoginPage {...props} setIsLoggedIn={setIsLoggedIn} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="register" component={Registerpage} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <>
      <MainStack.Navigator screenOptions={{ headerShown: false }}>
        <MainStack.Screen name="home" component={HomePage} />
        <MainStack.Screen name="profile" component={ProfilePage} />
        <MainStack.Screen name="notification" component={NotificationPage} />
        <MainStack.Screen name="addUser" component={AddUser} />
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
