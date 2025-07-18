import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import friendsReducer from './slices/friendsSlice';
import chatReducer from './slices/chatSlice';
import diaryReducer from './slices/diarySlice';
import notificationReducer from './slices/notificationSlice';
import calendarReducer from './slices/calendarSlice';
import uiReducer from './slices/uiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  friends: friendsReducer,
  chat: chatReducer,
  diary: diaryReducer,
  notification: notificationReducer,
  calendar: calendarReducer,
  ui: uiReducer,
});

export default rootReducer; 