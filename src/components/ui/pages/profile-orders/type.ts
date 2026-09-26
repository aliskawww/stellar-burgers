import type { TOrder } from '@utils-types';

export type ProfileOrdersUIProps = {
  orders: TOrder[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};
