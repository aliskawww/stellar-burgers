import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { fetchOrder } from '@slices/ordersSlice';
import { selectIngredients } from '@selectors';
import { useDispatch, useSelector } from '../../services/store';
import { buildOrderInfo } from '../../utils/order-info';
import { IngredientsBoundary } from '../ingredients-boundary/ingredients-boundary';
import { RequestError } from '../request-error/request-error';

export const OrderInfo = (): React.JSX.Element => {
  const { number: param } = useParams<{ number: string }>();
  const number = Number(param);
  const valid = /^\d+$/.test(param ?? '') && Number.isSafeInteger(number) && number > 0;
  const dispatch = useDispatch();
  const detail = useSelector((state) => state.orders.detail);
  const ingredients = useSelector(selectIngredients);

  useEffect(() => {
    if (valid) void dispatch(fetchOrder(number));
  }, [dispatch, number, valid]);

  const orderInfo = useMemo(
    () => (detail.item ? buildOrderInfo(detail.item, ingredients) : null),
    [detail.item, ingredients]
  );

  if (!valid) return <RequestError message="Некорректный номер заказа" />;
  if (detail.number !== number || detail.pending) return <Preloader />;
  if (detail.error) {
    return (
      <RequestError
        message={detail.error}
        onRetry={() => { void dispatch(fetchOrder(number)); }}
      />
    );
  }
  if (!detail.loaded) return <Preloader />;
  if (!orderInfo) {
    return (
      <p role="status" className="p-6 text text_type_main-default">
        Заказ не найден.
      </p>
    );
  }

  return (
    <IngredientsBoundary>
      <OrderInfoUI orderInfo={orderInfo} />
    </IngredientsBoundary>
  );
};