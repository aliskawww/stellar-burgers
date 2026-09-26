import { configureStore } from '@reduxjs/toolkit';

import { bun, filling, sauce } from '../__tests__/fixtures';
import { rootReducer } from '../rootReducer';
import { selectConstructorPrice, selectIngredientCounters } from '../selectors';
import {
  addIngredient,
  clearConstructor,
  constructorReducer,
  moveIngredient,
  removeIngredient,
} from './constructorSlice';

import type { TConstructorState } from '@utils-types';

const empty: TConstructorState = { bun: null, ingredients: [] };

const makeFilledState = (): TConstructorState =>
  [filling, sauce, filling].reduce(
    (state, ingredient) => constructorReducer(state, addIngredient(ingredient)),
    empty
  );

describe('constructorSlice', () => {
  test('возвращает начальное состояние для неизвестного экшена', () => {
    expect(constructorReducer(undefined, { type: 'unknown' })).toEqual(empty);
  });

  test('булка заменяет предыдущую и не попадает в начинку', () => {
    const first = constructorReducer(undefined, addIngredient(bun));
    const nextBun = { ...bun, _id: 'bun-2' };
    const next = constructorReducer(first, addIngredient(nextBun));
    expect(next.bun?._id).toBe('bun-2');
    expect(next.ingredients).toEqual([]);
    expect(first.bun?._id).toBe('bun-1');
  });

  test('дубликаты имеют разные ID; исходный ингредиент не изменяется', () => {
    const first = addIngredient(filling);
    const second = addIngredient(filling);
    expect(first.payload.id).not.toBe(second.payload.id);
    expect(filling).not.toHaveProperty('id');
    const state = constructorReducer(constructorReducer(undefined, first), second);
    expect(state.ingredients).toHaveLength(2);
    expect(constructorReducer(undefined, first)).toEqual(
      constructorReducer(undefined, first)
    );
  });

  test('удаляет только выбранный экземпляр и не изменяет прежнее состояние', () => {
    const previous = makeFilledState();
    const next = constructorReducer(previous, removeIngredient(previous.ingredients[0].id));
    expect(next.ingredients).toEqual(previous.ingredients.slice(1));
    expect(previous.ingredients).toHaveLength(3);
    expect(constructorReducer(next, removeIngredient('missing'))).toEqual(next);
  });

  test.each(['up', 'down'] as const)('перемещает экземпляр %s', (direction) => {
    const previous = makeFilledState();
    const moving = previous.ingredients[1];
    const next = constructorReducer(previous, moveIngredient({ id: moving.id, direction }));
    expect(next.ingredients[direction === 'up' ? 0 : 2]).toEqual(moving);
    expect(previous.ingredients[1]).toEqual(moving);
    expect(next.ingredients).toHaveLength(3);
  });

  test('игнорирует выход за границы и неизвестные ID', () => {
    const state = makeFilledState();
    expect(constructorReducer(state, moveIngredient({ id: state.ingredients[0].id, direction: 'up' }))).toEqual(state);
    expect(constructorReducer(state, moveIngredient({ id: state.ingredients[2].id, direction: 'down' }))).toEqual(state);
    expect(constructorReducer(state, moveIngredient({ id: 'missing', direction: 'down' }))).toEqual(state);
    expect(constructorReducer(empty, moveIngredient({ id: 'missing', direction: 'up' }))).toEqual(empty);
  });

  test('очищает булку и начинку', () => {
    const state = constructorReducer(makeFilledState(), addIngredient(bun));
    expect(constructorReducer(state, clearConstructor())).toEqual(empty);
  });

  test('считает две половинки булки, дубликаты и соусы', () => {
    const store = configureStore({ reducer: rootReducer });
    expect(selectConstructorPrice(store.getState())).toBe(0);
    expect(selectIngredientCounters(store.getState())).toEqual({});
    [bun, filling, filling, sauce].forEach((item) => store.dispatch(addIngredient(item)));
    expect(selectConstructorPrice(store.getState())).toBe(320);
    expect(selectIngredientCounters(store.getState())).toEqual({ 'bun-1': 2, 'filling-1': 2, 'sauce-1': 1 });
    const counters = selectIngredientCounters(store.getState());
    expect(selectIngredientCounters(store.getState())).toBe(counters);
    store.dispatch(addIngredient({ ...bun, _id: 'bun-2', price: 150 }));
    expect(selectConstructorPrice(store.getState())).toBe(420);
    expect(selectIngredientCounters(store.getState())).not.toHaveProperty('bun-1');
    store.dispatch(clearConstructor());
    expect(selectConstructorPrice(store.getState())).toBe(0);
  });
});
