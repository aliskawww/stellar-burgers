import {
  AppHeader,
  IngredientDetails,
  Modal,
  OrderModal,
  ProtectedRoute,
} from '@components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  IngredientPage,
  Login,
  NotFound404,
  OrderPage,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { checkAuth } from '@slices/authSlice';
import { fetchIngredients } from '@slices/ingredientsSlice';
import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { useDispatch } from '@services/store';

import type { Location } from 'react-router-dom';

import styles from './app.module.css';

type ModalLocationState = {
  background?: Location;
};

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();

  useEffect(() => {
    void dispatch(checkAuth());
    void dispatch(fetchIngredients());
  }, [dispatch]);

  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ModalLocationState | null;
  const isDetailRoute =
    /^\/(ingredients\/[^/]+|feed\/[^/]+|profile\/orders\/[^/]+)\/?$/.test(
      location.pathname
    );
  const background = isDetailRoute ? state?.background : undefined;

  const handleCloseModal = (): void => {
    void navigate(-1);
  };

  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={background ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/ingredients/:id" element={<IngredientPage />} />
        <Route path="/feed/:number" element={<OrderPage />} />
        <Route element={<ProtectedRoute onlyUnAuth />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/orders" element={<ProfileOrders />} />
          <Route path="/profile/orders/:number" element={<OrderPage />} />
        </Route>
        <Route path="*" element={<NotFound404 />} />
      </Routes>
      {background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Детали ингредиента" onClose={handleCloseModal}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path="/feed/:number"
            element={<OrderModal onClose={handleCloseModal} />}
          />
          <Route
            path="/profile/orders/:number"
            element={<OrderModal onClose={handleCloseModal} />}
          />
        </Routes>
      )}
    </div>
  );
};

export default App;
