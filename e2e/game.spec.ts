import { expect, test } from '@playwright/test';

test('saját macska építése, és újratöltés után is megvan', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('1. nap')).toBeVisible();
  await page.getByRole('button', { name: /Macskáim/ }).click();
  await page.getByRole('button', { name: /Új macska/ }).click();
  await page.getByRole('button', { name: 'Tigris', exact: true }).click();
  await page.getByPlaceholder('Név').fill('Teszt Tigris');
  await page.getByRole('button', { name: /Kész/ }).click();
  await expect(page.getByText('Megérkezett: Teszt Tigris! 🎉')).toBeVisible();
  await page.waitForTimeout(4000); // automatikus mentés 3 mp-enként
  await page.reload();
  await page.getByRole('button', { name: /Macskáim/ }).click();
  await expect(page.getByText('Teszt Tigris')).toBeVisible();
});

test('vásárlás a boltban', async ({ page }) => {
  await page.goto('/');
  await page.getByText('🛒 Bolt').first().click();
  await expect(page.getByText(/koppints, amit megveszel/)).toBeVisible();
  await page.getByRole('button', { name: /Répa/ }).click();
  await expect(page.getByText('Megvetted: 🥕 Répa')).toBeVisible();
});

test('feladatok és térkép: a zárt hely csillagot kér', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Feladatok' }).click();
  await expect(page.locator('.quest')).toHaveCount(3);
  await page.getByRole('button', { name: 'Bezár' }).click();
  await page.getByRole('button', { name: 'Térkép' }).click();
  await page.locator('.map-card', { hasText: 'Parkváros' }).click();
  await expect(page.getByText(/Még \d+ ⭐ kell/)).toBeVisible();
});

test('öltöztetés otthon: masni a fejre', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window as unknown as { __game?: { getState: () => { world: unknown } } }).__game?.getState().world);
  await page.evaluate(() => {
    const g = (window as unknown as { __game: { getState: () => { act: (fn: (w: { paused: boolean; cats: Array<{ place: string; x: number }> }) => void) => void } } }).__game;
    g.getState().act((w) => {
      w.paused = true;
      w.cats[0].place = 'otthon1';
      w.cats[0].x = 500;
    });
  });
  await page.getByText('🏠 Rózsa-ház').first().click();
  await page.locator('[data-cat-id]').first().click({ force: true });
  await page.getByRole('button', { name: /Öltöztetés/ }).click();
  await page.getByRole('button', { name: /Masni/ }).click();
  const worn = await page.evaluate(() => (window as unknown as { __game: { getState: () => { world: { cats: Array<{ outfit: { fej?: { id: string } } }> } } } }).__game.getState().world.cats[0].outfit.fej?.id);
  expect(worn).toBe('masni');
});
