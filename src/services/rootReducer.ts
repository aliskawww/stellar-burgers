import { combineReducers } from '@reduxjs/toolkit';

import { authReducer } from './slices/authSlice';
import { constructorReducer } from './slices/constructorSlice';
import { feedReducer } from './slices/feedSlice';
import { ingredientsReducer } from './slices/ingredientsSlice';
import { ordersReducer } from './slices/ordersSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  feed: feedReducer,
  orders: ordersReducer,
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
});
