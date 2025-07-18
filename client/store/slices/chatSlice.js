import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { APIPATH } from '../../utils/apiPath';

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ userId, friendId }, { getState, rejectWithValue }) => {
    try {
      const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.FATCHCHAT}/${userId}/${friendId}`);
      return { friendId, messages: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: {}, // { friendId: [messages] }
    loading: false,
    error: null,
  },
  reducers: {
    addMessage: (state, action) => {
      const { friendId, message } = action.payload;
      if (!state.chats[friendId]) state.chats[friendId] = [];
      state.chats[friendId].push(message);
    },
    setOnlineStatus: (state, action) => {
      const { friendId, isOnline } = action.payload;
      if (!state.chats[friendId]) state.chats[friendId] = [];
      state.chats[friendId].isOnline = isOnline;
    },
    setTyping: (state, action) => {
      const { friendId, typing } = action.payload;
      if (!state.chats[friendId]) state.chats[friendId] = [];
      state.chats[friendId].typing = typing;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.chats[action.payload.friendId] = action.payload.messages;
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addMessage, setOnlineStatus, setTyping } = chatSlice.actions;
export default chatSlice.reducer; 