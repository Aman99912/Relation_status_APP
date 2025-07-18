import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { APIPATH } from '../../utils/apiPath';

export const fetchFriends = createAsyncThunk(
  'friends/fetchFriends',
  async (email, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.FRIENDDATA}?email=${email}`, {
        headers: { Authorization: token },
      });
      return res.data.friends;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch friends');
    }
  }
);

const friendsSlice = createSlice({
  name: 'friends',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default friendsSlice.reducer; 