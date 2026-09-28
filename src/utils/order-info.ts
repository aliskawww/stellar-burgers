import type { TIngredient, TOrder } from './types';

export const buildOrderInfo = (order: TOrder, ingredients: TIngredient[]) => {
  const byId = new Map(ingredients.map((item) => [item._id, item]));
  const ingredientsInfo: Record<string, TIngredient & { count: number }> = {};
  for (const id of order.ingredients) {
    const item = byId.get(id);
    if (!item) continue;
    if (ingredientsInfo[id]) ingredientsInfo[id].count += 1;
    else ingredientsInfo[id] = { ...item, count: 1 };
  }
  return {
    ...order,
    ingredientsInfo,
    total: Object.values(ingredientsInfo).reduce((sum, item) => sum + item.price * item.count, 0),
    date: new Date(order.createdAt),
  };
};
