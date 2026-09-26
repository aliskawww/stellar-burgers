import { resetPasswordApi } from '@api';
import { ResetPasswordUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const ResetPassword = (): React.JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<Error | null>(null);

  const fromForgot = (location.state as { fromForgot?: boolean } | null)?.fromForgot;

  useEffect(() => {
    if (!fromForgot) {
      void navigate('/forgot-password', { replace: true });
    }
  }, [fromForgot, navigate]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    setError(null);
    void resetPasswordApi({ password, token })
      .then(() => {
        void navigate('/login', { replace: true });
      })
      .catch((err: Error) => setError(err));
  };

  return (
    <ResetPasswordUI
      errorText={error?.message}
      password={password}
      token={token}
      setPassword={setPassword}
      setToken={setToken}
      handleSubmit={handleSubmit}
    />
  );
};