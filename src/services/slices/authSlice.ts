import {
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  updateUserApi,
} from '@api';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { getCookie } from '../../utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { TUser } from '@utils-types';

export type AuthState = {
  user: TUser | null;
  checked: boolean;
  pending: boolean;
  error: string | null;
  requestId: string | null;
};

const initialState: AuthState = {
  user: null,
  checked: false,
  pending: false,
  error: null,
  requestId: null,
};

type Config = { state: { auth: AuthState } };

const canStart = (
  _: unknown,
  { getState }: { getState: () => Config['state'] }
): boolean => !getState().auth.pending;

export const checkAuth = createAsyncThunk<TUser | null, void, Config>(
  'auth/check',
  async () => {
    if (!getCookie('accessToken') && !localStorage.getItem('refreshToken')) {
      return null;
    }
    return (await getUserApi()).user;
  },
  {
    condition: (_, api) => !api.getState().auth.checked && canStart(_, api),
  }
);

export const loginUser = createAsyncThunk<TUser, TLoginData, Config>(
  'auth/login',
  async (data) => {
    const response = await loginUserApi(data);
    return response.user;
  },
  { condition: canStart }
);

export const registerUser = createAsyncThunk<TUser, TRegisterData, Config>(
  'auth/register',
  async (data) => {
    const response = await registerUserApi(data);
    return response.user;
  },
  { condition: canStart }
);

export const updateUser = createAsyncThunk<
  TUser,
  Partial<TRegisterData>,
  Config
>('auth/update', async (data) => (await updateUserApi(data)).user, {
  condition: canStart,
});

export const logoutUser = createAsyncThunk<void, void, Config>(
  'auth/logout',
  async () => {
    await logoutApi();
  },
  { condition: canStart }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.pending, (state, action) => {
        state.user = null;
        state.checked = true;
        state.pending = true;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.pending = false;
        state.requestId = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.pending = false;
        state.requestId = null;
        state.error = action.error.message ?? 'Ошибка выхода';
      })
      .addMatcher(
        isAnyOf(
          checkAuth.pending,
          loginUser.pending,
          registerUser.pending,
          updateUser.pending
        ),
        (state, action) => {
          state.pending = true;
          state.error = null;
          state.requestId = action.meta.requestId;
        }
      )
      .addMatcher(
        isAnyOf(
          checkAuth.fulfilled,
          loginUser.fulfilled,
          registerUser.fulfilled,
          updateUser.fulfilled
        ),
        (state, action) => {
          if (state.requestId !== action.meta.requestId) return;
          state.user = action.payload;
          state.checked = true;
          state.pending = false;
          state.requestId = null;
        }
      )
      .addMatcher(
        isAnyOf(
          checkAuth.rejected,
          loginUser.rejected,
          registerUser.rejected,
          updateUser.rejected
        ),
        (state, action) => {
          if (state.requestId !== action.meta.requestId) return;
          state.pending = false;
          state.requestId = null;
          state.error = action.error.message ?? 'Ошибка авторизации';
        }
      );
  },
});

export const { clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;