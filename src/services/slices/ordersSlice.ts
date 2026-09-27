import { getOrderByNumberApi, getOrdersApi, orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { clearConstructor } from './constructorSlice';
import { logoutUser } from './authSlice';
import type { AuthState } from './authSlice';
import type { TConstructorState, TOrder } from '@utils-types';

type RequestState = { pending: boolean; error: string | null; requestId: string | null };

export type OrdersState = {
  history: RequestState & { items: TOrder[]; loaded: boolean };
  detail: RequestState & { item: TOrder | null; number: number | null; loaded: boolean };
  creation: RequestState & { item: TOrder | null; visible: boolean };
};

const requestState: RequestState = { pending: false, error: null, requestId: null };

const initialState: OrdersState = {
  history: { ...requestState, items: [], loaded: false },
  detail: { ...requestState, item: null, number: null, loaded: false },
  creation: { ...requestState, item: null, visible: false },
};

type State = { orders: OrdersState; auth: AuthState; burgerConstructor: TConstructorState };

export const fetchUserOrders = createAsyncThunk<TOrder[], void, { state: State }>(
  'orders/history',
  () => getOrdersApi(),
  {
    condition: (_, { getState }) =>
      !!getState().auth.user && !getState().orders.history.pending,
  }
);

export const fetchOrder = createAsyncThunk<TOrder | null, number, { state: State }>(
  'orders/detail',
  async (number) => {
    if (!Number.isSafeInteger(number) || number <= 0) {
      throw new Error('Некорректный номер заказа');
    }
    const response = await getOrderByNumberApi(number);
    return response.orders.find((order) => order.number === number) ?? null;
  },
  {
    condition: (number, { getState }) =>
      !(getState().orders.detail.pending && getState().orders.detail.number === number),
  }
);

export const createOrder = createAsyncThunk<TOrder, void, { state: State }>(
  'orders/create',
  async (_, { getState, dispatch, requestId }) => {
    const { bun, ingredients } = getState().burgerConstructor;
    if (!bun) throw new Error('Выберите булку');
    const ids = [bun._id, ...ingredients.map((item) => item._id), bun._id];
    const response = await orderBurgerApi(ids);
    if (getState().orders.creation.requestId === requestId) {
      dispatch(clearConstructor());
    }
    return response.order;
  },
  {
    condition: (_, { getState }) =>
      !!getState().auth.user &&
      !!getState().burgerConstructor.bun &&
      !getState().orders.creation.pending,
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    closeOrder: (state) => {
      state.creation.visible = false;
      state.creation.item = null;
      state.creation.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.pending, () => initialState)
      .addCase(fetchUserOrders.pending, (state, action) => {
        state.history.pending = true;
        state.history.error = null;
        state.history.requestId = action.meta.requestId;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        if (state.history.requestId !== action.meta.requestId) return;
        state.history.items = action.payload;
        state.history.pending = false;
        state.history.loaded = true;
        state.history.requestId = null;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        if (state.history.requestId !== action.meta.requestId) return;
        state.history.pending = false;
        state.history.requestId = null;
        state.history.error = action.error.message ?? 'Ошибка истории заказов';
      })
      .addCase(fetchOrder.pending, (state, action) => {
        state.detail = {
          ...initialState.detail,
          pending: true,
          number: action.meta.arg,
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        if (state.detail.requestId !== action.meta.requestId) return;
        state.detail.item = action.payload;
        state.detail.pending = false;
        state.detail.loaded = true;
        state.detail.requestId = null;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        if (state.detail.requestId !== action.meta.requestId) return;
        state.detail.pending = false;
        state.detail.requestId = null;
        state.detail.error = action.error.message ?? 'Ошибка загрузки заказа';
      })
      .addCase(createOrder.pending, (state, action) => {
        state.creation = {
          ...initialState.creation,
          pending: true,
          visible: true,
          requestId: action.meta.requestId,
        };
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        if (state.creation.requestId !== action.meta.requestId) return;
        state.creation.pending = false;
        state.creation.requestId = null;
        state.creation.item = action.payload;
        state.creation.visible = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        if (state.creation.requestId !== action.meta.requestId) return;
        state.creation.pending = false;
        state.creation.requestId = null;
        state.creation.visible = false;
        state.creation.error = action.error.message ?? 'Не удалось оформить заказ';
      });
  },
});

export const { closeOrder } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;