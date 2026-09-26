import { getCookie } from './cookie';
import { expireSession, getSessionVersion, saveTokens } from './session';

import type { TIngredient, TOrder, TUser } from './types';

const API_URL = process.env.BURGER_API_URL?.trim().replace(/\/+$/, '');

type ServerResponse<T = unknown> = { success: boolean } & T;
export type TRegisterData = { email: string; name: string; password: string };
export type TLoginData = Pick<TRegisterData, 'email' | 'password'>;
type Tokens = { accessToken: string; refreshToken: string };
type AuthResponse = ServerResponse<Tokens & { user: TUser }>;
type FeedResponse = ServerResponse<{ orders: TOrder[]; total: number; totalToday: number }>;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const checkResponse = async <T>(response: Response): Promise<T> => {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(`Сервер вернул некорректный ответ (${response.status})`, response.status);
  }
  if (!response.ok || (typeof data === 'object' && data !== null && 'success' in data && data.success === false)) {
    const message = typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string'
      ? data.message : 'Не удалось выполнить запрос к серверу';
    throw new ApiError(message, response.status);
  }
  return data as T;
};

const endpoint = (path: string): string => {
  if (!API_URL) throw new ApiError('Не задан BURGER_API_URL. Укажите адрес API в .env и перезапустите приложение.');
  return `${API_URL}${path}`;
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> =>
  checkResponse<T>(await fetch(endpoint(path), options));

const jsonOptions = (data: unknown, method = 'POST'): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

export const isAuthError = (error: unknown): boolean => error instanceof ApiError &&
  (error.status === 401 || /jwt expired|jwt malformed|invalid token|token is invalid|invalid signature|you should be authorised/i.test(error.message));

let refreshing: Promise<ServerResponse<Tokens>> | null = null;
export const refreshToken = (): Promise<ServerResponse<Tokens>> => {
  if (refreshing) return refreshing;
  const version = getSessionVersion();
  refreshing = (async (): Promise<ServerResponse<Tokens>> => {
    const token = localStorage.getItem('refreshToken');
    if (!token) throw new ApiError('Сессия истекла. Войдите снова.', 401);
    const data = await request<ServerResponse<Tokens>>('/auth/token', jsonOptions({ token }));
    if (version !== getSessionVersion()) throw new ApiError('Сессия завершена', 401);
    saveTokens(data);
    return data;
  })().catch((error: unknown) => {
    if (version === getSessionVersion() && isAuthError(error)) expireSession();
    throw error;
  }).finally(() => { refreshing = null; });
  return refreshing;
};

export const fetchWithRefresh = async <T>(url: RequestInfo, options: RequestInit = {}): Promise<T> => {
  const version = getSessionVersion();
  const headers = new Headers(options.headers);
  let token = getCookie('accessToken');
  if (!token) token = (await refreshToken()).accessToken;
  headers.set('authorization', token);
  try {
    return await checkResponse<T>(await fetch(url, { ...options, headers }));
  } catch (error) {
    if (!isAuthError(error) || version !== getSessionVersion()) throw error;
    // Another request may already have refreshed the token.
    const current = getCookie('accessToken');
    const next = current && current !== token ? current : (await refreshToken()).accessToken;
    headers.set('authorization', next);
    try {
      return await checkResponse<T>(await fetch(url, { ...options, headers }));
    } catch (retryError) {
      if (isAuthError(retryError) && version === getSessionVersion()) expireSession();
      throw retryError;
    }
  }
};

const authorized = async <T>(path: string, options: RequestInit = {}): Promise<T> =>
  fetchWithRefresh<T>(endpoint(path), options);

export const getIngredientsApi = async (): Promise<TIngredient[]> =>
  (await request<ServerResponse<{ data: TIngredient[] }>>('/ingredients')).data;
export const getFeedsApi = (): Promise<FeedResponse> => request('/orders/all');
export const getOrdersApi = async (): Promise<TOrder[]> => (await authorized<FeedResponse>('/orders')).orders;
export const orderBurgerApi = (ingredients: string[]): Promise<ServerResponse<{ order: TOrder; name: string }>> =>
  authorized('/orders', jsonOptions({ ingredients }));
export const getOrderByNumberApi = (number: number): Promise<ServerResponse<{ orders: TOrder[] }>> =>
  request(`/orders/${number}`);
export const registerUserApi = (data: TRegisterData): Promise<AuthResponse> => request('/auth/register', jsonOptions(data));
export const loginUserApi = (data: TLoginData): Promise<AuthResponse> => request('/auth/login', jsonOptions(data));
export const forgotPasswordApi = (data: { email: string }): Promise<ServerResponse> => request('/password-reset', jsonOptions(data));
export const resetPasswordApi = (data: { password: string; token: string }): Promise<ServerResponse> =>
  request('/password-reset/reset', jsonOptions(data));
export const getUserApi = (): Promise<ServerResponse<{ user: TUser }>> => authorized('/auth/user');
export const updateUserApi = (data: Partial<TRegisterData>): Promise<ServerResponse<{ user: TUser }>> =>
  authorized('/auth/user', jsonOptions(data, 'PATCH'));
export const logoutApi = (): Promise<ServerResponse> =>
  request('/auth/logout', jsonOptions({ token: localStorage.getItem('refreshToken') }));
