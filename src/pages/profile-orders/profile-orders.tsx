import { fetchUserOrders } from '@slices/ordersSlice';
import { ProfileOrdersUI } from '@ui-pages';

import { useOrderPolling } from '../../hooks/use-order-polling';
import { useDispatch, useSelector } from '../../services/store';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const history = useSelector((state) => state.orders.history);
  useOrderPolling(true);
  return (
    <ProfileOrdersUI
      orders={history.items}
      isLoading={!history.loaded && !history.error}
      error={history.error}
      onRetry={() => {
        void dispatch(fetchUserOrders());
      }}
    />
  );
};
