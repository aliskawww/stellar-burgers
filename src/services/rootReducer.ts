import { combineReducers } from '@reduxjs/toolkit';

import { constructorReducer } from './slices/constructorSlice';
import { ingredientsReducer } from './slices/ingredientsSlice';
import { authReducer } from './slices/authSlice';
import { feedReducer } from './slices/feedSlice';
import { ordersReducer } from './slices/ordersSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  feed: feedReducer,
  orders: ordersReducer,
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
});
