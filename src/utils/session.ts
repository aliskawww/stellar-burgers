import { deleteCookie, setCookie } from './cookie';

let sessionVersion = 0;
export const getSessionVersion = (): number => sessionVersion;

export const saveTokens = (tokens: { accessToken: string; refreshToken: string }): void => {
  setCookie('accessToken', tokens.accessToken, {
    sameSite: 'Lax',
    ...(window.location.protocol === 'https:' ? { secure: true } : {}),
  });
  localStorage.setItem('refreshToken', tokens.refreshToken);
};

export const clearTokens = (): void => {
  sessionVersion += 1;
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};

export const expireSession = (): void => {
  clearTokens();
  window.dispatchEvent(new Event('auth:expired'));
};
