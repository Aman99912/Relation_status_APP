import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { APIPATH } from '../../utils/apiPath';

export const fetchDiary = createAsyncThunk(
  'diary/fetchDiary',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await axios.get(`${APIPATH.BASE_URL}/${APIPATH.GETDIARY}?userID=${userId}`, {
        headers: { Authorization: token },
      });
      return res.data.entries;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch diary');
    }
  }
);

const diarySlice = createSlice({
  name: 'diary',
  initialState: {
    entries: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiary.fulfilled, (state, action) => {
        state.entries = action.payload;
        state.loading = false;
      })
      .addCase(fetchDiary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default diarySlice.reducer; 