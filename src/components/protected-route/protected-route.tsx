import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Preloader } from '@ui';

import { useSelector } from '../../services/store';

type ProtectedRouteProps = {
  onlyUnAuth?: boolean;
};

export const ProtectedRoute = ({
  onlyUnAuth = false,
}: ProtectedRouteProps): React.JSX.Element => {
  const { user, checked } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!checked) {
    return <Preloader />;
  }

  if (!onlyUnAuth && !user) {
    return <Navigate replace to="/login" state={{ from: location }} />;
  }

  if (onlyUnAuth && user) {
    const from = (location.state as { from?: Location } | null)?.from ?? {
      pathname: '/',
    };
    return <Navigate replace to={from} />;
  }

  return <Outlet />;
};