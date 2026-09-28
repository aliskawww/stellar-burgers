import { useParams } from 'react-router-dom';
import clsx from 'clsx';
import { OrderInfo } from '@components';
import styles from './order-page.module.css';

export const OrderPage = (): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();

  return (
    <main className={styles.detailPageWrap}>
      <h1 className={clsx(styles.detailHeader, 'text text_type_digits-default')}>
        #{number}
      </h1>
      <OrderInfo />
    </main>
  );
};