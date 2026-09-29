import { createSlice, nanoid } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@utils-types';

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      // ID создаётся в action creator, а не внутри редьюсера.
      prepare: (ingredient: TIngredient): { payload: TConstructorIngredient } => ({
        payload: { ...ingredient, id: nanoid() },
      }),
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      },
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter((item) => item.id !== action.payload);
    },
    moveIngredient: (
      state,
      action: PayloadAction<{ id: string; direction: 'up' | 'down' }>
    ) => {
      const index = state.ingredients.findIndex((item) => item.id === action.payload.id);
      if (index === -1) return;
      const target = index + (action.payload.direction === 'up' ? -1 : 1);
      if (target < 0 || target >= state.ingredients.length) return;
      [state.ingredients[index], state.ingredients[target]] = [
        state.ingredients[target],
        state.ingredients[index],
      ];
    },
    clearConstructor: () => initialState,
  },
});

export const { addIngredient, removeIngredient, moveIngredient, clearConstructor } =
  constructorSlice.actions;
export const constructorReducer = constructorSlice.reducer;
