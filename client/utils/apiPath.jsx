import { Calendar } from "react-native-calendars";

export const APIPATH = {
  BASE_URL : "http://192.168.1.4:8000",  
  LOGIN_API : "api/user/login",
  VERIFY_PASS : "api/user/verify-pass",
  FRIENDDATA : "api/user/friend",
  GETDATA : "api/user/id",
  GETDASHBOARD : "api/user/dashboard/id",


  GETFRIENDNOTIF : "api/user/friendnotif",
  SEND_REQ : "api/user/send-req",
  SEND_RESPON : "api/user/respond",
  UNFRIEND_REQ : "api/user/unfriend-response",
  SEND_UNFRIEND_REQUEST: 'api/user/send-unfriend-request',

  GETCODE : "api/user/code",
  SEND_API : "api/user/send-otp",
  VERIFY_API : "api/user/verify-otp",
  VERIFY_OTP_PASS : "api/user/verify-password-otp",
  REGISTER_API : "api/user/register",
  LOGOUT_API : "api/user/logout",
  UPDATE_USER_API : "api/user/update",
  PF_API : 'api/user/forgot-password',
  REST_API : 'api/user/reset-password',
  CHANGE_PASS : 'api/user/change-password',
  CHANGE_SUB_PASS : 'api/user/set-subpassword',
  GEN_SUB_PASS : 'api/user/generate-SubPassCode',
  

// diary API
  
ADDDIARY:"api/user/add-diary",
GETDIARY:"api/user/userid-diary",
DELETE_DIARY:"api/user/diary",

// Calendar Api

CALENDERCREATE :"api/user/calendar/create",
CALENDERGET :"api/user/calendar/get/id",
CALENDERDELETE :"api/user/calendar/delete",


//chats
SENDCHAT: 'api/chats/send',
    FATCHCHAT: 'api/chats', 
    GETCHATS: 'api/chats/get',
    DELETECHAT: 'api/chats/delete',
    EDITCHAT: 'api/chats/edit', 

};


