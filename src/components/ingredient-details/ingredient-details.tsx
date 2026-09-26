import { selectIngredients } from '@selectors';
import { IngredientDetailsUI } from '@ui';
import { useParams } from 'react-router-dom';

import { useSelector } from '../../services/store';
import { IngredientsBoundary } from '../ingredients-boundary/ingredients-boundary';

export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const ingredients = useSelector(selectIngredients);
  const ingredientData = ingredients.find((item) => item._id === id);

  return (
    <IngredientsBoundary>
      {ingredientData ? (
        <IngredientDetailsUI ingredientData={ingredientData} />
      ) : (
        <p role="status" className="text text_type_main-default p-10">
          Ингредиент не найден.
        </p>
      )}
    </IngredientsBoundary>
  );
};
