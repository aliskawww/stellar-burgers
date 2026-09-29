import { getIngredientsApi } from '@api';
import { configureStore } from '@reduxjs/toolkit';

import { bun, filling } from '../__tests__/fixtures';
import { rootReducer } from '../rootReducer';
import { fetchIngredients, ingredientsReducer } from './ingredientsSlice';

import type { TIngredient } from '@utils-types';

jest.mock('@api', () => ({ getIngredientsApi: jest.fn() }));
const getIngredientsMock = jest.mocked(getIngredientsApi);

const makeStore = (): ReturnType<
  typeof configureStore<{ ingredients: ReturnType<typeof ingredientsReducer> }>
> => configureStore({ reducer: { ingredients: ingredientsReducer } });

describe('ingredientsSlice', () => {
  beforeEach(() => jest.resetAllMocks());

  test('корневой редьюсер инициализирует оба слайса', () => {
    expect(rootReducer(undefined, { type: 'UNKNOWN' })).toMatchObject({
      ingredients: { items: [], status: 'idle', error: null },
      burgerConstructor: { bun: null, ingredients: [] },
    });
  });

  describe('редьюсер вызывается напрямую', () => {
    test('UNKNOWN и undefined возвращают начальное состояние', () => {
      expect(ingredientsReducer(undefined, { type: 'UNKNOWN' })).toEqual({
        items: [],
        status: 'idle',
        error: null,
      });
    });

    test('неизвестный экшен сохраняет существующее состояние', () => {
      const state = { items: [bun], status: 'succeeded' as const, error: null };
      expect(ingredientsReducer(state, { type: 'UNKNOWN' })).toBe(state);
    });

    test('pending включает загрузку и сбрасывает старую ошибку, сохраняя каталог', () => {
      const state = { items: [bun], status: 'failed' as const, error: 'Ошибка' };
      expect(
        ingredientsReducer(state, fetchIngredients.pending('request-1', undefined))
      ).toEqual({
        items: [bun],
        status: 'loading',
        error: null,
      });
      expect(state).toEqual({ items: [bun], status: 'failed', error: 'Ошибка' });
    });

    test('fulfilled заменяет каталог, выключает загрузку и очищает ошибку', () => {
      const state = { items: [bun], status: 'loading' as const, error: 'Ошибка' };
      expect(
        ingredientsReducer(
          state,
          fetchIngredients.fulfilled([filling], 'request-1', undefined)
        )
      ).toEqual({
        items: [filling],
        status: 'succeeded',
        error: null,
      });
      expect(state).toEqual({ items: [bun], status: 'loading', error: 'Ошибка' });
    });

    test('fulfilled с пустым ответом очищает предыдущий каталог', () => {
      expect(
        ingredientsReducer(
          { items: [bun], status: 'loading', error: null },
          fetchIngredients.fulfilled([], 'request-1', undefined)
        )
      ).toEqual({ items: [], status: 'succeeded', error: null });
    });

    test('rejected выключает загрузку и сохраняет ошибку, не удаляя каталог', () => {
      const state = { items: [bun], status: 'loading' as const, error: null };
      expect(
        ingredientsReducer(
          state,
          fetchIngredients.rejected(new Error('Сеть недоступна'), 'request-1', undefined)
        )
      ).toEqual({
        items: [bun],
        status: 'failed',
        error: 'Сеть недоступна',
      });
      expect(state).toEqual({ items: [bun], status: 'loading', error: null });
    });

    test('rejected без сообщения использует понятную ошибку по умолчанию', () => {
      expect(
        ingredientsReducer(undefined, {
          ...fetchIngredients.rejected(null, 'request-1', undefined),
          error: {},
        })
      ).toEqual({
        items: [],
        status: 'failed',
        error: 'Не удалось загрузить ингредиенты',
      });
    });
  });

  test('pending и fulfilled сохраняют данные API', async () => {
    getIngredientsMock.mockResolvedValue([bun, filling]);
    const store = makeStore();
    const request = store.dispatch(fetchIngredients());
    expect(store.getState().ingredients).toEqual({
      items: [],
      status: 'loading',
      error: null,
    });
    await request;
    expect(store.getState().ingredients).toEqual({
      items: [bun, filling],
      status: 'succeeded',
      error: null,
    });
  });

  test('ошибка сохраняется, повторная загрузка очищает ошибку', async () => {
    getIngredientsMock.mockRejectedValueOnce(new Error('Сеть недоступна'));
    const store = makeStore();
    await store.dispatch(fetchIngredients());
    expect(store.getState().ingredients).toEqual({
      items: [],
      status: 'failed',
      error: 'Сеть недоступна',
    });
    getIngredientsMock.mockResolvedValueOnce([bun]);
    const request = store.dispatch(fetchIngredients());
    expect(store.getState().ingredients.error).toBeNull();
    expect(store.getState().ingredients.status).toBe('loading');
    await request;
    expect(store.getState().ingredients.items).toEqual([bun]);
    expect(getIngredientsMock).toHaveBeenCalledTimes(2);
  });

  test('пустой каталог — успешная загрузка, не вечный прелоадер', async () => {
    getIngredientsMock.mockResolvedValue([]);
    const store = makeStore();
    await store.dispatch(fetchIngredients());
    expect(store.getState().ingredients).toEqual({
      items: [],
      status: 'succeeded',
      error: null,
    });
  });

  test('не дублирует текущий запрос и не загружает готовый каталог повторно', async () => {
    let resolveRequest: (items: TIngredient[]) => void = () => {
      throw new Error('Запрос ещё не создан');
    };
    getIngredientsMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );
    const store = makeStore();
    const first = store.dispatch(fetchIngredients());
    await store.dispatch(fetchIngredients());
    expect(store.getState().ingredients.status).toBe('loading');
    expect(getIngredientsMock).toHaveBeenCalledTimes(1);
    resolveRequest([bun]);
    await first;
    await store.dispatch(fetchIngredients());
    expect(getIngredientsMock).toHaveBeenCalledTimes(1);
    expect(store.getState().ingredients.status).toBe('succeeded');
  });
});
