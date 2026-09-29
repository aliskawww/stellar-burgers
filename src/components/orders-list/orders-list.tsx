import { OrdersListUI } from '@ui';
import { memo } from 'react';

import type { OrdersListProps } from './type';

export const OrdersList = memo(function OrdersList({
  orders,
}: OrdersListProps): React.JSX.Element {
  const orderByDate = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (!orderByDate.length)
    return (
      <p role="status" className="text text_type_main-default p-6">
        Заказов пока нет.
      </p>
    );
  return <OrdersListUI orderByDate={orderByDate} />;
});
