import { fetchFeed } from '@slices/feedSlice';
import { fetchUserOrders } from '@slices/ordersSlice';
import { useEffect } from 'react';

import { useDispatch } from '../services/store';

export const useOrderPolling = (personal = false): void => {
  const dispatch = useDispatch();
  useEffect(() => {
    const refresh = (): void => {
      if (document.visibilityState === 'hidden' || !navigator.onLine) return;
      if (personal) void dispatch(fetchUserOrders());
      else void dispatch(fetchFeed());
    };
    refresh();
    const timer = window.setInterval(refresh, 15000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('online', refresh);
    return (): void => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('online', refresh);
    };
  }, [dispatch, personal]);
};
