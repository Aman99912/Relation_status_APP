import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
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
import UpdateEmailScreen from './components/newEmail';
import Dashboard from './components/Dashboard';
import PrivacyPage from './components/PrivacyPage';
import ChangePasswordScreen from './components/PassChange';
import ChangeSubPasswordScreen from './components/subPass';
import UpdateMobileNum from './components/newNum';
import { SocketProvider } from './context/SocketContext';
import RelationshipScreen from './screens/RelationshipScreen';
import LocationShare from './components/locationShare';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


function MainAppTabs() {
  return (
    <>
    
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={() => <NavBar />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Logout" component={ProfileScreen} />
      <Tab.Screen name="Adduser" component={AddUser} />
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="diary" component={DiaryScreen} />
      <Tab.Screen name='LocationShare' component={LocationShare} />
      <Tab.Screen name='RelationshipScreen' component={RelationshipScreen}/>
      <Tab.Screen name="chatPF" component={ProfileCompo} />
      <Tab.Screen name="calendarScreen" component={CalendarNote} />
      <Tab.Screen name="notification" component={NotificationScreen} />
      <Tab.Screen name="updateEmail" component={UpdateEmailScreen} />
      <Tab.Screen name="PrivacyPage" component={PrivacyPage} />
      <Tab.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
      <Tab.Screen name="ChangeSubPasswordScreen" component={ChangeSubPasswordScreen} />
      <Tab.Screen name="UpdateEmailScreen" component={UpdateEmailScreen} />
      <Tab.Screen name="UpdateMobileNum" component={UpdateMobileNum} />
    </Tab.Navigator>
    </>
  );
}


export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Startup" component={StartupScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="OtpScreen" component={OtpScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="newPass" component={ResetPasswordScreen} />
              <Stack.Screen name="forgot-password" component={ForgotPass} />
              <Stack.Screen name="chats" component={ChatScreen}  />
              <Stack.Screen name="MainApp" component={MainAppTabs} />
            </Stack.Navigator>
          </NavigationContainer>
        </SocketProvider>
      </PersistGate>
    </Provider>
  );
}
