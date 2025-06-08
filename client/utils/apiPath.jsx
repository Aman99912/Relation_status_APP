import { Calendar } from "react-native-calendars";

export const APIPATH = {
  BASE_URL : "http://192.168.127.121:5000",  
  LOGIN_API : "api/user/login",
  VERIFY_PASS : "api/user/verify-pass",
  FRIENDDATA : "api/user/friend",
  GETDATA : "api/user/email",
  GETFRIENDNOTIF : "api/user/friendnotif",
  SEND_REQ : "api/user/send-req",
  SEND_RESPON : "api/user/respond",
  GETCODE : "api/user/code",
  SEND_API : "api/user/send-otp",
  VERIFY_API : "api/user/verify-otp",
  VERIFY_OTP_PASS : "api/user/verify-password-otp",
  REGISTER_API : "api/user/register",
  LOGOUT_API : "api/user/logout",
  UPDATE_USER_API : "api/user/update",
  PF_API : 'api/user/forgot-password',
  REST_API : 'api/user/reset-password',
  

// diary API
  
ADDDIARY:"api/user/add-diary",
GETDIARY:"api/user/userid-diary",

// Calendar Api

CALENDERSEND :"api/user/calendar"


//chats


};


