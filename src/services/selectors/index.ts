import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '../store';
import type { TConstructorState, TIngredient } from '@utils-types';

export const selectIngredients = (state: RootState): TIngredient[] =>
  state.ingredients.items;
export const selectIngredientsStatus = (
  state: RootState
): RootState['ingredients']['status'] => state.ingredients.status;
export const selectIngredientsError = (state: RootState): string | null =>
  state.ingredients.error;
export const selectConstructorItems = (state: RootState): TConstructorState =>
  state.burgerConstructor;

export const selectConstructorPrice = createSelector(
  [selectConstructorItems],
  ({ bun, ingredients }): number =>
    (bun ? bun.price * 2 : 0) + ingredients.reduce((sum, item) => sum + item.price, 0)
);

export const selectIngredientCounters = createSelector(
  [selectConstructorItems],
  ({ bun, ingredients }): Record<string, number> => {
    const counters: Record<string, number> = {};
    ingredients.forEach((item) => {
      counters[item._id] = (counters[item._id] ?? 0) + 1;
    });
    if (bun) counters[bun._id] = 2;
    return counters;
  }
);
