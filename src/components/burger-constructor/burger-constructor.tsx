import { selectConstructorItems, selectConstructorPrice } from '@selectors';
import { BurgerConstructorUI } from '@ui';

import { useDispatch, useSelector } from '../../services/store';
import { closeOrder, createOrder } from '@slices/ordersSlice';
import { useLocation, useNavigate } from 'react-router-dom';

export const BurgerConstructor = (): React.JSX.Element | null => {
  const constructorItems = useSelector(selectConstructorItems);
  const price = useSelector(selectConstructorPrice);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, checked } = useSelector((state) => state.auth);
  const creation = useSelector((state) => state.orders.creation);
  const orderRequest = creation.pending;
  const orderModalData = creation.visible ? creation.item : null;

  const onOrderClick = (): void => {
    if (!constructorItems.bun || orderRequest || !checked) return;
    if (!user) { void navigate('/login', { state: { from: location } }); return; }
    void dispatch(createOrder());
  };

  const closeOrderModal = (): void => {
    dispatch(closeOrder());
  };

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      showOrderProgress={creation.visible}
      orderError={creation.error}
      authChecked={checked}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
