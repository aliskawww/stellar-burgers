import { clearAuthError, loginUser } from '@slices/authSlice';
import { LoginUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { Location } from 'react-router-dom';

type FromState = { from?: Location };

export const Login = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, pending, user } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    const state = location.state as FromState | null;
    const from = state?.from;
    const safe =
      from?.pathname.startsWith('/') &&
      !from.pathname.startsWith('//') &&
      !['/login', '/register', '/forgot-password', '/reset-password'].includes(
        from.pathname
      );
    void navigate(safe && from ? from.pathname : '/', { replace: true });
  }, [user, location.state, navigate]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    if (!pending) void dispatch(loginUser({ email: email.trim(), password }));
  };

  return (
    <LoginUI
      errorText={error ?? undefined}
      isLoading={pending}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
