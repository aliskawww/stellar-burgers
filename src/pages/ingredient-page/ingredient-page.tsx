import clsx from 'clsx';
import { IngredientDetails } from '@components';
import styles from './ingredient-page.module.css';

export const IngredientPage = (): React.JSX.Element => (
  <main className={styles.detailPageWrap}>
    <h1 className={clsx(styles.detailHeader, "text text_type_main-large")}>
      Детали ингредиента
    </h1>
    <IngredientDetails />
  </main>
);