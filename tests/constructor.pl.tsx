import { resolve } from 'node:path';

import { expect, test } from '@playwright/test';

import {
  ACCESS_TOKEN,
  API_URL,
  APP_URL,
  ORDER_NUMBER,
  REFRESH_TOKEN,
  USER_NAME,
  bun,
  filling,
  sauce,
} from './fixtures';

import type { Locator, Page } from '@playwright/test';

const ingredientCard = (page: Page, id: string): Locator =>
  page.getByTestId(`ingredient-${id}`);

const addIngredient = async (page: Page, id: string): Promise<void> => {
  await ingredientCard(page, id)
    .getByRole('button', { name: 'Добавить', exact: true })
    .click();
};

const expectEmptyConstructor = async (page: Page): Promise<void> => {
  const constructor = page.getByTestId('constructor');
  await expect(constructor.getByTestId('constructor-bun-1')).toHaveCount(0);
  await expect(constructor.getByTestId('constructor-bun-2')).toHaveCount(0);
  await expect(constructor.getByText('Выберите булки', { exact: true })).toHaveCount(2);
  const items = constructor.getByTestId('constructor-ingredients');
  await expect(items.getByRole('listitem')).toHaveCount(1);
  await expect(items).toHaveText('Выберите начинку');
  await expect(constructor.getByTestId('order-summ').locator('p')).toHaveText('0');
  await expect(
    constructor.getByRole('button', { name: 'Оформить заказ' })
  ).toBeDisabled();
};

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    // Все API-запросы воспроизводятся из HAR. Неизвестный запрос не идёт в сеть.
    await page.routeFromHAR(resolve('tests/hars/constructor.har'), {
      url: '**/api/**',
      notFound: 'abort',
      update: false,
    });
  });

  test.describe('Добавление ингредиентов', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await expect(page.getByTestId('ingredients-content')).toBeVisible();
      await expectEmptyConstructor(page);
    });

    test('добавляет булку сразу в верхнюю и нижнюю части', async ({ page }) => {
      await addIngredient(page, bun._id);
      const constructor = page.getByTestId('constructor');
      await expect(constructor.getByTestId('constructor-bun-1')).toContainText(
        `${bun.name} (верх)`
      );
      await expect(constructor.getByTestId('constructor-bun-2')).toContainText(
        `${bun.name} (низ)`
      );
      await expect(constructor.getByTestId('order-summ').locator('p')).toHaveText(
        String(bun.price * 2)
      );
      await expect(constructor.getByTestId('constructor-ingredients')).toHaveText(
        'Выберите начинку'
      );
    });

    test('добавляет начинку и соус в выбранном порядке', async ({ page }) => {
      await addIngredient(page, filling._id);
      await addIngredient(page, sauce._id);
      const items = page.getByTestId('constructor-ingredients').getByRole('listitem');
      await expect(items).toHaveCount(2);
      await expect(items.nth(0)).toContainText(filling.name);
      await expect(items.nth(1)).toContainText(sauce.name);
      await expect(page.getByTestId('order-summ').locator('p')).toHaveText(
        String(filling.price + sauce.price)
      );
    });

    test('добавляет два экземпляра одной начинки', async ({ page }) => {
      await addIngredient(page, filling._id);
      await addIngredient(page, filling._id);
      const items = page.getByTestId('constructor-ingredients').getByRole('listitem');
      await expect(items).toHaveCount(2);
      await expect(items.nth(0)).toContainText(filling.name);
      await expect(items.nth(1)).toContainText(filling.name);
      await expect(page.getByTestId('order-summ').locator('p')).toHaveText(
        String(filling.price * 2)
      );
    });
  });

  test.describe('Модальное окно ингредиента', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    for (const ingredient of [bun, filling]) {
      test(`показывает данные именно выбранного ингредиента: ${ingredient.name}`, async ({
        page,
      }) => {
        const cardImage = ingredientCard(page, ingredient._id).getByRole('img', {
          name: ingredient.name,
          exact: true,
        });
        const image = await cardImage.getAttribute('src');
        await ingredientCard(page, ingredient._id).getByRole('link').click();
        const modal = page.getByRole('dialog', { name: 'Детали ингредиента' });
        await expect(modal).toBeVisible();
        await expect(page).toHaveURL(`${APP_URL}/ingredients/${ingredient._id}`);
        await expect(
          modal.getByRole('heading', { name: ingredient.name, exact: true })
        ).toBeVisible();
        // В HAR все три размера изображения ингредиента имеют один data URL.
        expect(image).toBeTruthy();
        await expect(modal.getByAltText('изображение ингредиента.', { exact: true }))
          .toHaveAttribute('src', image!);
        const nutrition = [
          ['Калории, ккал', ingredient.calories],
          ['Белки, г', ingredient.proteins],
          ['Жиры, г', ingredient.fat],
          ['Углеводы, г', ingredient.carbohydrates],
        ] as const;
        for (const [label, value] of nutrition) {
          await expect(
            modal.getByRole('listitem').filter({ hasText: label }).locator('p').last()
          ).toHaveText(String(value));
        }
        const other = ingredient._id === bun._id ? filling : bun;
        await expect(
          modal.getByRole('heading', { name: other.name, exact: true })
        ).toHaveCount(0);
      });
    }

    for (const method of ['крестик', 'оверлей', 'Escape'] as const) {
      test(`закрывается: ${method}`, async ({ page }) => {
        await ingredientCard(page, bun._id).getByRole('link').click();
        const modal = page.getByRole('dialog', { name: 'Детали ингредиента' });
        await expect(modal).toBeVisible();
        if (method === 'крестик') {
          await modal.getByRole('button', { name: 'Закрыть', exact: true }).click();
        } else if (method === 'оверлей') {
          // Центр оверлея перекрыт модалкой; нажимаем снаружи, без force.
          await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });
        } else {
          await page.keyboard.press('Escape');
        }
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
        await expect(page).toHaveURL(`${APP_URL}/`);
        await expect(page.getByTestId('constructor')).toBeVisible();
      });
    }
  });

  test.describe('Оформление заказа', () => {
    test('отправляет состав бургера, показывает номер, очищает конструктор и закрывает модалку', async ({
      page,
      context,
    }) => {
      // Токены задаются до первого открытия приложения и запроса /auth/user.
      await context.addCookies([
        {
          name: 'accessToken',
          value: encodeURIComponent(ACCESS_TOKEN),
          url: APP_URL,
          sameSite: 'Lax',
        },
      ]);
      await page.addInitScript(
        ({ origin, token }) => {
          if (window.location.origin === origin)
            localStorage.setItem('refreshToken', token);
        },
        { origin: APP_URL, token: REFRESH_TOKEN }
      );

      const userResponse = page.waitForResponse(`${API_URL}/auth/user`);
      await page.goto('/');
      expect((await userResponse).status()).toBe(200);
      await expect(
        page.getByRole('link', { name: USER_NAME, exact: true })
      ).toBeVisible();
      await addIngredient(page, bun._id);
      await addIngredient(page, filling._id);
      await addIngredient(page, sauce._id);
      await expect(
        page.getByTestId('constructor-ingredients').getByRole('listitem')
      ).toHaveCount(2);
      await expect(page.getByTestId('order-summ').locator('p')).toHaveText('270');

      const orderRequest = page.waitForRequest(
        (request) => request.url() === `${API_URL}/orders` && request.method() === 'POST'
      );
      await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click();
      const request = await orderRequest;
      expect(request.postDataJSON()).toEqual({
        ingredients: [bun._id, filling._id, sauce._id, bun._id],
      });
      expect(request.headers().authorization).toBe(ACCESS_TOKEN);

      const modal = page.getByRole('dialog', { name: 'Заказ оформлен', exact: true });
      await expect(modal).toBeVisible();
      await expect(modal.getByTestId('order-number')).toHaveText(String(ORDER_NUMBER));
      await expectEmptyConstructor(page);
      await modal.getByRole('button', { name: 'Закрыть', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
      await expect(page).toHaveURL(`${APP_URL}/`);
    });
  });
});
