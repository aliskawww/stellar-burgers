import { getFeedsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TFeedState, TOrdersData } from '@utils-types';

export type FeedState = Omit<TFeedState, 'error'> & {
  error: string | null;
  loaded: boolean;
};
const initialState: FeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null,
  loaded: false,
};
export const fetchFeed = createAsyncThunk<
  TOrdersData,
  void,
  { state: { feed: FeedState } }
>('feed/fetch', () => getFeedsApi(), {
  condition: (_, { getState }) => !getState().feed.isLoading,
});
const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, { payload }) => {
        state.orders = payload.orders;
        state.total = payload.total;
        state.totalToday = payload.totalToday;
        state.isLoading = false;
        state.loaded = true;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось загрузить ленту';
      });
  },
});
export const feedReducer = feedSlice.reducer;
