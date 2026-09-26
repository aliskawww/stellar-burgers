import { ProfileMenu, OrdersList } from '@components';
import { Preloader } from '@ui';
import { RequestError } from '../../../request-error/request-error';
import { IngredientsBoundary } from '../../../ingredients-boundary/ingredients-boundary';

import type { ProfileOrdersUIProps } from './type';

import styles from './profile-orders.module.css';

export const ProfileOrdersUI = ({ orders, isLoading = false, error, onRetry }: ProfileOrdersUIProps): React.JSX.Element => (
  <main className={`${styles.main}`}>
    <div className={`mt-30 mr-15 ${styles.menu}`}>
      <ProfileMenu />
    </div>
    <div className={`mt-10 ${styles.orders}`}>
      {error && <RequestError message={error} onRetry={onRetry} />}
      {isLoading ? <Preloader /> : <IngredientsBoundary><OrdersList orders={orders} /></IngredientsBoundary>}
    </div>
  </main>
);
