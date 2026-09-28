import { Button } from '@krgaa/react-developer-burger-ui-components';
import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsStatus,
} from '@selectors';
import { fetchIngredients } from '@slices/ingredientsSlice';
import { Preloader } from '@ui';

import { useDispatch, useSelector } from '../../services/store';

import type { ReactNode } from 'react';

export const IngredientsBoundary = ({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element => {
  const dispatch = useDispatch();
  const status = useSelector(selectIngredientsStatus);
  const error = useSelector(selectIngredientsError);
  const ingredients = useSelector(selectIngredients);

  if (status === 'idle' || status === 'loading') return <Preloader />;

  if (status === 'failed') {
    return (
      <section className="p-10" aria-label="Ошибка загрузки ингредиентов">
        <p role="alert" className="text text_type_main-default mb-6">
          {error}
        </p>
        <Button
          htmlType="button"
          type="primary"
          size="medium"
          onClick={() => { void dispatch(fetchIngredients()); }}
        >
          Повторить загрузку
        </Button>
      </section>
    );
  }

  if (!ingredients.length) {
    return (
      <p role="status" className="text text_type_main-default p-10">
        Сейчас в каталоге нет ингредиентов.
      </p>
    );
  }

  return <>{children}</>;
};
