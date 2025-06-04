import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import StartupScreen from './screens/logoScreen';
import LoginScreen from './screens/loginSceen';
import SignupScreen from './screens/registerScreen';
import OtpScreen from './screens/otpScreen';
import HomeScreen from './screens/HomeScreen';
import LogoutScreen from './screens/userProfile';
import NavBar from './components/Navbar';
import AddUser from './screens/addUser';
import ForgotPass from './screens/forgotPass';
import ResetPasswordScreen from './screens/newPass';
import NotificationCard from './screens/notificationScreen';
import DiaryScreen from './screens/diaryScreen';
import CalendarNote from './screens/calender';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab navigator with Navbar
function MainAppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={() => <NavBar />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Logout" component={LogoutScreen} />
      <Tab.Screen name="Adduser" component={AddUser} />
      <Tab.Screen name="diary" component={DiaryScreen} />
      <Tab.Screen name="calendarScreen" component={CalendarNote} />
      <Tab.Screen name="notification" component={NotificationCard} />
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
