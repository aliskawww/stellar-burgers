import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Preloader } from '@ui';
import { checkAuth } from '@slices/authSlice';
import { useDispatch, useSelector } from '../../services/store';
import { RequestError } from '../request-error/request-error';
import type { Location } from 'react-router-dom';

type ProtectedRouteProps = { onlyUnAuth?: boolean };
export const ProtectedRoute = ({ onlyUnAuth = false }: ProtectedRouteProps): React.JSX.Element => {
  const { user, checked, error } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  if (!checked) return error
    ? <RequestError message={error} onRetry={() => { void dispatch(checkAuth()); }} />
    : <Preloader />;
  if (!onlyUnAuth && !user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (onlyUnAuth && user) {
    const state = location.state as { from?: Location } | null;
    const from = state?.from;
    const safe = from?.pathname.startsWith('/') && !from.pathname.startsWith('//') &&
      !['/login', '/register', '/forgot-password', '/reset-password'].includes(from.pathname);
    return <Navigate to={safe && from ? { pathname: from.pathname, search: from.search, hash: from.hash } : '/'} replace />;
  }
  return <Outlet />;
};
