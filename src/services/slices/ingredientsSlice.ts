import { getIngredientsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TIngredient } from '@utils-types';

export type IngredientsState = {
  items: TIngredient[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: IngredientsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchIngredients = createAsyncThunk<
  TIngredient[],
  void,
  { state: { ingredients: IngredientsState } }
>('ingredients/fetchIngredients', () => getIngredientsApi(), {
  // В том числе предотвращает повторный запрос из эффекта в StrictMode.
  condition: (_, { getState }) => {
    const { status } = getState().ingredients;
    return status !== 'loading' && status !== 'succeeded';
  },
});

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Не удалось загрузить ингредиенты';
      });
  },
});

export const ingredientsReducer = ingredientsSlice.reducer;
