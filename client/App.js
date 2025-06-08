import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import StartupScreen from './screens/logoScreen';
import LoginScreen from './screens/loginSceen';
import SignupScreen from './screens/registerScreen';
import HomeScreen from './screens/HomeScreen';

import NavBar from './components/Navbar';


import DiaryScreen from './screens/diaryScreen';

import ProfileScreen from './screens/ProfilePage';
import ChatScreen from './screens/chatScreen';
import AddUser from './components/addUser';
import NotificationScreen from './components/notificationScreen';
import CalendarNote from './components/calender';
import ForgotPass from './components/forgotPass';
import ResetPasswordScreen from './components/newPass';
import OtpScreen from './components/otpScreen';
import ProfileCompo from './components/profileCompo';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab navigator with Navbar
function MainAppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={() => <NavBar />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Logout" component={ProfileScreen} />
      <Tab.Screen name="Adduser" component={AddUser} />
      <Tab.Screen name="chats" component={ChatScreen} />
      <Tab.Screen name="diary" component={DiaryScreen} />
      <Tab.Screen name="chatPF" component={ProfileCompo} />
      <Tab.Screen name="calendarScreen" component={CalendarNote} />
      <Tab.Screen name="notification" component={NotificationScreen} />
    </Tab.Navigator>
  );
}

// Main App component with Stack Navigator for the flow
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Startup" component={StartupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OtpScreen" component={OtpScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="newPass" component={ResetPasswordScreen} />
        <Stack.Screen name="forgot-password" component={ForgotPass} />
        
        {/* {/* The MainApp screen contains the Tab navigator */}
        <Stack.Screen name="MainApp" component={MainAppTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
